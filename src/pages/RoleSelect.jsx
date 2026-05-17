import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const navigate = useNavigate();

  const selectRole = (role) => {
    localStorage.setItem("role", role);
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Select Your Role</h2>

      <button onClick={() => selectRole("citizen")}>
        Citizen
      </button>

      <br /><br />

      <button onClick={() => selectRole("mla")}>
        MLA
      </button>

      <br /><br />

      <button onClick={() => selectRole("employee")}>
        Employee
      </button>
    </div>
  );
}