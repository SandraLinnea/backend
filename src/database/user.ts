import type { SupabaseClient } from "@supabase/supabase-js";

export type PaginatedListResponse<T> = {
  data: T[];
  count: number;
  offset: number;
  limit: number;
};

export async function getUsers(sb: SupabaseClient, query: UserListQuery): Promise<PaginatedListResponse<User>> {
  const start = query.offset ?? 0;
  const end = start + (query.limit ?? 10) - 1;

  const res = await sb.from("profiles").select("*", { count: "exact" }).range(start, end);

  return {
    data: (res.data as User[]) ?? [],
    count: res.count ?? 0,
    offset: start,
    limit: query.limit ?? 10,
  };
}

export async function getUser(sb: SupabaseClient, id: string): Promise<User> {
  const { data, error } = await sb.from("profiles").select("*").eq("id", id).single();
  if (error) throw error;
  return data as User;
}

export async function upsertProfile(sb: SupabaseClient, profile: NewUser & { id: string }): Promise<User> {
  const { data, error } = await sb.from("profiles").upsert(profile).select().single();
  if (error) throw error;
  return data as User;
}
