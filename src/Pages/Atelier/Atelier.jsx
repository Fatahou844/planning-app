import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import AddDocumentComponent from "../../Components/AddDocumentComponent";
import PointageDialog from "../../Components/PointageDialog/PointageDialog";
import { useAxios } from "../../utils/hook/useAxios";
export default function Atelier() {
  const [orders, setOrders] = useState([]);

  const [openPointage, setOpenPointage] = useState(false);
  const handleOpenPointage = () => setOpenPointage(true);
  const handleClosePointage = () => setOpenPointage(false);

  const axios = useAxios();

  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `/documents-garage/order/${getCurrentUser().garageId}/details`
        );
        // si ton backend renvoie un objet avec des clés numériques, on transforme en array
        const data = Object.values(res.data.data);
        setOrders(data);
      } catch (err) {
        console.error("Erreur API:", err);
      }
    };

    fetchOrders();
  }, []);

  const handleDocumentCreated = async () => {
    // Ici tu peux par ex :
    // - Mettre à jour ton state `ordersData` ou `events`
    // - Appeler une API
    // - Déclencher un re-render ou recalculer la semaine
  };

  // Séparation en "en cours" et "facturés"
  const today = new Date().toISOString().split("T")[0];
  // ça donne "2025-09-29" (AAAA-MM-JJ)

  const activite = orders.filter((o) => !o.isClosed && o.date === today);

  const factures = orders.filter((o) => o.isClosed && o.date === today);
  return (
    <>
      <Box sx={{ height: "100vh", px: 4, bgcolor: "#f5f5f5" }}>
        <Grid container spacing={2} sx={{ height: "100%" }}>
          {/* Gauche - 25% */}
          <Grid item xs={12} md={3}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flex: 1, overflow: "hidden" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                    ml: 3,
                  }}
                >
                  <Typography variant="h6">Suivi activité atelier</Typography>
                  <Typography variant="body2">
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ maxHeight: "80vh", overflowY: "auto", ml: 3 }}>
                  {activite.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: item.Category?.color || "#ccc",
                        color: "white",
                      }}
                    >
                      <Typography variant="body2">
                        {item.id} - {item.Vehicle?.plateNumber} -{" "}
                        {item.Client?.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: "white",
                          color: "black",
                          px: 1,
                          borderRadius: 1,
                        }}
                      >
                        {item.OrderStatus}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Milieu - 50% */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 2,
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <Box sx={{ display: "flex", mb: 2, width: "100%" }}>
                <TextField
                  placeholder="Rechercher"
                  size="small"
                  variant="outlined"
                  fullWidth
                />
                <Button variant="contained" sx={{ ml: 1 }}>
                  Rechercher
                </Button>
              </Box>

              <Button
                variant="contained"
                sx={{ mb: 2, width: "100%" }}
                onClick={handleOpenPointage}
              >
                Pointage
              </Button>
              <Button variant="contained" sx={{ mb: 2, width: "100%" }}>
                Horaires opérateurs
              </Button>

              <Box sx={{ flexGrow: 1 }} />
            </Box>
          </Grid>

          {/* Droite - 25% */}
          <Grid item xs={12} md={3}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flex: 1, overflow: "hidden" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Factures atelier</Typography>
                  <Typography variant="body2">
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ maxHeight: "80vh", overflowY: "auto" }}>
                  {factures.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: "#E3F2FD",
                      }}
                    >
                      <Typography variant="body2">
                        {item.id} - {item.Vehicle?.plateNumber} -{" "}
                        {item.Client?.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: "green",
                          color: "white",
                          px: 1,
                          borderRadius: 1,
                        }}
                      >
                        facturé
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography align="right">
                  {/* {factures
                    .flatMap((f) => f.Details || [])
                    .reduce((sum, d) => sum + d.unitPrice * d.quantity, 0) /
                    (1.2).toFixed(2)} */}
                  {(
                    factures
                      .flatMap((f) => f.Details || [])
                      .reduce((sum, d) => {
                        const base = d.unitPrice * d.quantity;
                        const discountPercent = d.discountPercent
                          ? (base * d.discountPercent) / 100
                          : 0;
                        const discountValue = d.discountValue || 0;
                        const totalAfterDiscount =
                          base - discountPercent - discountValue;
                        return sum + totalAfterDiscount;
                      }, 0) / 1.2
                  ) // application de la TVA 20%
                    .toFixed(2)}{" "}
                  €
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <AddDocumentComponent
        onDocumentCreated={handleDocumentCreated}
      ></AddDocumentComponent>

      {/* ✅ MODAL POINTAGE */}
      <PointageDialog
        openPointage={openPointage}
        handleClosePointage={handleClosePointage}
        activite={activite}
        onSaveStatus={(id, status) => console.log("Sauvegarde :", id, status)}
      />
    </>
  );
}
