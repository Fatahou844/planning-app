import React from "react";
import ReactDOM from "react-dom/client";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./Pages/Dashboard/Dashboard";
import UserDashboard from "./Pages/UserDashboard/UserDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/planning/categories" element={<Dashboard />} />
        <Route path="/planning/customers" element={<UserDashboard />} />
      </Routes>
    </Router>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
