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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyQueryValidator = exports.propertyValidator = void 0;
const z = __importStar(require("zod"));
const zod_validator_1 = require("@hono/zod-validator");
const slugify_1 = __importDefault(require("slugify"));
const urlOptional = z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z
    .string()
    .url({ message: "Ogiltig URL" })
    .optional());
const schema = z.object({
    title: z.string().min(1, "Title is required"),
    price_per_night: z.coerce.number().nonnegative("Price is required"),
    description: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    availability: z.boolean().optional(),
    property_code: z.string().optional(),
    image_url: urlOptional,
}).strict();
exports.propertyValidator = (0, zod_validator_1.zValidator)("json", schema, (result, c) => {
    if (!result.success) {
        return c.json({ errors: result.error.issues }, 400);
    }
    if (!result.data.property_code) {
        result.data.property_code = (0, slugify_1.default)(result.data.title, { lower: true, strict: true });
    }
});
const propertyQuerySchema = z.object({
    limit: z.coerce.number().positive().max(100).optional().default(10),
    offset: z.coerce.number().int().min(0).optional().default(0),
});
exports.propertyQueryValidator = (0, zod_validator_1.zValidator)("query", propertyQuerySchema);
