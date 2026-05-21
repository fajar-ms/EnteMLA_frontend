import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import i18n from "../../i18n";

const Navbar = () => {
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const langNames = { en: "English", ml: "Malayalam", hi: "Hindi" };
  const currentLang = localStorage.getItem("i18nextLng") || "en";
  const [selectedLang, setSelectedLang] = useState(langNames[currentLang]);

  const loginRef = useRef();
  const registerRef = useRef();
  const langRef = useRef();
  const profileRef = useRef();

  const role = localStorage.getItem("role");
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null;

  const handleDashboard = () => {
    setDrawerOpen(false);
    if (role === "citizen") navigate("/citizen");
    else if (role === "mla") navigate("/mla");
    else if (role === "employee") navigate("/employee");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setDrawerOpen(false);
    navigate("/");
    window.location.reload();
  };

  const handleLanguageChange = (langCode) => {
    const langMap = { en: "English", ml: "Malayalam", hi: "Hindi" };
    setSelectedLang(langMap[langCode] || "English");
    localStorage.setItem("i18nextLng", langCode);
    i18n.changeLanguage(langCode);
    window.dispatchEvent(new Event("languageChanged"));
    setLangOpen(false);
    setDrawerOpen(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) setAuthOpen(false);
      if (registerRef.current && !registerRef.current.contains(e.target)) setRegisterOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/complaint", label: "Complaints" },
    { to: "/qa", label: "Q/A" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">

          {/* Logo */}
          <div className="logo" onClick={() => navigate("/")}>
            Ente<span>MLA</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="nav-links">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="nav-item">{l.label}</Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="right-section">

            {/* Language */}
            <div className="dropdown-wrapper" ref={langRef}>
              <button className="secondary-btn" onClick={() => setLangOpen(!langOpen)}>
                {selectedLang} <span className="arrow">▼</span>
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
                {/* Login Dropdown */}
                <div className="dropdown-wrapper" ref={loginRef}>
                  <button className="primary-btn" onClick={() => setAuthOpen(!authOpen)}>
                    Login <span className="arrow">▼</span>
                  </button>
                  {authOpen && (
                    <div className="dropdown-menu">
                      <Link to="/login" onClick={() => { localStorage.setItem("role","citizen"); setAuthOpen(false); }}>👤 Citizen</Link>
                      <Link to="/login" onClick={() => { localStorage.setItem("role","mla"); setAuthOpen(false); }}>🏛️ MLA</Link>
                      <Link to="/login" onClick={() => { localStorage.setItem("role","employee"); setAuthOpen(false); }}>🛠️ Employee</Link>
                    </div>
                  )}
                </div>

                {/* Register Dropdown */}
                <div className="dropdown-wrapper" ref={registerRef}>
                  <button className="primary-btn" onClick={() => setRegisterOpen(!registerOpen)}>
                    Register <span className="arrow">▼</span>
                  </button>
                  {registerOpen && (
                    <div className="dropdown-menu">
                      <Link to="/register" onClick={() => { localStorage.setItem("role","citizen"); setRegisterOpen(false); }}>👤 Citizen</Link>
                      <Link to="/register" onClick={() => { localStorage.setItem("role","employee"); setRegisterOpen(false); }}>🛠️ Employee</Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="profile-wrapper" ref={profileRef}>
                <button className="primary-btn" onClick={handleDashboard}>
                  Dashboard
                </button>
                <button className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
                  <div className="profile-icon">👤</div>
                  <span className="profile-name">{parsedUser?.name || "User"}</span>
                  <span className="arrow">▼</span>
                </button>
                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-info">
                      <p><strong>{parsedUser?.name}</strong></p>
                      <p>{parsedUser?.email}</p>
                      <p className="role-text">{role?.toUpperCase()}</p>
                    </div>
                    <hr />
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`hamburger${drawerOpen ? " open" : ""}`}
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>

        </div>
      </nav>

      {/* ── Mobile Drawer ─────────────────────────────────── */}
      <div className={`mobile-drawer${drawerOpen ? " open" : ""}`}>
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
        <div className="drawer-panel">
          <div className="drawer-content">

            {/* Logged-in profile info */}
            {user && parsedUser && (
              <div className="drawer-profile-box">
                <div className="drawer-avatar">👤</div>
                <div className="drawer-profile-text">
                  <strong>{parsedUser.name}</strong>
                  <span>{parsedUser.email}</span>
                  <span className="drawer-role-chip">{role?.toUpperCase()}</span>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <div className="drawer-label">Navigation</div>
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="drawer-link"
                onClick={() => setDrawerOpen(false)}
              >
                {l.label}
              </Link>
            ))}

            <div className="drawer-divider" />

            {/* Language */}
            <div className="drawer-label">Language</div>
            <div className="drawer-lang-group">
              <button
                className={`drawer-lang-btn${selectedLang === "English" ? " active" : ""}`}
                onClick={() => handleLanguageChange("en")}
              >English</button>
              <button
                className={`drawer-lang-btn${selectedLang === "Malayalam" ? " active" : ""}`}
                onClick={() => handleLanguageChange("ml")}
              >Malayalam</button>
            </div>

            <div className="drawer-divider" />

            {/* Auth actions */}
            {!user ? (
              <>
                <div className="drawer-label">Login As</div>
                {[
                  { role: "citizen", label: "👤 Citizen" },
                  { role: "mla",     label: "🏛️ MLA" },
                  { role: "employee",label: "🛠️ Employee" },
                ].map((item) => (
                  <Link
                    key={item.role}
                    to="/login"
                    className="drawer-btn"
                    onClick={() => { localStorage.setItem("role", item.role); setDrawerOpen(false); }}
                  >
                    {item.label} <span style={{ opacity: 0.4, fontSize: "0.75rem" }}>→</span>
                  </Link>
                ))}

                <div className="drawer-divider" />
                <div className="drawer-label">Register As</div>
                {[
                  { role: "citizen",  label: "👤 Citizen" },
                  { role: "employee", label: "🛠️ Employee" },
                ].map((item) => (
                  <Link
                    key={item.role}
                    to="/register"
                    className="drawer-btn solid"
                    onClick={() => { localStorage.setItem("role", item.role); setDrawerOpen(false); }}
                  >
                    {item.label} <span style={{ opacity: 0.5, fontSize: "0.75rem" }}>→</span>
                  </Link>
                ))}
              </>
            ) : (
              <>
                <button className="drawer-btn solid" onClick={handleDashboard}>
                  Dashboard <span style={{ opacity: 0.6, fontSize: "0.75rem" }}>→</span>
                </button>
                <button className="drawer-btn danger" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;