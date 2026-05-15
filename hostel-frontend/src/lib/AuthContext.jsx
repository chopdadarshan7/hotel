import { createContext, useContext, useEffect, useState } from "react";
import { emailIsAdmin } from "./admin";
import { hasSupabaseEnv, requireSupabase } from "./supabase";

const AuthContext = createContext(null);

function buildUser(u, profile = null) {
  if (!u) return null;

  // Supabase Google OAuth typically populates these fields either in:
  // - session.user.user_metadata (name, picture)
  // - session.user.identities[0].identity_data (full_name/name/picture)
  // - public.profiles row (full_name, role, etc.)

  const identity = u?.identities?.[0]?.identity_data || {};

  const displayName =
    profile?.full_name ||
    profile?.name ||
    u?.user_metadata?.full_name ||
    u?.user_metadata?.name ||
    u?.user_metadata?.display_name ||
    u?.user_metadata?.preferred_username ||
    identity?.full_name ||
    identity?.name ||
    u?.user_metadata?.sub ||
    u?.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    profile?.avatar_url ||
    profile?.avatar ||
    u?.user_metadata?.avatar_url ||
    u?.user_metadata?.avatar ||
    u?.user_metadata?.picture ||
    u?.user_metadata?.profile_picture ||
    identity?.picture ||
    identity?.profile_picture ||
    null;

  return {
    ...u,
    displayName,
    avatarUrl,
    isAdmin:
      emailIsAdmin(u?.email) ||
      profile?.role === "admin" ||
      u?.user_metadata?.role === "admin",
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
    let mounted = true;

    if (!hasSupabaseEnv) {
      if (mounted) queueMicrotask(() => setLoading(false));
      return;
    }

    let subscription = null;

    requireSupabase().then((supabase) => {
      supabase.auth.getSession().then(async ({ data }) => {
        if (!mounted) return;
        const rawUser = data.session?.user || null;
        console.log("[AuthContext] getSession rawUser", {
          email: rawUser?.email,
          user_metadata: rawUser?.user_metadata,
          identities: rawUser?.identities,
          sub: rawUser?.id,
        });

        if (rawUser) {
          let profile = null;
          try {
            const { data: p } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", rawUser.id)
              .maybeSingle();
            profile = p;
          } catch {
            // ignore profile fetch errors
          }


          const u = buildUser(rawUser, profile);
          setUser(u);
          localStorage.setItem("auth_user", JSON.stringify(u));
        } else {
          setUser(null);
          localStorage.removeItem("auth_user");
        }
        setLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (!mounted) return;

          // OAuth redirect can populate session in steps. Force a fresh user
          // so user_metadata / identity_data is available for displayName.
          let freshSession = session;
          try {
            const { data: s } = await supabase.auth.getSession();
            freshSession = s;
          } catch {}

          const rawUser = freshSession?.user || null;

          console.log("[AuthContext] onAuthStateChange", {
            event: _event,
            email: rawUser?.email,
            user_metadata: rawUser?.user_metadata,
            identities: rawUser?.identities,
            sub: rawUser?.id,
          });

          if (rawUser) {
            let profile = null;
            try {
              const { data: p } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", rawUser.id)
                .maybeSingle();
              profile = p;
            } catch {
              // ignore profile fetch errors
            }

            const u = buildUser(rawUser, profile);
            setUser(u);
            localStorage.setItem("auth_user", JSON.stringify(u));
            setShowAuth(false);
            showToast(`Welcome, ${u.displayName}! 🎉`, "success");
          } else {
            setUser(null);
            localStorage.removeItem("auth_user");
          }
        }
      );


      subscription = authListener;
    });

    return () => {
      mounted = false;
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }

    };
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
