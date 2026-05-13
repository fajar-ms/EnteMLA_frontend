import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const clr = {
  bg: "#F8FAFC", card: "#FFFFFF", border: "#E2E8F0", text: "#0F172A",
  muted: "#64748B", hint: "#94A3B8", primary: "#2563EB",
  danger: "#EF4444", dangerBg: "#FEF2F2", dangerText: "#B91C1C",
  warning: "#F59E0B", warningBg: "#FFFBEB", warningText: "#92400E",
  success: "#22C55E", successBg: "#F0FDF4", successText: "#166534",
  blue: "#EFF6FF", blueText: "#1D4ED8",
  inProgress: "#FFF7ED", inProgressText: "#C2410C",
};
const shadow = "0 1px 4px rgba(0,0,0,0.06)";
const R = { sm: 8, md: 12, lg: 16 };

// ── Atoms ──────────────────────────────────────────────────────
const UrgencyBadge = ({ level }) => {
  const map = {
    Urgent: { bg: clr.dangerBg,  color: clr.dangerText,  dot: clr.danger },
    Medium: { bg: clr.warningBg, color: clr.warningText, dot: clr.warning },
    Normal: { bg: clr.successBg, color: clr.successText, dot: clr.success },
  };
  const s = map[level] || map.Normal;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, letterSpacing: "0.4px", padding: "3px 9px", borderRadius: 99 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {level || "Normal"}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Pending:       { bg: clr.blue,       color: clr.blueText },
    "In Progress": { bg: clr.inProgress, color: clr.inProgressText },
    Resolved:      { bg: clr.successBg,  color: clr.successText },
    Rejected:      { bg: clr.dangerBg,   color: clr.dangerText },
  };
  const s = map[status] || { bg: "#F1F5F9", color: clr.muted };
  return (
    <span style={{ display: "inline-block", background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, letterSpacing: "0.4px", padding: "3px 9px", borderRadius: 99 }}>
      {status || "Pending"}
    </span>
  );
};

const AvatarCircle = ({ name }) => {
  const initials = (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: `hsl(${hue},55%,88%)`, color: `hsl(${hue},55%,32%)`, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {initials}
    </div>
  );
};

