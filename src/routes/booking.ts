import { Hono } from "hono";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth.js";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import type { Booking } from "../types/booking";

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

const toUtcMs = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const nightsUTC = (startISO: string, endISO: string) => {
  const diff = toUtcMs(endISO) - toUtcMs(startISO);
  return Math.max(0, Math.round(diff / 86_400_000));
};

const createSchema = z.object({
  property_id: z.string().min(1),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().positive().optional(),
  note: z.string().optional(),
});
const deleteSchema = z.object({
  booking_id: z.string().min(1),
});

const bookingApp = new Hono();

bookingApp.get("/", requireAuth, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user")!;
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: true });

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data ?? [], 200);
});

bookingApp.post("/", requireAuth, zValidator("json", createSchema), async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user")!;
  const body = c.req.valid("json");
  const todayIso = new Date().toISOString().slice(0, 10); 
  if (toUtcMs(body.start_date) <= toUtcMs(todayIso)) {
    return c.json({ error: "Startdate has to be in the future" }, 400);
  }
  if (toUtcMs(body.end_date) <= toUtcMs(body.start_date)) {
    return c.json({ error: "Enddate has to be after startdate" }, 400);
  }

const propLookup = body.property_id;

let propQuery = sb.from("properties").select("id, price_per_night").limit(1);
propQuery = isUUID(propLookup)
  ? propQuery.eq("id", propLookup)
  : propQuery.eq("property_code", propLookup);

const { data: property, error: propertyError } = await propQuery.maybeSingle();
if (propertyError) return c.json({ error: propertyError.message }, 400);
if (!property)     return c.json({ error: "property not found" }, 404);

  const { data: overlapping, error: overlapErr } = await sb
    .from("bookings")
    .select("id")
    .eq("property_id", property.id) 
    .in("status", ["pending", "confirmed"])
    .lt("start_date", body.end_date)
    .gt("end_date", body.start_date);

  if (overlapErr) return c.json({ error: overlapErr.message }, 400);
  if ((overlapping?.length ?? 0) > 0) {
    return c.json({ error: "Chosen date is not avalibale" }, 400);
  }

  const nights = nightsUTC(body.start_date, body.end_date);
  const nightly = Number(property.price_per_night ?? 0);
  const total_price = nightly * nights;

  const payload = {
    property_id: property.id,
    user_id: user.id, 
    start_date: body.start_date,
    end_date: body.end_date,
    guests: body.guests ?? 1,
    note: body.note ?? null,
    status: "pending" as const,
    total_price,
  };

  const { data, error } = await sb.from("bookings").insert([payload]).select().single();
  if (error) return c.json({ error: error.message }, 400);

  return c.json(data as Booking, 201);
});

bookingApp.delete("/", requireAuth, zValidator("json", deleteSchema), async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user")!;
  const { booking_id } = c.req.valid("json");

  const { data, error } = await sb
    .from("bookings")
    .delete()
    .match({ booking_id, user_id: user.id })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 400);
  if (!data) return c.json({ error: "Booking not found" }, 404);

  return c.json({ message: "Booking is deleted", data: (data as Booking).booking_id }, 200);
});

export default bookingApp;
