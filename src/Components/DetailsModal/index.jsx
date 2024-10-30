import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../hooks/firebaseConfig"; // Votre configuration Firestore
import saveEventWithDetails from "./saveEventWithDetails"; // Assure-toi d'importer la fonction correctement
const DetailsModal = ({ open, onClose, event }) => {
  const [lines, setLines] = useState([{ comment: "", price: "" }]);

  const [newLine, setNewLine] = useState(false);

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...lines];
    updatedLines[index][field] = value;
    setLines(updatedLines);
  };

  const addNewLine = () => {
    setLines([...lines, { comment: "", price: "" }]);
    setNewLine(true);
  };

  // Fonction pour supprimer une ligne dans Firestore et dans l'état local
  const removeLine = async (index, lineId) => {
    try {
      // Supprime la ligne dans Firestore
      const lineDocRef = doc(db, "events", event.id, "details", lineId);
      await deleteDoc(lineDocRef);
      console.log("Ligne supprimée avec succès de Firestore");

      // Met à jour l'état local après suppression dans Firestore
      const updatedLines = lines.filter((_, i) => i !== index);
      setLines(updatedLines);
    } catch (error) {
      console.error("Erreur lors de la suppression de la ligne:", error);
    }
  };
  // Calcul du total des prix
  const calculateTotal = () => {
    return lines.reduce(
      (total, line) => total + (parseFloat(line.price) || 0),
      0
    );
  };
  const fetchDetails = async (eventId) => {
    const detailsRef = collection(db, "events", eventId, "details");
    const querySnapshot = await getDocs(detailsRef); // Pas de `where`
    const fetchedLines = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("fetchedLines", fetchedLines);

    setLines(fetchedLines);
  };

  // Utilisez useEffect pour récupérer les détails lorsque le modal est ouvert
  useEffect(() => {
    if (open && event) {
      fetchDetails(event.id);
    }
  }, [open, event]);

  // Enregistre les détails dans Firestore et ferme le dialogue
  const handleSave = async () => {
    try {
      // Appelle la fonction pour enregistrer les détails dans Firestore
      await saveEventWithDetails(event.eventId, lines);
      console.log(
        "Détails enregistrés avec succès pour l'événement:",
        event.id
      );
      // Calculer le total et mettre à jour l'événement principal
      const total = calculateTotal();
      await updateEventTotalPrice(total);
      onClose(); // Ferme le modal après l'enregistrement
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des détails:", error);
    }
  };

  // Fonction pour mettre à jour une ligne spécifique dans Firestore
  const handleUpdateLine = async (index) => {
    const line = lines[index];
    try {
      // Référence au document de la ligne dans la sous-collection
      const lineRef = doc(db, "events", event.id, "details", line.id);

      // Mettre à jour la ligne dans Firestore
      await updateDoc(lineRef, {
        comment: line.comment,
        price: parseFloat(line.price) || 0,
      });
      console.log("Ligne mise à jour:", line);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la ligne:", error);
    }
  };

  // Met à jour le prix total dans le document principal de l'événement
  const updateEventTotalPrice = async (totalPrice) => {
    try {
      const eventDocRef = doc(db, "events", event.id);
      await updateDoc(eventDocRef, { "details.price": totalPrice });
      console.log("Total mis à jour avec succès dans l'événement principal");
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du total de l'événement:",
        error
      );
    }
  };

  // Fonction d'impression
  const handlePrint = () => {
    const printableContent = `
      <html>
        <head>
          <title>Devis OR ${event.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Détails du Devis OR ${event.title}</h2>
          <table>
            <thead>
              <tr>
                <th>Commentaire</th>
                <th>Prix (€)</th>
              </tr>
            </thead>
            <tbody>
              ${lines
                .map(
                  (line) => `
                <tr>
                  <td>${line.comment}</td>
                  <td>${parseFloat(line.price).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <p class="total">Total : ${calculateTotal().toFixed(2)} €</p>
        </body>
      </html>
    `;

    // Ouvrir une nouvelle fenêtre pour imprimer
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(printableContent);
    printWindow.document.close();
    printWindow.print();
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Détails du Devis OR {event.title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: "0.5rem" }}>
          {lines.map((line, index) => (
            <Grid
              container
              spacing={1}
              key={index}
              alignItems="center"
              sx={{ marginBottom: "5px" }}
            >
              <Grid item xs={4}>
                <TextField
                  label="Nom de l'opération"
                  value={line.comment}
                  onChange={(e) =>
                    handleLineChange(index, "comment", e.target.value)
                  }
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": { fontSize: "0.8rem" },
                    "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Prix"
                  type="number"
                  value={line.price}
                  onChange={(e) =>
                    handleLineChange(index, "price", e.target.value)
                  }
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": { fontSize: "0.8rem" },
                    "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleUpdateLine(index)}
                  fullWidth
                  sx={{ height: "37px", fontSize: "0.7rem" }}
                >
                  Modifier
                </Button>
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => removeLine(index, line.id)}
                  fullWidth
                  sx={{
                    height: "37px",
                    fontSize: "0.7rem", // Ajuste la taille de la police du bouton
                  }}
                >
                  Supprimer
                </Button>
              </Grid>
            </Grid>
          ))}

          <Grid item xs={6}>
            <Button
              variant="outlined"
              onClick={addNewLine}
              fullWidth
              align="right"
            >
              Ajouter une nouvelle ligne
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" align="right" sx={{ mt: 2 }}>
              Total : {calculateTotal().toFixed(2)} €
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Annuler
        </Button>
        <Button onClick={handleSave} color="primary" disabled={!newLine}>
          Enregistrer
        </Button>
        <Button onClick={handlePrint} color="primary">
          Imprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailsModal;
