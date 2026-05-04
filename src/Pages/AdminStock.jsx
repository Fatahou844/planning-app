import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import StorefrontIcon from "@mui/icons-material/Storefront";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import ImportFournisseurs from "../Components/Store/ImportFournisseurs/ImportFournisseurs";
import ImportMarques from "../Components/Store/ImportMarques/ImportMarques";
import ImportArticles from "../Components/Store/ImportArticles/ImportArticles";
import ImportPneus from "../Components/Store/ImportPneus/ImportPneus";
import { useAxios } from "../utils/hook/useAxios";
import { useUser } from "../utils/hook/UserContext";

/* ─────────────────────────────────────────────────────────
   Snack helper
───────────────────────────────────────────────────────── */
function useSnack() {
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });
  const show = (message, severity = "success") => setSnack({ open: true, severity, message });
  const hide = () => setSnack((s) => ({ ...s, open: false }));
  return { snack, show, hide };
}

/* ════════════════════════════════════════════════════════
   TAB MARQUES
════════════════════════════════════════════════════════ */
export function TabMarques() {
  const axios = useAxios();
  const { snack, show, hide } = useSnack();

  const [marques,  setMarques]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState("");

  // Modales
  const [addOpen,    setAddOpen]    = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [newNom,     setNewNom]     = useState("");
  const [editNom,    setEditNom]    = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/stock/marques");
      setMarques(res?.data || []);
    } finally {
      setLoading(false);
    }
  }, [axios]);

  useEffect(() => { load(); }, [load]);

  const filtered = marques.filter((m) =>
    m.nom.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Créer ── */
  const handleCreate = async () => {
    if (!newNom.trim()) return;
    setSaving(true);
    try {
      await axios.post("/stock/marques", { nom: newNom.trim() });
      setAddOpen(false); setNewNom("");
      show("Marque créée");
      load();
    } catch { show("Erreur création", "error"); }
    finally { setSaving(false); }
  };

  /* ── Modifier ── */
  const handleEdit = async () => {
    if (!editNom.trim()) return;
    setSaving(true);
    try {
      await axios.put(`/stock/marques/${editItem.id}`, { nom: editNom.trim() });
      setEditItem(null);
      show("Marque modifiée");
      load();
    } catch { show("Erreur modification", "error"); }
    finally { setSaving(false); }
  };

  /* ── Supprimer ── */
  const handleDelete = async () => {
    setSaving(true);
    try {
      await axios.deleteData(`/stock/marques/${deleteItem.id}`);
      setDeleteItem(null);
      show("Marque supprimée");
      load();
    } catch { show("Erreur suppression", "error"); }
    finally { setSaving(false); }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Toolbar */}
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <TextField
          size="small" placeholder="Rechercher une marque…" value={search}
          onChange={(e) => setSearch(e.target.value)} sx={{ width: 260 }}
        />
        <Box flex={1} />
        <ImportMarques onSuccess={load} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setNewNom(""); setAddOpen(true); }}>
          Ajouter
        </Button>
      </Box>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 70 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary" py={2}>Aucune marque</Typography>
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell><Typography variant="caption" color="text.secondary">{m.id}</Typography></TableCell>
                  <TableCell><strong>{m.nom}</strong></TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => { setEditItem(m); setEditNom(m.nom); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => setDeleteItem(m)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary">{filtered.length} marque(s)</Typography>

      {/* Modal Ajouter */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Ajouter une marque</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Nom" value={newNom} onChange={(e) => setNewNom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newNom.trim() || saving}>
            {saving ? <CircularProgress size={16} /> : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Modifier */}
      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Modifier la marque</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Nom" value={editNom} onChange={(e) => setEditNom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEdit()} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItem(null)}>Annuler</Button>
          <Button variant="contained" onClick={handleEdit} disabled={!editNom.trim() || saving}>
            {saving ? <CircularProgress size={16} /> : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Supprimer */}
      <Dialog open={!!deleteItem} onClose={() => setDeleteItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Supprimer la marque ?</DialogTitle>
        <DialogContent>
          <Typography>
            Confirmer la suppression de <strong>{deleteItem?.nom}</strong> ?
            Les articles liés perdront leur marque.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteItem(null)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={saving}>
            {saving ? <CircularProgress size={16} /> : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={hide} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} onClose={hide}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   TAB FOURNISSEURS  — pagination serveur + recherche débouncée
════════════════════════════════════════════════════════ */
function TabFournisseurs() {
  const axios = useAxios();
  const { snack, show, hide } = useSnack();

  const PAGE_SIZE_OPTIONS = [25, 50, 100];

  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(50);
  const [total,        setTotal]        = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);

  const debounceRef = useRef(null);

  // Modales
  const [addOpen,    setAddOpen]    = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const emptyForm = { nom: "", code: "", adresse1: "", adresse2: "", adresse3: "", telephone: "", telex: "" };
  const [form, setForm] = useState(emptyForm);

  /* ── Chargement paginé ── */
  const [allFournisseurs, setAllFournisseurs] = useState([]);

  const load = useCallback(async (p = page, ps = pageSize, q = search) => {
    setLoading(true);
    try {
      const res = await axios.get("/stock/fournisseurs");
      const raw = res?.data || [];

      // L'API peut renvoyer un tableau direct ou un objet paginé
      const all = Array.isArray(raw) ? raw : (raw.data || []);
      setAllFournisseurs(all);

      // Filtrage client
      const filtered = q
        ? all.filter((f) =>
            (f.nom  || "").toLowerCase().includes(q.toLowerCase()) ||
            (f.code || "").toLowerCase().includes(q.toLowerCase())
          )
        : all;

      // Pagination client
      const totalCount = filtered.length;
      const pages = Math.max(1, Math.ceil(totalCount / ps));
      const safeP = Math.min(p, pages);
      const start = (safeP - 1) * ps;

      setFournisseurs(filtered.slice(start, start + ps));
      setTotal(totalCount);
      setTotalPages(pages);
      setPage(safeP);
    } finally {
      setLoading(false);
    }
  }, [axios]); // eslint-disable-line

  /* Premier chargement */
  useEffect(() => { load(1, pageSize, ""); }, []); // eslint-disable-line

  /* Applique filtre + pagination sur les données déjà en mémoire */
  const applyFilter = useCallback((q, p, ps) => {
    const filtered = q
      ? allFournisseurs.filter((f) =>
          (f.nom  || "").toLowerCase().includes(q.toLowerCase()) ||
          (f.code || "").toLowerCase().includes(q.toLowerCase())
        )
      : allFournisseurs;
    const totalCount = filtered.length;
    const pages = Math.max(1, Math.ceil(totalCount / ps));
    const safeP = Math.min(p, pages);
    const start = (safeP - 1) * ps;
    setFournisseurs(filtered.slice(start, start + ps));
    setTotal(totalCount);
    setTotalPages(pages);
    setPage(safeP);
  }, [allFournisseurs]); // eslint-disable-line

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearch(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applyFilter(q, 1, pageSize), 300);
  };

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, totalPages));
    applyFilter(search, next, pageSize);
  };

  const handlePageSizeChange = (ps) => {
    setPageSize(ps);
    applyFilter(search, 1, ps);
  };

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  /* ── Créer ── */
  const handleCreate = async () => {
    if (!form.nom.trim() && !form.code.trim()) return;
    setSaving(true);
    try {
      await axios.post("/stock/fournisseurs", form);
      setAddOpen(false); setForm(emptyForm);
      show("Fournisseur créé");
      load(page, pageSize, search);
    } catch { show("Erreur création", "error"); }
    finally { setSaving(false); }
  };

  /* ── Modifier ── */
  const handleEdit = async () => {
    setSaving(true);
    try {
      await axios.put(`/stock/fournisseurs/${editItem.id}`, form);
      setEditItem(null);
      show("Fournisseur modifié");
      load(page, pageSize, search);
    } catch { show("Erreur modification", "error"); }
    finally { setSaving(false); }
  };

  /* ── Supprimer ── */
  const handleDelete = async () => {
    setSaving(true);
    try {
      await axios.deleteData(`/stock/fournisseurs/${deleteItem.id}`);
      setDeleteItem(null);
      show("Fournisseur supprimé");
      // si la page courante est vide après suppression, reculer
      const newTotal = total - 1;
      const maxPage  = Math.max(1, Math.ceil(newTotal / pageSize));
      const targetPage = Math.min(page, maxPage);
      setPage(targetPage);
      load(targetPage, pageSize, search);
    } catch { show("Erreur suppression", "error"); }
    finally { setSaving(false); }
  };

  const openEdit = (f) => {
    setEditItem(f);
    setForm({ nom: f.nom || "", code: f.code || "", adresse1: f.adresse1 || "",
              adresse2: f.adresse2 || "", adresse3: f.adresse3 || "",
              telephone: f.telephone || "", telex: f.telex || "" });
  };

  const FournisseurForm = () => (
    <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
      <Box display="flex" gap={2}>
        <TextField fullWidth label="Code fournisseur" value={form.code} onChange={setField("code")} />
        <TextField fullWidth label="Libellé / Raison sociale" value={form.nom} onChange={setField("nom")} required />
      </Box>
      <TextField fullWidth label="Zone Adresse 1" value={form.adresse1} onChange={setField("adresse1")} />
      <TextField fullWidth label="Zone Adresse 2" value={form.adresse2} onChange={setField("adresse2")} />
      <TextField fullWidth label="Zone Adresse 3" value={form.adresse3} onChange={setField("adresse3")} />
      <Box display="flex" gap={2}>
        <TextField fullWidth label="Téléphone" value={form.telephone} onChange={setField("telephone")} />
        <TextField fullWidth label="N° Telex"  value={form.telex}     onChange={setField("telex")} />
      </Box>
    </Box>
  );

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Toolbar */}
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <TextField
          size="small" placeholder="Rechercher par nom ou code…" value={search}
          onChange={handleSearchChange} sx={{ width: 280 }}
        />
        <Box flex={1} />
        <ImportFournisseurs onSuccess={() => load(1, pageSize, search)} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(emptyForm); setAddOpen(true); }}>
          Ajouter
        </Button>
      </Box>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 90  }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Libellé</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Adresse</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 130 }}>Téléphone</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100 }}>Telex</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fournisseurs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" py={2}>Aucun fournisseur</Typography>
                  </TableCell>
                </TableRow>
              )}
              {fournisseurs.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>
                    {f.code
                      ? <Chip label={f.code} size="small" variant="outlined" />
                      : <Typography variant="caption" color="text.disabled">—</Typography>}
                  </TableCell>
                  <TableCell><strong>{f.nom || "—"}</strong></TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 240 }}>
                      {[f.adresse1, f.adresse2, f.adresse3].filter(Boolean).join(", ") || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>{f.telephone || "—"}</TableCell>
                  <TableCell>{f.telex     || "—"}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => openEdit(f)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => setDeleteItem(f)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* ── Pagination ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Typography variant="caption" color="text.secondary">
          {total} fournisseur(s) au total
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="caption" color="text.secondary">Lignes&nbsp;:</Typography>
          <Select
            size="small" value={pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            sx={{ fontSize: "0.75rem", height: 28 }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>{n}</MenuItem>
            ))}
          </Select>

          <IconButton size="small" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
            <NavigateBeforeIcon fontSize="small" />
          </IconButton>

          <Typography variant="body2" sx={{ minWidth: 80, textAlign: "center" }}>
            {page} / {totalPages}
          </Typography>

          <IconButton size="small" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
            <NavigateNextIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Modal Ajouter */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un fournisseur</DialogTitle>
        <DialogContent><FournisseurForm /></DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreate} disabled={(!form.nom.trim() && !form.code.trim()) || saving}>
            {saving ? <CircularProgress size={16} /> : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Modifier */}
      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier le fournisseur</DialogTitle>
        <DialogContent><FournisseurForm /></DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItem(null)}>Annuler</Button>
          <Button variant="contained" onClick={handleEdit} disabled={saving}>
            {saving ? <CircularProgress size={16} /> : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Supprimer */}
      <Dialog open={!!deleteItem} onClose={() => setDeleteItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Supprimer le fournisseur ?</DialogTitle>
        <DialogContent>
          <Typography>
            Confirmer la suppression de <strong>{deleteItem?.nom || deleteItem?.code}</strong> ?
            Les articles liés perdront leur fournisseur.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteItem(null)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={saving}>
            {saving ? <CircularProgress size={16} /> : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={hide} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} onClose={hide}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   TAB ARTICLES — Import intelligent
════════════════════════════════════════════════════════ */
function TabArticles({ garageId }) {
  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Grid container spacing={3}>

        {/* ── Articles généraux ── */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip label="Articles" color="primary" size="small" />
              <Typography variant="subtitle1" fontWeight={700}>
                Import articles généraux
              </Typography>
            </Box>
            <Divider />
            <Typography variant="body2" color="text.secondary" flex={1}>
              Pièces, consommables, accessoires…<br /><br />
              Colonnes attendues :<br />
              <em>Type · Désignation · Codebarre · Réf. ext · Fournisseur · Marque · Num groupe · Nom groupe · Num famille · Nom famille · Emplacement · Composant lot · PV HT · PV TTC · PA HT · Frais port · OEM · SAV</em>
              <br /><br />
              Fournisseur, Marque, Groupe, Famille et Emplacement sont créés automatiquement s'ils n'existent pas. Num groupe et famille forcés en 4 chiffres.
            </Typography>
            <Box>
              <ImportArticles garageId={garageId} />
            </Box>
          </Paper>
        </Grid>

        {/* ── Pneus ── */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip label="Pneus" color="secondary" size="small" />
              <Typography variant="subtitle1" fontWeight={700}>
                Import spécifique pneus
              </Typography>
            </Box>
            <Divider />
            <Typography variant="body2" color="text.secondary" flex={1}>
              Articles de type Pneus avec specs techniques enregistrées dans PneuSpec.<br /><br />
              Colonnes supplémentaires en tête de fichier :<br />
              <em>Type · Long · Hauteur · Diametre · Charge · Vitesse · Carburant · SolMouille · Indice Bruit · DB</em>
              <br />puis les mêmes colonnes que les articles généraux (Désignation → SAV).
              <br /><br />
              Le type est forcé à <strong>Pneus</strong> pour toutes les lignes.
            </Typography>
            <Box>
              <ImportPneus garageId={garageId} />
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   TAB STATISTIQUES
════════════════════════════════════════════════════════ */
const TYPE_COLORS = {
  "Pièces":       "#1976d2",
  "Pneus":        "#2e7d32",
  "Accessoires":  "#f57c00",
  "Consommables": "#7b1fa2",
};
const DEFAULT_COLOR = "#90a4ae";

function StatCard({ label, value, color }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, textAlign: "center", borderTop: `4px solid ${color || "#1976d2"}` }}>
      {value === undefined ? (
        <Skeleton variant="text" width="60%" sx={{ mx: "auto" }} height={48} />
      ) : (
        <Typography variant="h4" fontWeight={700} color={color || "primary.main"}>
          {Number(value).toLocaleString("fr-FR")}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
    </Paper>
  );
}

function HBarChart({ rows, colorFn, loading }) {
  const max = Math.max(...rows.map(r => Number(r.count)), 1);
  return (
    <Box display="flex" flexDirection="column" gap={0.8}>
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1}>
              <Skeleton width={120} height={20} />
              <Skeleton variant="rounded" width="60%" height={20} />
              <Skeleton width={30} height={20} />
            </Box>
          ))
        : rows.map((row, i) => {
            const pct   = Math.round((Number(row.count) / max) * 100);
            const color = colorFn ? colorFn(row) : "#1976d2";
            const label = row.nom || row.type || `—`;
            return (
              <Box key={i} display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ minWidth: 130, maxWidth: 130, color: "text.secondary" }}
                  title={label}
                >
                  {label}
                </Typography>
                <Box flex={1} sx={{ bgcolor: "action.hover", borderRadius: 1, overflow: "hidden" }}>
                  <Box
                    sx={{
                      width: `${pct}%`,
                      minWidth: pct > 0 ? 4 : 0,
                      height: 22,
                      bgcolor: color,
                      borderRadius: 1,
                      transition: "width 0.6s ease",
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ minWidth: 36, textAlign: "right", fontWeight: 600 }}>
                  {Number(row.count).toLocaleString("fr-FR")}
                </Typography>
              </Box>
            );
          })
      }
    </Box>
  );
}

