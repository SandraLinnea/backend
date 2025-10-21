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



/* import type { SupabaseClient } from "@supabase/supabase-js";
import type { Booking, NewBooking, BookingListQuery } from "../types/booking";

export type PaginatedListResponse<T> = {
  data: T[];
  count: number;
  offset: number;
  limit: number;
};

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

const prune = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;

// — Helpers —
async function getPropertyPrice(sb: SupabaseClient, propertyId: string): Promise<number> {
  const { data, error } = await sb
    .from("properties")
    .select("price_per_night")
    .eq("id", propertyId)
    .single();
  if (error) throw error;
  return Number((data as any).price_per_night ?? 0);
}

function nightsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
}

// — CRUD —
export async function getBookings(
  sb: SupabaseClient,
  query: BookingListQuery
): Promise<PaginatedListResponse<Booking>> {
  const startIndex = query.offset ?? 0;
  const endIndex = startIndex + (query.limit ?? 10) - 1;

  let q = sb.from("bookings").select("*", { count: "exact" }).range(startIndex, endIndex);

  if (query.property_id) q = q.eq("property_id", query.property_id);
  if (query.user_id) q = q.eq("user_id", query.user_id);
  if (query.status) q = q.eq("status", query.status);
  if (query.q) q = q.ilike("note", `%${query.q}%`);
  if (query.sort_by) q = q.order(query.sort_by as any, { ascending: true });

  const res = await q;
  return {
    data: (res.data as Booking[]) || [],
    count: res.count || 0,
    offset: startIndex,
    limit: query.limit ?? 10,
  };
}

export async function getBooking(sb: SupabaseClient, key: string): Promise<Booking> {
  const base = sb.from("bookings").select("*");
  const { data, error } = isUUID(key) ? await base.eq("id", key).single()
                                      : await base.eq("booking_id", key).single();
  if (error) throw error;
  return data as Booking;
}

export async function createBooking(sb: SupabaseClient, input: NewBooking): Promise<Booking> {
  // total_price = nights * price_per_night
  const pricePerNight = await getPropertyPrice(sb, input.property_id);
  const nights = nightsBetween(input.start_date, input.end_date);
  const total_price = pricePerNight * nights;

  const payload = { ...input, total_price };
  const { data, error } = await sb.from("bookings").insert([payload]).select().single();
  if (error) throw error;
  return data as Booking;
}

export async function updateBooking(
  sb: SupabaseClient,
  key: string,
  patch: Partial<NewBooking>
): Promise<Booking> {
  const cleaned = prune(patch);

  // om datum ändras, räkna om totalpris
  if (cleaned.start_date || cleaned.end_date || cleaned.property_id) {
    // hämta nuvarande rad för att kunna räkna korrekt
    const current = await getBooking(sb, key);
    const start = cleaned.start_date ?? current.start_date;
    const end = cleaned.end_date ?? current.end_date;
    const propId = cleaned.property_id ?? current.property_id;
    const pricePerNight = await getPropertyPrice(sb, propId);
    const total_price = pricePerNight * nightsBetween(start, end);
    (cleaned as any).total_price = total_price;
  }

  let q = sb.from("bookings").update(cleaned);
  q = isUUID(key) ? q.eq("id", key) : q.eq("booking_id", key);

  const { data, error } = await q.select().single();
  if (error) throw error;
  return data as Booking;
}

export async function deleteBooking(sb: SupabaseClient, key: string): Promise<void> {
  let q = sb.from("bookings").delete();
  q = isUUID(key) ? q.eq("id", key) : q.eq("booking_id", key);
  const { error } = await q;
  if (error) throw error;
}
 */