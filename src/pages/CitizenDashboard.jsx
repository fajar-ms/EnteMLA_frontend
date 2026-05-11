import React, { useState, useEffect } from "react";
import axios from 'axios';

const clr = {
  bg: "#F8FAFC", card: "#FFFFFF", border: "#E2E8F0", text: "#0F172A",
  muted: "#64748B", hint: "#94A3B8", primary: "#2563EB",
  danger: "#EF4444", dangerBg: "#FEF2F2", dangerText: "#B91C1C",
  warning: "#F59E0B", warningBg: "#FFFBEB", warningText: "#92400E",
  success: "#22C55E", successBg: "#F0FDF4", successText: "#166534",
  blue: "#EFF6FF", blueText: "#1D4ED8",
};
const shadow = "0 1px 4px rgba(0,0,0,0.06)";
const radius = { sm: 8, md: 12, lg: 16 };

const Avatar = ({ name, size = 52 }) => {
  const initials = (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},55%,88%)`, color: `hsl(${hue},55%,32%)`,
      fontSize: size * 0.33, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>{initials}</div>
  );
};

const UrgencyBadge = ({ level }) => {
  const map = {
    Urgent: { bg: clr.dangerBg, color: clr.dangerText, dot: clr.danger },
    Medium: { bg: clr.warningBg, color: clr.warningText, dot: clr.warning },
    Normal: { bg: clr.successBg, color: clr.successText, dot: clr.success },
  };
  const s = map[level] || map.Normal;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, letterSpacing: "0.4px", padding: "3px 9px", borderRadius: 99 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {level || "Normal"}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Submitted: { bg: clr.blue, color: clr.blueText },
    Pending: { bg: clr.blue, color: clr.blueText },
    "In Progress": { bg: clr.warningBg, color: clr.warningText },
    Resolved: { bg: clr.successBg, color: clr.successText },
    Rejected: { bg: clr.dangerBg, color: clr.dangerText },
  };
  const s = map[status] || { bg: "#F1F5F9", color: clr.muted };
  return (
    <span style={{ display: "inline-block", background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, letterSpacing: "0.4px", padding: "3px 9px", borderRadius: 99 }}>
      {status || "Pending"}
    </span>
  );
};

const FieldError = ({ msg }) =>
  msg ? <div style={{ fontSize: 11, color: clr.danger, marginTop: 4 }}>{msg}</div> : null;

const inputBase = (hasError) => ({
  width: "100%", boxSizing: "border-box", padding: "9px 12px",
  fontSize: 13, color: clr.text, background: "#F8FAFC",
  border: `1px solid ${hasError ? clr.danger : clr.border}`,
  borderRadius: radius.sm, outline: "none", fontFamily: "inherit",
});

const labelSt = {
  fontSize: 11, fontWeight: 700, color: clr.hint,
  letterSpacing: "0.5px", textTransform: "uppercase",
  display: "block", marginBottom: 5,
};

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [details, setDetails] = useState("");
  const [visibility, setVisibility] = useState("");

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [file, setFile] = useState(null);
  const handleLogout = () => {
    localStorage.clear(); // Clears role and any session data
    window.location.href = "/"; // Redirects to login page
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

    // 🔥 2. FETCH ONLY THIS CITIZEN'S COMPLAINTS
    const fetchMyComplaints = async () => {
      setLoading(true);
      try {
        // We use the specific route we created in the Controller
        const response = await fetch(`http://localhost:3001/complaints/citizen/${userData._id}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setComplaints(data.map(c => ({
            ...c,
            id: c._id, // Map MongoDB _id to the UI 'id' key
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

  // useEffect(() => {
  //   fetch("http://localhost:5000/api/user")
  //     .then(r => r.json()).then(d => setUser(d))
  //     .catch(() => setUser({ name: "Guest User", email: "guest@email.com", phone: "N/A", location: "Unknown" }));
  // }, []);

  // useEffect(() => {
  //   // 1. Get user from storage
  //   const savedUser = localStorage.getItem("user");
    
  //   if (savedUser) {
  //     try {
  //       const userData = JSON.parse(savedUser);
  //       setUser(userData);
        
  //       // 2. Fetch Complaints from the correct NestJS port (3001)
  //       setLoading(true);
  //       fetch("http://localhost:3001/complaints") 
  //         .then(res => {
  //           if (!res.ok) throw new Error("Failed to fetch");
  //           return res.json();
  //         })
  //         .then(data => {
  //           // Map the _id from MongoDB to the 'id' used in your UI components
  //           const mappedData = data.map(c => ({ 
  //             ...c, 
  //             id: c._id, 
  //             date: new Date(c.date).toLocaleDateString() 
  //           }));
  //           setComplaints(mappedData);
  //           setLoading(false);
  //         })
  //         .catch(err => {
  //           console.error("Complaint fetch error:", err);
  //           setLoading(false);
  //         });

  //     } catch (err) {
  //       console.error("Session corrupted:", err);
  //       handleLogout();
  //     }
  //   } else {
  //     // 3. No user? Force redirect to login
  //     handleLogout();
  //   }
  // }, []); // Run only once when the dashboard mounts

  // Inside CitizenDashboard.jsx
