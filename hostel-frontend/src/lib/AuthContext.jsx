import { createContext, useContext, useEffect, useState } from "react";
import { emailIsAdmin } from "./admin";
import { hasSupabaseEnv, requireSupabase } from "./supabase";

const AuthContext = createContext(null);

function buildUser(u) {
  if (!u) return null;
  return {
    ...u,
    displayName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0],
    isAdmin: emailIsAdmin(u.email) || u.user_metadata?.role === "admin",
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
      supabase.auth.getSession().then(({ data }) => {
        const u = buildUser(data.session?.user || null);
        setUser(u);
        if (u) localStorage.setItem("auth_user", JSON.stringify(u));
        else localStorage.removeItem("auth_user");
        setLoading(false);
      });
      supabase.auth.onAuthStateChange((_e, session) => {
        const u = buildUser(session?.user || null);
        setUser(u);
        if (u) {
          localStorage.setItem("auth_user", JSON.stringify(u));
          setShowAuth(false);
          showToast(`Welcome back, ${u.displayName}! 🎉`);
        } else {
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
