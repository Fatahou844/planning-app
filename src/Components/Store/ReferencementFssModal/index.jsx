import AddBusinessIcon   from "@mui/icons-material/AddBusiness";
import CloseIcon         from "@mui/icons-material/Close";
import SearchIcon        from "@mui/icons-material/Search";
import WarningAmberIcon  from "@mui/icons-material/WarningAmber";
import CheckCircleIcon   from "@mui/icons-material/CheckCircle";
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
  InputAdornment,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useAxios } from "../../../utils/hook/useAxios";

/* ── champ avec label au-dessus ─────────────────────────────────────── */
function Field({ label, required, error, children }) {
  return (
    <Box mb={1.8}>
      <Typography variant="caption" fontWeight={600} color={error ? "error" : "text.secondary"} display="block" mb={0.5}>
        {label}{required && <span style={{ color: "#d32f2f", marginLeft: 3 }}>*</span>}
      </Typography>
      {children}
      {error && (
        <Typography variant="caption" color="error" display="block" mt={0.4}>{error}</Typography>
      )}
    </Box>
  );
}

/* ── section avec séparateur ────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <Box mb={2.5}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8,
          color: "primary.main", display: "block", mb: 1.2,
          borderBottom: "2px solid", borderColor: "primary.light", pb: 0.5,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

/* ── étape 1 : vérification doublon ─────────────────────────────────── */
function StepVerification({ onConfirm }) {
  const axios  = useAxios();
  const theme  = useTheme();
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState(null); // null = pas encore cherché
  const [loading,  setLoading]  = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const res = await axios.get(`/stock/fournisseurs?q=${encodeURIComponent(q)}&pageSize=10`);
      const data = res?.data;
      setResults(Array.isArray(data) ? data : data?.data || []);
    } catch { setResults([]); }
    finally   { setLoading(false); }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Avant de créer un nouveau fournisseur, vérifiez qu'il n'existe pas déjà dans la base.
      </Typography>

      <Field label="Rechercher par nom ou SIRET">
        <Box display="flex" gap={1}>
          <TextField
            size="small"
            fullWidth
            placeholder="Ex : GATES, 12345678900012…"
            value={query}
            onChange={e => { setQuery(e.target.value); setResults(null); }}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 15, color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            startIcon={loading ? <CircularProgress size={14} /> : null}
            sx={{ textTransform: "none", whiteSpace: "nowrap" }}
          >
            Vérifier
          </Button>
        </Box>
      </Field>

      {/* Résultats */}
      {results !== null && (
        <Box mt={1} mb={2}>
          {results.length === 0 ? (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ fontSize: 13 }}
            >
              Aucun fournisseur existant trouvé. Vous pouvez procéder à la création.
            </Alert>
          ) : (
            <>
              <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 1, fontSize: 13 }}>
                {results.length} fournisseur{results.length > 1 ? "s" : ""} existant{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""} — vérifiez qu'il ne s'agit pas du même.
              </Alert>
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
                {results.map((f, i) => (
                  <Box
                    key={f.id}
                    sx={{
                      px: 1.5, py: 1,
                      borderBottom: i < results.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                      display: "flex", alignItems: "center", gap: 1.5,
                    }}
                  >
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={600}>{f.nom}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[f.code, f.siret, f.ville].filter(Boolean).join(" · ")}
                      </Typography>
                    </Box>
                    <Chip
                      label={f.statut || "ACTIF"}
                      size="small"
                      color={f.statut === "INACTIF" ? "default" : f.statut === "SUSPENDU" ? "error" : "success"}
                      sx={{ fontSize: 10 }}
                    />
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{ textTransform: "none" }}
        >
          Continuer vers la création
        </Button>
      </Box>
    </Box>
  );
}

/* ── étape 2 : formulaire de création ───────────────────────────────── */
const EMPTY_FORM = {
  nom: "", siret: "", tvaIntracom: "",
  adresse1: "", adresse2: "", codePostal: "", ville: "", region: "", pays: "France",
  contactNom: "", contactPrenom: "", telephone: "", email: "", siteWeb: "",
  remise: "", delaiLivraison: "", conditionsPaiement: "", francoPort: "", montantMinCommande: "",
  notes: "",
};

