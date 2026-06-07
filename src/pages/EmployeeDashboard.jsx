import React, { useEffect, useMemo, useState } from "react";
import {
  MdGroup, MdAssignment, MdWarning, MdInfo, MdCheckCircle, MdRepeat, MdLocalFireDepartment,
  MdCampaign
} from 'react-icons/md';
import "../style/EmployeeDashboard.css";
import { MdCancel, MdSend, MdAccessTime, MdClose, MdPerson, MdCalendarToday, MdFingerprint, } from "react-icons/md";
import { COLORS, urgencyStyle, statusStyle, selectStyles } from "../theme/employee-style";

const URGENCY_RANK = { Urgent: 1, Medium: 2, Normal: 3 };

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
  const [imageModal, setImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState("");


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

  

  return (

    <div className="page-wrapper">

      {/* ── HEADER ── */}

      <div className="dashboard-topbar">
        <div className="dashboard-brand">
          <div className="dashboard-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      <div className="filter-bar-container">
        {/* Search Input Container */}
        <div className="search-input-wrapper">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="5" strokeWidth="1.5" />
            <path d="M10.5 10.5L13.5 13.5" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search citizen, complaint, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Urgency Filter Dropdown */}
        <div className="select-dropdown-wrapper">
          <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)} className="filter-select">
            <option value="">All Urgency</option>
            <option value="Urgent">Urgent</option>
            <option value="Medium">Medium</option>
            <option value="Normal">Normal</option>
          </select>
          <svg className="dropdown-arrow-icon" width="10" height="10" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Status Filter Dropdown */}
        <div className="select-dropdown-wrapper">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <svg className="dropdown-arrow-icon" width="10" height="10" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Record Counter */}
        <div className="record-counter">
          <span className="count-highlight">{filtered.length}</span> of {complaints.length} records
        </div>
      </div>



      {/* ── TABLE ── */}

      <div className="complaints-board-wrapper">
        <div className="complaints-container">
          <div className="complaints-header">
            <div>Citizen</div>
            <div>Title</div>
            <div>Category</div>
            <div>Evidence</div>
            <div>Urgency</div>
            <div>Status</div>
            <div>Reposts</div>
            <div>Date</div>
          </div>

          {filtered.map((c) => {
            const hasHighAttention = (c.reposts || 0) >= 10;
            return (
              <div
                key={c.id}
                className={`complaint-row ${selectedComplaint?.id === c.id ? "active" : ""} ${hasHighAttention ? "high-priority-border" : ""}`}
                onClick={() => setSelectedComplaint(c)}
              >
                <div data-label="Citizen">{c.userName}</div>
                <div data-label="Title">{c.title}</div>
                <div data-label="Category">{c.category}</div>
                <div data-label="Evidence">
                  {c.evidence ? (
                    <button
                      className="evidence-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(c.evidence, "_blank");
                      }}
                    >
                      📎 View
                    </button>
                  ) : (
                    <span className="no-file-text">No File</span>
                  )}
                </div>

                <div data-label="Urgency">{c.urgency}</div>
                <div data-label="Status">{c.status}</div>
                <div data-label="Reposts">
                  <span className={`reposts-badge ${hasHighAttention ? "attention-critical" : "attention-normal"}`}>
                    <MdRepeat size={14} />{c.reposts || 0}
                  </span>
                </div>
                <div data-label="Date">{c.date}</div>
              </div>
            );
          })}
        </div>

        {/* ── DETAIL PANEL ── */}
        {selectedComplaint && (() => {
          const isResolved = selectedComplaint.status === "Resolved";
          const isRejected = selectedComplaint.status === "Rejected";
          const isClosed = isResolved || isRejected;
          const hasHighAttentionPanel = (selectedComplaint.reposts || 0) >= 2;

          return (
            <div className="detail-panel panel-anim">
              {/* Panel header */}
              <div className="panel-header">
                <div className="panel-subtitle">Complaint Detail</div>
                <div className="panel-title">{selectedComplaint.title}</div>
                <div className="panel-category">{selectedComplaint.category}</div>

                <div className="badge-row">
                  <Badge label={selectedComplaint.urgency} styleMap={urgencyStyle} />
                  <Badge label={selectedComplaint.status} styleMap={statusStyle} />
                </div>

                <div className="attention-metrics-row">
                  <div className="metric-badge grey-translucent">
                    <MdRepeat size={16} />{selectedComplaint.reposts || 0} Reposts
                  </div>
                  <div className={`metric-badge ${hasHighAttentionPanel ? "attention-critical" : "grey-translucent"}`}>
                    {hasHighAttentionPanel ? (
                      <>
                        <MdLocalFireDepartment size={16} />
                        High Public Attention
                      </>
                    ) : (
                      <>
                        <MdCampaign size={16} />
                        Community Supported
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Panel body */}
              <div className="panel-body">
                {isResolved && (
                  <div className="status-alert alert-success">
                    ✅ This complaint is resolved and closed for edits.
                  </div>
                )}
                {isRejected && (
                  <div className="status-alert alert-danger">
                    ❌ This complaint has been rejected and is closed.
                  </div>
                )}

                <div className="details-card">
                  {selectedComplaint.details && (
                    <div className="details-text">{selectedComplaint.details}</div>
                  )}

                  {selectedComplaint.evidence && (
                    <div className="evidence-media-section">
                      <div className="section-label">Evidence</div>
                      <div className="image-preview-frame">
                        <img
                          src={selectedComplaint.evidence}
                          alt="Evidence"
                          onClick={() => {
                            setPreviewImage(selectedComplaint.evidence);
                            setImageModal(true);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {(selectedComplaint.comment || (selectedComplaint.replies && selectedComplaint.replies.length > 0)) && (
                    <div className="discussion-container">
                      <div className="discussion-label">Discussion & Replies</div>
                      <div className="discussion-timeline">
                        {/* MLA / Authority Comment */}
                        {selectedComplaint.comment && (
                          <div className="timeline-bubble official-bubble">
                            <div className="bubble-author">MLA Office (Official)</div>
                            <div className="bubble-text">{selectedComplaint.comment}</div>
                          </div>
                        )}

                        {/* Replies */}
                        {selectedComplaint.replies?.map((reply, index) => (
                          <div
                            key={reply._id || index}
                            className={`timeline-bubble ${reply.role === "citizen" ? "citizen-bubble" : "official-bubble"}`}
                          >
                            <div className="bubble-header">
                              <span className="bubble-author">
                                {reply.username || reply.from}
                                {reply.role === "citizen" ? " (Citizen)" : " (Authority)"}
                              </span>
                            </div>
                            <div className="bubble-text">{reply.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="meta-grid">
                    {[["ID", selectedComplaint.id], ["Citizen", selectedComplaint.userName], ["Date", selectedComplaint.date]].map(([k, v]) => (
                      <React.Fragment key={k}>
                        <span className="meta-label">{k}</span>
                        <span className="meta-value">{v}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Action Interface Container */}
                <div className="actions-interface">
                  <div className="textarea-wrapper">
                    <label className={`input-label ${isClosed ? "disabled-label" : ""}`}>
                      Reply to Citizen {isClosed && <span className="normal-case">(Disabled)</span>}
                    </label>
                    <textarea
                      value={replies[selectedComplaint.id] || ""}
                      readOnly={isClosed}
                      disabled={isClosed}
                      onChange={(e) => setReplies(prev => ({ ...prev, [selectedComplaint.id]: e.target.value }))}
                      rows={4}
                      placeholder={isClosed ? "No further replies allowed" : "Type your reply to the citizen..."}
                      className="reply-textarea"
                    />
                  </div>

                  <div className="buttons-stack">
                    <button
                      disabled={isClosed}
                      onClick={() => handleSendReply(selectedComplaint.id)}
                      className={`panel-btn btn-primary ${isClosed ? "btn-disabled" : ""}`}
                    >
                      Send Reply
                    </button>

                    <div className="split-buttons-grid">
                      <button
                        disabled={actionLoading || isClosed || selectedComplaint.status === "In Progress"}
                        onClick={() => updateStatus("In Progress")}
                        className={`panel-btn btn-secondary-subtle ${(isClosed || selectedComplaint.status === "In Progress") ? "btn-disabled" : ""
                          }`}
                      >
                        In Progress
                      </button>
                      <button
                        disabled={actionLoading || isClosed}
                        onClick={() => updateStatus("Resolved")}
                        className={`panel-btn btn-success-subtle ${isClosed ? "btn-disabled" : ""}`}
                      >
                        Resolve
                      </button>
                    </div>

                    <button
                      disabled={actionLoading || isClosed}
                      onClick={() => updateStatus("Rejected")}
                      className={`panel-btn btn-danger-subtle ${isClosed ? "btn-disabled" : ""}`}
                    >
                      Reject Complaint
                    </button>

                    <button
                      onClick={() => setSelectedComplaint(null)}
                      className="panel-btn btn-close-panel"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

    </div>

  );
}