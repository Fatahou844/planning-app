import {
    Divider,
    Grid,
    TextField,
    Typography
} from "@mui/material";
export default function BlocPneus({ pneus, setForm }) {
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      pneus: {
        ...prev.pneus,
        [field]: value,
      },
    }));
  };

  return (
    <>
      <Typography fontWeight="bold" sx={{ mt: 3 }}>
        Caractéristiques Pneumatique
      </Typography>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={6} md={2}>
          <TextField
            label="Largeur"
            value={pneus.largeur}
            onChange={(e) => handleChange("largeur", e.target.value)}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            label="Hauteur"
            value={pneus.hauteur}
            onChange={(e) => handleChange("hauteur", e.target.value)}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            label="Diamètre"
            value={pneus.diametre}
            onChange={(e) => handleChange("diametre", e.target.value)}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            label="Charge"
            value={pneus.charge}
            onChange={(e) => handleChange("charge", e.target.value)}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            label="Vitesse"
            value={pneus.vitesse}
            onChange={(e) => handleChange("vitesse", e.target.value)}
            size="small"
            fullWidth
          />
        </Grid>
      </Grid>

      <Typography fontWeight="bold" sx={{ mt: 3 }}>
        Classification énergétique
      </Typography>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={6} md={3}>
          <TextField
            label="Carburant"
            value={pneus.carburant}
            onChange={(e) => handleChange("carburant", e.target.value)}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid item xs={6} md={3}>
          <TextField
            label="Sol mouillé"
            value={pneus.solMouille}
            onChange={(e) => handleChange("solMouille", e.target.value)}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid item xs={6} md={3}>
          <TextField
            label="Bruit"
            value={pneus.bruit}
            onChange={(e) => handleChange("bruit", e.target.value)}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid item xs={6} md={3}>
          <TextField
            label="Valeur bruit (dB)"
            value={pneus.valeurBruit}
            onChange={(e) => handleChange("valeurBruit", e.target.value)}
            size="small"
            fullWidth
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
    </>
  );
}
