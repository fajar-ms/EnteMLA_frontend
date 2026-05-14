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
            {/* <div className="action-meta">
              <div className="meta-item">
                <span className="meta-title">Representative</span>
                <span className="meta-value">MLA Name, M.Tech</span>
                <button className="inline-link" onClick={() => navigate("/about")}>
                  Full Bio →
                </button>
              </div>
            </div> */}

            <div className="stats-grid">
              <div className="stat-block">
                <span className="stat-number">320</span>
                <span className="stat-caption">{t("active_projects")}</span>
              </div>
              <div className="stat-block">
                <span className="stat-number">12.5K</span>
                <span className="stat-caption">{t("citizens_joined")}</span>
              </div>
              <div className="stat-block">
                <span className="stat-number">98%</span>
                <span className="stat-caption">{t("issue_resolution")}</span>
              </div>
            </div>
          </section>

          {/* RIGHT: UPDATES & OFFICE INFO */}
          <aside className="side-brief">
            <div className="brief-section">
              <h4>{t("office_title")}</h4>
              <p>{t("office_desc")}</p>
            </div>

            <div className="brief-section">
              <h4>{t("live_progress")}</h4>
              <ul className="bullet-list">
                <li>{t("progress_1")}</li>
                <li>{t("progress_2")}</li>
              </ul>
            </div>

            <div className="brief-section">
              <h4>{t("recent_resolutions")}</h4>
              <ul className="resolution-list">
                <li><span className="dot pnd"></span> {t("res_1")}</li>
                <li><span className="dot res"></span>{t("res_2")}</li>
              </ul>
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
};
export default Hero;
