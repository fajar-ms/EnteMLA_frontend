import React, { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const constituencyMap = {
  thiruvananthapuram: [
    { value: "kovalam", label: "Kovalam" },
    { value: "vattiyoorkavu", label: "Vattiyoorkavu" },
    { value: "thiruvananthapuram", label: "Thiruvananthapuram" },
  ],
  kollam: [
    { value: "chavara", label: "Chavara" },
    { value: "kundara", label: "Kundara" },
    { value: "kollam", label: "Kollam" },
  ],
  pathanamthitta: [
    { value: "adoor", label: "Adoor" },
    { value: "thiruvalla", label: "Thiruvalla" },
    { value: "pathanamthitta", label: "Pathanamthitta" },
  ],
  alappuzha: [
    { value: "cherthala", label: "Cherthala" },
    { value: "alappuzha", label: "Alappuzha" },
    { value: "ambalappuzha", label: "Ambalappuzha" },
  ],
  kottayam: [
    { value: "pala", label: "Pala" },
    { value: "kottayam", label: "Kottayam" },
    { value: "changanacherry", label: "Changanacherry" },
  ],
  idukki: [
    { value: "devikulam", label: "Devikulam" },
    { value: "udumbanchola", label: "Udumbanchola" },
    { value: "thodupuzha", label: "Thodupuzha" },
  ],
  ernakulam: [
    { value: "aluva", label: "Aluva" },
    { value: "kalamassery", label: "Kalamassery" },
    { value: "thrippunithura", label: "Thrippunithura" },
  ],
  thrissur: [
    { value: "guruvayur", label: "Guruvayur" },
    { value: "thrissur", label: "Thrissur" },
    { value: "manalur", label: "Manalur" },
  ],
  palakkad: [
    { value: "mannarkkad", label: "Mannarkkad" },
    { value: "palakkad", label: "Palakkad" },
    { value: "ottapalam", label: "Ottapalam" },
  ],
  malappuram: [
    { value: "tirur", label: "Tirur" },
    { value: "malappuram", label: "Malappuram" },
    { value: "mankada", label: "Mankada" },
  ],
  kozhikode: [
    { value: "beypore", label: "Beypore" },
    { value: "kozhikode_north", label: "Kozhikode North" },
    { value: "kozhikode_south", label: "Kozhikode South" },
  ],
  wayanad: [
    { value: "mananthavady", label: "Mananthavady" },
    { value: "sulthan_bathery", label: "Sulthan Bathery" },
    { value: "kalpetta", label: "Kalpetta" },
  ],
  kannur: [
    { value: "thalassery", label: "Thalassery" },
    { value: "kannur", label: "Kannur" },
    { value: "dharmadom", label: "Dharmadom" },
  ],
  kasaragod: [
    { value: "manjeshwar", label: "Manjeshwar" },
    { value: "kasaragod", label: "Kasaragod" },
    { value: "udma", label: "Udma" },
  ],
};

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    district: "",      // Added
    constituency: "",
    place: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === "district" ? { constituency: "" } : {})
    }));
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
        district: form.district,         // Sent to NestJS
        constituency: form.constituency,
        place: form.place,
        password: form.password,
        role: "citizen"
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
        <div className="role-badge">
            <h3>👤 Citizen Login</h3>
          </div>
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
          {/* District */}
          <div className="input-group">
            <span>🗺️</span>
            <select name="district" value={form.district} onChange={handleChange} required>
              <option value="" disabled selected>Select District</option>

              <option value="thiruvananthapuram">Thiruvananthapuram</option>
              <option value="kollam">Kollam</option>
              <option value="pathanamthitta">Pathanamthitta</option>
              <option value="alappuzha">Alappuzha</option>
              <option value="kottayam">Kottayam</option>
              <option value="idukki">Idukki</option>
              <option value="ernakulam">Ernakulam</option>
              <option value="thrissur">Thrissur</option>
              <option value="palakkad">Palakkad</option>
              <option value="malappuram">Malappuram</option>
              <option value="kozhikode">Kozhikode</option>
              <option value="wayanad">Wayanad</option>
              <option value="kannur">Kannur</option>
              <option value="kasaragod">Kasaragod</option>
              {Object.keys(constituencyMap).map(dist => (
                <option key={dist} value={dist}>
                  {dist.charAt(0).toUpperCase() + dist.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Constituency */}
          <div className="input-group">
            <span>🏛️</span>
            <select name="constituency" value={form.constituency} onChange={handleChange} required>
              <option value="" disabled selected>Select Constituency</option>
              {form.district && constituencyMap[form.district]?.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
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