const StatCard = ({ label, value, color, icon }) => (
  <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: R.lg, padding: "16px 20px", boxShadow: shadow, display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
    <div style={{ width: 42, height: 42, borderRadius: R.md, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, color: clr.hint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    </div>
  </div>
);

const selectSt = {
  width: "100%", padding: "8px 10px", fontSize: 13, color: clr.text,
  background: "#F8FAFC", border: `1px solid ${clr.border}`,
  borderRadius: R.sm, outline: "none", fontFamily: "inherit", cursor: "pointer",
};

const labelSt = {
  fontSize: 11, fontWeight: 700, color: clr.hint,
  letterSpacing: "0.5px", textTransform: "uppercase",
  display: "block", marginBottom: 5,
};

const urgencyScore = (u) => u === "Urgent" ? 1 : u === "Medium" ? 2 : 3;

// ── Main ───────────────────────────────────────────────────────
export default function MlaComplaintDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({ urgency: "", category: "", ward: "", status: "" });
  const [comment, setComment] = useState("");

  useEffect(() => {
  setLoading(true);

  // Fetch from your NestJS backend (Port 3001)
  Promise.all([
    fetch("http://localhost:3001/complaints").then(r => {
      if (!r.ok) throw new Error("Failed to fetch complaints");
      return r.json();
    }),
    
    fetch("http://localhost:3001/api/users").then(r => r.json()).catch(() => []),
  ])
    .then(([complaintsData, usersData]) => {
      // Map Mongoose data to your UI structure
      const formattedComplaints = Array.isArray(complaintsData) 
        ? complaintsData.map(c => ({
            ...c,
            id: c._id, // Use MongoDB _id
            // If citizenId was populated by NestJS, use the name; otherwise fallback
            userName: c.citizenId?.name || "Unknown Citizen",
            date: new Date(c.createdAt).toLocaleDateString(),
            ward: c.ward || "General", // Fallback if ward isn't in your schema yet
          }))
        : [];

      setComplaints(formattedComplaints);
      setUsers(Array.isArray(usersData) ? usersData : []);

      // Automatically select the first complaint if available
      if (formattedComplaints.length > 0) {
        setSelectedComplaint(formattedComplaints[0]);
      }
      setLoading(false);
    })
    .catch((err) => {
      setError("Could not connect to the server. Please ensure the NestJS backend is running on port 3001.");
      setLoading(false);
    });
}, []);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const activeFilters = Object.values(filters).filter(Boolean).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ── Derive unique filter options dynamically from real data ──
  const uniqueCategories = [...new Set(complaints.map(c => c.category).filter(Boolean))];
  const uniqueWards      = [...new Set(complaints.map(c => c.ward).filter(Boolean))];
  const uniqueStatuses   = [...new Set(complaints.map(c => c.status).filter(Boolean))];

  const filteredComplaints = useMemo(() => {
    return complaints
      .filter(c => !filters.urgency  || c.urgency  === filters.urgency)
      .filter(c => !filters.category || c.category === filters.category)
      .filter(c => !filters.ward     || c.ward     === filters.ward)
      .filter(c => !filters.status   || c.status   === filters.status)
      .sort((a, b) => urgencyScore(a.urgency) - urgencyScore(b.urgency));
  }, [complaints, filters]);

  const totalComplaints  = complaints.length;
  const urgentIssues     = complaints.filter(c => c.urgency === "Urgent").length;
  const pendingCount     = complaints.filter(c => c.status === "Pending").length;
  const resolvedCount    = complaints.filter(c => c.status === "Resolved").length;

  // ── Loading state ──
  if (loading) return (
    <div style={{ minHeight: "100vh", background: clr.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${clr.border}`, borderTopColor: clr.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ fontSize: 13, color: clr.muted, margin: 0 }}>Loading complaints...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Error state ──
  if (error) return (
    <div style={{ minHeight: "100vh", background: clr.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: R.lg, padding: "32px 40px", textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: clr.text, margin: "0 0 8px" }}>Connection Error</h2>
        <p style={{ fontSize: 13, color: clr.muted, margin: "0 0 20px", lineHeight: 1.6 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: "9px 24px", background: clr.primary, color: "#fff", border: "none", borderRadius: R.sm, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    </div>
  );
 const updateStatus = async (newStatus) => {
  if (!selectedComplaint) return;
  setActionLoading(true);

  try {
    const response = await fetch(`http://localhost:3001/complaints/${selectedComplaint.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          comment: comment,
          userId: selectedComplaint.citizenId?._id || selectedComplaint.citizenId,
      }),
    });

    if (response.ok) {
      // Update local state list
      setComplaints(prev =>
        prev.map(c =>
          c.id === selectedComplaint.id
          ? { ...c, status: newStatus, comment }
          : c
        )
      );
      // Update Detail Panel
      setSelectedComplaint(prev => ({
        ...prev,
        status: newStatus,
        comment,
      }));
      
    } else {
      alert("Failed to update status in database.");
    }
  } catch (err) {
    alert("Network error. Could not update status.");
  } finally {
    setActionLoading(false);
  }
};

const sendMessage = async () => {
  if (!selectedComplaint || !comment.trim()) {
    alert("Please type a message");
    return;
  }

  setActionLoading(true);

  try {
    const response = await fetch(
      `http://localhost:3001/complaints/${selectedComplaint.id}/message`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: comment,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();

    // safer fallback
    const updatedReplies = data.replies || data;

    setSelectedComplaint(prev => ({
      ...prev,
      replies: updatedReplies,
    }));

    setComment("");
    alert("Message sent successfully");

  } catch (err) {
    console.log(err);
    alert("Failed to send message");
  } finally {
    setActionLoading(false);
  }
};


  return (
    <div style={{ minHeight: "100vh", background: clr.bg, padding: "24px 28px", fontFamily: "'DM Sans','Segoe UI',sans-serif", fontSize: 14, color: clr.text }}>

      {/* ── Header ── */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  }}
>
  <div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 3,
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: clr.primary,
          boxShadow: `0 0 0 3px ${clr.blue}`,
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: clr.primary,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}
      >
        MLA Portal · Live
      </span>
    </div>

    <h1
      style={{
        fontSize: 24,
        fontWeight: 700,
        margin: 0,
        letterSpacing: "-0.4px",
      }}
    >
      Complaint Dashboard
    </h1>

    <p style={{ fontSize: 12, color: clr.hint, margin: "3px 0 0" }}>
      {users.length > 0
        ? `${users.length} registered citizens · `
        : ""}
      Sorted by urgency
    </p>
  </div>

  {/* Right Side */}
  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
    
    {/* Complaint Count */}
    <div
      style={{
        fontSize: 12,
        color: clr.hint,
        background: clr.card,
        border: `1px solid ${clr.border}`,
        borderRadius: R.md,
        padding: "7px 14px",
        boxShadow: shadow,
      }}
    >
      {filteredComplaints.length} of {totalComplaints} complaints
    </div>

    {/* Logout Button */}
    <button
      onClick={handleLogout}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 18px",
        height: 42,
        borderRadius: R.md,
        border: `1.5px solid ${clr.border}`,
        background: clr.card,
        color: clr.danger,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: shadow,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = clr.dangerBg;
        e.currentTarget.style.borderColor = "#FECDD3";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = clr.card;
        e.currentTarget.style.borderColor = clr.border;
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>

      Logout
    </button>
  </div>
