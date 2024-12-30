import { Alert, Snackbar } from "@mui/material";
import React from "react";

const Notification = ({ open, handleClose, message, severity }) => {
  const handleSnackbarClose = (event, reason) => {
    // Ignorer la fermeture si elle est due à un clic en dehors de la Snackbar
    if (reason === "clickaway") return;
    handleClose(); // Exécuter la fonction passée en prop
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={9000} // Temps avant fermeture automatique (en ms)
      onClose={handleSnackbarClose} // Appeler cette fonction quand la Snackbar se ferme
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={handleSnackbarClose}
        severity={severity || "success"}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
