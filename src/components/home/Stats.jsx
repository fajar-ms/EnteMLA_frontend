// Stats.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Stats.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Stats = () => {
  const { t } = useTranslation();

  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    inProgressComplaints: 0,
    avgResponse: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/complaints/stats`
      );
      setStats(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>{t("loading")}</h2>;
  }

  return (
    <section className="stats-section">
      <div className="stats-wrapper">
        {/* TOP LABEL */}
        <div className="stats-top">
          <span className="stats-label">
            {t("civicAnalytics")}
          </span>

          <div className="stats-line"></div>

          <span className="stats-sub">
            {t("publicTransparencyDashboard")}
          </span>
        </div>

        {/* HEADING */}
        <h1 className="stats-heading">
          {t("realTime")}{" "}
          <span>{t("impactMetrics")}</span>
        </h1>

        <p className="stats-description">
          {t("description")}
        </p>

        {/* TILE LAYOUT */}
        <div className="stats-layout">
          {/* LEFT */}
          <div className="stats-grid">
            <div className="stat-card total">
              <h2>{stats.totalComplaints}</h2>
              <p>{t("totalComplaints")}</p>
            </div>

            <div className="stat-card resolve">
              <h2>{stats.resolvedComplaints}</h2>
              <p>{t("resolvedIssues")}</p>
            </div>

            <div className="stat-card progress">
              <h2>{stats.inProgressComplaints}</h2>
              <p>{t("inProgress")}</p>
            </div>

            <div className="stat-card response">
              <h2>{stats.avgResponse}</h2>
              <p>{t("avgResponseDays")}</p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="stats-side">
            {/* OVERVIEW */}
            <div className="side-block">
              <h4>{t("platformOverview")}</h4>
              <p>{t("platformOverviewText")}</p>
            </div>

            {/* LIVE STATUS */}
            <div className="side-block">
              <h4>{t("liveComplaintStatus")}</h4>

              <ul className="info-list">
                <li>
                  <span className="dot blue"></span>
                  {t("liveStatus1")}
                </li>

                <li>
                  <span className="dot green"></span>
                  {t("liveStatus2")}
                </li>

                <li>
                  <span className="dot orange"></span>
                  {t("liveStatus3")}
                </li>
              </ul>
            </div>

            {/* BUTTON */}
            <button className="complaint-btn">
              <Link to="/login">
                {t("fileComplaint")}
              </Link>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;