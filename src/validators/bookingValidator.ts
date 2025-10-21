import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

export const BookingStatusEnum = z.enum(["pending", "confirmed", "cancelled"]);

const bookingSchema = z.object({
  property_id: z.string(),
  user_id: z.string(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().positive().optional(),
  note: z.string().optional(),
  status: BookingStatusEnum.optional(),
}).strict();

export const bookingValidator = zValidator("json", bookingSchema, (result, c) => {
  if (!result.success) {
    return c.json({ errors: result.error.issues }, 400);
  }
  // extra validering: end > start
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
  status: BookingStatusEnum.optional(),
  q: z.string().optional(),
  sort_by: z.enum(["start_date", "end_date", "total_price"]).optional(),
}).strict();

export const bookingListQueryValidator = zValidator("query", listSchema);
