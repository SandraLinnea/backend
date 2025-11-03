import { Hono } from "hono";
import type { SupabaseClient } from "@supabase/supabase-js";
import { propertyValidator, propertyQueryValidator } from "../validators/propertyValidator.js";
import { requireAuth } from "../middleware/auth.js";

const propertyApp = new Hono();

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

propertyApp.get("/", propertyQueryValidator, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const query = c.req.valid("query");

  const mineParam = c.req.query("mine");
  const onlyMine = mineParam === "1" || mineParam === "true";

  const start = query.offset ?? 0;
  const end = start + (query.limit ?? 10) - 1;

  let q = sb.from("properties").select("*", { count: "exact" });

  if (onlyMine) {
    const user = c.get("user");
    if (!user) {
      return c.json({ data: [], count: 0, offset: start, limit: query.limit ?? 10 }, 200);
    }
    q = q.eq("owner_id", user.id);
  }

  const { data, count, error } = await q.range(start, end);
  if (error) return c.json({ error: error.message }, 400);

  return c.json({
    data: data ?? [],
    count: count ?? 0,
    offset: start,
    limit: query.limit ?? 10,
  }, 200);
});

 propertyApp.get("/:id", async (c) => {
  const { id } = c.req.param();
  const sb = c.get("supabase") as SupabaseClient;

  const base = sb.from("properties").select("*");
  const { data, error } = isUUID(id)
    ? await base.eq("id", id).single()
    : await base.eq("property_code", id).single();

  if (error) return c.json({ error: "Could not find property" }, 404);
  return c.json(data, 200);
}); 


propertyApp.post("/", requireAuth, propertyValidator, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user")!;
  const body = c.req.valid("json") as NewProperty;

  const payload = { ...body, owner_id: user.id };
  const { data, error } = await sb.from("properties").insert([payload]).select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});

propertyApp.put("/:id", requireAuth, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user")!;
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: existing, error: getErr } = await sb
    .from("properties")
    .select("owner_id")
    .eq("property_code", id)
    .single();
  if (getErr) return c.json({ error: getErr.message }, 400);
  if (!existing || existing.owner_id !== user.id) return c.json({ error: "Forbidden" }, 403);

  const allowed = (({
    title, description, city, country, price_per_night, availability, image_url,
  }) => ({ title, description, city, country, price_per_night, availability, image_url }))(body);

  const { data, error } = await sb
    .from("properties")
    .update(allowed)
    .eq("property_code", id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 200);
});

propertyApp.delete("/:id", requireAuth, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user")!;
  const { id } = c.req.param();

  const { data: me } = await sb
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = !!me?.is_admin;

  const base = sb.from("properties");
  const q = isAdmin
    ? base.delete().eq("property_code", id)
    : base.delete().match({ property_code: id, owner_id: user.id });

  const { error, data } = await q.select().maybeSingle();
  if (error) return c.json({ error: error.message }, 400);
  if (!data) return c.json({ error: "Not found" }, 404);
  return c.json({ message: "Property deleted" }, 200);
});

export default propertyApp;
