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
  TextField,
  Typography,
} from "@mui/material";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
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

const CalendarMin = () => {
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
        const q = query(eventsRef, where("userId", "==", user.uid));

        // Récupérer les documents correspondants
        const querySnapshot = await getDocs(q);

        // Récupérer les objets de la collection (id et data)
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Mettre à jour l'état avec les données récupérées

        console.log("eventsData", eventsData); // Pour vérifier les données dans la console
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des événements : ",
          error
        );
      }
    };

    fetchEvents(); // Appeler la fonction au montage du composant
  }, []); // Le tableau vide signifie que l'effet se déclenche uniquement au montage

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

  const handleEventSave = (updatedEvent) => {
    const updatedEvents = events.map((category) => ({
      ...category,
      items: category.items.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      ),
    }));
    setEvents(updatedEvents);
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

  const calculateEventLines = (items) => {
    // Fonction pour convertir heure et minute en minutes totales
    //const convertToMinutes = (hour, minute) => hour * 60 + minute;
    const convertToMinutes = (hour, minute) => {
      return (parseInt(hour) || 0) * 60 + (parseInt(minute) || 0);
    };

    // Trier les événements par début en utilisant heure et minute
    items.sort((a, b) => {
      const startA = convertToMinutes(a.startHour, a.startMinute || 0);
      const startB = convertToMinutes(b.startHour, b.startMinute || 0);
      return startA - startB;
    });

    // Tableaux pour stocker les lignes
    const lines = [];

    items.forEach((event) => {
      const eventStart = convertToMinutes(
        event.startHour,
        event.startMinute || 0
      );
      const eventEnd = convertToMinutes(event.endHour, event.endMinute || 0);

      let placed = false;

      for (let line of lines) {
        // Vérifier si l'événement chevauche un autre événement de la ligne
        if (
          !line.some((e) => {
            const existingEnd = convertToMinutes(e.endHour, e.endMinute || 0);
            return existingEnd > eventStart;
          })
        ) {
          line.push(event);
          placed = true;
          break;
        }
      }

      if (!placed) {
        lines.push([event]);
      }
    });

    return lines;
  };

  const calculateCategoryHeight = (items) => {
    const lines = calculateEventLines(items);
    return lines.length * 60; // Ajustez la hauteur par ligne ici
  };
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

  const filterByDate = (events, date) => {
    return events
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => item.date === date),
      }))
      .filter((category) => category.items.length > 0);
  };

  useEffect(() => {
    const filteredEvents = selectedDate
      ? filterByDate(eventsCopied, selectedDate)
      : events;

    setEvents(filteredEvents);
  }, [selectedDate]);

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
    console.log("UPDATED EVENTS", updatedEvents);

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

  const handleSearchChange = (e) => {
    // Ajoutez ici la logique de filtrage des événements si nécessaire
    const keyword = e.target.value.toLowerCase();
    setSearchQuery(keyword);

    // Filtrage des données
    const filtered = events.map((category) => {
      const filteredItems = category.items.filter((item) =>
        Object.values(item).some((val) =>
          val.toString().toLowerCase().includes(keyword)
        )
      );
      return { ...category, items: filteredItems };
    });
    setEvents(filtered);
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

          <Button variant="contained" color="secondary">
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
            {events.map((eventCategory, index) => {
              const categoryHeight = calculateCategoryHeight(
                eventCategory.items
              );

              return (
                <Accordion
                  key={eventCategory.category}
                  expanded={expanded.includes(eventCategory.category)}
                  onChange={() => handleChange(eventCategory.category)}
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
                    <Typography variant="body2">
                      {eventCategory.category}
                    </Typography>
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
            {events.map((eventCategory, categoryIndex) => {
              const lines = calculateEventLines(eventCategory.items);
              const categoryHeight = lines.length * 60; // Hauteur pour chaque ligne

              return (
                <Droppable
                  droppableId={eventCategory.category}
                  key={eventCategory.category}
                >
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        position: "relative",
                        // height: `${categoryHeight}px`, // Hauteur dynamique
                        borderRadius: "10px",
                        marginBottom: "16px",
                        // backgroundColor: "white",
                        padding: 1,
                        // boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
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

      <EventModal
        open={modalOpen}
        onClose={handleModalClose}
        event={selectedEvent}
        categories={expanded}
        onSave={handleEventSave}
      />
    </DragDropContext>
  );
};

export default CalendarMin;
