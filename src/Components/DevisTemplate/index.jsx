import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../hooks/firebaseConfig";
import { useAxios } from "../../utils/hook/useAxios";
import pdfMake from "./pdfMake"; // Assurez-vous de bien importer votre pdfMake configuré

const DevisTemplate = ({
  editedEvent,
  details,
  onInvoiceExecuted,
  closeNotification,
}) => {
  const { Client, Vehicle, date, deposit } = editedEvent;

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
  const addDays = (dateString, days) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("fr-FR"); // ou retourne l'objet `date` directement si besoin
  };
  const invoiceData = {
    orderNumber: editedEvent ? editedEvent.id : "",
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
      name: `${Client?.name ? Client.name : ""} ${
        Client?.firstName ? Client.firstName : ""
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
          : item.discountValue && item.discountValue !== ""
          ? String(item.discountValue)
          : "0",
      discountValue: item.discountValue,
      unitPriceTTCafterDiscount:
        item.unitPrice -
        item.discountValue -
        (item.unitPrice * item.discountPercent) / 100,
      unitPriceHTafterDiscount:
        item.unitPrice / 1.2 -
        item.discountValue -
        (item.unitPrice * item.discountPercent) / 120,
    })),

    totals: {
      totalHT: details.reduce((acc, item) => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const discountPercent = parseFloat(item.discountPercent) || 0;
        const discountValue = parseFloat(item.discountValue) || 0;
        const quantity = parseFloat(item.quantity) || 1;

        const unitPriceHT = unitPrice / 1.2;
        const discountedPriceHT = Math.max(
          0,
          unitPriceHT * (1 - discountPercent / 100) -
            (discountValue / quantity || 0)
        );

        return acc + discountedPriceHT * quantity;
      }, 0),

      tva: details.reduce((acc, item) => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const discountPercent = parseFloat(item.discountPercent) || 0;
        const discountValue = parseFloat(item.discountValue) || 0;
        const quantity = parseFloat(item.quantity) || 1;

        const unitPriceHT = unitPrice / 1.2;
        const discountedPriceHT = Math.max(
          0,
          unitPriceHT * (1 - discountPercent / 100) -
            (discountValue / quantity || 0)
        );

        return acc + discountedPriceHT * quantity * 0.2;
      }, 0),

      totalTTC: details.reduce((acc, item) => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const discountPercent = parseFloat(item.discountPercent) || 0;
        const discountValue = parseFloat(item.discountValue) || 0;
        const quantity = parseFloat(item.quantity) || 1;

        const discountedPriceTTC = Math.max(
          0,
          unitPrice * (1 - discountPercent / 100) -
            (discountValue / quantity || 0)
        );

        return acc + discountedPriceTTC * quantity;
      }, 0),
    },

    observations: `${editedEvent?.notes ? editedEvent?.notes : ""}`,
    DevisDate: `${
      editedEvent?.date
        ? new Date(editedEvent?.date).toLocaleDateString("fr-FR")
        : ""
    }`,
  };

  const documentDefinition = {
    content: [
      // HEADER avec OR + zone SCAN
      {
        table: {
          widths: ["50%", "50%"],
          body: [
            [
              {
                stack: [
                  {
                    text: `DEVIS N° ${invoiceData?.orderNumber}`,
                    style: "headerTitle",
                    alignment: "left",
                  },
                  {
                    text: `du ${new Date().toLocaleDateString()}`,
                    style: "headerSub",
                    alignment: "left",
                  },
                ],
              },
              {
                text: `Devis valable jusqu'au : ${addDays(
                  editedEvent.createdAt || new Date().toISOString(),
                  companyInfo.dayValidityQuote
                )}`,
                style: "headerSub",
                alignment: "right",
              },
            ],
          ],
        },
        layout: "noBorders",
        marginBottom: 15,
      },

      // BLOCS ENTREPRISE / VEHICULE / CLIENT (sans titres)
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
                    w: 160,
                    h: 80,
                    r: 6,
                    color: "#f9f9f9",
                    lineColor: "#cccccc",
                  },
                ],
                margin: [0, 0, 0, -80],
              },
              {
                stack: [
                  {
                    text: invoiceData.companyInfo.name,
                    style: "infoBlock",
                    alignment: "center",
                  },
                  {
                    text: invoiceData.companyInfo.address,
                    style: "infoBlock",
                    alignment: "center",
                  },
                  {
                    text: invoiceData.companyInfo.phone,
                    style: "infoBlock",
                    alignment: "center",
                  },
                  {
                    text: invoiceData.companyInfo.email,
                    style: "infoBlock",
                    alignment: "center",
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
                margin: [5, 8, 5, 0],
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
                    h: 80,
                    r: 6,
                    color: "#f9f9f9",
                    lineColor: "#cccccc",
                  },
                ],
                margin: [0, 0, 0, -80],
              },
              {
                stack: [
                  {
                    text: `${invoiceData.vehicle.model} - ${
                      invoiceData.vehicle.engine || ""
                    }`,
                    style: "infoBlock",
                    alignment: "center",
                  },
                  {
                    text: `VIN : ${invoiceData.vehicle.vin}`,
                    style: "infoBlock",
                    alignment: "center",
                  },
                  {
                    text: `Km : ${invoiceData.vehicle.km} km`,
                    style: "infoBlock",
                    alignment: "center",
                  },
                  {
                    text: `Immat : ${invoiceData.vehicle.licensePlate || ""}`,
                    style: "infoBlock",
                    alignment: "center",
                  },
                  {
                    text: `Couleur : ${invoiceData.vehicle.color}`,
                    style: "infoBlock",
                    alignment: "center",
                  },
                ],
                margin: [5, 8, 5, 0],
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
                    h: 80,
                    r: 6,
                    color: "#f9f9f9",
                    lineColor: "#cccccc",
                  },
                ],
                margin: [0, 0, 0, -80],
              },
              {
                stack: [
                  {
                    text: invoiceData.client.name,
                    style: "infoBlock",
                    alignment: "center",
                  },
                  {
                    text: `${invoiceData.client?.adresse || ""}`,
                    style: "infoBlock",
                    alignment: "center",
                  },
                  {
                    text: `${invoiceData.client?.postalVille || ""}`,
                    style: "infoBlock",
                    alignment: "center",
                  },
                  {
                    text: `${invoiceData.client.phone}`,
                    style: "infoBlock",
                    alignment: "center",
                  },
                  {
                    text: `${invoiceData.client.email}`,
                    style: "infoBlock",
                    alignment: "center",
                  },
                ],
                margin: [5, 8, 5, 0],
              },
            ],
          },
        ],
        columnGap: 8,
        marginBottom: 30,
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
                    style: "totalSub",
                  },
                  {
                    text: `TVA (20%) : ${invoiceData.totals.tva.toFixed(2)} €`,
                    alignment: "right",
                    style: "totalSub",
                  },
                ],
                fillColor: "#f5f5f5",
                margin: [2, 4, 2, 4],
              },
              {
                text: `Total Net TTC : ${invoiceData.totals.totalTTC.toFixed(
                  2
                )} €`,
                alignment: "right",
                style: "totalLabel",
                fillColor: "#4F46E5",
                color: "white",
                margin: [2, 4, 2, 4],
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
                style: "totalSub",
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

      // {
      //   text: `Le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString(
      //     [],
      //     { hour: "2-digit", minute: "2-digit" }
      //   )}`,
      //   style: "footer",
      //   alignment: "right",
      // },

      // SIGNATURES
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
      headerTitle: { fontSize: 14, bold: true, color: "#4F46E5" },
      headerSub: { fontSize: 9, italics: true, color: "#64748B" },
      infoBlock: { fontSize: 9, color: "#1E293B", alignment: "center" },

      tableHeader: {
        bold: true,
        alignment: "center",
        fontSize: 9,
        fillColor: "#4F46E5",
        color: "white",
        margin: [2, 4, 2, 4],
      },

      tableCell: { fontSize: 8, color: "#1E293B" },
      smallCell: { fontSize: 8, color: "#1E293B", alignment: "right" },

      totalLabel: {
        fontSize: 9,
        bold: true,
        color: "white",
        fillColor: "#4F46E5", // 👈 reste violet uniquement pour TTC
        alignment: "right",
        margin: [2, 4, 2, 4],
      },

      totalSub: {
        fontSize: 9,
        bold: true,
        color: "#1E293B", // 👈 texte sombre
        alignment: "right",
      },

      sectionHeader: {
        fontSize: 10,
        bold: true,
        color: "#3B82F6",
        marginTop: 8,
        marginBottom: 6,
      },
      subheader: { fontSize: 8, color: "#64748B", marginBottom: 4 },
      signature: { fontSize: 8, marginTop: 12, color: "#1E293B" },
      footer: { fontSize: 8, italics: true, marginTop: 8, color: "#64748B" },
      paragraph: { fontSize: 7, lineHeight: 1.2, color: "#64748B" },
    },
  };

  function generatePdf() {
    const fileName = `Devis_${invoiceData.orderNumber}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    pdfMake.createPdf(documentDefinition).download(fileName);
    if (onInvoiceExecuted) {
      onInvoiceExecuted(); // Déclenche la fonction du parent
    }
  }
  // Générer le PDF
  const [openOr, setOpenOr] = useState(false);

  const handleOpenOr = () => setOpenOr(true);

  const handleCloseOr = () => setOpenOr(false);

  // Fonction pour confirmer l'action
  const handleConfirmOr = () => {
    generatePdf(); // Appel de la fonction addEvent
    handleCloseOr(); // Fermer le modal
    closeNotification();
  };

  return (
    <div>
      <Button onClick={handleConfirmOr} color="primary" variant="contained">
        Oui
      </Button>
    </div>
  );
};

export default DevisTemplate;
