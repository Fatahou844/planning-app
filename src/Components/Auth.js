// src/Auth.js
import {
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../hooks/firebaseConfig";

import { Navigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Connexion
        await signInWithEmailAndPassword(auth, email, password);
        alert("Connexion réussie");
        window.location.href = "/planning/categories";
        return <Navigate to="/planning/categories" />;
      } else {
        // Inscription
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Inscription réussie");
      }
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      alert(error.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h2" variant="h5" gutterBottom>
          {isLogin ? "Connexion" : "Inscription"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            {isLogin ? "Se connecter" : "S'inscrire"}
          </Button>
          <Typography variant="body2" align="center">
            <Link
              href="#"
              onClick={() => setIsLogin(!isLogin)}
              underline="hover"
            >
              {isLogin
                ? "Pas encore inscrit ? S'inscrire"
                : "Déjà inscrit ? Se connecter"}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Auth;
