import Inventory2Icon from "@mui/icons-material/Inventory2";
import PrintIcon from "@mui/icons-material/Print";
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
  Typography,
} from "@mui/material";
import CardSection from "../Components/Store/CardSection";

export default function Articles() {
  return (
    <Box>
      <CardSection
        icon={Inventory2Icon}
        title="Gestion des articles"
        subtitle="Catalogue articles, pièces & services."
      >
        {/* Toolbar / Filtres */}
        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <TextField label="Rechercher (nom, SKU, code-barres)" size="small" />

          <TextField select label="Type" size="small" defaultValue="all">
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="piece">Pièce</MenuItem>
            <MenuItem value="service">Service</MenuItem>
          </TextField>

          <TextField label="Référence fournisseur" size="small" />

          <TextField
            select
            label="Format d’étiquette"
            size="small"
            defaultValue="all"
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="A4_14_P">A4 (portrait)</MenuItem>
            <MenuItem value="A4_10_L">A4 (paysage)</MenuItem>
            <MenuItem value="A5_P">A5 (portrait)</MenuItem>
            <MenuItem value="A5_P2">A5 (paysage)</MenuItem>
            <MenuItem value="A6_P">A6 (portrait)</MenuItem>

            <MenuItem value="A6_P2">A6 (paysage)</MenuItem>

            <MenuItem value="THERMAL_58x40">Thermique 58×40</MenuItem>
          </TextField>

          <Button variant="contained">+ Nouvel article</Button>
          <Button variant="outlined">Importer</Button>
        </Box>

        {/* Table Articles */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Article</TableCell>
              <TableCell>Référencement</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Étiquette</TableCell>
              <TableCell align="right">Prix HT</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Article stockable */}
            <TableRow hover>
              <TableCell>
                <Typography fontWeight={600}>Plaquette de frein A</Typography>
                <Typography variant="caption" sx={{ opacity: 0.65 }}>
                  SKU : PLQ-A-001
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2">Fournisseur : AUTO-PRO</Typography>
                <Typography variant="caption" sx={{ opacity: 0.65 }}>
                  Code-barres : 37011223344
                </Typography>
              </TableCell>

              <TableCell>Pièce</TableCell>

              <TableCell>
                <Chip label="Stockable" size="small" />
                <Chip
                  label="Critique"
                  size="small"
                  color="warning"
                  sx={{ ml: 0.5 }}
                />
                <Chip label="OEM" size="small" color="info" sx={{ ml: 0.5 }} />
              </TableCell>

              <TableCell>
                <Chip label="A4 – 14 (P)" size="small" />
              </TableCell>

              <TableCell align="right">45,00 €</TableCell>

              <TableCell align="center">
                <Tooltip title="Imprimer l’étiquette">
                  <IconButton size="small">
                    <PrintIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>

            {/* Article service */}
            <TableRow hover>
              <TableCell>
                <Typography fontWeight={600}>
                  Main d’œuvre diagnostic
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.65 }}>
                  SKU : MO-DIAG
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2">Interne</Typography>
                <Typography variant="caption" sx={{ opacity: 0.65 }}>
                  —
                </Typography>
              </TableCell>

              <TableCell>Service</TableCell>

              <TableCell>
                <Chip label="Service" size="small" />
              </TableCell>

              <TableCell>
                <Chip label="—" size="small" variant="outlined" />
              </TableCell>

              <TableCell align="right">60,00 €</TableCell>

              <TableCell align="center">
                <Typography variant="caption" sx={{ opacity: 0.5 }}>
                  N/A
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardSection>
    </Box>
  );
}
