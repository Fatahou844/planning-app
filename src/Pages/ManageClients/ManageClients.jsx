// src/App.js
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout"; // Icone de plus pour le bouton flottant
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
  Fab,
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
import Cookies from "js-cookie";
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
const menuItems = [
  { key: "clients", label: "Clients" },
  { key: "vehicules", label: "Véhicules" },
  { key: "historiques", label: "Historiques" },
];
// 👇 Liste des clients
const clientsData = [
  {
    id: 1,
    nom: "Dupont",
    prenom: "Jean",
    telephone: "0612345678",
    email: "jean.dupont@mail.com",
    vehicules: 2,
  },
  {
    id: 2,
    nom: "Martin",
    prenom: "Claire",
    telephone: "0622334455",
    email: "claire.martin@mail.com",
    vehicules: 1,
  },
  {
    id: 3,
    nom: "Benali",
    prenom: "Youssef",
    telephone: "0655443322",
    email: "y.benali@mail.com",
    vehicules: 3,
  },
];

// 👇 Liste des véhicules
const vehiculesData = [
  {
    id: 1,
    immatriculation: "AA-123-BB",
    marque: "Peugeot",
    modele: "308",
    client: "Dupont Jean",
    kilometrage: 50000,
  },
  {
    id: 2,
    immatriculation: "CC-456-DD",
    marque: "Renault",
    modele: "Clio",
    client: "Martin Claire",
    kilometrage: 35000,
  },
  {
    id: 3,
    immatriculation: "EE-789-FF",
    marque: "Toyota",
    modele: "Corolla",
    client: "Benali Youssef",
    kilometrage: 60000,
  },
];

// 👇 Liste des factures
const facturesData = [
  {
    id: 1,
    numero: "FAC-001",
    client: "Dupont Jean",
    vehicule: "Peugeot 308",
    montant: "350 €",
    date: "12/10/2025",
  },
  {
    id: 2,
    numero: "FAC-002",
    client: "Martin Claire",
    vehicule: "Renault Clio",
    montant: "480 €",
    date: "20/10/2025",
  },
];

