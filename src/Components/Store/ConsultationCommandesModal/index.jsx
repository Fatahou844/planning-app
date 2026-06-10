import AddIcon                from "@mui/icons-material/Add";
import CancelIcon             from "@mui/icons-material/Cancel";
import CloseIcon              from "@mui/icons-material/Close";
import DeleteIcon             from "@mui/icons-material/Delete";
import EditIcon               from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon  from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import PrintIcon              from "@mui/icons-material/Print";
import SearchIcon             from "@mui/icons-material/Search";
import SendIcon               from "@mui/icons-material/Send";
import ShoppingCartIcon       from "@mui/icons-material/ShoppingCart";
import WarningAmberIcon       from "@mui/icons-material/WarningAmber";
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress,
  Collapse, Dialog, DialogContent, DialogTitle, Divider,
  IconButton, InputAdornment, MenuItem, Select, Table,
  TableBody, TableCell, TableHead, TableRow, TextField,
  Tooltip, Typography, alpha, useTheme,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAxios } from "../../../utils/hook/useAxios";
import { useUser }  from "../../../utils/hook/UserContext";
import { generateBdcPdf } from "../../../utils/pdf/generateBdcPdf";
import FournisseurAutocomplete from "../shared/FournisseurAutocomplete";

/* ── constantes ──────────────────────────────────────────────────────── */
const STATUS_LABEL = { DRAFT:"Brouillon", SENT:"Envoyée", PARTIAL:"Partielle", RECEIVED:"Livrée", CANCELLED:"Annulée" };
const STATUS_COLOR = { DRAFT:"default",   SENT:"info",    PARTIAL:"warning",   RECEIVED:"success", CANCELLED:"error"   };
const STATUS_OPTIONS = [
  { value: "",          label: "Tous statuts" },
  { value: "DRAFT",     label: "Brouillon"    },
  { value: "SENT",      label: "Envoyée"      },
  { value: "PARTIAL",   label: "Partielle"    },
  { value: "RECEIVED",  label: "Livrée"       },
  { value: "CANCELLED", label: "Annulée"      },
];

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
}

/* label au-dessus d'un champ */
function FL({ label, required, children }) {
  return (
    <Box>
      <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.4}>
        {label}{required && <span style={{ color:"#d32f2f", marginLeft:2 }}>*</span>}
      </Typography>
      {children}
    </Box>
  );
}

