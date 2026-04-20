import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowBackIosIcon     from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon  from "@mui/icons-material/ArrowForwardIos";
import DeleteOutlineIcon    from "@mui/icons-material/DeleteOutline";
import EditIcon             from "@mui/icons-material/Edit";
import FileUploadIcon       from "@mui/icons-material/FileUpload";
import LogoutIcon           from "@mui/icons-material/Logout";
import SwapHorizIcon        from "@mui/icons-material/SwapHoriz";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Cookies from "js-cookie";
import { useCallback, useEffect, useRef, useState } from "react";
import { BASE_URL_API } from "../../config";
import { useAxios } from "../../utils/hook/useAxios";
import { useUser } from "../../utils/hook/UserContext";

/* ─────────────────────────────────────────────────────────
   Constantes
───────────────────────────────────────────────────────── */
const SIDEBAR_OPEN_WIDTH   = 280;
const SIDEBAR_CLOSED_WIDTH = 40;
const POLL_INTERVAL_MS     = 60_000; // rafraîchissement toutes les 60 s

const ENTITY_FILTERS = [
  { value: null,          label: "Tous"         },
  { value: "devis",       label: "Devis"        },
  { value: "facture",     label: "Factures"     },
  { value: "or",          label: "OR"           },
  { value: "reservation", label: "Réservations" },
  { value: "article",     label: "Articles"     },
  { value: "client",      label: "Clients"      },
];

const ENTITY_LABELS = {
  devis:       "Devis",
  facture:     "Facture",
  or:          "Ordre de réparation",
  reservation: "Réservation",
  article:     "Article",
  client:      "Client",
  vehicle:     "Véhicule",
};

const ACTION_CONFIG = {
  created:   { icon: AddCircleOutlineIcon, color: "#2e7d32", label: "créé"      },
  updated:   { icon: EditIcon,             color: "#1565c0", label: "modifié"   },
  deleted:   { icon: DeleteOutlineIcon,    color: "#c62828", label: "supprimé"  },
  converted: { icon: SwapHorizIcon,        color: "#e65100", label: "converti"  },
  imported:  { icon: FileUploadIcon,       color: "#6a1b9a", label: "importé"   },
};

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60_000);
  const h    = Math.floor(diff / 3_600_000);
  const d    = Math.floor(diff / 86_400_000);
  if (min  <  1) return "À l'instant";
  if (min  < 60) return `il y a ${min} min`;
  if (h    < 24) return `il y a ${h} h`;
  if (d    <  2) return "Hier";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function groupByDate(activities) {
  const groups = {};
  activities.forEach((a) => {
    const d = new Date(a.createdAt);
    const today     = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    let key;
    if (d.toDateString() === today.toDateString())     key = "Aujourd'hui";
    else if (d.toDateString() === yesterday.toDateString()) key = "Hier";
    else key = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });
  return groups;
}

