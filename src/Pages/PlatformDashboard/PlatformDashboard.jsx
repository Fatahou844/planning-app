import AdminStock        from "../AdminStock";
import AddIcon           from "@mui/icons-material/Add";
import InventoryIcon     from "@mui/icons-material/Inventory";
import CancelIcon        from "@mui/icons-material/Cancel";
import CheckCircleIcon   from "@mui/icons-material/CheckCircle";
import DeleteIcon        from "@mui/icons-material/Delete";
import GarageIcon        from "@mui/icons-material/Garage";
import LogoutIcon        from "@mui/icons-material/Logout";
import PeopleAltIcon     from "@mui/icons-material/PeopleAlt";
import PersonAddIcon     from "@mui/icons-material/PersonAdd";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import Visibility        from "@mui/icons-material/Visibility";
import VisibilityOff     from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Avatar,
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
  Paper,
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
import { useNavigate } from "react-router-dom";
import { BASE_URL_API } from "../../config";

const API = `${BASE_URL_API}/v1/platform`;

/* ─── Hook token ──────────────────────────────────────── */
function useToken() {
  return localStorage.getItem("platformAdminToken") || "";
}

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

/* ─── Snack helper ────────────────────────────────────── */
function useSnack() {
  const [s, set] = useState({ open: false, msg: "", sev: "success" });
  const show = (msg, sev = "success") => set({ open: true, msg, sev });
  const hide = () => set(p => ({ ...p, open: false }));
  return { s, show, hide };
}

/* ─── Status badge ────────────────────────────────────── */
const STATUS = {
  "0": { label: "En attente", color: "warning" },
  "1": { label: "Email vérifié", color: "info" },
  "2": { label: "Approuvé", color: "success" },
  "3": { label: "Refusé", color: "error" },
};

