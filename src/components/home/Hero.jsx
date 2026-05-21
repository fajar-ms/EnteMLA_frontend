import React from "react";
import "./Hero.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="hero">
      <div className="hero-grid">
        
        {/* TOP SECTION: HEADING & SUBTITLE */}
        <header className="hero-header">
          <div className="label-group">
            <span className="gov-label">{t("gov_label")}</span>
            <span className="division-line"></span>
            <span className="constituency-label">{t("constituency")}</span>
          </div>
          <h1>{t("hero_title_main")} <span className="text-muted">{t("hero_title_sub")}</span></h1>
          <p className="description">
            {t("hero_description")}
          </p>
        </header>

        <div className="hero-content-split">
  {/* LEFT: PRIMARY ACTIONS & STATS */}
  <section className="main-actions">
    
    <div className="quote-container">
      <div className="quote-inner">
        <span className="quote-mark">“</span>
        <p className="quote-text">
          Be the change that you wish to see in the world.
        </p>
        <div className="quote-footer">
          <span className="author">— Mahatma Gandhi</span>
        </div>
      </div>
    </div>

  </section>

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
