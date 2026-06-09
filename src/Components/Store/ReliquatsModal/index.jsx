import BlockIcon        from "@mui/icons-material/Block";
import CloseIcon        from "@mui/icons-material/Close";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import PhoneIcon        from "@mui/icons-material/Phone";
import SearchIcon       from "@mui/icons-material/Search";
import SendIcon         from "@mui/icons-material/Send";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  IconButton, InputAdornment, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Tooltip, Typography,
  alpha, useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useAxios } from "../../../utils/hook/useAxios";
import { useUser }  from "../../../utils/hook/UserContext";

/* ── helpers ─────────────────────────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
}

function retardJours(dateAttendue) {
  if (!dateAttendue) return null;
  const diff = Math.floor((Date.now() - new Date(dateAttendue)) / 86400000);
  return diff > 0 ? diff : null;
}

/* label au-dessus d'un champ */
function FL({ label, children }) {
  return (
    <Box>
      <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.4}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

/* ── Dialogue Relance ────────────────────────────────────────────────── */
function RelanceDialog({ row, onClose, onDone, axios }) {
  const [note,    setNote]    = useState("");
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState(null);

  const fss = row?.fournisseur;

  const handleSend = async () => {
    setSaving(true); setErr(null);
    try {
      await axios.post(`/purchase-orders/${row.bdcId}/relance`, { note });
      onDone();
    } catch (e) {
      setErr(e?.response?.data?.message || "Erreur");
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={!!row} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <SendIcon sx={{ color: "primary.main", fontSize: 18 }} />
        Relance fournisseur
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {fss && (
          <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" fontWeight={700}>{fss.nom}</Typography>
            {fss.telephone && (
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">{fss.telephone}</Typography>
              </Box>
            )}
            {fss.email && (
              <Typography variant="body2" color="primary.main" component="a"
                href={`mailto:${fss.email}`} sx={{ display: "block", mt: 0.25 }}>
                {fss.email}
              </Typography>
            )}
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          Article concerné
        </Typography>
        <Typography variant="body2" mb={2}>
          <strong>{row?.article?.refExt}</strong> — {row?.article?.libelle1}
          &nbsp;· <Chip label={`${row?.quantiteRestante} unité(s) attendue(s)`} size="small" color="warning" variant="outlined" sx={{ fontSize: 10 }} />
        </Typography>

        <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.4}>
          Note de relance (facultatif)
        </Typography>
        <TextField size="small" fullWidth multiline rows={3}
          placeholder="Ex : Rappelé le transporteur, livraison prévue vendredi…"
          value={note} onChange={e => setNote(e.target.value)} />

        {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button size="small" variant="text" onClick={onClose} sx={{ textTransform: "none" }}>Annuler</Button>
        <Button size="small" variant="contained" onClick={handleSend} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SendIcon />}
          sx={{ textTransform: "none" }}>
          {saving ? "Enregistrement…" : "Enregistrer la relance"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ── Composant principal ─────────────────────────────────────────────── */
export default function ReliquatsModal({ open, onClose }) {
  const axios          = useAxios();
  const { user }       = useUser();
  const garageId       = user?.garageId;
  const theme          = useTheme();

  /* données */
  const [reliquats,    setReliquats]    = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  /* filtres */
  const [fssFilter,    setFssFilter]    = useState(null);
  const [articleRef,   setArticleRef]   = useState("");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");

  /* actions */
  const [relanceRow,   setRelanceRow]   = useState(null);
  const [closingId,    setClosingId]    = useState(null);

  const articleTimer = useRef(null);

  /* chargement fournisseurs (une seule fois) */
  useEffect(() => {
    if (!open || !garageId) return;
    axios.get("/stock/fournisseurs?pageSize=200")
      .then(r => setFournisseurs(r?.data?.data || []))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, garageId]);

  /* chargement reliquats */
  const load = () => {
    if (!garageId) return;
    setLoading(true); setError(null);
    const params = new URLSearchParams();
    if (fssFilter)  params.set("fournisseurId", fssFilter.id);
    if (articleRef.trim()) params.set("articleRef", articleRef.trim());
    if (dateFrom)   params.set("dateFrom", dateFrom);
    if (dateTo)     params.set("dateTo",   dateTo);
    const qs = params.toString();
    axios.get(`/purchase-orders/${garageId}/reliquats${qs ? `?${qs}` : ""}`)
      .then(r => setReliquats(r?.data?.reliquats || []))
      .catch(() => setError("Impossible de charger les reliquats"))
      .finally(() => setLoading(false));
  };

  /* rechargement à chaque ouverture ou changement de filtre */
  useEffect(() => {
    if (!open || !garageId) return;
    if (articleTimer.current) clearTimeout(articleTimer.current);
    articleTimer.current = setTimeout(load, articleRef ? 400 : 0);
    return () => clearTimeout(articleTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, garageId, fssFilter, articleRef, dateFrom, dateTo]);

  /* réinitialiser à la fermeture */
  useEffect(() => {
    if (!open) {
      setReliquats([]); setFssFilter(null);
      setArticleRef(""); setDateFrom(""); setDateTo(""); setError(null);
    }
  }, [open]);

  /* ── fermer un reliquat ── */
  const handleClose = async (row) => {
    if (!window.confirm(`Annuler le reliquat de ${row.quantiteRestante} unité(s) de "${row.article?.libelle1 || row.articleId}" ?\nLa ligne sera considérée comme entièrement reçue.`)) return;
    setClosingId(row.lineId);
    try {
      await axios.put(`/purchase-orders/${row.bdcId}/lines/${row.lineId}/close-reliquat`, {});
      setReliquats(p => p.filter(r => r.lineId !== row.lineId));
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur lors de l'annulation");
    } finally { setClosingId(null); }
  };

  /* stats */
  const totalUnites   = reliquats.reduce((s, r) => s + r.quantiteRestante, 0);
  const enRetard      = reliquats.filter(r => retardJours(r.bdcDateAttendue) !== null).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { height: "88vh" } }}>
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1,
          bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider",
          py: 1.5, px: 2.5 }}
      >
        <HourglassTopIcon sx={{ color: "warning.main", fontSize: 20 }} />
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={700}>Consultation Reliquats</Typography>
          <Typography variant="caption" color="text.secondary">
            Lignes de commandes en attente de livraison
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pt: 2, pb: 2, display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>

        {/* ── Filtres ── */}
        <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="flex-end">
          <Box flex="2 1 180px">
            <FL label="Fournisseur">
              <Autocomplete size="small" options={fournisseurs}
                getOptionLabel={o => o.nom || ""}
                value={fssFilter} onChange={(_, v) => setFssFilter(v)}
                isOptionEqualToValue={(o, v) => o.id === v?.id}
                renderInput={params => (
                  <TextField {...params} placeholder="Tous les fournisseurs" />
                )}
              />
            </FL>
          </Box>

          <Box flex="2 1 180px">
            <FL label="Article (référence / désignation)">
              <TextField size="small" fullWidth value={articleRef}
                onChange={e => setArticleRef(e.target.value)}
                placeholder="Rechercher…"
                InputProps={{ startAdornment:
                  <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: "text.disabled" }} /></InputAdornment>
                }}
              />
            </FL>
          </Box>

          <Box flex="1 1 130px">
            <FL label="Commandé du">
              <TextField size="small" fullWidth type="date" value={dateFrom}
                onChange={e => setDateFrom(e.target.value)} />
            </FL>
          </Box>

          <Box flex="1 1 130px">
            <FL label="au">
              <TextField size="small" fullWidth type="date" value={dateTo}
                onChange={e => setDateTo(e.target.value)} />
            </FL>
          </Box>
        </Box>

        <Divider />

        {/* ── Stats ── */}
        {!loading && reliquats.length > 0 && (
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip icon={<HourglassTopIcon />}
              label={`${reliquats.length} ligne${reliquats.length > 1 ? "s" : ""} en attente`}
              color="warning" variant="outlined" size="small" />
            <Chip label={`${totalUnites} unité${totalUnites > 1 ? "s" : ""} manquante${totalUnites > 1 ? "s" : ""}`}
              color="default" variant="outlined" size="small" />
            {enRetard > 0 && (
              <Chip icon={<WarningAmberIcon />}
                label={`${enRetard} en retard`}
                color="error" variant="outlined" size="small" />
            )}
          </Box>
        )}

        {/* ── Erreur ── */}
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

        {/* ── Table ── */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress size={28} />
            </Box>
          ) : reliquats.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={1}>
              <HourglassTopIcon sx={{ fontSize: 48, color: "text.disabled" }} />
              <Typography variant="body2" color="text.disabled">
                Aucun reliquat{fssFilter || articleRef || dateFrom || dateTo ? " pour ces critères" : ""}
              </Typography>
            </Box>
          ) : (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {["BDC", "Date commande", "Date attendue", "Fournisseur", "Référence", "Désignation", "Qté commandée", "Qté reçue", "Restant", "Retard", "Actions"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary",
                      bgcolor: "background.default", whiteSpace: "nowrap" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {reliquats.map((r, i) => {
                  const jours = retardJours(r.bdcDateAttendue);
                  return (
                    <TableRow key={`${r.lineId}-${i}`} hover
                      sx={{ bgcolor: jours ? alpha(theme.palette.error.main, 0.04) : "inherit" }}
                    >
                      {/* BDC */}
                      <TableCell sx={{ fontSize: 12, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                        <Tooltip title={`Statut : ${r.bdcStatus}`}>
                          <span>{r.bdcReference || `#${r.bdcId}`}</span>
                        </Tooltip>
                      </TableCell>

                      {/* Date commande */}
                      <TableCell sx={{ fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(r.bdcDate)}</TableCell>

                      {/* Date attendue */}
                      <TableCell sx={{ fontSize: 12, whiteSpace: "nowrap" }}>
                        {r.bdcDateAttendue
                          ? <Typography variant="inherit" color={jours ? "error.main" : "text.primary"}>{fmtDate(r.bdcDateAttendue)}</Typography>
                          : <Typography variant="inherit" color="text.disabled">—</Typography>
                        }
                      </TableCell>

                      {/* Fournisseur */}
                      <TableCell sx={{ fontSize: 12, maxWidth: 140 }}>
                        <Typography variant="inherit" noWrap>
                          {r.fournisseur?.nom || "—"}
                        </Typography>
                      </TableCell>

                      {/* Référence */}
                      <TableCell sx={{ fontSize: 12, fontFamily: "monospace" }}>
                        {r.article?.refExt || `#${r.articleId}`}
                      </TableCell>

                      {/* Désignation */}
                      <TableCell sx={{ fontSize: 12, maxWidth: 200 }}>
                        <Typography variant="inherit" noWrap>{r.article?.libelle1 || "—"}</Typography>
                      </TableCell>

                      {/* Qté commandée */}
                      <TableCell sx={{ fontSize: 12, textAlign: "right" }}>{r.quantiteCommandee}</TableCell>

                      {/* Qté reçue */}
                      <TableCell sx={{ fontSize: 12, textAlign: "right" }}>{r.quantiteRecue}</TableCell>

                      {/* Restant */}
                      <TableCell sx={{ textAlign: "right" }}>
                        <Chip label={r.quantiteRestante} size="small" color="warning" variant="filled"
                          sx={{ fontSize: 11, fontWeight: 700 }} />
                      </TableCell>

                      {/* Retard */}
                      <TableCell>
                        {jours ? (
                          <Chip icon={<WarningAmberIcon sx={{ fontSize: 12 }} />}
                            label={`${jours}j`} size="small" color="error" variant="outlined"
                            sx={{ fontSize: 10 }} />
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Relancer le fournisseur">
                          <IconButton size="small" color="primary"
                            onClick={() => setRelanceRow(r)}>
                            <SendIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Annuler le reliquat (marquer comme reçu)">
                          <IconButton size="small" color="error"
                            disabled={closingId === r.lineId}
                            onClick={() => handleClose(r)}>
                            {closingId === r.lineId
                              ? <CircularProgress size={14} color="inherit" />
                              : <BlockIcon sx={{ fontSize: 15 }} />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Box>

      </DialogContent>

      {/* Dialogue de relance */}
      <RelanceDialog
        row={relanceRow}
        axios={axios}
        onClose={() => setRelanceRow(null)}
        onDone={() => { setRelanceRow(null); }}
      />
    </Dialog>
  );
}
