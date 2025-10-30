"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const http_exception_1 = require("hono/http-exception");
const cors_1 = require("hono/cors");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_js_1 = require("./middleware/auth.js");
const auth_js_2 = __importDefault(require("./routes/auth.js"));
const user_js_1 = __importDefault(require("./routes/user.js"));
const property_js_1 = __importDefault(require("./routes/property.js"));
const booking_js_1 = __importDefault(require("./routes/booking.js"));
const app = new hono_1.Hono({
    strict: false
});
const FRONTEND_ORIGIN = (_a = process.env.FRONTEND_ORIGIN) !== null && _a !== void 0 ? _a : (process.env.NODE_ENV === "production"
    ? "https://<din-vercel-app>.vercel.app"
    : "http://localhost:3000");
app.use("*", (0, cors_1.cors)({
    origin: (origin, _c) => {
        if (!origin)
            return FRONTEND_ORIGIN;
        const allowed = [FRONTEND_ORIGIN, "http://localhost:3000"];
        return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 60 * 60 * 24,
}));
app.use("*", auth_js_1.optionalAuth);
const serverStartTime = Date.now();
app.get("/", (c) => {
    return c.text("Hello Hono!");
});
app.route("/auth", auth_js_2.default);
app.route("/property", property_js_1.default);
app.route("/user", user_js_1.default);
app.route("/booking", booking_js_1.default);
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
    if (err instanceof http_exception_1.HTTPException)
        return err.getResponse();
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
(0, node_server_1.serve)({
    fetch: app.fetch,
    port: Number(process.env.HONO_PORT || process.env.PORT || 3002),
}, (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
    console.log(`CORS allowed origin: ${FRONTEND_ORIGIN}`);
});
