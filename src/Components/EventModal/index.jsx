import {
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
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../hooks/firebaseConfig"; // Votre configuration Firestore

function EventDialog({
  open,
  onClose,
  editedEvent,
  setEditedEvent,
  handleEventDetailClick,
  categories,
}) {
  const [details, setDetails] = useState([]);
  const [finDate, setFinDate] = useState(editedEvent?.finDate || "");

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
        } catch (error) {
          console.error("Erreur lors de la récupération des détails :", error);
        }
      };

      fetchDetails();
    }
  }, [editedEvent]);

  // Handle input change for end date
  const handleChangeFinDate = (e) => {
    const value = e.target.value;
    setFinDate(value);
    setEditedEvent((prev) => ({ ...prev, finDate: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent((prevEvent) => {
      const keys = name.split(".");
      let updatedEvent = { ...prevEvent };

      // Assurez-vous que la structure de l'objet est bien initialisée
      keys.reduce((acc, key, idx) => {
        // Si c'est le dernier élément, définissez la valeur
        if (idx === keys.length - 1) {
          // Convertir en entier si nécessaire
          if (
            key === "startHour" ||
            key === "endHour" ||
            key === "startMinute" ||
            key === "endMinute"
          ) {
            acc[key] = parseInt(value, 10); // Convertit en entier
          } else {
            acc[key] = value; // Assigne simplement la valeur
          }
        } else {
          // Si la clé n'existe pas, initialisez-la comme un objet vide
          if (!acc[key]) {
            acc[key] = {};
          }
        }
        return acc[key];
      }, updatedEvent);

      return updatedEvent;
    });
  };

  // // Save the updated event to Firestore
  // const handleSave = async () => {
  //   if (editedEvent?.id) {
  //     try {
  //       const eventDocRef = doc(db, "events", editedEvent.id);
  //       await updateDoc(eventDocRef, editedEvent);
  //       onClose();
  //     } catch (error) {
  //       console.error("Erreur lors de la sauvegarde de l'événement :", error);
  //     }
  //   }
  // };
  // Save the updated event to Firestore
  const handleSave = async () => {
    if (editedEvent?.id) {
      try {
        const eventDocRef = doc(db, "events", editedEvent.id);
        await updateDoc(eventDocRef, editedEvent);

        const detailsCollectionRef = collection(eventDocRef, "details");

        for (const detail of details) {
          const detailDocRef = doc(detailsCollectionRef, detail.id);

          if (detail.isDeleted) {
            await deleteDoc(detailDocRef);
          } else {
            await updateDoc(detailDocRef, detail);
          }
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

  const handleAddDetail = () => {
    setDetails([
      ...details,
      {
        id: Date.now(),
        label: "",
        quantity: 0,
        unitPrice: 0,
        discountAmount: 0,
        discountPercent: 0,
      },
    ]);
  };
  const calculateTotalHT = () => {
    return details.reduce((total, detail) => {
      const { quantity, unitPrice, discountAmount } = detail;
      return total + (quantity * unitPrice - discountAmount);
    }, 0);
  };

  const calculateTotalTTC = (totalHT) => {
    return totalHT * 1.2; // 20% VAT
  };

  const totalHT = calculateTotalHT();
  const totalTTC = calculateTotalTTC(totalHT);
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
                required
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
                required
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
                  <TableCell sx={{ fontSize: "0.8rem" }}>Label</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>Quantité</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>
                    Prix Unitaire
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>
                    Montant Réduction
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>
                    Pourcentage Réduction
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>Actions</TableCell>
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
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        size="small"
                        fullWidth
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
                            parseFloat(e.target.value) || 0
                          )
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      <TextField
                        type="number"
                        value={detail.discountAmount}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "discountAmount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      <TextField
                        type="number"
                        value={detail.discountPercent}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "discountPercent",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      <Button
                        onClick={() =>
                          handleDetailChange(index, "isDeleted", true)
                        }
                      >
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
            Total HT: {totalHT.toFixed(2)} €
          </Typography>
          <Typography variant="h6">
            Total TTC: {totalTTC.toFixed(2)} €
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
                required
                multiline
                rows={4}
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
                  height: "30px",
                  "& .MuiInputBase-root": { fontSize: "0.8rem" },
                  "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                }}
              />
            </Grid>

            {/* Colonne 2: Infos sur l'événement */}
            <Grid item xs={12} md={6}>
              {/* <Typography variant="h6">
                          Détails de l'événement
                        </Typography> */}
              <TextField
                label="Opérateur"
                name="operator"
                value={editedEvent.operator}
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
                    label="Heure de début"
                    name="startHour"
                    type="number"
                    value={editedEvent.startHour}
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
                    label="Minutes de début"
                    name="startMinute"
                    type="number"
                    value={editedEvent.startMinute}
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
                    label="Heure de fin"
                    name="endHour"
                    type="number"
                    value={editedEvent.endHour}
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
                    label="Minutes de fin"
                    name="endMinute"
                    type="number"
                    value={editedEvent.endMinute}
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
        <Button onClick={handleSave} color="primary" variant="contained">
          Modifier
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EventDialog;
