import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { Badge, Step, StepLabel, Stepper } from "@mui/material";

const steps = [
  {
    label: "Création du compte",
    icon: AccountCircleIcon,
  },
  {
    label: "Vérification de l'adresse email",
    icon: MarkEmailReadIcon,
  },
  {
    label: "Approbation par l'administrateur",
    icon: AdminPanelSettingsIcon,
  },
];

export default function CustomStepper({ activeStep = 0 }) {
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((step, index) => {
        const IconComponent = step.icon;

        // Définir l'état : passé, en cours ou à venir
        let badgeIcon = null;
        let iconColor = "disabled";

        if (index < activeStep) {
          badgeIcon = <CheckCircleIcon color="success" fontSize="small" />;
          iconColor = "success";
        } else if (index === activeStep) {
          badgeIcon = <HourglassTopIcon color="warning" fontSize="small" />;
          iconColor = "warning";
        }

        return (
          <Step key={index}>
            <StepLabel
              icon={
                <Badge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  badgeContent={badgeIcon}
                >
                  <IconComponent fontSize="large" color={iconColor} />
                </Badge>
              }
            >
              {step.label}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}
