// theme/ThemeProvider.jsx
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { createContext, useContext, useMemo, useState } from "react";
import darkTheme from "./darkTheme";
import lightTheme from "./lightTheme";

const ThemeModeContext = createContext({
  toggleTheme: () => {},
  mode: "light",
});

export const useThemeMode = () => useContext(ThemeModeContext);

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () => (mode === "light" ? lightTheme : darkTheme),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={{ toggleTheme, mode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
};
