import { BuildCircle } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CardSection from "../Components/Store/CardSection";

export default function Atelier() {
  return (
    <CardSection
      icon={BuildCircle}
      title="Atelier – Ordres de réparation (OR)"
      subtitle="Les pièces sont bloquées (stock_or) jusqu’à facturation."
    >
      {/* Toolbar */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <TextField size="small" label="Rechercher OR" />
        <TextField select size="small" label="Statut" defaultValue="all">
          <MenuItem value="all">Tous</MenuItem>
          <MenuItem value="OPEN">OPEN</MenuItem>
          <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
          <MenuItem value="CLOSED">CLOSED</MenuItem>
        </TextField>
        <Button variant="contained">+ Nouvel OR</Button>
        <Button variant="outlined">Facturer OR</Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>OR</TableCell>
            <TableCell>Véhicule</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Pièces bloquées</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <b>#1245</b>
              <Typography variant="caption" display="block">
                Client : Karim
              </Typography>
            </TableCell>
            <TableCell>Peugeot 208</TableCell>
            <TableCell>
              <Chip label="IN_PROGRESS" color="warning" size="small" />
            </TableCell>
            <TableCell>
              <Chip label="Plaquette A x2" color="warning" size="small" />
              <Chip
                label="Huile 5W30 x1"
                color="warning"
                size="small"
                sx={{ ml: 1 }}
              />
            </TableCell>
            <TableCell align="right">260 €</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardSection>
  );
}
