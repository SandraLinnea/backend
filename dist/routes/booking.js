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
const auth_js_1 = require("../middleware/auth.js");
const zod_validator_1 = require("@hono/zod-validator");
const z = __importStar(require("zod"));
const isUUID = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const toUtcMs = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
};
const nightsUTC = (startISO, endISO) => {
    const diff = toUtcMs(endISO) - toUtcMs(startISO);
    return Math.max(0, Math.round(diff / 86400000));
};
const createSchema = z.object({
    property_id: z.string().min(1),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    guests: z.number().int().positive().optional(),
    note: z.string().optional(),
});
const deleteSchema = z.object({
    booking_id: z.string().min(1),
});
const bookingApp = new hono_1.Hono();
bookingApp.get("/", auth_js_1.requireAuth, (c) => __awaiter(void 0, void 0, void 0, function* () {
    const sb = c.get("supabase");
    const user = c.get("user");
    const { data, error } = yield sb
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: true });
    if (error)
        return c.json({ error: error.message }, 400);
    return c.json(data !== null && data !== void 0 ? data : [], 200);
}));
bookingApp.post("/", auth_js_1.requireAuth, (0, zod_validator_1.zValidator)("json", createSchema), (c) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const sb = c.get("supabase");
    const user = c.get("user");
    const body = c.req.valid("json");
    const todayIso = new Date().toISOString().slice(0, 10);
    if (toUtcMs(body.start_date) <= toUtcMs(todayIso)) {
        return c.json({ error: "Startdate has to be in the future" }, 400);
    }
    if (toUtcMs(body.end_date) <= toUtcMs(body.start_date)) {
        return c.json({ error: "Enddate has to be after startdate" }, 400);
    }
    const propLookup = body.property_id;
    let propQuery = sb.from("properties").select("id, price_per_night").limit(1);
    propQuery = isUUID(propLookup)
        ? propQuery.eq("id", propLookup)
        : propQuery.eq("property_code", propLookup);
    const { data: property, error: propertyError } = yield propQuery.maybeSingle();
    if (propertyError)
        return c.json({ error: propertyError.message }, 400);
    if (!property)
        return c.json({ error: "property not found" }, 404);
    const { data: overlapping, error: overlapErr } = yield sb
        .from("bookings")
        .select("id")
        .eq("property_id", property.id)
        .in("status", ["pending", "confirmed"])
        .lt("start_date", body.end_date)
        .gt("end_date", body.start_date);
    if (overlapErr)
        return c.json({ error: overlapErr.message }, 400);
    if (((_a = overlapping === null || overlapping === void 0 ? void 0 : overlapping.length) !== null && _a !== void 0 ? _a : 0) > 0) {
        return c.json({ error: "Chosen date is not avalibale" }, 400);
    }
    const nights = nightsUTC(body.start_date, body.end_date);
    const nightly = Number((_b = property.price_per_night) !== null && _b !== void 0 ? _b : 0);
    const total_price = nightly * nights;
    const payload = {
        property_id: property.id,
        user_id: user.id,
        start_date: body.start_date,
        end_date: body.end_date,
        guests: (_c = body.guests) !== null && _c !== void 0 ? _c : 1,
        note: (_d = body.note) !== null && _d !== void 0 ? _d : null,
        status: "pending",
        total_price,
    };
    const { data, error } = yield sb.from("bookings").insert([payload]).select().single();
    if (error)
        return c.json({ error: error.message }, 400);
    return c.json(data, 201);
}));
bookingApp.delete("/", auth_js_1.requireAuth, (0, zod_validator_1.zValidator)("json", deleteSchema), (c) => __awaiter(void 0, void 0, void 0, function* () {
    const sb = c.get("supabase");
    const user = c.get("user");
    const { booking_id } = c.req.valid("json");
    const { data, error } = yield sb
        .from("bookings")
        .delete()
        .match({ booking_id, user_id: user.id })
        .select()
        .single();
    if (error)
        return c.json({ error: error.message }, 400);
    if (!data)
        return c.json({ error: "Booking not found" }, 404);
    return c.json({ message: "Booking is deleted", data: data.booking_id }, 200);
}));
exports.default = bookingApp;
