import React, { useEffect, useMemo, useState } from "react";

const URGENCY_RANK = { Urgent: 1, Medium: 2, Normal: 3 };

const urgencyStyle = {
  Urgent: { bg: "#FFF0EE", color: "#C1391D", dot: "#F05A40" },
  Medium: { bg: "#FFFAEB", color: "#9A6000", dot: "#F5A623" },
  Normal: { bg: "#EDFAF4", color: "#1A7A4A", dot: "#34C573" },
};

const statusStyle = {
  Pending:      { bg: "#EEF2FF", color: "#3B4FC4" },
  "In Progress":{ bg: "#FFF5E6", color: "#B45309" },
  Resolved:     { bg: "#EDFAF4", color: "#167346" },
  Rejected:     { bg: "#FFF0EE", color: "#B91C1C" },
};

const Badge = ({ label, styleMap }) => {
  const s = styleMap[label] || { bg: "#F1F5F9", color: "#475569" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color,
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.5px",
      padding: "3px 10px", borderRadius: 99,
      border: `1px solid ${s.color}22`,
    }}>
      {s.dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />}
      {label}
    </span>
  );
};

const Avatar = ({ name }) => {
  const initials = (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
      background: `hsl(${hue},50%,90%)`, color: `hsl(${hue},55%,30%)`,
      fontSize: 12, fontWeight: 800,
      display: "flex", alignItems: "center", justifyContent: "center",
      border: `1.5px solid hsl(${hue},50%,80%)`,
      fontFamily: "'Playfair Display', Georgia, serif",
    }}>{initials}</div>
  );
};

const SortIcon = ({ active, direction }) => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 4, opacity: active ? 1 : 0.3 }}>
    <path d="M6 2L9 5H3L6 2Z" fill={active && direction === "asc" ? "#6366F1" : "#94A3B8"} />
    <path d="M6 10L3 7H9L6 10Z" fill={active && direction === "desc" ? "#6366F1" : "#94A3B8"} />
  </svg>
);