function TabStatistiques() {
  const axios = useAxios();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    axios.get("/stock/articles/stats")
      .then(res => setStats(res.data))
      .catch(() => setError("Impossible de charger les statistiques."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box display="flex" flexDirection="column" gap={4}>

      {/* ── Cartes résumé ── */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Articles total"  value={stats?.total}     color="#1976d2" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Marques"          value={stats?.nbMarques} color="#7b1fa2" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Groupes"          value={stats?.nbGroupes} color="#2e7d32" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Types distincts"  value={stats ? stats.byType.length : undefined} color="#f57c00" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>

        {/* ── Répartition par type ── */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Répartition par type
            </Typography>
            <HBarChart
              rows={stats?.byType ?? []}
              loading={loading}
              colorFn={row => TYPE_COLORS[row.type] || DEFAULT_COLOR}
            />
            {!loading && stats?.byType?.length === 0 && (
              <Typography variant="caption" color="text.disabled">Aucune donnée</Typography>
            )}
          </Paper>
        </Grid>

        {/* ── Top marques ── */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Top marques
            </Typography>
            <HBarChart
              rows={stats?.byMarque ?? []}
              loading={loading}
              colorFn={(_, i) => `hsl(${210 + (i ?? 0) * 18}, 65%, 48%)`}
            />
            {!loading && stats?.byMarque?.length === 0 && (
              <Typography variant="caption" color="text.disabled">Aucune donnée</Typography>
            )}
          </Paper>
        </Grid>

        {/* ── Répartition par groupe ── */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Répartition par groupe
            </Typography>
            <HBarChart
              rows={stats?.byGroupe ?? []}
              loading={loading}
              colorFn={row => `hsl(${(parseInt(row.code, 10) || 0) * 37 % 360}, 55%, 45%)`}
            />
            {!loading && stats?.byGroupe?.length === 0 && (
              <Typography variant="caption" color="text.disabled">Aucune donnée</Typography>
            )}
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   TAB APPROBATIONS — Validation des nouveaux garages
════════════════════════════════════════════════════════ */
function TabApprobations() {
  const axios = useAxios();
  const { snack, show, hide } = useSnack();

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/admin/pending-users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch { show("Erreur lors du chargement", "error"); }
    finally { setLoading(false); }
  }, [axios, show]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(id, name) {
    try {
      await axios.put(`/admin/approve/${id}`);
      show(`Accès approuvé pour ${name}`, "success");
      load();
    } catch { show("Erreur lors de l'approbation", "error"); }
  }

  async function handleReject(id, name) {
    try {
      await axios.put(`/admin/reject/${id}`);
      show(`Accès refusé pour ${name}`, "warning");
      load();
    } catch { show("Erreur lors du rejet", "error"); }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Demandes d'accès en attente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Approuvez ou refusez les nouveaux garages qui souhaitent rejoindre la plateforme.
          </Typography>
        </Box>
        <Button size="small" variant="outlined" onClick={load} disabled={loading}>
          {loading ? <CircularProgress size={14} /> : "Actualiser"}
        </Button>
      </Box>

      {users.length === 0 && !loading && (
        <Alert severity="info" icon={<HourglassEmptyIcon />}>
          Aucune demande en attente pour le moment.
        </Alert>
      )}

      {users.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 700, fontSize: 12, color: "text.secondary", bgcolor: "background.default" } }}>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Garage</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Inscription</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} hover>
                <TableCell sx={{ py: 0.8 }}>
                  <Typography variant="caption" fontWeight={700} display="block">
                    {u.firstName} {u.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.8, fontSize: 12 }}>{u.email}</TableCell>
                <TableCell sx={{ py: 0.8 }}>
                  <Typography variant="caption" fontWeight={600} display="block">
                    {u.Garage?.name || "—"}
                  </Typography>
                  {u.Garage?.ville && (
                    <Typography variant="caption" color="text.secondary">
                      {u.Garage.codePostal} {u.Garage.ville}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ py: 0.8, fontSize: 12 }}>{u.Garage?.address || "—"}</TableCell>
                <TableCell sx={{ py: 0.8, fontSize: 12 }}>{u.Garage?.phone || "—"}</TableCell>
                <TableCell sx={{ py: 0.8, fontSize: 11, color: "text.secondary" }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "—"}
                </TableCell>
                <TableCell align="center" sx={{ py: 0.8 }}>
                  <Box display="flex" gap={0.5} justifyContent="center">
                    <Tooltip title="Approuver l'accès">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                        onClick={() => handleApprove(u.id, `${u.firstName} ${u.name}`)}
                        sx={{ fontSize: 11, py: 0.3, px: 1 }}
                      >
                        Approuver
                      </Button>
                    </Tooltip>
                    <Tooltip title="Refuser l'accès">
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                        onClick={() => handleReject(u.id, `${u.firstName} ${u.name}`)}
                        sx={{ fontSize: 11, py: 0.3, px: 1 }}
                      >
                        Refuser
                      </Button>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={hide}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} onClose={hide} sx={{ fontSize: 13 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════════════════════ */
export default function AdminStock() {
  const [tab, setTab] = useState(0);
  const { user } = useUser();
  const garageId = user?.garageId;

  const tabs = [
    { label: "Statistiques",   icon: <BarChartIcon        sx={{ fontSize: 18 }} />, component: <TabStatistiques /> },
    { label: "Marques",        icon: <LocalOfferIcon      sx={{ fontSize: 18 }} />, component: <TabMarques      /> },
    { label: "Fournisseurs",   icon: <StorefrontIcon      sx={{ fontSize: 18 }} />, component: <TabFournisseurs /> },
    { label: "Articles",       icon: <CategoryIcon        sx={{ fontSize: 18 }} />, component: <TabArticles garageId={garageId} /> },
    { label: "Approbations",   icon: <PeopleAltIcon       sx={{ fontSize: 18 }} />, component: <TabApprobations /> },
  ];

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* En-tête */}
      <Box>
        <Typography variant="h5" fontWeight={700}>Administration</Typography>
        <Typography variant="body2" color="text.secondary">
          Gérez les référentiels stock et validez les accès garage
        </Typography>
      </Box>

      <Divider />

      {/* Tabs */}
      <Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          {tabs.map((t, i) => (
            <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />
          ))}
        </Tabs>
        {tabs[tab].component}
      </Box>
    </Box>
  );
}
