import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PrintIcon from "@mui/icons-material/Print";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useMemo, useState } from "react";
import { useAxios } from "../../../utils/hook/useAxios";
import { generateBdcPdf } from "../../../utils/pdf/generateBdcPdf";

function getCurrentUser() {
  const s = localStorage.getItem("me");
  return s ? JSON.parse(s) : null;
}

/* ── constantes ──────────────────────────────────────────────────────── */
const STATUS_COLOR = {
  DRAFT:     "default",
  SENT:      "info",
  PARTIAL:   "warning",
  RECEIVED:  "success",
  CANCELLED: "error",
};
const STATUS_LABEL = {
  DRAFT:     "Brouillon",
  SENT:      "Envoyé",
  PARTIAL:   "Partiel",
  RECEIVED:  "Réceptionné",
  CANCELLED: "Annulé",
};
const STATUS_OPTIONS = [
  { value: "", label: "Toutes" },
  { value: "SENT",      label: "En cours" },
  { value: "PARTIAL",   label: "Partielle" },
  { value: "RECEIVED",  label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
  { value: "DRAFT",     label: "Brouillon" },
];

/* ── détail d'un BDC (lignes) ────────────────────────────────────────── */
function BdcLines({ bdc }) {
  const theme = useTheme();
  const lines = bdc.Lines || [];

  if (!lines.length) {
    return (
      <Box sx={{ px: 3, py: 1.5 }}>
        <Typography variant="caption" color="text.disabled">Aucune ligne</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, pb: 1.5, pt: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "background.default" }}>
            {["Référence", "Désignation", "Marque", "Qté commandée", "Qté reçue", "Reliquat"].map(h => (
              <TableCell key={h} sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary", py: 0.75 }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((l) => {
            const qteCmd  = parseFloat(l.quantiteCommandee) || 0;
            const qteRecu = parseFloat(l.quantiteRecue)     || 0;
            const reliquat = Math.max(0, qteCmd - qteRecu);
            const hasReliquat = reliquat > 0 && bdc.status !== "CANCELLED";
            return (
              <TableRow
                key={l.id}
                sx={{ bgcolor: hasReliquat ? alpha(theme.palette.warning.main, 0.06) : "transparent" }}
              >
                <TableCell sx={{ fontSize: 12, fontFamily: "monospace" }}>
                  {l.Article?.refExt || "—"}
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>{l.Article?.libelle1 || "—"}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{l.Article?.Marque?.nom || "—"}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{qteCmd}</TableCell>
                <TableCell sx={{ fontSize: 12, color: qteRecu >= qteCmd ? "success.main" : "text.primary", fontWeight: 600 }}>
                  {qteRecu}
                </TableCell>
                <TableCell>
                  {hasReliquat ? (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <WarningAmberIcon sx={{ fontSize: 14, color: "warning.main" }} />
                      <Typography variant="caption" sx={{ color: "warning.dark", fontWeight: 700 }}>
                        {reliquat}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="success.main" fontWeight={600}>✓</Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

/* ── ligne BDC dans la liste ─────────────────────────────────────────── */
function BdcRow({ bdc, expanded, onToggle }) {
  const theme = useTheme();
  const lines = bdc.Lines || [];
  const totalCmd  = lines.reduce((s, l) => s + (parseFloat(l.quantiteCommandee) || 0), 0);
  const totalRecu = lines.reduce((s, l) => s + (parseFloat(l.quantiteRecue)     || 0), 0);
  const hasReliquat = totalRecu < totalCmd && bdc.status !== "CANCELLED" && bdc.status !== "DRAFT";

  const handlePrint = (e) => {
    e.stopPropagation();
    generateBdcPdf(bdc);
  };

  return (
    <>
      <TableRow
        hover
        onClick={onToggle}
        sx={{ cursor: "pointer", bgcolor: expanded ? alpha(theme.palette.primary.main, 0.05) : "transparent" }}
      >
        <TableCell sx={{ width: 36, px: 1 }}>
          {expanded
            ? <KeyboardArrowDownIcon  sx={{ fontSize: 18, color: "text.secondary" }} />
            : <KeyboardArrowRightIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          }
        </TableCell>
        <TableCell sx={{ fontSize: 12, fontFamily: "monospace", whiteSpace: "nowrap" }}>
          #{bdc.id}
        </TableCell>
        <TableCell sx={{ fontSize: 12 }}>
          {bdc.date ? new Date(bdc.date).toLocaleDateString("fr-FR") : "—"}
        </TableCell>
        <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
          {bdc.Fournisseur?.nom || "—"}
        </TableCell>
        <TableCell sx={{ fontSize: 12, fontFamily: "monospace" }}>
          {bdc.reference || "—"}
        </TableCell>
        <TableCell>
          <Chip
            label={STATUS_LABEL[bdc.status] || bdc.status}
            color={STATUS_COLOR[bdc.status] || "default"}
            size="small"
            sx={{ fontSize: 11 }}
          />
        </TableCell>
        <TableCell sx={{ fontSize: 12 }}>{lines.length}</TableCell>
        <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{totalCmd}</TableCell>
        <TableCell sx={{ fontSize: 12, fontWeight: 600, color: totalRecu >= totalCmd ? "success.main" : "text.primary" }}>
          {totalRecu}
        </TableCell>
        <TableCell>
          {hasReliquat ? (
            <Box display="flex" alignItems="center" gap={0.5}>
              <WarningAmberIcon sx={{ fontSize: 14, color: "warning.main" }} />
              <Typography variant="caption" sx={{ color: "warning.dark", fontWeight: 700 }}>
                {(totalCmd - totalRecu).toFixed(0)}
              </Typography>
            </Box>
          ) : bdc.status !== "DRAFT" && bdc.status !== "CANCELLED" ? (
            <Typography variant="caption" color="success.main" fontWeight={600}>✓</Typography>
          ) : null}
        </TableCell>
        <TableCell sx={{ px: 0.5 }}>
          <Tooltip title="Imprimer BDC">
            <IconButton size="small" onClick={handlePrint}>
              <PrintIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* Lignes détail */}
      <TableRow sx={{ "& td": { p: 0, border: 0 } }}>
        <TableCell colSpan={11}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <BdcLines bdc={bdc} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

/* ── composant principal ─────────────────────────────────────────────── */
export default function HistoriqueCommandesFssModal({ open, onClose }) {
  const axios    = useAxios();
  const garageId = getCurrentUser()?.garageId;

  const [bdcs,    setBdcs]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  /* filtres */
  const [filterFss,    setFilterFss]    = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateDu, setFilterDateDu] = useState("");
  const [filterDateAu, setFilterDateAu] = useState("");
  const [filterNum,    setFilterNum]    = useState("");

  /* ligne expandée */
  const [expandedId, setExpandedId] = useState(null);

  /* chargement */
  const load = async () => {
    if (!garageId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/purchase-orders/${garageId}`);
      setBdcs(res.data?.bdcs || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    else { setBdcs([]); setExpandedId(null); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* liste fournisseurs dédupliquée depuis les BDCs */
  const fournisseurs = useMemo(() => {
    const seen = new Map();
    bdcs.forEach(b => {
      if (b.Fournisseur) seen.set(b.Fournisseur.id, b.Fournisseur);
    });
    return Array.from(seen.values()).sort((a, b) => a.nom.localeCompare(b.nom));
  }, [bdcs]);

  /* filtrage */
  const filtered = useMemo(() => {
    return bdcs.filter(b => {
      if (filterFss    && b.Fournisseur?.id !== filterFss.id) return false;
      if (filterStatus && b.status !== filterStatus) return false;
      if (filterNum) {
        const q = filterNum.toLowerCase();
        const matchId  = String(b.id).includes(q);
        const matchRef = (b.reference || "").toLowerCase().includes(q);
        if (!matchId && !matchRef) return false;
      }
      if (filterDateDu && b.date && b.date < filterDateDu) return false;
      if (filterDateAu && b.date && b.date > filterDateAu) return false;
      return true;
    });
  }, [bdcs, filterFss, filterStatus, filterNum, filterDateDu, filterDateAu]);

  const toggleRow = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle
        sx={{
          display: "flex", alignItems: "center", gap: 1,
          bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider",
          py: 1.5, px: 2.5,
        }}
      >
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={700}>Historique commandes fournisseurs</Typography>
          <Typography variant="caption" color="text.secondary">
            {filtered.length} commande{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pt: 2, pb: 2 }}>

        {/* ── Filtres ── */}
        <Box
          sx={{
            display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2,
            p: 1.5, bgcolor: "action.hover", borderRadius: 1,
          }}
        >
          {/* Fournisseur */}
          <Box sx={{ flex: "1 1 200px", minWidth: 180 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
              Fournisseur
            </Typography>
            <Autocomplete
              size="small"
              options={fournisseurs}
              getOptionLabel={o => o.nom || ""}
              value={filterFss}
              onChange={(_, v) => setFilterFss(v)}
              renderInput={params => (
                <TextField {...params} placeholder="Tous les fournisseurs" />
              )}
              sx={{ bgcolor: "background.paper", borderRadius: 1 }}
            />
          </Box>

          {/* Statut */}
          <Box sx={{ flex: "0 0 150px" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
              Statut
            </Typography>
            <Select
              size="small"
              fullWidth
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              displayEmpty
              sx={{ bgcolor: "background.paper" }}
            >
              {STATUS_OPTIONS.map(o => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* Période */}
          <Box sx={{ flex: "0 0 auto" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
              Période
            </Typography>
            <Box display="flex" alignItems="center" gap={0.75}>
              <TextField
                size="small"
                type="date"
                placeholder="Du"
                value={filterDateDu}
                onChange={e => setFilterDateDu(e.target.value)}
                sx={{ bgcolor: "background.paper", width: 150 }}
                inputProps={{ style: { fontSize: 13 } }}
              />
              <Typography variant="caption" color="text.disabled">→</Typography>
              <TextField
                size="small"
                type="date"
                placeholder="Au"
                value={filterDateAu}
                onChange={e => setFilterDateAu(e.target.value)}
                sx={{ bgcolor: "background.paper", width: 150 }}
                inputProps={{ style: { fontSize: 13 } }}
              />
            </Box>
          </Box>

          {/* N° commande */}
          <Box sx={{ flex: "1 1 180px", minWidth: 160 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
              N° commande / référence
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="Rechercher…"
              value={filterNum}
              onChange={e => setFilterNum(e.target.value)}
              sx={{ bgcolor: "background.paper" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 15, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        {/* ── Contenu ── */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 1 }}>
            <Typography variant="body2" color="error.dark">{error}</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Typography color="text.disabled">Aucune commande trouvée pour ces critères</Typography>
          </Box>
        ) : (
          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "background.default" }}>
                  <TableCell sx={{ width: 36 }} />
                  {["N°", "Date", "Fournisseur", "Référence", "Statut", "Articles", "Qté cmd.", "Qté reçue", "Reliquat", ""].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", py: 0.9, whiteSpace: "nowrap" }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(bdc => (
                  <BdcRow
                    key={bdc.id}
                    bdc={bdc}
                    expanded={expandedId === bdc.id}
                    onToggle={() => toggleRow(bdc.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
