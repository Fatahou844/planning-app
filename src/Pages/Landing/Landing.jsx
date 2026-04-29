import AssignmentIcon        from "@mui/icons-material/Assignment";
import BarChartIcon          from "@mui/icons-material/BarChart";
import BuildIcon             from "@mui/icons-material/Build";
import CalendarMonthIcon     from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon       from "@mui/icons-material/CheckCircle";
import DirectionsCarIcon     from "@mui/icons-material/DirectionsCar";
import ExpandMoreIcon        from "@mui/icons-material/ExpandMore";
import InventoryIcon         from "@mui/icons-material/Inventory";
import LocalOfferIcon        from "@mui/icons-material/LocalOffer";
import MenuIcon              from "@mui/icons-material/Menu";
import PeopleIcon            from "@mui/icons-material/People";
import ReceiptLongIcon       from "@mui/icons-material/ReceiptLong";
import SupportAgentIcon      from "@mui/icons-material/SupportAgent";
import CloseIcon from "@mui/icons-material/Close";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────
   Données statiques
───────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: <CalendarMonthIcon sx={{ fontSize: 32 }} />, title: "Planning & Atelier",   color: "primary.main",   mockId: "planning",    desc: "Gérez vos créneaux, affectez vos techniciens et suivez l'avancement des interventions en temps réel depuis un planning visuel."  },
  { icon: <AssignmentIcon    sx={{ fontSize: 32 }} />, title: "Devis & Facturation",  color: "success.main",   mockId: "devis",       desc: "Créez des devis en quelques clics, convertissez-les en ordres de réparation puis en factures. Tout est traçable et archivé."    },
  { icon: <PeopleIcon        sx={{ fontSize: 32 }} />, title: "Gestion clients",      color: "warning.main",   mockId: "clients",     desc: "Historique complet par client et par véhicule. Retrouvez instantanément les antécédents, les documents et les préférences."     },
  { icon: <DirectionsCarIcon sx={{ fontSize: 32 }} />, title: "Suivi des véhicules",  color: "info.main",      mockId: "stock",       desc: "Fiche véhicule complète : kilométrage, VIN, contrôle technique, historique d'interventions. Rien ne se perd."                  },
  { icon: <InventoryIcon     sx={{ fontSize: 32 }} />, title: "Stock & Pièces",       color: "secondary.main", mockId: "stock",       desc: "Gérez votre stock de pièces, importez vos catalogues fournisseurs et générez vos étiquettes prix en un clic."                 },
  { icon: <BarChartIcon      sx={{ fontSize: 32 }} />, title: "Pilotage & Reporting", color: "error.main",     mockId: "reporting",   desc: "Tableaux de bord clairs pour suivre votre activité, vos marges et l'efficacité de votre équipe au quotidien."                },
];

const STEPS = [
  { step: "01", title: "Créez votre espace",    desc: "Inscription en 2 minutes. Renseignez les infos de votre garage et créez votre compte administrateur."              },
  { step: "02", title: "Configurez & importez", desc: "Ajoutez votre équipe, importez vos clients et votre catalogue articles. Nous vous accompagnons à chaque étape."   },
  { step: "03", title: "Travaillez plus vite",  desc: "Gérez votre planning, vos documents et votre stock depuis une seule interface. Concentrez-vous sur la mécanique." },
];

const PLANS = [
  {
    name: "Démarrage", price: "Gratuit", period: "", variant: "outlined", color: "default",
    desc: "Pour découvrir la plateforme sans engagement.",
    features: ["Planning & Agenda", "Gestion clients", "Devis (limité à 10/mois)", "Support par email"],
    cta: "Commencer gratuitement",
  },
  {
    name: "Garage Pro", price: "29 €", period: "/ mois HT", variant: "contained", color: "primary", badge: "Le plus populaire",
    desc: "L'essentiel pour gérer votre garage au quotidien.",
    features: ["Tout Démarrage inclus", "Devis & Factures illimités", "Ordres de réparation", "Gestion du stock", "Étiquetage prix", "1 mois offert"],
    cta: "Essayer 1 mois gratuit",
  },
  {
    name: "Multi-postes", price: "59 €", period: "/ mois HT", variant: "outlined", color: "default",
    desc: "Pour les garages avec plusieurs techniciens et postes.",
    features: ["Tout Garage Pro inclus", "Utilisateurs illimités", "Reporting avancé", "Gestion multi-garages", "Support prioritaire", "Formation incluse"],
    cta: "Demander une démo",
  },
];

const TESTIMONIALS = [
  { name: "Karim B.",   role: "Gérant, Garage Auto Centre — Casablanca", initials: "KB", quote: "Depuis qu'on utilise cette plateforme, on a réduit le temps de création de devis de 70%. Nos clients reçoivent leurs documents instantanément." },
  { name: "Fatima L.",  role: "Responsable atelier, Mécanique Express — Rabat",      initials: "FL", quote: "Le planning visuel a changé notre façon de travailler. On voit d'un coup d'œil la charge de chaque technicien. Plus aucun doublon."      },
  { name: "Youssef M.", role: "Propriétaire, Carrosserie du Sud — Marrakech",         initials: "YM", quote: "L'historique client est une mine d'or. On retrouve en 2 secondes toutes les interventions sur un véhicule. Les clients adorent."         },
];

const STATS = [
  { value: "500+", label: "Garages actifs"     },
  { value: "98%",  label: "Satisfaction client" },
  { value: "40%",  label: "Gain de temps moyen" },
  { value: "24/7", label: "Disponibilité"       },
];

