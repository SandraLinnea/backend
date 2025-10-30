import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";

import dotenv from "dotenv";
dotenv.config();

import { optionalAuth } from "./middleware/auth.js";
import authApp from "./routes/auth.js";
import userApp from "./routes/user.js";
import propertyApp from "./routes/property.js";
import bookingApp from "./routes/booking.js";
import type { Context } from "hono";

const app = new Hono( {
  strict: false
});

const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN ??
  (process.env.NODE_ENV === "production"
    ? "https://<din-vercel-app>.vercel.app"
    : "http://localhost:3000");

app.use(
  "*",
  cors({
    origin: (origin: string | null, _c: Context) => {
      if (!origin) return FRONTEND_ORIGIN;

      const allowed = [FRONTEND_ORIGIN, "http://localhost:3000"];
      return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 60 * 60 * 24,
  })
);

app.use("*", optionalAuth);

const serverStartTime = Date.now()

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.route ("/auth", authApp)
app.route("/property", propertyApp);
app.route("/user", userApp);
app.route("/booking", bookingApp);

app.get("/health", (c) => {
  const now = Date.now();
  return c.json({
    status: "ok",
    uptime: Math.floor((now - serverStartTime) / 1000),
    startedAt: new Date(serverStartTime).toISOString(),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  console.error("Unexpected error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

/* serve(
  {
    fetch: app.fetch,
    port: Number(process.env.HONO_PORT) || 3002,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
); */

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.HONO_PORT || process.env.PORT || 3002),
  },
  (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
    console.log(`CORS allowed origin: ${FRONTEND_ORIGIN}`);
  }
);