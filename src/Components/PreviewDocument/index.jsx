import {
  Box,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";

const PreviewDocument = ({ DocumentData }) => {
  const theme = useTheme();
  const { Client, Vehicle, Details = [] } = DocumentData || {};

  const totalTTC = Details.reduce((sum, d) => {
    const base = d.unitPrice * d.quantity;
    const discountPercent = d.discountPercent
      ? (base * d.discountPercent) / 100
      : 0;
    const discountValue = d.discountValue || 0;
    return sum + (base - discountPercent - discountValue);
  }, 0);

  const totalHT = totalTTC / 1.2;

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: "0 0 10px rgba(0,0,0,0.05)",
        overflowY: "auto",
        height: "calc(100vh - 100px)",
        width: "100%",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Numéro #{DocumentData?.id}
        </Typography>
        <Typography variant="body2">
          {new Date(DocumentData?.date).toLocaleDateString()}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* INFOS CLIENT & VEHICULE */}
      <Grid container spacing={2}>
        {/* Client */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Informations Client
          </Typography>
          <Typography variant="body2">Nom : {Client?.name}</Typography>
          <Typography variant="body2">Prénom : {Client?.firstName}</Typography>
          <Typography variant="body2">Téléphone : {Client?.phone}</Typography>
          <Typography variant="body2">Email : {Client?.email}</Typography>
          <Typography variant="body2">Adresse : {Client?.adress}</Typography>
          <Typography variant="body2">
            Code postal : {Client?.postalCode}
          </Typography>
          <Typography variant="body2">Ville : {Client?.city}</Typography>
        </Grid>

        {/* Véhicule */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Informations Véhicule
          </Typography>
          <Typography variant="body2">
            Immatriculation : {Vehicle?.plateNumber}
          </Typography>
          <Typography variant="body2">VIN : {Vehicle?.vin}</Typography>
          <Typography variant="body2">Modèle : {Vehicle?.model}</Typography>
          <Typography variant="body2">Couleur : {Vehicle?.color}</Typography>
          <Typography variant="body2">
            Kilométrage : {Vehicle?.mileage}
          </Typography>
          <Typography variant="body2">
            Dernier contrôle : {Vehicle?.lastCheck || "-"}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* TABLE DÉTAILS */}
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Détails des travaux / articles
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: "0 0 6px rgba(0,0,0,0.04)",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Libellé</TableCell>
              <TableCell align="center">Quantité</TableCell>
              <TableCell align="center">Prix Unitaire</TableCell>
              <TableCell align="center">Remise</TableCell>
              <TableCell align="center">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Details.map((d, index) => {
              const base = d.unitPrice * d.quantity;
              const discountPercent = d.discountPercent
                ? (base * d.discountPercent) / 100
                : 0;
              const discountValue = d.discountValue || 0;
              const totalAfterDiscount = base - discountPercent - discountValue;
              return (
                <TableRow key={index}>
                  <TableCell sx={{ fontSize: "0.85rem" }}>{d.label}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.85rem" }}>
                    {d.quantity}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.85rem" }}>
                    {d.unitPrice.toFixed(2)} €
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.85rem" }}>
                    {d.discountPercent
                      ? `${d.discountPercent}%`
                      : d.discountValue
                      ? `${d.discountValue.toFixed(2)}€`
                      : "-"}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.85rem" }}>
                    {totalAfterDiscount.toFixed(2)} €
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* TOTAUX */}
      <Box
        sx={{
          mt: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <Typography variant="body1">
          <strong>Total TTC :</strong> {totalTTC.toFixed(2)} €
        </Typography>
        <Typography variant="body1">
          <strong>Total HT :</strong> {totalHT.toFixed(2)} €
        </Typography>
        <Typography variant="body1">
          <strong>Acompte :</strong>{" "}
          {DocumentData?.deposit
            ? parseFloat(DocumentData.deposit).toFixed(2)
            : "0.00"}{" "}
          €
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* NOTES & INFOS SUPPLÉMENTAIRES */}
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Travaux effectués
      </Typography>
      <Typography
        variant="body2"
        sx={{
          whiteSpace: "pre-wrap",
          border: "1px solid #eee",
          borderRadius: 2,
          p: 2,
          backgroundColor: "#fafafa",
          minHeight: "100px",
        }}
      >
        {DocumentData?.notes || "Aucune note disponible."}
      </Typography>
    </Box>
  );
};

export default PreviewDocument;
