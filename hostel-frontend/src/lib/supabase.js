import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vxanuixwnykhybjbdsfs.supabase.co";
const supabaseAnonKey = "sb_publishable_TzYvBYioyb1aaWZ8Sp14Gg_4FGjvegD";

export const hasSupabaseEnv = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function requireSupabase() {
  return supabase;
}
