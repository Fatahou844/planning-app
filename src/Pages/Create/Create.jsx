// SignInSignUp.jsx
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useAxios } from "../../utils/hook/useAxios";
const garagesMock = [
  { label: "Garage Auto Pro", id: 1 },
  { label: "Garage SpeedX", id: 2 },
  { label: "Garage MécanoPlus", id: 3 },
];

export default function AuthPages() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const axios = useAxios();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    garage: null,
    address: "",
    phone: "",
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setAlertMessage("Veuillez remplir les champs requis.");
      return;
    }

    if (isSignUp) {
      await axios.post("/data/user-data", {
        firstName: form.firstName,
        name: form.lastName,
        garageId: 1,
        email: form.email,
        password: form.password,
      });
    } else {
      await axios.post("/login", {
        email: form.email,
        password: form.password,
      });
    }

    if (isSignUp && (!form.firstName || !form.lastName || !form.garage)) {
      setAlertMessage("Merci de compléter tous les champs de l'inscription.");
      return;
    }

    // Simulation d'envoi de formulaire
    setAlertMessage(
      isSignUp ? "Inscription réussie 🎉" : "Connexion réussie ✅"
    );
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h5" mb={3} textAlign="center">
          {isSignUp ? "Créer un compte" : "Connexion à l'espace garage"}
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iusto velit
          fuga quos possimus, nemo alias quam maxime animi aliquam architecto
          eveniet pariatur dolorem vero, nobis maiores asperiores iure amet
          harum.
        </Alert>

        {alertMessage && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {alertMessage}
          </Alert>
        )}

        <Stack spacing={2}>
          {isSignUp && (
            <>
              <TextField
                label="Prénom"
                fullWidth
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
              <TextField
                label="Nom"
                fullWidth
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
              <Alert severity="warning" sx={{ mb: 2 }}>
                Veuillez vous assurer que vous appartenez dans ce garage.
              </Alert>
              <Autocomplete
                options={garagesMock}
                getOptionLabel={(option) => option.label}
                value={form.garage}
                onChange={(event, newValue) => handleChange("garage", newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Garage associé" />
                )}
              />
              <TextField
                label="Adresse locale"
                fullWidth
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
              <TextField
                label="Téléphone"
                fullWidth
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </>
          )}

          <TextField
            label="Adresse e-mail"
            fullWidth
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          <TextField
            label="Mot de passe"
            type="password"
            fullWidth
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />

          <Button variant="contained" onClick={handleSubmit}>
            {isSignUp ? "S'inscrire" : "Se connecter"}
          </Button>

          <Button onClick={() => setIsSignUp(!isSignUp)} color="secondary">
            {isSignUp ? "Déjà un compte ? Se connecter" : "Créer un compte"}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
