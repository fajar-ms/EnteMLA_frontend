import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser, FaLandmark, FaTools } from "react-icons/fa";
export default function LoginPage() {
  console.log("LOGIN PAGE OPENED");
  useEffect(() => {
    const token = localStorage.getItem("token");
    const selectedRole = localStorage.getItem("role");
    if (!selectedRole) {
      navigate("/");
    }

    if (token) {
      navigate("/");
    }
  }, []);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const role = localStorage.getItem("role");

  const handleLogin = async (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    const selectedRole = localStorage.getItem("role");

    if (!selectedRole) {
      alert("Please select a role first");
      navigate("/role");
      return;
    }

    try {

      let endpoint = "";
      let payload = {};

      if (selectedRole === "citizen") {

        endpoint = "/auth/login";

        payload = {
          email: identifier,
          password,
        };

      } else if (selectedRole === "mla") {

        endpoint = "/auth/mla/login";

        payload = {
          mlaId: identifier,
          password,
        };

      } else if (selectedRole === "employee") {

        endpoint = "/auth/employee/login";

        payload = {
          employeeId: identifier,
          password,
        };
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        payload
      );

      if (response.status === 200 || response.status === 201) {

        const { user: userData, token } = response.data;

        if (userData) {

          console.log(userData);

          localStorage.setItem(
            "user",
            JSON.stringify(userData)
          );

          localStorage.setItem(
            "role",
            selectedRole
          );

          if (!token) {
            alert("Authentication token missing");
            return;
          }

          localStorage.setItem("token", token);

          const redirectAfterLogin =
            localStorage.getItem(
              "redirectAfterLogin"
            );

          if (redirectAfterLogin) {

            localStorage.removeItem(
              "redirectAfterLogin"
            );

            navigate(redirectAfterLogin);

          } else {

            navigate("/");

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
        <div className="back-home" onClick={() => navigate("/")}>
          ← Back to Home
        </div>
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
  {role === "citizen" && (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <FaUser size={13} /> Citizen Login
    </span>
  )}
  {role === "mla" && (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <FaLandmark size={13} /> MLA Login
    </span>
  )}
  {role === "employee" && (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <FaTools size={13}  /> Employee Login
    </span>
  )}
</div>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleLogin}>

          {/* Email */}
          <div className="form-group">
            <label>
              {role === "citizen" && "Email Address"}
              {role === "mla" && "MLA ID"}
              {role === "employee" && "Employee ID"}
            </label>

            <div className="input-box">
              <span className="icon"><FaEnvelope size={14} color="#030f18" /></span>

              <input
                type="text"
                placeholder={
                  role === "citizen"
                    ? "Enter your email"
                    : role === "mla"
                      ? "Enter your MLA ID"
                      : "Enter your Employee ID"
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>

            <div className="input-box">
              <span className="icon"><FaLock size={14}  color="#030f18" /></span>

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
        {role === "citizen" && (
          <div className="register-link">
            <p>
              Not registered?{" "}
              <span onClick={() => navigate("/register")}>
                Register
              </span>
            </p>
          </div>
        )}
        {/* Footer */}
        <div className="login-footer">
          <p>© 2026 Digital Governance Initiative</p>
        </div>
      </div>
    </div>
  );
}