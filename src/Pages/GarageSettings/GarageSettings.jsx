// export default GarageSettings;

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import LogoutIcon from "@mui/icons-material/Logout"; // Icone de plus pour le bouton flottant
import VerifiedIcon from "@mui/icons-material/Verified";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
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

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    name: "",
    email: "",
    password: "",
  });

  const [garageParams, setGarageParams] = useState({
    note: "",
    description: "",
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
          "/categories/garage/" + getCurrentUser().garageId
        );

        const responseGarage = await axios.get(
          "/garages/userid/" + getCurrentUser().garageId
        );
        if (responseGarage.data) {
          setGarageInfo(responseGarage.data.data);

          setImageProfile(responseGarage.data.data.logo);
        }
        // Récupérer les données
        const categoriesData = response.data;

        const responseGarageUsers = await axios.get(
          "/users/garageId/" + getCurrentUser().garageId
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

  const handleUserChange = (index, field, value) => {
    const newUsers = [...users];
    newUsers[index][field] = value;
    newUsers[index].isModified = true;
    console.log("newUsers[index].isModified = true;", newUsers[index]);
    setUsers(newUsers);
  };

  const handleAddUser = () => {
    setUsers([
      ...users,
      { firstName: "", name: "", email: "", level: "0", isNew: true },
    ]);
  };

  // const handleRemoveUser = async (index) => {
  //   const newUsers = [...users];
  //   newUsers.splice(index, 1);
  //   setUsers(newUsers);
  // };

  const handleRemoveUser = async (index) => {
    const user = users[index];

    const confirmDelete = window.confirm(
      `Es-tu sûr(e) de vouloir supprimer ${user.firstName || ""} ${
        user.name || ""
      } ?`
    );

    if (!confirmDelete) return;

    try {
      // S’il s’agit d’un utilisateur déjà enregistré (ayant un id)
      if (user.id && !user.isNew) {
        await axios.deleteData(`/users/${user.id}`);
        console.log("✅ Utilisateur supprimé avec succès !");
      }

      // Mise à jour locale : suppression de l'élément du tableau
      const newUsers = [...users];
      newUsers.splice(index, 1);
      setUsers(newUsers);
    } catch (error) {
      console.error(
        "❌ Erreur lors de la suppression de l'utilisateur :",
        error
      );
      alert("Une erreur est survenue lors de la suppression.");
    }
  };

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
      (cat) => !cat.isNew && cat.isModified
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
        })
      );

      // 3. Traiter la mise à jour des catégories existantes (PUT)
      const updatePromises = updatedCategories.map((cat) =>
        axios.put(`/categories/${cat.id}`, {
          name: cat.name,
          color: cat.color,
          garageId: cat.garageId,
          type: cat.type,
        })
      );

      // 4. Exécuter toutes les requêtes en parallèle
      const responses = await Promise.all([
        ...createPromises,
        ...updatePromises,
      ]);

      // 5. Recharger la liste complète après enregistrement
      const res = await axios.get(
        "/categories/garage/" + getCurrentUser().garageId
      );

      setCategories(res.data.data);
      console.log("✅ Catégories sauvegardées avec succès !");
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde des catégories :", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewImageUrl = URL.createObjectURL(file);
      setPreviewImage(previewImageUrl);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "VeritaTrust_x2023Upload_preset_name");

      fetch("https://api.cloudinary.com/v1_1/dnbpmsofq/image/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((result) => {
          //.log("Success:", result);
          setImageUrl(result.url);
        })
        .catch((error) => {
          //.error("Error:", error);
        });

      //.log(imageUrl);
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
        }
      );

      // Tu peux ajouter une notification ici
      console.log("Garage enregistré :", response.data);
      alert("Enregistré avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert("Erreur lors de l'enregistrement !");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get("/logout"); // pour envoyer les cookies
      document.cookie =
        "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/"; // redirection après logout
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
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
        })
      );

      // 3. Mise à jour des utilisateurs existants (PUT)
      const updatePromises = updatedUsers.map((user) =>
        axios.put(`/users/${user.id}`, {
          firstName: user.firstName?.trim(),
          name: user.name?.trim(),
          email: user.email?.trim()?.toLowerCase() || null,
          level: user.level,
        })
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
        error
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
        error
      );
      alert("Une erreur est survenue lors de la suppression.");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDeleteIndex(null);
    }
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case "0":
        return (
          <Tooltip title="En attente de vérification email">
            <EmailIcon color="warning" fontSize="small" />
          </Tooltip>
        );
      case "1":
        return (
          <Tooltip title="En attente d’approbation">
            <HourglassEmptyIcon color="info" fontSize="small" />
          </Tooltip>
        );
      case "2":
        return (
          <Tooltip title="Compte validé">
            <VerifiedIcon color="success" fontSize="small" />
          </Tooltip>
        );
      default:
        return null;
    }
  };
  const handleApproveUser = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].status = "2"; // ou appel backend ici
    setUsers(updatedUsers);
    // Envoie au backend si besoin...
  };
  const [statusFilter, setStatusFilter] = useState(""); // "" = pas de filtre

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom sx={{ px: 3 }}>
        Paramètres du Garage
      </Typography>
      {!isAuth && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Certaines blocc, seul l'administrateur peut apporter des modifications
        </Alert>
      )}
      <Grid container spacing={4} sx={{ p: 3 }}>
        {/* Colonne Gauche */}
        <Grid item xs={12} md={6}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                🛠 Informations générales du garage
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <TextField
                    name="name"
                    placeholder="Nom du garage"
                    fullWidth
                    value={garageInfo.name}
                    onChange={handleChange}
                  />
                  <TextField
                    name="website"
                    placeholder="Site web"
                    fullWidth
                    value={garageInfo.website}
                    onChange={handleChange}
                  />
                  <TextField
                    name="phone"
                    placeholder="Téléphone"
                    fullWidth
                    value={garageInfo.phone}
                    onChange={handleChange}
                  />
                  <TextField
                    name="email"
                    fullWidth
                    value={garageInfo.email}
                    onChange={handleChange}
                  />
                  <TextField
                    name="address"
                    placeholder="Adresse locale"
                    fullWidth
                    value={garageInfo.address}
                    onChange={handleChange}
                  />
                  {/* <label htmlFor="code postale">Code postal</label> */}

                  <TextField
                    name="codePostal"
                    placeholder="Code postale"
                    fullWidth
                    value={garageInfo.codePostal}
                    onChange={handleChange}
                  />
                  {/* <label htmlFor="ville">Ville</label> */}
                  <TextField
                    name="ville"
                    placeholder="Ville"
                    fullWidth
                    value={garageInfo.ville}
                    onChange={handleChange}
                  />

                  <div className="col-md-3 mb-3">
                    <div className="userpicture">
                      <img
                        className="user-profil-avatar"
                        src={imageUrl ? imageUrl : imageProfile}
                        alt="user-avatar"
                        style={{ width: "300px" }}
                      />
                      <label className="add-visual" id="userpicture">
                        <input
                          name="userpicture"
                          accept="image/jpeg, image/webp, image/png"
                          type="file"
                          className="d-none"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </Stack>

                <Box textAlign="right" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ width: "100%" }}
                    onClick={handleSave}
                    disabled={!isAuth}
                  >
                    Enregistrer les modifications
                  </Button>
                </Box>
              </Paper>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                🧾 Paramètres personnalisés à afficher dans les documents
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
                <Stack spacing={2}>
                  <TextField
                    name="dayValidityQuote"
                    placeHolder="Validité du devis en jours"
                    fullWidth
                    value={garageInfo.dayValidityQuote}
                    onChange={handleChange}
                  />
                  <TextField
                    placeHolder="Note légale"
                    fullWidth
                    multiline
                    rows={4}
                    name="noteLegal"
                    value={garageInfo.noteLegal}
                    onChange={handleChange}
                  />
                  <Box textAlign="right" mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ width: "100%" }}
                      onClick={handleSave}
                      disabled={!isAuth}
                    >
                      Enregistrer les modifications
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                🕒 Paramètres Timeline pour le planning
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      select
                      name="startHourTimeline"
                      label="Début - Heure"
                      value={garageInfo.startHourTimeline}
                      onChange={handleChange}
                      fullWidth
                    >
                      {[...Array(25).keys()].map((hour) => (
                        <MenuItem key={hour} value={hour}>
                          {hour.toString().padStart(2, "0")} h
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      name="startMinTimeline"
                      label="Début - Minute"
                      value={garageInfo.startMinTimeline}
                      onChange={handleChange}
                      fullWidth
                    >
                      {[0, 30].map((min) => (
                        <MenuItem key={min} value={min}>
                          {min.toString().padStart(2, "0")} min
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <TextField
                      select
                      name="endHourTimeline"
                      label="Fin - Heure"
                      value={garageInfo.endHourTimeline}
                      onChange={handleChange}
                      fullWidth
                    >
                      {[...Array(25).keys()].map((hour) => (
                        <MenuItem key={hour} value={hour}>
                          {hour.toString().padStart(2, "0")} h
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      name="endMinTimeline"
                      label="Fin - Minute"
                      value={garageInfo.endMinTimeline}
                      onChange={handleChange}
                      fullWidth
                    >
                      {[0, 30].map((min) => (
                        <MenuItem key={min} value={min}>
                          {min.toString().padStart(2, "0")} min
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Box textAlign="right">
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ width: "100%" }}
                      onClick={handleSave}
                      disabled={!isAuth}
                    >
                      Enregistrer les horaires
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Colonne Droite */}
        <Grid item xs={12} md={6}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                👤 Informations de l'utilisateur connecté
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Stack spacing={2}>
                  <TextField
                    placeholder="Prénom"
                    fullWidth
                    value={userSession?.firstName}
                  />
                  <TextField
                    placeholder="Nom"
                    fullWidth
                    value={userSession?.name}
                  />
                  <TextField
                    placeholder="Email"
                    fullWidth
                    value={userSession?.email}
                  />
                  <TextField
                    placeholder="Mot de passe"
                    type="password"
                    fullWidth
                    value={userSession?.password}
                  />
                </Stack>
                <Box textAlign="right" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ width: "100%" }}
                  >
                    Enregistrer les modifications
                  </Button>
                </Box>
              </Paper>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                🏷️ Gestion des catégories d'ordres de réparation
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
                <Stack spacing={2}>
                  {categories &&
                    categories.map((category, index) => {
                      const isSystem = category.type === "system";

                      return (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography>
                                  {category.name || "Nouvelle catégorie"}
                                </Typography>
                                {isSystem && (
                                  <Chip
                                    label="Catégorie système"
                                    color="warning"
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Box>
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  backgroundColor: category.color,
                                  border: "1px solid #ccc",
                                }}
                              />
                            </Box>
                          </AccordionSummary>

                          <AccordionDetails>
                            <Stack spacing={2}>
                              <TextField
                                label="Nom de la catégorie"
                                value={category.name}
                                onChange={(e) =>
                                  handleCategoryChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                disabled={isSystem}
                              />

                              <Box
                                sx={{
                                  pointerEvents: isSystem ? "none" : "auto",
                                  opacity: isSystem ? 0.5 : 1,
                                }}
                              >
                                <SketchPicker
                                  color={category.color}
                                  onChangeComplete={(color) =>
                                    handleCategoryChange(
                                      index,
                                      "color",
                                      color.hex
                                    )
                                  }
                                />
                              </Box>

                              {!isSystem && (
                                <Button
                                  color="error"
                                  onClick={() => handleRemoveCategory(index)}
                                  disabled={!isAuth}
                                >
                                  Supprimer
                                </Button>
                              )}
                            </Stack>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}

                  <Button
                    variant="outlined"
                    onClick={handleAddCategory}
                    disabled={!isAuth}
                  >
                    Ajouter une catégorie
                  </Button>
                </Stack>

                <Box textAlign="right" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ width: "100%" }}
                    onClick={handleSaveCategories}
                    disabled={!isAuth}
                  >
                    Enregistrer les modifications
                  </Button>
                </Box>
              </Paper>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">👥 Gestion des utilisateurs"</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Card sx={{ mt: 4, p: 3 }}>
                {/* <CardHeader title="👥 Gestion des utilisateurs" /> */}
                <CardContent>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Attribue un rôle à chaque utilisateur pour gérer leurs
                    droits d'accès. Approuver les nouveaux comptes
                  </Alert>

                  <Stack spacing={2}>
                    <FormControl size="small" sx={{ mb: 2, minWidth: 250 }}>
                      <InputLabel>Filtrer par statut</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Filtrer par statut"
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="">Tous les utilisateurs</MenuItem>
                        <MenuItem value="0">
                          En attente de vérification email
                        </MenuItem>
                        <MenuItem value="1">En attente d’approbation</MenuItem>
                        <MenuItem value="2">Validé</MenuItem>
                      </Select>
                    </FormControl>
                    {users &&
                      users
                        .filter((user) =>
                          statusFilter === ""
                            ? true
                            : user.status === statusFilter
                        )
                        .map((user, index) => (
                          <Accordion key={index}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  gap: 2,
                                }}
                              >
                                <Typography>
                                  {user.firstName}{" "}
                                  {user.name || "Nouvel utilisateur"}
                                </Typography>
                                {/* <Chip
                                label={
                                  user.level === "2"
                                    ? "Administrateur"
                                    : user.role === "1"
                                    ? "Technicien"
                                    : "Employé"
                                }
                                color={
                                  user.role === "2"
                                    ? "error"
                                    : user.role === "1"
                                    ? "primary"
                                    : "default"
                                }
                                size="small"
                              /> */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Chip
                                    label={
                                      user.level === "2"
                                        ? "Administrateur"
                                        : user.level === "1"
                                        ? "Technicien"
                                        : "Employé"
                                    }
                                    color={
                                      user.level === "2"
                                        ? "error"
                                        : user.level === "1"
                                        ? "primary"
                                        : "default"
                                    }
                                    size="small"
                                  />
                                  {renderStatusIcon(user.status)}
                                </Box>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 2,
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  flexDirection: "row",
                                }}
                              >
                                <TextField
                                  placeholder="Nom"
                                  value={user.name}
                                  onChange={(e) =>
                                    handleUserChange(
                                      index,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                />
                                <TextField
                                  label="Prénom"
                                  value={user.firstName}
                                  onChange={(e) =>
                                    handleUserChange(
                                      index,
                                      "firstName",
                                      e.target.value
                                    )
                                  }
                                />
                                <TextField
                                  label="Email"
                                  value={user.email}
                                  onChange={(e) =>
                                    handleUserChange(
                                      index,
                                      "email",
                                      e.target.value
                                    )
                                  }
                                  fullWidth
                                />
                                <FormControl sx={{ minWidth: 150 }}>
                                  <InputLabel>Rôle</InputLabel>
                                  <Select
                                    value={user.level}
                                    label="Rôle"
                                    onChange={(e) =>
                                      handleUserChange(
                                        index,
                                        "level",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <MenuItem value="2">
                                      Administrateur
                                    </MenuItem>
                                    <MenuItem value="1">Technicien</MenuItem>
                                    <MenuItem value="0">Employé</MenuItem>
                                  </Select>
                                </FormControl>
                                {user.status !== "2" && (
                                  <Tooltip title="Valider l'utilisateur">
                                    <IconButton
                                      color="success"
                                      onClick={() => handleApproveUser(index)}
                                      disabled={!isAuth}
                                    >
                                      <CheckCircleIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <IconButton
                                  color="error"
                                  onClick={() => confirmDeleteUser(index)}
                                  disabled={!isAuth}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        ))}

                    <Button
                      variant="outlined"
                      onClick={handleAddUser}
                      disabled={!isAuth}
                    >
                      ➕ Ajouter un utilisateur
                    </Button>
                  </Stack>

                  <Box textAlign="right" mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ width: "100%" }}
                      disabled={!isAuth}
                      onClick={handleSaveUsers}
                    >
                      Enregistrer les modifications
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </AccordionDetails>
          </Accordion>
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
        </Grid>
      </Grid>

      <Grid sx={{ p: 3 }}>
        <ForfaitsConfigAdvanced></ForfaitsConfigAdvanced>
      </Grid>

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
