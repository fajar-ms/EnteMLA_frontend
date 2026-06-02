import React, { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaMobileAlt, FaEnvelope, FaMapMarkerAlt, FaLandmark, FaLocationArrow, FaLock, FaKey, FaEye, FaEyeSlash, FaTools } from "react-icons/fa";
const constituencyMap = {
  thiruvananthapuram: [
    { value: "Kovalam", label: "Kovalam" },
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
    { value: "kochi", label: "Kochi" }
  ],
  thrissur: [
    { value: "guruvayur", label: "Guruvayur" },
    { value: "thrissur", label: "Thrissur" },
    { value: "manalur", label: "Manalur" },
    { value: "chalakkudy", label: "Chalakkudy" }
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
  const selectedRole = localStorage.getItem("role");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    district: "",      // Added
    constituencyId: "",
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
      ...(name === "district" ? { constituencyId: "" } : {})
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
        constituencyId: form.constituencyId,
        place: form.place,
        password: form.password,
        role: selectedRole
      };

      // 3. API Call to NestJS
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, payload);

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
        <div className="back-home" onClick={() => navigate("/")}>
          ← Back to Home
        </div>
        <div className="logo">
            Ente<span>MLA</span>
        </div>
        <h2>Create Account</h2>
       <h3>
  {selectedRole === "employee"
    ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><FaTools size={14} /> Employee Register</span>
    : <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><FaUser size={14} /> Citizen Register</span>}
</h3>
        {/* <p>Direct registration enabled (OTP skipped)</p> */}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="input-group">
            <span><FaUser size={14} color="#0c1013" /></span>
            <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
          </div>

          {/* Phone (Simple Input) */}
          <div className="input-group">
            <span><FaMobileAlt size={14} color="#0b1014" /></span>
            <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required />
          </div>

          {/* Email (Simple Input) */}
          <div className="input-group">
            <span><FaEnvelope size={14} color="#14191e" /></span>
            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
          </div>
          {/* District */}
          <div className="input-group">
            <span><FaMapMarkerAlt size={14} color="#181d21" /></span>
            <select name="district" value={form.district} onChange={handleChange} required>
              <option value="" disabled>Select District</option>

              {Object.keys(constituencyMap).map((dist) => (
                <option key={dist} value={dist}>
                  {dist.charAt(0).toUpperCase() + dist.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Constituency */}
          <div className="input-group">
            <span><FaLandmark size={14} color="#0e171e" /></span>
            <select
              name="constituencyId"
              value={form.constituencyId}
              onChange={handleChange}
              required
              disabled={!form.district}
            >
              <option value="" disabled>
                Select Constituency
              </option>
              {form.district && constituencyMap[form.district]?.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          {/* Place */}
          <div className="input-group">
            <span><FaLocationArrow size={14} color="#050d13" /></span>
            <input type="text" name="place" placeholder="Your Location" onChange={handleChange} required />
          </div>

          {/* Password */}
          <div className="input-group">
            <span><FaLock size={14} color="#091015" /></span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <span className="eye-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? (
      <FaEyeSlash size={18} color="#0369a1" />
    ) : (
      <FaEye size={18} color="#0369a1" />
    )}</span>
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <span><FaLock size={14} color="#0a1721" /></span>
            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
          </div>

          <button type="submit" className="register-btn">Create Account</button>
        </form>
          <div className="signin-link">
          <p>
            Already registered?{" "}
            <span onClick={() => navigate("/login")}>
              Sign In
            </span>
          </p>
        </div>
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