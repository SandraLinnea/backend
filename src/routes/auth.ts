import { Hono } from "hono";
import type { SupabaseClient } from "@supabase/supabase-js";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { deleteCookie } from "hono/cookie";
import { setCookie } from "hono/cookie";

const authApp = new Hono();

const registerSchema = z.object({
  email: z.string(),
  password: z.string().min(8),
  name: z.string().min(1),
});
const loginSchema = z.object({
  email: z.string(),
  password: z.string().min(8),
});

authApp.post("/register", zValidator("json", registerSchema), async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const { email, password, name } = c.req.valid("json");

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) return c.json({ error: error.message }, 400);

  return c.json(
    data.user
      ? { user: { id: data.user.id, email: data.user.email } }
      : { message: "Check your email to confirm registration" },
    data.user ? 201 : 202
  );
});

authApp.post("/login", zValidator("json", loginSchema), async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const { email, password } = c.req.valid("json");
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return c.json({ error: error.message }, 401);
  return c.json({ user: { id: data.user.id, email: data.user.email } }, 200);
});

authApp.post("/logout", async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  try {
    await sb.auth.signOut();
  } catch {
  }

  const secure = process.env.NODE_ENV === "production";
  const opts = {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    maxAge: 0,
  };

  setCookie(c, "sb-access-token", "", opts);
  setCookie(c, "sb-refresh-token", "", opts);

  return c.json({ message: "Utloggad" }, 200);
});


authApp.get("/me", optionalAuth, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user");
  if (!user) return c.json({ user: null }, 200);
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return c.json({ user: { id: user.id, email: user.email }, profile }, 200);
});

export default authApp;
