"use strict";
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
exports.optionalAuth = optionalAuth;
exports.requireAuth = requireAuth;
const cookie_1 = require("hono/cookie");
const ssr_1 = require("@supabase/ssr");
const http_exception_1 = require("hono/http-exception");
const supabase_1 = require("../lib/supabase");
function createSupabaseForRequest(c) {
    return (0, ssr_1.createServerClient)(supabase_1.supabaseUrl, supabase_1.supabaseAnonKey, {
        cookies: {
            getAll() {
                var _a;
                return (0, ssr_1.parseCookieHeader)((_a = c.req.header("Cookie")) !== null && _a !== void 0 ? _a : "").map(({ name, value }) => ({
                    name,
                    value: value !== null && value !== void 0 ? value : "",
                }));
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    (0, cookie_1.setCookie)(c, name, value, Object.assign(Object.assign({}, options), { httpOnly: true, secure: true, sameSite: "lax", path: "/" }));
                });
            },
        },
    });
}
function withSupabase(c, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!c.get("supabase")) {
            const sb = createSupabaseForRequest(c);
            c.set("supabase", sb);
            const { data, error } = yield sb.auth.getUser();
            if ((error === null || error === void 0 ? void 0 : error.code) === "session_expired") {
                const { data: refreshed, error: refreshError } = yield sb.auth.refreshSession();
                c.set("user", refreshError ? null : refreshed.user);
            }
            else {
                c.set("user", error ? null : data.user);
            }
        }
        return next();
    });
}
function optionalAuth(c, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield withSupabase(c, () => __awaiter(this, void 0, void 0, function* () { }));
        return next();
    });
}
function requireAuth(c, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield withSupabase(c, () => __awaiter(this, void 0, void 0, function* () { }));
        const user = c.get("user");
        if (!user)
            throw new http_exception_1.HTTPException(401, { message: "Unauthorized" });
        return next();
    });
}
