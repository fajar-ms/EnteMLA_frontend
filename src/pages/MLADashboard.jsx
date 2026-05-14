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
    Urgent: { bg: clr.dangerBg, color: clr.dangerText, dot: clr.danger },
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
    Pending: { bg: clr.blue, color: clr.blueText },
    "In Progress": { bg: clr.inProgress, color: clr.inProgressText },
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

const StatCard = ({ label, value, color, icon }) => (
  <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: R.lg, padding: "16px 20px", boxShadow: shadow, display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
    <div style={{ width: 42, height: 42, borderRadius: R.md, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, color: clr.hint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    </div>
  </div>
);

// ── Main Dashboard ─────────────────────────────────────────────
export default function MlaComplaintDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({ urgency: "", category: "", ward: "", status: "" });
  
  // Rejection Logic States
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const [replies, setReplies] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    fetch("http://localhost:3001/complaints")
      .then(r => r.json())
      .then((data) => {
        const formatted = Array.isArray(data) ? data.map(c => ({
          ...c,
          id: c._id,
          userName: c.citizenId?.name || "Unknown Citizen",
          date: new Date(c.createdAt).toLocaleDateString(),
        })) : [];
        setComplaints(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const updateStatus = async (newStatus, reason = "") => {
    if (!selectedComplaint) return;
    if (newStatus === "Rejected" && !reason.trim()) return alert("Reason required");

    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/complaints/${selectedComplaint.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus, 
          rejectionReason: reason, 
          adminName: "MLA Rajesh", 
          adminRole: "MLA" 
        }),
      });

      if (response.ok) {
        fetchData(); // Refresh list
        setSelectedComplaint(null); // Close panel
        setIsRejecting(false);
        setRejectionReason("");
      }
    } catch (err) {
      alert("Error updating status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReply = async (complaintId) => {
    const text = replies[complaintId];
    if (!text?.trim()) return alert("Type a message");
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/complaints/${complaintId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: text }),
      });
      if (response.ok) {
        setReplies(prev => ({ ...prev, [complaintId]: "" }));
        fetchData();
        alert("Sent");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c =>
      (!filters.urgency || c.urgency === filters.urgency) &&
      (!filters.status || c.status === filters.status)
    );
  }, [complaints, filters]);

  if (loading) return <div style={{ padding: 50, textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", background: clr.bg, padding: "24px 28px", fontFamily: "'DM Sans', sans-serif" }}>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>MLA Complaint Dashboard</h1>
          <p style={{ color: clr.hint, fontSize: 12 }}>{filteredComplaints.length} complaints active</p>
        </div>
        <button onClick={() => navigate("/")} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${clr.border}`, background: "#fff", cursor: "pointer", fontWeight: 600 }}>Logout</button>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total" value={complaints.length} color={clr.primary} icon="📋" />
        <StatCard label="Pending" value={complaints.filter(c => c.status === "Pending").length} color={clr.warning} icon="⏳" />
        <StatCard label="Resolved" value={complaints.filter(c => c.status === "Resolved").length} color={clr.success} icon="✅" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        <div style={{ background: "#fff", padding: 18, borderRadius: R.lg, border: `1px solid ${clr.border}`, height: "fit-content" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: clr.hint, textTransform: "uppercase", marginBottom: 15 }}>Filters</p>
          <select style={{ width: "100%", padding: 8, marginBottom: 10, borderRadius: 6, border: `1px solid ${clr.border}` }} onChange={e => setFilters({ ...filters, urgency: e.target.value })}>
            <option value="">All Urgency</option>
            <option value="Urgent">Urgent</option>
            <option value="Normal">Normal</option>
          </select>
          <select style={{ width: "100%", padding: 8, borderRadius: 6, border: `1px solid ${clr.border}` }} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div style={{ background: "#fff", borderRadius: R.lg, border: `1px solid ${clr.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", textAlign: "left", borderBottom: `1px solid ${clr.border}` }}>
                <th style={{ padding: 14, fontSize: 11, color: clr.hint }}>CITIZEN</th>
                <th style={{ padding: 14, fontSize: 11, color: clr.hint }}>COMPLAINT</th>
                <th style={{ padding: 14, fontSize: 11, color: clr.hint }}>URGENCY</th>
                <th style={{ padding: 14, fontSize: 11, color: clr.hint }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map(c => (
                <tr key={c.id} onClick={() => { setSelectedComplaint(c); setIsRejecting(false); }} style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer", background: selectedComplaint?.id === c.id ? clr.blue : "transparent" }}>
                  <td style={{ padding: 14 }}>{c.userName}</td>
                  <td style={{ padding: 14, fontWeight: 600 }}>{c.title}</td>
                  <td style={{ padding: 14 }}><UrgencyBadge level={c.urgency} /></td>
                  <td style={{ padding: 14 }}><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      {selectedComplaint && (
        <div style={{
          position: "fixed", top: 0, right: 0, width: "380px", height: "100vh",
          background: "#fff", borderLeft: "1px solid #E2E8F0",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.08)", padding: "24px",
          zIndex: 999, overflowY: "auto", display: "flex", flexDirection: "column"
        }}>
          {(() => {
            const isResolved = selectedComplaint.status === "Resolved";
            const isRejected = selectedComplaint.status === "Rejected";
            const isClosed = isResolved || isRejected;

            return (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedComplaint.title}</div>
                  <button onClick={() => setSelectedComplaint(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <UrgencyBadge level={selectedComplaint.urgency} />
                  <StatusBadge status={selectedComplaint.status} />
                </div>

                {/* 🟢 REJECTION HIGHLIGHT BOX */}
                {selectedComplaint.status === "Rejected" && selectedComplaint.rejectionReasons?.length > 0 && (
                  <div style={{
                    background: "#FFF1F2",
                    border: "1px solid #FECDD3",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "20px",
                    borderLeft: "5px solid #E11D48"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "20px" }}>🚫</span>
                      <span style={{ fontWeight: 800, fontSize: "12px", color: "#9F1239", textTransform: "uppercase" }}>
                        Official Rejection Notice
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#BE123C", fontWeight: "600", lineHeight: "1.5" }}>
                      {selectedComplaint.rejectionReasons[selectedComplaint.rejectionReasons.length - 1].text}
                    </p>
                    <div style={{ marginTop: "12px", fontSize: "11px", color: "#FB7185" }}>
                      Rejected by: <b>{selectedComplaint.rejectionReasons[0].adminName} ({selectedComplaint.rejectionReasons[0].adminRole})</b> 
                      • {new Date(selectedComplaint.rejectionReasons[0].date).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {isClosed && (
                  <div style={{ background: isResolved ? "#F0FDF4" : "#FFF1F2", border: `1px solid ${isResolved ? "#BBF7D0" : "#FECDD3"}`, color: isResolved ? "#15803D" : "#BE123C", padding: 12, borderRadius: 8, fontSize: 12, marginBottom: 20, fontWeight: 600 }}>
                    {isResolved ? "✅ Resolved: This case is closed." : "🚫 Rejected: No further action."}
                  </div>
                )}

                <div style={{ fontSize: 14, color: "#475569", background: "#F8FAFC", padding: 15, borderRadius: 8, marginBottom: 20 }}>
                  <p style={{ margin: "0 0 10px 0" }}><b>Description:</b> {selectedComplaint.details}</p>
                  <p style={{ margin: 2, fontSize: 12 }}><b>Citizen:</b> {selectedComplaint.userName}</p>
                  <p style={{ margin: 2, fontSize: 12 }}><b>Date:</b> {selectedComplaint.date}</p>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: isClosed ? "#CBD5E1" : "#94A3B8" }}>Reply to Citizen {isClosed && "(Disabled)"}</label>
                  <textarea
                    value={replies[selectedComplaint.id] || ""}
                    readOnly={isClosed}
                    onChange={(e) => setReplies(prev => ({ ...prev, [selectedComplaint.id]: e.target.value }))}
                    rows={4}
                    placeholder={isClosed ? "Replies are disabled for closed cases" : "Type official response..."}
                    style={{ width: "100%", marginTop: 8, padding: 12, border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, background: isClosed ? "#F1F5F9" : "#fff", outline: "none" }}
                  />
                </div>

                {/* ── Action Buttons Logic ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {!isRejecting ? (
                    <>
                      <button disabled={isClosed || actionLoading} onClick={() => handleSendReply(selectedComplaint.id)} style={{ padding: 12, borderRadius: 8, background: isClosed ? "#E2E8F0" : "#2563EB", color: "#fff", border: "none", fontWeight: 700, cursor: isClosed ? "not-allowed" : "pointer" }}>Send Reply</button>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <button disabled={isClosed || actionLoading || selectedComplaint.status === "In Progress"} onClick={() => updateStatus("In Progress")} style={{ padding: 10, borderRadius: 8, background: "#FFF7ED", color: "#C2410C", border: "1px solid #FDE68A", fontWeight: 600 }}>In Progress</button>
                        <button disabled={isClosed || actionLoading} onClick={() => updateStatus("Resolved")} style={{ padding: 10, borderRadius: 8, background: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0", fontWeight: 600 }}>Resolve</button>
                      </div>

                      <button 
                        disabled={isClosed || actionLoading} 
                        onClick={() => setIsRejecting(true)} 
                        style={{ padding: 12, borderRadius: 8, background: "#FFF1F2", color: "#BE123C", border: "1px solid #FECDD3", fontWeight: 600, cursor: isClosed ? "not-allowed" : "pointer" }}
                      >
                        Reject Complaint
                      </button>
                    </>
                  ) : (
                    /* ── Rejection Reason Input View ── */
                    <div style={{ background: "#FFF1F2", padding: 15, borderRadius: 8, border: "1px solid #FECDD3" }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#BE123C" }}>PROVIDE REJECTION REASON</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Why is this being rejected?"
                        style={{ width: "100%", marginTop: 8, padding: 10, border: "1px solid #FECDD3", borderRadius: 6, fontSize: 13, outline: "none" }}
                        rows={3}
                      />
                      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                        <button 
                          onClick={() => updateStatus("Rejected", rejectionReason)}
                          style={{ flex: 1, padding: 10, background: "#BE123C", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => { setIsRejecting(false); setRejectionReason(""); }}
                          style={{ flex: 1, padding: 10, background: "#fff", border: "1px solid #CBD5E1", borderRadius: 6, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => setSelectedComplaint(null)} style={{ marginTop: 20, padding: 12, background: "#F1F5F9", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Close Panel</button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}