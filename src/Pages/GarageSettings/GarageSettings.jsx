// export default GarageSettings;

import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout"; // Icone de plus pour le bouton flottant
import Chip from "@mui/material/Chip";
import { useAxios } from "../../utils/hook/useAxios";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { SketchPicker } from "react-color";

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
  });

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
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
          "/garages/" + getCurrentUser().garageId
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
    { firstName: "", lastName: "", email: "", role: "employe" },
  ]);

  const handleUserChange = (index, field, value) => {
    const newUsers = [...users];
    newUsers[index][field] = value;
    setUsers(newUsers);
  };

  const handleAddUser = () => {
    setUsers([
      ...users,
      { firstName: "", lastName: "", email: "", role: "employe" },
    ]);
  };

  const handleRemoveUser = async (index) => {
    const newUsers = [...users];
    newUsers.splice(index, 1);
    setUsers(newUsers);
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
          <Accordion defaultExpanded>
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
                    fullWidth
                    value={garageInfo.address}
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

          <Accordion defaultExpanded>
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
        </Grid>

        {/* Colonne Droite */}
        <Grid item xs={12} md={6}>
          <Accordion defaultExpanded>
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

          <Accordion defaultExpanded>
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

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">👥 Gestion des utilisateurs"</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Card sx={{ mt: 4, p: 3 }}>
                {/* <CardHeader title="👥 Gestion des utilisateurs" /> */}
                <CardContent>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Attribue un rôle à chaque utilisateur pour gérer leurs
                    droits d'accès.
                  </Alert>

                  <Stack spacing={2}>
                    {garageUsers &&
                      garageUsers.map((user, index) => (
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
                              <Chip
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
                              />
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
                                  <MenuItem value="2">Administrateur</MenuItem>
                                  <MenuItem value="1">Technicien</MenuItem>
                                  <MenuItem value="0">Employé</MenuItem>
                                </Select>
                              </FormControl>
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveUser(index)}
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
    </Box>
  );
};

export default GarageSettings;
