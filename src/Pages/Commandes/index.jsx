import AddIcon          from "@mui/icons-material/Add";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import DeleteIcon        from "@mui/icons-material/Delete";
import ExpandMoreIcon    from "@mui/icons-material/ExpandMore";
import PrintIcon         from "@mui/icons-material/Print";
import SearchIcon        from "@mui/icons-material/Search";
import SendIcon          from "@mui/icons-material/Send";
import CancelIcon        from "@mui/icons-material/Cancel";
import { generateBdcPdf } from "../../utils/pdf/generateBdcPdf";
import {
  Accordion, AccordionDetails, AccordionSummary,
  Alert, Autocomplete, Box, Button, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Grid, IconButton, InputAdornment, Paper, Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Tooltip, Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import ArticleResultsDialog  from "../../Components/ArticleResultsDialog";
import ArticleSearchDialog   from "../../Components/ArticleSearchDialog";
import { useAxios }          from "../../utils/hook/useAxios";
import { useUser }           from "../../utils/hook/UserContext";
import { useLocation }       from "react-router-dom";

/* ── Statuts ── */
const STATUS_COLOR = { DRAFT:"default", SENT:"info", PARTIAL:"warning", RECEIVED:"success", CANCELLED:"error" };
const STATUS_LABEL = { DRAFT:"Brouillon", SENT:"Envoyé", PARTIAL:"Partiel", RECEIVED:"Réceptionné", CANCELLED:"Annulé" };

/* ─────────────────────────────────────────────────────────────────────
   Dialog BDC
───────────────────────────────────────────────────────────────────── */
function BdcDialog({ open, onClose, garageId, onSaved, initialData }) {
  const axios = useAxios();

  /* En-tête */
  const [fournisseur,   setFournisseur]   = useState(null);
  const [fournisseurs,  setFournisseurs]  = useState([]);
  const [form, setForm] = useState({
    reference: "", date: new Date().toISOString().split("T")[0],
    dateAttendue: "", notes: "",
  });

  /* Lignes locales */
  const [lines,  setLines]  = useState([]);

  /* Search */
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [resultsOpen,   setResultsOpen]   = useState(false);
  const [foundArticles, setFoundArticles] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  /* Chargement fournisseurs */
  useEffect(() => {
    axios.get("/stock/fournisseurs?limit=500")
      .then(r => setFournisseurs(Array.isArray(r?.data) ? r.data : r?.data?.data || []))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Reset + pré-remplissage depuis Besoins */
  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm({ reference: "", date: new Date().toISOString().split("T")[0], dateAttendue: "", notes: "" });

    if (initialData) {
      // Pré-rempli depuis le tab Besoins
      const found = fournisseurs.find(f => f.id === initialData.fournisseurId);
      setFournisseur(found || null);
      setLines(initialData.lines || []);
    } else {
      setFournisseur(null);
      setLines([]);
    }
  }, [open, initialData, fournisseurs]);

  /* Articles sélectionnés → lignes */
  const handleSearchResults = (data) => {
    setFoundArticles(Array.isArray(data) ? data : data?.articles ?? []);
    setSearchOpen(false);
    if ((Array.isArray(data) ? data : data?.articles ?? []).length > 0) setResultsOpen(true);
  };

  const handleSelectArticles = (selected) => {
    const newLines = selected.map(a => ({
      _key:              Date.now() + Math.random(),
      articleId:         a.id,
      refExt:            a.refExt   || "",
      libelle:           a.libelle1 || `Article #${a.id}`,
      marque:            a.Marque?.nom || "",
      quantiteCommandee: 1,
      prixAchatUnitaire: a.ArticlePricing?.prixAchat || "",
    }));
    setLines(prev => [...prev, ...newLines]);
    setResultsOpen(false);
  };

  const updateLine = (key, field, value) =>
    setLines(prev => prev.map(l => l._key === key ? { ...l, [field]: value } : l));

  const removeLine = (key) => setLines(prev => prev.filter(l => l._key !== key));

  /* Sauvegarde (DRAFT) puis envoi optionnel */
  const handleSave = async (sendAfter = false) => {
    if (!lines.length) { setError("Ajoutez au moins un article"); return; }
    if (sendAfter && !fournisseur) { setError("Sélectionnez un fournisseur avant d'envoyer"); return; }
    setSaving(true); setError(null);
    try {
      const res = await axios.post("/purchase-orders", {
        garageId,
        fournisseurId:   fournisseur?.id || null,
        ...form,
        dateAttendue:    form.dateAttendue || null,
        lines: lines.map(l => ({
          articleId:         l.articleId,
          quantiteCommandee: parseFloat(l.quantiteCommandee) || 1,
          prixAchatUnitaire: l.prixAchatUnitaire !== "" ? parseFloat(l.prixAchatUnitaire) : null,
        })),
      });

      if (sendAfter) {
        await axios.post(`/purchase-orders/${res.data.id}/send`);
      }

      onSaved();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const totalQte = lines.reduce((s, l) => s + (parseFloat(l.quantiteCommandee) || 0), 0);
  const totalVal = lines.reduce((s, l) => s + (parseFloat(l.quantiteCommandee) || 0) * (parseFloat(l.prixAchatUnitaire) || 0), 0);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {initialData ? "Bon de commande — pré-rempli depuis les besoins" : "Nouveau bon de commande"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

            {/* Fournisseur — Autocomplete sur la liste DB */}
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Fournisseur <Typography component="span" color="error">*</Typography>
              </Typography>
              <Autocomplete
                options={fournisseurs}
                getOptionLabel={f => f.nom || ""}
                value={fournisseur}
                onChange={(_, v) => setFournisseur(v)}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={params => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Rechercher un fournisseur…"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{option.nom}</Typography>
                      {option.telephone && (
                        <Typography variant="caption" color="text.secondary">{option.telephone}</Typography>
                      )}
                    </Box>
                  </Box>
                )}
              />
            </Box>

            {/* En-tête */}
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField size="small" fullWidth label="Votre référence (optionnel)"
                  value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
              </Grid>
              <Grid item xs={4}>
                <TextField size="small" fullWidth label="Date" type="date"
                  value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={4}>
                <TextField size="small" fullWidth label="Livraison attendue" type="date"
                  value={form.dateAttendue} onChange={e => setForm(f => ({ ...f, dateAttendue: e.target.value }))}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField size="small" fullWidth label="Notes / conditions particulières"
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </Grid>
            </Grid>

            <Divider />

            {/* Recherche article */}
            <Button variant="outlined" startIcon={<SearchIcon />} onClick={() => setSearchOpen(true)} fullWidth
              sx={{ justifyContent: "flex-start", color: "text.secondary", borderStyle: "dashed" }}>
              Rechercher un article à commander…
            </Button>

            {/* Tableau des lignes */}
            {lines.length > 0 ? (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">
                    {lines.length} article{lines.length > 1 ? "s" : ""} · {totalQte} unités commandées
                  </Typography>
                  {totalVal > 0 && (
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      Total estimé : {totalVal.toFixed(2)} €
                    </Typography>
                  )}
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: 700, fontSize: 11, color: "text.secondary" } }}>
                      <TableCell>Réf.</TableCell>
                      <TableCell>Libellé</TableCell>
                      <TableCell>Marque</TableCell>
                      <TableCell align="right" sx={{ width: 110 }}>Qté commandée</TableCell>
                      <TableCell align="right" sx={{ width: 130 }}>PA unitaire (€)</TableCell>
                      <TableCell align="right" sx={{ width: 90 }}>Total</TableCell>
                      <TableCell sx={{ width: 40 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lines.map(l => {
                      const total = (parseFloat(l.quantiteCommandee) || 0) * (parseFloat(l.prixAchatUnitaire) || 0);
                      return (
                        <TableRow key={l._key} hover>
                          <TableCell sx={{ fontSize: 12 }}>{l.refExt || "—"}</TableCell>
                          <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{l.libelle}</TableCell>
                          <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{l.marque}</TableCell>
                          <TableCell align="right">
                            <TextField size="small" type="number" inputProps={{ min: 1, step: 1 }}
                              value={l.quantiteCommandee}
                              onChange={e => updateLine(l._key, "quantiteCommandee", e.target.value)}
                              sx={{ width: 90, "& input": { textAlign: "right" } }} />
                          </TableCell>
                          <TableCell align="right">
                            <TextField size="small" type="number" inputProps={{ min: 0, step: 0.01 }}
                              value={l.prixAchatUnitaire}
                              placeholder="0.00"
                              onChange={e => updateLine(l._key, "prixAchatUnitaire", e.target.value)}
                              sx={{ width: 110, "& input": { textAlign: "right" } }}
                              InputProps={{ endAdornment: <InputAdornment position="end">€</InputAdornment> }} />
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600, color: total > 0 ? "primary.main" : "text.disabled" }}>
                            {total > 0 ? `${total.toFixed(2)} €` : "—"}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Retirer">
                              <IconButton size="small" color="error" onClick={() => removeLine(l._key)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Paper variant="outlined" sx={{ p: 3, textAlign: "center", bgcolor: "action.hover" }}>
                <Typography variant="body2" color="text.secondary">
                  Aucun article ajouté — cliquez sur "Rechercher" pour commencer
                </Typography>
              </Paper>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
          <Button onClick={onClose} color="inherit">Annuler</Button>
          <Button variant="outlined" onClick={() => handleSave(false)}
            disabled={saving || !lines.length}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
            Enregistrer (brouillon)
          </Button>
          <Button variant="contained" color="primary" startIcon={<SendIcon />}
            onClick={() => handleSave(true)}
            disabled={saving || !lines.length || !fournisseur}>
            Enregistrer et envoyer
          </Button>
        </DialogActions>
      </Dialog>

      <ArticleSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onResults={handleSearchResults} />
      <ArticleResultsDialog open={resultsOpen} onClose={() => setResultsOpen(false)}
        results={foundArticles} onSelectMultiple={handleSelectArticles} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Page principale
───────────────────────────────────────────────────────────────────── */
export default function CommandesPage() {
  const axios    = useAxios();
  const { user } = useUser();
  const garageId = user?.garageId;

  const location = useLocation();
  const [bdcs,      setBdcs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [dialog,    setDialog]    = useState({ open: false, initialData: null });
  const [garageInfo,setGarageInfo]= useState({});

  function getCurrentUser() { const s = localStorage.getItem("me"); return s ? JSON.parse(s) : null; }

  useEffect(() => {
    const gId = getCurrentUser()?.garageId;
    if (!gId) return;
    axios.get(`/garages/userid/${gId}`).then(r => setGarageInfo(r.data?.data || {})).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ouvre automatiquement le dialog si on arrive depuis le tab Besoins
  useEffect(() => {
    if (location.state?.openBdc) {
      setDialog({ open: true, initialData: location.state.initialData || null });
      window.history.replaceState({}, ""); // nettoie le state
    }
  }, [location.state]);

  const load = async () => {
    if (!garageId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/purchase-orders/${garageId}`);
      setBdcs(res?.data?.bdcs || []);
    } catch { setBdcs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [garageId]); // eslint-disable-line

  const handleSend = async (id) => {
    try {
      await axios.post(`/purchase-orders/${id}/send`);
      load();
    } catch (e) { alert(e?.response?.data?.message || "Erreur"); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Annuler ce bon de commande ?")) return;
    try {
      await axios.post(`/purchase-orders/${id}/cancel`);
      load();
    } catch (e) { alert(e?.response?.data?.message || "Erreur"); }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Bons de commande</Typography>
          <Typography variant="body2" color="text.secondary">
            Commandes envoyées aux fournisseurs · à réceptionner via la page Réception
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true, initialData: null })}>
          Nouveau BDC
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
      ) : bdcs.length === 0 ? (
        <Alert severity="info">Aucun bon de commande — créez-en un depuis cette page ou depuis l'onglet Besoins du stock.</Alert>
      ) : (
        <Stack spacing={1}>
          {bdcs.map(bdc => {
            const totalQte = (bdc.Lines || []).reduce((s, l) => s + (l.quantiteCommandee || 0), 0);
            const totalVal = (bdc.Lines || []).reduce((s, l) => s + (l.quantiteCommandee || 0) * (l.prixAchatUnitaire || 0), 0);
            return (
              <Accordion key={bdc.id} disableGutters elevation={0}
                sx={{ border: "1px solid", borderColor: "divider", borderRadius: "8px !important", "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={2} flex={1} flexWrap="wrap">
                    <Chip label={STATUS_LABEL[bdc.status]} color={STATUS_COLOR[bdc.status]} size="small" />
                    <Typography fontWeight={600} fontSize={14}>BDC #{bdc.id}</Typography>
                    {bdc.reference && <Typography variant="caption" color="text.secondary">· {bdc.reference}</Typography>}
                    <Typography variant="caption" color="text.secondary">{bdc.date}</Typography>
                    {bdc.Fournisseur && (
                      <Chip label={bdc.Fournisseur.nom} size="small" variant="outlined" color="primary" />
                    )}
                    <Box flex={1} />
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      {bdc.Lines?.length || 0} article{(bdc.Lines?.length || 0) > 1 ? "s" : ""} · {totalQte} unités
                      {totalVal > 0 && ` · ${totalVal.toFixed(2)} €`}
                    </Typography>
                    {/* Actions rapides */}
                    <Tooltip title="Imprimer le BDC">
                      <IconButton size="small" onClick={e => { e.stopPropagation(); generateBdcPdf(bdc, garageInfo); }}>
                        <PrintIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {bdc.status === "DRAFT" && (
                      <Tooltip title="Marquer comme envoyé">
                        <IconButton size="small" color="primary" onClick={e => { e.stopPropagation(); handleSend(bdc.id); }}>
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {["DRAFT", "SENT"].includes(bdc.status) && (
                      <Tooltip title="Annuler">
                        <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); handleCancel(bdc.id); }}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 0 }}>
                  {(bdc.Lines?.length || 0) > 0 && (
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ "& th": { fontSize: 11, color: "text.secondary", fontWeight: 600 } }}>
                          <TableCell>Réf.</TableCell>
                          <TableCell>Libellé</TableCell>
                          <TableCell>Marque</TableCell>
                          <TableCell align="right">Qté commandée</TableCell>
                          <TableCell align="right">Qté reçue</TableCell>
                          <TableCell align="right">PA unit.</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bdc.Lines.map(l => {
                          const reçu  = l.quantiteRecue || 0;
                          const total = (l.quantiteCommandee || 0) * (l.prixAchatUnitaire || 0);
                          return (
                            <TableRow key={l.id} hover>
                              <TableCell sx={{ fontSize: 12 }}>{l.Article?.refExt || "—"}</TableCell>
                              <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{l.Article?.libelle1}</TableCell>
                              <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{l.Article?.Marque?.nom || "—"}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>{l.quantiteCommandee}</TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`${reçu} / ${l.quantiteCommandee}`}
                                  size="small"
                                  color={reçu === 0 ? "default" : reçu < l.quantiteCommandee ? "warning" : "success"}
                                  variant="outlined"
                                  sx={{ fontSize: 11 }}
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: 12, color: "text.secondary" }}>
                                {l.prixAchatUnitaire ? `${parseFloat(l.prixAchatUnitaire).toFixed(2)} €` : "—"}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600, color: total > 0 ? "primary.main" : "text.disabled" }}>
                                {total > 0 ? `${total.toFixed(2)} €` : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                  {bdc.dateAttendue && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, pl: 1, display: "block" }}>
                      Livraison attendue : {bdc.dateAttendue}
                      {bdc.notes && ` · ${bdc.notes}`}
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}

      <BdcDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, initialData: null })}
        garageId={garageId}
        initialData={dialog.initialData}
        onSaved={() => { load(); setDialog({ open: false, initialData: null }); }}
      />
    </Box>
  );
}
