import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

export default function ActionBlock({ title, actions, onActionClick }) {
  return (
    <Card elevation={4} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          {title}
        </Typography>

        <Stack spacing={1}>
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="contained"
              fullWidth
              onClick={() => onActionClick(action.id)}
              sx={{
                textTransform: "none",
                "&:hover": { backgroundColor: "#3c63b3" },
              }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
