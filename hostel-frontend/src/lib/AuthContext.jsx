import { onAuthStateChanged } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, hasFirebaseEnv } from "../firebase/config";
import {
  fetchUserProfile,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
} from "../firebase/services";
import { buildAppUser } from "./authUser";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(hasFirebaseEnv);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (!hasFirebaseEnv) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      let profile = null;
      try {
        profile = await fetchUserProfile(firebaseUser.uid);
      } catch {
        // profile optional
      }

      setUser(buildAppUser(firebaseUser, profile));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const openSignIn = () => {
    setAuthMode("signin");
    setShowAuth(true);
  };
  const openSignUp = () => {
    setAuthMode("signup");
    setShowAuth(true);
  };
  const closeAuth = () => setShowAuth(false);

  const signInWithGoogleHandler = async () => {
    if (!hasFirebaseEnv) throw new Error("Firebase configure karo (.env file).");
    const firebaseUser = await signInWithGoogle();
    const profile = await fetchUserProfile(firebaseUser.uid);
    const appUser = buildAppUser(firebaseUser, profile);
    setUser(appUser);
    setShowAuth(false);
    showToast(`Welcome, ${appUser.displayName}! 🎉`, "success");
    navigate(appUser.isAdmin ? "/admin" : "/dashboard");
  };

  const signInWithPassword = async (email, password) => {
    if (!hasFirebaseEnv) throw new Error("Firebase configure karo (.env file).");
    const firebaseUser = await signInWithEmail(email, password);
    const profile = await fetchUserProfile(firebaseUser.uid);
    const appUser = buildAppUser(firebaseUser, profile);
    setUser(appUser);
    setShowAuth(false);
    showToast(`Welcome back, ${appUser.displayName}!`, "success");
    navigate(appUser.isAdmin ? "/admin" : "/dashboard");
  };

  const signUpWithPassword = async (email, password, name) => {
    if (!hasFirebaseEnv) throw new Error("Firebase configure karo (.env file).");
    const firebaseUser = await signUpWithEmail(email, password, name);
    const profile = await fetchUserProfile(firebaseUser.uid);
    const appUser = buildAppUser(firebaseUser, profile);
    setUser(appUser);
    setShowAuth(false);
    showToast(`Welcome, ${appUser.displayName}!`, "success");
    navigate("/dashboard");
  };

  const logout = async () => {
    if (hasFirebaseEnv) await signOutUser();
    setUser(null);
    showToast("You have been logged out.", "info");
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        showAuth,
        authMode,
        toast,
        openSignIn,
        openSignUp,
        closeAuth,
        signInWithGoogle: signInWithGoogleHandler,
        signInWithPassword,
        signUpWithPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
