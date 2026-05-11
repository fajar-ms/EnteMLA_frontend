import React, { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    place: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Password Match Validation
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // 2. Prepare Payload (No OTP fields needed)
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        place: form.place,
        password: form.password,
        role:"employee"
      };

      // 3. API Call to NestJS
      
      const response = await axios.post("http://localhost:3001/auth/register", payload);

      if (response.status === 201 || response.status === 200) {
        setShowPopup(true);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed";
      alert(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>
        {/* <p>Direct registration enabled (OTP skipped)</p> */}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="input-group">
            <span>👤</span>
            <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
          </div>

          {/* Phone (Simple Input) */}
          <div className="input-group">
            <span>📱</span>
            <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required />
          </div>

          {/* Email (Simple Input) */}
          <div className="input-group">
            <span>📧</span>
            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
          </div>

          {/* Place */}
          <div className="input-group">
            <span>📍</span>
            <input type="text" name="place" placeholder="Your Location" onChange={handleChange} required />
          </div>

          {/* Password */}
          <div className="input-group">
            <span>🔒</span>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Password" 
              onChange={handleChange} 
              required 
            />
            <span className="eye" onClick={() => setShowPassword(!showPassword)}>👁</span>
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <span>🔑</span>
            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
          </div>

          <button type="submit" className="register-btn">Create Account</button>
        </form>

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h2>Registration Successful!</h2>
              <button onClick={() => navigate("/")}>Continue</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;