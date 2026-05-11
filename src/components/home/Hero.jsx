import React from "react";
import "./Hero.css";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="hero">
      <div className="hero-grid">
        
        {/* TOP SECTION: HEADING & SUBTITLE */}
        <header className="hero-header">
          <div className="label-group">
            <span className="gov-label">Digital Governance Initiative</span>
            <span className="division-line"></span>
            <span className="constituency-label">Greenfield</span>
          </div>
          <h1>Your Voice. <span className="text-muted">Real Change.</span></h1>
          <p className="description">
            A transparent platform for infrastructure reporting, community project 
            oversight, and direct citizen-representative engagement.
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
                <span className="stat-caption">Active Projects</span>
              </div>
              <div className="stat-block">
                <span className="stat-number">12.5K</span>
                <span className="stat-caption">Citizens Joined</span>
              </div>
              <div className="stat-block">
                <span className="stat-number">98%</span>
                <span className="stat-caption">Issue Resolution</span>
              </div>
            </div>
          </section>

          {/* RIGHT: UPDATES & OFFICE INFO */}
          <aside className="side-brief">
            <div className="brief-section">
              <h4>Constituency Office</h4>
              <p>Greenfield Secretariat, Block A. <br />Available 09:00 — 17:00</p>
            </div>

            <div className="brief-section">
              <h4>Live Progress</h4>
              <ul className="bullet-list">
                <li>Market Street roadwork finalized</li>
                <li>East-Side Green Park inaugurated</li>
              </ul>
            </div>

            <div className="brief-section">
              <h4>Recent Resolutions</h4>
              <ul className="resolution-list">
                <li><span className="dot pnd"></span> Street Light repair</li>
                <li><span className="dot res"></span> Water Supply restoration</li>
              </ul>
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
};

export default Hero;