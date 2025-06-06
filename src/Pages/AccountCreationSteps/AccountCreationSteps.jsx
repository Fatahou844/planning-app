import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import {
  Autocomplete,
  Box,
  Button,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";

const steps = [
  {
    label: "Création du compte",
    icon: <AccountCircleIcon fontSize="large" color="primary" />,
  },
  {
    label: "Vérification de l'adresse email",
    icon: <MarkEmailReadIcon fontSize="large" color="action" />,
  },
  {
    label: "Approbation par l'administrateur",
    icon: <AdminPanelSettingsIcon fontSize="large" color="disabled" />,
  },
];

export default function AccountCreationSteps({ activeStep = 0 }) {
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box mt={4} display="flex" flexDirection="column" gap={2}>
            <TextField label="Nom" fullWidth />
            <TextField label="Prénom" fullWidth />
            <TextField label="Email" type="email" fullWidth />
            <Autocomplete
              options={["Garage Alpha", "Garage Beta", "Garage Gamma"]}
              renderInput={(params) => (
                <TextField {...params} label="Garage associé" fullWidth />
              )}
            />
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

  return (
    <Box maxWidth={800} mx="auto" mt={4}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel icon={step.icon}>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper square elevation={3} sx={{ p: 4, mt: 4 }}>
        {renderStepContent()}
      </Paper>
    </Box>
  );
}
