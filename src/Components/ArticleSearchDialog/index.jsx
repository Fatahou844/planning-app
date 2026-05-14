import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popover,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { BASE_URL_API } from "../../config";

const API_BASE    = BASE_URL_API + "/v1";
const STOCK_BASE  = API_BASE + "/stock";

const TYPES = ["Pneus", "Pièces", "Accessoires", "Consommable"];

const ROW_LABEL_WIDTH = 160;

/* ─────────────────────────────────────────────────────────
   SelectWithSearch — dropdown avec recherche intégrée
   Clic sur le champ → Popover avec filtre + liste
───────────────────────────────────────────────────────── */
const PAGE = 100;

function SelectWithSearch({ label, resource, value, onChange }) {
  const anchorRef                    = useRef(null);
  const searchRef                    = useRef(null);
  const [open,         setOpen]      = useState(false);
  const [query,        setQuery]     = useState("");
  const [items,        setItems]     = useState([]);
  const [loading,      setLoading]   = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE);

  useEffect(() => {
    fetch(`${STOCK_BASE}/${resource}?limit=500`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data
          : Array.isArray(data?.data)  ? data.data
          : [];
        setItems(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [resource]);

  const filtered = items.filter(item =>
    (item.nom || item.name || "").toLowerCase().includes(query.toLowerCase())
  );

  const handleOpen = () => {
    setOpen(true);
    setVisibleCount(PAGE);
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const handleSelect = (item) => {
    onChange(item);
    setOpen(false);
    setQuery("");
    setVisibleCount(PAGE);
  };

  const displayLabel = value ? (value.nom || value.name) : "Tous";

  return (
    <Box>
      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
        {label}
      </Typography>

      {/* Champ déclencheur */}
      <Button
        ref={anchorRef}
        fullWidth
        variant="outlined"
        onClick={handleOpen}
        endIcon={<ArrowDropDownIcon />}
        sx={{
          justifyContent: "space-between",
          textTransform: "none",
          fontWeight: value ? 600 : 400,
          color: value ? "text.primary" : "text.secondary",
          borderColor: open ? "primary.main" : "divider",
          bgcolor: "background.paper",
          px: 1.5,
          "&:hover": { borderColor: "primary.main" },
        }}
      >
        <Typography variant="body2" noWrap sx={{ flex: 1, textAlign: "left" }}>
          {displayLabel}
        </Typography>
      </Button>

      {/* Popover liste */}
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => { setOpen(false); setQuery(""); }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top",    horizontal: "left" }}
        PaperProps={{
          sx: {
            width: anchorRef.current?.offsetWidth ?? 240,
            mt: 0.5,
            boxShadow: 4,
            borderRadius: 1.5,
            overflow: "hidden",
          },
        }}
      >
        {/* Barre de recherche */}
        <Box sx={{ p: 1, borderBottom: "1px solid", borderColor: "divider" }}>
          <TextField
            inputRef={searchRef}
            size="small"
            fullWidth
            placeholder="Rechercher…"
            value={query}
            onChange={e => { setQuery(e.target.value); setVisibleCount(PAGE); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Liste */}
        <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={20} />
            </Box>
          ) : (
            <List dense disablePadding>
              {/* Option Tous */}
              <ListItemButton
                selected={!value}
                onClick={() => handleSelect(null)}
                sx={{ py: 0.6, px: 1.5 }}
              >
                <ListItemText
                  primary="Tous"
                  primaryTypographyProps={{ variant: "body2", fontStyle: "italic", color: "text.secondary" }}
                />
                {!value && <CheckIcon sx={{ fontSize: 15, color: "primary.main" }} />}
              </ListItemButton>
              <Divider />

              {filtered.length === 0 ? (
                <Box px={2} py={1.5}>
                  <Typography variant="caption" color="text.disabled">Aucun résultat</Typography>
                </Box>
              ) : (
                <>
                  {filtered.slice(0, visibleCount).map(item => (
                    <ListItemButton
                      key={item.id}
                      selected={value?.id === item.id}
                      onClick={() => handleSelect(item)}
                      sx={{ py: 0.6, px: 1.5 }}
                    >
                      <ListItemText
                        primary={item.nom || item.name}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                      {value?.id === item.id && (
                        <CheckIcon sx={{ fontSize: 15, color: "primary.main" }} />
                      )}
                    </ListItemButton>
                  ))}
                  {filtered.length > visibleCount && (
                    <Box
                      onClick={() => setVisibleCount(c => c + PAGE)}
                      sx={{
                        py: 1, textAlign: "center", cursor: "pointer",
                        borderTop: "1px solid", borderColor: "divider",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <Typography variant="caption" color="primary.main" fontWeight={600}>
                        Afficher plus ({filtered.length - visibleCount} restants)
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </List>
          )}
        </Box>
      </Popover>
    </Box>
  );
}

function SearchRow({ label, children }) {
  return (
    <Box display="flex" alignItems="center" gap={2} mb={1.5}>
      <Typography
        variant="body2"
        sx={{
          minWidth: ROW_LABEL_WIDTH,
          fontWeight: 500,
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      <Box flex={1}>{children}</Box>
    </Box>
  );
}

export default function ArticleSearchDialog({ open, onClose, onResults }) {
  const theme = useTheme();
  const [filters, setFilters] = useState({
    reference: "",
    types: [],
    motsCles: ["", "", ""],
    marque: null,
    famille: null,
    groupe: null,
    emplacement: null,
    fournisseur: null,
  });
  const [loading, setLoading] = useState(false);

  const setField = (field) => (value) =>
    setFilters((f) => ({ ...f, [field]: value }));

  const updateMotCle = (i, val) =>
    setFilters((f) => {
      const motsCles = [...f.motsCles];
      motsCles[i] = val;
      return { ...f, motsCles };
    });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.reference) params.set("reference", filters.reference);
      if (filters.types.length) params.set("types", filters.types.join(","));
      filters.motsCles.forEach((m) => m && params.append("motsCles", m));
      if (filters.marque?.id) params.set("marqueId", filters.marque.id);
      if (filters.famille?.id) params.set("familleId", filters.famille.id);
      if (filters.groupe?.id) params.set("groupeId", filters.groupe.id);
      if (filters.emplacement?.id)
        params.set("emplacementId", filters.emplacement.id);
      if (filters.fournisseur?.id)
        params.set("fournisseurId", filters.fournisseur.id);

      const res = await fetch(`${API_BASE}/stock/articles/search?${params}`);
      const data = await res.json();
      onResults(data);
      onClose();
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () =>
    setFilters({
      reference: "",
      types: [],
      motsCles: ["", "", ""],
      marque: null,
      famille: null,
      groupe: null,
      emplacement: null,
      fournisseur: null,
    });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "background.default",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1.5,
          px: 2.5,
        }}
      >
        <SearchIcon sx={{ fontSize: 18, color: "primary.main" }} />
        <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
          Recherche d'une fiche article
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1, px: 3, mt: 2 }}>
        {/* Référence */}
        <SearchRow label="Référence / code barre">
          <TextField
            size="small"
            fullWidth
            value={filters.reference}
            onChange={(e) => setField("reference")(e.target.value)}
          />
        </SearchRow>

        <Divider sx={{ my: 2 }} />

        {/* Type */}
        <SearchRow label="Type">
          <ToggleButtonGroup
            value={filters.types}
            onChange={(e, val) => setField("types")(val)}
            size="small"
            sx={{ flexWrap: "wrap", gap: 0.5 }}
          >
            {TYPES.map((t) => (
              <ToggleButton
                key={t}
                value={t}
                sx={{
                  px: 2,
                  textTransform: "none",
                  fontSize: 13,
                  borderRadius: "8px !important",
                  border: `1px solid ${theme.palette.divider} !important`,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                }}
              >
                {t}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </SearchRow>

        <Divider sx={{ my: 2 }} />

        {/* Mots clés */}
        <SearchRow label="Mots clés (filtre)">
          <Box display="flex" alignItems="center" gap={1}>
            {[0, 1, 2].map((i) => (
              <React.Fragment key={i}>
                <TextField
                  size="small"
                  value={filters.motsCles[i]}
                  onChange={(e) => updateMotCle(i, e.target.value)}
                  sx={{ width: 150 }}
                />
                {i < 2 && (
                  <Typography variant="body2" color="text.secondary">
                    et
                  </Typography>
                )}
              </React.Fragment>
            ))}
          </Box>
        </SearchRow>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          {[
            { label: "Marque",          field: "marque",      resource: "marques" },
            { label: "Fournisseur",     field: "fournisseur", resource: "fournisseurs" },
            { label: "Groupe articles", field: "groupe",      resource: "groupes" },
            { label: "Famille articles",field: "famille",     resource: "familles" },
            { label: "Emplacement",     field: "emplacement", resource: "emplacements" },
          ].map(({ label, field, resource }) => (
            <Grid item xs={12} sm={6} key={field}>
              <SelectWithSearch
                label={label}
                resource={resource}
                value={filters[field]}
                onChange={setField(field)}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: "background.default",
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 1,
        }}
      >
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Quitter
        </Button>
        <Box flex={1} display="flex" justifyContent="center">
          <IconButton onClick={handleReset} title="Réinitialiser" color="error">
            <HelpOutlineIcon />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={14} color="inherit" /> : null
          }
        >
          Rechercher
        </Button>
      </DialogActions>
    </Dialog>
  );
}
