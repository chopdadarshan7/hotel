// ============================================================
//  App.jsx  —  Main React Application
//  Includes: Login, Admin Dashboard, Student Portal
//  All new features: Leave Apply, Visitor Log, Complaints
// ============================================================
import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/config";
import {
  getAllStudents, addStudent, deleteStudent,
  getAllRooms, addRoom, allotRoom, vacateRoom,
  getAllFees, recordFeePayment, updateFeeStatus,
  applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus,
  addVisitor, checkoutVisitor, getAllVisitors,
  submitComplaint, getAllComplaints, updateComplaintStatus, listenComplaints,
  publishNotice, getAllNotices, deleteNotice,
} from "./firebase/services";

// ── Utility ─────────────────────────────────────────────────
const fmt = (ts) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const Badge = ({ text, color }) => {
  const colors = {
    green:  { bg: "#eaf3de", txt: "#27500a" },
    red:    { bg: "#fcebeb", txt: "#791f1f" },
    amber:  { bg: "#faeeda", txt: "#633806" },
    blue:   { bg: "#e6f1fb", txt: "#0c447c" },
    gray:   { bg: "#f1efe8", txt: "#444441" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      background: c.bg, color: c.txt,
      fontSize: 11, padding: "2px 10px", borderRadius: 5, fontWeight: 500,
    }}>
      {text}
    </span>
  );
};

const statusBadge = (status) => {
  const map = {
    paid: ["Paid", "green"], due: ["Due", "amber"], overdue: ["Overdue", "red"],
    open: ["Open", "red"], "in-progress": ["In Progress", "amber"], resolved: ["Resolved", "green"],
    pending: ["Pending", "amber"], approved: ["Approved", "green"], rejected: ["Rejected", "red"],
    inside: ["Inside", "blue"], left: ["Left", "gray"],
    occupied: ["Occupied", "red"], vacant: ["Vacant", "green"],
  };
  const [label, color] = map[status] || [status, "gray"];
  return <Badge text={label} color={color} />;
};

// ── Shared Styles ────────────────────────────────────────────
const S = {
  card: {
    background: "#fff", border: "0.5px solid #e5e3dc",
    borderRadius: 12, padding: "16px 20px", marginBottom: 14,
  },
  input: {
    width: "100%", border: "0.5px solid #d3d1c7", borderRadius: 8,
    padding: "9px 12px", fontSize: 13, marginBottom: 10,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  },
  btn: {
    background: "#c8973a", color: "#0a1628", border: "none",
    padding: "9px 20px", borderRadius: 8, fontSize: 13,
    fontWeight: 500, cursor: "pointer", marginRight: 8,
  },
  btnSm: {
    background: "#f1efe8", color: "#2c2c2a", border: "0.5px solid #d3d1c7",
    padding: "5px 12px", borderRadius: 6, fontSize: 12,
    cursor: "pointer", marginRight: 6,
  },
  btnDanger: {
    background: "#fcebeb", color: "#791f1f", border: "0.5px solid #f7c1c1",
    padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
  },
  th: { fontSize: 12, color: "#888780", fontWeight: 500, textAlign: "left", padding: "6px 10px" },
  td: { fontSize: 13, padding: "8px 10px", borderTop: "0.5px solid #f1efe8" },
  sectionTitle: { fontSize: 15, fontWeight: 500, marginBottom: 12, color: "#0a1628" },
  label: { fontSize: 12, color: "#5f5e5a", display: "block", marginBottom: 4 },
};

