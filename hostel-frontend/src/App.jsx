import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import Toast from "./components/Toast";
import WhatsAppButton from "./components/WhatsAppButton";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import { fetchProfile, resolveAdminAccess } from "./lib/admin";
import { auth, hasFirebaseEnv } from "./firebase/config";

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return null;
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function AdminLoader({ message = "Loading admin workspace..." }) {
  return (
    <section className="admin-auth">
      <div className="admin-auth__panel">
        <p className="eyebrow">Admin</p>
        <h1>{message}</h1>
      </div>
    </section>
  );
}

function AdminAccessDenied() {
  return (
    <section className="admin-auth">
      <div className="admin-auth__panel">
        <p className="eyebrow">Access denied</p>
        <h1>This account is not allowed into the admin dashboard.</h1>
        <p>Admin email Firebase profile mein role: admin hona chahiye.</p>
      </div>
    </section>
  );
}

function ProtectedAdminRoute({ adminState }) {
  const location = useLocation();
  if (adminState.loading) return <AdminLoader />;
  if (!adminState.user) return <Navigate replace to="/admin/login" state={{ from: location }} />;
  if (!adminState.isAdmin) return <AdminAccessDenied />;
  return <Outlet />;
}

export default function App() {
  const [adminState, setAdminState] = useState({
    loading: true,
    user: null,
    profile: null,
    isAdmin: false,
  });

  const refreshAdmin = async () => {
    if (!hasFirebaseEnv || !auth.currentUser) {
      setAdminState({ loading: false, user: null, profile: null, isAdmin: false });
      return;
    }

    const firebaseUser = auth.currentUser;
    let profile = null;
    try {
      profile = await fetchProfile(firebaseUser.uid);
    } catch {
      // ignore
    }

    setAdminState({
      loading: false,
      user: firebaseUser,
      profile,
      isAdmin: resolveAdminAccess(firebaseUser, profile),
    });
  };

  useEffect(() => {
    if (!hasFirebaseEnv) {
      setAdminState((s) => ({ ...s, loading: false }));
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, () => {
      refreshAdmin();
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <ScrollToTop />
      <AuthModal />
      <Toast />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route
          path="/admin/login"
          element={<AdminLogin adminState={adminState} refreshAdmin={refreshAdmin} />}
        />

        <Route element={<ProtectedAdminRoute adminState={adminState} />}>
          <Route
            path="/admin"
            element={<AdminDashboard adminState={adminState} refreshAdmin={refreshAdmin} />}
          />
        </Route>

        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </>
  );
}
