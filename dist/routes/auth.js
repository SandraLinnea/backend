"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const z = __importStar(require("zod"));
const auth_1 = require("../middleware/auth");
const cookie_1 = require("hono/cookie");
const authApp = new hono_1.Hono();
const registerSchema = z.object({
    email: z.string(),
    password: z.string().min(8),
    name: z.string().min(1),
});
const loginSchema = z.object({
    email: z.string(),
    password: z.string().min(8),
});
authApp.post("/register", (0, zod_validator_1.zValidator)("json", registerSchema), (c) => __awaiter(void 0, void 0, void 0, function* () {
    const sb = c.get("supabase");
    const { email, password, name } = c.req.valid("json");
    const { data, error } = yield sb.auth.signUp({
        email,
        password,
        options: { data: { name } }
    });
    if (error)
        return c.json({ error: error.message }, 400);
    return c.json(data.user
        ? { user: { id: data.user.id, email: data.user.email } }
        : { message: "Check your email to confirm registration" }, data.user ? 201 : 202);
}));
authApp.post("/login", (0, zod_validator_1.zValidator)("json", loginSchema), (c) => __awaiter(void 0, void 0, void 0, function* () {
    const sb = c.get("supabase");
    const { email, password } = c.req.valid("json");
    const { data, error } = yield sb.auth.signInWithPassword({ email, password });
    if (error)
        return c.json({ error: error.message }, 401);
    return c.json({ user: { id: data.user.id, email: data.user.email } }, 200);
}));
authApp.post("/logout", (c) => __awaiter(void 0, void 0, void 0, function* () {
    const sb = c.get("supabase");
    try {
        yield sb.auth.signOut();
    }
    catch (_a) {
    }
    const secure = process.env.NODE_ENV === "production";
    const opts = {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure,
        maxAge: 0,
    };
    (0, cookie_1.setCookie)(c, "sb-access-token", "", opts);
    (0, cookie_1.setCookie)(c, "sb-refresh-token", "", opts);
    return c.json({ message: "Utloggad" }, 200);
}));
authApp.get("/me", auth_1.optionalAuth, (c) => __awaiter(void 0, void 0, void 0, function* () {
    const sb = c.get("supabase");
    const user = c.get("user");
    if (!user)
        return c.json({ user: null }, 200);
    const { data: profile } = yield sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    return c.json({ user: { id: user.id, email: user.email }, profile }, 200);
}));
exports.default = authApp;
