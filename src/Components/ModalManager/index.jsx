import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReferenceArticleModal from "../ReferenceArticleModal";
import { useArticleSearch } from "../UserArticleSearch";
import Stock from "../../Pages/Stock";
import { TabMarques } from "../../Pages/AdminStock";

export default function ModalManager({ open, onClose, modalType }) {
  const { SearchDialogs } = useArticleSearch(
    modalType === "searchArticle" ? { open, onClose } : {}
  );

  // Pour searchArticle, les dialogs gèrent eux-mêmes leur ouverture
  if (modalType === "searchArticle") {
    return <SearchDialogs />;
  }

  const renderContent = () => {
    switch (modalType) {
      // ARTICLE
      case "searchArticle": {
        return <SearchDialogs />;
      }

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

      // ARTICLES REF.
      case "groupesRef":
        return <Stock />;

      default:
        return <Typography>Module non défini</Typography>;
    }
  };

  if (modalType === "marquesRef") {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Marques
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TabMarques />
        </DialogContent>
      </Dialog>
    );
  }

  if (modalType === "groupesRef") {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Groupes &amp; Familles d'articles
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stock />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Module</DialogTitle>
      <DialogContent>{renderContent()}</DialogContent>
    </Dialog>
  );
}
