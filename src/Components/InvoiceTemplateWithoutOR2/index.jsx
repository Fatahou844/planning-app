import { Button } from "@mui/material";

import { Box, Modal, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../hooks/firebaseConfig";
import { useAxios } from "../../utils/hook/useAxios";
import pdfMake from "./pdfMake"; // Assurez-vous de bien importer votre pdfMake configuré

const InvoiceTemplateWithoutOR2 = ({
  NewEvent,
  details,
  onInvoiceExecuted,
  closeDocumentModal,
  closeEventModal,
}) => {
  const { Client, Vehicle, date, deposit } = NewEvent;
  const [user] = useAuthState(auth);
  const axios = useAxios();

  const [companyInfo, setCompanyInfo] = useState({
    name: "Fatah Garage",
    address: "78 Rue Freetown France",
    phone: "06 09 08 77 88",
    email: "contactgaragefatahou.com",
    website: "www.garagefatahou.com",
    userId: user?.uid,
  });

  const [logoBase64, setLogoBase64] = useState(null);

  useEffect(() => {
    if (companyInfo?.logo) {
      toBase64(companyInfo.logo).then((base64) => {
        setLogoBase64(base64);
      });
    }
  }, [companyInfo]);

  function toBase64(url) {
    return fetch(url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
  }

  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  useEffect(() => {
    const fetchGarageInfo = async () => {
      const response = await axios.get(
        "/garages/userid/" + getCurrentUser().garageId
      );
      setCompanyInfo(response.data.data);
    };

    fetchGarageInfo();
  }, [, user]);

  const invoiceData = {
    orderNumber: NewEvent ? NewEvent.id : "",
    deposit: deposit,
    companyInfo: {
      name: companyInfo?.name,
      address: companyInfo?.address,
      phone: companyInfo?.phone,
      email: companyInfo?.email,
      codePostal: companyInfo?.codePostal,
      ville: companyInfo?.ville,
    },
    vehicle: {
      model: Vehicle?.model ? Vehicle.model : "",
      motor: "", // Si ce champ est nécessaire, il peut être rempli avec des données supplémentaires
      vin: Vehicle?.vin ? Vehicle.vin : "",
      km: Vehicle?.mileage ? Vehicle.mileage : "",
      color: Vehicle?.color ? Vehicle.color : "",
      licensePlate: Vehicle?.plateNumber ? Vehicle.plateNumber : "",
      lastCheck: Vehicle?.lastCheck ? Vehicle?.lastCheck : "",
    },
    client: {
      name: `${Client?.firstName ? Client.firstName : ""} ${
        Client?.lastName ? Client.lastName : ""
      }`,
      adresse: `${Client?.address ? Client?.address : ""}`, // Si une adresse client est disponible, l'ajouter ici
      phone: Client?.phone ? Client.phone : "",
      email: Client?.email ? Client.email : "",
      ville: Client?.city ? Client.city : "",
      rdv: date ? date : "", // Date de l'événement (le RDV)
      postalVille: `${Client?.postalCode ? Client?.postalCode : ""} ${
        Client?.city ? Client.city : ""
      }`,
    },
    items: details.map((item) => ({
      description: item.label,
      unitPriceHT: item.unitPrice / 1.2, // Calculer le prix HT à partir du TTC
      unitPriceTTC: parseFloat(item.unitPrice), // Prix TTC (déjà fourni)
      quantity: item.quantity,

      discount:
        item.discountPercent && item.discountPercent !== ""
          ? `${item.discountPercent}%`
          : item.discountAmount && item.discountAmount !== ""
          ? String(item.discountAmount)
          : "0",
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

    observations: `${NewEvent?.notes ? NewEvent?.notes : ""}`,
    invoiceDate: `${
      NewEvent?.createdAt
        ? new Date(NewEvent?.createdAt).toLocaleDateString("fr-FR")
        : ""
    }`,
  };

  const documentDefinition = {
    content: [
      // HEADER
      {
        table: {
          widths: ["50%", "50%"],
          body: [
            [
              // Colonne gauche : Date + lien logo
              {
                stack: [
                  {
                    text: `Le : ${invoiceData?.invoiceDate || ""}`,
                    style: "headerSub",
                    alignment: "left",
                    marginBottom: 3,
                  },
                  {
                    image: logoBase64, // on récupère directement le state
                    width: 80,
                    alignment: "left",
                  },
                ],
                border: [false, false, false, false],
              },

              // Colonne droite : Titre + QR Code
              {
                stack: [
                  {
                    text: `FACTURE N° ${invoiceData?.orderNumber}`,
                    style: "headerTitle",
                    alignment: "right",
                    marginBottom: 3,
                  },
                  {
                    qr: `OR:${invoiceData?.orderNumber || "0000"} | Fin:${
                      invoiceData?.date || ""
                    } | Client:${invoiceData?.client?.name || ""}`,
                    fit: 70,
                    alignment: "right",
                  },
                ],
                border: [false, false, false, false],
              },
            ],
          ],
        },
        layout: "noBorders",
        marginBottom: 20,
      },

      // BLOCS ENTREPRISE / VEHICULE / CLIENT
      {
        columns: [
          // ENTREPRISE
          {
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 0,
                    y: 0,
                    w: 160, // largeur colonne (ajuste si besoin)
                    h: 120,
                    r: 8,
                    lineColor: "#cccccc",
                    color: "#f9f9f9",
                  },
                ],
              },
              {
                table: {
                  widths: ["*"],
                  body: [
                    [
                      {
                        stack: [
                          {
                            text: invoiceData.companyInfo.name,
                            style: "infoBlock",
                          },
                          {
                            text: invoiceData.companyInfo.address,
                            style: "infoBlock",
                          },
                          {
                            text: invoiceData.companyInfo.phone,
                            style: "infoBlock",
                          },
                          {
                            text: invoiceData.companyInfo.email,
                            style: "infoBlock",
                          },
                          {
                            text:
                              invoiceData.companyInfo.codePostal +
                              " " +
                              invoiceData.companyInfo.ville,
                            style: "infoBlock",
                            alignment: "center",
                          },
                        ],
                        margin: [8, 6, 8, 6],
                      },
                    ],
                  ],
                },
                layout: "noBorders",
                margin: [-1, -118, 0, 0], // superposé sur le rectangle
              },
            ],
          },

          // VEHICULE
          {
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 0,
                    y: 0,
                    w: 160,
                    h: 120,
                    r: 8,
                    lineColor: "#cccccc",
                    color: "#f9f9f9",
                  },
                ],
              },
              {
                table: {
                  widths: ["*"],
                  body: [
                    [
                      {
                        stack: [
                          {
                            text: `${invoiceData.vehicle.model} - ${
                              invoiceData.vehicle.engine || ""
                            }`,
                            style: "infoBlock",
                          },
                          {
                            text: `VIN : ${invoiceData.vehicle.vin}`,
                            style: "infoBlock",
                          },
                          {
                            text: `Km : ${invoiceData.vehicle.km} km`,
                            style: "infoBlock",
                          },
                          {
                            text: `Immat : ${
                              invoiceData.vehicle.licensePlate || ""
                            }`,
                            style: "infoBlock",
                          },
                          {
                            text: `Couleur : ${invoiceData.vehicle.color}`,
                            style: "infoBlock",
                          },
                        ],
                        margin: [8, 6, 8, 6],
                      },
                    ],
                  ],
                },
                layout: "noBorders",
                margin: [-1, -118, 0, 0],
              },
            ],
          },

          // CLIENT
          {
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 0,
                    y: 0,
                    w: 160,
                    h: 120,
                    r: 8,
                    lineColor: "#cccccc",
                    color: "#f9f9f9",
                  },
                ],
              },
              {
                table: {
                  widths: ["*"],
                  body: [
                    [
                      {
                        stack: [
                          { text: invoiceData.client.name, style: "infoBlock" },
                          {
                            text: `${invoiceData.client?.adresse || ""}`,
                            style: "infoBlock",
                          },
                          {
                            text: `${invoiceData.client?.postalVille || ""}`,
                            style: "infoBlock",
                            alignment: "center",
                          },
                          {
                            text: invoiceData.client.phone,
                            style: "infoBlock",
                          },
                          {
                            text: invoiceData.client.email,
                            style: "infoBlock",
                          },
                        ],
                        margin: [8, 6, 8, 6],
                      },
                    ],
                  ],
                },
                layout: "noBorders",
                margin: [-1, -118, 0, 0],
              },
            ],
          },
        ],
        columnGap: 8,
        margin: [0, 0, 0, 45], // <<--- marge en bas ajoutée ici
      },

      // TABLEAU ITEMS
      {
        table: {
          widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "Code", style: "tableHeader" },
              { text: "Libellé / Travaux", style: "tableHeader" },
              { text: "P.U. HT", style: "tableHeader" },
              { text: "P.U. TTC", style: "tableHeader" },
              { text: "Qté", style: "tableHeader" },
              { text: "Total HT", style: "tableHeader" },
              { text: "Total TTC", style: "tableHeader" },
              { text: "Remise", style: "tableHeader" },
            ],
            ...invoiceData.items.map((item) => [
              { text: item.code || "---", style: "tableCell" }, // Code
              { text: item.description, style: "tableCell" }, // Libellé
              { text: `${item.unitPriceHT?.toFixed(2)} €`, style: "smallCell" }, // P.U. HT
              {
                text: `${item.unitPriceTTC?.toFixed(2)} €`,
                style: "smallCell",
              }, // P.U. TTC
              { text: item.quantity, style: "smallCell" }, // Qté
              {
                text: `${(item.unitPriceHT * item.quantity).toFixed(2)} €`,
                alignment: "right",
                style: "tableCell",
              }, // Total HT
              {
                text: `${(item.unitPriceTTC * item.quantity).toFixed(2)} €`,
                alignment: "right",
                style: "tableCell",
              }, // Total TTC
              {
                text: `${item.discount}`,
                alignment: "right",
                style: "tableCell",
              }, // Remise
            ]),
          ],
        },
        layout: "lightHorizontalLines",
        marginBottom: 20,
      },

      // TOTAUX
      {
        table: {
          widths: ["50%", "50%"],
          body: [
            [
              {
                stack: [
                  {
                    text: `Total HT : ${invoiceData.totals.totalHT.toFixed(
                      2
                    )} €`,
                    alignment: "right",
                    style: "totalLabel",
                  },
                  {
                    text: `TVA (20%) : ${invoiceData.totals.tva.toFixed(2)} €`,
                    alignment: "right",
                    style: "totalLabel",
                  },
                ],
                fillColor: "#f5f5f5",
              },
              {
                text: `Total Net TTC : ${invoiceData.totals.totalTTC.toFixed(
                  2
                )} €`,
                alignment: "right",
                style: "totalLabel",
                fillColor: "#f5f5f5",
              },
            ],
            [
              {
                text: "",
                border: [false, false, false, false],
                fillColor: "#f5f5f5",
              },
              {
                text: `Acompte versé : ${Number(
                  invoiceData?.deposit || 0
                ).toFixed(2)} €`,
                alignment: "right",
                style: "totalLabel",
                fillColor: "#f5f5f5",
              },
            ],
          ],
        },
        layout: "lightHorizontalLines",
        marginBottom: 20,
      },

      // OBSERVATIONS
      { text: "Observations et conseils :", style: "sectionHeader" },
      {
        text: invoiceData.observations || "",
        style: "subheader",
        marginBottom: 10,
      },

      // NOTES EXPLICATIVES
      {
        text: companyInfo.noteLegal,
        style: "paragraph",
        alignment: "justify",
        marginBottom: 15,
      },
    ],

    footer: function (currentPage, pageCount) {
      return {
        text: "MERCI DE VOTRE CONFIANCE.",
        style: "signature",
        alignment: "center",
        margin: [0, 0, 0, 10], // marge par rapport au bas
      };
    },

    styles: {
      headerTitle: { fontSize: 12, bold: true },
      headerSub: { fontSize: 8, italics: true },
      infoCard: {
        margin: [0, 0, 0, 0],
        fillColor: "#f9f9f9",
        padding: 5,
      },
      infoBlock: { fontSize: 9, alignment: "center", margin: [0, 2, 0, 4] },
      tableHeader: {
        bold: true,
        alignment: "center",
        fontSize: 8,
        fillColor: "#eeeeee",
        margin: [2, 2, 2, 2],
      },
      tableCell: { fontSize: 8 },
      smallCell: { fontSize: 8 },
      totalLabel: { fontSize: 8, bold: true },
      sectionHeader: { fontSize: 9, bold: true, marginTop: 8, marginBottom: 4 },
      subheader: { fontSize: 8, marginBottom: 4 },
      signature: { fontSize: 8, marginTop: 12 },
      footer: { fontSize: 8, italics: true, marginTop: 8 },
      paragraph: { fontSize: 7, lineHeight: 1.1 },
    },
  };

  function generatePdf() {
    const fileName = `Facture_${invoiceData.orderNumber}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    pdfMake.createPdf(documentDefinition).download(fileName);
    if (onInvoiceExecuted) {
      onInvoiceExecuted(); // Déclenche la fonction du parent
    }

    //   setTimeout(() => {
    //     window.location.href = "/planning/categories";
    //   }, 5000); // Petit délai pour éviter les pages blanches
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
