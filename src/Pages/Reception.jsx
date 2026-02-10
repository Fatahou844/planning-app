import {
  AddCircleOutline,
  LocalShipping,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import CardSection from "../Components/Store/CardSection";

export default function Reception() {
  return (
    <CardSection
      icon={LocalShipping}
      title="Réception fournisseur (BR)"
      subtitle="La validation crée un stock_movement positif."
    >
      {/* Toolbar */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField select size="small" label="Fournisseur" defaultValue="auto">
          <MenuItem value="auto">Autoparts Pro</MenuItem>
          <MenuItem value="speed">Speed Auto</MenuItem>
        </TextField>
        <Button variant="contained">Valider BR</Button>
        <Button variant="outlined">Enregistrer brouillon</Button>
      </Box>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Article</TableCell>
            <TableCell align="right">Commandé</TableCell>
            <TableCell align="right">Reçu</TableCell>
            <TableCell>Résultat</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {/* Ligne 1 : réception complète */}
          <TableRow hover>
            <TableCell>
              <b>Plaquette de frein A</b>
            </TableCell>
            <TableCell align="right">20</TableCell>
            <TableCell align="right">20</TableCell>
            <TableCell>
              <Chip label="Entrée stock +20" color="success" size="small" />
            </TableCell>
            <TableCell align="center">
              <Tooltip title="Créer l'entrée marchandise">
                <IconButton color="success">
                  <AddCircleOutline />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>

          {/* Ligne 2 : réception partielle */}
          <TableRow hover>
            <TableCell>
              <b>Huile moteur 5W30</b>
            </TableCell>
            <TableCell align="right">10</TableCell>
            <TableCell align="right">8</TableCell>
            <TableCell>
              <Chip label="Reliquat 2" color="warning" size="small" />
            </TableCell>
            <TableCell align="center">
              <Tooltip title="Entrée partielle en stock">
                <IconButton color="warning">
                  <AddCircleOutline />
                </IconButton>
              </Tooltip>
              <Tooltip title="Consulter le reliquat">
                <IconButton color="info">
                  <VisibilityOutlined />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardSection>
  );
}
