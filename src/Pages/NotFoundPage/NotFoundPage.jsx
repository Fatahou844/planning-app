import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 12,
          p: 4,
          textAlign: "center",
          border: "1px solid #ddd",
          borderRadius: 3,
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          background: "#fafafa",
        }}
      >
        <Typography
          variant="h1"
          sx={{ fontSize: "6rem", fontWeight: "bold", color: "#f44336", mb: 2 }}
        >
          404
        </Typography>
        <Typography variant="h5" gutterBottom>
          Oups ! Cette page n’existe pas 🚧
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: "gray" }}>
          Le lien que vous avez suivi est invalide ou n’existe plus.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          Retour à l’accueil
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
