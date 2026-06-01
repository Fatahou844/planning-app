import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import CloseIcon        from "@mui/icons-material/Close";
import LocationOnIcon   from "@mui/icons-material/LocationOn";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SearchIcon       from "@mui/icons-material/Search";
import WarehouseIcon    from "@mui/icons-material/Warehouse";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useAxios } from "../../../utils/hook/useAxios";

/* ── helpers ─────────────────────────────────────────────────────────── */
function adresseLabel(article) {
  const parts = [
    article.Emplacement?.nom,
    article.rangee       && `All. ${article.rangee}`,
    article.etagere      && `Ét. ${article.etagere}`,
    article.casePosition && `Case ${article.casePosition}`,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/* ── champ de saisie avec label fixe au-dessus ───────────────────────── */
function FieldRow({ label, required, children }) {
  return (
    <Box mb={1.5}>
      <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
        {label}{required && <span style={{ color:"#d32f2f", marginLeft:2 }}>*</span>}
      </Typography>
      {children}
    </Box>
  );
}

/* ── badge emplacement actuel ────────────────────────────────────────── */
function AdresseActuelle({ article }) {
  const addr = adresseLabel(article);
  if (!addr) return (
    <Box sx={{ px:1.5, py:1, bgcolor:"action.hover", borderRadius:1, mb:2 }}>
      <Typography variant="caption" color="text.disabled">Aucun emplacement défini</Typography>
    </Box>
  );
  return (
    <Box sx={{ px:1.5, py:1, bgcolor:"action.hover", borderRadius:1, mb:2, display:"flex", alignItems:"center", gap:1 }}>
      <LocationOnIcon sx={{ fontSize:16, color:"text.secondary" }} />
      <Typography variant="caption" color="text.secondary" fontWeight={600}>Actuel :</Typography>
      <Typography variant="caption">{addr}</Typography>
    </Box>
  );
}

/* ── panneau de saisie adressage ─────────────────────────────────────── */
function FormAdressage({ article, emplacements, onSaved }) {
  const axios = useAxios();

  const [form, setForm] = useState({
    emplacementId:         article.emplacementId          || null,
    rangee:                article.rangee                 || "",
    etagere:               article.etagere                || "",
    casePosition:          article.casePosition           || "",
    commentaireAdressage:  article.commentaireAdressage   || "",
  });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState(null);

  /* reset si l'article change */
  useEffect(() => {
    setForm({
      emplacementId:        article.emplacementId         || null,
      rangee:               article.rangee                || "",
      etagere:              article.etagere               || "",
      casePosition:         article.casePosition          || "",
      commentaireAdressage: article.commentaireAdressage  || "",
    });
    setSuccess(false); setError(null);
  }, [article.id]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setSuccess(false); };

  const zoneValue = emplacements.find(e => e.id === form.emplacementId) || null;

  const handleSave = async () => {
    if (!form.emplacementId) { setError("La zone est obligatoire"); return; }
    setSaving(true); setError(null); setSuccess(false);
    try {
      await axios.put(`/stock/articles/${article.id}`, {
        article: {
          emplacementId:        form.emplacementId,
          rangee:               form.rangee               || null,
          etagere:              form.etagere              || null,
          casePosition:         form.casePosition         || null,
          commentaireAdressage: form.commentaireAdressage || null,
        },
      });
      setSuccess(true);
      onSaved({
        ...article,
        emplacementId:        form.emplacementId,
        Emplacement:          emplacements.find(e => e.id === form.emplacementId) || article.Emplacement,
        rangee:               form.rangee               || null,
        etagere:              form.etagere              || null,
        casePosition:         form.casePosition         || null,
        commentaireAdressage: form.commentaireAdressage || null,
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {/* Article résumé */}
      <Box sx={{ mb:2, p:1.5, border:"1px solid", borderColor:"divider", borderRadius:1 }}>
        <Typography variant="body2" fontWeight={700}>{article.libelle1}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily:"monospace" }}>
          {article.refExt || article.codeBarre || `ID ${article.id}`}
        </Typography>
        {article.Marque?.nom && (
          <Chip label={article.Marque.nom} size="small" sx={{ ml:1, fontSize:10 }} />
        )}
      </Box>

      <AdresseActuelle article={article} />

      <Divider sx={{ mb:2 }}>
        <Typography variant="caption" color="text.secondary">Nouvel emplacement</Typography>
      </Divider>

      {/* Zone */}
      <FieldRow label="Zone (emplacement)" required>
        <Autocomplete
          size="small"
          options={emplacements}
          getOptionLabel={e => e.nom || ""}
          value={zoneValue}
          onChange={(_, v) => set("emplacementId", v?.id || null)}
          renderInput={params => <TextField {...params} placeholder="Sélectionner une zone…" />}
        />
      </FieldRow>

      {/* Rangée / Allée */}
      <FieldRow label="Rangée / Allée">
        <TextField
          size="small"
          fullWidth
          placeholder="Ex : B, 3, C2…"
          value={form.rangee}
          onChange={e => set("rangee", e.target.value)}
        />
      </FieldRow>

      {/* Étagère */}
      <FieldRow label="Étagère">
        <TextField
          size="small"
          fullWidth
          placeholder="Ex : 2, H, supérieure…"
          value={form.etagere}
          onChange={e => set("etagere", e.target.value)}
        />
      </FieldRow>

      {/* Case / Position */}
      <FieldRow label="Case / Position">
        <TextField
          size="small"
          fullWidth
          placeholder="Ex : 7, A3, droite…"
          value={form.casePosition}
          onChange={e => set("casePosition", e.target.value)}
        />
      </FieldRow>

      {/* Commentaire */}
      <FieldRow label="Commentaire">
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          placeholder="Indication complémentaire…"
          value={form.commentaireAdressage}
          onChange={e => set("commentaireAdressage", e.target.value)}
        />
      </FieldRow>

      {/* Feedback */}
      {error   && <Alert severity="error"   sx={{ mb:1.5 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && (
        <Alert severity="success" sx={{ mb:1.5 }} icon={<CheckCircleIcon />}>
          Emplacement mis à jour avec succès.
        </Alert>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={handleSave}
        disabled={saving || !form.emplacementId}
        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <LocationOnIcon />}
        sx={{ textTransform:"none", fontWeight:600 }}
      >
        {saving ? "Enregistrement…" : "Valider l'emplacement"}
      </Button>
    </Box>
  );
}

/* ── composant principal ──────────────────────────────────────────────── */
export default function AdressageModal({ open, onClose }) {
  const axios = useAxios();
  const theme = useTheme();
  const searchRef = useRef(null);

  const [search,       setSearch]       = useState("");
  const [results,      setResults]      = useState([]);
  const [searching,    setSearching]    = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [emplacements, setEmplacements] = useState([]);

  /* Chargement des zones */
  useEffect(() => {
    if (!open) return;
    axios.get("/stock/emplacements").then(r => {
      setEmplacements(Array.isArray(r?.data) ? r.data : r?.data?.data || []);
    }).catch(() => {});
    setSearch(""); setResults([]); setSelected(null);
    setTimeout(() => searchRef.current?.focus(), 150);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* Recherche article (debounce 300 ms) */
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axios.get(`/stock/articles/search?reference=${encodeURIComponent(q)}&limit=30`);
        const data = res?.data;
        setResults(Array.isArray(data) ? data : data?.articles || data?.data || []);
      } catch { setResults([]); }
      finally  { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSaved = (updated) => {
    setSelected(updated);
    setResults(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx:{ height:"85vh" } }}>
      <DialogTitle
        sx={{
          display:"flex", alignItems:"center", gap:1,
          bgcolor:"background.default", borderBottom:"1px solid", borderColor:"divider",
          py:1.5, px:2.5,
        }}
      >
        <WarehouseIcon sx={{ color:"primary.main", fontSize:20 }} />
        <Typography variant="subtitle1" fontWeight={700} flex={1}>Adressage des articles</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p:0, display:"flex", overflow:"hidden" }}>

        {/* ── Panneau gauche : recherche ── */}
        <Box
          sx={{
            width:300, flexShrink:0,
            borderRight:"1px solid", borderColor:"divider",
            display:"flex", flexDirection:"column",
            bgcolor:"background.default",
          }}
        >
          {/* Barre de recherche */}
          <Box sx={{ p:1.5, borderBottom:"1px solid", borderColor:"divider" }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
              Rechercher un article
            </Typography>
            <TextField
              inputRef={searchRef}
              size="small"
              fullWidth
              placeholder="Réf., désignation, code-barres…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment:(
                  <InputAdornment position="start">
                    {searching
                      ? <CircularProgress size={14} />
                      : <SearchIcon sx={{ fontSize:15, color:"text.disabled" }} />
                    }
                  </InputAdornment>
                ),
                endAdornment:(
                  <Tooltip title="Scanner un code-barres (à venir)">
                    <IconButton size="small" sx={{ p:0.25 }}>
                      <QrCodeScannerIcon sx={{ fontSize:16, color:"text.disabled" }} />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
          </Box>

          {/* Résultats */}
          <Box sx={{ flex:1, overflow:"auto" }}>
            {search.trim().length < 2 ? (
              <Box sx={{ textAlign:"center", py:5, px:2 }}>
                <SearchIcon sx={{ fontSize:32, color:"text.disabled", mb:1 }} />
                <Typography variant="caption" color="text.disabled" display="block">
                  Saisissez au moins 2 caractères
                </Typography>
              </Box>
            ) : results.length === 0 && !searching ? (
              <Box sx={{ textAlign:"center", py:4 }}>
                <Typography variant="caption" color="text.disabled">Aucun article trouvé</Typography>
              </Box>
            ) : (
              <List dense disablePadding>
                {results.map(a => {
                  const addr = adresseLabel(a);
                  return (
                    <ListItem key={a.id} disablePadding divider>
                      <ListItemButton
                        selected={selected?.id === a.id}
                        onClick={() => setSelected(a)}
                        sx={{
                          px:1.5, py:1,
                          "&.Mui-selected": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600} noWrap>{a.libelle1}</Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" sx={{ fontFamily:"monospace", color:"text.secondary" }}>
                                {a.refExt || a.codeBarre || `ID ${a.id}`}
                              </Typography>
                              {addr && (
                                <Typography variant="caption" display="block" sx={{ color:"primary.main", fontSize:10 }}>
                                  <LocationOnIcon sx={{ fontSize:10, verticalAlign:"middle", mr:0.25 }} />
                                  {addr}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Box>

        {/* ── Panneau droit : formulaire ── */}
        <Box sx={{ flex:1, overflow:"auto", px:2.5, py:2 }}>
          {selected ? (
            <FormAdressage
              key={selected.id}
              article={selected}
              emplacements={emplacements}
              onSaved={handleSaved}
            />
          ) : (
            <Box
              sx={{
                height:"100%", display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:1.5, opacity:0.5,
              }}
            >
              <LocationOnIcon sx={{ fontSize:48, color:"text.disabled" }} />
              <Typography variant="body2" color="text.disabled">
                Sélectionnez un article dans les résultats
              </Typography>
            </Box>
          )}
        </Box>

      </DialogContent>
    </Dialog>
  );
}
