import AddIcon           from "@mui/icons-material/Add";
import CheckCircleIcon   from "@mui/icons-material/CheckCircle";
import CloseIcon         from "@mui/icons-material/Close";
import DeleteIcon        from "@mui/icons-material/Delete";
import EditIcon          from "@mui/icons-material/Edit";
import ExpandMoreIcon    from "@mui/icons-material/ExpandMore";
import MoveToInboxIcon   from "@mui/icons-material/MoveToInbox";
import PrintIcon         from "@mui/icons-material/Print";
import SearchIcon        from "@mui/icons-material/Search";
import {
  Accordion, AccordionDetails, AccordionSummary,
  Alert, Autocomplete, Box, Button, Chip, CircularProgress,
  Dialog, DialogContent, DialogTitle, Divider,
  IconButton, InputAdornment, MenuItem, Select, Table,
  TableBody, TableCell, TableHead, TableRow, TextField,
  Tooltip, Typography, alpha, useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useAxios } from "../../../utils/hook/useAxios";
import { useUser }  from "../../../utils/hook/UserContext";
import FournisseurAutocomplete from "../shared/FournisseurAutocomplete";

/* ── helpers ─────────────────────────────────────────────────────────── */
const STATUS_LABEL = { DRAFT: "Brouillon", VALIDATED: "Validé", CANCELLED: "Annulé" };
const STATUS_COLOR = { DRAFT: "warning", VALIDATED: "success", CANCELLED: "error" };

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
}

/* label au-dessus d'un champ */
function FL({ label, required, children }) {
  return (
    <Box>
      <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.4}>
        {label}{required && <span style={{ color: "#d32f2f", marginLeft: 2 }}>*</span>}
      </Typography>
      {children}
    </Box>
  );
}

