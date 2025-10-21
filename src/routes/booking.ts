import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Hono } from "hono";
import * as db from "../database/booking.js";
import { Booking } from "../types/booking.js";
import { requireAuth } from "../middleware/auth.js";
import { bookingValidator, bookingListQueryValidator } from "../validators/bookingValidator.js";


const bookingApp = new Hono({
  strict: false,
});

bookingApp.post("/", requireAuth, bookingValidator, async (c) => {
  const sb = c.get("supabase");
  const user = c.get("user")!;
  const body = c.req.valid("json");
  const payload = { ...body, user_id: user.id };
  const created = await db.createBooking(sb, payload);
  return c.json(created, 201);
});

bookingApp.put("/:uuid", async (c) => {
  const { uuid } = c.req.param();
  const sb = c.get("supabase");
  const user = c.get("user")!;
  let updatedBooking: Booking = await c.req.json();
  updatedBooking.user_id = user.id;

  try {
    const query = sb
      .from("bookings")
      .update(updatedBooking)
      .eq("id", uuid)
      .select()
      .single();
    const response: PostgrestSingleResponse<Booking> = await query;
    if (!response.data && response.error) {
      if (response.error.code === "PGRST116") {
        return c.json(
          {
            message: "Booking not found",
          },
          404
        );
      }
      throw response.error;
    }
    return c.json(response.data, 200);
  } catch (err) {
    return c.json(err, 400);
  }
});

export default bookingApp;