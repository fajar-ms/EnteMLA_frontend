import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import "./i18n";
import Contact from "./pages/Contact";
import About from "./pages/About";
import QA from "./pages/QA";
import Register from "./pages/Register";
import RegisterEmp from "./pages/Register_Emp";
import Complaint from "./pages/Complaint";
import CitizenDashboard from "./pages/CitizenDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import MLADashboard from "./pages/MLADashboard";
import RoleSelect from "./pages/RoleSelect";


function App() {
  return (
    <Router>
      <div className="App">

        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="/contact" element={<Contact />} />
          <Route path="/About" element={<About />} />
          <Route path="/QA" element={<QA />} />

          <Route path="/Register" element={<Register />} />
          <Route path="/RegisterEmp" element={<RegisterEmp />} />
          <Route path="/Complaint" element={<Complaint />} />
               <Route path="/role" element={<RoleSelect />} />
                <Route path="/login" element={<Login />} />

          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/mla" element={<MLADashboard />} />

        </Routes>

      </div>
    </Router>
  );
}

export default App;