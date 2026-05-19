import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import i18n from "../../i18n";

const Navbar = () => {
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const langNames = {
    en: "English",
    ml: "Malayalam",
    hi: "Hindi"
  };

  const currentLang = localStorage.getItem("i18nextLng") || "en";

  const [selectedLang, setSelectedLang] = useState(
    langNames[currentLang]
  );
  const [authOpen, setAuthOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const loginRef = useRef();
  const registerRef = useRef();
  const langRef = useRef();
  const profileRef = useRef();

  const role = localStorage.getItem("role");
  const user = localStorage.getItem("user");
  const [profileOpen, setProfileOpen] = useState(false);
  const handleDashboard = () => {
    if (role === "citizen") {
      navigate("/citizen");
    } 
    else if (role === "mla") {
      navigate("/mla");
    } 
    else if (role === "employee") {
      navigate("/employee");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/");
    window.location.reload();
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginRef.current && !loginRef.current.contains(event.target)) setAuthOpen(false);
      if (registerRef.current && !registerRef.current.contains(event.target)) setRegisterOpen(false);
      if (langRef.current && !langRef.current.contains(event.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
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

    // Save selected language code
    localStorage.setItem("i18nextLng", langCode);

    // Change language in i18next
    i18n.changeLanguage(langCode);

    // Optional custom event
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
            <button
              className="secondary-btn"
              onClick={() => setLangOpen(!langOpen)}
            >
              {selectedLang === "English"
                ? "English"
                : selectedLang}

              <span className="arrow">▼</span>
            </button>
            {langOpen && (
              <div className="dropdown-menu">
                <div onClick={() => handleLanguageChange("en")}>English</div>
                <div onClick={() => handleLanguageChange("ml")}>Malayalam</div>
              </div>
            )}
          </div>

          {!user ? (
          <>
            {/* LOGIN DROPDOWN */}
            <div className="dropdown-wrapper" ref={loginRef}>
              <button
                className="primary-btn"
                onClick={() => setAuthOpen(!authOpen)}
              >
                Login <span className="arrow">▼</span>
              </button>

              {authOpen && (
                <div className="dropdown-menu">
                  <Link
                    to="/login"
                    onClick={() =>
                      localStorage.setItem("role", "citizen")
                    }
                  >
                    Citizen
                  </Link>

                  <Link
                    to="/login"
                    onClick={() =>
                      localStorage.setItem("role", "mla")
                    }
                  >
                    MLA
                  </Link>

                  <Link
                    to="/login"
                    onClick={() =>
                      localStorage.setItem("role", "employee")
                    }
                  >
                    Employee
                  </Link>
                </div>
              )}
            </div>

            {/* REGISTER DROPDOWN */}
            <div className="dropdown-wrapper" ref={registerRef}>
              <button
                className="primary-btn"
                onClick={() => setRegisterOpen(!registerOpen)}
              >
                Register <span className="arrow">▼</span>
              </button>

              {registerOpen && (
                <div className="dropdown-menu">
                  <Link
                    to="/register"
                    onClick={() =>
                      localStorage.setItem("role", "citizen")
                    }
                  >
                    Citizen
                  </Link>

                  <Link
                    to="/register"
                    onClick={() =>
                      localStorage.setItem("role", "employee")
                    }
                  >
                    Employee
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          
          <div className="profile-wrapper" ref={profileRef}>
            {/* Dashboard Button */}
          <button
            className="primary-btn"
            onClick={handleDashboard}
          >
            Dashboard
          </button>
        <button
          className="profile-btn"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <div className="profile-icon">
            👤
          </div>

          <span className="profile-name">
            {JSON.parse(user)?.name || "User"}
        </span>

        <span className="arrow">▼</span>
      </button>

      {profileOpen && (
        <div className="profile-dropdown">

          <div className="profile-info">
            <p>
              <strong>
                {JSON.parse(user)?.name}
              </strong>
            </p>

            <p>
              {JSON.parse(user)?.email}
            </p>

            <p className="role-text">
              {role?.toUpperCase()}
            </p>
          </div>

          <hr />

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
        )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;   