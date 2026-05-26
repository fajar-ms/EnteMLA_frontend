import React, { useState } from "react";
import "./Contact.css";
import Navbar from "../components/home/Navbar";
import constituencies from "../data/constituencies";
import departments from "../data/departments";
import {
  FaLandmark,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaBuilding
} from "react-icons/fa";




const Contact = () => {
  

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
 console.log("selected district:", selected.district);
console.log("departments:", departments);
console.log(
  "matched:",
  departments[selected.district]
);
  

  return (
    <div className="contact-page">
      <Navbar />

      {/* HERO */}
      <div className="contact-hero">
        <div className="hero-content">
          <h1> Citizen–Government Communication Portal</h1>

          <p> Access MLA offices and important
            government department contacts
            across Kerala constituencies.</p>
        </div>
      </div>

      {/* MAIN */}
      <div className="directory-layout">

        {/* LEFT SIDEBAR */}
        <div className="constituency-sidebar">

          <div className="sidebar-header">
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
              <FaLandmark className="icon" /> {item.constituency}
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
                ?" Show less"
                : "Show more"}
            </button>
          )}

        </div>

        {/* RIGHT CONTENT */}
        <div className="details-section">

          {/* MLA CARD */}
          <div className="mla-card">

            <div className="mla-header">
              <FaLandmark className="mla-icon" />

              <h2>{selected.constituency}</h2>
            </div>

            <p>
              <b>MLA:</b>{" "}
              {selected.mla.name}
            </p>

            <p>
              <b>Office:</b>{" "}
              {selected.mla.location}
            </p>

            <p>
              <b>Phone:</b>{" "}
              {selected.mla.phone}
            </p>

            <p>
              <b>Email:</b>{" "}
              {selected.mla.email}
            </p>

           
          </div>

          {/* DEPARTMENTS */}
          <h2 className="dept-title">
  <FaBuilding className="title-icon" />
  Government Departments
</h2>

          <div className="dept-grid">

            {(departments[selected.district] || []).map(
              (dept, index) => (
                <div
                  key={index}
                  className="dept-card"
                >
                  <h4>{dept.title}</h4>

                   <p>{dept.description}</p>

                 <p>
  <FaMapMarkerAlt className="dept-icon" />
  {dept.location}
</p>

                 <p>
  <FaPhoneAlt className="dept-icon" />
  {dept.phone}
</p>
                 <p>
  <FaEnvelope className="dept-icon" />
  {dept.email}
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