/* ── Vue liste des BRs ───────────────────────────────────────────────── */
function BRList({ garageId, onNew, onOpen }) {
  const axios = useAxios();
  const [brs,     setBrs]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusF, setStatusF] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!garageId) return;
    setLoading(true);
    axios.get(`/goods-receipts/${garageId}${statusF ? `?status=${statusF}` : ""}`)
      .then(r => setBrs(r?.data?.brs || []))
      .catch(() => setBrs([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garageId, statusF]);

  const totalLines = brs.reduce((s, b) => s + (b.Lines?.length || 0), 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* barre de filtres */}
      <Box display="flex" gap={1.5} alignItems="center" mb={1.5} flexWrap="wrap">
        <FL label="Statut">
          <Select
            size="small" value={statusF} displayEmpty
            onChange={e => setStatusF(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="DRAFT">Brouillon</MenuItem>
            <MenuItem value="VALIDATED">Validé</MenuItem>
            <MenuItem value="CANCELLED">Annulé</MenuItem>
          </Select>
        </FL>
        <Box flex={1} />
        <Button
          variant="contained" size="small" startIcon={<AddIcon />}
          onClick={onNew} sx={{ textTransform: "none", alignSelf: "flex-end" }}
        >
          Nouveau BR
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary" mb={1}>
        {brs.length} bon{brs.length > 1 ? "s" : ""} de réception · {totalLines} ligne{totalLines > 1 ? "s" : ""}
      </Typography>

      <Box sx={{ flex: 1, overflow: "auto", pr: 0.5 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress size={26} /></Box>
        ) : brs.length === 0 ? (
          <Box textAlign="center" py={6}>
            <MoveToInboxIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.disabled">Aucun bon de réception</Typography>
          </Box>
        ) : brs.map(br => (
          <BRRow key={br.id} br={br} expanded={expanded === br.id}
            onExpand={() => setExpanded(p => p === br.id ? null : br.id)}
            onOpen={() => onOpen(br)}
          />
        ))}
      </Box>
    </Box>
  );
}

function BRRow({ br, expanded, onExpand, onOpen }) {
  const theme = useTheme();
  const lines = br.Lines || [];
  const totalQte = lines.reduce((s, l) => s + (l.quantiteRecue || 0), 0);

  return (
    <Accordion expanded={expanded} onChange={onExpand} disableGutters elevation={0}
      sx={{ border: "1px solid", borderColor: expanded ? "primary.main" : "divider",
        borderRadius: "8px !important", mb: 1, "&:before": { display: "none" } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
        sx={{ px: 2, py: 0.5, minHeight: 52,
          bgcolor: expanded ? alpha(theme.palette.primary.main, 0.05) : "transparent",
          borderRadius: "8px" }}
      >
        <Box display="flex" alignItems="center" gap={1.5} flex={1} mr={1}>
          <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight={700}>
                {br.reference || `BR #${br.id}`}
              </Typography>
              <Chip label={STATUS_LABEL[br.status] || br.status} size="small"
                color={STATUS_COLOR[br.status] || "default"} variant="outlined" sx={{ fontSize: 10 }} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {br.Fournisseur?.nom || "Sans fournisseur"} · {fmtDate(br.date)}
            </Typography>
          </Box>
          <Box textAlign="right" mr={1}>
            <Typography variant="caption" color="text.secondary">
              {lines.length} ligne{lines.length > 1 ? "s" : ""} · {totalQte} unité{totalQte > 1 ? "s" : ""}
            </Typography>
          </Box>
          <Tooltip title="Ouvrir / modifier">
            <IconButton size="small" onClick={e => { e.stopPropagation(); onOpen(); }}>
              <EditIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pt: 0, pb: 1.5 }}>
        <Divider sx={{ mb: 1.5 }} />
        {lines.length === 0 ? (
          <Typography variant="caption" color="text.disabled">Aucune ligne</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Référence", "Désignation", "Qté commandée", "Qté reçue", "Prix achat"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", py: 0.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map(l => (
                <TableRow key={l.id} hover>
                  <TableCell sx={{ fontSize: 12, fontFamily: "monospace" }}>{l.Article?.refExt || `#${l.articleId}`}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{l.Article?.libelle1 || "—"}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{l.quantiteCommandee ?? "—"}</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{l.quantiteRecue}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{l.prixAchatUnitaire != null ? `${parseFloat(l.prixAchatUnitaire).toFixed(2)} €` : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

/* ── Formulaire de création/édition d'un BR ──────────────────────────── */
function BRForm({ garageId, initial, onSaved, onBack }) {
  const axios    = useAxios();
  const { user } = useUser();

  /* en-tête */
  const [fournisseur,    setFournisseur]    = useState(initial?.Fournisseur || null);
  const [reference,      setReference]      = useState(initial?.reference || "");
  const [date,           setDate]           = useState(initial?.date || new Date().toISOString().split("T")[0]);
  const [notes,          setNotes]          = useState(initial?.notes || "");
  const [purchaseOrderId, setPurchaseOrderId] = useState(initial?.purchaseOrderId || null);
  const [purchaseOrders,  setPurchaseOrders]  = useState([]);

  /* lignes confirmées sur le BR */
  const [lines,     setLines]     = useState(initial?.Lines || []);
  /* lignes pré-remplies depuis le BDC (éditables avant envoi) */
  const [bdcPreview, setBdcPreview] = useState([]);
  const [importing,  setImporting]  = useState(false);

  const [saving,     setSaving]     = useState(false);
  const [validating, setValidating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error,      setError]      = useState(null);

  const [brId,   setBrId]   = useState(initial?.id || null);
  const [status, setStatus] = useState(initial?.status || "DRAFT");
  const isDraft = status === "DRAFT";

  /* nouvelle ligne manuelle */
  const EMPTY_LINE = { articleQ: null, quantiteRecue: "", quantiteCommandee: "", prixAchatUnitaire: "", numLot: "", datePremption: "", commentaire: "" };
  const [newLine,        setNewLine]        = useState(EMPTY_LINE);
  const [articleOptions, setArticleOptions] = useState([]);
  const [articleSearch,  setArticleSearch]  = useState("");
  const [artLoading,     setArtLoading]     = useState(false);
  const searchTimer = useRef(null);
  const [addingLine,     setAddingLine]     = useState(false);

  /* ── chargement initial ── */
  useEffect(() => {
    /* BDC au statut SENT ou PARTIAL (livraisons partielles) */
    axios.get(`/purchase-orders/${garageId}`)
      .then(r => {
        const all = r?.data?.bdcs || [];
        setPurchaseOrders(all.filter(b => ["SENT", "PARTIAL"].includes(b.status)));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garageId]);

  /* ── quand on choisit un BDC → auto-remplir fournisseur + preview lignes ── */
  const handleSelectBDC = (poId) => {
    setPurchaseOrderId(poId || null);
    if (!poId) { setBdcPreview([]); return; }
    const bdc = purchaseOrders.find(p => p.id === Number(poId));
    if (!bdc) return;
    /* auto-remplir le fournisseur */
    if (bdc.Fournisseur && !fournisseur) setFournisseur(bdc.Fournisseur);
    /* construire les lignes pré-remplies avec la qté restante à recevoir */
    const preview = (bdc.Lines || []).map(l => ({
      _key:              l.id,
      articleId:         l.articleId,
      Article:           l.Article,
      quantiteCommandee: l.quantiteCommandee,
      quantiteRestante:  Math.max(0, l.quantiteCommandee - (l.quantiteRecue || 0)),
      quantiteRecue:     String(Math.max(0, l.quantiteCommandee - (l.quantiteRecue || 0))),
      prixAchatUnitaire: l.prixAchatUnitaire ? String(l.prixAchatUnitaire) : "",
      numLot:            "",
      datePremption:     "",
      commentaire:       "",
    }));
    setBdcPreview(preview);
  };

  const updatePreviewRow = (key, field, value) =>
    setBdcPreview(p => p.map(r => r._key === key ? { ...r, [field]: value } : r));

  /* ── autocomplete article ── */
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!articleSearch || articleSearch.length < 2) { setArticleOptions([]); return; }
    searchTimer.current = setTimeout(() => {
      setArtLoading(true);
      axios.get(`/stock/articles/search?reference=${encodeURIComponent(articleSearch)}&limit=30`)
        .then(r => setArticleOptions(r?.data?.articles || r?.data || []))
        .catch(() => setArticleOptions([]))
        .finally(() => setArtLoading(false));
    }, 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleSearch]);

  /* ── save header ── */
  const saveHeader = async () => {
    setSaving(true); setError(null);
    try {
      const payload = {
        garageId,
        fournisseurId:   fournisseur?.id || null,
        reference:       reference || null,
        date,
        notes:           notes || null,
        purchaseOrderId: purchaseOrderId || null,
        userId:          user?.id || null,
      };
      let id = brId;
      if (!id) {
        const r = await axios.post("/goods-receipts", payload);
        id = r?.data?.id;
        setBrId(id);
        setStatus("DRAFT");
      } else {
        await axios.put(`/goods-receipts/${id}`, payload);
      }
      return id;
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur sauvegarde");
      return null;
    } finally {
      setSaving(false);
    }
  };

  /* ── importer toutes les lignes du BDC ── */
  const handleImportBDC = async () => {
    const validRows = bdcPreview.filter(r => parseFloat(r.quantiteRecue) > 0);
    if (!validRows.length) { setError("Aucune ligne avec quantité reçue > 0"); return; }
    setImporting(true); setError(null);
    let id = brId;
    if (!id) { id = await saveHeader(); if (!id) { setImporting(false); return; } }
    try {
      const added = [];
      for (const row of validRows) {
        const payload = {
          articleId:         row.articleId,
          quantiteRecue:     parseFloat(row.quantiteRecue),
          quantiteCommandee: row.quantiteCommandee || undefined,
          prixAchatUnitaire: row.prixAchatUnitaire ? parseFloat(row.prixAchatUnitaire) : undefined,
          numLot:            row.numLot        || undefined,
          datePremption:     row.datePremption || undefined,
          commentaire:       row.commentaire   || undefined,
        };
        const r = await axios.post(`/goods-receipts/${id}/lines`, payload);
        if (r?.data) added.push(r.data);
      }
      setLines(p => [...p, ...added]);
      setBdcPreview([]);
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur import lignes BDC");
    } finally {
      setImporting(false);
    }
  };

  /* ── add single line ── */
  const handleAddLine = async () => {
    setError(null);
    if (!newLine.articleQ) { setError("Sélectionner un article"); return; }
    if (!newLine.quantiteRecue || parseFloat(newLine.quantiteRecue) <= 0) { setError("Quantité reçue invalide"); return; }
    let id = brId;
    if (!id) { id = await saveHeader(); if (!id) return; }
    setAddingLine(true);
    try {
      const payload = {
        articleId:         newLine.articleQ.id,
        quantiteRecue:     parseFloat(newLine.quantiteRecue),
        quantiteCommandee: newLine.quantiteCommandee ? parseFloat(newLine.quantiteCommandee) : undefined,
        prixAchatUnitaire: newLine.prixAchatUnitaire ? parseFloat(newLine.prixAchatUnitaire) : undefined,
        numLot:            newLine.numLot        || undefined,
        datePremption:     newLine.datePremption || undefined,
        commentaire:       newLine.commentaire   || undefined,
      };
      const r = await axios.post(`/goods-receipts/${id}/lines`, payload);
      if (r?.data) setLines(p => [...p, r.data]);
      setNewLine(EMPTY_LINE);
      setArticleSearch("");
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur ajout ligne");
    } finally { setAddingLine(false); }
  };

  /* ── remove line ── */
  const handleRemoveLine = async (lineId) => {
    try {
      await axios.deleteData(`/goods-receipts/${brId}/lines/${lineId}`);
      setLines(p => p.filter(l => l.id !== lineId));
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur suppression ligne");
    }
  };

  /* ── validate ── */
  const handleValidate = async () => {
    if (!brId) { setError("Sauvegardez d'abord l'en-tête"); return; }
    if (lines.length === 0) { setError("Ajoutez au moins une ligne"); return; }
    if (!window.confirm("Valider ce bon de réception ? Le stock sera mis à jour immédiatement.")) return;
    setValidating(true); setError(null);
    try {
      await axios.post(`/goods-receipts/${brId}/validate`, {});
      setStatus("VALIDATED");
      onSaved && onSaved();
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur validation");
    } finally { setValidating(false); }
  };

  /* ── cancel ── */
  const handleCancel = async () => {
    if (!brId) { onBack(); return; }
    if (!window.confirm("Annuler ce bon de réception ?")) return;
    setCancelling(true); setError(null);
    try {
      await axios.post(`/goods-receipts/${brId}/cancel`, { userId: user?.id });
      setStatus("CANCELLED");
      onSaved && onSaved();
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur annulation");
    } finally { setCancelling(false); }
  };

  const setNL = k => v => setNewLine(p => ({ ...p, [k]: v }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%", overflow: "auto" }}>
      {/* ── En-tête ── */}
      <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <Typography variant="caption" fontWeight={700} color="primary.main" textTransform="uppercase" letterSpacing={0.8}>
            En-tête du bon de réception
          </Typography>
          {status !== "DRAFT" && (
            <Chip label={STATUS_LABEL[status]} size="small" color={STATUS_COLOR[status]} variant="filled" sx={{ fontSize: 10 }} />
          )}
        </Box>

        <Box display="flex" gap={1.5} flexWrap="wrap">
          {/* BDC lié — en premier pour déclencher le pré-remplissage */}
          <Box flex="2 1 200px">
            <FL label="Bon de commande lié (BDC)">
              <Select
                size="small" fullWidth value={purchaseOrderId || ""} displayEmpty
                onChange={e => handleSelectBDC(e.target.value)}
                disabled={!isDraft}
              >
                <MenuItem value=""><em>Sans commande liée</em></MenuItem>
                {purchaseOrders.map(po => (
                  <MenuItem key={po.id} value={po.id}>
                    {po.reference || `BDC #${po.id}`} — {po.Fournisseur?.nom || "?"}
                    &nbsp;<Chip label={po.status} size="small" sx={{ fontSize: 9, height: 16, ml: 0.5 }} />
                  </MenuItem>
                ))}
              </Select>
            </FL>
          </Box>

          {/* Fournisseur */}
          <Box flex="2 1 200px">
            <FL label="Fournisseur" required>
              <FournisseurAutocomplete
                value={fournisseur}
                onChange={setFournisseur}
                disabled={!isDraft}
                placeholder="Rechercher un fournisseur…"
              />
            </FL>
          </Box>

          {/* N° BL fournisseur */}
          <Box flex="1 1 160px">
            <FL label="N° bon de livraison fss">
              <TextField size="small" fullWidth value={reference} onChange={e => setReference(e.target.value)}
                disabled={!isDraft} placeholder="Ex : BL-2024-001" />
            </FL>
          </Box>

          {/* Date */}
          <Box flex="1 1 140px">
            <FL label="Date de réception" required>
              <TextField size="small" fullWidth type="date" value={date}
                onChange={e => setDate(e.target.value)} disabled={!isDraft} />
            </FL>
          </Box>

          {/* Notes */}
          <Box flex="3 1 300px">
            <FL label="Notes / observations">
              <TextField size="small" fullWidth multiline maxRows={2} value={notes}
                onChange={e => setNotes(e.target.value)} disabled={!isDraft} />
            </FL>
          </Box>
        </Box>

        {isDraft && (
          <Box display="flex" justifyContent="flex-end" mt={1.5}>
            <Button size="small" variant="outlined" onClick={saveHeader} disabled={saving} sx={{ textTransform: "none" }}>
              {saving ? <CircularProgress size={14} color="inherit" /> : "Sauvegarder l'en-tête"}
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Pré-remplissage depuis le BDC ── */}
      {isDraft && bdcPreview.length > 0 && (
        <Box sx={{ border: "1px solid", borderColor: "warning.main", borderRadius: 1.5, overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 1, bgcolor: "warning.main", display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" fontWeight={700} color="warning.contrastText" textTransform="uppercase" letterSpacing={0.8} flex={1}>
              Lignes importées du BDC — vérifiez les quantités reçues
            </Typography>
            <Button size="small" variant="contained" color="warning"
              onClick={handleImportBDC} disabled={importing}
              startIcon={importing ? <CircularProgress size={13} color="inherit" /> : <CheckCircleIcon />}
              sx={{ textTransform: "none", color: "warning.contrastText", bgcolor: "rgba(0,0,0,0.15)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.25)" } }}
            >
              {importing ? "Import en cours…" : "Confirmer toutes les lignes"}
            </Button>
            <Button size="small" variant="text" onClick={() => setBdcPreview([])}
              sx={{ textTransform: "none", color: "warning.contrastText" }}>
              Annuler
            </Button>
          </Box>
          <Table size="small">
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                {["Référence", "Désignation", "Qté commandée", "Restant à recevoir", "Qté reçue *", "Prix achat HT", "N° lot", "Commentaire"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", py: 0.75 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {bdcPreview.map(row => (
                <TableRow key={row._key}>
                  <TableCell sx={{ fontSize: 12, fontFamily: "monospace" }}>{row.Article?.refExt || `#${row.articleId}`}</TableCell>
                  <TableCell sx={{ fontSize: 12, maxWidth: 180 }}>
                    <Typography variant="inherit" noWrap>{row.Article?.libelle1 || "—"}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{row.quantiteCommandee}</TableCell>
                  <TableCell>
                    <Chip label={row.quantiteRestante} size="small"
                      color={row.quantiteRestante > 0 ? "warning" : "default"} variant="outlined" sx={{ fontSize: 11 }} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    <TextField size="small" type="number" inputProps={{ min: 0, step: 1, style: { padding: "4px 8px" } }}
                      value={row.quantiteRecue}
                      onChange={e => updatePreviewRow(row._key, "quantiteRecue", e.target.value)}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 90 }}>
                    <TextField size="small" type="number" inputProps={{ min: 0, step: 0.01, style: { padding: "4px 8px" } }}
                      value={row.prixAchatUnitaire} placeholder="0.00"
                      onChange={e => updatePreviewRow(row._key, "prixAchatUnitaire", e.target.value)}
                      sx={{ width: 90 }}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 110 }}>
                    <TextField size="small" inputProps={{ style: { padding: "4px 8px" } }}
                      value={row.numLot} placeholder="Facultatif"
                      onChange={e => updatePreviewRow(row._key, "numLot", e.target.value)}
                      sx={{ width: 110 }}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 140 }}>
                    <TextField size="small" inputProps={{ style: { padding: "4px 8px" } }}
                      value={row.commentaire} placeholder="Anomalie…"
                      onChange={e => updatePreviewRow(row._key, "commentaire", e.target.value)}
                      sx={{ width: 140 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* ── Lignes confirmées ── */}
      {lines.length > 0 && (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 0.75, bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
              Lignes du bon de réception ({lines.length})
            </Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Référence", "Désignation", "Qté commandée", "Qté reçue", "Prix achat", "Lot / Péremption", "Commentaire", ""].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", py: 0.75 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map(l => (
                <TableRow key={l.id} hover>
                  <TableCell sx={{ fontSize: 12, fontFamily: "monospace" }}>{l.Article?.refExt || `#${l.articleId}`}</TableCell>
                  <TableCell sx={{ fontSize: 12, maxWidth: 200 }}>
                    <Typography variant="inherit" noWrap>{l.Article?.libelle1 || "—"}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{l.quantiteCommandee ?? "—"}</TableCell>
                  <TableCell>
                    <Chip label={l.quantiteRecue} size="small"
                      color={l.quantiteCommandee && l.quantiteRecue < l.quantiteCommandee ? "warning" : "success"}
                      variant="outlined" sx={{ fontSize: 11 }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{l.prixAchatUnitaire != null ? `${parseFloat(l.prixAchatUnitaire).toFixed(2)} €` : "—"}</TableCell>
                  <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>
                    {[l.numLot && `Lot: ${l.numLot}`, l.datePremption && `Pér.: ${fmtDate(l.datePremption)}`].filter(Boolean).join(" · ") || "—"}
                  </TableCell>
                  <TableCell sx={{ fontSize: 11, color: l.commentaire ? "warning.main" : "text.disabled", maxWidth: 150 }}>
                    <Typography variant="inherit" noWrap>{l.commentaire || "—"}</Typography>
                  </TableCell>
                  <TableCell>
                    {isDraft && (
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => handleRemoveLine(l.id)}>
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* ── Formulaire ajout ligne manuelle ── */}
      {isDraft && (
        <Box sx={{ p: 2, border: "1px dashed", borderColor: "primary.main", borderRadius: 1.5 }}>
          <Typography variant="caption" fontWeight={700} color="primary.main" textTransform="uppercase" letterSpacing={0.8} display="block" mb={1.5}>
            Ajouter une ligne manuellement
          </Typography>

          <Box display="flex" gap={1.5} flexWrap="wrap" mb={1.5}>
            <Box flex="3 1 240px">
              <FL label="Article (référence)" required>
                <Autocomplete size="small" options={articleOptions} loading={artLoading}
                  inputValue={articleSearch} value={newLine.articleQ}
                  onInputChange={(_, v) => setArticleSearch(v)}
                  onChange={(_, v) => setNL("articleQ")(v)}
                  getOptionLabel={o => `${o.refExt || ""} — ${o.libelle1 || ""}`.trim()}
                  isOptionEqualToValue={(o, v) => o.id === v?.id}
                  noOptionsText={articleSearch.length < 2 ? "Saisissez 2 caractères…" : "Aucun résultat"}
                  renderInput={params => (
                    <TextField {...params} placeholder="Scanner ou chercher…"
                      InputProps={{ ...params.InputProps,
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: "text.disabled" }} /></InputAdornment>,
                      }}
                    />
                  )}
                />
              </FL>
            </Box>
            <Box flex="1 1 100px">
              <FL label="Qté commandée">
                <TextField size="small" fullWidth type="number" inputProps={{ min: 0 }}
                  value={newLine.quantiteCommandee} onChange={e => setNL("quantiteCommandee")(e.target.value)} />
              </FL>
            </Box>
            <Box flex="1 1 100px">
              <FL label="Qté reçue" required>
                <TextField size="small" fullWidth type="number" inputProps={{ min: 0.01, step: 0.01 }}
                  value={newLine.quantiteRecue} onChange={e => setNL("quantiteRecue")(e.target.value)} />
              </FL>
            </Box>
            <Box flex="1 1 110px">
              <FL label="Prix achat HT">
                <TextField size="small" fullWidth type="number" inputProps={{ min: 0, step: 0.01 }}
                  value={newLine.prixAchatUnitaire} onChange={e => setNL("prixAchatUnitaire")(e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end">€</InputAdornment> }} />
              </FL>
            </Box>
          </Box>

          <Box display="flex" gap={1.5} flexWrap="wrap" mb={1.5}>
            <Box flex="1 1 140px">
              <FL label="N° lot">
                <TextField size="small" fullWidth placeholder="Ex : LOT-2024-A"
                  value={newLine.numLot} onChange={e => setNL("numLot")(e.target.value)} />
              </FL>
            </Box>
            <Box flex="1 1 140px">
              <FL label="Date péremption">
                <TextField size="small" fullWidth type="date"
                  value={newLine.datePremption} onChange={e => setNL("datePremption")(e.target.value)} />
              </FL>
            </Box>
            <Box flex="3 1 200px">
              <FL label="Commentaire (anomalie, colis abîmé…)">
                <TextField size="small" fullWidth placeholder="Facultatif"
                  value={newLine.commentaire} onChange={e => setNL("commentaire")(e.target.value)} />
              </FL>
            </Box>
          </Box>

          <Box display="flex" justifyContent="flex-end">
            <Button size="small" variant="contained" onClick={handleAddLine} disabled={addingLine}
              startIcon={addingLine ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
              sx={{ textTransform: "none" }}>
              {addingLine ? "Ajout…" : "Ajouter la ligne"}
            </Button>
          </Box>
        </Box>
      )}

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {/* ── Actions finales ── */}
      <Box display="flex" gap={1} justifyContent="flex-end" pt={1} sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <Button size="small" variant="text" onClick={onBack} sx={{ textTransform: "none" }}>
          ← Retour à la liste
        </Button>
        {isDraft && (
          <>
            <Button size="small" variant="outlined" color="error" onClick={handleCancel} disabled={cancelling} sx={{ textTransform: "none" }}>
              {cancelling ? <CircularProgress size={14} color="inherit" /> : "Annuler le BR"}
            </Button>
            <Button size="small" variant="contained" color="success" onClick={handleValidate}
              disabled={validating || lines.length === 0}
              startIcon={validating ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
              sx={{ textTransform: "none" }}>
              {validating ? "Validation…" : "Valider la réception"}
            </Button>
          </>
        )}
        {status === "VALIDATED" && (
          <Button size="small" variant="outlined" startIcon={<PrintIcon />}
            onClick={() => window.print()} sx={{ textTransform: "none" }}>
            Imprimer le bon
          </Button>
        )}
      </Box>
    </Box>
  );
}

/* ── Composant principal ─────────────────────────────────────────────── */
export default function EntreeMarchandiseModal({ open, onClose }) {
  const { user }   = useUser();
  const garageId   = user?.garageId;

  const [view,     setView]     = useState("list"); // "list" | "form"
  const [selected, setSelected] = useState(null);
  const [refresh,  setRefresh]  = useState(0);

  const handleOpen = (br) => { setSelected(br); setView("form"); };
  const handleNew  = ()   => { setSelected(null); setView("form"); };
  const handleBack = ()   => { setSelected(null); setView("list"); };
  const handleSaved = ()  => { setRefresh(p => p + 1); setView("list"); };

  useEffect(() => {
    if (!open) { setView("list"); setSelected(null); }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx: { height: "92vh" } }}>
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1,
          bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider",
          py: 1.5, px: 2.5 }}
      >
        <MoveToInboxIcon sx={{ color: "primary.main", fontSize: 20 }} />
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={700}>Entrée Marchandise</Typography>
          <Typography variant="caption" color="text.secondary">
            {view === "list" ? "Bons de réception fournisseur" : selected ? `BR : ${selected.reference || `#${selected.id}`}` : "Nouveau bon de réception"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pt: 2, pb: 2, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!garageId ? (
          <Alert severity="warning">Garage non identifié — impossible de charger les données.</Alert>
        ) : view === "list" ? (
          <BRList key={refresh} garageId={garageId} onNew={handleNew} onOpen={handleOpen} />
        ) : (
          <BRForm garageId={garageId} initial={selected} onSaved={handleSaved} onBack={handleBack} />
        )}
      </DialogContent>
    </Dialog>
  );
}
