import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, ButtonBase, Divider, Typography, alpha, useTheme } from "@mui/material";

export default function ActionBlock({ title, icon, actions, onActionClick }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
        transition: "box-shadow 0.2s ease",
        "&:hover": {
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1.25,
          bgcolor: alpha(theme.palette.primary.main, 0.07),
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {icon && (
          <Box sx={{ color: "primary.main", display: "flex", alignItems: "center" }}>
            {icon}
          </Box>
        )}
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            textTransform: "uppercase",
            letterSpacing: 0.7,
            color: "primary.main",
            fontSize: 11,
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* ── Actions ── */}
      <Box>
        {actions.map((action, i) => (
          <Box key={action.id}>
            <ButtonBase
              onClick={() => onActionClick(action.id)}
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.1,
                textAlign: "left",
                transition: "background 0.15s ease",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  "& .action-chevron": { opacity: 1, transform: "translateX(2px)" },
                  "& .action-label": { color: "primary.main" },
                },
              }}
            >
              <Typography
                className="action-label"
                variant="body2"
                sx={{
                  fontSize: 13,
                  color: "text.primary",
                  transition: "color 0.15s ease",
                  textTransform: "capitalize",
                }}
              >
                {action.label}
              </Typography>
              <ChevronRightIcon
                className="action-chevron"
                sx={{
                  fontSize: 16,
                  color: "primary.main",
                  opacity: 0,
                  transition: "opacity 0.15s ease, transform 0.15s ease",
                  flexShrink: 0,
                }}
              />
            </ButtonBase>
            {i < actions.length - 1 && (
              <Divider sx={{ mx: 2, opacity: 0.5 }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
