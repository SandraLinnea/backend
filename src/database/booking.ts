import type { SupabaseClient } from "@supabase/supabase-js";
import { Booking, NewBooking, BookingListQuery } from "../types/booking";

export type PaginatedListResponse<T> = {
  data: T[];
  count: number;
  offset: number;
  limit: number;
};

export async function getBookings(
  sb: SupabaseClient,
  query: BookingListQuery
): Promise<PaginatedListResponse<Booking>> {
  const startIndex = query.offset ?? 0;
  const endIndex = startIndex + (query.limit ?? 10) - 1;

  const q = sb
    .from("bookings")
    .select("*", { count: "exact" })
    .range(startIndex, endIndex);

  const res = await q;

  return {
    data: (res.data as Booking[]) || [],
    count: res.count || 0,
    offset: startIndex,
    limit: query.limit ?? 10,
  };
}

export async function getBooking(sb: SupabaseClient, id: string): Promise<Booking> {
  const { data, error } = await sb.from("bookings").select("*").eq("booking_id", id).single();
  if (error) throw error;
  return data as Booking;
}

export async function createBooking(sb: SupabaseClient, booking: NewBooking): Promise<Booking> {
  const query = sb.from("bookings").insert([booking]).select().single();
  const response = await query;
  if (response.error) throw response.error;
  return response.data as Booking;
}

export async function updateBooking(sb: SupabaseClient, id: string, booking: NewBooking): Promise<Booking | null> {
  const bookingWithoutId = { ...booking, booking_code: undefined };
  const query = sb.from("bookings").update(bookingWithoutId).eq("booking_code", id).select().single();
  const response = await query;
  if (response.error) throw response.error;
  return response.data as Booking | null;
}

export async function deleteBooking(sb: SupabaseClient, id: string): Promise<Booking | null> {
  const query = sb.from("bookings").delete().eq("booking_code", id).select().single();
  const response = await query;
  if (response.error) throw response.error;
  return response.data as Booking | null;
}