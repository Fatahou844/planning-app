import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, IconButton, Box, Grid, Divider, Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function InfoBlock({ label, value, mono }) {
  if (!value && value !== 0 && value !== false) return null;
  return (
    <Box mb={0.5}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={500}
        sx={{ fontFamily: mono ? "monospace" : "inherit" }}
      >
        {String(value)}
      </Typography>
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box mb={2.5}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "#1565c0",
          display: "block",
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          bgcolor: "#f8f9fa",
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          p: 1.5,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function ArticleDetailDialog({ open, onClose, article, onBack, showBack }) {
  if (!article) return null;

  const pricing   = article.ArticlePricing  || {};
  const purchase  = article.ArticlePurchase || {};
  const pneuSpec  = article.PneuSpec        || null;
  const oems      = article.ArticleOEMs     || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
        {showBack && (
          <IconButton size="small" onClick={onBack} sx={{ mr: 0.5 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            {article.libelle1}
          </Typography>
          {article.libelle2 && (
            <Typography variant="caption" color="text.secondary">
              {article.libelle2}
            </Typography>
          )}
        </Box>
        <Chip label={article.type} size="small" color="primary" sx={{ mr: 1 }} />
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, px: 3 }}>
        {/* Identification */}
        <Section title="Identification">
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}><InfoBlock label="Libellé 1"    value={article.libelle1} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Libellé 2"    value={article.libelle2} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Libellé 3"    value={article.libelle3} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Type"         value={article.type} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Réf. interne" value={article.refInt}    mono /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Réf. externe" value={article.refExt}    mono /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Code barre"   value={article.codeBarre} mono /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Garantie"     value={article.garantie} /></Grid>
          </Grid>
        </Section>

        {/* Classification */}
        <Section title="Classification">
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}><InfoBlock label="Marque"      value={article.Marque?.name} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Groupe"      value={article.Groupe?.name} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Famille"     value={article.Famille?.name} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Emplacement" value={article.Emplacement?.name} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Fournisseur" value={article.Fournisseur?.name} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Conditionnement" value={article.conditionnement} /></Grid>
            <Grid item xs={6} md={3}>
              <InfoBlock label="Composant lot" value={article.composantLot ? "Oui" : "Non"} />
            </Grid>
          </Grid>
        </Section>

        {/* Tarification */}
        <Section title="Tarification">
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}><InfoBlock label="Prix HT"     value={pricing.prixHT    != null ? `${parseFloat(pricing.prixHT).toFixed(2)} €`    : null} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Prix TTC"    value={pricing.prixTTC   != null ? `${parseFloat(pricing.prixTTC).toFixed(2)} €`   : null} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="TVA"         value={pricing.tva       != null ? `${pricing.tva} %`                               : null} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Marge"       value={pricing.marge     != null ? `${parseFloat(pricing.marge).toFixed(2)} €`     : null} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Marge %"     value={pricing.margePct  != null ? `${parseFloat(pricing.margePct).toFixed(2)} %`  : null} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Prix achat"  value={purchase.prixAchat != null ? `${parseFloat(purchase.prixAchat).toFixed(2)} €` : null} /></Grid>
            <Grid item xs={6} md={3}><InfoBlock label="Frais port"  value={purchase.fraisPort != null ? `${parseFloat(purchase.fraisPort).toFixed(2)} €` : null} /></Grid>
          </Grid>
        </Section>

        {/* OEM */}
        {oems.length > 0 && (
          <Section title="Références OEM">
            <Box display="flex" flexWrap="wrap" gap={1}>
              {oems.map((o, i) => (
                <Chip key={i} label={o.reference} size="small" variant="outlined" sx={{ fontFamily: "monospace" }} />
              ))}
            </Box>
          </Section>
        )}

        {/* Pneus */}
        {pneuSpec && (
          <Section title="Spécifications pneu">
            <Grid container spacing={2}>
              <Grid item xs={4} md={2}><InfoBlock label="Largeur"    value={pneuSpec.largeur} /></Grid>
              <Grid item xs={4} md={2}><InfoBlock label="Hauteur"    value={pneuSpec.hauteur} /></Grid>
              <Grid item xs={4} md={2}><InfoBlock label="Diamètre"   value={pneuSpec.diametre} /></Grid>
              <Grid item xs={4} md={2}><InfoBlock label="Charge"     value={pneuSpec.charge} /></Grid>
              <Grid item xs={4} md={2}><InfoBlock label="Vitesse"    value={pneuSpec.vitesse} /></Grid>
              <Grid item xs={4} md={2}><InfoBlock label="Carburant"  value={pneuSpec.carburant} /></Grid>
              <Grid item xs={4} md={2}><InfoBlock label="Sol mouillé" value={pneuSpec.solMouille} /></Grid>
              <Grid item xs={4} md={2}><InfoBlock label="Bruit"      value={pneuSpec.bruit} /></Grid>
              <Grid item xs={4} md={2}><InfoBlock label="Val. bruit" value={pneuSpec.valeurBruit} /></Grid>
            </Grid>
          </Section>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ bgcolor: "#f5f5f5", px: 2, py: 1 }}>
        <Button variant="outlined" size="small" onClick={onClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
