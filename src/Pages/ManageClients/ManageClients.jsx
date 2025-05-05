// src/App.js
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import dayjs from "dayjs"; // ou luxon selon ta préférence
import React, { useState } from "react";
import Notification from "../../Components/Notification";
import "../../Styles/style.css";
import { useAxios } from "../../utils/hook/useAxios";

import "./Dashboard.css";
function ManageClients() {
  const axios = useAxios();
  const [searchQuery, setSearchQuery] = useState("");
  const [dataEventsAll, setDataEventsAll] = useState([]);
  const [collectName, setCollectName] = useState("factures");
  const [dataEvents, setDataEvents] = useState([]);
  const [collectionName, setCollectionName] = useState("");

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
  const [selectedDate, setSelectedDate] = useState("");

  const [modalOpen2, setModalOpen2] = useState(false);
  const [modalOpen3, setModalOpen3] = useState(false);
  const [open, setOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleShowPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    console.log("fermeture du popup");
  };

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
          const url = `/documents-garage/${apiEndpoint}/1/details`;

          // Effectuer la requête GET
          const response = await axios.get(url);

          if (!response || !response.data) {
            console.log(`Aucune donnée trouvée pour ${collectionKey}`);
            return [];
          }

          // Ajouter le nom de la collection à chaque objet dans la réponse
          //   const filtResults = response.data.data.map((item) => ({
          //     ...item,
          //     collectionName: collectionKey, // Ajouter le nom de la collection
          //   }));

          let filtResults = response.data.data.map((item) => ({
            ...item,
            collectionName: collectionKey,
          }));

          if (collectionKey === "reservations") {
            const today = dayjs();
            filtResults = filtResults.filter((item) =>
              dayjs(item.createdAt).isSame(today, "day")
            );
          }

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
      setDataEventsAll(uniqueResults);
      setOpen(true); // Ouvre le dialogue après la recherche
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
  const handleClose = () => {
    // setLoading(true);
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`/documents-garage/order/1/details`);

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
  const [details, setDetails] = useState([
    {
      label: "",
      quantity: "",
      unitPrice: "",
      discountPercent: "",
      discountAmount: "",
    },
  ]);
  return (
    <div className="app-container">
      <div className="main-content">
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
      </div>
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
                  {dataEventsAll.map((event) => (
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
      </Dialog>
    </div>
  );
}

export default ManageClients;
