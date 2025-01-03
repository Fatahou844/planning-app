import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../hooks/firebaseConfig"; // Votre configuration Firestore
import DevisTemplate from "../DevisTemplate";
import InvoiceTemplate from "../InvoiceTemplate";
import Notification from "../Notification";
import ReservationTemplate from "../ReservationTemplate";

function DocumentModal({
  open,
  onClose,
  editedEvent,
  setEditedEvent,
  collectionName,
  categories,
  onEventTriggered,
}) {
  const [details, setDetails] = useState([]);
  const [finDate, setFinDate] = useState(editedEvent?.finDate || "");

  const [invoiceExecuted, setInvoiceExecuted] = useState(false);
  const handleChildInvoice = () => {
    console.log("Une action a été exécutée dans le composant fils !");
    setInvoiceExecuted(!invoiceExecuted); // Met à jour l'état pour indiquer que l'action a été exécutée
  };
  useEffect(() => {
    if (editedEvent) {
      const fetchDetails = async () => {
        try {
          const eventDocRef = doc(db, collectionName, editedEvent.id);
          // Modifier la propriété 'isClosed' de l'objet avant la mise à jour
          editedEvent.isClosed = true;
          await updateDoc(eventDocRef, editedEvent);
        } catch (error) {
          console.error("Erreur lors de la récupération des détails :", error);
        }
      };

      fetchDetails();
    }
  }, [invoiceExecuted]);

  useEffect(() => {
    if (editedEvent) {
      const fetchDetails = async () => {
        try {
          const detailsCollectionRef = collection(
            doc(db, collectionName, editedEvent.id),
            "details"
          );
          const detailsSnapshot = await getDocs(detailsCollectionRef);
          const detailsData = detailsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDetails(detailsData);
          console.log("++++++++++++++++detailsData++++++++++++++", detailsData);
        } catch (error) {
          console.error("Erreur lors de la récupération des détails :", error);
        }
      };

      fetchDetails();
    }
  }, [editedEvent.id]);

  // Handle input change for end date
  const handleChangeFinDate = (e) => {
    const value = e.target.value;
    setFinDate(value);
    setEditedEvent((prev) => ({ ...prev, finDate: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditedEvent((prevEvent) => {
      const updatedEvent = { ...prevEvent };

      if (name === "startTime") {
        // Vérifier si le format est valide (HHMM ou vide)
        const isValid = /^\d{0,4}$/.test(value);

        if (isValid) {
          const startHour = value.slice(0, 2) || ""; // Extraire les 2 premiers caractères pour l'heure
          const startMinute = value.slice(2, 4) || ""; // Extraire les 2 derniers caractères pour les minutes

          updatedEvent.startHour = startHour; // Convertir en entier ou garder vide
          updatedEvent.startMinute = startMinute; // Convertir en entier ou garder vide
        }
      } else if (name === "endTime") {
        // Gérer le champ combiné pour l'heure de fin
        const isValid = /^\d{0,4}$/.test(value);

        if (isValid) {
          const endHour = value.slice(0, 2) || "";
          const endMinute = value.slice(2, 4) || "";

          updatedEvent.endHour = endHour; // Convertir en entier ou garder vide
          updatedEvent.endMinute = endMinute; // Convertir en entier ou garder vide
        }
      } else if (name === "category") {
        // Gérer la catégorie
        const selectedCat = categories.find((cat) => cat.id === value);
        updatedEvent.category = {
          id: selectedCat.id,
          name: selectedCat.name,
          color: selectedCat.color,
        };
      } else if (name.includes(".")) {
        // Gérer les champs imbriqués (par exemple "address.street")
        const keys = name.split(".");
        let current = updatedEvent;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            // Dernière clé, assigner la valeur
            current[key] = value;
          } else {
            // Initialiser si le sous-objet n'existe pas
            if (!current[key]) {
              current[key] = {};
            }
            current = current[key];
          }
        });
      } else {
        // Gérer les autres champs
        updatedEvent[name] = value;
      }

      return updatedEvent;
    });
  };

  // Save the updated event to Firestore
  const handleSave = async () => {
    if (editedEvent?.id) {
      try {
        // Référence du document de l'événement principal
        const eventDocRef = doc(db, collectionName, editedEvent.id);
        await updateDoc(eventDocRef, editedEvent);

        // Référence de la collection "details" sous l'événement
        const detailsCollectionRef = collection(eventDocRef, "details");

        for (const detail of details) {
          if (detail.isDeleted) {
            // Supprimer les détails marqués comme supprimés
            if (detail.id) {
              const detailDocRef = doc(detailsCollectionRef, detail.id);
              await deleteDoc(detailDocRef);
            }
          } else if (detail.id) {
            // Mettre à jour les détails existants
            const detailDocRef = doc(detailsCollectionRef, detail.id);
            await updateDoc(detailDocRef, detail);
          } else {
            // Ajouter les nouveaux détails
            await addDoc(detailsCollectionRef, detail);
          }
        }

        if (onEventTriggered) {
          onEventTriggered(); // Notifie le parent
        }

        onClose();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'événement :", error);
      }
    }
  };

  const handleCreerCollection = async (collectionName) => {
    if (editedEvent) {
      try {
        // Crée un nouveau document dans la collection principale avec les données de editedEvent
        const newEventDocRef = await addDoc(
          collection(db, collectionName),
          editedEvent
        );

        // Référence de la collection "details" sous le nouveau document
        const detailsCollectionRef = collection(newEventDocRef, "details");

        for (const detail of details) {
          if (!detail.isDeleted) {
            // Ajoute tous les détails à la nouvelle collection "details"
            await addDoc(detailsCollectionRef, detail);
          }
        }

        if (onEventTriggered) {
          onEventTriggered(); // Notifie le parent
        }

        onClose();
      } catch (error) {
        console.error("Erreur lors de la création de l'événement :", error);
      }
    }
  };

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...details];
    updatedDetails[index][field] = value;
    setDetails(updatedDetails);
  };

  const removeDetailRow = async (index) => {
    // Met à jour l'affichage en supprimant la ligne localement
    setDetails((prevDetails) => prevDetails.filter((_, i) => i !== index));

    // Récupère le détail à supprimer basé sur l'index
    const detailToDelete = details[index];

    if (detailToDelete && detailToDelete.id) {
      try {
        const eventDocRef = doc(db, collectionName, editedEvent.id);
        const detailsCollectionRef = collection(eventDocRef, "details");
        const detailDocRef = doc(detailsCollectionRef, detailToDelete.id);

        // Supprime le document dans Firestore
        await deleteDoc(detailDocRef);

        console.log(
          `Document avec l'id ${detailToDelete.id} supprimé de la base de données.`
        );
      } catch (error) {
        console.error("Erreur lors de la suppression du document :", error);
      }
    } else {
      console.warn("Aucun document trouvé pour cet index.");
    }
  };

  const handleAddDetail = () => {
    setDetails([
      ...details,
      {
        // On ne définit pas d’ID pour indiquer qu’il s’agit d’un nouvel élément
        label: "",
        quantity: 0,
        unitPrice: 0,
        discountAmount: 0,
        discountPercent: 0,
      },
    ]);
  };

  const calculateTotalTTC = () => {
    return details.reduce((total, detail) => {
      const { quantity, unitPrice, discountAmount } = detail;
      return total + (quantity * unitPrice - discountAmount);
    }, 0);
  };

  const calculateTotalHT = (totalTTC) => {
    return totalTTC / 1.2; // 20% VAT
  };

  const totalTTC = calculateTotalTTC();

  const totalHT = calculateTotalHT(totalTTC);

  let collectName = "Ordre de réparation";

  if (collectionName == "events") collectName = "Ordre de réparation";
  else if (collectionName == "devis") collectName = "devis";
  else if (collectionName == "reservations") collectName = "résa";
  else collectName = "facture";

  const [openOr, setOpenOr] = useState(false);
  const [openCreerOr, setOpenCreerOr] = useState(false);
  const [openCreerResa, setOpenCreerResa] = useState(false);

  // Fonction pour ouvrir le modal
  const handleOpenOr = () => setOpenOr(true);

  const handleOpenCreerOr = () => setOpenCreerOr(true);
  const handleOpenCreerResa = () => setOpenCreerResa(true);

  // Fonction pour fermer le modal
  const handleCloseOr = () => setOpenOr(false);
  const handleCloseCreerOr = () => setOpenCreerOr(false);

  const handleCloseCreerResa = () => setOpenCreerResa(false);

  // Fonction pour confirmer l'action
  const handleConfirmOr = () => {
    handleSave(); // Appel de la fonction addEvent
    handleCloseOr(); // Fermer le modal
    handleOpen();
  };

  const handleConfirmCreerOr = () => {
    handleCreerCollection("events"); // Appel de la fonction addEvent
    handleCloseCreerOr(); // Fermer le modal
    handleOpen();
  };

  const handleConfirmCreerResa = () => {
    handleCreerCollection("reservations"); // Appel de la fonction addEvent
    handleCloseCreerResa(); // Fermer le modal
    handleOpen();
  };

  const handleConfirmCreerFacture = () => {
    handleCreerCollection("facures"); // Appel de la fonction addEvent
    handleCloseOr(); // Fermer le modal
  };
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpen = () => {
    setNotification({
      open: true,
      message: "Modification effectué avec succès !",
      severity: "success", // Peut être "error", "warning", "info"
    });
  };

  const handleClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          width: "1200px",
          maxWidth: "none",
        },
      }}
    >
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        handleClose={handleClose}
      />
      <DialogTitle>Modification {collectName}</DialogTitle>
      {editedEvent && (
        <DialogContent>
          <Grid container spacing={2}>
            {/* Informations Client */}
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="title"
                label={"NO " + collectName}
                type="text"
                fullWidth
                value={editedEvent.title || ""}
                onChange={handleChange}
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
                disabled
              />
              {/* Autres champs d'informations client */}
              <TextField
                label="Nom"
                name="person.lastName"
                value={editedEvent.person?.lastName || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <TextField
                label="Prénom"
                name="person.firstName"
                value={editedEvent.person?.firstName || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <TextField
                label="Téléphone"
                name="person.phone"
                value={editedEvent.person?.phone || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <TextField
                label="Email"
                name="person.email"
                value={editedEvent.person?.email || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <TextField
                label="Adresse locale"
                name="person.adresse"
                value={editedEvent.person?.adresse || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <TextField
                label="Code postale"
                name="person.postale"
                value={editedEvent.person?.postale || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <TextField
                label="Ville"
                name="person.ville"
                value={editedEvent.person?.ville || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
            </Grid>

            {/* Informations Véhicule */}
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="vehicule.licensePlate"
                label="Immatriculation"
                type="text"
                fullWidth
                value={editedEvent.vehicule?.licensePlate || ""}
                onChange={handleChange}
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <TextField
                label="VIN"
                name="vehicule.vin"
                value={editedEvent.vehicule?.vin || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <TextField
                label="Modèle"
                name="vehicule.model"
                value={editedEvent.vehicule?.model || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <TextField
                label="Couleur"
                name="vehicule.color"
                value={editedEvent.vehicule?.color || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <TextField
                label="kilométrage"
                name="vehicule.kms"
                value={editedEvent.vehicule?.kms || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <TextField
                name="vehicule.controletech"
                value={editedEvent.vehicule?.controletech || ""}
                type="date"
                onChange={handleChange}
                fullWidth
                margin="normal"
                size="small"
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
            </Grid>
          </Grid>

          {/* Table pour afficher les détails */}
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table size="small" aria-label="Event Details Table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: "0.8rem", width: "40%" }}>
                    Label
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem", width: "10%" }}>
                    Quantité
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem", width: "15%" }}>
                    Prix Unitaire
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem", width: "15%" }}>
                    Remise
                  </TableCell>
                  {/* <TableCell sx={{ fontSize: "0.8rem", width: "10%" }}>
                    Remise en %
                  </TableCell> */}
                  <TableCell sx={{ fontSize: "0.8rem", width: "10%" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {details.map((detail, index) => (
                  <TableRow key={detail.id}>
                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      <TextField
                        value={detail.label}
                        onChange={(e) =>
                          handleDetailChange(index, "label", e.target.value)
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      <TextField
                        type="number"
                        value={detail.quantity}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "quantity",
                            parseInt(e.target.value, 10)
                          )
                        }
                        size="small"
                        fullWidth
                        sx={{
                          "& input": {
                            MozAppearance: "textfield", // Pour Firefox
                            textAlign: "center", // Centrer horizontalement
                          },
                          "& input[type=number]": {
                            MozAppearance: "textfield",
                          },
                          "& input[type=number]::-webkit-outer-spin-button": {
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                          "& input[type=number]::-webkit-inner-spin-button": {
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      <TextField
                        type="number"
                        value={detail.unitPrice}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "unitPrice",
                            parseFloat(e.target.value)
                          )
                        }
                        size="small"
                        fullWidth
                        sx={{
                          "& input": {
                            MozAppearance: "textfield", // Pour Firefox
                            textAlign: "center", // Centrer horizontalement
                          },
                          "& input[type=number]": {
                            MozAppearance: "textfield",
                          },
                          "& input[type=number]::-webkit-outer-spin-button": {
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                          "& input[type=number]::-webkit-inner-spin-button": {
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      <TextField
                        type="text" // Permet la saisie libre (montant ou pourcentage)
                        value={
                          detail.discountPercent !== ""
                            ? `${detail.discountPercent}%`
                            : detail.discountAmount || ""
                        } // Affiche soit le pourcentage, soit le montant
                        onChange={(e) => {
                          const input = e.target.value.trim();

                          let formattedValue = input; // Supprime le symbole %
                          detail.discountAmount = "";
                          detail.discountPercent = "";

                          let amount = parseFloat(formattedValue); // Tente de convertir en nombre

                          // Gestion des cas de saisie valides
                          if (input.includes("%") && !isNaN(amount)) {
                            // Si l'utilisateur entre un pourcentage
                            detail.discountPercent = amount; // Met à jour le pourcentage
                            detail.discountAmount = ""; // Réinitialise le montant
                          } else if (!isNaN(amount)) {
                            // Si l'utilisateur entre un montant
                            detail.discountAmount = amount; // Met à jour le montant
                            detail.discountPercent = ""; // Réinitialise le pourcentage
                          } else {
                            // Si la saisie est invalide
                            detail.discountAmount = "";
                            detail.discountPercent = "";
                          }

                          // Mise à jour de la valeur brute pour affichage
                          detail.inputValue = input;

                          // Appelle la fonction pour notifier le changement
                          handleDetailChange(
                            index,
                            "discountAmount",
                            detail.discountAmount
                          );
                        }}
                        size="small"
                        fullWidth
                        sx={{
                          "& input": {
                            MozAppearance: "textfield", // Pour Firefox
                            textAlign: "center", // Centrer horizontalement
                          },
                          "& input::-webkit-outer-spin-button": {
                            WebkitAppearance: "none", // Désactive les spinners dans Chrome, Safari, Edge
                            margin: 0,
                          },
                          "& input::-webkit-inner-spin-button": {
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      <Button onClick={() => removeDetailRow(index)}>
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            onClick={handleAddDetail}
            color="primary"
            variant="contained"
            sx={{ marginTop: 2 }}
          >
            Ajouter un Détail
          </Button>

          {/* Display totals */}
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Total TTC: {totalTTC.toFixed(2)} €
          </Typography>
          <Typography variant="h6">Total HT: {totalHT.toFixed(2)} €</Typography>
          <Typography variant="h6">
            Acompte :{" "}
            {editedEvent?.details?.acompte
              ? parseFloat(editedEvent?.details?.acompte).toFixed(2)
              : "0.00"}{" "}
            €
          </Typography>

          <Grid container spacing={2} item xs={12} md={12}>
            {/* Colonne 1: Infos  sur les travaux */}
            <Grid item xs={12} md={6}>
              {/* <Typography variant="h6">
                          Informations Événement
                        </Typography> */}

              <TextField
                label="Travaux"
                name="details.workDescription"
                value={editedEvent.details?.workDescription}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={16}
                sx={{
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <TextField
                name="details.price"
                type="number"
                value={editedEvent.details?.price}
                placeholder="Prix"
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                size="small"
                sx={{
                  display: "none",
                  height: "30px",
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                  "& input[type=number]": {
                    MozAppearance: "textfield",
                  },
                  "& input[type=number]::-webkit-outer-spin-button": {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
                  "& input[type=number]::-webkit-inner-spin-button": {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
                }}
              />
            </Grid>

            {/* Colonne 2: Infos sur l'événement */}
            <Grid item xs={12} md={6}>
              {/* <Typography variant="h6">
                          Détails de l'événement
                        </Typography> */}

              <Box
                sx={{
                  display: "flex",
                  gap: "1rem", // Espacement entre les champs
                  marginBottom: "0.9rem",
                }}
              >
                <TextField
                  label="Opérateur"
                  name="operator"
                  value={editedEvent.operator}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  size="small"
                  sx={{
                    height: "30px",
                    "& .MuiInputBase-root": { fontSize: "0.8rem" },
                    "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                  }}
                />
                <TextField
                  label="Réceptionnaire"
                  name="receptor"
                  value={editedEvent.receptor}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  size="small"
                  sx={{
                    height: "30px",
                    "& .MuiInputBase-root": { fontSize: "0.8rem" },
                    "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      )}
      <DialogActions>
        {collectionName === "reservations" && (
          <>
            <Button onClick={onClose} color="primary">
              Annuler
            </Button>{" "}
            <Button onClick={onClose} color="secondary">
              Supprimer
            </Button>{" "}
            <Button onClick={handleOpenOr} color="primary" variant="contained">
              Modifier
            </Button>
            <ReservationTemplate editedEvent={editedEvent} details={details} />{" "}
            <InvoiceTemplate
              editedEvent={editedEvent}
              details={details}
              onInvoiceExecuted={handleChildInvoice}
            />{" "}
            <Button
              onClick={handleOpenCreerOr}
              color="primary"
              variant="contained"
            >
              Créer OR
            </Button>{" "}
          </>
        )}
        {collectionName === "devis" && (
          <>
            <Button onClick={onClose} color="primary">
              Annuler
            </Button>{" "}
            <Button onClick={onClose} color="secondary">
              Supprimer
            </Button>{" "}
            <Button onClick={handleOpenOr} color="primary" variant="contained">
              Modifier
            </Button>
            <Button
              onClick={handleConfirmCreerOr}
              color="primary"
              variant="contained"
            >
              Créer OR
            </Button>{" "}
            <Button
              onClick={handleOpenCreerResa}
              color="primary"
              variant="contained"
            >
              Créer un Resa
            </Button>
            <DevisTemplate
              editedEvent={editedEvent}
              details={details}
              onInvoiceExecuted={handleChildInvoice}
            />
            <InvoiceTemplate
              editedEvent={editedEvent}
              details={details}
              onInvoiceExecuted={handleChildInvoice}
            />{" "}
          </>
        )}
        {collectionName === "factures" && (
          <>
            <Button onClick={onClose} color="primary">
              Annuler
            </Button>{" "}
            <Button onClick={handleOpenOr} color="primary" variant="contained">
              Modifier
            </Button>
            <InvoiceTemplate
              editedEvent={editedEvent}
              details={details}
              onInvoiceExecuted={handleChildInvoice}
            />{" "}
          </>
        )}
        <Modal
          open={openOr}
          onClose={handleCloseOr}
          aria-labelledby="confirmation-modal-title"
          aria-describedby="confirmation-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography
              id="confirmation-modal-title"
              variant="h6"
              component="h2"
            >
              Confirmation
            </Typography>
            <Typography
              id="confirmation-modal-description"
              sx={{ mt: 2, mb: 4 }}
            >
              Voulez vous appliquer les modifications?
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCloseOr}
              >
                Non
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmOr}
              >
                Oui
              </Button>
            </Box>
          </Box>
        </Modal>
        <Modal
          open={openCreerOr}
          onClose={handleCloseCreerOr}
          aria-labelledby="confirmation-modal-title"
          aria-describedby="confirmation-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography
              id="confirmation-modal-title"
              variant="h6"
              component="h2"
            >
              Confirmation
            </Typography>
            <Typography
              id="confirmation-modal-description"
              sx={{ mt: 2, mb: 4 }}
            >
              Voulez vous creér un OR?
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCloseCreerOr}
              >
                Non
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmCreerOr}
              >
                Oui
              </Button>
            </Box>
          </Box>
        </Modal>
        <Modal
          open={openCreerResa}
          onClose={handleCloseCreerResa}
          aria-labelledby="confirmation-modal-title"
          aria-describedby="confirmation-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography
              id="confirmation-modal-title"
              variant="h6"
              component="h2"
            >
              Confirmation
            </Typography>
            <Typography
              id="confirmation-modal-description"
              sx={{ mt: 2, mb: 4 }}
            >
              Voulez vous creér une réservation?
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCloseCreerResa}
              >
                Non
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmCreerResa}
              >
                Oui
              </Button>
            </Box>
          </Box>
        </Modal>
      </DialogActions>
    </Dialog>
  );
}

export default DocumentModal;
