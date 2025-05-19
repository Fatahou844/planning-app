import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LogoutIcon from "@mui/icons-material/Logout"; // Icone de plus pour le bouton flottant
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs"; // ou luxon selon ta préférence
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import ClientSearch from "../../Components/ClientSearch/ClientSearch";
import eventsData from "../../data/eventsData.json";
import { db } from "../../hooks/firebaseConfig"; // Votre configuration Firestore
import DocModal from "../DocModal";
import DocumentModal from "../DocumentModal";
import EventModal from "../EventModal";
import Notification from "../Notification";

import logoGarage from "../../assets/images/garageLogo.jpg";
import jumelles from "../../assets/images/jumelles.png";
import { useAxios } from "../../utils/hook/useAxios";
import EmailSearch from "../EmailSearch/EmailSearch";
import FirstnameSearch from "../FirstnameSearch/FirstnameSearch";
import PlateNumberSearch from "../PlateNumberSearch/PlateNumberSearch";
import UserSearch from "../UserSearch/UserSearch";

const Timeline = () => (
  <Box
    sx={{
      display: "grid",
      //   justifyContent: "space-between",
      marginBottom: "1.8rem",
      height: "100%", // S'assurer que la timeline remplit tout l'espace disponible
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1, // Bas pour laisser les éléments s'afficher au-dessus
      //  marginLeft: "1.5rem",
      gridTemplateColumns: "repeat(24,minmax(50px,1fr))",
    }}
  >
    {[...Array(24).keys()].map((halfHour) => (
      <Box
        key={halfHour}
        sx={{
          flexGrow: 1,
          textAlign: "left", // Aligner les horaires à gauche du bloc
          borderRight: "1px solid lightgray",
          backgroundColor: halfHour % 2 === 0 ? "#f0f0f0" : "#ffffff",
          position: "relative",
          height: "100%", // Étendre le fond de chaque élément sur toute la hauteur
        }}
      >
        <Typography
          variant="caption"
          sx={{
            paddingLeft: "0.5rem", // Ajouter un petit espace pour le texte
            position: "relative",
            zIndex: 1,
            marginLeft: "-1.499rem",
          }}
        >
          {/* {7 + Math.floor(halfHour / 2)}:{halfHour % 2 === 0 ? "00" : "30"} */}
          {(7 + Math.floor(halfHour / 2)).toString().padStart(2, "0")}:
          {halfHour % 2 === 0 ? "00" : "30"}
        </Typography>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: halfHour % 2 === 0 ? "#f0f0f0" : "#ffffff",
            zIndex: 0,
          }}
        />
      </Box>
    ))}
  </Box>
);

const CurrentTimeLine = ({ currentHour }) => {
  const minutes = new Date().getMinutes();
  const adjustedHour = currentHour + minutes / 60; // Convertit l'heure actuelle en fraction

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: `${((adjustedHour - 7) / 12) * 100}%`,
        width: "2px",
        height: "100%",
        backgroundColor: "blue",
        zIndex: 1,
      }}
    />
  );
};

