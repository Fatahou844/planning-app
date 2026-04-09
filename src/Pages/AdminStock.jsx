import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
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
import { useCallback, useEffect, useState } from "react";
import ImportFournisseurs from "../Components/Store/ImportFournisseurs/ImportFournisseurs";
import ImportMarques from "../Components/Store/ImportMarques/ImportMarques";
import { useAxios } from "../utils/hook/useAxios";

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
function TabMarques() {
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
   TAB FOURNISSEURS
════════════════════════════════════════════════════════ */
function TabFournisseurs() {
  const axios = useAxios();
  const { snack, show, hide } = useSnack();

  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [search,       setSearch]       = useState("");

  // Modales
  const [addOpen,    setAddOpen]    = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const emptyForm = { nom: "", code: "", adresse1: "", adresse2: "", adresse3: "", telephone: "", telex: "" };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/stock/fournisseurs");
      setFournisseurs(res?.data || []);
    } finally {
      setLoading(false);
    }
  }, [axios]);

  useEffect(() => { load(); }, [load]);

  const filtered = fournisseurs.filter((f) =>
    (f.nom  || "").toLowerCase().includes(search.toLowerCase()) ||
    (f.code || "").toLowerCase().includes(search.toLowerCase())
  );

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  /* ── Créer ── */
  const handleCreate = async () => {
    if (!form.nom.trim() && !form.code.trim()) return;
    setSaving(true);
    try {
      await axios.post("/stock/fournisseurs", form);
      setAddOpen(false); setForm(emptyForm);
      show("Fournisseur créé");
      load();
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
      load();
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
      load();
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
        <TextField fullWidth label="Libellé / Raison sociale" value={form.nom}  onChange={setField("nom")} required />
      </Box>
      <TextField fullWidth label="Zone Adresse 1" value={form.adresse1}  onChange={setField("adresse1")} />
      <TextField fullWidth label="Zone Adresse 2" value={form.adresse2}  onChange={setField("adresse2")} />
      <TextField fullWidth label="Zone Adresse 3" value={form.adresse3}  onChange={setField("adresse3")} />
      <Box display="flex" gap={2}>
        <TextField fullWidth label="Téléphone"  value={form.telephone} onChange={setField("telephone")} />
        <TextField fullWidth label="N° Telex"   value={form.telex}     onChange={setField("telex")} />
      </Box>
    </Box>
  );

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Toolbar */}
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <TextField
          size="small" placeholder="Rechercher par nom ou code…" value={search}
          onChange={(e) => setSearch(e.target.value)} sx={{ width: 280 }}
        />
        <Box flex={1} />
        <ImportFournisseurs onSuccess={load} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(emptyForm); setAddOpen(true); }}>
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
                <TableCell sx={{ fontWeight: 700, width: 90  }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Libellé</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Adresse</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 130 }}>Téléphone</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100 }}>Telex</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 100 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" py={2}>Aucun fournisseur</Typography>
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((f) => (
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

      <Typography variant="caption" color="text.secondary">{filtered.length} fournisseur(s)</Typography>

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
   PAGE PRINCIPALE
════════════════════════════════════════════════════════ */
export default function AdminStock() {
  const [tab, setTab] = useState(0);

  const tabs = [
    { label: "Marques",      icon: <LocalOfferIcon  sx={{ fontSize: 18 }} />, component: <TabMarques      /> },
    { label: "Fournisseurs", icon: <StorefrontIcon  sx={{ fontSize: 18 }} />, component: <TabFournisseurs /> },
  ];

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* En-tête */}
      <Box>
        <Typography variant="h5" fontWeight={700}>Administration — Stock</Typography>
        <Typography variant="body2" color="text.secondary">
          Gérez les référentiels marques et fournisseurs
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
