// import {
//   Autocomplete,
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   TextField,
// } from "@mui/material";
// import { useEffect, useState } from "react";
// import { useAxios } from "../../utils/hook/useAxios";

// const PlateNumberSearch = ({ onSelectClient, Client }) => {
//   const [inputValue, setInputValue] = useState(""); // Valeur tapée
//   const [clients, setClients] = useState([]); // Liste des clients suggérés
//   const [selectedClient, setSelectedClient] = useState(null); // Client sélectionné
//   const [openDialog, setOpenDialog] = useState(false); // Fenêtre de création
//   const [newClient, setNewClient] = useState({
//     name: "",
//     firstName: "",
//     email: "",
//     phone: "",
//   });
//   const axios = useAxios();

//   // 🔍 Recherche automatique des clients
//   useEffect(() => {
//     if (inputValue.length > 1) {
//       axios
//         .get(`/vehicles/search/client?clientId=${Client.id}`)
//         .then((res) => setClients(res.data))
//         .catch((err) => {
//           console.error(err);
//           setClients([]);
//         });
//     } else {
//       setClients([]);
//     }
//   }, [inputValue]);

//   useEffect(() => {
//     if (Client) {
//       setSelectedClient(Client);
//       onSelectClient(Client);
//     }
//   }, [Client]);

//   // ✏️ Gérer la sélection du client
//   const handleSelectClient = (event, value) => {
//     if (value && value.id) {
//       setSelectedClient(value);
//       onSelectClient(value);
//     }
//   };

//   // ✏️ Gérer les champs du formulaire de création
//   const handleNewClientChange = (e) => {
//     setNewClient({ ...newClient, [e.target.name]: e.target.value });
//   };

//   const clientData = {
//     ...newClient,
//     clientId: Client.id, // Assurez-vous que garageId est défini dans le composant
//   };

//   // 📌 Sauvegarde d'un nouveau client
//   const handleCreateClient = () => {
//     axios
//       .post("/vehicles", clientData)
//       .then((res) => {
//         setSelectedClient(res.data);
//         onSelectClient(res.data);
//         setOpenDialog(false);
//         setInputValue(""); // Réinitialiser la recherche
//       })
//       .catch((err) => console.error(err));
//   };

//   return (
//     <Box
//       sx={{
//         marginBottom: "1.5rem",
//         marginTop: "1.0rem",
//       }}
//     >
//       {/* Zone de recherche */}
//       <Autocomplete
//         options={clients}
//         getOptionLabel={(option) => option?.plateNumber || "—"}
//         value={selectedClient || null}
//         onChange={handleSelectClient}
//         inputValue={inputValue || ""}
//         onInputChange={(event, newValue) => setInputValue(newValue)}
//         freeSolo
//         renderInput={(params) => (
//           <TextField
//             {...params}
//             label="Immatriculation"
//             variant="outlined"
//             fullWidth
//             size="small"
//             sx={{
//               height: "30px",
//               "& .MuiInputBase-root": { fontSize: "0.8rem" },
//               "& .MuiFormLabel-root": { fontSize: "0.8rem" },
//             }}
//           />
//         )}
//         renderOption={(props, option) => (
//           <li {...props} key={option.id}>
//             {option.plateNumber} {option.model} - {option.color}
//           </li>
//         )}
//       />

//       {/* Si aucune suggestion n'existe, afficher le bouton pour créer */}
//       {inputValue.length > 1 && clients.length === 0 && (
//         <Button
//           variant="contained"
//           color="primary"
//           fullWidth
//           onClick={() => setOpenDialog(true)}
//           style={{ marginTop: "10px" }}
//         >
//           + Ajouter un nouveau véhichule
//         </Button>
//       )}

//       {/* Fenêtre de création de client */}
//       <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//         <DialogTitle>Ajouter un nouveau véhichule</DialogTitle>
//         <DialogContent>
//           <TextField
//             name="plateNumber"
//             label="Immatriculation"
//             fullWidth
//             margin="normal"
//             onChange={handleNewClientChange}
//             size="small"
//           />
//           <TextField
//             name="vin"
//             label="VIN"
//             fullWidth
//             margin="normal"
//             onChange={handleNewClientChange}
//             size="small"
//           />