/* ─────────────────────────────────────────────────────────
   Schéma interactif — noeuds
───────────────────────────────────────────────────────── */
const SCHEMA_NODES = [
  {
    id: "planning",
    icon: CalendarMonthIcon,
    label: "Planning",
    color: "#1976d2",
    angle: 270,
    badge: "Temps réel",
    description: "Planifiez vos interventions sur un agenda visuel. Affectez chaque OR à un technicien, gérez les créneaux et évitez les doubles réservations. Vue jour / semaine / mois.",
    details: ["Drag & drop des interventions", "Vue par technicien", "Gestion des absences", "Alertes de surcharge"],
  },
  {
    id: "devis",
    icon: AssignmentIcon,
    label: "Devis",
    color: "#388e3c",
    angle: 330,
    badge: "3 clics",
    description: "Générez un devis professionnel en moins d'une minute. Sélectionnez les pièces, les forfaits et les main-d'œuvre. Envoi PDF automatique au client.",
    details: ["Catalogue pièces intégré", "Forfaits préconfigurés", "Signature électronique", "Conversion OR en 1 clic"],
  },
  {
    id: "facturation",
    icon: ReceiptLongIcon,
    label: "Facturation",
    color: "#f57c00",
    angle: 30,
    badge: "Automatisé",
    description: "Convertissez vos ordres de réparation en factures conformes. Suivi des paiements, relances automatiques et export comptable.",
    details: ["Factures conformes", "Suivi des règlements", "Export comptable", "Avoirs & remboursements"],
  },
  {
    id: "clients",
    icon: PeopleIcon,
    label: "Clients",
    color: "#7b1fa2",
    angle: 90,
    badge: "CRM complet",
    description: "Fiche client complète avec historique de toutes les interventions, véhicules associés, documents et communications. Fidélisez vos clients avec des rappels automatiques.",
    details: ["Historique complet", "Multi-véhicules", "Rappels entretien", "SMS & email auto"],
  },
  {
    id: "stock",
    icon: InventoryIcon,
    label: "Stock",
    color: "#c62828",
    angle: 150,
    badge: "Import Excel",
    description: "Gérez vos niveaux de stock, définissez des alertes de rupture et importez vos catalogues fournisseurs via Excel. Impression d'étiquettes prix intégrée.",
    details: ["Alertes rupture stock", "Import fournisseurs", "Étiquetage prix", "Inventaire en ligne"],
  },
  {
    id: "reporting",
    icon: BarChartIcon,
    label: "Reporting",
    color: "#0097a7",
    angle: 210,
    badge: "Insights",
    description: "Tableaux de bord en temps réel sur votre CA, vos marges par prestation, l'activité de vos techniciens et la satisfaction client. Prenez les bonnes décisions.",
    details: ["CA en temps réel", "Marges par prestation", "Performance techniciens", "Export rapports PDF"],
  },
];

/* ─────────────────────────────────────────────────────────
   FAQ
───────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: "Comment fonctionne l'essai gratuit ?",
    a: "Vous accédez immédiatement à l'ensemble des fonctionnalités du plan Garage Pro pendant 30 jours, sans carte bancaire requise. À la fin de la période, vous choisissez l'offre qui vous convient ou vous restez sur le plan gratuit.",
  },
  {
    q: "Puis-je migrer mes données existantes ?",
    a: "Oui. Notre équipe vous accompagne dans l'import de vos fichiers clients, véhicules et articles. Nous acceptons les fichiers Excel, CSV et les exports des principaux logiciels du marché (Winmotor, Autodata, Cabex…).",
  },
  {
    q: "Combien d'utilisateurs puis-je ajouter ?",
    a: "Les plans Démarrage et Garage Pro incluent jusqu'à 5 utilisateurs simultanés. Le plan Multi-postes permet un nombre illimité d'utilisateurs et de postes connectés en même temps.",
  },
  {
    q: "Y a-t-il un engagement minimum ?",
    a: "Aucun. Tous nos abonnements sont sans engagement et facturés mensuellement. Vous pouvez résilier à tout moment depuis votre espace compte, sans pénalité.",
  },
  {
    q: "La plateforme est-elle accessible sur mobile ?",
    a: "Oui, l'interface est entièrement responsive et optimisée pour les tablettes et smartphones. Vos techniciens peuvent consulter leurs ordres de réparation et pointer leurs interventions depuis leur téléphone.",
  },
  {
    q: "Comment sont sécurisées mes données ?",
    a: "Vos données sont hébergées en Europe sur des serveurs certifiés ISO 27001, sauvegardées quotidiennement et chiffrées en transit (HTTPS/TLS). Vous restez propriétaire de vos données et pouvez les exporter à tout moment.",
  },
  {
    q: "Quel support est inclus ?",
    a: "Tous les plans incluent un support par email avec réponse sous 24h (jours ouvrés). Le plan Multi-postes bénéficie d'un support téléphonique prioritaire 6j/7 et d'un gestionnaire de compte dédié.",
  },
  {
    q: "Puis-je personnaliser mes documents (devis, factures) ?",
    a: "Oui. Vous pouvez intégrer votre logo, vos couleurs, vos mentions légales et votre pied de page. Les modèles de devis et factures sont entièrement personnalisables depuis les paramètres du garage.",
  },
];

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function SectionTitle({ children, subtitle, centered = true }) {
  return (
    <Box textAlign={centered ? "center" : "left"} mb={6}>
      <Typography variant="h4" fontWeight={800} gutterBottom>{children}</Typography>
      {subtitle && (
        <Typography variant="body1" color="text.secondary" maxWidth={560} mx={centered ? "auto" : 0}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function deg2rad(deg) { return (deg * Math.PI) / 180; }

/* ─────────────────────────────────────────────────────────
   MOCKUPS UI — reproductions miniatures de l'interface réelle
───────────────────────────────────────────────────────── */

