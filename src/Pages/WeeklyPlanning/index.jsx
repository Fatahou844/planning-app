import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import {
  addDays,
  addWeeks,
  format,
  isValid,
  parse,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import AddDocumentComponent from "../../Components/AddDocumentComponent";
import DocumentModal from "../../Components/DocumentModal";
import EventModal from "../../Components/EventModal";
import Notification from "../../Components/Notification";
import { useAxios } from "../../utils/hook/useAxios";

export default function WeeklyPlanning({
  ordersData = [],
  handleEventFromChild,
  garageId,
  dateSelected,
  onDateChange, // 👈 callback fourni par le parent
}) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(dateSelected || new Date(), { weekStartsOn: 1 })
  );

  const axios = useAxios();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [events, setEvents] = useState(ordersData); // ⚡ copie locale des données
  const [facture, setFacture] = useState(null);
  const [modalOpen2, setModalOpen2] = useState(false);
  const [modalOpen3, setModalOpen3] = useState(false);
  const [collectName, setCollectName] = useState("factures");
  const [collectionName, setCollectionName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // 👈 petit compteur

  const [details, setDetails] = useState([
    {
      label: "",
      quantity: "",
      unitPrice: "",
      discountPercent: "",
      discountAmount: "",
    },
  ]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [showPopup, setShowPopup] = useState(false);

  const handleShowPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    console.log("fermeture du popup");
  };

  const cellStyle = {
    textAlign: "center",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
  };

  // --- fonction pour rafraîchir depuis l’API ---
  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `/documents-garage/order/${garageId}/details`
      );
      setEvents(response.data.data.filter((event) => !event.isClosed) || []);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des événements :", error);
    }
  };
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

  // Fonction qui sera appelée par l'enfant pour envoyer la facture
  const handleFactureReceived = (factureData) => {
    setFacture(factureData?.data);
    console.log(
      "---------------------------------- Call handleFactureReceived ------------------------------",
      factureData?.data
    );

    if (factureData) {
      setModalOpen(false);

      setShowPopup(true);
      setModalOpen2(false);
      setModalOpen3(true);
      setFacture(factureData?.data);

      handleOpenNotif("Facture");
      setSelectedEvent({
        ...selectedEvent,
        id: factureData?.data.id,
        lastEventId: selectedEvent.id,
      });
    }
  };

  // --- wrapper pour handleFactureReceived ---
  const onFactureReceive = async (...args) => {
    if (handleFactureReceived) {
      await handleFactureReceived(...args); // exécute le callback du parent si défini
    }
    await fetchEvents(); // puis recharge les données
  };

  // ⚡ hook qui met à jour events si ordersData change côté parent
  useEffect(() => {
    setEvents(ordersData);
    console.log("************* ORDERSDATA ******************", ordersData);
  }, [ordersData]);

  const safeParseDate = (dateStr) => {
    if (!dateStr) return null;
    let d = new Date(dateStr);
    if (!isValid(d)) d = parse(dateStr, "yyyy-MM-dd HH:mm:ss", new Date());
    if (!isValid(d)) d = parse(dateStr, "dd/MM/yyyy HH:mm", new Date());
    return isValid(d) ? d : null;
  };

  const weekDays = [];
  for (let i = 0; i < 7; i++) weekDays.push(addDays(currentWeekStart, i));

  const grouped = {};

  events.forEach((order) => {
    const baseDate = safeParseDate(order.date);
    if (!baseDate) return;
    baseDate.setHours(order.startHour || 0, order.startMinute || 0, 0, 0);
    const dayKey = format(baseDate, "yyyy-MM-dd");
    const hourKey = format(baseDate, "HH:mm"); // inclut les minutes

    if (!grouped[dayKey]) grouped[dayKey] = {};
    if (!grouped[dayKey][hourKey]) grouped[dayKey][hourKey] = [];
    grouped[dayKey][hourKey].push({
      title: `N° ${order.id || ""} • ${order.Vehicle?.plateNumber || ""}`,
      color: order.Category?.color || "#4F46E5",
      or: order,
    });
  });

  // Heures toutes les 30 minutes
  const hours = [];
  for (let h = 6; h < 24; h++) {
    hours.push(`${String(h).padStart(2, "0")}:00`);
    hours.push(`${String(h).padStart(2, "0")}:30`);
  }

  // const prevWeek = () => setCurrentWeekStart((w) => addWeeks(w, -1));
  // const nextWeek = () => setCurrentWeekStart((w) => addWeeks(w, 1));
  // --- boutons navigation ---

  const prevWeek = () => {
    setCurrentWeekStart((w) => {
      const newStart = addWeeks(w, -1);
      onDateChange?.(newStart); // 👈 notifier le parent
      return newStart;
    });
  };

  const nextWeek = () => {
    setCurrentWeekStart((w) => {
      const newStart = addWeeks(w, 1);
      onDateChange?.(newStart); // 👈 notifier le parent
      return newStart;
    });
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);

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
  const handleModalClose = () => {
    setModalOpen(false);
    console.log("FERMETURE");
  };
  const handleEditedEventChange = (updatedEvent) => {
    console.log(
      "########### updatedEvent updatedEvent #################",
      updatedEvent
    );
    setSelectedEvent(updatedEvent);
  };
  const handleSaveEvent = async (updatedEvent) => {
    if (!updatedEvent || !updatedEvent.id) return; // Vérifiez que l'événement a un ID

    try {
      // Référence au document à mettre à jour

      console.log("Événement mis à jour avec succès:", updatedEvent);

      const fetchEvents = async () => {
        try {
          const response = await axios.get(
            `/documents-garage/order/${garageId}/details`
          );

          const eventsData = response.data.data;

          // Filtrer les événements si nécessaire
          const filteredEvents = eventsData.filter(
            (event) => event.date === !event.isClosed
          );

          console.log("eventsData", filteredEvents);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des événements :",
            error
          );
        }
      };

      fetchEvents();

      // fetchEvents(); // Appeler la fonction au montage du composant
      handleModalClose(); // Ferme le modal après la sauvegarde
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement :", error);
    }
  };
  const handleEventDetailClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };
  const handleModalClose3 = () => {
    setModalOpen3(false);
    console.log("modalOpen2", modalOpen2);
  };

  // useEffect(() => {
  //   if (dateSelected) {
  //     setCurrentWeekStart(startOfWeek(dateSelected, { weekStartsOn: 1 }));
  //   }
  // }, [dateSelected]);

  const lastDateRef = useRef(null); // 👈 garde en mémoire la dernière valeur

  useEffect(() => {
    if (dateSelected) {
      const parsedDate = new Date(dateSelected);
      if (!isNaN(parsedDate)) {
        // Vérifie si la nouvelle date est différente de l'ancienne
        if (
          !lastDateRef.current ||
          parsedDate.getTime() !== lastDateRef.current.getTime()
        ) {
          setCurrentWeekStart(startOfWeek(parsedDate, { weekStartsOn: 1 }));
          lastDateRef.current = parsedDate; // update la ref
        }
      }
    }
  }, [dateSelected]);

  const handleDocumentCreated = async () => {
    // Ici tu peux par ex :
    // - Mettre à jour ton state `ordersData` ou `events`
    // - Appeler une API
    // - Déclencher un re-render ou recalculer la semaine
    try {
      const response = await axios.get(
        `/documents-garage/order/${garageId}/details`
      );
      setEvents(response.data.data.filter((event) => !event.isClosed) || []);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des événements :", error);
    }
  };

  return (
    <Paper sx={{ px: 2, bgcolor: "#F8FAFC" }}>
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
          onFactureReceive={onFactureReceive}
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
          onFactureReceive={onFactureReceive}
        />
      )}
      {showPopup && (
        <Notification
          message={notification.message}
          handleClose={handleClosePopup}
          collectionName={collectName}
          dataEvent={selectedEvent}
          dataDetails={details}
        />
      )}
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: "flex",
          gap: 1,
          zIndex: 1000, // pour être au-dessus du tableau
        }}
      >
        <Button
          variant="contained"
          size="small"
          sx={{ minHeight: 20, px: 1 }}
          onClick={prevWeek}
        >
          ← précédent
        </Button>
        <Button
          variant="contained"
          size="small"
          sx={{ minHeight: 20, px: 1 }}
          onClick={nextWeek}
        >
          suivante →
        </Button>
      </Box>
      <AddDocumentComponent
        onDocumentCreated={handleDocumentCreated}
      ></AddDocumentComponent>
      {/* <TableContainer
        sx={{
          maxHeight: "70vh", // 👈 limite la hauteur
          overflowY: "auto",
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: isDark
            ? "0 0 12px rgba(255, 255, 255, 0.05)"
            : "0 0 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Table sx={{ px: 2, tableLayout: "fixed" }} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 80, ...cellStyle }}>Heure</TableCell>
              {weekDays.map((day) => (
                <TableCell key={day} sx={{ ...cellStyle }}>
                  {format(day, "EEEE dd/MM", { locale: fr })}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {hours.map((hour, i) => (
              <TableRow
                key={hour}
                sx={{ bgcolor: i % 2 === 0 ? "#fff" : "#afafafff" }}
              >
                <TableCell
                  sx={{
                    textAlign: "center",
                    fontSize: "0.85rem",
                    border: "1px solid #E2E8F0",
                    ...cellStyle,
                  }}
                >
                  {hour}
                </TableCell>
                {weekDays.map((day) => {
                  const dayKey = format(day, "yyyy-MM-dd");
                  const slotEvents = grouped[dayKey]?.[hour] || [];
                  const rowsNeeded = Math.ceil(slotEvents.length / 2) || 1;

                  return (
                    <TableCell
                      key={`${dayKey}-${hour}`}
                      sx={{
                        p: 0.5,
                        border: "1px solid #E2E8F0",
                        height: `${rowsNeeded * 32}px`,
                        ...cellStyle,
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 0.5,
                        }}
                      >
                        {slotEvents.map((ev, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              bgcolor: ev.color,
                              color: "#fff",
                              borderRadius: 1,
                              px: 0.5,
                              fontSize: "0.75rem",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            onClick={() => {
                              setSelectedEvent({
                                ...ev.or,
                                lastEventId: ev.or.id,
                              }); // Met à jour l'événement sélectionné

                              setModalOpen(true);
                            }}
                          >
                            {ev.title}
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}
      <TableContainer
        sx={{
          maxHeight: "70vh",
          overflowY: "auto",
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: isDark
            ? "0 0 12px rgba(255, 255, 255, 0.05)"
            : "0 0 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Table sx={{ px: 2, tableLayout: "fixed" }} stickyHeader>
          {/* ==== HEADER ==== */}
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 80, ...cellStyle }}>Heure</TableCell>
              {weekDays.map((day) => (
                <TableCell key={day} sx={{ ...cellStyle }}>
                  {format(day, "EEEE dd/MM", { locale: fr })}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* ==== BODY ==== */}
          <TableBody>
            {(() => {
              // Génère les heures toutes les 30 minutes
              const hours = [];
              for (let h = 6; h < 24; h++) {
                hours.push(`${String(h).padStart(2, "0")}:00`);
                hours.push(`${String(h).padStart(2, "0")}:30`);
              }

              return hours.map((hour, i) => (
                <TableRow
                  key={hour}
                  sx={{ bgcolor: i % 2 === 0 ? "#fff" : "#f7f7f7" }}
                >
                  {/* ==== Colonne Heure ==== */}
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontSize: "0.85rem",
                      border: "1px solid #E2E8F0",
                      ...cellStyle,
                    }}
                  >
                    {hour}
                  </TableCell>

                  {/* ==== Colonnes Jours ==== */}
                  {weekDays.map((day) => {
                    const dayKey = format(day, "yyyy-MM-dd");

                    // Découpe l'heure et calcule le quart d'heure suivant
                    const [baseHour, baseMinute] = hour.split(":").map(Number);
                    const nextMinute = baseMinute === 0 ? 15 : 45; // 0→15, 30→45

                    const firstSlot = `${String(baseHour).padStart(
                      2,
                      "0"
                    )}:${String(baseMinute).padStart(2, "0")}`;
                    const secondSlot = `${String(baseHour).padStart(
                      2,
                      "0"
                    )}:${String(nextMinute).padStart(2, "0")}`;

                    // Fusion des événements 00+15 ou 30+45
                    const slotEvents = [
                      ...(grouped[dayKey]?.[firstSlot] || []),
                      ...(grouped[dayKey]?.[secondSlot] || []),
                    ];

                    const rowsNeeded = Math.ceil(slotEvents.length / 2) || 1;

                    return (
                      <TableCell
                        key={`${dayKey}-${hour}`}
                        sx={{
                          p: 0.5,
                          border: "1px solid #E2E8F0",
                          height: `${rowsNeeded * 32}px`,
                          ...cellStyle,
                        }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 0.5,
                          }}
                        >
                          {slotEvents.map((ev, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                bgcolor: ev.color || "#3b82f6",
                                color: "#fff",
                                borderRadius: 1,
                                px: 0.5,
                                fontSize: "0.75rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setSelectedEvent({
                                  ...ev.or,
                                  lastEventId: ev.or.id,
                                });
                                setModalOpen(true);
                              }}
                            >
                              {ev.title}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
