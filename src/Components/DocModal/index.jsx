import {
  Alert,
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
  useTheme,
} from "@mui/material";
import dayjs from "dayjs"; // Assure-toi d'avoir installé dayjs
import { collection, doc, writeBatch } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../hooks/firebaseConfig";
import { useAxios } from "../../utils/hook/useAxios";
import AddOrdreReparationModal from "../AddOrdreReparationModal";
import DevisTemplate2 from "../DevisTemplate2";
import InvoiceTemplate from "../InvoiceTemplate";
import InvoiceTemplateWithoutOR2 from "../InvoiceTemplateWithoutOR2";
import Notification from "../Notification";
import ReservationTemplate2 from "../ReservationTemplate2";

function DocModal({
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
  onDelete,
  onNotificationSuccess,
  onSearchAfterDevisResa,
}) {
  const [details, setDetails] = useState(editedEvent.Details || []);
  const [finDate, setFinDate] = useState(editedEvent?.finDate || "");
  const [user] = useAuthState(auth);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dataEvents, setDataEvents] = useState([]);
  const [openOrSup, setOpenOrSup] = useState(false);
  const [vehicleUpdated, setVehicleUpdated] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cellStyle = {
    textAlign: "center",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
  };

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

  const handleOpenOrSup = () => setOpenOrSup(true);
  const handleCloseOrSup = () => setOpenOrSup(false);

  const handleConfirmOrSup = () => {
    handleDelete(editedEvent.id); // Appel de la fonction addEvent
    handleCloseOrSup(); // Fermer le modal
    handleOpen();

    onClose();
  };

  const handleDelete = async (eventId) => {
    try {
      if (!eventId) {
        console.warn("Aucun ID d'événement fourni pour la suppression.");
        return;
      }

      // Déterminer le type de la collection
      let url = "";
      switch (collectionName) {
        case "events":
          url = `/orders/${eventId}`; // pour les événements
          break;
        case "factures":
          url = `/invoices/${eventId}`; // pour les factures
          break;
        case "devis":
          url = `/quotes/${eventId}`; // pour les devis
          break;
        case "reservations":
          url = `/reservations/${eventId}`; // pour les réservations
          break;
        default:
          console.error("Collection non supportée :", collectionName);
          return;
      }

      // Supprimer l'événement principal et ses détails
      const response = await axios.deleteData(url, {
        data: {
          eventId: eventId,
        },
      });

      console.log(
        `Événement avec l'ID ${eventId} et ses détails ont été supprimés avec succès.`
      );

      // Notifier l'utilisateur via l'état
      setNotification({
        open: true,
        message: `${collectionName} ${editedEvent.id} a été supprimé`,
        severity: "success", // Peut être "error", "warning", "info"
      });

      if (onDelete) {
        onDelete();
        console.log(
          `Événement avec l'ID ${eventId} et ses détails ont été supprimés avec succès.`
        );
      } else {
        console.error(
          "❌ ERREUR : onDelete est undefined dans le Child ! onDelete"
        );
      }

      handleCloseOrSup();
      handleCloseOr();

      if (onEventTriggered) {
        onEventTriggered(); // Notifie le parent (si nécessaire)
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement :", error);
    }
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
        } catch (error) {
          console.error("Erreur lors de la récupération des détails :", error);
        }
      };

      fetchDetails();
      setVehicle(editedEvent?.Vehicle);
    }
  }, [editedEvent.id]);

  // Handle input change for end date
  const handleChangeFinDate = (e) => {
    const value = e.target.value;
    setFinDate(value);
    setEditedEvent((prev) => ({ ...prev, finDate: value }));
  };

  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

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

      const DocData = {
        date: editedEvent.date,
        startHour: parseInt(editedEvent.startHour),
        startMinute: parseInt(editedEvent.startMinute),
        endHour: parseInt(editedEvent.endHour),
        endMinute: parseInt(editedEvent.endMinute),
        categoryId: editedEvent?.Category?.id,
        clientId: editedEvent.clientId,
        vehicleId: editedEvent.vehicleId,
        notes: editedEvent.notes,
        garageId: getCurrentUser().garageId,
      };

      // 1. Mettre à jour le document principal
      await axios.put(`${config.api}/${orderId}`, DocData);

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

  const addEventDetailsGeneric = async (eventId, details, collectionName) => {
    try {
      const batch = writeBatch(db); // Crée un batch pour les opérations

      // Référence directe au document de l'événement avec l'ID existant
      const eventRef = doc(db, collectionName, eventId);

      // Filtre les détails valides (exclut ceux où tous les champs sont vides ou non valides)
      const validDetails = details.filter((detail) => {
        return (
          detail.label?.trim() ||
          detail.quantity?.toString().trim() ||
          detail.unitPrice?.toString().trim() ||
          detail.discountPercent?.toString().trim() ||
          detail.discountValue?.toString().trim()
        );
      });

      console.log("##############lidDetails####################", validDetails);

      // Si aucun détail valide, on sort sans erreur
      if (validDetails.length === 0) {
        console.log("Aucun détail valide à enregistrer.");
        return;
      }

      // Boucle sur chaque détail filtré et ajout à la sous-collection "details" de cet événement
      for (const detail of validDetails) {
        const detailRef = doc(collection(eventRef, "details")); // Crée un nouveau document dans "details"
        batch.set(detailRef, {
          label: detail.label || "",
          quantity: detail.quantity || 0,
          unitPrice: detail.unitPrice || 0,
          discountPercent: detail.discountPercent || 0,
          discountValue: detail.discountValue || 0,
        });
      }

      // Engager toutes les écritures dans le batch
      await batch.commit();

      console.log("Détails ajoutés avec succès à l'événement");
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout des détails à l'événement : ",
        error
      );
    }
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
        notes: editedEvent.notes,
        deposit: editedEvent?.deposit | 0.0,
        isClosed: false,
        garageId: getCurrentUser().garageId,
      });

      const newReservation = response.data;
      const reservationId = newReservation.id;

      console.log("📦 Nouvelle réservation créée :", reservationId);

      if (onNotificationSuccess) {
        onNotificationSuccess(newReservation);
        setNewOrder(newReservation);
        console.log(
          "Add reservation Component: RESA reçue dans DocModal onNotificationSuccess :",
          newReservation
        );
      } else {
        console.error(
          "❌ ERREUR : onNotificationSuccess  est undefined dans le Child ! AddOrdeReparationModal"
        );
      }

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
        await axios.post("/details", {
          ...detail,
          documentType: "Reservation",
          reservationId,
        });
      }

      // 3. Mettre à jour le devis pour le fermer (isClosed: true)
      await axios.put(`/quotes/${orderId}`, {
        isClosed: true,
      });

      // 4. Notifications + actions UI
      setCollectionName("reservations");
      if (onEventTriggered) onEventTriggered();
      handleResaCReated(newReservation);
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
    if (displayNotification) displayNotification();
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    console.log("fermeture du popup");
  };
  const [facture, setFacture] = useState(null);

  useEffect(() => {
    if (editedEvent) {
      const updateEvent = async () => {
        console.log("📦 Début de la mise à jour des documents...");

        const tasks = [
          { collection: "orders", id: editedEvent.id },
          { collection: "reservations", id: editedEvent.id },
          { collection: "quotes", id: editedEvent.id }, // devis → quotes en API
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

        console.log("✅ Mise à jour des documents terminée.");
      };

      updateEvent();
    }
  }, [facture]);

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

  const [newOrder, setNewOrder] = useState({});

  const handleORCReated = (valeur) => {
    if (onNotificationSuccess) {
      onNotificationSuccess(valeur);
      setNewOrder(valeur);
      console.log(
        "DocModal file: ***********************################################************************* NEWORDER **********************#####################********************",
        valeur
      );

      console.log("OR reçue dans DocumentModal handleORCReated :");
    } // Envoie la facture au Grand-parent (Planning)
    else {
      console.error(
        "❌ ERREUR : onNotificationSuccess  est undefined dans le Child !"
      );
    }
  };

  const handleResaCReated = (valeur) => {
    if (onNotificationSuccess) {
      //  onNotificationSuccess();

      setNewOrder(valeur);

      onSearchAfterDevisResa();
      console.log("Resa reçue dans DocumentModal handleResaCReated :");
    } // Envoie la facture au Grand-parent (Planning)
    else {
      console.error(
        "❌ ERREUR : onNotificationSuccess  est undefined dans le Child !"
      );
    }
  };
  return (
    <>
      {showPopup && (
        <Notification
          message={notification.message}
          handleClose={handleClosePopup}
          dataEvent={{
            ...editedEvent,
            id: newOrder.id ? newOrder.id : editedEvent.id,
          }}
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
                  name="Client.name"
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
                />
                <TextField
                  label="Adresse"
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
                />
                <TextField
                  label="Code postal"
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
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
                  disabled={
                    editedEvent?.createdAt &&
                    dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                    collectionName === "factures"
                  }
                />
              </Grid>
            </Grid>

            {/* Table pour afficher les détails */}
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
              <Table size="small" aria-label="Event Details Table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        width: "60%",
                        ...cellStyle,
                        fontWeight: "bold",
                      }}
                    >
                      Libellé / travaux / articles
                    </TableCell>
                    <TableCell sx={{ width: "10%", ...cellStyle }}>
                      Quantité
                    </TableCell>
                    <TableCell sx={{ width: "10%", ...cellStyle }}>
                      Prix Unitaire
                    </TableCell>
                    <TableCell sx={{ width: "10%", ...cellStyle }}>
                      Remise
                    </TableCell>
                    {/* <TableCell sx={{ width: "10%", ...cellStyle }}>
                    Remise en %
                  </TableCell> */}
                    <TableCell sx={{ width: "10%", ...cellStyle }}>
                      Total
                    </TableCell>
                    <TableCell sx={{ width: "10%", ...cellStyle }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details &&
                    details.map((detail, index) => (
                      <TableRow key={detail.id}>
                        <TableCell sx={{ fontSize: "0.8rem", ...cellStyle }}>
                          <TextField
                            value={detail.label}
                            onChange={(e) =>
                              handleDetailChange(index, "label", e.target.value)
                            }
                            size="small"
                            fullWidth
                            disabled={
                              editedEvent?.createdAt &&
                              dayjs(editedEvent.createdAt).isBefore(
                                dayjs(),
                                "day"
                              ) &&
                              collectionName === "factures"
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", ...cellStyle }}>
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
                            disabled={
                              editedEvent?.createdAt &&
                              dayjs(editedEvent.createdAt).isBefore(
                                dayjs(),
                                "day"
                              ) &&
                              collectionName === "factures"
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", ...cellStyle }}>
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
                            disabled={
                              editedEvent?.createdAt &&
                              dayjs(editedEvent.createdAt).isBefore(
                                dayjs(),
                                "day"
                              ) &&
                              collectionName === "factures"
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", ...cellStyle }}>
                          <TextField
                            type="text" // Permet la saisie libre (montant ou pourcentage)
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
                            disabled={
                              editedEvent?.createdAt &&
                              dayjs(editedEvent.createdAt).isBefore(
                                dayjs(),
                                "day"
                              ) &&
                              collectionName === "factures"
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ width: "10%", ...cellStyle }}>
                          {calculateLineTotal(detail).toFixed(2)}
                        </TableCell>

                        <TableCell sx={{ fontSize: "0.8rem", ...cellStyle }}>
                          <Button
                            onClick={() => removeDetailRow(index)}
                            disabled={
                              editedEvent?.createdAt &&
                              dayjs(editedEvent.createdAt).isBefore(
                                dayjs(),
                                "day"
                              ) &&
                              collectionName === "factures"
                            }
                          >
                            SUPP
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <Alert severity="info">
                Toutes les nouvelles factures ne sont plus modifiables après
                minuit.
              </Alert>
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
                disabled={
                  editedEvent?.createdAt &&
                  dayjs(editedEvent.createdAt).isBefore(dayjs(), "day") &&
                  collectionName === "factures"
                }
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
                  disabled={
                    editedEvent?.createdAt &&
                    typeof editedEvent.createdAt.toDate === "function" &&
                    dayjs(editedEvent?.createdAt?.toDate()).isBefore(
                      dayjs(),
                      "day"
                    ) &&
                    collectionName === "factures"
                  }
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
                  disabled={
                    editedEvent?.createdAt &&
                    typeof editedEvent.createdAt.toDate === "function" &&
                    dayjs(editedEvent?.createdAt?.toDate()).isBefore(
                      dayjs(),
                      "day"
                    ) &&
                    collectionName === "factures"
                  }
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
                    disabled={
                      editedEvent?.createdAt &&
                      typeof editedEvent.createdAt.toDate === "function" &&
                      dayjs(editedEvent?.createdAt?.toDate()).isBefore(
                        dayjs(),
                        "day"
                      ) &&
                      collectionName === "factures"
                    }
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
                    disabled={
                      editedEvent?.createdAt &&
                      typeof editedEvent.createdAt.toDate === "function" &&
                      dayjs(editedEvent?.createdAt?.toDate()).isBefore(
                        dayjs(),
                        "day"
                      ) &&
                      collectionName === "factures"
                    }
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
        )}
        <DialogActions>
          {collectionName === "reservations" && (
            <>
              <Button onClick={onClose} variant="contained" color="primary">
                Annuler
              </Button>{" "}
              <Button
                onClick={handleOpenOrSup}
                variant="contained"
                color="primary"
              >
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
                    Voulez-vous supprimer la réservation?
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
              <Button
                onClick={handleOpenOr}
                color="primary"
                variant="contained"
              >
                Modifier
              </Button>
              <ReservationTemplate2
                editedEvent={editedEvent}
                details={details || []}
              />{" "}
              <InvoiceTemplate
                editedEvent={editedEvent}
                details={details || []}
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
              <Button onClick={onClose} variant="contained" color="primary">
                Annuler
              </Button>{" "}
              <Button
                onClick={handleOpenOrSup}
                variant="contained"
                color="primary"
              >
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
                    Voulez-vous supprimer le devis ?
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
                variant="contained"
                color="primary"
              >
                Annuler
              </Button>{" "}
              <Button
                onClick={() => {
                  handleOpenOr(); // Fermer EventModal via la prop closeEventModal
                }}
                color="primary"
                variant="contained"
                disabled={
                  editedEvent?.createdAt &&
                  dayjs(editedEvent.createdAt).isBefore(dayjs(), "day")
                }
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
          onNotificationSuccess={handleORCReated}
        />
      )}
    </>
  );
}

export default DocModal;
