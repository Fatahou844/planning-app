import InventoryIcon        from "@mui/icons-material/Inventory";
import TrendingDownIcon     from "@mui/icons-material/TrendingDown";
import TrendingUpIcon       from "@mui/icons-material/TrendingUp";
import WarningAmberIcon     from "@mui/icons-material/WarningAmber";
import SearchIcon           from "@mui/icons-material/Search";
import EditIcon             from "@mui/icons-material/Edit";
import HistoryIcon          from "@mui/icons-material/History";
import FilterListIcon       from "@mui/icons-material/FilterList";
import ShoppingCartIcon     from "@mui/icons-material/ShoppingCart";
import ErrorOutlineIcon     from "@mui/icons-material/ErrorOutline";
import { useNavigate }      from "react-router-dom";
import {
  Alert, Box, Button, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Grid, IconButton, InputAdornment,
  MenuItem, Paper, Select, Stack,
  Tab, Table, TableBody, TableCell, TableHead,
  TablePagination, TableRow, Tabs, TextField, Tooltip, Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAxios } from "../../utils/hook/useAxios";
import { useUser }  from "../../utils/hook/UserContext";

/* ── Couleurs par type de mouvement ── */
const MVT_CONFIG = {
  ENTREE:            { label: "Entrée",              color: "#2e7d32", bg: "#e8f5e9" },
  SORTIE:            { label: "Sortie",              color: "#c62828", bg: "#ffebee" },
  AJUSTEMENT:        { label: "Ajustement",          color: "#1565c0", bg: "#e3f2fd" },
  RETOUR_CLIENT:     { label: "Retour client",       color: "#2e7d32", bg: "#e8f5e9" },
  RETOUR_FOURNISSEUR:{ label: "Retour fournisseur",  color: "#c62828", bg: "#ffebee" },
  TRANSFERT_ENTREE:  { label: "Transfert entrant",   color: "#00695c", bg: "#e0f2f1" },
  TRANSFERT_SORTIE:  { label: "Transfert sortant",   color: "#e65100", bg: "#fff3e0" },
  SSSP:              { label: "Sortie sans paiement",color: "#6a1b9a", bg: "#f3e5f5" },
  INITIAL:           { label: "Stock initial",       color: "#1565c0", bg: "#e3f2fd" },
};

/* ── Carte résumé ── */
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderLeft: `4px solid ${color}`, borderRadius: 2 }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography variant="h4" fontWeight={700} color={color} mt={0.5}>
            {value === undefined ? <CircularProgress size={24} /> : value}
          </Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
        <Box sx={{ bgcolor: color + "18", borderRadius: 2, p: 1 }}>
          <Icon sx={{ color, fontSize: 28 }} />
        </Box>
      </Box>
    </Paper>
  );
}

