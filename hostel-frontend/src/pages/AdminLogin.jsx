import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { hasFirebaseEnv } from "../firebase/config";
import { signInWithEmail, signOutUser } from "../firebase/services";
import { fetchProfile, resolveAdminAccess } from "../lib/admin";

export default function AdminLogin({ adminState, refreshAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const nextPath = location.state?.from?.pathname || "/admin";

  if (adminState.isAdmin) return <Navigate replace to={nextPath} />;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (!hasFirebaseEnv) throw new Error("Firebase configure karo (.env file).");
      const firebaseUser = await signInWithEmail(form.email, form.password);
      const profile = await fetchProfile(firebaseUser.uid);
      if (!resolveAdminAccess(firebaseUser, profile)) {
        await signOutUser();
        throw new Error("Is account ko admin access nahi hai.");
      }
      if (refreshAdmin) await refreshAdmin();
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.message || "Login nahi ho saka.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left Panel */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logo}>🏨</div>
          <h1 style={styles.brand}>Shri Nivas Hostel</h1>
          <p style={styles.tagline}>Premium Hostel Management System</p>
          <div style={styles.features}>
            {["🚪 Room Management", "📅 Booking Control", "🖼️ Gallery Upload", "💬 Guest Messages"].map((f) => (
              <div key={f} style={styles.featureItem}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.eyebrow}>Admin Portal</span>
            <h2 style={styles.title}>Welcome Back</h2>
            <p style={styles.subtitle}>Apna admin account se login karo</p>
            <p style={{ fontSize: "0.82rem", color: "rgba(28,28,28,0.5)", marginTop: "0.5rem" }}>
              Default: admin@hostel.com / admin123
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>✉️</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{ ...styles.input, paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={styles.eyeBtn}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={styles.errorBox}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{ ...styles.submitBtn, opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? (
                <span>⏳ Login ho raha hai...</span>
              ) : (
                <span>🚀 Admin Dashboard Kholo</span>
              )}
            </button>
          </form>

          <p style={styles.hint}>
            🔐 Sirf authorized admins hi login kar sakte hain
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  left: {
    flex: 1,
    background: "linear-gradient(135deg, #e8540a 0%, #c94200 50%, #1c1c1c 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
  },
  leftInner: {
    color: "#fff",
    maxWidth: 400,
  },
  logo: {
    fontSize: 56,
    marginBottom: "1rem",
  },
  brand: {
    fontSize: "2.4rem",
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 0.5rem",
    lineHeight: 1.1,
  },
  tagline: {
    color: "rgba(255,255,255,0.75)",
    fontSize: "1rem",
    margin: "0 0 2rem",
    lineHeight: 1.6,
  },
  features: {
    display: "grid",
    gap: "0.75rem",
  },
  featureItem: {
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: "0.85rem 1.1rem",
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: 500,
  },
  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "#faf8f4",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    background: "#fff",
    borderRadius: 28,
    padding: "2.5rem",
    boxShadow: "0 24px 60px rgba(28,28,28,0.1)",
    border: "1px solid rgba(28,28,28,0.06)",
  },
  cardHeader: {
    marginBottom: "2rem",
  },
  eyebrow: {
    display: "inline-block",
    background: "rgba(232,84,10,0.1)",
    color: "#e8540a",
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    padding: "0.35rem 0.85rem",
    borderRadius: 999,
    marginBottom: "0.9rem",
  },
  title: {
    fontSize: "2rem",
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: 700,
    color: "#1c1c1c",
    margin: "0 0 0.4rem",
    lineHeight: 1.1,
  },
  subtitle: {
    color: "rgba(28,28,28,0.6)",
    fontSize: "0.95rem",
    margin: 0,
  },
  form: {
    display: "grid",
    gap: "1.2rem",
  },
  fieldWrap: {
    display: "grid",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.88rem",
    fontWeight: 700,
    color: "#1c1c1c",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "1rem",
    fontSize: "1rem",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "0.95rem 1rem 0.95rem 2.8rem",
    borderRadius: 18,
    border: "1px solid rgba(28,28,28,0.12)",
    background: "#faf8f4",
    fontSize: "0.97rem",
    color: "#1c1c1c",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 180ms ease, box-shadow 180ms ease",
    boxSizing: "border-box",
  },
  eyeBtn: {
    position: "absolute",
    right: "0.8rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "0.2rem",
  },
  errorBox: {
    background: "#fff0e8",
    border: "1px solid rgba(232,84,10,0.2)",
    borderRadius: 14,
    padding: "0.85rem 1rem",
    color: "#c94200",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  submitBtn: {
    width: "100%",
    padding: "1rem",
    background: "linear-gradient(135deg, #e8540a, #c94200)",
    color: "#fff",
    border: "none",
    borderRadius: 18,
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 180ms ease, opacity 180ms ease",
    fontFamily: "inherit",
    boxShadow: "0 8px 24px rgba(232,84,10,0.3)",
  },
  hint: {
    textAlign: "center",
    color: "rgba(28,28,28,0.45)",
    fontSize: "0.82rem",
    marginTop: "1.5rem",
    marginBottom: 0,
  },
};
