import React, { useState } from "react";
import RoleSelector from "../components/auth/RoleSelector";

const AuthPage = ({setPage}) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [mode, setMode] = useState("login");
 

  const handleContinue = () => {
    if (!selectedRole) return;

    if (selectedRole === "Citizen") {
      setPage("citizen");
    } 
    else if (selectedRole === "MLA") {
      setPage("mla");
    } 
    else if (selectedRole === "Employee") {
      setPage("employee");
    }
  };

  return (
    <div className="auth-layout">
      {/* LEFT SIDE */}
        <div className="auth-right">
         <h2>Select role</h2>
      
        <RoleSelector
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
        />

        {selectedRole && (
          <div className="auth-box">
            <div className="toggle-buttons">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
              >
                Login
              </button>

              <button
                className={mode === "register" ? "active" : ""}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            <h4>
              {mode === "login"
                ? `Login as ${selectedRole}`
                : `Register as ${selectedRole}`}
            </h4>
            <button className="continue-btn" onClick={handleContinue}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;