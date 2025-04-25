// UserContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAxios } from "./useAxios";

// Créer le contexte
const UserContext = createContext(null);

// Fournisseur de contexte
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const axios = useAxios();

  // Récupérer les informations utilisateur depuis l'API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/`); // Remplacez '/api' par l'endpoint approprié
        setUser(response.data);
        console.log("response.data", response.data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des informations utilisateur:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte utilisateur
export const useUser = () => {
  return useContext(UserContext);
};
