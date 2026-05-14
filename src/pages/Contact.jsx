import React, { useState } from "react";

import "./Contact.css";

import Navbar from "../components/home/Navbar";

import constituencies from "../data/constituencies";

const Contact = () => {

  const [selected, setSelected] = useState(
    constituencies[0]
  );
  const [search, setSearch] = useState("");

  const filteredConstituencies =
  constituencies.filter((item) =>
    item.constituency
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (

    <div className="contact-page">

      <Navbar />

      {/* HERO */}
      <div className="contact-hero">

        <div className="hero-content">

          <h1>
            Citizen–Government Communication Portal
          </h1>

          <p>
            Access MLA offices and important
            government department contacts
            across Kerala constituencies.
          </p>

        </div>

      </div>

      {/* MAIN */}
      <div className="directory-layout">

        {/* LEFT SIDEBAR */}
        <div className="constituency-sidebar">
          <div class="sidebar-header">
          <h2>Constituencies</h2>
          <input
            type="text"
            placeholder="Search constituency..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="search-input"
          />
          </div>
          {filteredConstituencies.map((item) => (

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

        </div>

        {/* RIGHT CONTENT */}
        <div className="details-section">

          {/* MLA CARD */}
          <div className="mla-card">

            <div className="mla-header">

              <span>🏛️</span>

              <h2>
                {selected.constituency}
              </h2>

            </div>

            <p>
              <b>MLA:</b>
              {" "}
              {selected.mla.name}
            </p>

            <p>
              <b>Office:</b>
              {" "}
              {selected.mla.office}
            </p>

            <p>
              <b>Phone:</b>
              {" "}
              {selected.mla.phone}
            </p>

            <p>
              <b>Email:</b>
              {" "}
              {selected.mla.email}
            </p>

            <p>
              <b>Hours:</b>
              {" "}
              {selected.mla.hours}
            </p>

          </div>

          {/* DEPARTMENTS */}
          <h2 className="dept-title">
            Government Departments
          </h2>

          <div className="dept-grid">

            {selected.departments.map(
              (dept, index) => (

              <div
                key={index}
                className="dept-card"
              >

                <h4>{dept.title}</h4>

                <p>{dept.description}</p>

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

            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Contact;