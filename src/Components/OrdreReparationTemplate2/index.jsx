import { Button } from "@mui/material";

import { Box, Modal, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../hooks/firebaseConfig";
import { useAxios } from "../../utils/hook/useAxios";
import pdfMake from "./pdfMake"; // Assurez-vous de bien importer votre pdfMake configuré
const OrdreReparationTemplate2 = ({
  editedEvent,
  details,
  onInvoiceExecuted,
}) => {
  const { Client, Vehicle, date, deposit } = editedEvent;
  const [openOr, setOpenOr] = useState(false);

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
  const invoiceData = {
    orderNumber: editedEvent ? editedEvent.id : "",
    deposit: deposit,
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
      lastCheck: Vehicle?.lastCheck ? Vehicle?.lastCheck : "",
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
      discount: item.discountPercent || 0,
      discountAmount: item.discountAmount || 0,
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

    observations: `${editedEvent?.notes ? editedEvent?.notes : ""}`,
    rdvDate: `${editedEvent?.date ? editedEvent?.date : ""} à ${
      editedEvent?.startHour
        ? editedEvent?.startHour.toString().padStart(2, "0")
        : ""
    }h${
      editedEvent?.startMinute
        ? editedEvent?.startMinute.toString().padStart(2, "0")
        : ""
    }`,
    endDate: `${
      editedEvent?.endDate
        ? new Date(editedEvent.endDate).toLocaleDateString("fr-FR")
        : ""
    } à ${
      editedEvent?.endHour
        ? editedEvent?.endHour.toString().padStart(2, "0")
        : ""
    }h${
      editedEvent?.endMinute
        ? editedEvent?.endMinute.toString().padStart(2, "0")
        : ""
    }`,
  };

  console.log("INCOICE DATA*********************", invoiceData);

  const documentDefinition = {
    content: [
      // HEADER avec OR + zone SCAN
      {
        table: {
          widths: ["65%", "35%"],
          body: [
            [
              {
                text: `ORDRE DE REPARATION N° ${invoiceData?.orderNumber}`,
                style: "headerTitle",
                alignment: "left",
              },
              {
                text: `RDV : ${invoiceData?.rdvDate || ""}`,
                style: "headerSub",
                alignment: "right",
              },
            ],
          ],
        },
        layout: "noBorders",
        marginBottom: 10,
      },

      {
        table: {
          widths: ["50%", "50%"],
          body: [
            [
              {
                text: "Zone code-barre / Scan",
                style: "barcodeZone",
                alignment: "center",
                border: [true, true, true, true],
                fillColor: "#f5f5f5",
              },

              {
                text: `Fin des travaux : ${invoiceData?.endDate || ""}`,
                style: "headerSub",
                alignment: "right",
              },
            ],
          ],
        },
        layout: "noBorders",
        marginBottom: 20,
      },

      // BLOCS SEPARÉS ENTREPRISE / VEHICULE / CLIENT
      {
        columns: [
          {
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 0,
                    y: 0,
                    w: 160,
                    h: 90,
                    r: 8,
                    color: "#f9f9f9",
                    lineColor: "#cccccc",
                  },
                ],
                margin: [0, 0, 0, -90],
              },
              {
                stack: [
                  {
                    text: invoiceData.companyInfo.name,
                    style: "companyHeader",
                    alignment: "center",
                  },
                  {
                    text: invoiceData.companyInfo.address,
                    style: "companySubheader",
                    alignment: "center",
                  },
                  {
                    text: invoiceData.companyInfo.phone,
                    style: "companySubheader",
                    alignment: "center",
                  },
                  {
                    text: invoiceData.companyInfo.email,
                    style: "companySubheader",
                    alignment: "center",
                  },
                ],
                margin: [5, 10, 5, 0],
              },
            ],
          },
          {
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 0,
                    y: 0,
                    w: 160,
                    h: 90,
                    r: 8,
                    color: "#f9f9f9",
                    lineColor: "#cccccc",
                  },
                ],
                margin: [0, 0, 0, -90],
              },
              {
                stack: [
                  {
                    text: "VÉHICULE",
                    style: "vehicleHeader",
                    alignment: "center",
                  },
                  {
                    text: `${invoiceData.vehicle.model} - ${
                      invoiceData.vehicle.engine || ""
                    }`,
                    style: "vehicleInfo",
                    alignment: "center",
                  },
                  {
                    text: `VIN : ${invoiceData.vehicle.vin}`,
                    style: "vehicleInfo",
                    alignment: "center",
                  },
                  {
                    text: `Km : ${invoiceData.vehicle.km} km`,
                    style: "vehicleInfo",
                    alignment: "center",
                  },
                  {
                    text: `Immat : ${invoiceData.vehicle.licensePlate || ""}`,
                    style: "vehicleInfo",
                    alignment: "center",
                  },
                  {
                    text: `Couleur : ${invoiceData.vehicle.color}`,
                    style: "vehicleInfo",
                    alignment: "center",
                  },
                ],
                margin: [5, 10, 5, 0],
              },
            ],
          },
          {
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 0,
                    y: 0,
                    w: 160,
                    h: 90,
                    r: 8,
                    color: "#f9f9f9",
                    lineColor: "#cccccc",
                  },
                ],
                margin: [0, 0, 0, -90],
              },
              {
                stack: [
                  {
                    text: "CLIENT",
                    style: "clientHeader",
                    alignment: "center",
                  },
                  {
                    text: invoiceData.client.name,
                    style: "clientInfo",
                    alignment: "center",
                  },
                  {
                    text: `Tel : ${invoiceData.client.phone}`,
                    style: "clientInfo",
                    alignment: "center",
                  },
                  {
                    text: `Email : ${invoiceData.client.email}`,
                    style: "clientInfo",
                    alignment: "center",
                  },
                  {
                    text: `Adresse : ${invoiceData.client?.adresse || ""} ${
                      invoiceData.client?.postale || ""
                    }`,
                    style: "clientInfo",
                    alignment: "center",
                  },
                  {
                    text: `Ville : ${invoiceData.client?.ville || ""}`,
                    style: "clientInfo",
                    alignment: "center",
                  },
                ],
                margin: [5, 10, 5, 0],
              },
            ],
          },
        ],
        columnGap: 10,
        marginBottom: 20,
      },

      // TABLEAU ITEMS
      {
        table: {
          widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "Code", style: "tableHeader" },
              { text: "Libellé / Travaux", style: "tableHeader" },
              { text: "P.U. HT", style: "tableHeader" },
              { text: "P.U. TTC", style: "tableHeader" },
              { text: "Qté", style: "tableHeader" },
              { text: "Total HT", style: "tableHeader" },
              { text: "Total TTC", style: "tableHeader" },
            ],
            ...invoiceData.items.map((item) => [
              item.code || "",
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
              text: `Total HT : ${invoiceData.totals.totalHT.toFixed(2)} €`,
              alignment: "right",
              style: "totalLabel",
            },
            {
              text: `TVA (20%) : ${invoiceData.totals.tva.toFixed(2)} €`,
              alignment: "right",
              style: "totalLabel",
            },
          ],
          fillColor: "#f5f5f5", // gris clair
        },
        {
          text: `Total Net TTC : ${invoiceData.totals.totalTTC.toFixed(2)} €`,
          alignment: "right",
          style: "totalLabel",
          fillColor: "#f5f5f5", // gris clair
        },
      ],
      [
        { text: "", border: [false, false, false, false], fillColor: "#f5f5f5" },
        {
          text: `Acompte versé : ${invoiceData.deposit?.toFixed(2) || "0.00"} €`,
          alignment: "right",
          style: "totalLabel",
          fillColor: "#f5f5f5",
        },
      ],
    ],
  },
  layout: "lightHorizontalLines",
  marginBottom: 20,
}
,

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

      {
        text: `Le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit" }
        )}`,
        style: "footer",
        alignment: "right",
      },

      // SIGNATURES
      {
        table: {
          widths: ["50%", "50%"],
          body: [
            [
              {
                text: "Signature du Réceptionnaire",
                style: "signature",
                alignment: "left",
              },
              {
                text: "Signature du Client",
                style: "signature",
                alignment: "right",
              },
            ],
          ],
        },
        layout: "noBorders",
        marginBottom: 20,
      },
    ],

    styles: {
      headerTitle: { fontSize: 14, bold: true },
      headerSub: { fontSize: 9, italics: true },
      companyHeader: { fontSize: 12, bold: true, marginBottom: 3 },
      companySubheader: { fontSize: 9 },
      vehicleHeader: { fontSize: 11, bold: true, marginBottom: 3 },
      vehicleInfo: { fontSize: 9 },
      clientHeader: { fontSize: 11, bold: true, marginBottom: 3 },
      clientInfo: { fontSize: 9 },
      tableHeader: {
        bold: true,
        alignment: "center",
        fillColor: "#eeeeee",
        margin: [3, 3, 3, 3],
      },
      totalLabel: { fontSize: 10, bold: true },
      totalValue: { fontSize: 10 },
      sectionHeader: {
        fontSize: 11,
        bold: true,
        marginTop: 10,
        marginBottom: 5,
      },
      subheader: { fontSize: 9, marginBottom: 5 },
      signature: { fontSize: 9, marginTop: 15 },
      footer: { fontSize: 9, italics: true, marginTop: 10 },
      barcodeZone: {
        fontSize: 8,
        bold: true,
        color: "grey",
        margin: [5, 15, 5, 15],
      },
      paragraph: { fontSize: 8, lineHeight: 1.2 },
    },
  };

  function generatePdf() {
    pdfMake.createPdf(documentDefinition).open();
    if (onInvoiceExecuted) {
      onInvoiceExecuted(); // Déclenche la fonction du parent
    }
  }
  // Générer le PDF

  const handleOpenOr = () => setOpenOr(true);

  const handleCloseOr = () => setOpenOr(false);

  // Fonction pour confirmer l'action
  const handleConfirmOr = () => {
    generatePdf(); // Appel de la fonction addEvent
    handleCloseOr(); // Fermer le modal
  };

  return (
    <div>
      <Button onClick={handleOpenOr} color="primary" variant="contained">
        Imprimer OR
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
          <Typography id="confirmation-modal-title" variant="h6" component="h2">
            Confirmation
          </Typography>
          <Typography id="confirmation-modal-description" sx={{ mt: 2, mb: 4 }}>
            Voulez vous imprimer cet OR?
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

export default OrdreReparationTemplate2;
