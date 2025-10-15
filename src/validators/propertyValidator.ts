import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import slugify from "slugify";


const schema: z.ZodType<NewProperty> = z.object({
  property_id: z.string().optional(),
  owner_id: z.string(), 
  title: z.string("Title is required"),
  price_per_night: z.number("Price is required"),
  description: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  // images: z.array(z.string().url()).optional(),
  guests: z.number().int().positive().optional(),
}).strict();


export const propertyValidator = zValidator("json", schema, (result, c) => {
  if (!result.success) {
    return c.json({ errors: result.error.issues }, 400);
  }
  if (!result.data.property_id) {
    result.data.property_id = slugify(result.data.title, {
      lower: true,
      strict: true,
    });
  }
});

const propertyQuerySchema: z.ZodType<PropertyListQuery> = z.object({
    limit: z.coerce.number().optional().default(10),
    offset: z.coerce.number().optional().default(0),
    department: z.string().optional(),
    q: z.string().optional(),
    sort_by: z
      .union([z.literal("title"), z.literal("start_date"), z.string()])
      .optional()
      .default("title"),
  });
  
  export const propertyQueryValidator = zValidator("query", propertyQuerySchema);