import LogoutIcon from "@mui/icons-material/Logout";
import {
  Box,
  Container,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import ActivitySidebar from "./Components/ActivitySidebar";
import FloatingSupport from "./Components/FloatingSupport";
import { ThemeToggle } from "./Components/ThemeToggle/ThemeToggle";
import { BASE_URL_API } from "./config";
import AccountApprove from "./Pages/AccountApprove.jsx/AccountApprove";
import AccountCreationSteps from "./Pages/AccountCreationSteps/AccountCreationSteps";
import AccountVerificationSteps from "./Pages/AccountVerificationSteps/AccountVerificationSteps";
import Atelier from "./Pages/Atelier/Atelier";
import Dashboard from "./Pages/Dashboard/Dashboard";
import GarageSettings from "./Pages/GarageSettings/GarageSettings";
import ManageClients from "./Pages/ManageClients/ManageClients";
import NotFoundPage from "./Pages/NotFoundPage/NotFoundPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage/ResetPasswordPage";
import AdminStock from "./Pages/AdminStock";
import Store from "./Pages/Store/Store";
import UserDashboard from "./Pages/UserDashboard/UserDashboard";
import WeeklyPlanning from "./Pages/WeeklyPlanning";
import { CustomThemeProvider } from "./theme/ThemeProvider";
import { ProvideAxios } from "./utils/hook/useAxios";
import { UserProvider } from "./utils/hook/UserContext";
import PrivateRoute from "./utils/PrivateRoute"; // Importez le composant PrivateRoute
const tabLabels = [
  { label: "Atelier", path: "/atelier" },
  { label: "Planning", path: "/" },
  { label: "Clients", path: "/clients" },
  { label: "Store", path: "/store" },
  { label: "Team", path: "/team" },
  { label: "Caisses", path: "/caisses" },
  { label: "Catalogue", path: "/catalogue" },
  { label: "Pilotage", path: "/pilotage" },
  { label: "Marketing", path: "/marketing" },
  { label: "Paramètres", path: "/parametres" },
  { label: "Admin",      path: "/admin" },
];

const DashboardTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = tabLabels.findIndex(
    (tab) => tab.path === location.pathname,
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
          config,
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
  const handleLogout = async () => {
    try {
      // Optionnel : suppression de la clé du localStorage
      const token = Cookies.get("jwtToken"); // si encore présent avant remove
      if (token) {
        try {
          const payloadBase64 = token.split(".")[1];
          const payload = JSON.parse(atob(payloadBase64));
          const userEmail = payload?.sub;
          if (userEmail) {
            localStorage.removeItem(`hasSeenNotification_${userEmail}`);
          }
        } catch (e) {
          console.error("Erreur décodage JWT :", e);
        }
      }

      await axios.get(`${BASE_URL_API}/v1/logout`); // pour envoyer les cookies
      document.cookie =
        "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      window.location.href = "/"; // redirection après logout
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    }
  };

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

              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 60, // plus haut que le bouton de toggle

                  transition: "left 0.3s, transform 0.3s",
                }}
                onClick={handleLogout}
              >
                <LogoutIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tabs>
          </Box>
        </Container>
      )}
    </>
  );
};


const SIDEBAR_OPEN_WIDTH   = 280;
const SIDEBAR_CLOSED_WIDTH = 40;

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProvideAxios>
      <UserProvider>
        <Router>
          <CustomThemeProvider>
            <header style={{ padding: "1rem" }}>
              <ThemeToggle />
            </header>

            <ActivitySidebar
              open={sidebarOpen}
              onToggle={() => setSidebarOpen((prev) => !prev)}
            />

            <FloatingSupport phone="212665947911" />
            <DashboardTabs />

            {/* ── Content wrapper : se décale avec la sidebar ── */}
            <Box
              sx={{
                marginLeft: `${sidebarOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH}px`,
                transition: "margin-left 0.3s ease",
                minHeight: "100vh",
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={<PrivateRoute Component={Dashboard} />}
                />
                <Route path="/register" element={<AccountCreationSteps />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route
                  path="/weekly-planning"
                  element={<PrivateRoute Component={WeeklyPlanning} />}
                />
                <Route
                  path="/store"
                  element={<PrivateRoute Component={Store} />}
                />
                <Route
                  path="/atelier"
                  element={<PrivateRoute Component={Atelier} />}
                />
                <Route
                  path="/account-verification"
                  element={<PrivateRoute Component={AccountVerificationSteps} />}
                />
                <Route
                  path="/account-approbation"
                  element={<PrivateRoute Component={AccountApprove} />}
                />
                <Route path="*" element={<NotFoundPage />} />
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
                <Route
                  path="/admin"
                  element={<PrivateRoute Component={AdminStock} />}
                />
              </Routes>
            </Box>
          </CustomThemeProvider>
        </Router>
      </UserProvider>
    </ProvideAxios>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