// ── LOGIN PAGE ───────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return setError("Email aur password dono bharo");
    setLoading(true); setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const role = snap.exists() ? snap.data().role : "student";
      onLogin({ uid: cred.user.uid, email, role, ...snap.data() });
    } catch (e) {
      setError("Login failed: " + e.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true); setError("");
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const role = snap.exists() ? snap.data().role : "student";
      onLogin({ uid: cred.user.uid, email: cred.user.email, role, ...snap.data() });
    } catch (e) {
      setError("Google login failed: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 36, width: 360, boxShadow: "0 0 40px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, background: "#c8973a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 22, color: "#0a1628" }}>🏨</div>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: "#0a1628", margin: 0 }}>Shri Nivas Hostel</h2>
          <p style={{ fontSize: 13, color: "#888780", margin: "4px 0 0" }}>Management System</p>
        </div>
        {error && <div style={{ background: "#fcebeb", color: "#791f1f", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <label style={S.label}>Email</label>
        <input style={S.input} type="email" placeholder="admin@hostel.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label style={S.label}>Password</label>
        <input style={S.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        <button style={{ ...S.btn, width: "100%", marginTop: 6 }} onClick={handleLogin} disabled={loading}>
          {loading ? "Login ho raha hai..." : "Login Karo"}
        </button>
        <div style={{ display: "flex", alignItems: "center", margin: "14px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#e5e3dc" }} />
          <span style={{ fontSize: 12, color: "#b4b2a9", margin: "0 10px" }}>ya</span>
          <div style={{ flex: 1, height: 1, background: "#e5e3dc" }} />
        </div>
        <button
          style={{ width: "100%", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "0.5px solid #d3d1c7", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={18} height={18} alt="Google" />
          Google se Login Karo
        </button>
        <p style={{ fontSize: 11, color: "#b4b2a9", textAlign: "center", marginTop: 16 }}>
          Admin / Student — apna account use karo
        </p>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ──────────────────────────────────────────
function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [fees, setFees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Load all data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllStudents(), getAllRooms(), getAllFees(),
      getAllLeaves(), getAllVisitors(), getAllComplaints(), getAllNotices(),
    ]).then(([s, r, f, l, v, c, n]) => {
      setStudents(s); setRooms(r); setFees(f);
      setLeaves(l); setVisitors(v); setComplaints(c); setNotices(n);
      setLoading(false);
    });
    // Real-time complaints
    const unsub = listenComplaints(setComplaints);
    return () => unsub();
  }, []);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "students", label: "Students" },
    { id: "rooms", label: "Rooms" },
    { id: "fees", label: "Fees" },
    { id: "leaves", label: "Leave Apps" },
    { id: "visitors", label: "Visitor Log" },
    { id: "complaints", label: "Complaints" },
    { id: "notices", label: "Notices" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, background: "#0a1628", color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13, zIndex: 999 }}>
          {toast}
        </div>
      )}
      {/* Navbar */}
      <div style={{ background: "#0a1628", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#c8973a", fontSize: 18 }}>🏨</span>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>Admin Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>{user.email}</span>
          <button style={S.btnSm} onClick={onLogout}>Logout</button>
        </div>
      </div>
      {/* Tab Bar */}
      <div style={{ background: "#fff", borderBottom: "0.5px solid #e5e3dc", padding: "0 24px", display: "flex", gap: 2, overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "12px 16px", background: "none", border: "none",
            borderBottom: tab === t.id ? "2px solid #c8973a" : "2px solid transparent",
            color: tab === t.id ? "#c8973a" : "#888780",
            fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }}>
        {loading && <p style={{ color: "#888780", fontSize: 13 }}>Data load ho raha hai...</p>}

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
              {[
                ["Total Students", students.length, "👤"],
                ["Total Rooms", rooms.length, "🚪"],
                ["Occupied", rooms.filter(r => r.status === "occupied").length, "🔴"],
                ["Vacant", rooms.filter(r => r.status === "vacant").length, "🟢"],
                ["Pending Leaves", leaves.filter(l => l.status === "pending").length, "📋"],
                ["Open Complaints", complaints.filter(c => c.status === "open").length, "⚠️"],
                ["Visitors Today", visitors.filter(v => v.status === "inside").length, "🚶"],
              ].map(([label, val, icon]) => (
                <div key={label} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "0.5px solid #e5e3dc" }}>
                  <div style={{ fontSize: 22 }}>{icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 500, color: "#0a1628", margin: "4px 0" }}>{val}</div>
                  <div style={{ fontSize: 12, color: "#888780" }}>{label}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#888780" }}>Tab par click karo specific section dekhne ke liye.</p>
          </div>
        )}

        {/* STUDENTS */}
        {tab === "students" && <StudentsTab students={students} setStudents={setStudents} showToast={showToast} />}

        {/* ROOMS */}
        {tab === "rooms" && <RoomsTab rooms={rooms} setRooms={setRooms} students={students} showToast={showToast} />}

        {/* FEES */}
        {tab === "fees" && <FeesTab fees={fees} setFees={setFees} students={students} showToast={showToast} />}

        {/* LEAVE APPLICATIONS */}
        {tab === "leaves" && <AdminLeavesTab leaves={leaves} setLeaves={setLeaves} showToast={showToast} />}

        {/* VISITOR LOG */}
        {tab === "visitors" && <AdminVisitorTab visitors={visitors} setVisitors={setVisitors} showToast={showToast} />}

        {/* COMPLAINTS */}
        {tab === "complaints" && <AdminComplaintsTab complaints={complaints} showToast={showToast} />}

        {/* NOTICES */}
        {tab === "notices" && <NoticesTab notices={notices} setNotices={setNotices} showToast={showToast} />}
      </div>
    </div>
  );
}

