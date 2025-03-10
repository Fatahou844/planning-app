import {
  Avatar,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../../hooks/firebaseConfig";

const GarageSettings = () => {
  const [user] = useAuthState(auth);
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logo: null, // Stocke le fichier image
    userId: user?.uid,
    logoPreview: "", // Stocke l'URL de prévisualisation
  });

  useEffect(() => {
    const fetchGarageInfo = async () => {
      if (!user) return;

      const q = query(
        collection(db, "garages"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const garageData = querySnapshot.docs[0].data();
        setCompanyInfo(garageData);
      }
    };

    fetchGarageInfo();
  }, [user]);

  const handleChange = (e) => {
    setCompanyInfo({
      ...companyInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setCompanyInfo((prev) => ({
        ...prev,
        logo: file,
        logoPreview: previewURL,
      }));
    }
  };

  const handleSave = async () => {
    try {
      let logoURL = companyInfo.logoPreview; // Garde l'ancien logo si aucun fichier n'est ajouté

      if (companyInfo.logo) {
        // Référence du fichier dans Firebase Storage
        const logoRef = ref(storage, `logos/${user?.uid}.jpg`);

        // Téléverser l'image
        await uploadBytes(logoRef, companyInfo.logo);

        // Obtenir l'URL publique du logo
        logoURL = await getDownloadURL(logoRef);
      }

      await setDoc(doc(collection(db, "garages"), user?.uid), {
        name: companyInfo.name,
        address: companyInfo.address,
        phone: companyInfo.phone,
        email: companyInfo.email,
        website: companyInfo.website,
        userId: user?.uid,
        logo: logoURL || "", // Enregistre l'URL dans Firestore
      });
      alert("Informations enregistrées avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: "6rem" }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Paramètres du Garage
        </Typography>
        <Grid container spacing={3} alignItems="center">
          {/* Aperçu du logo et Upload */}
          <Grid
            item
            xs={12}
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Avatar
              src={companyInfo.logoPreview || companyInfo.logo}
              sx={{ width: 100, height: 100, mb: 2 }}
              alt="Logo du garage"
            />
            <Button variant="contained" component="label">
              Changer le Logo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleLogoChange}
              />
            </Button>
          </Grid>

          {/* Champs d'information */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Nom du Garage"
              fullWidth
              name="name"
              value={companyInfo.name}
              onChange={handleChange}
              size="small"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Adresse"
              fullWidth
              name="address"
              value={companyInfo.address}
              onChange={handleChange}
              size="small"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Téléphone"
              fullWidth
              name="phone"
              value={companyInfo.phone}
              onChange={handleChange}
              size="small"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Email"
              fullWidth
              name="email"
              value={companyInfo.email}
              onChange={handleChange}
              size="small"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Site Web"
              fullWidth
              name="website"
              value={companyInfo.website}
              onChange={handleChange}
              size="small"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Enregistrer
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default GarageSettings;
