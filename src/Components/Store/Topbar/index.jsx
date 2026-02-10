import SearchIcon from "@mui/icons-material/Search";
import { AppBar, Box, Chip, InputBase, Paper, Toolbar } from "@mui/material";

export default function Topbar() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        gridColumn: "1 / -1",
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Brand */}

        {/* Spacer */}
        <Box flex={1} />

        {/* Search */}
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.5,
            width: { xs: "100%", md: 420 },
            maxWidth: 520,
            borderRadius: 3,
          }}
        >
          <SearchIcon sx={{ opacity: 0.7, fontSize: 18 }} />
          <InputBase
            placeholder="Rechercher : article, OR, facture, fournisseur…"
            sx={{
              color: "text.primary",
              fontSize: 14,
              width: "100%",
            }}
          />
        </Paper>

        {/* Actions */}
        <Box display="flex" gap={1}>
          <Chip
            label="Magasin : Principal"
            clickable
            sx={{
              borderRadius: 3,
              color: "white",

              fontSize: 13,
            }}
          />
          <Chip
            label="Admin"
            clickable
            sx={{
              borderRadius: 3,
              color: "white",

              fontSize: 13,
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
