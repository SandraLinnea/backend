import { Hono } from "hono";
import * as db from "../database/property.js";
import { propertyValidator, propertyQueryValidator } from "../validators/propertyValidator.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PaginatedListResponse } from "../database/property.js";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware/auth.js";

const propertyApp = new Hono();

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);


propertyApp.get("/", propertyQueryValidator, async (c) => {
  const query = c.req.valid("query");
  const sb = c.get("supabase");

  let defaultResponse: PaginatedListResponse<Property> = {
    data: [],
    count: 0,
    offset: query.offset || 0,
    limit: query.limit || 10,
  };

  try {
    const response = await db.getProperties(sb, query);
    return c.json({
      ...defaultResponse,
      ...response,
    });
  } catch (error) {
    console.error("Error in fetching properties", error);
    return c.json(defaultResponse);
  }
});

propertyApp.get("/:id", async (c) => {
  const { id } = c.req.param();
  const sb = c.get("supabase");

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

  const { data, error } = await sb.from("properties")
    .update(body)
    .eq("property_code", id) 
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 200);
});

propertyApp.delete("/:id", requireAuth, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const { id } = c.req.param();

  const { error } = await sb.from("properties").delete().eq("property_code", id);
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ message: "Property deleted" }, 200);
});

export default propertyApp;