const handleAddComplaint = async (e) => {
  e.preventDefault();
  
  console.log("Current User State:", user);
  // Basic Validation
  if (!title || !category || !urgency || !details){
    alert("Please fill in all required fields (Title, Category, Urgency, and Details) before submitting.");
    return;
  }

  const complaintPayload = {
    title,
    category,
    urgency,
    details,
    visibility: visibility || "Public",
    citizenId: user._id, // 🔥 This comes from your logged-in user state
  };

  console.log("Sending Payload:", complaintPayload);

  try {
      const response = await fetch("http://localhost:3001/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintPayload),
      });

      if (response.ok) {
        const savedComplaint = await response.json();
        
        // Update UI with the real object from DB
        setComplaints(prev => [{
          ...savedComplaint,
          id: savedComplaint._id,
          date: new Date().toLocaleDateString()
        }, ...prev]);

        // Reset form
        setTitle(""); setCategory(""); setDetails(""); setUrgency("");
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error) {
      alert("Submission failed. Check backend connection.");
    }
};


  const filteredComplaints = complaints.filter(c =>

  ((c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.id || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: clr.bg }}>
      <span style={{ fontSize: 13, color: clr.muted }}>Loading...</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: clr.bg, padding: "24px 28px", fontFamily: "'DM Sans','Segoe UI',sans-serif", fontSize: 14, color: clr.text }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: clr.success, boxShadow: `0 0 0 3px ${clr.successBg}` }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: clr.success, letterSpacing: "0.8px", textTransform: "uppercase" }}>Active Session</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.4px" }}>Citizen Dashboard</h1>
          <p style={{ fontSize: 12, color: clr.hint, margin: "3px 0 0" }}>MLA Portal · Civic Complaint System</p>
        </div>

        {/* Action Buttons Container */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>

          {/* Notification Button */}
          <button style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${clr.border}`, background: clr.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: shadow, position: "relative" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={clr.muted} strokeWidth="2" strokeLinecap="round">
              <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: clr.danger, border: "2px solid #fff" }} />
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 16px",
              height: 40,
              borderRadius: radius.md,
              border: `1px solid ${clr.danger}`,
              background: clr.dangerBg,
              color: clr.dangerText,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#FEE2E2"}
            onMouseLeave={(e) => e.currentTarget.style.background = clr.dangerBg}
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Profile Card */}
        <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: radius.lg, padding: "20px 22px", boxShadow: shadow }}>
          <p style={labelSt}>My Profile</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "14px 0 16px" }}>
            <Avatar name={user.name} size={54} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>{user.name}</div>
              <span style={{ display: "inline-block", marginTop: 5, fontSize: 11, fontWeight: 600, color: clr.blueText, background: clr.blue, padding: "2px 9px", borderRadius: 99 }}>
                ID: {user._id || "N/A"}
              </span>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${clr.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "✉️", val: user.email },
              { icon: "📞", val: user.phone },
              // { icon: "📍", val: user.location },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: clr.muted }}>{item.val || "N/A"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Track Details Card */}
        <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: radius.lg, padding: "20px 22px", boxShadow: shadow, display: "flex", flexDirection: "column" }}>
          <p style={labelSt}>Track Complaint</p>
          <div style={{ position: "relative", margin: "14px 0 12px" }}>
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <circle cx="6.5" cy="6.5" r="5" stroke={clr.hint} strokeWidth="1.5" />
              <path d="M10.5 10.5L13.5 13.5" stroke={clr.hint} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Search by ID or title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ ...inputBase(false), paddingLeft: 32 }} />
          </div>
          <div style={{ flex: 1, background: "#F8FAFC", border: `1px solid ${clr.border}`, borderRadius: radius.md, padding: 16, minHeight: 140, display: "flex", flexDirection: "column", justifyContent: selectedComplaint ? "flex-start" : "center" }}>
            {selectedComplaint ? (
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{selectedComplaint.title}</div>
                <div style={{ fontSize: 12, color: clr.hint, marginBottom: 12 }}>
                  ID: <strong style={{ color: clr.muted }}>{selectedComplaint.id}</strong> · {selectedComplaint.category} · {selectedComplaint.date}
                </div>
                <div style={{ height: 1, background: clr.border, marginBottom: 12 }} />
                <div style={{ display: "flex", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, color: clr.hint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 }}>Status</div>
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: clr.hint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 }}>Urgency</div>
                    <UrgencyBadge level={selectedComplaint.urgency} />
                  </div>
                </div>
                {selectedComplaint.details && (
                  <div style={{ marginTop: 12, padding: "10px 12px", background: "#fff", border: `1px solid ${clr.border}`, borderRadius: radius.sm }}>
                    <p style={{ fontSize: 12, color: clr.muted, margin: 0, lineHeight: 1.6 }}>{selectedComplaint.details}</p>
                  </div>
                )}
                
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={clr.hint} strokeWidth="1.5" style={{ marginBottom: 8 }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <p style={{ fontSize: 12, color: clr.hint, margin: 0, lineHeight: 1.7 }}>Click a complaint below<br />to view its full details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 2: Complaint Form ── */}
      <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: radius.lg, padding: "20px 22px", boxShadow: shadow, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <p style={labelSt}>Lodge a Complaint</p>
            <p style={{ fontSize: 12, color: clr.hint, margin: "3px 0 0" }}>Fill in the details and submit your civic issue</p>
          </div>
          {submitSuccess && (
            <span style={{ fontSize: 12, fontWeight: 600, color: clr.successText, background: clr.successBg, padding: "5px 14px", borderRadius: 99 }}>✓ Submitted successfully</span>
          )}
        </div>

        <form onSubmit={handleAddComplaint}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelSt}>Complaint Title</label>
              <input style={inputBase(!!errors.title)} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Street light not working" />
              <FieldError msg={errors.title} />
            </div>
            <div>
              <label style={labelSt}>Category</label>
              <select style={inputBase(!!errors.category)} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Select...</option>
                <option>Electricity</option>
                <option>Roads & Infrastructure</option>
                <option>Sanitation</option>
                <option value="Water">Water Supply</option>
                <option>Other</option>
              </select>
              <FieldError msg={errors.category} />
            </div>
            <div>
              <label style={labelSt}>Urgency</label>
              <select style={inputBase(!!errors.urgency)} value={urgency} onChange={e => setUrgency(e.target.value)}>
                <option value="">Select...</option>
                <option>Normal</option>
                <option>Medium</option>
                <option>Urgent</option>
              </select>
              <FieldError msg={errors.urgency} />
            </div>
            <div>
              <label style={labelSt}>Visibility</label>
              <select style={inputBase(false)} value={visibility} onChange={e => setVisibility(e.target.value)}>
                <option value="">Select...</option>
                <option>Public</option>
                <option>Private</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelSt}>Complaint Details</label>
            <textarea rows={3} value={details} onChange={e => setDetails(e.target.value)}
              placeholder="Describe the issue — location, duration, impact..."
              style={{ ...inputBase(!!errors.details), resize: "vertical", lineHeight: 1.6 }} />
            <FieldError msg={errors.details} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: clr.muted, fontWeight: 500, border: `1px dashed ${clr.border}`, borderRadius: radius.sm, padding: "7px 14px", cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Evidence
              <input hidden type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            </label>
            {file && (
              <p style={{ fontSize: 12, color: "green", marginTop: 6 }}>
                File selected: {file.name}
              </p>
            )}
            <button type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 24px", borderRadius: radius.sm, background: clr.primary, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
              Submit Complaint
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </form>
      </div>

      {/* ── ROW 3: My Complaints ── */}
      <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: radius.lg, padding: "20px 22px", boxShadow: shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={labelSt}>My Complaints</p>
          <button style={{ fontSize: 12, fontWeight: 600, color: clr.primary, background: "none", border: "none", cursor: "pointer" }}>View All →</button>
        </div>

        {loading ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: clr.hint, fontSize: 13 }}>Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={clr.hint} strokeWidth="1.5" style={{ marginBottom: 8 }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            <p style={{ fontSize: 13, color: clr.hint, margin: 0 }}>No complaints found. Submit one above.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, maxHeight: 400, overflowY: "auto", paddingRight: 2 }}>
            {filteredComplaints.map(c => (
              <div key={c.id} onClick={() => setSelectedComplaint(c)}
                style={{ padding: "14px 16px", border: `1.5px solid ${selectedComplaint?.id === c.id ? clr.primary : clr.border}`, borderRadius: radius.md, background: selectedComplaint?.id === c.id ? clr.blue : "#fff", cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={e => { if (selectedComplaint?.id !== c.id) e.currentTarget.style.borderColor = "#93C5FD"; }}
                onMouseLeave={e => { if (selectedComplaint?.id !== c.id) e.currentTarget.style.borderColor = clr.border; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, flex: 1, paddingRight: 8, lineHeight: 1.3 }}>{c.title}</span>
                  <UrgencyBadge level={c.urgency} />
                </div>
                <div style={{ fontSize: 11, color: clr.hint, marginBottom: 10 }}>{c.category} · {c.date}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <StatusBadge status={c.status} />
                  <span style={{ fontSize: 10, color: "#CBD5E1", fontWeight: 500 }}>#{(c.id || "").slice(-6).toUpperCase()}</span>
                  {c.evidence && (
                    <div style={{ fontSize: 11, color: "#16A34A", marginTop: 6 }}>
                      📎 {c.evidence}
                    </div>
                  )}
                  {/* 🔥 Updates / Replies Section */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: clr.hint, marginBottom: 4 }}>
                      Updates
                    </div>

                    {/* Show replies */}
                    <div style={{ maxHeight: 70, overflowY: "auto", marginBottom: 6 }}>
                      {c.replies && c.replies.length > 0 ? (
                        c.replies.map((r, i) => (
                          <div key={i} style={{
                            fontSize: 11,
                            background: "#F8FAFC",
                            border: `1px solid ${clr.border}`,
                            borderRadius: 6,
                            padding: "4px 6px",
                            marginBottom: 4
                          }}>
                            <strong>{r.from}:</strong> {r.text}
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: 10, color: clr.hint }}>No updates</span>
                      )}
                    </div>


                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}