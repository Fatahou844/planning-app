import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import CustomerEvent from "../CustumerEvent";

const Timeline = () => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
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

const CalendarUser = () => {
  const [eventsByClient, setEventsByClient] = useState([
    {
      client: "John Doe",
      summary: "2 events",
      date: "Jan 31 - Feb 4",
      items: [
        {
          id: "event-1", // Identifiant unique pour chaque événement
          title: "Entretiens",
          category: "Entretien / Révision",
          operationType: "Maintenance",
          startHour: 8,
          endHour: 10,
        },
        {
          id: "event-8", // Identifiant unique pour chaque événement
          title: "Révision Complète",
          category: "Entretien / Révision",
          operationType: "Full Maintenance",
          startHour: 11,
          endHour: 13,
        },
      ],
    },
    {
      client: "Jane Smith",
      summary: "2 events",
      date: "Jan 31 - Feb 4",
      items: [
        {
          id: "event-2", // Identifiant unique pour chaque événement
          title: "Opération A",
          category: "Rapide",
          operationType: "Quick Service",
          startHour: 8,
          endHour: 10,
        },
        {
          id: "event-9", // Identifiant unique pour chaque événement
          title: "Opération D",
          category: "Rapide",
          operationType: "Quick Review",
          startHour: 14,
          endHour: 16,
        },
      ],
    },
    {
      client: "Paul Brown",
      summary: "2 events",
      date: "Jan 31 - Feb 4",
      items: [
        {
          id: "event-3", // Identifiant unique pour chaque événement
          title: "Opération B",
          category: "Rapide",
          operationType: "Quick Check",
          startHour: 9,
          endHour: 12,
        },
        {
          id: "event-10", // Identifiant unique pour chaque événement
          title: "Opération E",
          category: "Rapide",
          operationType: "Speedy Inspection",
          startHour: 13,
          endHour: 15,
        },
      ],
    },
    {
      client: "Emily White",
      summary: "2 events",
      date: "Jan 31 - Feb 4",
      items: [
        {
          id: "event-4", // Identifiant unique pour chaque événement
          title: "Opération C",
          category: "Rapide",
          operationType: "Quick Fix",
          startHour: 14,
          endHour: 17,
        },
        {
          id: "event-11", // Identifiant unique pour chaque événement
          title: "Opération F",
          category: "Rapide",
          operationType: "Fast Repair",
          startHour: 18,
          endHour: 20,
        },
      ],
    },
    {
      client: "Michael Green",
      summary: "2 events",
      date: "Jan 31 - Feb 4",
      items: [
        {
          id: "event-5", // Identifiant unique pour chaque événement
          title: "Ateliers",
          category: "Mécanique",
          operationType: "Workshop",
          startHour: 13,
          endHour: 15,
        },
        {
          id: "event-12", // Identifiant unique pour chaque événement
          title: "Maintenance Mécanique",
          category: "Mécanique",
          operationType: "Mechanical Maintenance",
          startHour: 15,
          endHour: 17,
        },
      ],
    },
    {
      client: "Laura Blue",
      summary: "2 events",
      date: "Jan 31 - Feb 4",
      items: [
        {
          id: "event-6", // Identifiant unique pour chaque événement
          title: "Électricité",
          category: "Électricité",
          operationType: "Electrical Check",
          startHour: 15,
          endHour: 18,
        },
        {
          id: "event-13", // Identifiant unique pour chaque événement
          title: "Réparation Électrique",
          category: "Électricité",
          operationType: "Electrical Repair",
          startHour: 18,
          endHour: 20,
        },
      ],
    },
    {
      client: "Daniel Gray",
      summary: "3 events",
      date: "Jan 31 - Feb 4",
      items: [
        {
          id: "event-7", // Identifiant unique pour chaque événement
          title: "Climatisation",
          category: "Climatisation",
          operationType: "AC Service",
          startHour: 16,
          endHour: 18,
        },
        {
          id: "event-14", // Identifiant unique pour chaque événement
          title: "Contrôle AC",
          category: "Climatisation",
          operationType: "AC Check",
          startHour: 18,
          endHour: 20,
        },
        {
          id: "event-15", // Identifiant unique pour chaque événement
          title: "Installation AC",
          category: "Climatisation",
          operationType: "AC Installation",
          startHour: 20,
          endHour: 22,
        },
      ],
    },
  ]);
  const [selectedEvent, setSelectedEvent] = useState({
    id: "event-1",
    title: "Entretiens",
    person: "John Doe",
    operationType: "Maintenance",
    startHour: 7,
    endHour: 10,
  });
  const [modalOpen, setModalOpen] = useState(false);

  const [contextMenu, setContextMenu] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [expanded, setExpanded] = useState([
    "John Doe",
    "Jane Smith",
    "Paul Brown",
    "Emily White",
    "Michael Green",
    "Laura Blue",
    "Daniel Gray",
  ]);

  const currentHour = new Date().getHours();

  const handleContextMenu = (event, calendarEvent) => {
    event.preventDefault();
    setSelectedEvent(calendarEvent);
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleChange = (client) => {
    setExpanded((prev) =>
      prev.includes(client)
        ? prev.filter((item) => item !== client)
        : [...prev, client]
    );
  };

  const handleDateChange = (event) => {
    setFilterDate(event.target.value);
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId !== destination.droppableId) return;

    const clientIndex = eventsByClient.findIndex(
      (client) => client.client === source.droppableId
    );
    const client = eventsByClient[clientIndex];

    const [movedEvent] = client.items.splice(source.index, 1);

    setSelectedEvent(movedEvent);
    setModalOpen(true);
  };

  const onDragUpdate = (update) => {
    if (!update.destination || !update.source) return;

    const draggedElement = document.querySelector(
      `[data-rbd-drag-handle-draggable-id="${update.draggableId}"]`
    );

    if (draggedElement) {
      const draggedX = draggedElement.getBoundingClientRect().left;
      const pixelsPerHour = 100;
      const startHour = 7;
      const draggedHour = startHour + Math.floor(draggedX / pixelsPerHour);
      console.log(`Heure actuelle pendant le déplacement: ${draggedHour}:00`);
    }
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
    const updatedEvents = eventsByClient.map((client) => ({
      ...client,
      items: client.items.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      ),
    }));
    setEventsByClient(updatedEvents);
  };

  // Fonctions pour assigner les couleurs
  const getClientColor = (index) => {
    const colors = [
      "#FFB74D",
      "#64B5F6",
      "#81C784",
      "#9575CD",
      "#FF8A65",
      "#FFCC80",
      "#90CAF9",
    ];
    return colors[index % colors.length];
  };

  const getEventColor = (index) => {
    const colors = ["#FFCC80", "#90CAF9", "#A5D6A7", "#B39DDB", "#FFAB91"];
    return colors[index % colors.length];
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
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
            label="Filter by Date"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={filterDate}
            onChange={handleDateChange}
          />
          {/* Clients Accordion */}
          {eventsByClient.map((client, index) => (
            <Accordion
              key={client.client}
              expanded={expanded.includes(client.client)}
              onChange={() => handleChange(client.client)}
              sx={{
                backgroundColor: getClientColor(index), // Appliquer la couleur du client
                borderRadius: "8px",
                marginBottom: "8px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                "&:before": {
                  display: "none", // Retirer la ligne avant l'Accordion pour un aspect plus propre
                },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{client.client}</Typography>
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {client.summary}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="textSecondary">
                  {client.date}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
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

          {/* Time Zone Marking */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: `${((12 - 7) / 12) * 100}%`,
              width: `${((14 - 12) / 12) * 100}%`,
              height: "100%",
              backgroundColor: "rgba(200, 200, 200, 0.3)", // Light gray zone
              zIndex: 0,
            }}
          />

          {/* Droppable Event Zones */}
          {eventsByClient.map((client, clientIndex) => (
            <Droppable droppableId={client.client} key={client.client}>
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    position: "relative",
                    minHeight: "50px",
                    paddingBottom: "16px",
                    borderRadius: "10px",
                    marginBottom: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  {/* Draggable Event Items */}
                  {expanded.includes(client.client) &&
                  client.items.length > 0 ? (
                    client.items.map((event, eventIndex) => (
                      <Draggable
                        key={`${event.title}-${clientIndex}-${eventIndex}`}
                        draggableId={`${event.title}-${clientIndex}-${eventIndex}`}
                        index={eventIndex}
                      >
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onContextMenu={(e) => handleContextMenu(e, event)}
                            onClick={() => handleEventClick(event)}
                            sx={{
                              position: "absolute",
                              top: `${(event.startHour - 7) * 40}px`,
                              left: `${((event.startHour - 7) / 12) * 100}%`,
                              width: `${
                                ((event.endHour - event.startHour) / 12) * 100
                              }%`,
                              height: "40px",
                              backgroundColor: getEventColor(clientIndex),
                              border: snapshot.isDragging
                                ? "2px solid #90caf9"
                                : "1px solid #90caf9",
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: snapshot.isDragging
                                ? "0 3px 6px rgba(0,0,0,0.2)"
                                : "0 1px 3px rgba(0,0,0,0.12)",
                              transition: "all 0.3s ease-in-out",
                              zIndex: snapshot.isDragging ? 2 : 1,
                              "&:hover": {
                                backgroundColor: "#e1f5fe",
                              },
                            }}
                            tabIndex={0}
                          >
                            {/* Event Details */}
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {event.person}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", p: 1 }}
                            >
                              {event.title}
                            </Typography>
                            <Typography variant="caption">
                              {event.startHour}:00 - {event.endHour}:00
                            </Typography>
                            {provided.placeholder}
                          </Box>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <Typography
                      sx={{
                        textAlign: "center",
                        color: "textSecondary",
                        padding: "8px",
                      }}
                    >
                      Aucun événement à afficher
                    </Typography>
                  )}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          ))}
        </Box>

        {/* Event Modal */}
        <CustomerEvent
          open={modalOpen}
          onClose={handleModalClose}
          event={selectedEvent}
          clients={expanded}
          onSave={handleEventSave}
        />
      </Box>
    </DragDropContext>
  );
};

export default CalendarUser;
