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
import axios from "axios";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AccountCreationSteps from "./Pages/AccountCreationSteps/AccountCreationSteps";
import AuthPages from "./Pages/Create/Create";
import Dashboard from "./Pages/Dashboard/Dashboard";
import GarageSettings from "./Pages/GarageSettings/GarageSettings";
import ManageClients from "./Pages/ManageClients/ManageClients";
import UserDashboard from "./Pages/UserDashboard/UserDashboard";
import { ProvideAxios } from "./utils/hook/useAxios";
import { UserProvider } from "./utils/hook/UserContext";
import PrivateRoute from "./utils/PrivateRoute"; // Importez le composant PrivateRoute
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
const BASE_URL_API = "https://api.zpdigital.fr";
//const BASE_URL_API = "http://localhost:4001";

const DashboardTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = tabLabels.findIndex(
    (tab) => tab.path === location.pathname
  );

  const handleChange = (event, newValue) => {
    navigate(tabLabels[newValue].path);
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("jwtToken");

    const config = {
      withCredentials: true, // TRÈS IMPORTANT

      headers: {
        Authorization: `Bearer ${authToken}`, // Utilisation de Bearer pour les jetons JWT
        // Si vous utilisez un autre type d'autorisation, ajustez cette ligne en conséquence
      },
    };

    const fetchAuthStatus = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL_API}/v1/auth/check-auth`,
          config
        );
        setIsAuthenticated(res.data.isAuthenticated);
        const response = await axios.get(`${BASE_URL_API}/v1`, config);
        var jsonString = JSON.stringify(response.data);
        console.log("ENREGISTREMENT DES DONNES USERS");
        localStorage.setItem("me", jsonString);

        if (window.localStorage.getItem("me")) {
          const retrievedObject = JSON.parse(window.localStorage.getItem("me"));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error fetching authentication status:", error);
      }
    };

    fetchAuthStatus();
  }, [, isAuthenticated]);

  return (
    <>
      {isAuthenticated && (
        <Container
          maxWidth="xl"
          sx={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "80vw",
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 2,
            zIndex: 999,
            p: 0, // Suppression du padding
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Tabs
              value={activeTab !== -1 ? activeTab : 0}
              onChange={handleChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                minHeight: "24px", // Hauteur ultra-mince
                height: "24px",
              }}
            >
              {tabLabels.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  sx={{
                    minHeight: "24px", // Onglets aussi minces que possible
                    height: "24px",
                    padding: "2px 6px", // Réduction du padding
                    fontSize: "0.7rem", // Texte plus petit
                    lineHeight: "1", // Compactage du texte
                  }}
                />
              ))}
            </Tabs>
          </Box>
        </Container>
      )}
    </>
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

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("jwtToken");

    const config = {
      withCredentials: true, // TRÈS IMPORTANT

      headers: {
        Authorization: `Bearer ${authToken}`, // Utilisation de Bearer pour les jetons JWT
        // Si vous utilisez un autre type d'autorisation, ajustez cette ligne en conséquence
      },
    };

    const fetchAuthStatus = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL_API}/v1/auth/check-auth`,
          config
        );
        setIsAuthenticated(res.data.isAuthenticated);
        const response = await axios.get(`${BASE_URL_API}/v1`, config);
        var jsonString = JSON.stringify(response.data);
        console.log("ENREGISTREMENT DES DONNES USERS");
        localStorage.setItem("me", jsonString);

        if (window.localStorage.getItem("me")) {
          const retrievedObject = JSON.parse(window.localStorage.getItem("me"));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error fetching authentication status:", error);
      }
    };

    fetchAuthStatus();
  }, [, isAuthenticated]);

  return (
    <>
      {isAuthenticated && (
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
      )}
    </>
  );
};

const App = () => {
  return (
    <ProvideAxios>
      <UserProvider>
        <Router>
          <ActivitySidebar />

          <DashboardTabs />

          <Routes>
            <Route path="/" element={<AuthPages />} />
            <Route path="/connexion" element={<AuthPages />} />
            <Route path="/register" element={<AccountCreationSteps />} />

            {/* Routes protégées */}

            <Route
              path="/planning/categories"
              element={<PrivateRoute Component={Dashboard} />}
            />

            <Route
              path="/clients"
              element={<PrivateRoute Component={ManageClients} />}
            />

            <Route
              path="/planning/customers"
              element={<PrivateRoute Component={UserDashboard} />}
            />

            <Route
              path="/parametres"
              element={<PrivateRoute Component={GarageSettings} />}
            />
          </Routes>
        </Router>
      </UserProvider>
    </ProvideAxios>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
