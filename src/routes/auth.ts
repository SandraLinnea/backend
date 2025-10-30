import { Hono } from "hono";
import type { SupabaseClient } from "@supabase/supabase-js";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";
import { optionalAuth, requireAuth } from "../middleware/auth";
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
  const { error } = await sb.auth.signOut();
  const secure = process.env.NODE_ENV === "production";
  setCookie(c, "sb-access-token", "", {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure,
    maxAge: 0,
  });
  setCookie(c, "sb-refresh-token", "", {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure,
    maxAge: 0,
  });
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ message: "Utloggad" });
});


authApp.get("/me", optionalAuth, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user");
  if (!user) return c.json({ user: null }, 200);
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return c.json({ user: { id: user.id, email: user.email }, profile }, 200);
});

export default authApp;
