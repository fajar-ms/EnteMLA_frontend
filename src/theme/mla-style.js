export const clr = {
  bg: "#E8F4FB",
  paper: "#FFFFFF",
  card: "#FFFFFF",
  border: "#C8DFF0",
  borderLight: "#DAEDF8",

  text: "#0D2137",
  textMid: "#1A3A55",
  muted: "#4A7A9B",
  hint: "#7AAEC8",

  primary: "#1A6BAF",
  primaryLight: "#E0F0FA",

  accent: "#1565C0",
  accentLight: "#E3F0FC",

  gold: "#1A7BB5",
  goldLight: "#DCF0FB",

  success: "#1A8A5A",
  successLight: "#E0F5EC",

  warning: "#1A7AAF",
  warningLight: "#DCF0FB",

  inProgress: "#1A55A0",
  inProgressLight: "#E0ECFA",
};

export const font = {
  display: "'Playfair Display', Georgia, serif",
  body: "'DM Sans', 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const selectSt = {
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

export const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    backdropFilter: "blur(4px)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 460,
    background: "#ffffff",
    padding: 28,
    borderRadius: 8,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    boxSizing: "border-box",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#0f172a",
  },
  description: {
    margin: "0 0 16px 0",
    fontSize: "0.875rem",
    color: "#64748b",
    lineHeight: "1.5",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 6,
    fontSize: "0.9rem",
    color: "#334155",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
    backgroundColor: "#f8fafc",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    padding: "10px 18px",
    background: "transparent",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    color: "#475569",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  confirmButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: 6,
    color: "#ffffff",
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "all 0.2s ease",
  },
};