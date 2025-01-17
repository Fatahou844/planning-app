import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";

import { Box, Modal, Typography } from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../hooks/firebaseConfig";
import DocumentModal from "../DocumentModal";
import Notification from "../Notification";
import pdfMake from "./pdfMake"; // Assurez-vous de bien importer votre pdfMake configuré

const InvoiceTemplate = ({
  editedEvent,
  categories,
  details,
  onInvoiceExecuted,
}) => {
  const { person, vehicule, date, title } = editedEvent;
  const [user] = useAuthState(auth);

  const calculateLineTotal = (detail) => {
    let discount = 0;

    if (detail.discountPercent > 0) {
      // Priorité au pourcentage
      discount =
        detail.unitPrice * detail.quantity * (detail.discountPercent / 100);
    } else if (detail.discountAmount > 0) {
      // Sinon, utilise le montant fixe
      discount = detail.discountAmount;
    }

    // Calcul du total après remise
    return detail.quantity * detail.unitPrice - discount;
  };
  const invoiceData = {
    orderNumber: title ? title : "",
    companyInfo: {
      name: "Garage XYZ",
      address: "123 Rue Exemple, Casablanca",
      phone: "+212 5 20 30 40 50",
      email: "contact@garagexyz.com",
    },
    vehicle: {
      model: vehicule?.model ? vehicule.model : "",
      motor: "", // Si ce champ est nécessaire, il peut être rempli avec des données supplémentaires
      vin: vehicule?.vin ? vehicule.vin : "",
      km: vehicule?.kms ? vehicule.kms : "",
      color: vehicule?.color ? vehicule.color : "",
      licensePlate: vehicule?.licensePlate ? vehicule.licensePlate : "",
    },
    client: {
      name: `${person?.firstName ? person.firstName : ""} ${
        person?.lastName ? person.lastName : ""
      }`,
      adresse: `${person?.adresse ? person?.adresse : ""} ${
        person?.postale ? person.postale : ""
      }`, // Si une adresse client est disponible, l'ajouter ici
      phone: person?.phone ? person.phone : "",
      email: person?.email ? person.email : "",
      rdv: date ? date : "", // Date de l'événement (le RDV)
      ville: person?.ville ? person?.ville : "",
    },
    items: details.map((item) => ({
      description: item.label,
      unitPriceHT: item.unitPrice / 1.2, // Calculer le prix HT à partir du TTC
      unitPriceTTC: item.unitPrice, // Prix TTC (déjà fourni)
      quantity: item.quantity,
      discount: item.discountPercent,
      discountAmount: item.discountAmount,
    })),
    totals: {
      // Total HT avec remises
      totalHT: details.reduce(
        (sum, detail) => sum + calculateLineTotal(detail) / 1.2,
        0
      ),
      // TVA (20% du total HT avec remises)
      tva: details.reduce(
        (sum, detail) =>
          sum + calculateLineTotal(detail) - calculateLineTotal(detail) / 1.2,
        0
      ),
      // Total TTC avec remises
      totalTTC: details.reduce(
        (sum, detail) => sum + calculateLineTotal(detail),
        0
      ),
    },
    observations: `${editedEvent.details.workDescription}`,
  };

  const documentDefinition = {
    content: [
      // Header avec numéro de facture et date
      {
        table: {
          widths: ["50%", "50%"],
          body: [
            [
              {
                text: `Facture No : ${invoiceData?.orderNumber}`,
                style: "headerInfo",
                alignment: "left",
              },
              {
                text: `Date de facture : ${new Date().toLocaleDateString()}`,
                style: "headerInfo",
                alignment: "right",
              },
            ],
          ],
        },
        layout: "noBorders",
        marginBottom: 20,
      },

      // Header avec trois colonnes : entreprise, véhicule, client
      {
        table: {
          widths: ["33%", "33%", "33%"],
          body: [
            [
              {
                text: invoiceData.companyInfo.name,
                style: "companyHeader",
                alignment: "center",
              },
              {
                text: "",
                style: "vehicleHeader",
                alignment: "center",
              },
              {
                text: "",
                style: "clientHeader",
                alignment: "center",
              },
            ],
            [
              {
                text: invoiceData.companyInfo.address,
                style: "companySubheader",
                alignment: "center",
              },
              {
                text: `Modèle : ${invoiceData.vehicle.model}`,
                style: "vehicleInfo",
                alignment: "center",
              },
              {
                text: `nom : ${invoiceData.client.name}`,
                style: "clientInfo",
                alignment: "center",
              },
            ],
            [
              {
                text: invoiceData.companyInfo.phone,
                style: "companySubheader",
                alignment: "center",
              },
              {
                text: `VIN : ${invoiceData.vehicle.vin}`,
                style: "vehicleInfo",
                alignment: "center",
              },
              {
                text: `Tel: ${invoiceData.client.phone}`,
                style: "clientInfo",
                alignment: "center",
              },
            ],
            [
              {
                text: invoiceData.companyInfo.email,
                style: "companySubheader",
                alignment: "center",
              },
              {
                text: `Kilométrage : ${invoiceData.vehicle.km} km`,
                style: "vehicleInfo",
                alignment: "center",
              },
              {
                text: `Email : ${invoiceData.client.email}`,
                style: "clientInfo",
                alignment: "center",
              },
            ],
            [
              {
                text: " ",
                style: "companySubheader",
                alignment: "center",
              },
              {
                text: `Immatriculation : ${
                  invoiceData.vehicle.licensePlate || ""
                }`,
                style: "vehicleInfo",
                alignment: "center",
              },
              {
                text: `Adresse : ${
                  invoiceData.client?.adresse ? invoiceData.client?.adresse : ""
                } ${
                  invoiceData.client?.postale ? invoiceData.client?.postale : ""
                }`,
                style: "clientInfo",
                alignment: "center",
              },
            ],
            [
              {
                text: " ",
                style: "companySubheader",
                alignment: "center",
              },
              {
                text: `Couleur : ${invoiceData.vehicle.color}`,
                style: "vehicleInfo",
                alignment: "center",
              },
              {
                text: `Ville : ${
                  invoiceData.client?.ville ? invoiceData.client?.ville : ""
                }`,
                style: "clientInfo",
                alignment: "center",
              },
            ],
            // [
            //   {
            //     text: " ",
            //     style: "companySubheader",
            //     alignment: "center",
            //   },
            //   {
            //     text: " ",
            //     style: "vehicleInfo",
            //     alignment: "center",
            //   },
            //   {
            //     text: `RDV : ${invoiceData.client.rdv}`,
            //     style: "clientInfo",
            //     alignment: "center",
            //   },
            // ],
          ],
        },
        layout: "noBorders",
        marginBottom: 20,
      },

      // Tableau des Items
      {
        table: {
          widths: ["*", "auto", "auto", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "Libellé / travaux", style: "tableHeader" },
              { text: "P.U. HT", style: "tableHeader" },
              { text: "P.U. TTC", style: "tableHeader" },
              { text: "Qté", style: "tableHeader" },
              { text: "Total HT", style: "tableHeader" },
              { text: "Total TTC", style: "tableHeader" },
              { text: "Rem", style: "tableHeader" },
            ],
            ...invoiceData.items.map((item) => [
              item.description,
              `${item.unitPriceHT?.toFixed(2)} €`,
              `${item.unitPriceTTC?.toFixed(2)} €`,
              item.quantity,
              {
                text: `${(item.unitPriceHT * item.quantity).toFixed(2)} €`,
                alignment: "right",
              },
              {
                text: `${(item.unitPriceTTC * item.quantity).toFixed(2)} €`,
                alignment: "right",
              },
              `${
                item.discount > 0
                  ? item.discount + "%"
                  : item.discountAmount + "€"
              }`,
            ]),
          ],
        },
        layout: "lightHorizontalLines",
        marginBottom: 20,
        alignment: "center",
      },

      // Totaux
      {
        table: {
          widths: ["*", "auto"],
          body: [
            [
              { text: "Total HT :", alignment: "right", style: "totalLabel" },
              {
                text: `${invoiceData.totals.totalHT.toFixed(2)} €`,
                alignment: "right",
                style: "totalValue",
              },
            ],
            [
              { text: "TVA (20%) :", alignment: "right", style: "totalLabel" },
              {
                text: `${invoiceData.totals.tva.toFixed(2)} €`,
                alignment: "right",
                style: "totalValue",
              },
            ],
            [
              { text: "Total TTC :", alignment: "right", style: "totalLabel" },
              {
                text: `${invoiceData.totals.totalTTC.toFixed(2)} €`,
                alignment: "right",
                style: "totalValue",
              },
            ],
          ],
        },
        layout: "noBorders",
        marginBottom: 20,
      },

      // Observations
      {
        text: "Observations et conseils :",
        style: "sectionHeader",
      },
      {
        text: invoiceData.observations,
        style: "subheader",
      },

      // Zone Rectangulaire pour Détails
      {
        table: {
          widths: ["100%"],
          body: [
            [
              {
                text: "",
                style: "rectangle",
                border: [true, true, true, true], // Bordures pour la zone
                marginBottom: 10,
                marginTop: 10,
              },
            ],
          ],
        },
        layout: "noBorders",
        marginBottom: 10,
      },

      // Paragraphe
      {
        text: "Je suis informé(e) des conditions générales de réparations figurant au verso et les acceptes sans réserve. Conformément à la législation en vigueur, le client a la possibilité de s'inscrire sur la liste d'opposition au démarchage téléphonique à l'adresse suivante : https//www.bloctel.gouv.fr/",
        style: "paragraph",
        alignment: "justify",
      },

      // Signatures
      {
        table: {
          widths: ["50%", "50%"],
          body: [
            [
              {
                text: " ",
                style: "signature",
                alignment: "left",
              },
              {
                text: " ",
                style: "signature",
                alignment: "right",
              },
            ],
          ],
        },
        layout: "noBorders",
        marginTop: 20,
      },

      // Footer avec date et message
      {
        text: `Fait le : ${new Date().toLocaleDateString()}`,
        style: "footer",
        alignment: "right",
        marginBottom: 5,
      },
      {
        text: "Merci pour votre confiance",
        style: "footer",
        alignment: "right",
      },
    ],

    styles: {
      headerInfo: {
        fontSize: 10,
        bold: true,
        marginBottom: 10,
      },
      companyHeader: {
        fontSize: 14,
        bold: true,
        color: "#2A4D76",
        marginBottom: 5,
      },
      companySubheader: {
        fontSize: 10,
        color: "#555",
        marginBottom: 5,
      },
      vehicleHeader: {
        fontSize: 12,
        bold: true,
        color: "#6D8B8B",
        marginBottom: 5,
      },
      vehicleInfo: {
        fontSize: 10,
        color: "#444",
        marginBottom: 5,
      },
      clientHeader: {
        fontSize: 12,
        bold: true,
        color: "#8D4B4B",
        marginBottom: 5,
      },
      clientInfo: {
        fontSize: 10,
        color: "#444",
        marginBottom: 5,
      },
      tableHeader: {
        bold: true,
        fillColor: "#F1F1F1",
        alignment: "center",
        padding: 5,
      },
      totalLabel: {
        fontSize: 10,
        bold: true,
      },
      totalValue: {
        fontSize: 10,
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        marginTop: 10,
        marginBottom: 5,
      },
      subheader: {
        fontSize: 10,
        marginBottom: 5,
      },
      signature: {
        textAlign: "center",
        paddingTop: 10,
        fontSize: 10,
      },
      footer: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 10,
        color: "#888",
      },
      rectangle: {
        fontSize: 10,
        color: "#000",
        padding: 10,
        height: 50,
      },
      paragraph: {
        fontSize: 9,
        color: "#555",
        marginTop: 10,
        lineHeight: 1.3,
      },
    },
  };

  function generatePdf() {
    pdfMake.createPdf(documentDefinition).open();
    if (onInvoiceExecuted) {
      onInvoiceExecuted(); // Déclenche la fonction du parent
    }
  }

  const [facture, setFacture] = useState(null);
  const [factureId, setFactureId] = useState(null);

  // Générer le PDF
  const [openOr, setOpenOr] = useState(false);

  const handleOpenOr = () => setOpenOr(true);

  const handleCloseOr = () => setOpenOr(false);
  const addSingleReservation = async (
    event,
    newOrderNumber,
    collectionName,
    isClosed
  ) => {
    try {
      const eventRef = doc(collection(db, collectionName)); // Crée une référence à un nouveau document

      await setDoc(eventRef, {
        eventId: eventRef.id,
        title: newOrderNumber, // Utilise le numéro de commande fourni
        date: event.date,
        person: {
          firstName: event.person.firstName,
          lastName: event.person.lastName,
          email: event.person.email,
          phone: event.person.phone,
          adresse: event.person.adresse ? event.person.adresse : "",
          postale: event.person.postale ? event.person.postale : "",
          ville: event.person.ville ? event.person.ville : "",
        },
        vehicule: {
          licensePlate: event.vehicule.licensePlate
            ? event.vehicule.licensePlate
            : "",
          vin: event.vehicule.vin ? event.vehicule.vin : "",
          color: event.vehicule.color ? event.vehicule.color : "",
          model: event.vehicule.model ? event.vehicule.model : "",
          kms: event.vehicule.kms ? event.vehicule.kms : "",
          controletech: event.vehicule.controletech
            ? event.vehicule.controletech
            : "",
        },
        details: {
          workDescription: event.details.workDescription
            ? event.details.workDescription
            : "",
          price: event.details.price ? event.details.price : "",
        },
        isClosed: isClosed,
        userId: event.userId, // UID de l'utilisateur
        ordreReparation: editedEvent.id ? editedEvent.id : "",
      });

      console.log("eventRef", event);

      // Mettre à jour le dernier numéro de commande utilisé pour cet utilisateur
      await updateLastOrderNumberForUser(
        event.userId,
        parseInt(newOrderNumber)
      );
      return eventRef; // Retourner la référence du document
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const addEventDetailsGeneric = async (eventId, details, collectionName) => {
    try {
      const batch = writeBatch(db); // Crée un batch pour les opérations

      // Référence directe au document de l'événement avec l'ID existant
      const eventRef = doc(db, collectionName, eventId);

      // Filtre les détails valides (exclut ceux où tous les champs sont vides ou non valides)
      const validDetails = details.filter((detail) => {
        return (
          detail.label?.trim() ||
          detail.quantity?.toString().trim() ||
          detail.unitPrice?.toString().trim() ||
          detail.discountPercent?.toString().trim() ||
          detail.discountAmount?.toString().trim()
        );
      });

      console.log("##############lidDetails####################", validDetails);

      // Si aucun détail valide, on sort sans erreur
      if (validDetails.length === 0) {
        console.log("Aucun détail valide à enregistrer.");
        return;
      }

      // Boucle sur chaque détail filtré et ajout à la sous-collection "details" de cet événement
      for (const detail of validDetails) {
        const detailRef = doc(collection(eventRef, "details")); // Crée un nouveau document dans "details"
        batch.set(detailRef, {
          label: detail.label || "",
          quantity: detail.quantity || 0,
          unitPrice: detail.unitPrice || 0,
          discountPercent: detail.discountPercent || 0,
          discountAmount: detail.discountAmount || 0,
        });
      }

      // Engager toutes les écritures dans le batch
      await batch.commit();

      console.log("Détails ajoutés avec succès à l'événement");
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout des détails à l'événement : ",
        error
      );
    }
  };

  const getLastOrderNumberForUser = async (userId) => {
    const docRef = doc(db, "userOrderNumbers", userId); // Document unique pour chaque userId
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().lastOrderNumber; // Récupère le dernier numéro
    } else {
      // Si le document n'existe pas encore, on commence à 00000 pour cet utilisateur
      return 0;
    }
  };

  // Fonction pour mettre à jour le dernier numéro de commande pour un userId
  const updateLastOrderNumberForUser = async (userId, newOrderNumber) => {
    const docRef = doc(db, "userOrderNumbers", userId); // Document unique par userId
    await setDoc(docRef, { lastOrderNumber: newOrderNumber, userId: userId }); // Met à jour ou crée le document
  };

  // Fonction pour générer un numéro de commande formaté à 5 chiffres
  const generateOrderNumber = (lastOrderNumber) => {
    const newOrderNumber = lastOrderNumber + 1;
    return newOrderNumber.toString().padStart(5, "0"); // Format à 5 chiffres
  };

  const addFacture = async () => {
    // Ajout du paramètre isMultiDay
    if (!user) {
      console.error("User not authenticated");
      return; // Sortir si l'utilisateur n'est pas connecté
    }

    const userId = user.uid; // UID de l'utilisateur connecté

    // Générer le numéro de commande une seule fois pour l'événement (ou son ensemble)
    const lastOrderNumber = await getLastOrderNumberForUser(userId);
    const newOrderNumber = generateOrderNumber(lastOrderNumber);

    // Si l'événement ne couvre qu'une seule journée, ou si isMultiDay est faux
    const singleResa = {
      ...editedEvent,
      userId: userId,
      title: newOrderNumber, // Utiliser le numéro de commande
      nextDay: false,
    };
    const singleResaDocRef = await addSingleReservation(
      singleResa,
      newOrderNumber,
      "factures",
      true
    ); // Ajout à Firestore
    const validDetails = details.filter((detail) => {
      return (
        detail.label?.trim() ||
        detail.quantity?.toString().trim() ||
        detail.unitPrice?.toString().trim() ||
        detail.discountPercent?.toString().trim() ||
        detail.discountAmount?.toString().trim()
      );
    });

    console.log("singleResaDocRef", singleResaDocRef);

    if (validDetails.length)
      await addEventDetailsGeneric(singleResaDocRef.id, details, "factures"); // Enregistrer les détails

    // Mettre à jour le dernier numéro de commande utilisé pour cet utilisateur
    await updateLastOrderNumberForUser(userId, parseInt(newOrderNumber));
    setNotification({
      open: true,
      message: "Facture " + newOrderNumber + " crée",
      severity: "success", // Peut être "error", "warning", "info"
    });
    // Récupérer la facture depuis Firestore
    if (singleResaDocRef) {
      const fact = await getFactureById(singleResaDocRef.id, "factures");
      setFacture(fact);
    }

    console.log("Facture récupérée :", facture);
  };

  // const getFactureById = async (factureId, collectionName) => {
  //   console.log("factureId", factureId);
  //   if (!collectionName || !factureId) {
  //     console.error("Paramètres manquants :", { collectionName, factureId });
  //     throw new Error(
  //       "Veuillez fournir un ID de facture valide et un nom de collection."
  //     );
  //   }
  //   const docRef = collection(db, collectionName).doc(factureId);
  //   const doc = await docRef.get();
  //   if (doc.exists) {
  //     return { id: doc.id, ...doc.data() };
  //   } else {
  //     throw new Error("Facture introuvable !");
  //   }
  // };

  const getFactureById = async (factureId, collectionName) => {
    if (!collectionName) {
      throw new Error("Nom de la collection non fourni !");
    }

    if (!factureId) {
      throw new Error("ID de la facture non fourni !");
    }

    try {
      // Créer une référence au document
      const docRef = doc(collection(db, collectionName), factureId);

      // Récupérer les données du document
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setModalOpen2(true);
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error("Facture introuvable !");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la facture :", error);
      throw error;
    }
  };
  // // Fonction pour confirmer l'action
  const handleConfirmOr = () => {
    // generatePdf(); // Appel de la fonction addEvent
    addFacture();
    handleShowPopup();
    handleCloseOr(); // Fermer le modal
  };

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [showPopup, setShowPopup] = useState(false);

  const handleShowPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    console.log("fermeture du popup");
  };

  useEffect(() => {
    setFacture(facture);
  }, [facture]);
  const [modalOpen2, setModalOpen2] = useState(false);

  const handleModalClose2 = () => {
    setModalOpen2(false);
    console.log("modalOpen2", modalOpen2);
  };

  const handleEditedEventChange = (updatedEvent) => {
    setFacture(updatedEvent);
  };

  return (
    <div>
      {showPopup && facture && (
        <Notification
          message={notification.message}
          handleClose={handleClosePopup}
          collectionName="factures"
          dataEvent={facture}
          dataDetails={details}
        />
      )}
      <Button onClick={handleOpenOr} color="primary" variant="contained">
        Facture
      </Button>
      <Modal
        open={openOr}
        onClose={handleCloseOr}
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="confirmation-modal-description" sx={{ mt: 2, mb: 4 }}>
            Voulez vous créer une facture?
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseOr}
            >
              Non
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmOr}
            >
              Oui
            </Button>
          </Box>
        </Box>
      </Modal>
      {facture && (
        <DocumentModal
          open={modalOpen2}
          onClose={handleModalClose2}
          editedEvent={facture}
          setEditedEvent={handleEditedEventChange}
          collectionName={"factures"}
          categories={categories}
        />
      )}
    </div>
  );
};

export default InvoiceTemplate;
