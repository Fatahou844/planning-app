import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, IconButton, Box,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function ArticleResultsDialog({ open, onClose, results, onSelectArticle }) {
  if (!results) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "#e8e8e8",
          borderBottom: "1px solid #ccc",
          py: 1.2,
          px: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
          Résultats de recherche —{" "}
          <Typography component="span" color="primary" fontWeight={700}>
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
            <TableRow sx={{ "& th": { bgcolor: "#eceff1", fontWeight: 700, fontSize: 12 } }}>
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
                sx={{ cursor: "pointer", "&:hover": { bgcolor: "#e3f2fd" } }}
                onClick={() => onSelectArticle(article)}
              >
                <TableCell sx={{ fontSize: 12 }}>{article.refInt || "—"}</TableCell>
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
                  <Chip label={article.type} size="small" sx={{ fontSize: 11 }} />
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>{article.Marque?.name || "—"}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{article.Famille?.name || "—"}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{article.Fournisseur?.name || "—"}</TableCell>
                <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600 }}>
                  {article.ArticlePricing?.prixHT != null
                    ? `${parseFloat(article.ArticlePricing.prixHT).toFixed(2)} €`
                    : "—"}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Voir la fiche">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onSelectArticle(article); }}>
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions sx={{ bgcolor: "#f5f5f5", px: 2, py: 1 }}>
        <Button variant="outlined" onClick={onClose} size="small">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
