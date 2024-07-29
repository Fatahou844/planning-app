import React from "react";
import ReactDOM from "react-dom/client";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CashflowUI from "./Pages/CashflowUI/CashflowUI";
import Dashboard from "./Pages/Dashboard/Dashboard";

const App = () => {
  return (
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<CashflowUI />} />
        </Routes>
      </Router>
    </React.StrictMode>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
