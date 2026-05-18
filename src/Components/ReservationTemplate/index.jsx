import PrintIcon from "@mui/icons-material/Print";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../hooks/firebaseConfig";
import { useAxios } from "../../utils/hook/useAxios";
import pdfMake from "./pdfMake";

const C = {
  primary: "#4F46E5", primaryLight: "#EEF2FF", primaryMid: "#C7D2FE",
  textDark: "#0F172A", textMid: "#475569", textLight: "#94A3B8",
  border: "#E2E8F0", rowAlt: "#F8FAFC", white: "#FFFFFF",
};

const infoBlock = (title, rows) => ({
  table: {
    widths: ["*"],
    body: [
      [{ text: title, fontSize: 7.5, bold: true, color: C.primary, fillColor: C.primaryLight, margin: [6, 5, 6, 5] }],
      [{
        stack: rows.map(({ label, value, bold: b }) =>
          label
            ? { columns: [{ text: label, fontSize: 7.5, color: C.textLight, width: 42 }, { text: value || "—", fontSize: 7.5, bold: !!b, color: C.textDark }], margin: [0, 1.5, 0, 1.5] }
            : { text: value || "—", fontSize: b ? 8.5 : 7.5, bold: !!b, color: C.textDark, margin: [0, 1.5, 0, 1.5] }
        ),
        margin: [6, 7, 6, 7],
      }],
    ],
  },
  layout: {
    hLineWidth: (i) => (i === 0 || i === 2) ? 0.5 : 1.5,
    hLineColor: (i) => i === 1 ? C.primary : C.primaryMid,
    vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 0.5 : 0,
    vLineColor: () => C.primaryMid,
  },
});

const td  = (text, alt, extra = {}) => ({ text, fontSize: 8, color: C.textDark, margin: [4, 4, 4, 4], fillColor: alt ? C.rowAlt : null, ...extra });
const tdR = (text, alt, extra = {}) => td(text, alt, { alignment: "right",  ...extra });
const tdC = (text, alt, extra = {}) => td(text, alt, { alignment: "center", ...extra });

