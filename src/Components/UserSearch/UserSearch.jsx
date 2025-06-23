import { Autocomplete, Box, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useAxios } from "../../utils/hook/useAxios";

const UserSearch = ({
  onSelectUser,
  garageId,
  NameAttribute = "Sélectionner un utilisateur",
}) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const axios = useAxios();

  // 🔄 Récupération des utilisateurs du garage
  useEffect(() => {
    if (garageId) {
      axios
        .get(`/users/garageid/${garageId}`)
        .then((res) => setUsers(res.data))
        .catch((err) => {
          console.error("Erreur de chargement des utilisateurs :", err);
          setUsers([]);
        });
    }
  }, [garageId]);

  const handleSelectUser = (event, user) => {
    setSelectedUser(user);
    onSelectUser && onSelectUser(user);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Autocomplete
        options={users}
        value={selectedUser}
        onChange={handleSelectUser}
        getOptionLabel={(user) =>
          `${user.firstName || ""} ${user.name || ""}`.trim()
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={NameAttribute}
            variant="outlined"
            fullWidth
            size="small"
            sx={{
              "& .MuiInputBase-root": { fontSize: "0.8rem" },
              "& .MuiFormLabel-root": { fontSize: "0.8rem" },
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            {option.firstName} {option.name} - {option.email}
          </li>
        )}
        disableClearable
      />
    </Box>
  );
};

export default UserSearch;
