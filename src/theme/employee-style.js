export const COLORS = {
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

export const urgencyStyle = {
  Urgent: { bg: "#FDE7E3", color: "#9F3A2D", dot: "#C65A4B" },
  Medium: { bg: "#FFF1D9", color: "#9A6A20", dot: "#C6923D" },
  Normal: { bg: "#E8F4FB", color: "#124E66", dot: "#1A6B8A" },
};

export const statusStyle = {
  Pending: { bg: "rgba(116,141,146,0.16)", color: "#2E3944" },
  "In Progress": { bg: "rgba(18,78,102,0.18)", color: "#124E66" },
  Resolved: { bg: "rgba(47,94,59,0.14)", color: "#2F5E3B" },
  Rejected: { bg: "rgba(166,61,64,0.14)", color: "#A63D40" },
};

export const selectStyles = {
    padding: "8px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 10,
    fontSize: 12.5, color: COLORS.textPrimary, background: "#FFFFFF",
    outline: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
    appearance: "none", paddingRight: 28,
  };