const ReservationTemplate = ({ editedEvent, details, onInvoiceExecuted, closeNotification }) => {
  const { Client, Vehicle, date, deposit } = editedEvent;
  const [user] = useAuthState(auth);
  const axios  = useAxios();
  const [companyInfo, setCompanyInfo] = useState({ name: "Garage", address: "", phone: "", email: "", codePostal: "", ville: "" });

  function getCurrentUser() {
    const s = localStorage.getItem("me");
    return s ? JSON.parse(s) : null;
  }

  useEffect(() => {
    axios.get("/garages/userid/" + getCurrentUser()?.garageId)
      .then(r => setCompanyInfo(r.data.data))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const d = {
    num: editedEvent?.id || "",
    company: {
      name: companyInfo?.name || "", address: companyInfo?.address || "",
      phone: companyInfo?.phone || "", email: companyInfo?.email || "",
      cp: companyInfo?.codePostal || "", ville: companyInfo?.ville || "",
      noteLegal: companyInfo?.noteLegal || "",
    },
    vehicle: {
      model: Vehicle?.model || "", immat: Vehicle?.plateNumber || "",
      vin: Vehicle?.vin || "", km: Vehicle?.mileage || "", color: Vehicle?.color || "",
    },
    client: {
      name: `${Client?.name || ""} ${Client?.firstName || ""}`.trim(),
      address: Client?.address || "",
      cpVille: `${Client?.postalCode || ""} ${Client?.city || ""}`.trim(),
      phone: Client?.phone || "", email: Client?.email || "",
    },
    deposit: Number(deposit || 0),
    notes: editedEvent?.notes || "",
    date: date ? new Date(date).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR"),
    items: details.map(item => {
      const ht  = (parseFloat(item.unitPrice) || 0) / 1.2;
      const ttc = parseFloat(item.unitPrice)  || 0;
      const qty = parseFloat(item.quantity)   || 1;
      const dp  = parseFloat(item.discountPercent) || 0;
      const dv  = parseFloat(item.discountValue)   || 0;
      return {
        code: item.code || "—", label: item.label || "",
        ht: ht.toFixed(2), ttc: ttc.toFixed(2), qty,
        totalHT:  (ht  * qty * (1 - dp / 100) - dv).toFixed(2),
        totalTTC: (ttc * qty * (1 - dp / 100) - dv).toFixed(2),
        remise: dp > 0 ? `${dp}%` : dv > 0 ? `${dv} €` : "—",
      };
    }),
    totals: (() => {
      let ht = 0, ttc = 0;
      details.forEach(item => {
        const p   = parseFloat(item.unitPrice) || 0;
        const qty = parseFloat(item.quantity)  || 1;
        const dp  = parseFloat(item.discountPercent) || 0;
        const dv  = parseFloat(item.discountValue)   || 0;
        ttc += Math.max(0, p * qty * (1 - dp / 100) - dv);
        ht  += Math.max(0, (p / 1.2) * qty * (1 - dp / 100) - dv);
      });
      return { ht: ht.toFixed(2), tva: (ttc - ht).toFixed(2), ttc: ttc.toFixed(2) };
    })(),
  };

  const doc = {
    pageMargins: [28, 20, 28, 40],
    defaultStyle: { font: "Roboto" },
    content: [
      /* BANDE TITRE */
      {
        table: {
          widths: ["*", "auto"],
          body: [[
            {
              stack: [
                { text: "RÉSERVATION", fontSize: 15, bold: true, color: C.white },
                { text: `N° ${d.num}  ·  ${d.date}`, fontSize: 8.5, color: C.primaryMid, marginTop: 3 },
              ],
              fillColor: C.primary, border: [false, false, false, false], margin: [14, 11, 0, 11],
            },
            {
              stack: [
                { text: d.company.name, bold: true, fontSize: 9, color: C.white, alignment: "right" },
                { text: d.company.phone, fontSize: 8, color: C.primaryMid, alignment: "right", marginTop: 2 },
                { text: `Date RDV : ${d.date}`, fontSize: 7.5, color: "#A5B4FC", alignment: "right", marginTop: 3 },
              ],
              fillColor: C.primary, border: [false, false, false, false], margin: [0, 11, 14, 11],
            },
          ]],
        },
        layout: "noBorders",
        marginBottom: 14,
      },

      /* BLOCS INFO */
      {
        columns: [
          infoBlock("GARAGE", [
            { value: d.company.name,  bold: true },
            { label: "Adresse :", value: d.company.address },
            { label: "", value: `${d.company.cp} ${d.company.ville}` },
            { label: "Tél :",   value: d.company.phone },
            { label: "Email :", value: d.company.email },
          ]),
          infoBlock("VÉHICULE", [
            { value: d.vehicle.model, bold: true },
            { label: "Immat :",  value: d.vehicle.immat, bold: true },
            { label: "VIN :",    value: d.vehicle.vin },
            { label: "Km :",     value: d.vehicle.km ? `${d.vehicle.km} km` : "—" },
            { label: "Couleur :", value: d.vehicle.color },
          ]),
          infoBlock("CLIENT", [
            { value: d.client.name, bold: true },
            { label: "Adresse :", value: d.client.address },
            { label: "", value: d.client.cpVille },
            { label: "Tél :",    value: d.client.phone },
            { label: "Email :",  value: d.client.email },
          ]),
        ],
        columnGap: 10,
        marginBottom: 16,
      },

      /* TABLEAU */
      {
        table: {
          widths: [52, "*", 44, 44, 28, 50, 50, 38],
          body: [
            [
              { text: "Code",        style: "th" }, { text: "Désignation", style: "th" },
              { text: "P.U. HT",    style: "th" }, { text: "P.U. TTC",   style: "th" },
              { text: "Qté",        style: "th" }, { text: "Total HT",   style: "th" },
              { text: "Total TTC",  style: "th" }, { text: "Remise",     style: "th" },
            ],
            ...d.items.map((item, i) => [
              td(item.code, i%2!==0), td(item.label, i%2!==0),
              tdR(`${item.ht} €`, i%2!==0),  tdR(`${item.ttc} €`, i%2!==0),
              tdC(`${item.qty}`,  i%2!==0),
              tdR(`${item.totalHT} €`,  i%2!==0),
              tdR(`${item.totalTTC} €`, i%2!==0),
              tdC(item.remise, i%2!==0),
            ]),
          ],
        },
        layout: {
          hLineWidth: (i) => i === 0 || i === 1 ? 0 : 0.4,
          hLineColor: () => C.border, vLineWidth: () => 0,
          fillColor:  (row) => row === 0 ? C.primary : null,
        },
        marginBottom: 16,
      },

      /* TOTAUX */
      {
        columns: [
          { text: "", width: "*" },
          {
            width: 190,
            table: {
              widths: ["*", "auto"],
              body: [
                [{ text: "Total HT", fontSize: 8.5, color: C.textMid, margin: [8,5,8,5], border: [false,false,false,true], borderColor: ["","","",C.border] }, { text: `${d.totals.ht} €`, fontSize: 8.5, bold: true, color: C.textDark, alignment: "right", margin: [8,5,8,5], border: [false,false,false,true], borderColor: ["","","",C.border] }],
                [{ text: "TVA 20%",  fontSize: 8.5, color: C.textMid, margin: [8,5,8,5], border: [false,false,false,true], borderColor: ["","","",C.border] }, { text: `${d.totals.tva} €`, fontSize: 8.5, bold: true, color: C.textDark, alignment: "right", margin: [8,5,8,5], border: [false,false,false,true], borderColor: ["","","",C.border] }],
                [{ text: "TOTAL TTC", fontSize: 10, bold: true, color: C.white, fillColor: C.primary, margin: [8,7,8,7], border: [false,false,false,false] }, { text: `${d.totals.ttc} €`, fontSize: 10, bold: true, color: C.white, fillColor: C.primary, alignment: "right", margin: [8,7,8,7], border: [false,false,false,false] }],
                [{ text: "Acompte",  fontSize: 8, color: C.textMid, margin: [8,4,8,4], border: [false,false,false,false] }, { text: `${d.deposit.toFixed(2)} €`, fontSize: 8, color: C.textDark, alignment: "right", margin: [8,4,8,4], border: [false,false,false,false] }],
              ],
            },
            layout: {
              hLineWidth: (i) => (i===0||i===4) ? 0.5 : 0, hLineColor: () => C.border,
              vLineWidth: (i) => (i===0||i===2) ? 0.5 : 0, vLineColor: () => C.border,
            },
          },
        ],
        marginBottom: 16,
      },

      ...(d.notes ? [
        { text: "Observations", fontSize: 8.5, bold: true, color: C.primary, marginBottom: 4 },
        { text: d.notes, fontSize: 8, color: C.textMid, marginBottom: 14 },
      ] : []),
      { text: d.company.noteLegal, fontSize: 7, color: C.textLight, italics: true },
    ],

    footer: (currentPage, pageCount) => ({
      table: {
        widths: ["*", "auto"],
        body: [[
          { text: `${d.company.name}  ·  ${d.company.address}  ·  ${d.company.phone}  —  MERCI DE VOTRE CONFIANCE`, fontSize: 7, color: C.textLight, border: [false,true,false,false], borderColor: ["",C.border,"",""], margin: [28,5,0,0] },
          { text: `${currentPage} / ${pageCount}`, fontSize: 7, color: C.textLight, alignment: "right", border: [false,true,false,false], borderColor: ["",C.border,"",""], margin: [0,5,28,0] },
        ]],
      },
      layout: "noBorders",
    }),

    styles: {
      th: { bold: true, fontSize: 8, color: C.white, margin: [4, 5, 4, 5], alignment: "center" },
    },
  };

  function generatePdf() {
    pdfMake.createPdf(doc).download(`Reservation_${d.num}_${new Date().toISOString().split("T")[0]}.pdf`);
    if (onInvoiceExecuted) onInvoiceExecuted();
  }

  const handleConfirmOr = () => { generatePdf(); closeNotification?.(); };

  return (
    <Button variant="contained" startIcon={<PrintIcon />} onClick={handleConfirmOr} disableElevation
      sx={{ bgcolor: C.primary, color: C.white, textTransform: "none", "&:hover": { bgcolor: "#4338CA" } }}>
      Imprimer
    </Button>
  );
};

export default ReservationTemplate;
