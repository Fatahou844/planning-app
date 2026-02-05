import CloseIcon from "@mui/icons-material/Close";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  ClickAwayListener,
  Divider,
  Fab,
  IconButton,
  Paper,
  Popper,
  Stack,
  Typography,
} from "@mui/material";
import * as React from "react";

export default function FloatingSupport({ phone = "2126XXXXXXX" }) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const waMessage = encodeURIComponent(
    "Bonjour, j’ai besoin d’aide sur l’application.",
  );
  const waUrl = `https://wa.me/${phone}?text=${waMessage}`;
  const linkedinUrl =
    "https://www.linkedin.com/in/fatahou-ahamadi-allie-coaching-strategique/";

  return (
    <>
      {/* Bouton flottant */}
      <Fab
        ref={anchorRef}
        color="primary"
        aria-label="Support"
        onClick={() => setOpen((v) => !v)}
        sx={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 1300,
        }}
      >
        <SupportAgentIcon />
      </Fab>

      {/* Popper simple (sans animation) */}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="top-end"
        disablePortal
        sx={{ zIndex: 1301 }}
        modifiers={[{ name: "offset", options: { offset: [0, 10] } }]}
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper
            elevation={8}
            sx={{
              width: 260,
              borderRadius: 1,
              overflow: "hidden",
              padding: 1,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ p: 1.5 }}
            >
              <Typography fontWeight={600}>Support</Typography>
              <IconButton size="small" onClick={() => setOpen(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                onClick={() => window.open(waUrl, "_blank", "noreferrer")}
                sx={{
                  backgroundColor: "#25D366",
                  color: "#fff",
                  borderRadius: 2,
                  "&:hover": { backgroundColor: "#1EBE5D" },
                }}
              >
                <WhatsAppIcon />
              </IconButton>

              <Typography variant="body2">
                WhatsApp
                <br />
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >
                  Réponse rapide
                </Typography>
              </Typography>
            </Stack>
            <br />

            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                onClick={() => window.open(linkedinUrl, "_blank", "noreferrer")}
                sx={{
                  backgroundColor: "#0A66C2",
                  color: "#fff",
                  borderRadius: 2,
                  "&:hover": { backgroundColor: "#004182" },
                }}
              >
                <LinkedInIcon />
              </IconButton>

              <Typography variant="body2">
                LinkedIn
                <br />
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >
                  Message privé
                </Typography>
              </Typography>
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
