import { useState, useCallback } from "react";

/**
 * Hook pour afficher les alertes de rupture de stock retournées par l'API /details.
 *
 * Utilisation :
 *   const { stockAlerts, checkDetailResponse, StockAlertSnackbar } = useStockAlert();
 *   const res = await axios.post("/details", { ... });
 *   checkDetailResponse(res.data);
 *   // Dans le JSX : <StockAlertSnackbar />
 */
export function useStockAlert() {
  const [alerts, setAlerts] = useState([]);

  const checkDetailResponse = useCallback((data) => {
    if (data?.stockAlert) {
      setAlerts(prev => [...prev, { ...data.stockAlert, id: Date.now() }]);
    }
  }, []);

  const dismiss = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return { stockAlerts: alerts, checkDetailResponse, dismiss };
}
