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
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { BASE_URL_API } from "../../config";
import { ApiAutocompleteField } from "../ReferenceArticleModal";

const API_BASE = BASE_URL_API + "/v1";

const TYPES = ["Pneus", "Pièces", "Accessoires", "Consommable atelier"];

const ROW_LABEL_WIDTH = 160;

function SearchRow({ label, children }) {
  return (
    <Box display="flex" alignItems="center" gap={2} mb={1.5}>
      <Typography
        variant="body2"
        sx={{ minWidth: ROW_LABEL_WIDTH, fontWeight: 500, color: "#444" }}
      >
        {label}
      </Typography>
      <Box flex={1}>{children}</Box>
    </Box>
  );
}

export default function ArticleSearchDialog({ open, onClose, onResults }) {
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
      onResults(data); // passe les résultats au parent
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
          bgcolor: "#e8e8e8",
          borderBottom: "1px solid #ccc",
          py: 1.2,
          px: 2,
        }}
      >
        <SearchIcon sx={{ fontSize: 18, color: "#555" }} />
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
                  borderRadius: "4px !important",
                  border: "1px solid #bbb !important",
                  "&.Mui-selected": {
                    bgcolor: "#1565c0",
                    color: "#fff",
                    "&:hover": { bgcolor: "#0d47a1" },
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

        {/* Champs avec autocomplete */}
        {[
          { label: "Marque", field: "marque", resource: "marques" },
          { label: "Famille articles", field: "famille", resource: "familles" },
          { label: "Groupe articles", field: "groupe", resource: "groupes" },
          {
            label: "Emplacement",
            field: "emplacement",
            resource: "emplacements",
          },
          {
            label: "Fournisseur",
            field: "fournisseur",
            resource: "fournisseurs",
          },
        ].map(({ label, field, resource }) => (
          <SearchRow key={field} label={label}>
            <ApiAutocompleteField
              resource={resource}
              value={filters[field]}
              onChange={setField(field)}
              readOnly // pas de bouton "Ajouter" en mode recherche
            />
          </SearchRow>
        ))}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 1.5, bgcolor: "#f5f5f5", gap: 1 }}>
        <Button
          variant="contained"
          color="inherit"
          onClick={onClose}
          sx={{ bgcolor: "#9e9e9e", color: "#fff" }}
        >
          Quitter
        </Button>
        <Box flex={1} display="flex" justifyContent="center">
          <IconButton onClick={handleReset} title="Réinitialiser">
            <HelpOutlineIcon sx={{ color: "#e53935" }} />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={14} color="inherit" /> : null
          }
          sx={{ bgcolor: "#78909c", "&:hover": { bgcolor: "#546e7a" } }}
        >
          Rechercher
        </Button>
      </DialogActions>
    </Dialog>
  );
}
