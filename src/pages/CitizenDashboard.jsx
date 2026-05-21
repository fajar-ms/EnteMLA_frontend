import React, { useState, useEffect } from "react";
import axios from 'axios';

const clr = {
  bg: "#F8F5EF",
  card: "#FFFFFF",
  border: "#E7DED2",

  text: "#3E2F24",
  muted: "#7A6858",
  hint: "#B09B88",

  primary: "#B08968",
  primaryLight: "#F3E8DC",

  danger: "#D9534F",
  dangerBg: "#FFF1F0",
  dangerText: "#A94442",

  warning: "#D4A373",
  warningBg: "#FFF7ED",
  warningText: "#9C6644",

  success: "#6B8E23",
  successBg: "#F1F8E9",
  successText: "#4E6E1E",

  blue: "#F5ECE3",
  blueText: "#7C5C46",

  accent1: "#C4A484",
  accent2: "#E6D5C3",

  gradientStart: "#FAF6F0",
  gradientEnd: "#F5EFE6",
};

const shadow = "0 2px 12px rgba(120, 90, 60, 0.08)";
const shadowHover = "0 6px 24px rgba(120, 90, 60, 0.14)";
const radius = { sm: 10, md: 14, lg: 20, xl: 28 };

// Inline style for the global font
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { font-family: 'Plus Jakarta Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #C7D2FE; border-radius: 99px; }
`;

const Avatar = ({ name, size = 52 }) => {
  const initials = (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},70%,85%), hsl(${hue + 30},70%,75%))`,
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
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    if (!savedUser || role !== "citizen") {
      window.location.replace("/");
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);

    const fetchMyComplaints = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/complaints/citizen/${userData._id}`);
        const data = await response.json();
        console.log("Complaints API Response:", data);
        console.log("Comments:", data[0]?.comments);
        console.log("Replies:", data[0]?.replies);
        console.log("First Reply Object:", data[0]?.replies?.[0]);
        if (Array.isArray(data)) {
          setComplaints(data.map(c => ({
            ...c,
            id: c._id,
            date: new Date(c.createdAt).toLocaleDateString()
          })));
        }
      } catch (err) {
        console.error("Failed to load complaints:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyComplaints();

  }, []);

  const handleDeleteComplaint = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this complaint?");
    if (!confirmDelete) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/complaints/${id}`, { method: "DELETE" });
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
    console.log("Current User State:", user);
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
      citizenId: user._id,
    };
    console.log("Sending Payload:", complaintPayload);
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
  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const response = await fetch(
       `${import.meta.env.VITE_API_BASE_URL}/complaints/citizen/${user._id}`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        setComplaints(
          data.map((c) => ({
            ...c,
            id: c._id,
            date: new Date(c.createdAt).toLocaleDateString(),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
    }
  };
  const filteredComplaints = complaints.filter(c =>
  ((c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.id || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: clr.bg }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${clr.accent2}`, borderTopColor: clr.primary, borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 13, color: clr.muted, fontWeight: 600 }}>Loading your dashboard…</span>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
      ${fontStyle}

      input:focus,
      textarea:focus,
      select:focus {
        border-color: #C4A484 !important;
        box-shadow: 0 0 0 3px rgba(196,164,132,0.15) !important;
        background: #FFFFFF !important;
      }
    `}</style>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #FAF6F0 0%, #F5EFE6 50%, #EFE6DA 100%)",
        padding: "28px 32px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 14,
        color: clr.text,
      }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Logo mark */}
            <div style={{
              width: 44, height: 44, borderRadius: radius.md,
              background: `linear-gradient(135deg, #B08968 0%, #D4A373 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(233, 233, 237, 0.35)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: clr.success, boxShadow: `0 0 0 3px ${clr.successBg}` }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: clr.success, letterSpacing: "0.9px", textTransform: "uppercase" }}>Active Session</span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.5px", color: clr.text }}>Citizen Dashboard</h1>
              <p style={{ fontSize: 11, color: clr.hint, margin: 0, fontWeight: 500 }}>MLA Portal · Civic Complaint System</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>

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
            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "0 18px",
                height: 42, borderRadius: radius.md,
                border: `1.5px solid ${clr.border}`,
                background: clr.card, color: clr.danger,
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                boxShadow: shadow, transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = clr.dangerBg; e.currentTarget.style.borderColor = "#FECDD3"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = clr.card; e.currentTarget.style.borderColor = clr.border; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* ── ROW 1: Profile | Track Details ── */}
       <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
          alignItems: "start", // prevents equal height stretching
        }}
      >

          {/* Profile Card */}
          <div style={{
            ...cardStyle,
            
            position: "relative", overflow: "hidden",background: "linear-gradient(135deg, #FFFFFF 60%, #f6f5f5 100%)",
          }}>
            {/* Decorative circle */}
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, #EEF2FF, transparent 70%)", pointerEvents: "none" }} />
            <p style={labelSt}>My Profile</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "16px 0 18px" }}>
              <Avatar name={user.name} size={56} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2, color: clr.text }}>{user.name}</div>
                <span style={{
                  display: "inline-flex", marginTop: 6, alignItems: "center", gap: 5,
                  fontSize: 10, fontWeight: 700, color: clr.blueText,
                  background: "#F5ECE3", padding: "3px 10px", borderRadius: 99,
                  border: `1px solid ${clr.accent2}`,
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="9" /></svg>
                  ID: {user._id || "N/A"}
                </span>
              </div>
            </div>
            <div style={{ borderTop: `1.5px solid ${clr.border}`, paddingTop: 16, display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { icon: "✉️", val: user.email },
                { icon: "📞", val: user.phone },
                { icon: "🗺️", val: user.district },
                { icon: "🏛️", val: user.constituency },
                { icon: "📍", val: user.place }
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: clr.muted, fontWeight: 500 }}>{item.val || "N/A"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Track Details Card */}
          <div style={{
            ...cardStyle,
            background: "linear-gradient(135deg, #FFFFFF 60%, #fdfbf9 100%)",
            display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "#FFFFFF", pointerEvents: "none" }} />
            <p style={labelSt}>Track Complaint</p>
            <div style={{ position: "relative", margin: "14px 0 12px" }}>
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="6.5" cy="6.5" r="5" stroke={clr.hint} strokeWidth="1.5" />
                <path d="M10.5 10.5L13.5 13.5" stroke={clr.hint} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="Search by ID or title…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ ...inputBase(false), paddingLeft: 36, background: "#FFFDF9" }} />
            </div>
            <div style={{
              flex: 1, background: "rgba(238,242,255,0.4)", backdropFilter: "blur(4px)",
              border: `1.5px solid ${clr.border}`, borderRadius: radius.md,
              padding: 16, minHeight: 140,
              display: "flex", flexDirection: "column", justifyContent: selectedComplaint ? "flex-start" : "center",
            }}>
              {selectedComplaint ? (
                <div>
                 <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    marginBottom: 4,
                    color: clr.text,

                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {selectedComplaint.title}
                </div> 
                  <div
                    style={{
                      fontSize: 11,
                      color: clr.hint,
                      marginBottom: 12,
                      fontWeight: 500,

                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                    }}
                  >
                    ID: <strong style={{ color: clr.accent1 }}>{selectedComplaint.id}</strong> · {selectedComplaint.category} · {selectedComplaint.date}
                  </div>

                  <div style={{ height: 1, background: clr.border, marginBottom: 12 }} />

                  {/* 🔴 NEW: REJECTION HIGHLIGHT BOX */}
                  {selectedComplaint.status === "Rejected" && selectedComplaint.rejectionReasons?.length > 0 && (
                    <div style={{
                      background: "#FFF1F2",
                      border: "1.5px solid #FECDD3",
                      borderRadius: radius.sm,
                      padding: "12px 14px",
                      marginBottom: "16px",
                      borderLeft: "4px solid #E11D48",
                      boxShadow: "0 2px 8px rgba(225, 29, 72, 0.05)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "16px" }}>🚫</span>
                        <span style={{ fontWeight: 800, fontSize: "10px", color: "#9F1239", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Rejection Reason
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#BE123C", fontWeight: "600", lineHeight: "1.5" }}>
                        {selectedComplaint.rejectionReasons[selectedComplaint.rejectionReasons.length - 1].text}
                      </p>
                      <div style={{ marginTop: "8px", fontSize: "10px", color: "#FB7185", fontWeight: 500 }}>
                        By: {selectedComplaint.rejectionReasons[0].adminName} ({selectedComplaint.rejectionReasons[0].adminRole})
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 9, color: clr.hint, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>Status</div>
                      <StatusBadge status={selectedComplaint.status} />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: clr.hint, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>Urgency</div>
                      <UrgencyBadge level={selectedComplaint.urgency} />
                    </div>
                  </div>
                  {selectedComplaint.details && (
                    <div style={{ marginTop: 12, padding: "10px 13px", background: "#fff", border: `1.5px solid ${clr.border}`, borderRadius: radius.sm }}>
                      <p
                        style={{
                          fontSize: 12,
                          color: clr.muted,
                          margin: 0,
                          lineHeight: 1.8,
                          fontWeight: 500,

                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {selectedComplaint.details}
                      </p>
                    </div>
                  )}
                  {/* MLA / Updates Section */}
                  <div style={{ marginTop: 14 }}>
                    <div style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color: clr.hint,
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.6px"
                    }}>
                      Updates / MLA Replies
                    </div>

                    <div style={{ maxHeight: 140, overflowY: "auto" }}>
                      {selectedComplaint.replies && selectedComplaint.replies.length > 0 ? (
                        selectedComplaint.replies.map((r, i) => (
                          <div key={i} style={{
                            fontSize: 12,
                            background: "#FFFDF9",
                            border: `1px solid ${clr.border}`,
                            borderRadius: 8,
                            padding: "6px 10px",
                            marginBottom: 6,
                            fontWeight: 500
                          }}>
                            <strong style={{ color: clr.primary }}>{r.from}:</strong> {r.text}
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: 11, color: clr.hint }}>
                          No MLA replies yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#F5ECE3", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={clr.accent1} strokeWidth="1.8">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <p style={{ fontSize: 12, color: clr.hint, margin: 0, lineHeight: 1.8, fontWeight: 500 }}>Click a complaint below<br />to view its full details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ROW 2: Complaint Form ── */}
        <div style={{
          ...cardStyle,
          marginBottom: 16,
          background: "linear-gradient(160deg, #FFFFFF 70%, #faf7f3 100%)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative top strip */}
        

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <p style={{ ...labelSt, marginBottom: 4 }}>Lodge a Complaint</p>
              <p style={{ fontSize: 12, color: clr.hint, margin: 0, fontWeight: 500 }}>Fill in the details and submit your civic issue</p>
            </div>
            {submitSuccess && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: clr.successText,
                background: clr.successBg, padding: "6px 16px", borderRadius: 99,
                border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: clr.success }} />
                Submitted successfully
              </span>
            )}
          </div>

          <form onSubmit={handleAddComplaint}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelSt}>Complaint Title</label>
                <input style={inputBase(!!errors.title)} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Street light not working" />
                <FieldError msg={errors.title} />
              </div>
              <div>
                <label style={labelSt}>Category</label>
                <select style={inputBase(!!errors.category)} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">Select…</option>
                  <option>Electricity</option>
                  <option>Roads & Infrastructure</option>
                  <option>Sanitation</option>
                  <option value="Water">Water Supply</option>
                  <option value="Other">Other</option>
                </select>
                {category === "Other" && (
                  <input type="text" placeholder="Enter custom category" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} style={{ ...inputBase(false), marginTop: 8 }} />
                )}
                <FieldError msg={errors.category} />
              </div>
              <div>
                <label style={labelSt}>Urgency</label>
                <select style={inputBase(!!errors.urgency)} value={urgency} onChange={e => setUrgency(e.target.value)}>
                  <option value="">Select…</option>
                  <option>Normal</option>
                  <option>Medium</option>
                  <option>Urgent</option>
                </select>
                <FieldError msg={errors.urgency} />
              </div>
              <div>
                <label style={labelSt}>Visibility</label>
                <select style={inputBase(false)} value={visibility} onChange={e => setVisibility(e.target.value)}>
                  <option value="">Select…</option>
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelSt}>Complaint Details</label>
              <textarea rows={3} value={details} onChange={e => setDetails(e.target.value)}
                placeholder="Describe the issue — location, duration, impact…"
                style={{ ...inputBase(!!errors.details), resize: "vertical", lineHeight: 1.7 }} />
              <FieldError msg={errors.details} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 12, color: clr.muted, fontWeight: 600,
                border: `1.5px dashed ${clr.accent2}`, borderRadius: radius.sm,
                padding: "8px 16px", cursor: "pointer", background: "#F5ECE3",
                transition: "all 0.2s",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={clr.accent1} strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Evidence
                <input hidden type="file" accept="image/*" onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                    setPreviewImage(URL.createObjectURL(selectedFile));
                  }
                }} />
              </label>

              {file && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <p style={{ fontSize: 11, color: clr.success, fontWeight: 600, margin: 0 }}>📎 {file.name}</p>
                  <img src={previewImage} alt="Preview" onClick={() => setImageModal(true)}
                    style={{ width: 48, height: 48, objectFit: "cover", borderRadius: radius.sm, border: `2px solid ${clr.accent2}`, cursor: "pointer", boxShadow: shadow }} />
                </div>
              )}

              <button type="submit" style={{
                display: "inline-flex", alignItems: "center", gap: 9, padding: "10px 26px",
                borderRadius: radius.sm,
                background: `linear-gradient(135deg, ${clr.primary})`,
                color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(79,70,229,0.35)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                Submit Complaint
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
          </form>
        </div>

        {/* ── ROW 3: My Complaints ── */}
        <div style={{
          ...cardStyle,
          background: " #FFFFFF",
          position: "relative", overflow: "hidden",
        }}>
         
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <p style={labelSt}>My Complaints</p>
              <p style={{ fontSize: 11, color: clr.hint, margin: "3px 0 0", fontWeight: 500 }}>{filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? "s" : ""} found</p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: clr.hint, fontSize: 13, fontWeight: 600 }}>
              <div style={{ width: 32, height: 32, border: `3px solid ${clr.accent2}`, borderTopColor: clr.primary, borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
              Loading complaints…
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F5ECE3", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={clr.accent1} strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p style={{ fontSize: 13, color: clr.hint, margin: 0, fontWeight: 600 }}>No complaints found. Submit one above.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
              {filteredComplaints.map(c => (
                <div key={c.id} onClick={() => setSelectedComplaint(c)}
                  style={{
                    padding: "15px 17px",
                    border: `1.5px solid ${selectedComplaint?.id === c.id ? clr.primary : clr.border}`,
                    borderRadius: radius.md,
                    background: selectedComplaint?.id === c.id
                      ? "linear-gradient(135deg, #F5ECE3, #f6f3ef)"
                      : "#FAFBFF",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    boxShadow: selectedComplaint?.id === c.id ? `0 4px 16px rgba(79,70,229,0.15)` : "none",
                  }}
                  onMouseEnter={e => { if (selectedComplaint?.id !== c.id) { e.currentTarget.style.borderColor = clr.accent1; e.currentTarget.style.boxShadow = shadowHover; } }}
                  onMouseLeave={e => { if (selectedComplaint?.id !== c.id) { e.currentTarget.style.borderColor = clr.border; e.currentTarget.style.boxShadow = "none"; } }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 7,
                    }}
                  >
                    {/* LEFT SIDE */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          lineHeight: 1.4,
                          color: clr.text,

                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          wordBreak: "break-word",
                        }}
                      >
                        {c.title}
                      </span>
                    </div>

                    {/* RIGHT SIDE */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        flexShrink: 0,
                      }}
                    >
                  <UrgencyBadge level={c.urgency} />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteComplaint(c.id); }}
                        style={{ border: "none", background: "transparent", cursor: "pointer", padding: 3, display: "flex", alignItems: "center", borderRadius: 6, transition: "background 0.15s" }}
                        title="Delete Complaint"
                        onMouseEnter={e => e.currentTarget.style.background = "#FFF1F2"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={clr.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6L18.1 19.5A2 2 0 0116.1 21H7.9A2 2 0 015.9 19.5L5 6" />
                          <path d="M10 11V17" /><path d="M14 11V17" />
                          <path d="M9 6V4A1 1 0 0110 3H14A1 1 0 0115 4V6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: clr.hint,
                      marginBottom: 10,
                      fontWeight: 600,

                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.category} · {c.date}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <StatusBadge status={c.status} />
                    <span style={{ fontSize: 9, color: clr.accent2, fontWeight: 700, letterSpacing: "0.5px" }}>#{(c.id || "").slice(-6).toUpperCase()}</span>
                  </div>

                  {c.evidence && (
                    <div style={{ fontSize: 11, color: clr.success, marginTop: 7, fontWeight: 600 }}>📎 {c.evidence}</div>
                  )}

                 {/* Replace every occurrence of c.replies / selectedComplaint.replies with this block.
   This will show:
   - MLA replies
   - Employee replies
   - Public comments from Home page discussion
*/}

<div style={{ marginTop: 10 }}>
  <div
    style={{
      fontSize: 9,
      fontWeight: 800,
      color: clr.hint,
      marginBottom: 5,
      textTransform: "uppercase",
      letterSpacing: "0.6px",
    }}
  >
    Updates & Public Discussion
  </div>

  <div style={{ maxHeight: 160, overflowY: "auto" }}>
    {(
      c.comments || // public comments from home page
      c.replies ||  // MLA/Employee replies
      []
    ).length > 0 ? (
      (c.comments || c.replies || []).map((reply, i) => (
        <div
          key={i}
          style={{
            fontSize: 11,
            background: "#FFFDF9",
            border: `1px solid ${clr.border}`,
            borderRadius: 7,
            padding: "8px 10px",
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          {/* Name + Role */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <strong style={{ color: clr.primary }}>
              {reply.username || reply.from || "Anonymous"}
            </strong>

            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 999,
                background:
                  (reply.role || "").toLowerCase() === "mla"
                    ? "#EEF2FF"
                    : (reply.role || "").toLowerCase() === "employee"
                    ? "#ECFDF5"
                    : "#FFF7ED",
                color:
                  (reply.role || "").toLowerCase() === "mla"
                    ? "#4338CA"
                    : (reply.role || "").toLowerCase() === "employee"
                    ? "#065F46"
                    : "#9A3412",
              }}
            >
              {reply.role || "Citizen"}
            </span>
          </div>

          {/* Comment Text */}
          <div style={{ color: clr.text, lineHeight: 1.5 }}>
            {reply.text}
          </div>

          {/* Date */}
          {reply.createdAt && (
            <div
              style={{
                fontSize: 9,
                color: clr.hint,
                marginTop: 4,
              }}
            >
              {new Date(reply.createdAt).toLocaleString()}
            </div>
          )}
        </div>
      ))
    ) : (
      <span
        style={{
          fontSize: 10,
          color: clr.hint,
          fontWeight: 500,
        }}
      >
        No updates yet
      </span>
    )}
  </div>
</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Modal */}
        {imageModal && (
          <div onClick={() => setImageModal(false)} style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(15,10,50,0.65)", backdropFilter: "blur(6px)",
            display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999,
          }}>
            <button onClick={() => setImageModal(false)} style={{
              position: "absolute", top: 20, right: 20,
              background: "#fff", border: "none", borderRadius: "50%",
              width: 42, height: 42, fontSize: 22, fontWeight: "bold", cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}>×</button>
            <img src={previewImage} alt="Full Preview" style={{
              maxWidth: "88%", maxHeight: "88%", borderRadius: radius.lg,
              boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            }} />
          </div>
        )}
      </div>
    </>
  );
}