function BrowserFrame({ children }) {
  return (
    <Box sx={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #e0e0e0", boxShadow: "0 12px 40px rgba(0,0,0,0.13)" }}>
      {/* Chrome bar */}
      <Box sx={{ bgcolor: "#f0f0f0", px: 1.5, py: 0.7, display: "flex", alignItems: "center", gap: 0.8, borderBottom: "1px solid #ddd" }}>
        <Box display="flex" gap={0.5}>
          {["#ff5f57","#febc2e","#28c840"].map((c,i) => <Box key={i} sx={{ width:8, height:8, borderRadius:"50%", bgcolor:c }} />)}
        </Box>
        <Box sx={{ flex:1, bgcolor:"#fff", borderRadius:"5px", px:1, py:0.15, mx:0.5, display:"flex", alignItems:"center", gap:0.5 }}>
          <Typography sx={{ fontSize:"0.5rem", color:"#aaa" }}>🔒 stg.zpdigital.fr</Typography>
        </Box>
      </Box>
      {children}
    </Box>
  );
}

/* ── Planning ───────────────────────────────────────────── */
function PlanningMock() {
  const techs = ["K. Benali","A. Morad","S. Radi"];
  const hours  = ["8h","9h","10h","11h","12h"];
  const COLS   = 5;
  const slots  = [
    [{ col:0, span:2, label:"Vidange Golf VII", c:"#1976d2" }, { col:3, span:2, label:"CT BMW 320", c:"#388e3c" }],
    [{ col:1, span:3, label:"Révision complète Clio", c:"#f57c00" }],
    [{ col:0, span:1, label:"Diagnostic", c:"#7b1fa2" }, { col:2, span:2, label:"Freinage C3", c:"#c62828" }],
  ];
  return (
    <Box sx={{ bgcolor:"#fff", p:1.2 }}>
      <Box display="flex" gap={0.5} mb={0.8} sx={{ borderBottom:"1px solid #e0e0e0", pb:0.5 }}>
        {["Planning","Atelier","Clients","Store"].map((t,i) => (
          <Box key={t} sx={{ px:1, py:0.2, borderRadius:"3px 3px 0 0", bgcolor: i===0?"#1976d2":"transparent" }}>
            <Typography sx={{ fontSize:"0.48rem", color: i===0?"#fff":"#bbb", fontWeight: i===0?700:400 }}>{t}</Typography>
          </Box>
        ))}
      </Box>
      <Box display="flex" pl="50px" mb={0.3}>
        {hours.map(h => <Box key={h} sx={{ flex:1, textAlign:"center" }}><Typography sx={{ fontSize:"0.42rem", color:"#ccc" }}>{h}</Typography></Box>)}
      </Box>
      {techs.map((tech,ri) => (
        <Box key={tech} display="flex" alignItems="center" mb={0.5}>
          <Box sx={{ width:50, flexShrink:0 }}>
            <Typography sx={{ fontSize:"0.45rem", color:"#888", pr:0.5, textAlign:"right" }}>{tech}</Typography>
          </Box>
          <Box sx={{ flex:1, position:"relative", height:18, bgcolor:"#f5f5f5", borderRadius:"3px" }}>
            {slots[ri].map((ev,ei) => (
              <Box key={ei} sx={{
                position:"absolute", left:`${(ev.col/COLS)*100}%`, width:`${(ev.span/COLS)*100}%`,
                top:1, bottom:1, bgcolor:ev.c, borderRadius:"3px", px:0.5,
                display:"flex", alignItems:"center", overflow:"hidden",
              }}>
                <Typography sx={{ fontSize:"0.42rem", color:"#fff", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ev.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/* ── Devis / Facture ────────────────────────────────────── */
function DeuisMock({ label = "DEVIS #2026-089" }) {
  const lines = [
    { label:"Vidange moteur + filtre", qty:1, pu:"55.00", total:"55.00" },
    { label:"Filtres habitacle", qty:2, pu:"18.50", total:"37.00" },
    { label:"Main d'œuvre (1h)", qty:1, pu:"45.00", total:"45.00" },
  ];
  return (
    <Box sx={{ bgcolor:"#fff", p:1.5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box>
          <Box sx={{ width:36, height:7, bgcolor:"#1976d2", borderRadius:1, mb:0.4 }} />
          <Typography sx={{ fontSize:"0.45rem", color:"#bbb" }}>Garage Auto Pro</Typography>
        </Box>
        <Box textAlign="right">
          <Typography sx={{ fontSize:"0.52rem", fontWeight:700, color:"#1976d2" }}>{label}</Typography>
          <Typography sx={{ fontSize:"0.42rem", color:"#ccc" }}>29/04/2026</Typography>
        </Box>
      </Box>
      <Box sx={{ bgcolor:"#1976d2", borderRadius:"3px 3px 0 0", px:0.8, py:0.3, display:"flex", gap:1 }}>
        {["Désignation","Qté","P.U","Total"].map(h => (
          <Typography key={h} sx={{ fontSize:"0.42rem", color:"#fff", fontWeight:600, flex: h==="Désignation"?3:1, textAlign: h==="Désignation"?"left":"right" }}>{h}</Typography>
        ))}
      </Box>
      {lines.map((l,i) => (
        <Box key={i} sx={{ display:"flex", gap:1, px:0.8, py:0.35, bgcolor: i%2===0?"#f9f9f9":"#fff", borderBottom:"1px solid #f0f0f0" }}>
          <Typography sx={{ fontSize:"0.42rem", flex:3, color:"#444" }}>{l.label}</Typography>
          <Typography sx={{ fontSize:"0.42rem", flex:1, textAlign:"right", color:"#888" }}>{l.qty}</Typography>
          <Typography sx={{ fontSize:"0.42rem", flex:1, textAlign:"right", color:"#888" }}>{l.pu}</Typography>
          <Typography sx={{ fontSize:"0.42rem", flex:1, textAlign:"right", fontWeight:600, color:"#333" }}>{l.total}</Typography>
        </Box>
      ))}
      <Box display="flex" justifyContent="flex-end" mt={0.8}>
        <Box sx={{ border:"1.5px solid #1976d2", borderRadius:1, px:1, py:0.3 }}>
          <Typography sx={{ fontSize:"0.48rem", fontWeight:800, color:"#1976d2" }}>TOTAL TTC : 165.72 €</Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ── Clients CRM ────────────────────────────────────────── */
function ClientsMock() {
  const clients = [
    { name:"Karim Benali",     plate:"AB-234-CD", last:"Vidange",  status:"Actif",  c:"#388e3c" },
    { name:"Fatima Laaroussi", plate:"XY-891-ZA", last:"Freinage", status:"RDV",    c:"#1976d2" },
    { name:"Youssef Merini",   plate:"TC-045-BK", last:"CT requis",status:"Alerte", c:"#f57c00" },
  ];
  return (
    <Box sx={{ bgcolor:"#fff", p:1.2 }}>
      <Box sx={{ border:"1px solid #e0e0e0", borderRadius:1, px:1, py:0.4, mb:0.8, display:"flex", alignItems:"center", gap:0.5 }}>
        <Box sx={{ width:7, height:7, borderRadius:"50%", border:"1.5px solid #bbb" }} />
        <Typography sx={{ fontSize:"0.42rem", color:"#ccc" }}>Rechercher un client…</Typography>
      </Box>
      {clients.map((c,i) => (
        <Box key={i} sx={{ display:"flex", alignItems:"center", gap:0.8, py:0.5, borderBottom:"1px solid #f5f5f5" }}>
          <Box sx={{ width:20, height:20, borderRadius:"50%", bgcolor:c.c, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Typography sx={{ fontSize:"0.45rem", color:"#fff", fontWeight:700 }}>{c.name[0]}</Typography>
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography sx={{ fontSize:"0.46rem", fontWeight:600, color:"#333", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.name}</Typography>
            <Typography sx={{ fontSize:"0.4rem", color:"#bbb" }}>{c.plate} · {c.last}</Typography>
          </Box>
          <Box sx={{ px:0.5, py:0.15, bgcolor:c.c+"22", borderRadius:0.5, flexShrink:0 }}>
            <Typography sx={{ fontSize:"0.4rem", color:c.c, fontWeight:700 }}>{c.status}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/* ── Véhicules ──────────────────────────────────────────── */
function VehicleMock() {
  return (
    <Box sx={{ bgcolor:"#fff", p:1.2 }}>
      <Box sx={{ border:"1px solid #e0e0e0", borderRadius:1.5, p:1, mb:0.8 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Box>
            <Typography sx={{ fontSize:"0.52rem", fontWeight:800, color:"#333" }}>AB-234-CD</Typography>
            <Typography sx={{ fontSize:"0.42rem", color:"#bbb" }}>Renault Clio IV · 2019 · Blanc</Typography>
          </Box>
          <Box sx={{ px:0.6, py:0.2, bgcolor:"#e3f2fd", borderRadius:0.5 }}>
            <Typography sx={{ fontSize:"0.42rem", color:"#1976d2", fontWeight:700 }}>85 400 km</Typography>
          </Box>
        </Box>
        {[{ label:"CT", val:"02/2026", c:"#f57c00" }, { label:"Dernière visite", val:"14/01/2026", c:"#388e3c" }, { label:"VIN", val:"VF1KS000...", c:"#999" }].map(r => (
          <Box key={r.label} display="flex" justifyContent="space-between" mb={0.25}>
            <Typography sx={{ fontSize:"0.4rem", color:"#ccc" }}>{r.label}</Typography>
            <Typography sx={{ fontSize:"0.4rem", color:r.c, fontWeight:600 }}>{r.val}</Typography>
          </Box>
        ))}
      </Box>
      <Typography sx={{ fontSize:"0.45rem", fontWeight:700, color:"#333", mb:0.4 }}>Historique</Typography>
      {[{ date:"14/01", label:"Vidange + filtres" }, { date:"08/09", label:"Remplacement courroie" }].map((h,i) => (
        <Box key={i} display="flex" gap={0.5} alignItems="center" mb={0.3}>
          <Box sx={{ width:5, height:5, borderRadius:"50%", bgcolor:"#1976d2", flexShrink:0 }} />
          <Typography sx={{ fontSize:"0.4rem", color:"#bbb" }}>{h.date}</Typography>
          <Typography sx={{ fontSize:"0.4rem", color:"#555" }}>{h.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

/* ── Stock ──────────────────────────────────────────────── */
function StockMock() {
  const items = [
    { label:"Filtre huile BOSCH",    ref:"0986AF154", stock:12, max:20, c:"#388e3c" },
    { label:"Plaquettes AV BREMBO",  ref:"P85020",    stock:3,  max:10, c:"#f57c00" },
    { label:"Courroie distrib GATES",ref:"K015653XS", stock:0,  max:5,  c:"#c62828" },
  ];
  return (
    <Box sx={{ bgcolor:"#fff", p:1.2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.8}>
        <Typography sx={{ fontSize:"0.48rem", fontWeight:700, color:"#333" }}>Stock articles</Typography>
        <Box sx={{ px:0.6, py:0.15, bgcolor:"#1976d2", borderRadius:0.5 }}>
          <Typography sx={{ fontSize:"0.4rem", color:"#fff", fontWeight:600 }}>+ Ajouter</Typography>
        </Box>
      </Box>
      {items.map((it,i) => (
        <Box key={i} sx={{ py:0.5, borderBottom:"1px solid #f5f5f5" }}>
          <Box display="flex" justifyContent="space-between" mb={0.15}>
            <Typography sx={{ fontSize:"0.45rem", fontWeight:600, color:"#333" }}>{it.label}</Typography>
            <Typography sx={{ fontSize:"0.42rem", color: it.stock===0?"#c62828": it.stock<5?"#f57c00":"#388e3c", fontWeight:700 }}>
              {it.stock===0 ? "Rupture" : `${it.stock} en stock`}
            </Typography>
          </Box>
          <Typography sx={{ fontSize:"0.38rem", color:"#ccc", mb:0.3 }}>Réf: {it.ref}</Typography>
          <Box sx={{ height:4, bgcolor:"#f0f0f0", borderRadius:2 }}>
            <Box sx={{ height:"100%", width:`${Math.min((it.stock/it.max)*100,100)}%`, bgcolor:it.c, borderRadius:2 }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/* ── Reporting ──────────────────────────────────────────── */
function ReportingMock() {
  const months = ["Jan","Fév","Mar","Avr","Mai","Jun"];
  const vals   = [62, 78, 55, 90, 85, 95];
  const maxV   = Math.max(...vals);
  return (
    <Box sx={{ bgcolor:"#fff", p:1.2 }}>
      <Box display="flex" gap={0.8} mb={1}>
        {[{ label:"CA mois", val:"12 840 €", c:"#1976d2" }, { label:"Interventions", val:"47", c:"#388e3c" }, { label:"Marge", val:"38%", c:"#f57c00" }].map(k => (
          <Box key={k.label} sx={{ flex:1, border:"1px solid", borderColor:k.c+"33", borderRadius:1, p:0.5, textAlign:"center" }}>
            <Typography sx={{ fontSize:"0.5rem", fontWeight:800, color:k.c }}>{k.val}</Typography>
            <Typography sx={{ fontSize:"0.38rem", color:"#bbb" }}>{k.label}</Typography>
          </Box>
        ))}
      </Box>
      <Box display="flex" alignItems="flex-end" gap={0.5} sx={{ height:48, mt:1 }}>
        {months.map((m,i) => (
          <Box key={m} sx={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:0.3 }}>
            <Box sx={{ width:"100%", height:`${(vals[i]/maxV)*42}px`, bgcolor: i===5?"#1976d2":"#bbdefb", borderRadius:"2px 2px 0 0" }} />
            <Typography sx={{ fontSize:"0.38rem", color:"#ccc" }}>{m}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ── Sélecteur de mockup par ID de fonctionnalité ───────── */
function FeatureMockup({ id }) {
  switch (id) {
    case "planning":    return <PlanningMock />;
    case "devis":       return <DeuisMock label="DEVIS #2026-089" />;
    case "facturation": return <DeuisMock label="FACTURE #2026-042" />;
    case "clients":     return <ClientsMock />;
    case "stock":       return <StockMock />;
    case "reporting":   return <ReportingMock />;
    default:            return <PlanningMock />;
  }
}

/* ─────────────────────────────────────────────────────────
   Navbar
───────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Fonctionnalités", anchor: "fonctionnalites" },
  { label: "Schéma",         anchor: "schema"           },
  { label: "Tarifs",         anchor: "tarifs"           },
  { label: "Témoignages",    anchor: "temoignages"      },
  { label: "FAQ",            anchor: "faq"              },
];

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleNavClick(anchor) {
    setDrawerOpen(false);
    setTimeout(() => scrollTo(anchor), 150); // laisser le drawer se fermer d'abord
  }

  return (
    <>
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider", color: "text.primary" }}>
        <Toolbar sx={{ maxWidth: 1200, mx: "auto", width: "100%", px: { xs: 2, md: 4 } }}>

          {/* Logo */}
          <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BuildIcon sx={{ fontSize: 18, color: "#fff" }} />
            </Box>
            <Typography variant="h6" fontWeight={800} color="text.primary">
              ZP<Typography component="span" color="primary.main" fontWeight={800}>Garage</Typography>
            </Typography>
          </Box>

          {/* Liens desktop */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, alignItems: "center" }}>
            {NAV_LINKS.map(({ label, anchor }) => (
              <Typography key={anchor} variant="body2" fontWeight={500} color="text.secondary"
                onClick={() => scrollTo(anchor)}
                sx={{ cursor: "pointer", transition: "color 0.2s", "&:hover": { color: "primary.main" } }}>
                {label}
              </Typography>
            ))}
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Button component={Link} to="/" size="small" variant="outlined">Se connecter</Button>
            <Button component={Link} to="/register" size="small" variant="contained">Essai gratuit</Button>
          </Box>

          {/* Hamburger mobile */}
          <IconButton
            sx={{ display: { md: "none" } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* ── Drawer mobile ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* En-tête drawer */}
        <Box
          display="flex" alignItems="center" justifyContent="space-between"
          px={2.5} py={2}
          sx={{ borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BuildIcon sx={{ fontSize: 16, color: "#fff" }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={800}>
              ZP<Typography component="span" color="primary.main" fontWeight={800}>Garage</Typography>
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Liens de navigation */}
        <List sx={{ flex: 1, pt: 1 }}>
          {NAV_LINKS.map(({ label, anchor }) => (
            <ListItemButton
              key={anchor}
              onClick={() => handleNavClick(anchor)}
              sx={{
                mx: 1, borderRadius: 2, mb: 0.5,
                "&:hover": { bgcolor: "primary.50", "& .MuiListItemText-primary": { color: "primary.main" } },
              }}
            >
              <ListItemText
                primary={label}
                primaryTypographyProps={{ variant: "body1", fontWeight: 500 }}
              />
            </ListItemButton>
          ))}
        </List>

        {/* CTA en bas du drawer */}
        <Box
          px={2.5} py={2.5}
          sx={{ borderTop: "1px solid", borderColor: "divider" }}
          display="flex" flexDirection="column" gap={1.5}
        >
          <Button
            component={Link} to="/"
            variant="outlined" fullWidth
            onClick={() => setDrawerOpen(false)}
          >
            Se connecter
          </Button>
          <Button
            component={Link} to="/register"
            variant="contained" fullWidth
            onClick={() => setDrawerOpen(false)}
          >
            Démarrer gratuitement
          </Button>
        </Box>
      </Drawer>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Hero
───────────────────────────────────────────────────────── */
function Hero() {
  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const textBlock = (
    <Box>
      <Chip label="⚡ Nouvelle version disponible" size="small" color="primary" variant="outlined" sx={{ mb: 3, fontWeight: 600 }} />
      <Typography variant="h2" fontWeight={900} lineHeight={1.15} gutterBottom sx={{ fontSize: { xs: "2.2rem", md: "2.8rem" } }}>
        Gérez votre garage.{" "}
        <Typography component="span" variant="inherit" sx={{ color: "primary.main", position: "relative",
          "&::after": { content: '""', position: "absolute", bottom: 2, left: 0, right: 0, height: 4, bgcolor: "primary.main", opacity: 0.2, borderRadius: 2 } }}>
          On s'occupe du reste.
        </Typography>
      </Typography>
      <Typography variant="h6" color="text.secondary" fontWeight={400} mb={4} lineHeight={1.6} sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}>
        La plateforme tout-en-un pour les garages modernes. Planning, devis, facturation, stock et gestion clients — dans un seul outil.
      </Typography>
      <Box display="flex" gap={2} flexWrap="wrap" mb={4}>
        <Button component={Link} to="/register" variant="contained" size="large"
          sx={{ px: 4, py: 1.5, fontWeight: 700, fontSize: "1rem", borderRadius: 2 }}>
          Démarrer gratuitement
        </Button>
        <Button variant="outlined" size="large"
          sx={{ px: 4, py: 1.5, fontWeight: 600, fontSize: "1rem", borderRadius: 2 }}>
          Voir une démo
        </Button>
      </Box>
      <Box display="flex" gap={2.5} flexWrap="wrap">
        {["✓ Sans carte bancaire", "✓ 1 mois gratuit", "✓ Support inclus"].map(t => (
          <Typography key={t} variant="body2" color="text.secondary" fontWeight={500}>{t}</Typography>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      pt: { xs: 14, md: 16 }, pb: { xs: 8, md: 10 },
      background: theme.palette.mode === "dark"
        ? `linear-gradient(160deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
        : "linear-gradient(160deg, #f0f7ff 0%, #ffffff 60%, #fff8f0 100%)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Déco */}
      <Box sx={{ position:"absolute", top:-100, right:-100, width:360, height:360, borderRadius:"50%", bgcolor:"primary.main", opacity:0.04, pointerEvents:"none" }} />
      <Box sx={{ position:"absolute", bottom:-60, left:-60, width:260, height:260, borderRadius:"50%", bgcolor:"warning.main", opacity:0.05, pointerEvents:"none" }} />

      <Container maxWidth="lg">
        {isMobile ? (
          /* ── Mobile : centré, sans mockup ── */
          <Box textAlign="center">
            {textBlock}
          </Box>
        ) : (
          /* ── Desktop : split — texte gauche, mockup droite ── */
          <Grid container spacing={6} alignItems="center">
            <Grid item md={5}>
              {textBlock}
            </Grid>
            <Grid item md={7}>
              {/* Légère inclinaison pour l'effet "screenshot flottant" */}
              <Box sx={{ transform: "perspective(1000px) rotateY(-4deg) rotateX(2deg)", transformOrigin: "left center", transition: "transform 0.3s", "&:hover": { transform: "perspective(1000px) rotateY(-1deg) rotateX(0.5deg)" } }}>
                <BrowserFrame>
                  <PlanningMock />
                </BrowserFrame>
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Stats
───────────────────────────────────────────────────────── */
function Stats() {
  return (
    <Box sx={{ bgcolor: "primary.main", py: 5 }}>
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent="center">
          {STATS.map(s => (
            <Grid item xs={6} md={3} key={s.label} textAlign="center">
              <Typography variant="h3" fontWeight={900} color="#fff">{s.value}</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>{s.label}</Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Fonctionnalités (cards)
───────────────────────────────────────────────────────── */
function Features() {
  return (
    <Box id="fonctionnalites" py={{ xs: 10, md: 14 }} sx={{ bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <SectionTitle subtitle="Tout ce dont votre garage a besoin, sans la complexité. Une seule plateforme pour remplacer vos tableurs, carnets et logiciels éparpillés.">
          Toutes les fonctionnalités essentielles
        </SectionTitle>
        <Grid container spacing={3}>
          {FEATURES.map((f) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Card variant="outlined" sx={{ height: "100%", transition: "box-shadow 0.2s, transform 0.2s", "&:hover": { boxShadow: 6, transform: "translateY(-4px)" }, bgcolor: "background.paper", overflow: "hidden" }}>
                {/* Mini mockup en haut de la carte */}
                <Box sx={{ borderBottom: "1px solid", borderColor: "divider", overflow: "hidden", maxHeight: 130, position: "relative" }}>
                  <Box sx={{ transform: "scale(0.72)", transformOrigin: "top left", width: "139%" }}>
                    <FeatureMockup id={f.mockId} />
                  </Box>
                  {/* Dégradé de fondu vers le bas */}
                  <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, var(--mui-palette-background-paper, #fff))` }} />
                </Box>
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: f.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, "& svg": { color: "#fff", fontSize: 20 } }}>
                      {f.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700}>{f.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{f.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   SCHÉMA INTERACTIF — panneau info (commun desktop + mobile)
───────────────────────────────────────────────────────── */
function SchemaInfoPanel({ activeNode, active, setActive }) {
  return (
    <Box width="100%">
      <Paper
        variant="outlined"
        sx={{
          p: 3, borderRadius: 3,
          borderColor: activeNode.color,
          borderWidth: 2,
          bgcolor: "background.paper",
          transition: "border-color 0.3s",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: activeNode.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <activeNode.icon sx={{ fontSize: 22, color: "#fff" }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>{activeNode.label}</Typography>
            <Chip label={activeNode.badge} size="small"
              sx={{ bgcolor: activeNode.color, color: "#fff", fontSize: "0.6rem", height: 18, fontWeight: 700 }} />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" lineHeight={1.7} mb={2}>
          {activeNode.description}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box display="flex" flexDirection="column" gap={1}>
          {activeNode.details.map(d => (
            <Box key={d} display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon sx={{ fontSize: 15, color: activeNode.color, flexShrink: 0 }} />
              <Typography variant="body2" fontWeight={500}>{d}</Typography>
            </Box>
          ))}
        </Box>

        <Button
          component={Link} to="/register" variant="contained" fullWidth
          sx={{ mt: 2.5, bgcolor: activeNode.color, "&:hover": { bgcolor: activeNode.color, filter: "brightness(0.88)" }, fontWeight: 700, borderRadius: 2 }}
        >
          Essayer {activeNode.label} gratuitement
        </Button>

        {/* Mini aperçu de l'interface du module */}
        <Box mt={2} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider", maxHeight: 140, position: "relative" }}>
          <Box sx={{ transform: "scale(0.75)", transformOrigin: "top left", width: "133%" }}>
            <FeatureMockup id={activeNode.id} />
          </Box>
          <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, background: "linear-gradient(transparent, var(--mui-palette-background-paper, #fff))" }} />
        </Box>
      </Paper>

      {/* Dots de navigation */}
      <Box display="flex" justifyContent="center" gap={1} mt={2}>
        {SCHEMA_NODES.map(n => (
          <Box key={n.id} onClick={() => setActive(n.id)}
            sx={{ width: active === n.id ? 20 : 8, height: 8, borderRadius: 4, bgcolor: active === n.id ? n.color : "action.disabled", cursor: "pointer", transition: "all 0.3s" }}
          />
        ))}
      </Box>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   SCHÉMA INTERACTIF — version mobile (grille 3×2)
───────────────────────────────────────────────────────── */
function SchemaMobile({ active, setActive, activeNode }) {
  return (
    <Box width="100%">
      {/* Grille 3 colonnes de boutons */}
      <Grid container spacing={1.5} mb={3}>
        {SCHEMA_NODES.map(node => {
          const isActive = node.id === active;
          const Icon = node.icon;
          return (
            <Grid item xs={4} key={node.id}>
              <Box
                onClick={() => setActive(node.id)}
                sx={{
                  borderRadius: 2.5,
                  border: "2px solid",
                  borderColor: isActive ? node.color : "divider",
                  bgcolor: isActive ? node.color : "background.paper",
                  p: 1.5,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.22s ease",
                  boxShadow: isActive ? `0 4px 14px ${node.color}44` : "none",
                  "&:active": { transform: "scale(0.96)" },
                }}
              >
                <Icon sx={{ fontSize: 26, color: isActive ? "#fff" : node.color, display: "block", mx: "auto", mb: 0.5 }} />
                <Typography variant="caption" fontWeight={700} display="block"
                  sx={{ fontSize: "0.62rem", lineHeight: 1.2, color: isActive ? "#fff" : "text.secondary" }}>
                  {node.label}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <SchemaInfoPanel activeNode={activeNode} active={active} setActive={setActive} />
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   SCHÉMA INTERACTIF — version desktop (hub & spoke SVG)
───────────────────────────────────────────────────────── */
function SchemaDesktop({ active, setActive, activeNode }) {
  const theme = useTheme();
  const W = 460; const H = 460;
  const cx = W / 2; const cy = H / 2;
  const R  = 160;

  return (
    <Box display="flex" gap={4} alignItems="center" width="100%">
      {/* Hub-and-spoke */}
      <Box sx={{ flexShrink: 0, position: "relative", width: W, height: H }}>
        <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
          {SCHEMA_NODES.map(node => {
            const x = cx + R * Math.cos(deg2rad(node.angle));
            const y = cy + R * Math.sin(deg2rad(node.angle));
            const isActive = node.id === active;
            return (
              <g key={node.id}>
                {isActive && (
                  <line x1={cx} y1={cy} x2={x} y2={y}
                    stroke={node.color} strokeWidth="3" strokeDasharray="6 4" opacity="0.25" />
                )}
                <line x1={cx} y1={cy} x2={x} y2={y}
                  stroke={isActive ? node.color : theme.palette.divider}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  opacity={isActive ? 1 : 0.5}
                  style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                />
                <circle
                  cx={cx + R * 0.54 * Math.cos(deg2rad(node.angle))}
                  cy={cy + R * 0.54 * Math.sin(deg2rad(node.angle))}
                  r={isActive ? 5 : 3}
                  fill={isActive ? node.color : theme.palette.action.disabled}
                  style={{ transition: "r 0.3s, fill 0.3s" }}
                />
              </g>
            );
          })}
        </svg>

        {/* Centre */}
        <Box sx={{
          position: "absolute", left: cx, top: cy, transform: "translate(-50%,-50%)",
          width: 88, height: 88, borderRadius: "50%", bgcolor: "primary.main",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 0 10px ${theme.palette.primary.main}22`, zIndex: 2,
        }}>
          <BuildIcon sx={{ fontSize: 24, color: "#fff" }} />
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.55rem", mt: 0.3, textAlign: "center", lineHeight: 1.2 }}>
            ZP<br />Garage
          </Typography>
        </Box>

        {/* Nœuds */}
        {SCHEMA_NODES.map(node => {
          const x = cx + R * Math.cos(deg2rad(node.angle));
          const y = cy + R * Math.sin(deg2rad(node.angle));
          const isActive = node.id === active;
          const Icon = node.icon;
          return (
            <Box key={node.id} onClick={() => setActive(node.id)}
              sx={{
                position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)",
                width: isActive ? 74 : 62, height: isActive ? 74 : 62,
                borderRadius: "50%",
                bgcolor: isActive ? node.color : "background.paper",
                border: "2.5px solid", borderColor: isActive ? node.color : theme.palette.divider,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer", zIndex: 3, transition: "all 0.25s ease",
                boxShadow: isActive ? `0 4px 18px ${node.color}55` : "none",
                "&:hover": { borderColor: node.color, transform: "translate(-50%,-50%) scale(1.1)" },
              }}
            >
              <Icon sx={{ fontSize: 22, color: isActive ? "#fff" : node.color, transition: "color 0.25s" }} />
              <Typography sx={{ fontSize: "0.52rem", fontWeight: 700, mt: 0.3, lineHeight: 1, color: isActive ? "#fff" : "text.secondary", transition: "color 0.25s" }}>
                {node.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Panneau info */}
      <Box flex={1} maxWidth={400}>
        <SchemaInfoPanel activeNode={activeNode} active={active} setActive={setActive} />
      </Box>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   SCHÉMA INTERACTIF — conteneur principal
───────────────────────────────────────────────────────── */
function InteractiveSchema() {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [active, setActive] = useState(SCHEMA_NODES[0].id);
  const activeNode = SCHEMA_NODES.find(n => n.id === active);

  return (
    <Box
      id="schema"
      py={{ xs: 8, md: 14 }}
      sx={{ bgcolor: theme.palette.mode === "dark" ? "background.paper" : "#f8faff", overflow: "hidden" }}
    >
      <Container maxWidth="lg">
        <SectionTitle subtitle="Appuyez sur un module pour découvrir comment il s'intègre dans votre quotidien.">
          Une plateforme, tout connecté
        </SectionTitle>

        {isMobile
          ? <SchemaMobile active={active} setActive={setActive} activeNode={activeNode} />
          : <SchemaDesktop active={active} setActive={setActive} activeNode={activeNode} />
        }
      </Container>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Comment ça marche
───────────────────────────────────────────────────────── */
function HowItWorks() {
  const theme = useTheme();
  return (
    <Box py={{ xs: 10, md: 14 }} sx={{ bgcolor: theme.palette.mode === "dark" ? "background.default" : "grey.50" }}>
      <Container maxWidth="lg">
        <SectionTitle subtitle="Opérationnel en moins d'une journée. Aucune installation, aucune compétence technique requise.">
          Prêt en 3 étapes
        </SectionTitle>
        <Grid container spacing={4} alignItems="flex-start">
          {STEPS.map((s) => (
            <Grid item xs={12} md={4} key={s.step}>
              <Box textAlign="center" px={2}>
                <Typography variant="h1" fontWeight={900} sx={{ color: "primary.main", opacity: 0.15, lineHeight: 1, mb: 1, fontSize: "5rem" }}>{s.step}</Typography>
                <Typography variant="h6" fontWeight={700} gutterBottom>{s.title}</Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7}>{s.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Tarifs
───────────────────────────────────────────────────────── */
function Pricing() {
  return (
    <Box id="tarifs" py={{ xs: 10, md: 14 }} sx={{ bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <SectionTitle subtitle="Des tarifs simples et transparents. Pas de frais cachés, pas d'engagement long terme.">
          Tarifs adaptés à votre garage
        </SectionTitle>
        <Grid container spacing={3} alignItems="stretch" justifyContent="center">
          {PLANS.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.name}>
              <Card
                variant={plan.color === "primary" ? "elevation" : "outlined"}
                elevation={plan.color === "primary" ? 8 : 0}
                sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, position: "relative", overflow: "visible",
                  ...(plan.color === "primary" && { border: "2px solid", borderColor: "primary.main", bgcolor: "background.paper" }) }}
              >
                {plan.badge && (
                  <Chip label={plan.badge} color="primary" size="small" sx={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", fontWeight: 700, px: 1 }} />
                )}
                <CardContent sx={{ p: 3.5, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={1}>{plan.name}</Typography>
                  <Box display="flex" alignItems="baseline" gap={0.5} mb={1}>
                    <Typography variant="h3" fontWeight={900}>{plan.price}</Typography>
                    {plan.period && <Typography variant="body2" color="text.secondary">{plan.period}</Typography>}
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={3}>{plan.desc}</Typography>
                  <Divider sx={{ mb: 2.5 }} />
                  <Box flex={1}>
                    {plan.features.map(f => (
                      <Box key={f} display="flex" alignItems="center" gap={1} mb={1.2}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: "success.main", flexShrink: 0 }} />
                        <Typography variant="body2">{f}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button component={Link} to="/register" variant={plan.variant} color={plan.color === "primary" ? "primary" : "inherit"}
                    fullWidth size="large" sx={{ mt: 3, fontWeight: 700, borderRadius: 2 }}>
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Typography variant="body2" color="text.disabled" textAlign="center" mt={4}>
          Tous les tarifs sont HT. TVA applicable selon votre pays. Annulation possible à tout moment.
        </Typography>
      </Container>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Témoignages
───────────────────────────────────────────────────────── */
function Testimonials() {
  const theme = useTheme();
  return (
    <Box id="temoignages" py={{ xs: 10, md: 14 }} sx={{ bgcolor: theme.palette.mode === "dark" ? "background.paper" : "grey.50" }}>
      <Container maxWidth="lg">
        <SectionTitle subtitle="Des professionnels de l'automobile qui ont transformé leur quotidien.">
          Ils nous font confiance
        </SectionTitle>
        <Grid container spacing={3}>
          {TESTIMONIALS.map((t) => (
            <Grid item xs={12} md={4} key={t.name}>
              <Paper variant="outlined" sx={{ p: 3.5, height: "100%", borderRadius: 3, bgcolor: "background.paper", display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>{"★★★★★".split("").map((s, i) => <Typography key={i} component="span" sx={{ color: "#f59e0b", fontSize: 18 }}>{s}</Typography>)}</Box>
                <Typography variant="body1" color="text.secondary" lineHeight={1.7} flex={1}>« {t.quote} »</Typography>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40, fontWeight: 700 }}>{t.initials}</Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{t.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{t.role}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Q&A — En savoir plus sur nos offres
───────────────────────────────────────────────────────── */
function FAQ() {
  const [expanded, setExpanded] = useState(false);
  const toggle = (panel) => (_, isExpanded) => setExpanded(isExpanded ? panel : false);

  return (
    <Box id="faq" py={{ xs: 10, md: 14 }} sx={{ bgcolor: "background.default" }}>
      <Container maxWidth="md">
        <SectionTitle subtitle="Tout ce que vous devez savoir avant de vous lancer.">
          En savoir plus sur nos offres
        </SectionTitle>

        <Box>
          {FAQ_ITEMS.map((item, i) => (
            <Accordion
              key={i}
              expanded={expanded === i}
              onChange={toggle(i)}
              variant="outlined"
              disableGutters
              sx={{
                mb: 1.5,
                borderRadius: "12px !important",
                overflow: "hidden",
                "&:before": { display: "none" },
                transition: "box-shadow 0.2s",
                boxShadow: expanded === i ? 2 : 0,
              }}
            >
              <AccordionSummary
                expandIcon={
                  <Box
                    sx={{
                      width: 28, height: 28, borderRadius: "50%",
                      bgcolor: expanded === i ? "primary.main" : "action.hover",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "bgcolor 0.2s",
                    }}
                  >
                    <ExpandMoreIcon
                      sx={{
                        fontSize: 18,
                        color: expanded === i ? "#fff" : "text.secondary",
                        transition: "transform 0.3s",
                        transform: expanded === i ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </Box>
                }
                sx={{
                  px: 3, py: 1.5,
                  bgcolor: expanded === i ? "primary.50" : "background.paper",
                  "& .MuiAccordionSummary-content": { my: 0 },
                }}
              >
                <Typography variant="subtitle1" fontWeight={expanded === i ? 700 : 500}>
                  {item.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 2.5, pt: 0, bgcolor: "background.paper" }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* CTA contact */}
        <Box
          mt={6}
          p={4}
          sx={{
            borderRadius: 3,
            border: "1px dashed",
            borderColor: "primary.main",
            textAlign: "center",
            bgcolor: "primary.50",
          }}
        >
          <SupportAgentIcon sx={{ fontSize: 36, color: "primary.main", mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Vous ne trouvez pas votre réponse ?
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2.5}>
            Notre équipe est disponible du lundi au samedi de 8h à 19h.
          </Typography>
          <Box display="flex" gap={1.5} justifyContent="center" flexWrap="wrap">
            <Button variant="contained" size="small">Nous contacter</Button>
            <Button variant="outlined" size="small">Voir la documentation</Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   CTA final
───────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <Box py={{ xs: 10, md: 14 }} sx={{ background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)", textAlign: "center" }}>
      <Container maxWidth="sm">
        <SupportAgentIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.6)", mb: 2 }} />
        <Typography variant="h4" fontWeight={900} color="#fff" gutterBottom>Prêt à moderniser votre garage ?</Typography>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.75)", mb: 5 }}>
          Rejoignez des centaines de garagistes qui ont gagné du temps, réduit leurs erreurs et amélioré leur relation client.
        </Typography>
        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
          <Button component={Link} to="/register" variant="contained" size="large"
            sx={{ px: 5, py: 1.5, fontWeight: 700, fontSize: "1rem", borderRadius: 2, bgcolor: "#fff", color: "primary.main", "&:hover": { bgcolor: "grey.100" } }}>
            Démarrer gratuitement
          </Button>
          <Button variant="outlined" size="large"
            sx={{ px: 4, py: 1.5, fontWeight: 600, fontSize: "1rem", borderRadius: 2, borderColor: "rgba(255,255,255,0.5)", color: "#fff", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" } }}>
            Demander une démo
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Footer
───────────────────────────────────────────────────────── */
function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BuildIcon sx={{ fontSize: 16, color: "#fff" }} />
              </Box>
              <Typography variant="h6" fontWeight={800}>
                ZP<Typography component="span" color="primary.main" fontWeight={800}>Garage</Typography>
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" lineHeight={1.7} maxWidth={280}>
              La plateforme de gestion tout-en-un pensée pour les professionnels de l'automobile.
            </Typography>
          </Grid>
          {[
            { title: "Produit",  links: ["Fonctionnalités", "Tarifs", "Nouveautés", "Feuille de route"]               },
            { title: "Support",  links: ["Centre d'aide", "Documentation", "Contact", "Formations"]                    },
            { title: "Légal",    links: ["Mentions légales", "CGU", "Politique de confidentialité", "Cookies"]         },
          ].map((col) => (
            <Grid item xs={6} md={2.5} key={col.title}>
              <Typography variant="subtitle2" fontWeight={700} mb={2}>{col.title}</Typography>
              {col.links.map(l => (
                <Typography key={l} variant="body2" color="text.secondary" display="block" mb={1} sx={{ cursor: "pointer", "&:hover": { color: "text.primary" } }}>{l}</Typography>
              ))}
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 4 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography variant="caption" color="text.disabled">© {new Date().getFullYear()} ZP Digital. Tous droits réservés.</Typography>
          <Box display="flex" gap={1}>
            <Chip icon={<LocalOfferIcon sx={{ fontSize: "14px !important" }} />} label="1 mois gratuit" size="small" color="success" variant="outlined" sx={{ fontSize: "0.65rem" }} />
            <Chip icon={<SupportAgentIcon sx={{ fontSize: "14px !important" }} />} label="Support 6j/7" size="small" color="primary" variant="outlined" sx={{ fontSize: "0.65rem" }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Page principale
───────────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <InteractiveSchema />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </Box>
  );
}
