import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Dashboard from "./Pages/Dashboard/Dashboard";
import GarageSettings from "./Pages/GarageSettings/GarageSettings";
import Login from "./Pages/Login/index";
import UserDashboard from "./Pages/UserDashboard/UserDashboard";
import PrivateRoute from "./hooks/PrivateRoute"; // Importez le composant PrivateRoute
const tabLabels = [
  { label: "Planning", path: "/planning/categories" },
  { label: "Clients", path: "/clients" },
  { label: "Store", path: "/store" },
  { label: "Team", path: "/team" },
  { label: "Caisses", path: "/caisses" },
  { label: "Catalogue", path: "/catalogue" },
  { label: "Pilotage", path: "/pilotage" },
  { label: "Marketing", path: "/marketing" },
  { label: "Paramètres", path: "/parametres" },
];

const DashboardTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = tabLabels.findIndex(
    (tab) => tab.path === location.pathname
  );

  const handleChange = (event, newValue) => {
    navigate(tabLabels[newValue].path);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        position: "fixed",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)", // Centre horizontalement
        width: "80vw", // Ajuste la largeur pour un meilleur rendu
        bgcolor: "background.paper",
        boxShadow: 3,
        borderRadius: 2,
        zIndex: 999, // Toujours au-dessus
        marginBottom: "20px", // Marge en bas pour l'espacement
        p: 1,
      }}
    >
      <Box
        sx={{
          width: "100%",
        }}
      >
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

// const ActivitySidebar = () => {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <Drawer
//         anchor="left"
//         open={open}
//         variant="permanent"
//         sx={{
//           width: open ? 250 : 40,
//           flexShrink: 0,
//           "& .MuiDrawer-paper": {
//             width: open ? 250 : 40,
//             transition: "width 0.3s",
//             overflow: "hidden",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           },
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             width: "100%",
//           }}
//         >
//           <IconButton
//             onClick={() => setOpen(!open)}
//             sx={{ alignSelf: "flex-end" }}
//           >
//             <MenuIcon />
//           </IconButton>
//           {open ? (
//             <List>
//               <ListItem button>
//                 <ListItemText primary="Historique 1" />
//               </ListItem>
//               <ListItem button>
//                 <ListItemText primary="Historique 2" />
//               </ListItem>
//               <ListItem button>
//                 <ListItemText primary="Historique 3" />
//               </ListItem>
//             </List>
//           ) : (
//             <Typography
//               variant="body2"
//               sx={{ transform: "rotate(-90deg)", whiteSpace: "nowrap" }}
//             >
//               Activité
//             </Typography>
//           )}
//         </Box>
//       </Drawer>
//     </>
//   );
// };

const ActivitySidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer
      anchor="left"
      open={open}
      variant="permanent"
      onClick={() => setOpen(!open)}
      sx={{
        position: "fixed",
        height: "100vh",
        width: open ? 250 : 40,
        flexShrink: 0,
        zIndex: 1300,
        "& .MuiDrawer-paper": {
          width: open ? 250 : 40,
          height: "100vh",
          transition: "width 0.3s",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          position: "fixed",
          zIndex: 1300,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        {open ? (
          <List sx={{ flexGrow: 1, width: "100%" }}>
            <ListItem button>
              <ListItemText primary="Historique 1" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Historique 2" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Historique 3" />
            </ListItem>
          </List>
        ) : (
          <Typography
            variant="body2"
            sx={{
              transform: "rotate(-90deg)",
              whiteSpace: "nowrap",
              position: "absolute",
              top: "50%",
              left: 5,
            }}
          >
            Activité
          </Typography>
        )}
        <IconButton
          sx={{ position: "absolute", bottom: 10 }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          {open ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
        </IconButton>
      </Box>
    </Drawer>
  );
};

const App = () => {
  return (
    <Router>
      <ActivitySidebar />

      <DashboardTabs />

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
        <Route
          path="/parametres"
          element={
            <PrivateRoute>
              <GarageSettings />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
