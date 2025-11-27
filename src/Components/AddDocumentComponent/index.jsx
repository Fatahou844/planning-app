import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  MenuItem,
  Modal,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ClientSearch from "../../Components/ClientSearch/ClientSearch";
import { useAxios } from "../../utils/hook/useAxios";
import Notification from "../Notification";
// import jumelles from "../../assets/images/jumelles.png";
import { useEffect, useState } from "react";
import eventsData from "../../data/eventsData.json";
import EmailSearch from "../EmailSearch/EmailSearch";
import FirstnameSearch from "../FirstnameSearch/FirstnameSearch";
import ForfaitSearch from "../ForfaitSearch";
import PlateNumberSearch from "../PlateNumberSearch/PlateNumberSearch";
import UserSearch from "../UserSearch/UserSearch";
export default function AddDocumentComponent({ onDocumentCreated }) {
  const axios = useAxios();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [selectedDate, setSelectedDate] = useState("");
  const [categories, setCategories] = useState([]);

  const cellStyle = {
    textAlign: "center",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
  };
  const [garageInfo, setGarageInfo] = useState({
    name: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    dayValidityQuote: "",
    noteLegal: "",
    logo: null,
  });

  const [Client, SetClient] = useState({
    name: "",
    firstName: "",
    address: "",
    email: "",
    phone: "",
    postalCode: "",
    city: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState(eventsData);
  const [selectedNewEvents, setSelectedNewEvents] = useState([]);
  const [configExample, setconfigExample] = useState({
    startHour: 8,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
  });
  const [dataEventsNofications, setDataEventsNotifications] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState({
    id: "event-1",
    title: "Entretiens",
    person: "John Doe",
    operationType: "Maintenance",
    startHour: 7,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
  });
  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  const handleSelectClient = (client) => {
    SetClient(client);
    console.log("Client sélectionné :", client);
  };
  const [facture, setFacture] = useState(null);
  const [dataEvents, setDataEvents] = useState([]);

  const [Operator, setOperator] = useState({
    name: "",
    firstName: "",
    email: "",
  });
  const handleSelectOperator = (operator) => {
    setOperator(operator);
    console.log("operator sélectionné :", operator);
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

  const [Vehicle, setVehicle] = useState({
    plateNumber: "",
    vin: "",
    model: "",
    color: "",
    mileage: "",
    lastCheck: "",
  });

  const [originalVehicle, setOriginalVehicle] = useState(null);

  const [details, setDetails] = useState([
    {
      label: "",
      quantity: "",
      unitPrice: "",
      discountPercent: "",
      discountValue: "",
    },
  ]);
  const [deposit, setDeposit] = useState(0);

  // Callback pour récupérer les updates de l'enfant
  const handleUpdateFromChild = (newDetails, newDeposit) => {
    setDetails(newDetails);
    setDeposit(newDeposit);
  };

  const [newEvent, setNewEvent] = useState({
    title: "",
    person: "",
    operationType: "",
    startHour: "",
    startMinute: "", // Ajout des minutes de début
    endHour: "",
    endMinute: "", // Ajout des minutes de fin
    date: "",
    category: "",
  });

  const [finDate, setFinDate] = useState("");
  const user = { id: 1 };

  const addEvent = async (isMultiDay = false) => {
    // Ajout du paramètre isMultiDay
    // if (!user) {
    //   console.error("User not authenticated");
    //   return; // Sortir si l'utilisateur n'est pas connecté
    // }

    const updatedEvents = [...events]; // Crée une copie de l'array events
    const startDate = new Date(newEvent.date); // Date de début
    const endDate = new Date(finDate); // Date de fin
    const userId = user.id; // UID de l'utilisateur connecté

    // Générer le numéro de commande une seule fois pour l'événement (ou son ensemble)
    // const lastOrderNumber = await getLastOrderNumberForUser(userId);
    const newOrderNumber = 1000;

    {
      // Si l'événement ne couvre qu'une seule journée, ou si isMultiDay est faux
      const singleEvent = {
        ...newEvent,
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
          detail.discountValue?.toString().trim()
        );
      });

      if (validDetails.length)
        await addEventDetails(singleEventDocRef.id, details); // Enregistrer les détails
    }

    // Mettre à jour le dernier numéro de commande utilisé pour cet utilisateur

    // Mettre à jour le state avec les événements ajoutés
    setEvents(updatedEvents);

    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `/documents-garage/order/${getCurrentUser().garageId}/details`
        );

        onDocumentCreated();

        const eventsData = response.data.data;
        setSelectedNewEvents(response.data.data);
        const filteredEvents = eventsData
          .filter((event) => {
            if (event.isClosed) return false;

            const startDate = new Date(event.date);
            const endDate = new Date(event.endDate);
            const current = new Date(selectedDate);

            // Normaliser les dates à 00:00 pour la comparaison
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            current.setHours(0, 0, 0, 0);

            return current >= startDate && current <= endDate;
          })
          .map((event) => {
            const current = new Date(selectedDate);
            const isStartDay =
              new Date(selectedDate).setHours(0, 0, 0, 0) ===
              new Date(event.date).setHours(0, 0, 0, 0);
            const isEndDay =
              new Date(selectedDate).setHours(0, 0, 0, 0) ===
              new Date(event.endDate).setHours(0, 0, 0, 0);

            let startHour = configExample.startHour;
            let startMinute = configExample.startMinute;
            let endHour = configExample.endHour;
            let endMinute = configExample.endMinute;
            let nextDay = true;

            if (isStartDay) {
              startHour = event.startHour;
              startMinute = event.startMinute;
            }

            if (isEndDay) {
              endHour = event.endHour;
              endMinute = event.endMinute;
              nextDay = false;
            }

            return {
              ...event,
              startHour,
              startMinute,
              endHour,
              endMinute,
              nextDay,
            };
          });

        console.log("eventsData", filteredEvents);
      } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
      }
    };

    fetchEvents(); // Appeler la fonction au montage du composant
    handleOpenNotif("OR");

    resetForm();
    setIsModalOpen(false); // Fermer le modal
    SetClient({
      name: "",
      firstName: "",
      address: "",
      email: "",
      phone: "",
      postalCode: "",
      city: "",
    });
    setVehicle({
      plateNumber: "",
      vin: "",
      model: "",
      color: "",
      mileage: "",
      lastCheck: "",
    });
    setOperator({
      name: "",
      firstName: "",
      email: "",
    });
    setReceptor({
      name: "",
      firstName: "",
      email: "",
    });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `/documents-garage/order/${getCurrentUser().garageId}/details`
        );

        const eventsData = response.data.data;
        setSelectedNewEvents(response.data.data);

        const filteredEvents = eventsData
          .filter((event) => {
            if (event.isClosed) return false;

            const startDate = new Date(event.date);
            const endDate = new Date(event.endDate);
            const current = new Date(selectedDate);

            // Normaliser les dates à 00:00 pour la comparaison
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            current.setHours(0, 0, 0, 0);

            return current >= startDate && current <= endDate;
          })
          .map((event) => {
            const current = new Date(selectedDate);
            const isStartDay =
              new Date(selectedDate).setHours(0, 0, 0, 0) ===
              new Date(event.date).setHours(0, 0, 0, 0);
            const isEndDay =
              new Date(selectedDate).setHours(0, 0, 0, 0) ===
              new Date(event.endDate).setHours(0, 0, 0, 0);

            let startHour = configExample.startHour;
            let startMinute = configExample.startMinute;
            let endHour = configExample.endHour;
            let endMinute = configExample.endMinute;
            let nextDay = true;

            if (isStartDay) {
              startHour = event.startHour;
              startMinute = event.startMinute;
            }

            if (isEndDay) {
              endHour = event.endHour;
              endMinute = event.endMinute;
              nextDay = false;
            }

            return {
              ...event,
              startHour,
              startMinute,
              endHour,
              endMinute,
              nextDay,
            };
          });

        setDataEvents(filteredEvents);
        setDataEventsNotifications(filteredEvents);
        console.log("filteredEvents", filteredEvents);
      } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
      }
    };

    fetchEvents();
  }, [, selectedDate, facture]);

  const handleInputChangeFinDate = (e) => {
    setFinDate(e.target.value);
  };

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openOr, setOpenOr] = useState(false);
  const [openResa, setOpenResa] = useState(false);
  const [openDevis, setOpenDevis] = useState(false);
  const [openFacture, setOpenFacture] = useState(false);

  // Fonction pour ouvrir le modal
  const handleOpenOr = () => setOpenOr(true);
  const handleOpenResa = () => setOpenResa(true);
  const handleOpenDevis = () => setOpenDevis(true);
  const handleOpenFacture = () => setOpenFacture(true);

  // Fonction pour fermer le modal
  const handleCloseOr = () => setOpenOr(false);
  const handleCloseResa = () => setOpenResa(false);
  const handleCloseDevis = () => setOpenDevis(false);
  const handleCloseFacture = () => setOpenFacture(false);

  // Fonction pour confirmer l'action
  const handleConfirmOr = () => {
    addEvent(); // Appel de la fonction addEvent
    setCollectName("events");

    handleCloseOr(); // Fermer le modal
  };

  // Fonction pour confirmer l'action
  const handleConfirmResa = () => {
    addReservation(); // Appel de la fonction addEvent
    handleCloseResa(); // Fermer le modal
  };

  // Fonction pour confirmer l'action
  const handleConfirmDevis = () => {
    addDevis(); // Appel de la fonction addEvent
    handleCloseDevis(); // Fermer le modal
  };

  // Fonction pour confirmer l'action
  const handleConfirmFacture = () => {
    addFacture(); // Appel de la fonction addEvent
    handleCloseFacture(); // Fermer le modal
  };
  const [collectName, setCollectName] = useState("factures");

  const handleOpenNotif = (collectionName) => {
    setNotification({
      open: true,
      message: "Votre " + collectionName + " a été crée",
      severity: "success", // Peut être "error", "warning", "info"
    });
    if (collectionName === "reservation") {
      setCollectName("reservations");
    }

    if (collectionName === "OR") {
      setCollectName("events");
    }
    if (collectionName === "devis") {
      setCollectName("devis");
    }
    if (collectionName === "Facture") {
      setCollectName("factures");
    }
    handleShowPopup();
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setNewEvent({
      title: "",
      person: "",
      operationType: "",
      startHour: "",
      startMinute: "",
      endHour: "",
      endMinute: "",
      date: "",
      category: "",
    });
    setFinDate(""); // Réinitialiser la date de fin
  };

  const [showPopup, setShowPopup] = useState(false);

  const handleShowPopup = () => {
    setShowPopup(true);
  };

  const addReservation = async () => {
    // Ajout du paramètre isMultiDay
    // if (!user) {
    //   console.error("User not authenticated");
    //   return; // Sortir si l'utilisateur n'est pas connecté
    // }

    const userId = user.id; // UID de l'utilisateur connecté

    // Générer le numéro de commande une seule fois pour l'événement (ou son ensemble)
    // const lastOrderNumber = await getLastOrderNumberForUser(userId);
    const newOrderNumber = "Resa-" + 1000;

    // Si l'événement ne couvre qu'une seule journée, ou si isMultiDay est faux
    const singleResa = {
      ...newEvent,
      userId: userId,
      title: newOrderNumber, // Utiliser le numéro de commande
      nextDay: false,
    };
    const singleResaDocRef = await addSingleReservation(
      singleResa,
      newOrderNumber,
      "reservation",
      false
    ); // Ajout à Firestore
    const validDetails = details.filter((detail) => {
      return (
        detail.label?.trim() ||
        detail.quantity?.toString().trim() ||
        detail.unitPrice?.toString().trim() ||
        detail.discountPercent?.toString().trim() ||
        detail.discountValue?.toString().trim()
      );
    });

    if (validDetails.length)
      await addEventDetailsGeneric(singleResaDocRef.id, details, "reservation"); // Enregistrer les détails

    // Mettre à jour le dernier numéro de commande utilisé pour cet utilisateur
    handleOpenNotif("réservation");
    setCollectName("reservations");

    resetForm();
    setIsModalOpen(false); // Fermer le modal
    SetClient({
      name: "",
      firstName: "",
      address: "",
      email: "",
      phone: "",
      postalCode: "",
      city: "",
    });
    setVehicle({
      plateNumber: "",
      vin: "",
      model: "",
      color: "",
      mileage: "",
      lastCheck: "",
    });
    setOperator({
      name: "",
      firstName: "",
      email: "",
    });
    setReceptor({
      name: "",
      firstName: "",
      email: "",
    });
  };

  const addDevis = async () => {
    // Ajout du paramètre isMultiDay
    // if (!user) {
    //   console.error("User not authenticated");
    //   return; // Sortir si l'utilisateur n'est pas connecté
    // }

    const userId = user.id; // UID de l'utilisateur connecté

    // Générer le numéro de commande une seule fois pour l'événement (ou son ensemble)
    // const lastOrderNumber = await getLastOrderNumberForUser(userId);
    const newOrderNumber = 1000;

    // Si l'événement ne couvre qu'une seule journée, ou si isMultiDay est faux
    const singleResa = {
      ...newEvent,
      userId: userId,
      nextDay: false,
    };
    const singleResaDocRef = await addSingleReservation(
      singleResa,
      newOrderNumber,
      "devis",
      false
    ); // Ajout à Firestore
    const validDetails = details.filter((detail) => {
      return (
        detail.label?.trim() ||
        detail.quantity?.toString().trim() ||
        detail.unitPrice?.toString().trim() ||
        detail.discountPercent?.toString().trim() ||
        detail.discountValue?.toString().trim()
      );
    });

    if (validDetails.length)
      await addEventDetailsGeneric(singleResaDocRef.id, details, "devis"); // Enregistrer les détails

    // Mettre à jour le dernier numéro de commande utilisé pour cet utilisateur
    handleOpenNotif("devis");

    resetForm();
    setIsModalOpen(false); // Fermer le modal
    SetClient({
      name: "",
      firstName: "",
      address: "",
      email: "",
      phone: "",
      postalCode: "",
      city: "",
    });
    setVehicle({
      plateNumber: "",
      vin: "",
      model: "",
      color: "",
      mileage: "",
      lastCheck: "",
    });
    setOperator({
      name: "",
      firstName: "",
      email: "",
    });
    setReceptor({
      name: "",
      firstName: "",
      email: "",
    });
  };

  const addFacture = async () => {
    // Ajout du paramètre isMultiDay
    // if (!user) {
    //   console.error("User not authenticated");
    //   return; // Sortir si l'utilisateur n'est pas connecté
    // }

    const userId = user.id; // UID de l'utilisateur connecté

    // Générer le numéro de commande une seule fois pour l'événement (ou son ensemble)
    // const lastOrderNumber = await getLastOrderNumberForUser(userId);
    const newOrderNumber = 1000;

    // Si l'événement ne couvre qu'une seule journée, ou si isMultiDay est faux
    const singleResa = {
      ...newEvent,
      userId: userId,
      title: newOrderNumber, // Utiliser le numéro de commande
      nextDay: false,
    };
    const singleResaDocRef = await addSingleReservation(
      singleResa,
      newOrderNumber,
      "facture",
      true
    ); // Ajout à Firestore
    const validDetails = details.filter((detail) => {
      return (
        detail.label?.trim() ||
        detail.quantity?.toString().trim() ||
        detail.unitPrice?.toString().trim() ||
        detail.discountPercent?.toString().trim() ||
        detail.discountValue?.toString().trim()
      );
    });

    if (validDetails.length)
      await addEventDetailsGeneric(singleResaDocRef.id, details, "facture"); // Enregistrer les détails

    // Mettre à jour le dernier numéro de commande utilisé pour cet utilisateur
    handleOpenNotif("Facture");

    resetForm();
    setIsModalOpen(false); // Fermer le modal
    SetClient({
      name: "",
      firstName: "",
      address: "",
      email: "",
      phone: "",
      postalCode: "",
      city: "",
    });
    setVehicle({
      plateNumber: "",
      vin: "",
      model: "",
      color: "",
      mileage: "",
      lastCheck: "",
    });
    setOperator({
      name: "",
      firstName: "",
      email: "",
    });

    setReceptor({
      name: "",
      firstName: "",
      email: "",
    });
  };

  const addEventDetails = async (eventId, details) => {
    try {
      // Filtrer les détails valides (exclut ceux où tous les champs sont vides ou non valides)
      const validDetails = details.filter((detail) => {
        return (
          detail.label?.trim() ||
          detail.quantity ||
          detail.unitPrice ||
          detail.discountPercent ||
          detail.discountValue
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
          discountValue: detail.discountValue || 0,
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

  const addEventDetailsGeneric = async (eventId, details, collectionName) => {
    try {
      // Filtrer les détails valides (exclut ceux où tous les champs sont vides ou non valides)
      const validDetails = details.filter((detail) => {
        return (
          detail.label?.trim() ||
          detail.quantity ||
          detail.unitPrice ||
          detail.discountPercent ||
          detail.discountValue
        );
      });

      // Si aucun détail valide, on sort sans erreur
      if (validDetails.length === 0) {
        console.log("Aucun détail valide à enregistrer.");
        return;
      }

      if (collectionName === "devis")
        // Envoyer chaque détail individuellement via une requête POST à l'API
        for (const detail of validDetails) {
          await axios.post("/details", {
            label: detail.label || "",
            quantity: detail.quantity || 0,
            unitPrice: detail.unitPrice || 0,
            discountPercent: detail.discountPercent || 0,
            discountValue: detail.discountValue || 0,
            documentType: "Quote",
            quoteId: eventId,
          });
        }
      else if (collectionName === "reservation")
        for (const detail of validDetails) {
          await axios.post("/details", {
            label: detail.label || "",
            quantity: detail.quantity || 0,
            unitPrice: detail.unitPrice || 0,
            discountPercent: detail.discountPercent || 0,
            discountValue: detail.discountValue || 0,
            documentType: "Reservation",
            reservationId: eventId,
          });
        }
      else if (collectionName === "facture")
        for (const detail of validDetails) {
          await axios.post("/details", {
            label: detail.label || "",
            quantity: detail.quantity || 0,
            unitPrice: detail.unitPrice || 0,
            discountPercent: detail.discountPercent || 0,
            discountValue: detail.discountValue || 0,
            documentType: "Invoice",
            invoiceId: eventId,
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const responseGarage = await axios.get(
          "/garages/userid/" + getCurrentUser().garageId
        );
        if (responseGarage.data) {
          setGarageInfo(responseGarage.data.data);
          setconfigExample({
            startHour: responseGarage.data.data.startHourTimeline | 0,
            startMinute: responseGarage.data.data.startMinTimeline | 0,
            endHour: responseGarage.data.data.endHourTimeline | 18,
            endMinute: responseGarage.data.data.endMinTimeline | 0,
          });
          console.log(
            "0.-------------------------------- GARAGE INFO global-----------------------",
            responseGarage.data.data
          );
          console.log(
            "1.-------------------------------- GARAGE INFO TIMELINE-----------------------",
            {
              startHour: responseGarage.data.data.startHourTimeline | 0,
              startMinute: responseGarage.data.data.startMinTimeline | 0,
              endHour: responseGarage.data.data.endHourTimeline | 18,
              endMinute: responseGarage.data.data.endMinTimeline | 0,
            }
          );
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "/categories/garage/" + getCurrentUser().garageId
        );

        // Récupérer les données
        const categoriesData = response.data;

        // Extraire les noms des catégories
        const categoryNames = categoriesData.data.map(
          (category) => category.name
        );

        // Mettre à jour les états
        setCategories(categoriesData.data);

        console.log("categoriesData", categoriesData.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      }
    };

    fetchCategories();
  }, []);
  const addSingleEvent = async (event, newOrderNumber, nextDay) => {
    try {
      const order = await axios.post("/orders", {
        date: event.date,
        endDate: finDate,
        startHour: parseInt(event.startHour),
        startMinute: parseInt(event.startMinute),
        endHour: parseInt(event.endHour),
        endMinute: parseInt(event.endMinute),
        categoryId: event.category.id,
        clientId: Client.id,
        vehicleId: Vehicle.id,
        notes: event.notes,
        deposit: deposit,
        isClosed: false,
        userId: event.userId, // UID de l'utilisateur
        nextDay: nextDay,
        garageId: getCurrentUser().garageId,
        operatorId: Operator.id,
        receptionistId: Receptor.id,
      });

      setSelectedEvent({
        id: order.data.id,
        date: event.date,
        endDate: order.data.endDate,
        startHour: parseInt(order.data.startHour),
        startMinute: parseInt(order.data.startMinute),
        endHour: parseInt(order.data.endHour),
        endMinute: parseInt(order.data.endMinute),
        categoryId: event.category.id,
        clientId: Client.id,
        deposit: deposit,
        vehicleId: Vehicle.id,
        operatorId: Operator.id,
        receptionistId: Receptor.id,
        notes: event.notes,
        isClosed: false,
        userId: event.userId, // UID de l'utilisateur
        nextDay: nextDay,
        garageId: getCurrentUser().garageId,

        Client: {
          name: Client.name,
          firstName: Client.firstName,
          address: Client.address,
          postalCode: Client.postalCode,
        },
        Vehicle: {
          mileage: Vehicle.mileage,
          plateNumber: Vehicle.plateNumber,
          lastCheck: Vehicle.lastCheck,
          vin: Vehicle.vin,
          model: Vehicle.model,
          color: Vehicle.color,
        },
      });

      if (
        originalVehicle &&
        (originalVehicle.mileage !== Vehicle.mileage ||
          originalVehicle.lastCheck !== Vehicle.lastCheck)
      ) {
        try {
          await axios.put(`/vehicles/${Vehicle.id}`, {
            mileage: Vehicle.mileage,
            lastCheck: Vehicle.lastCheck,
          });
          console.log("Véhicule mis à jour avec succès");
        } catch (err) {
          console.error("Erreur lors de la mise à jour du véhicule :", err);
        }
      }

      return order.data; // Retourner la référence du document
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const addSingleReservation = async (event, nextDay, collectionName) => {
    try {
      let response = 0;
      if (collectionName == "devis")
        response = await axios.post("/quotes", {
          date: event.date,
          clientId: Client.id,
          vehicleId: Vehicle.id,
          notes: event.notes,
          deposit: deposit,
          isClosed: false,
          userId: event.userId, // UID de l'utilisateur
          nextDay: nextDay,
          garageId: getCurrentUser().garageId,
        });
      else if (collectionName == "facture")
        response = await axios.post("/invoices", {
          date: event.date,
          clientId: Client.id,
          vehicleId: Vehicle.id,
          notes: event.notes,
          deposit: deposit,
          isClosed: false,
          userId: event.userId, // UID de l'utilisateur
          nextDay: nextDay,
          garageId: getCurrentUser().garageId,
        });
      else if (collectionName == "reservation")
        response = await axios.post("/reservations", {
          date: event.date,
          clientId: Client.id,
          vehicleId: Vehicle.id,
          deposit: deposit,
          notes: event.notes,
          isClosed: false,
          userId: event.userId, // UID de l'utilisateur
          nextDay: nextDay,
          garageId: getCurrentUser().garageId,
        });

      setSelectedEvent({
        id: response.data.id,
        date: event.date,

        notes: event.notes,

        clientId: Client.id,
        vehicleId: Vehicle.id,
        deposit: deposit,

        operatorId: Operator.id,
        receptionistId: Receptor.id,

        isClosed: false,
        userId: event.userId, // UID de l'utilisateur
        garageId: getCurrentUser().garageId,
        Client: {
          name: Client.name,
          firstName: Client.firstName,
          address: Client.address,
          postalCode: Client.postalCode,
          city: Client.city,
          phone: Client.phone,
          email: Client.email,
        },
        Vehicle: {
          mileage: Vehicle.mileage,
          plateNumber: Vehicle.plateNumber,
          lastCheck: Vehicle.lastCheck,
          vin: Vehicle.vin,
          model: Vehicle.model,
          color: Vehicle.color,
        },
      });

      if (
        originalVehicle &&
        (originalVehicle.mileage !== Vehicle.mileage ||
          originalVehicle.lastCheck !== Vehicle.lastCheck)
      ) {
        try {
          await axios.put(`/vehicles/${Vehicle.id}`, {
            mileage: Vehicle.mileage,
            lastCheck: Vehicle.lastCheck,
          });
          console.log("Véhicule mis à jour avec succès");
        } catch (err) {
          console.error("Erreur lors de la mise à jour du véhicule :", err);
        }
      }

      return response.data; // Retourner la référence du document
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const handleDetailChange = (event, index) => {
    const { name, value } = event.target;
    const updatedDetails = [...details];

    let rawValue = value.trim();
    const normalizedValue = rawValue.replace(",", ".");

    if (name === "discountValue" || name === "discountPercent") {
      // (Pas besoin de changer ici, ça marche déjà bien)
      updatedDetails[index].discountValue = "";
      updatedDetails[index].discountPercent = "";

      if (normalizedValue.includes("%")) {
        const percent = parseFloat(normalizedValue.replace("%", ""));
        if (!isNaN(percent)) {
          updatedDetails[index].discountPercent = percent;
        }
      } else if (normalizedValue !== "") {
        const amount = parseFloat(normalizedValue);
        if (!isNaN(amount)) {
          updatedDetails[index].discountValue = amount;
        }
      }

      updatedDetails[index].inputValue = rawValue;
    } else if (name === "quantity" || name === "unitPrice") {
      updatedDetails[index][`${name}Input`] = rawValue; // pour afficher ce que tape l’utilisateur

      const numericValue = parseFloat(normalizedValue);
      if (!isNaN(numericValue)) {
        updatedDetails[index][name] = numericValue; // la vraie valeur utilisée pour les calculs
      } else {
        updatedDetails[index][name] = 0; // ou null si tu préfères
      }
    } else {
      updatedDetails[index][name] = value || "";
    }

    setDetails(updatedDetails);
    setNewEvent({ ...newEvent, price: totalTTC });
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
  const totalTTC = details.reduce(
    (sum, detail) => sum + calculateLineTotal(detail),
    0
  );
  const totalHT = totalTTC / 1.2; // Ajouter 20% de TVA

  // Fonction pour ajouter une nouvelle ligne de détails
  const addDetailRow = () => {
    setDetails((prevDetails) => [
      ...prevDetails,
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

  // Fonction pour supprimer une ligne de détails
  const removeDetailRow = (index) => {
    setDetails((prevDetails) => prevDetails.filter((_, i) => i !== index));
  };

  const handleSelectVehicle = (vehicle) => {
    setVehicle(vehicle);
    setOriginalVehicle(vehicle);
    console.log("Vehicule sélectionné :", vehicle);
  };

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Si le champ est une catégorie, on met à jour l'objet "category" de newEvent
    if (name === "category") {
      const selectedCat = categories.find((cat) => cat.id === value);
      setNewEvent((prevEvent) => ({
        ...prevEvent,
        category: {
          id: selectedCat.id,
          name: selectedCat.name,
          color: selectedCat.color,
        },
      }));
    } else if (name === "startTime") {
      const isValid = /^\d{0,4}$/.test(value); // Format HHMM

      if (isValid || value === "") {
        // Si valide, extraire heure et minute
        const startHour = isValid ? value.slice(0, 2) : "";
        const startMinute = isValid ? value.slice(2, 4) : "";

        // Mettre à jour les états startHour et startMinute
        setNewEvent((prev) => ({
          ...prev,
          startHour,
          startMinute,
        }));
      }
    }

    // Gestion de endTime
    else if (name === "endTime") {
      const isValid = /^\d{0,4}$/.test(value); // Format HHMM
      if (isValid || value === "") {
        const endHour = isValid ? value.slice(0, 2) : "";
        const endMinute = isValid ? value.slice(2, 4) : "";
        setNewEvent((prev) => ({
          ...prev,
          endHour,
          endMinute,
        }));
      }
    } else {
      setNewEvent({ ...newEvent, [name]: value });
    }

    if (name === "date") {
      setFinDate(e.target.value);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    console.log("fermeture du popup");
  };

  return (
    <>
      {showPopup && (
        <Notification
          message={notification.message}
          handleClose={handleClosePopup}
          collectionName={collectName}
          dataEvent={selectedEvent}
          dataDetails={details}
        />
      )}
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: 120, // Ajuste la largeur pour s'assurer que le texte est visible
          padding: "8px 16px", // Ajuste le remplissage pour le rendre plus spacieux
          borderRadius: "8px", // Optionnel : ajoute un bord arrondi
        }}
        onClick={() => {
          setIsModalOpen(true);
          setDetails([]);
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          SetClient({
            name: "",
            firstName: "",
            address: "",
            email: "",
            phone: "",
            postalCode: "",
            city: "",
          });
          setVehicle({
            plateNumber: "",
            vin: "",
            model: "",
            color: "",
            mileage: "",
            lastCheck: "",
          });
          setOperator({
            name: "",
            firstName: "",
            email: "",
          });
          setReceptor({
            name: "",
            firstName: "",
            email: "",
          });
        }}
        PaperProps={{
          style: {
            width: "1200px", // Remplacez par la largeur souhaitée
            maxWidth: "none", // Supprimez la largeur maximale par défaut
          },
        }}
      >
        <DialogTitle>Ajouter</DialogTitle>
        <DialogContent>
          <form>
            <Grid container spacing={2}>
              {/* Colonne 1: Infos client */}
              <Grid item xs={12} md={6}>
                <Typography variant="body1">Informations Client</Typography>
                <ClientSearch
                  onSelectClient={handleSelectClient}
                  Client={Client}
                />
                <FirstnameSearch
                  onSelectClient={handleSelectClient}
                  Client={Client}
                />
                <TextField
                  label="Téléphone"
                  name="phone"
                  value={Client.phone}
                  onChange={handleInputChange}
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
                <EmailSearch
                  onSelectClient={handleSelectClient}
                  Client={Client}
                />

                <TextField
                  placeholder="Adresse"
                  name="adresse"
                  value={Client.address}
                  onChange={handleInputChange}
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
                  placeholder="Code postal"
                  name="postale"
                  value={Client.postalCode}
                  onChange={handleInputChange}
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
                  placeholder="Ville"
                  name="ville"
                  value={Client.city}
                  onChange={handleInputChange}
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
                {/* <TextField
                          label="Immatriculation"
                          name="plateNumber"
                          value={newEvent.plateNumber}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                          size="small"
                          sx={{
                            height: "30px",
                            "& .MuiInputBase-root": { fontSize: "0.8rem" },
                            "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                          }}
                        /> */}
                <PlateNumberSearch
                  onSelectClient={handleSelectVehicle}
                  Client={Client}
                />
                <TextField
                  placeholder="VIN"
                  name="vin"
                  value={Vehicle.vin}
                  onChange={handleInputChange}
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
                  placeholder="Modèle"
                  name="model"
                  value={Vehicle.model}
                  onChange={handleInputChange}
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
                  placeholder="Couleur"
                  name="color"
                  value={Vehicle.color}
                  onChange={handleInputChange}
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
                  placeholder="kilométrage"
                  name="mileage"
                  value={Vehicle.mileage}
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
                  value={Vehicle.lastCheck}
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
              <ForfaitSearch
                onChange={(newDetails, newDeposit) => {
                  setDetails(newDetails);
                  setDeposit(newDeposit);
                }}
              ></ForfaitSearch>
              <Grid container spacing={2} item xs={12} md={12}>
                {/* Colonne 1: Infos  sur les travaux */}
                <Grid item xs={12} md={6}>
                  {/* <Typography variant="h6">
                            Informations Événement
                          </Typography> */}

                  <TextField
                    label="Notes"
                    name="notes"
                    value={newEvent.notes}
                    onChange={handleInputChange}
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
                    value={newEvent.price}
                    placeholder="Prix"
                    onChange={handleInputChange}
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
                      marginTop: "1.1rem",
                    }}
                  >
                    <UserSearch
                      onSelectUser={handleSelectOperator}
                      garageId={getCurrentUser().garageId}
                      NameAttribute="Opérateur"
                    ></UserSearch>
                    <UserSearch
                      onSelectUser={handleSelectReceptor}
                      garageId={getCurrentUser().garageId}
                      NameAttribute="Récepteur"
                    ></UserSearch>
                  </Box>

                  <Grid container spacing={2}>
                    {/* Section Date de l'événement et Heure de début */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1">Date de départ</Typography>
                      <TextField
                        name="date"
                        type="date"
                        value={newEvent.date}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
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

                    {/* Section Date de fin et Heure de fin */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1">Date de fin</Typography>
                      <TextField
                        name="finDate"
                        type="date"
                        value={finDate}
                        onChange={handleInputChangeFinDate}
                        fullWidth
                        margin="normal"
                        required
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
                          value={
                            `${newEvent.startHour}${newEvent.startMinute}` || ""
                          }
                          onChange={handleInputChange}
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
                                  Heure : {newEvent.startHour || "Non définie"}{" "}
                                  Minute : {newEvent.startMinute || "Non définie"}
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
                            `${newEvent.endHour}${newEvent.endMinute}` || ""
                          }
                          onChange={handleInputChange}
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
                                  Heure : {newEvent.endHour || "Non définie"}{" "}
                                  Minute : {newEvent.endMinute || "Non définie"}
                                </Typography>
                              </Box> */}
                    </Grid>
                  </Grid>

                  <TextField
                    select
                    label="Catégorie"
                    name="category"
                    value={newEvent.category.id}
                    onChange={handleInputChange}
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
                  onClick={handleOpenOr}
                >
                  Créer un OR
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
                      id="confirmation-modal-description"
                      sx={{ mt: 2, mb: 4 }}
                    >
                      Voulez-vous créer un OR ?
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
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenResa}
                >
                  Créer une résa
                </Button>
                <Modal
                  open={openResa}
                  onClose={handleCloseResa}
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
                      id="confirmation-modal-description"
                      sx={{ mt: 2, mb: 4 }}
                    >
                      Voulez-vous créer une réservation ?
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
                        onClick={handleCloseResa}
                      >
                        Non
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmResa}
                      >
                        Oui
                      </Button>
                    </Box>
                  </Box>
                </Modal>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenDevis}
                >
                  Créer un Devis
                </Button>
                <Modal
                  open={openDevis}
                  onClose={handleCloseDevis}
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
                      id="confirmation-modal-description"
                      sx={{ mt: 2, mb: 4 }}
                    >
                      Voulez-vous créer un devis ?
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
                        onClick={handleCloseDevis}
                      >
                        Non
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmDevis}
                      >
                        Oui
                      </Button>
                    </Box>
                  </Box>
                </Modal>
              </Grid>

              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenFacture}
                >
                  Facturer
                </Button>
                <Modal
                  open={openFacture}
                  onClose={handleCloseFacture}
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
                      id="confirmation-modal-description"
                      sx={{ mt: 2, mb: 4 }}
                    >
                      Voulez-vous créer une facture ?
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
                        onClick={handleCloseFacture}
                      >
                        Non
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmFacture}
                      >
                        Oui
                      </Button>
                    </Box>
                  </Box>
                </Modal>
              </Grid>

              {/* <Grid item>
                        <InvoiceTemplateWithoutOR
                          NewEvent={newEvent}
                          details={details}
                          onInvoiceExecuted={handleChildInvoice}
                        />{" "}
                      </Grid> */}
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setIsModalOpen(false);
                    SetClient({
                      name: "",
                      firstName: "",
                      address: "",
                      email: "",
                      phone: "",
                      postalCode: "",
                      city: "",
                    });
                    setVehicle({
                      plateNumber: "",
                      vin: "",
                      model: "",
                      color: "",
                      mileage: "",
                      lastCheck: "",
                    });
                    setOperator({
                      name: "",
                      firstName: "",
                      email: "",
                    });
                    setReceptor({
                      name: "",
                      firstName: "",
                      email: "",
                    });
                  }}
                >
                  SORTIR
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
}
