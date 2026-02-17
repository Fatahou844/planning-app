import { Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import ReferenceArticleModal from "../ReferenceArticleModal";

export default function ModalManager({ open, onClose, modalType }) {
  const renderContent = () => {
    switch (modalType) {
      // ARTICLE
      case "searchArticle":
        return <Typography>Recherche d’article</Typography>;

      case "referenceArticle":
        return <ReferenceArticleModal open={open} onClose={onClose} />;

      case "etiquetage":
        return <Typography>Module d’étiquetage</Typography>;

      // RÉCEPTION
      case "entreeMarchandise":
        return <Typography>Entrée de marchandise</Typography>;

      case "reliquats":
        return <Typography>Consultation des reliquats</Typography>;

      // RÉAPPROS
      case "tableauCommandes":
        return <Typography>Tableau des commandes</Typography>;

      case "propositionCommandes":
        return <Typography>Proposition de commandes</Typography>;

      case "consultationResaClients":
        return <Typography>Consultation des réservations clients</Typography>;

      // PRIX
      case "modificationPrix":
        return <Typography>Modification des prix</Typography>;

      case "etiquettesPrix":
        return <Typography>Impression des étiquettes</Typography>;

      case "promoPrix":
        return <Typography>Gestion des promotions</Typography>;

      // FOURNISSEURS
      case "historiqueCommandesFss":
        return <Typography>Historique des commandes fournisseurs</Typography>;

      case "demandeRetourFss":
        return <Typography>Demande de retour fournisseur</Typography>;

      case "consultationFss":
        return <Typography>Consultation fournisseur</Typography>;

      case "demandeGarantie":
        return <Typography>Demande de garantie</Typography>;

      case "referencementFss":
        return <Typography>Référencement fournisseur</Typography>;

      case "suiviGaranties":
        return <Typography>Suivi des garanties</Typography>;

      // CLIENT
      case "avoirFacture":
        return <Typography>Avoir sur facture / ticket</Typography>;

      case "avoirLibre":
        return <Typography>Avoir libre</Typography>;

      // GESTION
      case "inventaire":
        return <Typography>Inventaire</Typography>;

      case "inventaireArticle":
        return <Typography>Inventaire à l’article</Typography>;

      case "stock":
        return <Typography>Consultation du stock</Typography>;

      case "sortieStockNonPaye":
        return <Typography>Sortie de stock non payée</Typography>;

      case "adressage":
        return <Typography>Adressage des emplacements</Typography>;

      case "ruptures":
        return <Typography>Gestion des ruptures</Typography>;

      // CESSION
      case "expeditionCession":
        return <Typography>Expédition de cession</Typography>;

      case "receptionCession":
        return <Typography>Réception de cession</Typography>;

      default:
        return <Typography>Module non défini</Typography>;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Module</DialogTitle>
      <DialogContent>{renderContent()}</DialogContent>
    </Dialog>
  );
}
