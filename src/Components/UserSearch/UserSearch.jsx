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

const UserSearch = ({ onSelectUser, Users, garageId, NameAttribute }) => {
  const [inputValue, setInputValue] = useState(""); // Valeur tapée
  const [Userss, setUserss] = useState([]); // Liste des Userss suggérés
  const [selectedUsers, setSelectedUsers] = useState(null); // Users sélectionné
  const [openDialog, setOpenDialog] = useState(false); // Fenêtre de création
  const [newUsers, setNewUsers] = useState({
    name: "",
    firstName: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    email: "",
  });
  const [isFormInvalid, setIsFormInvalid] = useState(false);
  const axios = useAxios();

  // 🔍 Recherche automatique des Userss
  useEffect(() => {
    if (inputValue.length > 1) {
      axios
        .get(`/users/search?firstName=${inputValue}&garageId=${garageId}`)
        .then((res) => {
          setUserss(res.data);
          console.log("inputValue:", inputValue);
          console.log("résultat API:", res.data);
        })
        .catch((err) => {
          console.error(err);
          setUserss([]);
        });
    } else {
      setUserss([]);
    }
  }, [inputValue]);

  useEffect(() => {
    if (Users) {
      setSelectedUsers(Users);
      onSelectUser(Users);
    }
  }, [Users]);

  // ✏️ Gérer la sélection du Users
  const handleSelectUsers = (event, value) => {
    if (value && value.id) {
      setSelectedUsers(value);
      onSelectUser(value);
      setInputValue("");
    }
  };

  // ✏️ Gérer les champs du formulaire de création
  const handleNewUsersChange = (e) => {
    const { name, value } = e.target;
    // Nouvelle valeur du Users mise à jour localement
    const updatedUsers = { ...newUsers, [name]: value };

    setNewUsers(updatedUsers);

    // Reset de l'erreur pour ce champ
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Recalcul de la validité du formulaire
    const hasErrors = Object.values(errors).some((err) => err !== "");
    const isInvalid = hasErrors;
    setIsFormInvalid(isInvalid);
  };

  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  const UsersData = {
    ...newUsers,
    garageId: getCurrentUser().garageId, // Assurez-vous que garageId est défini dans le composant
  };

  // 📌 Sauvegarde d'un nouveau Users
  const handleCreateUsers = () => {
    axios
      .post("/users", UsersData)
      .then((res) => {
        setSelectedUsers(res.data);
        onSelectUser(res.data);
        setOpenDialog(false);
        setInputValue(""); // Réinitialiser la recherche
      })
      .catch((err) => console.error(err));
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Zone de recherche */}
      <Autocomplete
        options={Userss}
        getOptionLabel={(option) =>
          `${option.firstName || ""} ${option.name || ""}`.trim()
        }
        value={selectedUsers}
        onChange={handleSelectUsers}
        inputValue={inputValue}
        onInputChange={(event, newValue) => {
          setInputValue(newValue);
          setSelectedUsers(null);
        }}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={NameAttribute}
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
      {inputValue.length > 1 && Userss.length == 0 && !selectedUsers && (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => setOpenDialog(true)}
          style={{ marginTop: "10px" }}
        >
          + Ajouter un nouveau utilisateur
        </Button>
      )}

      {/* Fenêtre de création de Users */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Ajouter un nouveau utilisateur</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Nom"
            fullWidth
            margin="normal"
            onChange={handleNewUsersChange}
            size="small"
          />
          <TextField
            name="firstName"
            label="Prénom"
            fullWidth
            margin="normal"
            onChange={handleNewUsersChange}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            onClick={handleCreateUsers}
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

export default UserSearch;
