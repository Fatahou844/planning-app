import AddIcon          from "@mui/icons-material/Add";
import CloseIcon        from "@mui/icons-material/Close";
import DeleteIcon       from "@mui/icons-material/Delete";
import EditIcon         from "@mui/icons-material/Edit";
import ExpandMoreIcon   from "@mui/icons-material/ExpandMore";
import LocationOnIcon   from "@mui/icons-material/LocationOn";
import SaveIcon         from "@mui/icons-material/Save";
import SearchIcon       from "@mui/icons-material/Search";
import WarehouseIcon    from "@mui/icons-material/Warehouse";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
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
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useAxios } from "../../../utils/hook/useAxios";
import { useUser }  from "../../../utils/hook/UserContext";

/* ── label court d'un emplacement ───────────────────────────────────── */
function shortLabel(e) {
  return [
    e.rangee       && `All. ${e.rangee}`,
    e.etagere      && `Ét. ${e.etagere}`,
    e.casePosition && `Case ${e.casePosition}`,
  ].filter(Boolean).join("  ·  ") || null;
}

/* ── champ avec label au-dessus ─────────────────────────────────────── */
function F({ label, value, onChange, placeholder, required }) {
  return (
    <Box>
      <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.4}>
        {label}{required && <span style={{ color: "#d32f2f", marginLeft: 2 }}>*</span>}
      </Typography>
      <TextField
        size="small"
        fullWidth
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </Box>
  );
}

/* ── formulaire création / édition d'un emplacement ─────────────────── */
function EmplacementForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(
    initial
      ? { nom: initial.nom || "", rangee: initial.rangee || "", etagere: initial.etagere || "", casePosition: initial.casePosition || "" }
      : { nom: "", rangee: "", etagere: "", casePosition: "" }
  );
  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  return (
    <Box
      sx={{
        p: 2, border: "1px solid", borderColor: "primary.main",
        borderRadius: 1.5, bgcolor: alpha => alpha, mb: 1.5,
      }}
    >
      <Typography variant="caption" fontWeight={700} color="primary.main" display="block" mb={1.5} textTransform="uppercase" letterSpacing={0.8}>
        {initial ? "Modifier l'emplacement" : "Nouvel emplacement"}
      </Typography>

      <Box display="flex" gap={1.5} flexWrap="wrap" mb={1.5}>
        <Box flex="2 1 160px">
          <F label="Zone / Nom" value={form.nom} onChange={set("nom")} placeholder="Ex : Zone A, Hall 1…" required />
        </Box>
        <Box flex="1 1 100px">
          <F label="Rangée / Allée" value={form.rangee} onChange={set("rangee")} placeholder="Ex : B, 3…" />
        </Box>
        <Box flex="1 1 100px">
          <F label="Étagère" value={form.etagere} onChange={set("etagere")} placeholder="Ex : 2, H…" />
        </Box>
        <Box flex="1 1 100px">
          <F label="Case / Position" value={form.casePosition} onChange={set("casePosition")} placeholder="Ex : 7, A3…" />
        </Box>
      </Box>

      <Box display="flex" gap={1} justifyContent="flex-end">
        <Button size="small" variant="outlined" onClick={onCancel} sx={{ textTransform: "none" }}>
          Annuler
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => onSave(form)}
          disabled={!form.nom.trim() || saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
          sx={{ textTransform: "none" }}
        >
          {saving ? "Enregistrement…" : initial ? "Mettre à jour" : "Créer"}
        </Button>
      </Box>
    </Box>
  );
}

