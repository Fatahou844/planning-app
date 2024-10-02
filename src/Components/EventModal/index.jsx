import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";

const EventModal = ({ open, onClose, event, categories, onSave }) => {
  const [editedEvent, setEditedEvent] = useState(event);
  useEffect(() => {
    setEditedEvent(event); // Met à jour l'événement édité lorsque l'événement sélectionné change
    console.log("EVENT", event);
  }, [event]);
  if (!event) return null; // Ne pas afficher le modal si l'événement est null

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editedEvent);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Modifier l'evenement</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          name="title"
          label="Titre"
          type="text"
          fullWidth
          value={editedEvent.title}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="person"
          label="Person"
          type="text"
          fullWidth
          value={editedEvent.person}
          onChange={handleChange}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Catégorie</InputLabel>
          <Select
            name="category"
            value={editedEvent.category}
            onChange={handleChange}
            fullWidth
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="startHour"
          label="Heure de début"
          type="number"
          fullWidth
          value={editedEvent.startHour}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="endHour"
          label="Heure de fin"
          type="number"
          fullWidth
          value={editedEvent.endHour}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSave}>Enregistrer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventModal;
