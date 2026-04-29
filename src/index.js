import LogoutIcon from "@mui/icons-material/Logout";
import { Box, Container, IconButton, Tab, Tabs } from "@mui/material";
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
import PlatformDashboard from "./Pages/PlatformDashboard/PlatformDashboard";
import PlatformLogin from "./Pages/PlatformLogin/PlatformLogin";
import Landing from "./Pages/Landing/Landing";
import ResetPasswordPage from "./Pages/ResetPasswordPage/ResetPasswordPage";
import Store from "./Pages/Store/Store";
import UserDashboard from "./Pages/UserDashboard/UserDashboard";
import WeeklyPlanning from "./Pages/WeeklyPlanning";
import { CustomThemeProvider } from "./theme/ThemeProvider";
import { ProvideAxios } from "./utils/hook/useAxios";
import { UserProvider } from "./utils/hook/UserContext";
import PrivateRoute from "./utils/PrivateRoute";

/* ─────────────────────────────────────────────────────────
   Routes sans chrome garage (pas de sidebar, pas de tabs)
───────────────────────────────────────────────────────── */
const NO_CHROME_ROUTES = [
  "/platform-login",
  "/platform-dashboard",
  "/register",
  "/reset-password",
  "/account-verification",
  "/account-approbation",
  "/landing",
];

const SIDEBAR_OPEN_WIDTH   = 280;
const SIDEBAR_CLOSED_WIDTH = 40;

/* ─────────────────────────────────────────────────────────
   Barre de navigation garage
───────────────────────────────────────────────────────── */
const tabLabels = [
  { label: "Atelier",    path: "/atelier"    },
  { label: "Planning",   path: "/"           },
  { label: "Clients",    path: "/clients"    },
  { label: "Store",      path: "/store"      },
  { label: "Team",       path: "/team"       },
  { label: "Caisses",    path: "/caisses"    },
  { label: "Catalogue",  path: "/catalogue"  },
  { label: "Pilotage",   path: "/pilotage"   },
  { label: "Marketing",  path: "/marketing"  },
  { label: "Paramètres", path: "/parametres" },
];

const DashboardTabs = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const activeTab = tabLabels.findIndex((tab) => tab.path === location.pathname);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const authToken = getCookie("jwtToken");
    const config = {
      withCredentials: true,
      headers: { Authorization: `Bearer ${authToken}` },
    };

    const fetchAuthStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL_API}/v1/auth/check-auth`, config);
        setIsAuthenticated(res.data.isAuthenticated);
        const response = await axios.get(`${BASE_URL_API}/v1`, config);
        localStorage.setItem("me", JSON.stringify(response.data));
        if (window.localStorage.getItem("me")) setIsAuthenticated(true);
      } catch (error) {
        console.error("Error fetching authentication status:", error);
      }
    };

    fetchAuthStatus();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      const token = Cookies.get("jwtToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload?.sub)
            localStorage.removeItem(`hasSeenNotification_${payload.sub}`);
        } catch (e) {
          console.error("Erreur décodage JWT :", e);
        }
      }
      await axios.get(`${BASE_URL_API}/v1/logout`);
      document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/";
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
            p: 0,
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Tabs
              value={activeTab !== -1 ? activeTab : 0}
              onChange={(_, v) => navigate(tabLabels[v].path)}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              sx={{ minHeight: "24px", height: "24px" }}
            >
              {tabLabels.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  sx={{
                    minHeight: "24px",
                    height: "24px",
                    padding: "2px 6px",
                    fontSize: "0.7rem",
                    lineHeight: "1",
                  }}
                />
              ))}
              <IconButton
                sx={{ position: "absolute", bottom: 60, transition: "left 0.3s, transform 0.3s" }}
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

/* ─────────────────────────────────────────────────────────
   Shell garage : ActivitySidebar + DashboardTabs + contenu
   Invisible sur les routes plateforme et les pages publiques
───────────────────────────────────────────────────────── */
const GarageShell = ({ children }) => {
  const location   = useLocation();
  const isNoChrome = NO_CHROME_ROUTES.includes(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isNoChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <ActivitySidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <FloatingSupport phone="212665947911" />
      <DashboardTabs />
      <Box
        sx={{
          marginLeft: `${sidebarOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH}px`,
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </>
  );
};

/* ─────────────────────────────────────────────────────────
   App
───────────────────────────────────────────────────────── */
const App = () => (
  <ProvideAxios>
    <UserProvider>
      <Router>
        <CustomThemeProvider>
          <header style={{ padding: "1rem" }}>
            <ThemeToggle />
          </header>

          <GarageShell>
            <Routes>
              {/* ── Pages garage authentifiées ── */}
              <Route path="/"                   element={<PrivateRoute Component={Dashboard} />} />
              <Route path="/weekly-planning"    element={<PrivateRoute Component={WeeklyPlanning} />} />
              <Route path="/store"              element={<PrivateRoute Component={Store} />} />
              <Route path="/atelier"            element={<PrivateRoute Component={Atelier} />} />
              <Route path="/clients"            element={<PrivateRoute Component={ManageClients} />} />
              <Route path="/planning/customers" element={<PrivateRoute Component={UserDashboard} />} />
              <Route path="/parametres"         element={<PrivateRoute Component={GarageSettings} />} />

              {/* ── Pages publiques garage ── */}
              <Route path="/register"              element={<AccountCreationSteps />} />
              <Route path="/reset-password"        element={<ResetPasswordPage />} />
              <Route path="/account-verification"  element={<PrivateRoute Component={AccountVerificationSteps} />} />
              <Route path="/account-approbation"   element={<PrivateRoute Component={AccountApprove} />} />

              {/* ── Page commerciale ── */}
              <Route path="/landing" element={<Landing />} />

              {/* ── Espace admin plateforme — sans chrome garage ── */}
              <Route path="/platform-login"     element={<PlatformLogin />} />
              <Route path="/platform-dashboard" element={<PlatformDashboard />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </GarageShell>
        </CustomThemeProvider>
      </Router>
    </UserProvider>
  </ProvideAxios>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
