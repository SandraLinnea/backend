import type { PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js";
// import type { Property, NewProperty, PropertyListQuery } from "../types/property.js";

export type PaginatedListResponse<T> = {
  data: T[];
  count: number;
  offset: number;
  limit: number;
};

export async function getProperties(
  sb: SupabaseClient,
  query: PropertyListQuery
): Promise<PaginatedListResponse<Property>> {
  const sortable = new Set(["title", "price_per_night"]);
  const order = query.sort_by && sortable.has(query.sort_by) ? query.sort_by : "title";

  const startIndex = query.offset ?? 0;
  const endIndex   = startIndex + (query.limit ?? 10) - 1;

  const q = sb
    .from("properties")
    .select("*", { count: "exact" })
    .order(order as string, { ascending: true })
    .range(startIndex, endIndex);

  if (query.city) q.eq("city", query.city);
  if (query.q)    q.or(`title.ilike.%${query.q}%,description.ilike.%${query.q}%`);

  const res = await q;
  return {
    data:  (res.data as Property[]) || [],
    count: res.count || 0,
    offset: startIndex,
    limit: (query.limit ?? 10),
  };
}

export async function getProperty(sb: SupabaseClient, id: string): Promise<Property> {
  const { data, error } = await sb.from("properties").select("*").eq("property_id", id).single();
  if (error) throw error;
  return data as Property;
}

export async function createProperty(sb: SupabaseClient, p: NewProperty): Promise<Property> {
  const { data, error } = await sb.from("properties").insert(p).select().single();
  if (error) throw error;
  return data as Property;
}

export async function updateProperty(sb: SupabaseClient, id: string, p: NewProperty): Promise<Property | null> {
  const { property_id, ...payload } = p;
  const { data } = await sb.from("properties").update(payload).eq("property_id", id).select().single();
  return (data as Property) ?? null;
}

export async function deleteProperty(sb: SupabaseClient, id: string): Promise<Property | null> {
  const { data } = await sb.from("properties").delete().eq("property_id", id).select().single();
  return (data as Property) ?? null;
}
