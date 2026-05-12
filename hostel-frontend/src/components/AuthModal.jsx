import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { emailIsAdmin } from "../lib/admin";
import { hasSupabaseEnv, requireSupabase } from "../lib/supabase";

export default function AuthModal() {
  const { showAuth, authMode, closeAuth } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(authMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!showAuth) return null;

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleGoogleLogin = async () => {
    setLoading(true); setError("");
    try {
      const supabase = await requireSupabase();
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (err) throw err;
    } catch (err) {
      setError(err.message || "Google login failed.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      if (!hasSupabaseEnv) throw new Error("Supabase not configured.");
      const supabase = await requireSupabase();
      if (tab === "signin") {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (err) throw err;
        setSuccess("✅ Login successful! Redirecting...");
        const isAdmin = emailIsAdmin(form.email) || data.user?.user_metadata?.role === "admin";
        setTimeout(() => { closeAuth(); navigate(isAdmin ? "/admin" : "/dashboard"); }, 900);
      } else {
        const { error: err } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { data: { full_name: form.name } },
        });
        if (err) throw err;
        setSuccess("✅ Account ban gaya! Ab login karo.");
        setTimeout(() => { setTab("signin"); setSuccess(""); }, 1500);
      }
    } catch (err) {
      setError(err.message || "Kuch galat hua.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.backdrop} onClick={closeAuth}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <button style={S.closeBtn} onClick={closeAuth}>✕</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={S.logoIcon}>🏨</div>
          <h2 style={S.modalTitle}>US Hostel</h2>
          <p style={S.modalSub}>Your Home. Everywhere.</p>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {["signin", "signup"].map((t) => (
            <button key={t} style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}
              onClick={() => { setTab(t); setError(""); setSuccess(""); }}>
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Google Button */}
        <button type="button" onClick={handleGoogleLogin} disabled={loading}
          style={S.googleBtn}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={18} height={18} alt="G" />
          Google se Continue karo
        </button>

        {/* Divider */}
        <div style={S.divider}>
          <div style={S.dividerLine} />
          <span style={S.dividerText}>ya</span>
          <div style={S.dividerLine} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          {tab === "signup" && (
            <div style={S.field}>
              <label style={S.label}>Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handle}
                placeholder="Tumhara naam" required style={S.input} />
            </div>
          )}
          <div style={S.field}>
            <label style={S.label}>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handle}
              placeholder="email@example.com" required style={S.input} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle}
              placeholder="••••••••" required minLength={6} style={S.input} />
          </div>

          {error && <div style={S.errorBox}>⚠️ {error}</div>}
          {success && <div style={S.successBox}>{success}</div>}

          <button type="submit" disabled={loading} style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "⏳ Please wait..." : tab === "signin" ? "🚀 Sign In" : "✨ Create Account"}
          </button>
        </form>

        <p style={S.switchText}>
          {tab === "signin" ? "Account nahi hai? " : "Already account hai? "}
          <button style={S.switchBtn} onClick={() => { setTab(tab === "signin" ? "signup" : "signin"); setError(""); }}>
            {tab === "signin" ? "Sign Up karo" : "Sign In karo"}
          </button>
        </p>
      </div>
    </div>
  );
}

const S = {
  backdrop: {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(28,28,28,0.65)",
    backdropFilter: "blur(8px)",
    display: "grid", placeItems: "center", padding: "1rem",
  },
  modal: {
    background: "#fff", borderRadius: 28, padding: "2rem",
    width: "100%", maxWidth: 420, position: "relative",
    boxShadow: "0 40px 80px rgba(28,28,28,0.25)",
    animation: "fadeInUp 300ms ease both",
  },
  closeBtn: {
    position: "absolute", top: "1rem", right: "1rem",
    background: "rgba(28,28,28,0.06)", border: "none",
    borderRadius: "50%", width: 36, height: 36,
    cursor: "pointer", fontSize: "0.9rem", color: "#1c1c1c",
  },
  logoIcon: { fontSize: 44, marginBottom: "0.4rem" },
  modalTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "1.6rem", color: "#1c1c1c",
    margin: "0 0 0.2rem", fontWeight: 700,
  },
  modalSub: { color: "rgba(28,28,28,0.5)", fontSize: "0.88rem", margin: 0 },
  tabs: {
    display: "flex", background: "#faf8f4",
    borderRadius: 999, padding: "0.3rem", marginBottom: "1.5rem",
  },
  tab: {
    flex: 1, padding: "0.65rem", border: "none",
    borderRadius: 999, background: "none",
    cursor: "pointer", fontSize: "0.92rem",
    fontWeight: 600, color: "rgba(28,28,28,0.45)",
    fontFamily: "inherit", transition: "all 200ms",
  },
  tabActive: {
    background: "#fff", color: "#e8540a",
    boxShadow: "0 2px 10px rgba(28,28,28,0.1)",
  },
  field: { display: "grid", gap: "0.4rem" },
  label: { fontSize: "0.88rem", fontWeight: 700, color: "#1c1c1c" },
  input: {
    padding: "0.9rem 1rem", borderRadius: 18,
    border: "1px solid rgba(28,28,28,0.12)",
    background: "#faf8f4", fontSize: "0.95rem",
    color: "#1c1c1c", outline: "none",
    fontFamily: "inherit", width: "100%", boxSizing: "border-box",
  },
  errorBox: {
    background: "#fff0e8", border: "1px solid rgba(232,84,10,0.2)",
    borderRadius: 14, padding: "0.75rem 1rem",
    color: "#c94200", fontSize: "0.88rem", fontWeight: 500,
  },
  successBox: {
    background: "#edf9f1", border: "1px solid rgba(35,98,62,0.2)",
    borderRadius: 14, padding: "0.75rem 1rem",
    color: "#23623e", fontSize: "0.88rem", fontWeight: 500,
  },
  submitBtn: {
    width: "100%", padding: "0.95rem",
    background: "linear-gradient(135deg, #e8540a, #c94200)",
    color: "#fff", border: "none", borderRadius: 18,
    fontSize: "1rem", fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", boxShadow: "0 8px 24px rgba(232,84,10,0.25)",
  },
  googleBtn: {
    width: "100%", padding: "0.9rem",
    background: "#fff", color: "#1c1c1c",
    border: "1px solid rgba(28,28,28,0.15)",
    borderRadius: 18, fontSize: "0.95rem",
    fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit",
    display: "flex", alignItems: "center",
    justifyContent: "center", gap: "0.6rem",
    boxShadow: "0 2px 8px rgba(28,28,28,0.08)",
  },
  divider: {
    display: "flex", alignItems: "center", gap: "0.75rem",
  },
  dividerLine: { flex: 1, height: 1, background: "rgba(28,28,28,0.1)" },
  dividerText: { fontSize: "0.82rem", color: "rgba(28,28,28,0.4)", fontWeight: 500 },
  switchText: {
    textAlign: "center", fontSize: "0.88rem",
    color: "rgba(28,28,28,0.5)", marginTop: "1rem", marginBottom: 0,
  },
  switchBtn: {
    background: "none", border: "none", color: "#e8540a",
    fontWeight: 700, cursor: "pointer", fontSize: "0.88rem",
    fontFamily: "inherit", padding: 0,
  },
};
