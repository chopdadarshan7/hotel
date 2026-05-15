import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "../utils/formatDate";
import { bookingStatusOptions, galleryCategoryOptions } from "../lib/siteData";
import { hasFirebaseEnv } from "../firebase/config";
import {
  deleteGalleryItem,
  deleteRoom,
  getBookings,
  getContacts,
  getGallery,
  getRooms,
  saveGalleryItem,
  saveRoom,
  signOutUser,
  updateBookingStatus,
  uploadFiles,
} from "../firebase/services";

const initialRoomForm = {
  id: "",
  name: "",
  type: "dorm",
  description: "",
  price_per_night: "",
  max_guests: "",
  bed_type: "",
  amenities: "",
  available: true,
  images: [],
};

const initialGalleryForm = {
  caption: "",
  category: "rooms",
};

function AdminMetric({ label, value }) {
  return (
    <article className="admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function AdminSection({ title, description, children }) {
  return (
    <section className="admin-section">
      <div className="admin-section__head">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}


export default function AdminDashboard({ adminState, refreshAdmin }) {
  const [activeTab, setActiveTab] = useState("rooms");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [roomForm, setRoomForm] = useState(initialRoomForm);
  const [roomFiles, setRoomFiles] = useState([]);
  const [roomSaving, setRoomSaving] = useState(false);
  const [galleryForm, setGalleryForm] = useState(initialGalleryForm);
  const [galleryFile, setGalleryFile] = useState(null);
  const [gallerySaving, setGallerySaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAdminData() {
      if (!hasFirebaseEnv) {
        setLoading(false);
        setError("Firebase configure karo. .env file mein keys add karo.");
        return;
      }

      try {
        if (!active) return;
        setRooms(await getRooms());
        setBookings(await getBookings());
        setGalleryItems(await getGallery());
        setContacts(await getContacts());
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError.message || "Unable to load admin data.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAdminData();

    return () => {
      active = false;
    };
  }, []);

  const showNotice = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2500);
  };

  const handleLogout = async () => {
    await signOutUser();
    if (refreshAdmin) await refreshAdmin();
  };

  const handleRoomSubmit = async (event) => {
    event.preventDefault();
    setRoomSaving(true);
    setError("");

    try {
      const uploadedImages = await uploadFiles("room-images", roomFiles);
      const payload = {
        id: roomForm.id || undefined,
        name: roomForm.name,
        type: roomForm.type,
        description: roomForm.description,
        price_per_night: Number(roomForm.price_per_night),
        max_guests: Number(roomForm.max_guests),
        bed_type: roomForm.bed_type,
        amenities: roomForm.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        available: roomForm.available,
        images: [...(roomForm.images || []), ...uploadedImages],
      };

      await saveRoom(payload);
      setRooms(await getRooms());
      showNotice(roomForm.id ? "Room updated." : "Room added.");

      setRoomForm(initialRoomForm);
      setRoomFiles([]);
    } catch (saveError) {
      setError(saveError.message || "Unable to save room.");
    } finally {
      setRoomSaving(false);
    }
  };

  const handleEditRoom = (room) => {
    setActiveTab("rooms");
    setRoomForm({
      ...room,
      amenities: (room.amenities || []).join(", "),
    });
    setRoomFiles([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRoom = async (roomId) => {
    const confirmed = window.confirm("Delete this room?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteRoom(roomId);
      setRooms(await getRooms());
      showNotice("Room deleted.");
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete room.");
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      const updated = await updateBookingStatus(bookingId, status);
      setBookings((current) => current.map((b) => (b.id === updated.id ? updated : b)));
      showNotice(`Booking marked ${status}.`);
    } catch (updateError) {
      setError(updateError.message || "Unable to update booking.");
    }
  };

  const handleGallerySubmit = async (event) => {
    event.preventDefault();
    setGallerySaving(true);
    setError("");

    try {
      if (!galleryFile) {
        throw new Error("Choose an image to upload.");
      }

      const [url] = await uploadFiles("gallery-images", [galleryFile]);
      await saveGalleryItem({
        url,
        caption: galleryForm.caption,
        category: galleryForm.category,
      });
      setGalleryItems(await getGallery());
      setGalleryForm(initialGalleryForm);
      setGalleryFile(null);
      showNotice("Gallery image uploaded.");
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload image.");
    } finally {
      setGallerySaving(false);
    }
  };

  const handleDeleteGallery = async (itemId) => {
    const confirmed = window.confirm("Delete this gallery item?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteGalleryItem(itemId);
      setGalleryItems(await getGallery());
      showNotice("Gallery image deleted.");
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete gallery item.");
    }
  };

  if (loading) {
    return (
      <section className="admin-auth">
        <div className="admin-auth__panel shimmer" />
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="container">
        <div className="admin-hero reveal">
          <div>
            <p className="eyebrow">Protected dashboard</p>
            <h1>Welcome back, {adminState.profile?.full_name || adminState.user?.email}</h1>
            <p>Manage your rooms, bookings, gallery content, and guest messages from one place.</p>
          </div>
          <button className="button button--ghost" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="admin-metrics">
          <AdminMetric label="Rooms" value={rooms.length} />
          <AdminMetric label="Bookings" value={bookings.length} />
          <AdminMetric label="Gallery Items" value={galleryItems.length} />
          <AdminMetric label="Messages" value={contacts.length} />
        </div>

        {error ? <p className="form-message form-message--error">{error}</p> : null}
        {notice ? <p className="form-message form-message--success">{notice}</p> : null}

        <div className="admin-tabs">
          {["rooms", "bookings", "gallery", "contacts"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={activeTab === tab ? "filter-chip filter-chip--active" : "filter-chip"}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "rooms" ? (
          <AdminSection title="Manage Rooms" description="Create, update, and remove room listings.">
            <form className="admin-form" onSubmit={handleRoomSubmit}>
              <div className="admin-form__grid">
                <label className="field">
                  <span>Room name</span>
                  <input
                    value={roomForm.name}
                    onChange={(event) =>
                      setRoomForm((current) => ({ ...current, name: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span>Room type</span>
                  <select
                    value={roomForm.type}
                    onChange={(event) =>
                      setRoomForm((current) => ({ ...current, type: event.target.value }))
                    }
                  >
                    <option value="dorm">Dorm</option>
                    <option value="private">Private</option>
                    <option value="deluxe">Deluxe</option>
                  </select>
                </label>
                <label className="field">
                  <span>Price per night</span>
                  <input
                    type="number"
                    min="0"
                    value={roomForm.price_per_night}
                    onChange={(event) =>
                      setRoomForm((current) => ({
                        ...current,
                        price_per_night: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span>Max guests</span>
                  <input
                    type="number"
                    min="1"
                    value={roomForm.max_guests}
                    onChange={(event) =>
                      setRoomForm((current) => ({ ...current, max_guests: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span>Bed type</span>
                  <input
                    value={roomForm.bed_type}
                    onChange={(event) =>
                      setRoomForm((current) => ({ ...current, bed_type: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span>Availability</span>
                  <select
                    value={String(roomForm.available)}
                    onChange={(event) =>
                      setRoomForm((current) => ({
                        ...current,
                        available: event.target.value === "true",
                      }))
                    }
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Description</span>
                <textarea
                  rows="4"
                  value={roomForm.description}
                  onChange={(event) =>
                    setRoomForm((current) => ({ ...current, description: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="field">
                <span>Amenities (comma separated)</span>
                <input
                  value={roomForm.amenities}
                  onChange={(event) =>
                    setRoomForm((current) => ({ ...current, amenities: event.target.value }))
                  }
                  placeholder="WiFi, AC, Locker, Balcony"
                />
              </label>

              <label className="field">
                <span>Upload images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => setRoomFiles(Array.from(event.target.files || []))}
                />
              </label>

              {roomForm.images?.length ? (
                <div className="image-list">
                  {roomForm.images.map((image) => (
                    <img key={image} src={image} alt="Room preview" />
                  ))}
                </div>
              ) : null}

              <div className="admin-form__actions">
                <button className="button button--primary" type="submit" disabled={roomSaving}>
                  {roomSaving ? "Saving..." : roomForm.id ? "Update Room" : "Add Room"}
                </button>
                {roomForm.id ? (
                  <button
                    className="button button--ghost"
                    type="button"
                    onClick={() => {
                      setRoomForm(initialRoomForm);
                      setRoomFiles([]);
                    }}
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>

            <div className="admin-list">
              {rooms.map((room) => (
                <article key={room.id} className="admin-list__item">
                  <div>
                    <h3>{room.name}</h3>
                    <p>
                      {room.type} · {formatCurrency(room.price_per_night)} · {room.max_guests} guests
                    </p>
                  </div>
                  <div className="admin-list__actions">
                    <button className="button button--ghost button--small" type="button" onClick={() => handleEditRoom(room)}>
                      Edit
                    </button>
                    <button className="button button--ghost button--small" type="button" onClick={() => handleDeleteRoom(room.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </AdminSection>
        ) : null}

        {activeTab === "bookings" ? (
          <AdminSection title="Bookings" description="Review reservations and update their status.">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <strong>{booking.guest_name}</strong>
                        <span>{booking.email}</span>
                      </td>
                      <td>{booking.rooms?.name || "Unknown room"}</td>
                      <td>
                        {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                      </td>
                      <td>{formatCurrency(booking.total_price)}</td>
                      <td>{booking.status}</td>
                      <td>
                        <select
                          value={booking.status}
                          onChange={(event) => handleBookingStatus(booking.id, event.target.value)}
                        >
                          {bookingStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminSection>
        ) : null}

        {activeTab === "gallery" ? (
          <AdminSection title="Gallery" description="Upload or remove visual content.">
            <form className="admin-form" onSubmit={handleGallerySubmit}>
              <div className="admin-form__grid">
                <label className="field">
                  <span>Caption</span>
                  <input
                    value={galleryForm.caption}
                    onChange={(event) =>
                      setGalleryForm((current) => ({ ...current, caption: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Category</span>
                  <select
                    value={galleryForm.category}
                    onChange={(event) =>
                      setGalleryForm((current) => ({ ...current, category: event.target.value }))
                    }
                  >
                    {galleryCategoryOptions
                      .filter((option) => option.value !== "all")
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="field">
                  <span>Image file</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setGalleryFile(event.target.files?.[0] || null)}
                    required
                  />
                </label>
              </div>

              <button className="button button--primary" type="submit" disabled={gallerySaving}>
                {gallerySaving ? "Uploading..." : "Upload to Gallery"}
              </button>
            </form>

            <div className="admin-gallery">
              {galleryItems.map((item) => (
                <article key={item.id} className="admin-gallery__item">
                  <img src={item.url} alt={item.caption || "Gallery"} />
                  <div>
                    <strong>{item.caption || "Untitled image"}</strong>
                    <span>{item.category}</span>
                  </div>
                  <button className="button button--ghost button--small" type="button" onClick={() => handleDeleteGallery(item.id)}>
                    Delete
                  </button>
                </article>
              ))}
            </div>
          </AdminSection>
        ) : null}

        {activeTab === "contacts" ? (
          <AdminSection title="Contact Messages" description="Read guest messages sent from the website.">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td>{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>{contact.message}</td>
                      <td>{formatDate(contact.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminSection>
        ) : null}
      </div>
    </section>
  );
}
