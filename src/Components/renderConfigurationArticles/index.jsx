import { Person } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TreeItem, TreeView } from "@mui/lab";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

function ConfigurationArticles() {
  const [groups, setGroups] = useState([]);
  const [families, setFamilies] = useState([]); // chaque famille a {name, groupId}
  const [tvas, setTvas] = useState(["5%", "10%", "20%", "0%"]);
  const [newGroup, setNewGroup] = useState("");
  const [newFamily, setNewFamily] = useState({ name: "", groupId: "" });
  const [newTva, setNewTva] = useState("");

  // --- gestion groupes ---

  // --- gestion groupes ---
  const addGroup = () => {
    if (newGroup.trim() === "") return;
    if (groups.includes(newGroup.trim())) return; // éviter doublons
    setGroups((prev) => [...prev, newGroup.trim()]);
    setNewGroup("");
  };

  const removeGroup = (groupName) => {
    setGroups((prev) => prev.filter((g) => g !== groupName));
    setFamilies((prev) => prev.filter((f) => f.groupId !== groupName));
  };

  // --- gestion familles ---
  const addFamily = () => {
    if (!newFamily.name || !newFamily.groupId) return;
    setFamilies((prev) => [...prev, { ...newFamily }]);
    setNewFamily({ name: "", groupId: "" });
  };

  const removeFamily = (family) => {
    setFamilies((prev) => prev.filter((f) => f !== family));
  };

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
      <>
        {/* --- Ajout Groupe --- */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6">Groupes</Typography>
          <Stack spacing={2} mt={1} direction="row" alignItems="center">
            <TextField
              label="Nouveau groupe"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              size="small"
            />
            <Button variant="contained" onClick={addGroup}>
              <AddIcon /> Ajouter
            </Button>
          </Stack>
          <Stack spacing={1} mt={2}>
            {groups.map((group, index) => (
              <Stack
                key={index}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ borderBottom: "1px solid #eee", pb: 0.5 }}
              >
                <Typography>{group}</Typography>
                <IconButton
                  color="error"
                  onClick={() => removeGroup(group)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </Paper>

        {/* --- Ajout Famille --- */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6">Ajouter Famille</Typography>
          <Stack spacing={2} mt={1} direction="row" alignItems="center">
            <TextField
              label="Nom de la famille"
              value={newFamily.name}
              onChange={(e) =>
                setNewFamily((prev) => ({ ...prev, name: e.target.value }))
              }
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Groupe</InputLabel>
              <Select
                value={newFamily.groupId}
                label="Groupe"
                onChange={(e) =>
                  setNewFamily((prev) => ({ ...prev, groupId: e.target.value }))
                }
              >
                {groups.map((g, i) => (
                  <MenuItem key={i} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={addFamily}>
              <AddIcon /> Ajouter
            </Button>
          </Stack>
        </Paper>

        {/* --- Arborescence Groupes/Familles --- */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Arborescence
          </Typography>
          {groups.length === 0 ? (
            <Typography color="text.secondary">Aucun groupe défini.</Typography>
          ) : (
            <TreeView
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
            >
              {groups.map((group, gi) => (
                <TreeItem
                  nodeId={`group-${gi}`}
                  label={
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography>{group}</Typography>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => removeGroup(group)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  key={gi}
                >
                  {families
                    .filter((f) => f.groupId === group)
                    .map((family, fi) => (
                      <TreeItem
                        nodeId={`family-${gi}-${fi}`}
                        label={
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography>{family.name}</Typography>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => removeFamily(family)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                        key={fi}
                      />
                    ))}
                </TreeItem>
              ))}
            </TreeView>
          )}
        </Paper>
      </>

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
