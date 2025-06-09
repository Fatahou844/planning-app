import LogoutIcon from "@mui/icons-material/Logout";
import { Box, Button, Fab, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import CustomStepper from "../../Components/CustomStepper/CustomStepper";
import GarageSearch from "../../Components/GarageSearch";
import { useAxios } from "../../utils/hook/useAxios";

export default function AccountVerificationSteps({ activeStep = 1 }) {
  const [Garage, SetGarage] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",

    website: "",
  });
  const axios = useAxios();

  const handleSelectGarage = (Garage) => {
    SetGarage(Garage);
    console.log("Garage sélectionné :", Garage);
  };
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box mt={4} display="flex" flexDirection="column" gap={2}>
            <TextField
              placeholder="Nom"
              fullWidth
              size="small"
              sx={{
                height: "30px",
                "& .MuiInputBase-root": { fontSize: "0.8rem" },
                "& .MuiFormLabel-root": { fontSize: "0.8rem" },
              }}
            />
            <TextField
              placeholder="Prénom"
              size="small"
              fullWidth
              sx={{
                height: "30px",
                "& .MuiInputBase-root": { fontSize: "0.8rem" },
                "& .MuiFormLabel-root": { fontSize: "0.8rem" },
              }}
            />
            <TextField
              placeholder="Email"
              type="email"
              fullWidth
              size="small"
              sx={{
                height: "30px",
                "& .MuiInputBase-root": { fontSize: "0.8rem" },
                "& .MuiFormLabel-root": { fontSize: "0.8rem" },
              }}
            />
            <GarageSearch
              onSelectGarage={handleSelectGarage}
              Garage={Garage}
            ></GarageSearch>
            <Button variant="contained" color="primary">
              Créer mon compte
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box mt={4} textAlign="center">
            <Typography variant="h6" gutterBottom>
              📧 Vérification de l'adresse email
            </Typography>
            <Typography>
              Un lien vous a été envoyé par email. Cliquez dessus pour vérifier
              votre adresse.
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Box mt={4} textAlign="center">
            <Typography variant="h6" gutterBottom>
              ⏳ En attente d'approbation
            </Typography>
            <Typography>
              Votre compte est en cours de validation par un administrateur.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

   const handleLogout = async () => {
      try {
        await axios.get("/logout"); // pour envoyer les cookies
        document.cookie =
          "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/"; // redirection après logout
      } catch (error) {
        console.error("Erreur de déconnexion :", error);
      }
    };

  return (
    <Box maxWidth={800} mx="auto" mt={4}>
      <CustomStepper activeStep={activeStep} /> {/* ✅ UTILISATION */}
      <Paper square elevation={3} sx={{ p: 4, mt: 4 }}>
        {renderStepContent()}
      </Paper>
       <Fab
                    color="seconday"
                    aria-label="add"
                    sx={{
                      position: "fixed",
                      bottom: 16,
                      right: 16,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      width: 120, // Ajuste la largeur pour s'assurer que le texte est visible
                      padding: "8px 16px", // Ajuste le remplissage pour le rendre plus spacieux
                      borderRadius: "8px", // Optionnel : ajoute un bord arrondi
                    }}
                    onClick={handleLogout}
                  >
                    <LogoutIcon />
                  </Fab>
      
    </Box>
  );
}
