import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Modal,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs"; // Assure-toi d'avoir installé dayjs
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../hooks/firebaseConfig";
import { useAxios } from "../../utils/hook/useAxios";
import { useStockAlertGlobal } from "../../contexts/StockAlertContext";
import AddOrdreReparationModal from "../AddOrdreReparationModal";
import DevisTemplate2 from "../DevisTemplate2";
import ForfaitSearch from "../ForfaitSearch";
import InvoiceTemplate from "../InvoiceTemplate";
import InvoiceTemplateWithoutOR2 from "../InvoiceTemplateWithoutOR2";
import Notification from "../Notification";
import ReservationTemplate2 from "../ReservationTemplate2";

function DocumentModal({
  open,
  onClose,
  editedEvent,
  orderId,
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
  const { notify: notifyStock } = useStockAlertGlobal();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cellStyle = {
    textAlign: "center",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
  };

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
          const initialDetails = editedEvent.Details.map((item) => ({
            ...item,
            quantityInput: item.quantity?.toString() ?? "",
            unitPriceInput: item.unitPrice?.toString() ?? "",
          }));

          const initialDetails2 = initialDetails.map((item) => {
            let inputValue = "";

            if (item.discountPercent && item.discountPercent !== "") {
              inputValue = `${item.discountPercent}%`;
            } else if (item.discountValue && item.discountValue !== "") {
              inputValue = String(item.discountValue);
            }

            return {
              ...item,
              inputValue,
            };
          });
          setDetails(initialDetails2);
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
          const r = await axios.post("/details", {
            ...detail,
            documentType: config.documentType,
            [config.foreignKey]: editedEvent.id,
          });
          notifyStock(r?.data);
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
        deposit: editedEvent.deposit,
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
          detail.discountValue?.toString().trim()
        );
      });

      for (const detail of validDetails) {
        const r = await axios.post("/details", {
          ...detail,
          documentType: "Reservation",
          reservationId,
        });
        notifyStock(r?.data);
      }

      // 3. Mettre à jour le devis pour le fermer (isClosed: true)
      await axios.put(`/quotes/${editedEvent.lastEventId}`, {
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

  // const handleDetailChange = (index, field, rawValue) => {
  //   const updatedDetails = [...details];

  //   const detail = updatedDetails[index];

  //   const raw = String(rawValue).trim(); // 🔁 conversion propre
  //   const normalizedValue = raw.replace(",", ".");
  //   // Toujours mettre à jour ce que l'utilisateur tape

  //   if (field === "quantity" || field === "unitPrice") {
  //     updatedDetails[index][`${field}Input`] = raw;
  //     const numericValue = parseFloat(normalizedValue);
  //     updatedDetails[index][field] = !isNaN(numericValue) ? numericValue : 0;
  //   } else if (field === "discountInput") {
  //     detail.inputValue = raw;

  //     // Réinitialiser d'abord
  //     detail.discountValue = "";
  //     detail.discountPercent = "";

  //     const cleaned = normalizedValue.replace("%", "");
  //     const value = parseFloat(cleaned);

  //     if (normalizedValue.includes("%") && !isNaN(value)) {
  //       detail.discountPercent = value;
  //     } else if (!isNaN(value)) {
  //       detail.discountValue = value;
  //     }

  //     // detail.inputValue = raw;
  //     // updatedDetails[index].inputValue = value;
  //   } else {
  //     updatedDetails[index][field] = raw;
  //   }

  //   setDetails(updatedDetails);
  // };
  const handleDetailChange = (index, field, rawValue) => {
    const updatedDetails = [...details];
    const detail = updatedDetails[index];

    // Pas de trim par défaut → sauf pour les champs numériques
    const raw = String(rawValue);
    const normalizedValue = raw.replace(",", ".");

    if (field === "quantity" || field === "unitPrice") {
      updatedDetails[index][`${field}Input`] = raw;
      const numericValue = parseFloat(normalizedValue.trim());
      updatedDetails[index][field] = !isNaN(numericValue) ? numericValue : 0;
    } else if (field === "discountInput") {
      detail.inputValue = raw.trim();

      detail.discountValue = "";
      detail.discountPercent = "";

      const cleaned = normalizedValue.replace("%", "").trim();
      const value = parseFloat(cleaned);

      if (normalizedValue.includes("%") && !isNaN(value)) {
        detail.discountPercent = value;
      } else if (!isNaN(value)) {
        detail.discountValue = value;
      }
    } else {
      updatedDetails[index][field] = raw; // garder les espaces pour le texte
    }

    setDetails(updatedDetails);
    setEditedEvent((prev) => ({
      ...prev,
      Details: updatedDetails,
    }));
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
        quantityInput: "",
        unitPrice: 0,
        unitPriceInput: "",
        discountValue: "",
        discountPercent: "",
        inputValue: "",
      },
    ]);
  };

  const calculateLineTotal = (detail) => {
    let discount = 0;

    if (detail.discountPercent > 0) {
      // Priorité au pourcentage
      discount =
        detail.unitPrice * detail.quantity * (detail.discountPercent / 100);
    } else if (detail.discountValue > 0) {
      // Sinon, utilise le montant fixe
      discount = detail.discountValue;
    }

    // Calcul du total après remise
    return detail.quantity * detail.unitPrice - discount;
  };
  const totalTTC = details?.reduce(
    (sum, detail) => sum + calculateLineTotal(detail),
    0
  );
  const totalHT = totalTTC / 1.2 || 0.0; // Ajouter 20% de TVA

  const [collectName, setCollectName] = useState("Ordre de réparation");
  const [notifCollection, setNotifCollection] = useState(collectionName);

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

  const handleConfirmCreerResa = async () => {
    handleCloseCreerResa();
    await handleCreerCollection();
    setNotifCollection("reservations");
    setNotification({ open: true, message: "Votre réservation a été créée", severity: "success" });
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
          collectionName={notifCollection}
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
            <ForfaitSearch
              initialDeposit={
                editedEvent?.deposit
                  ? parseFloat(editedEvent?.deposit).toFixed(2)
                  : "0.00"
              }
              initialDetails={details}
              onChange={(newDetails, newDeposit) => {
                setDetails(newDetails);
                // setDeposit(newDeposit);
              }}
            ></ForfaitSearch>

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
