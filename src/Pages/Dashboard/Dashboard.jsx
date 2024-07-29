// src/App.js
import React from "react";
import Calendar from "../../Components/Calendar/Calendar";
import "../../Styles/style.css";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="app-container">
      <div className="main-content">
        <Calendar />
      </div>
    </div>
  );
}

export default Dashboard;