/* ─────────────────────────────────────────────────────────
   Item d'activité
───────────────────────────────────────────────────────── */
function ActivityItem({ item }) {
  const cfg        = ACTION_CONFIG[item.action] || ACTION_CONFIG.updated;
  const ActionIcon = cfg.icon;
  const userName   = item.user
    ? `${item.user.firstName || ""} ${item.user.name || ""}`.trim()
    : "Système";
  const initials   = item.user
    ? `${(item.user.firstName || "")[0] || ""}${(item.user.name || "")[0] || ""}`.toUpperCase()
    : "?";

  return (
    <Box sx={{ display: "flex", gap: 1, py: 1, px: 1.5, "&:hover": { bgcolor: "action.hover" }, borderRadius: 1 }}>
      {/* Avatar utilisateur */}
      <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: "grey.400", flexShrink: 0, mt: 0.3 }}>
        {initials}
      </Avatar>

      <Box flex={1} minWidth={0}>
        {/* Ligne principale */}
        <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
          <ActionIcon sx={{ fontSize: 14, color: cfg.color, flexShrink: 0 }} />
          <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: 100 }}>
            {userName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {cfg.label}
          </Typography>
        </Box>

        {/* Label entité */}
        <Typography variant="caption" color="text.primary" sx={{ display: "block", fontWeight: 500 }} noWrap>
          {item.entityLabel || `${ENTITY_LABELS[item.entityType] || item.entityType} #${item.entityId || "—"}`}
        </Typography>

        {/* Meta (ex: conversion) */}
        {item.meta && (
          <Typography variant="caption" color="text.disabled" sx={{ display: "block" }} noWrap>
            {item.meta.from && item.meta.to
              ? `${ENTITY_LABELS[item.meta.from] || item.meta.from} → ${ENTITY_LABELS[item.meta.to] || item.meta.to}`
              : JSON.stringify(item.meta)}
          </Typography>
        )}

        {/* Timestamp */}
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.68rem" }}>
          {relativeTime(item.createdAt)}
        </Typography>
      </Box>

      {/* Badge type */}
      <Chip
        label={ENTITY_LABELS[item.entityType] || item.entityType}
        size="small"
        variant="outlined"
        sx={{ fontSize: "0.6rem", height: 18, alignSelf: "flex-start", mt: 0.4, flexShrink: 0 }}
      />
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────────────────── */
export default function ActivitySidebar({ open, onToggle }) {
  const axios        = useAxios();
  const { user }     = useUser();
  const garageId     = user?.garageId;

  const [activities,   setActivities]   = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const pollRef = useRef(null);

  /* ── Chargement ── */
  const load = useCallback(async () => {
    if (!garageId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ garageId, limit: 80 });
      if (activeFilter) params.set("entityType", activeFilter);
      const res = await axios.get(`/activity?${params}`);
      setActivities(res?.data?.data || []);
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  }, [garageId, activeFilter, axios]);

  /* Premier chargement + polling */
  useEffect(() => {
    if (!open) return; // ne charger que quand ouvert
    load();
    pollRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [open, load]);

  /* ── Déconnexion ── */
  function handleLogout() {
    const token = Cookies.get("jwtToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload?.sub) localStorage.removeItem(`hasSeenNotification_${payload.sub}`);
      } catch {}
    }
    import("axios").then(({ default: ax }) => {
      ax.get(`${BASE_URL_API}/v1/logout`, { withCredentials: true })
        .then(() => {
          document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          return new Promise((r) => setTimeout(r, 300));
        })
        .then(() => window.location.replace("/"))
        .catch(console.error);
    });
  }

  const grouped = groupByDate(activities);

  return (
    <Drawer
      anchor="left"
      variant="permanent"
      sx={{
        position: "fixed",
        height: "100vh",
        width: open ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH,
        flexShrink: 0,
        zIndex: 1300,
        "& .MuiDrawer-paper": {
          width: open ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH,
          height: "100vh",
          transition: "width 0.3s",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          zIndex: 1300,
        },
      }}
    >
      {open ? (
        /* ════════ SIDEBAR OUVERTE ════════ */
        <Box display="flex" flexDirection="column" height="100%">

          {/* En-tête */}
          <Box px={2} py={1.5} display="flex" alignItems="center" justifyContent="space-between"
            sx={{ borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}>
            <Typography variant="subtitle2" fontWeight={700}>Activité</Typography>
            {loading && <CircularProgress size={14} />}
          </Box>

          {/* Filtres */}
          <Box px={1.5} py={1} sx={{ borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {ENTITY_FILTERS.map((f) => (
                <Chip
                  key={String(f.value)}
                  label={f.label}
                  size="small"
                  variant={activeFilter === f.value ? "filled" : "outlined"}
                  color={activeFilter === f.value ? "primary" : "default"}
                  onClick={() => setActiveFilter(f.value)}
                  sx={{ fontSize: "0.65rem", height: 20, cursor: "pointer" }}
                />
              ))}
            </Stack>
          </Box>

          {/* Liste des activités */}
          <Box flex={1} sx={{ overflowY: "auto" }}>
            {activities.length === 0 && !loading && (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <Typography variant="caption" color="text.disabled">Aucune activité</Typography>
              </Box>
            )}

            {Object.entries(grouped).map(([dateLabel, items]) => (
              <Box key={dateLabel}>
                <Box px={1.5} py={0.5} sx={{ bgcolor: "action.hover" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {dateLabel}
                  </Typography>
                </Box>
                {items.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))}
                <Divider />
              </Box>
            ))}
          </Box>

          {/* Pied : déconnexion + toggle */}
          <Box sx={{ borderTop: "1px solid", borderColor: "divider", flexShrink: 0 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" px={1} py={0.5}>
              <Tooltip title="Déconnexion">
                <IconButton size="small" onClick={handleLogout} sx={{ color: "error.main" }}>
                  <LogoutIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>Déconnexion</Typography>
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={onToggle}>
                <ArrowBackIosIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      ) : (
        /* ════════ SIDEBAR FERMÉE ════════ */
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="space-between" height="100%" py={1}>
          <Typography variant="caption" sx={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", mt: 8, color: "text.secondary", letterSpacing: 1, fontSize: "0.65rem", textTransform: "uppercase" }}>
            Activité
          </Typography>

          <Box display="flex" flexDirection="column" alignItems="center" gap={0.5} mb={1}>
            <Tooltip title="Déconnexion" placement="right">
              <IconButton size="small" onClick={handleLogout} sx={{ color: "error.main" }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ouvrir" placement="right">
              <IconButton size="small" onClick={onToggle}>
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
