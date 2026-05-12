// ============================================================
//  firebase/services.js  —  All DB operations (CRUD)
//  Import these functions in any React page/component
// ============================================================
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy, serverTimestamp,
  onSnapshot, Timestamp,
} from "firebase/firestore";
import { db } from "./config";

// ──────────────────────────────────────────────
// HELPER
// ──────────────────────────────────────────────
const col = (name) => collection(db, name);
const timestamp = () => serverTimestamp();

// ──────────────────────────────────────────────
// STUDENTS
// ──────────────────────────────────────────────
export const addStudent = (data) =>
  addDoc(col("users"), { ...data, role: "student", createdAt: timestamp() });

export const getAllStudents = async () => {
  const snap = await getDocs(query(col("users"), where("role", "==", "student")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getStudent = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateStudent = (id, data) =>
  updateDoc(doc(db, "users", id), { ...data, updatedAt: timestamp() });

export const deleteStudent = (id) => deleteDoc(doc(db, "users", id));

// ──────────────────────────────────────────────
// ROOMS
// ──────────────────────────────────────────────
export const addRoom = (data) =>
  addDoc(col("rooms"), { ...data, status: "vacant", createdAt: timestamp() });

export const getAllRooms = async () => {
  const snap = await getDocs(col("rooms"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const allotRoom = (roomId, studentId, studentName) =>
  updateDoc(doc(db, "rooms", roomId), {
    status: "occupied",
    occupantId: studentId,
    occupantName: studentName,
    allottedAt: timestamp(),
  });

export const vacateRoom = (roomId) =>
  updateDoc(doc(db, "rooms", roomId), {
    status: "vacant",
    occupantId: null,
    occupantName: null,
    vacatedAt: timestamp(),
  });

// ──────────────────────────────────────────────
// FEES
// ──────────────────────────────────────────────
export const recordFeePayment = (data) =>
  addDoc(col("fees"), { ...data, paidAt: timestamp() });

export const getStudentFees = async (studentId) => {
  const snap = await getDocs(
    query(col("fees"), where("studentId", "==", studentId), orderBy("paidAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllFees = async () => {
  const snap = await getDocs(query(col("fees"), orderBy("paidAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateFeeStatus = (feeId, status) =>
  updateDoc(doc(db, "fees", feeId), { status, updatedAt: timestamp() });

// ──────────────────────────────────────────────
// LEAVE APPLICATIONS
// ──────────────────────────────────────────────
export const applyLeave = (data) =>
  addDoc(col("leaves"), {
    ...data,
    status: "pending",    // pending | approved | rejected
    appliedAt: timestamp(),
  });

export const getAllLeaves = async () => {
  const snap = await getDocs(query(col("leaves"), orderBy("appliedAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getMyLeaves = async (studentId) => {
  const snap = await getDocs(
    query(col("leaves"), where("studentId", "==", studentId), orderBy("appliedAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateLeaveStatus = (leaveId, status, adminRemark = "") =>
  updateDoc(doc(db, "leaves", leaveId), { status, adminRemark, reviewedAt: timestamp() });

// ──────────────────────────────────────────────
// VISITOR LOG
// ──────────────────────────────────────────────
export const addVisitor = (data) =>
  addDoc(col("visitors"), {
    ...data,
    checkInTime: timestamp(),
    checkOutTime: null,
    status: "inside",    // inside | left
  });

export const checkoutVisitor = (visitorId) =>
  updateDoc(doc(db, "visitors", visitorId), {
    checkOutTime: timestamp(),
    status: "left",
  });

export const getAllVisitors = async () => {
  const snap = await getDocs(query(col("visitors"), orderBy("checkInTime", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getVisitorsByStudent = async (studentId) => {
  const snap = await getDocs(
    query(col("visitors"), where("hostStudentId", "==", studentId), orderBy("checkInTime", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ──────────────────────────────────────────────
// COMPLAINTS
// ──────────────────────────────────────────────
export const submitComplaint = (data) =>
  addDoc(col("complaints"), {
    ...data,
    status: "open",      // open | in-progress | resolved
    submittedAt: timestamp(),
  });

export const getAllComplaints = async () => {
  const snap = await getDocs(query(col("complaints"), orderBy("submittedAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateComplaintStatus = (id, status, resolution = "") =>
  updateDoc(doc(db, "complaints", id), { status, resolution, updatedAt: timestamp() });

// Real-time listener for admin
export const listenComplaints = (callback) =>
  onSnapshot(query(col("complaints"), orderBy("submittedAt", "desc")), (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

// ──────────────────────────────────────────────
// NOTICES
// ──────────────────────────────────────────────
export const publishNotice = (data) =>
  addDoc(col("notices"), { ...data, postedAt: timestamp() });

export const getAllNotices = async () => {
  const snap = await getDocs(query(col("notices"), orderBy("postedAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteNotice = (id) => deleteDoc(doc(db, "notices", id));
