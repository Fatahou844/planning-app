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
  Grid,
  IconButton,
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
  { icon: <CalendarMonthIcon sx={{ fontSize: 32 }} />, title: "Planning & Atelier",  color: "primary.main",   desc: "Gérez vos créneaux, affectez vos techniciens et suivez l'avancement des interventions en temps réel depuis un planning visuel."  },
  { icon: <AssignmentIcon    sx={{ fontSize: 32 }} />, title: "Devis & Facturation", color: "success.main",   desc: "Créez des devis en quelques clics, convertissez-les en ordres de réparation puis en factures. Tout est traçable et archivé."    },
  { icon: <PeopleIcon        sx={{ fontSize: 32 }} />, title: "Gestion clients",     color: "warning.main",   desc: "Historique complet par client et par véhicule. Retrouvez instantanément les antécédents, les documents et les préférences."     },
  { icon: <DirectionsCarIcon sx={{ fontSize: 32 }} />, title: "Suivi des véhicules", color: "info.main",      desc: "Fiche véhicule complète : kilométrage, VIN, contrôle technique, historique d'interventions. Rien ne se perd."                  },
  { icon: <InventoryIcon     sx={{ fontSize: 32 }} />, title: "Stock & Pièces",      color: "secondary.main", desc: "Gérez votre stock de pièces, importez vos catalogues fournisseurs et générez vos étiquettes prix en un clic."                 },
  { icon: <BarChartIcon      sx={{ fontSize: 32 }} />, title: "Pilotage & Reporting", color: "error.main",    desc: "Tableaux de bord clairs pour suivre votre activité, vos marges et l'efficacité de votre équipe au quotidien."                },
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
   Navbar
───────────────────────────────────────────────────────── */
function Navbar() {
  return (
    <AppBar position="fixed" elevation={0} sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider", color: "text.primary" }}>
      <Toolbar sx={{ maxWidth: 1200, mx: "auto", width: "100%", px: { xs: 2, md: 4 } }}>
        <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BuildIcon sx={{ fontSize: 18, color: "#fff" }} />
          </Box>
          <Typography variant="h6" fontWeight={800} color="text.primary">
            ZP<Typography component="span" color="primary.main" fontWeight={800}>Garage</Typography>
          </Typography>
        </Box>
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, alignItems: "center" }}>
          {["Fonctionnalités", "Tarifs", "Témoignages"].map(l => (
            <Typography key={l} variant="body2" fontWeight={500} color="text.secondary" sx={{ cursor: "pointer", "&:hover": { color: "text.primary" } }}>{l}</Typography>
          ))}
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Button component={Link} to="/" size="small" variant="outlined">Se connecter</Button>
          <Button component={Link} to="/register" size="small" variant="contained">Essai gratuit</Button>
        </Box>
        <IconButton sx={{ display: { md: "none" } }}><MenuIcon /></IconButton>
      </Toolbar>
    </AppBar>
  );
}

