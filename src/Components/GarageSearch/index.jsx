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

const GarageSearch = ({ onSelectGarage, Garage }) => {
  const [inputValue, setInputValue] = useState(""); // Valeur tapée
  const [Garages, setGarages] = useState([]); // Liste des Garages suggérés
  const [selectedGarage, setSelectedGarage] = useState(null); // Garage sélectionné
  const [openDialog, setOpenDialog] = useState(false); // Fenêtre de création
  const [newGarage, setNewGarage] = useState({
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

  // 🔍 Recherche automatique des Garages
  useEffect(() => {
    if (inputValue.length > 1) {
      axios
        .get(`/garages/searchbyname?name=${inputValue}`)
        .then((res) => setGarages(res.data))
        .catch((err) => console.error(err));
    } else {
      setGarages([]);
    }
  }, [inputValue]);

  useEffect(() => {
    if (Garage) {
      setSelectedGarage(Garage);
      onSelectGarage(Garage);
    }
  }, [Garage]);

  // ✏️ Gérer la sélection du Garage
  const handleSelectGarage = (event, value) => {
    if (value && value.id) {
      setSelectedGarage(value);
      onSelectGarage(value);
    }
  };

  // ✏️ Gérer les champs du formulaire de création
  const handleNewGarageChange = (e) => {
    const { name, value } = e.target;
    // Nouvelle valeur du Garage mise à jour localement
    const updatedGarage = { ...newGarage, [name]: value };

    setNewGarage(updatedGarage);

    // Reset de l'erreur pour ce champ
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Recalcul de la validité du formulaire
    const hasErrors = Object.values(errors).some((err) => err !== "");
    const isInvalid = !updatedGarage.phone || !updatedGarage.email || hasErrors;
    setIsFormInvalid(isInvalid);
  };

  const GarageData = {
    ...newGarage,
  };

  // 📌 Sauvegarde d'un nouveau Garage
  const handleCreateGarage = () => {
    axios
      .post("/garages", GarageData)
      .then((res) => {
        setSelectedGarage(res.data);
        onSelectGarage(res.data);
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
    const isInvalid = !newGarage.phone || !newGarage.email || hasErrors;
    setIsFormInvalid(isInvalid);
  };

  return (
    <Box
      sx={{
        marginTop: "0.0rem",
      }}
    >
      {/* Zone de recherche */}
      <Autocomplete
        options={Garages}
        getOptionLabel={(option) => option.name}
        value={selectedGarage}
        onChange={handleSelectGarage}
        inputValue={inputValue}
        onInputChange={(event, newValue) => setInputValue(newValue)}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Nom du garage"
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
            {option.name}
          </li>
        )}
      />

      {/* Si aucune suggestion n'existe, afficher le bouton pour créer */}
      {inputValue.length > 1 && Garages.length === 0 && (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => setOpenDialog(true)}
          style={{ marginTop: "10px" }}
        >
          + Ajouter un nouveau Garage
        </Button>
      )}

      {/* Fenêtre de création de Garage */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Ajouter un nouveau Garage</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Nom"
            fullWidth
            margin="normal"
            onChange={handleNewGarageChange}
            size="small"
          />
          <TextField
            name="firstName"
            label="Prénom"
            fullWidth
            margin="normal"
            onChange={handleNewGarageChange}
            size="small"
          />

          <TextField
            name="phone"
            label="Téléphone"
            fullWidth
            margin="normal"
            onChange={handleNewGarageChange}
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
            onChange={handleNewGarageChange}
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
            onChange={handleNewGarageChange}
            size="small"
          />
          <TextField
            name="postalCode"
            label="Code postal"
            fullWidth
            margin="normal"
            onChange={handleNewGarageChange}
            size="small"
          />
          <TextField
            name="city"
            label="Ville"
            fullWidth
            margin="normal"
            onChange={handleNewGarageChange}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            onClick={handleCreateGarage}
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

export default GarageSearch;
