import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  FaHome, FaSignOutAlt, FaSearch, FaEnvelope, FaPhone,
  FaMapMarkerAlt, FaLandmark, FaLocationArrow, FaIdBadge,
  FaPaperPlane, FaUpload, FaTrash, FaRetweet, FaFileAlt,
  FaBan, FaComments
} from "react-icons/fa";
import "./CitizenDashboard.css";

const clr = {
  bg: "#E8F4FB",
  card: "#FFFFFF",
  border: "#C8DFF0",
  text: "#0D2137",
  muted: "#2A5F80",
  hint: "#5A9BB8",
  primary: "#1A6BAF",
  primaryLight: "#D6EDF8",
  danger: "#D9534F",
  dangerBg: "#FFF1F0",
  dangerText: "#A94442",
  warning: "#1A7AAF",
  warningBg: "#E0F0FA",
  warningText: "#0D4F73",
  success: "#1A8A5A",
  successBg: "#E0F5EC",
  successText: "#0F5235",
  blue: "#D6EDF8",
  blueText: "#1A5A80",
  accent1: "#1A7AB5",
  accent2: "#B8D9EE",
  gradientStart: "#EAF5FC",
  gradientEnd: "#D6EDF8",
};
const shadow = "0 2px 12px rgba(120, 90, 60, 0.08)";
const shadowHover = "0 6px 24px rgba(120, 90, 60, 0.14)";
const radius = { sm: 10, md: 14, lg: 20, xl: 28 };

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { font-family: 'Plus Jakarta Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #C7D2FE; border-radius: 99px; }

  /* ── Mobile responsive overrides ── */

  /* Header */
  .cd-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .cd-header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  /* Row 1: Profile | Track — 2 cols on desktop, 1 on mobile */
  .cd-row1 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
    align-items: start;
  }

  /* Form grid: 4 cols desktop → 2 cols tablet → 1 col mobile */
  .cd-form-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }

  /* Form footer row */
  .cd-form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* Complaints grid */
  .cd-complaints-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: 12px;
    max-height: 420px;
    overflow-y: auto;
    padding-right: 4px;
  }

  /* Home button */
  .dashboard-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 18px;
    height: 42px;
    border-radius: 14px;
    border: 1.5px solid #C8DFF0;
    background: #FFFFFF;
    color: #0D2137;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(120,90,60,0.08);
    transition: all 0.2s;
    text-decoration: none;
    white-space: nowrap;
  }
  .dashboard-btn:hover {
    background: #D6EDF8;
    border-color: #1A7AB5;
  }

  input:focus,
  textarea:focus,
  select:focus {
    border-color: #C4A484 !important;
    box-shadow: 0 0 0 3px rgba(196,164,132,0.15) !important;
    background: #FFFFFF !important;
  }

  /* ── Tablet: ≤ 900px ── */
  @media (max-width: 900px) {
    .cd-row1 {
      grid-template-columns: 1fr;
    }
    .cd-form-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  /* ── Mobile: ≤ 600px ── */
  @media (max-width: 600px) {
    .cd-page-wrap {
      padding: 16px 14px !important;
    }
    .cd-header {
      flex-direction: column;
      align-items: stretch !important;
      margin-bottom: 18px;
      gap: 14px;
    }
    .cd-header-logo h1 {
      font-size: 17px !important;
    }
    .cd-header-logo p {
      font-size: 10px !important;
    }
    .cd-header-actions {
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .dashboard-btn {
      width: 100%;
      justify-content: center;
      height: 44px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 12px;
      background: linear-gradient(135deg, #1A8FA8 0%, #1A6BAF 100%) !important;
      color: #ffffff !important;
      border: none !important;
      box-shadow: 0 3px 12px rgba(26,107,175,0.3) !important;
      gap: 8px;
      padding: 0 !important;
    }
    .dashboard-btn:hover {
      background: linear-gradient(135deg, #157f96 0%, #155d9e 100%) !important;
      border: none !important;
    }
    .cd-logout-btn {
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 44px !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      border-radius: 12px !important;
      background: linear-gradient(135deg, #1A8FA8 0%, #1A6BAF 100%) !important;
      color: #ffffff !important;
      border: none !important;
      box-shadow: 0 3px 12px rgba(26,107,175,0.3) !important;
      gap: 8px !important;
      padding: 0 !important;
    }
    .cd-form-grid {
      grid-template-columns: 1fr;
    }
    .cd-form-footer {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    .cd-form-footer > * {
      width: 100%;
      justify-content: center;
    }
    .cd-submit-btn {
      width: 100% !important;
      justify-content: center !important;
    }
    .cd-complaints-grid {
      grid-template-columns: 1fr !important;
    }
    .cd-card {
      padding: 16px 14px !important;
    }
    .cd-profile-info-row span {
      font-size: 12px !important;
    }
  }

  /* ── Very small: ≤ 380px ── */
  @media (max-width: 380px) {
    .cd-page-wrap {
      padding: 12px 10px !important;
    }
  }
`;

const Avatar = ({ name, size = 52 }) => {
  const initials = (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(145deg, #EAF5FC 0%, #D6EDF8 50%, #C8E8F5 100%)",
      color: `hsl(${hue},55%,28%)`,
      fontSize: size * 0.33, fontWeight: 800,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 4px 14px hsl(${hue},50%,75%)`,
    }}>{initials}</div>
  );
};

const UrgencyBadge = ({ level }) => {
  const map = {
    Urgent: { bg: "#FFF1F2", color: "#BE123C", dot: "#F43F5E", border: "#FECDD3" },
    Medium: { bg: "#FFFBEB", color: "#92400E", dot: "#F59E0B", border: "#FDE68A" },
    Normal: { bg: "#ECFDF5", color: "#065F46", dot: "#10B981", border: "#A7F3D0" },
  };
  const s = map[level] || map.Normal;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.5px", padding: "3px 10px", borderRadius: 99,
      border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
      {level || "Normal"}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Submitted: { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" },
    Pending: { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" },
    "In Progress": { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A" },
    Resolved: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
    Rejected: { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3" },
  };
  const s = map[status] || { bg: "#F1F5F9", color: "#64748B", border: "#E2E8F0" };
  return (
    <span style={{
      display: "inline-block", background: s.bg, color: s.color, fontSize: 10,
      fontWeight: 700, letterSpacing: "0.5px", padding: "3px 10px", borderRadius: 99,
      border: `1px solid ${s.border}`,
    }}>
      {status || "Pending"}
    </span>
  );
};

const FieldError = ({ msg }) =>
  msg ? <div style={{ fontSize: 11, color: clr.danger, marginTop: 4, fontWeight: 500 }}>{msg}</div> : null;

const inputBase = (hasError) => ({
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  fontSize: 13,
  color: clr.text,
  background: "#FFFDF9",
  border: `1.5px solid ${hasError ? clr.danger : "#E6D5C3"}`,
  borderRadius: radius.sm,
  outline: "none",
  fontFamily: "inherit",
  transition: "all 0.2s ease",
  boxShadow: "0 1px 3px rgba(120,90,60,0.04)",
});

const labelSt = {
  fontSize: 10, fontWeight: 800, color: clr.accent1,
  letterSpacing: "0.8px", textTransform: "uppercase",
  display: "block", marginBottom: 6,
};

const cardStyle = {
  background: clr.card,
  border: `1.5px solid ${clr.border}`,
  borderRadius: radius.lg,
  padding: "22px 24px",
  boxShadow: shadow,
};

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customCategory, setCustomCategory] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [details, setDetails] = useState("");
  const [visibility, setVisibility] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageModal, setImageModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role?.trim().toLowerCase() !== "citizen") {
      window.location.replace("/");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) throw new Error("Unauthorized");
        const userData = await userResponse.json();
        setUser(userData);

        const complaintResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/complaints/my-complaints`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const complaintData = await complaintResponse.json();
        if (Array.isArray(complaintData)) {
          setComplaints(
            complaintData.map((c) => ({
              ...c,
              id: c._id,
              repost: c.reposts || 0,
              date: new Date(c.createdAt).toLocaleDateString(),
            }))
          );
        }
      } catch (err) {
        console.error("Data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredComplaints = complaints.filter(c =>
  ((c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.id || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust this value based on layout density goals

  // Calculate Paginated Chunk
  const totalItems = filteredComplaints.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);

  const handleDeleteComplaint = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this complaint?");
    if (!confirmDelete) return;
    try {
      const response = await fetch(`http://localhost:3001/complaints/${id}`, { method: "DELETE" });
      if (response.ok) {
        setComplaints((prev) => prev.filter((c) => c.id !== id));
        if (selectedComplaint?.id === id) setSelectedComplaint(null);
      } else {
        alert("Failed to delete complaint");
      }
    } catch (error) {
      console.error(error);
      alert("Server error while deleting");
    }
  };

  const handleAddComplaint = async (e) => {
    e.preventDefault();
    if (!title || !category || !urgency || !details) {
      alert("Please fill in all required fields (Title, Category, Urgency, and Details) before submitting.");
      return;
    }
    const complaintPayload = {
      title,
      category: category === "Other" ? customCategory : category,
      urgency,
      details,
      visibility: visibility || "Public",
      citizenId: user?._id,
    };
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintPayload),
      });
      if (response.ok) {
        const savedComplaint = await response.json();
        setComplaints(prev => [{ ...savedComplaint, id: savedComplaint._id, date: new Date().toLocaleDateString() }, ...prev]);
        setTitle(""); setCategory(""); setDetails(""); setUrgency("");
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error) {
      alert("Submission failed. Check backend connection.");
    }
  };

  // Add this near your clr, radius, and cardStyle declarations
  const typography = {
    family: "'Plus Jakarta Sans', sans-serif",

    // Base font styles for common text types
    body: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: 18,
      fontWeight: 500,
    },
    caption: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: 20,
      fontWeight: 500,
    },

    // Section headers & labels
    labelUppercase: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "0.9px",
      textTransform: "uppercase",
    },
    subLabelUppercase: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: "0.6px",
      textTransform: "uppercase",
    }
  };
  // 1. Move forward one page safely
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // 2. Move backward one page safely
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // 3. Jump directly to a specific page index number
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };



  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: clr.bg }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="cd-page-wrap">

        {/* ── Header ── */}
        <div className="cd-header">
          <div className="cd-header-logo">
            <div className="cd-logo-mark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <div className="cd-session-badge-row">
                <div className="cd-session-dot" />
                <span className="cd-session-text">Active Session</span>
              </div>
              <h1 className="cd-main-title">Citizen Dashboard</h1>
              <p className="cd-sub-caption">MLA Portal · Civic Complaint System</p>
            </div>
          </div>

          <div className="cd-header-actions">
            <a href="/" className="dashboard-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
                <polyline points="9 21 9 12 15 12 15 21" />
              </svg>
              <span className="btn-label">Home</span>
            </a>
            <button onClick={handleLogout} className="cd-logout-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="btn-label">Logout</span>
            </button>
          </div>
        </div>

        {/* ── ROW 1: Profile (Now single column since tracking is a popup) ── */}
        <div className="cd-row1 profile-only-layout">
          {/* Profile Card */}
          <div className="cd-card cd-profile-card">
            <div className="cd-profile-radial-deco" />
            <p className="cd-label-heading">My Profile</p>
            <div className="cd-profile-identity-block">
              <Avatar name={user?.name} size={60} />
              <div className="cd-profile-identity-text">
                <div className="cd-user-display-name">{user?.name || "Anonymous Citizen"}</div>
                <span className="cd-user-id-badge">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  ID: {user?._id || "N/A"}
                </span>
              </div>
            </div>

            <div className="cd-profile-details-list">
              {[
                { icon: <FaEnvelope size={14} />, val: user?.email, label: "Email Address" },
                { icon: <FaPhone size={14} />, val: user?.phone, label: "Phone Number" },
                { icon: <FaMapMarkerAlt size={14} />, val: user?.district, label: "District Region" },
                { icon: <FaLandmark size={14} />, val: user?.constituencyId, label: "Constituency ID" },
                { icon: <FaLocationArrow size={14} />, val: user?.place, label: "Registered Place" }
              ].map((item, i) => (
                <div key={i} className="cd-profile-info-row">
                  <span className="cd-profile-icon" title={item.label}>{item.icon}</span>
                  <div className="cd-profile-data-column">
                    <span className="cd-profile-data-value">{item.val || "Not Provided"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 2: Complaint Form Card ── */}
        <div className="cd-card lodge-complaint-card">
          <div className="cd-card-header-row">
            <div>
              <p className="cd-label-heading">Lodge a Complaint</p>
              <p className="cd-sublabel-text">Fill in the details and submit your civic issue</p>
            </div>
            {submitSuccess && (
              <span className="cd-toast-success-badge">
                <span className="cd-toast-dot" />
                Submitted successfully
              </span>
            )}
          </div>

          <form onSubmit={handleAddComplaint}>
            <div className="cd-form-grid">
              <div>
                <label className="cd-label-heading">Complaint Title</label>
                <input
                  style={inputBase(!!errors.title)}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Street light not working"
                />
                <FieldError msg={errors.title} />
              </div>
              <div>
                <label className="cd-label-heading">Category</label>
                <select
                  style={inputBase(!!errors.category)}
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>Electricity</option>
                  <option>Roads & Infrastructure</option>
                  <option>Sanitation</option>
                  <option value="Water">Water Supply</option>
                  <option value="Other">Other</option>
                </select>
                {category === "Other" && (
                  <input
                    type="text"
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={inputBase(false)}
                    className="cd-custom-category-input"
                  />
                )}
                <FieldError msg={errors.category} />
              </div>
              <div>
                <label className="cd-label-heading">Urgency</label>
                <select
                  style={inputBase(!!errors.urgency)}
                  value={urgency}
                  onChange={e => setUrgency(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>Normal</option>
                  <option>Medium</option>
                  <option>Urgent</option>
                </select>
                <FieldError msg={errors.urgency} />
              </div>
              <div>
                <label className="cd-label-heading">Visibility</label>
                <select style={inputBase(false)} value={visibility} onChange={e => setVisibility(e.target.value)}>
                  <option value="">Select…</option>
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </div>
            </div>

            <div className="cd-textarea-block">
              <label className="cd-label-heading">Complaint Details</label>
              <textarea
                rows={4}
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Describe the issue — location, duration, impact…"
                style={inputBase(!!errors.details)}
              />
              <FieldError msg={errors.details} />
            </div>

            {file && (
              <div className="cd-evidence-preview-panel cd-fade-in-animation">
                <div className="cd-preview-meta-side">
                  <div className="cd-file-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A6BAF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                  </div>
                  <div className="cd-preview-text-details">
                    <span className="cd-preview-label">Staged Attachment File</span>
                    <span className="cd-preview-filename">{file.name}</span>
                  </div>
                </div>
                <div className="cd-preview-thumbnail-side" onClick={() => setImageModal(true)} title="Click to view fullscreen">
                  <img src={previewImage} alt="Evidence attachment preview" />
                  <div className="cd-thumbnail-overlay">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                    <span>Expand</span>
                  </div>
                </div>
              </div>
            )}

            <div className="cd-form-footer">
              <label className="cd-evidence-upload-trigger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>{file ? "Change Evidence File" : "Upload Evidence Image"}</span>
                <input hidden type="file" accept="image/*" onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                    setPreviewImage(URL.createObjectURL(selectedFile));
                  }
                }} />
              </label>

              <button type="submit" className="cd-submit-btn">
                <span>Submit Complaint</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* ── ROW 3: Complaints List View Ledger ── */}
        <div className="complaints-card-container">
          <div className="complaints-section-header">
            <div>
              <h3 className="complaints-main-title">My Complaints Ledger</h3>
              <p className="complaints-count-subtitle">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} records managed
              </p>
            </div>
          </div>

          {loading ? (
            <div className="complaints-loading-state">
              <div className="complaints-spinner" />
              <p>Retrieving updated complaint records...</p>
            </div>
          ) : totalItems === 0 ? (
            <div className="complaints-empty-state">
              <div className="complaints-empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p>No complaints filed under this profile. Utilize the submission portal above to start.</p>
            </div>
          ) : (
            <div className="complaints-list-wrapper">
              {currentItems.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`complaint-list-row ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedComplaint(c)}
                  >
                    <div className="complaint-col-meta">
                      <span className="complaint-id">#{(c.id || "").slice(-6).toUpperCase()}</span>
                      <span className="complaint-date">{c.date}</span>
                    </div>

                    <div className="complaint-col-main">
                      <h4 className="complaint-row-title">{c.title}</h4>
                      <div className="complaint-row-subtext">
                        <span className="complaint-category">{c.category}</span>
                        {c.evidence && (
                          <span className="complaint-attachment-pill" onClick={(e) => { e.stopPropagation(); setPreviewImage(c.evidence); setImageModal(true); }}>
                            📎 View Evidence
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="complaint-col-metrics">
                      <div className="repost-indicator" title={`${c.reposts || 0} citizen reposts`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" />
                          <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                        </svg>
                        <span>{c.reposts || 0}</span>
                      </div>
                      {(c.comments || c.replies || []).length > 0 && (
                        <div className="discussion-indicator">
                          <span>{(c.comments || c.replies).length} updates</span>
                        </div>
                      )}
                    </div>

                    <div className="complaint-col-status">
                      <StatusBadge status={c.status} />
                      <UrgencyBadge level={c.urgency} />

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteComplaint(c.id); }}
                        className="complaint-row-delete-btn"
                        title="Delete Record permanently"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6L18.1 19.5A2 2 0 0116.1 21H7.9A2 2 0 015.9 19.5L5 6" />
                          <path d="M10 11V17M14 11V17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              {totalPages > 1 && (
                <div className="complaints-pagination-nav">
                  <button className="pag-nav-btn" disabled={currentPage === 1} onClick={handlePrevPage}>
                    Previous
                  </button>
                  <div className="pag-pages-group">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          className={`pag-page-btn ${currentPage === pageNum ? 'is-active' : ''}`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button className="pag-nav-btn" disabled={currentPage === totalPages} onClick={handleNextPage}>
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Full Image Portal Lightbox */}
          {imageModal && (
            <div onClick={() => setImageModal(false)} className="complaint-modal-overlay">
              <button onClick={() => setImageModal(false)} className="complaint-modal-close">×</button>
              <img src={previewImage} alt="Verification Evidence Preview" className="complaint-modal-img" />
            </div>
          )}
        </div>
      </div>

      {/* ── POPUP COMPONENT OVERLAY: Track Complaint ── */}
      {selectedComplaint && (
        <div className="cd-modal-backdrop zone-animation" onClick={() => setSelectedComplaint(null)}>
          <div className="cd-popup-card-window" onClick={(e) => e.stopPropagation()}>
            <div className="cd-track-bg-deco" />

            <div className="cd-track-card-header-row">
              <p className="cd-label-heading">Track Complaint Status</p>
              <button className="cd-track-close-btn" onClick={() => setSelectedComplaint(null)} title="Close window">
                ✕
              </button>
            </div>

            {/* <div className="cd-search-input-wrapper">
              <input
                type="text"
                placeholder="Search by ID or title…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="cd-track-search-field"
              />
            </div> */}

            <div className="cd-track-status-monitor has-content">
              <div className="cd-monitor-inner">
                <div className="cd-monitor-header">
                  <h4 className="cd-monitor-title">{selectedComplaint.title}</h4>
                  <div className="cd-monitor-meta">
                    ID: <strong className="cd-highlight-id">{(selectedComplaint.id || "").toUpperCase()}</strong> · {selectedComplaint.category} · {selectedComplaint.date}
                  </div>
                </div>

                <div className="cd-divider-line" />

                {selectedComplaint.status === "Rejected" && selectedComplaint.rejectionReasons?.length > 0 && (
                  <div className="cd-rejection-notice-box">
                    <div className="cd-rejection-title-row">
                      <FaBan size={14} color="#BE123C" />
                      <span className="cd-rejection-alert-tag">Rejection Reason</span>
                    </div>
                    <p className="cd-rejection-explanation">
                      {selectedComplaint.rejectionReasons[selectedComplaint.rejectionReasons.length - 1].text}
                    </p>
                    <div className="cd-rejection-attribution">
                      By: {selectedComplaint.rejectionReasons[0].adminName} ({selectedComplaint.rejectionReasons[0].adminRole})
                    </div>
                  </div>
                )}

                <div className="cd-monitor-badges-row">
                  <div className="cd-badge-group">
                    <div className="cd-badge-tiny-label">Current Status</div>
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                  <div className="cd-badge-group">
                    <div className="cd-badge-tiny-label">Urgency Priority</div>
                    <UrgencyBadge level={selectedComplaint.urgency} />
                  </div>
                </div>

                {selectedComplaint.details && (
                  <div className="cd-monitor-details-bubble">
                    <p className="cd-monitor-details-text">{selectedComplaint.details}</p>
                  </div>
                )}

                <div className="cd-monitor-replies-section">
                  <div className="cd-badge-tiny-label">Official Updates / MLA Replies</div>
                  <div className="cd-monitor-replies-scroll-zone">
                    {selectedComplaint.replies && selectedComplaint.replies.length > 0 ? (
                      selectedComplaint.replies.map((r, i) => (
                        <div key={i} className="cd-reply-item-bubble">
                          <strong className="cd-reply-author">{r.from}:</strong>
                          <span className="cd-reply-body-text">{r.text}</span>
                        </div>
                      ))
                    ) : (
                      <span className="cd-replies-empty-msg">No official remarks or responses recorded yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}