/* ── carte d'un emplacement ─────────────────────────────────────────── */
function EmplacementCard({ emp, garageId, onEdit, onDelete, onExpand, expanded }) {
  const theme = useTheme();
  const axios = useAxios();
  const [articles, setArticles] = useState(null);
  const [loading,  setLoading]  = useState(false);

  const handleExpand = async () => {
    onExpand();
    if (!expanded && articles === null) {
      setLoading(true);
      try {
        const res = await axios.get(`/stock/emplacements/id/${emp.id}${garageId ? `?garageId=${garageId}` : ""}`);
        setArticles(res?.data?.Articles || []);
      } catch { setArticles([]); }
      finally { setLoading(false); }
    }
  };

  const sub = shortLabel(emp);

  return (
    <Accordion
      expanded={expanded}
      onChange={handleExpand}
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: expanded ? "primary.main" : "divider",
        borderRadius: "8px !important",
        mb: 1,
        "&:before": { display: "none" },
        transition: "border-color 0.2s",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
        sx={{
          px: 2, py: 0.5, minHeight: 52,
          bgcolor: expanded ? alpha(theme.palette.primary.main, 0.05) : "transparent",
          borderRadius: "8px",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} flex={1} mr={1}>
          {/* Icône */}
          <Box
            sx={{
              width: 36, height: 36, borderRadius: 1, flexShrink: 0,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <LocationOnIcon sx={{ fontSize: 18, color: "primary.main" }} />
          </Box>

          {/* Nom + adresse */}
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" fontWeight={700} noWrap>{emp.nom}</Typography>
            {sub && (
              <Typography variant="caption" color="text.secondary">{sub}</Typography>
            )}
          </Box>

          {/* Badge articles */}
          <Chip
            label={`${emp.nbArticles ?? 0} article${(emp.nbArticles ?? 0) !== 1 ? "s" : ""}`}
            size="small"
            color={(emp.nbArticles ?? 0) > 0 ? "primary" : "default"}
            variant={(emp.nbArticles ?? 0) > 0 ? "filled" : "outlined"}
            sx={{ fontSize: 11, mr: 1 }}
          />

          {/* Actions */}
          <Box display="flex" gap={0.25} onClick={e => e.stopPropagation()}>
            <Tooltip title="Modifier">
              <IconButton size="small" onClick={() => onEdit(emp)}>
                <EditIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton size="small" color="error" onClick={() => onDelete(emp)}>
                <DeleteIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pt: 0, pb: 1.5 }}>
        <Divider sx={{ mb: 1.5 }} />
        {loading ? (
          <Box display="flex" justifyContent="center" py={1.5}>
            <CircularProgress size={20} />
          </Box>
        ) : !articles || articles.length === 0 ? (
          <Typography variant="caption" color="text.disabled" display="block" textAlign="center" py={1}>
            Aucun article dans cet emplacement
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Référence", "Désignation", "Marque", "Type", "Prix HT"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", py: 0.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {articles.map(a => (
                <TableRow key={a.id} hover>
                  <TableCell sx={{ fontSize: 12, fontFamily: "monospace" }}>{a.refExt || `#${a.id}`}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{a.libelle1}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{a.Marque?.nom || "—"}</TableCell>
                  <TableCell>
                    <Chip label={a.type || "—"} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    {a.ArticlePricing?.prixHT != null ? `${parseFloat(a.ArticlePricing.prixHT).toFixed(2)} €` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

/* ── composant principal ──────────────────────────────────────────────── */
export default function EmplacementsModal({ open, onClose }) {
  const axios            = useAxios();
  const { user }         = useUser();
  const garageId         = user?.garageId;

  const [emplacements, setEmplacements] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [search,       setSearch]       = useState("");
  const [expandedId,   setExpandedId]   = useState(null);

  /* formulaire */
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = création
  const [saving,  setSaving]  = useState(false);
  const [formErr, setFormErr] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/stock/emplacements${garageId ? `?garageId=${garageId}` : ""}`);
      setEmplacements(Array.isArray(res?.data) ? res.data : []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (open) { load(); setSearch(""); setExpandedId(null); setShowForm(false); setEditTarget(null); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return emplacements;
    return emplacements.filter(e =>
      (e.nom          || "").toLowerCase().includes(q) ||
      (e.rangee       || "").toLowerCase().includes(q) ||
      (e.etagere      || "").toLowerCase().includes(q) ||
      (e.casePosition || "").toLowerCase().includes(q)
    );
  }, [emplacements, search]);

  /* ── CRUD ── */
  const handleSave = async (form) => {
    setSaving(true); setFormErr(null);
    try {
      if (editTarget) {
        await axios.put(`/stock/emplacements/${editTarget.id}`, { ...form, garageId });
        setEmplacements(prev => prev.map(e => e.id === editTarget.id ? { ...e, ...form } : e));
      } else {
        const res = await axios.post("/stock/emplacements", { ...form, garageId });
        setEmplacements(prev => [...prev, { ...res.data, nbArticles: 0 }]);
      }
      setShowForm(false); setEditTarget(null);
    } catch (err) {
      setFormErr(err?.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (emp) => {
    setEditTarget(emp);
    setShowForm(true);
    setExpandedId(null);
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Supprimer l'emplacement "${emp.nom}" ?`)) return;
    try {
      await axios.delete(`/stock/emplacements/${emp.id}${garageId ? `?garageId=${garageId}` : ""}`);
      setEmplacements(prev => prev.filter(e => e.id !== emp.id));
    } catch (err) {
      alert(err?.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const totalArticles = emplacements.reduce((s, e) => s + (e.nbArticles || 0), 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { height: "88vh" } }}>
      <DialogTitle
        sx={{
          display: "flex", alignItems: "center", gap: 1,
          bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider",
          py: 1.5, px: 2.5,
        }}
      >
        <WarehouseIcon sx={{ color: "primary.main", fontSize: 20 }} />
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={700}>Emplacements</Typography>
          <Typography variant="caption" color="text.secondary">
            {emplacements.length} emplacement{emplacements.length > 1 ? "s" : ""} · {totalArticles} article{totalArticles > 1 ? "s" : ""} référencé{totalArticles > 1 ? "s" : ""}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditTarget(null); setShowForm(p => !p); }}
          sx={{ textTransform: "none", mr: 0.5 }}
        >
          Nouveau
        </Button>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pt: 2, pb: 2, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Formulaire création / édition */}
        {showForm && (
          <EmplacementForm
            initial={editTarget}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditTarget(null); }}
            saving={saving}
          />
        )}
        {formErr && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setFormErr(null)}>{formErr}</Alert>}

        {/* Barre recherche */}
        <Box mb={1.5}>
          <TextField
            size="small"
            fullWidth
            placeholder="Rechercher par zone, allée, étagère, case…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 15, color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Liste */}
        <Box sx={{ flex: 1, overflow: "auto", pr: 0.5 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress size={28} />
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <LocationOnIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" color="text.disabled">
                {search ? "Aucun emplacement correspondant" : "Aucun emplacement créé"}
              </Typography>
              {!search && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setShowForm(true)}
                  sx={{ mt: 1.5, textTransform: "none" }}
                >
                  Créer le premier emplacement
                </Button>
              )}
            </Box>
          ) : (
            filtered.map(emp => (
              <EmplacementCard
                key={emp.id}
                emp={emp}
                garageId={garageId}
                onEdit={handleEdit}
                onDelete={handleDelete}
                expanded={expandedId === emp.id}
                onExpand={() => setExpandedId(p => p === emp.id ? null : emp.id)}
              />
            ))
          )}
        </Box>

      </DialogContent>
    </Dialog>
  );
}
