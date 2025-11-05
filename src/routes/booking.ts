import { Hono } from "hono";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth.js";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import type { Booking } from "../types/booking.js";
import { bookingValidator, bookingSchema } from "../validators/bookingValidator.js";

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

const partialBookingSchema = bookingSchema.partial();

const bookingApp = new Hono();

bookingApp.get("/", requireAuth, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user")!;

  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: true });

  return error ? c.json({ error: error.message }, 400) : c.json(data ?? [], 200);
});

bookingApp.post("/", requireAuth, bookingValidator, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user")!;
  const body = c.req.valid("json");

  const todayIso = new Date().toISOString().slice(0, 10);
  if (toUtcMs(body.start_date) <= toUtcMs(todayIso)) {
    return c.json({ error: "Startdate has to be in the future" }, 400);
  }

  let propQuery = sb.from("properties").select("id, price_per_night").limit(1);
  propQuery = isUUID(body.property_id)
    ? propQuery.eq("id", body.property_id)
    : propQuery.eq("property_code", body.property_id);

  const { data: property, error: propertyError } = await propQuery.maybeSingle();
  if (propertyError) return c.json({ error: propertyError.message }, 400);
  if (!property) return c.json({ error: "property not found" }, 404);

  const { data: overlapping, error: overlapErr } = await sb
    .from("bookings")
    .select("id")
    .eq("property_id", property.id)
    .in("status", ["pending", "confirmed"])
    .lt("start_date", body.end_date)
    .gt("end_date", body.start_date);

  if (overlapErr) return c.json({ error: overlapErr.message }, 400);
  if ((overlapping?.length ?? 0) > 0) {
    return c.json({ error: "Chosen date is not available" }, 400);
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
  return error ? c.json({ error: error.message }, 400) : c.json(data as Booking, 201);
});

bookingApp.put("/:id", requireAuth, zValidator("json", partialBookingSchema), async (c) => {
    const sb = c.get("supabase") as SupabaseClient;
    const user = c.get("user")!;
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const { data: existing, error: existingErr } = await sb
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (existingErr || !existing) return c.json({ error: "Not found" }, 404);
    if (existing.user_id !== user.id) return c.json({ error: "Forbidden" }, 403);

    const updateFields: Record<string, unknown> = { ...body };

    if (body.start_date && body.end_date) {
      if (toUtcMs(body.end_date) <= toUtcMs(body.start_date)) {
        return c.json({ error: "end_date must be after start_date" }, 400);
      }
      const { data: property } = await sb
        .from("properties")
        .select("price_per_night")
        .eq("id", existing.property_id)
        .single();

      const nights = nightsUTC(body.start_date, body.end_date);
      updateFields.total_price = nights * Number(property?.price_per_night ?? 0);
    }

    const { data, error } = await sb
      .from("bookings")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    return error ? c.json({ error }, 400) : c.json(data);
  }
);

bookingApp.delete("/:id", requireAuth, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user")!;
  const id = c.req.param("id");

  const { data: existing } = await sb
    .from("bookings")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing) return c.json({ error: "Not found" }, 404);
  if (existing.user_id !== user.id) return c.json({ error: "Forbidden" }, 403);

  const { error } = await sb.from("bookings").delete().eq("id", id);
  return error ? c.json({ error }, 400) : c.json({ success: true });
});

export default bookingApp;