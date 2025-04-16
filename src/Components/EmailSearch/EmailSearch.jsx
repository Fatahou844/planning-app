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
import React, { useEffect, useState } from "react";
import { useAxios } from "../../utils/hook/useAxios";

const EmailSearch = ({ onSelectClient, Client }) => {
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
  const [errors, setErrors] = useState({
    phone: "",
    email: "",
  });
  const [isFormInvalid, setIsFormInvalid] = useState(false);

  const axios = useAxios();

  // 🔍 Recherche automatique des clients
  useEffect(() => {
    if (inputValue.length > 1) {
      axios
        .get(`/clients/search/email?email=${inputValue}`)
        .then((res) => setClients(res.data))
        .catch((err) => console.error(err));
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
    const { name, value } = e.target;
    // Nouvelle valeur du client mise à jour localement
    const updatedClient = { ...newClient, [name]: value };

    setNewClient(updatedClient);

    // Reset de l'erreur pour ce champ
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Recalcul de la validité du formulaire
    const hasErrors = Object.values(errors).some((err) => err !== "");
    const isInvalid = !updatedClient.phone || !updatedClient.email || hasErrors;
    setIsFormInvalid(isInvalid);
  };

  const clientData = {
    ...newClient,
    garageId: 1, // Assurez-vous que garageId est défini dans le composant
  };

  // 📌 Sauvegarde d'un nouveau client
  const handleCreateClient = () => {
    axios
      .post("/clients", clientData)
      .then((res) => {
        setSelectedClient(res.data);
        onSelectClient(res.data);
        setOpenDialog(false);
        setInputValue(""); // Réinitialiser la recherche
      })
      .catch((err) => console.error(err));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (
      name === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      error = "Email invalide";
    }

    if (name === "phone" && value && !/^\+?[0-9\s\-]{7,15}$/.test(value)) {
      error = "Téléphone invalide";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));

    // Recalcule si le form devient invalide
    const hasErrors = Object.values({ ...errors, [name]: error }).some(
      (err) => err !== ""
    );
    const isInvalid = !newClient.phone || !newClient.email || hasErrors;
    setIsFormInvalid(isInvalid);
  };

  return (
    <Box
      sx={{
        marginTop: "0.8rem",
      }}
    >
      {/* Zone de recherche */}
      <Autocomplete
        options={clients}
        getOptionLabel={(option) => option.email}
        value={selectedClient}
        onChange={handleSelectClient}
        inputValue={inputValue}
        onInputChange={(event, newValue) => setInputValue(newValue)}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label="Email"
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
            {option.name} {option.firstName} - {option.email}
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
          + Ajouter un nouveau client
        </Button>
      )}

      {/* Fenêtre de création de client */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Ajouter un nouveau client</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Nom"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
          />
          <TextField
            name="firstName"
            label="Prénom"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
          />

          <TextField
            name="phone"
            label="Téléphone"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
            onBlur={handleBlur}
            error={!!errors.phone}
            helperText={errors.phone}
          />
          <TextField
            name="email"
            label="Email"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
            onBlur={handleBlur}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            name="address"
            label="Adresse"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
          />
          <TextField
            name="postalCode"
            label="Code postal"
            fullWidth
            margin="normal"
            onChange={handleNewClientChange}
            size="small"
          />
          <TextField
            name="city"
            label="Ville"
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
            disabled={isFormInvalid}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailSearch;
