// SignInSignUp.jsx
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showUsername, setShowUsername] = useState(true);

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
      const userToken = await axios.post("/login", {
        email: form.email,
        password: form.password,
      });

      if (userToken.data.token) {
        window.location.href = "/planning/categories";
      }
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
  const inputRef = React.useRef();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const filledValue = inputRef.current?.value || "";
      if (filledValue && filledValue !== form.email) {
        handleChange("email", filledValue);
      }
    }, 100); // attendre que le navigateur injecte l'email

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h5" mb={3} textAlign="center">
          {isSignUp ? "Créer un compte" : "Connexion à l'espace garage"}
        </Typography>

        {/* <Alert severity="info" sx={{ mb: 2 }}>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iusto velit
          fuga quos possimus, nemo alias quam maxime animi aliquam architecto
          eveniet pariatur dolorem vero, nobis maiores asperiores iure amet
          harum.
        </Alert> */}

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

          {/* <TextField
            placeholder="Adresse e-mail"
            fullWidth
            type={showUsername ? "text" : "password"}
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            size="small"
            sx={{
              height: "30px",
              "& .MuiInputBase-root": { fontSize: "0.8rem" },
              "& .MuiFormLabel-root": { fontSize: "0.8rem" },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowUsername((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {showUsername ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          /> */}
          <Box sx={{ position: "relative", width: "100%" }}>
            {showUsername ? (
              <TextField
                placeholder="Adresse e-mail"
                fullWidth
                inputRef={inputRef}
                type="text"
                autoComplete="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowUsername(false)}
                        edge="end"
                        size="small"
                      >
                        <VisibilityOff />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  height: "40px",
                  px: 2,
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  background: "#fff8cc", // même couleur que ton champ email
                  fontSize: "0.8rem",
                  fontFamily: "monospace",
                  letterSpacing: "0.2em",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  position: "relative",
                }}
              >
                {"•".repeat(form.email.length)}
                <IconButton
                  onClick={() => setShowUsername(true)}
                  edge="end"
                  size="small"
                  sx={{
                    position: "absolute",
                    right: 4,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <Visibility />
                </IconButton>
              </Box>
            )}
          </Box>

          <TextField
            placeholder="Mot de passe"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            size="small"
            sx={{
              height: "30px",
              "& .MuiInputBase-root": { fontSize: "0.8rem" },
              "& .MuiFormLabel-root": { fontSize: "0.8rem" },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button variant="contained" onClick={handleSubmit}>
            Se connecter
          </Button>
          <Link to={"/register"}>Je n'ai pas encore de compte</Link>
        </Stack>
      </Box>
    </Container>
  );
}
