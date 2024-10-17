import AddIcon from "@mui/icons-material/Add"; // Icone de plus pour le bouton flottant
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
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
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useAuthState } from "react-firebase-hooks/auth";
import eventsData from "../../data/eventsData.json";
import { auth, db } from "../../hooks/firebaseConfig"; // Votre configuration Firestore
import EventModal from "../EventModal";

const Timeline = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "1.8rem",
    }}
  >
    {[...Array(24).keys()].map((halfHour) => (
      <Box
        key={halfHour}
        sx={{
          flexGrow: 1,
          textAlign: "center",
          borderRight: "1px solid lightgray",
        }}
      >
        <Typography variant="caption">
          {7 + Math.floor(halfHour / 2)}:{halfHour % 2 === 0 ? "00" : "30"}
        </Typography>
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
  const [eventsCopied, setEventsCopied] = useState(eventsData);
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

  useEffect(() => {
    const today = new Date();
    // Formatage de la date en YYYY-MM-DD
    const formattedDate = today.toISOString().split("T")[0];
    setSelectedDate(formattedDate); // Initialiser le state avec la date d'aujourd'hui
  }, []); // État pour stocker la date sélectionnée

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value); // Met à jour l'état avec la date sélectionnée
  };
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
        setDataEvents(eventsData);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des événements : ",
          error
        );
      }
    };

    fetchEvents(); // Appeler la fonction au montage du composant
  }, [, selectedDate]); // Le tableau vide signifie que l'effet se déclenche uniquement au montage

  const currentHour = new Date().getHours();

  const handleChange = (category) => {
    setExpanded((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const handleEventClick = (event) => {
    console.log("EVENT CURRENT", event);
    setSelectedEvent(event);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };

  // Fonctions pour assigner les couleurs
  const getCategoryColor = (index) => {
    const colors = ["#FFB74D", "#64B5F6", "#81C784", "#9575CD", "#FF8A65"];
    return colors[index % colors.length];
  };

  const getEventColor = (index) => {
    const colors = ["#FFCC80", "#90CAF9", "#A5D6A7", "#B39DDB", "#FFAB91"];
    return colors[index % colors.length];
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

  const addEvent = async () => {
    if (!user) {
      console.error("User not authenticated");
      return; // Sortir si l'utilisateur n'est pas connecté
    }

    const updatedEvents = [...events]; // Crée une copie de l'array events

    const startDate = new Date(newEvent.date); // Date de début
    const endDate = new Date(finDate); // Date de fin
    const userId = user.uid; // UID de l'utilisateur connecté

    // Vérifie si la date de fin est différente de la date de début
    if (startDate.getTime() !== endDate.getTime()) {
      // Cas où les événements couvrent plusieurs jours

      // Ajout du premier événement pour la date de début
      const firstEventEndHour = 18; // Heure de fin de la journée
      const firstEventEndMinute = 0; // Fin de la journée à 18:00

      const firstEvent = {
        ...newEvent,
        endHour: firstEventEndHour,
        endMinute: firstEventEndMinute,
        userId: userId, // Ajoutez l'UID de l'utilisateur
      };
      await addSingleEvent(firstEvent); // Ajout à Firestore

      // Ajout des événements pour les jours intermédiaires (si applicable)
      let currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + 1); // Premier jour après la date de début
      while (currentDate < endDate) {
        const dailyEvent = {
          ...newEvent,
          date: formatDate(currentDate),
          startHour: 8,
          startMinute: 0,
          endHour: 18,
          endMinute: 0,
          userId: userId, // Ajoutez l'UID de l'utilisateur
        };
        await addSingleEvent(dailyEvent); // Ajout à Firestore
        currentDate.setDate(currentDate.getDate() + 1); // Incrémenter la date
      }

      // Ajout du dernier événement pour la date de fin
      const lastEvent = {
        ...newEvent,
        date: finDate,
        startHour: 8, // Début de la journée
        startMinute: 0,
        endHour: parseInt(newEvent.endHour), // Heure réelle de fin
        endMinute: parseInt(newEvent.endMinute),
        userId: userId, // Ajoutez l'UID de l'utilisateur
      };
      await addSingleEvent(lastEvent); // Ajout à Firestore
    } else {
      // Si l'événement ne couvre qu'une seule journée, on l'ajoute normalement
      const singleEvent = {
        ...newEvent,
        userId: userId, // Ajoutez l'UID de l'utilisateur
      };
      await addSingleEvent(singleEvent); // Ajout à Firestore
    }

    // Mettre à jour le state avec les événements ajoutés
    setEvents(updatedEvents);
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
        setDataEvents(eventsData);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des événements : ",
          error
        );
      }
    };

    fetchEvents(); // Appeler la fonction au montage du composant

    // Réinitialiser le formulaire et fermer le modal
    resetForm();
    setIsModalOpen(false); // Fermer le modal
  };

  // Fonction pour ajouter un événement à Firestore
  const addSingleEvent = async (event) => {
    try {
      const eventRef = doc(collection(db, "events")); // Crée une référence à un nouveau document dans la collection "events"
      console.log("category: event.categoryId", event.categoryId);
      await setDoc(eventRef, {
        eventId: eventRef.id, // ID du document généré
        title: event.orderNumber,
        date: event.date,
        startHour: parseInt(event.startHour),
        startMinute: parseInt(event.startMinute),
        endHour: parseInt(event.endHour),
        endMinute: parseInt(event.endMinute),
        category: { id: event.category.id, name: event.category.name },
        person: {
          // personId: event.personId, // Assurez-vous d'ajouter un ID de personne si disponible
          firstName: event.firstName, // Nom de la personne
          lastName: event.lastName,
          email: event.email, // Email de la personne
          phone: event.phone,
        },
        vehicule: {
          licensePlate: event.licensePlate,
          vin: event.vin,
          color: event.color,
        },
        details: {
          workDescription: event.workDescription,
          price: event.price,
        },
        operator: event.operator,
        userId: event.userId, // UID de l'utilisateur
      });
      console.log("eventRef", event);
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
        },
      }));
    } else {
      setNewEvent({ ...newEvent, [name]: value });
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [dataEventsAll, setDataEventsAll] = useState([]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  function handleSearchClick() {
    const keyword = searchQuery;
    // Ajoutez ici la logique de filtrage des événements si nécessaire
    const searchEvents = async () => {
      try {
        // Normaliser le mot-clé pour la recherche (mettre en minuscule)
        const lowerCaseKeyword = keyword.toLowerCase();

        // Collection des événements dans Firestore
        const eventsRef = collection(db, "events");

        // Requêtes pour chaque champ à rechercher
        const queries = [
          query(
            eventsRef,
            where("userId", "==", user.uid), // Limite aux événements de l'utilisateur
            where("person.firstName", ">=", lowerCaseKeyword),
            where("person.firstName", "<=", lowerCaseKeyword + "\uf8ff")
          ),
          query(
            eventsRef,
            where("userId", "==", user.uid),
            where("person.lastName", ">=", lowerCaseKeyword),
            where("person.lastName", "<=", lowerCaseKeyword + "\uf8ff")
          ),
          query(
            eventsRef,
            where("userId", "==", user.uid),
            where("person.email", ">=", lowerCaseKeyword),
            where("person.email", "<=", lowerCaseKeyword + "\uf8ff")
          ),
          query(
            eventsRef,
            where("userId", "==", user.uid),
            where("title", ">=", lowerCaseKeyword),
            where("title", "<=", lowerCaseKeyword + "\uf8ff")
          ),
        ];

        // Stockage des résultats combinés
        let allResults = [];

        // Exécute chaque requête
        for (const q of queries) {
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            // Ajout des documents aux résultats
            allResults.push({ id: doc.id, ...doc.data() });
          });
        }

        // Suppression des doublons
        const uniqueResults = allResults.filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.id === value.id)
        );

        console.log("Résultats de la recherche :", uniqueResults);
        setDataEventsAll(uniqueResults);

        return uniqueResults;
      } catch (error) {
        console.error("Erreur lors de la recherche des événements :", error);
      }
    };
    searchEvents();
    setOpen(true); // Ouvre le dialogue après la recherche
  }

  const uniqueCategories = dataEvents.reduce((accumulator, event) => {
    const category = event.category;
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
          price: updatedEvent.details.price || 0, // Assurez-vous que le prix est un nombre valide
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
      // Fermez le modal après la mise à jour
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
          setDataEvents(eventsData);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des événements : ",
            error
          );
        }
      };

      fetchEvents(); // Appeler la fonction au montage du composant
      handleModalClose(); // Ferme le modal après la sauvegarde
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement :", error);
    }
  };

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setDataEventsAll([]); // Réinitialiser les résultats lorsque le dialogue est fermé
  };

  return (
    <DragDropContext>
      {/* Modal pour ajouter un événement */}
      {/* Header avec Barre de Recherche */}

      <Box
        sx={{
          padding: 3,
          display: "flex",
          position: "relative",
          flexDirection: "column", // Changer la direction en colonne
          width: "100%",
        }}
      >
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
            <TextField
              label="Filtrer par date"
              variant="outlined"
              fullWidth
              sx={{ mb: 0.1 }}
              value={selectedDate}
              type="date"
              onChange={handleDateChange}
            />
            {/* Events Accordion */}
            {uniqueCategories.map((category, index) => {
              const categoryEvents = dataEvents.filter(
                (event) => event.category.id === category.id
              ); // Filtrer les événements par catégorie
              const categoryHeight = calculateCategoryHeight({
                events: categoryEvents,
              }); // Calculer la hauteur de la catégorie

              console.log(
                "uniqueCategories uniqueCategories",
                uniqueCategories
              );

              return (
                <Accordion
                  key={category.id}
                  expanded={expanded.includes(category.name)}
                  onChange={() => handleChange(category.name)}
                  sx={{
                    backgroundColor: getCategoryColor(index),
                    borderRadius: "8px",
                    marginBottom: "8px",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    height: `${categoryHeight}px`, // Hauteur dynamique
                    "&:before": {
                      display: "none",
                    },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2">{category.name}</Typography>
                  </AccordionSummary>
                </Accordion>
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
                width: 170, // Ajuste la largeur pour s'assurer que le texte est visible
                padding: "8px 16px", // Ajuste le remplissage pour le rendre plus spacieux
                borderRadius: "8px", // Optionnel : ajoute un bord arrondi
              }}
              onClick={() => setIsModalOpen(true)}
            >
              <AddIcon />
              <Typography sx={{ ml: 1 }}>Ajouter un événement</Typography>
            </Fab>

            {/* Modal (Dialog) pour le formulaire d'ajout d'événement */}

            <Dialog
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              PaperProps={{
                style: {
                  width: "900px", // Remplacez par la largeur souhaitée
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
                      <Typography variant="h6">Informations Client</Typography>
                      <TextField
                        label="N° OR"
                        name="orderNumber"
                        value={newEvent.orderNumber}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                      <TextField
                        label="Nom"
                        name="lastName"
                        value={newEvent.lastName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                      <TextField
                        label="Prénom"
                        name="firstName"
                        value={newEvent.firstName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                      <TextField
                        label="Téléphone"
                        name="phone"
                        value={newEvent.phone}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                      <TextField
                        label="Email"
                        name="email"
                        value={newEvent.email}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                    </Grid>

                    {/* Colonne 2: Infos véhicule et événement */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6">
                        Informations Véhicule
                      </Typography>
                      <TextField
                        label="Immatriculation"
                        name="licensePlate"
                        value={newEvent.licensePlate}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                      <TextField
                        label="VIN"
                        name="vin"
                        value={newEvent.vin}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                      />
                      <TextField
                        label="Modèle"
                        name="model"
                        value={newEvent.model}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                      <TextField
                        label="Couleur"
                        name="color"
                        value={newEvent.color}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                    </Grid>

                    {/* Colonne 1: Infos sur les travaux */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6">
                        Informations Événement
                      </Typography>
                      <TextField
                        label="Travaux"
                        name="workDescription"
                        value={newEvent.workDescription}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                        multiline
                        rows={4} // Nombre de lignes visibles
                      />
                      <TextField
                        label="Prix"
                        name="price"
                        type="number"
                        value={newEvent.price}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                    </Grid>

                    {/* Colonne 2: Infos sur l'événement */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6">
                        Détails de l'événement
                      </Typography>

                      <TextField
                        label="Opérateur"
                        name="operator"
                        value={newEvent.operator}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                      />

                      <Typography variant="p">Date de l'événement</Typography>
                      <TextField
                        // label="Date"
                        name="date"
                        type="date"
                        value={newEvent.date}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                      <Typography variant="p">Date de fin</Typography>
                      <TextField
                        // label="Date"
                        name="date"
                        type="date"
                        value={finDate}
                        onChange={handleInputChangeFinDate}
                        fullWidth
                        margin="normal"
                        required
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            label="Heure de début"
                            name="startHour"
                            type="number"
                            value={newEvent.startHour}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Minutes de début"
                            name="startMinute"
                            type="number"
                            value={newEvent.startMinute}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Heure de fin"
                            name="endHour"
                            type="number"
                            value={newEvent.endHour}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Minutes de fin"
                            name="endMinute"
                            type="number"
                            value={newEvent.endMinute}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                          />
                        </Grid>
                      </Grid>
                      <TextField
                        select
                        label="Catégorie"
                        name="category"
                        value={newEvent.category}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                      >
                        {categories.map((categoryGroup, index) => (
                          <MenuItem key={index} value={categoryGroup.id}>
                            {categoryGroup.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </form>
              </DialogContent>
              <DialogActions>
                <Button onClick={addEvent} color="primary">
                  Ajouter l'événement
                </Button>
                <Button onClick={() => setIsModalOpen(false)} color="secondary">
                  Annuler
                </Button>
              </DialogActions>
            </Dialog>
          </Box>

          {/* Main Content Section */}
          <Box
            sx={{
              flexGrow: 1,
              position: "relative",
              pl: 3,
              backgroundColor: "#f9f9f9",
              padding: 2,
              borderRadius: "8px",
            }}
          >
            {/* Timeline Component */}
            <Timeline />
            {/* Current Time Indicator */}
            <CurrentTimeLine currentHour={currentHour} />

            {/* Droppable Event Zones */}
            {uniqueCategories.map((category, categoryIndex) => {
              const categoryEvents = dataEvents.filter(
                (event) => event.category.id === category.id
              ); // Récupérer les événements de la catégorie
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
                        padding: 1,
                        overflow: "hidden",
                      }}
                    >
                      {lines.map((line, lineIndex) => (
                        <Box
                          key={`line-${lineIndex}`}
                          sx={{
                            display: "flex",
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
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => handleEventClick(event)}
                                  sx={{
                                    position: "absolute",
                                    left: `${
                                      ((event.startHour +
                                        event.startMinute / 60 -
                                        7) /
                                        12) *
                                      100
                                    }%`,
                                    width: `${
                                      ((event.endHour +
                                        event.endMinute / 60 -
                                        (event.startHour +
                                          event.startMinute / 60)) /
                                        12) *
                                      100
                                    }%`,
                                    height: "40px",
                                    backgroundColor:
                                      getEventColor(categoryIndex),
                                    border: snapshot.isDragging
                                      ? "2px solid #90caf9"
                                      : "1px solid #90caf9",
                                    borderRadius: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "background-color 0.3s ease",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {event.title}
                                  </Typography>
                                </Box>
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
        </Box>
      </Box>
      {/* Event Modal */}

      {selectedEvent && (
        <EventModal
          open={modalOpen}
          onClose={handleModalClose}
          event={selectedEvent}
          categories={categories}
          onSave={handleSaveEvent} // Passez la fonction pour enregistrer
        />
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
                    <TableCell>Date</TableCell>
                    <TableCell>Heure de début</TableCell>
                    <TableCell>Heure de fin</TableCell>
                    <TableCell>Véhicule</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataEventsAll.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{event.person.firstName}</TableCell>
                      <TableCell>{event.person.lastName}</TableCell>
                      <TableCell>{event.person.email}</TableCell>
                      <TableCell>
                        {event.person.phone || "Non renseigné"}
                      </TableCell>
                      <TableCell>
                        {new Date(event.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {`${event.startHour}:${
                          event.startMinute < 10
                            ? `0${event.startMinute}`
                            : event.startMinute
                        }`}
                      </TableCell>
                      <TableCell>
                        {`${event.endHour}:${
                          event.endMinute < 10
                            ? `0${event.endMinute}`
                            : event.endMinute
                        }`}
                      </TableCell>
                      <TableCell>
                        {event.vehicule.model || "Non renseigné"} -{" "}
                        {event.vehicule.licensePlate || "Non renseignée"}
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
      </Dialog>
    </DragDropContext>
  );
};

export default Planning;
