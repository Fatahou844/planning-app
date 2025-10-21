import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAxios } from "../../utils/hook/useAxios";
import AtelierSearch from "../AtelierSearch";

export default function PointageDialog({
  openPointage,
  handleClosePointage,
  activite,
  onSaveStatus,
}) {
  const axios = useAxios();
  const [editedStatus, setEditedStatus] = useState({}); // { [id]: "nouveauStatus" }
  const [saving, setSaving] = useState(null); // id en cours de sauvegarde

  const handleStatusChange = (id, value) => {
    setEditedStatus((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (id) => {
    const newStatus = editedStatus[id];
    if (!newStatus) return;

    setSaving(id);

    const now = new Date();
    const localDateTime = now.toISOString().slice(0, 19).replace("T", " ");

    // ⚙️ D'abord : mise à jour côté backend
    await axios.put(`/orders/${id}`, {
      OrderStatus: newStatus,
      datePointage: localDateTime,
    });

    // 🧩 Ensuite : informer le parent
    if (onSaveStatus) {
      onSaveStatus(id, newStatus, localDateTime);
    }

    // feedback visuel court
    setTimeout(() => setSaving(null), 800);
  };

  return (
    <Dialog
      open={openPointage}
      onClose={handleClosePointage}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Pointage des RDVs</DialogTitle>
      <DialogContent dividers>
        <AtelierSearch onSaveStatus={onSaveStatus}></AtelierSearch>
        {activite.map((item) => {
          const currentStatus = editedStatus[item.id] ?? item.OrderStatus;
          const isSaving = saving === item.id;
          return (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                mt: 2,
                p: 1,
                bgcolor: item.Category?.color || "#ccc",
                borderRadius: 1,
                color: "white",
              }}
            >
              <Typography variant="body2" sx={{ flex: 1 }}>
                {item.id} - {item.Vehicle?.plateNumber} - {item.Client?.name}
              </Typography>

              <Select
                size="small"
                value={currentStatus}
                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                sx={{ ml: 2, minWidth: 150, bgcolor: "white", color: "black" }}
              >
                <MenuItem value="En RDV" disabled>
                  En RDV
                </MenuItem>
                <MenuItem value="En cours">En cours</MenuItem>
                <MenuItem value="Clé présente" disabled>
                  Clé présente
                </MenuItem>
                <MenuItem value="En pause">En pause</MenuItem>
                <MenuItem value="Cloturé">Clôturé</MenuItem>
              </Select>

              <Tooltip title="Enregistrer le statut">
                <IconButton
                  onClick={() => handleSave(item.id)}
                  disabled={isSaving}
                  sx={{
                    ml: 2,
                    color: isSaving ? "success.main" : "white",
                    "&:hover": { color: "success.light" },
                  }}
                >
                  {isSaving ? (
                    <CheckCircleIcon fontSize="small" />
                  ) : (
                    <SaveIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClosePointage}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
