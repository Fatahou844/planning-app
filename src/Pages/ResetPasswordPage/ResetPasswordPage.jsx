import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAxios } from "../../utils/hook/useAxios";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const axios = useAxios();

  const handleSubmit = async () => {
    if (password !== confirm) {
      setAlertMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      const res = await axios.post("/auth/reset-password", {
        token,
        password,
      });
      setAlertMessage(res.data.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setAlertMessage(
        err.response?.data?.message || "Erreur lors du reset du mot de passe"
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h5" mb={3} textAlign="center">
          Réinitialiser votre mot de passe
        </Typography>

        {alertMessage && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {alertMessage}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            placeholder="Nouveau mot de passe"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            placeholder="Confirmez le mot de passe"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button variant="contained" onClick={handleSubmit}>
            Valider
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;
