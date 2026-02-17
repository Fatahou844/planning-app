import { Container, Grid } from "@mui/material";
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
      actions: [
        { id: "searchArticle", label: "recherche article" },
        { id: "referenceArticle", label: "référencement article" },
        { id: "etiquetage", label: "étiquetage" },
      ],
    },
    {
      title: "Réception",
      actions: [
        { id: "entreeMarchandise", label: "entrée marchandise" },
        { id: "reliquats", label: "consultation reliquats" },
      ],
    },
    {
      title: "Réappros",
      actions: [
        { id: "tableauCommandes", label: "tableau des commandes" },
        { id: "propositionCommandes", label: "proposition commandes" },
        { id: "consultationResaClients", label: "consultation résa clients" },
      ],
    },
    {
      title: "Prix",
      actions: [
        { id: "modificationPrix", label: "modification prix" },
        { id: "etiquettesPrix", label: "étiquettes" },
        { id: "promoPrix", label: "promo" },
      ],
    },
    {
      title: "Fournisseurs",
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
      actions: [
        { id: "avoirFacture", label: "Avoir sur facture/ticket" },
        { id: "avoirLibre", label: "Avoir libre" },
      ],
    },
    {
      title: "Gestion",
      actions: [
        { id: "inventaire", label: "inventaire" },
        { id: "inventaireArticle", label: "inventaire à l’article" },
        { id: "stock", label: "stock" },
        { id: "sortieStockNonPaye", label: "sortie stock non payé" },
        { id: "adressage", label: "adressage" },
        { id: "ruptures", label: "ruptures" },
      ],
    },
    {
      title: "Cession",
      actions: [
        { id: "expeditionCession", label: "expédition cession" },
        { id: "receptionCession", label: "réception cession" },
      ],
    },
  ];

  const handleDocumentCreated = async () => {
    // Ici tu peux par ex :
    // - Mettre à jour ton state `ordersData` ou `events`
    // - Appeler une API
    // - Déclencher un re-render ou recalculer la semaine
  };

  return (
    <>
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {blocks.map((block, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <ActionBlock
                title={block.title}
                actions={block.actions}
                onActionClick={handleActionClick}
              />
            </Grid>
          ))}
        </Grid>

        <ModalManager open={open} onClose={handleClose} modalType={modalType} />
      </Container>
      <AddDocumentComponent
        onDocumentCreated={handleDocumentCreated}
      ></AddDocumentComponent>
    </>
  );
}
