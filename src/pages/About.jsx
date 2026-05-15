import React from "react";
import "./About.css";
import Navbar from "../components/home/Navbar";
import bgImage from "../assets/bg2.png";

const About = () => {
  return (
    <div className="about-page">

      <Navbar />

      {/* HERO SECTION */}
      <div className="about-hero">
        <h1>About EnteMLA</h1>

        <p>
          Empowering citizens through transparent governance,
          digital grievance tracking, and direct communication
          with elected representatives.
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="about-container">

        {/* WHAT IS ENTEMLA */}
        <div className="about-card">
          <h2>🏛️ What is EnteMLA?</h2>

          <p>
            EnteMLA is a modern civic grievance management platform
            designed to bridge the gap between citizens and their
            elected representatives.
          </p>

          <p>
            The platform allows citizens to register complaints,
            track issue progress in real time, receive official
            updates, and participate in transparent public discussions.
          </p>

          <p>
            By digitizing complaint handling, EnteMLA improves
            accountability, communication, and efficiency in governance.
          </p>
        </div>

        {/* WHY WE BUILT THIS */}
        <div className="about-card">
          <h2>🎯 Why We Built This Platform</h2>

          <p>
            Traditional complaint systems are often slow,
            unclear, and difficult to monitor.
          </p>

          <p>
            Citizens frequently face challenges such as:
          </p>

          <ul>
            <li>Long delays in complaint resolution</li>
            <li>Lack of status transparency</li>
            <li>No direct communication with authorities</li>
            <li>Difficulty tracking public grievances</li>
            <li>Limited accountability in workflows</li>
          </ul>

          <p>
            EnteMLA was created to solve these issues using
            a centralized digital complaint management system.
          </p>
        </div>

        {/* KEY FEATURES */}
        <div className="about-card">
          <h2>✨ Key Features</h2>

          <div className="features-grid">

            <div className="feature-box">
              <h4>📌 Complaint Registration</h4>
              <p>
                Citizens can submit complaints with categories,
                urgency levels, and detailed descriptions.
              </p>
            </div>

            <div className="feature-box">
              <h4>📊 Real-Time Tracking</h4>
              <p>
                Track complaint progress, updates,
                and status changes instantly.
              </p>
            </div>

            <div className="feature-box">
              <h4>💬 MLA & Employee Replies</h4>
              <p>
                Receive direct responses and updates
                from officials and departments.
              </p>
            </div>

            <div className="feature-box">
              <h4>🔒 Secure Role-Based Access</h4>
              <p>
                Separate access for citizens,
                employees, and MLAs.
              </p>
            </div>

            <div className="feature-box">
              <h4>⚡ Priority Handling</h4>
              <p>
                Urgent complaints are highlighted
                for faster resolution.
              </p>
            </div>

            <div className="feature-box">
              <h4>🌐 Public Civic Discussion</h4>
              <p>
                Citizens can engage in transparent
                discussions regarding local issues.
              </p>
            </div>

          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="about-card">
          <h2>⚙️ How EnteMLA Works</h2>

          <div className="steps">

            <div className="step">
              <span>1</span>

              <div>
                <h4>Register & Login</h4>

                <p>
                  Citizens create accounts and securely
                  access the platform.
                </p>
              </div>
            </div>

            <div className="step">
              <span>2</span>

              <div>
                <h4>Submit Complaint</h4>

                <p>
                  Users submit complaints with category,
                  urgency, and issue details.
                </p>
              </div>
            </div>

            <div className="step">
              <span>3</span>

              <div>
                <h4>Department Review</h4>

                <p>
                  Complaints are reviewed and assigned
                  to the responsible department or authority.
                </p>
              </div>
            </div>

            <div className="step">
              <span>4</span>

              <div>
                <h4>Track & Resolve</h4>

                <p>
                  Citizens receive updates until
                  the complaint is fully resolved.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* USER ROLES */}
        <div className="about-card">
          <h2>👥 User Roles in the System</h2>

          <div className="roles-grid">

            <div className="role-box">
              <h4>🧑 Citizen</h4>

              <ul>
                <li>Submit complaints</li>
                <li>Track complaint status</li>
                <li>View updates & replies</li>
                <li>Participate in discussions</li>
              </ul>
            </div>

            <div className="role-box">
              <h4>🏢 Employee</h4>

              <ul>
                <li>Manage assigned complaints</li>
                <li>Provide official updates</li>
                <li>Resolve public issues</li>
                <li>Maintain workflow efficiency</li>
              </ul>
            </div>

            <div className="role-box">
              <h4>🏛️ MLA</h4>

              <ul>
                <li>Monitor constituency issues</li>
                <li>Oversee complaint resolution</li>
                <li>Communicate with citizens</li>
                <li>Improve governance transparency</li>
              </ul>
            </div>

          </div>
        </div>


        {/* VISION */}
        <div className="about-card">

          <h2>🌍 Our Vision</h2>

          <p>
            Our vision is to create a transparent,
            accessible, and technology-driven governance system
            where every citizen's voice is heard and addressed efficiently.
          </p>

          <p>
            We aim to strengthen trust between citizens
            and public representatives through accountability,
            communication, and digital innovation.
          </p>

        </div>

        {/* FUTURE GOALS */}
        <div className="about-card">

          <h2>🚀 Future Enhancements</h2>

          <ul>
            <li>AI-powered complaint categorization</li>
            <li>Multilingual platform support</li>
            <li>Mobile application integration</li>
            <li>Analytics dashboard for governance insights</li>
            <li>Smart notification & escalation systems</li>
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