import LockPersonIcon from "@mui/icons-material/LockPerson";
import Visibility     from "@mui/icons-material/Visibility";
import VisibilityOff  from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL_API } from "../../config";

const API = `${BASE_URL_API}/v1/platform`;

export default function PlatformLogin() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError("Email et mot de passe requis."); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Identifiants incorrects."); return; }

      // Stocker le token plateforme séparément du token garage
      localStorage.setItem("platformAdminToken", data.token);
      localStorage.setItem("platformAdminInfo",  JSON.stringify(data.admin));
      navigate("/platform/dashboard");
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ bgcolor: "#0f172a" }}
    >
      <Box width="100%" maxWidth={420} px={2}>
        {/* Logo / titre */}
        <Box textAlign="center" mb={4}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 2,
              bgcolor: "primary.main", display: "inline-flex",
              alignItems: "center", justifyContent: "center", mb: 2,
            }}
          >
            <LockPersonIcon sx={{ fontSize: 30, color: "#fff" }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#fff">
            Admin Plateforme
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mt: 0.5 }}>
            Espace réservé aux équipes ZP Digital
          </Typography>
        </Box>

        <Paper
          component="form"
          onSubmit={handleLogin}
          elevation={0}
          sx={{ p: 4, borderRadius: 3, bgcolor: "#1e293b" }}
        >
          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField
              label="Email"
              type="email"
              size="small"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              sx={{ input: { color: "#e2e8f0" }, label: { color: "rgba(255,255,255,0.5)" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                },
              }}
            />

            <TextField
              label="Mot de passe"
              type={showPwd ? "text" : "password"}
              size="small"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPwd(v => !v)} sx={{ color: "rgba(255,255,255,0.4)" }}>
                      {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ input: { color: "#e2e8f0" }, label: { color: "rgba(255,255,255,0.5)" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                },
              }}
            />

            {error && <Alert severity="error" sx={{ py: 0.5, fontSize: 13 }}>{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ mt: 0.5, fontWeight: 700 }}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </Box>
        </Paper>

        <Typography variant="caption" display="block" textAlign="center" mt={3}
          sx={{ color: "rgba(255,255,255,0.25)" }}>
          Accès strictement réservé aux employés ZP Digital.<br />
          Si vous êtes un garage, connectez-vous depuis l'accueil principal.
        </Typography>
      </Box>
    </Box>
  );
}
