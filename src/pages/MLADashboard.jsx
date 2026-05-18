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
    "In Progress": {
      bg: clr.inProgressLight,
      color: clr.inProgress,
    },
    Resolved: {
      bg: clr.successLight,
      color: clr.success,
    },
    Rejected: {
      bg: clr.accentLight,
      color: clr.accent,
    },
    Forwarded: {
      bg: clr.goldLight,
      color: clr.gold,
    },
  };

  const s = map[status] || {
    bg: "#F1EDE5",
    color: clr.muted,
  };

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

  const hue =
    (name || "")
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

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
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 16,
        fontSize: 28,
        opacity: 0.08,
        lineHeight: 1,
      }}
    >
      {icon}
    </div>

    <div
      style={{
        fontSize: 10,
        fontFamily: font.body,
        fontWeight: 700,
        color: clr.muted,
        letterSpacing: "1.2px",
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      {label}
    </div>

    <div
      style={{
        fontSize: 36,
        fontFamily: font.display,
        fontWeight: 700,
        color,
        lineHeight: 1,
        marginBottom: 4,
      }}
    >
      {value}
    </div>

    {sub && (
      <div
        style={{
          fontSize: 11,
          color: clr.hint,
          fontFamily: font.body,
        }}
      >
        {sub}
      </div>
    )}
  </div>
);

const selectSt = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 12,
  color: clr.text,
  background: clr.paper,
  border: `1px solid ${clr.border}`,
  borderRadius: 4,
  outline: "none",
  fontFamily: font.body,
  cursor: "pointer",
  letterSpacing: "0.3px",
};

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

const urgencyScore = (u) =>
  u === "Urgent" ? 1 : u === "Medium" ? 2 : 3;

// ── Main Component ─────────────────────────────────────────────
export default function MlaComplaintDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [comment, setComment] = useState("");

  const [filters, setFilters] = useState({
    urgency: "",
    category: "",
    ward: "",
    status: "",
  });

  useEffect(() => {
    const link = document.createElement("link");

    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap";

    link.rel = "stylesheet";

    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`${import.meta.env.VITE_API_BASE_URL}/complaints`).then((r) => {
        if (!r.ok)
          throw new Error("Failed to fetch complaints");

        return r.json();
      }),

      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`)
        .then((r) => r.json())
        .catch(() => []),
    ])
      .then(([complaintsData, usersData]) => {
        const formattedComplaints = Array.isArray(
          complaintsData
        )
          ? complaintsData.map((c) => ({
              ...c,
              id: c._id,
              userName:
                c.citizenId?.name || "Unknown Citizen",
              date: new Date(
                c.createdAt
              ).toLocaleDateString(),
              ward: c.ward || "General",
            }))
          : [];

        setComplaints(formattedComplaints);

        setUsers(
          Array.isArray(usersData) ? usersData : []
        );

        if (formattedComplaints.length > 0) {
          setSelectedComplaint(
            formattedComplaints[0]
          );
        }

        setLoading(false);
      })
      .catch(() => {
        setError(
          "Could not connect to the server. Please ensure the NestJS backend is running on port 3001."
        );

        setLoading(false);
      });
  }, []);

  const setFilter = (key, val) =>
    setFilters((f) => ({
      ...f,
      [key]: val,
    }));

  const activeFilters =
    Object.values(filters).filter(Boolean).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const uniqueCategories = [
    ...new Set(
      complaints
        .map((c) => c.category)
        .filter(Boolean)
    ),
  ];

  const uniqueWards = [
    ...new Set(
      complaints.map((c) => c.ward).filter(Boolean)
    ),
  ];

  const uniqueStatuses = [
    ...new Set(
      complaints
        .map((c) => c.status)
        .filter(Boolean)
    ),
  ];

  const filteredComplaints = useMemo(
    () =>
      complaints
        .filter(
          (c) =>
            !filters.urgency ||
            c.urgency === filters.urgency
        )
        .filter(
          (c) =>
            !filters.category ||
            c.category === filters.category
        )
        .filter(
          (c) =>
            !filters.ward ||
            c.ward === filters.ward
        )
        .filter(
          (c) =>
            !filters.status ||
            c.status === filters.status
        )
        .sort(
          (a, b) =>
            urgencyScore(a.urgency) -
            urgencyScore(b.urgency)
        ),
    [complaints, filters]
  );

  const totalComplaints = complaints.length;

  const urgentIssues = complaints.filter(
    (c) => c.urgency === "Urgent"
  ).length;

  const pendingCount = complaints.filter(
    (c) => c.status === "Pending"
  ).length;

  const resolvedCount = complaints.filter(
    (c) => c.status === "Resolved"
  ).length;

  const updateStatus = async (newStatus) => {
    if (!selectedComplaint) return;

    setActionLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/complaints/${selectedComplaint.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            comment,
            userId:
              selectedComplaint.citizenId?._id ||
              selectedComplaint.citizenId,
          }),
        }
      );

      if (response.ok) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id
              ? {
                  ...c,
                  status: newStatus,
                  comment,
                }
              : c
          )
        );

        setSelectedComplaint((prev) => ({
          ...prev,
          status: newStatus,
          comment,
        }));
      } else {
        alert("Failed to update status.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: clr.bg,
        fontFamily: font.body,
      }}
    >
      <header
        style={{
          background: clr.paper,
          borderBottom: `1px solid ${clr.border}`,
          padding: "0 32px",
        }}
      >
        {/* Top strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            borderBottom: `1px solid ${clr.borderLight}`,
          }}
        >
          <span>
            Government of Kerala · MLA Dashboard
          </span>

          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
            }}
          >
            {users.length > 0 && (
              <span>
                {users.length} citizens registered
              </span>
            )}

            <span>
              {filteredComplaints.length} /{" "}
              {totalComplaints} shown
            </span>
          </div>
        </div>

        {/* Main Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 0",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: font.display,
                fontSize: 30,
                margin: 0,
              }}
            >
              Complaint Registry
            </h1>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: clr.muted,
              }}
            >
              Constituency management
            </p>
          </div>

          <button onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ padding: "24px 32px" }}>
        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <StatCard
            label="Total Complaints"
            value={totalComplaints}
            color={clr.primary}
            icon="📋"
          />

          <StatCard
            label="Urgent Issues"
            value={urgentIssues}
            color={clr.accent}
            icon="🔴"
          />

          <StatCard
            label="Pending"
            value={pendingCount}
            color={clr.warning}
            icon="⏳"
          />

          <StatCard
            label="Resolved"
            value={resolvedCount}
            color={clr.success}
            icon="✅"
          />
        </div>

        {/* Complaints Table */}
        <div
          style={{
            background: clr.paper,
            border: `1px solid ${clr.border}`,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Citizen</th>
                <th>Complaint</th>
                <th>Category</th>
                <th>Urgency</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredComplaints.map((c) => (
                <tr
                  key={c.id}
                  onClick={() =>
                    setSelectedComplaint(c)
                  }
                >
                  <td>{c.userName}</td>
                  <td>{c.title}</td>
                  <td>{c.category}</td>
                  <td>
                    <UrgencyBadge
                      level={c.urgency}
                    />
                  </td>
                  <td>
                    <StatusBadge
                      status={c.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}