/* import type { Context, Next } from "hono";
import { setCookie } from "hono/cookie";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { HTTPException } from "hono/http-exception";
import { supabaseUrl, supabaseAnonKey } from "../lib/supabase.js";

declare module "hono" {
  interface ContextVariableMap {
    supabase: SupabaseClient;
    user: User | null;
  }
}

function createSupabaseForRequest(c: Context) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(c.req.header("Cookie") ?? "").map(({ name, value }) => ({
          name,
          value: value ?? "",
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(c, name, value, {
            ...options,
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
          });
        });
      },
    },
  });
}

async function withSupabase(c: Context, next: Next) {
  if (!c.get("supabase")) {
    const sb = createSupabaseForRequest(c);
    c.set("supabase", sb);

    const { data, error } = await sb.auth.getUser();

    if (error?.code === "session_expired") {
      const { data: refreshed, error: refreshError } = await sb.auth.refreshSession();
      c.set("user", refreshError ? null : refreshed.user);
    } else {
      c.set("user", error ? null : data.user);
    }
  }
  return next();
}

export async function optionalAuth(c: Context, next: Next) {
  await withSupabase(c, async () => {});
  return next();
}

export async function requireAuth(c: Context, next: Next) {
  await withSupabase(c, async () => {});
  const user = c.get("user");
  if (!user) throw new HTTPException(401, { message: "Unauthorized" });
  return next();
}
 */

import type { Context, Next } from "hono";
import { setCookie } from "hono/cookie";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { HTTPException } from "hono/http-exception";
import { supabaseUrl, supabaseAnonKey } from "../lib/supabase.js";

declare module "hono" {
  interface ContextVariableMap {
    supabase: SupabaseClient;
    user: User | null;
  }
}

function createSupabaseForRequest(c: Context) {
  const isProd = process.env.NODE_ENV === "production";

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(c.req.header("Cookie") ?? "").map(
          ({ name, value }) => ({ name, value: value ?? "" })
        );
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(c, name, value, {
            ...options,
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            path: "/",
          });
        });
      },
    },
  });
}

async function withSupabase(c: Context, next: Next) {
  if (!c.get("supabase")) {
    const sb = createSupabaseForRequest(c);
    c.set("supabase", sb);

    const { data, error } = await sb.auth.getUser();

    if (error?.code === "session_expired") {
      const { data: refreshed, error: refreshError } = await sb.auth.refreshSession();
      c.set("user", refreshError ? null : refreshed.user);
    } else {
      c.set("user", error ? null : data.user);
    }
  }
  return next();
}

export async function optionalAuth(c: Context, next: Next) {
  await withSupabase(c, async () => {});
  return next();
}

export async function requireAuth(c: Context, next: Next) {
  await withSupabase(c, async () => {});
  const user = c.get("user");
  if (!user) throw new HTTPException(401, { message: "Unauthorized" });
  return next();
}