const StatCard = ({ label, value, color, icon, sub }) => (
  <div style={{
    background: "#fff",
    border: "1px solid #EAE8E3",
    borderRadius: 16,
    padding: "20px 22px",
    display: "flex", alignItems: "center", gap: 15,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    flex: 1, minWidth: 140,
    position: "relative", overflow: "hidden",
    transition: "transform 0.15s, box-shadow 0.15s",
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
  >
    {/* decorative blob */}
    <div style={{
      position: "absolute", top: -14, right: -14, width: 70, height: 70, borderRadius: "50%",
      background: color + "12", pointerEvents: "none",
    }} />
    <div style={{
      width: 46, height: 46, borderRadius: 13, flexShrink: 0,
      background: color + "18",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 22, border: `1px solid ${color}30`,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, color: "#A09A90", fontWeight: 600, marginBottom: 3, letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#1C1917", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</div>
    </div>
  </div>
);

export default function EmployeeComplaintDashboard() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("urgency");
  const [sortOrder, setSortOrder] = useState("asc");
  const [replies, setReplies] = useState({});
  const [sentStatus, setSentStatus] = useState({});
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    if (!savedUser || role !== "employee") {
      window.location.replace("/");
      return;
    }
    const fetchData = async () => {
      try {
        const userRes = await fetch("http://localhost:3001/users/citizens");
        const userData = await userRes.json();
        setUsers(Array.isArray(userData) ? userData : []);
        const complaintRes = await fetch("http://localhost:3001/complaints");
        const complaintData = await complaintRes.json();
        if (Array.isArray(complaintData)) {
          setComplaints(complaintData.map(c => ({
            ...c,
            id: c._id || c.id,
            userName: c.citizenId?.name || c.userName || "Unknown Citizen",
            urgency: c.urgency || "Normal",
            status: c.status || "Pending",
            date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-",
          })));
        }
      } catch (err) {
        console.error("Connection Error:", err);
      }
    };
    fetchData();
  }, []);

  const updateStatus = async (newStatus) => {
    if (!selectedComplaint) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/complaints/${selectedComplaint.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Status update failed");
      setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? { ...c, status: newStatus } : c));
      setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSort = (field) => {
    setSortOrder(sortBy === field && sortOrder === "asc" ? "desc" : "asc");
    setSortBy(field);
  };

  const refreshComplaints = async () => {
    const res = await fetch("http://localhost:3001/complaints");
    const data = await res.json();
    setComplaints(data);
  };

  const countByUrgency = (l) => complaints.filter(c => c.urgency === l).length;

  const filtered = useMemo(() => {
    let data = complaints.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || [c.userName, c.title, c.category, c.urgency].some(v => (v || "").toLowerCase().includes(q));
      const matchUrgency = !urgencyFilter || c.urgency === urgencyFilter;
      const matchStatus = !statusFilter || c.status === statusFilter;
      return matchSearch && matchUrgency && matchStatus;
    });
    data = [...data].sort((a, b) => {
      let av = sortBy === "urgency" ? URGENCY_RANK[a.urgency] : (a[sortBy] || "").toString().toLowerCase();
      let bv = sortBy === "urgency" ? URGENCY_RANK[b.urgency] : (b[sortBy] || "").toString().toLowerCase();
      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [complaints, search, urgencyFilter, statusFilter, sortBy, sortOrder]);

  const cols = [
    { key: "userName", label: "Citizen" },
    { key: "title",    label: "Complaint" },
    { key: null,       label: "Category" },
    { key: "urgency",  label: "Urgency" },
    { key: "status",   label: "Status" },
    { key: "date",     label: "Date" },
  ];

  const handleReplyChange = (id, value) => setReplies(prev => ({ ...prev, [id]: value }));

  const handleSendReply = async (id) => {
    const replyText = replies[id];
    if (!replyText) return;
    try {
      const response = await fetch(`http://localhost:3001/complaints/${id}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText, from: "Employee" }),
      });
      if (response.ok) {
        setSentStatus(prev => ({ ...prev, [id]: "Sent successfully ✅" }));
        setReplies(prev => ({ ...prev, [id]: "" }));
        setTimeout(() => setSentStatus(prev => ({ ...prev, [id]: "" })), 2000);
      }
    } catch (err) {
      alert("Failed to send reply to database.");
    }
  };

  const selectStyles = {
    padding: "8px 14px", border: "1px solid #E5E1DA", borderRadius: 10,
    fontSize: 12.5, color: "#3D3730", background: "#FDFCFA",
    outline: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
    appearance: "none", paddingRight: 28,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #FAF8F4 0%, #F5F1EB 50%, #F8F5EF 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "32px 36px",
    }}>
      {/* Subtle dot-grid background texture */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F5F1EB; }
        ::-webkit-scrollbar-thumb { background: #D5CEBD; border-radius: 99px; }
        tbody tr { transition: background 0.12s ease; }
        tbody tr:hover { background: #FAF7F2 !important; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .panel-anim { animation: slideIn 0.25s cubic-bezier(0.22,1,0.36,1) both; }
        .card-anim { animation: fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Logo mark */}
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #2D4EAF 0%, #4F46E5 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(79,70,229,0.3)", flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <h1 style={{
                fontSize: 22, fontWeight: 800, color: "#1C1917", margin: 0,
                fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.5px",
              }}>
                Complaint Management
              </h1>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase",
                background: "#EDFAF4", color: "#167346", border: "1px solid #BBF7D0",
                padding: "2px 8px", borderRadius: 99, display: "flex", alignItems: "center", gap: 4,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
                Live
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "#9C9484", margin: 0, fontWeight: 500 }}>
              MLA Portal · Employee View
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <a href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "9px 18px",
            background: "#fff", border: "1px solid #E5E1DA", borderRadius: 10,
            fontSize: 13, fontWeight: 600, color: "#3D3730", textDecoration: "none",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8C2B8"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.09)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E1DA"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
              <polyline points="9 21 9 12 15 12 15 21"/>
            </svg>
            Home
          </a>
          <button onClick={handleLogout} style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "9px 18px",
            background: "#FFF0EE", border: "1px solid #FECDC8", borderRadius: 10,
            fontSize: 13, fontWeight: 600, color: "#B91C1C", cursor: "pointer",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#FFE4E0"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#FFF0EE"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="card-anim" style={{ display: "flex", gap: 12, marginBottom: 26, flexWrap: "wrap" }}>
        <StatCard label="Total Citizens"    value={users.length}             color="#6366F1" icon="👥" />
        <StatCard label="Total Complaints"  value={complaints.length}        color="#2563EB" icon="📋" />
        <StatCard label="Urgent"            value={countByUrgency("Urgent")} color="#EF4444" icon="🔴" />
        <StatCard label="Medium"            value={countByUrgency("Medium")} color="#F59E0B" icon="🟡" />
        <StatCard label="Normal"            value={countByUrgency("Normal")} color="#22C55E" icon="🟢" />
      </div>

      {/* ── FILTERS ── */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #EAE8E3",
        borderRadius: 14,
        padding: "13px 18px",
        marginBottom: 16,
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 2, minWidth: 200 }}>
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="#A09A90" strokeWidth="1.5"/>
            <path d="M10.5 10.5L13.5 13.5" stroke="#A09A90" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text" placeholder="Search citizen, complaint, category..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 34px",
              border: "1px solid #E5E1DA", borderRadius: 10,
              fontSize: 13, color: "#3D3730", background: "#FDFCFA",
              outline: "none", fontFamily: "inherit", fontWeight: 500,
              transition: "border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = "#6366F1"}
            onBlur={e => e.target.style.borderColor = "#E5E1DA"}
          />
        </div>

        {/* Urgency filter */}
        <div style={{ position: "relative" }}>
          <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)} style={selectStyles}>
            <option value="">All Urgency</option>
            <option value="Urgent">Urgent</option>
            <option value="Medium">Medium</option>
            <option value="Normal">Normal</option>
          </select>
          <svg width="10" height="10" viewBox="0 0 10 6" fill="none" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <path d="M1 1L5 5L9 1" stroke="#9C9484" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Status filter */}
        <div style={{ position: "relative" }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyles}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <svg width="10" height="10" viewBox="0 0 10 6" fill="none" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <path d="M1 1L5 5L9 1" stroke="#9C9484" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <div style={{ marginLeft: "auto", fontSize: 12, color: "#A09A90", fontWeight: 600 }}>
          <span style={{ color: "#3D3730" }}>{filtered.length}</span> of {complaints.length} records
        </div>
      </div>

      {/* ── TABLE ── */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #EAE8E3",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "14%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "11%" }} />
          </colgroup>
          <thead>
            <tr style={{
              background: "linear-gradient(90deg, #F5F2ED 0%, #FAF8F5 100%)",
              borderBottom: "1px solid #EAE8E3",
            }}>
              {cols.map(col => (
                <th key={col.label}
                  onClick={col.key ? () => handleSort(col.key) : undefined}
                  style={{
                    padding: "12px 18px", textAlign: "left",
                    fontSize: 10.5, fontWeight: 700, color: "#7A7468",
                    letterSpacing: "0.8px", textTransform: "uppercase",
                    cursor: col.key ? "pointer" : "default",
                    userSelect: "none", whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                    {col.label}
                    {col.key && <SortIcon active={sortBy === col.key} direction={sortOrder} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "60px", textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🗂️</div>
                  <div style={{ fontSize: 14, color: "#A09A90", fontWeight: 600 }}>No complaints match the current filters.</div>
                </td>
              </tr>
            ) : filtered.map((c, i) => (
              <tr
                key={c.id}
                onClick={() => setSelectedComplaint(c)}
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid #F5F0E8" : "none",
                  cursor: "pointer",
                  background: selectedComplaint?.id === c.id ? "#FAF7F2" : "transparent",
                }}
              >
                {/* Citizen */}
                <td style={{ padding: "13px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={c.userName} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#2C2520", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.userName}
                    </span>
                  </div>
                </td>
                {/* Title */}
                <td style={{ padding: "13px 18px" }}>
                  <span style={{ fontSize: 13, color: "#4A4540", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", fontWeight: 500 }} title={c.title}>
                    {c.title}
                  </span>
                </td>
                {/* Category */}
                <td style={{ padding: "13px 18px" }}>
                  <span style={{
                    fontSize: 11.5, color: "#7A7468", fontWeight: 600,
                    background: "#F5F0E8", padding: "3px 9px", borderRadius: 6,
                    display: "inline-block",
                  }}>{c.category}</span>
                </td>
                {/* Urgency */}
                <td style={{ padding: "13px 18px" }}>
                  <Badge label={c.urgency || "Normal"} styleMap={urgencyStyle} />
                </td>
                {/* Status */}
                <td style={{ padding: "13px 18px" }}>
                  <Badge label={c.status || "Pending"} styleMap={statusStyle} />
                </td>
                {/* Date */}
                <td style={{ padding: "13px 18px" }}>
                  <span style={{ fontSize: 12, color: "#B0A898", fontWeight: 500 }}>{c.date}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── DETAIL PANEL ── */}
        {selectedComplaint && (
          <div className="panel-anim" style={{
            position: "fixed", top: 0, right: 0, width: 370, height: "100vh",
            background: "#FDFCFA",
            borderLeft: "1px solid #EAE8E3",
            boxShadow: "-6px 0 30px rgba(0,0,0,0.09)",
            padding: 0, zIndex: 999,
            fontFamily: "'DM Sans','Segoe UI',sans-serif",
            overflowY: "auto",
            display: "flex", flexDirection: "column",
          }}>
            {(() => {
              const isResolved = selectedComplaint.status === "Resolved";
              const isRejected = selectedComplaint.status === "Rejected";
              const isClosed = isResolved || isRejected;
              return (
                <>
                  {/* Panel header stripe */}
                  <div style={{
                    background: "linear-gradient(135deg, #2D4EAF 0%, #4F46E5 100%)",
                    padding: "24px 22px 20px",
                    position: "relative",
                  }}>
                    <div style={{
                      position: "absolute", top: -20, right: -20, width: 100, height: 100,
                      borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none",
                    }} />
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
                      Complaint Detail
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.3, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 8 }}>
                      {selectedComplaint.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                      {selectedComplaint.category}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <Badge label={selectedComplaint.urgency} styleMap={urgencyStyle} />
                      <Badge label={selectedComplaint.status} styleMap={statusStyle} />
                    </div>
                  </div>

                  {/* Panel body */}
                  <div style={{ padding: "20px 22px", flex: 1 }}>

                    {isResolved && (
                      <div style={{
                        background: "#EDFAF4", border: "1px solid #A7F3D0", color: "#166534",
                        padding: "10px 14px", borderRadius: 10, fontSize: 12.5, marginBottom: 16,
                        fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
                      }}>
                        ✅ This complaint is resolved and closed for edits.
                      </div>
                    )}

                    {isRejected && (
                      <div style={{
                        background: "#FFF0EE", border: "1px solid #FECDC8", color: "#B91C1C",
                        padding: "10px 14px", borderRadius: 10, fontSize: 12.5, marginBottom: 16,
                        fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
                      }}>
                        ❌ This complaint has been rejected and is closed.
                      </div>
                    )}

                    {/* Meta info */}
                    <div style={{
                      background: "#F9F7F3", border: "1px solid #EAE8E3", borderRadius: 12,
                      padding: "14px 16px", marginBottom: 16,
                    }}>
                      {selectedComplaint.details && (
                        <p style={{ fontSize: 13, color: "#4A4540", lineHeight: 1.6, margin: "0 0 12px", fontWeight: 500 }}>
                          {selectedComplaint.details}
                        </p>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 0", fontSize: 12 }}>
                        {[
                          ["ID", selectedComplaint.id],
                          ["Citizen", selectedComplaint.userName],
                          ["Date", selectedComplaint.date],
                        ].map(([k, v]) => (
                          <React.Fragment key={k}>
                            <span style={{ color: "#A09A90", fontWeight: 600 }}>{k}</span>
                            <span style={{ color: "#3D3730", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Reply box */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: isClosed ? "#C8C2B8" : "#7A7468", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                        Reply to Citizen {isClosed && <span style={{ fontWeight: 500, textTransform: "none" }}>(Disabled)</span>}
                      </label>
                      <textarea
                        value={replies[selectedComplaint.id] || ""}
                        readOnly={isClosed}
                        onChange={(e) => setReplies(prev => ({ ...prev, [selectedComplaint.id]: e.target.value }))}
                        rows={4}
                        placeholder={isClosed ? "No further replies allowed" : "Type your reply to the citizen..."}
                        style={{
                          width: "100%", padding: "10px 12px",
                          border: "1px solid #E5E1DA", borderRadius: 10,
                          fontSize: 13, outline: "none", fontFamily: "inherit",
                          background: isClosed ? "#F5F2ED" : "#fff",
                          color: isClosed ? "#B0A898" : "#2C2520",
                          cursor: isClosed ? "not-allowed" : "text",
                          resize: "vertical", lineHeight: 1.5, fontWeight: 400,
                          transition: "border-color 0.15s",
                        }}
                        onFocus={e => { if (!isClosed) e.target.style.borderColor = "#6366F1"; }}
                        onBlur={e => e.target.style.borderColor = "#E5E1DA"}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {/* Send Reply */}
                      <button
                        disabled={isClosed}
                        onClick={() => handleSendReply(selectedComplaint.id)}
                        style={{
                          padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                          background: isClosed ? "#F0EDE8" : "linear-gradient(135deg, #2D4EAF, #4F46E5)",
                          color: isClosed ? "#B0A898" : "#fff",
                          border: "none", cursor: isClosed ? "not-allowed" : "pointer",
                          transition: "opacity 0.15s, transform 0.15s",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                          boxShadow: isClosed ? "none" : "0 2px 8px rgba(79,70,229,0.28)",
                        }}
                        onMouseEnter={e => { if (!isClosed) e.currentTarget.style.opacity = "0.9"; }}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        Send Reply
                      </button>

                      {/* Status buttons row */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <button
                          disabled={actionLoading || isClosed || selectedComplaint.status === "In Progress"}
                          onClick={() => updateStatus("In Progress")}
                          style={{
                            padding: "9px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                            background: (isClosed || selectedComplaint.status === "In Progress") ? "#F5F2ED" : "#FFF8EE",
                            color: (isClosed || selectedComplaint.status === "In Progress") ? "#C8C2B8" : "#B45309",
                            border: "1px solid #FDE68A",
                            cursor: (isClosed || actionLoading || selectedComplaint.status === "In Progress") ? "not-allowed" : "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => { if (!isClosed && selectedComplaint.status !== "In Progress") e.currentTarget.style.background = "#FFF0D0"; }}
                          onMouseLeave={e => { if (!isClosed && selectedComplaint.status !== "In Progress") e.currentTarget.style.background = "#FFF8EE"; }}
                        >
                          ⏳ In Progress
                        </button>
                        <button
                          disabled={actionLoading || isClosed}
                          onClick={() => updateStatus("Resolved")}
                          style={{
                            padding: "9px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                            background: isClosed ? "#F5F2ED" : "#EDFAF4",
                            color: isClosed ? "#C8C2B8" : "#167346",
                            border: "1px solid #A7F3D0",
                            cursor: (isClosed || actionLoading) ? "not-allowed" : "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => { if (!isClosed) e.currentTarget.style.background = "#D1FAE5"; }}
                          onMouseLeave={e => { if (!isClosed) e.currentTarget.style.background = "#EDFAF4"; }}
                        >
                          ✅ Resolve
                        </button>
                      </div>
                      <button
                        disabled={actionLoading || isClosed}
                        onClick={() => updateStatus("Rejected")}
                        style={{
                          padding: "9px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                          background: isClosed ? "#F5F2ED" : "#FFF0EE",
                          color: isClosed ? "#C8C2B8" : "#B91C1C",
                          border: "1px solid #FECDC8",
                          cursor: (isClosed || actionLoading) ? "not-allowed" : "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => { if (!isClosed) e.currentTarget.style.background = "#FFE4E0"; }}
                        onMouseLeave={e => { if (!isClosed) e.currentTarget.style.background = "#FFF0EE"; }}
                      >
                        ❌ Reject Complaint
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedComplaint(null)}
                      style={{
                        marginTop: 14, width: "100%", padding: "9px", background: "#F5F2ED",
                        border: "1px solid #E5E1DA", borderRadius: 10, cursor: "pointer",
                        fontSize: 12.5, fontWeight: 600, color: "#7A7468", transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#EDE9E3"}
                      onMouseLeave={e => e.currentTarget.style.background = "#F5F2ED"}
                    >
                      ← Close Panel
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{
          padding: "11px 20px", borderTop: "1px solid #F0EDE8",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "#FAF8F5",
        }}>
          <span style={{ fontSize: 12, color: "#A09A90" }}>
            Showing <strong style={{ color: "#3D3730" }}>{filtered.length}</strong> complaint{filtered.length !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: 11, color: "#C8C2B8", fontWeight: 500 }}>MLA Complaint Portal · Employee View</span>
        </div>
      </div>
    </div>
  );
}