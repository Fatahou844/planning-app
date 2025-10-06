import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LogoutIcon from "@mui/icons-material/Logout"; // Icone de plus pour le bouton flottant
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Badge,
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
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Popover,
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
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import logoGarage from "../../assets/images/garageLogo.jpg";
import ClientSearch from "../../Components/ClientSearch/ClientSearch";
import eventsData from "../../data/eventsData.json";
import { db } from "../../hooks/firebaseConfig"; // Votre configuration Firestore
import DocModal from "../DocModal";
import DocumentModal from "../DocumentModal";
import EventModal from "../EventModal";
import Notification from "../Notification";
// import jumelles from "../../assets/images/jumelles.png";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTheme } from "@mui/material";
import WeeklyPlanning from "../../Pages/WeeklyPlanning";
import useAutoLogout from "../../utils/hook/useAutoLogout";
import { useAxios } from "../../utils/hook/useAxios";
import EmailSearch from "../EmailSearch/EmailSearch";
import FirstnameSearch from "../FirstnameSearch/FirstnameSearch";
import NotificationsModal from "../NotificationsModal/NotificationsModal";
import PlateNumberSearch from "../PlateNumberSearch/PlateNumberSearch";
import UserSearch from "../UserSearch/UserSearch";

function generateTimeSlots({ startHour, startMinute, endHour, endMinute }) {
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  const slots = (end - start) / 15; // +1 pour inclure la dernière demi-heure
  return Array.from({ length: slots }, (_, index) => start + index * 15);
}

