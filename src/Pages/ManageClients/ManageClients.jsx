// src/App.js
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
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
  Typography,
  useTheme,
} from "@mui/material";
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

  const renderContent = () => {
    switch (selected) {
      // ------------------ Clients ------------------
      case "clients":
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Gestion des clients
            </Typography>
            <Button
              variant="contained"
              onClick={() => setOpenCreateClientDialog(true)}
              sx={{ mb: 2 }}
            >
              Créer un client
            </Button>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2, mb: 3 }}>
              {loading.clients ? (
                <TableSkeleton columns={9} rows={5} />
              ) : (
                <TableContainer sx={{ maxHeight: 500, overflowY: "auto" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...cellStyle }}>ID</TableCell>
                        <TableCell sx={{ ...cellStyle }}>Nom</TableCell>
                        <TableCell sx={{ ...cellStyle }}>Prénom</TableCell>
                        <TableCell sx={{ ...cellStyle }}>Téléphone</TableCell>
                        <TableCell sx={{ ...cellStyle }}>Email</TableCell>
                        <TableCell sx={{ ...cellStyle }}>Adresse</TableCell>
                        <TableCell sx={{ ...cellStyle }}>Code postal</TableCell>
                        <TableCell sx={{ ...cellStyle }}>Ville</TableCell>
                        <TableCell sx={{ ...cellStyle }}>
                          Nb véhicules
                        </TableCell>
                        <TableCell sx={{ ...cellStyle }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedClients.map((c) => (
                        <TableRow key={c.id} hover>
                          <TableCell sx={{ ...cellStyle }}>{c.id}</TableCell>
                          <TableCell sx={{ ...cellStyle }}>{c.name}</TableCell>
                          <TableCell sx={{ ...cellStyle }}>
                            {c.firstname}
                          </TableCell>
                          <TableCell sx={{ ...cellStyle }}>{c.phone}</TableCell>
                          <TableCell sx={{ ...cellStyle }}>{c.email}</TableCell>
                          <TableCell sx={{ ...cellStyle }}>
                            {c?.adress}
                          </TableCell>
                          <TableCell sx={{ ...cellStyle }}>
                            {c?.postalCode}
                          </TableCell>
                          <TableCell sx={{ ...cellStyle }}>{c?.city}</TableCell>

                          <TableCell sx={{ ...cellStyle }}>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ ...cellStyle }}
                              color="secondary"
                              onClick={() => {
                                setSelectedClient(c);
                                setOpenEditClientDialog(true);
                              }}
                            >
                              Modifier
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                  />
                </TableContainer>
              )}
            </Paper>
          </Box>
        );

      // ------------------ Véhicules ------------------
      case "vehicules":
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Gestion des véhicules
            </Typography>
            <Button
              variant="contained"
              onClick={() => setOpenCreateVehiculeDialog(true)}
              sx={{ mb: 2 }}
            >
              Créer un véhicule
            </Button>
            <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2, mb: 3 }}>
              {loading.vehicules ? (
                <Typography sx={{ p: 2 }}>
                  Chargement des vehicules...
                </Typography>
              ) : (
                <TableContainer sx={{ maxHeight: 500, overflowY: "auto" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...cellStyle }}>ID</TableCell>
                        <TableCell sx={{ ...cellStyle }}>
                          Immatriculation
                        </TableCell>
                        <TableCell sx={{ ...cellStyle }}>Modèle</TableCell>
                        <TableCell sx={{ ...cellStyle }}>Client</TableCell>
                        <TableCell sx={{ ...cellStyle }}>Kilométrage</TableCell>
                        <TableCell sx={{ ...cellStyle }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedVehicules.map((v) => (
                        <TableRow key={v.id} hover>
                          <TableCell sx={{ ...cellStyle }}>{v.id}</TableCell>
                          <TableCell sx={{ ...cellStyle }}>
                            {v.plateNumber}
                          </TableCell>
                          <TableCell sx={{ ...cellStyle }}>{v.model}</TableCell>
                          <TableCell sx={{ ...cellStyle }}>
                            {v.Client?.name}
                          </TableCell>
                          <TableCell sx={{ ...cellStyle }}>
                            {v.mileage}
                          </TableCell>
                          <TableCell sx={{ ...cellStyle }}>
                            <Button
                              variant="outlined"
                              size="small"
                              color="secondary"
                              onClick={() => {
                                setSelectedVehicule(v);
                                setOpenEditVehiculeDialog(true);
                              }}
                            >
                              Modifier
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                  />
                </TableContainer>
              )}
            </Paper>
          </Box>
        );

      // ------------------ Historiques ------------------
      case "historiques":
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Historiques
            </Typography>

            <Tabs
              value={tabHist}
              onChange={(e, v) => setTabHist(v)}
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab label="Factures" />
              <Tab label="Devis" />
              <Tab label="Ordres de Réparation" />
              <Tab label="Réservations" />
              <Tab label="Entretiens" />
            </Tabs>

            {tabHist === 0 &&
              renderTable(paginatedHistData, "Facture", facturesData.length)}

            {tabHist === 1 &&
              renderTable(paginatedHistData, "Devis", devisData.length)}

            {tabHist === 2 &&
              renderTable(paginatedHistData, "OR", orData.length)}

            {tabHist === 3 &&
              renderTable(
                paginatedHistData,
                "Réservation",
                reservationsData.length,
              )}

            {tabHist === 4 &&
              renderTable(
                paginatedHistData,
                "Entretien",
                entretiensData.length,
              )}
          </Box>
        );

      default:
        return <Typography>Choisissez une section</Typography>;
    }
  };

  // ------------------ Helper pour Historique ------------------
  const renderTable = (data, type, totalCount) => {
    const { page, rowsPerPage } = histPagination[currentHistKey];

    return (
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Liste des {type}s
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...cellStyle }}>N° {type}</TableCell>
              <TableCell sx={{ ...cellStyle }}>Client</TableCell>
              <TableCell sx={{ ...cellStyle }}>Véhicule</TableCell>
              <TableCell sx={{ ...cellStyle }}>Date</TableCell>
              <TableCell sx={{ ...cellStyle }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell sx={{ ...cellStyle }}>{d.id}</TableCell>
                <TableCell sx={{ ...cellStyle }}>{d?.Client?.name}</TableCell>
                <TableCell sx={{ ...cellStyle }}>
                  {d?.Vehicle?.plateNumber}
                </TableCell>
                <TableCell sx={{ ...cellStyle }}>
                  {new Date(d.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ ...cellStyle }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(event) => HandleViewDocument(event, d)}
                  >
                    Voir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangeHistPage}
          onRowsPerPageChange={handleChangeHistRowsPerPage}
        />
      </Paper>
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

  return (
    <>
      <div className="">
        {/* 🔍 Barre de recherche centrée */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "flex-start", // ⬅️ aligne les enfants en haut
            justifyContent: "center", // ⬅️ centre horizontalement
            mx: 3,
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
                              (item) => item.id === event.id,
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
            dataDetails={selectedEvent?.Details ?? []}
          />
        )}
      </Dialog>
      <Box sx={{ height: "100vh", px: 4 }}>
        <Grid container spacing={2} sx={{ height: "100%", mt: 3 }}>
          {/* 🟦 Colonne gauche — sidebar locale */}
          <Grid
            item
            xs={12}
            md={2}
            sx={{
              pl: "2.5rem !important",
            }}
          >
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent sx={{ flex: 1, overflowY: "auto" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                    ml: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                    Menu
                  </Typography>

                  <List>
                    {menuItems.map((item) => (
                      <ListItem
                        button
                        key={item.key}
                        selected={selected === item.key}
                        onClick={() => setSelected(item.key)}
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          bgcolor:
                            selected === item.key
                              ? "primary.main"
                              : "transparent",
                          color:
                            selected === item.key ? "white" : "text.primary",
                          "&:hover": {
                            bgcolor:
                              selected === item.key
                                ? "primary.dark"
                                : "grey.100",
                          },
                        }}
                      >
                        <ListItemText primary={item.label} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 🟩 Colonne droite — contenu principal */}
          <Grid item xs={12} md={10}>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "left",
                p: 2,
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              {renderContent()}
            </Box>
          </Grid>
        </Grid>

        {/* Dialog (création / modif) */}
        <Dialog
          open={openCreateClientDialog}
          onClose={() => setOpenCreateClientDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Créer un client</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              name="name"
              onChange={handleNewClientChange}
              label="Nom"
              fullWidth
            />
            <TextField
              name="firstName"
              onChange={handleNewClientChange}
              label="Prénom"
              fullWidth
            />
            <TextField
              name="phone"
              onChange={handleNewClientChange}
              label="Téléphone"
              fullWidth
            />
            <TextField
              name="email"
              onChange={handleNewClientChange}
              label="Email"
              fullWidth
            />
            <TextField
              name="address"
              onChange={handleNewClientChange}
              label="Adresse"
              fullWidth
            />
            <TextField name="postalCode" label="Code postal" fullWidth />
            <TextField
              name="city"
              onChange={handleNewClientChange}
              label="Ville"
              fullWidth
            />
            <Button variant="contained" onClick={handleCreateClient}>
              Enregistrer
            </Button>
          </DialogContent>
        </Dialog>
        <Dialog
          open={openEditClientDialog}
          onClose={() => setOpenEditClientDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Modifier le client</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Nom"
              fullWidth
              name="name"
              onChange={handleNewClientChange}
              value={selectedClient?.name || ""}
            />
            <TextField
              label="Prénom"
              name="firstName"
              onChange={handleNewClientChange}
              fullWidth
              value={selectedClient?.firstName || ""}
            />
            <TextField
              label="Téléphone"
              name="phone"
              onChange={handleNewClientChange}
              fullWidth
              value={selectedClient?.phone || ""}
            />
            <TextField
              label="Email"
              name="email"
              onChange={handleNewClientChange}
              fullWidth
              value={selectedClient?.email || ""}
            />
            <TextField
              label="Addresse"
              name="address"
              onChange={handleNewClientChange}
              fullWidth
              value={selectedClient?.address || ""}
            />
            <TextField
              label="Code postal"
              name="postalCode"
              onChange={handleNewClientChange}
              fullWidth
              value={selectedClient?.postalCode || ""}
            />
            <TextField
              label="Ville"
              name="city"
              onChange={handleNewClientChange}
              fullWidth
              value={selectedClient?.city || ""}
            />
            <Button variant="contained" onClick={handleUpdateClients}>
              Enregistrer
            </Button>
          </DialogContent>
        </Dialog>
        <Dialog
          open={openCreateVehiculeDialog}
          onClose={() => setOpenCreateVehiculeDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Créer un véhicule</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              name="plateNumber"
              onChange={handleNewVehiculeChange}
              label="Immatriculation"
              fullWidth
            />
            <TextField
              name="model"
              onChange={handleNewVehiculeChange}
              label="Modèle"
              fullWidth
            />
            <TextField
              name="color"
              onChange={handleNewVehiculeChange}
              label="Couleur"
              fullWidth
            />
            {/* 🔹 Sélecteur de client */}
            <FormControl fullWidth>
              <InputLabel>Client</InputLabel>
              <Select
                name="clientId"
                value={formData.clientId}
                onChange={handleNewVehiculeChange}
                label="Client"
              >
                {clientsData.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="mileage"
              onChange={handleNewVehiculeChange}
              label="Kilométrage"
              fullWidth
            />
            <TextField
              name="vin"
              onChange={handleNewVehiculeChange}
              label="VIN"
              fullWidth
            />
            <Button variant="contained" onClick={createVehicule}>
              Enregistrer
            </Button>
          </DialogContent>
        </Dialog>
        <Dialog
          open={openEditVehiculeDialog}
          onClose={() => setOpenEditVehiculeDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Modifier le véhicule</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Immatriculation"
              name="plateNumber"
              onChange={handleNewVehiculeChange}
              fullWidth
              value={selectedVehicule?.plateNumber || ""}
            />

            <TextField
              label="Modèle"
              fullWidth
              name="model"
              onChange={handleNewVehiculeChange}
              value={selectedVehicule?.model || ""}
            />
            <TextField
              label="Couleur"
              name="color"
              onChange={handleNewVehiculeChange}
              fullWidth
              value={selectedVehicule?.color || ""}
            />
            <TextField
              label="Client"
              fullWidth
              value={selectedVehicule?.Client.name || ""}
              disabled="true"
            />
            <TextField
              label="Kilométrage"
              name="mileage"
              onChange={handleNewVehiculeChange}
              fullWidth
              value={selectedVehicule?.mileage || ""}
            />
            <TextField
              label="VIN"
              name="vin"
              onChange={handleNewVehiculeChange}
              fullWidth
              value={selectedVehicule?.vin || ""}
            />
            <Button variant="contained" onClick={handleUpdateVehicule}>
              Enregistrer
            </Button>
          </DialogContent>
        </Dialog>
      </Box>
      <AddDocumentComponent
        onDocumentCreated={handleDocumentCreated}
      ></AddDocumentComponent>
    </>
  );
}

export default ManageClients;
