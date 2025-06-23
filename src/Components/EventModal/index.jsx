import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
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
import { useEffect, useState } from "react";
import { useAxios } from "../../utils/hook/useAxios";
import InvoiceTemplate from "../InvoiceTemplate";
import Notification from "../Notification";
import OrdreReparationTemplate2 from "../OrdreReparationTemplate2";

function EventDialog({
  open,
  onClose,
  editedEvent,
  setEditedEvent,
  handleEventDetailClick,
  categories,
  users,
  onEventTriggered,
  onFactureReceive,
}) {
  const [details, setDetails] = useState([]);
  const [facture, setFacture] = useState(null);
  const [vehicleUpdated, setVehicleUpdated] = useState(false);

  const [Vehicle, setVehicle] = useState(editedEvent?.Vehicle);

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({
      ...prev,
      [name]: value,
    }));
    setVehicleUpdated(true);
  };

  const axios = useAxios();

  console.log("Parent : Reçoit onFactureReceive", onFactureReceive);

  const handleFactureGenerated = (facture) => {
    if (onFactureReceive) {
      onFactureReceive(facture);
      console.log(
        "Facture reçue dans DocumentModal handleFactureGenerated handleFactureGenerated:",
        facture
      );
      setFacture(facture);
    } // Envoie la facture au Grand-parent (Planning)
    else {
      console.error(
        "❌ ERREUR : onFactureGenerated  est undefined dans le Child !"
      );
    }
  };
  const [invoiceExecuted, setInvoiceExecuted] = useState(false);
  const handleChildInvoice = () => {
    console.log("Une action a été exécutée dans le composant fils !");
    setInvoiceExecuted(!invoiceExecuted); // Met à jour l'état pour indiquer que l'action a été exécutée
  };

  useEffect(() => {
    if (editedEvent) {
      const updateEvent = async () => {
        console.log("Début de la mise à jour des documents...");

        const tasks = [
          { collection: "orders", id: editedEvent.id },
          { collection: "reservations", id: editedEvent.id },
          { collection: "devis", id: editedEvent.id },
        ];

        const updateTasks = tasks.map(async (task) => {
          try {
            console.log(
              `🔁 Mise à jour en cours pour ${task.collection} (ID: ${task.id})...`
            );
            await axios.put(`/${task.collection}/${task.id}`, {
              isClosed: true,
            });
            console.log(
              `✅ Mise à jour réussie pour ${task.collection} (ID: ${task.id})`
            );
          } catch (error) {
            console.error(
              `❌ Erreur lors de la mise à jour de ${task.collection} (ID: ${task.id}) :`,
              error
            );
          }
        });

        const results = await Promise.allSettled(updateTasks);
        results.forEach((result, index) => {
          const { collection } = tasks[index];
          if (result.status === "fulfilled") {
            console.log(`✅ ${collection} a bien été mis à jour.`);
          } else {
            console.error(
              `❌ Échec de la mise à jour pour ${collection} :`,
              result.reason
            );
          }
        });
        console.log("Mise à jour des documents terminée.");
      };

      updateEvent();
    }
  }, [invoiceExecuted, facture]);

  const [operator, setOperator] = useState({});
  const [receptionist, setReceptionist] = useState({});

  useEffect(() => {
    if (editedEvent) {
      console.log(
        "*****************************editedEvent********************",
        editedEvent
      );
      const fetchDetails = async () => {
        try {
          const initialDetails = editedEvent.Details.map((item) => ({
            ...item,
            quantityInput: item.quantity?.toString() ?? "",
            unitPriceInput: item.unitPrice?.toString() ?? "",
          }));

          const initialDetails2 = initialDetails.map((item) => {
            let inputValue = "";

            if (item.discountPercent && item.discountPercent !== "") {
              inputValue = `${item.discountPercent}%`;
            } else if (item.discountAmount && item.discountAmount !== "") {
              inputValue = String(item.discountAmount);
            }

            return {
              ...item,
              inputValue,
            };
          });
          setDetails(initialDetails2);
          // setDetails(editedEvent.Details);

          const operator = await axios.get(
            `/users/userid/${editedEvent.operatorId}`
          );
          const receptionist = await axios.get(
            `/users/userid/${editedEvent.receptionistId}`
          );
          setReceptionist(receptionist.data);
          setOperator(operator.data);
        } catch (error) {
          console.error("Erreur lors de la récupération des détails :", error);
        }
      };
      setVehicle(editedEvent?.Vehicle);

      fetchDetails();
    }
  }, [editedEvent.id]);

  // Handle input change for end date

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
        updatedEvent.Category = {
          id: selectedCat.id,
          name: selectedCat.name,
          color: selectedCat.color,
        };
      } else if (name === "operator") {
        // Gérer la catégorie
        const selectedOperator = users.find((user) => user.id === value);
        updatedEvent.operatorId = selectedOperator.id;
      } else if (name === "receptionist") {
        // Gérer la catégorie
        const selectedRecept = users.find((user) => user.id === value);
        updatedEvent.receptionistId = selectedRecept.id;
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

  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  const handleSave = async () => {
    if (editedEvent?.id) {
      try {
        const order = {
          date: editedEvent.date,
          endDate: editedEvent.endDate,
          startHour: parseInt(editedEvent.startHour),
          startMinute: parseInt(editedEvent.startMinute),
          endHour: parseInt(editedEvent.endHour),
          endMinute: parseInt(editedEvent.endMinute),
          categoryId: editedEvent?.Category?.id,
          operatorId: editedEvent?.operatorId,
          receptionistId: editedEvent?.receptionistId,
          clientId: editedEvent.clientId,
          vehicleId: editedEvent.vehicleId,
          notes: editedEvent.notes,
          garageId: getCurrentUser().garageId,
        };
        // 1. Mettre à jour l'événement principal (order)
        await axios.put(`/orders/${editedEvent.id}`, order);

        // 2. Traiter les lignes de détails
        for (const detail of details) {
          if (detail.isDeleted && detail.id) {
            // Supprimer le détail
            await axios.deleteData(`/details/${detail.id}`);
          } else if (detail.id) {
            // Mettre à jour le détail existant
            await axios.put(`/details/${detail.id}`, detail);
          } else {
            // Ajouter un nouveau détail
            await axios.post(`/details`, {
              ...detail,
              orderId: editedEvent.id, // Lier le nouveau détail à l'order
              documentType: "Order",
            });
          }
        }

        if (vehicleUpdated) {
          try {
            await axios.put(`/vehicles/${editedEvent.vehicleId}`, {
              mileage: Vehicle.mileage,
              lastCheck: Vehicle.lastCheck,
            });
            console.log("Véhicule mis à jour avec succès");
          } catch (err) {
            console.error("Erreur lors de la mise à jour du véhicule :", err);
          }
        }

        if (onEventTriggered) {
          onEventTriggered(); // Notifie le parent
        }

        onClose(); // Ferme le formulaire/modal
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'événement :", error);
      }
    }
  };

  const handleDelete = async (eventId) => {
    try {
      if (!eventId) {
        console.warn("Aucun ID d'événement fourni pour la suppression.");
        return;
      }

      // 1. Récupérer les détails liés à l'ordre

      const associatedDetails = editedEvent?.Details;

      // 2. Supprimer tous les détails (si il y en a)
      const deleteDetailPromises = associatedDetails.map((detail) =>
        axios.deleteData(`/details/${detail.id}`)
      );
      await Promise.all(deleteDetailPromises);

      // 3. Supprimer l'ordre principal
      await axios.deleteData(`/orders/${eventId}`);

      console.log(
        `Événement avec l'ID ${eventId} et ses détails ont été supprimés avec succès.`
      );
      setNotification({
        open: true,
        message: "l'OR " + editedEvent.id + " a été supprimé",
        severity: "success",
      });

      handleCloseOrSup();
      handleCloseOr();

      if (onEventTriggered) {
        onEventTriggered();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement :", error);
      setNotification({
        open: true,
        message: "Erreur lors de la suppression de l'OR",
        severity: "error",
      });
    }
  };

  // const handleDetailChange = (index, field, value) => {
  //   const updatedDetails = [...details];
  //   updatedDetails[index][field] = value;
  //   setDetails(updatedDetails);
  // };
  const handleDetailChange = (index, field, rawValue) => {
    const updatedDetails = [...details];

    const detail = updatedDetails[index];

    const raw = String(rawValue).trim(); // 🔁 conversion propre
    const normalizedValue = raw.replace(",", ".");
    // Toujours mettre à jour ce que l'utilisateur tape

    if (field === "quantity" || field === "unitPrice") {
      updatedDetails[index][`${field}Input`] = raw;
      const numericValue = parseFloat(normalizedValue);
      updatedDetails[index][field] = !isNaN(numericValue) ? numericValue : 0;
    } else if (field === "discountInput") {
      detail.inputValue = raw;

      // Réinitialiser d'abord
      detail.discountAmount = "";
      detail.discountPercent = "";

      const cleaned = normalizedValue.replace("%", "");
      const value = parseFloat(cleaned);

      if (normalizedValue.includes("%") && !isNaN(value)) {
        detail.discountPercent = value;
      } else if (!isNaN(value)) {
        detail.discountAmount = value;
      }

      // detail.inputValue = raw;
      // updatedDetails[index].inputValue = value;
    } else {
      updatedDetails[index][field] = raw;
    }

    setDetails(updatedDetails);
  };

  const removeDetailRow = async (index) => {
    // Récupère le détail à supprimer avant de modifier le state
    const detailToDelete = details[index];

    // Met à jour l'affichage en supprimant la ligne localement
    setDetails((prevDetails) => prevDetails.filter((_, i) => i !== index));

    // Si le détail est déjà en base, on le supprime
    if (detailToDelete && detailToDelete.id) {
      try {
        await axios.deleteData(`/details/${detailToDelete.id}`);

        console.log(
          `Détail avec l'id ${detailToDelete.id} supprimé de la base de données.`
        );
      } catch (error) {
        console.error("Erreur lors de la suppression du détail :", error);
      }
    } else {
      console.warn(
        "Aucun ID trouvé pour ce détail, suppression uniquement locale."
      );
    }
  };

  const handleAddDetail = () => {
    setDetails([
      ...details,
      {
        label: "",
        quantity: 0,
        quantityInput: "",
        unitPrice: 0,
        unitPriceInput: "",
        discountAmount: "",
        discountPercent: "",
        inputValue: "",
      },
    ]);
  };

  const [openOr, setOpenOr] = useState(false);

  const [openOrSup, setOpenOrSup] = useState(false);

  // Fonction pour ouvrir le modal
  const handleOpenOr = () => setOpenOr(true);

  // Fonction pour fermer le modal
  const handleCloseOr = () => setOpenOr(false);

  const handleOpenOrSup = () => setOpenOrSup(true);
  const handleCloseOrSup = () => setOpenOrSup(false);

  // Fonction pour confirmer l'action
  const handleConfirmOr = () => {
    handleSave(); // Appel de la fonction addEvent
    handleCloseOr(); // Fermer le modal
    handleOpen();
  };

  const handleConfirmOrSup = () => {
    handleDelete(editedEvent.id); // Appel de la fonction addEvent
    handleCloseOrSup(); // Fermer le modal
    handleOpen();
    onClose();
  };

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpen = () => {
    setNotification({
      open: true,
      message: "Ordre de Réparation " + editedEvent.id + " modifié !",
      severity: "success", // Peut être "error", "warning", "info"
    });
    handleShowPopup();
  };

  const calculateLineTotal = (detail) => {
    let discount = 0;

    if (detail.discountPercent > 0) {
      // Priorité au pourcentage
      discount =
        detail.unitPrice * detail.quantity * (detail.discountPercent / 100);
    } else if (detail.discountAmount > 0) {
      // Sinon, utilise le montant fixe
      discount = detail.discountAmount;
    }

    // Calcul du total après remise
    return detail.quantity * detail.unitPrice - discount;
  };
  const totalTTC = details?.reduce(
    (sum, detail) => sum + calculateLineTotal(detail),
    0
  );
  const totalHT = totalTTC / 1.2; // Ajouter 20% de TVA

  const [showPopup, setShowPopup] = useState(false);

  const handleShowPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    console.log("fermeture du popup");
  };

  // Fonction qui sera appelée par l'enfant pour envoyer la facture
  const handleFactureReceived = (factureData) => {
    setFacture(factureData);
    console.log("Facture reçue du child:", factureData);
  };

  return (
    <>
      {showPopup && (
        <Notification
          message={notification.message}
          handleClose={handleClosePopup}
          collectionName="events"
          dataEvent={editedEvent}
          dataDetails={details}
        />
      )}

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
        <DialogTitle>Modifier l'Ordre de Réparation</DialogTitle>
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
                  value={editedEvent.id || ""}
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
                  value={editedEvent.Client?.name || ""}
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
                  value={editedEvent.Client?.firstName || ""}
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
                  value={editedEvent.Client?.phone || ""}
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
                  value={editedEvent.Client?.email || ""}
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
                  label="Adresse"
                  name="person.adresse"
                  value={editedEvent.Client?.adress || ""}
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
                  label="Code postal"
                  name="person.postale"
                  value={editedEvent.Client?.postalCode || ""}
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
                  value={editedEvent.Client?.city || ""}
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
                  value={editedEvent.Vehicle?.plateNumber || ""}
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
                  value={editedEvent.Vehicle?.vin || ""}
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
                  value={editedEvent.Vehicle?.model || ""}
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
                  value={editedEvent.Vehicle?.color || ""}
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
                  name="mileage"
                  value={Vehicle?.mileage || ""}
                  onChange={handleVehicleChange}
                  fullWidth
                  margin="normal"
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": { fontSize: "0.8rem" },
                    "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                  }}
                />
                <TextField
                  name="lastCheck"
                  value={Vehicle?.lastCheck || ""}
                  type="date"
                  onChange={handleVehicleChange}
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
                    <TableCell sx={{ fontSize: "0.8rem", width: "60%" }}>
                      Libellé / travaux / articles
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", width: "10%" }}>
                      Quantité
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", width: "10%" }}>
                      Prix Unitaire
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", width: "10%" }}>
                      Remise
                    </TableCell>
                    {/* <TableCell sx={{ fontSize: "0.8rem", width: "10%" }}>
                    Remise en %
                  </TableCell> */}
                    <TableCell style={{ width: "10%", textAlign: "center" }}>
                      Total
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", width: "10%" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details &&
                    details.map((detail, index) => (
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
                            type="text"
                            value={
                              detail.quantityInput ?? detail.quantity ?? ""
                            }
                            onChange={(e) =>
                              handleDetailChange(
                                index,
                                "quantity",
                                e.target.value
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
                              "& input[type=number]::-webkit-outer-spin-button":
                                {
                                  WebkitAppearance: "none",
                                  margin: 0,
                                },
                              "& input[type=number]::-webkit-inner-spin-button":
                                {
                                  WebkitAppearance: "none",
                                  margin: 0,
                                },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem" }}>
                          <TextField
                            type="text"
                            value={
                              detail.unitPriceInput ?? detail.unitPrice ?? ""
                            }
                            onChange={(e) =>
                              handleDetailChange(
                                index,
                                "unitPrice",
                                e.target.value
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
                              "& input[type=number]::-webkit-outer-spin-button":
                                {
                                  WebkitAppearance: "none",
                                  margin: 0,
                                },
                              "& input[type=number]::-webkit-inner-spin-button":
                                {
                                  WebkitAppearance: "none",
                                  margin: 0,
                                },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem" }}>
                          <TextField
                            type="text" // Permet la saisie libre (montant ou pourcentage)
                            // value={
                            //   detail.discountPercent !== ""
                            //     ? `${detail.discountPercent}%`
                            //     : detail.discountAmount || ""
                            // } // Affiche soit le pourcentage, soit le montant
                            // onChange={(e) => {
                            //   const input = e.target.value.trim();

                            //   let formattedValue = input; // Supprime le symbole %
                            //   detail.discountAmount = "";
                            //   detail.discountPercent = "";

                            //   let amount = parseFloat(formattedValue); // Tente de convertir en nombre

                            //   // Gestion des cas de saisie valides
                            //   if (input.includes("%") && !isNaN(amount)) {
                            //     // Si l'utilisateur entre un pourcentage
                            //     detail.discountPercent = amount; // Met à jour le pourcentage
                            //     detail.discountAmount = ""; // Réinitialise le montant
                            //   } else if (!isNaN(amount)) {
                            //     // Si l'utilisateur entre un montant
                            //     detail.discountAmount = amount; // Met à jour le montant
                            //     detail.discountPercent = ""; // Réinitialise le pourcentage
                            //   } else {
                            //     // Si la saisie est invalide
                            //     detail.discountAmount = "";
                            //     detail.discountPercent = "";
                            //   }

                            //   // Mise à jour de la valeur brute pour affichage
                            //   detail.inputValue = input;

                            //   // Appelle la fonction pour notifier le changement
                            //   handleDetailChange(
                            //     index,
                            //     "discountAmount",
                            //     detail.discountAmount
                            //   );
                            // }}
                            inputProps={{
                              inputMode: "decimal",
                              pattern: "[0-9.,%]*",
                            }}
                            value={detail.inputValue || ""} // Affiche ce que l'utilisateur a saisi
                            onChange={(e) =>
                              handleDetailChange(
                                index,
                                "discountInput",
                                e.target.value
                              )
                            }
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
                        <TableCell style={{ textAlign: "center" }}>
                          {calculateLineTotal(detail).toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem" }}>
                          <Button onClick={() => removeDetailRow(index)}>
                            SUPP
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                mt: 2,
              }}
            >
              <Button
                onClick={handleAddDetail}
                color="primary"
                variant="contained"
                sx={{ marginTop: 2 }}
              >
                Ajouter
              </Button>

              {/* Display totals */}
              <Typography variant="h6" sx={{ marginTop: 2 }}>
                Total TTC: {totalTTC?.toFixed(2) || 0.0} €
              </Typography>
              <Typography variant="h6">
                Total HT: {totalHT?.toFixed(2) || 0.0} €
              </Typography>
              <Typography variant="h6">
                Acompte :{" "}
                {editedEvent?.deposit
                  ? parseFloat(editedEvent?.deposit).toFixed(2)
                  : "0.00"}{" "}
                €
              </Typography>
            </Box>
            <Grid container spacing={2} item xs={12} md={12}>
              {/* Colonne 1: Infos  sur les travaux */}
              <Grid item xs={12} md={6}>
                {/* <Typography variant="h6">
                          Informations Événement
                        </Typography> */}

                <TextField
                  label="Travaux"
                  name="notes"
                  value={editedEvent?.notes}
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
                  value={editedEvent?.price}
                  label="Prix"
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
                    select
                    label="Opérateur"
                    name="operator"
                    value={editedEvent?.operatorId}
                    onChange={handleChange}
                    fullWidthP
                    margin="normal"
                    required
                    size="small"
                    sx={{
                      width: "100%",

                      height: "30px",
                      "& .MuiInputBase-root": { fontSize: "0.8rem" },
                      "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                    }}
                  >
                    {users &&
                      users.map((userGroup, index) => (
                        <MenuItem
                          key={index}
                          value={userGroup.id}
                          sx={{
                            fontSize: "0.8rem",
                            minHeight: "30px",
                          }}
                        >
                          {userGroup.name}
                        </MenuItem>
                      ))}
                  </TextField>
                  <TextField
                    select
                    label="Réceptionnaire"
                    name="receptionist"
                    value={editedEvent?.receptionistId}
                    onChange={handleChange}
                    fullWidthP
                    margin="normal"
                    required
                    size="small"
                    sx={{
                      width: "100%",

                      height: "30px",
                      "& .MuiInputBase-root": { fontSize: "0.8rem" },
                      "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                    }}
                  >
                    {users &&
                      users.map((userGroup, index) => (
                        <MenuItem
                          key={index}
                          value={userGroup.id}
                          sx={{
                            fontSize: "0.8rem",
                            minHeight: "30px",
                          }}
                        >
                          {userGroup.name}
                        </MenuItem>
                      ))}
                  </TextField>
                </Box>

                <Typography variant="body1">Date de départ</Typography>
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
                  name="endDate"
                  type="date"
                  value={
                    editedEvent?.endDate
                      ? new Date(editedEvent?.endDate)
                          ?.toISOString()
                          ?.slice(0, 10)
                      : ""
                  }
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
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      name="startTime"
                      label="HHMM (ex: 0700)"
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
                      label="HHMM (ex: 1900)"
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
                  value={editedEvent?.Category?.id}
                  onChange={handleChange}
                  fullWidthP
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
          <Button onClick={onClose} variant="contained" color="primary">
            Sortir
          </Button>{" "}
          <Button onClick={handleOpenOrSup} variant="contained" color="primary">
            Supprimer
          </Button>{" "}
          <Modal
            open={openOrSup}
            onClose={handleCloseOrSup}
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
                Voulez-vous supprimer l'OR ?
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
                  onClick={handleCloseOrSup}
                >
                  Non
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirmOrSup}
                >
                  Oui
                </Button>
              </Box>
            </Box>
          </Modal>
          <Button onClick={handleOpenOr} color="primary" variant="contained">
            Modifier
          </Button>
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
                Voulez vous enriregistrer les modifications ?
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
          <OrdreReparationTemplate2
            editedEvent={editedEvent}
            details={details}
          />{" "}
          <InvoiceTemplate
            editedEvent={editedEvent}
            details={editedEvent.Details}
            onInvoiceExecuted={handleChildInvoice}
            categories={categories}
            closeEventModal={onclose}
            onFactureGenerated={handleFactureGenerated}
          />{" "}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EventDialog;
