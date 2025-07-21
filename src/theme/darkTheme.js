import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4F46E5", // Indigo profond
    },
    secondary: {
      main: "#3B82F6",
    },
    background: {
      default: "#0F172A", // Bleu-gris très foncé
      paper: "#1E293B", // Bleu-gris intermédiaire
    },
    text: {
      primary: "#F8FAFC", // Presque blanc
      secondary: "#94A3B8", // Gris bleuté doux
      disabled: "#64748B",
    },
    divider: "#334155", // pour séparer subtilement
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Arial', sans-serif`,
    h1: {
      fontSize: "2.75rem",
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },
    h2: {
      fontSize: "2.125rem",
      fontWeight: 700,
      letterSpacing: "-0.4px",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.375rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.2px",
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0F172A",
          color: "#F8FAFC",
          scrollbarWidth: "thin",
          scrollbarColor: "#6366F1 #1E293B",
        },
        "*::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "*::-webkit-scrollbar-track": {
          background: "#1E293B",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "#6366F1",
          borderRadius: "8px",
          border: "2px solid #1E293B",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#818CF8",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          fontWeight: 600,
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#4338CA",
          },
        },
        containedPrimary: {
          boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "#1E293B",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "#1E293B",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#0F172A",
            color: "#F8FAFC",
          },
        },
      },
    },
  },
});

export default darkTheme;
