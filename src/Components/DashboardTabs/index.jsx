import React from "react";
import { Tabs, Tab, Box, Container } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from "react-router-dom";

const tabLabels = [
  { label: "Planning", path: "/planning" },
  { label: "Clients", path: "/clients" },
  { label: "Store", path: "/store" },
  { label: "Team", path: "/team" },
  { label: "Caisses", path: "/caisses" },
  { label: "Pilotage", path: "/pilotage" },
  { label: "Marketing", path: "/marketing" },
  { label: "Paramètres", path: "/parametres" }
];

const DashboardTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = tabLabels.findIndex(tab => tab.path === location.pathname);

  const handleChange = (event, newValue) => {
    navigate(tabLabels[newValue].path);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: "100%", bgcolor: "background.paper", boxShadow: 3, borderRadius: 2, p: 1 }}>
        <Tabs 
          value={activeTab !== -1 ? activeTab : 0} 
          onChange={handleChange} 
          variant="fullWidth" 
          textColor="primary" 
          indicatorColor="primary"
        >
          {tabLabels.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>
    </Container>
  );
};
