import { Button } from "@mui/material";

import { Box, Modal, Typography } from "@mui/material";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../hooks/firebaseConfig";
import pdfMake from "./pdfMake"; // Assurez-vous de bien importer votre pdfMake configuré

const InvoiceTemplateWithoutOR2 = ({
  NewEvent,
  details,
  onInvoiceExecuted,
  closeDocumentModal,
  closeEventModal,
}) => {
  const { Client, Vehicle, date } = NewEvent;
  const [user] = useAuthState(auth);

  const [companyInfo, setCompanyInfo] = useState({
    name: "Fatah Garage",
    address: "78 Rue Freetown France",
    phone: "06 09 08 77 88",
    email: "contactgaragefatahou.com",
    website: "www.garagefatahou.com",
    userId: user?.uid,
  });

  // useEffect(() => {
  //   const fetchGarageInfo = async () => {
  //     console.log(
  //       "############################### NewEvent ######################################",
  //       NewEvent
  //     );
  //     if (!user) return;

  //     const q = query(
  //       collection(db, "garages"),
  //       where("userId", "==", user.uid)
  //     );
  //     const querySnapshot = await getDocs(q);

  //     if (!querySnapshot.empty) {
  //       const garageData = querySnapshot.docs[0].data();
  //       setCompanyInfo(garageData);
  //     }
  //   };

  //   fetchGarageInfo();
  // }, [, user]);
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
    orderNumber: NewEvent ? NewEvent.id : "",
    companyInfo: {
      name: companyInfo?.name,
      address: companyInfo?.address,
      phone: companyInfo?.phone,
      email: companyInfo?.email,
    },
    vehicle: {
      model: Vehicle?.model ? Vehicle.model : "",
      motor: "", // Si ce champ est nécessaire, il peut être rempli avec des données supplémentaires
      vin: Vehicle?.vin ? Vehicle.vin : "",
      km: Vehicle?.mileage ? Vehicle.mileage : "",
      color: Vehicle?.color ? Vehicle.color : "",
      licensePlate: Vehicle?.plateNumber ? Vehicle.plateNumber : "",
    },
    client: {
      name: `${Client?.firstName ? Client.firstName : ""} ${
        Client?.lastName ? Client.lastName : ""
      }`,
      adresse: `${Client?.address ? Client?.address : ""} ${
        Client?.postalCode ? Client.postalCode : ""
      }`, // Si une adresse client est disponible, l'ajouter ici
      phone: Client?.phone ? Client.phone : "",
      email: Client?.email ? Client.email : "",
      ville: Client?.city ? Client.city : "",
      rdv: date ? date : "", // Date de l'événement (le RDV)
    },
    items: details.map((item) => ({
      description: item.label,
      unitPriceHT: item.unitPrice / 1.2, // Calculer le prix HT à partir du TTC
      unitPriceTTC: parseFloat(item.unitPrice), // Prix TTC (déjà fourni)
      quantity: item.quantity,
      discount: item.discountPercent,
      discountAmount: item.discountAmount,
      unitPriceTTCafterDiscount:
        item.unitPrice -
        item.discountAmount -
        (item.unitPrice * item.discountPercent) / 100,
      unitPriceHTafterDiscount:
        item.unitPrice / 1.2 -
        item.discountAmount -
        (item.unitPrice * item.discountPercent) / 120,
    })),

    totals: {
      totalHT: details.reduce((acc, item) => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const discountPercent = parseFloat(item.discountPercent) || 0;
        const discountAmount = parseFloat(item.discountAmount) || 0;
        const quantity = parseFloat(item.quantity) || 1;

        const unitPriceHT = unitPrice / 1.2;
        const discountedPriceHT = Math.max(
          0,
          unitPriceHT * (1 - discountPercent / 100) -
            (discountAmount / quantity || 0)
        );

        return acc + discountedPriceHT * quantity;
      }, 0),

      tva: details.reduce((acc, item) => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const discountPercent = parseFloat(item.discountPercent) || 0;
        const discountAmount = parseFloat(item.discountAmount) || 0;
        const quantity = parseFloat(item.quantity) || 1;

        const unitPriceHT = unitPrice / 1.2;
        const discountedPriceHT = Math.max(
          0,
          unitPriceHT * (1 - discountPercent / 100) -
            (discountAmount / quantity || 0)
        );

        return acc + discountedPriceHT * quantity * 0.2;
      }, 0),

      totalTTC: details.reduce((acc, item) => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const discountPercent = parseFloat(item.discountPercent) || 0;
        const discountAmount = parseFloat(item.discountAmount) || 0;
        const quantity = parseFloat(item.quantity) || 1;

        const discountedPriceTTC = Math.max(
          0,
          unitPrice * (1 - discountPercent / 100) -
            (discountAmount / quantity || 0)
        );

        return acc + discountedPriceTTC * quantity;
      }, 0),
    },

    observations: `${details?.workDescription ? details?.workDescription : ""}`,
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
              `${item.unitPriceHT.toFixed(2)} €`,
              `${item.unitPriceTTC.toFixed(2)} €`,
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
        marginBottom: 30,
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

  // function generatePdf() {
  //   pdfMake.createPdf(documentDefinition).open();
  //   if (onInvoiceExecuted) {
  //     onInvoiceExecuted(); // Déclenche la fonction du parent
  //   }
  //   window.location.href = "/planning/categories";
  // }
  function generatePdf() {
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

    pdfDocGenerator.getBuffer((buffer) => {
      // Une fois le PDF généré, on l'ouvre
      pdfDocGenerator.open();

      // Exécute la fonction parent après génération du PDF
      if (onInvoiceExecuted) {
        onInvoiceExecuted();
      }

      // Attendre un court instant avant de rediriger
      setTimeout(() => {
        window.location.href = "/planning/categories";
      }, 1000); // Petit délai pour éviter les pages blanches
    });
  }

  // Générer le PDF

  const [openOr, setOpenOr] = useState(false);

  const handleOpenOr = () => setOpenOr(true);

  const handleCloseOr = () => setOpenOr(false);

  // Fonction pour confirmer l'action
  const handleConfirmOr = () => {
    generatePdf(); // Appel de la fonction addEvent
    closeDocumentModal();
    closeEventModal();
    handleCloseOr(); // Fermer le modal
  };

  return (
    <div>
      <Button onClick={handleOpenOr} color="primary" variant="contained">
        Imprimer Facture
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
            Voulez vous imprimer cette facture?
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
    </div>
  );
};

export default InvoiceTemplateWithoutOR2;
