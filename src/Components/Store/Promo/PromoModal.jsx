import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon            from "@mui/icons-material/Close";
import DeleteIcon           from "@mui/icons-material/Delete";
import LocalOfferIcon       from "@mui/icons-material/LocalOffer";
import SearchIcon           from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { BASE_URL_API } from "../../../config";
import { useUser } from "../../../utils/hook/UserContext";
import ArticleResultsDialog from "../../ArticleResultsDialog";
import ArticleSearchDialog  from "../../ArticleSearchDialog";

const API_BASE = `${BASE_URL_API}/v1`;

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR");
}

function isActive(promo) {
  const today = new Date().toISOString().slice(0, 10);
  return promo.dateDebut <= today && promo.dateFin >= today;
}

/* ─────────────────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────────────────── */
export default function PromoModal({ open, onClose }) {
  const { user }    = useUser();
  const garageId    = user?.garageId;

  const [searchOpen,  setSearchOpen]  = useState(false);
  const [results,     setResults]     = useState(null);
  const [resultsOpen, setResultsOpen] = useState(false);

  const [article,     setArticle]     = useState(null);  // article sélectionné
  const [prixPromo,   setPrixPromo]   = useState("");
  const [dateDebut,   setDateDebut]   = useState("");
  const [dateFin,     setDateFin]     = useState("");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState(null);
  const [success,     setSuccess]     = useState(false);

  const [listePromos, setListePromos] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  /* ── Charger la liste des promos du garage ── */
  const loadPromos = useCallback(async () => {
    if (!garageId) return;
    setLoadingList(true);
    try {
      const res  = await fetch(`${API_BASE}/stock/promos/garage/${garageId}`, { credentials: "include" });
      const data = await res.json();
      setListePromos(Array.isArray(data) ? data : []);
    } catch { setListePromos([]); }
    finally { setLoadingList(false); }
  }, [garageId]);

  useEffect(() => { if (open) loadPromos(); }, [open, loadPromos]);

  /* ── Sélection d'un article via search ── */
  function handleResults(data) {
    if (!data || data.length === 0) return;
    if (data.length === 1) { selectArticle(data[0]); }
    else { setResults(data); setResultsOpen(true); }
  }

  function selectArticle(art) {
    setArticle(art);
    setResultsOpen(false);
    setSearchOpen(false);
    setError(null);
    setSuccess(false);
  }

  /* ── Sauvegarder la promo ── */
  async function handleSave() {
    if (!article || !prixPromo || !dateDebut || !dateFin) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    if (dateDebut > dateFin) {
      setError("La date de début doit être antérieure à la date de fin.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/stock/articles/${article.id}/promos`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prixPromo: parseFloat(prixPromo), dateDebut, dateFin, garageId }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setSuccess(true);
      setPrixPromo("");
      setDateDebut("");
      setDateFin("");
      setArticle(null);
      loadPromos();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  /* ── Supprimer une promo ── */
  async function handleDelete(id) {
    try {
      await fetch(`${API_BASE}/stock/promos/${id}`, { method: "DELETE", credentials: "include" });
      loadPromos();
    } catch { /* silencieux */ }
  }

  function handleClose() {
    setSearchOpen(false);
    setResultsOpen(false);
    setResults(null);
    setArticle(null);
    setPrixPromo("");
    setDateDebut("");
    setDateFin("");
    setError(null);
    setSuccess(false);
    onClose();
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          pb: 1, borderBottom: "1px solid", borderColor: "divider",
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocalOfferIcon sx={{ fontSize: 18, color: "warning.main" }} />
            <Typography variant="subtitle1" fontWeight={700}>Gestion des promotions</Typography>
          </Box>
          <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box display="flex" minHeight={460}>

            {/* ─── Formulaire création (gauche) ──────── */}
            <Box
              width={340}
              p={2.5}
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ borderRight: "1px solid", borderColor: "divider", flexShrink: 0 }}
            >
              <Typography variant="body2" fontWeight={700}>Créer une promotion</Typography>

              {/* Sélection article */}
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                  Article
                </Typography>
                {article ? (
                  <Box
                    display="flex" alignItems="center" justifyContent="space-between"
                    sx={{ border: "1px solid", borderColor: "primary.main", borderRadius: 1, px: 1.5, py: 0.8, bgcolor: "primary.50" }}
                  >
                    <Box>
                      <Typography variant="caption" fontWeight={700} display="block">{article.libelle1 || "—"}</Typography>
                      <Typography variant="caption" color="text.secondary">{article.refExt || article.codeBarre || "—"}</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setArticle(null)}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SearchIcon sx={{ fontSize: 14 }} />}
                    onClick={() => setSearchOpen(true)}
                    fullWidth
                  >
                    Chercher un article
                  </Button>
                )}
              </Box>

              <Divider />

              {/* Prix promo */}
              <TextField
                label="Prix promotionnel (€ TTC)"
                size="small"
                type="number"
                fullWidth
                value={prixPromo}
                onChange={(e) => setPrixPromo(e.target.value)}
                inputProps={{ step: 0.01, min: 0 }}
                disabled={!article}
              />

              {/* Dates */}
              <Box display="flex" gap={1.5}>
                <TextField
                  label="Date de début"
                  size="small"
                  type="date"
                  fullWidth
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={!article}
                />
                <TextField
                  label="Date de fin"
                  size="small"
                  type="date"
                  fullWidth
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={!article}
                />
              </Box>

              {error   && <Alert severity="error"   sx={{ py: 0.5, fontSize: 12 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ py: 0.5, fontSize: 12 }}>Promo enregistrée.</Alert>}

              <Button
                variant="contained"
                color="warning"
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <AddCircleOutlineIcon />}
                onClick={handleSave}
                disabled={saving || !article || !prixPromo || !dateDebut || !dateFin}
                fullWidth
              >
                {saving ? "Enregistrement…" : "Créer la promo"}
              </Button>
            </Box>

            {/* ─── Liste des promos (droite) ─────────── */}
            <Box flex={1} display="flex" flexDirection="column">
              <Box px={2} py={1.5} sx={{ borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}>
                <Typography variant="body2" fontWeight={700}>
                  Promos enregistrées
                  {loadingList && <CircularProgress size={12} sx={{ ml: 1 }} />}
                </Typography>
              </Box>

              <Box flex={1} sx={{ overflowY: "auto" }}>
                {listePromos.length === 0 && !loadingList ? (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%" p={4}>
                    <Typography variant="caption" color="text.disabled">Aucune promo enregistrée.</Typography>
                  </Box>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: 700, fontSize: 11, color: "text.secondary", bgcolor: "background.default" } }}>
                        <TableCell>Article</TableCell>
                        <TableCell align="right">Prix promo</TableCell>
                        <TableCell>Période</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listePromos.map((promo) => (
                        <TableRow key={promo.id} hover>
                          <TableCell sx={{ py: 0.5 }}>
                            <Typography variant="caption" fontWeight={600} noWrap display="block">
                              {promo.Article?.libelle1 || "—"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {promo.Article?.refExt || promo.Article?.codeBarre || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 0.5 }}>
                            <Typography variant="caption" fontWeight={700} color="warning.main">
                              {Number(promo.prixPromo).toFixed(2)} €
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 0.5 }}>
                            <Typography variant="caption">
                              {fmt(promo.dateDebut)} → {fmt(promo.dateFin)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 0.5 }}>
                            <Chip
                              label={isActive(promo) ? "Active" : "Inactive"}
                              size="small"
                              color={isActive(promo) ? "success" : "default"}
                              variant="outlined"
                              sx={{ fontSize: "0.62rem", height: 18 }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 0.5 }}>
                            <Tooltip title="Supprimer">
                              <IconButton size="small" color="error" onClick={() => handleDelete(promo.id)}>
                                <DeleteIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <ArticleSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onResults={handleResults}
      />

      <ArticleResultsDialog
        open={resultsOpen && !!results && results.length > 0}
        onClose={() => { setResultsOpen(false); setResults(null); }}
        results={results || []}
        onSelectArticle={selectArticle}
      />
    </>
  );
}