/* ─────────────────────────────────────────────────────────
   Hero
───────────────────────────────────────────────────────── */
function Hero() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        pt: { xs: 14, md: 18 }, pb: { xs: 10, md: 14 },
        background: theme.palette.mode === "dark"
          ? `linear-gradient(160deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
          : "linear-gradient(160deg, #f0f7ff 0%, #ffffff 60%, #fff8f0 100%)",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}
    >
      <Box sx={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", bgcolor: "primary.main", opacity: 0.05, pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", bgcolor: "warning.main", opacity: 0.06, pointerEvents: "none" }} />
      <Container maxWidth="md">
        <Chip label="⚡ Nouvelle version disponible" size="small" color="primary" variant="outlined" sx={{ mb: 3, fontWeight: 600 }} />
        <Typography variant="h2" fontWeight={900} lineHeight={1.15} gutterBottom sx={{ fontSize: { xs: "2.2rem", md: "3.2rem" } }}>
          Gérez votre garage.{" "}
          <Typography component="span" variant="inherit" sx={{ color: "primary.main", position: "relative", "&::after": { content: '""', position: "absolute", bottom: 2, left: 0, right: 0, height: 4, bgcolor: "primary.main", opacity: 0.2, borderRadius: 2 } }}>
            On s'occupe du reste.
          </Typography>
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={400} maxWidth={560} mx="auto" mb={5} lineHeight={1.6}>
          La plateforme tout-en-un pour les garages modernes. Planning, devis, facturation, stock et gestion clients — dans un seul outil.
        </Typography>
        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap" mb={6}>
          <Button component={Link} to="/register" variant="contained" size="large" sx={{ px: 4, py: 1.5, fontWeight: 700, fontSize: "1rem", borderRadius: 2 }}>Démarrer gratuitement</Button>
          <Button variant="outlined" size="large" sx={{ px: 4, py: 1.5, fontWeight: 600, fontSize: "1rem", borderRadius: 2 }}>Voir une démo</Button>
        </Box>
        <Box display="flex" gap={3} justifyContent="center" flexWrap="wrap">
          {["✓ Sans carte bancaire", "✓ 1 mois d'essai gratuit", "✓ Support inclus"].map(t => (
            <Typography key={t} variant="body2" color="text.secondary" fontWeight={500}>{t}</Typography>
          ))}
        </Box>
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
    <Box py={{ xs: 10, md: 14 }} sx={{ bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <SectionTitle subtitle="Tout ce dont votre garage a besoin, sans la complexité. Une seule plateforme pour remplacer vos tableurs, carnets et logiciels éparpillés.">
          Toutes les fonctionnalités essentielles
        </SectionTitle>
        <Grid container spacing={3}>
          {FEATURES.map((f) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Card variant="outlined" sx={{ height: "100%", transition: "box-shadow 0.2s, transform 0.2s", "&:hover": { boxShadow: 4, transform: "translateY(-3px)" }, bgcolor: "background.paper" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: f.color, display: "flex", alignItems: "center", justifyContent: "center", mb: 2, "& svg": { color: "#fff" } }}>
                    {f.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>{f.title}</Typography>
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
   SCHÉMA INTERACTIF
───────────────────────────────────────────────────────── */
function InteractiveSchema() {
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down("md"));
  const [active, setActive] = useState(SCHEMA_NODES[0].id);

  const activeNode = SCHEMA_NODES.find(n => n.id === active);

  /* Dimensions du schéma */
  const W = 480;
  const H = 480;
  const cx = W / 2;
  const cy = H / 2;
  const R  = 168;

  return (
    <Box py={{ xs: 10, md: 14 }} sx={{ bgcolor: theme.palette.mode === "dark" ? "background.paper" : "#f8faff" }}>
      <Container maxWidth="lg">
        <SectionTitle subtitle="Cliquez sur un module pour découvrir comment il s'intègre dans votre quotidien.">
          Une plateforme, tout connecté
        </SectionTitle>

        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4} alignItems="center">

          {/* ── Schéma hub-and-spoke ── */}
          <Box sx={{ flexShrink: 0, position: "relative", width: W, height: H, maxWidth: "100%" }}>

            {/* SVG pour les lignes */}
            <svg
              width={W} height={H}
              style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", overflow: "visible" }}
            >
              {SCHEMA_NODES.map(node => {
                const x = cx + R * Math.cos(deg2rad(node.angle));
                const y = cy + R * Math.sin(deg2rad(node.angle));
                const isActive = node.id === active;
                return (
                  <g key={node.id}>
                    {isActive && (
                      <line x1={cx} y1={cy} x2={x} y2={y}
                        stroke={node.color} strokeWidth="3" strokeDasharray="6 4" opacity="0.3" />
                    )}
                    <line
                      x1={cx} y1={cy} x2={x} y2={y}
                      stroke={isActive ? node.color : theme.palette.divider}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      opacity={isActive ? 1 : 0.5}
                      style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                    />
                    {/* Petit cercle le long de la ligne */}
                    <circle
                      cx={cx + (R * 0.55) * Math.cos(deg2rad(node.angle))}
                      cy={cy + (R * 0.55) * Math.sin(deg2rad(node.angle))}
                      r={isActive ? 5 : 3}
                      fill={isActive ? node.color : theme.palette.action.disabled}
                      style={{ transition: "r 0.3s, fill 0.3s" }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nœud central */}
            <Box
              sx={{
                position: "absolute",
                left: cx, top: cy,
                transform: "translate(-50%, -50%)",
                width: 92, height: 92,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 0 10px ${theme.palette.primary.main}22`,
                zIndex: 2,
              }}
            >
              <BuildIcon sx={{ fontSize: 26, color: "#fff" }} />
              <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700, fontSize: "0.58rem", mt: 0.3, textAlign: "center", lineHeight: 1.2 }}>
                ZP<br />Garage
              </Typography>
            </Box>

            {/* Nœuds périphériques */}
            {SCHEMA_NODES.map(node => {
              const x  = cx + R * Math.cos(deg2rad(node.angle));
              const y  = cy + R * Math.sin(deg2rad(node.angle));
              const isActive = node.id === active;
              const Icon = node.icon;

              return (
                <Box
                  key={node.id}
                  onClick={() => setActive(node.id)}
                  sx={{
                    position: "absolute",
                    left: x, top: y,
                    transform: "translate(-50%, -50%)",
                    width: isActive ? 76 : 64,
                    height: isActive ? 76 : 64,
                    borderRadius: "50%",
                    bgcolor: isActive ? node.color : "background.paper",
                    border: "2.5px solid",
                    borderColor: isActive ? node.color : theme.palette.divider,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 3,
                    transition: "all 0.25s ease",
                    boxShadow: isActive ? `0 4px 20px ${node.color}55` : "none",
                    "&:hover": {
                      borderColor: node.color,
                      transform: "translate(-50%, -50%) scale(1.08)",
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 24, color: isActive ? "#fff" : node.color, transition: "color 0.25s" }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.55rem", fontWeight: 700, mt: 0.3, lineHeight: 1,
                      color: isActive ? "#fff" : "text.secondary",
                      transition: "color 0.25s",
                    }}
                  >
                    {node.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* ── Panneau info ── */}
          <Box flex={1} maxWidth={420}>
            <Paper
              variant="outlined"
              sx={{
                p: 3.5, borderRadius: 3,
                borderColor: activeNode.color,
                borderWidth: 2,
                bgcolor: "background.paper",
                transition: "border-color 0.3s",
              }}
            >
              {/* En-tête */}
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: activeNode.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <activeNode.icon sx={{ fontSize: 22, color: "#fff" }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>{activeNode.label}</Typography>
                  <Chip label={activeNode.badge} size="small" sx={{ bgcolor: activeNode.color, color: "#fff", fontSize: "0.6rem", height: 18, fontWeight: 700 }} />
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" lineHeight={1.7} mb={2.5}>
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
                component={Link} to="/register"
                variant="contained"
                fullWidth
                sx={{ mt: 3, bgcolor: activeNode.color, "&:hover": { bgcolor: activeNode.color, filter: "brightness(0.88)" }, fontWeight: 700, borderRadius: 2 }}
              >
                Essayer {activeNode.label} gratuitement
              </Button>
            </Paper>

            {/* Navigation dots */}
            <Box display="flex" justifyContent="center" gap={1} mt={2}>
              {SCHEMA_NODES.map(n => (
                <Box
                  key={n.id}
                  onClick={() => setActive(n.id)}
                  sx={{
                    width: active === n.id ? 20 : 8,
                    height: 8, borderRadius: 4,
                    bgcolor: active === n.id ? n.color : "action.disabled",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
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
    <Box py={{ xs: 10, md: 14 }} sx={{ bgcolor: "background.default" }}>
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
    <Box py={{ xs: 10, md: 14 }} sx={{ bgcolor: theme.palette.mode === "dark" ? "background.paper" : "grey.50" }}>
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
    <Box py={{ xs: 10, md: 14 }} sx={{ bgcolor: "background.default" }}>
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
