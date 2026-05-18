import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Alert, Box, Slide, Snackbar, Typography } from "@mui/material";
import { createContext, useCallback, useContext, useState } from "react";

const StockAlertContext = createContext(null);

export function StockAlertProvider({ children }) {
  const [queue, setQueue] = useState([]);

  /** Appelé avec la réponse brute d'un POST /details */
  const notify = useCallback((data) => {
    if (!data?.stockAlert) return;
    const alert = { ...data.stockAlert, _id: Date.now() + Math.random() };
    setQueue(prev => [...prev, alert]);
  }, []);

  const dismiss = useCallback((id) => {
    setQueue(prev => prev.filter(a => a._id !== id));
  }, []);

  return (
    <StockAlertContext.Provider value={{ notify }}>
      {children}

      {/* Une Snackbar par alerte en file (affiché une par une) */}
      {queue.map((alert, idx) => (
        <Snackbar
          key={alert._id}
          open
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          autoHideDuration={10000}
          onClose={() => dismiss(alert._id)}
          TransitionComponent={Slide}
          sx={{ top: `${80 + idx * 90}px !important` }}
        >
          <Alert
            severity="warning"
            variant="filled"
            icon={<WarningAmberIcon />}
            onClose={() => dismiss(alert._id)}
            sx={{ width: 460, boxShadow: 6 }}
          >
            <Typography variant="body2" fontWeight={700}>Rupture de stock détectée</Typography>
            <Typography variant="caption" display="block" mt={0.5}>{alert.message}</Typography>
            {alert.deficit > 0 && (
              <Box display="flex" gap={2} mt={1} sx={{ fontSize: 12, opacity: 0.9 }}>
                <span>Stock dispo : <strong>{alert.disponible}</strong></span>
                <span>Demandé : <strong>{alert.demande}</strong></span>
                <span>Manque : <strong style={{ color: "#ffcdd2" }}>{alert.deficit}</strong></span>
              </Box>
            )}
          </Alert>
        </Snackbar>
      ))}
    </StockAlertContext.Provider>
  );
}

/** Hook pour alimenter le contexte depuis n'importe quel composant */
export function useStockAlertGlobal() {
  const ctx = useContext(StockAlertContext);
  if (!ctx) return { notify: () => {} };
  return ctx;
}
