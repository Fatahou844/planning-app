// src/App.js
import DeleteIcon from "@mui/icons-material/Delete";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
// Note: Card, CardContent, List, ListItem, ListItemText removed (replaced by custom nav)
import dayjs from "dayjs"; // ou luxon selon ta préférence
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import AddDocumentComponent from "../../Components/AddDocumentComponent";
import DocModal from "../../Components/DocModal";
import DocumentModal from "../../Components/DocumentModal";
import EventModal from "../../Components/EventModal";
import Notification from "../../Components/Notification";
import TableSkeleton from "../../Components/TableSkeleton";

import "../../Styles/style.css";
import { useAxios } from "../../utils/hook/useAxios";
import "./Dashboard.css";
const menuItems = [
  { key: "clients", label: "Clients" },
  { key: "vehicules", label: "Véhicules" },
  { key: "historiques", label: "Historiques" },
];

function ManageClients() {
  const axios = useAxios();
  const [clientsData, setClientsData] = useState([]);
  const [vehiculesData, setVehiculesData] = useState([]);
  const [facturesData, setFacturesData] = useState([]);
  const [devisData, setDevisData] = useState([]);
  const [orData, setOrData] = useState([]);
  const [reservationsData, setReservationsData] = useState([]);
  const [entretiensData, setEntretiensData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const HIST_KEYS = ["factures", "devis", "or", "reservations", "entretiens"];
  const [selected, setSelected] = useState("clients");
  const [tabHist, setTabHist] = useState(0);

  const currentHistKey = HIST_KEYS[tabHist];
  const [histPagination, setHistPagination] = useState({
    factures: { page: 0, rowsPerPage: 10 },
    devis: { page: 0, rowsPerPage: 10 },
    or: { page: 0, rowsPerPage: 10 },
    reservations: { page: 0, rowsPerPage: 10 },
    entretiens: { page: 0, rowsPerPage: 10 },
  });
  const [loading, setLoading] = useState({
    clients: true,
    vehicules: true,
    historiques: true,
    categories: true,
  });
  const [errors, setErrors] = useState({
    phone: "",
    email: "",
  });

  const [isFormInvalid, setIsFormInvalid] = useState(false);
  const [formData, setFormData] = useState({
    plateNumber: "",
    brand: "",
    model: "",
    color: "",
    clientId: "",
    mileage: "",
    vin: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [dataEventsAll, setDataEventsAll] = useState([]);
  const [collectName, setCollectName] = useState("factures");
  const [dataEvents, setDataEvents] = useState([]);
  const [collectionName, setCollectionName] = useState("");
  const [facture, setFacture] = useState(null);
  // Création
  const [openCreateClientDialog, setOpenCreateClientDialog] = useState(false);
  const [openCreateVehiculeDialog, setOpenCreateVehiculeDialog] =
    useState(false);

  // Modification
  const [openEditClientDialog, setOpenEditClientDialog] = useState(false);
  const [openEditVehiculeDialog, setOpenEditVehiculeDialog] = useState(false);

  // Pour stocker l'élément à modifier
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedVehicule, setSelectedVehicule] = useState(null);

  const handleCreateClient = () => {
    const clientData = {
      ...selectedClient,
      garageId: getCurrentUser().garageId, // Assurez-vous que garageId est défini dans le composant
    };
    axios
      .post("/clients", clientData)
      .then((res) => {
        if (res.data) {
          setOpenCreateClientDialog(false);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleNewClientChange = (e) => {
    const { name, value } = e.target;
    // Nouvelle valeur du client mise à jour localement
    const updatedClient = { ...selectedClient, [name]: value };

    setSelectedClient(updatedClient);

    // Reset de l'erreur pour ce champ
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Recalcul de la validité du formulaire
    const hasErrors = Object.values(errors).some((err) => err !== "");
    const isInvalid = !updatedClient.phone || !updatedClient.email || hasErrors;
    setIsFormInvalid(isInvalid);
  };

  const handleNewVehiculeChange = (e) => {
    const { name, value } = e.target;
    setSelectedVehicule((prev) => ({ ...prev, [name]: value }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Fonction de création du véhicule
  const createVehicule = async () => {
    const vehiculeData = {
      ...selectedVehicule,
      clientId: formData.clientId, // Assurez-vous que garageId est défini dans le composant
    };
    try {
      const res = await axios.post("/vehicles", vehiculeData);
      if (res.data) {
        setOpenCreateVehiculeDialog(false);
      }
      console.log("Véhicule créé :", res.data);
    } catch (error) {
      console.error("Erreur lors de la création du véhicule :", error);
      alert("Erreur : impossible de créer le véhicule.");
    }
  };

  // 🔹 Fonction de mise à jour du client
  const handleUpdateClients = async () => {
    try {
      if (!selectedClient?.id) return alert("Aucun client sélectionné.");
      const res = await axios.put(
        `/clients/${selectedClient.id}`,
        selectedClient,
      );

      if (res.data) {
        setOpenEditClientDialog(false);
      }

      console.log("Client mis à jour :", res.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client :", error);
      alert("Erreur : impossible de mettre à jour le client.");
    }
  };

  // 🔹 Fonction de mise à jour du client
  const handleUpdateVehicule = async () => {
    try {
      if (!selectedVehicule?.id) return alert("Aucun client sélectionné.");
      const res = await axios.put(
        `/vehicles/${selectedVehicule.id}`,
        selectedVehicule,
      );
      if (res.data) {
        setOpenEditVehiculeDialog(false);
      }
      console.log("Vehicule mis à jour :", res.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du vehicule :", error);
      alert("Erreur : impossible de mettre à jour le vehicule.");
    }
  };

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const garageId = getCurrentUser().garageId;

        setLoading((p) => ({
          ...p,
          categories: true,
          clients: true,
          vehicules: true,
          historiques: true,
        }));

        const [
          categoriesRes,
          clientsRes,
          vehiclesRes,
          ordresRes,
          devisRes,
          resaRes,
          facturesRes,
        ] = await Promise.all([
          axios.get(`/categories/garage/${garageId}`),
          axios.get(`/clients/search/garage/${garageId}`),
          axios.get(`/vehicles`),
          axios.get(`/documents-garage/order/${garageId}/details`),
          axios.get(`/documents-garage/quote/${garageId}/details`),
          axios.get(`/documents-garage/reservation/${garageId}/details`),
          axios.get(`/documents-garage/invoice/${garageId}/details`),
        ]);

        if (!mounted) return;

        setCategories(categoriesRes?.data?.data ?? []);
        setLoading((p) => ({ ...p, categories: false }));

        setClientsData(clientsRes?.data?.data ?? []);
        setLoading((p) => ({ ...p, clients: false }));

        setVehiculesData(vehiclesRes?.data?.data ?? []);
        setLoading((p) => ({ ...p, vehicules: false }));

        setOrData(ordresRes?.data?.data ?? []);
        setDevisData(devisRes?.data?.data ?? []);
        setReservationsData(resaRes?.data?.data ?? []);
        setFacturesData(facturesRes?.data?.data ?? []);
        setLoading((p) => ({ ...p, historiques: false }));
      } catch (e) {
        console.error(e);
        setLoading({
          clients: false,
          vehicules: false,
          historiques: false,
          categories: false,
        });
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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
        },
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
              t.id === value.id && t.collectionName === value.collectionName,
          ),
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
        }),
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
          page * rowsPerPage + rowsPerPage,
        ),
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
          `/documents-garage/order/${getCurrentUser().garageId}/details`,
        );

        const eventsData = response.data.data;

        // Filtrer les événements si nécessaire
        const filteredEvents = eventsData.filter(
          (event) => event.date === selectedDate && !event.isClosed,
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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalClose = () => {
    setModalOpen(false);
    console.log("FERMETURE");
  };

  const handleEditedEventChange = (updatedEvent) => {
    console.log(
      "########### updatedEvent updatedEvent #################",
      updatedEvent,
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
            `/documents-garage/order/${getCurrentUser().garageId}/details`,
          );

          const eventsData = response.data.data;

          // Filtrer les événements si nécessaire
          const filteredEvents = eventsData.filter(
            (event) => event.date === selectedDate && !event.isClosed,
          );

          setDataEvents(filteredEvents);

          console.log("eventsData", filteredEvents);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des événements :",
            error,
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
          `/documents-garage/order/${getCurrentUser().garageId}/details`,
        );

        const eventsData = response.data.data;

        // Filtrer les événements si nécessaire
        const filteredEvents = eventsData.filter(
          (event) => event.date === selectedDate && !event.isClosed,
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
        message: "Bravo Votre  Facture a été crée ",
        severity: "success", // Peut être "error", "warning", "info"
      });
      setShowPopup(true);
      setModalOpen2(false);
      setModalOpen3(true);
      setFacture(factureData?.data);

      console.log(
        "##############################Facture reçue du child: #################################################",
        factureData.data,
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
            filtResults,
          );

          // Appliquer le filtre "isClosed === false" pour toutes sauf factures
          return collectionKey !== "factures"
            ? filteredResults.filter((item) => item.isClosed === false)
            : filteredResults;
        },
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
              t.id === value.id && t.collectionName === value.collectionName,
          ),
      );

      console.log("Résultats combinés :", uniqueResults);

      // Mettre à jour l'état avec les résultats
      setDataEventsAll(
        uniqueResults.filter((item) =>
          dayjs(item.createdAt).isSame(today, "day"),
        ),
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
  const [documentFilter, setDocumentFilter] = useState("all");
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
    }),
  );

  // 👉 À l'intérieur de ton composant
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
        (event) => !selectedItems.some((sel) => sel.id === event.id),
      );
      setFilteredEvents(remaining);
      setPaginatedEvents(
        remaining.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
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

  // const isSelected = (id) => selectedIds.includes(id);
  const isSelected = (id) => selectedItems.some((x) => x.id === id);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Pagination appliquée
  const [paginatedEvents, setPaginatedEvents] = useState(
    filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
  );

  useEffect(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setPaginatedEvents(filteredEvents.slice(startIndex, endIndex));
  }, [filteredEvents, page, rowsPerPage]);

  const handleFilterDocuments = () => {
    handleSearchClick();
  };

  const handleDocumentCreated = async () => {
    // Ici tu peux par ex :
    // - Mettre à jour ton state `ordersData` ou `events`
    // - Appeler une API
    // - Déclencher un re-render ou recalculer la semaine
  };

  const paginatedHistData = useMemo(() => {
    const { page, rowsPerPage } = histPagination[currentHistKey];
    let source = [];

    switch (currentHistKey) {
      case "factures":
        source = facturesData;
        break;
      case "devis":
        source = devisData;
        break;
      case "or":
        source = orData;
        break;
      case "reservations":
        source = reservationsData;
        break;
      case "entretiens":
        source = entretiensData;
        break;
      default:
        source = [];
    }

    const start = page * rowsPerPage;
    return source.slice(start, start + rowsPerPage);
  }, [
    currentHistKey,
    histPagination,
    facturesData,
    devisData,
    orData,
    reservationsData,
    entretiensData,
  ]);

  /* ── shared table header cell ── */
  const thCell = {
    fontWeight: 700,
    fontSize: 12,
    color: "text.secondary",
    bgcolor: alpha(theme.palette.primary.main, 0.06),
    borderBottom: `2px solid ${theme.palette.divider}`,
    py: 1.25,
  };

  /* ── shared table body cell ── */
  const tdCell = {
    fontSize: 13,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    py: 1,
  };

  /* ── section header (title + action button) ── */
  const SectionHeader = ({ icon, title, count, action }) => (
    <Box display="flex" alignItems="center" mb={2.5}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          mr: 1.5,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
          {title}
        </Typography>
        {count != null && (
          <Typography variant="caption" color="text.secondary">
            {count} enregistrement{count !== 1 ? "s" : ""}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );

  /* ── empty state ── */
  const EmptyState = ({ label }) => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={6}
      color="text.disabled"
    >
      <SearchIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );

  /* ── initials avatar ── */
  const nameToColor = (name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h},50%,45%)`;
  };

  const renderContent = () => {
    switch (selected) {
      // ─────────────────── Clients ───────────────────
      case "clients":
        return (
          <Box>
            <SectionHeader
              icon={<PeopleIcon sx={{ fontSize: 18, color: "primary.main" }} />}
              title="Clients"
              count={clientsData.length}
              action={
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setOpenCreateClientDialog(true)}
                  sx={{ textTransform: "none", borderRadius: 1.5 }}
                >
                  Nouveau client
                </Button>
              }
            />

            <Paper
              variant="outlined"
              sx={{ borderRadius: 2, overflow: "hidden" }}
            >
              {loading.clients ? (
                <TableSkeleton columns={8} rows={6} />
              ) : (
                <TableContainer sx={{ maxHeight: 520 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={thCell}>Client</TableCell>
                        <TableCell sx={thCell}>Téléphone</TableCell>
                        <TableCell sx={thCell}>Email</TableCell>
                        <TableCell sx={thCell}>Adresse</TableCell>
                        <TableCell sx={thCell}>CP</TableCell>
                        <TableCell sx={thCell}>Ville</TableCell>
                        <TableCell sx={{ ...thCell, textAlign: "center" }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedClients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <EmptyState label="Aucun client enregistré" />
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedClients.map((c) => (
                          <TableRow
                            key={c.id}
                            hover
                            sx={{
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                              },
                            }}
                          >
                            <TableCell sx={tdCell}>
                              <Box display="flex" alignItems="center" gap={1.2}>
                                <Avatar
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    fontSize: 12,
                                    bgcolor: nameToColor(c.name),
                                    flexShrink: 0,
                                  }}
                                >
                                  {(c.name?.[0] ?? "").toUpperCase()}
                                  {(c.firstname?.[0] ?? "").toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                                    {c.name} {c.firstname}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    #{c.id}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={tdCell}>{c.phone || "—"}</TableCell>
                            <TableCell sx={tdCell}>{c.email || "—"}</TableCell>
                            <TableCell sx={tdCell}>{c?.adress || "—"}</TableCell>
                            <TableCell sx={tdCell}>{c?.postalCode || "—"}</TableCell>
                            <TableCell sx={tdCell}>{c?.city || "—"}</TableCell>
                            <TableCell sx={{ ...tdCell, textAlign: "center" }}>
                              <Tooltip title="Modifier">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setSelectedClient(c);
                                    setOpenEditClientDialog(true);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={clientsData.length}
                    rowsPerPage={clientsRowsPerPage}
                    page={clientsPage}
                    onPageChange={handleChangeClientsPage}
                    onRowsPerPageChange={handleChangeClientsRowsPerPage}
                    sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
                  />
                </TableContainer>
              )}
            </Paper>
          </Box>
        );

      // ─────────────────── Véhicules ───────────────────
      case "vehicules":
        return (
          <Box>
            <SectionHeader
              icon={<DirectionsCarIcon sx={{ fontSize: 18, color: "primary.main" }} />}
              title="Véhicules"
              count={vehiculesData.length}
              action={
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DirectionsCarIcon />}
                  onClick={() => setOpenCreateVehiculeDialog(true)}
                  sx={{ textTransform: "none", borderRadius: 1.5 }}
                >
                  Nouveau véhicule
                </Button>
              }
            />

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
              {loading.vehicules ? (
                <TableSkeleton columns={5} rows={6} />
              ) : (
                <TableContainer sx={{ maxHeight: 520 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={thCell}>Immatriculation</TableCell>
                        <TableCell sx={thCell}>Modèle</TableCell>
                        <TableCell sx={thCell}>Couleur</TableCell>
                        <TableCell sx={thCell}>Client</TableCell>
                        <TableCell sx={thCell}>Kilométrage</TableCell>
                        <TableCell sx={{ ...thCell, textAlign: "center" }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedVehicules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <EmptyState label="Aucun véhicule enregistré" />
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedVehicules.map((v) => (
                          <TableRow
                            key={v.id}
                            hover
                            sx={{
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                              },
                            }}
                          >
                            <TableCell sx={tdCell}>
                              <Chip
                                label={v.plateNumber || "—"}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: 11 }}
                              />
                            </TableCell>
                            <TableCell sx={tdCell}>{v.model || "—"}</TableCell>
                            <TableCell sx={tdCell}>{v.color || "—"}</TableCell>
                            <TableCell sx={tdCell}>
                              <Typography variant="body2" fontSize={12}>
                                {v.Client?.name || "—"}
                              </Typography>
                            </TableCell>
                            <TableCell sx={tdCell}>
                              {v.mileage ? `${v.mileage} km` : "—"}
                            </TableCell>
                            <TableCell sx={{ ...tdCell, textAlign: "center" }}>
                              <Tooltip title="Modifier">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setSelectedVehicule(v);
                                    setOpenEditVehiculeDialog(true);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={vehiculesData.length}
                    rowsPerPage={vehiculesRowsPerPage}
                    page={vehiculesPage}
                    onPageChange={handleChangeVehiculesPage}
                    onRowsPerPageChange={handleChangeVehiculesRowsPerPage}
                    sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
                  />
                </TableContainer>
              )}
            </Paper>
          </Box>
        );

      // ─────────────────── Historiques ───────────────────
      case "historiques":
        return (
          <Box>
            <SectionHeader
              icon={<HistoryIcon sx={{ fontSize: 18, color: "primary.main" }} />}
              title="Historiques"
            />

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}>
              <Tabs
                value={tabHist}
                onChange={(e, v) => setTabHist(v)}
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 1,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: "background.default",
                  minHeight: 44,
                  "& .MuiTab-root": { minHeight: 44, fontSize: 13, textTransform: "none", fontWeight: 500 },
                }}
              >
                <Tab label="Factures" />
                <Tab label="Devis" />
                <Tab label="Ordres de Réparation" />
                <Tab label="Réservations" />
                <Tab label="Entretiens" />
              </Tabs>

              {tabHist === 0 && renderTable(paginatedHistData, "Facture", facturesData.length)}
              {tabHist === 1 && renderTable(paginatedHistData, "Devis", devisData.length)}
              {tabHist === 2 && renderTable(paginatedHistData, "OR", orData.length)}
              {tabHist === 3 && renderTable(paginatedHistData, "Réservation", reservationsData.length)}
              {tabHist === 4 && renderTable(paginatedHistData, "Entretien", entretiensData.length)}
            </Paper>
          </Box>
        );

      default:
        return (
          <EmptyState label="Choisissez une section dans le menu" />
        );
    }
  };

  // ─── helper Historique ───────────────────────────────────────────────────
  const renderTable = (data, type, totalCount) => {
    const { page, rowsPerPage } = histPagination[currentHistKey];

    return (
      <>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thCell}>N° {type}</TableCell>
                <TableCell sx={thCell}>Client</TableCell>
                <TableCell sx={thCell}>Véhicule</TableCell>
                <TableCell sx={thCell}>Date</TableCell>
                <TableCell sx={{ ...thCell, textAlign: "center" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState label={`Aucun(e) ${type} trouvé(e)`} />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((d) => (
                  <TableRow
                    key={d.id}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <TableCell sx={tdCell}>
                      <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                        #{d.id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={tdCell}>
                      {d?.Client?.name || "—"} {d?.Client?.firstName || ""}
                    </TableCell>
                    <TableCell sx={tdCell}>
                      {d?.Vehicle?.plateNumber ? (
                        <Chip
                          label={d.Vehicle.plateNumber}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: "monospace", fontSize: 11 }}
                        />
                      ) : "—"}
                    </TableCell>
                    <TableCell sx={tdCell}>
                      {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell sx={{ ...tdCell, textAlign: "center" }}>
                      <Tooltip title="Consulter">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(event) => HandleViewDocument(event, d)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangeHistPage}
          onRowsPerPageChange={handleChangeHistRowsPerPage}
          sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
        />
      </>
    );
  };

  // Renommé selon ta demande
  const HandleViewDocument = (event, data) => {
    setAnchorEl(event.currentTarget);
    setSelectedData(data); // données spécifiques à cette ligne
  };

  const handleCloseViewDocument = () => {
    setAnchorEl(null);
    setSelectedData(null);
  };

  const openView = Boolean(anchorEl);
  const id = openView ? "preview-popover" : undefined;

  // -------------------------
  // PAGINATION: Clients
  // -------------------------
  const [clientsPage, setClientsPage] = useState(0);
  const [clientsRowsPerPage, setClientsRowsPerPage] = useState(25);

  const handleChangeClientsPage = (event, newPage) => {
    setClientsPage(newPage);
  };

  const handleChangeClientsRowsPerPage = (event) => {
    setClientsRowsPerPage(parseInt(event.target.value, 10));
    setClientsPage(0);
  };

  const paginatedClients = useMemo(() => {
    const start = clientsPage * clientsRowsPerPage;
    return clientsData.slice(start, start + clientsRowsPerPage);
  }, [clientsData, clientsPage, clientsRowsPerPage]);

  // -------------------------
  // PAGINATION: Véhicules
  // -------------------------
  const [vehiculesPage, setVehiculesPage] = useState(0);
  const [vehiculesRowsPerPage, setVehiculesRowsPerPage] = useState(25);

  const handleChangeVehiculesPage = (event, newPage) => {
    setVehiculesPage(newPage);
  };

  const handleChangeVehiculesRowsPerPage = (event) => {
    setVehiculesRowsPerPage(parseInt(event.target.value, 10));
    setVehiculesPage(0);
  };

  const paginatedVehicules = useMemo(() => {
    const start = vehiculesPage * vehiculesRowsPerPage;
    return vehiculesData.slice(start, start + vehiculesRowsPerPage);
  }, [vehiculesData, vehiculesPage, vehiculesRowsPerPage]);

  // -------------------------
  // PAGINATION: Historiques (par onglet)
  // Onglets: 0 Factures, 1 Devis, 2 OR, 3 Réservations, 4 Entretiens
  // -------------------------

  const handleChangeHistPage = (event, newPage) => {
    setHistPagination((prev) => ({
      ...prev,
      [currentHistKey]: {
        ...prev[currentHistKey],
        page: newPage,
      },
    }));
  };

  const handleChangeHistRowsPerPage = (event) => {
    setHistPagination((prev) => ({
      ...prev,
      [currentHistKey]: {
        page: 0,
        rowsPerPage: parseInt(event.target.value, 10),
      },
    }));
  };

  /* ── dialog form helper ── */
  const FormDialog = ({ open, onClose, title, children, onSave, saveLabel = "Enregistrer" }) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "background.default",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1.5,
          px: 2.5,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1, px: 2.5 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          {children}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions
        sx={{
          bgcolor: "background.default",
          borderTop: "1px solid",
          borderColor: "divider",
          px: 2.5,
          py: 1.5,
          gap: 1,
        }}
      >
        <Button variant="outlined" size="small" onClick={onClose} sx={{ textTransform: "none" }}>
          Annuler
        </Button>
        <Button variant="contained" size="small" onClick={onSave} sx={{ textTransform: "none" }}>
          {saveLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const navItems = [
    { key: "clients", label: "Clients", icon: <PeopleIcon fontSize="small" /> },
    { key: "vehicules", label: "Véhicules", icon: <DirectionsCarIcon fontSize="small" /> },
    { key: "historiques", label: "Historiques", icon: <HistoryIcon fontSize="small" /> },
  ];

  return (
    <>
      {/* ── Modals ── */}
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
          collectionName="factures"
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

      {/* ── Page layout ── */}
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", px: { xs: 2, md: 4 }, pt: 3, pb: 6 }}>

        {/* Page header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
              Gestion clients
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clients, véhicules et historiques de documents
            </Typography>
          </Box>

          {/* Search bar */}
          <Box display="flex" gap={1} alignItems="center" sx={{ width: { xs: "100%", md: 440 } }}>
            <TextField
              variant="outlined"
              placeholder="Rechercher un client, document…"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => { handleSearchClick(); setOpenPage(false); }}
              sx={{ textTransform: "none", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Rechercher
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* ── Left nav ── */}
          <Grid item xs={12} md={2}>
            <Paper
              variant="outlined"
              sx={{ borderRadius: 2, overflow: "hidden", position: "sticky", top: 16 }}
            >
              {navItems.map((item, i) => (
                <Box key={item.key}>
                  <Box
                    onClick={() => setSelected(item.key)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      px: 2,
                      py: 1.4,
                      cursor: "pointer",
                      bgcolor:
                        selected === item.key
                          ? alpha(theme.palette.primary.main, 0.1)
                          : "transparent",
                      borderLeft:
                        selected === item.key
                          ? `3px solid ${theme.palette.primary.main}`
                          : "3px solid transparent",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                      },
                    }}
                  >
                    <Box sx={{ color: selected === item.key ? "primary.main" : "text.secondary" }}>
                      {item.icon}
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={selected === item.key ? 700 : 400}
                      color={selected === item.key ? "primary.main" : "text.primary"}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                  {i < navItems.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* ── Content ── */}
          <Grid item xs={12} md={10}>
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
              {renderContent()}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* ── Search results dialog ── */}
      <Dialog
        open={open && !openPage}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "background.default",
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 1.5,
            px: 2.5,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <SearchIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="subtitle1" fontWeight={700} flex={1}>
              Résultats de la recherche
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredEvents.length} résultat{filteredEvents.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5, px: 2.5 }}>
          {/* Filters row */}
          <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
            <TextField
              size="small"
              placeholder="Nom, Prénom, Email, Véhicule…"
              value={searchQueryInterior}
              onChange={(e) => setSearchQueryInterior(e.target.value)}
              sx={{ flex: 2, minWidth: 180 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ flex: 1, minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select value={documentFilter} onChange={(e) => setDocumentFilter(e.target.value)} label="Type">
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="events">O.R</MenuItem>
                <MenuItem value="reservations">Réservations</MenuItem>
                <MenuItem value="devis">Devis</MenuItem>
                <MenuItem value="factures">Factures</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Date min"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dateMin || ""}
              onChange={(e) => setDateMin(e.target.value)}
              sx={{ flex: 1, minWidth: 140 }}
            />
            <TextField
              size="small"
              label="Date max"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dateMax || ""}
              onChange={(e) => setDateMax(e.target.value)}
              sx={{ flex: 1, minWidth: 140 }}
            />
          </Box>

          {selectedItems.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteSelected}
              sx={{ mb: 2, textTransform: "none" }}
            >
              Supprimer la sélection ({selectedItems.length})
            </Button>
          )}

          {dataEventsAll.length === 0 ? (
            <Box py={5} textAlign="center" color="text.disabled">
              <SearchIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">Aucun document trouvé.</Typography>
            </Box>
          ) : (
            <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: "hidden" }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={thCell}>
                        <Checkbox
                          size="small"
                          checked={selectedItems.length > 0 && selectedItems.length === filteredEvents.length}
                          indeterminate={selectedItems.length > 0 && selectedItems.length < filteredEvents.length}
                          onChange={handleSelectAllClick}
                        />
                      </TableCell>
                      <TableCell sx={thCell}>Type</TableCell>
                      <TableCell sx={thCell}>N°</TableCell>
                      <TableCell sx={thCell}>Date</TableCell>
                      <TableCell sx={thCell}>Client</TableCell>
                      <TableCell sx={thCell}>Téléphone</TableCell>
                      <TableCell sx={thCell}>Email</TableCell>
                      <TableCell sx={thCell}>Véhicule</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedEvents.map((event) => (
                      <TableRow
                        key={event.id}
                        hover
                        selected={isSelected(event.id)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                          "&.Mui-selected": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                        }}
                        onClick={() => {
                          setSelectedEvent({ ...event, lastEventId: event.id });
                          setCollectionName(event.collectionName);
                          if (event.collectionName !== "events") {
                            setModalOpen2(true);
                            setModalOpen(false);
                          } else {
                            setModalOpen(true);
                          }
                        }}
                      >
                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()} sx={tdCell}>
                          <Checkbox
                            size="small"
                            checked={selectedItems.some((item) => item.id === event.id)}
                            onChange={() => handleSelectClick(event.id, event.collectionName)}
                          />
                        </TableCell>
                        <TableCell sx={tdCell}>
                          <Chip
                            label={event.collectionName}
                            color={getBadgeColor(event.collectionName)}
                            size="small"
                            sx={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}
                          />
                        </TableCell>
                        <TableCell sx={{ ...tdCell, fontFamily: "monospace", fontWeight: 600 }}>
                          #{event.id}
                        </TableCell>
                        <TableCell sx={tdCell}>
                          {moment(event.createdAt).format("DD/MM/YYYY")}
                        </TableCell>
                        <TableCell sx={tdCell}>
                          {event.Client.name} {event.Client.firstName}
                        </TableCell>
                        <TableCell sx={tdCell}>{event.Client.phone || "—"}</TableCell>
                        <TableCell sx={tdCell}>{event.Client.email}</TableCell>
                        <TableCell sx={tdCell}>
                          {event.Vehicle?.model || ""}{event.Vehicle?.plateNumber ? ` · ${event.Vehicle.plateNumber}` : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredEvents.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
              />
            </Paper>
          )}
        </DialogContent>

        <Divider />
        <DialogActions
          sx={{
            bgcolor: "background.default",
            borderTop: "1px solid",
            borderColor: "divider",
            px: 2.5,
            py: 1.25,
            gap: 1,
          }}
        >
          <Button size="small" variant="outlined" onClick={handleFilterDocuments} sx={{ textTransform: "none" }}>
            Appliquer filtres
          </Button>
          <Box flex={1} />
          <Button size="small" variant="contained" onClick={handleClose} sx={{ textTransform: "none" }}>
            Fermer
          </Button>
        </DialogActions>

        {showPopup && (
          <Notification
            message={notification.message}
            handleClose={handleClosePopup}
            collectionName={collectName}
            dataEvent={selectedEvent}
            dataDetails={selectedEvent?.Details ?? []}
          />
        )}
      </Dialog>

      {/* ── Create client ── */}
      <FormDialog
        open={openCreateClientDialog}
        onClose={() => setOpenCreateClientDialog(false)}
        title="Nouveau client"
        onSave={handleCreateClient}
      >
        <TextField name="name" onChange={handleNewClientChange} label="Nom" size="small" fullWidth />
        <TextField name="firstName" onChange={handleNewClientChange} label="Prénom" size="small" fullWidth />
        <TextField name="phone" onChange={handleNewClientChange} label="Téléphone" size="small" fullWidth />
        <TextField name="email" onChange={handleNewClientChange} label="Email" size="small" fullWidth />
        <TextField name="address" onChange={handleNewClientChange} label="Adresse" size="small" fullWidth />
        <Box display="flex" gap={1.5}>
          <TextField name="postalCode" onChange={handleNewClientChange} label="Code postal" size="small" sx={{ flex: 1 }} />
          <TextField name="city" onChange={handleNewClientChange} label="Ville" size="small" sx={{ flex: 2 }} />
        </Box>
      </FormDialog>

      {/* ── Edit client ── */}
      <FormDialog
        open={openEditClientDialog}
        onClose={() => setOpenEditClientDialog(false)}
        title="Modifier le client"
        onSave={handleUpdateClients}
      >
        <TextField name="name" onChange={handleNewClientChange} label="Nom" size="small" fullWidth value={selectedClient?.name || ""} />
        <TextField name="firstName" onChange={handleNewClientChange} label="Prénom" size="small" fullWidth value={selectedClient?.firstName || ""} />
        <TextField name="phone" onChange={handleNewClientChange} label="Téléphone" size="small" fullWidth value={selectedClient?.phone || ""} />
        <TextField name="email" onChange={handleNewClientChange} label="Email" size="small" fullWidth value={selectedClient?.email || ""} />
        <TextField name="address" onChange={handleNewClientChange} label="Adresse" size="small" fullWidth value={selectedClient?.address || ""} />
        <Box display="flex" gap={1.5}>
          <TextField name="postalCode" onChange={handleNewClientChange} label="Code postal" size="small" sx={{ flex: 1 }} value={selectedClient?.postalCode || ""} />
          <TextField name="city" onChange={handleNewClientChange} label="Ville" size="small" sx={{ flex: 2 }} value={selectedClient?.city || ""} />
        </Box>
      </FormDialog>

      {/* ── Create véhicule ── */}
      <FormDialog
        open={openCreateVehiculeDialog}
        onClose={() => setOpenCreateVehiculeDialog(false)}
        title="Nouveau véhicule"
        onSave={createVehicule}
      >
        <TextField name="plateNumber" onChange={handleNewVehiculeChange} label="Immatriculation" size="small" fullWidth />
        <Box display="flex" gap={1.5}>
          <TextField name="model" onChange={handleNewVehiculeChange} label="Modèle" size="small" sx={{ flex: 2 }} />
          <TextField name="color" onChange={handleNewVehiculeChange} label="Couleur" size="small" sx={{ flex: 1 }} />
        </Box>
        <FormControl fullWidth size="small">
          <InputLabel>Client</InputLabel>
          <Select name="clientId" value={formData.clientId} onChange={handleNewVehiculeChange} label="Client">
            {clientsData.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name} {c.firstname}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box display="flex" gap={1.5}>
          <TextField name="mileage" onChange={handleNewVehiculeChange} label="Kilométrage" size="small" sx={{ flex: 1 }} />
          <TextField name="vin" onChange={handleNewVehiculeChange} label="VIN" size="small" sx={{ flex: 2 }} />
        </Box>
      </FormDialog>

      {/* ── Edit véhicule ── */}
      <FormDialog
        open={openEditVehiculeDialog}
        onClose={() => setOpenEditVehiculeDialog(false)}
        title="Modifier le véhicule"
        onSave={handleUpdateVehicule}
      >
        <TextField name="plateNumber" onChange={handleNewVehiculeChange} label="Immatriculation" size="small" fullWidth value={selectedVehicule?.plateNumber || ""} />
        <Box display="flex" gap={1.5}>
          <TextField name="model" onChange={handleNewVehiculeChange} label="Modèle" size="small" sx={{ flex: 2 }} value={selectedVehicule?.model || ""} />
          <TextField name="color" onChange={handleNewVehiculeChange} label="Couleur" size="small" sx={{ flex: 1 }} value={selectedVehicule?.color || ""} />
        </Box>
        <TextField label="Client" size="small" fullWidth disabled value={selectedVehicule?.Client?.name || ""} />
        <Box display="flex" gap={1.5}>
          <TextField name="mileage" onChange={handleNewVehiculeChange} label="Kilométrage" size="small" sx={{ flex: 1 }} value={selectedVehicule?.mileage || ""} />
          <TextField name="vin" onChange={handleNewVehiculeChange} label="VIN" size="small" sx={{ flex: 2 }} value={selectedVehicule?.vin || ""} />
        </Box>
      </FormDialog>

      <AddDocumentComponent onDocumentCreated={handleDocumentCreated} />
    </>
  );
}

export default ManageClients;
