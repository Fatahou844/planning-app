import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import CloseIcon        from "@mui/icons-material/Close";
import LayersIcon       from "@mui/icons-material/Layers";
import LocationOnIcon   from "@mui/icons-material/LocationOn";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
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
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useAxios } from "../../../utils/hook/useAxios";
import { useUser }  from "../../../utils/hook/UserContext";

/* ── helpers ─────────────────────────────────────────────────────────── */
function getCurrentUser() {
  const s = localStorage.getItem("me");
  return s ? JSON.parse(s) : null;
}

function adresseLabel(article) {
  const emp = article.StockEmplacement || article.Emplacement;
  if (!emp) return null;
  const parts = [
    emp.nom,
    emp.rangee       && `All. ${emp.rangee}`,
    emp.etagere      && `Ét. ${emp.etagere}`,
    emp.casePosition && `Case ${emp.casePosition}`,
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

/* ── label affiché dans l'autocomplete emplacement ──────────────────── */
function emplacementLabel(e) {
  if (!e) return "";
  const parts = [
    e.nom,
    e.rangee       && `All. ${e.rangee}`,
    e.etagere      && `Ét. ${e.etagere}`,
    e.casePosition && `Case ${e.casePosition}`,
  ].filter(Boolean);
  return parts.join(" · ");
}

/* ── panneau de saisie adressage ─────────────────────────────────────── */
function FormAdressage({ article, garageId, emplacements, onSaved }) {
  const axios = useAxios();

  // L'emplacement courant vient de StockGarage (stocké dans article._stockEmplacementId)
  const [emplacementId, setEmplacementId] = useState(article._stockEmplacementId || null);
  const [commentaire,   setCommentaire]   = useState(article._stockCommentaire   || "");
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setEmplacementId(article._stockEmplacementId || null);
    setCommentaire(article._stockCommentaire     || "");
    setSuccess(false); setError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id]);

  const zoneValue = emplacements.find(e => e.id === emplacementId) || null;

  const handleSave = async () => {
    if (!emplacementId) { setError("L'emplacement est obligatoire"); return; }
    setSaving(true); setError(null); setSuccess(false);
    try {
      await axios.put(
        `/stock-garage/${garageId}/article/${article.id}/emplacement`,
        { emplacementId, commentaireAdressage: commentaire || null }
      );
      setSuccess(true);
      onSaved({
        ...article,
        _stockEmplacementId: emplacementId,
        _stockCommentaire:   commentaire || null,
        StockEmplacement:    emplacements.find(e => e.id === emplacementId) || null,
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

      {/* Emplacement */}
      <FieldRow label="Emplacement" required>
        <Autocomplete
          size="small"
          options={emplacements}
          getOptionLabel={emplacementLabel}
          value={zoneValue}
          onChange={(_, v) => { setEmplacementId(v?.id || null); setSuccess(false); }}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Box>
                <Typography variant="body2" fontWeight={600}>{option.nom}</Typography>
                {(option.rangee || option.etagere || option.casePosition) && (
                  <Typography variant="caption" color="text.secondary">
                    {[
                      option.rangee       && `All. ${option.rangee}`,
                      option.etagere      && `Ét. ${option.etagere}`,
                      option.casePosition && `Case ${option.casePosition}`,
                    ].filter(Boolean).join("  ·  ")}
                  </Typography>
                )}
                {option.nbArticles != null && (
                  <Typography variant="caption" color="primary.main" display="block">
                    {option.nbArticles} article{option.nbArticles > 1 ? "s" : ""}
                  </Typography>
                )}
              </Box>
            </li>
          )}
          renderInput={params => <TextField {...params} placeholder="Choisir un emplacement…" />}
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
          value={commentaire}
          onChange={e => { setCommentaire(e.target.value); setSuccess(false); }}
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
        disabled={saving || !emplacementId}
        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <LocationOnIcon />}
        sx={{ textTransform:"none", fontWeight:600 }}
      >
        {saving ? "Enregistrement…" : "Valider l'emplacement"}
      </Button>
    </Box>
  );
}

/* ── champ autocomplete avec label au-dessus (version légère) ────────── */
function AutoField({ label, options, value, onChange, getLabel, placeholder }) {
  return (
    <Box>
      <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
        {label}
      </Typography>
      <Autocomplete
        size="small"
        options={options}
        getOptionLabel={getLabel}
        value={value}
        onChange={(_, v) => onChange(v)}
        renderInput={params => <TextField {...params} placeholder={placeholder || "Tous"} />}
      />
    </Box>
  );
}

