import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { BASE_URL_API } from "../../config";

const API_BASE = `${BASE_URL_API}/v1`;

/* ── helpers ─────────────────────────────────────────────────────────── */

function fmt(val, suffix = "") {
  if (val == null || val === "") return "—";
  const n = parseFloat(val);
  return isNaN(n) ? String(val) : `${n.toFixed(2)}${suffix}`;
}

/* ── sub-components ──────────────────────────────────────────────────── */

function Panel({ title, icon, children }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        mb: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.75,
          bgcolor: alpha(theme.palette.primary.main, 0.07),
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            color: "primary.main",
            flex: 1,
          }}
        >
          {title}
        </Typography>
        {icon}
      </Box>
      <Box sx={{ px: 2, py: 1.5 }}>{children}</Box>
    </Box>
  );
}

function Row({ label, value, mono, highlight }) {
  return (
    <Box display="flex" alignItems="baseline" gap={1} mb={0.6} sx={{ minHeight: 22 }}>
      <Typography
        variant="caption"
        sx={{ minWidth: 140, color: "text.secondary", fontWeight: 500, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontFamily: mono ? "monospace" : "inherit",
          fontWeight: highlight ? 700 : 400,
          color: highlight ? "primary.main" : "text.primary",
          fontSize: highlight ? "0.95rem" : undefined,
        }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

function HistoryTable({ columns }) {
  const theme = useTheme();
  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden", mt: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "background.default" }}>
            {columns.map((col) => (
              <TableCell
                key={col}
                sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary", py: 0.75, borderBottom: `1px solid ${theme.palette.divider}` }}
              >
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns.length} align="center" sx={{ py: 1.5, color: "text.disabled", fontSize: 12 }}>
              Aucun historique
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}

/** Inline add-ref row: text field + add button */
function AddRefRow({ placeholder, onAdd, loading }) {
  const [val, setVal] = useState("");

  const handleAdd = async () => {
    const trimmed = val.trim();
    if (!trimmed) return;
    await onAdd(trimmed);
    setVal("");
  };

  return (
    <Box display="flex" alignItems="center" gap={1} mt={1}>
      <TextField
        size="small"
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        sx={{ flex: 1 }}
        InputProps={{
          sx: { fontSize: 13 },
          endAdornment: loading ? (
            <InputAdornment position="end">
              <CircularProgress size={14} />
            </InputAdornment>
          ) : null,
        }}
      />
      <Button
        size="small"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        disabled={!val.trim() || loading}
        sx={{ textTransform: "none", whiteSpace: "nowrap" }}
      >
        Ajouter
      </Button>
    </Box>
  );
}

/* ── main component ──────────────────────────────────────────────────── */

export default function ArticleDetailDialog({ open, onClose, article, onBack, showBack }) {
  const [oems, setOems] = useState(null);          // null = use article prop
  const [refs, setRefs] = useState([]);             // refs équivalentes (local state)
  const [addingOem, setAddingOem] = useState(false);
  const [addingRef, setAddingRef] = useState(false);
  const [oemError, setOemError] = useState(null);
  const [refError, setRefError] = useState(null);

  if (!article) return null;

  const pricing = article.ArticlePricing || {};
  const pneuSpec = article.PneuSpec || null;
  const displayOems = oems ?? article.ArticleOEMs ?? [];

  const caracPneu = pneuSpec
    ? [pneuSpec.largeur, pneuSpec.hauteur, pneuSpec.diametre, pneuSpec.charge, pneuSpec.vitesse]
        .filter(Boolean)
        .join(" / ")
    : null;

  /* ── handlers ──────────────────────────────────────────────────────── */

  const handleAddOem = async (reference) => {
    setAddingOem(true);
    setOemError(null);
    try {
      const res = await fetch(`${API_BASE}/stock/articles/${article.id}/oems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setOems([...displayOems, created]);
    } catch {
      setOemError("Erreur lors de l'ajout de la référence OEM.");
    } finally {
      setAddingOem(false);
    }
  };

  /* Refs équivalentes : pas encore de route fournie — stockage local pour l'instant */
  const handleAddRef = async (reference) => {
    setAddingRef(true);
    setRefError(null);
    try {
      // TODO: brancher la route réelle quand disponible
      setRefs((prev) => [...prev, reference]);
    } finally {
      setAddingRef(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* ── Header ─────────────────────────────────────────────── */}
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
        {showBack && (
          <IconButton size="small" onClick={onBack} sx={{ mr: 0.5 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            Fiche article (consultation)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {article.libelle1}
            {article.libelle2 ? ` — ${article.libelle2}` : ""}
          </Typography>
        </Box>
        <Chip label={article.type} size="small" color="primary" sx={{ mr: 1 }} />
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Content ────────────────────────────────────────────── */}
      <DialogContent sx={{ pt: 2.5, px: 2.5, pb: 1 }}>
        {/* 1 · Référence / prix */}
        <Panel title="Référence / prix">
          <Box display="flex" gap={4} flexWrap="wrap">
            <Box flex={1} minWidth={220}>
              <Row label="Libellé" value={article.libelle1} />
              {article.libelle2 && <Row label="Désignation 2" value={article.libelle2} />}
              {article.libelle3 && <Row label="Désignation 3" value={article.libelle3} />}
              <Row label="Référence ext." value={article.refExt} mono />
              <Row label="Code barre" value={article.codeBarre} mono />
              <Row label="Code interne" value={article.id} mono />
            </Box>
            <Box flex={1} minWidth={220}>
              <Row label="Prix TTC" value={fmt(pricing.prixTTC, " €")} highlight />
              <Row label="Prix HT" value={fmt(pricing.prixHT, " €")} />
              <Row label="TVA" value={pricing.tva != null ? `${pricing.tva} %` : "—"} />
              <Row label="Marque" value={article.Marque?.nom} />
              <Row label="Fournisseur" value={article.Fournisseur?.nom} />
              {caracPneu && <Row label="Caractéristiques" value={caracPneu} />}
            </Box>
          </Box>
        </Panel>

        {/* 2 · Stock / historique */}
        <Panel
          title="Stock / historique"
          icon={
            <IconButton size="small" sx={{ p: 0.25 }}>
              <RefreshIcon sx={{ fontSize: 15, color: "primary.main" }} />
            </IconButton>
          }
        >
          <Box display="flex" gap={4} flexWrap="wrap" mb={1}>
            <Box>
              <Row label="Stock disponible" value="—" />
              <Row label="Stock OR" value="—" />
              <Row label="Stock Total" value="—" />
            </Box>
            <Box>
              <Row label="Stock Résa" value="—" />
              <Row label="Stock Facturé" value="—" />
            </Box>
          </Box>
          <HistoryTable columns={["Stock", "Achat", "Vente", "Date", "Auteur", "Document"]} />
        </Panel>

        {/* 3 · Prix / historique */}
        <Panel title="Prix / historique">
          <Box display="flex" gap={4} flexWrap="wrap" mb={1}>
            <Box>
              <Row label="PRIX TTC" value={fmt(pricing.prixTTC, " €")} highlight />
              <Row label="PRIX HT" value={fmt(pricing.prixHT, " €")} />
              <Row label="Frais port HT" value={fmt(pricing.fraisPort, " €")} />
            </Box>
            <Box>
              <Row label="PAMP" value="—" />
              <Row label="Dernier PA" value={fmt(pricing.prixAchat, " €")} />
              <Row label="Marge €" value={fmt(pricing.marge, " €")} />
              <Row label="Marge %" value={fmt(pricing.margePct, " %")} />
            </Box>
          </Box>
          <HistoryTable columns={["Date", "Prix TTC", "Prix HT", "Prix achat", "Marge €", "Marge %"]} />
        </Panel>

        {/* 4 · Adressage */}
        <Panel title="Adressage">
          <Box display="flex" gap={4} flexWrap="wrap">
            <Box flex={1}>
              <Row label="Emplacement" value={article.Emplacement?.nom} />
              <Row label="Type" value={article.type} />
            </Box>
            <Box flex={1}>
              <Row label="Groupe" value={article.Groupe?.nom} />
              <Row label="Famille" value={article.Famille?.nom} />
            </Box>
          </Box>
        </Panel>

        {/* 5 · Affectation */}
        <Panel title="Affectation">
          {/* OEM */}
          <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.75}>
            Références OEM
          </Typography>
          {displayOems.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={0.75} mb={0.5}>
              {displayOems.map((o, i) => (
                <Chip
                  key={o.id ?? i}
                  label={o.reference}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ fontFamily: "monospace" }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.disabled" mb={0.5}>
              Aucune référence OEM
            </Typography>
          )}
          {oemError && (
            <Typography variant="caption" color="error" display="block" mb={0.5}>
              {oemError}
            </Typography>
          )}
          <AddRefRow
            placeholder="Ex : OEM-12345"
            onAdd={handleAddOem}
            loading={addingOem}
          />

          <Divider sx={{ my: 1.5 }} />

          {/* Refs équivalentes */}
          <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.75}>
            Références équivalentes
          </Typography>
          {refs.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={0.75} mb={0.5}>
              {refs.map((r, i) => (
                <Chip
                  key={i}
                  label={r}
                  size="small"
                  variant="outlined"
                  sx={{ fontFamily: "monospace" }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.disabled" mb={0.5}>
              Aucune référence équivalente
            </Typography>
          )}
          {refError && (
            <Typography variant="caption" color="error" display="block" mb={0.5}>
              {refError}
            </Typography>
          )}
          <AddRefRow
            placeholder="Ex : REF-EQ-456"
            onAdd={handleAddRef}
            loading={addingRef}
          />
        </Panel>

        {/* 6 · Ap-vente */}
        <Panel title="Ap-vente">
          <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.5}>
            Garantie et conditions / SAV
          </Typography>
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", color: article.garantie ? "text.primary" : "text.disabled" }}
          >
            {article.garantie || "—"}
          </Typography>
        </Panel>
      </DialogContent>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Divider />
      <DialogActions
        sx={{
          bgcolor: "background.default",
          borderTop: "1px solid",
          borderColor: "divider",
          px: 2.5,
          py: 1.5,
          gap: 1,
        }}
      >
        <Button variant="outlined" size="small" startIcon={<NoteAddIcon />} sx={{ textTransform: "none" }}>
          Ajouter brouillon
        </Button>
        <Box flex={1} display="flex" justifyContent="center">
          <IconButton size="small" title="Aide">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
        <Button variant="contained" size="small" onClick={onClose} sx={{ textTransform: "none" }}>
          Quitter
        </Button>
      </DialogActions>
    </Dialog>
  );
}
