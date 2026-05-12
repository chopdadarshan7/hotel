import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BookingModal from "../components/BookingModal";
import RoomCard from "../components/RoomCard";
import useRooms from "../hooks/useRooms";
import { roomTypeOptions } from "../lib/siteData";

export default function Rooms() {
  const { rooms, loading, error, isFallback } = useRooms();
  const [searchParams] = useSearchParams();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const incomingGuests = Number(searchParams.get("guests")) || 1;

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesType = typeFilter === "all" ? true : room.type === typeFilter;
      const matchesPrice =
        priceFilter === "all"
          ? true
          : priceFilter === "budget"
            ? Number(room.price_per_night) <= 1000
            : priceFilter === "mid"
              ? Number(room.price_per_night) > 1000 && Number(room.price_per_night) <= 2000
              : Number(room.price_per_night) > 2000;
      const matchesAvailability =
        availabilityFilter === "all"
          ? true
          : availabilityFilter === "available"
            ? room.available
            : !room.available;
      const matchesGuests = Number(room.max_guests || 1) >= incomingGuests;

      return matchesType && matchesPrice && matchesAvailability && matchesGuests;
    });
  }, [availabilityFilter, incomingGuests, priceFilter, rooms, typeFilter]);

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__content">
          <p className="eyebrow">Rooms & Booking</p>
          <h1>Find the room that fits your trip, budget, and energy.</h1>
          <p>
            Compare dorms and private stays, check availability, and lock in your booking in just a
            few clicks.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filter-bar">
            <label className="field field--inline">
              <span>Room type</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                {roomTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field--inline">
              <span>Price</span>
              <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)}>
                <option value="all">All budgets</option>
                <option value="budget">Up to ₹1,000</option>
                <option value="mid">₹1,001 - ₹2,000</option>
                <option value="premium">Above ₹2,000</option>
              </select>
            </label>

            <label className="field field--inline">
              <span>Availability</span>
              <select
                value={availabilityFilter}
                onChange={(event) => setAvailabilityFilter(event.target.value)}
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>
            </label>
          </div>

          {error ? <p className="inline-message">{error}</p> : null}
          {isFallback ? <p className="inline-message">Showing sample room content until Supabase is connected.</p> : null}

          <div className="room-grid room-grid--dense">
            {(loading ? Array.from({ length: 4 }) : filteredRooms).map((room, index) =>
              loading ? (
                <div key={`room-page-skeleton-${index}`} className="room-card room-card--skeleton shimmer" />
              ) : (
                <RoomCard key={room.id} room={room} onBook={setSelectedRoom} />
              ),
            )}
          </div>

          {!loading && filteredRooms.length === 0 ? (
            <div className="empty-state">
              <h3>No rooms match these filters.</h3>
              <p>Try expanding your budget or switching back to all availability.</p>
            </div>
          ) : null}
        </div>
      </section>

      <BookingModal room={selectedRoom} isOpen={Boolean(selectedRoom)} onClose={() => setSelectedRoom(null)} />
    </>
  );
}