/* ── Dialog seuils ── */
function SeuilsDialog({ open, onClose, item, garageId, onSaved }) {
  const axios = useAxios();
  const [seuilMin, setMin] = useState("");
  const [seuilMax, setMax] = useState("");
  const [saving,   setSav] = useState(false);

  useEffect(() => {
    if (item) { setMin(item.seuilMin ?? ""); setMax(item.seuilMax ?? ""); }
  }, [item]);

  const handleSave = async () => {
    setSav(true);
    try {
      await axios.put(`/stock-garage/${garageId}/article/${item.articleId}/seuils`, {
        seuilMin: seuilMin !== "" ? parseFloat(seuilMin) : null,
        seuilMax: seuilMax !== "" ? parseFloat(seuilMax) : null,
      });
      onSaved();
      onClose();
    } catch { }
    finally { setSav(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Seuils — {item?.Article?.libelle1}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField size="small" fullWidth label="Seuil minimum (alerte)" type="number"
            value={seuilMin} onChange={e => setMin(e.target.value)}
            helperText="Alerte quand le stock passe sous ce seuil" />
          <TextField size="small" fullWidth label="Seuil maximum (surstock)" type="number"
            value={seuilMax} onChange={e => setMax(e.target.value)}
            helperText="Indicateur de surstock (informatif)" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Annuler</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>Enregistrer</Button>
      </DialogActions>
    </Dialog>
  );
}

/* ── Dialog historique d'un article ── */
function HistoriqueDialog({ open, onClose, item, garageId }) {
  const axios = useAxios();
  const [mvts, setMvts] = useState([]);
  const [loading, setL] = useState(true);

  useEffect(() => {
    if (!open || !item) return;
    setL(true);
    axios.get(`/stock-garage/mouvements/${garageId}/article/${item.articleId}`)
      .then(r => setMvts(r?.data?.mouvements || []))
      .catch(() => setMvts([]))
      .finally(() => setL(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Historique — {item?.Article?.libelle1}</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress size={24} /></Box>
        ) : mvts.length === 0 ? (
          <Box p={3}><Typography variant="body2" color="text.secondary">Aucun mouvement enregistré.</Typography></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Qté</TableCell>
                <TableCell align="right">Avant</TableCell>
                <TableCell align="right">Après</TableCell>
                <TableCell>Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mvts.map(m => {
                const cfg = MVT_CONFIG[m.type] || { label: m.type, color: "#666", bg: "#f5f5f5" };
                return (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ fontSize: 11, whiteSpace: "nowrap" }}>
                      {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                      <br />
                      <span style={{ color: "#94A3B8" }}>{new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </TableCell>
                    <TableCell>
                      <Chip label={cfg.label} size="small"
                        sx={{ fontSize: 10, bgcolor: cfg.bg, color: cfg.color, fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: MVT_CONFIG[m.type]?.color }}>
                      {["ENTREE","RETOUR_CLIENT","TRANSFERT_ENTREE","INITIAL"].includes(m.type) ? "+" : "−"}
                      {m.quantite}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 12, color: "text.secondary" }}>{m.quantiteAvant}</TableCell>
                    <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600 }}>{m.quantiteApres}</TableCell>
                    <TableCell sx={{ fontSize: 11, color: "text.secondary", maxWidth: 120 }}>
                      <Tooltip title={m.note || ""}><span style={{ overflow: "hidden", display: "block", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.note || "—"}</span></Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Page principale
───────────────────────────────────────────────────────────────────── */
export default function StockDashboard() {
  const axios    = useAxios();
  const theme    = useTheme();
  const { user } = useUser();
  const garageId = user?.garageId;

  const navigate = useNavigate();
  const [tab,      setTab]     = useState(0);
  const [stock,    setStock]   = useState([]);
  const [alerts,   setAlerts]  = useState([]);
  const [mvts,     setMvts]    = useState([]);
  const [besoins,  setBesoins] = useState(null);
  const [loading,  setLoading] = useState(true);
  const [loadMvt,  setLoadMvt] = useState(true);
  const [loadBes,  setLoadBes] = useState(false);

  /* Filtres stock */
  const [search,    setSearch]    = useState("");
  const [mvtFilter, setMvtFilter] = useState("");
  const [page,      setPage]      = useState(0);
  const [rowsPerPage] = useState(25);

  /* Dialogs */
  const [seuilsDialog,    setSeuilsDialog]    = useState({ open: false, item: null });
  const [historiqueDialog, setHistoriqueDialog] = useState({ open: false, item: null });

  /* ── Chargement ── */
  const loadBesoins = async () => {
    if (!garageId) return;
    setLoadBes(true);
    try {
      const res = await axios.get(`/stock-garage/${garageId}/besoins`);
      setBesoins(res?.data || null);
    } catch { setBesoins(null); }
    finally { setLoadBes(false); }
  };

  const loadStock = async () => {
    if (!garageId) return;
    setLoading(true);
    try {
      const [stockRes, alertRes] = await Promise.all([
        axios.get(`/stock-garage/${garageId}`),
        axios.get(`/stock-garage/${garageId}/alerts`),
      ]);
      setStock(stockRes?.data?.stock  || []);
      setAlerts(alertRes?.data?.alerts || []);
    } catch { }
    finally { setLoading(false); }
  };

  const loadMouvements = async () => {
    if (!garageId) return;
    setLoadMvt(true);
    try {
      const params = mvtFilter ? `?type=${mvtFilter}&limit=200` : "?limit=200";
      const res = await axios.get(`/stock-garage/mouvements/${garageId}${params}`);
      setMvts(res?.data?.mouvements || []);
    } catch { }
    finally { setLoadMvt(false); }
  };

  useEffect(() => { loadStock(); loadBesoins(); }, [garageId]); // eslint-disable-line
  useEffect(() => { loadMouvements(); }, [garageId, mvtFilter]); // eslint-disable-line
  useEffect(() => { if (tab === 3 && !besoins) loadBesoins(); }, [garageId, tab]); // eslint-disable-line

  /* ── Filtrage ── */
  const filteredStock = stock.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (s.Article?.libelle1 || "").toLowerCase().includes(q) ||
      (s.Article?.refExt   || "").toLowerCase().includes(q) ||
      (s.Article?.Marque?.nom || "").toLowerCase().includes(q)
    );
  });

  const paginated = filteredStock.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  /* ── Stats ── */
  // Articles avec stock physique
  const totalArticles = stock.length;
  const totalUnites   = stock.reduce((s, i) => s + (i.quantite || 0), 0);
  const valeurEstimee = stock.reduce((s, i) => s + (i.quantite || 0) * (i.Article?.ArticlePricing?.prixAchat || 0), 0);
  // Depuis les besoins (chargés au montage)
  const nbRuptures    = besoins?.totalRuptures ?? 0;
  const nbAlertesSeuil= alerts.length;
  const nbEngages     = besoins?.groupes?.reduce((s, g) => s + g.articles.reduce((ss, a) => ss + (a.blockedOR || 0), 0), 0) ?? 0;
  const nbReserves    = besoins?.groupes?.reduce((s, g) => s + g.articles.reduce((ss, a) => ss + (a.blockedRS || 0), 0), 0) ?? 0;

  return (
    <Box p={3}>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Stock</Typography>
          <Typography variant="body2" color="text.secondary">
            Disponible = physique − engagé OR − réservé client
            {totalArticles === 0 && besoins && (besoins.totalRuptures > 0 || (besoins.groupes?.length ?? 0) > 0) && (
              <Chip label="Aucune réception validée — stock physique = 0" color="warning" size="small" sx={{ ml: 1, fontSize: 11 }} />
            )}
          </Typography>
        </Box>
      </Box>

      {/* Cartes résumé */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={InventoryIcon}    label="En stock physique"
            value={totalArticles.toLocaleString("fr-FR")}
            color="#4F46E5"
            sub={totalUnites > 0 ? `${totalUnites.toLocaleString("fr-FR")} unités` : "Aucune réception validée"} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={TrendingUpIcon}   label="Valeur stock (PA)"
            value={`${valeurEstimee.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
            color="#2e7d32" sub="Stock physique × PA" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={ErrorOutlineIcon} label="Ruptures de stock"
            value={nbRuptures}
            color={nbRuptures > 0 ? "#c62828" : "#2e7d32"}
            sub={nbRuptures > 0 ? "Articles manquants sur OR / Résa" : "Aucune rupture"} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={WarningAmberIcon} label="Alertes seuil min"
            value={nbAlertesSeuil}
            color={nbAlertesSeuil > 0 ? "#e65100" : "#2e7d32"}
            sub={nbAlertesSeuil > 0 ? "Sous le seuil d'alerte" : "Seuils respectés"} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={TrendingDownIcon} label="Unités engagées OR"
            value={nbEngages.toLocaleString("fr-FR")}
            color="#f57c00"
            sub="Bloquées sur OR ouverts" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={ShoppingCartIcon} label="Unités réservées"
            value={nbReserves.toLocaleString("fr-FR")}
            color="#1565c0"
            sub="Promises sur réservations" />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Tab label={`Stock disponible (${totalArticles})`} />
          <Tab label={`Alertes${nbAlertesSeuil > 0 ? ` (${nbAlertesSeuil})` : ""}`}
            sx={nbAlertesSeuil > 0 ? { color: "error.main" } : {}} />
          <Tab label="Mouvements" />
          <Tab
            label={besoins?.totalRuptures > 0 ? `Besoins (${besoins.totalRuptures})` : "Besoins"}
            icon={besoins?.totalRuptures > 0 ? <ErrorOutlineIcon sx={{ fontSize: 16 }} /> : undefined}
            iconPosition="start"
            sx={besoins?.totalRuptures > 0 ? { color: "error.main", fontWeight: 700 } : {}}
          />
        </Tabs>

        {/* ── TAB 0 : Stock disponible ── */}
        {tab === 0 && (
          <Box p={2}>
            <Box display="flex" gap={2} mb={2}>
              <TextField
                size="small" placeholder="Rechercher par libellé, réf, marque…"
                value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                sx={{ flex: 1 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> }}
              />
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : filteredStock.length === 0 ? (
              <Alert severity="info">
                {stock.length === 0 ? "Aucun article en stock — commencez par créer une réception." : "Aucun résultat pour cette recherche."}
              </Alert>
            ) : (
              <>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "background.default", fontSize: 11, color: "text.secondary" } }}>
                      <TableCell>Réf.</TableCell>
                      <TableCell>Libellé</TableCell>
                      <TableCell>Marque</TableCell>
                      <TableCell>Famille</TableCell>
                      <TableCell align="right">Physique</TableCell>
                      <TableCell align="right">Bloqué OR</TableCell>
                      <TableCell align="right">Réservé</TableCell>
                      <TableCell align="right">Disponible</TableCell>
                      <TableCell align="center">Seuil min</TableCell>
                      <TableCell align="right">PA</TableCell>
                      <TableCell align="right">Valeur</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map(s => {
                      const disponible = s.disponible ?? s.quantite;
                      const blockedOR  = s.blockedOR  ?? 0;
                      const blockedRS  = s.blockedRS  ?? 0;
                      const isLow      = s.seuilMin !== null && disponible <= s.seuilMin;
                      const pa         = s.Article?.ArticlePricing?.prixAchat || 0;
                      return (
                        <TableRow key={s.id} hover
                          sx={isLow ? { bgcolor: "#fff8e1" } : {}}>
                          <TableCell sx={{ fontSize: 12 }}>{s.Article?.refExt || "—"}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              {isLow && <WarningAmberIcon sx={{ fontSize: 14, color: "warning.main" }} />}
                              <Typography variant="body2" fontSize={12} fontWeight={isLow ? 600 : 400}>
                                {s.Article?.libelle1 || `#${s.articleId}`}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{s.Article?.Marque?.nom || "—"}</TableCell>
                          <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{s.Article?.Famille?.nom || "—"}</TableCell>
                          {/* Stock physique (total des mouvements) */}
                          <TableCell align="right" sx={{ fontSize: 12, color: "text.secondary" }}>
                            {s.quantite}
                          </TableCell>
                          {/* Bloqué OR */}
                          <TableCell align="right">
                            {blockedOR > 0
                              ? <Chip label={blockedOR} size="small" color="warning" variant="outlined" sx={{ fontSize: 11, fontWeight: 700 }} />
                              : <Typography fontSize={12} color="text.disabled">—</Typography>}
                          </TableCell>
                          {/* Réservé (Résa) */}
                          <TableCell align="right">
                            {blockedRS > 0
                              ? <Chip label={blockedRS} size="small" color="info" variant="outlined" sx={{ fontSize: 11, fontWeight: 700 }} />
                              : <Typography fontSize={12} color="text.disabled">—</Typography>}
                          </TableCell>
                          {/* Disponible = physique − engagé */}
                          <TableCell align="right">
                            <Typography fontWeight={700} fontSize={13}
                              color={isLow ? "error.main" : disponible > 0 ? "success.main" : "text.disabled"}>
                              {disponible}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 12, color: "text.secondary" }}>
                            {s.seuilMin ?? <span style={{ color: "#bbb" }}>—</span>}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: 12, color: "text.secondary" }}>
                            {pa > 0 ? `${pa.toFixed(2)} €` : "—"}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: 12 }}>
                            {pa > 0 ? `${(s.quantite * pa).toFixed(2)} €` : "—"}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Modifier les seuils">
                              <IconButton size="small" onClick={() => setSeuilsDialog({ open: true, item: s })}>
                                <EditIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Voir l'historique">
                              <IconButton size="small" onClick={() => setHistoriqueDialog({ open: true, item: s })}>
                                <HistoryIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={filteredStock.length}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={(_, p) => setPage(p)}
                  rowsPerPageOptions={[25]}
                  labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
                />
              </>
            )}
          </Box>
        )}

        {/* ── TAB 1 : Alertes ── */}
        {tab === 1 && (
          <Box p={2}>
            {alerts.length === 0 ? (
              <Alert severity="success" icon={<InventoryIcon />}>
                Aucune alerte — tous les articles sont au-dessus de leur seuil minimum.
              </Alert>
            ) : (
              <Stack spacing={1}>
                {alerts.map(s => {
                  const pct = s.seuilMax ? Math.round((s.quantite / s.seuilMax) * 100) : null;
                  return (
                    <Paper key={s.id} variant="outlined"
                      sx={{ p: 2, borderLeft: "4px solid", borderColor: "warning.main", borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <WarningAmberIcon sx={{ color: "warning.main", fontSize: 18 }} />
                            <Typography fontWeight={600} fontSize={14}>
                              {s.Article?.libelle1 || `#${s.articleId}`}
                            </Typography>
                            {s.Article?.Marque?.nom && (
                              <Chip label={s.Article.Marque.nom} size="small" variant="outlined" />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                            {s.Article?.refExt || ""} · {s.Article?.Famille?.nom || ""}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box textAlign="center">
                            <Typography variant="caption" color="text.secondary" display="block">Stock actuel</Typography>
                            <Typography fontWeight={700} color="error.main" fontSize={20}>{s.quantite}</Typography>
                          </Box>
                          <Box textAlign="center">
                            <Typography variant="caption" color="text.secondary" display="block">Seuil min</Typography>
                            <Typography fontWeight={600} fontSize={16}>{s.seuilMin}</Typography>
                          </Box>
                          {pct !== null && (
                            <Box textAlign="center">
                              <Typography variant="caption" color="text.secondary" display="block">Taux remplissage</Typography>
                              <Typography fontWeight={600} fontSize={16}>{pct} %</Typography>
                            </Box>
                          )}
                          <Button size="small" variant="outlined" color="warning"
                            onClick={() => setSeuilsDialog({ open: true, item: s })}>
                            Modifier seuils
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>
        )}

        {/* ── TAB 2 : Mouvements ── */}
        {tab === 2 && (
          <Box p={2}>
            <Box display="flex" gap={2} mb={2} alignItems="center">
              <FilterListIcon sx={{ color: "text.secondary" }} />
              <Select size="small" value={mvtFilter} onChange={e => setMvtFilter(e.target.value)}
                displayEmpty sx={{ minWidth: 200 }}>
                <MenuItem value="">Tous les types</MenuItem>
                {Object.entries(MVT_CONFIG).map(([key, cfg]) => (
                  <MenuItem key={key} value={key}>{cfg.label}</MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary">
                {mvts.length} mouvement{mvts.length > 1 ? "s" : ""}
              </Typography>
            </Box>

            {loadMvt ? (
              <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : mvts.length === 0 ? (
              <Alert severity="info">Aucun mouvement enregistré.</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: 700, fontSize: 11, color: "text.secondary" } }}>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Article</TableCell>
                    <TableCell align="right">Quantité</TableCell>
                    <TableCell align="right">Avant → Après</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Note</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mvts.map(m => {
                    const cfg    = MVT_CONFIG[m.type] || { label: m.type, color: "#666", bg: "#f5f5f5" };
                    const isPlus = ["ENTREE","RETOUR_CLIENT","TRANSFERT_ENTREE","INITIAL"].includes(m.type);
                    return (
                      <TableRow key={m.id} hover>
                        <TableCell sx={{ fontSize: 11, whiteSpace: "nowrap" }}>
                          {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                          <Typography variant="caption" color="text.secondary" display="block">
                            {new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={cfg.label} size="small"
                            sx={{ fontSize: 10, bgcolor: cfg.bg, color: cfg.color, fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>
                          <Typography fontSize={12} fontWeight={500}>
                            {m.Article?.libelle1 || `#${m.articleId}`}
                          </Typography>
                          <Typography fontSize={11} color="text.secondary">{m.Article?.refExt || ""}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={700} fontSize={13} color={isPlus ? "success.main" : "error.main"}>
                            {isPlus ? "+" : "−"}{m.quantite}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 12, color: "text.secondary" }}>
                          {m.quantiteAvant} → <strong style={{ color: theme.palette.text.primary }}>{m.quantiteApres}</strong>
                        </TableCell>
                        <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>
                          {m.sourceDocumentType
                            ? `${m.sourceDocumentType} #${m.sourceDocumentId}`
                            : "Manuel"}
                        </TableCell>
                        <TableCell sx={{ fontSize: 11, color: "text.secondary", maxWidth: 150 }}>
                          <Tooltip title={m.note || ""}><span style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{m.note || "—"}</span></Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Box>
        )}

        {/* ── TAB 3 : Besoins / État des lieux ── */}
        {tab === 3 && (
          <Box p={2}>
            {loadBes ? (
              <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : !besoins ? (
              <Alert severity="info">Chargement…</Alert>
            ) : besoins.totalArticles === 0 ? (
              <Alert severity="success" icon={<InventoryIcon />}>
                Aucun besoin détecté — tout le stock est suffisant pour les OR et réservations en cours.
              </Alert>
            ) : (
              <Stack spacing={3}>

                {/* Résumé */}
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderLeft: "4px solid #c62828", borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">Articles en rupture</Typography>
                      <Typography variant="h4" fontWeight={700} color="error.main">{besoins.totalRuptures}</Typography>
                      <Typography variant="caption" color="text.secondary">Disponible &lt; 0</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderLeft: "4px solid #e65100", borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">Alertes seuil min</Typography>
                      <Typography variant="h4" fontWeight={700} color="warning.main">{besoins.totalAlertes}</Typography>
                      <Typography variant="caption" color="text.secondary">Stock bas mais positif</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderLeft: "4px solid #1565c0", borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">Fournisseurs concernés</Typography>
                      <Typography variant="h4" fontWeight={700} color="primary.main">{besoins.groupes.length}</Typography>
                      <Typography variant="caption" color="text.secondary">BDC à créer</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Liste par fournisseur */}
                {besoins.groupes.map(groupe => (
                  <Paper key={groupe.fournisseurId || "none"} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                    {/* En-tête fournisseur */}
                    <Box sx={{ bgcolor: "background.default", px: 2.5, py: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <ShoppingCartIcon sx={{ color: "primary.main", fontSize: 20 }} />
                        <Typography fontWeight={700}>{groupe.fournisseur}</Typography>
                        {groupe.totalRuptures > 0 && (
                          <Chip label={`${groupe.totalRuptures} rupture${groupe.totalRuptures > 1 ? "s" : ""}`} color="error" size="small" />
                        )}
                        <Chip label={`${groupe.articles.length} article${groupe.articles.length > 1 ? "s" : ""}`} size="small" variant="outlined" />
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => navigate("/commandes", {
                          state: {
                            openBdc: true,
                            initialData: {
                              fournisseurId: groupe.fournisseurId,
                              lines: groupe.articles
                                .filter(a => a.deficit > 0)
                                .map(a => ({
                                  _key:              a.articleId,
                                  articleId:         a.articleId,
                                  refExt:            a.refExt   || "",
                                  libelle:           a.libelle  || "",
                                  marque:            a.marque   || "",
                                  quantiteCommandee: a.deficit,
                                  prixAchatUnitaire: a.prixAchat || "",
                                })),
                            },
                          },
                        })}
                      >
                        Créer BDC
                      </Button>
                    </Box>

                    {/* Lignes articles */}
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ "& th": { fontSize: 11, color: "text.secondary", fontWeight: 600 } }}>
                          <TableCell>Réf.</TableCell>
                          <TableCell>Libellé</TableCell>
                          <TableCell>Famille</TableCell>
                          <TableCell align="right">Physique</TableCell>
                          <TableCell align="right">Bloqué OR</TableCell>
                          <TableCell align="right">Réservé</TableCell>
                          <TableCell align="right">Disponible</TableCell>
                          <TableCell align="right" sx={{ color: "error.main !important" }}>Déficit</TableCell>
                          <TableCell align="right">PA unit.</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupe.articles.map(a => (
                          <TableRow key={a.articleId}
                            sx={{
                              bgcolor: a.deficit > 0 ? "#fff5f5" : a.isAlerte ? "#fffde7" : undefined,
                            }}
                          >
                            <TableCell sx={{ fontSize: 12 }}>{a.refExt || "—"}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                {a.deficit > 0
                                  ? <ErrorOutlineIcon sx={{ fontSize: 14, color: "error.main" }} />
                                  : <WarningAmberIcon sx={{ fontSize: 14, color: "warning.main" }} />
                                }
                                <Typography fontSize={12} fontWeight={a.deficit > 0 ? 600 : 400}>
                                  {a.libelle || `#${a.articleId}`}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{a.famille || "—"}</TableCell>
                            <TableCell align="right" sx={{ fontSize: 12, color: "text.secondary" }}>{a.physique}</TableCell>
                            <TableCell align="right">
                              {a.blockedOR > 0 ? <Chip label={a.blockedOR} size="small" color="warning" variant="outlined" sx={{ fontSize: 10 }} /> : <Typography fontSize={12} color="text.disabled">—</Typography>}
                            </TableCell>
                            <TableCell align="right">
                              {a.blockedRS > 0 ? <Chip label={a.blockedRS} size="small" color="info" variant="outlined" sx={{ fontSize: 10 }} /> : <Typography fontSize={12} color="text.disabled">—</Typography>}
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight={700} fontSize={13} color={a.disponible < 0 ? "error.main" : a.disponible === 0 ? "text.disabled" : "success.main"}>
                                {a.disponible}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {a.deficit > 0 ? (
                                <Chip
                                  label={`+${a.deficit} à commander`}
                                  size="small"
                                  color="error"
                                  sx={{ fontSize: 10, fontWeight: 700 }}
                                />
                              ) : <Typography fontSize={12} color="text.disabled">—</Typography>}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: 12, color: "text.secondary" }}>
                              {a.prixAchat ? `${parseFloat(a.prixAchat).toFixed(2)} €` : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Paper>

      {/* Dialogs */}
      <SeuilsDialog
        open={seuilsDialog.open}
        onClose={() => setSeuilsDialog({ open: false, item: null })}
        item={seuilsDialog.item}
        garageId={garageId}
        onSaved={loadStock}
      />
      <HistoriqueDialog
        open={historiqueDialog.open}
        onClose={() => setHistoriqueDialog({ open: false, item: null })}
        item={historiqueDialog.item}
        garageId={garageId}
      />
    </Box>
  );
}
