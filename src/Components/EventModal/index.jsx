import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
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

  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   setEditedEvent((prev) => ({
  //     ...prev,
  //     [name]:
  //       name.includes("Hour") || name.includes("Minute")
  //         ? parseInt(value)
  //         : value, // Conversion des heures et minutes en entier
  //   }));
  // };
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Vérifie si le champ fait partie des propriétés imbriquées
    setEditedEvent((prev) => {
      const newValue =
        name.includes("Hour") || name.includes("Minute")
          ? parseInt(value)
          : value;

      // Gestion des champs pour les propriétés imbriquées comme "person" ou "vehicule"
      if (name.startsWith("person.")) {
        const personKey = name.split(".")[1]; // Extrait la clé de la propriété de "person"
        return {
          ...prev,
          person: {
            ...prev.person,
            [personKey]: newValue,
          },
        };
      }

      if (name.startsWith("vehicule.")) {
        const vehiculeKey = name.split(".")[1]; // Extrait la clé de la propriété de "vehicule"
        return {
          ...prev,
          vehicule: {
            ...prev.vehicule,
            [vehiculeKey]: newValue,
          },
        };
      }

      // Cas par défaut : mise à jour des propriétés au premier niveau
      return {
        ...prev,
        [name]: newValue,
      };
    });
  };

  const handleSave = () => {
    const updatedEvent = {
      ...editedEvent,
      startHour: parseInt(editedEvent.startHour),
      endHour: parseInt(editedEvent.endHour),
      startMinute: parseInt(editedEvent.startMinute),
      endMinute: parseInt(editedEvent.endMinute),
    };

    onSave(updatedEvent); // Appelle la fonction pour enregistrer l'événement modifié
    onClose(); // Ferme le modal
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          width: "900px", // Ajuster la largeur du modal
          maxWidth: "none", // Supprimer la limite de largeur maximale par défaut
        },
      }}
    >
      <DialogTitle>Modifier l'événement</DialogTitle>
      {editedEvent && (
        <DialogContent>
          <Grid container spacing={2}>
            {/* Informations Client */}
            <Grid item xs={12} md={6}>
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
                label="Nom"
                name="person.lastName"
                value={editedEvent.person.lastName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Prénom"
                name="person.firstName"
                value={editedEvent.person.firstName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                margin="dense"
                name="person.phone"
                label="Téléphone"
                type="text"
                fullWidth
                value={editedEvent.person.phone || ""}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="person.email"
                label="Email"
                type="email"
                fullWidth
                value={editedEvent.person.email || ""}
                onChange={handleChange}
              />
            </Grid>

            {/* Informations Véhicule */}
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="vehicule.licensePlate"
                label="Immatriculation"
                type="text"
                fullWidth
                value={editedEvent?.vehicule?.licensePlate || ""}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="vehicule.vin"
                label="VIN"
                type="text"
                fullWidth
                value={editedEvent?.vehicule?.vin || ""}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="vehicule.modele"
                label="Modèle"
                type="text"
                fullWidth
                value={editedEvent.modele || ""}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="vehicule.color"
                label="Couleur"
                type="text"
                fullWidth
                value={editedEvent.vehicule?.color || ""}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* Informations d'opération */}
          <Grid container spacing={2} marginTop={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category.id"
                  value={editedEvent.category?.id || ""} // Utilise l'ID de la catégorie si nécessaire
                  onChange={handleChange}
                  fullWidth
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {" "}
                      {/* Assurez-vous d'utiliser la bonne clé ici */}
                      {cat.name} {/* Affiche le nom de la catégorie */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="startHour"
                label="Heure de début"
                type="number"
                fullWidth
                value={editedEvent.startHour || ""}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="startMinute"
                label="Minutes de début"
                type="number"
                fullWidth
                value={editedEvent.startMinute || ""}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="endHour"
                label="Heure de fin"
                type="number"
                fullWidth
                value={editedEvent.endHour || ""}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="endMinute"
                label="Minutes de fin"
                type="number"
                fullWidth
                value={editedEvent.endMinute || ""}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSave}>Enregistrer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventModal;