const Planning = () => {
  const axios = useAxios();
  const today = dayjs();
  const [events, setEvents] = useState(eventsData);
  const [dataEvents, setDataEvents] = useState([]);
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpen2, setModalOpen2] = useState(false);
  const [modalOpen3, setModalOpen3] = useState(false);
  const [facture, setFacture] = useState(null);

  const [collectionName, setCollectionName] = useState("");

  const [expanded, setExpanded] = useState([
    "Entretien / Révision",
    "Rapide",
    "Mécanique",
    "Électricité",
    "Climatisation",
  ]);
  const [categories, setCategories] = useState([]);
  const user = { id: 1 };

  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

  console.log(
    "***************************** AXIOS *****************************",
    axios
  );

  useEffect(() => {
    const today = new Date();
    // Formatage de la date en YYYY-MM-DD
    const formattedDate = today.toISOString().split("T")[0];
    setSelectedDate(formattedDate); // Initialiser le state avec la date d'aujourd'hui
  }, []); // État pour stocker la date sélectionnée  handleSearchClick

  useEffect(() => {
    handleSearchClickFull();
  }, [facture]);

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const responseGarage = await axios.get(
          "/garages/" + getCurrentUser().garageId
        );
        if (responseGarage.data) {
          setGarageInfo(responseGarage.data.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      }
    };

    fetchCategories();
  }, []);
  // const handleDateChange = (e) => {
  //   setSelectedDate(e.target.value); // Met à jour l'état avec la date sélectionnée
  // };
  // Utilisation de useEffect pour récupérer les catégories depuis Firestore

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
        setExpanded(categoryNames);
        setCategories(categoriesData.data);

        console.log("categoriesData", categoriesData.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
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

    fetchEvents();
  }, [selectedDate, facture]); // Dépendances pour recharger les données

  const currentHour = new Date().getHours();

  const handleEventClick = (event) => {
    console.log("EVENT CURRENT", event);
    setSelectedEvent(event);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    console.log("FERMETURE");
  };

  const handleModalClose2 = () => {
    setModalOpen2(false);
    console.log("modalOpen2", modalOpen2);
  };

  const handleModalClose3 = () => {
    setModalOpen3(false);
    console.log("modalOpen2", modalOpen2);
  };

  // Fonctions pour assigner les couleurs
  const getCategoryColor = (category) => {
    const colors = ["#FFB74D", "#64B5F6", "#81C784", "#9575CD", "#FF8A65"];
    // return colors[index % colors.length];
    return category.color;
  };

  // État pour afficher/masquer le modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // État pour stocker les nouvelles données du formulaire
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

    if (startDate.getTime() !== endDate.getTime()) {
      // Cas où les événements couvrent plusieurs jours

      // Ajout du premier événement pour la date de début
      const firstEventEndHour = 19; // Heure de fin de la journée
      const firstEventEndMinute = 0; // Fin de la journée à 18:00
      const firstEvent = {
        ...newEvent,
        endHour: firstEventEndHour,
        endMinute: firstEventEndMinute,
        userId: userId,
        title: newOrderNumber, // Utiliser le même numéro de commande
      };
      const singleEventDocRef = await addSingleEvent(
        firstEvent,
        newOrderNumber,
        true
      ); // Ajout à Firestore
      const IsvalidDetails = details.filter((detail) => {
        return (
          detail.label?.trim() ||
          detail.quantity?.toString().trim() ||
          detail.unitPrice?.toString().trim() ||
          detail.discountPercent?.toString().trim() ||
          detail.discountAmount?.toString().trim()
        );
      });

      if (IsvalidDetails.length)
        await addEventDetails(singleEventDocRef.id, details); // Enregistrer les détails

      // Ajout des événements pour les jours intermédiaires (si applicable)
      let currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + 1); // Premier jour après la date de début
      while (currentDate < endDate) {
        const dailyEvent = {
          ...newEvent,
          date: formatDate(currentDate),
          startHour: 7,
          startMinute: 0,
          endHour: 19,
          endMinute: 0,
          userId: userId,
          title: newOrderNumber, // Utiliser le même numéro de commande pour chaque jour
        };
        const singleEventDocRef = await addSingleEvent(
          dailyEvent,
          newOrderNumber,
          true
        ); // Ajout à Firestore
        if (IsvalidDetails.length)
          await addEventDetails(singleEventDocRef.id, details); // Enregistrer les détails
        currentDate.setDate(currentDate.getDate() + 1); // Incrémenter la date
      }

      // Ajout du dernier événement pour la date de fin
      const lastEvent = {
        ...newEvent,
        date: finDate,
        startHour: 7,
        startMinute: 0,
        endHour: parseInt(newEvent.endHour), // Heure réelle de fin
        endMinute: parseInt(newEvent.endMinute),
        userId: userId,
        title: newOrderNumber, // Utiliser le même numéro de commande
        nextDay: false,
      };
      const lastEventDocRef = await addSingleEvent(
        lastEvent,
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
        await addEventDetails(lastEventDocRef.id, details); // Enregistrer les détails
    } else {
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
          detail.discountAmount?.toString().trim()
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
        detail.discountAmount?.toString().trim()
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
        detail.discountAmount?.toString().trim()
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
        detail.discountAmount?.toString().trim()
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

  const addEventDetailsGeneric = async (eventId, details, collectionName) => {
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

      console.log(
        "############## validDetails ####################",
        validDetails
      );

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
            discountAmount: detail.discountAmount || 0,
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
            discountAmount: detail.discountAmount || 0,
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
            discountAmount: detail.discountAmount || 0,
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

  // const getLastOrderNumberForUser = async (userId) => {
  //   const docRef = doc(db, "userOrderNumbers", userId); // Document unique pour chaque userId
  //   const docSnap = await getDoc(docRef);

  //   if (docSnap.exists()) {
  //     return docSnap.data().lastOrderNumber; // Récupère le dernier numéro
  //   } else {
  //     // Si le document n'existe pas encore, on commence à 00000 pour cet utilisateur
  //     return 0;
  //   }
  // };

  // Fonction pour générer un numéro de commande formaté à 5 chiffres
  const generateOrderNumber = (lastOrderNumber) => {
    const newOrderNumber = lastOrderNumber + 1;
    return newOrderNumber.toString().padStart(5, "0"); // Format à 5 chiffres
  };

  const addSingleEvent = async (event, newOrderNumber, nextDay) => {
    try {
      const order = await axios.post("/orders", {
        date: event.date,
        startHour: parseInt(event.startHour),
        startMinute: parseInt(event.startMinute),
        endHour: parseInt(event.endHour),
        endMinute: parseInt(event.endMinute),
        categoryId: event.category.id,
        clientId: Client.id,
        vehicleId: Vehicle.id,
        notes: event.notes,
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
        startHour: parseInt(event.startHour),
        startMinute: parseInt(event.startMinute),
        endHour: parseInt(event.endHour),
        endMinute: parseInt(event.endMinute),
        categoryId: event.category.id,
        clientId: Client.id,
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

      return response.data; // Retourner la référence du document
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
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

  // Gérer la saisie dans le formulaire
  const handleInputChangeFinDate = (e) => {
    setFinDate(e.target.value);
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

  const [searchQuery, setSearchQuery] = useState("");
  const [dataEventsAll, setDataEventsAll] = useState([]);
  const [collectName, setCollectName] = useState("factures");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  async function handleSearchClick() {
    const keyword = searchQuery.trim().toLowerCase();

    // Liste des collections à rechercher
    const collections = {
      reservations: "reservation",
      devis: "quote",
      factures: "invoice",
      events: "order",
    };

    try {
      // Préparer les requêtes pour chaque collection
      const collectionPromises = Object.entries(collections).map(
        async ([collectionKey, apiEndpoint]) => {
          const url = `/documents-garage/${apiEndpoint}/${
            getCurrentUser().garageId
          }/details`;

          // Effectuer la requête GET
          const response = await axios.get(url);

          if (!response || !response.data) {
            console.log(`Aucune donnée trouvée pour ${collectionKey}`);
            return [];
          }

          // Ajouter le nom de la collection à chaque objet dans la réponse
          const filtResults = response.data.data.map((item) => ({
            ...item,
            collectionName: collectionKey, // Ajouter le nom de la collection
          }));

          // Filtrer les résultats en fonction du mot-clé
          const filteredResults = filtResults.filter((item) => {
            return (
              item?.Client?.firstName?.toLowerCase().includes(keyword) ||
              item?.Client?.name?.toLowerCase().includes(keyword) ||
              item?.Client?.email?.toLowerCase().includes(keyword)
            );
          });

          console.log(
            "############  filteredResults ####################",
            filtResults
          );

          // Appliquer le filtre "isClosed === false" pour toutes sauf factures
          return collectionKey !== "factures"
            ? filteredResults.filter((item) => item.isClosed === false)
            : filteredResults;
        }
      );

      // Attendre les résultats de toutes les collections
      const allCollectionsResults = (
        await Promise.all(collectionPromises)
      ).flat();

      // Suppression des doublons
      const uniqueResults = allCollectionsResults.filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.id === value.id && t.collectionName === value.collectionName
          )
      );

      console.log("Résultats combinés :", uniqueResults);

      // Mettre à jour l'état avec les résultats
      setDataEventsAll(
        uniqueResults.filter((item) =>
          dayjs(item.createdAt).isSame(today, "day")
        )
      );
      setOpen(true); // Ouvre le dialogue après la recherche
    } catch (error) {
      console.error("Erreur lors de la recherche des collections :", error);
    }
  }

  async function handleSearchClickFull() {
    const keyword = searchQuery.trim().toLowerCase();

    // Liste des collections à rechercher
    const collections = {
      reservations: "reservation",
      devis: "quote",
      factures: "invoice",
      events: "order",
    };

    try {
      // Préparer les requêtes pour chaque collection
      const collectionPromises = Object.entries(collections).map(
        async ([collectionKey, apiEndpoint]) => {
          const url = `/documents-garage/${apiEndpoint}/${
            getCurrentUser().garageId
          }/details`;

          // Effectuer la requête GET
          const response = await axios.get(url);

          if (!response || !response.data) {
            console.log(`Aucune donnée trouvée pour ${collectionKey}`);
            return [];
          }

          // Ajouter le nom de la collection à chaque objet dans la réponse
          const filtResults = response.data.data.map((item) => ({
            ...item,
            collectionName: collectionKey, // Ajouter le nom de la collection
          }));

          // Filtrer les résultats en fonction du mot-clé
          const filteredResults = filtResults.filter((item) => {
            return (
              item?.Client?.firstName?.toLowerCase().includes(keyword) ||
              item?.Client?.name?.toLowerCase().includes(keyword) ||
              item?.Client?.email?.toLowerCase().includes(keyword)
            );
          });

          console.log(
            "############  filteredResults ####################",
            filtResults
          );

          // Appliquer le filtre "isClosed === false" pour toutes sauf factures
          return collectionKey !== "factures"
            ? filteredResults.filter((item) => item.isClosed === false)
            : filteredResults;
        }
      );

      // Attendre les résultats de toutes les collections
      const allCollectionsResults = (
        await Promise.all(collectionPromises)
      ).flat();

      // Suppression des doublons
      const uniqueResults = allCollectionsResults.filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.id === value.id && t.collectionName === value.collectionName
          )
      );

      console.log("Résultats combinés :", uniqueResults);

      // Mettre à jour l'état avec les résultats
      setDataEventsAll(
        uniqueResults.filter((item) =>
          dayjs(item.createdAt).isSame(today, "day")
        )
      );
      // setOpen(true); // Ouvre le dialogue après la recherche
    } catch (error) {
      console.error("Erreur lors de la recherche des collections :", error);
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Éviter le comportement par défaut
      handleSearchClick(); // Appeler la fonction de recherche
    }
  };

  const uniqueCategories = dataEvents.reduce((accumulator, event) => {
    const category = event.Category;
    if (category)
      if (!accumulator.some((cat) => cat.id === category.id)) {
        accumulator.push(category);
      }
    return accumulator;
  }, []);

  const calculateEventLines = (events) => {
    const lines = [];

    events.forEach((event) => {
      let placed = false;

      // Essayer de placer l'événement sur une ligne existante
      for (let line of lines) {
        const lastEventInLine = line[line.length - 1];
        if (
          lastEventInLine.endHour < event.startHour || // Vérifie qu'il n'y a pas de chevauchement
          (lastEventInLine.endHour === event.startHour &&
            lastEventInLine.endMinute <= event.startMinute)
        ) {
          line.push(event); // Place l'événement dans cette ligne
          placed = true;
          break;
        }
      }

      // Si l'événement ne peut pas être placé sur une ligne existante, créer une nouvelle ligne
      if (!placed) {
        lines.push([event]);
      }
    });

    return lines;
  };

  const calculateCategoryHeight = (eventCategory) => {
    const lines = calculateEventLines(eventCategory.events); // Utiliser la fonction pour obtenir les lignes d'événements
    const lineHeight = 60; // Par exemple, 60px par ligne d'événements
    return lines.length * lineHeight;
  };

  const handleSaveEvent = async (updatedEvent) => {
    if (!updatedEvent || !updatedEvent.id) return; // Vérifiez que l'événement a un ID

    try {
      // Référence au document à mettre à jour
      const eventDocRef = doc(db, "events", updatedEvent.id);

      // Préparez l'objet de mise à jour sans valeurs undefined
      const updatedData = {
        title: updatedEvent.title || "", // Valeur par défaut si undefined
        person: {
          firstName: updatedEvent.Client.firstName || "", // Assurez-vous qu'il y a une valeur par défaut
          lastName: updatedEvent.Client.lastName || "",
          email: updatedEvent.Client.email || "",
          phone: updatedEvent.Client.phone || "",
        },
        vehicule: {
          plateNumber: updatedEvent.Vehicle.plateNumber || "",
          vin: updatedEvent.Vehicle.vin || "",
          color: updatedEvent.Vehicle.color || "",
        },
        details: {
          notes: updatedEvent.details.notes || "",
          price: updatedEvent?.details?.price || 0, // Assurez-vous que le prix est un nombre valide
        },
        category: {
          id: updatedEvent.category?.id || "",
          name: updatedEvent.category?.name || "",
        },
        startHour: updatedEvent.startHour || 0, // Valeur par défaut si undefined
        startMinute: updatedEvent.startMinute || 0,
        endHour: updatedEvent.endHour || 0,
        endMinute: updatedEvent.endMinute || 0,
      };

      // Mise à jour du document dans Firestore
      await updateDoc(eventDocRef, updatedData);

      console.log("Événement mis à jour avec succès:", updatedEvent);

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
          console.error(
            "Erreur lors de la récupération des événements :",
            error
          );
        }
      };

      fetchEvents();

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

      // fetchEvents(); // Appeler la fonction au montage du composant
      handleModalClose(); // Ferme le modal après la sauvegarde
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement :", error);
    }
  };

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    // setLoading(true);
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

    fetchEvents();
    setOpen(false);
    setDataEventsAll([]); // Réinitialiser les résultats lorsque le dialogue est fermé
  };

  const handleDateChange = (days) => {
    const newDate = dayjs(selectedDate).add(days, "day");
    setSelectedDate(newDate.format("YYYY-MM-DD"));
  };

  const [details, setDetails] = useState([
    {
      label: "",
      quantity: "",
      unitPrice: "",
      discountPercent: "",
      discountAmount: "",
    },
  ]);
  const [deposit, setDeposit] = useState(0);

  const handleDetailChange = (event, index) => {
    const { name, value } = event.target; // Extraire le nom et la valeur du champ modifié
    const updatedDetails = [...details]; // Créer une copie des détails

    let normalizedValue = value.trim(); // Nettoyer les espaces inutiles
    normalizedValue = normalizedValue.replace(",", "."); // Normaliser les décimales

    if (name === "discountAmount" || name === "discountPercent") {
      // Réinitialiser les deux champs
      updatedDetails[index].discountAmount = "";
      updatedDetails[index].discountPercent = "";

      if (normalizedValue.includes("%")) {
        // Si la valeur contient un %, on met à jour le pourcentage
        const percent = parseFloat(normalizedValue.replace("%", ""));
        if (!isNaN(percent)) {
          updatedDetails[index].discountPercent = percent;
        }
      } else if (normalizedValue !== "") {
        // Sinon, c'est un montant
        const amount = parseFloat(normalizedValue);
        if (!isNaN(amount)) {
          updatedDetails[index].discountAmount = amount;
        }
      }

      // Stocker la saisie brute dans inputValue (si besoin)
      updatedDetails[index].inputValue = value;
    } else {
      // Autres champs : mise à jour standard
      updatedDetails[index][name] =
        name === "label" ? value || "" : parseFloat(value);
    }

    // Mettre à jour l'état avec les nouveaux détails
    setDetails(updatedDetails);

    // Recalculer le prix total TTC si nécessaire
    setNewEvent({ ...newEvent, price: totalTTC });
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

  // Fonction pour ajouter une nouvelle ligne de détails
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

  // Fonction pour supprimer une ligne de détails
  const removeDetailRow = (index) => {
    setDetails((prevDetails) => prevDetails.filter((_, i) => i !== index));
  };

  // Calcul des totaux HT et TT

  const totalTTC = details.reduce(
    (sum, detail) => sum + calculateLineTotal(detail),
    0
  );
  const totalHT = totalTTC / 1.2; // Ajouter 20% de TVA

  // Fonction pour mettre à jour l'événement dans l'état local
  const handleEditedEventChange = (updatedEvent) => {
    console.log(
      "########### updatedEvent updatedEvent #################",
      updatedEvent
    );
    setSelectedEvent(updatedEvent);
  };

  const handleEventDetailClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };
  function calculateTimeValue(hour, minute) {
    return 2 * (hour - 7) + Math.floor(minute / 30) + 1;
  }

  const handleEventFromChild = () => {
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

    fetchEvents(); // Appeler la fonction au montage du composant    setEventCount((prevCount) => prevCount + 1); // Par exemple, incrémente un compteur
    // handleModalClose2();
  };

  const getBadgeColor = (collection) => {
    switch (collection) {
      case "events":
        return "primary"; // Couleur bleu par défaut
      case "devis":
        return "secondary"; // Couleur violette par défaut
      case "factures":
        return "success"; // Couleur verte
      case "reservations":
        return "warning"; // Couleur jaune
      default:
        return "default"; // Couleur grise
    }
  };

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

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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
    setFacture(factureData?.data);

    if (factureData) {
      setModalOpen(false);
      setNotification({
        open: true,
        message: "Votre  Facture a été crée ",
        severity: "success", // Peut être "error", "warning", "info"
      });
      setShowPopup(true);
      setModalOpen2(false);
      setModalOpen3(true);
      setFacture(factureData?.data);

      console.log(
        "##############################Facture reçue du child: #################################################",
        factureData.data
      );
      handleOpenNotif("Facture");
    }
  };

  const [newOrder, setNewOrder] = useState({});

  const handleOnNotficationSuccess = (valeur) => {
    setModalOpen(false);
    setNewOrder(valeur);

    setSelectedEvent({ ...selectedEvent, id: valeur.id });

    setNotification({
      open: true,
      message: "Votre  OR a été crée ",
      severity: "success", // Peut être "error", "warning", "info"
    });
    setShowPopup(true);
    setModalOpen2(false);

    handleOpenNotif("OR");

    handleSearchClickFull();
  };
  const [Client, SetClient] = useState({
    name: "",
    firstName: "",
    address: "",
    email: "",
    phone: "",
    postalCode: "",
    city: "",
  });

  const handleSelectClient = (client) => {
    SetClient(client);
    console.log("Client sélectionné :", client);
  };

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

  const handleSelectVehicle = (vehicle) => {
    setVehicle(vehicle);
    console.log("Vehicule sélectionné :", vehicle);
  };

  const handleLogout = async () => {
    try {
      await axios.get("/logout"); // pour envoyer les cookies
      document.cookie =
        "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/"; // redirection après logout
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    }
  };

  const [searchQueryInterior, setSearchQueryInterior] = useState("");
  const [documentFilter, setDocumentFilter] = useState("all");

  const filteredEvents = dataEventsAll.filter((event) => {
    const matchesDocument =
      documentFilter === "all" || event.collectionName === documentFilter;

    const searchLower = searchQueryInterior.toLowerCase();

    const matchesSearch =
      event.Client.name?.toLowerCase().includes(searchLower) ||
      event.Client.firstName?.toLowerCase().includes(searchLower) ||
      event.Client.email?.toLowerCase().includes(searchLower) ||
      event.Vehicle?.model?.toLowerCase().includes(searchLower) ||
      event.Vehicle?.plateNumber?.toLowerCase().includes(searchLower);

    return matchesDocument && matchesSearch;
  });

  return (
    <DragDropContext>
      {/* Modal pour ajouter un événement */}
      {/* Header avec Barre de Recherche */}

      {selectedEvent && (
        <EventModal
          open={modalOpen}
          onClose={handleModalClose}
          editedEvent={selectedEvent}
          setEditedEvent={handleEditedEventChange}
          categories={categories}
          handleSave={handleSaveEvent}
          handleEventDetailClick={handleEventDetailClick}
          onEventTriggered={handleEventFromChild}
          onFactureReceive={handleFactureReceived}
        />
      )}
      {facture && (
        <DocumentModal
          open={modalOpen3}
          onClose={handleModalClose3}
          editedEvent={facture}
          setEditedEvent={handleEditedEventChange}
          collectionName={"factures"}
          setCollectionName={setCollectionName}
          categories={categories}
          onFactureReceive={handleFactureReceived}
        />
      )}

      {selectedEvent && selectedEvent.collection !== "events" && (
        <DocModal
          open={modalOpen2}
          onClose={handleModalClose2}
          editedEvent={selectedEvent}
          setEditedEvent={handleEditedEventChange}
          collectionName={collectionName}
          setCollectionName={setCollectionName}
          categories={categories}
          onFactureReceive={handleFactureReceived}
          onDelete={handleSearchClickFull}
          onNotificationSuccess={handleOnNotficationSuccess}
          onSearchAfterDevisResa={handleSearchClickFull}
        />
      )}

      <Box
        sx={{
          padding: 3,
          display: "flex",
          position: "relative",
          flexDirection: "column", // Changer la direction en colonne
          width: "100%",
        }}
      >
        {showPopup && (
          <Notification
            message={notification.message}
            handleClose={handleClosePopup}
            collectionName={collectName}
            dataEvent={selectedEvent}
            dataDetails={details}
          />
        )}
        {/* Header Section */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            // backgroundColor: "#007A87",
            color: "white",
            borderRadius: "8px",
            padding: "0px",
            mb: "32px !important",
            mt: "2.3rem",
            width: "100%", // Prend toute la largeur
          }}
        >
          {/* 📅 Sélecteur de date à gauche */}
          <Box
            display="flex"
            flexDirection="column" // Empile les éléments verticalement
            alignItems="center"
            gap={2} // Espace entre les éléments
            paddingLeft="2.2rem"
          >
            {/* Section des boutons et du champ de date */}
            <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
              <IconButton
                onClick={() => handleDateChange(-1)}
                aria-label="Jour précédent"
                sx={{ color: "blue" }}
              >
                <ArrowBackIcon />
              </IconButton>

              <TextField
                label="Filtrer par date"
                variant="outlined"
                size="small"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "4px",
                  width: 140,
                }}
                value={selectedDate}
                type="date"
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <IconButton
                onClick={() => handleDateChange(1)}
                aria-label="Jour suivant"
                sx={{ color: "blue" }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>

            {/* Bouton "Aujourd'hui" centré en dessous */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                // height: "56px", // Hauteur du bouton
                padding: "0 16px",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  setSelectedDate(new Date().toISOString().split("T")[0])
                }
              >
                Aujourd'hui
              </Button>
            </Box>
          </Box>

          <Box
            component="img"
            src={jumelles} // Vérifie le bon chemin
            alt="Jumelle"
            sx={{
              height: 70,
              width: "auto",
            }}
          />

          {/* 🔍 Barre de recherche centrée */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: 3,
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Rechercher"
              size="small"
              sx={{
                backgroundColor: "white",
                borderRadius: "16x",
                width: "50%", // Ajustable selon besoin
                ml: 2,
              }}
              onChange={handleSearchChange}
              value={searchQuery}
              onKeyDown={handleKeyDown}
            />

            <Button
              variant="contained"
              color="secondary"
              onClick={handleSearchClick}
              sx={{ ml: 2 }}
            >
              Rechercher
            </Button>
          </Box>

          {/* 🔵 Logo à droite */}
          <Box
            component="img"
            src={garageInfo.logo || logoGarage} // Vérifie le bon chemin
            alt="Logo"
            sx={{
              height: 150,
              width: "10%",
              position: "fixed",
              top: 10,
              right: 10,
              // zIndex: 1000, // S'assurer qu'il reste au-dessus des autres éléments
            }}
          />
        </Box>

        {/* Flex container for Sidebar and Main Content */}
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          {/* Sidebar Section */}
          <Box
            sx={{
              width: "250px",
              borderRight: "1px solid lightgray",
              pr: 2,
              mt: "56px",
            }}
          >
            {/* Date Filter Input */}

            {/* <Box
              display="flex"
              alignItems="center"
              justifyContent="center" // Pour centrer le contenu horizontalement
              sx={{
                height: "56px", // Augmente la hauteur du bouton
                padding: "0 16px", // Optionnel, pour ajuster les espacements horizontalement
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  setSelectedDate(new Date().toISOString().split("T")[0])
                }
              >
                Aujourd'hui
              </Button>
            </Box> */}

            {/* Events Accordion */}

            {uniqueCategories &&
              uniqueCategories.map((category, index) => {
                const categoryEvents = dataEvents
                  .filter((event) => event.Category != null)
                  .filter((event) => event.Category.id === category.id); // Filtrer les événements par catégorie
                const categoryHeight = calculateCategoryHeight({
                  events: categoryEvents,
                }); // Calculer la hauteur de la catégorie

                return (
                  <Card
                    key={category.id}
                    sx={{
                      backgroundColor: getCategoryColor(category),
                      marginTop: "16px",
                      borderRadius: "8px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                      height: `${categoryHeight}px`, // Hauteur dynamique
                      width: "calc(33.33% - 8px)", // Chaque carte occupe 1/3 de la largeur avec un gap
                      minWidth: "200px", // Largeur minimale pour éviter des cartes trop petites
                    }}
                  >
                    <CardContent>
                      <Typography variant="body2">{category.name}</Typography>
                    </CardContent>
                  </Card>
                );
              })}

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
            <Fab
              color="seconday"
              aria-label="add"
              sx={{
                position: "fixed",
                bottom: 16,
                right: 16,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: 120, // Ajuste la largeur pour s'assurer que le texte est visible
                padding: "8px 16px", // Ajuste le remplissage pour le rendre plus spacieux
                borderRadius: "8px", // Optionnel : ajoute un bord arrondi
              }}
              onClick={handleLogout}
            >
              <LogoutIcon />
            </Fab>

            {/* Modal (Dialog) pour le formulaire d'ajout d'événement */}

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
                      <Typography variant="body1">
                        Informations Client
                      </Typography>
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
                      <Typography variant="body1">
                        Informations Véhicule
                      </Typography>
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
                        name="kms"
                        value={Vehicle.mileage}
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
                      <Typography variant="body1" sx={{ marginTop: "1.3rem" }}>
                        Prochain controle technique
                      </Typography>
                      <TextField
                        name="controletech"
                        type="date"
                        value={Vehicle.lastCheck}
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

                    {/* Table: Détails de l'événement */}
                    <Grid item xs={12}>
                      {/* <Typography variant="h6">
                        Détails de l'événement
                      </Typography> */}
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell style={{ width: "60%" }}>
                                Libellé / travaux / articles
                              </TableCell>
                              <TableCell
                                style={{ width: "10%", textAlign: "center" }}
                              >
                                Quantité
                              </TableCell>
                              <TableCell
                                style={{ width: "10%", textAlign: "center" }}
                              >
                                Prix Unitaire
                              </TableCell>
                              {/* <TableCell
                                style={{ width: "10%", textAlign: "center" }}
                              >
                                Remise %
                              </TableCell> */}
                              <TableCell
                                style={{ width: "10%", textAlign: "center" }}
                              >
                                Remise
                              </TableCell>
                              <TableCell
                                style={{ width: "10%", textAlign: "center" }}
                              >
                                Total
                              </TableCell>
                              <TableCell
                                style={{ width: "10%", textAlign: "center" }}
                              >
                                Action
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {details.map((detail, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <TextField
                                    name="label"
                                    value={detail.label}
                                    onChange={(e) =>
                                      handleDetailChange(e, index)
                                    }
                                    size="small"
                                    fullWidth
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    name="quantity"
                                    type="number"
                                    value={detail.quantity}
                                    onChange={(e) =>
                                      handleDetailChange(e, index)
                                    }
                                    size="small"
                                    style={{
                                      maxWidth: 80,
                                    }}
                                    sx={{
                                      "& input": {
                                        textAlign: "center", // Centrer horizontalement
                                      },
                                      "& input[type=number]": {
                                        MozAppearance: "textfield", // Pour Firefox
                                      },
                                      "& input[type=number]::-webkit-outer-spin-button":
                                        {
                                          WebkitAppearance: "none", // Pour Chrome, Safari, Edge, Opera
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
                                <TableCell>
                                  <TextField
                                    name="unitPrice"
                                    type="number"
                                    value={detail.unitPrice}
                                    onChange={(e) =>
                                      handleDetailChange(e, index)
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
                                      "& input[type=number]": {
                                        MozAppearance: "textfield", // Pour Firefox
                                      },
                                      "& input[type=number]::-webkit-outer-spin-button":
                                        {
                                          WebkitAppearance: "none", // Pour Chrome, Safari, Edge, Opera
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

                                <TableCell>
                                  <TextField
                                    name="discountAmount"
                                    type="text" // Permet la saisie de caractères comme '%'
                                    value={detail.inputValue || ""} // Utilise la valeur brute pour l'affichage
                                    onChange={(e) => {
                                      let value = e.target.value.trim(); // Supprime les espaces inutiles
                                      let formattedValue = value; // Conserve la saisie brute pour affichage

                                      // Uniformise les décimales en remplaçant les virgules par des points
                                      const normalizedValue = value.replace(
                                        ",",
                                        "."
                                      );

                                      // Réinitialisation des valeurs par défaut
                                      detail.discountAmount = "";
                                      detail.discountPercent = "";

                                      if (normalizedValue.includes("%")) {
                                        // Cas où l'utilisateur entre un pourcentage
                                        const percentage = parseFloat(
                                          normalizedValue.replace("%", "")
                                        );
                                        if (!isNaN(percentage)) {
                                          detail.discountPercent = percentage; // Met à jour le pourcentage
                                          detail.discountAmount = ""; // Réinitialise le montant
                                        }
                                      } else if (normalizedValue !== "") {
                                        // Cas où l'utilisateur entre un montant
                                        const amount =
                                          parseFloat(normalizedValue);
                                        if (!isNaN(amount)) {
                                          detail.discountAmount = amount; // Met à jour le montant
                                          detail.discountPercent = ""; // Réinitialise le pourcentage
                                        }
                                      }

                                      // Met à jour l'état de l'inputValue avec la saisie brute
                                      detail.inputValue = formattedValue;

                                      // Appelle la fonction de gestion des changements
                                      handleDetailChange(e, index);
                                    }}
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
                              <TableCell colSpan={7}>
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
                              <TableCell colSpan={4}></TableCell>
                              <TableCell>Total TTC :</TableCell>
                              <TableCell>{totalTTC.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={4}></TableCell>
                              <TableCell>Total HT :</TableCell>
                              <TableCell>{totalHT.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={4}></TableCell>
                              <TableCell>Acompte :</TableCell>
                              <TableCell>
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
                            <Typography variant="body1">
                              Date de départ
                            </Typography>
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
                              onChange={handleInputChangeFinDate}
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
                                value={
                                  `${newEvent.startHour}${newEvent.startMinute}` ||
                                  ""
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
                                  `${newEvent.endHour}${newEvent.endMinute}` ||
                                  ""
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
          </Box>

          {/* Main Content Section */}
          <Box
            sx={{
              flexGrow: 1,
              position: "relative",
              pl: 3,
              backgroundColor: "#007a87",
              padding: "16px 0",
              borderRadius: "8px",
              height: "100%",
            }}
          >
            {/* Timeline Component */}
            <Timeline />
            {/* Current Time Indicator */}
            <CurrentTimeLine currentHour={currentHour} />

            {/* Droppable Event Zones */}
            {loading == true && <>Chargement...</>}
            {loading == false && (
              <Box
                sx={{ position: "relative", zIndex: 3, marginTop: "2.8rem" }}
              >
                {" "}
                {/* Z-index élevé */}
                {uniqueCategories.map((category, categoryIndex) => {
                  const categoryEvents = dataEvents
                    .filter((event) => event.Category != null)
                    .filter((event) => event.Category.id === category.id);
                  // Récupérer les événements de la catégorie
                  const lines = calculateEventLines(categoryEvents); // Calculer les lignes
                  console.log(
                    "***********************************lines************************************",
                    lines
                  );

                  return (
                    <Droppable droppableId={category.id} key={category.id}>
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            position: "relative",
                            borderRadius: "10px",
                            marginBottom: "16px",
                            padding: "8px 0",
                            overflow: "hidden",
                            width: "100%",
                          }}
                        >
                          {lines.map((line, lineIndex) => (
                            <Box
                              key={`line-${lineIndex}`}
                              sx={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(24,minmax(50px,1fr))",
                                alignItems: "center",
                                position: "relative",
                                height: "50px", // Hauteur de chaque ligne
                                marginTop: lineIndex > 0 ? "8px" : 0,
                              }}
                            >
                              {line.map((event, eventIndex) => (
                                <Draggable
                                  key={`${event.id}-${categoryIndex}-${eventIndex}`}
                                  draggableId={`${event.id}-${categoryIndex}-${eventIndex}`}
                                  index={eventIndex}
                                >
                                  {(provided, snapshot) => (
                                    <Tooltip
                                      title={
                                        <Typography variant="body2">
                                          <span
                                            style={{
                                              fontWeight: "bold",
                                              fontSize: "1rem",
                                            }}
                                          >
                                            {event.id}
                                          </span>
                                          {" • "}
                                          <span>
                                            {" "}
                                            {/* Gris plus foncé pour les noms */}
                                            {event.Client.firstName}{" "}
                                            {event.Client.name}
                                          </span>
                                          {" • "}
                                          <span>
                                            {" "}
                                            {/* Vert pour la plaque d'immatriculation */}
                                            {event.Vehicle.plateNumber}
                                          </span>
                                        </Typography>
                                      }
                                      arrow
                                      PopperProps={{
                                        modifiers: [
                                          {
                                            name: "arrow",
                                            options: {
                                              padding: 10, // Augmenter l'espace autour de la flèche du tooltip
                                            },
                                          },
                                        ],
                                      }}
                                      sx={{
                                        backgroundColor: "#fff", // Fond blanc pour le tooltip
                                        color: "#000", // Texte noir pour un bon contraste sur fond blanc
                                        boxShadow:
                                          "0px 2px 8px rgba(0, 0, 0, 0.1)", // Ombre légère pour la lisibilité
                                        borderRadius: 2, // Coins arrondis pour le tooltip
                                      }}
                                    >
                                      <Box
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => handleEventClick(event)}
                                        sx={{
                                          gridColumnStart: calculateTimeValue(
                                            event.startHour,
                                            event.startMinute
                                          ),
                                          gridColumnEnd: calculateTimeValue(
                                            event.endHour,
                                            event.endMinute
                                          ),

                                          height: "40px",
                                          backgroundColor:
                                            event.Category?.color || "#05AFC1",
                                          border: snapshot.isDragging
                                            ? "2px solid #90caf9"
                                            : "1px solid #90caf9",
                                          borderRadius: "10px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          cursor: "pointer",
                                          transition:
                                            "background-color 0.3s ease",
                                        }}
                                      >
                                        <Box
                                          display="flex"
                                          alignItems="center"
                                          justifyContent="space-between" // Aligne le texte à gauche et l'icône à droite
                                          sx={{ width: "100%" }} // Assure que le conteneur prend toute la largeur possible
                                        >
                                          <Typography variant="body2">
                                            <span
                                              style={{
                                                fontWeight: "bold",
                                                fontSize: "1rem",
                                                color: "#000",
                                              }}
                                            >
                                              #{event.id}
                                            </span>
                                            {" • "}
                                            <span
                                              style={{
                                                color: "#1976d2",
                                                fontWeight: "bold",
                                              }}
                                            >
                                              {event.Client.firstName}{" "}
                                              {event.Client.lastName}
                                            </span>
                                            {" • "}
                                            <span
                                              style={{ color: "textSecondary" }}
                                            >
                                              {event.Vehicle.plateNumber}
                                            </span>
                                            <span
                                              style={{ color: "textSecondary" }}
                                            >
                                              {" "}
                                              {event?.isClosed ? "(Fermé)" : ""}
                                            </span>
                                          </Typography>
                                          {event.nextDay && (
                                            <ArrowForwardIcon
                                              fontSize="medium"
                                              sx={{
                                                color: "white",
                                                transition:
                                                  "transform 0.3s ease, color 0.3s ease",
                                                "&:hover": {
                                                  color: "#1976d2", // Change de couleur au survol (bleu par défaut de MUI)
                                                  transform: "scale(1.2)", // Agrandit légèrement l'icône au survol
                                                },
                                                boxShadow:
                                                  "0px 4px 8px rgba(0, 0, 0, 0.2)", // Ajoute une ombre pour la profondeur
                                                borderRadius: "50%", // Rend l’icône arrondie pour un effet d’encadrement
                                                padding: "4px", // Ajoute un léger padding pour accentuer l'effet
                                                backgroundColor:
                                                  "rgba(0, 0, 0, 0.05)", // Fond gris très léger
                                              }}
                                            />
                                          )}
                                        </Box>
                                      </Box>
                                    </Tooltip>
                                  )}
                                </Draggable>
                              ))}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Droppable>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      {/* Event Modal */}

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: "1200px",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>Résultats de la recherche</DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            mt={2}
          >
            <TextField
              label="Recherche"
              variant="outlined"
              size="small"
              value={searchQueryInterior}
              onChange={(e) => setSearchQueryInterior(e.target.value)}
              placeholder="Nom, Prénom, Email, Marque, Modèle"
              style={{ marginRight: 16, flexGrow: 1 }}
            />
            <FormControl variant="outlined" size="small">
              <InputLabel>Type de document</InputLabel>
              <Select
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value)}
                label="Type de document"
                style={{ minWidth: 200 }}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="events">O.R</MenuItem>
                <MenuItem value="reservations">Reservations</MenuItem>
                <MenuItem value="devis">Devis</MenuItem>
                <MenuItem value="factures">Factures</MenuItem>
                {/* Ajoute d'autres types si nécessaire */}
              </Select>
            </FormControl>
          </Box>

          {dataEventsAll.length === 0 ? (
            <Typography>Aucun événement trouvé.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>N°</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Prénom</TableCell>

                    <TableCell>Téléphone</TableCell>
                    <TableCell>Email</TableCell>

                    <TableCell>Véhicule</TableCell>
                    <TableCell>Document</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow
                      key={event.id}
                      hover
                      onClick={() => {
                        setSelectedEvent(event); // Met à jour l'événement sélectionné
                        setCollectionName(event.collectionName);
                        if (event.collectionName !== "events") {
                          setModalOpen2(true);
                          setModalOpen(false);
                          console.log("modalOpen2 listing", modalOpen2);
                        } else setModalOpen(true);
                      }}
                      style={{ cursor: "pointer" }} // Indique que la ligne est cliquable
                    >
                      <TableCell>{event.id}</TableCell>
                      <TableCell>{event.Client.name}</TableCell>
                      <TableCell>{event.Client.firstName}</TableCell>

                      <TableCell>{event.Client.phone || ""}</TableCell>
                      <TableCell>{event.Client.email}</TableCell>

                      <TableCell>
                        {event.Vehicle.model || ""} -{" "}
                        {event.Vehicle.plateNumber || ""}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.collectionName}
                          color={getBadgeColor(event.collectionName)}
                          style={{
                            fontWeight: "bold",
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Fermer
          </Button>
        </DialogActions>

        {showPopup && (
          <Notification
            message={notification.message}
            handleClose={handleClosePopup}
            collectionName={collectName}
            dataEvent={selectedEvent}
            dataDetails={details}
          />
        )}

        {/* {selectedEvent && (
          <EventModal
            open={modalOpen}
            onClose={handleModalClose}
            editedEvent={selectedEvent}
            setEditedEvent={handleEditedEventChange}
            categories={categories}
            handleSave={handleSaveEvent}
            onFactureReceive={handleFactureReceived}
            handleEventDetailClick={handleEventDetailClick}
            onEventTriggered={handleEventFromChild}
          />
        )} */}
      </Dialog>
    </DragDropContext>
  );
};

export default Planning;
