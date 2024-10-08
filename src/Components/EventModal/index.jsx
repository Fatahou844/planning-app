// import {
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
//   TextField,
// } from "@mui/material";
// import React, { useEffect, useState } from "react";

// const EventModal = ({ open, onClose, event, categories, onSave }) => {
//   const [editedEvent, setEditedEvent] = useState(event);

//   useEffect(() => {
//     setEditedEvent(event); // Met à jour l'événement édité lorsque l'événement sélectionné change
//     console.log("EVENT", event);
//   }, [event]);

//   if (!event) return null; // Ne pas afficher le modal si l'événement est null

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setEditedEvent((prev) => ({
//       ...prev,
//       [name]:
//         name.includes("Hour") || name.includes("Minute")
//           ? parseInt(value)
//           : value, // Conversion des heures et minutes en entier
//     }));
//   };

//   // const handleSave = () => {
//   //   onSave(editedEvent);
//   //   onClose();
//   // };

//   const handleSave = () => {
//     const updatedEvent = {
//       ...editedEvent,
//       startHour: parseInt(editedEvent.startHour),
//       endHour: parseInt(editedEvent.endHour),
//       startMinute: parseInt(editedEvent.startMinute),
//       endMinute: parseInt(editedEvent.endMinute),
//     };

//     onSave(updatedEvent);
//     onClose();
//   };

//   return (
//     <Dialog open={open} onClose={onClose}>
//       <DialogTitle>Modifier l'événement</DialogTitle>
//       <DialogContent>
//         <TextField
//           margin="dense"
//           name="title"
//           label="Titre"
//           type="text"
//           fullWidth
//           value={editedEvent.title}
//           onChange={handleChange}
//         />
//         <TextField
//           margin="dense"
//           name="person"
//           label="Person"
//           type="text"
//           fullWidth
//           value={editedEvent.person}
//           onChange={handleChange}
//         />
//         <FormControl fullWidth margin="dense">
//           <InputLabel>Catégorie</InputLabel>
//           <Select
//             name="category"
//             value={editedEvent.category}
//             onChange={handleChange}
//             fullWidth
//           >
//             {categories.map((cat) => (
//               <MenuItem key={cat} value={cat}>
//                 {cat}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <TextField
//           margin="dense"
//           name="startHour"
//           label="Heure de début"
//           type="number"
//           fullWidth
//           value={editedEvent.startHour || ""}
//           onChange={handleChange}
//         />
//         <TextField
//           margin="dense"
//           name="startMinute"
//           label="Minutes de début"
//           type="number"
//           fullWidth
//           value={editedEvent.startMinute || ""}
//           onChange={handleChange}
//         />
//         <TextField
//           margin="dense"
//           name="endHour"
//           label="Heure de fin"
//           type="number"
//           fullWidth
//           value={editedEvent.endHour || ""}
//           onChange={handleChange}
//         />
//         <TextField
//           margin="dense"
//           name="endMinute"
//           label="Minutes de fin"
//           type="number"
//           fullWidth
//           value={editedEvent.endMinute || ""}
//           onChange={handleChange}
//         />
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>Annuler</Button>
//         <Button onClick={handleSave}>Enregistrer</Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default EventModal;
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditedEvent((prev) => ({
      ...prev,
      [name]:
        name.includes("Hour") || name.includes("Minute")
          ? parseInt(value)
          : value, // Conversion des heures et minutes en entier
    }));
  };

  const handleSave = () => {
    const updatedEvent = {
      ...editedEvent,
      startHour: parseInt(editedEvent.startHour),
      endHour: parseInt(editedEvent.endHour),
      startMinute: parseInt(editedEvent.startMinute),
      endMinute: parseInt(editedEvent.endMinute),
    };

    onSave(updatedEvent);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          width: "900px", // Vous pouvez ajuster la largeur ici
          maxWidth: "none", // Supprime la limite de largeur maximale par défaut
        },
      }}
    >
      <DialogTitle>Modifier l'événement</DialogTitle>
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
              margin="dense"
              name="person"
              label="Personne"
              type="text"
              fullWidth
              value={editedEvent.person}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="tel"
              label="Téléphone"
              type="text"
              fullWidth
              value={editedEvent.tel || ""}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={editedEvent.email || ""}
              onChange={handleChange}
            />
          </Grid>

          {/* Informations Véhicule */}
          <Grid item xs={12} md={6}>
            <TextField
              margin="dense"
              name="immatriculation"
              label="Immatriculation"
              type="text"
              fullWidth
              value={editedEvent.immatriculation || ""}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="vin"
              label="VIN"
              type="text"
              fullWidth
              value={editedEvent.vin || ""}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="modele"
              label="Modèle"
              type="text"
              fullWidth
              value={editedEvent.modele || ""}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="couleur"
              label="Couleur"
              type="text"
              fullWidth
              value={editedEvent.couleur || ""}
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
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSave}>Enregistrer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventModal;