const Timeline = ({ config }) => {
  const timeSlots = generateTimeSlots(config);
  console.log(
    "2.------------------------------ TIMESLOTS CONFIG -------------------------------",
    config
  );
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "grid",
        marginBottom: "1.8rem",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        gridTemplateColumns: `repeat(${timeSlots.length}, minmax(50px, 1fr))`,
      }}
    >
      {timeSlots.map((minutes, i) => {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        const isEven = i % 2 === 0;
        const bgColor = isEven
          ? theme.palette.mode === "light"
            ? "#f3f4f6" // gris clair pour light
            : "#1e293b" // bleu foncé pour dark
          : theme.palette.background.paper;

        const borderColor =
          theme.palette.mode === "light" ? "#d1d5db" : "#334155"; // Tailwind-inspired
        return (
          <Box
            key={i}
            sx={{
              borderRight: `1px solid ${borderColor}`,
              backgroundColor: bgColor,
              position: "relative",
              height: "100%",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                paddingLeft: "0.5rem",
                position: "relative",
                zIndex: 1,
                marginLeft: "-1.499rem",
                color: theme.palette.text.secondary,
              }}
            >
              {/* {hour.toString().padStart(2, "0")}:{minute === 0 ? "00" : "30"} */}
              {hour.toString().padStart(2, "0")}:
              {minute === 0
                ? "00"
                : minute === 15
                ? "15"
                : minute === 30
                ? "30"
                : "45"}
            </Typography>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor:
                  i % 2 === 0
                    ? theme.palette.mode === "light"
                      ? "#f3f4f6" // clair (light)
                      : "#1e293b" // foncé (dark)
                    : theme.palette.background.paper,
                zIndex: 0,
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

const CurrentTimeLine = ({ config }) => {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  const start = config.startHour + config.startMinute / 60;
  const end = config.endHour + config.endMinute / 60;
  const totalDuration = end - start;

  const relativePosition = ((currentHour - start) / totalDuration) * 100;
  const clampedPosition = Math.max(0, Math.min(relativePosition, 100));

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: `${clampedPosition}%`,
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
  const [view, setView] = useState("day");

  const [dataEvents, setDataEvents] = useState([]);
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpen2, setModalOpen2] = useState(false);
  const [modalOpen3, setModalOpen3] = useState(false);
  const [facture, setFacture] = useState(null);
  const [draggingEvent, setDraggingEvent] = useState(null); // contient l’event en déplacement
  const [dragStartX, setDragStartX] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0); // position x de la souris
  const [collectionName, setCollectionName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const notifications = [
    "Nouvelle commande reçue",
    "Message de l’équipe support",
    "Mise à jour disponible",
  ];

  const [expanded, setExpanded] = useState([
    "Entretien / Révision",
    "Rapide",
    "Mécanique",
    "Électricité",
    "Climatisation",
  ]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

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

  useEffect(() => {
    const today = new Date();
    // Formatage de la date en YYYY-MM-DD
    const formattedDate = today.toISOString().split("T")[0];
    setSelectedDate(formattedDate); // Initialiser le state avec la date d'aujourd'hui
  }, []); // État pour stocker la date sélectionnée  handleSearchClick

  useEffect(() => {
    if (getCurrentUser().garageId) {
      axios
        .get(`/users/garageid/${getCurrentUser().garageId}`)
        .then((res) => setUsers(res.data))
        .catch((err) => {
          console.error("Erreur de chargement des utilisateurs :", err);
          setUsers([]);
        });
    }
  }, [, getCurrentUser().garageId]);

  useEffect(() => {
    const run = async () => {
      await handleSearchClickFull();
      await handleRefrechData(); // ← assure-toi qu'on attend bien l'exécution
    };
    run();
  }, [facture]);

  // useEffect(() => {
  //   if (!draggingEvent) return;

  //   const handleMouseMove = (e) => {
  //     if (!draggingEvent || !timelineRef.current) return;

  //     const timelineRect = timelineRef.current.getBoundingClientRect();

  //     const newX = e.clientX - timelineRect.left - draggingEvent.offsetX;
  //     const clampedX = Math.max(0, Math.min(newX, timelineRect.width));

  //     setDragX(clampedX);

  //     // Optionnel : affichage en temps réel de l'heure
  //     const timeSlots = generateTimeSlots(configExample);
  //     const columnWidth = timelineRect.width / timeSlots.length;
  //     const index = Math.floor(clampedX / columnWidth);
  //     const minutes = timeSlots[index];
  //     const hour = Math.floor(minutes / 60);
  //     const minute = minutes % 60;

  //     console.log(
  //       `🕒 Heure actuelle glissée: ${hour}:${minute
  //         .toString()
  //         .padStart(2, "0")}`
  //     );
  //   };

  //   const handleMouseUp = () => {
  //     if (!timelineRef.current) return;

  //     const timelineRect = timelineRef.current.getBoundingClientRect();
  //     const timeSlots = generateTimeSlots(configExample);
  //     const slotWidth = timelineRect.width / timeSlots.length;
  //     const index = Math.floor(dragX / slotWidth);
  //     const startMinutes = timeSlots[index];

  //     const duration =
  //       draggingEvent.endHour * 60 +
  //       draggingEvent.endMinute -
  //       (draggingEvent.startHour * 60 + draggingEvent.startMinute);

  //     const endMinutes = startMinutes + duration;

  //     const startHour = Math.floor(startMinutes / 60);
  //     const startMinute = startMinutes % 60;
  //     const endHour = Math.floor(endMinutes / 60);
  //     const endMinute = endMinutes % 60;

  //     console.log(
  //       `✅ Relâché → Nouvelle plage : ${startHour}:${startMinute
  //         .toString()
  //         .padStart(2, "0")} → ${endHour}:${endMinute
  //         .toString()
  //         .padStart(2, "0")}`
  //     );

  //     // Remet les states à 0
  //     setDraggingEvent(null);
  //     setDragX(0);
  //   };

  //   window.addEventListener("mousemove", handleMouseMove);
  //   window.addEventListener("mouseup", handleMouseUp);

  //   return () => {
  //     window.removeEventListener("mousemove", handleMouseMove);
  //     window.removeEventListener("mouseup", handleMouseUp);
  //   };
  // }, [draggingEvent, dragX]);
  useEffect(() => {
    if (!draggingEvent) return;

    const handleMouseMove = (e) => {
      if (!timelineRef.current || !draggingEvent) return;

      const timelineRect = timelineRef.current.getBoundingClientRect();
      const delta = e.clientX - dragStartX; // déplacement souris
      const newX = draggingEvent.initialLeft + delta;

      const clampedX = Math.max(0, Math.min(newX, timelineRect.width));
      console.log(`🕒 clampedX: ${clampedX}`);

      setDragX(clampedX);

      // Affichage en temps réel
      const timeSlots = generateTimeSlots(configExample);
      const columnWidth = timelineRect.width / timeSlots.length;
      const index = Math.floor(clampedX / columnWidth);
      const minutes = timeSlots[index];
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;

      console.log(
        `🕒 Heure actuelle glissée: ${hour}:${minute
          .toString()
          .padStart(2, "0")}`
      );
    };

    const handleMouseUp = () => {
      if (!timelineRef.current) return;

      const timelineRect = timelineRef.current.getBoundingClientRect();
      const timeSlots = generateTimeSlots(configExample);
      const slotWidth = timelineRect.width / timeSlots.length;
      const index = Math.floor(dragX / slotWidth);
      const startMinutes = timeSlots[index];

      const duration =
        draggingEvent.endHour * 60 +
        draggingEvent.endMinute -
        (draggingEvent.startHour * 60 + draggingEvent.startMinute);

      const endMinutes = startMinutes + duration;

      const startHour = Math.floor(startMinutes / 60);
      const startMinute = startMinutes % 60;
      const endHour = Math.floor(endMinutes / 60);
      const endMinute = endMinutes % 60;

      console.log(
        `✅ Relâché → Nouvelle plage : ${startHour}:${startMinute
          .toString()
          .padStart(2, "0")} → ${endHour}:${endMinute
          .toString()
          .padStart(2, "0")}`
      );

      setDraggingEvent(null);
      setDragX(0);
      setIsDragging(false);
      setDragStartX(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingEvent, dragX, dragStartX]);

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
  const [configExample, setconfigExample] = useState({
    startHour: 8,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
  });

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

  const [selectedNewEvents, setSelectedNewEvents] = useState([]);

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

  const currentHour = new Date().getHours();

  const handleRefrechData = async () => {
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
      console.log("filteredEvents", filteredEvents);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des événements après refresh:",
        error
      );
    }
  };

  const handleEventClick = (event) => {
    // Trouver l'original dans selectedNewEvents
    const originalEvent = selectedNewEvents.find((e) => e.id === event.id);

    if (originalEvent) {
      // Remplacer les heures dans une copie de l'objet
      const enrichedEvent = {
        ...event,
        startHour: originalEvent.startHour,
        startMinute: originalEvent.startMinute,
        endHour: originalEvent.endHour,
        endMinute: originalEvent.endMinute,
        endDate: originalEvent.endDate,
      };

      console.log("🛠️ Event enrichi :", enrichedEvent);

      // Utilise enrichedEvent à la place de event
      // Par exemple, ouvrir une modal, ou setter dans un state
      setSelectedEvent(enrichedEvent);
    } else {
      console.warn("⚠️ Aucune correspondance trouvée dans selectedNewEvents.");
      setSelectedEvent(event);
    }
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

  // Fonction pour générer un numéro de commande formaté à 5 chiffres
  const generateOrderNumber = (lastOrderNumber) => {
    const newOrderNumber = lastOrderNumber + 1;
    return newOrderNumber.toString().padStart(5, "0"); // Format à 5 chiffres
  };

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
    const { name, value } = event.target;
    const updatedDetails = [...details];

    let rawValue = value.trim();
    const normalizedValue = rawValue.replace(",", ".");

    if (name === "discountAmount" || name === "discountPercent") {
      // (Pas besoin de changer ici, ça marche déjà bien)
      updatedDetails[index].discountAmount = "";
      updatedDetails[index].discountPercent = "";

      if (normalizedValue.includes("%")) {
        const percent = parseFloat(normalizedValue.replace("%", ""));
        if (!isNaN(percent)) {
          updatedDetails[index].discountPercent = percent;
        }
      } else if (normalizedValue !== "") {
        const amount = parseFloat(normalizedValue);
        if (!isNaN(amount)) {
          updatedDetails[index].discountAmount = amount;
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
        quantity: 0,
        quantityInput: "",
        unitPrice: 0,
        unitPriceInput: "",
        discountAmount: "",
        discountPercent: "",
        inputValue: "",
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
    setSelectedEvent(updatedEvent);
  };

  const handleEventDetailClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };
  // function calculateTimeValue(hour, minute) {
  //   return 2 * (hour - 0) + Math.floor(minute / 30) + 1;
  // }

  // function calculateTimeValue(hour, minute, config) {
  //   const totalMinutes = hour * 60 + minute;
  //   const startMinutes = config.startHour * 60 + config.startMinute;
  //   return Math.floor((totalMinutes - startMinutes) / 30) + 1;
  // }

  // function calculateTimeValue(hour, minute, config) {
  //   const totalMinutes = hour * 60 + minute;
  //   const startMinutes = config.startHour * 60 + config.startMinute;
  //   const diff = totalMinutes - startMinutes;

  //   // Sécurise si avant début du planning
  //   if (diff < 0) return 1;

  //   // Vérifie si le temps est aligné sur une demi-heure
  //   if (diff % 30 !== 0) {
  //     console.warn("Attention : l'heure ne tombe pas pile sur une demi-heure.");
  //   }

  //   return diff / 30 + 1; // ici on n'arrondit pas, on exige demi-heure pile
  // }
  function calculateTimeValue(hour, minute, config) {
    const totalMinutes = hour * 60 + minute;
    const startMinutes = config.startHour * 60 + config.startMinute;
    const diff = totalMinutes - startMinutes;

    // Sécurise si avant début du planning
    if (diff < 0) return 1;

    // Vérifie si le temps est aligné sur un quart d'heure
    if (diff % 15 !== 0) {
      console.warn(
        "Attention : l'heure ne tombe pas pile sur un quart d'heure."
      );
    }

    return diff / 15 + 1; // on compte un slot toutes les 15 minutes
  }

  const getTimeFromIndex = (index, config) => {
    const interval = config.intervalInMinutes || 30;
    const startMinutes = config.startHour * 60 + config.startMinute;
    const totalMinutes = startMinutes + index * interval;

    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    return { hour, minute };
  };

  const handleEventFromChild = () => {
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

  // Renvoie 'black' ou 'white' selon la luminosité du fond
  const getContrastTextColor = (hexColor) => {
    if (!hexColor) return "#000";

    // Supprimer le hash (#) si présent
    const hex = hexColor.replace("#", "");

    // Convertir en RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calcul de la luminance perçue
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Si luminance > 0.6, fond clair → texte noir
    return luminance > 0.6 ? "#000" : "#fff";
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
    console.log(
      "---------------------------------- Call handleFactureReceived ------------------------------",
      factureData?.data
    );

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
      handleRefrechData();

      handleOpenNotif("Facture");
      setSelectedEvent({
        ...selectedEvent,
        id: factureData?.data.id,
        lastEventId: selectedEvent.id,
      });
    }
  };

  const [newOrder, setNewOrder] = useState({});

  const handleOnNotficationSuccess = (valeur) => {
    setModalOpen(false);
    setNewOrder(valeur);

    setSelectedEvent({
      ...selectedEvent,
      id: valeur.id,
      lastEventId: selectedEvent.id,
    });

    console.log(
      "*************************************** handleOnNotficationSuccess ******************************** ",
      valeur
    );

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

  const [originalVehicle, setOriginalVehicle] = useState(null);

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

  const handleLogout = async () => {
    try {
      // Optionnel : suppression de la clé du localStorage
      const token = Cookies.get("jwtToken"); // si encore présent avant remove
      if (token) {
        try {
          const payloadBase64 = token.split(".")[1];
          const payload = JSON.parse(atob(payloadBase64));
          const userEmail = payload?.sub;
          if (userEmail) {
            localStorage.removeItem(`hasSeenNotification_${userEmail}`);
          }
        } catch (e) {
          console.error("Erreur décodage JWT :", e);
        }
      }

      await axios.get("/logout"); // pour envoyer les cookies
      document.cookie =
        "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      window.location.href = "/"; // redirection après logout
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    }
  };
  useAutoLogout(handleLogout); // ⏳ auto logout après 10min inactivité

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

  const [contextMenu, setContextMenu] = useState(null); // {mouseX, mouseY, eventData}
  const [contextMenuPaste, setContextMenuPaste] = useState(null); // {mouseX, mouseY, eventData}

  const [copiedEvent, setCopiedEvent] = useState(null); // pour gérer le copier/coller
  const [isCut, setIsCut] = useState(false);
  const handleContextMenu = (event, currentEvent) => {
    event.preventDefault();
    event.stopPropagation(); // ✨ Empêche l’événement d’atteindre le box global
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            eventData: currentEvent,
          }
        : null
    );
    setContextMenuPaste(null);
  };

  const handleContextMenuPaste = (event) => {
    event.preventDefault();
    setContextMenuPaste(
      contextMenuPaste === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );

    console.log("mouseX: ", event.mouseX);
    console.log("mouseY: ", event.mouseY);
    setContextMenu(null); // On ferme le menu interne
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleCloseContextMenuPaste = () => {
    setContextMenuPaste(null);
  };

  const handleCopy = () => {
    setCopiedEvent(contextMenu.eventData);
    handleCloseContextMenu();
  };

  const handlePaste = async () => {
    if (!copiedEvent || !selectedDate) return;

    // Convertir ancienne date de début et de fin en Date
    const oldStartDate = new Date(copiedEvent.date);
    const oldEndDate = new Date(copiedEvent.endDate);

    // Calculer le décalage en millisecondes entre les deux
    const durationMs = oldEndDate.getTime() - oldStartDate.getTime();

    // Créer une nouvelle date de début
    const newStartDate = new Date(selectedDate);
    newStartDate.setHours(copiedEvent.startHour);
    newStartDate.setMinutes(copiedEvent.startMinute);
    newStartDate.setSeconds(0);
    newStartDate.setMilliseconds(0);

    // Créer la nouvelle date de fin en ajoutant la durée
    const newEndDate = new Date(newStartDate.getTime() + durationMs);

    // Préparer la copie à envoyer
    const payload = {
      ...copiedEvent,

      date: selectedDate,
      endDate: new Date(newEndDate.setUTCHours(0, 0, 0, 0)).toISOString(), //newEndDate.toISOString(),
    };

    try {
      setLoading(true);
      const response = await axios.post("/orders", payload);
      console.log("Rendez-vous collé avec succès", response.data);
      if (payload.Details) {
        addEventDetails(response.data.id, payload.Details);
      }
    } catch (error) {
      console.error("Erreur lors du collage :", error);
    } finally {
      setLoading(false);
    }

    handleCloseContextMenu();
    handleCloseContextMenuPaste();
    handleClose();
  };

  const handleCut = async (eventToCut) => {
    // Étape 0
    try {
      const response = await axios.get(`/orders/${eventToCut.id}`);

      // Étape 1 : Copier les données
      setCopiedEvent({
        ...eventToCut,
        startHour: response.data.data.startHour,
        startMinute: response.data.data.startMinute,
        endHour: response.data.data.endHour,
        endMinute: response.data.data.endMinute,
      });
      console.log("eventToCut", {
        ...eventToCut,
        startHour: response.data.data.startHour,
        startMinute: response.data.data.startMinute,
        endHour: response.data.data.endHour,
        endMinute: response.data.data.endMinute,
      });
      setIsCut(true);
    } catch (error) {
      console.error("Erreur lors du cut :", error);
    }

    // Étape 2 : Supprimer visuellement
    try {
      await axios.deleteData(`/orders/${eventToCut.id}`);
      console.log("Rendez-vous coupé (supprimé) :", eventToCut.id);
    } catch (error) {
      console.error("Erreur lors du cut :", error);
    }

    handleCloseContextMenu();
    handleClose();
  };
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cellStyle = {
    textAlign: "center",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
  };

  // ÉTATS
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const timelineRef = React.useRef(); // ref sur le container

  const formatHourMinute = (hour) => {
    if (!hour) return ""; // ou autre fallback adapté
    return hour.toString().padStart(2, "0") + ":00";
  };

  const updateEventTime = (
    eventId,
    { startHour, startMinute, endHour, endMinute }
  ) => {
    setDataEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? { ...event, startHour, startMinute, endHour, endMinute }
          : event
      )
    );
  };

  const handleConfirmUpdate = async () => {
    try {
      // await updateEvent(draggedEvent.id, {
      //   startHour: draggedEvent.newStart.hour,
      //   startMinute: draggedEvent.newStart.minute,
      //   endHour: draggedEvent.newEnd.hour,
      //   endMinute: draggedEvent.newEnd.minute,
      // });

      console.log(
        "---------------------- draggedEvent.id ----------------",
        draggedEvent.id
      );
      console.log("---------------------- draggedEvent.id ----------------", {
        startHour: draggedEvent.newStart.hour,
        startMinute: draggedEvent.newStart.minute,
        endHour: draggedEvent.newEnd.hour,
        endMinute: draggedEvent.newEnd.minute,
      });

      setShowConfirmModal(false);
      setDraggedEvent(null);
      // fetchEvents(); // ou tout autre rafraîchissement des données
    } catch (error) {
      console.error("Erreur de mise à jour de l'événement :", error);
    }
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotif = () => {
    setAnchorEl(null);
  };

  const openNotif = Boolean(anchorEl);
  const id = openNotif ? "notification-popover" : undefined;

  const [modalOpenNotification, setModalOpenNotification] = useState(false);

  useEffect(() => {
    const token = Cookies.get("jwtToken"); // récupère ton JWT du cookie

    if (!token) return; // pas connecté

    try {
      // ⚡ On décode uniquement le payload (partie du milieu du JWT)
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64));
      console.log(
        "*********************************** PAYLOAD ********************************************",
        payload
      );

      const userEmail = payload?.sub; // ici sub = email ("marya@amount.com")
      if (userEmail) {
        const key = `hasSeenNotification_${userEmail}`;

        // Vérifier si déjà affiché pour cet utilisateur
        const hasSeen = localStorage.getItem(key);

        if (!hasSeen) {
          setModalOpenNotification(true);
          localStorage.setItem(key, "true"); // marquer comme vu
        }
      }
    } catch (e) {
      console.error("Erreur décodage token :", e);
    }
  }, []);

  return (
    <>
      {/* Modal pour ajouter un événement */}
      {/* Header avec Barre de Recherche */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {/* <MenuItem onClick={handleCopy}>Copier RDV</MenuItem> */}
        <MenuItem onClick={() => handleCut(contextMenu.eventData)}>
          Couper RDV
        </MenuItem>
        <MenuItem onClick={handlePaste} disabled={!copiedEvent}>
          Coller
        </MenuItem>
        <MenuItem onClick={handleCopy}>Déposer clé</MenuItem>
      </Menu>

      <Menu
        open={contextMenuPaste !== null}
        onClose={handleCloseContextMenuPaste}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenuPaste !== null
            ? { top: contextMenuPaste.mouseY, left: contextMenuPaste.mouseX }
            : undefined
        }
      >
        {/* <MenuItem onClick={handleCopy}>Copier RDV</MenuItem> */}

        <MenuItem onClick={handlePaste} disabled={!copiedEvent}>
          Coller
        </MenuItem>
        <MenuItem onClick={handleCopy}>Déposer clé</MenuItem>
      </Menu>

      {selectedEvent && (
        <EventModal
          open={modalOpen}
          onClose={handleModalClose}
          editedEvent={selectedEvent}
          orderId={selectedEvent.id}
          setEditedEvent={handleEditedEventChange}
          categories={categories}
          users={users}
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

      <NotificationsModal
        open={modalOpenNotification}
        onClose={() => setModalOpenNotification(false)}
        orderData={dataEventsNofications}
      />

      {selectedEvent && selectedEvent.collection !== "events" && (
        <DocModal
          open={modalOpen2}
          onClose={handleModalClose2}
          editedEvent={selectedEvent}
          orderId={selectedEvent.id}
          setEditedEvent={handleEditedEventChange}
          collectionName={collectionName}
          setCollectionName={setCollectionName}
          categories={categories}
          onFactureReceive={handleFactureReceived}
          onDelete={handleSearchClickFull}
          onNotificationSuccess={(valeur) => handleOnNotficationSuccess(valeur)}
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

          {/* <Box
            component="img"
            src={jumelles} // Vérifie le bon chemin
            alt="Jumelle"
            sx={{
              height: 70,
              width: "auto",
            }}

          /> */}
          <Tooltip title="Rafraîchir">
            <IconButton
              onClick={() => handleRefrechData()} // Ou déclencher une fonction de refetch
              sx={{
                height: 70,
                width: 70,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RefreshIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </Tooltip>

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

            {/* Sélecteur de vue */}
            <Select
              size="small"
              value={view}
              onChange={(e) => setView(e.target.value)}
              sx={{ ml: 2, backgroundColor: "white", borderRadius: "8px" }}
            >
              <MenuItem value="week">Vue Hebdomadaire</MenuItem>
              <MenuItem value="day">Vue Journalière</MenuItem>
            </Select>
            {/* Icône de notification avec badge */}
            <IconButton
              color="primary"
              onClick={handleNotificationClick}
              sx={{ ml: 2 }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Popover pour notifications */}
            <Popover
              id={id}
              open={openNotif}
              anchorEl={anchorEl}
              onClose={handleCloseNotif}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: { width: 250, p: 1 },
              }}
            >
              <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>
                Notifications
              </Typography>
              <List dense>
                {notifications.map((notif, index) => (
                  <ListItem key={index} divider>
                    <ListItemText primary={notif} />
                  </ListItem>
                ))}
              </List>
            </Popover>
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

        {view == "day" && (
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
                        color: getContrastTextColor(
                          getCategoryColor(category) || "#05AFC1"
                        ),
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
                        <Typography
                          variant="body1"
                          sx={{ marginTop: "1.3rem" }}
                        >
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
                      <Grid item xs={12}>
                        {/* <Typography variant="h6">
                        Détails de l'événement
                      </Typography> */}
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
                          <Table size="small">
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
                                {/* <TableCell
                                style={{ width: "10%", textAlign: "center" }}
                              >
                                Remise %
                              </TableCell> */}
                                <TableCell sx={{ width: "10%", ...cellStyle }}>
                                  Remise
                                </TableCell>
                                <TableCell sx={{ width: "10%", ...cellStyle }}>
                                  Total
                                </TableCell>
                                <TableCell sx={{ width: "10%", ...cellStyle }}>
                                  Action
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {details.map((detail, index) => (
                                <TableRow key={index}>
                                  <TableCell sx={{ ...cellStyle }}>
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
                                  <TableCell sx={{ ...cellStyle }}>
                                    <TextField
                                      name="quantity"
                                      type="text"
                                      value={
                                        detail.quantityInput ??
                                        detail.quantity ??
                                        ""
                                      }
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
                                  <TableCell sx={{ ...cellStyle }}>
                                    <TextField
                                      name="unitPrice"
                                      type="text"
                                      value={
                                        detail.unitPriceInput ??
                                        detail.unitPrice ??
                                        ""
                                      }
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

                                  <TableCell sx={{ ...cellStyle }}>
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

                                  <TableCell sx={{ ...cellStyle }}>
                                    {calculateLineTotal(detail).toFixed(2)}
                                  </TableCell>
                                  <TableCell sx={{ ...cellStyle }}>
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
                                <TableCell colSpan={7} sx={{ ...cellStyle }}>
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
                                <TableCell
                                  colSpan={4}
                                  sx={{ ...cellStyle }}
                                ></TableCell>
                                <TableCell sx={{ ...cellStyle }}>
                                  Total TTC :
                                </TableCell>
                                <TableCell sx={{ ...cellStyle }}>
                                  {totalTTC.toFixed(2)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  sx={{ ...cellStyle }}
                                ></TableCell>
                                <TableCell sx={{ ...cellStyle }}>
                                  Total HT :
                                </TableCell>
                                <TableCell sx={{ ...cellStyle }}>
                                  {totalHT.toFixed(2)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  sx={{ ...cellStyle }}
                                ></TableCell>
                                <TableCell sx={{ ...cellStyle }}>
                                  Acompte :
                                </TableCell>
                                <TableCell sx={{ ...cellStyle }}>
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
                              <Typography variant="body1">
                                Date de fin
                              </Typography>
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
              onContextMenu={(e) => handleContextMenuPaste(e)}
              ref={timelineRef} // ← ajoute ici le `ref`
            >
              {/* Timeline Component */}
              {configExample && <Timeline config={configExample} />}
              {/* Current Time Indicator */}
              <CurrentTimeLine config={configExample} />

              {/* Droppable Event Zones */}

              {loading == true && <>Chargement...</>}
              {loading == false && (
                <Box
                  sx={{ position: "relative", zIndex: 3, marginTop: "2.8rem" }}
                  onContextMenu={(e) => handleContextMenuPaste(e)}
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

                    const backgroundColor = category?.color || "#05AFC1";
                    const textColor = getContrastTextColor(backgroundColor);
                    const timeSlots = generateTimeSlots(configExample); // ← à partager partout

                    return (
                      <>
                        <Box
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
                                gridTemplateColumns: `repeat(${timeSlots.length}, minmax(50px, 1fr))`, // ✅ dynamique ici
                                alignItems: "center",
                                position: "relative",
                                height: "50px", // Hauteur de chaque ligne
                                marginTop: lineIndex > 0 ? "8px" : 0,
                              }}
                            >
                              {line.map((event, eventIndex) => (
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
                                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)", // Ombre légère pour la lisibilité
                                    borderRadius: 2, // Coins arrondis pour le tooltip
                                  }}
                                >
                                  <Box
                                    onMouseDown={(e) => {
                                      if (!timelineRef.current) return; // 🔒 Sécurité anti-null
                                      if (!isDragging) setIsDragging(true); // active le vrai drag
                                      const containerRect =
                                        timelineRef.current.getBoundingClientRect();
                                      const offsetX =
                                        e.clientX -
                                        e.currentTarget.getBoundingClientRect()
                                          .left;
                                      const blockRect =
                                        e.currentTarget.getBoundingClientRect();

                                      const width =
                                        e.currentTarget.getBoundingClientRect()
                                          .width;

                                      const initialLeft =
                                        blockRect.left - containerRect.left;

                                      setDraggingEvent({
                                        ...event,
                                        id: event.id,
                                        offsetX,
                                        width,
                                        initialLeft,
                                      });

                                      const initialX =
                                        e.clientX -
                                        containerRect.left -
                                        offsetX;
                                      // setDragX(initialX);
                                      setDragStartX(e.clientX); // 👈 Juste stocker le point de départ
                                    }}
                                    onClick={() => handleEventClick(event)}
                                    onContextMenu={(e) =>
                                      handleContextMenu(e, event)
                                    }
                                    sx={{
                                      gridColumnStart: calculateTimeValue(
                                        event.startHour,
                                        event.startMinute,
                                        configExample
                                      ),
                                      gridColumnEnd: calculateTimeValue(
                                        event.endHour,
                                        event.endMinute,
                                        configExample
                                      ),

                                      height: "40px",
                                      backgroundColor:
                                        event.Category?.color || "#05AFC1",
                                      border: "1px solid #90caf9",
                                      color: getContrastTextColor(
                                        event.Category?.color || "#05AFC1"
                                      ),
                                      borderRadius: "10px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",

                                      transform:
                                        draggingEvent?.id === event.id &&
                                        isDragging
                                          ? `translateX(${dragX}px)`
                                          : "none",
                                      position: "relative", // reste tout le temps en flux
                                      top: 0,
                                      zIndex:
                                        draggingEvent?.id === event.id &&
                                        isDragging
                                          ? 10
                                          : "auto",
                                      width:
                                        draggingEvent?.id === event.id &&
                                        isDragging
                                          ? `${draggingEvent.width}px`
                                          : "auto",
                                      minWidth: 0,
                                      overflow: "hidden",
                                      transition: isDragging
                                        ? "none"
                                        : "left 0.2s ease",
                                      cursor: draggingEvent
                                        ? "grabbing"
                                        : "pointer",
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
                                            color: getContrastTextColor(
                                              event.Category?.color || "#05AFC1"
                                            ),
                                          }}
                                        >
                                          #{event.id}
                                        </span>
                                        {" • "}
                                        <span
                                          style={{
                                            color: getContrastTextColor(
                                              event.Category?.color || "#05AFC1"
                                            ),
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {event.Client.name}
                                        </span>
                                        {" • "}
                                        <span
                                          style={{
                                            color: getContrastTextColor(
                                              event.Category?.color || "#05AFC1"
                                            ),
                                          }}
                                        >
                                          {event.Vehicle.plateNumber}
                                        </span>
                                        <span
                                          style={{
                                            color: getContrastTextColor(
                                              event.Category?.color || "#05AFC1"
                                            ),
                                          }}
                                        >
                                          {" "}
                                          {event?.isClosed ? "(Fermé)" : ""}
                                        </span>
                                      </Typography>
                                      {event.nextDay && (
                                        <ArrowForwardIcon
                                          fontSize="medium"
                                          sx={{
                                            color: getContrastTextColor(
                                              event.Category?.color || "#05AFC1"
                                            ),
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
                              ))}
                            </Box>
                          ))}
                        </Box>
                      </>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {view == "week" && (
          <>
            <WeeklyPlanning
              ordersData={selectedNewEvents.filter((event) => !event.isClosed)}
              handleEventFromChild={handleEventFromChild}
              garageId={getCurrentUser().garageId}
              dateSelected={selectedDate}
              onDateChange={(newDate) => setSelectedDate(newDate)} // 👈 synchro
            ></WeeklyPlanning>
          </>
        )}
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
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...cellStyle }}>Document</TableCell>
                    <TableCell sx={{ ...cellStyle }}>N°</TableCell>
                    <TableCell sx={{ ...cellStyle }}>Nom</TableCell>
                    <TableCell sx={{ ...cellStyle }}>Prénom</TableCell>

                    <TableCell sx={{ ...cellStyle }}>Téléphone</TableCell>
                    <TableCell sx={{ ...cellStyle }}>Email</TableCell>

                    <TableCell sx={{ ...cellStyle }}>Véhicule</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow
                      key={event.id}
                      hover
                      onClick={() => {
                        setSelectedEvent({ ...event, lastEventId: event.id }); // Met à jour l'événement sélectionné
                        setCollectionName(event.collectionName);
                        if (event.collectionName !== "events") {
                          setModalOpen2(true);
                          setModalOpen(false);
                          console.log("modalOpen2 listing", modalOpen2);
                        } else setModalOpen(true);
                      }}
                      style={{ cursor: "pointer" }} // Indique que la ligne est cliquable
                    >
                      <TableCell sx={{ ...cellStyle }}>
                        <Chip
                          label={event.collectionName}
                          color={getBadgeColor(event.collectionName)}
                          style={{
                            fontWeight: "bold",
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ ...cellStyle }}>{event.id}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>
                        {event.Client.name}
                      </TableCell>
                      <TableCell sx={{ ...cellStyle }}>
                        {event.Client.firstName}
                      </TableCell>

                      <TableCell sx={{ ...cellStyle }}>
                        {event.Client.phone || ""}
                      </TableCell>
                      <TableCell sx={{ ...cellStyle }}>
                        {event.Client.email}
                      </TableCell>

                      <TableCell sx={{ ...cellStyle }}>
                        {event.Vehicle.model || ""} -{" "}
                        {event.Vehicle.plateNumber || ""}
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
      <Dialog
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
      >
        <DialogTitle>Confirmer la modification</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Souhaitez-vous modifier l'événement :
          </Typography>
          <Typography variant="body2">
            De{" "}
            <strong>
              {formatHourMinute(
                draggedEvent?.startHour,
                draggedEvent?.startMinute
              )}
            </strong>{" "}
            à{" "}
            <strong>
              {formatHourMinute(draggedEvent?.endHour, draggedEvent?.endMinute)}
            </strong>
            <br />→ vers{" "}
            <strong>
              {formatHourMinute(
                draggedEvent?.newStart?.hour,
                draggedEvent?.newStart?.minute
              )}
            </strong>{" "}
            à{" "}
            <strong>
              {formatHourMinute(
                draggedEvent?.newEnd?.hour,
                draggedEvent?.newEnd?.minute
              )}
            </strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmModal(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleConfirmUpdate}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Planning;
