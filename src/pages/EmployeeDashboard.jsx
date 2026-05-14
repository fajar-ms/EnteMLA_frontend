import React, { useEffect, useMemo, useState } from "react";

const URGENCY_RANK = { Urgent: 1, Medium: 2, Normal: 3 };

const urgencyStyle = {
  Urgent: { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
  Medium: { bg: "#FFFBEB", color: "#92400E", dot: "#F59E0B" },
  Normal: { bg: "#F0FDF4", color: "#166534", dot: "#22C55E" },
};

const statusStyle = {
  Pending: { bg: "#EFF6FF", color: "#1D4ED8" },
  "In Progress": { bg: "#FFF7ED", color: "#C2410C" },
  Resolved: { bg: "#F0FDF4", color: "#15803D" },
  Rejected: { bg: "#FFF1F2", color: "#BE123C" },
};

const Badge = ({ label, styleMap }) => {
  const s = styleMap[label] || { bg: "#F1F5F9", color: "#475569" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.4px",
      padding: "3px 10px", borderRadius: 99,
    }}>
      {s.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />}
      {label}
    </span>
  );
};

const Avatar = ({ name }) => {
  const initials = (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},55%,88%)`, color: `hsl(${hue},55%,35%)`,
      fontSize: 12, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>{initials}</div>
  );
};

const SortIcon = ({ active, direction }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 4, opacity: active ? 1 : 0.35 }}>
    <path d="M6 2L9 5H3L6 2Z" fill={active && direction === "asc" ? "#2563EB" : "#94A3B8"} />
    <path d="M6 10L3 7H9L6 10Z" fill={active && direction === "desc" ? "#2563EB" : "#94A3B8"} />
  </svg>
);

const StatCard = ({ label, value, color, icon }) => (
  <div style={{
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 14,
    padding: "18px 22px",
    display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    flex: 1, minWidth: 0,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
      background: color + "15",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || "#1E293B", lineHeight: 1 }}>{value}</div>
    </div>
  </div>
);

export default function EmployeeComplaintDashboard() {
  const handleLogout = () => {
    localStorage.clear(); // Clears user session and roles
    window.location.href = "/"; // Redirects to login/home
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

    // Security Gate: If no user or role is found, or if the role isn't "employee", redirect to login
    if (!savedUser || role !== "employee") {
      window.location.replace("/");
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch all Citizens for the stat cards
        const userRes = await fetch("http://localhost:3001/users/citizens");
        const userData = await userRes.json();
        setUsers(Array.isArray(userData) ? userData : []);

        // 2. Fetch all Complaints
        const complaintRes = await fetch("http://localhost:3001/complaints");
        const complaintData = await complaintRes.json();

        if (Array.isArray(complaintData)) {
          setComplaints(complaintData.map(c => ({
            ...c,
            id: c._id || c.id,
            // If citizenId is populated by NestJS, we use c.citizenId.name
            userName:
  typeof c.citizenId === "object"
    ? c.citizenId?.name
    : c.citizenId || "Unknown Citizen",
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
      const res = await fetch(
        `http://localhost:3001/complaints/${selectedComplaint.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Status update failed");
      }

      // ✅ Update list
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === selectedComplaint.id
            ? { ...c, status: newStatus }
            : c
        )
      );

      // ✅ Update selected complaint
      setSelectedComplaint((prev) => ({
        ...prev,
        status: newStatus,
      }));


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
    { key: "title", label: "Complaint" },
    { key: null, label: "Category" },
    { key: "urgency", label: "Urgency" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
    // { key: "reply", label: "Reply" }
  ];
  const handleReplyChange = (id, value) => {
    setReplies(prev => ({ ...prev, [id]: value }));
  };

  const handleSendReply = async (id) => {
    const replyText = replies[id];
    if (!replyText) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
const role = localStorage.getItem("role"); // "employee", "mla", "citizen"
      const response = await fetch(`http://localhost:3001/complaints/${id}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: replyText,
          
             role: role,   
          
          
          
            username: user.name ||"Employee",
             // Or pull the employee name from state
        }),
      });

      if (response.ok) {
        // 1. Show success message
        setSentStatus(prev => ({ ...prev, [id]: "Sent successfully ✅" }));

        // 2. Clear the input
        setReplies(prev => ({ ...prev, [id]: "" }));

        // 3. Optional: Refresh complaints to show local updates
        // (The Citizen will see this next time they refresh their dashboard)

        const res = await fetch("http://localhost:3001/complaints");
  const data = await res.json();
  if (Array.isArray(data)) {
    setComplaints(data.map(c => ({
      ...c,
      id: c._id || c.id,
      userName: typeof c.citizenId === "object" ? c.citizenId?.name : c.citizenId || "Unknown Citizen",
      urgency: c.urgency || "Normal",
      status: c.status || "Pending",
      date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-",
    })));
  }
        setTimeout(() => {
          setSentStatus(prev => ({ ...prev, [id]: "" }));
        }, 2000);
      }
    } catch (err) {
      alert("Failed to send reply to database.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "28px 32px" }}>


      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 3px #DCFCE7" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#22C55E", letterSpacing: "0.8px", textTransform: "uppercase" }}>Live Portal</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Complaint Management
          </h1>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: "4px 0 0", fontWeight: 400 }}>
            MLA Portal · Employee View
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {/* Home Button */}
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 18px",
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              color: "#334155",
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
              <polyline points="9 21 9 12 15 12 15 21" />
            </svg>
            Home
          </a>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 18px",
              background: "#FEF2F2",
              border: "1px solid #FEE2E2",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              color: "#B91C1C",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#FEE2E2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#FEF2F2"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Total Citizens" value={users.length} color="#6366F1" icon="👥" />
        <StatCard label="Total Complaints" value={complaints.length} color="#2563EB" icon="📋" />
        <StatCard label="Urgent" value={countByUrgency("Urgent")} color="#EF4444" icon="🔴" />
        <StatCard label="Medium" value={countByUrgency("Medium")} color="#F59E0B" icon="🟡" />
        <StatCard label="Normal" value={countByUrgency("Normal")} color="#22C55E" icon="🟢" />
      </div>

      {/* Filters Row */}
      <div style={{
        background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14,
        padding: "14px 18px", marginBottom: 18,
        display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 2, minWidth: 200 }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M10.5 10.5L13.5 13.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text" placeholder="Search citizen, complaint, category..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 34px",
              border: "1px solid #E2E8F0", borderRadius: 9,
              fontSize: 13, color: "#334155", background: "#F8FAFC",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Urgency filter */}
        <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 9, fontSize: 13, color: "#334155", background: "#F8FAFC", outline: "none", cursor: "pointer" }}>
          <option value="">All Urgency</option>
          <option value="Urgent">Urgent</option>
          <option value="Medium">Medium</option>
          <option value="Normal">Normal</option>
        </select>

        {/* Status filter */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 9, fontSize: 13, color: "#334155", background: "#F8FAFC", outline: "none", cursor: "pointer" }}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <div style={{ marginLeft: "auto", fontSize: 12, color: "#94A3B8", fontWeight: 500, whiteSpace: "nowrap" }}>
          {filtered.length} of {complaints.length} records
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14,
        overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "12%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "12%" }} />
            {/* <col style={{ width: "18" }} /> */}
          </colgroup>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              {cols.map(col => (
                <th key={col.label}
                  onClick={col.key ? () => handleSort(col.key) : undefined}
                  style={{
                    padding: "11px 16px", textAlign: "left",
                    fontSize: 11, fontWeight: 600, color: "#64748B",
                    letterSpacing: "0.6px", textTransform: "uppercase",
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
                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                  No complaints match the current filters.
                </td>
              </tr>
            ) : filtered.map((c, i) => (
              <tr
                key={c.id}
                onClick={() => setSelectedComplaint(c)}
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none",
                  transition: "background 0.1s",
                  cursor: "pointer"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Citizen */}
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={c.userName} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#1E293B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.userName}
                    </span>
                  </div>
                </td>

                {/* Title */}
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 13, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={c.title}>
                    {c.title}
                  </span>
                </td>

                {/* Category */}
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{c.category}</span>
                </td>

                {/* Urgency */}
                <td style={{ padding: "12px 16px" }}>
                  <Badge label={c.urgency || "Normal"} styleMap={urgencyStyle} />
                </td>

                {/* Status */}
                <td style={{ padding: "12px 16px" }}>
                  <Badge label={c.status || "Pending"} styleMap={statusStyle} />
                </td>

                {/* Date */}
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>{c.date}</span>
                </td>
                {/* Reply */}
                {/* <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      type="text"
                      placeholder="Send reply..."
                      value={replies[c.id] || ""}
                      color=""
                      onChange={(e) => handleReplyChange(c.id, e.target.value)}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        border: "1px solid #E2E8F0",
                        borderRadius: 6,
                        fontSize: 12,
                        outline: "none",
                        background: "#F8FAFC",
                        color: "#000"
                      }}
                    />
                    <button
                      onClick={() => handleSendReply(c.id)}
                      style={{
                        padding: "6px 10px",
                        fontSize: 12,
                        background: "#2563EB",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer"
                      }}
                    >
                      Send
                    </button>
                  </div>

                  {sentStatus[c.id] && (
                    <p style={{ fontSize: 11, color: "green", marginTop: 4 }}>
                      {sentStatus[c.id]}
                    </p>
                  )}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── RIGHT: Update Panel ── */}
        {/* ── RIGHT: Update Panel ── */}
        {selectedComplaint && (
          <div style={{
            position: "fixed", top: 0, right: 0, width: "360px", height: "100vh",
            background: "#fff", borderLeft: "1px solid #E2E8F0",
            boxShadow: "-4px 0 20px rgba(0,0,0,0.08)", padding: "18px",
            zIndex: 999, fontFamily: "'DM Sans','Segoe UI',sans-serif", overflowY: "auto"
          }}>
            {/* Status variable for easier checking */}
            {/* Note: I'm adding a helper variable here */}
            {(() => {
              const isResolved = selectedComplaint.status === "Resolved";
              const isRejected = selectedComplaint.status === "Rejected";
              const isClosed = isResolved || isRejected;

              return (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>{selectedComplaint.title}</div>
                    <div style={{ fontSize: 16, color: "#94A3B8" }}>{selectedComplaint.category}</div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedComplaint.details}</div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <Badge label={selectedComplaint.urgency} styleMap={urgencyStyle} />
                    <Badge label={selectedComplaint.status} styleMap={statusStyle} />
                  </div>

                  {/* ❌ VISUAL HINT FOR RESOLVED ITEMS */}
                  {isResolved && (
                    <div style={{
                      background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#15803D",
                      padding: "10px", borderRadius: 8, fontSize: 12, marginBottom: 14, fontWeight: 600
                    }}>
                      ✅ This complaint is resolved and closed for edits.
                    </div>
                  )}

                  <div style={{ height: 1, background: "#E2E8F0", marginBottom: 14 }} />

                  <div style={{ fontSize: 14, color: "#000000", marginBottom: 14 }}>
                    <p><b>ID:</b> {selectedComplaint.id}</p>
                    <p><b>Citizen:</b> {selectedComplaint.userName}</p>
                    <p><b>Date:</b> {selectedComplaint.date}</p>
                  </div>

                  {/* Reply box - Disabled if Resolved */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: isClosed ? "#CBD5E1" : "#94A3B8" }}>
                      Reply to Citizen {isClosed && "(Disabled)"}
                    </label>
                    <textarea
                      value={replies[selectedComplaint.id] || ""}
                      readOnly={isClosed} // ✅ Makes it non-editable
                      onChange={(e) => setReplies(prev => ({ ...prev, [selectedComplaint.id]: e.target.value }))}
                      rows={4}
                      placeholder={isClosed ? "No further replies allowed" : "Type reply..."}
                      style={{
                        width: "100%", marginTop: 6, padding: "8px", border: "1px solid #E2E8F0",
                        borderRadius: 8, fontSize: 12, outline: "none",
                        background: isClosed ? "#F1F5F9" : "#F8FAFC", // ✅ Gray background when disabled
                        color: isClosed ? "#94A3B8" : "#000",
                        cursor: isClosed ? "not-allowed" : "text"
                      }}
                    />
                  </div>

                  {/* Action Buttons - All disabled if Resolved */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                      disabled={isClosed}
                      onClick={() => handleSendReply(selectedComplaint.id)}
                      style={{
                        padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                        background: isClosed ? "#E2E8F0" : "#2563EB",
                        color: isClosed ? "#94A3B8" : "#fff",
                        border: "none", cursor: isClosed ? "not-allowed" : "pointer"
                      }}
                    >
                      Send Reply
                    </button>

                    <button
                      disabled={actionLoading || isClosed || selectedComplaint.status === "In Progress"}
                      onClick={() => updateStatus("In Progress")}
                      style={{
                        padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                        background: isClosed ? "#F1F5F9" : "#FFF7ED",
                        color: isClosed ? "#CBD5E1" : "#C2410C",
                        border: "1px solid #FDE68A", cursor: (isClosed || actionLoading) ? "not-allowed" : "pointer"
                      }}
                    >
                      Mark In Progress
                    </button>

                    <button
                      disabled={actionLoading || isClosed}
                      onClick={() => updateStatus("Resolved")}
                      style={{
                        padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                        background: isClosed ? "#F1F5F9" : "#F0FDF4",
                        color: isClosed ? "#CBD5E1" : "#15803D",
                        border: "1px solid #BBF7D0", cursor: (isClosed || actionLoading) ? "not-allowed" : "pointer"
                      }}
                    >
                      Mark Resolved
                    </button>

                    <button
                      disabled={actionLoading || isClosed}
                      onClick={() => updateStatus("Rejected")}
                      style={{
                        padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                        background: isClosed ? "#F1F5F9" : "#FFF1F2",
                        color: isClosed ? "#CBD5E1" : "#BE123C",
                        border: "1px solid #FECDD3", cursor: (isClosed || actionLoading) ? "not-allowed" : "pointer"
                      }}
                    >
                      Reject Complaint
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedComplaint(null)}
                    style={{
                      marginTop: 16, width: "100%", padding: "8px", background: "#F1F5F9",
                      border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600
                    }}
                  >
                    Close Panel
                  </button>
                </>
              );
            })()}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: "10px 18px", borderTop: "1px solid #F1F5F9",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>
            Showing <strong style={{ color: "#475569" }}>{filtered.length}</strong> complaint{filtered.length !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: 11, color: "#CBD5E1" }}>MLA Complaint Portal · Employee View</span>
        </div>
      </div>
    </div>
  );
}