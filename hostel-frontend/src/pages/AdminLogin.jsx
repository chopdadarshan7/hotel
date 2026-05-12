import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { fetchProfile, resolveAdminAccess } from "../lib/admin";
import { hasSupabaseEnv, requireSupabase } from "../lib/supabase";

export default function AdminLogin({ adminState, refreshAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const nextPath = location.state?.from?.pathname || "/admin";

  if (adminState.isAdmin) {
    return <Navigate replace to={nextPath} />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!hasSupabaseEnv) {
        throw new Error("Add your Supabase environment keys before using admin authentication.");
      }

      const supabase = await requireSupabase();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        throw signInError;
      }

      const profile = await fetchProfile(data.user.id);
      const hasAccess = resolveAdminAccess(data.user, profile);

      if (!hasAccess) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }

      if (refreshAdmin) {
        await refreshAdmin();
      }

      navigate(nextPath, { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-auth">
      <div className="admin-auth__panel reveal">
        <p className="eyebrow">Protected access</p>
        <h1>Admin dashboard login</h1>
        <p>Use your Supabase admin credentials to manage rooms, bookings, gallery media, and messages.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
          <button className="button button--primary" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Enter Admin Dashboard"}
          </button>
        </form>
      </div>
    </section>
  );
}
