import AssignmentIcon   from "@mui/icons-material/Assignment";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import CloseIcon        from "@mui/icons-material/Close";
import PrintIcon        from "@mui/icons-material/Print";
import ReceiptIcon      from "@mui/icons-material/Receipt";
import DescriptionIcon  from "@mui/icons-material/Description";
import EventNoteIcon    from "@mui/icons-material/EventNote";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import DevisTemplate              from "../DevisTemplate";
import InvoiceTemplateWithoutOR   from "../InvoiceTemplateWithoutOR";
import OrdreReparationTemplate    from "../OrdreReparationTemplate";
import ReservationTemplate        from "../ReservationTemplate";

const DOC_CONFIG = {
  events:       { label: "Ordre de réparation", Icon: AssignmentIcon,  color: "primary"  },
  reservations: { label: "Réservation",          Icon: EventNoteIcon,   color: "info"     },
  factures:     { label: "Facture",              Icon: ReceiptIcon,     color: "success"  },
  devis:        { label: "Devis",                Icon: DescriptionIcon, color: "warning"  },
};

const Notification = ({
  handleClose,
  dataEvent,
  dataDetails,
  message,
  collectionName,
}) => {
  const theme  = useTheme();
  const config = DOC_CONFIG[collectionName] ?? DOC_CONFIG.events;
  const { label, Icon, color } = config;

  const renderTemplate = () => {
    switch (collectionName) {
      case "events":
        return (
          <OrdreReparationTemplate
            editedEvent={dataEvent}
            details={dataDetails}
            closeNotification={handleClose}
          />
        );
      case "reservations":
        return (
          <ReservationTemplate
            editedEvent={dataEvent}
            details={dataDetails}
            closeNotification={handleClose}
          />
        );
      case "factures":
        return (
          <InvoiceTemplateWithoutOR
            NewEvent={dataEvent}
            details={dataDetails}
            closeNotification={handleClose}
          />
        );
      case "devis":
        return (
          <DevisTemplate
            editedEvent={dataEvent}
            details={dataDetails}
            closeNotification={handleClose}
          />
        );
      default:
        return null;
    }
  };

  const isSuppression = message?.includes("supprim");

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100000,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: 420,
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {/* En-tête coloré */}
        <Box
          sx={{
            bgcolor: `${color}.main`,
            color: "#fff",
            px: 2.5,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {isSuppression
              ? <CloseIcon />
              : <CheckCircleIcon />
            }
            <Typography variant="subtitle1" fontWeight={700}>
              {isSuppression ? "Suppression" : label + " créé(e)"}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: "#fff" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Corps */}
        <Box sx={{ px: 3, py: 2.5 }}>
          <Box display="flex" alignItems="flex-start" gap={1.5} mb={2}>
            <Icon sx={{ color: `${color}.main`, mt: 0.2, fontSize: 28 }} />
            <Typography variant="body1" color="text.primary">
              {message}
              {!isSuppression && (
                <Typography component="span" color="text.secondary" variant="body2" display="block" mt={0.5}>
                  Voulez-vous l'imprimer maintenant ?
                </Typography>
              )}
            </Typography>
          </Box>

          {/* Nb lignes */}
          {!isSuppression && dataDetails?.length > 0 && (
            <>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="caption" color="text.secondary">
                {dataDetails.length} ligne{dataDetails.length > 1 ? "s" : ""} de détail
              </Typography>
            </>
          )}
        </Box>

        {/* Actions */}
        <Divider />
        <Box sx={{ display: "flex", gap: 1.5, px: 3, py: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CloseIcon />}
            onClick={handleClose}
          >
            {isSuppression ? "Fermer" : "Non merci"}
          </Button>

          {!isSuppression && renderTemplate()}
        </Box>
      </Paper>
    </Box>
  );
};

export default Notification;
