import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { navLinks } from "../lib/siteData";
import { useAuth } from "../lib/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, loading, openSignIn, openSignUp, logout } = useAuth();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const avatarLetter = displayName[0]?.toUpperCase();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">

        {/* Brand */}
        <Link className="navbar__brand" to="/">
          <span className="navbar__brand-mark">US</span>
          <div>
            <strong>US HOSTEL</strong>
            <small>Your Home. Everywhere.</small>
          </div>
        </Link>

        {/* Mobile right — auth buttons + toggle */}
        <div className="navbar__mobile-right">
          {!loading && !user && (
            <>
              <button className="button button--ghost button--small"
                onClick={() => { openSignIn(); setOpen(false); }}>
                Sign In
              </button>
              <button className="button button--primary button--small"
                onClick={() => { openSignUp(); setOpen(false); }}>
                Sign Up
              </button>
            </>
          )}
          <button className="navbar__toggle" type="button"
            onClick={() => setOpen((p) => !p)} aria-label="Toggle navigation">
            <span /><span /><span />
          </button>
        </div>

        {/* Nav links */}
        <nav className={open ? "navbar__links navbar__links--open" : "navbar__links"}>

          {navLinks.map((item) => (
            <NavLink key={item.href} to={item.href} onClick={() => setOpen(false)}
              className={({ isActive }) => isActive ? "navbar__link navbar__link--active" : "navbar__link"}>
              {item.label}
            </NavLink>
          ))}

          <span className="navbar__divider" />

          {loading ? (
            <span style={{ fontSize: "0.85rem", opacity: 0.5, padding: "0.5rem" }}>...</span>
          ) : user ? (
            <div className="nav-profile" ref={dropdownRef}>
              {/* Avatar + name + status */}
              <button
                className="nav-profile__trigger"
                onClick={() => setDropdownOpen((p) => !p)}
                aria-expanded={dropdownOpen}
              >
                <div className="nav-avatar">
                  {avatarLetter}
                </div>
                <div className="nav-profile__info">
                  <span className="nav-profile__greeting">Hi, {displayName}</span>
                  <span className="nav-profile__status">
                    <span className="nav-status-dot" />
                    {user.isAdmin ? "Admin" : "Logged In"}
                  </span>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 4, opacity: 0.5, transition: "transform 200ms", transform: dropdownOpen ? "rotate(180deg)" : "none" }}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown__header">
                    <div className="nav-avatar nav-avatar--lg">
                      {avatarLetter}
                    </div>
                    <div>
                      <strong>{displayName}</strong>
                      <span>{user.email}</span>
                      <span className="nav-role-badge">{user.isAdmin ? "🔑 Admin" : "👤 User"}</span>
                    </div>
                  </div>
                  <div className="nav-dropdown__divider" />
                  <button className="nav-dropdown__item" onClick={() => { setDropdownOpen(false); navigate(user.isAdmin ? "/admin" : "/dashboard"); }}>
                    👤 My Profile
                  </button>
                  <button className="nav-dropdown__item" onClick={() => { setDropdownOpen(false); navigate("/dashboard"); }}>
                    🛏 My Bookings
                  </button>
                  <button className="nav-dropdown__item" onClick={() => { setDropdownOpen(false); }}>
                    ⚙️ Settings
                  </button>
                  <div className="nav-dropdown__divider" />
                  <button className="nav-dropdown__item nav-dropdown__item--danger" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="button button--ghost button--small"
                onClick={() => { openSignIn(); setOpen(false); }}>
                Sign In
              </button>
              <button className="button button--primary button--small"
                onClick={() => { openSignUp(); setOpen(false); }}>
                Sign Up
              </button>
            </>
          )}

          <span className="navbar__divider" />

          {/* Admin Panel — only for admins or when not logged in */}
          {(!user || user.isAdmin) && (
            <Link
              to={user?.isAdmin ? "/admin" : "/admin/login"}
              onClick={() => setOpen(false)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                padding: "0.6rem 1rem",
                background: "#1c1c1c", color: "#fff",
                borderRadius: 999, fontSize: "0.85rem", fontWeight: 700,
                border: "none", textDecoration: "none",
                boxShadow: "0 4px 12px rgba(28,28,28,0.2)",
                whiteSpace: "nowrap",
              }}>
              🔑 {user?.isAdmin ? "Admin Panel" : "Admin"}
            </Link>
          )}

        </nav>
      </div>
    </header>
  );
}
