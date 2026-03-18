import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

export default function ArticleResultsDialog({ open, onClose, results, onSelectArticle }) {
  const theme = useTheme();

  if (!results) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "background.default",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1.5,
          px: 2.5,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
          Résultats de recherche —{" "}
          <Typography component="span" color="primary.main" fontWeight={700}>
            {results.length}
          </Typography>{" "}
          article{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  bgcolor: "background.default",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "text.secondary",
                  borderBottom: "2px solid",
                  borderColor: "divider",
                },
              }}
            >
              <TableCell>Réf. Int.</TableCell>
              <TableCell>Réf. Ext.</TableCell>
              <TableCell>Code barre</TableCell>
              <TableCell>Libellé</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Marque</TableCell>
              <TableCell>Famille</TableCell>
              <TableCell>Fournisseur</TableCell>
              <TableCell align="right">Prix HT</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((article) => (
              <TableRow
                key={article.id}
                hover
                sx={{
                  cursor: "pointer",
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                }}
                onClick={() => onSelectArticle(article)}
              >
                <TableCell sx={{ fontSize: 12 }}>{article.id || "—"}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{article.refExt || "—"}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{article.codeBarre || "—"}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>
                  {article.libelle1}
                  {article.libelle2 && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {article.libelle2}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={article.type} size="small" color="primary" variant="outlined" sx={{ fontSize: 11 }} />
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>{article.Marque?.nom || "—"}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{article.Famille?.nom || "—"}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{article.Fournisseur?.nom || "—"}</TableCell>
                <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600, color: "primary.main" }}>
                  {article.ArticlePricing?.prixHT != null
                    ? `${parseFloat(article.ArticlePricing.prixHT).toFixed(2)} €`
                    : "—"}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Voir la fiche">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => { e.stopPropagation(); onSelectArticle(article); }}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions
        sx={{
          bgcolor: "background.default",
          borderTop: "1px solid",
          borderColor: "divider",
          px: 2.5,
          py: 1.5,
        }}
      >
        <Button variant="outlined" onClick={onClose} size="small">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
