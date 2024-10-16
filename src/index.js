import React from "react";
import ReactDOM from "react-dom/client";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Login from "./Pages/Login/index";
import UserDashboard from "./Pages/UserDashboard/UserDashboard";
import PrivateRoute from "./hooks/PrivateRoute"; // Importez le composant PrivateRoute

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Routes protégées */}
        <Route
          path="/planning/categories"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/planning/customers"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
