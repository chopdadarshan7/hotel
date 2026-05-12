import { formatCurrency } from "../utils/formatDate";

function prettifyType(type) {
  return String(type || "room").replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function RoomCard({ room, onBook }) {
  const image = room.images?.[0];

  return (
    <article className="room-card reveal">
      <div className="room-card__media">
        <img src={image} alt={room.name} />
        <span className="room-card__tag">{prettifyType(room.type)}</span>
      </div>

      <div className="room-card__body">
        <div className="room-card__head">
          <div>
            <h3>{room.name}</h3>
            <p>{room.bed_type} · Up to {room.max_guests} guests</p>
          </div>
          <strong>{formatCurrency(room.price_per_night)}</strong>
        </div>

        <p className="room-card__description">{room.description}</p>

        <div className="room-card__amenities">
          {(room.amenities || []).slice(0, 4).map((amenity) => (
            <span key={amenity}>{amenity}</span>
          ))}
        </div>

        <button className="button button--primary button--small" type="button" onClick={() => onBook(room)}>
          Book Now
        </button>
      </div>
    </article>
  );
}
