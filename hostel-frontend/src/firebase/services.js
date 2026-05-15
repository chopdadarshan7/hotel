import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, googleProvider, hasFirebaseEnv, storage } from "./config";

function requireFirebase() {
  if (!hasFirebaseEnv) {
    throw new Error("Firebase configure nahi hai. .env file mein keys add karo.");
  }
}

const col = (name) => collection(db, name);

// ─── AUTH ───────────────────────────────────────────────────

export async function signUpWithEmail(email, password, displayName) {
  requireFirebase();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  await setDoc(doc(db, "profiles", cred.user.uid), {
    full_name: displayName || email.split("@")[0],
    email: email.toLowerCase(),
    role: "guest",
    created_at: serverTimestamp(),
  });
  return cred.user;
}

export async function signInWithEmail(email, password) {
  requireFirebase();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithGoogle() {
  requireFirebase();
  const cred = await signInWithPopup(auth, googleProvider);
  const name =
    cred.user.displayName
    || cred.user.email?.split("@")[0]
    || "User";

  await setDoc(
    doc(db, "profiles", cred.user.uid),
    {
      full_name: name,
      email: cred.user.email?.toLowerCase(),
      avatar_url: cred.user.photoURL || null,
      role: "guest",
    },
    { merge: true },
  );
  return cred.user;
}

export async function signOutUser() {
  requireFirebase();
  await signOut(auth);
}

export async function fetchUserProfile(uid) {
  requireFirebase();
  const snap = await getDoc(doc(db, "profiles", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ─── ROOMS ──────────────────────────────────────────────────

export async function getRooms() {
  requireFirebase();
  const snap = await getDocs(query(col("rooms"), orderBy("price_per_night", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveRoom(room) {
  requireFirebase();
  const payload = {
    name: room.name,
    type: room.type,
    description: room.description,
    price_per_night: Number(room.price_per_night),
    max_guests: Number(room.max_guests),
    bed_type: room.bed_type,
    amenities: room.amenities || [],
    available: room.available ?? true,
    images: room.images || [],
    updated_at: serverTimestamp(),
  };

  if (room.id) {
    await updateDoc(doc(db, "rooms", room.id), payload);
    return { id: room.id, ...payload };
  }

  const refDoc = await addDoc(col("rooms"), {
    ...payload,
    created_at: serverTimestamp(),
  });
  return { id: refDoc.id, ...payload };
}

export async function deleteRoom(roomId) {
  requireFirebase();
  await deleteDoc(doc(db, "rooms", roomId));
}

// ─── GALLERY ────────────────────────────────────────────────

export async function getGallery() {
  requireFirebase();
  const snap = await getDocs(query(col("gallery"), orderBy("created_at", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveGalleryItem(item) {
  requireFirebase();
  const refDoc = await addDoc(col("gallery"), {
    url: item.url,
    caption: item.caption,
    category: item.category,
    created_at: serverTimestamp(),
  });
  return { id: refDoc.id, ...item };
}

export async function deleteGalleryItem(itemId) {
  requireFirebase();
  await deleteDoc(doc(db, "gallery", itemId));
}

// ─── BOOKINGS ───────────────────────────────────────────────

export async function getBookings() {
  requireFirebase();
  const snap = await getDocs(query(col("bookings"), orderBy("created_at", "desc")));
  const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const roomIds = [...new Set(bookings.map((b) => b.room_id).filter(Boolean))];
  const roomMap = {};
  await Promise.all(
    roomIds.map(async (id) => {
      const r = await getDoc(doc(db, "rooms", id));
      if (r.exists()) roomMap[id] = r.data().name;
    }),
  );

  return bookings.map((b) => ({
    ...b,
    rooms: { name: roomMap[b.room_id] || "Room" },
  }));
}

export async function getBookingsForUser({ userId, email }) {
  requireFirebase();
  const all = await getBookings();
  return all.filter(
    (b) => b.user_id === userId || b.email?.toLowerCase() === email?.toLowerCase(),
  );
}

export async function checkRoomAvailability({ roomId, checkIn, checkOut }) {
  requireFirebase();
  const snap = await getDocs(query(col("bookings"), where("room_id", "==", roomId)));
  return !snap.docs.some((d) => {
    const b = d.data();
    if (b.status === "cancelled") return false;
    return b.check_in < checkOut && b.check_out > checkIn;
  });
}

export async function createBooking(payload, roomName) {
  requireFirebase();
  const refDoc = await addDoc(col("bookings"), {
    ...payload,
    room_name: roomName,
    status: payload.status || "pending",
    created_at: serverTimestamp(),
  });
  return { id: refDoc.id, ...payload, rooms: { name: roomName } };
}

export async function updateBookingStatus(bookingId, status) {
  requireFirebase();
  await updateDoc(doc(db, "bookings", bookingId), { status });
  const snap = await getDoc(doc(db, "bookings", bookingId));
  const data = snap.data();
  let roomName = data?.room_name || "Room";
  if (data?.room_id) {
    const r = await getDoc(doc(db, "rooms", data.room_id));
    if (r.exists()) roomName = r.data().name;
  }
  return { id: bookingId, ...data, status, rooms: { name: roomName } };
}

// ─── CONTACTS ───────────────────────────────────────────────

export async function getContacts() {
  requireFirebase();
  const snap = await getDocs(query(col("contacts"), orderBy("created_at", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveContact(contact) {
  requireFirebase();
  const refDoc = await addDoc(col("contacts"), {
    ...contact,
    created_at: serverTimestamp(),
  });
  return { id: refDoc.id, ...contact };
}

// ─── STORAGE ────────────────────────────────────────────────

export async function uploadFiles(folder, files) {
  requireFirebase();
  if (!files?.length) return [];

  const urls = [];
  for (const file of files) {
    const path = `${folder}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    urls.push(await getDownloadURL(storageRef));
  }
  return urls;
}
