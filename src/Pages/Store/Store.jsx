import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import PersonIcon from "@mui/icons-material/Person";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Box, Grid, Typography } from "@mui/material";
import { useState } from "react";
import ActionBlock from "../../Components/ActionBlock";
import AddDocumentComponent from "../../Components/AddDocumentComponent";
import ModalManager from "../../Components/ModalManager";

export default function Store() {
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const handleActionClick = (type) => {
    setModalType(type);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setModalType(null);
  };

  const blocks = [
    {
      title: "Article",
      icon: <CategoryIcon sx={{ fontSize: 15 }} />,
      actions: [
        { id: "searchArticle", label: "recherche article" },
        { id: "referenceArticle", label: "référencement article" },
        { id: "etiquetage", label: "étiquetage" },
      ],
    },
    {
      title: "Réception",
      icon: <MoveToInboxIcon sx={{ fontSize: 15 }} />,
      actions: [
        { id: "entreeMarchandise", label: "entrée marchandise" },
        { id: "reliquats", label: "consultation reliquats" },
      ],
    },
    {
      title: "Réappros",
      icon: <ShoppingCartIcon sx={{ fontSize: 15 }} />,
      actions: [
        { id: "tableauCommandes", label: "tableau des commandes" },
        { id: "propositionCommandes", label: "proposition commandes" },
        { id: "consultationResaClients", label: "consultation résa clients" },
      ],
    },
    {
      title: "Prix",
      icon: <PriceChangeIcon sx={{ fontSize: 15 }} />,
      actions: [
        { id: "modificationPrix", label: "modification prix" },
        { id: "etiquettesPrix", label: "étiquettes" },
        { id: "promoPrix", label: "promo" },
      ],
    },
    {
      title: "Fournisseurs",
      icon: <BusinessIcon sx={{ fontSize: 15 }} />,
      actions: [
        { id: "historiqueCommandesFss", label: "historique commandes fss" },
        { id: "demandeRetourFss", label: "demande retour fss" },
        { id: "consultationFss", label: "consultation fss" },
        { id: "demandeGarantie", label: "demande de garantie" },
        { id: "referencementFss", label: "référencement fss" },
        { id: "suiviGaranties", label: "suivi des garanties" },
      ],
    },
    {
      title: "Client",
      icon: <PersonIcon sx={{ fontSize: 15 }} />,
      actions: [
        { id: "avoirFacture", label: "Avoir sur facture/ticket" },
        { id: "avoirLibre", label: "Avoir libre" },
      ],
    },
    {
      title: "Gestion",
      icon: <DashboardIcon sx={{ fontSize: 15 }} />,
      actions: [
        { id: "inventaire", label: "inventaire" },
        { id: "inventaireArticle", label: "inventaire à l'article" },
        { id: "stock", label: "stock" },
        { id: "sortieStockNonPaye", label: "sortie stock non payé" },
        { id: "adressage", label: "adressage" },
        { id: "ruptures", label: "ruptures" },
      ],
    },
    {
      title: "Cession",
      icon: <SwapHorizIcon sx={{ fontSize: 15 }} />,
      actions: [
        { id: "expeditionCession", label: "expédition cession" },
        { id: "receptionCession", label: "réception cession" },
      ],
    },
    {
      title: "Articles ref.",
      icon: <LocalOfferIcon sx={{ fontSize: 15 }} />,
      actions: [
        { id: "marquesRef", label: "marques" },
        { id: "famillesRef", label: "familles" },
        { id: "groupesRef", label: "groupes" },
        { id: "emplacementsRef", label: "emplacements" },
        { id: "fournisseursRef", label: "fournisseurs" },
      ],
    },
  ];

  const handleDocumentCreated = async () => {};

  return (
    <>
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 3, pb: 6 }}>
        {/* Page header */}
        <Box mb={3}>
          <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
            Stock & Magasin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Actions rapides par catégorie
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {blocks.map((block, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <ActionBlock
                title={block.title}
                icon={block.icon}
                actions={block.actions}
                onActionClick={handleActionClick}
              />
            </Grid>
          ))}
        </Grid>

        <ModalManager open={open} onClose={handleClose} modalType={modalType} />
      </Box>
      <AddDocumentComponent onDocumentCreated={handleDocumentCreated} />
    </>
  );
}
