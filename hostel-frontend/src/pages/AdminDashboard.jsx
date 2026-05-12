import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "../utils/formatDate";
import { bookingStatusOptions, galleryCategoryOptions } from "../lib/siteData";
import { hasSupabaseEnv, requireSupabase } from "../lib/supabase";

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

async function uploadFilesToBucket(bucket, files) {
  if (!files?.length) {
    return [];
  }

  const supabase = await requireSupabase();
  const uploaded = [];

  for (const file of files) {
    const extension = file.name.split(".").pop();
    const path = `${bucket}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
    });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    uploaded.push(data.publicUrl);
  }

  return uploaded;
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
      if (!hasSupabaseEnv) {
        setLoading(false);
        setError("Supabase is not configured yet. Add your environment keys to enable the dashboard.");
        return;
      }

      try {
        const supabase = await requireSupabase();
        const [roomsResult, bookingsResult, galleryResult, contactsResult] = await Promise.all([
          supabase.from("rooms").select("*").order("created_at", { ascending: false }),
          supabase
            .from("bookings")
            .select("*, rooms(name)")
            .order("created_at", { ascending: false }),
          supabase.from("gallery").select("*").order("created_at", { ascending: false }),
          supabase.from("contacts").select("*").order("created_at", { ascending: false }),
        ]);

        const firstError = [
          roomsResult.error,
          bookingsResult.error,
          galleryResult.error,
          contactsResult.error,
        ].find(Boolean);

        if (firstError) {
          throw firstError;
        }

        if (!active) {
          return;
        }

        setRooms(roomsResult.data || []);
        setBookings(bookingsResult.data || []);
        setGalleryItems(galleryResult.data || []);
        setContacts(contactsResult.data || []);
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
    const supabase = await requireSupabase();
    await supabase.auth.signOut();
    if (refreshAdmin) {
      await refreshAdmin();
    }
  };

  const handleRoomSubmit = async (event) => {
    event.preventDefault();
    setRoomSaving(true);
    setError("");

    try {
      const supabase = await requireSupabase();
      const uploadedImages = await uploadFilesToBucket("room-images", roomFiles);
      const payload = {
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
        images: [...roomForm.images, ...uploadedImages],
      };

      if (roomForm.id) {
        const { data, error: updateError } = await supabase
          .from("rooms")
          .update(payload)
          .eq("id", roomForm.id)
          .select("*")
          .single();

        if (updateError) {
          throw updateError;
        }

        setRooms((current) => current.map((room) => (room.id === data.id ? data : room)));
        showNotice("Room updated.");
      } else {
        const { data, error: insertError } = await supabase
          .from("rooms")
          .insert(payload)
          .select("*")
          .single();

        if (insertError) {
          throw insertError;
        }

        setRooms((current) => [data, ...current]);
        showNotice("Room added.");
      }

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
      const supabase = await requireSupabase();
      const { error: deleteError } = await supabase.from("rooms").delete().eq("id", roomId);

      if (deleteError) {
        throw deleteError;
      }

      setRooms((current) => current.filter((room) => room.id !== roomId));
      showNotice("Room deleted.");
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete room.");
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      const supabase = await requireSupabase();
      const { data, error: updateError } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId)
        .select("*, rooms(name)")
        .single();

      if (updateError) {
        throw updateError;
      }

      setBookings((current) => current.map((booking) => (booking.id === data.id ? data : booking)));
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

      const supabase = await requireSupabase();
      const [url] = await uploadFilesToBucket("gallery-images", [galleryFile]);

      const { data, error: insertError } = await supabase
        .from("gallery")
        .insert({
          url,
          caption: galleryForm.caption,
          category: galleryForm.category,
        })
        .select("*")
        .single();

      if (insertError) {
        throw insertError;
      }

      setGalleryItems((current) => [data, ...current]);
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
      const supabase = await requireSupabase();
      const { error: deleteError } = await supabase.from("gallery").delete().eq("id", itemId);

      if (deleteError) {
        throw deleteError;
      }

      setGalleryItems((current) => current.filter((item) => item.id !== itemId));
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
          <AdminSection title="Gallery" description="Upload or remove visual content from Supabase Storage.">
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
