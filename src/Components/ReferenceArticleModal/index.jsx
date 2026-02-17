import DeleteIcon from "@mui/icons-material/Delete";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function ReferenceArticleModal({ open, onClose }) {
  const types = ["Pneus", "Pièces", "Accessoires", "Consommables atelier"];

  const groupes = [
    "Freinage",
    "Filtration",
    "Suspension",
    "Moteur",
    "Électricité",
    "Tourisme",
    "4x4",
    "Utilitaires",
  ];

  const familles = {
    Freinage: ["Plaquettes", "Disques", "Tambours"],
    Filtration: ["Huile", "Air", "Habitacle", "Carburant"],
    Suspension: ["Amortisseurs", "Ressorts"],
    Moteur: ["Distribution", "Courroies", "Pompes"],
    Électricité: ["Batteries", "Alternateurs", "Démarreurs"],
    Tourisme: ["15 pouces", "16 pouces", "17 pouces"],
    "4x4": ["All terrain", "Mud terrain"],
    Utilitaires: ["Renforcé", "Charge lourde"],
  };

  const [form, setForm] = useState({
    libelle1: "",
    libelle2: "",
    libelle3: "",
    codeBarre: "",
    refExt: "",
    refInt: "",
    prixTTC: "",
    prixHT: "",
    tva: "",
    prixAchat: "",
    marge: "",
    margePct: "",
    fournisseur: "",
    marque: "",
    type: "",
    groupe: "",
    famille: "",
    emplacement: "",
    fraisPort: "",
    garantie: "",
    composantLot: "",
    conditionnement: "",
  });

  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const handleFileAdd = (e, type) => {
    const files = Array.from(e.target.files);

    if (type === "photo") {
      const filesWithPreview = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPhotos((prev) => [...prev, ...filesWithPreview]);
    } else {
      setDocuments((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index, type) => {
    if (type === "photo") {
      setPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setDocuments((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const removePhoto = (index) => {
    URL.revokeObjectURL(photos[index].preview); // libère l'URL
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    console.log("Article enregistré :", form);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{ sx: { width: 1300, maxWidth: "95%" } }}
    >
      <DialogTitle>Référencer / Créer un article</DialogTitle>

      <DialogContent>
        {/* INFOS PRINCIPALES */}
        <Grid container spacing={2}>
          {[
            ["libelle1", "Libellé 1 (nom commun)"],
            ["libelle2", "Libellé 2"],
            ["libelle3", "Libellé 3"],
            ["codeBarre", "Code barre"],
            ["refExt", "Référence fabricant"],
            ["refInt", "Référence interne"],
          ].map(([name, label]) => (
            <Grid item xs={12} md={6} key={name}>
              <TextField
                fullWidth
                label={label}
                name={name}
                value={form[name]}
                onChange={handleChange}
                size="small"
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* TARIFICATION */}
        <Grid container spacing={2}>
          {[
            ["prixTTC", "Prix de vente TTC"],
            ["prixHT", "Prix de vente HT"],
            ["tva", "TVA (%)"],
            ["prixAchat", "Prix d'achat HT net"],
            ["marge", "Marge"],
            ["margePct", "Marge %"],
          ].map(([name, label]) => (
            <Grid item xs={12} md={4} key={name}>
              <TextField
                fullWidth
                label={label}
                name={name}
                value={form[name]}
                onChange={handleChange}
                size="small"
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* CLASSIFICATION MÉTIER */}
        <Grid container spacing={2}>
          {/* TYPE */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              fullWidth
              size="small"
            >
              {types.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* GROUPE */}
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={groupes}
              value={form.groupe}
              onChange={(e, value) =>
                setForm({ ...form, groupe: value, famille: "" })
              }
              renderInput={(params) => (
                <TextField {...params} label="Groupe" size="small" />
              )}
            />
          </Grid>

          {/* FAMILLE */}
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={familles[form.groupe] || []}
              value={form.famille}
              onChange={(e, value) => setForm({ ...form, famille: value })}
              renderInput={(params) => (
                <TextField {...params} label="Famille" size="small" />
              )}
              disabled={!form.groupe}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* FOURNISSEUR & MARQUE */}
        <Grid container spacing={2}>
          {[
            ["fournisseur", "Fournisseur"],
            ["marque", "Marque"],
            ["emplacement", "Emplacement / casier"],
            ["fraisPort", "Frais de port HT"],
            ["garantie", "SAV / conditions garantie"],
            ["composantLot", "Composant d'un lot"],
            ["conditionnement", "Conditionnement"],
          ].map(([name, label]) => (
            <Grid item xs={12} md={4} key={name}>
              <TextField
                fullWidth
                label={label}
                name={name}
                value={form[name]}
                onChange={handleChange}
                size="small"
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* UPLOAD PHOTOS */}
        <Box mb={3}>
          <Typography fontWeight="bold">Photos</Typography>

          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(90px, 1fr))"
            gap={2}
            mt={1}
          >
            {photos.map((photo, index) => (
              <Box
                key={index}
                position="relative"
                sx={{
                  borderRadius: 1,
                  overflow: "hidden",
                  border: "1px solid #ddd",
                  height: 90,
                }}
              >
                <img
                  src={photo.preview}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* bouton suppression */}
                <Box
                  position="absolute"
                  top={4}
                  right={4}
                  sx={{
                    background: "rgba(0,0,0,0.6)",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                  }}
                  onClick={() => removePhoto(index)}
                >
                  <DeleteIcon sx={{ color: "#fff", fontSize: 16 }} />
                </Box>
              </Box>
            ))}
          </Box>

          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            + Ajouter photo
            <input
              hidden
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileAdd(e, "photo")}
            />
          </Button>
        </Box>

        {/* UPLOAD DOCUMENTS */}
        <Box mb={3}>
          <Typography fontWeight="bold">Documents</Typography>

          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {documents.map((file, index) => (
              <Button
                key={index}
                variant="contained"
                size="small"
                onClick={() => removeFile(index, "document")}
              >
                {file.name} ✕
              </Button>
            ))}
          </Box>

          <Button variant="outlined" component="label" sx={{ mt: 1 }}>
            + Ajouter document
            <input
              hidden
              type="file"
              multiple
              onChange={(e) => handleFileAdd(e, "document")}
            />
          </Button>
        </Box>

        {/* ACTIONS */}
        <Box display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={onClose}>
            Quitter
          </Button>

          <Box display="flex" gap={2}>
            <Button variant="contained" color="warning">
              Modifier
            </Button>

            <Button variant="contained" onClick={handleSave}>
              Enregistrer
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
