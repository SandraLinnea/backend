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
const propertyValidator_js_1 = require("../validators/propertyValidator.js");
const auth_js_1 = require("../middleware/auth.js");
const propertyApp = new hono_1.Hono();
const isUUID = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
propertyApp.get("/", propertyValidator_js_1.propertyQueryValidator, (c) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const sb = c.get("supabase");
    const query = c.req.valid("query");
    const mineParam = c.req.query("mine");
    const onlyMine = mineParam === "1" || mineParam === "true";
    const start = (_a = query.offset) !== null && _a !== void 0 ? _a : 0;
    const end = start + ((_b = query.limit) !== null && _b !== void 0 ? _b : 10) - 1;
    let q = sb.from("properties").select("*", { count: "exact" });
    if (onlyMine) {
        const user = c.get("user");
        if (!user) {
            return c.json({ data: [], count: 0, offset: start, limit: (_c = query.limit) !== null && _c !== void 0 ? _c : 10 }, 200);
        }
        q = q.eq("owner_id", user.id);
    }
    const { data, count, error } = yield q.range(start, end);
    if (error)
        return c.json({ error: error.message }, 400);
    return c.json({
        data: data !== null && data !== void 0 ? data : [],
        count: count !== null && count !== void 0 ? count : 0,
        offset: start,
        limit: (_d = query.limit) !== null && _d !== void 0 ? _d : 10,
    }, 200);
}));
propertyApp.get("/:id", (c) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = c.req.param();
    const sb = c.get("supabase");
    const base = sb.from("properties").select("*");
    const { data, error } = isUUID(id)
        ? yield base.eq("id", id).single()
        : yield base.eq("property_code", id).single();
    if (error)
        return c.json({ error: "Could not find property" }, 404);
    return c.json(data, 200);
}));
/*
propertyApp.post("/", requireAuth, propertyValidator, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user")!;
  const body = c.req.valid("json") as any;

  const payload = { ...body, owner_id: user.id };
  const { data, error } = await sb.from("properties").insert([payload]).select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});

propertyApp.put("/:id", requireAuth, async (c) => {
  const sb = c.get("supabase") as SupabaseClient;
  const user = c.get("user")!;
  const { id } = c.req.param();
  const body = await c.req.json();

  const { data: me } = await sb
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = !!me?.is_admin;

  const base = sb.from("properties");
  const q = isAdmin
    ? base.update(body).eq("property_code", id).select().single()
    : base.update(body).match({ property_code: id, owner_id: user.id }).select().single();

  const { data, error } = await q;
  if (error) return c.json({ error: error.message }, 400);
  if (!data) return c.json({ error: "Not found" }, 404);
  return c.json(data, 200);
}); */
propertyApp.post("/", auth_js_1.requireAuth, propertyValidator_js_1.propertyValidator, (c) => __awaiter(void 0, void 0, void 0, function* () {
    const sb = c.get("supabase");
    const user = c.get("user");
    const body = c.req.valid("json");
    const payload = Object.assign(Object.assign({}, body), { owner_id: user.id });
    const { data, error } = yield sb.from("properties").insert([payload]).select().single();
    if (error)
        return c.json({ error: error.message }, 400);
    return c.json(data, 201);
}));
propertyApp.put("/:id", auth_js_1.requireAuth, (c) => __awaiter(void 0, void 0, void 0, function* () {
    const sb = c.get("supabase");
    const user = c.get("user");
    const { id } = c.req.param();
    const body = yield c.req.json();
    // skydda: bara ägaren får ändra
    const { data: existing, error: getErr } = yield sb
        .from("properties")
        .select("owner_id")
        .eq("property_code", id)
        .single();
    if (getErr)
        return c.json({ error: getErr.message }, 400);
    if (!existing || existing.owner_id !== user.id)
        return c.json({ error: "Forbidden" }, 403);
    // tillåt endast redigerbara fält
    const allowed = (({ title, description, city, country, price_per_night, availability, image_url, }) => ({ title, description, city, country, price_per_night, availability, image_url }))(body);
    const { data, error } = yield sb
        .from("properties")
        .update(allowed)
        .eq("property_code", id)
        .select()
        .single();
    if (error)
        return c.json({ error: error.message }, 400);
    return c.json(data, 200);
}));
propertyApp.delete("/:id", auth_js_1.requireAuth, (c) => __awaiter(void 0, void 0, void 0, function* () {
    const sb = c.get("supabase");
    const user = c.get("user");
    const { id } = c.req.param();
    const { data: me } = yield sb
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
    const isAdmin = !!(me === null || me === void 0 ? void 0 : me.is_admin);
    const base = sb.from("properties");
    const q = isAdmin
        ? base.delete().eq("property_code", id)
        : base.delete().match({ property_code: id, owner_id: user.id });
    const { error, data } = yield q.select().maybeSingle();
    if (error)
        return c.json({ error: error.message }, 400);
    if (!data)
        return c.json({ error: "Not found" }, 404);
    return c.json({ message: "Property deleted" }, 200);
}));
exports.default = propertyApp;
