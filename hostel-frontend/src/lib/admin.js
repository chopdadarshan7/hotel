import { hasSupabaseEnv, requireSupabase } from "./supabase";

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export function emailIsAdmin(email) {
  return adminEmails.includes(String(email || "").toLowerCase());
}

export async function fetchProfile(userId) {
  if (!hasSupabaseEnv || !userId) {
    return null;
  }

  const supabase = await requireSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export function resolveAdminAccess(user, profile) {
  if (!user) {
    return false;
  }

  return profile?.role === "admin" || emailIsAdmin(user.email);
}
