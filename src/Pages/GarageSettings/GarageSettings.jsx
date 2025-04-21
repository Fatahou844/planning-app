// export default GarageSettings;

import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  CardHeader,
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
import React, { useEffect, useState } from "react";
import { SketchPicker } from "react-color";

const GarageSettings = () => {
  const [garageInfo, setGarageInfo] = useState({
    name: "",
    website: "",
    phone: "",
    email: "",
    address: "",
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
    { name: "Vidange", color: "#1976d2" },
  ]);
  const axios = useAxios();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/categories");

        // Récupérer les données
        const categoriesData = response.data;

        // Extraire les noms des catégories
        const categoryNames = categoriesData.data.map(
          (category) => category.name
        );

        // Mettre à jour les états
        setCategories(categoriesData.data);

        console.log("categoriesData", categoriesData.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setCategories([...categories, { name: "", color: "#000000" }]);
  };

  const handleCategoryChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    setCategories(updated);
  };

  const handleRemoveCategory = (index) => {
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
  };
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

  const handleRemoveUser = (index) => {
    const newUsers = [...users];
    newUsers.splice(index, 1);
    setUsers(newUsers);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom sx={{ px: 3 }}>
        Paramètres du Garage
      </Typography>
      <Grid container spacing={4} sx={{ p: 3 }}>
        {/* Colonne Gauche */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Alert severity="info">Informations générales du garage</Alert>
              <Alert severity="warning">
                Seul l'administrateur peut modifier
              </Alert>

              <TextField label="Nom du garage" fullWidth />
              <TextField label="Site web" fullWidth />
              <TextField label="Téléphone" fullWidth />
              <TextField label="Email" fullWidth />
              <TextField label="Adresse" fullWidth />
              <Button variant="contained" component="label">
                Upload Logo
                <input hidden type="file" />
              </Button>
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

          <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
            <Stack spacing={2}>
              <Alert severity="info">
                Paramètres personnalisés à afficher dans les documents
              </Alert>
              <Alert severity="warning">
                Seul l'administrateur peut modifier
              </Alert>

              <TextField label="Note" fullWidth multiline rows={2} />
              <TextField label="Description" fullWidth multiline rows={4} />
              <Box textAlign="right" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ width: "100%" }}
                >
                  Enregistrer les modifications
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Colonne Droite */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Stack spacing={2}>
              <Alert severity="info">
                Informations de l'utilisateur connecté
              </Alert>
              <TextField label="Prénom" fullWidth />
              <TextField label="Nom" fullWidth />
              <TextField label="Email" fullWidth />
              <TextField label="Mot de passe" type="password" fullWidth />
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

          <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Gestion des catégories d'ordres de réparation
            </Alert>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Seul l'administrateur peut modifier
            </Alert>

            <Stack spacing={2}>
              {categories.map((category, index) => {
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
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
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
                            handleCategoryChange(index, "name", e.target.value)
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
                              handleCategoryChange(index, "color", color.hex)
                            }
                          />
                        </Box>

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

              <Button variant="outlined" onClick={handleAddCategory}>
                Ajouter une catégorie
              </Button>
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

          <Card sx={{ mt: 4, p: 3 }}>
            <CardHeader title="👥 Gestion des utilisateurs" />
            <CardContent>
              <Alert severity="info" sx={{ mb: 2 }}>
                Attribue un rôle à chaque utilisateur pour gérer leurs droits
                d'accès.
              </Alert>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Seul l'administrateur peut modifier
              </Alert>

              <Stack spacing={2}>
                {users.map((user, index) => (
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
                          {user.lastName || "Nouvel utilisateur"}
                        </Typography>
                        <Chip
                          label={
                            user.role === "admin"
                              ? "Administrateur"
                              : user.role === "technicien"
                              ? "Technicien"
                              : "Employé"
                          }
                          color={
                            user.role === "admin"
                              ? "error"
                              : user.role === "technicien"
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
                          label="Nom"
                          value={user.lastName}
                          onChange={(e) =>
                            handleUserChange(index, "lastName", e.target.value)
                          }
                        />
                        <TextField
                          label="Prénom"
                          value={user.firstName}
                          onChange={(e) =>
                            handleUserChange(index, "firstName", e.target.value)
                          }
                        />
                        <TextField
                          label="Email"
                          value={user.email}
                          onChange={(e) =>
                            handleUserChange(index, "email", e.target.value)
                          }
                          fullWidth
                        />
                        <FormControl sx={{ minWidth: 150 }}>
                          <InputLabel>Rôle</InputLabel>
                          <Select
                            value={user.role}
                            label="Rôle"
                            onChange={(e) =>
                              handleUserChange(index, "role", e.target.value)
                            }
                          >
                            <MenuItem value="admin">Administrateur</MenuItem>
                            <MenuItem value="technicien">Technicien</MenuItem>
                            <MenuItem value="employe">Employé</MenuItem>
                          </Select>
                        </FormControl>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveUser(index)}
                          disabled={user.role === "admin"} // Optionnel : empêcher la suppression d'un admin
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}

                <Button variant="outlined" onClick={handleAddUser}>
                  ➕ Ajouter un utilisateur
                </Button>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GarageSettings;
