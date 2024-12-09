import { Button } from "@mui/material";
import React from "react";

import pdfMake from "./pdfMake"; // Assurez-vous de bien importer votre pdfMake configuré

const InvoiceTemplate = ({ editedEvent, details, onInvoiceExecuted }) => {
  const { person, vehicule, date, title } = editedEvent;
  const invoiceData = {
    orderNumber: title,
    companyInfo: {
      name: "Garage XYZ",
      address: "123 Rue Exemple, Casablanca",
      phone: "+212 5 20 30 40 50",
      email: "contact@garagexyz.com",
    },
    vehicle: {
      model: vehicule.model,
      motor: "", // Si ce champ est nécessaire, il peut être rempli avec des données supplémentaires
      vin: vehicule.vin,
      km: vehicule.kms,
      color: vehicule.color,
      licensePlate: vehicule.licensePlate,
    },
    client: {
      name: `${person.firstName} ${person.lastName}`,
      address: `${person.localAddress ? person?.localAddress : ""} ${
        person.codePostal ? person.codePostal : ""
      }`, // Si une adresse client est disponible, l'ajouter ici
      phone: person.phone,
      email: person.email,
      rdv: date, // Date de l'événement (le RDV)
    },
    items: details.map((item) => ({
      description: item.label,
      unitPriceHT: item.unitPrice, // Prix sans taxe
      unitPriceTTC: item.unitPrice * 1.2, // Exemple d'application de TVA à 20% pour l'affichage
      quantity: item.quantity,
      discount: item.discountPercent,
    })),
    totals: {
      totalHT: details.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
      ),
      tva: details.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity * 0.2,
        0
      ),
      totalTTC: details.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity * 1.2,
        0
      ),
    },
    observations: `Contrôle technique à prévoir le ${vehicule.controletech}`,
  };

  const documentDefinition = {
    content: [
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
                text: "Informations Véhicule",
                style: "vehicleHeader",
                alignment: "center",
              },
              {
                text: "Informations Client",
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
                text: invoiceData.client.name,
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
                text: invoiceData.client.phone,
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
                text: `RDV : ${invoiceData.client.rdv}`,
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
                text: `License Plate : ${
                  invoiceData.vehicle.licensePlate || ""
                }`,
                style: "vehicleInfo",
                alignment: "center",
              },
              {
                text: " ",
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
                text: " ",
                style: "clientInfo",
                alignment: "center",
              },
            ],
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
              `${item.unitPriceHT} €`,
              `${item.unitPriceTTC} €`,
              item.quantity,
              `${(item.unitPriceHT * item.quantity).toFixed(2)} €`,
              `${(item.unitPriceTTC * item.quantity).toFixed(2)} €`,
              `${item.discount} %`,
            ]),
          ],
        },
        layout: "lightHorizontalLines",
        marginBottom: 20,
        alignment: "center",
      },

      // Totaux
      {
        text: `Total HT : ${invoiceData.totals.totalHT.toFixed(2)} €`,
        style: "total",
        alignment: "right",
      },
      {
        text: `TVA (20%) : ${invoiceData.totals.tva.toFixed(2)} €`,
        style: "total",
        alignment: "right",
      },
      {
        text: `Total TTC : ${invoiceData.totals.totalTTC.toFixed(2)} €`,
        style: "total",
        alignment: "right",
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
        marginTop: 20,
      },

      // Footer
      {
        text: "Merci pour votre confiance",
        style: "footer",
        alignment: "center",
        marginTop: 20,
      },
    ],

    styles: {
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
      total: {
        fontWeight: "bold",
        marginTop: 10,
        alignment: "right",
        fontSize: 12,
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
  // Générer le PDF

  return (
    <div>
      <Button onClick={generatePdf} color="primary" variant="contained">
        Facture
      </Button>
    </div>
  );
};

export default InvoiceTemplate;
