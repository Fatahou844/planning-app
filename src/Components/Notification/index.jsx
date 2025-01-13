import React, { useEffect } from "react";
import ReservationTemplate from "../ReservationTemplate";
// Styles simples
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
    zIndex: 1000,
  },
  popup: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    minWidth: "300px",
  },
  closeButton: {
    marginTop: "10px",
    padding: "5px 10px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
const Notification = ({
  handleClose,
  dataEvent,
  dataDetails,
  message,
  collectionName,
  autoCloseDelay = 10000,
}) => {
  useEffect(() => {
    // Fermer automatiquement la popup après `autoCloseDelay` millisecondes
    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);
    console.log("collectionName", collectionName);
    // Nettoyer le timer lorsqu'on démonte le composant
    return () => clearTimeout(timer);
  }, [handleClose, autoCloseDelay]);

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <p>{message}</p>
        {collectionName !== "reservations" && (
          <button style={styles.closeButton} onClick={handleClose}>
            Fermer
          </button>
        )}
        {collectionName === "reservations" && (
          <>
            <button style={styles.closeButton} onClick={handleClose}>
              Non
            </button>
            <ReservationTemplate
              editedEvent={dataEvent}
              details={dataDetails}
            />{" "}
          </>
        )}
      </div>
    </div>
  );
};

export default Notification;
