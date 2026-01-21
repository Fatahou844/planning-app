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
import { useEffect, useMemo, useRef, useState } from "react";

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

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editForfait, setEditForfait] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchText, setSearchText] = useState("");

  const axios = useAxios();

  // Refs pour scroller vers les formulaires
  const categoryFormRef = useRef(null);
  const forfaitFormRef = useRef(null);

  useEffect(() => {
    loadCodesPrincipaux();
    loadCategories();
    loadForfaits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCodesPrincipaux = async () => {
    try {
      const response = await axios.get("/codes-principaux");
      setCodesPrincipaux(
        Array.isArray(response?.data?.data) ? response.data.data : [],
      );
    } catch {
      setCodesPrincipaux([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get(
        `/category-forfaits/garageId/${garageId}`,
      );
      setCategories(Array.isArray(response?.data) ? response.data : []);
      console.log("RAW categories response:", response.data);
    } catch {
      setCategories([]);
    }
  };

  const loadForfaits = async () => {
    try {
      const response = await axios.get(`/forfaits/garageId/${garageId}`);
      setForfaits(Array.isArray(response?.data) ? response.data : []);
    } catch {
      setForfaits([]);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name || !newCategory.code_principalId) return;
    await axios.post("/category-forfaits", { ...newCategory, garageId });
    setNewCategory({ name: "", code2: "", code_principalId: "" });
    loadCategories();
  };

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

  const handleDeleteForfait = async (id) => {
    if (!window.confirm("Supprimer ce forfait ?")) return;
    await axios.deleteData(`/forfaits/${id}`);
    loadForfaits();
  };

  const handleOpenEditModal = (forfait) => {
    setEditForfait({ ...forfait });
    setOpenEditModal(true);
  };

  const handleEditChange = (field, value) => {
    setEditForfait((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    await axios.put(`/forfaits/${editForfait.id}`, editForfait);
    setOpenEditModal(false);
    setEditForfait(null);
    loadForfaits();
  };

  // --- Safe arrays (évite bugs map/filter)
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeForfaits = Array.isArray(forfaits) ? forfaits : [];
  const safeCodesPrincipaux = Array.isArray(codesPrincipaux)
    ? codesPrincipaux
    : [];

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredForfaits = useMemo(() => {
    return safeForfaits
      .filter((f) =>
        categoryFilter ? f.categoryForfaitId === categoryFilter : true,
      )
      .filter((f) =>
        (f?.libelle || "").toLowerCase().includes(normalizedSearch),
      );
  }, [safeForfaits, categoryFilter, normalizedSearch]);

  const forfaitsByCategory = useMemo(() => {
    const map = new Map();
    for (const f of filteredForfaits) {
      const key = f.categoryForfaitId;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(f);
    }
    return map;
  }, [filteredForfaits]);

  const visibleCategories = useMemo(() => {
    if (categoryFilter) {
      return safeCategories.filter((cat) => cat.id === categoryFilter);
    }
    if (normalizedSearch) {
      return safeCategories.filter(
        (cat) => (forfaitsByCategory.get(cat.id) || []).length > 0,
      );
    }
    return safeCategories;
  }, [safeCategories, categoryFilter, normalizedSearch, forfaitsByCategory]);

  useEffect(() => {
    if (!categoryFilter) return;
    setExpandedCats({ [categoryFilter]: true });
  }, [categoryFilter]);

  useEffect(() => {
    if (!normalizedSearch) return;
    const next = {};
    for (const cat of visibleCategories) next[cat.id] = true;
    setExpandedCats(next);
  }, [normalizedSearch, visibleCategories]);

  useEffect(() => {
    if (!normalizedSearch) setExpandedCats({});
  }, [normalizedSearch]);

  // --- États “empty” pour afficher des messages propres
  const hasCategories = safeCategories.length > 0;
  const hasForfaits = safeForfaits.length > 0;
  const hasFilteredResults = filteredForfaits.length > 0;
  const isFiltering = Boolean(categoryFilter) || Boolean(normalizedSearch);

  const scrollToRef = (ref) => {
    if (!ref?.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setCategoryFilter("");
    setSearchText("");
    setExpandedCats({});
  };

  return (
    <Grid item xs={12} md={6}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* -------- EMPTY STATES (GLOBAL) -------- */}
        {!hasCategories && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => scrollToRef(categoryFormRef)}
              >
                Créer une catégorie
              </Button>
            }
          >
            Aucune catégorie de forfait n’a été créée pour l’instant.
          </Alert>
        )}

        {hasCategories && !hasForfaits && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => scrollToRef(forfaitFormRef)}
              >
                Créer un forfait
              </Button>
            }
          >
            Des catégories existent, mais aucun forfait n’a encore été ajouté.
          </Alert>
        )}

        {hasCategories && hasForfaits && isFiltering && !hasFilteredResults && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={resetFilters}>
                Réinitialiser
              </Button>
            }
          >
            Aucun forfait ne correspond au filtre / à la recherche.
          </Alert>
        )}

        {/* -------- CREATE CATEGORY -------- */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} ref={categoryFormRef}>
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
                {safeCodesPrincipaux.map((c) => (
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
          <Grid item xs={12} md={6} ref={forfaitFormRef}>
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
                disabled={!hasCategories}
                helperText={
                  !hasCategories ? "Créez d’abord une catégorie." : ""
                }
              >
                {safeCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="contained"
                onClick={handleCreateForfait}
                disabled={!hasCategories}
              >
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
            disabled={!hasCategories}
            helperText={!hasCategories ? "Aucune catégorie disponible." : ""}
          >
            <MenuItem value="">Toutes les catégories</MenuItem>
            {safeCategories.map((cat) => (
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
            disabled={!hasForfaits}
            helperText={!hasForfaits ? "Aucun forfait à rechercher." : ""}
          />
        </Stack>

        {/* -------- LIST FORFAITS -------- */}
        {visibleCategories.map((cat) => {
          const catForfaits = forfaitsByCategory.get(cat.id) || [];
          const isExpanded = !!expandedCats[cat.id];

          return (
            <Accordion
              key={cat.id}
              expanded={isExpanded}
              onChange={(_, expanded) => {
                setExpandedCats((prev) => ({ ...prev, [cat.id]: expanded }));
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  {cat.code2} {"- "} {cat.name}
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
                {catForfaits.length === 0 ? (
                  <Alert
                    severity="info"
                    sx={{ mb: 1 }}
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => {
                          scrollToRef(forfaitFormRef);
                          setNewForfait((prev) => ({
                            ...prev,
                            categoryForfaitId: cat.id,
                          }));
                        }}
                      >
                        Ajouter un forfait ici
                      </Button>
                    }
                  >
                    Aucun forfait dans cette catégorie.
                  </Alert>
                ) : (
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
                            {f.code3} {" - "} {f.libelle}
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
                )}
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
                {safeCategories.map((cat) => (
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
