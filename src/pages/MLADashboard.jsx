import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Design Tokens ──────────────────────────────────────────────
const clr = {
  bg: "#F5F0E8",
  paper: "#FDFAF4",
  card: "#FFFFFF",
  border: "#E8DFD0",
  borderLight: "#F0E9DC",
  text: "#1A1410",
  textMid: "#4A3F35",
  muted: "#8C7B6B",
  hint: "#B5A595",
  primary: "#1A4A8C",
  primaryLight: "#EEF3FA",
  accent: "#C4401C",
  accentLight: "#FDF1EE",
  gold: "#B8860B",
  goldLight: "#FDF8EE",
  success: "#1A6B3C",
  successLight: "#EEF7F2",
  warning: "#C47A1C",
  warningLight: "#FDF5EE",
  inProgress: "#5B3A8C",
  inProgressLight: "#F5F0FB",
};

const font = {
  display: "'Playfair Display', Georgia, serif",
  body: "'DM Sans', 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// ── Atoms ──────────────────────────────────────────────────────
const UrgencyBadge = ({ level }) => {
  const map = {
    Urgent: { bg: clr.accentLight, color: clr.accent, label: "● Urgent" },
    Medium: { bg: clr.warningLight, color: clr.warning, label: "● Medium" },
    Normal: { bg: clr.successLight, color: clr.success, label: "● Normal" },
  };
  const s = map[level] || map.Normal;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.8px",
      padding: "3px 9px", borderRadius: 3,
      fontFamily: font.body, textTransform: "uppercase",
    }}>
      {s.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Pending:       { bg: clr.primaryLight, color: clr.primary },
    "In Progress": { bg: clr.inProgressLight, color: clr.inProgress },
    Resolved:      { bg: clr.successLight, color: clr.success },
    Rejected:      { bg: clr.accentLight, color: clr.accent },
    Forwarded:     { bg: clr.goldLight, color: clr.gold },
  };
  const s = map[status] || { bg: "#F1EDE5", color: clr.muted };
  return (
    <span style={{
      display: "inline-block", background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.8px",
      padding: "3px 9px", borderRadius: 3,
      fontFamily: font.body, textTransform: "uppercase",
    }}>
      {status || "Pending"}
    </span>
  );
};

