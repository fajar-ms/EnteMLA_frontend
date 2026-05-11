import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const role = localStorage.getItem("role");

    if (!role) {
      alert("Please select a role first");
      navigate("/role");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/auth/login", {
        email,
        password,
        role: role
      });

      if (response.status === 200 || response.status === 201) {
        const userData = response.data.user;
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("role", role);
          
          const routes = {
            citizen: "/citizen",
            mla: "/mla",
            employee: "/employee",
          };
          navigate(routes[role] || "/");
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed. Check your credentials.";
      alert(errorMsg);
    }
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.loginFormWrapper}>
        <header style={styles.header}>
          <div style={styles.logoBadge}>Ente<span>MLA</span></div>
          <h1 style={styles.mainTitle}>Access Portal</h1>
          <p style={styles.subText}>Enter your credentials to manage your constituency services</p>
        </header>

        <form style={styles.form} onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Official Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              style={styles.textInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Security Password</label>
            <input
              type="password"
              placeholder="••••••••"
              style={styles.textInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            Sign In to Portal
          </button>
        </form>

        <footer style={styles.footer}>
          <p>© 2026 Digital Governance Initiative. Secure Access Only.</p>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc', // Clean light gray/blue background
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loginFormWrapper: {
    width: '100%',
    maxWidth: '440px',
    background: '#ffffff',
    padding: '48px 40px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoBadge: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0a66c2',
    marginBottom: '16px',
    letterSpacing: '-0.5px',
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  subText: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  textInput: {
    height: '46px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    padding: '0 16px',
    fontSize: '15px',
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#ffffff',
  },
  submitBtn: {
    height: '48px',
    background: '#0f172a', // Dark navy/slate for an authoritative look
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '8px',
  },
  footer: {
    marginTop: '40px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#94a3b8',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '20px',
  }
};