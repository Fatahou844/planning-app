import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4F46E5", // Indigo
    },
    secondary: {
      main: "#3B82F6", // Bleu clair
    },
    background: {
      default: "#F9FAFB", // Gris clair
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1F2937", // Gris foncé
      secondary: "#6B7280", // Gris moyen
    },
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 700 },
    h3: { fontSize: "1.5rem", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 12, // arrondis doux
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: "thin", // Firefox
          scrollbarColor: "#A5B4FC #F9FAFB", // thumb / track
          backgroundColor: "#F9FAFB",
        },
        "*::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "*::-webkit-scrollbar-track": {
          background: "#F9FAFB", // Clair (track)
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "#A5B4FC", // Indigo clair (thumb)
          borderRadius: "8px",
          border: "2px solid #F9FAFB", // pour espacement
        },
        "*::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#818CF8", // Hover thumb
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          padding: "10px 20px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

export default theme;
