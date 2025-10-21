import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

export const userSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    is_admin: z.boolean().optional(),
  })
  .strict();

export const userValidator = zValidator("json", userSchema, (result, c) => {
  if (!result.success) return c.json({ errors: result.error.issues }, 400);
});

const userQuerySchema = z
  .object({
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    offset: z.coerce.number().int().min(0).optional().default(0),
  })
  .strict();

export const userQueryValidator = zValidator("query", userQuerySchema);
