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
import { hasSupabaseEnv, requireSupabase } from "./lib/supabase";

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
        <p>Make sure your profile role is set to admin or your email is included in VITE_ADMIN_EMAILS.</p>
      </div>
    </section>
  );
}

function ProtectedAdminRoute({ adminState }) {
  const location = useLocation();

  if (adminState.loading) {
    return <AdminLoader />;
  }

  if (!adminState.user) {
    return <Navigate replace to="/admin/login" state={{ from: location }} />;
  }

  if (!adminState.isAdmin) {
    return <AdminAccessDenied />;
  }

  return <Outlet />;
}

export default function App() {
  const [adminState, setAdminState] = useState({
    loading: true,
    session: null,
    user: null,
    profile: null,
    isAdmin: false,
  });

  const refreshAdmin = async (sessionOverride) => {
    if (!hasSupabaseEnv) {
      setAdminState({
        loading: false,
        session: null,
        user: null,
        profile: null,
        isAdmin: false,
      });
      return;
    }

    const supabase = await requireSupabase();
    const session =
      sessionOverride !== undefined
        ? sessionOverride
        : (await supabase.auth.getSession()).data.session;

    if (!session?.user) {
      setAdminState({
        loading: false,
        session: null,
        user: null,
        profile: null,
        isAdmin: false,
      });
      return;
    }

    let profile = null;

    try {
      profile = await fetchProfile(session.user.id);
    } catch (profileError) {
      console.warn("Unable to fetch admin profile", profileError);
    }

    setAdminState({
      loading: false,
      session,
      user: session.user,
      profile,
      isAdmin: resolveAdminAccess(session.user, profile),
    });
  };

  useEffect(() => {
    let active = true;
    let subscription;

    async function bootstrap() {
      if (!hasSupabaseEnv) {
        if (active) {
          setAdminState((current) => ({ ...current, loading: false }));
        }
        return;
      }

      try {
        const supabase = await requireSupabase();
        await refreshAdmin();
        subscription = supabase.auth.onAuthStateChange((_event, session) => {
          if (!active) {
            return;
          }

          refreshAdmin(session);
        }).data.subscription;
      } catch (bootstrapError) {
        console.warn("Admin auth bootstrap failed", bootstrapError);
        if (active) {
          setAdminState({
            loading: false,
            session: null,
            user: null,
            profile: null,
            isAdmin: false,
          });
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
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
