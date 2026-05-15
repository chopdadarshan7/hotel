import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { getBookingsForUser } from "../firebase/services";
import { hasFirebaseEnv } from "../firebase/config";
import { formatCurrency } from "../utils/formatDate";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user?.id || !hasFirebaseEnv) {
      setFetching(false);
      return;
    }

    getBookingsForUser({ userId: user.id, email: user.email })
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setFetching(false));
  }, [user?.id, user?.email]);

  if (loading) return null;
  if (!user) return <Navigate replace to="/" />;

  const displayName = user.displayName || user.email?.split("@")[0];
  const activeBookings = bookings.filter((b) => b.status !== "cancelled");

  return (
    <section className="admin-page">
      <div className="container">
        <div className="admin-hero reveal">
          <div>
            <p className="eyebrow">Your Dashboard</p>
            <h1>Welcome, {displayName} 👋</h1>
            <p>Manage your bookings from one place.</p>
          </div>
          <button className="button button--ghost" type="button" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="admin-metrics">
          {[
            { label: "Active Bookings", value: String(activeBookings.length) },
            { label: "Total Bookings", value: String(bookings.length) },
            { label: "Account", value: user.email },
            { label: "Status", value: "✅ Active" },
          ].map(({ label, value }) => (
            <article key={label} className="admin-metric">
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>

        <div className="admin-panel" style={{ marginTop: "1.5rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>My Bookings</h2>
          {fetching ? (
            <p>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p>Abhi koi booking nahi hai.</p>
          ) : (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {bookings.map((booking) => (
                <article
                  key={booking.id}
                  style={{
                    border: "1px solid rgba(28,28,28,0.1)",
                    borderRadius: 16,
                    padding: "1rem",
                    background: "#fff",
                  }}
                >
                  <strong>{booking.rooms?.name || booking.room_name || "Room"}</strong>
                  <p style={{ margin: "0.35rem 0 0", color: "rgba(28,28,28,0.65)" }}>
                    {booking.check_in} → {booking.check_out}
                  </p>
                  <p style={{ margin: "0.35rem 0 0" }}>
                    {formatCurrency(booking.total_price)} · {booking.status}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <Link className="button button--primary" to="/rooms">Browse Rooms</Link>
          <Link className="button button--ghost" to="/contact">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}
