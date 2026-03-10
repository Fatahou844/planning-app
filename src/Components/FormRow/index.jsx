import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Grid, IconButton, Tooltip, Typography } from "@mui/material";

const FormRow = ({ label, children, alignTop = false }) => (
  <Grid
    container
    spacing={2}
    alignItems={alignTop ? "flex-start" : "center"}
    sx={{ mb: 2 }}
  >
    {/* Label */}
    <Grid item xs={12} md={4}>
      <Typography variant="body2" fontWeight={500}>
        <strong>{label}</strong>
      </Typography>
    </Grid>

    {/* Champ + icône */}
    <Grid item xs={12} md={8} sx={{ display: "flex", alignItems: "center" }}>
      <Tooltip title="Voici une petite note explicative">
        <IconButton size="small" sx={{ ml: 1 }}>
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Grid>
  </Grid>
);

export default FormRow;
