import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { navLinks } from "../lib/siteData";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link className="navbar__brand" to="/">
          <span className="navbar__brand-mark">US</span>
          <div>
            <strong>US HOSTEL</strong>
            <small>Your Home. Everywhere.</small>
          </div>
        </Link>

        <button
          className="navbar__toggle"
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={open ? "navbar__links navbar__links--open" : "navbar__links"}>
          {navLinks.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                isActive ? "navbar__link navbar__link--active" : "navbar__link"
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link className="button button--ghost button--small" to="/admin/login" onClick={() => setOpen(false)}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
