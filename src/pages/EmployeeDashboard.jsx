import React, { useEffect, useMemo, useState } from "react";
import {
  MdGroup, MdAssignment, MdWarning, MdInfo, MdCheckCircle, MdRepeat, MdLocalFireDepartment,
  MdCampaign
} from 'react-icons/md';
import "./EmployeeDashboard.css";
import {
  MdCancel,
  MdSend,
  MdAccessTime,
  MdClose,
  MdPerson,
  MdCalendarToday,
  MdFingerprint,
} from "react-icons/md";

const URGENCY_RANK = { Urgent: 1, Medium: 2, Normal: 3 };

const COLORS = {
  primaryBg: "#DCEEFB",     // Light blue main background
  secondaryBg: "#C8E3F5",
  cardBg: "#FFFFFF",        // White card background
  textPrimary: "#1D1E22",
  textSecondary: "#49494B",
  textMuted: "#6B7C93",
  border: "#B3D4E8",
  accent: "#124E66",
  accentHover: "#0D3E52",
  dark: "#1A6B8A",
  slate: "#49494B",
  successBg: "#E8F3E6",
  successText: "#2F5E3B",
  warningBg: "#FFF0D6",
  warningText: "#9A5B13",
  dangerBg: "#FDEAEA",
  dangerText: "#A63D40",
  white: "#FFFFFF",
};

const urgencyStyle = {
  Urgent: { bg: "#FDE7E3", color: "#9F3A2D", dot: "#C65A4B" },
  Medium: { bg: "#FFF1D9", color: "#9A6A20", dot: "#C6923D" },
  Normal: { bg: "#E8F4FB", color: "#124E66", dot: "#1A6B8A" },
};

const statusStyle = {
  Pending: { bg: "rgba(116,141,146,0.16)", color: "#2E3944" },
  "In Progress": { bg: "rgba(18,78,102,0.18)", color: "#124E66" },
  Resolved: { bg: "rgba(47,94,59,0.14)", color: "#2F5E3B" },
  Rejected: { bg: "rgba(166,61,64,0.14)", color: "#A63D40" },
};

const Badge = ({ label, styleMap }) => {
  const s = styleMap[label] || { bg: "#F1F5F9", color: "#333" };
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
      fontFamily: "'Manrope', sans-serif",
    }}>{initials}</div>
  );
};

const SortIcon = ({ active, direction }) => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 4, opacity: active ? 1 : 0.3 }}>
    <path d="M6 2L9 5H3L6 2Z" fill={active && direction === "asc" ? "#1A6B8A" : "#94A3B8"} />
    <path d="M6 10L3 7H9L6 10Z" fill={active && direction === "desc" ? "#1A6B8A" : "#94A3B8"} />
  </svg>
);

const StatCard = ({ label, value, color, icon }) => (
  <div
    style={{
      background: "#FFFFFF",
      color: COLORS.textPrimary,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 18,
      padding: "22px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 4px 14px rgba(18,78,102,0.08)",
      flex: 1,
      minWidth: 150,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 10px 24px rgba(18,78,102,0.12)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 14px rgba(18,78,102,0.08)";
    }}
  >

    <div style={{
      width: 50, height: 50, borderRadius: 14,
      background: `${COLORS.accent}15`,
      display: "flex", alignItems: "center", justifyContent: "center",
      border: `1px solid ${COLORS.accent}25`, fontSize: 24, color: COLORS.accent,
    }}>
      {icon}
    </div>
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.6px",
        color: COLORS.textMuted, marginBottom: 5, textTransform: "uppercase",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 28, fontWeight: 800, color: COLORS.textPrimary,
        lineHeight: 1, fontFamily: "'Manrope', sans-serif",
      }}>
        {value}
      </div>
    </div>
  </div>
);

