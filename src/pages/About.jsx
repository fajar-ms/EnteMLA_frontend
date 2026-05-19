import React from "react";
import "./About.css";
import Navbar from "../components/home/Navbar";
import bgImage from "../assets/bg2.png";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      <Navbar />

      {/* HERO SECTION */}
      <div className="about-hero">
        <h1>{t("about.hero_title")}</h1>

        <p>{t("about.hero_desc")}</p>
      </div>

      {/* MAIN CONTENT */}
      <div className="about-container">

        {/* WHAT IS ENTEMLA */}
        <div className="about-card">
          <h2>🏛️ {t("about.what_is_heading")}</h2>

          <p>{t("about.what_is_p1")}</p>

          <p>{t("about.what_is_p2")}</p>

          <p>{t("about.what_is_p3")}</p>
        </div>

        {/* WHY WE BUILT THIS */}
        <div className="about-card">
          <h2>🎯 {t("about.why_heading")}</h2>

          <p>{t("about.why_intro")}</p>

          <p>{t("about.why_points_title")}</p>

          <ul>
            {t("about.why_points", { returnObjects: true }).map(
              (point, index) => (
                <li key={index}>{point}</li>
              )
            )}
          </ul>

          <p>{t("about.why_outro")}</p>
        </div>

        {/* KEY FEATURES */}
        <div className="about-card">
          <h2>✨ {t("about.features_heading")}</h2>

          <div className="features-grid">

            <div className="feature-box">
              <h4>{t("about.feature_1_title")}</h4>

              <p>{t("about.feature_1_desc")}</p>
            </div>

            <div className="feature-box">
              <h4>{t("about.feature_2_title")}</h4>

              <p>{t("about.feature_2_desc")}</p>
            </div>

            <div className="feature-box">
              <h4>{t("about.feature_3_title")}</h4>

              <p>{t("about.feature_3_desc")}</p>
            </div>

            <div className="feature-box">
              <h4>{t("about.feature_4_title")}</h4>

              <p>{t("about.feature_4_desc")}</p>
            </div>

            <div className="feature-box">
              <h4>{t("about.feature_5_title")}</h4>

              <p>{t("about.feature_5_desc")}</p>
            </div>

            <div className="feature-box">
              <h4>{t("about.feature_6_title")}</h4>

              <p>{t("about.feature_6_desc")}</p>
            </div>

          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="about-card">
          <h2>⚙️ {t("about.how_heading")}</h2>

          <div className="steps">

            <div className="step">
              <span>1</span>

              <div>
                <h4>{t("about.step1_title")}</h4>

                <p>{t("about.step1_desc")}</p>
              </div>
            </div>

            <div className="step">
              <span>2</span>

              <div>
                <h4>{t("about.step2_title")}</h4>

                <p>{t("about.step2_desc")}</p>
              </div>
            </div>

            <div className="step">
              <span>3</span>

              <div>
                <h4>{t("about.step3_title")}</h4>

                <p>{t("about.step3_desc")}</p>
              </div>
            </div>

            <div className="step">
              <span>4</span>

              <div>
                <h4>{t("about.step4_title")}</h4>

                <p>{t("about.step4_desc")}</p>
              </div>
            </div>

          </div>
        </div>

        {/* USER ROLES */}
        <div className="about-card">
          <h2>👥 {t("about.roles_heading")}</h2>

          <div className="roles-grid">

            <div className="role-box">
              <h4>🧑 Citizen</h4>

              <ul>
                <li>{t("about.role_citizen")}</li>
              </ul>
            </div>

            <div className="role-box">
              <h4>🏢 Employee</h4>

              <ul>
                <li>{t("about.role_employee")}</li>
              </ul>
            </div>

            <div className="role-box">
              <h4>🏛️ MLA</h4>

              <ul>
                <li>{t("about.role_mla")}</li>
              </ul>
            </div>

          </div>
        </div>

        {/* VISION */}
        <div className="about-card">
          <h2>🌍 {t("about.vision_heading")}</h2>

          <p>{t("about.vision_p1")}</p>

          <p>{t("about.vision_p2")}</p>
        </div>

        {/* FUTURE GOALS */}
        <div className="about-card">
          <h2>🚀 {t("about.future_heading")}</h2>

          <ul>
            <li>{t("about.future_1")}</li>
            <li>{t("about.future_2")}</li>
            <li>{t("about.future_3")}</li>
            <li>{t("about.future_4")}</li>
            <li>{t("about.future_5")}</li>
          </ul>
        </div>

        {/* IMAGE SECTION */}
        <div className="about-image-section">
          <img src={bgImage} alt="EnteMLA Platform" />
        </div>

      </div>
    </div>
  );
};

export default About;