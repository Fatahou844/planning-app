import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAxios } from "../../utils/hook/useAxios";

const PlateNumberSearch = ({ onSelectClient, Client }) => {
  const [inputValue, setInputValue] = useState(""); // Valeur tapée
  const [clients, setClients] = useState([]); // Liste des clients suggérés
  const [selectedClient, setSelectedClient] = useState(null); // Client sélectionné
  const [openDialog, setOpenDialog] = useState(false); // Fenêtre de création
  const [newClient, setNewClient] = useState({
    name: "",
    firstName: "",
    email: "",
    phone: "",
  });
  const axios = useAxios();

  // 🔍 Recherche automatique des clients
  useEffect(() => {
    if (inputValue.length > 1) {
      axios
        .get(`/vehicles/search/plateNumber?plateNumber=${inputValue}`)
        .then((res) => setClients(res.data))
        .catch((err) => {
          console.error(err);
          setClients([]);
        });
    } else {
      setClients([]);
    }
  }, [inputValue]);

  useEffect(() => {
    if (Client) {
      setSelectedClient(Client);
      onSelectClient(Client);
    }
  }, [Client]);

  // ✏️ Gérer la sélection du client
  const handleSelectClient = (event, value) => {
    if (value && value.id) {
      setSelectedClient(value);
      onSelectClient(value);
    }
  };

  // ✏️ Gérer les champs du formulaire de création
  const handleNewClientChange = (e) => {
    setNewClient({ ...newClient, [e.target.name]: e.target.value });
  };

  const clientData = {
    ...newClient,
    clientId: Client.id, // Assurez-vous que garageId est défini dans le composant
  };

  // 📌 Sauvegarde d'un nouveau client
  const handleCreateClient = () => {
    axios
      .post("/vehicles", clientData)
      .then((res) => {
        setSelectedClient(res.data);
        onSelectClient(res.data);
        setOpenDialog(false);
        setInputValue(""); // Réinitialiser la recherche
      })
      .catch((err) => console.error(err));
  };

  return (
    <Box
      sx={{
        marginBottom: "1.5rem",
        marginTop: "1.0rem",
      }}
    >
      {/* Zone de recherche */}
      <Autocomplete
        options={clients}
        getOptionLabel={(option) => option?.plateNumber || "—"}
        value={selectedClient || null}
        onChange={handleSelectClient}
        inputValue={inputValue || ""}
        onInputChange={(event, newValue) => setInputValue(newValue)}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label="Immatriculation"
            variant="outlined"
            fullWidth
            size="small"
            sx={{
              height: "30px",
              "& .MuiInputBase-root": { fontSize: "0.8rem" },
              "& .MuiFormLabel-root": { fontSize: "0.8rem" },
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            {option.plateNumber} {option.model} - {option.color}
          </li>
        )}
      />

      {/* Si aucune suggestion n'existe, afficher le bouton pour créer */}
      {inputValue.length > 1 && clients.length === 0 && (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => setOpenDialog(true)}
          style={{ marginTop: "10px" }}
        >
          + Ajouter un nouveau véhichule
        </Button>
      )}

      {/* Fenêtre de création de client */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Ajouter un nouveau véhichule</DialogTitle>
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
            label="Code postal"
            type="date"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
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