/* ── numéro d'étape ──────────────────────────────────────────────────── */
function StepBadge({ n, done, active }) {
  const theme = useTheme();
  const bg = done ? theme.palette.success.main
           : active ? theme.palette.primary.main
           : theme.palette.action.disabledBackground;
  const color = (done || active) ? "#fff" : theme.palette.text.disabled;
  return (
    <Box sx={{
      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
      bgcolor: bg, color, display: "flex", alignItems: "center",
      justifyContent: "center", fontWeight: 700, fontSize: 12,
    }}>
      {done ? "✓" : n}
    </Box>
  );
}

/* ── adressage en masse ──────────────────────────────────────────────── */
function AdressageEnMasse({ emplacements, garageId }) {
  const axios = useAxios();
  const theme = useTheme();

  /* référentiels */
  const [familles, setFamilles] = useState([]);
  const [groupes,  setGroupes]  = useState([]);
  const [marques,  setMarques]  = useState([]);

  useEffect(() => {
    axios.get("/stock/familles?limit=500").then(r => setFamilles(Array.isArray(r?.data) ? r.data : r?.data?.data || [])).catch(() => {});
    axios.get("/stock/groupes?limit=500").then(r  => setGroupes(Array.isArray(r?.data)  ? r.data : r?.data?.data || [])).catch(() => {});
    axios.get("/stock/marques?limit=500").then(r   => setMarques(Array.isArray(r?.data)  ? r.data : r?.data?.data || [])).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* critères */
  const [famille,           setFamille]          = useState(null);
  const [groupe,            setGroupe]            = useState(null);
  const [marque,            setMarque]            = useState(null);
  const [emplacementActuel, setEmplacementActuel] = useState(null);
  /* cible */
  const [emplacementCible,  setEmplacementCible]  = useState(null);

  /* états */
  const [preview,    setPreview]    = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [applying,   setApplying]   = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState(null);

  const hasCritere = !!(famille || groupe || marque || emplacementActuel);
  const hasCible   = !!emplacementCible;
  const canPreview = hasCritere && hasCible && !result;

  const invalidate = () => { setPreview(null); setResult(null); setError(null); };

  /* Prévisualisation : GET search avec les mêmes filtres → liste réelle */
  const handlePreview = async () => {
    setPreview(null); setResult(null); setError(null); setPreviewing(true);
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (famille?.id)          params.set("familleId",    famille.id);
      if (groupe?.id)           params.set("groupeId",     groupe.id);
      if (marque?.id)           params.set("marqueId",     marque.id);
      if (emplacementActuel?.id)params.set("emplacementId",emplacementActuel.id);
      const res = await axios.get(`/stock/articles/search?${params}`);
      const articles = Array.isArray(res?.data) ? res.data : res?.data?.articles || [];
      setPreview(articles);
    } catch (err) { setError(err?.response?.data?.message || "Erreur aperçu"); }
    finally { setPreviewing(false); }
  };

  /* Application : PUT bulk avec les critères */
  const handleApply = async () => {
    setResult(null); setError(null); setApplying(true);
    try {
      const res = await axios.put("/stock/articles/bulk-adressage", {
        garageId,
        familleId:            famille?.id           || undefined,
        groupeId:             groupe?.id            || undefined,
        marqueId:             marque?.id            || undefined,
        emplacementId_actuel: emplacementActuel?.id || undefined,
        emplacementId:        emplacementCible?.id,
      });
      setResult(res.data); setPreview(null);
    } catch (err) { setError(err?.response?.data?.message || "Erreur application"); }
    finally { setApplying(false); }
  };

  const reset = () => {
    setFamille(null); setGroupe(null); setMarque(null); setEmplacementActuel(null);
    setEmplacementCible(null); setPreview(null); setResult(null); setError(null);
  };

  /* ── render ── */
  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>

      {/* ──────── Colonne gauche : QUOI ──────── */}
      <Box
        sx={{
          flex: 1, overflow: "auto", p: 2.5,
          borderRight: "1px solid", borderColor: "divider",
        }}
      >
        {/* Étape 1 header */}
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <StepBadge n={1} done={hasCritere} active={!hasCritere} />
          <Box>
            <Typography variant="body2" fontWeight={700}>
              Quels articles ?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sélectionnez un ou plusieurs critères (combinés en ET)
            </Typography>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap={1.5}>
          <AutoField
            label="Famille d'articles"
            options={familles}
            value={famille}
            onChange={v => { setFamille(v); invalidate(); }}
            getLabel={o => o.nom || ""}
            placeholder="Toutes les familles"
          />
          <AutoField
            label="Groupe d'articles"
            options={groupes}
            value={groupe}
            onChange={v => { setGroupe(v); invalidate(); }}
            getLabel={o => o.nom || ""}
            placeholder="Tous les groupes"
          />
          <AutoField
            label="Marque"
            options={marques}
            value={marque}
            onChange={v => { setMarque(v); invalidate(); }}
            getLabel={o => o.nom || ""}
            placeholder="Toutes les marques"
          />
          <AutoField
            label="Emplacement actuel (pour réassigner)"
            options={emplacements}
            value={emplacementActuel}
            onChange={v => { setEmplacementActuel(v); invalidate(); }}
            getLabel={emplacementLabel}
            placeholder="Peu importe"
          />
        </Box>

        {!hasCritere && (
          <Typography variant="caption" color="text.disabled" display="block" mt={1.5}>
            Choisissez au moins un filtre ci-dessus.
          </Typography>
        )}
        {hasCritere && !preview && (
          <Box sx={{ mt: 1.5, px: 1.5, py: 1, bgcolor: alpha(theme.palette.success.main, 0.08), borderRadius: 1 }}>
            <Typography variant="caption" color="success.dark" fontWeight={600}>
              Critères :{" "}
              {[
                famille          && `Famille "${famille.nom}"`,
                groupe           && `Groupe "${groupe.nom}"`,
                marque           && `Marque "${marque.nom}"`,
                emplacementActuel&& `Actuellement dans "${emplacementActuel.nom}"`,
              ].filter(Boolean).join(", ")}
            </Typography>
          </Box>
        )}

        {/* ── Liste des articles prévisualisés ── */}
        {preview && !result && (
          <Box sx={{ mt: 1.5 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.75}>
              <Typography variant="caption" fontWeight={700} color={preview.length > 0 ? "warning.dark" : "text.disabled"}>
                {preview.length} article{preview.length > 1 ? "s" : ""} concerné{preview.length > 1 ? "s" : ""}
              </Typography>
              <Button size="small" variant="text" onClick={invalidate} sx={{ fontSize: 11, textTransform: "none", p: 0 }}>
                Modifier les critères
              </Button>
            </Box>
            {preview.length > 0 && (
              <Box sx={{ border: "1px solid", borderColor: "warning.main", borderRadius: 1, overflow: "hidden", maxHeight: 300, overflowY: "auto" }}>
                <Box sx={{ bgcolor: alpha(theme.palette.warning.main, 0.06), px: 1.5, py: 0.5, borderBottom: "1px solid", borderColor: "warning.light" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Ces articles vont être déplacés vers <strong>{emplacementLabel(emplacementCible)}</strong>
                  </Typography>
                </Box>
                {preview.map((a, i) => (
                  <Box
                    key={a.id}
                    sx={{
                      px: 1.5, py: 0.9,
                      borderBottom: i < preview.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                      display: "flex", alignItems: "center", gap: 1,
                    }}
                  >
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={600} noWrap>{a.libelle1}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                        {a.refExt || a.codeBarre || `#${a.id}`}
                        {a.Emplacement?.nom && (
                          <> · <span style={{ color: "#888" }}>actuellement : {a.Emplacement.nom}</span></>
                        )}
                      </Typography>
                    </Box>
                    {a.Marque?.nom && (
                      <Chip label={a.Marque.nom} size="small" variant="outlined" sx={{ fontSize: 10, flexShrink: 0 }} />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ──────── Colonne droite : OÙ + ACTIONS ──────── */}
      <Box
        sx={{
          width: 300, flexShrink: 0, overflow: "auto", p: 2.5,
          display: "flex", flexDirection: "column", gap: 2,
        }}
      >
        {/* Étape 2 */}
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <StepBadge n={2} done={hasCible} active={hasCritere && !hasCible} />
            <Box>
              <Typography variant="body2" fontWeight={700}>Vers quel emplacement ?</Typography>
              <Typography variant="caption" color="text.secondary">La destination</Typography>
            </Box>
          </Box>

          <Autocomplete
            size="small"
            options={emplacements}
            getOptionLabel={emplacementLabel}
            value={emplacementCible}
            onChange={(_, v) => { setEmplacementCible(v); invalidate(); }}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{option.nom}</Typography>
                  {(option.rangee || option.etagere || option.casePosition) && (
                    <Typography variant="caption" color="text.secondary">
                      {[
                        option.rangee       && `All. ${option.rangee}`,
                        option.etagere      && `Ét. ${option.etagere}`,
                        option.casePosition && `Case ${option.casePosition}`,
                      ].filter(Boolean).join("  ·  ")}
                    </Typography>
                  )}
                  {option.nbArticles != null && (
                    <Typography variant="caption" color="text.disabled" display="block">
                      {option.nbArticles} article{option.nbArticles > 1 ? "s" : ""} actuellement
                    </Typography>
                  )}
                </Box>
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                placeholder="Choisir la destination…"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderColor: hasCritere && !hasCible ? theme.palette.warning.main : undefined,
                  },
                }}
              />
            )}
          />

          {hasCritere && !hasCible && (
            <Typography variant="caption" color="warning.main" fontWeight={600} display="block" mt={0.75}>
              ← Choisissez la destination pour continuer
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Étape 3 */}
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <StepBadge n={3} done={!!result} active={hasCritere && hasCible} />
            <Box>
              <Typography variant="body2" fontWeight={700}>Confirmer</Typography>
              <Typography variant="caption" color="text.secondary">Aperçu puis application</Typography>
            </Box>
          </Box>

          {/* Bouton Prévisualiser */}
          <Button
            variant="outlined"
            fullWidth
            onClick={handlePreview}
            disabled={!canPreview || previewing}
            startIcon={previewing ? <CircularProgress size={14} /> : <PersonSearchIcon />}
            sx={{ textTransform: "none", mb: 1 }}
          >
            {previewing ? "Chargement…" : "Voir les articles concernés"}
          </Button>

          {/* Bouton Appliquer — visible dès qu'on a une liste */}
          {preview && preview.length > 0 && !result && (
            <Button
              variant="contained"
              color="warning"
              fullWidth
              onClick={handleApply}
              disabled={applying}
              startIcon={applying ? <CircularProgress size={14} color="inherit" /> : <LocationOnIcon />}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              {applying
                ? "Application en cours…"
                : `Déplacer ces ${preview.length} article${preview.length > 1 ? "s" : ""}`}
            </Button>
          )}

          {preview && preview.length === 0 && !result && (
            <Typography variant="caption" color="text.disabled" display="block" textAlign="center" mt={0.5}>
              Aucun article ne correspond aux critères.
            </Typography>
          )}

          {result && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              action={<Button size="small" color="inherit" onClick={reset}>Nouveau</Button>}
            >
              <strong>{result.updated}</strong> article{result.updated > 1 ? "s" : ""} déplacé{result.updated > 1 ? "s" : ""}.
            </Alert>
          )}

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 1 }}>{error}</Alert>
          )}
        </Box>

        <Box flex={1} />
        <Button size="small" variant="text" color="inherit" onClick={reset} sx={{ textTransform: "none", opacity: 0.5 }}>
          Tout réinitialiser
        </Button>
      </Box>
    </Box>
  );
}

/* ── composant principal ──────────────────────────────────────────────── */
export default function AdressageModal({ open, onClose }) {
  const axios = useAxios();
  const theme = useTheme();
  const searchRef = useRef(null);
  const [mode, setMode] = useState(0); // 0 = article par article, 1 = en masse

  const { user }       = useUser();
  const garageId       = user?.garageId;

  const [search,       setSearch]       = useState("");
  const [results,      setResults]      = useState([]);
  const [searching,    setSearching]    = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [emplacements, setEmplacements] = useState([]);

  /* Chargement des zones */
  useEffect(() => {
    if (!open) return;
    axios.get(`/stock/emplacements${garageId ? `?garageId=${garageId}` : ""}`).then(r => {
      setEmplacements(Array.isArray(r?.data) ? r.data : r?.data?.data || []);
    }).catch(() => {});
    setSearch(""); setResults([]); setSelected(null); setMode(0);
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

  /* Quand on sélectionne un article, charger son StockGarage pour l'emplacement du garage */
  const handleSelect = async (a) => {
    try {
      const res = await axios.get(`/stock-garage/${garageId}/article/${a.id}`);
      const sg  = res?.data;
      setSelected({
        ...a,
        _stockEmplacementId: sg?.emplacementId        || null,
        _stockCommentaire:   sg?.commentaireAdressage || null,
        StockEmplacement:    sg?.Emplacement          || null,
      });
    } catch {
      setSelected(a);
    }
  };

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

      {/* ── Onglets ── */}
      <Tabs
        value={mode}
        onChange={(_, v) => setMode(v)}
        sx={{ px: 2.5, borderBottom: "1px solid", borderColor: "divider", minHeight: 40 }}
        TabIndicatorProps={{ style: { height: 2 } }}
      >
        <Tab
          icon={<SearchIcon sx={{ fontSize: 14 }} />}
          iconPosition="start"
          label="Article par article"
          sx={{ fontSize: 12, minHeight: 40, textTransform: "none", gap: 0.5 }}
        />
        <Tab
          icon={<LayersIcon sx={{ fontSize: 14 }} />}
          iconPosition="start"
          label="Traitement en masse"
          sx={{ fontSize: 12, minHeight: 40, textTransform: "none", gap: 0.5 }}
        />
      </Tabs>

      <DialogContent sx={{ p:0, display:"flex", overflow:"hidden" }}>

        {/* ── Mode en masse ── */}
        {mode === 1 && (
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <AdressageEnMasse emplacements={emplacements} garageId={garageId} />
          </Box>
        )}

        {/* ── Mode article par article ── */}
        {mode === 0 && <>

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
                        onClick={() => handleSelect(a)}
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
              garageId={garageId}
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

        </>}

      </DialogContent>
    </Dialog>
  );
}
