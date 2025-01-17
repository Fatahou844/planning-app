import React from "react";
import DevisTemplate from "../DevisTemplate";
import InvoiceTemplateWithoutOR from "../InvoiceTemplateWithoutOR";
import OrdreReparationTemplate from "../OrdreReparationTemplate";
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

  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  closeButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  printButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
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
  // useEffect(() => {
  //   // Fermer automatiquement la popup après `autoCloseDelay` millisecondes
  //   const timer = setTimeout(() => {
  //     handleClose();
  //   }, autoCloseDelay);
  //   console.log("collectionName", collectionName);
  //   // Nettoyer le timer lorsqu'on démonte le composant
  //   return () => clearTimeout(timer);
  // }, [handleClose, autoCloseDelay]);

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <p>{message}. Voulez-vous l'imprimer?</p>

        {collectionName === "events" && (
          <>
            <div style={styles.buttonContainer}>
              <button style={styles.closeButton} onClick={handleClose}>
                Non
              </button>
              <button style={styles.printButton}>
                <OrdreReparationTemplate
                  editedEvent={dataEvent}
                  details={dataDetails}
                />
              </button>
            </div>
          </>
        )}

        {collectionName === "reservations" && (
          <>
            <div style={styles.buttonContainer}>
              <button style={styles.closeButton} onClick={handleClose}>
                Non
              </button>
              <button style={styles.printButton}>
                <ReservationTemplate
                  editedEvent={dataEvent}
                  details={dataDetails}
                />
              </button>
            </div>
          </>
        )}

        {collectionName === "factures" && (
          <>
            <div style={styles.buttonContainer}>
              <button style={styles.closeButton} onClick={handleClose}>
                Non
              </button>
              <button style={styles.printButton}>
                <InvoiceTemplateWithoutOR
                  NewEvent={dataEvent}
                  details={dataDetails}
                />
              </button>
            </div>
          </>
        )}

        {collectionName === "devis" && (
          <>
            <div style={styles.buttonContainer}>
              <button style={styles.closeButton} onClick={handleClose}>
                Non
              </button>
              <button style={styles.printButton}>
                <DevisTemplate editedEvent={dataEvent} details={dataDetails} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Notification;
