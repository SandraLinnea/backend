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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingListQueryValidator = exports.bookingValidator = exports.BookingStatusEnum = void 0;
const z = __importStar(require("zod"));
const zod_validator_1 = require("@hono/zod-validator");
exports.BookingStatusEnum = z.enum(["pending", "confirmed", "cancelled"]);
const bookingSchema = z.object({
    property_id: z.string(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    guests: z.number().int().positive().optional(),
    note: z.string().optional(),
    status: exports.BookingStatusEnum.optional(),
}).strict();
exports.bookingValidator = (0, zod_validator_1.zValidator)("json", bookingSchema, (result, c) => {
    if (!result.success) {
        return c.json({ errors: result.error.issues }, 400);
    }
    const { start_date, end_date } = result.data;
    if (new Date(end_date) <= new Date(start_date)) {
        return c.json({ errors: [{ path: ["end_date"], message: "end_date must be after start_date" }] }, 400);
    }
});
const listSchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    offset: z.coerce.number().int().min(0).optional().default(0),
    property_id: z.string().optional(),
    user_id: z.string().optional(),
    status: exports.BookingStatusEnum.optional(),
    q: z.string().optional(),
    sort_by: z.enum(["start_date", "end_date", "total_price"]).optional(),
}).strict();
exports.bookingListQueryValidator = (0, zod_validator_1.zValidator)("query", listSchema);
