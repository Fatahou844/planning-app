import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAxios } from "../../utils/hook/useAxios";

export default function ForfaitsConfigAdvanced({ garageId }) {
  const [codesPrincipaux, setCodesPrincipaux] = useState([]);
  const [categories, setCategories] = useState([]);
  const [forfaits, setForfaits] = useState([]);
  const [expandedCats, setExpandedCats] = useState({});

  const [newCategory, setNewCategory] = useState({
    name: "",
    code2: "",
    code_principalId: "",
  });
  const [newForfait, setNewForfait] = useState({
    libelle: "",
    code3: "",
    prix: "",
    temps: "",
    categoryForfaitId: "",
  });

  // --- EDIT MODAL ---
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editForfait, setEditForfait] = useState(null);

  // --- FILTER / SEARCH ---
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchText, setSearchText] = useState("");

  const axios = useAxios();

  useEffect(() => {
    loadCodesPrincipaux();
    loadCategories();
    loadForfaits();
  }, []);

  const loadCodesPrincipaux = async () => {
    const response = await axios.get("/codes-principaux");
    setCodesPrincipaux(response.data.data);
  };

  const loadCategories = async () => {
    const response = await axios.get(`/category-forfaits?garageId=${garageId}`);
    setCategories(response.data.data);
  };

  const loadForfaits = async () => {
    const response = await axios.get(`/forfaits?garageId=${garageId}`);
    setForfaits(response.data.data);
  };

  /* ---------------- CREATE CATEGORY ---------------- */
  const handleCreateCategory = async () => {
    if (!newCategory.name || !newCategory.code_principalId) return;
    await axios.post("/category-forfaits", {
      ...newCategory,
      garageId: garageId,
    });
    setNewCategory({ name: "", code2: "", code_principalId: "" });
    loadCategories();
  };

  /* ---------------- CREATE FORFAIT ---------------- */
  const handleCreateForfait = async () => {
    const { libelle, categoryForfaitId } = newForfait;
    if (!libelle || !categoryForfaitId) return;
    await axios.post("/forfaits", newForfait);
    setNewForfait({
      libelle: "",
      code3: "",
      prix: "",
      temps: "",
      categoryForfaitId: "",
    });
    loadForfaits();
  };

  /* ---------------- DELETE FORFAIT ---------------- */
  const handleDeleteForfait = async (id) => {
    if (!window.confirm("Supprimer ce forfait ?")) return;
    await axios.deleteData(`/forfaits/${id}`);
    loadForfaits();
  };

  /* ---------------- EDIT FORFAIT ---------------- */
  const handleOpenEditModal = (forfait) => {
    setEditForfait({ ...forfait });
    setOpenEditModal(true);
  };

  const handleEditChange = (field, value) => {
    setEditForfait({ ...editForfait, [field]: value });
  };

  const handleSaveEdit = async () => {
    await axios.put(`/forfaits/${editForfait.id}`, editForfait);
    setOpenEditModal(false);
    setEditForfait(null);
    loadForfaits();
  };

  /* ---------------- FILTERED FORFAITS ---------------- */
  let filteredForfaits = forfaits
    .filter((f) =>
      categoryFilter ? f.categoryForfaitId === categoryFilter : true,
    )
    .filter((f) => f.libelle.toLowerCase().includes(searchText.toLowerCase()));

  const normalizedSearch = searchText.trim().toLowerCase();

  // Forfaits filtrés (catégorie + recherche)
  filteredForfaits = useMemo(() => {
    return forfaits
      .filter((f) =>
        categoryFilter ? f.categoryForfaitId === categoryFilter : true,
      )
      .filter((f) => f.libelle.toLowerCase().includes(normalizedSearch));
  }, [forfaits, categoryFilter, normalizedSearch]);

  // Map: categoryId => forfaits correspondants
  const forfaitsByCategory = useMemo(() => {
    const map = new Map();
    for (const f of filteredForfaits) {
      const key = f.categoryForfaitId;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(f);
    }
    return map;
  }, [filteredForfaits]);

  // Catégories à afficher:
  // - si searchText non vide -> uniquement celles qui ont des résultats
  // - sinon -> toutes (ou celles du filtre si tu veux, mais ici c’est déjà géré via filteredForfaits)
  // const visibleCategories = useMemo(() => {
  //   if (normalizedSearch) {
  //     return categories.filter(
  //       (cat) => (forfaitsByCategory.get(cat.id) || []).length > 0
  //     );
  //   }
  //   return categories;
  // }, [categories, normalizedSearch, forfaitsByCategory]);

  const visibleCategories = useMemo(() => {
    // 1) Si une catégorie est choisie -> n’afficher QUE celle-là
    if (categoryFilter) {
      return categories.filter((cat) => cat.id === categoryFilter);
    }

    // 2) Sinon, si recherche -> n’afficher que les catégories qui ont des résultats
    if (normalizedSearch) {
      return categories.filter(
        (cat) => (forfaitsByCategory.get(cat.id) || []).length > 0,
      );
    }

    // 3) Sinon -> toutes les catégories
    return categories;
  }, [categories, categoryFilter, normalizedSearch, forfaitsByCategory]);

  useEffect(() => {
    if (!categoryFilter) return;
    setExpandedCats({ [categoryFilter]: true });
  }, [categoryFilter]);

  useEffect(() => {
    if (!normalizedSearch) return;

    const next = {};
    for (const cat of visibleCategories) {
      next[cat.id] = true; // ouvre toutes les catégories visibles (donc matchées)
    }
    setExpandedCats(next);
  }, [normalizedSearch, visibleCategories]);

  useEffect(() => {
    if (!categoryFilter || normalizedSearch) return;
    setExpandedCats({ [categoryFilter]: true });
  }, [categoryFilter, normalizedSearch]);
  useEffect(() => {
    if (!normalizedSearch) {
      // Quand le champ de recherche est vidé → on ferme tout
      setExpandedCats({});
    }
  }, [normalizedSearch]);

  return (
    <Grid item xs={12} md={6}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* -------- CREATE CATEGORY -------- */}
        <Grid container spacing={4}>
          {/* -------- CREATE CATEGORY -------- */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              ➕ Ajouter une catégorie
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Nom de la catégorie"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                fullWidth
              />

              <TextField
                select
                label="Code principal"
                fullWidth
                value={newCategory.code_principalId}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    code_principalId: e.target.value,
                  })
                }
              >
                {codesPrincipaux.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.code1} – {c.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Code 2 (optionnel)"
                value={newCategory.code2}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, code2: e.target.value })
                }
                fullWidth
              />

              <Button variant="contained" onClick={handleCreateCategory}>
                Ajouter la catégorie
              </Button>
            </Stack>
          </Grid>

          {/* -------- CREATE FORFAIT -------- */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              ➕ Ajouter un forfait
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Libellé"
                fullWidth
                value={newForfait.libelle}
                onChange={(e) =>
                  setNewForfait({ ...newForfait, libelle: e.target.value })
                }
              />

              <TextField
                label="Code 3 (optionnel)"
                fullWidth
                value={newForfait.code3}
                onChange={(e) =>
                  setNewForfait({ ...newForfait, code3: e.target.value })
                }
              />

              <TextField
                label="Prix (€)"
                fullWidth
                type="number"
                value={newForfait.prix}
                onChange={(e) =>
                  setNewForfait({ ...newForfait, prix: e.target.value })
                }
              />

              <TextField
                label="Temps (heures)"
                fullWidth
                type="number"
                value={newForfait.temps}
                onChange={(e) =>
                  setNewForfait({ ...newForfait, temps: e.target.value })
                }
              />

              <TextField
                select
                label="Catégorie"
                fullWidth
                value={newForfait.categoryForfaitId}
                onChange={(e) =>
                  setNewForfait({
                    ...newForfait,
                    categoryForfaitId: e.target.value,
                  })
                }
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>

              <Button variant="contained" onClick={handleCreateForfait}>
                Ajouter le forfait
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* -------- FILTER & SEARCH -------- */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            select
            label="Filtrer par catégorie"
            fullWidth
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">Toutes les catégories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Rechercher un forfait"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Stack>

        {/* -------- LIST FORFAITS -------- */}
        {visibleCategories.map((cat) => {
          const catForfaits = forfaitsByCategory.get(cat.id) || [];

          // Option: si searchText est vide, on laisse l’utilisateur contrôler.
          // Si searchText non vide, on force l’ouverture (via expandedCats).
          const isExpanded = normalizedSearch
            ? !!expandedCats[cat.id]
            : !!expandedCats[cat.id];

          return (
            <Accordion
              key={cat.id}
              expanded={isExpanded}
              onChange={(_, expanded) => {
                // Si search en cours, tu peux choisir:
                // - soit permettre le toggle quand même
                // - soit bloquer l’ouverture/fermeture (ici on autorise)
                setExpandedCats((prev) => ({
                  ...prev,
                  [cat.id]: expanded,
                }));
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  {cat.code2} {"- "}
                  {cat.name}
                  {normalizedSearch && (
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ ml: 1, opacity: 0.7 }}
                    >
                      ({catForfaits.length})
                    </Typography>
                  )}
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={1}>
                  {catForfaits.map((f) => (
                    <Paper
                      key={f.id}
                      sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography>
                          {f.code3} {" - "}
                          {f.libelle}
                        </Typography>
                        <Typography variant="caption">
                          {f.prix}€ • {f.temps}h
                        </Typography>
                      </Box>

                      <Box>
                        <IconButton onClick={() => handleOpenEditModal(f)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteForfait(f.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Paper>

      {/* -------- EDIT MODAL -------- */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <DialogTitle>Modifier le forfait</DialogTitle>
        <DialogContent>
          {editForfait && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Libellé"
                fullWidth
                value={editForfait.libelle}
                onChange={(e) => handleEditChange("libelle", e.target.value)}
              />
              <TextField
                label="Code 3"
                fullWidth
                value={editForfait.code3}
                onChange={(e) => handleEditChange("code3", e.target.value)}
              />
              <TextField
                label="Prix (€)"
                fullWidth
                type="number"
                value={editForfait.prix}
                onChange={(e) => handleEditChange("prix", e.target.value)}
              />
              <TextField
                label="Temps (heures)"
                fullWidth
                type="number"
                value={editForfait.temps}
                onChange={(e) => handleEditChange("temps", e.target.value)}
              />
              <TextField
                select
                label="Catégorie"
                fullWidth
                value={editForfait.categoryForfaitId}
                onChange={(e) =>
                  handleEditChange("categoryForfaitId", e.target.value)
                }
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
