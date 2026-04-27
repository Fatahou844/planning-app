import BuildIcon           from "@mui/icons-material/Build";
import CheckCircleIcon      from "@mui/icons-material/CheckCircle";
import PersonAddIcon        from "@mui/icons-material/PersonAdd";
import Visibility           from "@mui/icons-material/Visibility";
import VisibilityOff        from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL_API } from "../../config";

const API = `${BASE_URL_API}/v1`;

const STEPS = ["Votre garage", "Votre compte", "Confirmation"];

const STEP_ICONS = [BuildIcon, PersonAddIcon, CheckCircleIcon];

/* ─── Champ texte uniforme ───────────────────────────── */
function Field({ label, name, value, onChange, type = "text", required = false, InputProps }) {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      size="small"
      fullWidth
      required={required}
      InputProps={InputProps}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   Page principale
───────────────────────────────────────────────────────── */
export default function AccountCreationSteps() {
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const [garage, setGarage] = useState({
    name: "", address: "", email: "", phone: "", codePostal: "", ville: "", website: "",
  });

  const [user, setUser] = useState({
    firstName: "", name: "", email: "", password: "", confirm: "",
  });

  const [createdInfo, setCreatedInfo] = useState(null);

  const setG = (e) => setGarage(p => ({ ...p, [e.target.name]: e.target.value }));
  const setU = (e) => setUser(p => ({ ...p, [e.target.name]: e.target.value }));

  /* ── Validation étape garage ── */
  function validateGarage() {
    if (!garage.name.trim()) return "Le nom du garage est obligatoire.";
    return null;
  }

  /* ── Validation étape utilisateur ── */
  function validateUser() {
    if (!user.firstName.trim() || !user.name.trim()) return "Prénom et nom obligatoires.";
    if (!user.email.trim() || !/\S+@\S+\.\S+/.test(user.email)) return "Email invalide.";
    if (user.password.length < 6) return "Le mot de passe doit faire au moins 6 caractères.";
    if (user.password !== user.confirm) return "Les mots de passe ne correspondent pas.";
    return null;
  }

  /* ── Étape suivante ── */
  function handleNext() {
    setError(null);
    if (step === 0) {
      const err = validateGarage();
      if (err) { setError(err); return; }
      setStep(1);
    }
  }

  /* ── Soumettre l'inscription ── */
  async function handleSubmit() {
    setError(null);
    const err = validateUser();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/register-garage`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          garage: {
            name:      garage.name,
            address:   garage.address,
            email:     garage.email,
            phone:     garage.phone,
            codePostal: garage.codePostal,
            ville:     garage.ville,
            website:   garage.website,
          },
          user: {
            firstName: user.firstName,
            name:      user.name,
            email:     user.email,
            password:  user.password,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Une erreur est survenue.");
        return;
      }

      setCreatedInfo(data);
      setStep(2);
    } catch (e) {
      setError("Impossible de joindre le serveur. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Rendu par étape ── */
  const steps = [
    /* ── Étape 0 : Garage ─────────────────────────── */
    <Box key="garage" display="flex" flexDirection="column" gap={2}>
      <Typography variant="body2" color="text.secondary" mb={1}>
        Renseignez les informations de votre garage. Seul le nom est obligatoire.
      </Typography>

      <Field label="Nom du garage *" name="name" value={garage.name} onChange={setG} required />

      <Box display="flex" gap={2}>
        <Field label="Code postal" name="codePostal" value={garage.codePostal} onChange={setG} />
        <Field label="Ville" name="ville" value={garage.ville} onChange={setG} />
      </Box>

      <Field label="Adresse" name="address" value={garage.address} onChange={setG} />

      <Box display="flex" gap={2}>
        <Field label="Email du garage" name="email" value={garage.email} onChange={setG} type="email" />
        <Field label="Téléphone" name="phone" value={garage.phone} onChange={setG} />
      </Box>

      <Field label="Site web" name="website" value={garage.website} onChange={setG} />

      {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}

      <Button variant="contained" size="large" onClick={handleNext} sx={{ mt: 1 }}>
        Suivant →
      </Button>
    </Box>,

    /* ── Étape 1 : Utilisateur ─────────────────────── */
    <Box key="user" display="flex" flexDirection="column" gap={2}>
      <Typography variant="body2" color="text.secondary" mb={1}>
        Ce compte sera le compte administrateur de votre garage.
      </Typography>

      <Box display="flex" gap={2}>
        <Field label="Prénom *" name="firstName" value={user.firstName} onChange={setU} required />
        <Field label="Nom *" name="name" value={user.name} onChange={setU} required />
      </Box>

      <Field label="Email *" name="email" value={user.email} onChange={setU} type="email" required />

      <Field
        label="Mot de passe *"
        name="password"
        value={user.password}
        onChange={setU}
        type={showPwd ? "text" : "password"}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Field
        label="Confirmer le mot de passe *"
        name="confirm"
        value={user.confirm}
        onChange={setU}
        type={showPwd2 ? "text" : "password"}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setShowPwd2(v => !v)}>
                {showPwd2 ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}

      <Box display="flex" gap={1.5} mt={1}>
        <Button variant="outlined" onClick={() => { setStep(0); setError(null); }} sx={{ flex: 1 }}>
          ← Retour
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ flex: 2 }}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}>
          {loading ? "Création en cours…" : "Créer mon compte"}
        </Button>
      </Box>
    </Box>,

    /* ── Étape 2 : Confirmation ────────────────────── */
    <Box key="confirm" textAlign="center" py={2}>
      <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Compte créé avec succès !
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Votre garage <strong>{garage.name}</strong> et votre compte ont bien été enregistrés.
        <br />
        Un administrateur va examiner votre demande. Vous serez notifié par email à{" "}
        <strong>{user.email}</strong> dès que votre accès sera activé.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, textAlign: "left", bgcolor: "background.default" }}>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5} fontWeight={700}>
          Récapitulatif
        </Typography>
        <Typography variant="body2">Garage : <strong>{garage.name}</strong></Typography>
        {garage.ville && <Typography variant="body2">Ville : <strong>{garage.ville} {garage.codePostal}</strong></Typography>}
        <Typography variant="body2">Compte : <strong>{user.firstName} {user.name}</strong> ({user.email})</Typography>
      </Paper>

      <Button variant="contained" component={Link} to="/" fullWidth>
        Retourner à la page de connexion
      </Button>
    </Box>,
  ];

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ bgcolor: "background.default", px: 2, py: 6 }}
    >
      <Box width="100%" maxWidth={560}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h5" fontWeight={800}>Créer un espace garage</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Inscription gratuite — accès soumis à validation
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 32, height: 32, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        bgcolor: step >= i ? "primary.main" : "action.disabledBackground",
                        color: step >= i ? "#fff" : "text.disabled",
                        transition: "all 0.3s",
                      }}
                    >
                      <Icon sx={{ fontSize: 16 }} />
                    </Box>
                  )}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {/* Formulaire */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          {steps[step]}
        </Paper>

        {step < 2 && (
          <Box textAlign="center" mt={2}>
            <Typography variant="caption" color="text.secondary">
              Déjà un compte ?{" "}
              <Link to="/" style={{ color: "inherit", fontWeight: 600 }}>Se connecter</Link>
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
