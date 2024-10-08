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
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import eventsData from "../../data/eventsData.json";
import EventModal from "../EventModal";

const Timeline = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "1.8rem",
    }}
  >
    {[...Array(12).keys()].map((hour) => (
      <Box
        key={hour}
        sx={{
          flexGrow: 1,
          textAlign: "center",
          borderRight: "1px solid lightgray",
        }}
      >
        <Typography variant="caption">{7 + hour}:00</Typography>
      </Box>
    ))}
  </Box>
);

const CurrentTimeLine = ({ currentHour }) => (
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left: `${((currentHour - 7) / 12) * 100}%`,
      width: "2px",
      height: "100%",
      backgroundColor: "blue",
      zIndex: 1,
    }}
  />
);

const Calendar = () => {
  const [events, setEvents] = useState(eventsData);
  const [eventsCopied, setEventsCopied] = useState(eventsData);

  const [selectedEvent, setSelectedEvent] = useState({
    id: "event-1",
    title: "Entretiens",
    person: "John Doe",
    operationType: "Maintenance",
    startHour: 7,
    endHour: 10,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState([
    "Entretien / Révision",
    "Rapide",
    "Mécanique",
    "Électricité",
    "Climatisation",
  ]);

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
    // Trier les événements par heure de début
    items.sort((a, b) => a.startHour - b.startHour);

    // Tableaux pour stocker les lignes
    const lines = [];

    items.forEach((event) => {
      let placed = false;
      for (let line of lines) {
        // Vérifier si l'événement chevauche un autre événement de la ligne
        if (!line.some((e) => e.endHour > event.startHour)) {
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
    endHour: "",
    date: "",
    category: "Entretien / Révision", // Catégorie par défaut
  });

  // Ajouter un événement dans la catégorie correspondante
  const addEvent = () => {
    const updatedEvents = [...events]; // Crée une copie de l'array events

    const categoryExists = updatedEvents.some(
      (categoryGroup) => categoryGroup.category === newEvent.category
    );

    if (categoryExists) {
      // Si la catégorie existe déjà, on ajoute l'événement à cette catégorie
      updatedEvents.forEach((categoryGroup) => {
        if (categoryGroup.category === newEvent.category) {
          categoryGroup.items.push({
            id: `event-${Date.now()}`, // Générer un ID unique
            title: newEvent.title,
            person: newEvent.person,
            operationType: newEvent.operationType,
            startHour: parseInt(newEvent.startHour),
            endHour: parseInt(newEvent.endHour),
            date: newEvent.date,
          });
        }
      });
    } else {
      // Si la catégorie n'existe pas, on en crée une nouvelle
      updatedEvents.push({
        category: newEvent.category,
        summary: "1 event", // Tu peux ajuster ce texte en fonction de la logique souhaitée
        date: newEvent.date, // Ou définir une autre logique pour la date
        items: [
          {
            id: `event-${Date.now()}`, // Générer un ID unique
            title: newEvent.title,
            person: newEvent.person,
            operationType: newEvent.operationType,
            startHour: parseInt(newEvent.startHour),
            endHour: parseInt(newEvent.endHour),
            date: newEvent.date,
          },
        ],
      });
    }

    // Mettre à jour le state avec le nouvel événement ajouté
    setEvents(updatedEvents);

    console.log("UPDATED EVENTS", updatedEvents);

    // Réinitialiser le formulaire et fermer le modal
    setNewEvent({
      title: "",
      person: "",
      operationType: "",
      startHour: "",
      endHour: "",
      date: "",
      category: "Entretien / Révision",
    });
    setIsModalOpen(false); // Fermer le modal
  };

  // Gérer la saisie dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  return (
    <DragDropContext>
      {/* Modal pour ajouter un événement */}

      <Box
        sx={{
          padding: 3,
          display: "flex",
          position: "relative",
          width: "100%",
        }}
      >
        {/* Sidebar Section */}
        <Box sx={{ width: "250px", borderRight: "1px solid lightgray", pr: 2 }}>
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
            const categoryHeight = calculateCategoryHeight(eventCategory.items);

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
          <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <DialogTitle>Ajouter un événement</DialogTitle>
            <DialogContent>
              <form>
                <TextField
                  label="Titre"
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
                <TextField
                  label="Personne"
                  name="person"
                  value={newEvent.person}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
                <TextField
                  label="Type d'opération"
                  name="operationType"
                  value={newEvent.operationType}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
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
                <TextField
                  name="date"
                  type="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
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
                  {eventsCopied.map((categoryGroup, index) => (
                    <MenuItem key={index} value={categoryGroup.category}>
                      {categoryGroup.category}
                    </MenuItem>
                  ))}
                </TextField>
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
                                    ((event.startHour - 7) / 12) * 100
                                  }%`,
                                  width: `${
                                    ((event.endHour - event.startHour) / 12) *
                                    100
                                  }%`,
                                  height: "40px",
                                  backgroundColor: getEventColor(categoryIndex),
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

export default Calendar;
