import { createContext, useContext, useEffect, useState } from "react";
import { emailIsAdmin } from "./admin";
import { hasSupabaseEnv, requireSupabase } from "./supabase";

const AuthContext = createContext(null);

function buildUser(u, profile = null) {
  if (!u) return null;
  const displayName =
    profile?.full_name ||
    u.user_metadata?.full_name ||
    u.user_metadata?.name ||
    u.user_metadata?.display_name ||
    u.identities?.[0]?.identity_data?.full_name ||
    u.identities?.[0]?.identity_data?.name ||
    u.email?.split("@")[0] ||
    "User";
  return {
    ...u,
    displayName,
    isAdmin: emailIsAdmin(u.email) || profile?.role === "admin" || u.user_metadata?.role === "admin",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!hasSupabaseEnv) { setLoading(false); return; }
    requireSupabase().then((supabase) => {
      supabase.auth.getSession().then(async ({ data }) => {
        const rawUser = data.session?.user || null;
        if (rawUser) {
          let profile = null;
          try {
            const { data: p } = await supabase.from("profiles").select("*").eq("id", rawUser.id).maybeSingle();
            profile = p;
          } catch (_) {}
          const u = buildUser(rawUser, profile);
          setUser(u);
          localStorage.setItem("auth_user", JSON.stringify(u));
        } else {
          setUser(null);
          localStorage.removeItem("auth_user");
        }
        setLoading(false);
      });
      supabase.auth.onAuthStateChange(async (_e, session) => {
        const rawUser = session?.user || null;
        if (rawUser) {
          let profile = null;
          try {
            const { data: p } = await supabase.from("profiles").select("*").eq("id", rawUser.id).maybeSingle();
            profile = p;
          } catch (_) {}
          const u = buildUser(rawUser, profile);
          setUser(u);
          localStorage.setItem("auth_user", JSON.stringify(u));
          setShowAuth(false);
          showToast(`Welcome, ${u.displayName}! 🎉`);
        } else {
          setUser(null);
          localStorage.removeItem("auth_user");
        }
      });
    });
  }, []);

  const openSignIn = () => { setAuthMode("signin"); setShowAuth(true); };
  const openSignUp = () => { setAuthMode("signup"); setShowAuth(true); };
  const closeAuth = () => setShowAuth(false);

  const logout = async () => {
    if (hasSupabaseEnv) {
      const supabase = await requireSupabase();
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem("auth_user");
    showToast("You have been logged out.", "info");
  };

  return (
    <AuthContext.Provider value={{ user, loading, showAuth, authMode, toast, openSignIn, openSignUp, closeAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
