// export default GarageSettings;

import BuildIcon from "@mui/icons-material/Build";
import CategoryIcon from "@mui/icons-material/Category";
import DescriptionIcon from "@mui/icons-material/Description";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Chip from "@mui/material/Chip";
import { useEffect, useState } from "react";
import { SketchPicker } from "react-color";
import ForfaitsConfigAdvanced from "../../Components/ForfaitsConfigAdvanced/ForfaitsConfigAdvanced";
import { useAxios } from "../../utils/hook/useAxios";

const GarageSettings = () => {
  const [garageInfo, setGarageInfo] = useState({
    name: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    dayValidityQuote: "",
    noteLegal: "",
    logo: null,
    startHourTimeline: 0,
    endHourTimeline: 0,
    startMinTimeline: 0,
    endMinTimeline: 0,
    codePostal: "",
    ville: "",
  });

  const [categories, setCategories] = useState([
    { name: "Vidange", color: "#1976d2", type: "system", garageId: null },
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDeleteIndex, setUserToDeleteIndex] = useState(null);

  const [userSession, setUserSession] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  const [garageUsers, setGarageUsers] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageProfile, setImageProfile] = useState(null);
  const axios = useAxios();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "/categories/garage/" + getCurrentUser().garageId,
        );

        const responseGarage = await axios.get(
          "/garages/userid/" + getCurrentUser().garageId,
        );
        if (responseGarage.data) {
          setGarageInfo(responseGarage.data.data);

          setImageProfile(responseGarage.data.data.logo);
        }
        // Récupérer les données
        const categoriesData = response.data;

        const responseGarageUsers = await axios.get(
          "/users/garageId/" + getCurrentUser().garageId,
        );

        setGarageUsers(responseGarageUsers.data);
        setUsers(responseGarageUsers.data);

        // Mettre à jour les états
        setCategories(categoriesData.data);

        console.log("categoriesData", categoriesData.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      }
    };

    fetchCategories();

    if (window.localStorage.getItem("me")) {
      const retrievedObject = JSON.parse(window.localStorage.getItem("me"));
      setUserSession(retrievedObject);

      if (retrievedObject.level == "2" || retrievedObject.level == "3") {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
    }
  }, []);

  const [users, setUsers] = useState([
    // exemple initial
    { firstName: "", name: "", email: "", level: "0" },
  ]);

  // const handleRemoveUser = async (index) => {
  //   const newUsers = [...users];
  //   newUsers.splice(index, 1);
  //   setUsers(newUsers);
  // };

  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  const handleAddCategory = () => {
    setCategories([
      ...categories,
      {
        name: "",
        color: "#000000",
        garageId: getCurrentUser().garageId,
        type: "company",
        isNew: true,
      },
    ]);
  };

  const handleCategoryChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    // Si ce n'est pas une nouvelle catégorie, on marque comme modifiée
    if (!updated[index].isNew) {
      updated[index].isModified = true;
    }
    setCategories(updated);
  };

  const handleRemoveCategory = async (index) => {
    // 1. Récupérer l'élément à supprimer
    const categoryToRemove = categories[index];

    // 2. Faire la requête DELETE avec son id
    if (categoryToRemove && categoryToRemove.id) {
      await axios.deleteData(`/categories/${categoryToRemove.id}`);
    } else {
      console.error("Impossible de trouver l'id de la catégorie !");
    }
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
  };

  const handleSaveCategories = async () => {
    // 1. Séparer les nouvelles catégories et celles existantes modifiées
    const newCategories = categories.filter((cat) => cat.isNew);
    const updatedCategories = categories.filter(
      (cat) => !cat.isNew && cat.isModified,
    );

    if (newCategories.length === 0 && updatedCategories.length === 0) {
      console.log("Aucune modification ou nouvelle catégorie à enregistrer.");
      return;
    }

    try {
      // 2. Traiter l'ajout des nouvelles catégories (POST)
      const createPromises = newCategories.map((cat) =>
        axios.post("/categories", {
          name: cat.name,
          color: cat.color,
          garageId: cat.garageId,
          type: cat.type,
        }),
      );

      // 3. Traiter la mise à jour des catégories existantes (PUT)
      const updatePromises = updatedCategories.map((cat) =>
        axios.put(`/categories/${cat.id}`, {
          name: cat.name,
          color: cat.color,
          garageId: cat.garageId,
          type: cat.type,
        }),
      );

      // 4. Exécuter toutes les requêtes en parallèle
      const responses = await Promise.all([
        ...createPromises,
        ...updatePromises,
      ]);

      // 5. Recharger la liste complète après enregistrement
      const res = await axios.get(
        "/categories/garage/" + getCurrentUser().garageId,
      );

      setCategories(res.data.data);
      console.log("✅ Catégories sauvegardées avec succès !");
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde des catégories :", error);
    }
  };

  // Fonction générique pour les champs texte
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGarageInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        "/garages/" + getCurrentUser().garageId,
        {
          name: garageInfo.name,
          website: garageInfo.website,
          phone: garageInfo.phone,
          email: garageInfo.email,
          dayValidityQuote: garageInfo.dayValidityQuote,
          noteLegal: garageInfo.noteLegal,
          logo: imageUrl || garageInfo.logo,
          address: garageInfo.address,
          startHourTimeline: garageInfo.startHourTimeline,
          endHourTimeline: garageInfo.endHourTimeline,
          startMinTimeline: garageInfo.startMinTimeline,
          endMinTimeline: garageInfo.endMinTimeline,
          codePostal: garageInfo.codePostal,
          ville: garageInfo.ville,
        },
      );

      // Tu peux ajouter une notification ici
      console.log("Garage enregistré :", response.data);
      alert("Enregistré avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert("Erreur lors de l'enregistrement !");
    }
  };

  const handleSaveUsers = async () => {
    // 1. Séparer les nouveaux utilisateurs et ceux modifiés
    const newUsers = users.filter((user) => user.isNew);
    const updatedUsers = users.filter((user) => user.isModified);

    if (newUsers.length === 0 && updatedUsers.length === 0) {
      console.log("Aucune modification ou nouvel utilisateur à enregistrer.");
      return;
    }

    try {
      // 2. Création des nouveaux utilisateurs (POST)
      const createPromises = newUsers.map((user) =>
        axios.post("/users", {
          firstName: user.firstName.trim(),
          name: user.name.trim(),
          email: user.email.trim().toLowerCase(),
          level: user.level,
          garageId: getCurrentUser().garageId, // si nécessaire
        }),
      );

      // 3. Mise à jour des utilisateurs existants (PUT)
      const updatePromises = updatedUsers.map((user) =>
        axios.put(`/users/${user.id}`, {
          firstName: user.firstName?.trim(),
          name: user.name?.trim(),
          email: user.email?.trim()?.toLowerCase() || null,
          level: user.level,
        }),
      );

      // 4. Exécuter toutes les requêtes en parallèle
      await Promise.all([...createPromises, ...updatePromises]);

      // 5. Recharger la liste des utilisateurs
      const res = await axios.get(`/users/garage/${getCurrentUser().garageId}`);
      setUsers(res.data.data); // Assure-toi que la structure de retour est bien `data.data`

      console.log("✅ Utilisateurs sauvegardés avec succès !");
    } catch (error) {
      console.error(
        "❌ Erreur lors de la sauvegarde des utilisateurs :",
        error,
      );
    }
  };

  const confirmDeleteUser = (index) => {
    setUserToDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    const index = userToDeleteIndex;
    const user = users[index];

    try {
      if (user.id && !user.isNew) {
        await axios.deleteData(`/users/${user.id}`);
        console.log("✅ Utilisateur supprimé avec succès !");
      }

      const newUsers = [...users];
      newUsers.splice(index, 1);
      setUsers(newUsers);
    } catch (error) {
      console.error(
        "❌ Erreur lors de la suppression de l'utilisateur :",
        error,
      );
      alert("Une erreur est survenue lors de la suppression.");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDeleteIndex(null);
    }
  };

  const [activeSection, setActiveSection] = useState("garage");

  const settingsMenu = [
    { key: "garage", label: "Garage", icon: <BuildIcon /> },
    { key: "documents", label: "Documents", icon: <DescriptionIcon /> },
    { key: "planning", label: "Planning", icon: <ScheduleIcon /> },
    { key: "categories", label: "Catégories", icon: <CategoryIcon /> },
    { key: "users", label: "Utilisateurs", icon: <PeopleIcon /> },
    { key: "account", label: "Mon compte", icon: <PersonIcon /> },
    { key: "forfaits", label: "Forfaits", icon: <Inventory2Icon /> },
  ];

  const renderGarage = () => (
    <>
      <Typography variant="h5" gutterBottom>
        <BuildIcon /> Informations générales du garage
      </Typography>

      {!isAuth && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Seul un administrateur peut modifier ces paramètres
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            name="name"
            label="Nom du garage"
            value={garageInfo.name}
            onChange={handleChange}
          />
          <TextField
            name="website"
            label="Site web"
            value={garageInfo.website}
            onChange={handleChange}
          />
          <TextField
            name="phone"
            label="Téléphone"
            value={garageInfo.phone}
            onChange={handleChange}
          />
          <TextField
            name="email"
            label="Email"
            value={garageInfo.email}
            onChange={handleChange}
          />
          <TextField
            name="address"
            label="Adresse"
            value={garageInfo.address}
            onChange={handleChange}
          />
          <TextField
            name="codePostal"
            label="Code postal"
            value={garageInfo.codePostal}
            onChange={handleChange}
          />
          <TextField
            name="ville"
            label="Ville"
            value={garageInfo.ville}
            onChange={handleChange}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={!isAuth}
          >
            Enregistrer
          </Button>
        </Stack>
      </Paper>
    </>
  );

  const renderDocuments = () => (
    <>
      <Typography variant="h5" gutterBottom>
        <DescriptionIcon /> Paramètres des documents
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            name="dayValidityQuote"
            label="Validité du devis (jours)"
            value={garageInfo.dayValidityQuote}
            onChange={handleChange}
          />
          <TextField
            name="noteLegal"
            label="Note légale"
            multiline
            rows={4}
            value={garageInfo.noteLegal}
            onChange={handleChange}
          />
          <Button variant="contained" onClick={handleSave} disabled={!isAuth}>
            Enregistrer
          </Button>
        </Stack>
      </Paper>
    </>
  );

  const renderPlanning = () => (
    <>
      <Typography variant="h5" gutterBottom>
        <ScheduleIcon /> Planning
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Début (heure)"
              name="startHourTimeline"
              value={garageInfo.startHourTimeline}
              onChange={handleChange}
              fullWidth
            >
              {[...Array(25).keys()].map((h) => (
                <MenuItem key={h} value={h}>
                  {h}h
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Début (minute)"
              name="startMinTimeline"
              value={garageInfo.startMinTimeline}
              onChange={handleChange}
              fullWidth
            >
              {[0, 30].map((m) => (
                <MenuItem key={m} value={m}>
                  {m} min
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Fin (heure)"
              name="endHourTimeline"
              value={garageInfo.endHourTimeline}
              onChange={handleChange}
              fullWidth
            >
              {[...Array(25).keys()].map((h) => (
                <MenuItem key={h} value={h}>
                  {h}h
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Fin (minute)"
              name="endMinTimeline"
              value={garageInfo.endMinTimeline}
              onChange={handleChange}
              fullWidth
            >
              {[0, 30].map((m) => (
                <MenuItem key={m} value={m}>
                  {m} min
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Button variant="contained" onClick={handleSave} disabled={!isAuth}>
            Enregistrer
          </Button>
        </Stack>
      </Paper>
    </>
  );

  const renderCategories = () => (
    <>
      <Typography variant="h5" gutterBottom>
        <CategoryIcon /> Catégories d’ordres de réparation
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          {categories.map((category, index) => {
            const isSystem = category.type === "system";

            return (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{category.name}</Typography>
                  {isSystem && (
                    <Chip label="Système" size="small" sx={{ ml: 1 }} />
                  )}
                </AccordionSummary>

                <AccordionDetails>
                  <Stack spacing={2}>
                    <TextField
                      label="Nom"
                      value={category.name}
                      disabled={isSystem}
                      onChange={(e) =>
                        handleCategoryChange(index, "name", e.target.value)
                      }
                    />
                    <SketchPicker
                      color={category.color}
                      onChangeComplete={(c) =>
                        handleCategoryChange(index, "color", c.hex)
                      }
                    />
                    {!isSystem && (
                      <Button
                        color="error"
                        onClick={() => handleRemoveCategory(index)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}

          <Button onClick={handleAddCategory} disabled={!isAuth}>
            ➕ Ajouter une catégorie
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveCategories}
            disabled={!isAuth}
          >
            Enregistrer
          </Button>
        </Stack>
      </Paper>
    </>
  );

  const renderUsers = () => (
    <>
      <Typography variant="h5" gutterBottom>
        <PeopleIcon /> Gestion des utilisateurs
      </Typography>

      <Paper sx={{ p: 3 }}>
        {users.map((user, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {user.firstName} {user.name}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Stack spacing={2}>
                <TextField label="Nom" value={user.name} />
                <TextField label="Prénom" value={user.firstName} />
                <TextField label="Email" value={user.email} />
                <Button color="error" onClick={() => confirmDeleteUser(index)}>
                  Supprimer
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}

        <Button
          variant="contained"
          onClick={handleSaveUsers}
          disabled={!isAuth}
        >
          Enregistrer
        </Button>
      </Paper>
    </>
  );

  const renderAccount = () => (
    <>
      <Typography variant="h5" gutterBottom>
        <PersonIcon /> Mon compte
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField label="Prénom" value={userSession?.firstName} />
          <TextField label="Nom" value={userSession?.name} />
          <TextField label="Email" value={userSession?.email} />
          <Button variant="contained">Mettre à jour</Button>
        </Stack>
      </Paper>
    </>
  );

  const renderForfaits = () => (
    <>
      <Typography variant="h5" gutterBottom>
        <Inventory2Icon /> Gestion avancée des forfaits
      </Typography>
      <ForfaitsConfigAdvanced />
    </>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "garage":
        return renderGarage();
      case "documents":
        return renderDocuments();
      case "planning":
        return renderPlanning();
      case "categories":
        return renderCategories();
      case "users":
        return renderUsers();
      case "account":
        return renderAccount();
      case "forfaits":
        return renderForfaits();
      default:
        return null;
    }
  };

  return (
    <Box p={4} sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        sx={{
          width: 260,
          p: 2,
        }}
      >
        <Paper elevation={3} sx={{ p: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Paramètres
            </Typography>

            <List>
              {settingsMenu.map((item) => (
                <ListItemButton
                  key={item.key}
                  selected={activeSection === item.key}
                  onClick={() => setActiveSection(item.key)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>

                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>
          </Grid>
        </Paper>
      </Box>

      {/* CONTENT */}
      <Box sx={{ flex: 1, p: 2 }}>{renderSection()}</Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Suppression d'utilisateur</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Es-tu sûr(e) de vouloir supprimer{" "}
            <strong>
              {userToDeleteIndex !== null &&
                `${users[userToDeleteIndex].firstName} ${users[userToDeleteIndex].name}`}
            </strong>{" "}
            ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GarageSettings;
