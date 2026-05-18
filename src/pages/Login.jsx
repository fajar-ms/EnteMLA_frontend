import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const role = localStorage.getItem("role");

  const handleLogin = async (e) => {
    e.preventDefault();

    const selectedRole = localStorage.getItem("role");

    if (!selectedRole) {
      alert("Please select a role first");
      navigate("/role");
      return;
    }

    try {
      const response = await axios.post(
        "http://13.204.0.224:5000/auth/login",
        {
          email,
          password,
          role: selectedRole,
        }
      );

      if (response.status === 200 || response.status === 201) {
        const userData = response.data.user;

        if (userData) {
          console.log(response.data.user);
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("role", selectedRole);

          // Redirect after login if needed
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

            navigate(routes[selectedRole] || "/");
          }
        }
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";

      alert(errorMsg);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <div className="logo">
            Ente<span>MLA</span>
          </div>

          <h1>Welcome Back</h1>

          <p className="subtitle">
            Secure Digital Governance Portal
          </p>

          <div className="role-badge">
            {role === "citizen" && "👤 Citizen Login"}
            {role === "mla" && "🏛️ MLA Login"}
            {role === "employee" && "🛠️ Employee Login"}
          </div>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleLogin}>

          {/* Email */}
          <div className="form-group">
            <label>Email Address</label>

            <div className="input-box">
              <span className="icon">📧</span>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>

            <div className="input-box">
              <span className="icon">🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Show/Hide Password Button */}
              <button
                type="button"
                className="show-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button type="submit" className="login-btn">
            Sign In →
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>© 2026 Digital Governance Initiative</p>
        </div>
      </div>
    </div>
  );
}