// src/App.js
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs"; // ou luxon selon ta préférence
import moment from "moment";
import { useEffect, useState } from "react";
import AddDocumentComponent from "../../Components/AddDocumentComponent";
import DocModal from "../../Components/DocModal";
import DocumentModal from "../../Components/DocumentModal";
import EventModal from "../../Components/EventModal";
import Notification from "../../Components/Notification";
import "../../Styles/style.css";
import { useAxios } from "../../utils/hook/useAxios";
import "./Dashboard.css";
function SearchBar() {
  const axios = useAxios();
  const [searchQuery, setSearchQuery] = useState("");
  const [dataEventsAll, setDataEventsAll] = useState([]);
  const [collectName, setCollectName] = useState("factures");
  const [dataEvents, setDataEvents] = useState([]);
  const [collectionName, setCollectionName] = useState("");
  const [facture, setFacture] = useState(null);
  const today = dayjs();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cellStyle = {
    textAlign: "center",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
  };

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
  const [openPage, setOpenPage] = useState(true);

  const [showPopup, setShowPopup] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editedStatus, setEditedStatus] = useState({}); // { [id]: "nouveauStatus" }
  const [saving, setSaving] = useState(null); // id en cours de sauvegarde

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

  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  async function handleSearchClick() {
    const keyword = searchQuery.trim().toLowerCase();
    const searchInterior = searchQueryInterior.trim().toLowerCase();
    setOpen(true); // Ouvre le dialogue après la recherche

    // Vérification préalable : si pas de mot-clé ET pas les deux dates -> on stoppe la fonction
    if (!keyword && !searchInterior && (!dateMin || !dateMax)) {
      console.log("Recherche ignorée : aucun mot-clé ou période définie.");
      return;
    }

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

          let filtResults = response.data.data.map((item) => ({
            ...item,
            collectionName: collectionKey,
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
      setDataEventsAll(uniqueResults);
      setFilteredEvents(
        uniqueResults.filter((event) => {
          const matchesDocument =
            documentFilter === "all" || event.collectionName === documentFilter;

          const searchLower = searchQueryInterior.toLowerCase();

          const matchesSearch =
            event.Client.name?.toLowerCase().includes(searchLower) ||
            event.Client.firstName?.toLowerCase().includes(searchLower) ||
            event.Client.email?.toLowerCase().includes(searchLower) ||
            event.Vehicle?.model?.toLowerCase().includes(searchLower) ||
            event.Vehicle?.plateNumber?.toLowerCase().includes(searchLower);

          const eventDate = new Date(event.createdAt);

          const matchesDate =
            (!dateMin || eventDate >= new Date(dateMin)) &&
            (!dateMax || eventDate <= new Date(dateMax));

          return matchesDocument && matchesSearch && matchesDate;
        })
      );

      const paginatedData = uniqueResults.filter((event) => {
        const matchesDocument =
          documentFilter === "all" || event.collectionName === documentFilter;

        const searchLower = searchQueryInterior.toLowerCase();

        const matchesSearch =
          event.Client.name?.toLowerCase().includes(searchLower) ||
          event.Client.firstName?.toLowerCase().includes(searchLower) ||
          event.Client.email?.toLowerCase().includes(searchLower) ||
          event.Vehicle?.model?.toLowerCase().includes(searchLower) ||
          event.Vehicle?.plateNumber?.toLowerCase().includes(searchLower);

        const eventDate = new Date(event.createdAt);

        const matchesDate =
          (!dateMin || eventDate >= new Date(dateMin)) &&
          (!dateMax || eventDate <= new Date(dateMax));

        return matchesDocument && matchesSearch && matchesDate;
      });

      setPaginatedEvents(
        paginatedData.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        )
      );
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
    setFilteredEvents([]);
    setSearchQueryInterior("");
    setSearchQuery("");
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const handleModalClose3 = () => {
    setModalOpen3(false);
    console.log("modalOpen2", modalOpen2);
  };
  const handleModalClose2 = () => {
    setModalOpen2(false);
    console.log("modalOpen2", modalOpen2);
  };

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

    handleSearchClickFull();
  };

  useEffect(() => {
    handleSearchClickFull();
  }, [facture]);

  const [searchQueryInterior, setSearchQueryInterior] = useState("");
  const [documentFilter, setDocumentFilter] = useState("events");
  const [dateMin, setDateMin] = useState(null); // ou new Date()
  const [dateMax, setDateMax] = useState(null);

  const [filteredEvents, setFilteredEvents] = useState(
    dataEventsAll.filter((event) => {
      const matchesDocument =
        documentFilter === "all" || event.collectionName === documentFilter;

      const searchLower = searchQueryInterior.toLowerCase();

      const matchesSearch =
        event.Client.name?.toLowerCase().includes(searchLower) ||
        event.Client.firstName?.toLowerCase().includes(searchLower) ||
        event.Client.email?.toLowerCase().includes(searchLower) ||
        event.Vehicle?.model?.toLowerCase().includes(searchLower) ||
        event.Vehicle?.plateNumber?.toLowerCase().includes(searchLower);

      const eventDate = new Date(event.createdAt); // ou event.createdAt

      const matchesDate =
        (!dateMin || eventDate >= new Date(dateMin)) &&
        (!dateMax || eventDate <= new Date(dateMax));

      return matchesDocument && matchesSearch && matchesDate;
    })
  );

  // useEffect(() => {
  //   handleSearchClick();
  // }, [documentFilter]);

  // 👉 À l'intérieur de ton composant
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedIds, setSelectedIds] = useState([]);

  const [selectedItems, setSelectedItems] = useState([]); // [{ id, collectionName }]

  // const handleSelectAllClick = (event) => {
  //   if (event.target.checked) {
  //     const newSelectedIds = filteredEvents.map((e) => e.id);
  //     setSelectedIds(newSelectedIds);
  //   } else {
  //     setSelectedIds([]);
  //     setSelectedCollectNames([]);
  //   }
  // };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredEvents.map((e) => ({
        id: e.id,
        collectionName: e.collectionName, // ⚠️ Assure-toi que chaque event l’a
      }));
      setSelectedItems(newSelected);
    } else {
      setSelectedItems([]);
    }
  };

  // const handleSelectClick = (id) => {
  //   setSelectedIds((prev) =>
  //     prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
  //   );
  // };

  const handleSelectClick = (id, collectionName) => {
    setSelectedItems((prev) => {
      const exists = prev.find((item) => item.id === id);
      if (exists) {
        return prev.filter((item) => item.id !== id);
      } else {
        return [...prev, { id, collectionName }];
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      console.warn("Aucun élément sélectionné pour suppression.");
      return;
    }

    try {
      for (const { id, collectionName } of selectedItems) {
        let url = "";
        switch (collectionName) {
          case "events":
            url = `/orders/${id}`;
            break;
          case "factures":
            url = `/invoices/${id}`;
            break;
          case "devis":
            url = `/quotes/${id}`;
            break;
          case "reservations":
            url = `/reservations/${id}`;
            break;
          default:
            console.error("Collection non supportée :", collectionName);
            continue;
        }

        await axios.deleteData(url, {
          data: { eventId: id },
        });

        console.log(`✅ ${collectionName} avec l'ID ${id} supprimé.`);
      }

      const remaining = filteredEvents.filter(
        (event) => !selectedItems.some((sel) => sel.id === event.id)
      );
      setFilteredEvents(remaining);
      setPaginatedEvents(
        remaining.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      );
      setDataEventsAll(remaining);
      setSelectedItems([]);

      setNotification({
        open: true,
        message: `${selectedItems.length} élément(s) supprimé(s) avec succès`,
        severity: "success",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setNotification({
        open: true,
        message: "Erreur lors de la suppression.",
        severity: "error",
      });
    }
  };

  const isSelected = (id) => selectedIds.includes(id);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Pagination appliquée
  const [paginatedEvents, setPaginatedEvents] = useState(
    filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  );

  useEffect(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setPaginatedEvents(filteredEvents.slice(startIndex, endIndex));
  }, [filteredEvents, page, rowsPerPage]);

  // useEffect(() => {
  //   handleSearchClick();
  // }, [searchQueryInterior]);

  const handleFilterDocuments = () => {
    handleSearchClick();
  };

  const handleDocumentCreated = async () => {
    // Ici tu peux par ex :
    // - Mettre à jour ton state `ordersData` ou `events`
    // - Appeler une API
    // - Déclencher un re-render ou recalculer la semaine
  };

  return (
    <div className="" style={{ width: "100%" }}>
      <div className="" style={{ width: "100%" }}>
        {/* 🔍 Barre de recherche centrée */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "flex-start", // ⬅️ aligne les enfants en haut
            justifyContent: "center", // ⬅️ centre horizontalement

            mt: 5, // marge top pour respirer
          }}
        >
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
          <TextField
            variant="outlined"
            placeholder="Rechercher"
            size="small"
            sx={{
              backgroundColor: "white",
              borderRadius: "16x",
              width: "100%", // Ajustable selon besoin
            }}
            onChange={handleSearchChange}
            value={searchQuery}
            onKeyDown={handleKeyDown}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              handleSearchClick();
              setOpenPage(false);
            }}
            sx={{ ml: 2 }}
          >
            Rechercher
          </Button>
        </Box>
      </div>
      <Dialog
        open={open && !openPage}
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
            <FormControl
              variant="outlined"
              size="small"
              style={{ marginRight: "0.2rem", flexGrow: 1 }}
            >
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
            <TextField
              label="Date min"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={dateMin || ""}
              onChange={(e) => setDateMin(e.target.value)}
              style={{ marginRight: "0.2rem", flexGrow: 1 }}
            />

            <TextField
              label="Date max"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={dateMax || ""}
              onChange={(e) => setDateMax(e.target.value)}
              style={{ marginRight: "0.2rem", flexGrow: 1 }}
            />
          </Box>
          {selectedItems.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteSelected}
              sx={{ mb: 2 }}
            >
              Supprimer la sélection ({selectedItems.length})
            </Button>
          )}

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
                    <TableCell padding="checkbox" sx={{ ...cellStyle }}>
                      <Checkbox
                        checked={
                          selectedItems.length > 0 &&
                          selectedItems.length === filteredEvents.length
                        }
                        indeterminate={
                          selectedItems.length > 0 &&
                          selectedItems.length < filteredEvents.length
                        }
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellStyle }}>Document</TableCell>
                    <TableCell sx={{ ...cellStyle }}>N°</TableCell>
                    <TableCell sx={{ ...cellStyle }}>Date</TableCell>
                    <TableCell sx={{ ...cellStyle }}>Nom</TableCell>
                    <TableCell sx={{ ...cellStyle }}>Prénom</TableCell>
                    <TableCell sx={{ ...cellStyle }}>Téléphone</TableCell>
                    <TableCell sx={{ ...cellStyle }}>Email</TableCell>
                    <TableCell sx={{ ...cellStyle }}>Véhicule</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedEvents.map((event) => {
                    const selected = isSelected(event.id);

                    return (
                      <TableRow
                        key={event.id}
                        hover
                        selected={selected}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedEvent({ ...event, lastEventId: event.id }); // Met à jour l'événement sélectionné
                          setCollectionName(event.collectionName);
                          if (event.collectionName !== "events") {
                            setModalOpen2(true);
                            setModalOpen(false);
                          } else {
                            setModalOpen(true);
                          }
                        }}
                      >
                        <TableCell
                          padding="checkbox"
                          onClick={(e) => e.stopPropagation()}
                          sx={{ ...cellStyle }}
                        >
                          <Checkbox
                            checked={selectedItems.some(
                              (item) => item.id === event.id
                            )}
                            onChange={() =>
                              handleSelectClick(event.id, event.collectionName)
                            }
                          />
                        </TableCell>
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
                          {moment(event.createdAt).format("DD/MM/YYYY")}
                        </TableCell>
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
                    );
                  })}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredEvents.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFilterDocuments} color="primary">
            Appliquer
          </Button>
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
      <AddDocumentComponent
        onDocumentCreated={handleDocumentCreated}
      ></AddDocumentComponent>
    </div>
  );
}

export default SearchBar;
