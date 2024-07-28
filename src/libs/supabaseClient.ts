import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl) throw new Error("Supabase URL not found.");
if (!supabaseAnonKey) throw new Error("Supabase Anon key not found.");

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);