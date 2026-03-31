import { Person } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

function ConfigurationArticles() {
  const [tvas, setTvas] = useState(["5%", "10%", "20%", "0%"]);
  const [newTva, setNewTva] = useState("");

  // --- gestion TVAs ---
  const addTva = () => {
    if (!newTva) return;
    setTvas((prev) => [...prev, newTva]);
    setNewTva("");
  };

  const removeTva = (index) => {
    setTvas((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        <Person /> Configuration des articles
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">TVAs</Typography>
        <Stack spacing={2} mt={1}>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Nouvelle TVA"
              value={newTva}
              onChange={(e) => setNewTva(e.target.value)}
              size="small"
            />
            <Button variant="contained" onClick={addTva}>
              <AddIcon /> Ajouter
            </Button>
          </Stack>

          {tvas.map((tva, index) => (
            <Stack
              key={index}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>{tva}</Typography>
              <IconButton color="error" onClick={() => removeTva(index)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </>
  );
}

export default ConfigurationArticles;
