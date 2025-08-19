import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

function calculateLineTotal(line) {
  let total = line.unitPrice * line.quantity;

  if (line.discountPercent && line.discountPercent > 0) {
    total -= (total * line.discountPercent) / 100;
  }

  if (line.discountValue && line.discountValue > 0) {
    total -= line.discountValue;
  }

  return total;
}

export default function NotificationsModal({ open, onClose, orderData = [] }) {
  // Filtrer uniquement les RDV du jour
  const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD
  const todayOrders = orderData.filter((order) => order.date === today);

  // Nombre de RDV
  const totalRDV = todayOrders.length;

  // Chiffre d'affaires HT
  const chiffreAffaires = todayOrders.reduce((acc, order) => {
    if (!order.Details) return acc;

    const totalOrder = order.Details.reduce(
      (sum, line) => sum + calculateLineTotal(line),
      0
    );

    return acc + totalOrder;
  }, 0);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Bienvenue 👋</DialogTitle>
      <DialogContent>
        <p>Bonjour ! Ceci est votre résumé de la journée :</p>
        <ul>
          <li>
            <strong>Nombre de RDV :</strong> {totalRDV}
          </li>
          <li>
            <strong>Chiffre d’affaires HT :</strong>{" "}
            {chiffreAffaires.toFixed(2)} €
          </li>
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          J’ai compris
        </Button>
      </DialogActions>
    </Dialog>
  );
}
