import { useTheme } from "@mui/material";
import DevisTemplate from "../DevisTemplate";
import InvoiceTemplateWithoutOR from "../InvoiceTemplateWithoutOR";
import OrdreReparationTemplate from "../OrdreReparationTemplate";
import ReservationTemplate from "../ReservationTemplate";

const Notification = ({
  handleClose,
  dataEvent,
  dataDetails,
  message,
  collectionName,
  autoCloseDelay = 10000,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100000,
    },
    popup: {
      backgroundColor: isDark ? theme.palette.background.paper : "#fff",
      color: isDark ? theme.palette.text.primary : "#000",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: isDark
        ? "0 2px 10px rgba(255, 255, 255, 0.1)"
        : "0 2px 10px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      minWidth: "300px",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "20px",
    },
    closeButton: {
      backgroundColor: theme.palette.error.main,
      color: "#fff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "5px",
      cursor: "pointer",
    },
    printButton: {
      backgroundColor: theme.palette.success.main,
      color: "#fff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

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

  return (
    <>
      {!message.includes("supprim") && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <p>{message}. Voulez-vous l'imprimer ?</p>
            <div style={styles.buttonContainer}>
              <button style={styles.closeButton} onClick={handleClose}>
                Non
              </button>
              <button style={styles.printButton}>{renderTemplate()}</button>
            </div>
          </div>
        </div>
      )}
      {message.includes("supprim") && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <p>{message}</p>
            <div style={styles.buttonContainer}>
              <button style={styles.closeButton} onClick={handleClose}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notification;
