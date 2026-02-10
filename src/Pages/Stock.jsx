import WarehouseIcon from "@mui/icons-material/Warehouse";
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

export default function Stock() {
  return (
    <CardSection
      icon={WarehouseIcon}
      title="Gestion de stock"
      subtitle="Physique, Réservé, OR et Disponible (Physique − Réservé − OR)"
    >
      {/* Toolbar */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <TextField size="small" label="Filtrer par article" />
        <TextField select size="small" label="Magasin" defaultValue="main">
          <MenuItem value="main">Principal</MenuItem>
          <MenuItem value="a">Succursale A</MenuItem>
        </TextField>
        <Button variant="outlined">Exporter</Button>
        <Button variant="contained">+ Mouvement manuel</Button>
      </Box>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Article</TableCell>
            <TableCell align="right">Physique</TableCell>
            <TableCell align="right">Réservé</TableCell>
            <TableCell align="right">OR</TableCell>
            <TableCell align="right">Disponible</TableCell>
            <TableCell>État</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <b>Plaquette de frein A</b>
              <Typography variant="caption" display="block">
                PLQ-A
              </Typography>
            </TableCell>
            <TableCell align="right">20</TableCell>
            <TableCell align="right">4</TableCell>
            <TableCell align="right">6</TableCell>
            <TableCell align="right">
              <b>10</b>
            </TableCell>
            <TableCell>
              <Chip label="OK" color="success" size="small" />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <b>Pneu 205/55 R16</b>
              <Typography variant="caption" display="block">
                TIRE-20555
              </Typography>
            </TableCell>
            <TableCell align="right">2</TableCell>
            <TableCell align="right">2</TableCell>
            <TableCell align="right">1</TableCell>
            <TableCell align="right" sx={{ color: "error.main" }}>
              <b>-1</b>
            </TableCell>
            <TableCell>
              <Chip label="Rupture" color="error" size="small" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardSection>
  );
}
