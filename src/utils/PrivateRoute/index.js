import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ Component }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState("user");
  const BASE_URL_API = "https://api.zpdigital.fr";
  //const BASE_URL_API = "http://localhost:4001";
  const [userData, setUserData] = useState(null);

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
        setIsLoading(false);
        const response = await axios.get(`${BASE_URL_API}/v1`, config);
        var jsonString = JSON.stringify(response.data);
        console.log("ENREGISTREMENT DES DONNES USERS");
        localStorage.setItem("me", jsonString);

        const user = response.data;
        setUserData(user);

        if (window.localStorage.getItem("me")) {
          const retrievedObject = JSON.parse(window.localStorage.getItem("me"));
          setRole(retrievedObject.role);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error fetching authentication status:", error);
        setIsLoading(false);
      }
    };

    fetchAuthStatus();
  }, [, isAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    const currentPath = window.location.pathname;

    if (userData?.status === "0" && currentPath !== "/account-verification") {
      return <Navigate to="/account-verification" />;
    } else if (
      userData?.status === "1" &&
      currentPath !== "/account-approbation"
    ) {
      return <Navigate to="/account-approbation" />;
    } else {
      return <Component />;
    }
  }

  return <Navigate to="/connexion" />;

  // return isAuthenticated ? <Component /> : <Navigate to="/connexion" />;
};

export default PrivateRoute;
