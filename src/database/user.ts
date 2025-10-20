import type { SupabaseClient } from "@supabase/supabase-js";

export type PaginatedListResponse<T> = {
  data: T[];
  count: number;
  offset: number;
  limit: number;
};

export async function getUsers(
  sb: SupabaseClient,
  query: UserListQuery
): Promise<PaginatedListResponse<User>> {
  const startIndex = query.offset ?? 0;
  const endIndex = startIndex + (query.limit ?? 10) - 1;

  const q = sb
    .from("users")
    .select("*", { count: "exact" })
    .range(startIndex, endIndex);

  const res = await q;

  return {
    data: (res.data as User[]) || [],
    count: res.count || 0,
    offset: startIndex,
    limit: query.limit ?? 10,
  };
}

export async function getUser(sb: SupabaseClient, id: string): Promise<User> {
  const { data, error } = await sb.from("users").select("*").eq("user_id", id).single();
  if (error) throw error;
  return data as User;
}