// 👇 Liste des devis
const devisData = [
  {
    id: 1,
    numero: "DEV-001",
    client: "Dupont Jean",
    vehicule: "Peugeot 308",
    montant: "300 €",
    date: "10/10/2025",
  },
  {
    id: 2,
    numero: "DEV-002",
    client: "Benali Youssef",
    vehicule: "Toyota Corolla",
    montant: "600 €",
    date: "22/10/2025",
  },
];
const orData = [];
const reservationsData = [];
const entretiensData = [];
function ManageClients() {
  const axios = useAxios();
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

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       const response = await axios.get(
  //         "/categories/garage/" + getCurrentUser().garageId
  //       );

  //       // Récupérer les données
  //       const categoriesData = response.data;

  //       // Extraire les noms des catégories
  //       const categoryNames = categoriesData.data.map(
  //         (category) => category.name
  //       );

  //       // Mettre à jour les états
  //       setCategories(categoriesData.data);

  //       console.log("categoriesData", categoriesData.data);
  //     } catch (error) {
  //       console.error("Erreur lors de la récupération des catégories :", error);
  //     }
  //   };

  //   fetchCategories();
  //   searchQueryInterior;
  // }, []);

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

        setCategories(categoriesData.data);

        console.log("categoriesData", categoriesData.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      }
    };

    fetchCategories();
  }, []);
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

          const eventDate = new Date(event.createdAt); // ou event.createdAt

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

        const eventDate = new Date(event.createdAt); // ou event.createdAt

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
      setOpen(true); // Ouvre le dialogue après la recherche
    } catch (error) {
      console.error("Erreur lors de la recherche des collections :", error);
    }
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

  const handleLogout = async () => {
    try {
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
        message: "Bravo Votre  Facture a été crée ",
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

  const [selected, setSelected] = useState("clients");
  const [openDialog, setOpenDialog] = useState(false);
  const [tabHist, setTabHist] = useState(0);

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
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Prénom</TableCell>
                    <TableCell>Téléphone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Adresse</TableCell>
                    <TableCell>Code postal</TableCell>
                    <TableCell>Ville</TableCell>
                    <TableCell>Nb véhicules</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientsData.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.id}</TableCell>
                      <TableCell>{c.nom}</TableCell>
                      <TableCell>{c.prenom}</TableCell>
                      <TableCell>{c.telephone}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c?.adresse}</TableCell>
                      <TableCell>{c?.postalCode}</TableCell>
                      <TableCell>{c?.city}</TableCell>
                      <TableCell>{c.vehicules}</TableCell>
                      <TableCell>
                        <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                          Voir
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="secondary"
                          onClick={() => {
                            setSelectedClient(c); // pour clients
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
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Immatriculation</TableCell>
                    <TableCell>Marque</TableCell>
                    <TableCell>Modèle</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Kilométrage</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehiculesData.map((v) => (
                    <TableRow key={v.id} hover>
                      <TableCell>{v.id}</TableCell>
                      <TableCell>{v.immatriculation}</TableCell>
                      <TableCell>{v.marque}</TableCell>
                      <TableCell>{v.modele}</TableCell>
                      <TableCell>{v.client}</TableCell>
                      <TableCell>{v.kilometrage}</TableCell>
                      <TableCell>
                        <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                          Voir
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="secondary"
                          onClick={() => {
                            setSelectedVehicule(v); // pour véhicules
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

            {tabHist === 0 && renderTable(facturesData, "Facture")}
            {tabHist === 1 && renderTable(devisData, "Devis")}
            {tabHist === 2 && renderTable(orData, "OR")}
            {tabHist === 3 && renderTable(reservationsData, "Réservation")}
            {tabHist === 4 && renderTable(entretiensData, "Entretien")}
          </Box>
        );

      default:
        return <Typography>Choisissez une section</Typography>;
    }
  };

  // ------------------ Helper pour Historique ------------------
  const renderTable = (data, type) => (
    <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Liste des {type}s
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>N° {type}</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Véhicule</TableCell>
            {type !== "OR" &&
              type !== "Réservation" &&
              type !== "Entretien" && <TableCell>Montant</TableCell>}
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((d) => (
            <TableRow key={d.id} hover>
              <TableCell>{d.numero}</TableCell>
              <TableCell>{d.client}</TableCell>
              <TableCell>{d.vehicule}</TableCell>
              {"montant" in d && <TableCell>{d.montant}</TableCell>}
              <TableCell>{d.date}</TableCell>
              <TableCell>
                <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                  Voir
                </Button>
                {"montant" in d && (
                  <Button variant="outlined" size="small" color="secondary">
                    Imprimer
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );

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
                bgcolor: "white",
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
            <TextField label="Nom" fullWidth />
            <TextField label="Prénom" fullWidth />
            <TextField label="Téléphone" fullWidth />
            <TextField label="Email" fullWidth />
            <TextField label="Adresse" fullWidth />
            <TextField label="Code postal" fullWidth />
            <TextField label="Ville" fullWidth />
            <Button variant="contained">Enregistrer</Button>
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
              value={selectedClient?.nom || ""}
            />
            <TextField
              label="Prénom"
              fullWidth
              value={selectedClient?.prenom || ""}
            />
            <TextField
              label="Téléphone"
              fullWidth
              value={selectedClient?.telephone || ""}
            />
            <TextField
              label="Email"
              fullWidth
              value={selectedClient?.email || ""}
            />
            <Button variant="contained">Enregistrer</Button>
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
            <TextField label="Immatriculation" fullWidth />
            <TextField label="Marque" fullWidth />
            <TextField label="Modèle" fullWidth />
            <TextField label="Couleur" fullWidth />
            <TextField label="Client" fullWidth />
            <TextField label="Kilométrage" fullWidth />
            <TextField label="VIN" fullWidth />
            <Button variant="contained">Enregistrer</Button>
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
              fullWidth
              value={selectedVehicule?.immatriculation || ""}
            />
            <TextField
              label="Marque"
              fullWidth
              value={selectedVehicule?.marque || ""}
            />
            <TextField
              label="Modèle"
              fullWidth
              value={selectedVehicule?.modele || ""}
            />
            <TextField
              label="Client"
              fullWidth
              value={selectedVehicule?.client || ""}
            />
            <TextField
              label="Kilométrage"
              fullWidth
              value={selectedVehicule?.kilometrage || ""}
            />
            <Button variant="contained">Enregistrer</Button>
          </DialogContent>
        </Dialog>
      </Box>
      <AddDocumentComponent
        onDocumentCreated={handleDocumentCreated}
      ></AddDocumentComponent>
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
    </>
  );
}

export default ManageClients;
