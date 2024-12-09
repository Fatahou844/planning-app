import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
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
import InvoiceTemplate from "../InvoiceTemplate";

function EventDialog({
  open,
  onClose,
  editedEvent,
  setEditedEvent,
  handleEventDetailClick,
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
    console.log("########### editedEvent ##############", editedEvent);
    if (editedEvent) {
      const fetchDetails = async () => {
        try {
          const eventDocRef = doc(db, "events", editedEvent.id);
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
            doc(db, "events", editedEvent.id),
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
        const eventDocRef = doc(db, "events", editedEvent.id);
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
        const eventDocRef = doc(db, "events", editedEvent.id);
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

  const invoiceData = {
    orderNumber: "12345",
    companyInfo: {
      name: "Garage XYZ",
      address: "123 Rue Exemple, Casablanca",
      phone: "+212 5 20 30 40 50",
      email: "contact@garagexyz.com",
    },
    vehicle: {
      model: "Peugeot 208",
      motor: "1.6L",
      vin: "ABC1234567890XYZ",
      km: "15000",
      color: "Noir",
    },
    client: {
      name: "Mohamed Laarbi",
      address: "456 Rue Client, Casablanca",
      phone: "+212 6 12 34 56 78",
      email: "mohamed.laarbi@email.com",
      rdv: "15 décembre 2024",
    },
    items: [
      {
        description: "Changement d'huile",
        unitPriceHT: 20.0,
        unitPriceTTC: 24.0,
        quantity: 2,
        discount: 10,
      },
      {
        description: "Filtre à air",
        unitPriceHT: 10.0,
        unitPriceTTC: 12.0,
        quantity: 1,
        discount: 5,
      },
    ],
    totals: {
      totalHT: 50.0,
      tva: 10.0,
      totalTTC: 60.0,
    },
    observations:
      "N'oubliez pas de vérifier les niveaux de liquide tous les 5000 km.",
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
      <DialogTitle>Modifier l'Ordre de RDV</DialogTitle>
      {editedEvent && (
        <DialogContent>
          <Grid container spacing={2}>
            {/* Informations Client */}
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="title"
                label="O.R"
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

              <Typography variant="body1">Date de l'événement</Typography>
              <TextField
                name="date"
                type="date"
                value={editedEvent.date}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                size="small"
                sx={{
                  height: "30px",
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <Typography variant="body1">Date de fin</Typography>
              <TextField
                name="finDate"
                type="date"
                value={finDate}
                onChange={handleChangeFinDate}
                fullWidth
                margin="normal"
                required
                size="small"
                sx={{
                  height: "30px",
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    name="startTime"
                    placeholder="HHMM (ex: 0700)"
                    value={`${editedEvent.startHour || ""}${
                      editedEvent.startMinute || ""
                    }`}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    size="small"
                    sx={{
                      height: "30px",
                      "& .MuiInputBase-root": { fontSize: "0.8rem" },
                      "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    name="endTime"
                    placeholder="HHMM (ex: 1900)"
                    value={`${editedEvent.endHour || ""}${
                      editedEvent.endMinute || ""
                    }`}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    size="small"
                    sx={{
                      height: "30px",
                      "& .MuiInputBase-root": { fontSize: "0.8rem" },
                      "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                    }}
                  />
                </Grid>
              </Grid>
              <TextField
                select
                label="Catégorie"
                name="category"
                value={editedEvent?.category?.id}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                size="small"
                sx={{
                  height: "30px",
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              >
                {categories.map((categoryGroup, index) => (
                  <MenuItem
                    key={index}
                    value={categoryGroup.id}
                    sx={{
                      fontSize: "0.8rem",
                      minHeight: "30px",
                    }}
                  >
                    {categoryGroup.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Annuler
        </Button>
        <InvoiceTemplate
          editedEvent={editedEvent}
          details={details}
          onInvoiceExecuted={handleChildInvoice}
        />{" "}
        <Button onClick={handleSave} color="primary" variant="contained">
          Modifier
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EventDialog;
