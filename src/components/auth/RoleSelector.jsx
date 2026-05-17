// src/components/auth/RoleSelector.jsx
import React from "react";
import "./RoleSelector.css";

const roles = [
  { name: "Citizen" },
  { name: "MLA" },
  { name: "Employee" },
];

const RoleSelector = ({ selectedRole, setSelectedRole }) => {
  return (
    <div className="role-container">
      {roles.map((role) => (
        <div
          key={role.name}
          className={`role-card ${
            selectedRole === role.name ? "active" : ""
          }`}
          onClick={() => setSelectedRole(role.name)}
        >
          <div className="role-icon">{role.icon}</div>
          <h3>{role.name}</h3>
        </div>
      ))}
    </div>
  );
};

export default RoleSelector;