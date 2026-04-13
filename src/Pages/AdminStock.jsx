import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
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
  IconButton,
  MenuItem,
  Select,
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
      <Alert severity="info" icon={false}>
        <Typography variant="body2">
          <strong>Import intelligent d'articles depuis Excel.</strong><br />
          Le fichier doit contenir les colonnes suivantes dans l'ordre :<br />
          <em>Nom fournisseur · Marque · Référence ext · Libellé · Prix achat HT · Code groupe · Nom groupe · Code famille · Nom famille</em><br /><br />
          • Fournisseur et Marque sont créés automatiquement s'ils n'existent pas encore.<br />
          • Groupe et Famille sont créés automatiquement si le code n'existe pas pour ce garage.<br />
          • <strong>Prix de vente HT = PA × 2</strong> &nbsp;|&nbsp; <strong>Prix TTC = PUVHT × 1,2</strong> (TVA 20 %)
        </Typography>
      </Alert>

      <Box display="flex" justifyContent="flex-start">
        <ImportArticles garageId={garageId} />
      </Box>
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
    { label: "Marques",      icon: <LocalOfferIcon  sx={{ fontSize: 18 }} />, component: <TabMarques      /> },
    { label: "Fournisseurs", icon: <StorefrontIcon  sx={{ fontSize: 18 }} />, component: <TabFournisseurs /> },
    { label: "Articles",     icon: <CategoryIcon    sx={{ fontSize: 18 }} />, component: <TabArticles garageId={garageId} /> },
  ];

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* En-tête */}
      <Box>
        <Typography variant="h5" fontWeight={700}>Administration — Stock</Typography>
        <Typography variant="body2" color="text.secondary">
          Gérez les référentiels marques, fournisseurs et articles
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
