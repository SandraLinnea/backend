import { Hono } from "hono";
import type { SupabaseClient } from "@supabase/supabase-js";
import { userQueryValidator, userValidator } from "../validators/userValidator.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const userApp = new Hono();

userApp.get("/", userQueryValidator, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const query = c.req.valid("query") as UserListQuery;
  const start = query.offset ?? 0;
  const end = start + (query.limit ?? 10) - 1;

  const res = await sb.from("profiles").select("*", { count: "exact" }).range(start, end);

  return c.json({
    data: res.data ?? [],
    count: res.count ?? 0,
    offset: start,
    limit: query.limit ?? 10,
  });
});

userApp.get("/me", optionalAuth, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user");
  if (!user) return c.json({ user: null }, 200);
  const { data, error } = await sb.from("profiles").select("*").eq("id", user.id).single();
  if (error) return c.json({ error: "Profile not found" }, 404);
  return c.json(data, 200);
});

userApp.get("/:id", async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const { id } = c.req.param();
  const { data, error } = await sb.from("profiles").select("*").eq("id", id).single();
  if (error) return c.json({ error: "User not found" }, 404);
  return c.json(data, 200);
});

userApp.put("/me", requireAuth, userValidator, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user")!;
  const body = c.req.valid("json") as NewUser;

  const { data, error } = await sb
    .from("profiles")
    .upsert({ ...body, id: user.id })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 200);
});

export default userApp;
