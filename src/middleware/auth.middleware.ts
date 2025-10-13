/* import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Context, MiddlewareHandler } from 'hono';
import { env } from 'hono/adapter';
import { setCookie, type CookieOptions } from 'hono/cookie';

declare module 'hono' {
  interface ContextVariableMap { supabase: SupabaseClient }
}

export const getSupabase = (c: Context) => c.get('supabase');

export const supabaseMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const e = env<{
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    }>(c);

    const supabaseUrl =
      e.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const supabaseAnonKey =
      e.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl) throw new Error('SUPABASE_URL missing!');
    if (!supabaseAnonKey) throw new Error('SUPABASE_ANON_KEY missing!');

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return parseCookieHeader(c.req.header('Cookie') ?? '');
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const normalized: CookieOptions = {
              ...options,
              sameSite:
                options?.sameSite === true
                  ? 'Strict'
                  : options?.sameSite === false
                  ? undefined
                  : typeof options?.sameSite === 'string'
                  ? (options.sameSite.charAt(0).toUpperCase() +
                      options.sameSite.slice(1)) as CookieOptions['sameSite']
                  : undefined,
            };
            setCookie(c, name, value, normalized);
          });
        },
      },
    });

    c.set('supabase', supabase);
    await next();
  };
};
 */