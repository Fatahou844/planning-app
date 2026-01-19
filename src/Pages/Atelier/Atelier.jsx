import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import AddDocumentComponent from "../../Components/AddDocumentComponent";
import PointageDialog from "../../Components/PointageDialog/PointageDialog";
import PreviewOR from "../../Components/PreviewOR";
import SearchBar from "../../Components/SearchBar";
import { useAxios } from "../../utils/hook/useAxios";

export default function Atelier() {
  const [orders, setOrders] = useState([]);
  const [selectedOR, setSelectedOR] = useState(null);
  const [localOrders, setLocalOrders] = useState([]);

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
          `/documents-garage/order/${getCurrentUser().garageId}/details`,
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

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const handleStatusOrder = async (id, newStatus, localDateTime) => {
    // 🧠 1. Mets à jour l’état local `orders` immédiatement
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id
          ? { ...order, OrderStatus: newStatus, datePointage: localDateTime }
          : order,
      ),
    );

    // 💬 2. (Optionnel) Affiche un feedback ou une alerte
    console.log(
      `✅ Commande ${id} mise à jour en "${newStatus}" à ${localDateTime}`,
    );
  };

  const handleDocumentCreated = async () => {
    // Ici tu peux par ex :
    // - Mettre à jour ton state `ordersData` ou `events`
    // - Appeler une API
    // - Déclencher un re-render ou recalculer la semaine
  };

  /* -------------------
   EN COURS
------------------- */
  const activite = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const getDateOnly = (datetime) => datetime?.split("T")[0];

    return localOrders.filter((o) => {
      const orderDate = getDateOnly(o.date);
      const pointageDate = getDateOnly(o.datePointage);
      return (
        !o.isClosed &&
        (orderDate === today ||
          pointageDate === today ||
          o.OrderStatus === "En cours")
      );
    });
  }, [localOrders]); // recalcul seulement quand orders change

  const factures = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const getDateOnly = (datetime) => datetime?.split("T")[0];
    return localOrders.filter((o) => {
      const orderDate = getDateOnly(o.date);
      return o.isClosed && orderDate === today;
    });
  }, [localOrders]);
  return (
    <>
      <Box sx={{ height: "100vh", px: 4 }}>
        <Grid container spacing={2} sx={{ height: "100%" }}>
          {/* Gauche - 25% */}
          <Grid item xs={12} md={3} sx={{ pl: "2.5rem !important" }}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent sx={{ flex: 1, overflowY: "auto" }}>
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
                  {activite.map((item) => {
                    // 🧮 Calcul du total HT de l'activité à partir des détails TTC
                    const totalHT = item.Details?.reduce((acc, d) => {
                      const montantTTC = d.unitPrice * d.quantity;
                      const remiseTTC =
                        d.discountPercent > 0
                          ? (montantTTC * d.discountPercent) / 100
                          : d.discountValue || 0;

                      const totalTTC = montantTTC - remiseTTC;

                      // Conversion TTC → HT (20% TVA)
                      const totalHTDetail = totalTTC / 1.2;

                      return acc + totalHTDetail;
                    }, 0);

                    return (
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
                          cursor: "pointer", // 🖱 indique qu'on peut cliquer
                        }}
                        onClick={() => setSelectedOR(item)} // 🔥 on met à jour l'OR sélectionné
                      >
                        <Typography variant="body2">
                          {item.id} - {item.Vehicle?.plateNumber} -{" "}
                          {item.Client?.name}
                        </Typography>

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {/* Statut */}
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

                          {/* Total activité */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: "black",
                              px: 1.5,
                              borderRadius: 1,
                              fontWeight: 600,
                            }}
                          >
                            {totalHT?.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
                {/* 🧾 Total général */}
              </CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  p: 2,

                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Total ORs HT :{" "}
                  {activite
                    .reduce((acc, item) => {
                      const totalItemHT = item.Details?.reduce((sum, d) => {
                        const montantTTC = d.unitPrice * d.quantity;
                        const remiseTTC =
                          d.discountPercent > 0
                            ? (montantTTC * d.discountPercent) / 100
                            : d.discountValue || 0;
                        const totalTTC = montantTTC - remiseTTC;
                        return sum + totalTTC / 1.2; // conversion TTC → HT
                      }, 0);
                      return acc + totalItemHT;
                    }, 0)
                    .toFixed(2)}{" "}
                  € HT
                </Typography>
              </Box>
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
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <SearchBar onSaveStatus={handleStatusOrder} />

              <Button
                variant="contained"
                sx={{ mb: 2, mt: 3, width: "100%" }}
                onClick={handleOpenPointage}
              >
                Pointage
              </Button>
              <Button variant="contained" sx={{ mb: 2, width: "100%" }}>
                Horaires opérateurs
              </Button>

              <Box sx={{ flexGrow: 1 }} />
              {selectedOR ? (
                <PreviewOR orData={selectedOR} />
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#999",
                  }}
                >
                  Sélectionnez un OR pour voir les détails
                </Box>
              )}
            </Box>

            {/* Prévisualisation OR */}
          </Grid>

          {/* Droite - 25% */}
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* --- HEADER FIXE --- */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <Typography variant="h6">Factures atelier</Typography>
                <Typography variant="body2">
                  {new Date().toLocaleDateString()}
                </Typography>
              </Box>

              {/* --- CONTENU SCROLLABLE --- */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 2,
                }}
              >
                {factures.map((item) => {
                  // 🧮 Calcul du total HT par facture
                  const totalHT = item.Details?.reduce((acc, d) => {
                    const montantTTC = d.unitPrice * d.quantity;
                    const remiseTTC =
                      d.discountPercent > 0
                        ? (montantTTC * d.discountPercent) / 100
                        : d.discountValue || 0;
                    const totalTTC = montantTTC - remiseTTC;
                    return acc + totalTTC / 1.2; // Conversion TTC → HT
                  }, 0);

                  return (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {item.id} - {item.Vehicle?.plateNumber} -{" "}
                        {item.Client?.name}
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: "green",
                            color: "white",
                            px: 1,
                            borderRadius: 1,
                          }}
                        >
                          Facturé
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            bgcolor: "white",
                            color: "black",
                            px: 1.5,
                            borderRadius: 1,
                            fontWeight: 600,
                          }}
                        >
                          {totalHT?.toFixed(2)} €
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* --- FOOTER FIXE --- */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  p: 2,

                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  boxShadow: "0 -2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Total Factures HT :{" "}
                  {factures
                    .reduce((acc, item) => {
                      const totalItemHT = item.Details?.reduce((sum, d) => {
                        const montantTTC = d.unitPrice * d.quantity;
                        const remiseTTC =
                          d.discountPercent > 0
                            ? (montantTTC * d.discountPercent) / 100
                            : d.discountValue || 0;
                        const totalTTC = montantTTC - remiseTTC;
                        return sum + totalTTC / 1.2;
                      }, 0);
                      return acc + totalItemHT;
                    }, 0)
                    .toFixed(2)}{" "}
                  €
                </Typography>
              </Box>
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
        onSaveStatus={handleStatusOrder}
      />
    </>
  );
}
