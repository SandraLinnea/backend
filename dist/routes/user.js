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
const hono_1 = require("hono");
const userValidator_1 = require("../validators/userValidator");
const auth_1 = require("../middleware/auth");
const userApp = new hono_1.Hono();
userApp.get("/", userValidator_1.userQueryValidator, (c) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const sb = c.get("supabase");
    const query = c.req.valid("query");
    const start = (_a = query.offset) !== null && _a !== void 0 ? _a : 0;
    const end = start + ((_b = query.limit) !== null && _b !== void 0 ? _b : 10) - 1;
    const res = yield sb.from("profiles").select("*", { count: "exact" }).range(start, end);
    return c.json({
        data: (_c = res.data) !== null && _c !== void 0 ? _c : [],
        count: (_d = res.count) !== null && _d !== void 0 ? _d : 0,
        offset: start,
        limit: (_e = query.limit) !== null && _e !== void 0 ? _e : 10,
    });
}));
userApp.get("/me", auth_1.optionalAuth, (c) => __awaiter(void 0, void 0, void 0, function* () {
    const sb = c.get("supabase");
    const user = c.get("user");
    if (!user)
        return c.json({ user: null }, 200);
    const { data, error } = yield sb.from("profiles").select("*").eq("id", user.id).single();
    if (error)
        return c.json({ error: "Profile not found" }, 404);
    return c.json(data, 200);
}));
userApp.get("/:id", (c) => __awaiter(void 0, void 0, void 0, function* () {
    const sb = c.get("supabase");
    const { id } = c.req.param();
    const { data, error } = yield sb.from("profiles").select("*").eq("id", id).single();
    if (error)
        return c.json({ error: "User not found" }, 404);
    return c.json(data, 200);
}));
userApp.put("/me", auth_1.requireAuth, userValidator_1.userValidator, (c) => __awaiter(void 0, void 0, void 0, function* () {
    const sb = c.get("supabase");
    const user = c.get("user");
    const body = c.req.valid("json");
    const { data, error } = yield sb
        .from("profiles")
        .upsert(Object.assign(Object.assign({}, body), { id: user.id }))
        .select()
        .single();
    if (error)
        return c.json({ error: error.message }, 400);
    return c.json(data, 200);
}));
exports.default = userApp;
