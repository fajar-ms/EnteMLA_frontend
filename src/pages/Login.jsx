import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "./Login.css";

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

          // ✅ CHECK REDIRECT PAGE
          const redirectAfterLogin =
            localStorage.getItem("redirectAfterLogin");

          if (redirectAfterLogin) {

            localStorage.removeItem("redirectAfterLogin");

            navigate(redirectAfterLogin);

          } else {

            const routes = {
              citizen: "/citizen",
              mla: "/mla",
              employee: "/employee",
            };

            navigate(routes[role] || "/");
          }
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed. Check your credentials.";
      alert(errorMsg);
    }
  };
  return (
    <div className="login-page">
      <div className="login-card">
        <header className="login-header">
          <div className="logo-badge">Ente<span>MLA</span></div>
          <h1>Access Portal</h1>
          {/* <p className="sub-text">Enter your credentials to manage your constituency services</p> */}
        </header>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            
            <input
              type="email"
              className="text-input"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
         
            <input
              type="password"
              className="text-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Sign In
          </button>
        </form>

        <footer className="login-footer">
          <p>© 2026 Digital Governance Initiative. Secure Access Only.</p>
        </footer>
      </div>
    </div>
  );
}
  