//           <TextField
//             name="model"
//             label="Modèle"
//             fullWidth
//             margin="normal"
//             onChange={handleNewClientChange}
//             size="small"
//           />
//           <TextField
//             name="color"
//             label="Couleur"
//             fullWidth
//             margin="normal"
//             onChange={handleNewClientChange}
//             size="small"
//           />
//           <TextField
//             name="mileage"
//             label="Kilométrage"
//             fullWidth
//             margin="normal"
//             onChange={handleNewClientChange}
//             size="small"
//           />
//           <TextField
//             name="lastCheck"
//             placeholder="Dernière vérification"
//             type="date"
//             fullWidth
//             margin="normal"
//             onChange={handleNewClientChange}
//             size="small"
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
//           <Button
//             onClick={handleCreateClient}
//             variant="contained"
//             color="primary"
//           >
//             Créer
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default PlateNumberSearch;

import {
  Box,
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
import { useEffect, useState } from "react";
import { useAxios } from "../../utils/hook/useAxios";

const PlateNumberSearch = ({ onSelectClient, Client }) => {
  const [clients, setClients] = useState([]); // Liste des véhicules
  const [selectedClientId, setSelectedClientId] = useState(""); // ID sélectionné
  const [openDialog, setOpenDialog] = useState(false); // Fenêtre de création
  const [newClient, setNewClient] = useState({
    plateNumber: "",
    vin: "",
    model: "",
    color: "",
    mileage: 0,
    lastCheck: "",
  });

  const axios = useAxios();

  // 🔍 Récupérer les véhicules liés au client
  useEffect(() => {
    if (Client?.id) {
      axios
        .get(`/vehicles/search/client?clientId=${Client.id}`)
        .then((res) => setClients(res.data))
        .catch((err) => {
          console.error(err);
          setClients([]);
        });
    }
  }, [Client]);

  // 🟢 Gérer la sélection d’un véhicule
  const handleSelectChange = (event) => {
    const id = event.target.value;
    const selected = clients.find((c) => c.id === id);
    setSelectedClientId(id);
    if (selected) {
      onSelectClient(selected);
    }
  };

  // ✏️ Gérer les champs du formulaire de création
  const handleNewClientChange = (e) => {
    setNewClient({ ...newClient, [e.target.name]: e.target.value });
  };

  const clientData = {
    ...newClient,
    clientId: Client?.id,
  };

  // 📌 Sauvegarde d'un nouveau véhicule
  const handleCreateClient = () => {
    axios
      .post("/vehicles", clientData)
      .then((res) => {
        setClients((prev) => [...prev, res.data]);
        setSelectedClientId(res.data.id);
        onSelectClient(res.data);
        setOpenDialog(false);
      })
      .catch((err) => console.error(err));
  };

  return (
    <Box sx={{ marginBottom: "1.5rem", marginTop: "1rem" }}>
      {/* Menu déroulant */}
      <FormControl fullWidth size="small">
        <InputLabel id="plate-select-label">Immatriculation</InputLabel>
        <Select
          labelId="plate-select-label"
          value={selectedClientId}
          label="Immatriculation"
          onChange={handleSelectChange}
        >
          {clients.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.plateNumber} – {client.model} – {client.color}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Si aucun véhicule trouvé */}
      {
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => setOpenDialog(true)}
          sx={{ marginTop: 2 }}
          disabled={!Client?.id}
        >
          {Client?.id
            ? " + Ajouter un nouveau véhicule"
            : "Selectionner un client avant d'ajouter une véhicule"}
        </Button>
      }

      {/* Fenêtre modale de création */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Ajouter un nouveau véhicule</DialogTitle>
        <DialogContent>
          <TextField
            name="plateNumber"
            label="Immatriculation"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
          />
          <TextField
            name="vin"
            label="VIN"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
          />
          <TextField
            name="model"
            label="Modèle"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
          />
          <TextField
            name="color"
            label="Couleur"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
          />
          <TextField
            name="mileage"
            label="Kilométrage"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
          />
          <TextField
            name="lastCheck"
            label="Dernière vérification"
            type="date"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            onClick={handleCreateClient}
            variant="contained"
            color="primary"
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlateNumberSearch;
