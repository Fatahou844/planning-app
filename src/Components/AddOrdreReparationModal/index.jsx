import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
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
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../hooks/firebaseConfig";

function AddOrdreReparationModal({
  open,
  onClose,
  editedEvent,
  setEditedEvent,
  collectionName,
  categories,
  onEventTriggered,
}) {
  const [details, setDetails] = useState([]);
  const [finDate, setFinDate] = useState(editedEvent?.finDate || "");
  const [user] = useAuthState(auth);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dataEvents, setDataEvents] = useState([]);

  const [invoiceExecuted, setInvoiceExecuted] = useState(false);

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFinDate(""); // Réinitialiser la date de fin
  };

  const addDetailRow = () => {
    setDetails((prevDetails) => [
      ...prevDetails,
      {
        label: "",
        quantity: "",
        unitPrice: "",
        discountPercent: "",
        discountAmount: "",
      },
    ]);
  };

  useEffect(() => {
    if (editedEvent) {
      const fetchDetails = async () => {
        try {
          const detailsCollectionRef = collection(
            doc(db, "reservations", editedEvent.id),
            "details"
          );
          const detailsSnapshot = await getDocs(detailsCollectionRef);
          const detailsData = detailsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDetails(detailsData);
        } catch (error) {
          console.error("Erreur lors de la récupération des détails :", error);
        }
      };

      fetchDetails();
    }
  }, [, open, editedEvent.id]);

  // Handle input change for end date
  const handleChangeFinDate = (e) => {
    const value = e.target.value;
    setFinDate(value);
    setEditedEvent((prev) => ({ ...prev, finDate: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditedEvent((prevEvent) => {
      const updatedEvent = { ...prevEvent };

      if (name === "startTime") {
        // Vérifier si le format est valide (HHMM ou vide)
        const isValid = /^\d{0,4}$/.test(value);

        if (isValid) {
          const startHour = value.slice(0, 2) || ""; // Extraire les 2 premiers caractères pour l'heure
          const startMinute = value.slice(2, 4) || ""; // Extraire les 2 derniers caractères pour les minutes

          updatedEvent.startHour = startHour; // Convertir en entier ou garder vide
          updatedEvent.startMinute = startMinute; // Convertir en entier ou garder vide
        }
      } else if (name === "endTime") {
        // Gérer le champ combiné pour l'heure de fin
        const isValid = /^\d{0,4}$/.test(value);

        if (isValid) {
          const endHour = value.slice(0, 2) || "";
          const endMinute = value.slice(2, 4) || "";

          updatedEvent.endHour = endHour; // Convertir en entier ou garder vide
          updatedEvent.endMinute = endMinute; // Convertir en entier ou garder vide
        }
      } else if (name === "category") {
        // Gérer la catégorie
        const selectedCat = categories.find((cat) => cat.id === value);
        updatedEvent.category = {
          id: selectedCat.id,
          name: selectedCat.name,
          color: selectedCat.color,
        };
      } else if (name.includes(".")) {
        // Gérer les champs imbriqués (par exemple "address.street")
        const keys = name.split(".");
        let current = updatedEvent;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            // Dernière clé, assigner la valeur
            current[key] = value;
          } else {
            // Initialiser si le sous-objet n'existe pas
            if (!current[key]) {
              current[key] = {};
            }
            current = current[key];
          }
        });
      } else {
        // Gérer les autres champs
        updatedEvent[name] = value;
      }
      if (name === "date") {
        setFinDate(e.target.value);
      }

      return updatedEvent;
    });
  };

  const handleDetailChange = (index, field, value) => {
    // Vérifiez si l'index existe dans le tableau
    if (index >= 0 && index < details.length) {
      const updatedDetails = [...details];
      updatedDetails[index] = { ...updatedDetails[index], [field]: value }; // Mise à jour propre de l'objet
      setDetails(updatedDetails);
    } else {
      console.error(`Index ${index} hors limites pour le tableau details.`);
    }
  };

  const removeDetailRow = async (index) => {
    // Met à jour l'affichage en supprimant la ligne localement
    setDetails((prevDetails) => prevDetails.filter((_, i) => i !== index));

    // Récupère le détail à supprimer basé sur l'index
    const detailToDelete = details[index];

    if (detailToDelete && detailToDelete.id) {
      try {
        const eventDocRef = doc(db, collectionName, editedEvent.id);
        const detailsCollectionRef = collection(eventDocRef, "details");
        const detailDocRef = doc(detailsCollectionRef, detailToDelete.id);

        // Supprime le document dans Firestore
        await deleteDoc(detailDocRef);

        console.log(
          `Document avec l'id ${detailToDelete.id} supprimé de la base de données.`
        );
      } catch (error) {
        console.error("Erreur lors de la suppression du document :", error);
      }
    } else {
      console.warn("Aucun document trouvé pour cet index.");
    }
  };

  const handleAddDetail = () => {
    setDetails([
      ...details,
      {
        // On ne définit pas d’ID pour indiquer qu’il s’agit d’un nouvel élément
        label: "",
        quantity: 0,
        unitPrice: 0,
        discountAmount: 0,
        discountPercent: 0,
      },
    ]);
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
  const totalTTC = details.reduce(
    (sum, detail) => sum + calculateLineTotal(detail),
    0
  );
  const totalHT = totalTTC / 1.2; // Ajouter 20% de TVA

  let collectName = "Ordre de réparation";

  if (collectionName == "events") collectName = "Ordre de réparation";
  else if (collectionName == "devis") collectName = "devis";
  else if (collectionName == "reservations") collectName = "résa";
  else collectName = "facture";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deposit, setDeposit] = useState(0);

  const addEventDetails = async (eventId, details) => {
    try {
      const batch = writeBatch(db); // Crée un batch pour les opérations

      // Référence directe au document de l'événement avec l'ID existant
      const eventRef = doc(db, "events", eventId);

      // Filtre les détails valides (exclut ceux où tous les champs sont vides ou non valides)
      const validDetails = details.filter((detail) => {
        return (
          detail.label?.trim() ||
          detail.quantity?.toString().trim() ||
          detail.unitPrice?.toString().trim() ||
          detail.discountPercent?.toString().trim() ||
          detail.discountAmount?.toString().trim()
        );
      });

      console.log("##############lidDetails####################", validDetails);

      // Si aucun détail valide, on sort sans erreur
      if (validDetails.length === 0) {
        console.log("Aucun détail valide à enregistrer.");
        return;
      }

      // Boucle sur chaque détail filtré et ajout à la sous-collection "details" de cet événement
      for (const detail of validDetails) {
        const detailRef = doc(collection(eventRef, "details")); // Crée un nouveau document dans "details"
        batch.set(detailRef, {
          label: detail.label || "",
          quantity: detail.quantity || 0,
          unitPrice: detail.unitPrice || 0,
          discountPercent: detail.discountPercent || 0,
          discountAmount: detail.discountAmount || 0,
        });
      }

      // Engager toutes les écritures dans le batch
      await batch.commit();

      console.log("Détails ajoutés avec succès à l'événement");
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout des détails à l'événement : ",
        error
      );
    }
  };

  const getLastOrderNumberForUser = async (userId) => {
    const docRef = doc(db, "userOrderNumbers", userId); // Document unique pour chaque userId
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().lastOrderNumber; // Récupère le dernier numéro
    } else {
      // Si le document n'existe pas encore, on commence à 00000 pour cet utilisateur
      return 0;
    }
  };

  // Fonction pour mettre à jour le dernier numéro de commande pour un userId
  const updateLastOrderNumberForUser = async (userId, newOrderNumber) => {
    const docRef = doc(db, "userOrderNumbers", userId); // Document unique par userId
    await setDoc(docRef, { lastOrderNumber: newOrderNumber, userId: userId }); // Met à jour ou crée le document
  };

  // Fonction pour générer un numéro de commande formaté à 5 chiffres
  const generateOrderNumber = (lastOrderNumber) => {
    const newOrderNumber = lastOrderNumber + 1;
    return newOrderNumber.toString().padStart(5, "0"); // Format à 5 chiffres
  };

  const addSingleEvent = async (event, newOrderNumber, nextDay) => {
    try {
      const eventRef = doc(collection(db, "events")); // Crée une référence à un nouveau document
      console.log("ORDRE DE REPARATION", event);

      console.log("category: event.categoryId", event.category.id);

      await setDoc(eventRef, {
        eventId: eventRef.id,
        title: newOrderNumber, // Utilise le numéro de commande fourni
        date: event.date,
        startHour: parseInt(event.startHour),
        startMinute: parseInt(event.startMinute),
        endHour: parseInt(event.endHour),
        endMinute: parseInt(event.endMinute),
        category: event.category.id
          ? {
              id: event.category.id,
              name: event.category.name,
              color: event.category.color,
            }
          : null,
        person: {
          firstName: event.person.firstName,
          lastName: event.person.lastName,
          email: event.person.email,
          phone: event.person.phone,
        },
        vehicule: {
          licensePlate: event.vehicule.licensePlate
            ? event.vehicule.licensePlate
            : "",
          vin: event.vehicule.vin ? event.vehicule.vin : "",
          color: event.vehicule.color ? event.vehicule.color : "",
          model: event.vehicule.model ? event.vehicule.model : "",
          kms: event.vehicule.kms ? event.vehicule.kms : "",
          controletech: event.vehicule.controletech
            ? event.vehicule.controletech
            : "",
        },
        details: {
          workDescription: event.workDescription ? event.workDescription : "",
          price: event.price ? event.price : "",
          acompte: deposit ? deposit : 0,
        },
        operator: event.operator ? event.operator : "",
        receptor: event.receptor ? event.receptor : "",
        isClosed: false,
        userId: event.userId, // UID de l'utilisateur
        nextDay: nextDay,
      });

      console.log("eventRef", event);

      // Mettre à jour le dernier numéro de commande utilisé pour cet utilisateur
      await updateLastOrderNumberForUser(
        event.userId,
        parseInt(newOrderNumber)
      );
      return eventRef; // Retourner la référence du document
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const addEvent = async (isMultiDay = false) => {
    // Ajout du paramètre isMultiDay
    if (!user) {
      console.error("User not authenticated");
      return; // Sortir si l'utilisateur n'est pas connecté
    }

    const updatedEvents = [...events]; // Crée une copie de l'array events
    const startDate = new Date(editedEvent.date); // Date de début
    const endDate = new Date(finDate); // Date de fin
    const userId = user.uid; // UID de l'utilisateur connecté

    // Générer le numéro de commande une seule fois pour l'événement (ou son ensemble)
    const lastOrderNumber = await getLastOrderNumberForUser(userId);
    const newOrderNumber = generateOrderNumber(lastOrderNumber);

    if (isMultiDay && startDate.getTime() !== endDate.getTime()) {
      // Cas où les événements couvrent plusieurs jours

      // Ajout du premier événement pour la date de début
      const firstEventEndHour = 19; // Heure de fin de la journée
      const firstEventEndMinute = 0; // Fin de la journée à 18:00
      const firstEvent = {
        ...editedEvent,
        endHour: firstEventEndHour,
        endMinute: firstEventEndMinute,
        userId: userId,
        title: newOrderNumber, // Utiliser le même numéro de commande
      };
      const singleEventDocRef = await addSingleEvent(
        firstEvent,
        newOrderNumber,
        true
      ); // Ajout à Firestore
      const IsvalidDetails = details.filter((detail) => {
        return (
          detail.label?.trim() ||
          detail.quantity?.toString().trim() ||
          detail.unitPrice?.toString().trim() ||
          detail.discountPercent?.toString().trim() ||
          detail.discountAmount?.toString().trim()
        );
      });

      if (IsvalidDetails.length)
        await addEventDetails(singleEventDocRef.id, details); // Enregistrer les détails

      // Ajout des événements pour les jours intermédiaires (si applicable)
      let currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + 1); // Premier jour après la date de début
      while (currentDate < endDate) {
        const dailyEvent = {
          ...editedEvent,
          date: formatDate(currentDate),
          startHour: 7,
          startMinute: 0,
          endHour: 19,
          endMinute: 0,
          userId: userId,
          title: newOrderNumber, // Utiliser le même numéro de commande pour chaque jour
        };
        const singleEventDocRef = await addSingleEvent(
          dailyEvent,
          newOrderNumber,
          true
        ); // Ajout à Firestore
        if (IsvalidDetails.length)
          await addEventDetails(singleEventDocRef.id, details); // Enregistrer les détails
        currentDate.setDate(currentDate.getDate() + 1); // Incrémenter la date
      }

      // Ajout du dernier événement pour la date de fin
      const lastEvent = {
        ...editedEvent,
        date: finDate,
        startHour: 7,
        startMinute: 0,
        endHour: parseInt(editedEvent.endHour), // Heure réelle de fin
        endMinute: parseInt(editedEvent.endMinute),
        userId: userId,
        title: newOrderNumber, // Utiliser le même numéro de commande
        nextDay: false,
      };
      const lastEventDocRef = await addSingleEvent(
        lastEvent,
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
        await addEventDetails(lastEventDocRef.id, details); // Enregistrer les détails
    } else {
      // Si l'événement ne couvre qu'une seule journée, ou si isMultiDay est faux
      const singleEvent = {
        ...editedEvent,
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
    await updateLastOrderNumberForUser(userId, parseInt(newOrderNumber));

    // Mettre à jour le state avec les événements ajoutés
    setEvents(updatedEvents);

    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events");

        // Créer la requête avec la condition where pour filtrer par userId
        const q = query(
          eventsRef,
          where("userId", "==", user.uid),
          where("date", "==", selectedDate)
        );

        const querySnapshot = await getDocs(q);

        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDataEvents(eventsData.filter((event) => event.isClosed == false));
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des événements : ",
          error
        );
      }
    };

    fetchEvents(); // Appeler la fonction au montage du composant

    resetForm();
    setIsModalOpen(false); // Fermer le modal
    if (onEventTriggered) {
      onEventTriggered(); // Notifie le parent
    }
  };

  const handleConfirmOR = () => {
    addEvent(); // Appel de la fonction addEvent
    onClose();
  };

  const handleInternalClose = () => {
    // Appelle la fonction `onClose` pour fermer la boîte de dialogue
    if (onClose) onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          style: {
            width: "1200px", // Remplacez par la largeur souhaitée
            maxWidth: "none", // Supprimez la largeur maximale par défaut
          },
        }}
      >
        <DialogTitle>Ajouter un O.R</DialogTitle>
        <DialogContent>
          <form>
            <Grid container spacing={2}>
              {/* Colonne 1: Infos client */}
              <Grid item xs={12} md={6}>
                <Typography variant="body1">Informations Client</Typography>
                <TextField
                  label="Nom"
                  name="person.lastName"
                  value={editedEvent.person?.lastName}
                  onChange={handleChange}
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
                <TextField
                  label="Prénom"
                  name="person.firstName"
                  value={editedEvent.person?.firstName}
                  onChange={handleChange}
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
                <TextField
                  label="Téléphone"
                  name="person.phone"
                  value={editedEvent.person?.phone}
                  onChange={handleChange}
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
                <TextField
                  label="Email"
                  name="person.email"
                  value={editedEvent.person?.email}
                  onChange={handleChange}
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
                <TextField
                  label="Adresse locale"
                  name="person.adresse"
                  value={editedEvent.person?.adresse}
                  onChange={handleChange}
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
                  label="Code postal"
                  name="person.postale"
                  value={editedEvent.person?.postale}
                  onChange={handleChange}
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
                  label="Ville"
                  name="person.ville"
                  value={editedEvent.person?.ville}
                  onChange={handleChange}
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
                <Typography variant="body1">Informations Véhicule</Typography>
                <TextField
                  label="Immatriculation"
                  name="vehicule.licensePlate"
                  value={editedEvent.vehicule?.licensePlate}
                  onChange={handleChange}
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
                  label="VIN"
                  name="vehicule.vin"
                  value={editedEvent.vehicule?.vin}
                  onChange={handleChange}
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
                  label="Modèle"
                  name="vehicule.model"
                  value={editedEvent.vehicule?.model}
                  onChange={handleChange}
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
                  label="Couleur"
                  name="vehicule.color"
                  value={editedEvent.vehicule?.color}
                  onChange={handleChange}
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
                  label="kilométrage"
                  name="vehicule.kms"
                  value={editedEvent.vehicule?.kms}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  size="small"
                  sx={{
                    height: "30px",
                    "& .MuiInputBase-root": { fontSize: "0.8rem" },
                    "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                  }}
                />
                <Typography variant="body1">
                  Prochain controle technique
                </Typography>
                <TextField
                  name="vehicule.controletech"
                  type="date"
                  value={editedEvent.vehicule?.controletech}
                  onChange={handleChange}
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
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: "40%" }}>
                          Libellé / travaux / articles
                        </TableCell>
                        <TableCell
                          style={{ width: "10%", textAlign: "center" }}
                        >
                          Quantité
                        </TableCell>
                        <TableCell
                          style={{ width: "15%", textAlign: "center" }}
                        >
                          Prix Unitaire
                        </TableCell>
                        {/* <TableCell
                                style={{ width: "10%", textAlign: "center" }}
                              >
                                Remise %
                              </TableCell> */}
                        <TableCell
                          style={{ width: "10%", textAlign: "center" }}
                        >
                          Remise
                        </TableCell>
                        <TableCell
                          style={{ width: "10%", textAlign: "center" }}
                        >
                          Total
                        </TableCell>
                        <TableCell
                          style={{ width: "10%", textAlign: "center" }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details.length > 0 &&
                        details.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <TextField
                                name="label"
                                value={detail.label}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "label",
                                    e.target.value
                                  )
                                }
                                size="small"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                name="quantity"
                                type="number"
                                value={detail.quantity}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
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
                            <TableCell>
                              <TextField
                                name="unitPrice"
                                type="number"
                                value={detail.unitPrice}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "unitPrice",
                                    e.target.value
                                  )
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

                            <TableCell>
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
                                    const amount = parseFloat(normalizedValue);
                                    if (!isNaN(amount)) {
                                      detail.discountAmount = amount; // Met à jour le montant
                                      detail.discountPercent = ""; // Réinitialise le pourcentage
                                    }
                                  }

                                  // Met à jour l'état de l'inputValue avec la saisie brute
                                  detail.inputValue = formattedValue;

                                  // Appelle la fonction de gestion des changements
                                  handleDetailChange(
                                    index,
                                    "discountAmount",
                                    e.target.value
                                  );
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

                            <TableCell style={{ textAlign: "center" }}>
                              {calculateLineTotal(detail).toFixed(2)}
                            </TableCell>
                            <TableCell style={{ textAlign: "center" }}>
                              <Button
                                color="secondary"
                                onClick={() => removeDetailRow(index)}
                              >
                                Supprimer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      <TableRow>
                        <TableCell colSpan={7}>
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
                        <TableCell colSpan={4}></TableCell>
                        <TableCell>Total TTC :</TableCell>
                        <TableCell>{totalTTC.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4}></TableCell>
                        <TableCell>Total HT :</TableCell>
                        <TableCell>{totalHT.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4}></TableCell>
                        <TableCell>Acompte :</TableCell>
                        <TableCell>
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
                    name="workDescription"
                    value={editedEvent.workDescription}
                    onChange={handleChange}
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
                    value={editedEvent.price}
                    placeholder="Prix"
                    onChange={handleChange}
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
                      "& input[type=number]::-webkit-outer-spin-button": {
                        WebkitAppearance: "none", // Pour Chrome, Safari, Edge, Opera
                        margin: 0,
                      },
                      "& input[type=number]::-webkit-inner-spin-button": {
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
                    }}
                  >
                    <TextField
                      label="Opérateur"
                      name="operator"
                      value={editedEvent.operator}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      size="small"
                      sx={{
                        "& .MuiInputBase-root": { fontSize: "0.8rem" },
                        "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                      }}
                    />

                    <TextField
                      label="Réceptionnaire"
                      name="receptor"
                      value={editedEvent.receptor}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      size="small"
                      sx={{
                        "& .MuiInputBase-root": { fontSize: "0.8rem" },
                        "& .MuiFormLabel-root": { fontSize: "0.8rem" },
                      }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    {/* Section Date de l'événement et Heure de début */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1">
                        Date de l'événement
                      </Typography>
                      <TextField
                        name="date"
                        type="date"
                        value={editedEvent.date}
                        onChange={handleChange}
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
                          value={`${
                            editedEvent.startHour ? editedEvent.startHour : ""
                          }${
                            editedEvent.startMinute
                              ? editedEvent.startMinute
                              : ""
                          }`}
                          onChange={handleChange}
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
                                Heure : {editedEvent.startHour || "Non définie"}{" "}
                                Minute : {editedEvent.startMinute || "Non définie"}
                              </Typography>
                            </Box> */}
                    </Grid>
                    {/* Section Date de fin et Heure de fin */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1">Date de fin</Typography>
                      <TextField
                        name="finDate"
                        type="date"
                        value={finDate}
                        onChange={handleChangeFinDate}
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
                            `${editedEvent.endHour ? editedEvent.endHour : ""}${
                              editedEvent.endMinute ? editedEvent.endMinute : ""
                            }` || ""
                          }
                          onChange={handleChange}
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
                                Heure : {editedEvent.endHour || "Non définie"}{" "}
                                Minute : {editedEvent.endMinute || "Non définie"}
                              </Typography>
                            </Box> */}
                    </Grid>
                  </Grid>

                  <TextField
                    select
                    label="Catégorie"
                    name="category"
                    value={editedEvent?.category?.id}
                    onChange={handleChange}
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
                  onClick={handleConfirmOR}
                >
                  Créer un OR
                </Button>
              </Grid>

              <Grid item>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleInternalClose}
                >
                  Annuler
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddOrdreReparationModal;