function StepFormulaire({ onCreated }) {
  const axios = useAxios();
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState(null);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.nom.trim())       e.nom       = "La raison sociale est obligatoire";
    if (!form.siret.trim())     e.siret     = "Le SIRET est obligatoire";
    else if (!/^\d{14}$/.test(form.siret.replace(/\s/g, "")))
                                e.siret     = "Le SIRET doit contenir 14 chiffres";
    if (!form.adresse1.trim())  e.adresse1  = "L'adresse est obligatoire";
    if (!form.telephone.trim()) e.telephone = "Le téléphone est obligatoire";
    if (!form.email.trim())     e.email     = "L'email est obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                e.email     = "Format email invalide";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true); setApiErr(null);
    try {
      const payload = {
        ...form,
        siret:             form.siret.replace(/\s/g, "") || null,
        remise:            form.remise            ? parseFloat(form.remise)            : null,
        delaiLivraison:    form.delaiLivraison    ? parseInt(form.delaiLivraison)      : null,
        francoPort:        form.francoPort        ? parseFloat(form.francoPort)        : null,
        montantMinCommande:form.montantMinCommande? parseFloat(form.montantMinCommande): null,
      };
      const res = await axios.post("/stock/fournisseurs", payload);
      onCreated(res?.data);
    } catch (err) {
      setApiErr(err?.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const tf = (name, label, required, props = {}) => (
    <Field label={label} required={required} error={errors[name]}>
      <TextField
        size="small"
        fullWidth
        value={form[name]}
        onChange={e => set(name, e.target.value)}
        error={!!errors[name]}
        {...props}
      />
    </Field>
  );

  return (
    <Box>
      {apiErr && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiErr(null)}>{apiErr}</Alert>}

      <Section title="Informations légales">
        {tf("nom",        "Raison sociale",            true)}
        {tf("siret",      "SIRET (14 chiffres)",        true, { placeholder: "Ex : 12345678900012" })}
        {tf("tvaIntracom","N° TVA intracommunautaire",  false,{ placeholder: "Ex : FR12345678901" })}
      </Section>

      <Section title="Adresse">
        {tf("adresse1",  "Adresse ligne 1",  true)}
        {tf("adresse2",  "Adresse ligne 2",  false)}
        <Box display="flex" gap={1.5}>
          <Box flex="0 0 120px">{tf("codePostal", "Code postal", false)}</Box>
          <Box flex={1}>{tf("ville", "Ville", false)}</Box>
        </Box>
        <Box display="flex" gap={1.5}>
          <Box flex={1}>{tf("region", "Région", false)}</Box>
          <Box flex={1}>{tf("pays",   "Pays",   false, { placeholder: "France" })}</Box>
        </Box>
      </Section>

      <Section title="Contact commercial">
        <Box display="flex" gap={1.5}>
          <Box flex={1}>{tf("contactPrenom", "Prénom",          false)}</Box>
          <Box flex={1}>{tf("contactNom",    "Nom de famille",  false)}</Box>
        </Box>
        {tf("telephone", "Téléphone", true,  { placeholder: "Ex : 0142000000" })}
        {tf("email",     "Email commandes", true, { type:"email", placeholder: "commandes@fournisseur.fr" })}
        {tf("siteWeb",   "Site web",        false,{ placeholder: "https://…" })}
      </Section>

      <Section title="Conditions commerciales">
        <Box display="flex" gap={1.5}>
          <Box flex={1}>{tf("remise",         "Remise négociée (%)",    false, { type:"number", inputProps:{ min:0, max:100, step:0.5 } })}</Box>
          <Box flex={1}>{tf("delaiLivraison", "Délai livraison (jours)",false, { type:"number", inputProps:{ min:0 } })}</Box>
        </Box>
        <Box display="flex" gap={1.5}>
          <Box flex={1}>{tf("conditionsPaiement",  "Délai de paiement",    false, { placeholder: "Ex : 30j net, comptant" })}</Box>
          <Box flex={1}>{tf("francoPort",           "Franco de port (€)",   false, { type:"number", inputProps:{ min:0, step:0.01 } })}</Box>
        </Box>
        {tf("montantMinCommande", "Montant minimum de commande (€)", false, { type:"number", inputProps:{ min:0, step:0.01 } })}
      </Section>

      <Section title="Notes">
        <Field label="Conditions particulières / remarques">
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={3}
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
          />
        </Field>
      </Section>

      <Box display="flex" justifyContent="flex-end" mt={1}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddBusinessIcon />}
          sx={{ textTransform: "none", fontWeight: 700, px: 4 }}
        >
          {saving ? "Enregistrement…" : "Créer le fournisseur"}
        </Button>
      </Box>
    </Box>
  );
}

/* ── étape 3 : confirmation ──────────────────────────────────────────── */
function StepConfirmation({ fournisseur, onClose, onAnother }) {
  const theme = useTheme();
  return (
    <Box textAlign="center" py={3}>
      <Box
        sx={{
          width: 64, height: 64, borderRadius: "50%", mx: "auto", mb: 2,
          bgcolor: alpha(theme.palette.success.main, 0.12),
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 36, color: "success.main" }} />
      </Box>
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        Fournisseur créé avec succès
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={0.5}>
        {fournisseur?.nom}
      </Typography>
      {fournisseur?.siret && (
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          SIRET : {fournisseur.siret}
        </Typography>
      )}
      <Chip label={`ID #${fournisseur?.id}`} size="small" color="primary" sx={{ mb: 3 }} />

      <Box display="flex" gap={1.5} justifyContent="center">
        <Button variant="outlined" onClick={onAnother} sx={{ textTransform: "none" }}>
          Référencer un autre fournisseur
        </Button>
        <Button variant="contained" onClick={onClose} sx={{ textTransform: "none" }}>
          Fermer
        </Button>
      </Box>
    </Box>
  );
}

/* ── composant principal ──────────────────────────────────────────────── */
const STEPS = ["Vérification", "Informations", "Confirmation"];

export default function ReferencementFssModal({ open, onClose }) {
  const [step,       setStep]       = useState(0);
  const [created,    setCreated]    = useState(null);

  const reset = () => { setStep(0); setCreated(null); };

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { maxHeight: "90vh" } }}
    >
      <DialogTitle
        sx={{
          display: "flex", alignItems: "center", gap: 1,
          bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider",
          py: 1.5, px: 2.5,
        }}
      >
        <AddBusinessIcon sx={{ color: "primary.main", fontSize: 20 }} />
        <Typography variant="subtitle1" fontWeight={700} flex={1}>
          Référencement fournisseur
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 3 }}>
        {/* Stepper */}
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{ sx: { fontSize: 20 } }}
                sx={{ "& .MuiStepLabel-label": { fontSize: 13 } }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 && (
          <StepVerification onConfirm={() => setStep(1)} />
        )}

        {step === 1 && (
          <StepFormulaire
            onCreated={fss => { setCreated(fss); setStep(2); }}
          />
        )}

        {step === 2 && (
          <StepConfirmation
            fournisseur={created}
            onClose={handleClose}
            onAnother={reset}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
