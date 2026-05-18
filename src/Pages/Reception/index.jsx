import AddIcon          from "@mui/icons-material/Add";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import DeleteIcon       from "@mui/icons-material/Delete";
import ExpandMoreIcon   from "@mui/icons-material/ExpandMore";
import PrintIcon        from "@mui/icons-material/Print";
import SearchIcon       from "@mui/icons-material/Search";
import { generateBrPdf } from "../../utils/pdf/generateBrPdf";
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

/* ── Couleur statut ── */
const STATUS_COLOR = { DRAFT: "warning", VALIDATED: "success", CANCELLED: "error" };
const STATUS_LABEL = { DRAFT: "Brouillon", VALIDATED: "Validé", CANCELLED: "Annulé" };

/* ─────────────────────────────────────────────────────────────────────
   Dialog BR — même flux de recherche article que ForfaitSearch
───────────────────────────────────────────────────────────────────── */
function BrDialog({ open, onClose, garageId, onSaved }) {
  const axios  = useAxios();

  /* Fournisseur */
  const [fournisseur,  setFournisseur]  = useState(null);
  const [fournisseurs, setFournisseurs] = useState([]);

  /* BDC lié (optionnel) */
  const [bdcLie,  setBdcLie]  = useState(null);
  const [bdcList, setBdcList] = useState([]);

  /* En-tête */
  const [form, setForm] = useState({
    reference: "",
    date:      new Date().toISOString().split("T")[0],
    notes:     "",
  });

  /* Lignes en attente (locales — pas encore envoyées) */
  const [lines, setLines] = useState([]);

  /* États ArticleSearchDialog / ArticleResultsDialog */
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [resultsOpen,  setResultsOpen]  = useState(false);
  const [foundArticles, setFoundArticles] = useState([]);

  /* Soumission */
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  /* Chargement liste fournisseurs */
  useEffect(() => {
    axios.get("/stock/fournisseurs?limit=500")
      .then(r => setFournisseurs(Array.isArray(r?.data) ? r.data : r?.data?.data || []))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Chargement BDC ouverts quand fournisseur sélectionné */
  useEffect(() => {
    setBdcLie(null);
    setBdcList([]);
    if (!fournisseur || !garageId) return;
    // Récupérer BDC SENT et PARTIAL (reliquats)
    Promise.all([
      axios.get(`/purchase-orders/${garageId}?status=SENT`),
      axios.get(`/purchase-orders/${garageId}?status=PARTIAL`),
    ]).then(([r1, r2]) => {
        const tous = [...(r1?.data?.bdcs || []), ...(r2?.data?.bdcs || [])];
        setBdcList(tous.filter(b => b.fournisseurId === fournisseur.id));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fournisseur]);

  /* Reset à chaque ouverture */
  useEffect(() => {
    if (open) {
      setFournisseur(null);
      setForm({ reference: "", date: new Date().toISOString().split("T")[0], notes: "" });
      setLines([]);
      setError(null);
    }
  }, [open]);

  /* ── Réception des résultats de ArticleSearchDialog ── */
  const handleSearchResults = (data) => {
    const articles = Array.isArray(data) ? data : (data?.articles ?? []);
    setFoundArticles(articles);
    setSearchOpen(false);
    if (articles.length > 0) setResultsOpen(true);
  };

  /* ── Sélection depuis ArticleResultsDialog → ajout de lignes ── */
  const handleSelectArticles = (selected) => {
    const newLines = selected.map(a => ({
      _key:              Date.now() + Math.random(), // clé locale unique
      articleId:         a.id,
      refExt:            a.refExt     || "",
      libelle:           a.libelle1   || `Article #${a.id}`,
      marque:            a.Marque?.nom || "",
      prixAchatDefault:  a.ArticlePricing?.prixAchat || 0,
      quantiteRecue:     1,
      prixAchatUnitaire: a.ArticlePricing?.prixAchat || "",
    }));
    setLines(prev => [...prev, ...newLines]);
    setResultsOpen(false);
  };

  /* ── Modifier quantité / prix d'une ligne locale ── */
  const updateLine = (key, field, value) => {
    setLines(prev => prev.map(l => l._key === key ? { ...l, [field]: value } : l));
  };

  const removeLine = (key) => {
    setLines(prev => prev.filter(l => l._key !== key));
  };

  /* ── Valider : créer BR + lignes + valider en une passe ── */
  const handleValidate = async () => {
    if (!lines.length) { setError("Ajoutez au moins un article avant de valider"); return; }
    setSaving(true);
    setError(null);
    try {
      // 1. Créer le BR
      const brRes = await axios.post("/goods-receipts", {
        garageId,
        fournisseurId:   fournisseur?.id || null,
        purchaseOrderId: bdcLie?.id      || null,
        ...form,
      });
      const brId  = brRes.data.id;

      // 2. Ajouter toutes les lignes
      for (const line of lines) {
        await axios.post(`/goods-receipts/${brId}/lines`, {
          articleId:         line.articleId,
          quantiteRecue:     parseFloat(line.quantiteRecue)     || 1,
          prixAchatUnitaire: line.prixAchatUnitaire !== "" ? parseFloat(line.prixAchatUnitaire) : null,
        });
      }

      // 3. Valider → déclenche les StockMouvements
      const validRes = await axios.post(`/goods-receipts/${brId}/validate`);
      onSaved(validRes.data);
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur lors de la validation");
    } finally {
      setSaving(false);
    }
  };

  const totalQte = lines.reduce((s, l) => s + (parseFloat(l.quantiteRecue) || 0), 0);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Nouvelle réception</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

            {/* Fournisseur */}
            <Box>
              <Typography variant="subtitle2" mb={1}>Fournisseur</Typography>
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

            {/* BDC lié — affiché seulement si fournisseur sélectionné */}
            {fournisseur && (
              <Box>
                <Typography variant="subtitle2" mb={1}>
                  Bon de commande associé
                  <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                    (optionnel — met à jour le BDC automatiquement à la validation)
                  </Typography>
                </Typography>
                {bdcList.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    Aucun BDC ouvert pour ce fournisseur — vous pouvez tout de même créer un BR libre.
                  </Typography>
                ) : (
                  <Autocomplete
                    options={bdcList}
                    getOptionLabel={b => `BDC #${b.id}${b.reference ? ` · ${b.reference}` : ""} · ${b.date} · ${b.Lines?.length || 0} article(s)`}
                    value={bdcLie}
                    onChange={(_, v) => {
                      setBdcLie(v);
                      // Pré-remplir les lignes depuis le BDC sélectionné (reliquat)
                      if (v?.Lines?.length) {
                        const preLines = v.Lines
                          .filter(l => {
                            const restant = l.quantiteCommandee - (l.quantiteRecue || 0);
                            return restant > 0;
                          })
                          .map(l => ({
                            _key:              Date.now() + Math.random(),
                            articleId:         l.articleId,
                            refExt:            l.Article?.refExt   || "",
                            libelle:           l.Article?.libelle1 || `Article #${l.articleId}`,
                            marque:            l.Article?.Marque?.nom || "",
                            prixAchatDefault:  l.Article?.ArticlePricing?.prixAchat || 0,
                            quantiteRecue:     l.quantiteCommandee - (l.quantiteRecue || 0),
                            prixAchatUnitaire: l.prixAchatUnitaire || "",
                          }));
                        setLines(preLines);
                      }
                    }}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    renderInput={params => (
                      <TextField {...params} size="small"
                        placeholder="Sélectionner un bon de commande ouvert…" />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={option.id}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            BDC #{option.id}{option.reference ? ` · ${option.reference}` : ""}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.date} · {option.Lines?.length || 0} article(s) commandé(s)
                            {option.status === "PARTIAL" && " · Réception partielle en cours"}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                )}
              </Box>
            )}

            {/* En-tête BR */}
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField size="small" fullWidth label="N° BL fournisseur (référence)"
                  value={form.reference}
                  onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
              </Grid>
              <Grid item xs={4}>
                <TextField size="small" fullWidth label="Date" type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={4}>
                <TextField size="small" fullWidth label="Notes"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </Grid>
            </Grid>

            <Divider />

            {/* Bouton recherche article */}
            <Box>
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={() => setSearchOpen(true)}
                fullWidth
                sx={{ justifyContent: "flex-start", color: "text.secondary", borderStyle: "dashed" }}
              >
                Rechercher un article à réceptionner…
              </Button>
            </Box>

            {/* Tableau des lignes */}
            {lines.length > 0 ? (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">
                    {lines.length} article{lines.length > 1 ? "s" : ""} · {totalQte} unité{totalQte > 1 ? "s" : ""} au total
                  </Typography>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: 700, fontSize: 11, color: "text.secondary" } }}>
                      <TableCell>Réf.</TableCell>
                      <TableCell>Libellé</TableCell>
                      <TableCell>Marque</TableCell>
                      <TableCell align="right" sx={{ width: 110 }}>Qté reçue</TableCell>
                      <TableCell align="right" sx={{ width: 130 }}>PA unitaire (€)</TableCell>
                      <TableCell sx={{ width: 40 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lines.map(l => (
                      <TableRow key={l._key} hover>
                        <TableCell sx={{ fontSize: 12 }}>{l.refExt || "—"}</TableCell>
                        <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{l.libelle}</TableCell>
                        <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{l.marque}</TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small" type="number" inputProps={{ min: 0.01, step: 0.01 }}
                            value={l.quantiteRecue}
                            onChange={e => updateLine(l._key, "quantiteRecue", e.target.value)}
                            sx={{ width: 90, "& input": { textAlign: "right" } }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small" type="number" inputProps={{ min: 0, step: 0.01 }}
                            value={l.prixAchatUnitaire}
                            placeholder={l.prixAchatDefault ? `${l.prixAchatDefault}` : "0.00"}
                            onChange={e => updateLine(l._key, "prixAchatUnitaire", e.target.value)}
                            sx={{ width: 110, "& input": { textAlign: "right" } }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">€</InputAdornment>,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Retirer">
                            <IconButton size="small" color="error" onClick={() => removeLine(l._key)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
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
          <Button
            variant="contained" color="success"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
            onClick={handleValidate}
            disabled={saving || !lines.length}
          >
            {saving ? "Validation en cours…" : `Valider la réception (${lines.length} article${lines.length > 1 ? "s" : ""})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ArticleSearchDialog — même composant que partout dans l'app */}
      <ArticleSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onResults={handleSearchResults}
      />

      {/* ArticleResultsDialog — multi-sélection */}
      <ArticleResultsDialog
        open={resultsOpen}
        onClose={() => setResultsOpen(false)}
        results={foundArticles}
        onSelectMultiple={handleSelectArticles}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Page principale
───────────────────────────────────────────────────────────────────── */
export default function ReceptionPage() {
  const axios    = useAxios();
  const { user } = useUser();
  const garageId = user?.garageId;

  const [brs,       setBrs]       = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [dialog,    setDialog]    = useState(false);
  const [garageInfo,setGarageInfo]= useState({});

  function getCurrentUser() { const s = localStorage.getItem("me"); return s ? JSON.parse(s) : null; }

  useEffect(() => {
    const gId = getCurrentUser()?.garageId;
    if (!gId) return;
    axios.get(`/garages/userid/${gId}`).then(r => setGarageInfo(r.data?.data || {})).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    if (!garageId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/goods-receipts/${garageId}`);
      setBrs(res?.data?.brs || []);
    } catch { setBrs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [garageId]); // eslint-disable-line

  return (
    <Box p={3}>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Réceptions fournisseur</Typography>
          <Typography variant="body2" color="text.secondary">
            Seule source de création du stock physique
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog(true)}>
          Nouvelle réception
        </Button>
      </Box>

      {/* Liste des BR */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
      ) : brs.length === 0 ? (
        <Alert severity="info">Aucune réception enregistrée pour ce garage.</Alert>
      ) : (
        <Stack spacing={1}>
          {brs.map(br => (
            <Accordion key={br.id} disableGutters elevation={0}
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: "8px !important", "&:before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={2} flex={1} flexWrap="wrap">
                  <Chip label={STATUS_LABEL[br.status]} color={STATUS_COLOR[br.status]} size="small" />
                  <Typography fontWeight={600} fontSize={14}>BR #{br.id}</Typography>
                  {br.reference && (
                    <Typography variant="caption" color="text.secondary">· {br.reference}</Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">{br.date}</Typography>
                  {br.Fournisseur && <Chip label={br.Fournisseur.nom} size="small" variant="outlined" />}
                  <Box flex={1} />
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    {br.Lines?.length || 0} article{(br.Lines?.length || 0) > 1 ? "s" : ""}
                    {" · "}
                    {(br.Lines || []).reduce((s, l) => s + (parseFloat(l.quantiteRecue) || 0), 0)} unités
                  </Typography>
                  <Tooltip title="Imprimer le BR">
                    <IconButton size="small" onClick={e => { e.stopPropagation(); generateBrPdf(br, garageInfo); }}>
                      <PrintIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {(br.Lines?.length || 0) > 0 && (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ "& th": { fontSize: 11, color: "text.secondary", fontWeight: 600 } }}>
                        <TableCell>Réf.</TableCell>
                        <TableCell>Libellé</TableCell>
                        <TableCell>Marque</TableCell>
                        <TableCell align="right">Qté reçue</TableCell>
                        <TableCell align="right">PA unit.</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {br.Lines.map(l => (
                        <TableRow key={l.id} hover>
                          <TableCell sx={{ fontSize: 12 }}>{l.Article?.refExt || "—"}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{l.Article?.libelle1 || `#${l.articleId}`}</TableCell>
                          <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{l.Article?.Marque?.nom || ""}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{l.quantiteRecue}</TableCell>
                          <TableCell align="right" sx={{ fontSize: 12, color: "text.secondary" }}>
                            {l.prixAchatUnitaire ? `${parseFloat(l.prixAchatUnitaire).toFixed(2)} €` : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {br.notes && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", pl: 1 }}>
                    Note : {br.notes}
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}

      {/* Dialog nouvelle réception */}
      <BrDialog
        open={dialog}
        onClose={() => setDialog(false)}
        garageId={garageId}
        onSaved={() => { load(); setDialog(false); }}
      />
    </Box>
  );
}
