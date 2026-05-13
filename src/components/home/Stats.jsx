import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import "./Stats.css";

import { Link } from "react-router-dom";

const Stats = () => {

  const [stats, setStats] =
    useState({

      totalComplaints: 0,

      resolvedComplaints: 0,

      inProgressComplaints: 0,

      avgResponse: 0,
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchStats();

  }, []);

  const fetchStats = async () => {

    try {

      const response =
        await axios.get(
          "http://localhost:3001/complaints/stats"
        );

      setStats(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  if (loading) {

    return (
      <h2>
        Loading statistics...
      </h2>
    );
  }

  return (

  <section className="stats-section">

    <div className="stats-wrapper">

      {/* TOP LABEL */}
      <div className="stats-top">

        <span className="stats-label">
          Civic Analytics
        </span>

        <div className="stats-line"></div>

        <span className="stats-sub">
          Public Transparency Dashboard
        </span>

      </div>

      {/* HEADING */}
      <h1 className="stats-heading">

        Real-Time
        <span>
          {" "}Impact Metrics
        </span>

      </h1>

      <p className="stats-description">

        Track complaint resolutions,
        response efficiency, and
        ongoing civic actions across
        the platform through a
        transparent public dashboard.

      </p>

      {/* TILE LAYOUT */}
      <div className="stats-layout">

        {/* LEFT */}
        <div className="stats-grid">

          {/* TOTAL */}
          <div className="stat-card total">

            <h2>
              {stats.totalComplaints}
            </h2>

            <p>
              Total Complaints
            </p>

          </div>

          {/* RESOLVED */}
          <div className="stat-card resolve">

            <h2>
              {stats.resolvedComplaints}
            </h2>

            <p>
              Resolved Issues
            </p>

          </div>

          {/* PROGRESS */}
          <div className="stat-card progress">

            <h2>
              {stats.inProgressComplaints}
            </h2>

            <p>
              In Progress
            </p>

          </div>

          {/* RESPONSE */}
          <div className="stat-card response">

            <h2>
              {stats.avgResponse}
            </h2>

            <p>
              Avg Response Days
            </p>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="stats-side">

          {/* OVERVIEW */}
          <div className="side-block">

            <h4>
              Platform Overview
            </h4>

            <p>

              Citizens can publicly
              raise civic complaints,
              track resolution progress,
              and engage with authorities
              through transparent issue
              reporting.

            </p>

          </div>

          {/* LIVE STATUS */}
          <div className="side-block">

            <h4>
              Live Complaint Status
            </h4>

            <ul className="info-list">

              <li>

                <span className="dot blue"></span>

                Public complaints are
                monitored in real time

              </li>

              <li>

                <span className="dot green"></span>

                Resolved issues are
                verified and archived

              </li>

              <li>

                <span className="dot orange"></span>

                Escalated complaints
                receive priority tracking

              </li>

            </ul>

          </div>

          {/* BUTTON */}
          <button className="complaint-btn">

            <Link to="/login">

              File Complaint

            </Link>

          </button>

        </div>

      </div>

    </div>

  </section>
);
};

export default Stats;