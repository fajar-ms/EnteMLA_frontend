import React, { useState } from "react";
import "./Contact.css";
import Navbar from "../components/home/Navbar";
import constituencies from "../data/constituencies";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();

  const [selected, setSelected] = useState(
    constituencies[0]
  );

  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const filteredConstituencies =
    constituencies.filter((item) =>
      item.constituency
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const departmentTitles = {
    pwd: `🛣️ ${t("pwd")}`,
    water: `💧 ${t("water")}`,
    electricity: `⚡ ${t("electricity")}`,
    health: `🏥 ${t("health")}`,
    education: `🏫 ${t("education")}`,
    admin: `🚓 ${t("admin")}`,
  };

  return (
    <div className="contact-page">
      <Navbar />

      {/* HERO */}
      <div className="contact-hero">
        <div className="hero-content">
          <h1>{t("contact_hero_title")}</h1>

          <p>{t("contact_hero_desc")}</p>
        </div>
      </div>

      {/* MAIN */}
      <div className="directory-layout">

        {/* LEFT SIDEBAR */}
        <div className="constituency-sidebar">

          <div className="sidebar-header">
            <h2>{t("constituencies")}</h2>

            <input
              type="text"
              placeholder={t("search_constituency")}
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="search-input"
            />
          </div>

          {(showAll
              ? filteredConstituencies
              : filteredConstituencies.slice(0, 8)
            ).map((item) => (
            <div
              key={item.id}
              className={`constituency-item ${
                selected.id === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() => setSelected(item)}
            >
              🏛️ {item.constituency}
            </div>
            
                    ))}

          {filteredConstituencies.length > 8 && (
            <button
              className="show-more-btn"
              onClick={() =>
                setShowAll(!showAll)
              }
            >
              {showAll
                ? t("show_less")
                : t("show_more")}
            </button>
          )}

        </div>

        {/* RIGHT CONTENT */}
        <div className="details-section">

          {/* MLA CARD */}
          <div className="mla-card">

            <div className="mla-header">
              <span>🏛️</span>

              <h2>{selected.constituency}</h2>
            </div>

            <p>
              <b>{t("mla")}:</b>{" "}
              {selected.mla.name}
            </p>

            <p>
              <b>{t("office")}:</b>{" "}
              {selected.mla.office}
            </p>

            <p>
              <b>{t("phone")}:</b>{" "}
              {selected.mla.phone}
            </p>

            <p>
              <b>{t("email")}:</b>{" "}
              {selected.mla.email}
            </p>

            <p>
              <b>{t("hours")}:</b>{" "}
              {selected.mla.hours}
            </p>
          </div>

          {/* DEPARTMENTS */}
          <h2 className="dept-title">
            {t("government_departments")}
          </h2>

          <div className="dept-grid">

            {selected.departments.map(
              (dept, index) => (
                <div
                  key={index}
                  className="dept-card"
                >
                  <h4>
                    {
                      departmentTitles[
                        dept.key
                      ]
                    }
                  </h4>

                  <p>
                    {t(
                      `${dept.key}_desc`
                    )}
                  </p>

                  <p>
                    📍 {dept.location}
                  </p>

                  <p>
                    📞 {dept.phone}
                  </p>

                  <p>
                    ✉️ {dept.email}
                  </p>

                  <p>
                    🕒 {dept.hours}
                  </p>
                </div>
              )
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;