import pdfMake from "../sharedPdfMake";

const C = {
  primary: "#4F46E5", primaryLight: "#EEF2FF", primaryMid: "#C7D2FE",
  textDark: "#0F172A", textMid: "#475569", textLight: "#94A3B8",
  border: "#E2E8F0", rowAlt: "#F8FAFC", white: "#FFFFFF",
};

const td  = (text, alt, e = {}) => ({ text, fontSize: 8, color: C.textDark, margin: [4,4,4,4], fillColor: alt ? C.rowAlt : null, ...e });
const tdR = (text, alt, e = {}) => td(text, alt, { alignment: "right", ...e });
const tdC = (text, alt, e = {}) => td(text, alt, { alignment: "center", ...e });

/**
 * Génère et télécharge le PDF d'un Bon de Commande.
 * @param {object} bdc      — objet BDC avec Lines et Fournisseur
 * @param {object} garage   — infos garage { name, address, phone, email, codePostal, ville }
 */
export function generateBdcPdf(bdc, garage = {}) {
  const lines   = bdc.Lines || [];
  const fourni  = bdc.Fournisseur || {};
  const co      = {
    name:    garage.name    || "",
    address: garage.address || "",
    phone:   garage.phone   || "",
    email:   garage.email   || "",
    cp:      garage.codePostal || "",
    ville:   garage.ville   || "",
  };

  const totalHT  = lines.reduce((s, l) => s + (l.quantiteCommandee || 0) * (l.prixAchatUnitaire || 0), 0);
  const tva      = totalHT * 0.2;
  const totalTTC = totalHT * 1.2;

  const doc = {
    pageMargins: [28, 20, 28, 40],
    defaultStyle: { font: "Roboto" },

    content: [
      /* BANDE TITRE */
      { table: { widths: ["*", "auto"], body: [[
        { stack: [
          { text: "BON DE COMMANDE", fontSize: 15, bold: true, color: C.white },
          { text: `N° ${bdc.id}  ·  ${bdc.date || ""}`, fontSize: 8.5, color: C.primaryMid, marginTop: 3 },
          { text: bdc.dateAttendue ? `Livraison attendue : ${bdc.dateAttendue}` : "", fontSize: 7.5, color: "#A5B4FC", marginTop: 2 },
        ], fillColor: C.primary, border: [false,false,false,false], margin: [14,11,0,11] },
        { stack: [
          { text: co.name, bold: true, fontSize: 9, color: C.white, alignment: "right" },
          { text: co.phone, fontSize: 8, color: C.primaryMid, alignment: "right", marginTop: 2 },
        ], fillColor: C.primary, border: [false,false,false,false], margin: [0,11,14,11] },
      ]] }, layout: "noBorders", marginBottom: 14 },

      /* BLOCS GARAGE / FOURNISSEUR */
      { columns: [
        { table: { widths: ["*"], body: [
          [{ text: "GARAGE", fontSize: 7.5, bold: true, color: C.primary, fillColor: C.primaryLight, margin: [6,5,6,5] }],
          [{ stack: [
            { text: co.name,    fontSize: 8.5, bold: true, color: C.textDark, margin: [0,1,0,1] },
            { text: co.address, fontSize: 7.5, color: C.textMid, margin: [0,1,0,1] },
            { text: `${co.cp} ${co.ville}`, fontSize: 7.5, color: C.textMid, margin: [0,1,0,1] },
            { text: co.phone,   fontSize: 7.5, color: C.textMid, margin: [0,1,0,1] },
            { text: co.email,   fontSize: 7.5, color: C.textMid, margin: [0,1,0,1] },
          ], margin: [6,7,6,7] }],
        ]}, layout: { hLineWidth: (i) => (i===0||i===2)?0.5:1.5, hLineColor: (i) => i===1?C.primary:C.primaryMid, vLineWidth:(i,n)=>(i===0||i===n.table.widths.length)?0.5:0, vLineColor:()=>C.primaryMid } },

        { table: { widths: ["*"], body: [
          [{ text: "FOURNISSEUR", fontSize: 7.5, bold: true, color: C.primary, fillColor: C.primaryLight, margin: [6,5,6,5] }],
          [{ stack: [
            { text: fourni.nom || "—", fontSize: 8.5, bold: true, color: C.textDark, margin: [0,1,0,1] },
            { text: fourni.adresse1 || "", fontSize: 7.5, color: C.textMid, margin: [0,1,0,1] },
            { text: fourni.telephone || "", fontSize: 7.5, color: C.textMid, margin: [0,1,0,1] },
            { text: fourni.email || "", fontSize: 7.5, color: C.textMid, margin: [0,1,0,1] },
          ], margin: [6,7,6,7] }],
        ]}, layout: { hLineWidth: (i) => (i===0||i===2)?0.5:1.5, hLineColor: (i) => i===1?C.primary:C.primaryMid, vLineWidth:(i,n)=>(i===0||i===n.table.widths.length)?0.5:0, vLineColor:()=>C.primaryMid } },
      ], columnGap: 12, marginBottom: 16 },

      /* TABLEAU */
      { table: { widths: [55, "*", 60, 50, 70, 70], body: [
        [
          { text: "Référence",         style: "th" },
          { text: "Désignation",       style: "th" },
          { text: "Type",              style: "th" },
          { text: "Qté commandée",     style: "th" },
          { text: "PA unitaire (€)",   style: "th" },
          { text: "Total HT (€)",      style: "th" },
        ],
        ...lines.map((l, i) => {
          const total = (l.quantiteCommandee || 0) * (l.prixAchatUnitaire || 0);
          return [
            td(l.Article?.refExt   || "—",    i%2!==0),
            td(l.Article?.libelle1 || "—",    i%2!==0, { fontWeight: 500 }),
            tdC(l.Article?.type    || "—",    i%2!==0),
            tdC(`${l.quantiteCommandee}`,       i%2!==0, { fontWeight: 700 }),
            tdR(l.prixAchatUnitaire ? `${parseFloat(l.prixAchatUnitaire).toFixed(2)}` : "—", i%2!==0),
            tdR(total > 0 ? `${total.toFixed(2)}` : "—", i%2!==0, { fontWeight: 600, color: C.primary }),
          ];
        }),
      ]}, layout: { hLineWidth:(i)=>i===0||i===1?0:0.4, hLineColor:()=>C.border, vLineWidth:()=>0, fillColor:(r)=>r===0?C.primary:null }, marginBottom: 16 },

      /* TOTAUX */
      { columns: [
        { text: "", width: "*" },
        { width: 200, table: { widths: ["*", "auto"], body: [
          [{ text: "Total HT",  fontSize: 8.5, color: C.textMid, margin:[8,5,8,5], border:[false,false,false,true], borderColor:["","","",C.border] }, { text: `${totalHT.toFixed(2)} €`,  fontSize:8.5, bold:true, color:C.textDark, alignment:"right", margin:[8,5,8,5], border:[false,false,false,true], borderColor:["","","",C.border] }],
          [{ text: "TVA 20%",   fontSize: 8.5, color: C.textMid, margin:[8,5,8,5], border:[false,false,false,true], borderColor:["","","",C.border] }, { text: `${tva.toFixed(2)} €`,       fontSize:8.5, bold:true, color:C.textDark, alignment:"right", margin:[8,5,8,5], border:[false,false,false,true], borderColor:["","","",C.border] }],
          [{ text: "TOTAL TTC", fontSize: 10,  bold:true, color:C.white, fillColor:C.primary, margin:[8,7,8,7], border:[false,false,false,false] }, { text: `${totalTTC.toFixed(2)} €`, fontSize:10, bold:true, color:C.white, fillColor:C.primary, alignment:"right", margin:[8,7,8,7], border:[false,false,false,false] }],
        ]}, layout:{ hLineWidth:(i)=>(i===0||i===3)?0.5:0, hLineColor:()=>C.border, vLineWidth:(i)=>(i===0||i===2)?0.5:0, vLineColor:()=>C.border } },
      ], marginBottom: 16 },

      /* NOTES */
      ...(bdc.notes ? [
        { text: "Conditions / Notes", fontSize: 8.5, bold: true, color: C.primary, marginBottom: 4 },
        { text: bdc.notes, fontSize: 8, color: C.textMid, marginBottom: 14 },
      ] : []),

      { text: `Document généré le ${new Date().toLocaleDateString("fr-FR")}`, fontSize: 7, color: C.textLight, italics: true },
    ],

    footer: (p, pc) => ({
      table: { widths: ["*", "auto"], body: [[
        { text: `${co.name}  ·  ${co.address}  ·  ${co.phone}`, fontSize: 7, color: C.textLight, border:[false,true,false,false], borderColor:["",C.border,"",""], margin:[28,5,0,0] },
        { text: `${p} / ${pc}`, fontSize: 7, color: C.textLight, alignment: "right", border:[false,true,false,false], borderColor:["",C.border,"",""], margin:[0,5,28,0] },
      ]] }, layout: "noBorders",
    }),

    styles: {
      th: { bold: true, fontSize: 8, color: C.white, margin: [4,5,4,5], alignment: "center" },
    },
  };

  pdfMake.createPdf(doc).download(`BDC_${bdc.id}_${bdc.date || "date"}.pdf`);
}
