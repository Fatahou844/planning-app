import PrintIcon from "@mui/icons-material/Print";
import { Button } from "@mui/material";
import { createCanvas } from "canvas";
import JsBarcode from "jsbarcode";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../hooks/firebaseConfig";
import { useAxios } from "../../utils/hook/useAxios";
import pdfMake from "./pdfMake";

const C = { primary:"#4F46E5",primaryLight:"#EEF2FF",primaryMid:"#C7D2FE",textDark:"#0F172A",textMid:"#475569",textLight:"#94A3B8",border:"#E2E8F0",rowAlt:"#F8FAFC",white:"#FFFFFF" };

const infoBlock = (title, rows) => ({
  table:{widths:["*"],body:[
    [{text:title,fontSize:7.5,bold:true,color:C.primary,fillColor:C.primaryLight,margin:[6,5,6,5]}],
    [{stack:rows.map(({label,value,bold:b})=>label?{columns:[{text:label,fontSize:7.5,color:C.textLight,width:42},{text:value||"—",fontSize:7.5,bold:!!b,color:C.textDark}],margin:[0,1.5,0,1.5]}:{text:value||"—",fontSize:b?8.5:7.5,bold:!!b,color:C.textDark,margin:[0,1.5,0,1.5]}),margin:[6,7,6,7]}],
  ]},
  layout:{hLineWidth:(i)=>(i===0||i===2)?0.5:1.5,hLineColor:(i)=>i===1?C.primary:C.primaryMid,vLineWidth:(i,node)=>(i===0||i===node.table.widths.length)?0.5:0,vLineColor:()=>C.primaryMid},
});

const td  = (t,alt,e={}) => ({text:t,fontSize:8,color:C.textDark,margin:[4,4,4,4],fillColor:alt?C.rowAlt:null,...e});
const tdR = (t,alt,e={}) => td(t,alt,{alignment:"right",...e});
const tdC = (t,alt,e={}) => td(t,alt,{alignment:"center",...e});

