import { useEffect, useState } from "react";
import useBooking from "../hooks/useBooking";
import calculatePrice from "../utils/calculatePrice";
import { formatCurrency } from "../utils/formatDate";
import { useAuth } from "../lib/AuthContext";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  checkIn: "",
  checkOut: "",
  guests: 1,
  specialRequests: "",
};

export default function BookingModal({ room, isOpen, onClose }) {
  const [form, setForm] = useState(initialForm);
  const { submitting, error, success, setError, setSuccess, createBooking } = useBooking();
  const { user, openSignIn } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setError("");
      setSuccess("");
    }
  }, [isOpen, setError, setSuccess]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !room) return null;

  // Login required for booking
  if (!user) {
    return (
      <div className="modal-backdrop" role="presentation" onClick={onClose}>
        <div className="booking-modal" role="dialog" onClick={(e) => e.stopPropagation()}
          style={{ textAlign: "center", padding: "2.5rem" }}>
          <button className="modal-close" type="button" onClick={onClose}>✕</button>
          <div style={{ fontSize: 48, marginBottom: "1rem" }}>🔐</div>
          <h2 style={{ marginBottom: "0.75rem" }}>Login Required</h2>
          <p style={{ marginBottom: "1.5rem" }}>Room book karne ke liye pehle Sign In karo.</p>
          <button className="button button--primary" onClick={() => { onClose(); openSignIn(); }}>
            Sign In karo
          </button>
        </div>
      </div>
    );
  }

  const pricing = calculatePrice(room.price_per_night, form.checkIn, form.checkOut, form.guests);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await createBooking({ room, form });
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (bookingError) {
      console.warn("Booking failed", bookingError);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="booking-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close booking modal">
          x
        </button>

        <div className="booking-modal__intro">
          <p className="eyebrow">Book {room.name}</p>
          <h2>Reserve your stay in seconds.</h2>
          <p>
            Choose your dates, add your guest details, and we will save your booking in Supabase
            and trigger the confirmation flow.
          </p>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="booking-form__grid">
            <label className="field">
              <span>Name</span>
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Phone</span>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </label>
            <label className="field">
              <span>Guests</span>
              <input
                min="1"
                max={room.max_guests || 1}
                name="guests"
                type="number"
                value={form.guests}
                onChange={handleChange}
                required
              />
            </label>
            <label className="field">
              <span>Check-in</span>
              <input name="checkIn" type="date" value={form.checkIn} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Check-out</span>
              <input name="checkOut" type="date" value={form.checkOut} onChange={handleChange} required />
            </label>
          </div>

          <label className="field">
            <span>Special requests</span>
            <textarea
              name="specialRequests"
              rows="4"
              value={form.specialRequests}
              onChange={handleChange}
              placeholder="Late arrival, lower bunk preference, dietary needs..."
            />
          </label>

          <div className="booking-summary">
            <div>
              <span>Nights</span>
              <strong>{pricing.nights || 0}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{pricing.total ? formatCurrency(pricing.total) : "Select dates"}</strong>
            </div>
          </div>

          {error ? <p className="form-message form-message--error">{error}</p> : null}
          {success ? <p className="form-message form-message--success">{success}</p> : null}

          <button className="button button--primary" type="submit" disabled={submitting}>
            {submitting ? "Confirming..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
