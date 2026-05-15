import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem("userLanguage") || "English");
  const [authOpen, setAuthOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const loginRef = useRef();
  const registerRef = useRef();
  const langRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginRef.current && !loginRef.current.contains(event.target)) setAuthOpen(false);
      if (registerRef.current && !registerRef.current.contains(event.target)) setRegisterOpen(false);
      if (langRef.current && !langRef.current.contains(event.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    const langMap = {
      en: "English",
      ml: "Malayalam",
      hi: "Hindi"
    };
    const label = langMap[langCode] || "English";
    setSelectedLang(label);

    // Save to localStorage
    localStorage.setItem("userLanguage", label);

    // ✅ FIX: Dispatch custom event so QA.jsx (same tab) picks up the change
    window.dispatchEvent(new Event("languageChanged"));

    setLangOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">Ente<span>MLA</span></div>

        <div className="nav-links">
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/about" className="nav-item">About</Link>
          <Link to="/complaint" className="nav-item">Complaints</Link>
          <Link to="/qa" className="nav-item">Q/A</Link>
          <Link to="/contact" className="nav-item">Contact</Link>
        </div>

        <div className="right-section">
          {/* LANGUAGE SELECTOR */}
          <div className="dropdown-wrapper" ref={langRef}>
            <button className="secondary-btn" onClick={() => setLangOpen(!langOpen)}>
              🌐 {selectedLang} <span className="arrow">▼</span>
            </button>
            {langOpen && (
              <div className="dropdown-menu">
                <div onClick={() => handleLanguageChange("en")}>English</div>
                <div onClick={() => handleLanguageChange("ml")}>Malayalam</div>
              </div>
            )}
          </div>

          <div className="dropdown-wrapper" ref={loginRef}>
            <button className="primary-btn" onClick={() => setAuthOpen(!authOpen)}>
              Login <span className="arrow">▼</span>
            </button>
            {authOpen && (
              <div className="dropdown-menu">
                <Link to="/login" onClick={() => localStorage.setItem("role", "citizen")}>Citizen User</Link>
                <Link to="/login" onClick={() => localStorage.setItem("role", "mla")}>MLA Portal</Link>
                <Link to="/login" onClick={() => localStorage.setItem("role", "employee")}>Employee Access</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;   