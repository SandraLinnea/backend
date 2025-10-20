import { Hono } from "hono";
import * as db from "../database/property.js";
import { propertyQueryValidator } from "../validators/propertyValidator.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PaginatedListResponse } from "../database/property.js";
import { HTTPException } from "hono/http-exception";

const propertyApp = new Hono();

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

/* propertyApp.get("/:id", async (c) => {
  const { id } = c.req.param();
  const sb = c.get("supabase");

  try {
    const property = await db.getProperty(sb, id);
    if (!property) {
      throw new HTTPException(404, {
        res: c.json({ error: "Could not find property" }, 404),
      });
    }
    return c.json(property, 200);
  } catch (error) {
    console.error("Error in getting property", error);
    throw new HTTPException(404, {
      res: c.json({ error: "Could not find property" }, 404),
    });
  }
}); */

propertyApp.get("/:id", async (c) => {
  const { id } = c.req.param();
  const sb = c.get("supabase");
  try {
    const property = await sb.from("properties").select("*").eq("property_code", id).single();
    if (!property.data) {
      throw new HTTPException(404, {
        res: c.json({ error: "Could not find property" }, 404),
      });
    }
    return c.json(property.data, 200);
  } catch (error) {
    console.error("Error in getting property", error);
    throw new HTTPException(404, {
      res: c.json({ error: "Could not find property" }, 404),
    });
  }
});



propertyApp.post("/", async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const body = await c.req.json();

  try {
    const { data, error } = await sb.from("properties").insert([body]).select().single();
    if (error) throw error;
    return c.json(data, 201);
  } catch (error) {
    console.error("Error creating property", error);
    return c.json({ error: "Could not create property" }, 400);
  }
});

propertyApp.put("/:id", async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const { data, error } = await sb.from("properties").update(body).eq("property_code", id).select().single();
    if (error) throw error;
    return c.json(data, 200);
  } catch (error) {
    console.error("Error updating property", error);
    return c.json({ error: "Could not update property" }, 400);
  }
});

propertyApp.delete("/:id", async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const { id } = c.req.param();

  try {
    const { error } = await sb.from("properties").delete().eq("property_code", id);
    if (error) throw error;
    return c.json({ message: "Property deleted" }, 200);
  } catch (error) {
    console.error("Error deleting property", error);
    return c.json({ error: "Could not delete property" }, 400);
  }
});

export default propertyApp;