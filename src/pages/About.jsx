import React from "react";
import "./About.css";
import Navbar from "../components/home/Navbar";
import bgImage from "../assets/bg2.png";
import { useTranslation } from "react-i18next";

// React Icons
import { 
  FaLandmark, 
  FaBullseye, 
  FaMagic, 
  FaCog, 
  FaUsers, 
  FaGlobe, 
  FaRocket,
  // New Icons for Features
  FaExclamationTriangle,
  FaChartLine,
  FaTools,
  FaHandshake,
  FaBell,
  FaShieldAlt,
  // New Icons for Roles
  FaUser,
  FaUserTie,
  FaUserGraduate
} from "react-icons/fa";

const About = () => {
  const { t } = useTranslation();
<div className="video-background">
  <video
    autoPlay
    muted
    loop
    playsInline
  >
    <source
      src="https://res.cloudinary.com/dw5bky38i/video/upload/v1780556713/14723614_3840_2160_60fps_mqjgun.mp4"
      type="video/mp4"
    />
  </video>
</div>
  return (
    <div className="about-page">
      <Navbar />

      {/* ANIMATED BACKGROUND ELEMENTS */}
      <div className="glow-orb glow-orb-1"></div>
      <div className="glow-orb glow-orb-2"></div>
      <div className="glow-orb glow-orb-3"></div>

      {/* HERO SECTION */}
      <div className="about-hero">
        <div className="hero-glow"></div>
        <h1 className="hero-title">{t("about.hero_title")}</h1>
        <p className="hero-subtitle">{t("about.hero_desc")}</p>
        <div className="hero-accent-line"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="about-container">

        {/* WHAT IS ENTEMLA */}
        <div className="about-card card-1">
          <div className="card-glow"></div>
          <div className="card-content">
            <h2>
              <span className="icon-wrapper">
                <FaLandmark className="icon" />
              </span>
              {t("about.what_is_heading")}
            </h2>
            <p>{t("about.what_is_p1")}</p>
            <p>{t("about.what_is_p2")}</p>
            <p>{t("about.what_is_p3")}</p>
          </div>
        </div>

        {/* WHY WE BUILT THIS */}
        <div className="about-card card-2">
          <div className="card-glow"></div>
          <div className="card-content">
            <h2>
              <span className="icon-wrapper">
                <FaBullseye className="icon" />
              </span>
              {t("about.why_heading")}
            </h2>
            <p>{t("about.why_intro")}</p>
            <p className="section-title">{t("about.why_points_title")}</p>

            <ul>
              {t("about.why_points", { returnObjects: true })?.map(
                (point, index) => (
                  <li key={index}>{point}</li>
                )
              )}
            </ul>

            <p>{t("about.why_outro")}</p>
          </div>
        </div>

        {/* KEY FEATURES - Updated with individual icons */}
        <div className="about-card card-3">
          <div className="card-glow"></div>
          <div className="card-content">
            <h2>
              <span className="icon-wrapper">
                <FaMagic className="icon" />
              </span>
              {t("about.features_heading")}
            </h2>

            <div className="features-grid">
              <div className="feature-box">
                <div className="feature-glow"></div>
                <div className="feature-icon-wrapper">
                  <FaExclamationTriangle className="feature-icon" />
                </div>
                <h4>{t("about.feature_1_title")}</h4>
                <p>{t("about.feature_1_desc")}</p>
              </div>

              <div className="feature-box">
                <div className="feature-glow"></div>
                <div className="feature-icon-wrapper">
                  <FaChartLine className="feature-icon" />
                </div>
                <h4>{t("about.feature_2_title")}</h4>
                <p>{t("about.feature_2_desc")}</p>
              </div>

              <div className="feature-box">
                <div className="feature-glow"></div>
                <div className="feature-icon-wrapper">
                  <FaTools className="feature-icon" />
                </div>
                <h4>{t("about.feature_3_title")}</h4>
                <p>{t("about.feature_3_desc")}</p>
              </div>

              <div className="feature-box">
                <div className="feature-glow"></div>
                <div className="feature-icon-wrapper">
                  <FaHandshake className="feature-icon" />
                </div>
                <h4>{t("about.feature_4_title")}</h4>
                <p>{t("about.feature_4_desc")}</p>
              </div>

              <div className="feature-box">
                <div className="feature-glow"></div>
                <div className="feature-icon-wrapper">
                  <FaBell className="feature-icon" />
                </div>
                <h4>{t("about.feature_5_title")}</h4>
                <p>{t("about.feature_5_desc")}</p>
              </div>

              <div className="feature-box">
                <div className="feature-glow"></div>
                <div className="feature-icon-wrapper">
                  <FaShieldAlt className="feature-icon" />
                </div>
                <h4>{t("about.feature_6_title")}</h4>
                <p>{t("about.feature_6_desc")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="about-card card-4">
          <div className="card-glow"></div>
          <div className="card-content">
            <h2>
              <span className="icon-wrapper">
                <FaCog className="icon" />
              </span>
              {t("about.how_heading")}
            </h2>

            <div className="steps">
              <div className="step step-1">
                <span className="step-number">1</span>
                <div>
                  <h4>{t("about.step1_title")}</h4>
                  <p>{t("about.step1_desc")}</p>
                </div>
              </div>

              <div className="step step-2">
                <span className="step-number">2</span>
                <div>
                  <h4>{t("about.step2_title")}</h4>
                  <p>{t("about.step2_desc")}</p>
                </div>
              </div>

              <div className="step step-3">
                <span className="step-number">3</span>
                <div>
                  <h4>{t("about.step3_title")}</h4>
                  <p>{t("about.step3_desc")}</p>
                </div>
              </div>

              <div className="step step-4">
                <span className="step-number">4</span>
                <div>
                  <h4>{t("about.step4_title")}</h4>
                  <p>{t("about.step4_desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* USER ROLES - Updated with individual icons */}
        <div className="about-card card-5">
          <div className="card-glow"></div>
          <div className="card-content">
            <h2>
              <span className="icon-wrapper">
                <FaUsers className="icon" />
              </span>
              {t("about.roles_heading")}
            </h2>

            <div className="roles-grid">
              <div className="role-box">
                <div className="role-glow"></div>
                <div className="role-icon-wrapper">
                  <FaUser className="role-icon" />
                </div>
                <h4>Citizen</h4>
                <ul>
                  <li>{t("about.role_citizen")}</li>
                </ul>
              </div>

              <div className="role-box">
                <div className="role-glow"></div>
                <div className="role-icon-wrapper">
                  <FaUserTie className="role-icon" />
                </div>
                <h4>Employee</h4>
                <ul>
                  <li>{t("about.role_employee")}</li>
                </ul>
              </div>

              <div className="role-box">
                <div className="role-glow"></div>
                <div className="role-icon-wrapper">
                  <FaUserGraduate className="role-icon" />
                </div>
                <h4>MLA</h4>
                <ul>
                  <li>{t("about.role_mla")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* VISION */}
        <div className="about-card card-6">
          <div className="card-glow"></div>
          <div className="card-content">
            <h2>
              <span className="icon-wrapper">
                <FaGlobe className="icon" />
              </span>
              {t("about.vision_heading")}
            </h2>
            <p>{t("about.vision_p1")}</p>
            <p>{t("about.vision_p2")}</p>
          </div>
        </div>

        {/* FUTURE GOALS */}
        <div className="about-card card-7">
          <div className="card-glow"></div>
          <div className="card-content">
            <h2>
              <span className="icon-wrapper">
                <FaRocket className="icon" />
              </span>
              {t("about.future_heading")}
            </h2>
            <ul>
              <li>{t("about.future_1")}</li>
              <li>{t("about.future_2")}</li>
              <li>{t("about.future_3")}</li>
              <li>{t("about.future_4")}</li>
              <li>{t("about.future_5")}</li>
            </ul>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="about-image-section">
          <div className="image-glow"></div>
          <img src={bgImage} alt="EnteMLA Platform" />
        </div>

      </div>
    </div>
  );
};

export default About;