const InvoiceTemplateWithoutOR2 = ({ NewEvent, details, onInvoiceExecuted, closeDocumentModal, closeEventModal }) => {
  const { Client, Vehicle, date, deposit } = NewEvent;
  const [user] = useAuthState(auth);
  const axios  = useAxios();
  const [info, setInfo]       = useState({ name:"Garage",address:"",phone:"",email:"",codePostal:"",ville:"",noteLegal:"" });
  const [logoBase64, setLogo] = useState(null);

  function getCurrentUser() { const s=localStorage.getItem("me"); return s?JSON.parse(s):null; }

  useEffect(()=>{ axios.get("/garages/userid/"+getCurrentUser()?.garageId).then(r=>setInfo(r.data.data)).catch(()=>{}); },[user]); // eslint-disable-line

  useEffect(()=>{ if(info?.logo){ axios.get(`/logo-base64?url=${encodeURIComponent(info.logo)}`).then(r=>setLogo(r.data.base64)).catch(()=>{}); } },[info]); // eslint-disable-line

  const d = {
    num:NewEvent?.id||"",
    co:{name:info?.name||"",address:info?.address||"",phone:info?.phone||"",email:info?.email||"",cp:info?.codePostal||"",ville:info?.ville||"",noteLegal:info?.noteLegal||""},
    v:{model:Vehicle?.model||"",immat:Vehicle?.plateNumber||"",vin:Vehicle?.vin||"",km:Vehicle?.mileage||"",color:Vehicle?.color||""},
    cl:{name:`${Client?.name||""} ${Client?.firstName||""}`.trim(),address:Client?.address||"",cpVille:`${Client?.postalCode||""} ${Client?.city||""}`.trim(),phone:Client?.phone||"",email:Client?.email||""},
    deposit:Number(deposit||0), notes:NewEvent?.notes||"",
    date:date?new Date(date).toLocaleDateString("fr-FR"):new Date().toLocaleDateString("fr-FR"),
    items:details.map(item=>{const ht=(parseFloat(item.unitPrice)||0)/1.2,ttc=parseFloat(item.unitPrice)||0,qty=parseFloat(item.quantity)||1,dp=parseFloat(item.discountPercent)||0,dv=parseFloat(item.discountValue)||0;return{code:item.code||"—",label:item.label||"",ht:ht.toFixed(2),ttc:ttc.toFixed(2),qty,totalHT:(ht*qty*(1-dp/100)-dv).toFixed(2),totalTTC:(ttc*qty*(1-dp/100)-dv).toFixed(2),remise:dp>0?`${dp}%`:dv>0?`${dv} €`:"—"};}),
    totals:(()=>{let ht=0,ttc=0;details.forEach(item=>{const p=parseFloat(item.unitPrice)||0,qty=parseFloat(item.quantity)||1,dp=parseFloat(item.discountPercent)||0,dv=parseFloat(item.discountValue)||0;ttc+=Math.max(0,p*qty*(1-dp/100)-dv);ht+=Math.max(0,(p/1.2)*qty*(1-dp/100)-dv);});return{ht:ht.toFixed(2),tva:(ttc-ht).toFixed(2),ttc:ttc.toFixed(2)};})(),
  };

  const cv = createCanvas();
  JsBarcode(cv, `FAC-${d.num}`, { format:"CODE128", displayValue:false, width:1.4, height:28, margin:0 });
  const bc = cv.toDataURL("image/png");

  const doc = {
    pageMargins:[28,20,28,40],defaultStyle:{font:"Roboto"},
    content:[
      {table:{widths:["*",logoBase64?70:"auto"],body:[[
        {stack:[{text:"FACTURE",fontSize:15,bold:true,color:C.white},{text:`N° ${d.num}  ·  ${d.date}`,fontSize:8.5,color:C.primaryMid,marginTop:3}],fillColor:C.primary,border:[false,false,false,false],margin:[14,11,0,11]},
        logoBase64
          ?{image:logoBase64,fit:[60,36],alignment:"right",fillColor:C.primary,border:[false,false,false,false],margin:[0,8,14,8]}
          :{stack:[{text:d.co.name,bold:true,fontSize:9,color:C.white,alignment:"right"},{text:d.co.phone,fontSize:8,color:C.primaryMid,alignment:"right",marginTop:2}],fillColor:C.primary,border:[false,false,false,false],margin:[0,11,14,11]},
      ]]},layout:"noBorders",marginBottom:3},
      {table:{widths:["*"],body:[[{image:bc,fit:[180,28],alignment:"center",fillColor:C.primaryLight,border:[false,false,false,false],margin:[0,5,0,5]}]]},layout:"noBorders",marginBottom:14},
      {columns:[
        infoBlock("GARAGE",  [{value:d.co.name,bold:true},{label:"Adresse :",value:d.co.address},{label:"",value:`${d.co.cp} ${d.co.ville}`},{label:"Tél :",value:d.co.phone},{label:"Email :",value:d.co.email}]),
        infoBlock("VÉHICULE",[{value:d.v.model,bold:true},{label:"Immat :",value:d.v.immat,bold:true},{label:"VIN :",value:d.v.vin},{label:"Km :",value:d.v.km?`${d.v.km} km`:"—"},{label:"Couleur :",value:d.v.color}]),
        infoBlock("CLIENT",  [{value:d.cl.name,bold:true},{label:"Adresse :",value:d.cl.address},{label:"",value:d.cl.cpVille},{label:"Tél :",value:d.cl.phone},{label:"Email :",value:d.cl.email}]),
      ],columnGap:10,marginBottom:16},
      {table:{widths:[52,"*",44,44,28,50,50,38],body:[
        [{text:"Code",style:"th"},{text:"Désignation",style:"th"},{text:"P.U. HT",style:"th"},{text:"P.U. TTC",style:"th"},{text:"Qté",style:"th"},{text:"Total HT",style:"th"},{text:"Total TTC",style:"th"},{text:"Remise",style:"th"}],
        ...d.items.map((item,i)=>[td(item.code,i%2!==0),td(item.label,i%2!==0),tdR(`${item.ht} €`,i%2!==0),tdR(`${item.ttc} €`,i%2!==0),tdC(`${item.qty}`,i%2!==0),tdR(`${item.totalHT} €`,i%2!==0),tdR(`${item.totalTTC} €`,i%2!==0),tdC(item.remise,i%2!==0)]),
      ]},layout:{hLineWidth:(i)=>i===0||i===1?0:0.4,hLineColor:()=>C.border,vLineWidth:()=>0,fillColor:(r)=>r===0?C.primary:null},marginBottom:16},
      {columns:[{text:"",width:"*"},{width:190,table:{widths:["*","auto"],body:[
        [{text:"Total HT",fontSize:8.5,color:C.textMid,margin:[8,5,8,5],border:[false,false,false,true],borderColor:["","","",C.border]},{text:`${d.totals.ht} €`,fontSize:8.5,bold:true,color:C.textDark,alignment:"right",margin:[8,5,8,5],border:[false,false,false,true],borderColor:["","","",C.border]}],
        [{text:"TVA 20%",fontSize:8.5,color:C.textMid,margin:[8,5,8,5],border:[false,false,false,true],borderColor:["","","",C.border]},{text:`${d.totals.tva} €`,fontSize:8.5,bold:true,color:C.textDark,alignment:"right",margin:[8,5,8,5],border:[false,false,false,true],borderColor:["","","",C.border]}],
        [{text:"TOTAL TTC",fontSize:10,bold:true,color:C.white,fillColor:C.primary,margin:[8,7,8,7],border:[false,false,false,false]},{text:`${d.totals.ttc} €`,fontSize:10,bold:true,color:C.white,fillColor:C.primary,alignment:"right",margin:[8,7,8,7],border:[false,false,false,false]}],
        [{text:"Acompte",fontSize:8,color:C.textMid,margin:[8,4,8,4],border:[false,false,false,false]},{text:`${d.deposit.toFixed(2)} €`,fontSize:8,color:C.textDark,alignment:"right",margin:[8,4,8,4],border:[false,false,false,false]}],
      ]},layout:{hLineWidth:(i)=>(i===0||i===4)?0.5:0,hLineColor:()=>C.border,vLineWidth:(i)=>(i===0||i===2)?0.5:0,vLineColor:()=>C.border}}],marginBottom:16},
      ...(d.notes?[{text:"Observations",fontSize:8.5,bold:true,color:C.primary,marginBottom:4},{text:d.notes,fontSize:8,color:C.textMid,marginBottom:14}]:[]),
      {text:d.co.noteLegal,fontSize:7,color:C.textLight,italics:true},
    ],
    footer:(p,pc)=>({table:{widths:["*","auto"],body:[[{text:`${d.co.name}  ·  ${d.co.address}  ·  ${d.co.phone}  —  MERCI DE VOTRE CONFIANCE`,fontSize:7,color:C.textLight,border:[false,true,false,false],borderColor:["",C.border,"",""],margin:[28,5,0,0]},{text:`${p} / ${pc}`,fontSize:7,color:C.textLight,alignment:"right",border:[false,true,false,false],borderColor:["",C.border,"",""],margin:[0,5,28,0]}]]},layout:"noBorders"}),
    styles:{th:{bold:true,fontSize:8,color:C.white,margin:[4,5,4,5],alignment:"center"}},
  };

  const handleConfirmOr = () => {
    pdfMake.createPdf(doc).download(`Facture_${d.num}_${new Date().toISOString().split("T")[0]}.pdf`);
    onInvoiceExecuted?.();
    closeDocumentModal?.();
    closeEventModal?.();
  };

  return (
    <Button variant="contained" startIcon={<PrintIcon />} onClick={handleConfirmOr} disableElevation
      sx={{bgcolor:C.primary,color:C.white,textTransform:"none","&:hover":{bgcolor:"#4338CA"}}}>
      Imprimer
    </Button>
  );
};

export default InvoiceTemplateWithoutOR2;
