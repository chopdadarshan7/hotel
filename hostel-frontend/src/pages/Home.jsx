import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BookingModal from "../components/BookingModal";
import RoomCard from "../components/RoomCard";
import useGallery from "../hooks/useGallery";
import useRooms from "../hooks/useRooms";
import { testimonials, whyUsItems } from "../lib/siteData";

export default function Home() {
  const navigate = useNavigate();
  const { rooms, loading: roomsLoading } = useRooms();
  const { items: galleryItems, loading: galleryLoading } = useGallery();
  const [bookingRoom, setBookingRoom] = useState(null);
  const [quickBooking, setQuickBooking] = useState({
    checkIn: "",
    checkOut: "",
    guests: 2,
  });

  const featuredRooms = rooms.slice(0, 3);
  const previewGallery = galleryItems.slice(0, 6);

  const handleQuickBooking = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({
      checkIn: quickBooking.checkIn,
      checkOut: quickBooking.checkOut,
      guests: String(quickBooking.guests),
    });
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <>
      <section className="hero-section">
        <div className="container hero-section__grid">
          <div className="hero-copy reveal">
            <p className="eyebrow">Modern city hostel</p>
            <h1>Your Home. Everywhere.</h1>
            <p>
              Stylish dorms, private rooms, social spaces, and an easy booking experience built
              for modern travellers.
            </p>
            <div className="hero-copy__actions">
              <Link className="button button--primary" to="/rooms">
                Explore Rooms
              </Link>
              <Link className="button button--ghost" to="/about">
                Our Story
              </Link>
            </div>
          </div>

          <div className="hero-visual reveal">
            <img
              src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80"
              alt="Us Hostel common area"
            />
            <div className="hero-visual__card">
              <span>Jaipur City Center</span>
              <strong>24/7 reception · curated stays · warm community</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--booking">
        <div className="container">
          <form className="booking-bar reveal" onSubmit={handleQuickBooking}>
            <label className="field field--inline">
              <span>Check-in</span>
              <input
                type="date"
                value={quickBooking.checkIn}
                onChange={(event) =>
                  setQuickBooking((current) => ({ ...current, checkIn: event.target.value }))
                }
              />
            </label>
            <label className="field field--inline">
              <span>Check-out</span>
              <input
                type="date"
                value={quickBooking.checkOut}
                onChange={(event) =>
                  setQuickBooking((current) => ({ ...current, checkOut: event.target.value }))
                }
              />
            </label>
            <label className="field field--inline">
              <span>Guests</span>
              <input
                type="number"
                min="1"
                max="6"
                value={quickBooking.guests}
                onChange={(event) =>
                  setQuickBooking((current) => ({ ...current, guests: event.target.value }))
                }
              />
            </label>
            <button className="button button--primary" type="submit">
              Book Now
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Featured rooms</p>
              <h2>Comfort-first stays with a social energy.</h2>
            </div>
            <Link className="text-link" to="/rooms">
              View all rooms
            </Link>
          </div>

          <div className="room-grid">
            {(roomsLoading ? Array.from({ length: 3 }) : featuredRooms).map((room, index) =>
              roomsLoading ? (
                <div key={`room-skeleton-${index}`} className="room-card room-card--skeleton shimmer" />
              ) : (
                <RoomCard key={room.id} room={room} onBook={setBookingRoom} />
              ),
            )}
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Why Us</p>
              <h2>Everything you need, nothing that feels generic.</h2>
            </div>
          </div>

          <div className="benefit-grid">
            {whyUsItems.map((item) => (
              <article key={item.title} className="benefit-card reveal">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Guest reviews</p>
              <h2>Friendly stays earn repeat stories.</h2>
            </div>
          </div>

          <div className="review-grid">
            {testimonials.map((review) => (
              <article key={review.name} className="review-card reveal">
                <div className="review-card__stars">{"★".repeat(review.rating)}</div>
                <p>{review.quote}</p>
                <strong>{review.name}</strong>
                <span>{review.location}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--gallery-preview">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Gallery</p>
              <h2>Bright spaces, thoughtful details, and community moments.</h2>
            </div>
            <Link className="text-link" to="/gallery">
              Open full gallery
            </Link>
          </div>

          <div className="gallery-preview-grid">
            {(galleryLoading ? Array.from({ length: 6 }) : previewGallery).map((item, index) =>
              galleryLoading ? (
                <div key={`gallery-skeleton-${index}`} className="gallery-preview shimmer" />
              ) : (
                <div key={item.id} className="gallery-preview reveal">
                  <img src={item.url} alt={item.caption || "Gallery preview"} />
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <BookingModal room={bookingRoom} isOpen={Boolean(bookingRoom)} onClose={() => setBookingRoom(null)} />
    </>
  );
}