/* ════════════════════════════════════════════════════════
   TAB — Approbations
════════════════════════════════════════════════════════ */
function TabApprobations({ token, show }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/pending-users`, { headers: authHeaders(token) });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch { show("Erreur de chargement", "error"); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function act(userId, action) {
    await fetch(`${API}/${action}/${userId}`, { method: "PUT", headers: authHeaders(token) });
    show(action === "approve" ? "Accès approuvé" : "Accès refusé", action === "approve" ? "success" : "warning");
    load();
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          Demandes en attente
          {loading && <CircularProgress size={14} sx={{ ml: 1 }} />}
        </Typography>
        <Button size="small" variant="outlined" onClick={load}>Actualiser</Button>
      </Box>

      {users.length === 0 && !loading && (
        <Alert severity="success">Aucune demande en attente.</Alert>
      )}

      {users.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 700, fontSize: 11, color: "text.secondary", bgcolor: "background.default" } }}>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Garage</TableCell>
              <TableCell>Localisation</TableCell>
              <TableCell>Tél.</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} hover>
                <TableCell sx={{ py: 0.8 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: "primary.main" }}>
                      {(u.firstName?.[0] || "?").toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" fontWeight={700} display="block">
                        {u.firstName} {u.name}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>{u.email}</TableCell>
                <TableCell sx={{ py: 0.8 }}>
                  <Typography variant="caption" fontWeight={600} display="block">{u.Garage?.name || "—"}</Typography>
                </TableCell>
                <TableCell sx={{ fontSize: 11 }}>
                  {[u.Garage?.codePostal, u.Garage?.ville].filter(Boolean).join(" ") || "—"}
                </TableCell>
                <TableCell sx={{ fontSize: 11 }}>{u.Garage?.phone || "—"}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "—"}
                </TableCell>
                <TableCell align="center" sx={{ py: 0.8 }}>
                  <Box display="flex" gap={0.5} justifyContent="center">
                    <Tooltip title="Approuver">
                      <Button size="small" variant="contained" color="success"
                        startIcon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
                        onClick={() => act(u.id, "approve")}
                        sx={{ fontSize: 11, py: 0.3 }}>
                        Approuver
                      </Button>
                    </Tooltip>
                    <Tooltip title="Refuser">
                      <Button size="small" variant="outlined" color="error"
                        startIcon={<CancelIcon sx={{ fontSize: 13 }} />}
                        onClick={() => act(u.id, "reject")}
                        sx={{ fontSize: 11, py: 0.3 }}>
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
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   TAB — Garages
════════════════════════════════════════════════════════ */
function GarageRow({ g }) {
  const [open, setOpen] = useState(false);
  const users = g.Users || [];

  const approved  = users.filter(u => u.status === "2").length;
  const pending   = users.filter(u => u.status === "0").length;

  return (
    <>
      <TableRow
        hover
        onClick={() => setOpen(v => !v)}
        sx={{ cursor: "pointer", bgcolor: open ? "action.selected" : undefined }}
      >
        {/* Expand icon */}
        <TableCell sx={{ py: 0.8, pl: 1.5, width: 32 }}>
          <IconButton size="small" sx={{ p: 0 }}>
            {open
              ? <DeleteIcon sx={{ fontSize: 14, transform: "rotate(45deg)", color: "text.disabled" }} />
              : <AddIcon    sx={{ fontSize: 14, color: "text.disabled" }} />}
          </IconButton>
        </TableCell>

        {/* Nom + ID */}
        <TableCell sx={{ py: 0.8 }}>
          <Typography variant="caption" fontWeight={700} display="block">{g.name}</Typography>
          <Typography variant="caption" color="text.disabled">#{g.id}</Typography>
        </TableCell>

        {/* Localisation */}
        <TableCell sx={{ fontSize: 11 }}>
          {g.address
            ? <><span style={{ display: "block" }}>{g.address}</span>
               <span style={{ color: "#888" }}>{[g.codePostal, g.ville].filter(Boolean).join(" ")}</span></>
            : [g.codePostal, g.ville].filter(Boolean).join(" ") || "—"}
        </TableCell>

        {/* Contact */}
        <TableCell sx={{ fontSize: 11 }}>
          {g.email && <span style={{ display: "block" }}>{g.email}</span>}
          {g.phone && <span style={{ color: "#888" }}>{g.phone}</span>}
          {!g.email && !g.phone && "—"}
        </TableCell>

        {/* Utilisateurs résumé */}
        <TableCell sx={{ py: 0.8 }}>
          <Box display="flex" gap={0.5} alignItems="center" flexWrap="wrap">
            <Chip label={`${users.length} utilisateur${users.length > 1 ? "s" : ""}`}
              size="small" variant="outlined"
              sx={{ fontSize: "0.6rem", height: 18 }} />
            {approved > 0 && (
              <Chip label={`${approved} approuvé${approved > 1 ? "s" : ""}`}
                size="small" color="success" variant="outlined"
                sx={{ fontSize: "0.6rem", height: 18 }} />
            )}
            {pending > 0 && (
              <Chip label={`${pending} en attente`}
                size="small" color="warning" variant="filled"
                sx={{ fontSize: "0.6rem", height: 18 }} />
            )}
          </Box>
        </TableCell>

        {/* Date */}
        <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>
          {g.createdAt ? new Date(g.createdAt).toLocaleDateString("fr-FR") : "—"}
        </TableCell>
      </TableRow>

      {/* Ligne dépliable — liste des utilisateurs */}
      {open && users.length > 0 && (
        <TableRow>
          <TableCell colSpan={6} sx={{ py: 0, bgcolor: "action.hover" }}>
            <Box px={3} py={1.5}>
              <Typography variant="caption" fontWeight={700} color="text.secondary"
                sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 1 }}>
                Utilisateurs du garage
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { fontSize: 10, color: "text.disabled", fontWeight: 700, border: "none", py: 0.3 } }}>
                    <TableCell>Nom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell sx={{ fontSize: 11, py: 0.4, border: "none", fontWeight: 600 }}>
                        {u.firstName} {u.name}
                      </TableCell>
                      <TableCell sx={{ fontSize: 11, py: 0.4, border: "none", color: "text.secondary" }}>
                        {u.email}
                      </TableCell>
                      <TableCell sx={{ fontSize: 11, py: 0.4, border: "none" }}>
                        {u.role || u.level || "—"}
                      </TableCell>
                      <TableCell sx={{ py: 0.4, border: "none" }}>
                        <Chip
                          label={STATUS[u.status]?.label || "—"}
                          size="small"
                          color={STATUS[u.status]?.color || "default"}
                          variant="outlined"
                          sx={{ fontSize: "0.6rem", height: 18 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function TabGarages({ token }) {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    fetch(`${API}/garages`, { headers: authHeaders(token) })
      .then(r => r.json())
      .then(d => setGarages(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = garages.filter(g =>
    !search.trim() ||
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.ville?.toLowerCase().includes(search.toLowerCase()) ||
    g.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* En-tête + stats + recherche */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} gap={2} flexWrap="wrap">
        <Box display="flex" gap={2}>
          <Paper variant="outlined" sx={{ px: 2, py: 1, textAlign: "center", minWidth: 100 }}>
            <Typography variant="h5" fontWeight={800}>{garages.length}</Typography>
            <Typography variant="caption" color="text.secondary">Garage{garages.length > 1 ? "s" : ""}</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ px: 2, py: 1, textAlign: "center", minWidth: 100 }}>
            <Typography variant="h5" fontWeight={800} color="success.main">
              {garages.filter(g => (g.Users || []).some(u => u.status === "2")).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">Actifs</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ px: 2, py: 1, textAlign: "center", minWidth: 100 }}>
            <Typography variant="h5" fontWeight={800} color="warning.main">
              {garages.filter(g => (g.Users || []).some(u => u.status === "0")).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">En attente</Typography>
          </Paper>
        </Box>

        <TextField
          size="small"
          placeholder="Rechercher par nom, ville, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 280 }}
        />
      </Box>

      {loading && <Box pt={4} textAlign="center"><CircularProgress /></Box>}

      {!loading && filtered.length === 0 && (
        <Alert severity="info">Aucun garage trouvé.</Alert>
      )}

      {!loading && filtered.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 700, fontSize: 11, color: "text.secondary", bgcolor: "background.default" } }}>
              <TableCell sx={{ width: 32 }} />
              <TableCell>Garage</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Utilisateurs</TableCell>
              <TableCell>Inscription</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(g => <GarageRow key={g.id} g={g} />)}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   TAB — Admins plateforme
════════════════════════════════════════════════════════ */
function TabAdmins({ token, show, currentId }) {
  const [admins,   setAdmins]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [addOpen,  setAddOpen]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [form,     setForm]     = useState({ firstName: "", name: "", email: "", password: "" });
  const [saving,   setSaving]   = useState(false);
  const [formErr,  setFormErr]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch(`${API}/admins`, { headers: authHeaders(token) });
    const data = await res.json();
    setAdmins(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    setFormErr(null);
    if (!form.firstName || !form.name || !form.email || !form.password) {
      setFormErr("Tous les champs sont requis."); return;
    }
    setSaving(true);
    try {
      const res  = await fetch(`${API}/admins`, {
        method: "POST", headers: authHeaders(token),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormErr(data.message); return; }
      show(`Admin ${form.firstName} ${form.name} créé`, "success");
      setAddOpen(false);
      setForm({ firstName: "", name: "", email: "", password: "" });
      load();
    } catch { setFormErr("Erreur serveur."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Supprimer l'admin ${name} ?`)) return;
    await fetch(`${API}/admins/${id}`, { method: "DELETE", headers: authHeaders(token) });
    show(`Admin ${name} supprimé`, "warning");
    load();
  }

  const setF = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={700}>Admins plateforme</Typography>
        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Ajouter un admin
        </Button>
      </Box>

      {loading ? <CircularProgress size={20} /> : (
        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 700, fontSize: 11, color: "text.secondary", bgcolor: "background.default" } }}>
              <TableCell>Prénom Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Créé le</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.map(a => (
              <TableRow key={a.id} hover sx={a.id === currentId ? { bgcolor: "primary.50" } : {}}>
                <TableCell sx={{ py: 0.8 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: "primary.main" }}>
                      {a.firstName?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography variant="caption" fontWeight={700}>
                      {a.firstName} {a.name}
                      {a.id === currentId && <Chip label="Vous" size="small" color="primary" sx={{ ml: 0.5, fontSize: "0.55rem", height: 16 }} />}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>{a.email}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString("fr-FR") : "—"}
                </TableCell>
                <TableCell align="center" sx={{ py: 0.8 }}>
                  {a.id !== currentId && (
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => handleDelete(a.id, `${a.firstName} ${a.name}`)}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Dialog ajout admin */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 15 }}>Nouvel admin plateforme</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Box display="flex" gap={1.5}>
              <TextField label="Prénom" name="firstName" size="small" fullWidth value={form.firstName} onChange={setF} />
              <TextField label="Nom"    name="name"      size="small" fullWidth value={form.name}      onChange={setF} />
            </Box>
            <TextField label="Email" name="email" type="email" size="small" fullWidth value={form.email} onChange={setF} />
            <TextField
              label="Mot de passe" name="password"
              type={showPwd ? "text" : "password"}
              size="small" fullWidth value={form.password} onChange={setF}
              InputProps={{ endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )}}
            />
            {formErr && <Alert severity="error" sx={{ py: 0.5, fontSize: 12 }}>{formErr}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} size="small">Annuler</Button>
          <Button variant="contained" size="small" onClick={handleAdd} disabled={saving}
            startIcon={saving ? <CircularProgress size={13} color="inherit" /> : null}>
            {saving ? "Création…" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   PAGE PRINCIPALE
════════════════════════════════════════════════════════ */
export default function PlatformDashboard() {
  const navigate   = useNavigate();
  const token      = useToken();
  const { s, show, hide } = useSnack();

  const [adminInfo, setAdminInfo] = useState(null);
  const [tab,       setTab]       = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  /* ── Vérification du token au montage ── */
  useEffect(() => {
    if (!token) { navigate("/platform-login"); return; }
    const stored = localStorage.getItem("platformAdminInfo");
    if (stored) setAdminInfo(JSON.parse(stored));

    // Vérifier le token côté serveur
    fetch(`${API}/me`, { headers: authHeaders(token) })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(a => { setAdminInfo(a); localStorage.setItem("platformAdminInfo", JSON.stringify(a)); })
      .catch(() => { localStorage.removeItem("platformAdminToken"); navigate("/platform-login"); });
  }, [token, navigate]);

  /* ── Compter les demandes en attente ── */
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/pending-users`, { headers: authHeaders(token) })
      .then(r => r.json())
      .then(d => setPendingCount(Array.isArray(d) ? d.length : 0))
      .catch(() => {});
  }, [token]);

  function handleLogout() {
    localStorage.removeItem("platformAdminToken");
    localStorage.removeItem("platformAdminInfo");
    navigate("/platform-login");
  }

  const tabs = [
    {
      label: pendingCount > 0 ? `Approbations (${pendingCount})` : "Approbations",
      icon:  <PeopleAltIcon sx={{ fontSize: 18 }} />,
      color: pendingCount > 0 ? "warning.main" : undefined,
      component: <TabApprobations token={token} show={show} />,
    },
    {
      label: "Garages",
      icon:  <GarageIcon sx={{ fontSize: 18 }} />,
      component: <TabGarages token={token} />,
    },
    {
      label: "Gestion stock",
      icon:  <InventoryIcon sx={{ fontSize: 18 }} />,
      component: (
        <Box sx={{ bgcolor: "background.default", borderRadius: 2, p: 3 }}>
          <AdminStock />
        </Box>
      ),
    },
    {
      label: "Admins plateforme",
      icon:  <SupervisorAccountIcon sx={{ fontSize: 18 }} />,
      component: <TabAdmins token={token} show={show} currentId={adminInfo?.id} />,
    },
  ];

  return (
    <Box minHeight="100vh" sx={{ bgcolor: "background.default" }}>
      {/* ── Navbar plateforme ── */}
      <Paper
        elevation={0}
        square
        sx={{
          px: 4, py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#0f172a",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: "primary.main",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SupervisorAccountIcon sx={{ fontSize: 16, color: "#fff" }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={800} color="#fff">
            Admin Plateforme
          </Typography>
          <Chip label="ZP Digital" size="small" color="primary" variant="outlined"
            sx={{ fontSize: "0.6rem", height: 18, borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.6)" }} />
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {adminInfo && (
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
              {adminInfo.firstName} {adminInfo.name}
            </Typography>
          )}
          <Tooltip title="Déconnexion">
            <IconButton size="small" onClick={handleLogout} sx={{ color: "rgba(255,255,255,0.6)" }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* ── Contenu ── */}
      <Box maxWidth={1200} mx="auto" px={3} py={4}>
        {/* Stats */}
        <Box display="flex" gap={2} mb={4}>
          {[
            { label: "Demandes en attente", value: pendingCount, color: "warning.main", icon: <PeopleAltIcon /> },
          ].map(stat => (
            <Paper key={stat.label} variant="outlined" sx={{ px: 3, py: 2, display: "flex", alignItems: "center", gap: 2, minWidth: 200 }}>
              <Box sx={{ color: stat.color }}>{stat.icon}</Box>
              <Box>
                <Typography variant="h5" fontWeight={800}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          {tabs.map((t, i) => (
            <Tab key={i} label={t.label} icon={t.icon} iconPosition="start"
              sx={t.color ? { color: t.color, fontWeight: 700 } : {}} />
          ))}
        </Tabs>

        {tabs[tab].component}
      </Box>

      <Snackbar open={s.open} autoHideDuration={3500} onClose={hide}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={s.sev} onClose={hide} sx={{ fontSize: 13 }}>{s.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
