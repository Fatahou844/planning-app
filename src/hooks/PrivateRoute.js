import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate } from "react-router-dom";
import { auth } from "./firebaseConfig"; // Importez votre configuration Firebase

const PrivateRoute = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div>Chargement...</div>; // Vous pouvez afficher un loader pendant la vérification de l'état
  }

  if (!user) {
    // Si l'utilisateur n'est pas connecté, redirigez vers la page de login
    return <Navigate to="/" />;
  }

  return children; // Sinon, affichez la route protégée
};

export default PrivateRoute;
