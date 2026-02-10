import { Box, Typography } from "@mui/material";

export default function CardSection({ icon: Icon, title, subtitle, children }) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 4,
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        {Icon && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: 30 }} />
          </Box>
        )}

        <Box>
          <Typography fontWeight={700}>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ opacity: 0.65 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {children}
    </Box>
  );
}
