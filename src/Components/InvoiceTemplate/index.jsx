import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Box, Modal, Typography } from "@mui/material";
import { useAxios } from "../../utils/hook/useAxios";
import pdfMake from "./pdfMake";

const InvoiceTemplate = ({
  editedEvent,
  categories,
  details,
  onInvoiceExecuted,
  closeEventModal,
  onFactureGenerated,
}) => {
  const { Client, Vehicle, date, id } = editedEvent;
  const user  = { id: 1 };
  const axios = useAxios();

  const C = { primary:"#4F46E5",primaryLight:"#EEF2FF",primaryMid:"#C7D2FE",textDark:"#0F172A",textMid:"#475569",textLight:"#94A3B8",border:"#E2E8F0",rowAlt:"#F8FAFC",white:"#FFFFFF" };

  const [garageInfo, setGarageInfo] = useState({ name:"Garage",address:"",phone:"",email:"",codePostal:"",ville:"",noteLegal:"" });

  function getCurrentUser() { const s=localStorage.getItem("me"); return s?JSON.parse(s):null; }

  useEffect(()=>{ axios.get("/garages/userid/"+getCurrentUser()?.garageId).then(r=>setGarageInfo(r.data.data)).catch(()=>{}); },[]);// eslint-disable-line

  const calculateLineTotal = (detail) => {
    let discount = 0;

    if (detail.discountPercent > 0) {
      // Priorité au pourcentage
      discount =
        detail.unitPrice * detail.quantity * (detail.discountPercent / 100);
    } else if (detail.discountValue > 0) {
      // Sinon, utilise le montant fixe
      discount = detail.discountValue;
    }

    // Calcul du total après remise
    return detail.quantity * detail.unitPrice - discount;
  };
  const invoiceData = {
    orderNumber: id ? id : "",
    companyInfo: {
      name: "Garage XYZ",
      address: "123 Rue Exemple, Casablanca",
      phone: "+212 5 20 30 40 50",
      email: "contact@garagexyz.com",
    },
    vehicle: {
      model: Vehicle?.model ? Vehicle.model : "",
      motor: "", // Si ce champ est nécessaire, il peut être rempli avec des données supplémentaires
      vin: Vehicle?.vin ? Vehicle.vin : "",
      km: Vehicle?.kms ? Vehicle.kms : "",
      color: Vehicle?.color ? Vehicle.color : "",
      licensePlate: Vehicle?.licensePlate ? Vehicle.licensePlate : "",
    },
    client: {
      name: `${Client?.firstName ? Client.firstName : ""} ${
        Client?.name ? Client.name : ""
      }`,
      adresse: `${Client?.adresse ? Client?.adresse : ""} ${
        Client?.postale ? Client.postale : ""
      }`, // Si une adresse client est disponible, l'ajouter ici
      phone: Client?.phone ? Client.phone : "",
      email: Client?.email ? Client.email : "",
      rdv: date ? date : "", // Date de l'événement (le RDV)
      ville: Client?.ville ? Client?.ville : "",
    },
    items: details.map((item) => ({
      description: item.label,
      code: item.code,
      unitPriceHT: item.unitPrice / 1.2, // Calculer le prix HT à partir du TTC
      unitPriceTTC: parseFloat(item.unitPrice), // Prix TTC (déjà fourni)
      quantity: item.quantity,
      discount: item.discountPercent,
      discountValue: item.discountValue,
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
    observations: `${editedEvent.notes}`,
  };

  const infoBlock = (title, rows) => ({
    table:{widths:["*"],body:[
      [{text:title,fontSize:7.5,bold:true,color:C.primary,fillColor:C.primaryLight,margin:[6,5,6,5]}],
      [{stack:rows.map(({label,value,bold:b})=>label?{columns:[{text:label,fontSize:7.5,color:C.textLight,width:42},{text:value||"—",fontSize:7.5,bold:!!b,color:C.textDark}],margin:[0,1.5,0,1.5]}:{text:value||"—",fontSize:b?8.5:7.5,bold:!!b,color:C.textDark,margin:[0,1.5,0,1.5]}),margin:[6,7,6,7]}],
    ]},
    layout:{hLineWidth:(i)=>(i===0||i===2)?0.5:1.5,hLineColor:(i)=>i===1?C.primary:C.primaryMid,vLineWidth:(i,node)=>(i===0||i===node.table.widths.length)?0.5:0,vLineColor:()=>C.primaryMid},
  });
  const tdx  = (t,alt,e={}) => ({text:t,fontSize:8,color:C.textDark,margin:[4,4,4,4],fillColor:alt?C.rowAlt:null,...e});
  const tdRx = (t,alt,e={}) => tdx(t,alt,{alignment:"right",...e});
  const tdCx = (t,alt,e={}) => tdx(t,alt,{alignment:"center",...e});
  const co = { name:garageInfo?.name||"",address:garageInfo?.address||"",phone:garageInfo?.phone||"",email:garageInfo?.email||"",cp:garageInfo?.codePostal||"",ville:garageInfo?.ville||"",noteLegal:garageInfo?.noteLegal||"" };
  const vv = { model:Vehicle?.model||"",immat:Vehicle?.licensePlate||Vehicle?.plateNumber||"",vin:Vehicle?.vin||"",km:Vehicle?.kms||Vehicle?.mileage||"",color:Vehicle?.color||"" };
  const cl = { name:`${Client?.firstName||""} ${Client?.name||""}`.trim(),address:`${Client?.adresse||Client?.address||""} ${Client?.postale||Client?.postalCode||""}`.trim(),phone:Client?.phone||"",email:Client?.email||"",ville:Client?.ville||Client?.city||"" };

  const documentDefinition = {
    pageMargins:[28,20,28,40],defaultStyle:{font:"Roboto"},
    content:[
      {table:{widths:["*","auto"],body:[[
        {stack:[{text:"FACTURE",fontSize:15,bold:true,color:C.white},{text:`N° ${invoiceData.orderNumber}  ·  ${new Date().toLocaleDateString("fr-FR")}`,fontSize:8.5,color:C.primaryMid,marginTop:3}],fillColor:C.primary,border:[false,false,false,false],margin:[14,11,0,11]},
        {stack:[{text:co.name,bold:true,fontSize:9,color:C.white,alignment:"right"},{text:co.phone,fontSize:8,color:C.primaryMid,alignment:"right",marginTop:2}],fillColor:C.primary,border:[false,false,false,false],margin:[0,11,14,11]},
      ]]},layout:"noBorders",marginBottom:14},
      {columns:[
        infoBlock("GARAGE",  [{value:co.name,bold:true},{label:"Adresse :",value:co.address},{label:"",value:`${co.cp} ${co.ville}`},{label:"Tél :",value:co.phone},{label:"Email :",value:co.email}]),
        infoBlock("VÉHICULE",[{value:vv.model,bold:true},{label:"Immat :",value:vv.immat,bold:true},{label:"VIN :",value:vv.vin},{label:"Km :",value:vv.km?`${vv.km} km`:"—"},{label:"Couleur :",value:vv.color}]),
        infoBlock("CLIENT",  [{value:cl.name,bold:true},{label:"Adresse :",value:cl.address},{label:"Ville :",value:cl.ville},{label:"Tél :",value:cl.phone},{label:"Email :",value:cl.email}]),
      ],columnGap:10,marginBottom:16},
      {table:{widths:[52,"*",44,44,28,50,50,38],body:[
        [{text:"Code",style:"th"},{text:"Désignation / Travaux",style:"th"},{text:"P.U. HT",style:"th"},{text:"P.U. TTC",style:"th"},{text:"Qté",style:"th"},{text:"Total HT",style:"th"},{text:"Total TTC",style:"th"},{text:"Remise",style:"th"}],
        ...invoiceData.items.map((item,i)=>[tdx(item.code||"—",i%2!==0),tdx(item.description,i%2!==0),tdRx(`${item.unitPriceHT?.toFixed(2)} €`,i%2!==0),tdRx(`${item.unitPriceTTC?.toFixed(2)} €`,i%2!==0),tdCx(`${item.quantity}`,i%2!==0),tdRx(`${(item.unitPriceHT*item.quantity).toFixed(2)} €`,i%2!==0),tdRx(`${(item.unitPriceTTC*item.quantity).toFixed(2)} €`,i%2!==0),tdCx(item.discount>0?`${item.discount}%`:item.discountValue>0?`${item.discountValue} €`:"—",i%2!==0)]),
      ]},layout:{hLineWidth:(i)=>i===0||i===1?0:0.4,hLineColor:()=>C.border,vLineWidth:()=>0,fillColor:(r)=>r===0?C.primary:null},marginBottom:16},
      {columns:[{text:"",width:"*"},{width:190,table:{widths:["*","auto"],body:[
        [{text:"Total HT",fontSize:8.5,color:C.textMid,margin:[8,5,8,5],border:[false,false,false,true],borderColor:["","","",C.border]},{text:`${invoiceData.totals.totalHT.toFixed(2)} €`,fontSize:8.5,bold:true,color:C.textDark,alignment:"right",margin:[8,5,8,5],border:[false,false,false,true],borderColor:["","","",C.border]}],
        [{text:"TVA 20%",fontSize:8.5,color:C.textMid,margin:[8,5,8,5],border:[false,false,false,true],borderColor:["","","",C.border]},{text:`${invoiceData.totals.tva.toFixed(2)} €`,fontSize:8.5,bold:true,color:C.textDark,alignment:"right",margin:[8,5,8,5],border:[false,false,false,true],borderColor:["","","",C.border]}],
        [{text:"TOTAL TTC",fontSize:10,bold:true,color:C.white,fillColor:C.primary,margin:[8,7,8,7],border:[false,false,false,false]},{text:`${invoiceData.totals.totalTTC.toFixed(2)} €`,fontSize:10,bold:true,color:C.white,fillColor:C.primary,alignment:"right",margin:[8,7,8,7],border:[false,false,false,false]}],
      ]},layout:{hLineWidth:(i)=>(i===0||i===3)?0.5:0,hLineColor:()=>C.border,vLineWidth:(i)=>(i===0||i===2)?0.5:0,vLineColor:()=>C.border}}],marginBottom:16},
      ...(invoiceData.observations?[{text:"Observations",fontSize:8.5,bold:true,color:C.primary,marginBottom:4},{text:invoiceData.observations,fontSize:8,color:C.textMid,marginBottom:14}]:[]),
      {text:co.noteLegal,fontSize:7,color:C.textLight,italics:true,marginBottom:20},
      {table:{widths:["44%","12%","44%"],body:[[
        {stack:[{text:"Signature du réceptionnaire",fontSize:8,color:C.textMid,marginBottom:28},{canvas:[{type:"line",x1:0,y1:0,x2:175,y2:0,lineWidth:0.5,lineColor:C.border}]}],border:[false,false,false,false]},
        {text:"",border:[false,false,false,false]},
        {stack:[{text:"Signature du client",fontSize:8,color:C.textMid,alignment:"right",marginBottom:28},{canvas:[{type:"line",x1:0,y1:0,x2:175,y2:0,lineWidth:0.5,lineColor:C.border}]}],border:[false,false,false,false]},
      ]]},layout:"noBorders"},
    ],
    footer:(p,pc)=>({table:{widths:["*","auto"],body:[[{text:`${co.name}  ·  ${co.address}  ·  ${co.phone}  —  MERCI DE VOTRE CONFIANCE`,fontSize:7,color:C.textLight,border:[false,true,false,false],borderColor:["",C.border,"",""],margin:[28,5,0,0]},{text:`${p} / ${pc}`,fontSize:7,color:C.textLight,alignment:"right",border:[false,true,false,false],borderColor:["",C.border,"",""],margin:[0,5,28,0]}]]},layout:"noBorders"}),
    styles:{th:{bold:true,fontSize:8,color:C.white,margin:[4,5,4,5],alignment:"center"}},
  /* DEPRECATED_PLACEHOLDER_START
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
                  : item.discountValue + "€"
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
  DEPRECATED_PLACEHOLDER_END */
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

  const handleOpenOr = () => {
    setOpenOr(true); // Fermer EventModal via la prop closeEventModal
    if (closeEventModal) {
      closeEventModal();
    }
  };

  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  const handleCloseOr = () => setOpenOr(false);
  const addSingleReservation = async (
    event,
    newOrderNumber,
    collectionName,
    isClosed
  ) => {
    try {
      let response = 0;
      if (collectionName == "devis")
        response = await axios.post("/quotes", {
          date: event.date,
          clientId: Client.id,
          vehicleId: Vehicle.id,
          notes: event.notes,
          deposit: editedEvent?.deposit | 0.0,
          isClosed: false,
          userId: event.userId, // UID de l'utilisateur
          garageId: getCurrentUser().garageId,
        });
      else if (collectionName == "facture")
        response = await axios.post("/invoices", {
          date: event.date,
          clientId: Client.id,
          vehicleId: Vehicle.id,
          deposit: editedEvent?.deposit | 0.0,

          notes: event.notes,
          isClosed: false,
          userId: event.userId, // UID de l'utilisateur
          garageId: getCurrentUser().garageId,
        });
      else if (collectionName == "reservation")
        response = await axios.post("/reservations", {
          date: event.date,
          clientId: Client.id,
          vehicleId: Vehicle.id,
          notes: event.notes,
          deposit: editedEvent?.deposit | 0.0,

          isClosed: false,
          userId: event.userId, // UID de l'utilisateur
          garageId: getCurrentUser().garageId,
        });

      return response.data; // Retourner la référence du document
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const addEventDetailsGeneric = async (eventId, details, collectionName) => {
    try {
      // Filtrer les détails valides (exclut ceux où tous les champs sont vides ou non valides)
      const validDetails = details.filter((detail) => {
        return (
          detail.label?.trim() ||
          detail.quantity ||
          detail.unitPrice ||
          detail.discountPercent ||
          detail.discountValue
        );
      });

      console.log(
        "############## validDetails ####################",
        validDetails
      );

      // Si aucun détail valide, on sort sans erreur
      if (validDetails.length === 0) {
        console.log("Aucun détail valide à enregistrer.");
        return;
      }

      if (collectionName === "devis")
        // Envoyer chaque détail individuellement via une requête POST à l'API
        for (const detail of validDetails) {
          await axios.post("/details", {
            label: detail.label || "",
            code: detail.code || "xxx",
            quantity: detail.quantity || 0,
            unitPrice: detail.unitPrice || 0,
            discountPercent: detail.discountPercent || 0,
            discountValue: detail.discountValue || 0,
            forfaitId: detail.forfaitId || null,
            articleId: detail.articleId || null,
            documentType: "Quote",
            quoteId: eventId,
          });
        }
      else if (collectionName === "reservation")
        for (const detail of validDetails) {
          await axios.post("/details", {
            label: detail.label || "",
            code: detail.code || "xxx",
            quantity: detail.quantity || 0,
            unitPrice: detail.unitPrice || 0,
            discountPercent: detail.discountPercent || 0,
            discountValue: detail.discountValue || 0,
            forfaitId: detail.forfaitId || null,
            articleId: detail.articleId || null,
            documentType: "Reservation",
            reservationId: eventId,
          });
        }
      else if (collectionName === "facture")
        for (const detail of validDetails) {
          await axios.post("/details", {
            label: detail.label || "",
            code: detail.code || "xxx",
            quantity: detail.quantity || 0,
            unitPrice: detail.unitPrice || 0,
            discountPercent: detail.discountPercent || 0,
            discountValue: detail.discountValue || 0,
            forfaitId: detail.forfaitId || null,
            articleId: detail.articleId || null,
            documentType: "Invoice",
            invoiceId: eventId,
          });
        }

      console.log("Détails ajoutés avec succès à l'événement");
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout des détails à l'événement : ",
        error
      );
    }
  };

  const addFacture = async () => {
    // Ajout du paramètre isMultiDay
    // if (!user) {
    //   console.error("User not authenticated");
    //   return; // Sortir si l'utilisateur n'est pas connecté
    // }

    const userId = user.id; // UID de l'utilisateur connecté

    // Générer le numéro de commande une seule fois pour l'événement (ou son ensemble)
    // const lastOrderNumber = await getLastOrderNumberForUser(userId);
    const newOrderNumber = 100000;

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
      "facture",
      true
    ); // Ajout à Firestore
    console.log(
      "909998. ################################## DETAILS FACTURES ##################################",
      editedEvent
    );
    const validDetails = editedEvent.Details.filter((detail) => {
      return (
        detail.label?.trim() ||
        detail.quantity?.toString().trim() ||
        detail.unitPrice?.toString().trim() ||
        detail.discountPercent?.toString().trim() ||
        detail.discountValue?.toString().trim()
      );
    });

    if (validDetails.length)
      await addEventDetailsGeneric(singleResaDocRef.id, details, "facture"); // Enregistrer les détails

    setNotification({
      open: true,
      message: "Facture " + newOrderNumber + " crée",
      severity: "success", // Peut être "error", "warning", "info"
    });
    // Récupérer la facture depuis Firestore
    if (singleResaDocRef) {
      const fact = await getFactureById(singleResaDocRef.id, "factures");
      setFacture(fact);
      if (onFactureGenerated) {
        onFactureGenerated(fact);
        console.log("Facture récupérée : onFactureGenerated", fact);
      } else {
        console.error(
          "❌ ERREUR : onFactureGenerated  est undefined dans le Child !"
        );
      }
      console.log("Facture récupérée :", fact);
    }
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
      // Déterminer l'URL de la requête en fonction de la collection
      let url = "";
      switch (collectionName) {
        case "events":
          url = `/documents/order/${factureId}/details`; // pour les événements /documents/:documentType/:id/details
          break;
        case "factures":
          url = `/documents/invoice/${factureId}/details`; // pour les factures
          break;
        case "devis":
          url = `/documents/quote/${factureId}/details`; // pour les devis
          break;
        case "reservations":
          url = `/documents/reservation/${factureId}/details`; // pour les réservations
          break;
        default:
          throw new Error(`Collection non supportée : ${collectionName}`);
      }

      // Effectuer la requête GET avec Axios
      const response = await axios.get(url);

      // Si la facture est trouvée, ouvrir le modal et retourner les données
      if (response.data) {
        setModalOpen2(true);
        return response.data;
      } else {
        throw new Error("Facture introuvable !");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la facture via Axios :",
        error
      );
      throw error;
    }
  };
  // // Fonction pour confirmer l'action
  const handleConfirmOr = () => {
    // generatePdf(); // Appel de la fonction addEvent
    addFacture();
    handleShowPopup();
    handleCloseOr(); // Fermer le modal
    if (closeEventModal) {
      closeEventModal();
    }
    // console.log("FERMETURE EVENTMODAL");
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
    if (onFactureGenerated) onFactureGenerated(facture);
  }, [facture]);
  const [modalOpen2, setModalOpen2] = useState(false);

  const handleModalClose2 = () => {
    setModalOpen2(false);
    console.log("modalOpen2", modalOpen2);
  };

  // const handleEditedEventChange = (updatedEvent) => {
  //   setFacture(updatedEvent);
  //   onFactureGenerated (updatedEvent);
  // };

  return (
    <div>
      {/* {showPopup && facture && (
        <Notification
          message={notification.message}
          handleClose={handleClosePopup}
          collectionName="factures"
          dataEvent={facture}
          dataDetails={details}
        />
      )} */}
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
      {/* {facture && (
        <DocumentModal
          open={modalOpen2}
          onClose={handleModalClose2}
          editedEvent={facture}
          setEditedEvent={handleEditedEventChange}
          collectionName={"factures"}
          categories={categories}
          closeEventModal={closeEventModal}
        />
      )} */}
    </div>
  );
};

export default InvoiceTemplate;
