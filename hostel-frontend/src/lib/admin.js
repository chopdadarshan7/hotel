import { fetchUserProfile } from "../firebase/services";
import { hasFirebaseEnv } from "../firebase/config";

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "admin@hostel.com")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export function emailIsAdmin(email) {
  return adminEmails.includes(String(email || "").toLowerCase());
}

export async function fetchProfile(userId) {
  if (!hasFirebaseEnv || !userId) return null;
  return fetchUserProfile(userId);
}

export function resolveAdminAccess(firebaseUser, profile) {
  if (!firebaseUser) return false;
  return profile?.role === "admin" || emailIsAdmin(firebaseUser.email);
}