/* ── Détail lignes (lecture) ─────────────────────────────────────────── */
function BdcLinesReadOnly({ bdc }) {
  const theme = useTheme();
  const lines = bdc.Lines || [];
  if (!lines.length)
    return <Box sx={{ px:3, py:1.5 }}><Typography variant="caption" color="text.disabled">Aucune ligne</Typography></Box>;
  return (
    <Box sx={{ px:2, pb:1.5, pt:0.5, bgcolor: alpha(theme.palette.primary.main, 0.025) }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor:"background.default" }}>
            {["Référence","Désignation","Marque","Prix achat","Qté cmd","Qté reçue","Statut ligne"].map(h => (
              <TableCell key={h} sx={{ fontWeight:600, fontSize:11, color:"text.secondary", py:0.75 }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map(l => {
            const qCmd  = parseFloat(l.quantiteCommandee) || 0;
            const qRecu = parseFloat(l.quantiteRecue)     || 0;
            const rel   = Math.max(0, qCmd - qRecu);
            const isCancelled = bdc.status === "CANCELLED";
            const isOk  = qRecu >= qCmd && qCmd > 0;
            const isPartiel = !isCancelled && !isOk && qRecu > 0;
            let lbl, col;
            if (isCancelled)     { lbl="Annulée";    col="error";   }
            else if (isOk)       { lbl="Livrée";     col="success"; }
            else if (isPartiel)  { lbl="Partielle";  col="warning"; }
            else                 { lbl="En attente"; col="info";    }
            return (
              <TableRow key={l.id} sx={{ bgcolor: isPartiel ? alpha(theme.palette.warning.main,0.06) : "inherit" }}>
                <TableCell sx={{ fontSize:12, fontFamily:"monospace" }}>{l.Article?.refExt || "—"}</TableCell>
                <TableCell sx={{ fontSize:12, maxWidth:200 }}>
                  <Typography variant="inherit" noWrap>{l.Article?.libelle1 || "—"}</Typography>
                </TableCell>
                <TableCell sx={{ fontSize:12 }}>{l.Article?.Marque?.nom || "—"}</TableCell>
                <TableCell sx={{ fontSize:12 }}>{l.prixAchatUnitaire != null ? `${parseFloat(l.prixAchatUnitaire).toFixed(2)} €` : "—"}</TableCell>
                <TableCell sx={{ fontSize:12, fontWeight:600 }}>{qCmd}</TableCell>
                <TableCell sx={{ fontSize:12, fontWeight:600, color: isOk ? "success.main":"text.primary" }}>
                  {qRecu}{rel > 0 && !isCancelled && (
                    <Box component="span" sx={{ ml:0.5, color:"warning.main", fontSize:11 }}>
                      <WarningAmberIcon sx={{ fontSize:11, verticalAlign:"middle" }} /> {rel}
                    </Box>
                  )}
                </TableCell>
                <TableCell><Chip label={lbl} size="small" color={col} variant="outlined" sx={{ fontSize:10 }} /></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

/* ── Ligne dans la liste principale ─────────────────────────────────── */
function BdcRow({ bdc, expanded, onToggle, onEdit }) {
  const theme = useTheme();
  const lines     = bdc.Lines || [];
  const totalCmd  = lines.reduce((s,l) => s + (parseFloat(l.quantiteCommandee)||0), 0);
  const totalRecu = lines.reduce((s,l) => s + (parseFloat(l.quantiteRecue)||0),     0);
  const hasReliq  = totalRecu < totalCmd && !["CANCELLED","DRAFT"].includes(bdc.status);

  return (
    <>
      <TableRow hover onClick={onToggle}
        sx={{ cursor:"pointer", bgcolor: expanded ? alpha(theme.palette.primary.main,0.05) : "inherit" }}>
        <TableCell sx={{ width:32, px:0.5 }}>
          {expanded ? <KeyboardArrowDownIcon sx={{ fontSize:18, color:"text.secondary" }}/>
                    : <KeyboardArrowRightIcon sx={{ fontSize:18, color:"text.secondary" }}/>}
        </TableCell>
        <TableCell sx={{ fontSize:12, fontFamily:"monospace", whiteSpace:"nowrap" }}>
          {bdc.reference || `#${bdc.id}`}
        </TableCell>
        <TableCell sx={{ fontSize:12, whiteSpace:"nowrap" }}>{fmtDate(bdc.date)}</TableCell>
        <TableCell sx={{ fontSize:12, whiteSpace:"nowrap" }}>
          {bdc.dateAttendue
            ? <Typography variant="inherit"
                color={new Date(bdc.dateAttendue)<new Date() && bdc.status!=="RECEIVED" ? "error.main":"text.primary"}>
                {fmtDate(bdc.dateAttendue)}
              </Typography>
            : <Typography variant="inherit" color="text.disabled">—</Typography>}
        </TableCell>
        <TableCell sx={{ fontSize:12, maxWidth:150 }}>
          <Typography variant="inherit" noWrap>{bdc.Fournisseur?.nom || "—"}</Typography>
        </TableCell>
        <TableCell>
          <Chip label={STATUS_LABEL[bdc.status]||bdc.status} size="small"
            color={STATUS_COLOR[bdc.status]||"default"} variant="outlined" sx={{ fontSize:10 }} />
        </TableCell>
        <TableCell sx={{ fontSize:12, textAlign:"center" }}>{lines.length}</TableCell>
        <TableCell sx={{ fontSize:12, textAlign:"right" }}>{totalCmd}</TableCell>
        <TableCell sx={{ fontSize:12, textAlign:"right" }}>
          <Typography variant="inherit" color={totalRecu>=totalCmd && totalCmd>0 ? "success.main":"text.primary"}>
            {totalRecu}
          </Typography>
        </TableCell>
        <TableCell>
          {hasReliq
            ? <Chip icon={<WarningAmberIcon sx={{ fontSize:12 }}/>} label={totalCmd-totalRecu}
                size="small" color="warning" variant="outlined" sx={{ fontSize:10 }}/>
            : bdc.status==="RECEIVED"
              ? <Typography variant="caption" color="success.main" fontWeight={700}>✓</Typography>
              : <Typography variant="caption" color="text.disabled">—</Typography>}
        </TableCell>
        {/* actions */}
        <TableCell onClick={e => e.stopPropagation()} sx={{ whiteSpace:"nowrap" }}>
          <Tooltip title={bdc.status==="DRAFT" ? "Modifier / valider" : "Consulter le détail"}>
            <IconButton size="small" color={bdc.status==="DRAFT" ? "primary" : "default"}
              onClick={() => onEdit(bdc)}>
              <EditIcon sx={{ fontSize:15 }}/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimer">
            <IconButton size="small" onClick={() => generateBdcPdf(bdc)}>
              <PrintIcon sx={{ fontSize:15 }}/>
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={12} sx={{ p:0, border:0 }}>
          <Collapse in={expanded} unmountOnExit>
            <BdcLinesReadOnly bdc={bdc} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

/* ── Vue liste ───────────────────────────────────────────────────────── */
function BdcList({ garageId, onNew, onEdit, refreshKey }) {
  const axios = useAxios();
  const [bdcs,         setBdcs]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [expandedId,   setExpandedId]   = useState(null);
  const [fssFilter,    setFssFilter]    = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [refFilter,    setRefFilter]    = useState("");
  const [artFilter,    setArtFilter]    = useState("");
  const timer = useRef(null);

  const load = () => {
    setLoading(true); setError(null);
    const p = new URLSearchParams();
    if (fssFilter)    p.set("fournisseurId", fssFilter.id);
    if (statusFilter) p.set("status",        statusFilter);
    if (dateFrom)     p.set("dateFrom",      dateFrom);
    if (dateTo)       p.set("dateTo",        dateTo);
    axios.get(`/purchase-orders/${garageId}?${p.toString()}`)
      .then(r => setBdcs(r?.data?.bdcs || []))
      .catch(() => setError("Impossible de charger les commandes"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(load, 0);
    return () => clearTimeout(timer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garageId, fssFilter, statusFilter, dateFrom, dateTo, refreshKey]);

  const filtered = useMemo(() => {
    let list = bdcs;
    if (refFilter.trim()) {
      const q = refFilter.trim().toLowerCase();
      list = list.filter(b => (b.reference||"").toLowerCase().includes(q) || String(b.id).includes(q));
    }
    if (artFilter.trim()) {
      const q = artFilter.trim().toLowerCase();
      list = list.filter(b => (b.Lines||[]).some(l =>
        (l.Article?.refExt||"").toLowerCase().includes(q) ||
        (l.Article?.libelle1||"").toLowerCase().includes(q)
      ));
    }
    return list;
  }, [bdcs, refFilter, artFilter]);

  const enCours   = filtered.filter(b => ["SENT","PARTIAL"].includes(b.status)).length;
  const brouillon = filtered.filter(b => b.status==="DRAFT").length;

  return (
    <Box sx={{ display:"flex", flexDirection:"column", height:"100%", gap:1.5 }}>
      {/* filtres */}
      <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="flex-end">
        <Box flex="2 1 150px">
          <FL label="Fournisseur">
            <FournisseurAutocomplete value={fssFilter} onChange={setFssFilter} placeholder="Tous" />
          </FL>
        </Box>
        <Box flex="1 1 120px">
          <FL label="Statut">
            <Select size="small" fullWidth value={statusFilter} displayEmpty onChange={e=>setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map(o=><MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FL>
        </Box>
        <Box flex="1 1 110px">
          <FL label="Du"><TextField size="small" fullWidth type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/></FL>
        </Box>
        <Box flex="1 1 110px">
          <FL label="Au"><TextField size="small" fullWidth type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}/></FL>
        </Box>
        <Box flex="1 1 130px">
          <FL label="N° commande">
            <TextField size="small" fullWidth placeholder="Ref / #id" value={refFilter} onChange={e=>setRefFilter(e.target.value)}
              InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon sx={{ fontSize:14, color:"text.disabled" }}/></InputAdornment> }}/>
          </FL>
        </Box>
        <Box flex="2 1 150px">
          <FL label="Article">
            <TextField size="small" fullWidth placeholder="Référence ou désignation" value={artFilter} onChange={e=>setArtFilter(e.target.value)}
              InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon sx={{ fontSize:14, color:"text.disabled" }}/></InputAdornment> }}/>
          </FL>
        </Box>
        <Box sx={{ alignSelf:"flex-end" }}>
          <Button variant="contained" size="small" startIcon={<AddIcon/>}
            onClick={onNew} sx={{ textTransform:"none", whiteSpace:"nowrap" }}>
            Nouvelle commande
          </Button>
        </Box>
      </Box>

      {/* stats */}
      {!loading && filtered.length > 0 && (
        <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
          <Typography variant="caption" color="text.secondary">{filtered.length} commande{filtered.length>1?"s":""}</Typography>
          {brouillon>0 && <Chip label={`${brouillon} brouillon${brouillon>1?"s":""}`} size="small" color="default" variant="outlined" sx={{ fontSize:10 }}/>}
          {enCours>0   && <Chip label={`${enCours} en cours`}    size="small" color="info"    variant="outlined" sx={{ fontSize:10 }}/>}
        </Box>
      )}

      <Divider/>
      {error && <Alert severity="error" onClose={()=>setError(null)}>{error}</Alert>}

      <Box sx={{ flex:1, overflow:"auto" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress size={28}/></Box>
        ) : filtered.length===0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={1}>
            <ShoppingCartIcon sx={{ fontSize:48, color:"text.disabled" }}/>
            <Typography variant="body2" color="text.disabled">Aucune commande</Typography>
          </Box>
        ) : (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width:32, bgcolor:"background.default" }}/>
                {["N° commande","Date","Date attendue","Fournisseur","Statut","Lignes","Qté cmd","Qté reçue","Reliquat",""].map(h=>(
                  <TableCell key={h} sx={{ fontWeight:700, fontSize:11, color:"text.secondary", bgcolor:"background.default", whiteSpace:"nowrap" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(bdc=>(
                <BdcRow key={bdc.id} bdc={bdc}
                  expanded={expandedId===bdc.id}
                  onToggle={()=>setExpandedId(p=>p===bdc.id?null:bdc.id)}
                  onEdit={onEdit}/>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Box>
  );
}

/* ── Formulaire BDC (création / modification) ───────────────────────── */
function BdcForm({ garageId, initial, onBack, onSaved }) {
  const axios    = useAxios();
  const { user } = useUser();

  const [bdcId,    setBdcId]    = useState(initial?.id     || null);
  const [status,   setStatus]   = useState(initial?.status || "DRAFT");
  const isDraft    = status === "DRAFT";
  const isEditable = ["DRAFT", "SENT", "PARTIAL"].includes(status);

  /* en-tête */
  const [fournisseur,    setFournisseur]    = useState(initial?.Fournisseur || null);
  const [reference,      setReference]      = useState(initial?.reference   || "");
  const [date,           setDate]           = useState(initial?.date        || new Date().toISOString().split("T")[0]);
  const [dateAttendue,   setDateAttendue]   = useState(initial?.dateAttendue|| "");
  const [notes,          setNotes]          = useState(initial?.notes       || "");

  /* lignes */
  const [lines,      setLines]      = useState(initial?.Lines || []);
  const [saving,     setSaving]     = useState(false);
  const [sending,    setSending]    = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error,      setError]      = useState(null);

  /* formulaire nouvelle ligne */
  const EMPTY = { articleQ:null, quantiteCommandee:"", prixAchatUnitaire:"" };
  const [newLine,        setNewLine]        = useState(EMPTY);
  const [articleOptions, setArticleOptions] = useState([]);
  const [artSearch,      setArtSearch]      = useState("");
  const [artLoading,     setArtLoading]     = useState(false);
  const [addingLine,     setAddingLine]     = useState(false);
  const artTimer = useRef(null);

  useEffect(() => {
    if (artTimer.current) clearTimeout(artTimer.current);
    if (!artSearch || artSearch.length < 2) { setArticleOptions([]); return; }
    artTimer.current = setTimeout(() => {
      setArtLoading(true);
      axios.get(`/stock/articles/search?reference=${encodeURIComponent(artSearch)}&limit=30`)
        .then(r => setArticleOptions(r?.data?.articles || r?.data || []))
        .catch(() => setArticleOptions([]))
        .finally(() => setArtLoading(false));
    }, 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artSearch]);

  /* ── save header ── */
  const saveHeader = async () => {
    if (!fournisseur) { setError("Sélectionner un fournisseur"); return null; }
    setSaving(true); setError(null);
    try {
      const payload = {
        garageId, fournisseurId: fournisseur.id,
        reference: reference||null, date,
        dateAttendue: dateAttendue||null,
        notes: notes||null, userId: user?.id||null,
      };
      let id = bdcId;
      if (!id) {
        const r = await axios.post("/purchase-orders", payload);
        id = r?.data?.id;
        setBdcId(id);
        setStatus("DRAFT");
      } else {
        await axios.put(`/purchase-orders/${id}`, payload);
      }
      return id;
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur sauvegarde");
      return null;
    } finally { setSaving(false); }
  };

  /* ── add line ── */
  const handleAddLine = async () => {
    setError(null);
    if (!newLine.articleQ) { setError("Sélectionner un article"); return; }
    if (!newLine.quantiteCommandee || parseFloat(newLine.quantiteCommandee) <= 0)
      { setError("Quantité invalide"); return; }
    let id = bdcId;
    if (!id) { id = await saveHeader(); if (!id) return; }
    setAddingLine(true);
    try {
      const r = await axios.post(`/purchase-orders/${id}/lines`, {
        articleId:         newLine.articleQ.id,
        quantiteCommandee: parseFloat(newLine.quantiteCommandee),
        prixAchatUnitaire: newLine.prixAchatUnitaire ? parseFloat(newLine.prixAchatUnitaire) : undefined,
      });
      if (r?.data) setLines(p => [...p, r.data]);
      setNewLine(EMPTY); setArtSearch("");
    } catch (e) { setError(e?.response?.data?.message || "Erreur ajout ligne"); }
    finally { setAddingLine(false); }
  };

  /* ── remove line ── */
  const handleRemoveLine = async (lineId) => {
    try {
      await axios.deleteData(`/purchase-orders/${bdcId}/lines/${lineId}`);
      setLines(p => p.filter(l => l.id !== lineId));
    } catch (e) { setError(e?.response?.data?.message || "Erreur suppression"); }
  };

  /* ── edit line inline ── */
  const [editingLineId, setEditingLineId] = useState(null);
  const [editDraft,     setEditDraft]     = useState({});
  const [savingLineId,  setSavingLineId]  = useState(null);

  const startEdit = (line) => {
    setEditingLineId(line.id);
    setEditDraft({
      quantiteCommandee: String(line.quantiteCommandee ?? ""),
      prixAchatUnitaire: line.prixAchatUnitaire != null ? String(line.prixAchatUnitaire) : "",
    });
  };

  const cancelEdit = () => { setEditingLineId(null); setEditDraft({}); };

  const saveEdit = async (lineId) => {
    setError(null);
    const q = parseFloat(editDraft.quantiteCommandee);
    if (!q || q <= 0) { setError("Quantité invalide"); return; }
    setSavingLineId(lineId);
    try {
      await axios.put(`/purchase-orders/${bdcId}/lines/${lineId}`, {
        quantiteCommandee: q,
        prixAchatUnitaire: editDraft.prixAchatUnitaire ? parseFloat(editDraft.prixAchatUnitaire) : null,
      });
      setLines(p => p.map(l => l.id === lineId
        ? { ...l, quantiteCommandee: q, prixAchatUnitaire: editDraft.prixAchatUnitaire ? parseFloat(editDraft.prixAchatUnitaire) : null }
        : l
      ));
      setEditingLineId(null); setEditDraft({});
    } catch (e) { setError(e?.response?.data?.message || "Erreur modification ligne"); }
    finally { setSavingLineId(null); }
  };

  /* ── envoyer au fournisseur (DRAFT → SENT) ── */
  const handleSend = async () => {
    if (!bdcId) { setError("Sauvegardez d'abord la commande"); return; }
    if (lines.length === 0) { setError("Ajoutez au moins une ligne"); return; }
    if (!window.confirm("Envoyer cette commande au fournisseur ?\nElle ne pourra plus être modifiée.")) return;
    setSending(true); setError(null);
    try {
      await axios.post(`/purchase-orders/${bdcId}/send`, {});
      setStatus("SENT");
      onSaved && onSaved();
    } catch (e) { setError(e?.response?.data?.message || "Erreur envoi"); }
    finally { setSending(false); }
  };

  /* ── annuler ── */
  const handleCancel = async () => {
    if (!bdcId) { onBack(); return; }
    if (!window.confirm("Annuler cette commande ?")) return;
    setCancelling(true); setError(null);
    try {
      await axios.post(`/purchase-orders/${bdcId}/cancel`, {});
      setStatus("CANCELLED");
      onSaved && onSaved();
    } catch (e) { setError(e?.response?.data?.message || "Erreur annulation"); }
    finally { setCancelling(false); }
  };

  const setNL = k => v => setNewLine(p => ({ ...p, [k]: v }));

  return (
    <Box sx={{ display:"flex", flexDirection:"column", gap:2, height:"100%", overflow:"auto" }}>
      {/* ── En-tête ── */}
      <Box sx={{ p:2, border:"1px solid", borderColor:"divider", borderRadius:1.5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <Typography variant="caption" fontWeight={700} color="primary.main" textTransform="uppercase" letterSpacing={0.8}>
            En-tête de la commande
          </Typography>
          {status !== "DRAFT" && (
            <Chip label={STATUS_LABEL[status]} size="small" color={STATUS_COLOR[status]} variant="filled" sx={{ fontSize:10 }}/>
          )}
        </Box>

        <Box display="flex" gap={1.5} flexWrap="wrap">
          <Box flex="2 1 200px">
            <FL label="Fournisseur" required>
              <FournisseurAutocomplete value={fournisseur} onChange={setFournisseur} disabled={!isDraft} placeholder="Sélectionner…" />
            </FL>
          </Box>
          <Box flex="1 1 150px">
            <FL label="N° référence commande">
              <TextField size="small" fullWidth value={reference} disabled={!isDraft}
                onChange={e=>setReference(e.target.value)} placeholder="Ex : BDC-2024-001"/>
            </FL>
          </Box>
          <Box flex="1 1 130px">
            <FL label="Date commande" required>
              <TextField size="small" fullWidth type="date" value={date}
                onChange={e=>setDate(e.target.value)} disabled={!isDraft}/>
            </FL>
          </Box>
          <Box flex="1 1 130px">
            <FL label="Date livraison attendue">
              <TextField size="small" fullWidth type="date" value={dateAttendue}
                onChange={e=>setDateAttendue(e.target.value)} disabled={!isDraft}/>
            </FL>
          </Box>
          <Box flex="3 1 250px">
            <FL label="Notes / instructions">
              <TextField size="small" fullWidth multiline maxRows={2} value={notes}
                onChange={e=>setNotes(e.target.value)} disabled={!isDraft}/>
            </FL>
          </Box>
        </Box>

        {isDraft && (
          <Box display="flex" justifyContent="flex-end" mt={1.5}>
            <Button size="small" variant="outlined" onClick={saveHeader} disabled={saving} sx={{ textTransform:"none" }}>
              {saving ? <CircularProgress size={14} color="inherit"/> : "Sauvegarder l'en-tête"}
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Lignes existantes ── */}
      {lines.length > 0 && (
        <Box sx={{ border:"1px solid", borderColor:"divider", borderRadius:1.5, overflow:"hidden" }}>
          <Box sx={{ px:2, py:0.75, bgcolor:"background.default", borderBottom:"1px solid", borderColor:"divider" }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
              Lignes de commande ({lines.length})
            </Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Référence","Désignation","Marque","Qté commandée","Prix achat HT","Qté reçue",""].map(h=>(
                  <TableCell key={h} sx={{ fontWeight:700, fontSize:11, color:"text.secondary", py:0.75 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map(l => {
                const qCmd   = parseFloat(l.quantiteCommandee)||0;
                const qRecu  = parseFloat(l.quantiteRecue)||0;
                const isEdit = isEditable && editingLineId === l.id;
                const isSaving = savingLineId === l.id;

                return (
                  <TableRow key={l.id} hover
                    sx={{ bgcolor: isEdit ? theme => alpha(theme.palette.primary.main, 0.04) : "inherit" }}>
                    <TableCell sx={{ fontSize:12, fontFamily:"monospace" }}>{l.Article?.refExt||`#${l.articleId}`}</TableCell>
                    <TableCell sx={{ fontSize:12, maxWidth:200 }}>
                      <Typography variant="inherit" noWrap>{l.Article?.libelle1||"—"}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize:12 }}>{l.Article?.Marque?.nom||"—"}</TableCell>

                    {/* Qté commandée — éditable */}
                    <TableCell sx={{ minWidth: isEdit ? 100 : "auto" }}>
                      {isEdit ? (
                        <TextField size="small" type="number" autoFocus
                          inputProps={{ min:1, step:1, style:{ padding:"4px 8px", width:80 } }}
                          value={editDraft.quantiteCommandee}
                          onChange={e => setEditDraft(p=>({...p, quantiteCommandee: e.target.value}))}/>
                      ) : (
                        <Typography variant="body2" fontWeight={600}>{qCmd}</Typography>
                      )}
                    </TableCell>

                    {/* Prix achat — éditable */}
                    <TableCell sx={{ minWidth: isEdit ? 110 : "auto" }}>
                      {isEdit ? (
                        <TextField size="small" type="number"
                          inputProps={{ min:0, step:0.01, style:{ padding:"4px 8px", width:90 } }}
                          value={editDraft.prixAchatUnitaire} placeholder="0.00"
                          onChange={e => setEditDraft(p=>({...p, prixAchatUnitaire: e.target.value}))}
                          InputProps={{ endAdornment:<InputAdornment position="end">€</InputAdornment> }}/>
                      ) : (
                        <Typography variant="body2">
                          {l.prixAchatUnitaire!=null ? `${parseFloat(l.prixAchatUnitaire).toFixed(2)} €` : "—"}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Qté reçue (toujours lecture) */}
                    <TableCell sx={{ fontSize:12 }}>
                      {qRecu > 0
                        ? <Chip label={`${qRecu} / ${qCmd}`} size="small"
                            color={qRecu>=qCmd?"success":"warning"} variant="outlined" sx={{ fontSize:10 }}/>
                        : <Typography variant="caption" color="text.disabled">Non reçue</Typography>}
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ whiteSpace:"nowrap" }}>
                      {isEditable && (
                        isEdit ? (
                          <>
                            <Tooltip title="Confirmer la modification">
                              <IconButton size="small" color="success" onClick={()=>saveEdit(l.id)} disabled={isSaving}>
                                {isSaving ? <CircularProgress size={14} color="inherit"/> : <span style={{fontSize:14,fontWeight:700}}>✓</span>}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Annuler">
                              <IconButton size="small" onClick={cancelEdit}>
                                <CloseIcon sx={{ fontSize:14 }}/>
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip title="Modifier cette ligne">
                              <IconButton size="small" color="primary" onClick={()=>startEdit(l)}>
                                <EditIcon sx={{ fontSize:14 }}/>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton size="small" color="error" onClick={()=>handleRemoveLine(l.id)}>
                                <DeleteIcon sx={{ fontSize:14 }}/>
                              </IconButton>
                            </Tooltip>
                          </>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* ── Ajout ligne (DRAFT / SENT / PARTIAL) ── */}
      {isEditable && (
        <Box sx={{ p:2, border:"1px dashed", borderColor:"primary.main", borderRadius:1.5 }}>
          <Typography variant="caption" fontWeight={700} color="primary.main" textTransform="uppercase" letterSpacing={0.8} display="block" mb={1.5}>
            Ajouter un article
          </Typography>
          <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="flex-end">
            <Box flex="3 1 240px">
              <FL label="Article" required>
                <Autocomplete size="small" options={articleOptions} loading={artLoading}
                  inputValue={artSearch} value={newLine.articleQ}
                  onInputChange={(_,v)=>setArtSearch(v)} onChange={(_,v)=>setNL("articleQ")(v)}
                  getOptionLabel={o=>`${o.refExt||""} — ${o.libelle1||""}`.trim()}
                  isOptionEqualToValue={(o,v)=>o.id===v?.id}
                  noOptionsText={artSearch.length<2?"Saisissez 2 caractères…":"Aucun résultat"}
                  renderInput={p=>(
                    <TextField {...p} placeholder="Scanner ou chercher…"
                      InputProps={{ ...p.InputProps,
                        startAdornment:<InputAdornment position="start"><SearchIcon sx={{ fontSize:15, color:"text.disabled" }}/></InputAdornment>
                      }}/>
                  )}/>
              </FL>
            </Box>
            <Box flex="1 1 110px">
              <FL label="Qté commandée" required>
                <TextField size="small" fullWidth type="number" inputProps={{ min:1, step:1 }}
                  value={newLine.quantiteCommandee} onChange={e=>setNL("quantiteCommandee")(e.target.value)}/>
              </FL>
            </Box>
            <Box flex="1 1 120px">
              <FL label="Prix achat HT">
                <TextField size="small" fullWidth type="number" inputProps={{ min:0, step:0.01 }}
                  value={newLine.prixAchatUnitaire} onChange={e=>setNL("prixAchatUnitaire")(e.target.value)}
                  InputProps={{ endAdornment:<InputAdornment position="end">€</InputAdornment> }}/>
              </FL>
            </Box>
            <Box sx={{ alignSelf:"flex-end" }}>
              <Button size="small" variant="contained" onClick={handleAddLine} disabled={addingLine}
                startIcon={addingLine ? <CircularProgress size={14} color="inherit"/> : <AddIcon/>}
                sx={{ textTransform:"none" }}>
                {addingLine ? "Ajout…" : "Ajouter"}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {error && <Alert severity="error" onClose={()=>setError(null)}>{error}</Alert>}

      {/* ── Actions finales ── */}
      <Box display="flex" gap={1} justifyContent="flex-end" pt={1}
        sx={{ borderTop:"1px solid", borderColor:"divider", flexWrap:"wrap" }}>
        <Button size="small" variant="text" onClick={onBack} sx={{ textTransform:"none" }}>
          ← Retour à la liste
        </Button>
        {isDraft && (
          <>
            <Button size="small" variant="outlined" color="error" onClick={handleCancel} disabled={cancelling}
              startIcon={cancelling ? <CircularProgress size={14} color="inherit"/> : <CancelIcon/>}
              sx={{ textTransform:"none" }}>
              Annuler la commande
            </Button>
            <Button size="small" variant="outlined" onClick={saveHeader} disabled={saving}
              sx={{ textTransform:"none" }}>
              {saving ? <CircularProgress size={14} color="inherit"/> : "Sauvegarder"}
            </Button>
            <Button size="small" variant="contained" color="primary" onClick={handleSend}
              disabled={sending || lines.length===0}
              startIcon={sending ? <CircularProgress size={14} color="inherit"/> : <SendIcon/>}
              sx={{ textTransform:"none" }}>
              {sending ? "Envoi…" : "Envoyer au fournisseur"}
            </Button>
          </>
        )}
        {status === "SENT" && (
          <>
            <Button size="small" variant="outlined" color="error" onClick={handleCancel} disabled={cancelling}
              startIcon={cancelling ? <CircularProgress size={14} color="inherit"/> : <CancelIcon/>}
              sx={{ textTransform:"none" }}>
              Annuler
            </Button>
            <Button size="small" variant="outlined" startIcon={<PrintIcon/>}
              onClick={()=>generateBdcPdf({ ...initial, Lines:lines })}
              sx={{ textTransform:"none" }}>
              Imprimer
            </Button>
          </>
        )}
        {["PARTIAL","RECEIVED","CANCELLED"].includes(status) && (
          <Button size="small" variant="outlined" startIcon={<PrintIcon/>}
            onClick={()=>generateBdcPdf({ ...initial, Lines:lines })}
            sx={{ textTransform:"none" }}>
            Imprimer
          </Button>
        )}
      </Box>
    </Box>
  );
}

/* ── Composant principal ─────────────────────────────────────────────── */
export default function ConsultationCommandesModal({ open, onClose }) {
  const { user }  = useUser();
  const garageId  = user?.garageId;

  const [view,     setView]     = useState("list");
  const [selected, setSelected] = useState(null);
  const [refresh,  setRefresh]  = useState(0);

  useEffect(() => { if (!open) { setView("list"); setSelected(null); } }, [open]);

  const handleEdit  = bdc  => { setSelected(bdc); setView("form"); };
  const handleNew   = ()   => { setSelected(null); setView("form"); };
  const handleBack  = ()   => { setSelected(null); setView("list"); };
  const handleSaved = ()   => { setRefresh(p=>p+1); setView("list"); };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx:{ height:"92vh" } }}>
      <DialogTitle sx={{ display:"flex", alignItems:"center", gap:1,
        bgcolor:"background.default", borderBottom:"1px solid", borderColor:"divider", py:1.5, px:2.5 }}>
        <ShoppingCartIcon sx={{ color:"primary.main", fontSize:20 }}/>
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={700}>Tableau des commandes</Typography>
          <Typography variant="caption" color="text.secondary">
            {view==="list" ? "Commandes fournisseurs"
              : selected ? `BDC : ${selected.reference||`#${selected.id}`}` : "Nouvelle commande"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small"/></IconButton>
      </DialogTitle>

      <DialogContent sx={{ px:2.5, pt:2, pb:2, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {!garageId ? (
          <Alert severity="warning">Garage non identifié.</Alert>
        ) : view==="list" ? (
          <BdcList key={refresh} garageId={garageId} onNew={handleNew} onEdit={handleEdit} refreshKey={refresh}/>
        ) : (
          <BdcForm garageId={garageId} initial={selected} onBack={handleBack} onSaved={handleSaved}/>
        )}
      </DialogContent>
    </Dialog>
  );
}
