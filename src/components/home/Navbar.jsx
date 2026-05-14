import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("home");
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("Translate");
  const [authOpen, setAuthOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const loginRef = useRef();
  const registerRef = useRef();
  const langRef = useRef();

  // Scroll Spy Logic: Detects which section is on screen
  useEffect(() => {
    if (location.pathname !== "/") return;

    const handleScroll = () => {
      const sections = ["home", "about", "complaints", "stats", "qa", "contact"];
      const scrollPosition = window.scrollY + 100; // Offset for navbar height

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };  

  const handleLanguageChange = (lang) => {
  i18n.changeLanguage(lang);   // 🔥 THIS IS REQUIRED

  let label =
    lang === "en"
      ? "English"
      : "Malayalam"
      ;

  setSelectedLang(label);
  setLangOpen(false);
};
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <div className="logo">{t("app_name_part1")}<span>{t("app_name_part2")}</span></div>

        {/* CENTER NAV LINKS */}
        <div className="nav-links">
          <Link to="/" className="nav-item">{t("home")}</Link>
          <Link to="/about" className="nav-item">{t("about")}</Link>
          <Link to="/complaint" className="nav-item">{t("complaints")}</Link>
          <Link to="/qa" className="nav-item">{t("qa")}</Link>
          <Link to="/contact" className="nav-item">{t("contact")}</Link>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="right-section">
          {/* LANGUAGE SELECTOR */}
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

          {/* LOGIN */}
          <div className="dropdown-wrapper" ref={loginRef}>
            <button className="primary-btn" onClick={() => setAuthOpen(!authOpen)}>
              {t("login")} <span className="arrow">▼</span>
            </button>
            {authOpen && (
              <div className="dropdown-menu">
                <Link to="/login" onClick={() => localStorage.setItem("role", "citizen")}>Citizen User</Link>
                <Link to="/login" onClick={() => localStorage.setItem("role", "mla")}>MLA Portal</Link>
                <Link to="/login" onClick={() => localStorage.setItem("role", "employee")}>Employee Access</Link>
              </div>
            )}
          </div>

          {/* REGISTER */}
          <div className="dropdown-wrapper" ref={registerRef}>
            <button className="outline-btn" onClick={() => setRegisterOpen(!registerOpen)}>
              {t("register")}
            </button>
            {registerOpen && (
              <div className="dropdown-menu">
                <Link to="/Register">Citizen Sign Up</Link>
                <Link to="/RegisterEmp">Employee Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};



export default Navbar;