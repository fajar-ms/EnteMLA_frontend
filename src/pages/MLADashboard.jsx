import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MLADashboard.css";
import { font, selectSt, clr, styles } from "../theme/mla-style";
import { FaClipboardList, FaExclamationCircle, FaClock, FaCheckCircle, FaRetweet } from "react-icons/fa";

// ── Atoms ──────────────────────────────────────────────────────
const UrgencyBadge = ({ level }) => {
  const map = {
    Urgent: { bg: clr.accentLight, color: clr.accent, label: "● Urgent" },
    Medium: { bg: clr.warningLight, color: clr.warning, label: "● Medium" },
    Normal: { bg: clr.successLight, color: clr.success, label: "● Normal" },
  };

  const s = map[level] || map.Normal;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: s.bg,
        color: s.color,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.8px",
        padding: "3px 9px",
        borderRadius: 3,
        fontFamily: font.body,
        textTransform: "uppercase",
      }}
    >
      {s.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Pending: { bg: clr.primaryLight, color: clr.primary },
    "In Progress": { bg: clr.inProgressLight, color: clr.inProgress },
    Resolved: { bg: clr.successLight, color: clr.success },
    Rejected: { bg: clr.accentLight, color: clr.accent },
    Forwarded: { bg: clr.goldLight, color: clr.gold },
  };

  const s = map[status] || { bg: "#F1EDE5", color: clr.muted };

  return (
    <span
      style={{
        display: "inline-block",
        background: s.bg,
        color: s.color,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.8px",
        padding: "3px 9px",
        borderRadius: 3,
        fontFamily: font.body,
        textTransform: "uppercase",
      }}
    >
      {status || "Pending"}
    </span>
  );
};

const AvatarCircle = ({ name }) => {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        flexShrink: 0,
        background: `hsl(${hue},30%,88%)`,
        color: `hsl(${hue},40%,30%)`,
        fontSize: 11,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: font.body,
        border: `1.5px solid hsl(${hue},20%,80%)`,
      }}
    >
      {initials}
    </div>
  );
};