</div>
      {/* ── Stat Cards ── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Total Complaints"   value={totalComplaints} color={clr.primary} icon="📋" />
        <StatCard label="Urgent Issues"      value={urgentIssues}    color={clr.danger}  icon="🔴" />
        <StatCard label="Pending"            value={pendingCount}    color={clr.warning} icon="⏳" />
        <StatCard label="Resolved"           value={resolvedCount}   color={clr.success} icon="✅" />
      </div>

      {/* ── 3-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 16, alignItems: "start" }}>

        {/* ── LEFT: Filters ── */}
        <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: R.lg, padding: "18px 16px", boxShadow: shadow }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ ...labelSt, marginBottom: 0 }}>Filters</p>
            {activeFilters > 0 && (
              <button onClick={() => setFilters({ urgency: "", category: "", ward: "", status: "" })}
                style={{ fontSize: 11, color: clr.dangerText, background: clr.dangerBg, border: "none", borderRadius: 99, padding: "2px 9px", cursor: "pointer", fontWeight: 600 }}>
                Clear {activeFilters}
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Urgency — static options */}
            <div>
              <label style={labelSt}>Urgency</label>
              <select style={selectSt} value={filters.urgency} onChange={e => setFilter("urgency", e.target.value)}>
                <option value="">All</option>
                <option value="Urgent">Urgent</option>
                <option value="Medium">Medium</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
            {/* Category — dynamic from data */}
            <div>
              <label style={labelSt}>Category</label>
              <select style={selectSt} value={filters.category} onChange={e => setFilter("category", e.target.value)}>
                <option value="">All</option>
                {uniqueCategories.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {/* Ward — dynamic from data */}
            <div>
              <label style={labelSt}>Ward / Area</label>
              <select style={selectSt} value={filters.ward} onChange={e => setFilter("ward", e.target.value)}>
                <option value="">All</option>
                {uniqueWards.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {/* Status — dynamic from data */}
            <div>
              <label style={labelSt}>Status</label>
              <select style={selectSt} value={filters.status} onChange={e => setFilter("status", e.target.value)}>
                <option value="">All</option>
                {uniqueStatuses.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── CENTRE: Table ── */}
        <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: R.lg, boxShadow: shadow, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${clr.border}` }}>
            <p style={{ ...labelSt, marginBottom: 2 }}>All Complaints</p>
            <p style={{ fontSize: 12, color: clr.hint, margin: 0 }}>Click a row to inspect · Sorted by urgency</p>
          </div>

          {filteredComplaints.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: clr.hint, fontSize: 13 }}>
              No complaints match the current filters.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "22%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: `1px solid ${clr.border}` }}>
                  {["Citizen", "Complaint", "Category", "Urgency", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: clr.hint, letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c, i) => {
                  const isSelected = selectedComplaint?.id === c.id;
                  return (
                    <tr key={c.id}
                      onClick={() => {
                        setSelectedComplaint(c);
                        setComment("");
                      }}
                      style={{ borderBottom: i < filteredComplaints.length - 1 ? "1px solid #F1F5F9" : "none", background: isSelected ? clr.blue : "transparent", cursor: "pointer", transition: "background 0.1s" }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#F8FAFC"; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <AvatarCircle name={c.userName} />
                          <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.userName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                        <div style={{ fontSize: 11, color: clr.hint, marginTop: 2 }}>{c.id} · {c.ward}</div>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: clr.muted }}>{c.category}</td>
                      <td style={{ padding: "11px 14px" }}><UrgencyBadge level={c.urgency} /></td>
                      <td style={{ padding: "11px 14px" }}><StatusBadge status={c.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div style={{ padding: "10px 18px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: 12, color: clr.hint }}>
              Showing <strong style={{ color: clr.muted }}>{filteredComplaints.length}</strong> complaint{filteredComplaints.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── RIGHT: Detail Panel ── */}
        <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: R.lg, padding: "18px", boxShadow: shadow }}>
          <p style={{ ...labelSt, marginBottom: 16 }}>Complaint Details</p>

          {selectedComplaint ? (
            <div>
              <div style={{ marginBottom: 14 }}>
                
                <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{selectedComplaint.title}</div>
                <div style={{ fontSize: 11, color: clr.hint }}>{selectedComplaint.id} · {selectedComplaint.date}</div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <UrgencyBadge level={selectedComplaint.urgency} />
                <StatusBadge status={selectedComplaint.status} />
              </div>

              <div style={{ height: 1, background: clr.border, marginBottom: 14 }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                {[
                  { label: "Citizen",  val: selectedComplaint.userName },
                  { label: "Category", val: selectedComplaint.category },
                  { label: "Ward",     val: selectedComplaint.ward },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: clr.hint, textTransform: "uppercase", letterSpacing: "0.4px" }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: clr.text, fontWeight: 500 }}>{row.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: clr.border, marginBottom: 14 }} />

              {selectedComplaint.details && (
                <div style={{ background: "#F8FAFC", border: `1px solid ${clr.border}`, borderRadius: R.sm, padding: "10px 12px", marginBottom: 18 }}>
                  <p style={{ fontSize: 12, color: clr.muted, margin: 0, lineHeight: 1.7 }}>{selectedComplaint.details}</p>
                </div>
              )}
              {/* Tracking / Replies Section */}
<div style={{ marginTop: 14 }}>
  <div style={{ fontSize: 11, fontWeight: 700, color: clr.hint, marginBottom: 8 }}>
    Tracking / Messages
  </div>

  {selectedComplaint?.replies?.length > 0 ? (
    selectedComplaint.replies.map((r, idx) => (
      <div
        key={idx}
        style={{
          background: "#F8FAFC",
          border: `1px solid ${clr.border}`,
          borderRadius: 8,
          padding: "8px 10px",
          marginBottom: 8,
          fontSize: 12,
        }}
      >
        <div style={{ fontWeight: 600, color: clr.text }}>
          {r.from || "MLA"}
        </div>
        <div style={{ color: clr.muted }}>{r.text}</div>
        <div style={{ fontSize: 10, color: clr.hint }}>
          {new Date(r.date).toLocaleString()}
        </div>
      </div>
    ))
  ) : (
    <div style={{ fontSize: 12, color: clr.hint }}>
      No tracking messages yet
    </div>
  )}
</div>
              {/* MLA Comment Box */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: clr.hint,
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  MLA Comment / Reason
                </label>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type reason, response, or action taken..."
                  rows={4}
                  style={{
                    width: "100%",
                    resize: "none",
                    border: `1px solid ${clr.border}`,
                    borderRadius: R.sm,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                    background: "#F8FAFC",
                    color: clr.text,
                    boxSizing: "border-box",
                    lineHeight: 1.5,
                  }}
                />
                <button
                  disabled={actionLoading}
                  onClick={sendMessage}
                  style={{
                    padding: "10px 0",
                    borderRadius: R.sm,
                    background: clr.primary,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    opacity: actionLoading ? 0.7 : 1,
                    marginBottom: 10,
                  }}
                >
                  Send Message
</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  disabled={actionLoading || selectedComplaint.status === "In Progress"}
                  onClick={() => updateStatus("In Progress")}
                  style={{ padding: "9px 0", borderRadius: R.sm, background: selectedComplaint.status === "In Progress" ? "#E2E8F0" : clr.primary, color: selectedComplaint.status === "In Progress" ? clr.hint : "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: selectedComplaint.status === "In Progress" ? "not-allowed" : "pointer", opacity: actionLoading ? 0.7 : 1 }}>
                  {actionLoading ? "Updating..." : "Mark In Progress"}
                </button>
                <button
                  disabled={actionLoading || selectedComplaint.status === "Resolved"}
                  onClick={() => updateStatus("Resolved")}
                  style={{ padding: "9px 0", borderRadius: R.sm, background: selectedComplaint.status === "Resolved" ? "#E2E8F0" : clr.successBg, color: selectedComplaint.status === "Resolved" ? clr.hint : clr.successText, fontSize: 13, fontWeight: 700, border: `1px solid ${selectedComplaint.status === "Resolved" ? clr.border : "#BBF7D0"}`, cursor: selectedComplaint.status === "Resolved" ? "not-allowed" : "pointer", opacity: actionLoading ? 0.7 : 1 }}>
                  Mark Resolved
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => updateStatus("Forwarded")}
                  style={{ padding: "9px 0", borderRadius: R.sm, background: clr.warningBg, color: clr.warningText, fontSize: 13, fontWeight: 700, border: `1px solid #FDE68A`, cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.7 : 1 }}>
                  Forward to Department
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={clr.hint} strokeWidth="1.5" style={{ marginBottom: 8 }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <p style={{ fontSize: 12, color: clr.hint, margin: 0 }}>Select a complaint from<br />the table to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 