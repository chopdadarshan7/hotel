import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate replace to="/" />;

  const displayName = user.displayName || user.email?.split("@")[0];

  return (
    <section className="admin-page">
      <div className="container">
        <div className="admin-hero reveal">
          <div>
            <p className="eyebrow">Your Dashboard</p>
            <h1>Welcome, {displayName} 👋</h1>
            <p>Manage your bookings and profile from one place.</p>
          </div>
          <button className="button button--ghost" type="button" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="admin-metrics">
          {[
            { label: "Active Bookings", value: "0" },
            { label: "Past Stays", value: "0" },
            { label: "Saved Rooms", value: "0" },
            { label: "Account Status", value: "✅ Active" },
          ].map(({ label, value }) => (
            <article key={label} className="admin-metric">
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
          <Link className="button button--primary" to="/rooms">Browse Rooms</Link>
          <Link className="button button--ghost" to="/contact">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}