const StatCard = ({ label, value, color, icon, sub }) => (
  <div
    style={{
      background: clr.paper,
      border: `1px solid ${clr.border}`,
      borderTop: `3px solid ${color}`,
      borderRadius: 6,
      padding: "18px 20px",
      flex: 1,
      minWidth: 0,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", top: 12, right: 16, fontSize: 28, opacity: 0.4, lineHeight: 1, color }}>
      {icon}
    </div>
    <div style={{ fontSize: 10, fontFamily: font.body, fontWeight: 700, color: clr.muted, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 8 }}>
      {label}
    </div>
    <div style={{ fontSize: 36, fontFamily: font.display, fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: 11, color: clr.hint, fontFamily: font.body }}>{sub}</div>}
  </div>
);



const labelSt = {
  fontSize: 9,
  fontWeight: 700,
  color: clr.hint,
  letterSpacing: "1.4px",
  textTransform: "uppercase",
  display: "block",
  marginBottom: 6,
  fontFamily: font.body,
};

const urgencyScore = (u) => (u === "Urgent" ? 1 : u === "Medium" ? 2 : 3);

// ── Main Component ─────────────────────────────────────────────
export default function MlaComplaintDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // 1. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Change this number to control rows per page

  // 2. Reset back to page 1 whenever filters change so you don't get stuck on an empty page


  // 3. Slice the data chunk for the current active page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [imageModal, setImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState("");


  // 4. Calculate total number of pages


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [filters, setFilters] = useState({
    urgency: "",
    category: "",
    ward: "",
    status: "",
  });

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");


    Promise.all([
      fetch(`${import.meta.env.VITE_API_BASE_URL}/complaints/employee`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((r) => r.json())
        .then((data) => data.data || data),

      fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((r) => r.json())
        .then((data) => data.data || data)
        .catch(() => []),
    ])
      .then(([complaintsData, usersData]) => {
        const formattedComplaints = Array.isArray(complaintsData)
          ? complaintsData.map((c) => ({
            ...c,
            id: c._id,
            userName: c.citizenId?.name || "Unknown Citizen",
            date: new Date(c.createdAt).toLocaleDateString(),
            ward: c.ward || "General",
            status: c.status || "Pending",
          }))
          : [];

        setComplaints(formattedComplaints);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not connect to the server. Please ensure your token is valid and the backend is active.");
        setLoading(false);
      });
  }, []);

  const setFilter = (key, val) =>
    setFilters((f) => ({
      ...f,
      [key]: val,
    }));

  const clearFilters = () => {
    setFilters({ urgency: "", category: "", ward: "", status: "" });
  };

  const trendingComplaints = complaints.filter(
    (c) => (c.reposts || 0) >= 5
  ).length;

  const activeFilters = Object.values(filters).filter(Boolean).length;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const uniqueCategories = [...new Set(complaints.map((c) => c.category).filter(Boolean))];
  const uniqueWards = [...new Set(complaints.map((c) => c.ward).filter(Boolean))];
  const uniqueStatuses = [...new Set(complaints.map((c) => c.status).filter(Boolean))];

  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => !filters.urgency || c.urgency === filters.urgency)
      .filter((c) => !filters.category || c.category === filters.category)
      .filter((c) => !filters.ward || c.ward === filters.ward)
      .filter((c) => !filters.status || c.status === filters.status)
      .sort((a, b) => urgencyScore(a.urgency) - urgencyScore(b.urgency)).sort((a, b) => {
        // urgent first
        const urgencyDiff =
          urgencyScore(a.urgency) - urgencyScore(b.urgency);

        if (urgencyDiff !== 0) return urgencyDiff;

        // then highest reposts
        return (b.reposts || 0) - (a.reposts || 0);
      });
  }, [complaints, filters]);

  const currentComplaintsPage = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");


  useEffect(() => {
    setCurrentPage(1);
  }, [filteredComplaints.length]);

  const totalComplaints = complaints.length;
  const urgentIssues = complaints.filter((c) => c.urgency === "Urgent").length;
  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;
  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  // Evaluates if the current item is closed under Resolved or Rejected criteria
  const isCaseClosed = selectedComplaint?.status === "Resolved" || selectedComplaint?.status === "Rejected";

  const updateStatus = async (
    newStatus,
    rejectionReason = ""
  ) => {
    if (!selectedComplaint) return;
    setActionLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/complaints/${selectedComplaint.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            comment,
            rejectionReason,
            rejectedBy: {
              adminId: currentUser._id,
              adminName: currentUser.name,
              adminRole: currentUser.role,
              mlaId: currentUser.mlaId,
            },
            userId: selectedComplaint.citizenId?._id || selectedComplaint.citizenId,
          }),
        }
      );

      if (response.ok) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id
              ? { ...c, status: newStatus, comment, rejectionReason }
              : c
          )
        );

        setSelectedComplaint((prev) => ({
          ...prev,
          status: newStatus,
          comment,
          rejectionReason,
        }));
        setComment("");
        alert(`Status successfully updated to ${newStatus}`);
      } else {
        alert("Failed to update status. Check permissions.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectComplaint = async () => {
    if (!rejectionReason.trim()) {
      toast.error(
        "Please enter a rejection reason"
      );
      return;
    }

    await updateStatus(
      "Rejected",
      rejectionReason
    );

    setShowRejectModal(false);
    setRejectionReason("");
  };

  // Handles adding updates to the timeline log without moving state out of In Progress / Pending
  const handleSendCommentOnly = async () => {
    if (!comment.trim()) return alert("Please enter a comment update first.");
    await updateStatus(selectedComplaint.status);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: clr.bg, color: clr.textMid }}>
        Loading secure regional dashboard...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: clr.bg, fontFamily: font.body, color: clr.text }}>

      {/* ── HEADER ── */}
      <div
        style={{
          background: clr.paper,
          borderBottom: `1px solid ${clr.border}`,
          padding: isMobile ? "16px" : "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 16 : 0,
        }}
      >
        {/* LEFT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* LOGO */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: clr.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(26,107,175,0.25)",
              flexShrink: 0,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18" />
              <path d="M5 21V7l7-4 7 4v14" />
              <path d="M9 10h.01" />
              <path d="M15 10h.01" />
              <path d="M9 14h.01" />
              <path d="M15 14h.01" />
            </svg>
          </div>

          {/* TITLE */}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 22 : 30,
                fontFamily: font.display,
                color: clr.text,
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              MLA Complaint Dashboard
            </h1>

            <p
              style={{
                margin: "6px 0 0",
                color: clr.muted,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Constituency Administration Portal
            </p>
          </div>
        </div>

        {/* RIGHT BUTTONS */}
        <div
          style={{
            display: "flex",
            gap: 12,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <a
            href="/"
            style={{
              flex: isMobile ? 1 : "unset",
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: 8,
              border: `1px solid ${clr.border}`,
              background: clr.paper,
              color: clr.textMid,
              fontSize: 13,
              fontWeight: 700,
              display: "flex",

              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            Home
          </a>
          <button
            onClick={() => navigate("/mla/banner")}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: clr.primary,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Manage Banners
          </button>

          <button
            onClick={handleLogout}
            style={{
              flex: isMobile ? 1 : "unset",
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: clr.accent,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>



      <main
        style={{
          padding: isMobile ? "16px" : "24px 32px",
        }}
      >
        {error && (
          <div style={{ padding: 14, background: clr.accentLight, color: clr.accent, border: `1px solid ${clr.accent}`, borderRadius: 4, marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(5, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <StatCard label="Total Complaints" value={totalComplaints} color={clr.primary} icon={<FaClipboardList />} />
          <StatCard label="Urgent Issues" value={urgentIssues} color={clr.accent} icon={<FaExclamationCircle />} />
          <StatCard label="Pending" value={pendingCount} color={clr.warning} icon={<FaClock />} />
          <StatCard label="Resolved" value={resolvedCount} color={clr.success} icon={<FaCheckCircle />} />
          <StatCard
            label="Trending Issues"
            value={trendingComplaints}
            color={clr.gold}
            icon={<FaRetweet />}
          />
        </div>

        {/* Dynamic Filters Bar */}
        <div
          style={{
            background: clr.paper,
            border: `1px solid ${clr.border}`,
            borderRadius: 6,
            padding: "16px 20px",
            marginBottom: 24,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(5, 1fr)",
            gap: 16,
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1 }}>
            <label style={labelSt}>Urgency</label>
            <select value={filters.urgency} onChange={(e) => setFilter("urgency", e.target.value)} style={selectSt}>
              <option value="">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="Medium">Medium</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelSt}>Category</label>
            <select value={filters.category} onChange={(e) => setFilter("category", e.target.value)} style={selectSt}>
              <option value="">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* <div style={{ flex: 1 }}>
            <label style={labelSt}>Ward</label>
            <select value={filters.ward} onChange={(e) => setFilter("ward", e.target.value)} style={selectSt}>
              <option value="">All Wards / Regions</option>
              {uniqueWards.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div> */}

          <div style={{ flex: 1 }}>
            <label style={labelSt}>Status</label>
            <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} style={selectSt}>
              <option value="">All Statuses</option>
              {uniqueStatuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              style={{ padding: "8px 14px", background: clr.bg, border: `1px solid ${clr.border}`, color: clr.textMid, borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Reset ({activeFilters})
            </button>
          )}
        </div>

        {/* Master-Detail Panel Split */}
        <div>

          {/* Complaints Table Container */}
          <div className="table-scroll-container">
            <table className="dashboard-data-table">
              <thead>
                <tr className="table-header-row">
                  <th className="table-header-cell">Citizen</th>
                  <th className="table-header-cell">Complaint Title</th>
                  <th className="table-header-cell">Evidence</th>
                  <th className="table-header-cell">Urgency</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Reposts</th>
                </tr>
              </thead>
              <tbody>
                {currentComplaintsPage.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="cell-empty-state">
                      No regional complaints found matching active filter scope.
                    </td>
                  </tr>
                ) : (
                  currentComplaintsPage.map((c) => {
                    const isSelected = selectedComplaint?.id === c.id;
                    const isHighPublicAttention = (c.reposts || 0) >= 10;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedComplaint(c)}
                        className={`table-body-row 
                ${isSelected ? 'is-selected' : ''} 
                ${isHighPublicAttention ? 'has-high-reposts' : ''}
              `}
                      >
                        <td className="cell-citizen">
                          <AvatarCircle name={c.userName} />
                          {c.userName}
                        </td>
                        <td className="cell-text">{c.title}</td>
                        <td className="cell-text">
                          {c.evidence ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage(c.evidence);
                                setImageModal(true);
                              }}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: "none",
                                background: "#EAF4FB",
                                color: "#124E66",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              📎 View
                            </button>
                          ) : (
                            <span style={{ color: "#94A3B8" }}>No Evidence</span>
                          )}
                        </td>
                        <td className="cell-badge"><UrgencyBadge level={c.urgency} /></td>
                        <td className="cell-badge"><StatusBadge status={c.status} /></td>
                        <td className="cell-badge">
                          <div className="repost-count-badge">
                            <FaRetweet className="repost-icon-spacing" /> {c.reposts || 0}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {imageModal && (
              <div
                onClick={() => setImageModal(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.8)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 9999,
                }}
              >
                <img
                  src={previewImage}
                  alt="Evidence Preview"
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            {/* ── PAGINATION CONTROLS PANELS ── */}
            {totalPages > 1 && (
              <div className="table-pagination-bar">
                {/* Items Counter Status text */}
                <span className="pagination-counter-text">
                  Showing <b>{indexOfFirstItem + 1}</b> to <b>{Math.min(indexOfLastItem, filteredComplaints.length)}</b> of <b>{filteredComplaints.length}</b> items
                </span>

                {/* Navigation button arrays */}
                <div className="pagination-controls-group">
                  {/* Previous Button */}
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="pagination-btn"
                  >
                    Previous
                  </button>

                  {/* Numeric Page Buttons Layout Map */}
                  {Array.from({ length: totalPages }, (_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`pagination-btn pagination-number-btn ${isActive ? 'is-active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Details Management Side Panel */}
          {/* Complaint Details Modal */}
          {selectedComplaint && (
            <div
              onClick={() => setSelectedComplaint(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: 20,
                backdropFilter: "blur(3px)",
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  maxWidth: 760,
                  maxHeight: "90vh",
                  overflowY: "auto",
                  background: clr.paper,
                  borderRadius: 10,
                  border: `1px solid ${clr.border}`,
                  padding: 28,
                  position: "relative",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedComplaint(null)}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    background: clr.accentLight,
                    color: clr.accent,
                    fontSize: 18,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  ×
                </button>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: font.mono,
                      color: clr.muted,
                    }}
                  >
                    ID: {selectedComplaint.id.slice(-8).toUpperCase()}
                  </span>

                  <span style={{ fontSize: 11, color: clr.hint }}>
                    {selectedComplaint.date}
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: font.display,
                    fontSize: 28,
                    margin: "0 0 14px",
                    color: clr.text,
                    fontWeight: 700,
                  }}
                >
                  {selectedComplaint.title}
                </h2>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 22,
                  }}
                >
                  <StatusBadge status={selectedComplaint.status} />
                  <UrgencyBadge level={selectedComplaint.urgency} />

                  <div
                    style={{
                      background: clr.primaryLight,
                      color: clr.primary,
                      padding: "8px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <FaRetweet style={{ marginRight: 4 }} />  {selectedComplaint.reposts || 0} Reposts
                  </div>

                  {(selectedComplaint.reposts || 0) >= 10 && (
                    <div
                      style={{
                        background: clr.accentLight,
                        color: clr.accent,
                        padding: "8px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      🔥 High Public Attention
                    </div>
                  )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                  <span style={labelSt}>Description</span>

                  <div
                    style={{
                      background: clr.card,
                      border: `1px solid ${clr.borderLight}`,
                      borderRadius: 6,
                      padding: 16,
                      lineHeight: 1.7,
                      fontSize: 14,
                      color: clr.textMid,
                    }}
                  >
                    {selectedComplaint.details ||
                      selectedComplaint.description ||
                      "No detailed description available."}
                  </div>
                </div>

                {/* Evidence Preview */}
                {selectedComplaint.evidence && (
                  <div style={{ marginBottom: 20 }}>
                    <span style={labelSt}>Evidence</span>

                    <div
                      style={{
                        background: clr.card,
                        border: `1px solid ${clr.borderLight}`,
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: 260,
                          background: clr.bg,
                          borderRadius: 6,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setPreviewImage(selectedComplaint.evidence);
                          setImageModal(true);
                        }}
                      >
                        <img
                          src={selectedComplaint.evidence}
                          alt="Complaint Evidence"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>

                      <button
                        onClick={() =>
                          window.open(selectedComplaint.evidence, "_blank")
                        }
                        style={{
                          marginTop: 12,
                          width: "100%",
                          padding: "10px",
                          background: clr.primary,
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Open Full Image
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Comment */}
                {selectedComplaint.comment && (
                  <div style={{ marginBottom: 20 }}>
                    <span style={labelSt}>Resolution Log</span>

                    <div
                      style={{
                        background: clr.inProgressLight,
                        border: `1px solid ${clr.borderLight}`,
                        color: clr.inProgress,
                        borderRadius: 6,
                        padding: 14,
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      {selectedComplaint.comment}
                    </div>
                  </div>
                )}

                <hr
                  style={{
                    border: "none",
                    borderTop: `1px solid ${clr.borderLight}`,
                    margin: "24px 0",
                  }}
                />

                {/* Action Section */}
                <div>
                  <span style={labelSt}>Administrative Actions</span>

                  {isCaseClosed && (
                    <div
                      style={{
                        padding: "10px 14px",
                        background: clr.successLight,
                        color: clr.success,
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 14,
                        border: `1px solid ${clr.success}`,
                      }}
                    >
                      ✓ This case is closed and locked.
                    </div>
                  )}

                  <textarea
                    placeholder={
                      isCaseClosed
                        ? "Closed cases cannot be edited."
                        : "Add official remarks or progress updates..."
                    }
                    disabled={isCaseClosed || actionLoading}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: 100,
                      padding: 14,
                      fontSize: 13,
                      borderRadius: 6,
                      border: `1px solid ${clr.border}`,
                      background: isCaseClosed ? clr.bg : clr.card,
                      outline: "none",
                      fontFamily: font.body,
                      marginBottom: 14,
                      resize: "vertical",
                    }}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <button
                      disabled={isCaseClosed || actionLoading}
                      onClick={() => updateStatus("In Progress")}
                      style={{
                        padding: "12px",
                        background: clr.card,
                        border: `1px solid ${clr.inProgress}`,
                        color: clr.inProgress,
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      In Progress
                    </button>

                    <button
                      disabled={isCaseClosed || actionLoading}
                      onClick={() => updateStatus("Resolved")}
                      style={{
                        padding: "12px",
                        background: clr.success,
                        border: "none",
                        color: "#fff",
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Resolve
                    </button>

                    <button
                      disabled={isCaseClosed || actionLoading}
                      onClick={handleSendCommentOnly}
                      style={{
                        padding: "12px",
                        background: clr.card,
                        border: `1px solid ${clr.primary}`,
                        color: clr.primary,
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        gridColumn: "span 2",
                      }}
                    >
                      Send Comment Only
                    </button>

                    <button
                      disabled={isCaseClosed || actionLoading}
                      onClick={() => setShowRejectModal(true)}
                      style={{
                        padding: "12px",
                        background: clr.card,
                        border: `1px solid ${clr.accent}`,
                        color: clr.accent,
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        gridColumn: "span 2",
                      }}
                    >
                      Reject Complaint
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showRejectModal && (
            <div style={styles.overlay}>
              <div style={styles.modalCard}>
                <h3 style={styles.title}>Reject Complaint</h3>

                <p style={styles.description}>
                  Please provide a reason for rejecting this complaint.
                </p>

                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={5}
                  placeholder="Type the rejection reason here..."
                  style={{
                    ...styles.textarea,
                    border: `1px solid ${clr?.border || "#cbd5e1"}`, // Keeps dynamic color logic intact
                  }}
                />

                <div style={styles.buttonContainer}>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason("");
                    }}
                    style={styles.cancelButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f1f5f9";
                      e.currentTarget.style.color = "#0f172a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#475569";
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleRejectComplaint}
                    disabled={!rejectionReason.trim()}
                    style={{
                      ...styles.confirmButton,
                      background: rejectionReason.trim() ? "#dc2626" : "#fca5a5",
                      cursor: rejectionReason.trim() ? "pointer" : "not-allowed",
                    }}
                    onMouseEnter={(e) => {
                      if (rejectionReason.trim()) e.currentTarget.style.background = "#b91c1c";
                    }}
                    onMouseLeave={(e) => {
                      if (rejectionReason.trim()) e.currentTarget.style.background = "#dc2626";
                    }}
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}