const AvatarCircle = ({ name }) => {
  const initials = (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},30%,88%)`,
      color: `hsl(${hue},40%,30%)`,
      fontSize: 11, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: font.body, border: `1.5px solid hsl(${hue},20%,80%)`,
    }}>
      {initials}
    </div>
  );
};

const StatCard = ({ label, value, color, icon, sub }) => (
  <div style={{
    background: clr.paper, border: `1px solid ${clr.border}`,
    borderTop: `3px solid ${color}`,
    borderRadius: 6, padding: "18px 20px",
    flex: 1, minWidth: 0,
    position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: 12, right: 16,
      fontSize: 28, opacity: 0.08, lineHeight: 1,
    }}>{icon}</div>
    <div style={{
      fontSize: 10, fontFamily: font.body, fontWeight: 700,
      color: clr.muted, letterSpacing: "1.2px",
      textTransform: "uppercase", marginBottom: 8,
    }}>{label}</div>
    <div style={{
      fontSize: 36, fontFamily: font.display,
      fontWeight: 700, color, lineHeight: 1, marginBottom: 4,
    }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: clr.hint, fontFamily: font.body }}>{sub}</div>}
  </div>
);

const selectSt = {
  width: "100%", padding: "8px 10px",
  fontSize: 12, color: clr.text,
  background: clr.paper, border: `1px solid ${clr.border}`,
  borderRadius: 4, outline: "none",
  fontFamily: font.body, cursor: "pointer",
  letterSpacing: "0.3px",
};

const labelSt = {
  fontSize: 9, fontWeight: 700, color: clr.hint,
  letterSpacing: "1.4px", textTransform: "uppercase",
  display: "block", marginBottom: 6, fontFamily: font.body,
};

const urgencyScore = (u) => u === "Urgent" ? 1 : u === "Medium" ? 2 : 3;

// ── Main Component ─────────────────────────────────────────────
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
    // Google Fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:3001/complaints").then(r => {
        if (!r.ok) throw new Error("Failed to fetch complaints");
        return r.json();
      }),
      fetch("http://localhost:3001/api/users").then(r => r.json()).catch(() => []),
    ])
      .then(([complaintsData, usersData]) => {
        const formattedComplaints = Array.isArray(complaintsData)
          ? complaintsData.map(c => ({
              ...c,
              id: c._id,
              userName: c.citizenId?.name || "Unknown Citizen",
              date: new Date(c.createdAt).toLocaleDateString(),
              ward: c.ward || "General",
            }))
          : [];
        setComplaints(formattedComplaints);
        setUsers(Array.isArray(usersData) ? usersData : []);
        if (formattedComplaints.length > 0) setSelectedComplaint(formattedComplaints[0]);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not connect to the server. Please ensure the NestJS backend is running on port 3001.");
        setLoading(false);
      });
  }, []);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const activeFilters = Object.values(filters).filter(Boolean).length;
  const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); };

  const uniqueCategories = [...new Set(complaints.map(c => c.category).filter(Boolean))];
  const uniqueWards      = [...new Set(complaints.map(c => c.ward).filter(Boolean))];
  const uniqueStatuses   = [...new Set(complaints.map(c => c.status).filter(Boolean))];

  const filteredComplaints = useMemo(() => complaints
    .filter(c => !filters.urgency  || c.urgency  === filters.urgency)
    .filter(c => !filters.category || c.category === filters.category)
    .filter(c => !filters.ward     || c.ward     === filters.ward)
    .filter(c => !filters.status   || c.status   === filters.status)
    .sort((a, b) => urgencyScore(a.urgency) - urgencyScore(b.urgency)),
  [complaints, filters]);

  const totalComplaints = complaints.length;
  const urgentIssues    = complaints.filter(c => c.urgency === "Urgent").length;
  const pendingCount    = complaints.filter(c => c.status === "Pending").length;
  const resolvedCount   = complaints.filter(c => c.status === "Resolved").length;

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: "100vh", background: clr.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.body }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: font.display, fontSize: 32, color: clr.text, marginBottom: 12, letterSpacing: "-0.5px" }}>
          Loading
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: clr.primary, opacity: 0.4,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{ minHeight: "100vh", background: clr.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.body }}>
      <div style={{ background: clr.paper, border: `1px solid ${clr.border}`, borderTop: `3px solid ${clr.accent}`, borderRadius: 6, padding: "36px 44px", textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontFamily: font.display, fontSize: 24, color: clr.text, marginBottom: 12 }}>Connection Error</div>
        <p style={{ fontSize: 13, color: clr.muted, marginBottom: 24, lineHeight: 1.7 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: "10px 28px", background: clr.primary, color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: font.body }}>
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
        body: JSON.stringify({ comment, userId: selectedComplaint.citizenId?._id || selectedComplaint.citizenId }),
      });
      if (response.ok) {
        setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? { ...c, status: newStatus, comment } : c));
        setSelectedComplaint(prev => ({ ...prev, status: newStatus, comment }));
      } else { alert("Failed to update status in database."); }
    } catch { alert("Network error. Could not update status."); }
    finally { setActionLoading(false); }
  };

  const sendMessage = async () => {
    if (!selectedComplaint || !comment.trim()) { alert("Please type a message"); return; }
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/complaints/${selectedComplaint.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      setSelectedComplaint(prev => ({ ...prev, replies: data.replies || data }));
      setComment("");
      alert("Message sent successfully");
    } catch { alert("Failed to send message"); }
    finally { setActionLoading(false); }
  };

  // ── Render ──
  return (
    <div style={{ minHeight: "100vh", background: clr.bg, fontFamily: font.body, color: clr.text }}>
      <style>{`
        * { box-sizing: border-box; }
        ::selection { background: ${clr.primaryLight}; color: ${clr.primary}; }
        textarea:focus { border-color: ${clr.primary} !important; outline: none; }
        select:focus { border-color: ${clr.primary} !important; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${clr.border}; border-radius: 99px; }
        .complaint-row { transition: background 0.12s; }
        .complaint-row:hover { background: ${clr.bg} !important; }
        .action-btn { transition: opacity 0.15s, transform 0.1s; }
        .action-btn:hover:not(:disabled) { opacity: 0.88 !important; transform: translateY(-1px); }
        .action-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      {/* ── Masthead / Header ── */}
      <header style={{
        background: clr.paper,
        borderBottom: `1px solid ${clr.border}`,
        padding: "0 32px",
      }}>
        {/* Top strip */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 0",
          borderBottom: `1px solid ${clr.borderLight}`,
          fontSize: 10, color: clr.hint, letterSpacing: "1px", textTransform: "uppercase",
        }}>
          <span style={{ fontFamily: font.body }}>
            Government of Kerala · Member of Legislative Assembly
          </span>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
              Live
            </span>
            {users.length > 0 && <span>{users.length} citizens registered</span>}
            <span style={{
              background: clr.primaryLight, color: clr.primary,
              padding: "2px 10px", borderRadius: 3, fontWeight: 700,
            }}>
              {filteredComplaints.length} / {totalComplaints} shown
            </span>
          </div>
        </div>

        {/* Main header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 0",
        }}>
          <div>
            <h1 style={{
              fontFamily: font.display, fontSize: 30, fontWeight: 700,
              margin: 0, letterSpacing: "-0.5px", color: clr.text,
              lineHeight: 1.1,
            }}>
              Complaint Registry
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: clr.muted, letterSpacing: "0.2px" }}>
              Constituency management · Sorted by urgency
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 20px", height: 38,
              borderRadius: 4, border: `1px solid ${clr.border}`,
              background: "transparent", color: clr.accent,
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              letterSpacing: "0.8px", textTransform: "uppercase",
              fontFamily: font.body,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = clr.accentLight; e.currentTarget.style.borderColor = clr.accent; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = clr.border; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ padding: "24px 32px" }}>

        {/* ── Stat Cards ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Complaints" value={totalComplaints} color={clr.primary} icon="📋" sub="All time" />
          <StatCard label="Urgent Issues"    value={urgentIssues}   color={clr.accent}  icon="🔴" sub="Needs attention" />
          <StatCard label="Pending"          value={pendingCount}   color={clr.warning} icon="⏳" sub="Awaiting action" />
          <StatCard label="Resolved"         value={resolvedCount}  color={clr.success} icon="✅" sub="Completed" />
        </div>

        {/* ── 3-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 300px", gap: 16, alignItems: "start" }}>

          {/* ── LEFT: Filters ── */}
          <div style={{
            background: clr.paper, border: `1px solid ${clr.border}`,
            borderRadius: 6, overflow: "hidden",
          }}>
            <div style={{
              padding: "12px 16px", borderBottom: `1px solid ${clr.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "#F0EAE0",
            }}>
              <span style={{ ...labelSt, marginBottom: 0, color: clr.textMid }}>Filters</span>
              {activeFilters > 0 && (
                <button
                  onClick={() => setFilters({ urgency: "", category: "", ward: "", status: "" })}
                  style={{
                    fontSize: 9, color: clr.accent, background: clr.accentLight,
                    border: `1px solid ${clr.accent}20`, borderRadius: 3,
                    padding: "2px 7px", cursor: "pointer", fontWeight: 700,
                    letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: font.body,
                  }}
                >
                  Clear {activeFilters}
                </button>
              )}
            </div>

            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Urgency", key: "urgency", options: ["Urgent", "Medium", "Normal"] },
                { label: "Category", key: "category", options: uniqueCategories },
                { label: "Ward / Area", key: "ward", options: uniqueWards },
                { label: "Status", key: "status", options: uniqueStatuses },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label style={labelSt}>{label}</label>
                  <select style={selectSt} value={filters[key]} onChange={e => setFilter(key, e.target.value)}>
                    <option value="">All</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* ── CENTRE: Table ── */}
          <div style={{
            background: clr.paper, border: `1px solid ${clr.border}`,
            borderRadius: 6, overflow: "hidden",
          }}>
            <div style={{
              padding: "13px 18px", borderBottom: `1px solid ${clr.border}`,
              background: "#F0EAE0",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <span style={{ ...labelSt, marginBottom: 0, color: clr.textMid }}>All Complaints</span>
              </div>
              <span style={{ fontSize: 11, color: clr.muted, fontFamily: font.body }}>
                Click a row to inspect
              </span>
            </div>

            {filteredComplaints.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center" }}>
                <div style={{ fontFamily: font.display, fontSize: 20, color: clr.hint, marginBottom: 8 }}>No results</div>
                <p style={{ fontSize: 12, color: clr.hint, margin: 0 }}>No complaints match the current filters.</p>
              </div>
            ) : (
              <>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "30%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "20%" }} />
                  </colgroup>
                  <thead>
                    <tr style={{ background: "#F5F0E8", borderBottom: `1px solid ${clr.border}` }}>
                      {["Citizen", "Complaint", "Category", "Urgency", "Status"].map(h => (
                        <th key={h} style={{
                          padding: "9px 14px", textAlign: "left",
                          fontSize: 9, fontWeight: 700, color: clr.muted,
                          letterSpacing: "1.2px", textTransform: "uppercase",
                          fontFamily: font.body,
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((c, i) => {
                      const isSelected = selectedComplaint?.id === c.id;
                      return (
                        <tr
                          key={c.id}
                          className="complaint-row"
                          onClick={() => { setSelectedComplaint(c); setComment(""); }}
                          style={{
                            borderBottom: i < filteredComplaints.length - 1 ? `1px solid ${clr.borderLight}` : "none",
                            background: isSelected ? clr.primaryLight : "transparent",
                            cursor: "pointer",
                            borderLeft: isSelected ? `3px solid ${clr.primary}` : "3px solid transparent",
                          }}
                        >
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <AvatarCircle name={c.userName} />
                              <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.userName}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: font.body }}>{c.title}</div>
                            <div style={{ fontSize: 10, color: clr.hint, marginTop: 2, fontFamily: font.mono, letterSpacing: "0.3px" }}>
                              {c.ward}
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: 12, color: clr.muted }}>{c.category}</td>
                          <td style={{ padding: "12px 14px" }}><UrgencyBadge level={c.urgency} /></td>
                          <td style={{ padding: "12px 14px" }}><StatusBadge status={c.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div style={{ padding: "10px 18px", borderTop: `1px solid ${clr.borderLight}`, background: "#F5F0E8" }}>
                  <span style={{ fontSize: 11, color: clr.hint, fontFamily: font.body }}>
                    <strong style={{ color: clr.muted }}>{filteredComplaints.length}</strong> complaint{filteredComplaints.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── RIGHT: Detail Panel ── */}
          <div style={{
            background: clr.paper, border: `1px solid ${clr.border}`,
            borderRadius: 6, overflow: "hidden",
          }}>
            <div style={{
              padding: "13px 18px", borderBottom: `1px solid ${clr.border}`,
              background: "#F0EAE0",
            }}>
              <span style={{ ...labelSt, marginBottom: 0, color: clr.textMid }}>Details</span>
            </div>

            {selectedComplaint ? (
              <div style={{ padding: 18 }}>

                {/* Title & Meta */}
                <div style={{ marginBottom: 16 }}>
                  <h2 style={{
                    fontFamily: font.display, fontSize: 18, fontWeight: 700,
                    margin: "0 0 6px", lineHeight: 1.3, color: clr.text,
                  }}>
                    {selectedComplaint.title}
                  </h2>
                  <div style={{
                    fontSize: 10, color: clr.hint,
                    fontFamily: font.mono, letterSpacing: "0.5px",
                  }}>
                    Filed {selectedComplaint.date}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                  <UrgencyBadge level={selectedComplaint.urgency} />
                  <StatusBadge status={selectedComplaint.status} />
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: clr.borderLight, marginBottom: 14 }} />

                {/* Info rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: "Citizen",  val: selectedComplaint.userName },
                    { label: "Category", val: selectedComplaint.category },
                    { label: "Ward",     val: selectedComplaint.ward },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: clr.hint, textTransform: "uppercase", letterSpacing: "1px", fontFamily: font.body, paddingTop: 2 }}>
                        {row.label}
                      </span>
                      <span style={{ fontSize: 13, color: clr.text, fontWeight: 500, textAlign: "right", maxWidth: "55%" }}>
                        {row.val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: clr.borderLight, marginBottom: 14 }} />

                {/* Details block */}
                {selectedComplaint.details && (
                  <div style={{
                    background: clr.bg, border: `1px solid ${clr.border}`,
                    borderLeft: `3px solid ${clr.primary}`,
                    borderRadius: "0 4px 4px 0", padding: "10px 12px", marginBottom: 16,
                  }}>
                    <p style={{ fontSize: 12, color: clr.textMid, margin: 0, lineHeight: 1.8, fontFamily: font.body }}>
                      {selectedComplaint.details}
                    </p>
                  </div>
                )}

                {/* Tracking Messages */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: clr.hint, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 10, fontFamily: font.body }}>
                    Tracking / Messages
                  </div>
                  {selectedComplaint?.replies?.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {selectedComplaint.replies.map((r, idx) => (
                        <div key={idx} style={{
                          background: clr.bg, border: `1px solid ${clr.borderLight}`,
                          borderRadius: 4, padding: "9px 11px",
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: clr.primary, marginBottom: 3 }}>{r.from || "MLA"}</div>
                          <div style={{ fontSize: 12, color: clr.textMid, lineHeight: 1.6 }}>{r.text}</div>
                          <div style={{ fontSize: 10, color: clr.hint, marginTop: 4, fontFamily: font.mono }}>
                            {new Date(r.date).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: clr.hint, fontStyle: "italic" }}>No tracking messages yet.</div>
                  )}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: clr.borderLight, marginBottom: 14 }} />

                {/* Comment Box */}
                <div style={{ marginBottom: 14 }}>
                  <label style={labelSt}>MLA Comment / Response</label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Type reason, response, or action taken..."
                    rows={3}
                    style={{
                      width: "100%", resize: "vertical",
                      border: `1px solid ${clr.border}`,
                      borderRadius: 4, padding: "9px 11px",
                      fontSize: 12, fontFamily: font.body,
                      background: clr.bg, color: clr.text,
                      lineHeight: 1.6, transition: "border-color 0.15s",
                    }}
                  />
                  <button
                    className="action-btn"
                    disabled={actionLoading}
                    onClick={sendMessage}
                    style={{
                      marginTop: 8, padding: "9px 20px",
                      background: clr.primary, color: "#fff",
                      border: "none", borderRadius: 4,
                      fontSize: 10, fontWeight: 700,
                      cursor: actionLoading ? "not-allowed" : "pointer",
                      opacity: actionLoading ? 0.7 : 1,
                      letterSpacing: "0.8px", textTransform: "uppercase",
                      fontFamily: font.body,
                    }}
                  >
                    Send Message
                  </button>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {[
                    {
                      label: "Mark In Progress",
                      status: "In Progress",
                      bg: clr.primary, color: "#fff",
                      disabled: selectedComplaint.status === "In Progress",
                    },
                    {
                      label: "Mark Resolved",
                      status: "Resolved",
                      bg: clr.successLight, color: clr.success,
                      border: `1px solid ${clr.success}40`,
                      disabled: selectedComplaint.status === "Resolved",
                    },
                    {
                      label: "Forward to Department",
                      status: "Forwarded",
                      bg: clr.goldLight, color: clr.gold,
                      border: `1px solid ${clr.gold}40`,
                      disabled: false,
                    },
                  ].map(btn => (
                    <button
                      key={btn.status}
                      className="action-btn"
                      disabled={actionLoading || btn.disabled}
                      onClick={() => updateStatus(btn.status)}
                      style={{
                        padding: "10px 0", borderRadius: 4,
                        background: btn.disabled ? "#EDE8E0" : btn.bg,
                        color: btn.disabled ? clr.hint : btn.color,
                        fontSize: 10, fontWeight: 700,
                        border: btn.disabled ? `1px solid ${clr.border}` : (btn.border || "none"),
                        cursor: (actionLoading || btn.disabled) ? "not-allowed" : "pointer",
                        opacity: actionLoading ? 0.7 : 1,
                        letterSpacing: "0.8px", textTransform: "uppercase",
                        fontFamily: font.body,
                      }}
                    >
                      {actionLoading ? "Updating..." : btn.label}
                    </button>
                  ))}
                </div>

              </div>
            ) : (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: font.display, fontSize: 20, color: clr.hint, marginBottom: 8 }}>
                  Select a complaint
                </div>
                <p style={{ fontSize: 12, color: clr.hint, margin: 0, lineHeight: 1.6 }}>
                  Click any row in the table<br />to view its details here
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}