export default function EmployeeComplaintDashboard() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
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
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "employee") { window.location.replace("/"); return; }
    const fetchComplaints = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/complaints/employee`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!Array.isArray(data)) { setComplaints([]); return; }
        setComplaints(data.map((c) => ({
          ...c, id: c._id || c.id,
          userName: c.citizenId?.name || "Unknown Citizen",
          urgency: c.urgency || "Normal", status: c.status || "Pending",
          date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-",
        })));
      } catch (err) { console.error("Connection Error:", err); }
    };
    fetchComplaints();
  }, []);

  const updateStatus = async (newStatus) => {
    if (!selectedComplaint) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/complaints/${selectedComplaint.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Status update failed");
      setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? { ...c, status: newStatus } : c));
      setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
    } catch (err) { console.error(err); alert("Failed to update status"); }
    finally { setActionLoading(false); }
  };

  const handleSort = (field) => {
    setSortOrder(sortBy === field && sortOrder === "asc" ? "desc" : "asc");
    setSortBy(field);
  };

  const refreshComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/complaints/employee`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setComplaints(data.map((c) => ({
        ...c, id: c._id || c.id,
        userName: c.citizenId?.name || "Unknown Citizen",
        urgency: c.urgency || "Normal", status: c.status || "Pending",
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-",
      })));
    } catch (err) { console.error(err); }
  };

  const countByUrgency = (l) => complaints.filter(c => c.urgency === l).length;
  const trendingComplaints = complaints.filter((c) => (c.reposts || 0) >= 2).length;

  const filtered = useMemo(() => {
    let data = complaints.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || [c.userName, c.title, c.category, c.urgency].some(v => (v || "").toLowerCase().includes(q));
      const matchUrgency = !urgencyFilter || c.urgency === urgencyFilter;
      const matchStatus = !statusFilter || c.status === statusFilter;
      return matchSearch && matchUrgency && matchStatus;
    });
    data = [...data].sort((a, b) => {
      const urgencyDiff = URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return (b.reposts || 0) - (a.reposts || 0);
    });
    return data;
  }, [complaints, search, urgencyFilter, statusFilter, sortBy, sortOrder]);

  const handleReplyChange = (id, value) => setReplies(prev => ({ ...prev, [id]: value }));

  const handleSendReply = async (id) => {
    const replyText = replies[id];
    if (!replyText) return;
    try {
      const employee = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/complaints/${id}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText, fromRole: "employee", username: employee.name }),
      });
      if (!response.ok) throw new Error("Failed to send reply");
      setSentStatus(prev => ({ ...prev, [id]: "Sent successfully ✅" }));
      setReplies(prev => ({ ...prev, [id]: "" }));
      await refreshComplaints();
      setTimeout(() => setSentStatus(prev => ({ ...prev, [id]: "" })), 2000);
    } catch (err) { console.error(err); alert("Failed to send reply to database."); }
  };

  const selectStyles = {
    padding: "8px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 10,
    fontSize: 12.5, color: COLORS.textPrimary, background: "#FFFFFF",
    outline: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
    appearance: "none", paddingRight: 28,
  };

  return (

    <div style={{

      minHeight: "100vh",

      background: "#DCEEFB",   /* ← LIGHT BLUE background */

      fontFamily: "'Manrope', sans-serif",

      padding: "32px 36px",

    }}>

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        body { background: #DCEEFB; }

        ::-webkit-scrollbar { width: 6px; }

        ::-webkit-scrollbar-track { background: #EAF4FB; }

        ::-webkit-scrollbar-thumb { background: #7ABCD6; border-radius: 999px; }

        tbody tr { transition: all 0.15s ease; }

        tbody tr:hover { background: rgba(18,78,102,0.06) !important; }

        @keyframes slideIn { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

        .panel-anim { animation: slideIn 0.25s cubic-bezier(0.22,1,0.36,1) both; }

        .card-anim  { animation: fadeUp  0.3s  cubic-bezier(0.22,1,0.36,1) both; }

      `}</style>



      {/* ── HEADER ── */}

      <div className="dashboard-topbar">

        <div className="dashboard-brand">

          <div className="dashboard-logo">

            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />

              <polyline points="14 2 14 8 20 8" />

              <line x1="16" y1="13" x2="8" y2="13" />

              <line x1="16" y1="17" x2="8" y2="17" />

              <polyline points="10 9 9 9 8 9" />

            </svg>

          </div>

          <div className="dashboard-brand-text">

            <h1>Complaint Management</h1>

            <p>MLA Portal · Employee View</p>

          </div>

        </div>

        <div className="dashboard-actions">

          <a href="/" className="dashboard-btn dashboard-btn-home">

            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">

              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />

              <polyline points="9 21 9 12 15 12 15 21" />

            </svg>

            Home

          </a>

          <button onClick={handleLogout} className="dashboard-btn dashboard-btn-logout">

            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">

              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />

              <polyline points="16 17 21 12 16 7" />

              <line x1="21" y1="12" x2="9" y2="12" />

            </svg>

            Logout

          </button>

        </div>

      </div>



      {/* ── STAT CARDS ── */}

      <div className="card-anim" style={{ display: "flex", gap: 12, marginBottom: 26, flexWrap: "wrap" }}>

        <StatCard label="Total Citizens" value={new Set(complaints.map(c => c.citizenId?._id)).size} icon={<MdGroup />} />

        <StatCard label="Total Complaints" value={complaints.length} icon={<MdAssignment />} />

        <StatCard label="Urgent" value={countByUrgency("Urgent")} icon={<MdWarning />} />

        <StatCard label="Medium" value={countByUrgency("Medium")} icon={<MdInfo />} />

        <StatCard label="Normal" value={countByUrgency("Normal")} icon={<MdCheckCircle />} />

        <StatCard label="Trending" value={trendingComplaints} icon={<MdRepeat />} />

      </div>



      {/* ── FILTERS ── */}

      <div style={{

        background: "#FFFFFF",

        border: `1px solid ${COLORS.border}`,

        color: COLORS.textPrimary,

        borderRadius: 14, padding: "13px 18px", marginBottom: 16,

        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",

        boxShadow: "0 1px 4px rgba(18,78,102,0.06)",

      }}>

        <div style={{ position: "relative", flex: 2, minWidth: 200 }}>

          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>

            <circle cx="6.5" cy="6.5" r="5" stroke="#7ABCD6" strokeWidth="1.5" />

            <path d="M10.5 10.5L13.5 13.5" stroke="#7ABCD6" strokeWidth="1.5" strokeLinecap="round" />

          </svg>

          <input

            type="text" placeholder="Search citizen, complaint, category..."

            value={search} onChange={e => setSearch(e.target.value)}

            style={{

              width: "100%", padding: "8px 12px 8px 34px",

              border: `1px solid ${COLORS.border}`, borderRadius: 10,

              fontSize: 13, color: COLORS.textPrimary, background: "#FFFFFF",

              outline: "none", fontFamily: "inherit", fontWeight: 500, transition: "border-color 0.15s",

            }}

            onFocus={e => e.target.style.borderColor = COLORS.accent}

            onBlur={e => e.target.style.borderColor = COLORS.border}

          />

        </div>

        <div style={{ position: "relative" }}>

          <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)} style={selectStyles}>

            <option value="">All Urgency</option>

            <option value="Urgent">Urgent</option>

            <option value="Medium">Medium</option>

            <option value="Normal">Normal</option>

          </select>

          <svg width="10" height="10" viewBox="0 0 10 6" fill="none" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>

            <path d="M1 1L5 5L9 1" stroke="#7ABCD6" strokeWidth="1.5" strokeLinecap="round" />

          </svg>

        </div>

        <div style={{ position: "relative" }}>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyles}>

            <option value="">All Status</option>

            <option value="Pending">Pending</option>

            <option value="In Progress">In Progress</option>

            <option value="Resolved">Resolved</option>

            <option value="Rejected">Rejected</option>

          </select>

          <svg width="10" height="10" viewBox="0 0 10 6" fill="none" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>

            <path d="M1 1L5 5L9 1" stroke="#7ABCD6" strokeWidth="1.5" strokeLinecap="round" />

          </svg>

        </div>

        <div style={{ marginLeft: "auto", fontSize: 12, color: COLORS.textMuted, fontWeight: 600 }}>

          <span style={{ color: COLORS.textPrimary }}>{filtered.length}</span> of {complaints.length} records

        </div>

      </div>



      {/* ── TABLE ── */}

      <div style={{

        background: "#FFFFFF",

        border: `1px solid ${COLORS.border}`,

        borderRadius: 16, overflow: "hidden",

        boxShadow: "0 4px 14px rgba(18,78,102,0.08)",

      }}>

        <div className="complaints-container">

          <div className="complaints-header">

            <div>Citizen</div><div>Title</div><div>Category</div>

            <div>Urgency</div><div>Status</div><div>Reposts</div><div>Date</div>

          </div>

          {filtered.map((c) => (

            <div

              key={c.id}

              className={`complaint-row ${selectedComplaint?.id === c.id ? "active" : ""}`}

              style={{ borderLeft: (c.reposts || 0) >= 10 ? "4px solid #B42318" : "4px solid transparent" }}

              onClick={() => setSelectedComplaint(c)}

            >

              <div data-label="Citizen">{c.userName}</div>

              <div data-label="Title">{c.title}</div>

              <div data-label="Category">{c.category}</div>

              <div data-label="Urgency">{c.urgency}</div>

              <div data-label="Status">{c.status}</div>

              <div data-label="Reposts">

                <span style={{

                  display: "inline-flex", alignItems: "center", gap: 6,

                  background: (c.reposts || 0) >= 10 ? "#FDE7E3" : "#EAF4FB",

                  color: (c.reposts || 0) >= 10 ? "#B42318" : "#124E66",

                  padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,

                }}>

                  <MdRepeat size={14} />{c.reposts || 0}

                </span>

              </div>

              <div data-label="Date">{c.date}</div>

            </div>

          ))}

        </div>



        {/* ── DETAIL PANEL ── */}

        {selectedComplaint && (

          <div className="panel-anim" style={{

            position: "fixed", top: 0, right: 0, width: 370, height: "100vh",

            background: "#FFFFFF",

            borderLeft: `1px solid ${COLORS.border}`,

            boxShadow: "0 10px 30px rgba(18,78,102,0.12)",

            padding: 0, zIndex: 999,

            fontFamily: "'Manrope', sans-serif",

            overflowY: "auto", display: "flex", flexDirection: "column",

          }}>

            {(() => {

              const isResolved = selectedComplaint.status === "Resolved";

              const isRejected = selectedComplaint.status === "Rejected";

              const isClosed = isResolved || isRejected;

              return (

                <>

                  {/* Panel header — now blue */}

                  <div style={{

                    background: "linear-gradient(135deg, #1A6B8A 0%, #a9d9eb  100%)",

                    borderBottom: `1px solid ${COLORS.border}`,

                    padding: "24px 22px 20px", position: "relative",

                  }}>

                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>

                      Complaint Detail

                    </div>

                    <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.8, fontFamily: "'Manrope', sans-serif", marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word", maxWidth: "100%" }}>

                      {selectedComplaint.title}

                    </div>

                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)", fontWeight: 500, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>

                      {selectedComplaint.category}

                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>

                      <Badge label={selectedComplaint.urgency} styleMap={urgencyStyle} />

                      <Badge label={selectedComplaint.status} styleMap={statusStyle} />

                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 14, marginBottom: 18, flexWrap: "wrap" }}>

                      <div style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF", padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>

                        <MdRepeat size={16} />{selectedComplaint.reposts || 0} Reposts

                      </div>

                      <div style={{

                        background: (selectedComplaint.reposts || 0) >= 2 ? "#FDE7E3" : "rgba(255,255,255,0.15)",

                        color: (selectedComplaint.reposts || 0) >= 2 ? "#B42318" : "#FFFFFF",

                        padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,

                        display: "flex", alignItems: "center", gap: 6,

                      }}>

                        {(selectedComplaint.reposts || 0) >= 2 ? <><MdLocalFireDepartment size={16} />High Public Attention</> : <><MdCampaign size={16} />Community Supported</>}

                      </div>

                    </div>

                  </div>



                  {/* Panel body */}

                  <div style={{ padding: "20px 22px", flex: 1, background: "#FFFFFF" }}>

                    {isResolved && (

                      <div style={{ background: "#EDFAF4", border: "1px solid #A7F3D0", color: "#166534", padding: "10px 14px", borderRadius: 10, fontSize: 12.5, marginBottom: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>

                        ✅ This complaint is resolved and closed for edits.

                      </div>

                    )}

                    {isRejected && (

                      <div style={{ background: "#FFF0EE", border: "1px solid #FECDC8", color: "#B91C1C", padding: "10px 14px", borderRadius: 10, fontSize: 12.5, marginBottom: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>

                        ❌ This complaint has been rejected and is closed.

                      </div>

                    )}

                    <div style={{ background: "#F0F8FD", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>

                      {selectedComplaint.details && (

                        <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.8, margin: "0 0 12px", fontWeight: 500, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>

                          {selectedComplaint.details}

                        </div>

                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "0.6fr 1fr", gap: "10px 0", fontSize: 12 }}>

                        {[["ID", selectedComplaint.id], ["Citizen", selectedComplaint.userName], ["Date", selectedComplaint.date]].map(([k, v]) => (

                          <React.Fragment key={k}>

                            <span style={{ color: COLORS.textMuted, fontWeight: 600 }}>{k}</span>

                            <span style={{ color: COLORS.textPrimary, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>

                          </React.Fragment>

                        ))}

                      </div>

                    </div>



                    <div style={{ marginBottom: 16 }}>

                      <label style={{ fontSize: 11, fontWeight: 700, color: isClosed ? "#C8C2B8" : COLORS.textMuted, letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>

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

                          border: `1px solid ${COLORS.border}`, borderRadius: 10,

                          fontSize: 13, outline: "none", fontFamily: "inherit",

                          background: isClosed ? "#F0F8FD" : "#FFFFFF",

                          color: isClosed ? "#94A3B8" : COLORS.textPrimary,

                          cursor: isClosed ? "not-allowed" : "text",

                          resize: "vertical", lineHeight: 1.5, fontWeight: 400, transition: "border-color 0.15s",

                        }}

                        onFocus={e => { if (!isClosed) e.target.style.borderColor = COLORS.accent; }}

                        onBlur={e => e.target.style.borderColor = COLORS.border}

                      />

                    </div>



                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

                      <button

                        disabled={isClosed}

                        onClick={() => handleSendReply(selectedComplaint.id)}

                        style={{

                          padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700,

                          background: isClosed ? "#EAF4FB" : "linear-gradient(135deg, #1A6B8A, #124E66)",

                          color: isClosed ? "#94A3B8" : "#fff",

                          border: "none", cursor: isClosed ? "not-allowed" : "pointer",

                          transition: "opacity 0.15s, transform 0.15s",

                          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,

                          boxShadow: isClosed ? "none" : "0 4px 12px rgba(18,78,102,0.22)",

                        }}

                        onMouseEnter={e => { if (!isClosed) e.currentTarget.style.opacity = "0.9"; }}

                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}

                      >

                        Send Reply

                      </button>



                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>

                        <button

                          disabled={actionLoading || isClosed || selectedComplaint.status === "In Progress"}

                          onClick={() => updateStatus("In Progress")}

                          style={{

                            padding: "9px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,

                            background: (isClosed || selectedComplaint.status === "In Progress") ? "#F0F8FD" : "#EAF4FB",

                            color: (isClosed || selectedComplaint.status === "In Progress") ? "#94A3B8" : "#124E66",

                            border: `1px solid ${COLORS.border}`,

                            cursor: (isClosed || actionLoading || selectedComplaint.status === "In Progress") ? "not-allowed" : "pointer",

                            transition: "background 0.15s",

                          }}

                          onMouseEnter={e => { if (!isClosed && selectedComplaint.status !== "In Progress") e.currentTarget.style.background = "#D6EAF5"; }}

                          onMouseLeave={e => { if (!isClosed && selectedComplaint.status !== "In Progress") e.currentTarget.style.background = "#EAF4FB"; }}

                        >

                          In Progress

                        </button>

                        <button

                          disabled={actionLoading || isClosed}

                          onClick={() => updateStatus("Resolved")}

                          style={{

                            padding: "9px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,

                            background: isClosed ? "#F0F8FD" : "#EDFAF4",

                            color: isClosed ? "#94A3B8" : "#167346",

                            border: "1px solid #A7F3D0",

                            cursor: (isClosed || actionLoading) ? "not-allowed" : "pointer",

                            transition: "background 0.15s",

                          }}

                          onMouseEnter={e => { if (!isClosed) e.currentTarget.style.background = "#D1FAE5"; }}

                          onMouseLeave={e => { if (!isClosed) e.currentTarget.style.background = "#EDFAF4"; }}

                        >

                          Resolve

                        </button>

                      </div>



                      <button

                        disabled={actionLoading || isClosed}

                        onClick={() => updateStatus("Rejected")}

                        style={{

                          padding: "9px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,

                          background: isClosed ? "#F0F8FD" : "#FFF0EE",

                          color: isClosed ? "#94A3B8" : "#B91C1C",

                          border: "1px solid #E6B8AF",

                          cursor: (isClosed || actionLoading) ? "not-allowed" : "pointer",

                          transition: "background 0.15s",

                        }}

                        onMouseEnter={e => { if (!isClosed) e.currentTarget.style.background = "#FFE4E0"; }}

                        onMouseLeave={e => { if (!isClosed) e.currentTarget.style.background = "#FFF0EE"; }}

                      >

                        Reject Complaint

                      </button>

                    </div>



                    <button

                      onClick={() => setSelectedComplaint(null)}

                      style={{

                        marginTop: 14, width: "100%", padding: "9px",

                        background: "#EAF4FB", border: `1px solid ${COLORS.border}`,

                        borderRadius: 10, cursor: "pointer",

                        fontSize: 12.5, fontWeight: 600, color: COLORS.accent, transition: "background 0.15s",

                      }}

                      onMouseEnter={e => e.currentTarget.style.background = "#D6EAF5"}

                      onMouseLeave={e => e.currentTarget.style.background = "#EAF4FB"}

                    >

                      Close

                    </button>

                  </div>

                </>

              );

            })()}

          </div>

        )}

      </div>

    </div>

  );
}