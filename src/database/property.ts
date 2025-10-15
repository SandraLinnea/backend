import type { SupabaseClient } from "@supabase/supabase-js";
import type { Property, PropertyListQuery } from "../types/property.js";

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
  const startIndex = query.offset ?? 0;
  const endIndex = startIndex + (query.limit ?? 10) - 1;

  const q = sb
    .from("properties")
    .select("*", { count: "exact" })
    .range(startIndex, endIndex);

  const res = await q;

  return {
    data: (res.data as Property[]) || [],
    count: res.count || 0,
    offset: startIndex,
    limit: query.limit ?? 10,
  };
}

export async function getProperty(sb: SupabaseClient, id: string): Promise<Property> {
  const { data, error } = await sb.from("properties").select("*").eq("property_id", id).single();
  if (error) throw error;
  return data as Property;
}