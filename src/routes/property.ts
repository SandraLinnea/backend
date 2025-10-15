import { Hono } from "hono";
import type { PostgrestError } from "@supabase/supabase-js";
import * as db from "../database/property.js";
// import { Property, PropertyListQuery } from "../types/property.js";
import { propertyValidator, propertyQueryValidator } from "../validators/propertyValidator.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PaginatedListResponse } from "../database/property.js";

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
    console.error("Error in fetching propertys", error);
    return c.json(defaultResponse);
  }
});


export default propertyApp;