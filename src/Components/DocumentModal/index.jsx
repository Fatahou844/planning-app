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
import dayjs from "dayjs"; // Assure-toi d'avoir installé dayjs
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../hooks/firebaseConfig";
import { useAxios } from "../../utils/hook/useAxios";
import AddOrdreReparationModal from "../AddOrdreReparationModal";
import DevisTemplate2 from "../DevisTemplate2";
import InvoiceTemplate from "../InvoiceTemplate";
import InvoiceTemplateWithoutOR2 from "../InvoiceTemplateWithoutOR2";
import Notification from "../Notification";
import ReservationTemplate2 from "../ReservationTemplate2";

function DocumentModal({
  open,
  onClose,
  editedEvent,
  setEditedEvent,
  collectionName,
  setCollectionName,
  categories,
  onEventTriggered,
  closeEventModal,
  displayNotification,
  onFactureReceive,
}) {
  const [details, setDetails] = useState(editedEvent.Details || []);
  const [finDate, setFinDate] = useState(editedEvent?.finDate || "");
  const [user] = useAuthState(auth);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dataEvents, setDataEvents] = useState([]);
  const axios = useAxios();

  const [invoiceExecuted, setInvoiceExecuted] = useState(false);
  const handleChildInvoice = () => {
    console.log("Une action a été exécutée dans le composant fils !");
    setInvoiceExecuted(!invoiceExecuted); // Met à jour l'état pour indiquer que l'action a été exécutée

    if (onEventTriggered) {
      onEventTriggered();
    }

    handleEventFromChild();
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFinDate(""); // Réinitialiser la date de fin
  };

  useEffect(() => {
    if (editedEvent) {
      const fetchDetails = async () => {
        try {
          setDetails(editedEvent.Details);
          console.log("++++++++++++++++detailsData++++++++++++++", details);
        } catch (error) {
          console.error("Erreur lors de la récupération des détails :", error);
        }
      };

      fetchDetails();
    }
  }, [editedEvent.id]);

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

  // // Save the updated event to Firestore
  // const handleSave = async () => {
  //   if (editedEvent?.id) {
  //     try {
  //       // Référence du document de l'événement principal
  //       const eventDocRef = doc(db, collectionName, editedEvent.id);
  //       await updateDoc(eventDocRef, editedEvent);

  //       // Référence de la collection "details" sous l'événement
  //       const detailsCollectionRef = collection(eventDocRef, "details");

  //       for (const detail of details) {
  //         if (detail.isDeleted) {
  //           // Supprimer les détails marqués comme supprimés
  //           if (detail.id) {
  //             const detailDocRef = doc(detailsCollectionRef, detail.id);
  //             await deleteDoc(detailDocRef);
  //           }
  //         } else if (detail.id) {
  //           // Mettre à jour les détails existants
  //           const detailDocRef = doc(detailsCollectionRef, detail.id);
  //           await updateDoc(detailDocRef, detail);
  //         } else {
  //           // Ajouter les nouveaux détails
  //           await addDoc(detailsCollectionRef, detail);
  //         }
  //       }

  //       if (onEventTriggered) {
  //         onEventTriggered(); // Notifie le parent
  //       }

  //       onClose();
  //     } catch (error) {
  //       console.error("Erreur lors de la sauvegarde de l'événement :", error);
  //     }
  //   }
  // };

  const handleSave = async () => {
    if (!editedEvent?.id) return;

    try {
      // Mapping collectionName -> API endpoint + documentType
      const typeMap = {
        events: {
          api: "/orders",
          documentType: "Order",
          foreignKey: "orderId",
        },
        factures: {
          api: "/invoices",
          documentType: "Invoice",
          foreignKey: "invoiceId",
        },
        devis: {
          api: "/quotes",
          documentType: "Quote",
          foreignKey: "quoteId",
        },
        reservations: {
          api: "/reservations",
          documentType: "Reservation",
          foreignKey: "reservationId",
        },
      };

      const config = typeMap[collectionName];
      if (!config) throw new Error("Type de collection non reconnu.");

      // 1. Mettre à jour le document principal
      await axios.put(`${config.api}/${editedEvent.id}`, editedEvent);

      // 2. Traiter les détails
      for (const detail of details) {
        if (detail.isDeleted && detail.id) {
          await axios.deleteData(`/details/${detail.id}`);
        } else if (detail.id) {
          await axios.put(`/details/${detail.id}`, detail);
        } else {
          await axios.post("/details", {
            ...detail,
            documentType: config.documentType,
            [config.foreignKey]: editedEvent.id, // Ajoute dynamiquement orderId/invoiceId/etc.
          });
        }
      }

      // 3. Notifications et fermeture
      if (onEventTriggered) onEventTriggered();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'événement :", error);
    }
  };

  const handleEditedEventChange = (updatedEvent) => {
    setEditedEvent(updatedEvent);
  };

  const handleCreerCollection = async () => {
    if (!editedEvent) return;

    try {
      // 1. Créer la réservation
      const response = await axios.post("/reservations", {
        title: editedEvent.title,
        quoteId: editedEvent.id,
        date: editedEvent.date,
        clientId: editedEvent.clientId,
        vehicleId: editedEvent.vehicleId,
        isClosed: false,
        garageId: getCurrentUser().garageId,
      });

      const newReservation = response.data;
      const reservationId = newReservation.id;

      console.log("📦 Nouvelle réservation créée :", reservationId);

      // 2. Ajouter les détails valides liés à la réservation
      const validDetails = details.filter((detail) => {
        return (
          detail.label?.trim() ||
          detail.quantity?.toString().trim() ||
          detail.unitPrice?.toString().trim() ||
          detail.discountPercent?.toString().trim() ||
          detail.discountAmount?.toString().trim()
        );
      });

      for (const detail of validDetails) {
        await axios.post("/details", {
          ...detail,
          documentType: "Reservation",
          reservationId,
        });
      }

      // 3. Mettre à jour le devis pour le fermer (isClosed: true)
      await axios.put(`/quotes/${editedEvent.id}`, {
        isClosed: true,
      });

      // 4. Notifications + actions UI
      setCollectionName("reservations");
      if (onEventTriggered) onEventTriggered();
      onClose();
    } catch (error) {
      console.error("❌ Erreur lors de la création de la réservation :", error);
    }
  };

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...details];
    updatedDetails[index][field] = value;
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
        // On ne définit pas d’ID pour indiquer qu’il s’agit d’un nouvel élément
        label: "",
        quantity: 0,
        unitPrice: 0,
        discountAmount: 0,
        discountPercent: 0,
      },
    ]);
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
  const totalHT = totalTTC / 1.2 || 0.0; // Ajouter 20% de TVA

  // let collectName = "Ordre de réparation";
  const [collectName, setCollectName] = useState("Ordre de réparation");

  useEffect(() => {
    console.log(
      " *************** AFFICHER COLLECTION NAME **************",
      collectionName
    );
    if (collectionName == "events") setCollectName("Ordre de réparation");
    else if (collectionName == "devis") setCollectName("devis");
    else if (collectionName == "reservations") setCollectName("résa");
    else setCollectName("facture");
  }, [editedEvent.id]);

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
    displayNotification();
  };

  const handleConfirmCreerResa = () => {
    handleCreerCollection(); // Appel de la fonction addEvent
    handleCloseCreerResa(); // Fermer le modal
    setNotification({
      open: true,
      message: "Votre réservation crée",
      severity: "success", // Peut être "error", "warning", "info"
    });
    handleShowPopup();
  };

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpen = () => {
    setNotification({
      open: true,
      message: "Modification " + editedEvent.id + " effectué",
      severity: "success", // Peut être "error", "warning", "info"
    });
    handleShowPopup();
  };

  const handleClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
    setIsModalOpen(false);
    setOpenOr(false);
    onClose();
    // Fermer EventModal via la prop closeEventModal
    if (closeEventModal) {
      closeEventModal();
    }
  };
  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventFromChild = () => {
    const fetchEvents = async () => {
      try {
        // Utilisation de l'API pour récupérer les événements par userId et date
        const response = await axios.get(
          `/documents-garage/order/${getCurrentUser().garageId}/details`
        );

        const eventsData = response.data.data;

        // Filtrer les événements si nécessaire
        const filteredEvents = eventsData.filter(
          (event) => event.date === selectedDate && !event.isClosed
        );

        setDataEvents(filteredEvents);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des événements : ",
          error
        );
      }
    };

    fetchEvents();
    if (onEventTriggered) onEventTriggered(); // Appeler la fonction au montage du composant
    // setEventCount((prevCount) => prevCount + 1); // Par exemple, incrémente un compteur
  };

  const [showPopup, setShowPopup] = useState(false);

  const handleShowPopup = () => {
    setShowPopup(true);
    displayNotification();
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    console.log("fermeture du popup");
  };
  const [facture, setFacture] = useState(null);
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

  return (
    <>
      {showPopup && (
        <Notification
          message={notification.message}
          handleClose={handleClosePopup}
          dataEvent={editedEvent}
          collectionName={collectionName}
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
                  name="Client.lastName"
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
                  name="Client.firstName"
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
                  name="Client.phone"
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
                  name="Client.email"
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
                  label="Adresse locale"
                  name="Client.adresse"
                  value={editedEvent.Client?.address || ""}
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
                  name="Client.postale"
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
                  name="Client.ville"
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
                  name="vehicule.plateNumber"
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
                  name="vehicule.kms"
                  value={editedEvent.Vehicle?.mileage || ""}
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
                  value={editedEvent.Vehicle?.lastCheck || ""}
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
                    (details || []).map((detail, index) => (
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
                        <TableCell style={{ textAlign: "center" }}>
                          {calculateLineTotal(detail).toFixed(2)}
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
                Total TTC: {totalTTC?.toFixed(2)} €
              </Typography>
              <Typography variant="h6">
                Total HT: {totalHT?.toFixed(2)} €
              </Typography>
              <Typography variant="h6">
                Acompte :{" "}
                {editedEvent?.details?.acompte
                  ? parseFloat(editedEvent?.details?.acompte)?.toFixed(2)
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
                Sortir
              </Button>{" "}
              <Button onClick={onClose} color="primary" variant="contained">
                Supprimer
              </Button>{" "}
              <Button
                onClick={handleOpenOr}
                color="primary"
                variant="contained"
              >
                Modifier
              </Button>
              <ReservationTemplate2
                editedEvent={editedEvent}
                details={details}
              />{" "}
              <InvoiceTemplate
                editedEvent={editedEvent}
                details={details}
                onInvoiceExecuted={handleChildInvoice}
                categories={categories}
                closeEventModal={closeEventModal}
                onFactureGenerated={handleFactureGenerated}
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
                Sortir
              </Button>{" "}
              <Button onClick={onClose} color="primary" variant="contained">
                Supprimer
              </Button>{" "}
              <Button
                onClick={handleOpenOr}
                color="primary"
                variant="contained"
              >
                Modifier
              </Button>
              <Button
                onClick={handleOpenCreerOr}
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
              <DevisTemplate2
                editedEvent={editedEvent}
                details={details}
                onInvoiceExecuted={handleChildInvoice}
              />
              <InvoiceTemplate
                editedEvent={editedEvent}
                details={details}
                onInvoiceExecuted={handleChildInvoice}
                categories={categories}
                closeEventModal={closeEventModal}
                onFactureGenerated={handleFactureGenerated}
              />{" "}
            </>
          )}
          {collectionName === "factures" && (
            <>
              <Button
                onClick={() => {
                  if (closeEventModal) {
                    console.log("Action dans DocumentModal");
                    closeEventModal();
                  }
                  onClose();
                }}
                color="primary"
                variant="contained"
              >
                Sortir
              </Button>{" "}
              <Button
                onClick={() => {
                  handleOpenOr(); // Fermer EventModal via la prop closeEventModal
                }}
                disabled={dayjs(editedEvent.date).isBefore(dayjs(), "day")} // Désactive si la date est passée
                color="primary"
                variant="contained"
              >
                Modifier
              </Button>
              <InvoiceTemplateWithoutOR2
                NewEvent={editedEvent}
                details={details}
                onInvoiceExecuted={handleChildInvoice}
                closeDocumentModal={() => {
                  if (closeEventModal) closeEventModal();
                  onClose();
                }}
                closeEventModal={() => {
                  if (closeEventModal) closeEventModal();
                  onClose();
                }}
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
                  onClick={() => setIsModalOpen(true)}
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

      {editedEvent && (
        <AddOrdreReparationModal
          open={isModalOpen}
          onClose={handleClose}
          editedEvent={editedEvent}
          Details={details}
          setEditedEvent={handleEditedEventChange}
          categories={categories}
          onEventTriggered={handleEventFromChild}
          collectionName="events"
          collectionNameOpen={collectionName}
          closeDocumentModal={onClose}
        />
      )}
    </>
  );
}

export default DocumentModal;
