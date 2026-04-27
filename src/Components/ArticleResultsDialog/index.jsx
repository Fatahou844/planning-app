import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CloseIcon          from "@mui/icons-material/Close";
import OpenInNewIcon      from "@mui/icons-material/OpenInNew";
import {
  Box,
  Button,
  Checkbox,
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
import { useState } from "react";

/*
  Props :
    onSelectArticle(article)       — sélection unitaire (comportement existant)
    onSelectMultiple(articles[])   — si fourni, active le mode multi-sélection
                                     avec cases à cocher
*/
export default function ArticleResultsDialog({
  open,
  onClose,
  results,
  onSelectArticle,
  onSelectMultiple,
}) {
  const theme      = useTheme();
  const isMulti    = typeof onSelectMultiple === "function";
  const [checked, setChecked] = useState(new Set());

  if (!results) return null;

  /* ── Gestion des cases à cocher ── */
  const allChecked  = checked.size > 0 && checked.size === results.length;
  const someChecked = checked.size > 0 && !allChecked;

  function toggleAll() {
    if (allChecked || someChecked) {
      setChecked(new Set());
    } else {
      setChecked(new Set(results.map((a) => a.id)));
    }
  }

  function toggleOne(id) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAddSelection() {
    const selected = results.filter((a) => checked.has(a.id));
    if (selected.length === 0) return;
    setChecked(new Set());
    onSelectMultiple(selected);
    onClose();
  }

  function handleRowClick(article) {
    if (isMulti) {
      toggleOne(article.id);
    } else {
      onSelectArticle(article);
    }
  }

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
          {isMulti && checked.size > 0 && (
            <Typography component="span" color="warning.main" fontWeight={700} sx={{ ml: 1 }}>
              · {checked.size} sélectionné{checked.size > 1 ? "s" : ""}
            </Typography>
          )}
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
              {/* Colonne checkbox — uniquement en mode multi */}
              {isMulti && (
                <TableCell padding="checkbox" sx={{ pl: 1.5 }}>
                  <Checkbox
                    size="small"
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={toggleAll}
                  />
                </TableCell>
              )}
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
            {results.map((article) => {
              const isChecked = checked.has(article.id);
              return (
                <TableRow
                  key={article.id}
                  hover
                  selected={isChecked}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                    ...(isChecked && {
                      bgcolor: alpha(theme.palette.warning.main, 0.08),
                      "&:hover": { bgcolor: alpha(theme.palette.warning.main, 0.14) },
                    }),
                  }}
                  onClick={() => handleRowClick(article)}
                >
                  {/* Checkbox */}
                  {isMulti && (
                    <TableCell padding="checkbox" sx={{ pl: 1.5 }} onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        size="small"
                        checked={isChecked}
                        onChange={() => toggleOne(article.id)}
                      />
                    </TableCell>
                  )}

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
                    {isMulti ? (
                      /* En mode multi : clic ligne = cocher, bouton = ajouter unitaire direct */
                      <Tooltip title="Ajouter uniquement cet article">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMultiple([article]);
                            onClose();
                          }}
                        >
                          <AddShoppingCartIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Voir la fiche">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => { e.stopPropagation(); onSelectArticle(article); }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
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
          gap: 1,
        }}
      >
        <Button variant="outlined" onClick={onClose} size="small">
          Fermer
        </Button>

        {/* Bouton "Ajouter la sélection" uniquement en mode multi */}
        {isMulti && (
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="warning"
              size="small"
              startIcon={<AddShoppingCartIcon />}
              disabled={checked.size === 0}
              onClick={handleAddSelection}
            >
              Ajouter la sélection ({checked.size})
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
}
