import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv"
dotenv.config();

const _supabaseUrl = process.env.SUPABASE_URL;
const _supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!_supabaseUrl || !_supabaseAnonKey) {
  throw new Error(
    "Supabase not initialized add 'SUPABASE_URL' and 'SUPABASE_ANON_KEY' to enviroment variables"
  );
}

export const supabase = createClient(_supabaseUrl, _supabaseAnonKey);

const supabaseUrl = _supabaseUrl as string
const supabaseAnonKey = _supabaseAnonKey as string

export { supabaseUrl, supabaseAnonKey }