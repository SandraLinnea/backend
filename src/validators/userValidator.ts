import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import slugify from "slugify";

const schema: z.ZodType<NewUser> = z.object({
  user_id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  is_admin: z.boolean().optional(),
}).strict();

export const userValidator = zValidator("json", schema, (result, c) => {
  if (!result.success) {
    return c.json({ errors: result.error.issues }, 400);
  }
  if (!result.data.user_id) {
    result.data.user_id = slugify(result.data.name, { lower: true, strict: true });
  }
});

const userQuerySchema: z.ZodType<UserListQuery> = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0),
}).strict();

export const userQueryValidator = zValidator("query", userQuerySchema);