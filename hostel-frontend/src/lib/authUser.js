import { emailIsAdmin } from "./admin";

export function buildAppUser(firebaseUser, profile = null) {
  if (!firebaseUser) return null;

  const displayName =
    profile?.full_name
    || firebaseUser.displayName
    || firebaseUser.email?.split("@")[0]
    || "User";

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName,
    avatarUrl: profile?.avatar_url || firebaseUser.photoURL || null,
    isAdmin: profile?.role === "admin" || emailIsAdmin(firebaseUser.email),
  };
}
