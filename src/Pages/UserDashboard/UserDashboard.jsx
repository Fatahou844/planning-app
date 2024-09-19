// src/App.js
import React from "react";
import CalendarUser from "../../Components/CalendarUser/CalendarUser";
import "../../Styles/style.css";
import "./Dashboard.css";
function UserDashboard() {
  return (
    <div className="app-container">
      <div className="main-content">
        <CalendarUser />
      </div>
    </div>
  );
}

export default UserDashboard;
