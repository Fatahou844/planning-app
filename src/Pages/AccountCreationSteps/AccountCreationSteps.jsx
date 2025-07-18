import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import CustomStepper from "../../Components/CustomStepper/CustomStepper";
import GarageSearch from "../../Components/GarageSearch";
import { useAxios } from "../../utils/hook/useAxios";

export default function AccountCreationSteps({ activeStep = 0 }) {
  const [Garage, SetGarage] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",

    website: "",
  });

  const handleSelectGarage = (Garage) => {
    SetGarage(Garage);
    console.log("Garage sélectionné :", Garage);
  };

  const [formData, setFormData] = useState({
    name: "",
    firstName: "",
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const axios = useAxios();

  const handleSubmit = async () => {
    console.log("Données envoyées :", {
      ...formData,
      garageId: Garage.id,
      status: "0",
      level: "0",
    });

    // Tu peux faire un appel API ici avec axios :
    // axios.post("/api/register", formData).then(...);

    const response = await axios.post("/data/user-data", {
      ...formData,
      garageId: Garage.id,
      status: "0",
      level: "0",
    });
    if (response.data) {
      window.location.href = "/";
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box mt={4} display="flex" flexDirection="column" gap={2}>
            <TextField
              placeholder="nom"
              fullWidth
              size="small"
              sx={{
                height: "30px",
                "& .MuiInputBase-root": { fontSize: "0.8rem" },
                "& .MuiFormLabel-root": { fontSize: "0.8rem" },
              }}
              value={formData.name}
              name="name"
              onChange={handleChange}
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
              value={formData.firstName}
              name="firstName"
              onChange={handleChange}
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
              value={formData.email}
              name="email"
              onChange={handleChange}
            />
            <TextField
              placeholder="Mot de passe"
              type="password"
              fullWidth
              size="small"
              sx={{
                height: "30px",
                "& .MuiInputBase-root": { fontSize: "0.8rem" },
                "& .MuiFormLabel-root": { fontSize: "0.8rem" },
              }}
              value={formData.password}
              name="password"
              onChange={handleChange}
            />

            <GarageSearch
              onSelectGarage={handleSelectGarage}
              Garage={Garage}
            ></GarageSearch>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
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

  return (
    <Box maxWidth={800} mx="auto" mt={4}>
      <CustomStepper activeStep={activeStep} /> {/* ✅ UTILISATION */}
      <Paper square elevation={3} sx={{ p: 4, mt: 4 }}>
        {renderStepContent()}
        <Link to={"/"}>J'ai déjà un compte</Link>
      </Paper>
    </Box>
  );
}
