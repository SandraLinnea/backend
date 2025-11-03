import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import slugify from "slugify";

const urlOptional = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z
    .string()
    .url({ message: "Ogiltig URL" })
    .optional()
);

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

export const propertyValidator = zValidator("json", schema, (result, c) => {
  if (!result.success) {
    return c.json({ errors: result.error.issues }, 400);
  }
  if (!result.data.property_code) {
    result.data.property_code = slugify.default(result.data.title, { lower: true, strict: true });
  }
});

const propertyQuerySchema = z.object({
  limit: z.coerce.number().positive().max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const propertyQueryValidator = zValidator("query", propertyQuerySchema);
