import {
  Box,
  Button,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import CardSection from "../Components/Store/CardSection";
import { FactCheck } from "@mui/icons-material";

export default function Inventaire() {
  return (
    <CardSection
    icon={FactCheck}
      title="Inventaire"
      subtitle="La validation crée un mouvement INVENTORY_ADJUSTMENT."
    >
      <Box display="flex" gap={2} mb={2}>
        <TextField select size="small" label="Magasin" defaultValue="main">
          <MenuItem value="main">Principal</MenuItem>
        </TextField>
        <Button variant="contained">+ Nouvel inventaire</Button>
        <Button variant="outlined">Valider inventaire</Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Article</TableCell>
            <TableCell align="right">Théorique</TableCell>
            <TableCell align="right">Compté</TableCell>
            <TableCell align="right">Écart</TableCell>
            <TableCell>Action système</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <b>Plaquette de frein A</b>
            </TableCell>
            <TableCell align="right">20</TableCell>
            <TableCell align="right">
              <TextField size="small" defaultValue={18} sx={{ width: 80 }} />
            </TableCell>
            <TableCell align="right" sx={{ color: "error.main" }}>
              -2
            </TableCell>
            <TableCell>
              <Chip label="INVENTORY_ADJUSTMENT -2" color="warning" size="small" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardSection>
  );
}
