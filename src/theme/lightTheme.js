// import { createTheme } from "@mui/material/styles";

// const theme = createTheme({
//   palette: {
//     mode: "light",
//     primary: {
//       main: "#4F46E5", // Indigo
//     },
//     secondary: {
//       main: "#3B82F6", // Bleu clair
//     },
//     background: {
//       default: "#F9FAFB", // Gris clair
//       paper: "#FFFFFF",
//     },
//     text: {
//       primary: "#1F2937", // Gris foncé
//       secondary: "#6B7280", // Gris moyen
//     },
//   },
//   typography: {
//     fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
//     h1: { fontSize: "2.5rem", fontWeight: 700 },
//     h2: { fontSize: "2rem", fontWeight: 700 },
//     h3: { fontSize: "1.5rem", fontWeight: 600 },
//     button: { textTransform: "none", fontWeight: 600 },
//   },
//   shape: {
//     borderRadius: 12, // arrondis doux
//   },
//   components: {
//     MuiCssBaseline: {
//       styleOverrides: {
//         body: {
//           scrollbarWidth: "thin", // Firefox
//           scrollbarColor: "#A5B4FC #F9FAFB", // thumb / track
//           backgroundColor: "#F9FAFB",
//         },
//         "*::-webkit-scrollbar": {
//           width: "8px",
//           height: "8px",
//         },
//         "*::-webkit-scrollbar-track": {
//           background: "#F9FAFB", // Clair (track)
//         },
//         "*::-webkit-scrollbar-thumb": {
//           backgroundColor: "#A5B4FC", // Indigo clair (thumb)
//           borderRadius: "8px",
//           border: "2px solid #F9FAFB", // pour espacement
//         },
//         "*::-webkit-scrollbar-thumb:hover": {
//           backgroundColor: "#818CF8", // Hover thumb
//         },
//       },
//     },

//     MuiButton: {
//       styleOverrides: {
//         root: {
//           borderRadius: 12,
//           fontWeight: 600,
//           padding: "10px 20px",
//         },
//       },
//     },
//     MuiPaper: {
//       styleOverrides: {
//         rounded: {
//           borderRadius: 16,
//         },
//       },
//     },
//     MuiCard: {
//       styleOverrides: {
//         root: {
//           borderRadius: 16,
//           boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
//         },
//       },
//     },
//   },
// });

// export default theme;

import { createTheme } from "@mui/material/styles";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4F46E5", // Indigo profond
    },
    secondary: {
      main: "#3B82F6", // Bleu clair
    },
    background: {
      default: "#F8FAFC", // Gris très clair (presque blanc bleuté)
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E293B", // Gris-bleu élégant
      secondary: "#64748B", // Gris doux
      disabled: "#94A3B8",
    },
    divider: "#E2E8F0", // pour une séparation douce
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
    borderRadius: 14, // arrondi plus harmonieux
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F8FAFC",
          color: "#1E293B",
          scrollbarWidth: "thin",
          scrollbarColor: "#A5B4FC #F1F5F9",
        },
        "*::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "*::-webkit-scrollbar-track": {
          background: "#F1F5F9",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "#A5B4FC",
          borderRadius: "8px",
          border: "2px solid #F1F5F9",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#6366F1",
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
          boxShadow: "0 2px 8px rgba(79, 70, 229, 0.2)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
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
          },
        },
      },
    },
  },
});

export default lightTheme;
