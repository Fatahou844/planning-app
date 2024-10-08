// src/App.js
import React from "react";
import CalendarMin from "../../Components/Calendar/CalandarMin";
import "../../Styles/style.css";
import "./Dashboard.css";
function Dashboard() {
  return (
    <div className="app-container">
      <div className="main-content">
        <CalendarMin />
      </div>
    </div>
  );
}

export default Dashboard;
