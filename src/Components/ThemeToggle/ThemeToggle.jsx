// components/ThemeToggle.jsx
import { IconButton, Tooltip } from "@mui/material";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "../../theme/ThemeProvider";

export const ThemeToggle = () => {
  const { toggleTheme, mode } = useThemeMode();

  return (
    <Tooltip title={`Passer en mode ${mode === "light" ? "sombre" : "clair"}`}>
      <IconButton onClick={toggleTheme} size="small" sx={{ ml: 4 }}>
        {mode === "light" ? (
          <Moon size={18} color="#1E293B" />
        ) : (
          <Sun size={18} color="#F8FAFC" />
        )}
      </IconButton>
    </Tooltip>
  );
};
