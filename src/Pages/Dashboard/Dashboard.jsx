// src/App.js
import React from "react";
import Planning from "../../Components/Calendar/Planning";
import "../../Styles/style.css";
import "./Dashboard.css";
function Dashboard() {
  return (
    <div className="app-container">
      <div className="main-content">
        <Planning />
      </div>
    </div>
  );
}

export default Dashboard;
