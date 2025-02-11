import AddIcon from "@mui/icons-material/Add"; // Icone de plus pour le bouton flottant
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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
  Grid,
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs"; // ou luxon selon ta préférence
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";

import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useAuthState } from "react-firebase-hooks/auth";
import eventsData from "../../data/eventsData.json";
import { auth, db } from "../../hooks/firebaseConfig"; // Votre configuration Firestore
import DocModal from "../DocModal";
import DocumentModal from "../DocumentModal";
import EventModal from "../EventModal";
import Notification from "../Notification";

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
          }}
        >
          {7 + Math.floor(halfHour / 2)}:{halfHour % 2 === 0 ? "00" : "30"}
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
  const [user] = useAuthState(auth);

  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    // Formatage de la date en YYYY-MM-DD
    const formattedDate = today.toISOString().split("T")[0];
    setSelectedDate(formattedDate); // Initialiser le state avec la date d'aujourd'hui
  }, []); // État pour stocker la date sélectionnée  handleSearchClick

  useEffect(() => {
    handleSearchClickFull();
  }, [facture]);
  // const handleDateChange = (e) => {
  //   setSelectedDate(e.target.value); // Met à jour l'état avec la date sélectionnée
  // };
  // Utilisation de useEffect pour récupérer les catégories depuis Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories"); // Référence à la collection
        const querySnapshot = await getDocs(categoriesRef); // Récupérer les documents

        // Récupérer les objets de catégories (id et data)
        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Extraire les noms des catégories pour l'état "expanded"
        const categoryNames = categoriesData.map((category) => category.name);

        // Mettre à jour l'état avec les noms de catégories
        setExpanded(categoryNames);

        // Mettre à jour l'état avec les objets complets de catégories
        setCategories(categoriesData);
        console.log("categoriesData", categoriesData);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des catégories : ",
          error
        );
      }
    };

    fetchCategories(); // Appeler la fonction au montage du composant
  }, []); // Le tableau vide signifie que l'effet se déclenche uniquement au montage

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Référence à la collection "events"
        const eventsRef = collection(db, "events");

        // Créer la requête avec la condition where pour filtrer par userId
        const q = query(
          eventsRef,
          where("userId", "==", user.uid),
          where("date", "==", selectedDate)
        );

        // Récupérer les documents correspondants
        const querySnapshot = await getDocs(q);

        // Récupérer les objets de la collection (id et data)
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Mettre à jour l'état avec les données récupérées

        console.log("eventsData", eventsData); // Pour vérifier les données dans la console
        setDataEvents(eventsData.filter((event) => event.isClosed == false));
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des événements : ",
          error
        );
      }
    };

    fetchEvents(); // Appeler la fonction au montage du composant
  }, [, selectedDate, facture]); // Le tableau vide signifie que l'effet se déclenche uniquement au montage

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
    if (!user) {
      console.error("User not authenticated");
      return; // Sortir si l'utilisateur n'est pas connecté
    }

    const updatedEvents = [...events]; // Crée une copie de l'array events
    const startDate = new Date(newEvent.date); // Date de début
    const endDate = new Date(finDate); // Date de fin
    const userId = user.uid; // UID de l'utilisateur connecté

    // Générer le numéro de commande une seule fois pour l'événement (ou son ensemble)
    const lastOrderNumber = await getLastOrderNumberForUser(userId);
    const newOrderNumber = generateOrderNumber(lastOrderNumber);

    if (isMultiDay && startDate.getTime() !== endDate.getTime()) {
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
    await updateLastOrderNumberForUser(userId, parseInt(newOrderNumber));

    // Mettre à jour le state avec les événements ajoutés
    setEvents(updatedEvents);

    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events");

        // Créer la requête avec la condition where pour filtrer par userId
        const q = query(
          eventsRef,
          where("userId", "==", user.uid),
          where("date", "==", selectedDate)
        );

        const querySnapshot = await getDocs(q);

        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDataEvents(eventsData.filter((event) => event.isClosed == false));
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des événements : ",
          error
        );
      }
    };

    fetchEvents(); // Appeler la fonction au montage du composant
    handleOpenNotif("OR");

    resetForm();
    setIsModalOpen(false); // Fermer le modal
  };

  const addReservation = async () => {
    // Ajout du paramètre isMultiDay
    if (!user) {
      console.error("User not authenticated");
      return; // Sortir si l'utilisateur n'est pas connecté
    }

    const userId = user.uid; // UID de l'utilisateur connecté

    // Générer le numéro de commande une seule fois pour l'événement (ou son ensemble)
    const lastOrderNumber = await getLastOrderNumberForUser(userId);
    const newOrderNumber = "Resa-" + generateOrderNumber(lastOrderNumber);

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
      "reservations",
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
      await addEventDetailsGeneric(
        singleResaDocRef.id,
        details,
        "reservations"
      ); // Enregistrer les détails

    // Mettre à jour le dernier numéro de commande utilisé pour cet utilisateur
    await updateLastOrderNumberForUser(userId, parseInt(newOrderNumber));
    handleOpenNotif("réservation");
    setCollectName("reservations");

    resetForm();
    setIsModalOpen(false); // Fermer le modal
  };

  const addDevis = async () => {
    // Ajout du paramètre isMultiDay
    if (!user) {
      console.error("User not authenticated");
      return; // Sortir si l'utilisateur n'est pas connecté
    }

    const userId = user.uid; // UID de l'utilisateur connecté

    // Générer le numéro de commande une seule fois pour l'événement (ou son ensemble)
    const lastOrderNumber = await getLastOrderNumberForUser(userId);
    const newOrderNumber = generateOrderNumber(lastOrderNumber);

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
    await updateLastOrderNumberForUser(userId, parseInt(newOrderNumber));
    handleOpenNotif("devis");

    resetForm();
    setIsModalOpen(false); // Fermer le modal
  };

  const addFacture = async () => {
    // Ajout du paramètre isMultiDay
    if (!user) {
      console.error("User not authenticated");
      return; // Sortir si l'utilisateur n'est pas connecté
    }

    const userId = user.uid; // UID de l'utilisateur connecté

    // Générer le numéro de commande une seule fois pour l'événement (ou son ensemble)
    const lastOrderNumber = await getLastOrderNumberForUser(userId);
    const newOrderNumber = generateOrderNumber(lastOrderNumber);

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
      "factures",
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
      await addEventDetailsGeneric(singleResaDocRef.id, details, "factures"); // Enregistrer les détails

    // Mettre à jour le dernier numéro de commande utilisé pour cet utilisateur
    await updateLastOrderNumberForUser(userId, parseInt(newOrderNumber));
    handleOpenNotif("Facture");

    resetForm();
    setIsModalOpen(false); // Fermer le modal
  };

  const addEventDetails = async (eventId, details) => {
    try {
      const batch = writeBatch(db); // Crée un batch pour les opérations

      // Référence directe au document de l'événement avec l'ID existant
      const eventRef = doc(db, "events", eventId);

      // Filtre les détails valides (exclut ceux où tous les champs sont vides ou non valides)
      const validDetails = details.filter((detail) => {
        return (
          detail.label?.trim() ||
          detail.quantity?.toString().trim() ||
          detail.unitPrice?.toString().trim() ||
          detail.discountPercent?.toString().trim() ||
          detail.discountAmount?.toString().trim()
        );
      });

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
          discountAmount: detail.discountAmount || 0,
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
          detail.discountAmount?.toString().trim()
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
          discountAmount: detail.discountAmount || 0,
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

  const getLastOrderNumberForUser = async (userId) => {
    const docRef = doc(db, "userOrderNumbers", userId); // Document unique pour chaque userId
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().lastOrderNumber; // Récupère le dernier numéro
    } else {
      // Si le document n'existe pas encore, on commence à 00000 pour cet utilisateur
      return 0;
    }
  };

  // Fonction pour mettre à jour le dernier numéro de commande pour un userId
  const updateLastOrderNumberForUser = async (userId, newOrderNumber) => {
    const docRef = doc(db, "userOrderNumbers", userId); // Document unique par userId
    await setDoc(docRef, { lastOrderNumber: newOrderNumber, userId: userId }); // Met à jour ou crée le document
  };

  // Fonction pour générer un numéro de commande formaté à 5 chiffres
  const generateOrderNumber = (lastOrderNumber) => {
    const newOrderNumber = lastOrderNumber + 1;
    return newOrderNumber.toString().padStart(5, "0"); // Format à 5 chiffres
  };

  const addSingleEvent = async (event, newOrderNumber, nextDay) => {
    try {
      const eventRef = doc(collection(db, "events")); // Crée une référence à un nouveau document
      console.log("category: event.categoryId", event.categoryId);

      await setDoc(eventRef, {
        eventId: eventRef.id,
        title: newOrderNumber, // Utilise le numéro de commande fourni
        date: event.date,
        startHour: parseInt(event.startHour),
        startMinute: parseInt(event.startMinute),
        endHour: parseInt(event.endHour),
        endMinute: parseInt(event.endMinute),
        category: event.category.id
          ? {
              id: event.category.id,
              name: event.category.name,
              color: event.category.color,
            }
          : null,
        person: {
          firstName: event.firstName,
          lastName: event.lastName,
          email: event.email,
          phone: event.phone,
        },
        vehicule: {
          licensePlate: event.licensePlate ? event.licensePlate : "",
          vin: event.vin ? event.vin : "",
          color: event.color ? event.color : "",
          model: event.model ? event.model : "",
          kms: event.kms ? event.kms : "",
          controletech: event.controletech ? event.controletech : "",
        },
        details: {
          workDescription: event.workDescription ? event.workDescription : "",
          price: event.price ? event.price : "",
          acompte: deposit ? deposit : 0,
        },
        operator: event.operator ? event.operator : "",
        receptor: event.receptor ? event.receptor : "",
        isClosed: false,
        userId: event.userId, // UID de l'utilisateur
        nextDay: nextDay,
      });

      setSelectedEvent({
        eventId: eventRef.id,
        title: newOrderNumber, // Utilise le numéro de commande fourni
        date: event.date,
        startHour: parseInt(event.startHour),
        startMinute: parseInt(event.startMinute),
        endHour: parseInt(event.endHour),
        endMinute: parseInt(event.endMinute),
        category: event.category.id
          ? {
              id: event.category.id,
              name: event.category.name,
              color: event.category.color,
            }
          : null,
        person: {
          firstName: event.firstName,
          lastName: event.lastName,
          email: event.email,
          phone: event.phone,
        },
        vehicule: {
          licensePlate: event.licensePlate ? event.licensePlate : "",
          vin: event.vin ? event.vin : "",
          color: event.color ? event.color : "",
          model: event.model ? event.model : "",
          kms: event.kms ? event.kms : "",
          controletech: event.controletech ? event.controletech : "",
        },
        details: {
          workDescription: event.workDescription ? event.workDescription : "",
          price: event.price ? event.price : "",
          acompte: deposit ? deposit : 0,
        },
        operator: event.operator ? event.operator : "",
        receptor: event.receptor ? event.receptor : "",
        isClosed: false,
        userId: event.userId, // UID de l'utilisateur
        nextDay: nextDay,
      });

      console.log("eventRef", event);

      // Mettre à jour le dernier numéro de commande utilisé pour cet utilisateur
      await updateLastOrderNumberForUser(
        event.userId,
        parseInt(newOrderNumber)
      );
      return eventRef; // Retourner la référence du document
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const addSingleReservation = async (
    event,
    newOrderNumber,
    collectionName,
    isClosed
  ) => {
    try {
      const eventRef = doc(collection(db, collectionName)); // Crée une référence à un nouveau document
      console.log("category: event.categoryId", event.categoryId);

      await setDoc(eventRef, {
        eventId: eventRef.id,
        title: newOrderNumber, // Utilise le numéro de commande fourni
        date: event.date,
        person: {
          firstName: event.firstName,
          lastName: event.lastName,
          email: event.email,
          phone: event.phone,
          adresse: event.adresse ? event.adresse : "",
          postale: event.postale ? event.postale : "",
          ville: event.ville ? event.ville : "",
        },
        vehicule: {
          licensePlate: event.licensePlate ? event.licensePlate : "",
          vin: event.vin ? event.vin : "",
          color: event.color ? event.color : "",
          model: event.model ? event.model : "",
          kms: event.kms ? event.kms : "",
          controletech: event.controletech ? event.controletech : "",
        },
        details: {
          workDescription: event.workDescription ? event.workDescription : "",
          price: event.price ? event.price : "",
          acompte: deposit ? deposit : 0,
        },
        isClosed: isClosed,
        userId: event.userId, // UID de l'utilisateur
      });

      setSelectedEvent({
        eventId: eventRef.id,
        title: newOrderNumber, // Utilise le numéro de commande fourni
        date: event.date,

        category: event.category.id
          ? {
              id: event.category.id,
              name: event.category.name,
              color: event.category.color,
            }
          : null,
        person: {
          firstName: event.firstName,
          lastName: event.lastName,
          email: event.email,
          phone: event.phone,
        },
        vehicule: {
          licensePlate: event.licensePlate ? event.licensePlate : "",
          vin: event.vin ? event.vin : "",
          color: event.color ? event.color : "",
          model: event.model ? event.model : "",
          kms: event.kms ? event.kms : "",
          controletech: event.controletech ? event.controletech : "",
        },
        details: {
          workDescription: event.workDescription ? event.workDescription : "",
          price: event.price ? event.price : "",
          acompte: deposit ? deposit : 0,
        },

        isClosed: false,
        userId: event.userId, // UID de l'utilisateur
      });

      console.log("eventRef", event);

      // Mettre à jour le dernier numéro de commande utilisé pour cet utilisateur
      await updateLastOrderNumberForUser(
        event.userId,
        parseInt(newOrderNumber)
      );
      handleOpenNotif("réservation");
      return eventRef; // Retourner la référence du document
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
    const keyword = searchQuery;
    const lowerCaseKeyword = keyword.toLowerCase();

    // Liste des collections à rechercher
    const collections = ["reservations", "devis", "factures", "events"];

    try {
      // Préparer les requêtes pour chaque collection
      const collectionPromises = collections.map(async (collectionName) => {
        const collectionRef = collection(db, collectionName);

        // Créer des requêtes pour chaque champ à rechercher
        const queries = [
          query(
            collectionRef,
            where("userId", "==", user.uid),
            where("person.firstName", ">=", lowerCaseKeyword),
            where("person.firstName", "<=", lowerCaseKeyword + "\uf8ff")
          ),
          query(
            collectionRef,
            where("userId", "==", user.uid),
            where("person.lastName", ">=", lowerCaseKeyword),
            where("person.lastName", "<=", lowerCaseKeyword + "\uf8ff")
          ),
          query(
            collectionRef,
            where("userId", "==", user.uid),
            where("person.email", ">=", lowerCaseKeyword),
            where("person.email", "<=", lowerCaseKeyword + "\uf8ff")
          ),
          query(
            collectionRef,
            where("userId", "==", user.uid),
            where("title", ">=", lowerCaseKeyword),
            where("title", "<=", lowerCaseKeyword + "\uf8ff")
          ),
        ];

        // Récupérer les résultats pour chaque requête
        const queryPromises = queries.map(async (q) => {
          const querySnapshot = await getDocs(q);
          const results = [];
          querySnapshot.forEach((doc) => {
            results.push({
              id: doc.id,
              collection: collectionName,
              ...doc.data(),
            });
          });

          // Appliquer le filtre uniquement si collectionName n'est pas "factures"
          if (collectionName !== "factures") {
            return results.filter((event) => event.isClosed === false);
          }

          // Retourner les résultats sans filtre pour "factures"
          return results;
        });

        // Combiner les résultats de toutes les requêtes pour cette collection
        const collectionResults = (await Promise.all(queryPromises)).flat();
        return collectionResults;
      });

      // Attendre les résultats de toutes les collections
      const allCollectionsResults = (
        await Promise.all(collectionPromises)
      ).flat();

      // Suppression des doublons
      const uniqueResults = allCollectionsResults.filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (t) => t.id === value.id && t.collection === value.collection
          )
      );

      console.log("Résultats combinés :", uniqueResults);

      // Mettre à jour les résultats dans l'état
      setDataEventsAll(uniqueResults);

      setOpen(true); // Ouvre le dialogue après la recherche
    } catch (error) {
      console.error("Erreur lors de la recherche des collections :", error);
    }
  }

  async function handleSearchClickFull() {
    const keyword = searchQuery;
    const lowerCaseKeyword = keyword.toLowerCase();

    // Liste des collections à rechercher
    const collections = ["reservations", "devis", "factures", "events"];

    try {
      // Préparer les requêtes pour chaque collection
      const collectionPromises = collections.map(async (collectionName) => {
        const collectionRef = collection(db, collectionName);

        // Créer des requêtes pour chaque champ à rechercher
        const queries = [
          query(
            collectionRef,
            where("userId", "==", user.uid),
            where("person.firstName", ">=", lowerCaseKeyword),
            where("person.firstName", "<=", lowerCaseKeyword + "\uf8ff")
          ),
          query(
            collectionRef,
            where("userId", "==", user.uid),
            where("person.lastName", ">=", lowerCaseKeyword),
            where("person.lastName", "<=", lowerCaseKeyword + "\uf8ff")
          ),
          query(
            collectionRef,
            where("userId", "==", user.uid),
            where("person.email", ">=", lowerCaseKeyword),
            where("person.email", "<=", lowerCaseKeyword + "\uf8ff")
          ),
          query(
            collectionRef,
            where("userId", "==", user.uid),
            where("title", ">=", lowerCaseKeyword),
            where("title", "<=", lowerCaseKeyword + "\uf8ff")
          ),
        ];

        // Récupérer les résultats pour chaque requête
        const queryPromises = queries.map(async (q) => {
          const querySnapshot = await getDocs(q);
          const results = [];
          querySnapshot.forEach((doc) => {
            results.push({
              id: doc.id,
              collection: collectionName,
              ...doc.data(),
            });
          });

          // Appliquer le filtre uniquement si collectionName n'est pas "factures"
          if (collectionName !== "factures") {
            return results.filter((event) => event.isClosed === false);
          }

          // Retourner les résultats sans filtre pour "factures"
          return results;
        });

        // Combiner les résultats de toutes les requêtes pour cette collection
        const collectionResults = (await Promise.all(queryPromises)).flat();
        return collectionResults;
      });

      // Attendre les résultats de toutes les collections
      const allCollectionsResults = (
        await Promise.all(collectionPromises)
      ).flat();

      // Suppression des doublons
      const uniqueResults = allCollectionsResults.filter(
        (value, index, self) =>
          index ===
          self.findIndex(
            (t) => t.id === value.id && t.collection === value.collection
          )
      );

      console.log("Résultats combinés :", uniqueResults);

      // Mettre à jour les résultats dans l'état
      setDataEventsAll(uniqueResults);
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
    const category = event.category;
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
          firstName: updatedEvent.person.firstName || "", // Assurez-vous qu'il y a une valeur par défaut
          lastName: updatedEvent.person.lastName || "",
          email: updatedEvent.person.email || "",
          phone: updatedEvent.person.phone || "",
        },
        vehicule: {
          licensePlate: updatedEvent.vehicule.licensePlate || "",
          vin: updatedEvent.vehicule.vin || "",
          color: updatedEvent.vehicule.color || "",
        },
        details: {
          workDescription: updatedEvent.details.workDescription || "",
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
          const eventsRef = collection(db, "events");

          // Créer la requête avec la condition where pour filtrer par userId
          const q = query(
            eventsRef,
            where("userId", "==", user.uid),
            where("date", "==", selectedDate)
          );

          const querySnapshot = await getDocs(q);

          const eventsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          console.log("recuperer à nouveau les RDVs#########", eventsData);

          setDataEvents(eventsData.filter((event) => event.isClosed == false));
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des événements : ",
            error
          );
        }
      };

      fetchEvents(); // Appeler la fonction au montage du composant

      setIsModalOpen(false); // Fermer le modal

      // fetchEvents(); // Appeler la fonction au montage du composant
      handleModalClose(); // Ferme le modal après la sauvegarde
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement :", error);
    }
  };

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setLoading(true);
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events");

        // Créer la requête avec la condition where pour filtrer par userId
        const q = query(
          eventsRef,
          where("userId", "==", user.uid),
          where("date", "==", selectedDate)
        );

        const querySnapshot = await getDocs(q);

        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("recuperer à nouveau les RDVs#########", eventsData);

        setDataEvents(eventsData.filter((event) => event.isClosed == false));
        setLoading(false);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des événements : ",
          error
        );
        setLoading(false);
      }
    };

    fetchEvents(); // Appeler la fonction au montage du composant
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

  // Fonction pour gérer les changements dans les détails
  // const handleDetailChange = (event, index) => {
  //   const { name, value } = event.target;
  //   const updatedDetails = [...details];
  //   if (name == "label") updatedDetails[index][name] = value || "";
  //   else updatedDetails[index][name] = parseFloat(value);

  //   setNewEvent({ ...newEvent, price: totalTTC });
  //   setDetails(updatedDetails);
  // };

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

  // Calcul des totaux HT et TTC
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
        setLoading(true);
        const eventsRef = collection(db, "events");

        // Créer la requête avec la condition where pour filtrer par userId
        const q = query(
          eventsRef,
          where("userId", "==", user.uid),
          where("date", "==", selectedDate)
        );

        const querySnapshot = await getDocs(q);

        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("recuperer à nouveau les RDVs#########", eventsData);

        setDataEvents(eventsData.filter((event) => event.isClosed == false));
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error(
          "Erreur lors de la récupération des événements : ",
          error
        );
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

  const handleOpenNotifGetData = (collectionName) => {
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
    handleEventFromChild();
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
    setFacture(factureData);

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
      setFacture(factureData);

      console.log(
        "##############################Facture reçue du child: #################################################",
        factureData
      );
      handleOpenNotif("Facture");
    }
  };

  const handleOnNotficationSuccess = () => {
    setModalOpen(false);
    setNotification({
      open: true,
      message: "Votre  OR a été crée ",
      severity: "success", // Peut être "error", "warning", "info"
    });
    setShowPopup(true);
    setModalOpen2(false);

    handleOpenNotif("OR");

    console.log(
      "*********************************** VOTRE OR A ETE CREE AVEC SUCCESS *****************************"
    );
    handleSearchClickFull();
  };

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
          onDelete={handleSearchClick}
          onNotificationSuccess={handleOnNotficationSuccess}
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
            display: "flex", // Utiliser flex pour centrer les éléments
            alignItems: "center",
            justifyContent: "space-between", // Espacer les éléments
            backgroundColor: "#007A87",
            color: "white",
            borderRadius: "8px",
            padding: "10px",
            mb: 2,
          }}
        >
          <Typography variant="h5">SaaS Garage</Typography>

          {/* Search Bar */}
          <TextField
            variant="outlined"
            placeholder="Rechercher un rendez-vous"
            size="small"
            sx={{
              backgroundColor: "white", // Couleur de fond de la barre de recherche
              borderRadius: "4px",
              flexGrow: 1,
              mx: 2, // Marge horizontale
            }}
            onChange={handleSearchChange} // Remplacez par votre gestionnaire d'événements
            value={searchQuery}
            onKeyDown={handleKeyDown}
          />

          <Button
            variant="contained"
            color="secondary"
            onClick={handleSearchClick}
          >
            Rechercher
          </Button>
        </Box>
        {/* Flex container for Sidebar and Main Content */}
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          {/* Sidebar Section */}
          <Box
            sx={{ width: "250px", borderRight: "1px solid lightgray", pr: 2 }}
          >
            {/* Date Filter Input */}
            {/* <TextField
              label="Filtrer par date"
              variant="outlined"
              fullWidth
              sx={{ mb: 0.1 }}
              value={selectedDate}
              type="date"
              onChange={handleDateChange}
            /> */}
            <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
              <IconButton
                onClick={() => handleDateChange(-1)}
                aria-label="Jour précédent"
                sx={{ color: "primary.main" }} // Ajuste le style selon tes besoins
              >
                <ArrowBackIcon />
              </IconButton>

              <TextField
                label="Filtrer par date"
                variant="outlined"
                fullWidth
                sx={{ mb: 0.1 }}
                value={selectedDate}
                type="date"
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <IconButton
                onClick={() => handleDateChange(1)}
                aria-label="Jour suivant"
                sx={{ color: "primary.main" }} // Ajuste le style selon tes besoins
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>
            {/* Events Accordion */}

            {uniqueCategories &&
              uniqueCategories.map((category, index) => {
                const categoryEvents = dataEvents
                  .filter((event) => event.category != null)
                  .filter((event) => event.category.id === category.id); // Filtrer les événements par catégorie
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
                right: 16,
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
              <Typography sx={{ ml: 1 }}></Typography>
            </Fab>

            {/* Modal (Dialog) pour le formulaire d'ajout d'événement */}

            <Dialog
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              PaperProps={{
                style: {
                  width: "1200px", // Remplacez par la largeur souhaitée
                  maxWidth: "none", // Supprimez la largeur maximale par défaut
                },
              }}
            >
              <DialogTitle>Ajouter un événement</DialogTitle>
              <DialogContent>
                <form>
                  <Grid container spacing={2}>
                    {/* Colonne 1: Infos client */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1">
                        Informations Client
                      </Typography>
                      <TextField
                        label="Nom"
                        name="lastName"
                        value={newEvent.lastName}
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
                      <TextField
                        label="Prénom"
                        name="firstName"
                        value={newEvent.firstName}
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
                      <TextField
                        label="Téléphone"
                        name="phone"
                        value={newEvent.phone}
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
                      <TextField
                        label="Email"
                        name="email"
                        value={newEvent.email}
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
                      <TextField
                        label="Adresse locale"
                        name="adresse"
                        value={newEvent.adresse}
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
                        label="Code postal"
                        name="postale"
                        value={newEvent.postale}
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
                        label="Ville"
                        name="ville"
                        value={newEvent.ville}
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
                      <TextField
                        label="Immatriculation"
                        name="licensePlate"
                        value={newEvent.licensePlate}
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
                        label="VIN"
                        name="vin"
                        value={newEvent.vin}
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
                        label="Modèle"
                        name="model"
                        value={newEvent.model}
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
                        label="Couleur"
                        name="color"
                        value={newEvent.color}
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
                        label="kilométrage"
                        name="kms"
                        value={newEvent.kms}
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
                      <Typography variant="body1">
                        Prochain controle technique
                      </Typography>
                      <TextField
                        name="controletech"
                        type="date"
                        value={newEvent.controletech}
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
                              <TableCell style={{ width: "40%" }}>
                                Libellé / travaux / articles
                              </TableCell>
                              <TableCell
                                style={{ width: "10%", textAlign: "center" }}
                              >
                                Quantité
                              </TableCell>
                              <TableCell
                                style={{ width: "15%", textAlign: "center" }}
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
                                    Supprimer
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
                          name="workDescription"
                          value={newEvent.workDescription}
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
                          }}
                        >
                          <TextField
                            label="Opérateur"
                            name="operator"
                            value={newEvent.operator}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            size="small"
                            sx={{
                              "& .MuiInputBase-root": { fontSize: "0.8rem" },
                              "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                            }}
                          />

                          <TextField
                            label="Réceptionnaire"
                            name="receptor"
                            value={newEvent.receptor}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            size="small"
                            sx={{
                              "& .MuiInputBase-root": { fontSize: "0.8rem" },
                              "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                            }}
                          />
                        </Box>

                        <Grid container spacing={2}>
                          {/* Section Date de l'événement et Heure de début */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="body1">
                              Date de l'événement
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
                        variant="outlined"
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
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                          setIsModalOpen(false);
                        }}
                      >
                        Annuler
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
                    .filter((event) => event.category != null)
                    .filter((event) => event.category.id === category.id);
                  // Récupérer les événements de la catégorie
                  const lines = calculateEventLines(categoryEvents); // Calculer les lignes

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
                                  key={`${event.title}-${categoryIndex}-${eventIndex}`}
                                  draggableId={`${event.title}-${categoryIndex}-${eventIndex}`}
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
                                            {event.title}
                                          </span>
                                          {" • "}
                                          <span>
                                            {" "}
                                            {/* Gris plus foncé pour les noms */}
                                            {event.person.firstName}{" "}
                                            {event.person.lastName}
                                          </span>
                                          {" • "}
                                          <span>
                                            {" "}
                                            {/* Vert pour la plaque d'immatriculation */}
                                            {event.vehicule.licensePlate}
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
                                            event.category?.color || "#05AFC1",
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
                                              {event.title}
                                            </span>
                                            {" • "}
                                            <span style={{ color: "gray" }}>
                                              {event.person.firstName}{" "}
                                              {event.person.lastName}
                                            </span>
                                            {" • "}
                                            <span
                                              style={{ color: "textSecondary" }}
                                            >
                                              {event.vehicule.licensePlate}
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
          {dataEventsAll.length === 0 ? (
            <Typography>Aucun événement trouvé.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Titre</TableCell>
                    <TableCell>Prénom</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Téléphone</TableCell>

                    <TableCell>Véhicule</TableCell>
                    <TableCell>Collection</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataEventsAll.map((event) => (
                    <TableRow
                      key={event.id}
                      hover
                      onClick={() => {
                        setSelectedEvent(event); // Met à jour l'événement sélectionné
                        setCollectionName(event.collection);
                        if (event.collection !== "events") {
                          setModalOpen2(true);
                          setModalOpen(false);
                          console.log("modalOpen2 listing", modalOpen2);
                        } else setModalOpen(true);
                      }}
                      style={{ cursor: "pointer" }} // Indique que la ligne est cliquable
                    >
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{event.person.firstName}</TableCell>
                      <TableCell>{event.person.lastName}</TableCell>
                      <TableCell>{event.person.email}</TableCell>
                      <TableCell>
                        {event.person.phone || "Non renseigné"}
                      </TableCell>

                      <TableCell>
                        {event.vehicule.model || "Non renseigné"} -{" "}
                        {event.vehicule.licensePlate || "Non renseignée"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.collection}
                          color={getBadgeColor(event.collection)}
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