// ── STUDENTS TAB ─────────────────────────────────────────────
function StudentsTab({ students, setStudents, showToast }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", course: "", year: "" });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form.name || !form.email) return showToast("Naam aur email zaroori hai");
    setAdding(true);
    try {
      const ref = await addStudent(form);
      setStudents(prev => [{ id: ref.id, ...form, role: "student" }, ...prev]);
      setForm({ name: "", email: "", phone: "", course: "", year: "" });
      showToast("Student add ho gaya ✓");
    } catch { showToast("Error aaya, dobara try karo"); }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Is student ko delete karna hai?")) return;
    await deleteStudent(id);
    setStudents(prev => prev.filter(s => s.id !== id));
    showToast("Student delete ho gaya");
  };

  return (
    <div>
      <div style={S.card}>
        <div style={S.sectionTitle}>Naya Student Add Karo</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["Naam", "name", "text"], ["Email", "email", "email"], ["Phone", "phone", "tel"], ["Course", "course", "text"], ["Year", "year", "text"]].map(([label, key, type]) => (
            <div key={key}>
              <label style={S.label}>{label}</label>
              <input style={S.input} type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <button style={S.btn} onClick={handleAdd} disabled={adding}>{adding ? "Add ho raha hai..." : "Add Karo"}</button>
      </div>
      <div style={S.card}>
        <div style={S.sectionTitle}>Sab Students ({students.length})</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Naam", "Email", "Phone", "Course", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td style={S.td}>{s.name}</td>
                <td style={S.td}>{s.email}</td>
                <td style={S.td}>{s.phone || "—"}</td>
                <td style={S.td}>{s.course || "—"}</td>
                <td style={S.td}><button style={S.btnDanger} onClick={() => handleDelete(s.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── ROOMS TAB ────────────────────────────────────────────────
function RoomsTab({ rooms, setRooms, students, showToast }) {
  const [form, setForm] = useState({ roomNumber: "", type: "Single", floor: "", price: "" });

  const handleAdd = async () => {
    if (!form.roomNumber) return showToast("Room number daalo");
    const ref = await addRoom(form);
    setRooms(prev => [{ id: ref.id, ...form, status: "vacant" }, ...prev]);
    setForm({ roomNumber: "", type: "Single", floor: "", price: "" });
    showToast("Room add ho gaya ✓");
  };

  const handleAllot = async (roomId) => {
    const studentId = prompt("Student ID daalo (Firestore doc ID):");
    const studentName = prompt("Student ka naam daalo:");
    if (!studentId || !studentName) return;
    await allotRoom(roomId, studentId, studentName);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: "occupied", occupantName: studentName } : r));
    showToast("Room allot ho gaya ✓");
  };

  const handleVacate = async (roomId) => {
    if (!window.confirm("Room vacate karna hai?")) return;
    await vacateRoom(roomId);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: "vacant", occupantName: null } : r));
    showToast("Room vacate ho gaya");
  };

  return (
    <div>
      <div style={S.card}>
        <div style={S.sectionTitle}>Naya Room Add Karo</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
          <div><label style={S.label}>Room No.</label><input style={S.input} value={form.roomNumber} onChange={e => setForm(p => ({ ...p, roomNumber: e.target.value }))} /></div>
          <div><label style={S.label}>Type</label>
            <select style={S.input} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {["Single", "Double", "Dormitory", "Deluxe AC"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label style={S.label}>Floor</label><input style={S.input} value={form.floor} onChange={e => setForm(p => ({ ...p, floor: e.target.value }))} /></div>
          <div><label style={S.label}>Price (₹/month)</label><input style={S.input} type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} /></div>
        </div>
        <button style={S.btn} onClick={handleAdd}>Add Room</button>
      </div>
      <div style={S.card}>
        <div style={S.sectionTitle}>Sabhi Rooms ({rooms.length})</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Room No.", "Type", "Floor", "Price", "Status", "Occupant", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {rooms.map(r => (
              <tr key={r.id}>
                <td style={S.td}>{r.roomNumber}</td>
                <td style={S.td}>{r.type}</td>
                <td style={S.td}>{r.floor || "—"}</td>
                <td style={S.td}>₹{r.price || "—"}</td>
                <td style={S.td}>{statusBadge(r.status)}</td>
                <td style={S.td}>{r.occupantName || "—"}</td>
                <td style={S.td}>
                  {r.status === "vacant"
                    ? <button style={S.btnSm} onClick={() => handleAllot(r.id)}>Allot</button>
                    : <button style={S.btnDanger} onClick={() => handleVacate(r.id)}>Vacate</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── FEES TAB ─────────────────────────────────────────────────
function FeesTab({ fees, setFees, students, showToast }) {
  const [form, setForm] = useState({ studentId: "", studentName: "", month: "", amount: "", status: "paid" });

  const handleRecord = async () => {
    if (!form.studentId || !form.amount) return showToast("Student ID aur amount zaroori hai");
    const ref = await recordFeePayment(form);
    setFees(prev => [{ id: ref.id, ...form }, ...prev]);
    setForm({ studentId: "", studentName: "", month: "", amount: "", status: "paid" });
    showToast("Fee record ho gayi ✓");
  };

  return (
    <div>
      <div style={S.card}>
        <div style={S.sectionTitle}>Fee Record Karo</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10 }}>
          <div><label style={S.label}>Student ID</label><input style={S.input} value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))} /></div>
          <div><label style={S.label}>Naam</label><input style={S.input} value={form.studentName} onChange={e => setForm(p => ({ ...p, studentName: e.target.value }))} /></div>
          <div><label style={S.label}>Month</label><input style={S.input} type="month" value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} /></div>
          <div><label style={S.label}>Amount (₹)</label><input style={S.input} type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
          <div><label style={S.label}>Status</label>
            <select style={S.input} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {["paid", "due", "overdue"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <button style={S.btn} onClick={handleRecord}>Record Karo</button>
      </div>
      <div style={S.card}>
        <div style={S.sectionTitle}>Fee Records ({fees.length})</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Student", "Month", "Amount", "Status", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {fees.map(f => (
              <tr key={f.id}>
                <td style={S.td}>{f.studentName}</td>
                <td style={S.td}>{f.month}</td>
                <td style={S.td}>₹{f.amount}</td>
                <td style={S.td}>{statusBadge(f.status)}</td>
                <td style={S.td}>
                  <button style={S.btnSm} onClick={async () => { await updateFeeStatus(f.id, "paid"); setFees(p => p.map(x => x.id === f.id ? { ...x, status: "paid" } : x)); showToast("Status update hua ✓"); }}>Mark Paid</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── ADMIN LEAVES TAB ─────────────────────────────────────────
function AdminLeavesTab({ leaves, setLeaves, showToast }) {
  const handleAction = async (id, status) => {
    const remark = status === "rejected" ? prompt("Rejection reason batao:") || "" : "";
    await updateLeaveStatus(id, status, remark);
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status, adminRemark: remark } : l));
    showToast(`Leave ${status} kar di ✓`);
  };

  return (
    <div style={S.card}>
      <div style={S.sectionTitle}>Leave Applications ({leaves.length})</div>
      {leaves.length === 0 && <p style={{ color: "#888780", fontSize: 13 }}>Koi leave application nahi hai</p>}
      {leaves.map(l => (
        <div key={l.id} style={{ padding: "12px 0", borderBottom: "0.5px solid #f1efe8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{l.studentName}</span>
              <span style={{ fontSize: 12, color: "#888780", marginLeft: 8 }}>Room {l.roomNumber}</span>
            </div>
            {statusBadge(l.status)}
          </div>
          <p style={{ fontSize: 13, color: "#5f5e5a", marginBottom: 6 }}>
            <strong>Tarikh:</strong> {l.fromDate} → {l.toDate} &nbsp;|&nbsp; <strong>Reason:</strong> {l.reason}
          </p>
          {l.adminRemark && <p style={{ fontSize: 12, color: "#a32d2d" }}>Remark: {l.adminRemark}</p>}
          {l.status === "pending" && (
            <div style={{ marginTop: 8 }}>
              <button style={S.btn} onClick={() => handleAction(l.id, "approved")}>Approve</button>
              <button style={S.btnDanger} onClick={() => handleAction(l.id, "rejected")}>Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── ADMIN VISITOR TAB ────────────────────────────────────────
function AdminVisitorTab({ visitors, setVisitors, showToast }) {
  const [form, setForm] = useState({ visitorName: "", visitorPhone: "", hostStudentId: "", hostStudentName: "", purpose: "", roomNumber: "" });

  const handleCheckin = async () => {
    if (!form.visitorName || !form.hostStudentName) return showToast("Visitor naam aur host naam daalo");
    const ref = await addVisitor(form);
    setVisitors(prev => [{ id: ref.id, ...form, status: "inside" }, ...prev]);
    setForm({ visitorName: "", visitorPhone: "", hostStudentId: "", hostStudentName: "", purpose: "", roomNumber: "" });
    showToast("Visitor check-in ho gaya ✓");
  };

  const handleCheckout = async (id) => {
    await checkoutVisitor(id);
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: "left" } : v));
    showToast("Visitor check-out ho gaya");
  };

  return (
    <div>
      <div style={S.card}>
        <div style={S.sectionTitle}>Naya Visitor Check-In</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[["Visitor Naam", "visitorName"], ["Visitor Phone", "visitorPhone"], ["Host Student Naam", "hostStudentName"], ["Room Number", "roomNumber"], ["Purpose", "purpose"]].map(([label, key]) => (
            <div key={key}>
              <label style={S.label}>{label}</label>
              <input style={S.input} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <button style={S.btn} onClick={handleCheckin}>Check-In Karo</button>
      </div>
      <div style={S.card}>
        <div style={S.sectionTitle}>Visitor Log ({visitors.length})</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Visitor", "Phone", "Host", "Room", "Purpose", "Status", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {visitors.map(v => (
              <tr key={v.id}>
                <td style={S.td}>{v.visitorName}</td>
                <td style={S.td}>{v.visitorPhone || "—"}</td>
                <td style={S.td}>{v.hostStudentName}</td>
                <td style={S.td}>{v.roomNumber || "—"}</td>
                <td style={S.td}>{v.purpose || "—"}</td>
                <td style={S.td}>{statusBadge(v.status)}</td>
                <td style={S.td}>
                  {v.status === "inside" && <button style={S.btnSm} onClick={() => handleCheckout(v.id)}>Check-Out</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── ADMIN COMPLAINTS TAB ─────────────────────────────────────
function AdminComplaintsTab({ complaints, showToast }) {
  const [localComplaints, setLocal] = useState(complaints);
  useEffect(() => setLocal(complaints), [complaints]);

  const handleUpdate = async (id, status) => {
    const resolution = status === "resolved" ? prompt("Resolution batao:") || "" : "";
    await updateComplaintStatus(id, status, resolution);
    setLocal(prev => prev.map(c => c.id === id ? { ...c, status, resolution } : c));
    showToast(`Complaint ${status} ho gayi ✓`);
  };

  return (
    <div style={S.card}>
      <div style={S.sectionTitle}>Complaints ({localComplaints.length}) — Real-time updates</div>
      {localComplaints.length === 0 && <p style={{ color: "#888780", fontSize: 13 }}>Koi complaint nahi hai</p>}
      {localComplaints.map(c => (
        <div key={c.id} style={{ padding: "12px 0", borderBottom: "0.5px solid #f1efe8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{c.studentName} — Room {c.roomNumber}</span>
            {statusBadge(c.status)}
          </div>
          <p style={{ fontSize: 13, color: "#5f5e5a", marginBottom: 6 }}>{c.description}</p>
          {c.resolution && <p style={{ fontSize: 12, color: "#27500a" }}>Resolution: {c.resolution}</p>}
          <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
            {c.status === "open" && <button style={S.btnSm} onClick={() => handleUpdate(c.id, "in-progress")}>In Progress</button>}
            {c.status !== "resolved" && <button style={{ ...S.btnSm, background: "#eaf3de", color: "#27500a" }} onClick={() => handleUpdate(c.id, "resolved")}>Resolve</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── NOTICES TAB ──────────────────────────────────────────────
function NoticesTab({ notices, setNotices, showToast }) {
  const [form, setForm] = useState({ title: "", body: "" });

  const handlePublish = async () => {
    if (!form.title || !form.body) return showToast("Title aur content daalo");
    const ref = await publishNotice(form);
    setNotices(prev => [{ id: ref.id, ...form }, ...prev]);
    setForm({ title: "", body: "" });
    showToast("Notice publish ho gayi ✓");
  };

  const handleDelete = async (id) => {
    await deleteNotice(id);
    setNotices(prev => prev.filter(n => n.id !== id));
    showToast("Notice delete ho gayi");
  };

  return (
    <div>
      <div style={S.card}>
        <div style={S.sectionTitle}>Naya Notice Publish Karo</div>
        <label style={S.label}>Title</label>
        <input style={S.input} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Jaise: May ki fees reminder" />
        <label style={S.label}>Content</label>
        <textarea style={{ ...S.input, height: 80, resize: "vertical" }} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Notice ka content yahan likho..." />
        <button style={S.btn} onClick={handlePublish}>Publish Karo</button>
      </div>
      <div style={S.card}>
        <div style={S.sectionTitle}>Published Notices ({notices.length})</div>
        {notices.map(n => (
          <div key={n.id} style={{ padding: "10px 0", borderBottom: "0.5px solid #f1efe8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#0a1628" }}>{n.title}</div>
                <div style={{ fontSize: 13, color: "#5f5e5a", marginTop: 4 }}>{n.body}</div>
              </div>
              <button style={S.btnDanger} onClick={() => handleDelete(n.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STUDENT PORTAL ───────────────────────────────────────────
function StudentPortal({ user, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [myFees, setMyFees] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [myVisitors, setMyVisitors] = useState([]);
  const [notices, setNotices] = useState([]);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    import("./firebase/services").then(async ({ getStudentFees, getMyLeaves, getVisitorsByStudent, getAllNotices }) => {
      const [f, l, v, n] = await Promise.all([
        getStudentFees(user.uid),
        getMyLeaves(user.uid),
        getVisitorsByStudent(user.uid),
        getAllNotices(),
      ]);
      setMyFees(f); setMyLeaves(l); setMyVisitors(v); setNotices(n);
    });
  }, [user.uid]);

  // Leave Apply Form
  const [leaveForm, setLeaveForm] = useState({ fromDate: "", toDate: "", reason: "" });
  const handleLeaveApply = async () => {
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason)
      return showToast("Sabhi fields bharo");
    const ref = await applyLeave({
      ...leaveForm,
      studentId: user.uid,
      studentName: user.name || user.email,
      roomNumber: user.roomNumber || "—",
    });
    setMyLeaves(prev => [{ id: ref.id, ...leaveForm, status: "pending" }, ...prev]);
    setLeaveForm({ fromDate: "", toDate: "", reason: "" });
    showToast("Leave apply ho gayi ✓");
  };

  // Complaint Form
  const [compForm, setCompForm] = useState({ description: "" });
  const handleComplaint = async () => {
    if (!compForm.description) return showToast("Complaint likho");
    await submitComplaint({
      ...compForm,
      studentId: user.uid,
      studentName: user.name || user.email,
      roomNumber: user.roomNumber || "—",
    });
    setCompForm({ description: "" });
    showToast("Complaint submit ho gayi ✓");
  };

  const tabs = ["dashboard", "fees", "leave", "complaints", "notices"];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0" }}>
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, background: "#0a1628", color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13, zIndex: 999 }}>
          {toast}
        </div>
      )}
      <div style={{ background: "#0a1628", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "#c8973a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a1628", fontWeight: 500 }}>
            {(user.name || user.email || "S")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 14 }}>{user.name || user.email}</div>
            <div style={{ color: "#64748b", fontSize: 12 }}>Room {user.roomNumber || "N/A"}</div>
          </div>
        </div>
        <button style={S.btnSm} onClick={onLogout}>Logout</button>
      </div>
      <div style={{ background: "#fff", borderBottom: "0.5px solid #e5e3dc", padding: "0 24px", display: "flex", gap: 2 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "12px 16px", background: "none", border: "none",
            borderBottom: tab === t ? "2px solid #c8973a" : "2px solid transparent",
            color: tab === t ? "#c8973a" : "#888780",
            fontSize: 13, cursor: "pointer", textTransform: "capitalize",
          }}>{t}</button>
        ))}
      </div>
      <div style={{ padding: "20px 24px", maxWidth: 800, margin: "0 auto" }}>

        {/* STUDENT DASHBOARD */}
        {tab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
              <div style={{ ...S.card, textAlign: "center" }}>
                <div style={{ fontSize: 24 }}>💰</div>
                <div style={{ fontSize: 20, fontWeight: 500 }}>{myFees.filter(f => f.status === "paid").length}</div>
                <div style={{ fontSize: 12, color: "#888780" }}>Fees Paid</div>
              </div>
              <div style={{ ...S.card, textAlign: "center" }}>
                <div style={{ fontSize: 24 }}>📋</div>
                <div style={{ fontSize: 20, fontWeight: 500 }}>{myLeaves.length}</div>
                <div style={{ fontSize: 12, color: "#888780" }}>Leave Applications</div>
              </div>
              <div style={{ ...S.card, textAlign: "center" }}>
                <div style={{ fontSize: 24 }}>🔔</div>
                <div style={{ fontSize: 20, fontWeight: 500 }}>{notices.length}</div>
                <div style={{ fontSize: 12, color: "#888780" }}>Active Notices</div>
              </div>
            </div>
            <div style={S.card}>
              <div style={S.sectionTitle}>Recent Notices</div>
              {notices.slice(0, 3).map(n => (
                <div key={n.id} style={{ padding: "8px 0", borderBottom: "0.5px solid #f1efe8" }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: "#5f5e5a" }}>{n.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY FEES */}
        {tab === "fees" && (
          <div style={S.card}>
            <div style={S.sectionTitle}>Meri Fees</div>
            {myFees.length === 0 && <p style={{ color: "#888780", fontSize: 13 }}>Koi fee record nahi hai</p>}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Month", "Amount", "Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {myFees.map(f => (
                  <tr key={f.id}>
                    <td style={S.td}>{f.month}</td>
                    <td style={S.td}>₹{f.amount}</td>
                    <td style={S.td}>{statusBadge(f.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LEAVE APPLICATION */}
        {tab === "leave" && (
          <div>
            <div style={S.card}>
              <div style={S.sectionTitle}>Leave Apply Karo</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={S.label}>From Date</label><input style={S.input} type="date" value={leaveForm.fromDate} onChange={e => setLeaveForm(p => ({ ...p, fromDate: e.target.value }))} /></div>
                <div><label style={S.label}>To Date</label><input style={S.input} type="date" value={leaveForm.toDate} onChange={e => setLeaveForm(p => ({ ...p, toDate: e.target.value }))} /></div>
              </div>
              <label style={S.label}>Reason</label>
              <textarea style={{ ...S.input, height: 80, resize: "vertical" }} value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))} placeholder="Ghar jaana hai, medical reason, etc." />
              <button style={S.btn} onClick={handleLeaveApply}>Apply Karo</button>
            </div>
            <div style={S.card}>
              <div style={S.sectionTitle}>Meri Leave Applications</div>
              {myLeaves.map(l => (
                <div key={l.id} style={{ padding: "10px 0", borderBottom: "0.5px solid #f1efe8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13 }}>{l.fromDate} → {l.toDate}</span>
                    {statusBadge(l.status)}
                  </div>
                  <div style={{ fontSize: 12, color: "#5f5e5a", marginTop: 4 }}>{l.reason}</div>
                  {l.adminRemark && <div style={{ fontSize: 12, color: "#a32d2d" }}>Admin remark: {l.adminRemark}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPLAINTS */}
        {tab === "complaints" && (
          <div style={S.card}>
            <div style={S.sectionTitle}>Complaint Submit Karo</div>
            <label style={S.label}>Apni problem batao</label>
            <textarea style={{ ...S.input, height: 100, resize: "vertical" }} value={compForm.description} onChange={e => setCompForm(p => ({ ...p, description: e.target.value }))} placeholder="WiFi slow hai, bathroom mein problem, etc." />
            <button style={S.btn} onClick={handleComplaint}>Submit Karo</button>
          </div>
        )}

        {/* NOTICES */}
        {tab === "notices" && (
          <div style={S.card}>
            <div style={S.sectionTitle}>Notice Board</div>
            {notices.length === 0 && <p style={{ color: "#888780", fontSize: 13 }}>Koi notice nahi hai</p>}
            {notices.map(n => (
              <div key={n.id} style={{ padding: "10px 0", borderBottom: "0.5px solid #f1efe8" }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#0a1628" }}>{n.title}</div>
                <div style={{ fontSize: 13, color: "#5f5e5a", marginTop: 4 }}>{n.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ROOT APP ─────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        const data = snap.exists() ? snap.data() : {};
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...data });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => { await signOut(auth); setUser(null); };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", color: "#c8973a", fontSize: 16 }}>
      Loading...
    </div>
  );

  if (!user) return <LoginPage onLogin={setUser} />;
  if (user.role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} />;
  return <StudentPortal user={user} onLogout={handleLogout} />;
}
