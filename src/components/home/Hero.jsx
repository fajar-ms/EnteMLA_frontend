import React from "react";
import "./Hero.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MyMlaCard from "./MyMlaCard";
import HomeBanner from "./HomeBanner";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const role = localStorage.getItem("role");

  const showMlaCard =
    role === "citizen" || role === "employee";
  return (
    <div className="hero">

  {/* Video Banner */}
  <div className="hero-banner">
    <video
      className="hero-video"
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

    <div className="hero-overlay"></div>

    <div className="hero-header">
      <div className="label-group">
        <span className="gov-label">{t("gov_label")}</span>
        <span className="division-line"></span>
        <span className="constituency-label">{t("constituency")}</span>
      </div>

      <h1 className="hero-title">
        {t("hero_title_main")} {t("hero_title_sub")}
      </h1>

      <p className="description">
        {t("hero_description")}
      </p>
    </div>
  </div>
        

        <div className="hero-layout">

  {/* Top Card */}
 <div className="top-card">

  {/* Always visible to everyone */}
  <div className="guest-card">
   <h3>{t("welcome_entemla")}</h3>
  <p>{t("welcome_entemla_desc")}</p>
  </div>

  {/* Only for citizen/employee - shows their specific MLA */}
  {showMlaCard && <MyMlaCard />}

</div>

  {/* Bottom Split Section */}
  <div className="hero-content-split">

    {/* Left 50% */}
    <div className="banner-side">
      <HomeBanner />
    </div>


          <aside className="side-brief">

            {/* 1. Live Complaint Activity */}
            <div className="brief-section">
              <h4>{t("live_complaint_activity")}</h4>
              <ul className="bullet-list">
                <li>{t("activity_1")}</li>
                <li>{t("activity_2")}</li>
                <li>{t("activity_3")}</li>
              </ul>
            </div>

            {/* 2. Transparency & Response */}
            <div className="brief-section">
              <h4>{t("transparency_response")}</h4>
              <ul className="bullet-list">
                <li>{t("response_1")}</li>
                <li>{t("response_2")}</li>
              </ul>
            </div>

            {/* 3. Smart Governance Features */}
            <div className="brief-section">
              <h4>{t("smart_governance")}</h4>
              <ul className="bullet-list">
                <li>{t("smart_1")}</li>
                <li>{t("smart_2")}</li>
                <li>{t("smart_3")}</li>
              </ul>
            </div>

          </aside>

        </div>
      </div>
    </div>
    
  );
};
export default Hero;
