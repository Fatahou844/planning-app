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
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAxios } from "../../utils/hook/useAxios";
import UserSearch from "../UserSearch/UserSearch";

function AddOrdreReparationModal({
  open,
  onClose,
  editedEvent,
  Details,
  setEditedEvent,
  collectionName,
  categories,
  onEventTriggered,
  collectionNameOpen,
  closeDocumentModal,
  onNotificationSuccess,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cellStyle = {
    textAlign: "center",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
  };
  const [details, setDetails] = useState(Details || []);
  const [finDate, setFinDate] = useState(editedEvent?.finDate || "");
  const user = { id: 1 };

  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dataEvents, setDataEvents] = useState([]);
  const axios = useAxios();

  const [invoiceExecuted, setInvoiceExecuted] = useState(false);
  const [vehicleUpdated, setVehicleUpdated] = useState(false);

  const [Vehicle, setVehicle] = useState(editedEvent?.Vehicle);

  const [Operator, setOperator] = useState({
    name: "",
    firstName: "",
    email: "",
  });
  const handleSelectOperator = (operator) => {
    setOperator(operator);
    console.log("operator sélectionné :", operator);
  };

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({
      ...prev,
      [name]: value,
    }));
    setVehicleUpdated(true);
  };

  const [Receptor, setReceptor] = useState({
    name: "",
    firstName: "",
    email: "",
  });
  const handleSelectReceptor = (receptor) => {
    setReceptor(receptor);
    console.log("receptor sélectionné :", receptor);
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFinDate(""); // Réinitialiser la date de fin
  };

  const addDetailRow = () => {
    setDetails((prevDetails) => [
      ...prevDetails,
      {
        label: "",
        quantity: "",
        unitPrice: "",
        discountPercent: "",
        discountAmount: "",
      },
    ]);
  };

  useEffect(() => {
    if (editedEvent && collectionNameOpen == "reservations") {
      const fetchDetails = async () => {
        try {
          setDetails(Details);
        } catch (error) {
          console.error("Erreur lors de la récupération des détails :", error);
        }
      };

      fetchDetails();
    }
    if (editedEvent && collectionNameOpen == "devis") {
      const fetchDetails = async () => {
        try {
          setDetails(Details);
        } catch (error) {
          console.error("Erreur lors de la récupération des détails :", error);
        }
      };

      fetchDetails();
    }
    setVehicle(editedEvent?.Vehicle);
    setDeposit(editedEvent?.deposit);
  }, [, open, editedEvent.id]);

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
      if (name === "date") {
        setFinDate(e.target.value);
      }

      return updatedEvent;
    });
  };

  // const handleDetailChange = (index, field, value) => {
  //   // Vérifiez si l'index existe dans le tableau
  //   if (index >= 0 && index < details.length) {
  //     const updatedDetails = [...details];
  //     updatedDetails[index] = { ...updatedDetails[index], [field]: value }; // Mise à jour propre de l'objet
  //     setDetails(updatedDetails);
  //   } else {
  //     console.error(`Index ${index} hors limites pour le tableau details.`);
  //   }
  // };
  const handleDetailChange = (index, field, rawValue) => {
    if (index < 0 || index >= details.length) {
      console.error(`Index ${index} hors limites pour le tableau details.`);
      return;
    }

    const updatedDetails = [...details];
    const detail = { ...updatedDetails[index] };

    // Normaliser les décimales : remplacer virgule par point
    let normalizedValue =
      typeof rawValue === "string" ? rawValue.replace(",", ".") : rawValue;

    // Logique spécifique pour remise (discount)
    if (field === "discountAmount") {
      const value = normalizedValue.trim();
      detail.inputValue = rawValue; // garde la valeur brute pour affichage

      detail.discountAmount = "";
      detail.discountPercent = "";

      if (value.includes("%")) {
        const percentage = parseFloat(value.replace("%", ""));
        if (!isNaN(percentage)) {
          detail.discountPercent = percentage;
        }
      } else {
        const amount = parseFloat(value);
        if (!isNaN(amount)) {
          detail.discountAmount = amount;
        }
      }
    } else if (field === "quantity" || field === "unitPrice") {
      // Ne pas convertir la valeur à ce moment-là ! Juste stocker le texte tel quel
      detail[field] = rawValue; // ← garde "1,", "2.5", etc.
    }

    // Pour les autres champs
    else {
      detail[field] = rawValue;
    }

    updatedDetails[index] = detail;
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

  const calculateLineTotal = (detail) => {
    // let discount = 0;

    // if (detail.discountPercent > 0) {
    //   // Priorité au pourcentage
    //   discount =
    //     detail.unitPrice * detail.quantity * (detail.discountPercent / 100);
    // } else if (detail.discountAmount > 0) {
    //   // Sinon, utilise le montant fixe
    //   discount = detail.discountAmount;
    // }

    // // Calcul du total après remise
    // return detail.quantity * detail.unitPrice - discount;
    const quantity = parseFloat(
      String(detail.quantity || "").replace(",", ".")
    );
    const unitPrice = parseFloat(
      String(detail.unitPrice || "").replace(",", ".")
    );
    const discountPercent = detail.discountPercent || 0;
    const discountAmount = detail.discountAmount || 0;

    if (isNaN(quantity) || isNaN(unitPrice)) return 0;

    let total = quantity * unitPrice;

    if (discountPercent) {
      total -= (total * discountPercent) / 100;
    } else if (discountAmount) {
      total -= discountAmount;
    }

    return total;
  };
  const totalTTC = details?.reduce(
    (sum, detail) => sum + calculateLineTotal(detail),
    0
  );
  const totalHT = totalTTC / 1.2 || 0; // Ajouter 20% de TVA

  let collectName = "Ordre de réparation";

  if (collectionName == "events") collectName = "Ordre de réparation";
  else if (collectionName == "devis") collectName = "devis";
  else if (collectionName == "reservations") collectName = "résa";
  else collectName = "facture";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deposit, setDeposit] = useState(editedEvent?.deposit);

  const addEventDetails = async (eventId, details) => {
    try {
      // Filtrer les détails valides (exclut ceux où tous les champs sont vides ou non valides)
      const validDetails = details.filter((detail) => {
        return (
          detail.label?.trim() ||
          detail.quantity ||
          detail.unitPrice ||
          detail.discountPercent ||
          detail.discountAmount
        );
      });

      // Si aucun détail valide, on sort sans erreur
      if (validDetails.length === 0) {
        console.log("Aucun détail valide à enregistrer.");
        return;
      }

      // Envoyer chaque détail individuellement via une requête POST à l'API
      for (const detail of validDetails) {
        await axios.post("/details", {
          label: detail.label || "",
          quantity: detail.quantity || 0,
          unitPrice: detail.unitPrice || 0,
          discountPercent: detail.discountPercent || 0,
          discountAmount: detail.discountAmount || 0,
          orderId: eventId,
          documentType: "Order",
        });
      }

      console.log("Détails ajoutés avec succès à l'événement");
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout des détails à l'événement : ",
        error
      );
    }
  };

  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  const addSingleEvent = async (event, newOrderNumber, nextDay) => {
    try {
      console.log("ORDRE DE REPARATION", event);

      console.log("category: event.categoryId", event.category.id);

      const order = await axios.post("/orders", {
        date: event.date,
        endDate: finDate,
        startHour: parseInt(event.startHour),
        startMinute: parseInt(event.startMinute),
        endHour: parseInt(event.endHour),
        endMinute: parseInt(event.endMinute),
        categoryId: event.category.id,
        clientId: editedEvent.clientId,
        deposit: deposit,
        vehicleId: editedEvent.vehicleId,
        notes: event.notes,
        isClosed: false,
        userId: event.userId, // UID de l'utilisateur
        nextDay: nextDay,
        garageId: getCurrentUser().garageId,
        operatorId: Operator.id,
        receptionistId: Receptor.id,
      });

      console.log("eventRef", event);

      const fetchCloseDevis = async () => {
        try {
          await axios.put(`/quotes/${event.lastEventId}`, {
            isClosed: true,
          });
          console.log("✅ Devis fermé avec succès.");
        } catch (error) {
          console.error(
            "❌ Erreur lors de la fermeture du devis après création de OR :",
            error
          );
        }
      };

      const fetchCloseResa = async () => {
        try {
          await axios.put(`/reservations/${event.lastEventId}`, {
            isClosed: true,
          });
          console.log("✅ Réservation fermée avec succès.");
        } catch (error) {
          console.error(
            "❌ Erreur lors de la fermeture du résa après création de OR :",
            error
          );
        }
      };

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

      fetchCloseDevis();
      fetchCloseResa();

      return order.data; // Retourner la référence du document
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const [newOrder, setNewOrder] = useState({});

  const addEvent = async (isMultiDay = false) => {
    const updatedEvents = [...events]; // Crée une copie de l'array events
    const startDate = new Date(editedEvent.date); // Date de début
    const endDate = new Date(finDate); // Date de fin
    const userId = user.id; // UID de l'utilisateur connecté
    // const lastOrderNumber = await getLastOrderNumberForUser(userId);
    const newOrderNumber = 10000;

    // Si l'événement ne couvre qu'une seule journée, ou si isMultiDay est faux
    const singleEvent = {
      ...editedEvent,
      userId: userId,
      title: newOrderNumber, // Utiliser le numéro de commande
      nextDay: false,
    };
    const singleEventDocRef = await addSingleEvent(
      singleEvent,
      newOrderNumber,
      false
    ); // Ajout à Firestore
    const validDetails = details.filter((detail) => {
      return (
        detail.label?.trim() ||
        detail.quantity?.toString().trim() ||
        detail.unitPrice?.toString().trim() ||
        detail.discountPercent?.toString().trim() ||
        detail.discountAmount?.toString().trim()
      );
    });

    if (validDetails.length)
      await addEventDetails(singleEventDocRef.id, details); // Enregistrer les détails

    setNewOrder(singleEventDocRef);

    // Mettre à jour le dernier numéro de commande utilisé pour cet utilisateur

    // Mettre à jour le state avec les événements ajoutés
    setEvents(updatedEvents);

    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `/documents-garage/order/${getCurrentUser().garageId}/details`
        );

        const eventsData = response.data.data;

        // Filtrer les événements si nécessaire
        const filteredEvents = eventsData.filter(
          (event) => event.date === selectedDate && !event.isClosed
        );

        setDataEvents(filteredEvents);

        console.log("eventsData", filteredEvents);
      } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
      }
    };

    fetchEvents(); // Appeler la fonction au montage du composant
    closeDocumentModal();
    resetForm();
    setIsModalOpen(false); // Fermer le modal
    if (onNotificationSuccess) {
      onNotificationSuccess(singleEventDocRef);
      console.log(
        "AddOrdreReparationModal Component: OR reçue dans DocumentModal onNotificationSuccess :",
        singleEventDocRef
      );
    } else {
      console.error(
        "❌ ERREUR : onNotificationSuccess  est undefined dans le Child ! AddOrdeReparationModal"
      );
    }
    if (onEventTriggered) {
      onEventTriggered(); // Notifie le parent
    }
  };

  const handleConfirmOR = () => {
    addEvent(); // Appel de la fonction addEvent
    onClose();
  };

  const handleInternalClose = () => {
    // Appelle la fonction `onClose` pour fermer la boîte de dialogue
    if (onClose) onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          style: {
            width: "1200px", // Remplacez par la largeur souhaitée
            maxWidth: "none", // Supprimez la largeur maximale par défaut
          },
        }}
      >
        <DialogTitle>Ajouter un O.R</DialogTitle>
        <DialogContent>
          <form>
            <Grid container spacing={2}>
              {/* Colonne 1: Infos client */}
              <Grid item xs={12} md={6}>
                <Typography variant="body1">Informations Client</Typography>
                <TextField
                  label="Nom"
                  name="person.lastName"
                  value={editedEvent.Client?.name}
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
                <TextField
                  label="Prénom"
                  name="person.firstName"
                  value={editedEvent.Client?.firstName}
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
                <TextField
                  label="Téléphone"
                  name="person.phone"
                  value={editedEvent.Client?.phone}
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
                <TextField
                  label="Email"
                  name="person.email"
                  value={editedEvent.Client?.email}
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
                <TextField
                  label="Adresse"
                  name="person.adresse"
                  value={editedEvent.Client?.address}
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
                  label="Code postal"
                  name="person.postale"
                  value={editedEvent.Client?.postalCode}
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
                  label="Ville"
                  name="person.ville"
                  value={editedEvent.Client?.city}
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
              </Grid>

              {/* Colonne 2: Infos véhicule */}
              <Grid item xs={12} md={6}>
                <Typography variant="body1">Informations Véhicule</Typography>
                <TextField
                  label="Immatriculation"
                  name="vehicule.licensePlate"
                  value={editedEvent.Vehicle?.plateNumber}
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
                  label="VIN"
                  name="vehicule.vin"
                  value={editedEvent.Vehicle?.vin}
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
                  label="Modèle"
                  name="vehicule.model"
                  value={editedEvent.Vehicle?.model}
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
                  label="Couleur"
                  name="vehicule.color"
                  value={editedEvent.Vehicle?.color}
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
                  label="kilométrage"
                  name="mileage"
                  value={Vehicle?.mileage}
                  onChange={handleVehicleChange}
                  fullWidth
                  margin="normal"
                  size="small"
                  sx={{
                    height: "30px",
                    "& .MuiInputBase-root": { fontSize: "0.8rem" },
                    "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                  }}
                />
                <Typography variant="body1" sx={{ marginTop: "1.3rem" }}>
                  Prochain controle technique
                </Typography>
                <TextField
                  name="lastCheck"
                  type="date"
                  value={Vehicle?.lastCheck}
                  onChange={handleVehicleChange}
                  fullWidth
                  margin="normal"
                  size="small"
                  sx={{
                    height: "30px",
                    "& .MuiInputBase-root": { fontSize: "0.8rem" },
                    "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                  }}
                />
              </Grid>

              {/* Table: Détails de l'événement */}
              <Grid item xs={12}>
                {/* <Typography variant="h6">
                        Détails de l'événement
                      </Typography> */}
                <TableContainer
                  component={Paper}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2,
                    boxShadow: isDark
                      ? "0 0 12px rgba(255, 255, 255, 0.05)"
                      : "0 0 12px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: "60%", ...cellStyle }}>
                          Libellé / travaux / articles
                        </TableCell>
                        <TableCell
                          style={{
                            width: "10%",
                            textAlign: "center",
                            ...cellStyle,
                          }}
                        >
                          Quantité
                        </TableCell>
                        <TableCell
                          style={{
                            width: "1O%",
                            textAlign: "center",
                            ...cellStyle,
                          }}
                        >
                          Prix Unitaire
                        </TableCell>
                        {/* <TableCell
                                style={{ width: "10%", textAlign: "center" }}
                              >
                                Remise %
                              </TableCell> */}
                        <TableCell
                          style={{
                            width: "10%",
                            textAlign: "center",
                            ...cellStyle,
                          }}
                        >
                          Remise
                        </TableCell>
                        <TableCell
                          style={{
                            width: "10%",
                            textAlign: "center",
                            ...cellStyle,
                          }}
                        >
                          Total
                        </TableCell>
                        <TableCell
                          style={{
                            width: "10%",
                            textAlign: "center",
                            ...cellStyle,
                          }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details &&
                        details.length > 0 &&
                        details.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <TextField
                                name="label"
                                value={detail.label}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "label",
                                    e.target.value
                                  )
                                }
                                size="small"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                name="quantity"
                                type="text"
                                value={detail.quantity}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                size="small"
                                style={{
                                  maxWidth: 80,
                                }}
                                sx={{
                                  "& input": {
                                    textAlign: "center", // Centrer horizontalement
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                name="unitPrice"
                                type="text"
                                value={detail.unitPrice}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "unitPrice",
                                    e.target.value
                                  )
                                }
                                // onInput={(e) => {
                                //   const input = e.target.value;
                                //   e.target.value = input.replace(",", ".");
                                // }}
                                size="small"
                                style={{
                                  textAlign: "center",
                                }}
                                fullWidth
                                sx={{
                                  "& input": {
                                    textAlign: "center", // Centrer horizontalement
                                  },
                                }}
                              />
                            </TableCell>

                            <TableCell>
                              <TextField
                                name="discountAmount"
                                type="text"
                                value={detail.inputValue || ""}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "discountAmount",
                                    e.target.value
                                  )
                                }
                                size="small"
                                sx={{
                                  "& input": {
                                    MozAppearance: "textfield", // Pour Firefox
                                    textAlign: "center", // Centrer horizontalement
                                  },
                                  "& input::-webkit-outer-spin-button": {
                                    WebkitAppearance: "none", // Pour Chrome, Safari, Edge, Opera
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
                            <TableCell style={{ textAlign: "center" }}>
                              <Button
                                color="secondary"
                                onClick={() => removeDetailRow(index)}
                              >
                                SUPP
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      <TableRow>
                        <TableCell colSpan={7} sx={{ ...cellStyle }}>
                          <Button
                            variant="outlined"
                            onClick={addDetailRow}
                            fullWidth
                          >
                            Ajouter une ligne
                          </Button>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell
                          colSpan={4}
                          sx={{ ...cellStyle }}
                        ></TableCell>
                        <TableCell sx={{ ...cellStyle }}>Total TTC :</TableCell>
                        <TableCell sx={{ ...cellStyle }}>
                          {totalTTC ? totalTTC.toFixed(2) : 0.0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          sx={{ ...cellStyle }}
                        ></TableCell>
                        <TableCell sx={{ ...cellStyle }}>Total HT :</TableCell>
                        <TableCell sx={{ ...cellStyle }}>
                          {totalHT ? totalHT.toFixed(2) : 0.0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          sx={{ ...cellStyle }}
                        ></TableCell>
                        <TableCell sx={{ ...cellStyle }}>Acompte :</TableCell>
                        <TableCell sx={{ ...cellStyle }}>
                          <TextField
                            type="text"
                            value={deposit}
                            onChange={(e) => setDeposit(e.target.value)}
                            size="small"
                            style={{ maxWidth: 100 }}
                            sx={{
                              "& input": {
                                MozAppearance: "textfield", // Pour Firefox
                                textAlign: "center", // Centrer horizontalement
                              },
                              "& input::-webkit-outer-spin-button": {
                                WebkitAppearance: "none", // Pour Chrome, Safari, Edge, Opera
                                margin: 0,
                              },
                              "& input::-webkit-inner-spin-button": {
                                WebkitAppearance: "none",
                                margin: 0,
                              },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid container spacing={2} item xs={12} md={12}>
                {/* Colonne 1: Infos  sur les travaux */}
                <Grid item xs={12} md={6}>
                  {/* <Typography variant="h6">
                          Informations Événement
                        </Typography> */}

                  <TextField
                    label="Notes"
                    name="notes"
                    value={editedEvent.notes}
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
                    name="price"
                    type="number"
                    value={editedEvent.price}
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
                        MozAppearance: "textfield", // Pour Firefox
                      },
                      "& input[type=number]::-webkit-outer-spin-button": {
                        WebkitAppearance: "none", // Pour Chrome, Safari, Edge, Opera
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
                    <UserSearch
                      onSelectUser={handleSelectOperator}
                      Users={Operator}
                      garageId={getCurrentUser().garageId}
                      NameAttribute="Opérateur"
                    ></UserSearch>
                    <UserSearch
                      onSelectUser={handleSelectReceptor}
                      Users={Receptor}
                      garageId={getCurrentUser().garageId}
                      NameAttribute="Récepteur"
                    ></UserSearch>
                  </Box>

                  <Grid container spacing={2}>
                    {/* Section Date de l'événement et Heure de début */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1">Date de début</Typography>
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
                    </Grid>
                    {/* Section Date de fin et Heure de fin */}
                    <Grid item xs={12} md={6}>
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
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="body1"
                        sx={{ marginBottom: "0.9rem" }}
                      >
                        Heure de départ
                      </Typography>
                      <Grid item xs={6}>
                        <TextField
                          name="startTime"
                          placeholder="HHMM (ex: 0700)"
                          value={`${
                            editedEvent.startHour ? editedEvent.startHour : ""
                          }${
                            editedEvent.startMinute
                              ? editedEvent.startMinute
                              : ""
                          }`}
                          onChange={handleChange}
                          margin="none"
                          size="small"
                          sx={{
                            height: "30px",
                            "& .MuiInputBase-root": {
                              fontSize: "0.8rem",
                            },
                            "& .MuiFormLabel-root": {
                              fontSize: "0.8rem",
                            },
                          }}
                        />
                      </Grid>
                      {/* <Box mt={2}>
                              <Typography variant="body2">
                                Heure : {editedEvent.startHour || "Non définie"}{" "}
                                Minute : {editedEvent.startMinute || "Non définie"}
                              </Typography>
                            </Box> */}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="body1"
                        sx={{ marginBottom: "0.9rem" }}
                      >
                        Heure de fin
                      </Typography>
                      <Grid item xs={6}>
                        <TextField
                          name="endTime"
                          placeholder="HHMM (ex: 1730)"
                          value={
                            `${editedEvent.endHour ? editedEvent.endHour : ""}${
                              editedEvent.endMinute ? editedEvent.endMinute : ""
                            }` || ""
                          }
                          onChange={handleChange}
                          margin="none"
                          size="small"
                          sx={{
                            height: "30px",
                            "& .MuiInputBase-root": {
                              fontSize: "0.8rem",
                            },
                            "& .MuiFormLabel-root": {
                              fontSize: "0.8rem",
                            },
                          }}
                        />
                      </Grid>
                      {/* <Box mt={2}>
                              <Typography variant="body2">
                                Heure : {editedEvent.endHour || "Non définie"}{" "}
                                Minute : {editedEvent.endMinute || "Non définie"}
                              </Typography>
                            </Box> */}
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
            </Grid>
          </form>
          <DialogActions
            sx={{
              position: "sticky", // Le footer reste collé
              bottom: 0, // Toujours en bas
              backgroundColor: "background.paper", // Fond cohérent avec le thème
              zIndex: 1, // Au-dessus du contenu
              borderTop: "1px solid #ddd", // Ligne de séparation
            }}
          >
            {/* Boutons CTA en bas */}
            <Grid container spacing={3} justifyContent="flex-end">
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirmOR}
                >
                  Créer un OR
                </Button>
              </Grid>

              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleInternalClose}
                >
                  Annuler
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddOrdreReparationModal;
