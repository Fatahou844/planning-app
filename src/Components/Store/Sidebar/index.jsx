import { Box, Button, Chip, Typography } from "@mui/material";

const navItems = [
  { key: "articles", label: "Articles", badge: "Catalogue" },
  { key: "stock", label: "Stock", badge: "Quantités" },
  { key: "atelier", label: "Atelier", badge: "OR" },
  { key: "inventaire", label: "Inventaire", badge: "Ajust." },
  { key: "reception", label: "Réception", badge: "BR" },
];

export default function Sidebar({ active, onChange }) {
  return (
    <Box gridRow="2" p={1.5} sx={{ backdropFilter: "blur(10px)" }}>
      <Typography variant="caption" sx={{ opacity: 0.6, ml: 1 }}>
        Modules
      </Typography>

      {navItems.map((item) => (
        <Button
          key={item.key}
          fullWidth
          onClick={() => onChange(item.key)}
          variant={active === item.key ? "contained" : "text"}
          sx={{
            justifyContent: "space-between",
            my: 0.5,
            borderRadius: 3,
          }}
        >
          {item.label}
          <Chip size="small" label={item.badge} />
        </Button>
      ))}
    </Box>
  );
}
