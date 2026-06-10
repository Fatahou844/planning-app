import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import EmailIcon from "@mui/icons-material/Email";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PhoneIcon from "@mui/icons-material/Phone";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useAxios } from "../../../utils/hook/useAxios";
import ConsultationFssModal from "../ConsultationFss";

/* ── constantes ──────────────────────────────────────────────────────── */
const STATUT_COLOR = {
  ACTIF: "success",
  INACTIF: "default",
  SUSPENDU: "error",
};
const CATEGORIES = [
  "Grossiste",
  "Fabricant",
  "Distributeur",
  "Importateur",
  "Prestataire",
  "Autre",
];

/* ── export CSV ──────────────────────────────────────────────────────── */
function exportCSV(rows) {
  const headers = [
    "ID",
    "Nom",
    "Code",
    "Catégorie",
    "Statut",
    "Ville",
    "Région",
    "Téléphone",
    "Email",
    "Remise %",
    "Délai livraison",
    "Franco de port",
  ];
  const lines = [
    headers.join(";"),
    ...rows.map((f) =>
      [
        f.id,
        `"${(f.nom || "").replace(/"/g, '""')}"`,
        f.code || "",
        f.categorie || "",
        f.statut || "",
        f.ville || "",
        f.region || "",
        f.telephone || "",
        f.email || "",
        f.remise != null ? f.remise : "",
        f.delaiLivraison != null ? f.delaiLivraison : "",
        f.francoPort != null ? f.francoPort : "",
      ].join(";"),
    ),
  ];
  const blob = new Blob(["﻿" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fournisseurs_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── badge champ ─────────────────────────────────────────────────────── */
function FilterLabel({ label, children }) {
  return (
    <Box sx={{ flex: "1 1 160px", minWidth: 140 }}>
      <Typography
        variant="caption"
        fontWeight={600}
        color="text.secondary"
        display="block"
        mb={0.5}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}

/* ── composant principal ─────────────────────────────────────────────── */
export default function FournisseursModal({ open, onClose }) {
  const axios = useAxios();
  const theme = useTheme();

  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 100;

  /* filtres */
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterRegion, setFilterRegion] = useState("");

  /* fiche détail ouverte */
  const [ficheOpen, setFicheOpen] = useState(false);
  const [ficheInitFss, setFicheInitFss] = useState(null);

  const load = async (q = "") => {
    setLoading(true);
    try {
      const qs = `pageSize=${PAGE_SIZE}&page=1${q ? `&q=${encodeURIComponent(q)}` : ""}`;
      const res = await axios.get(`/stock/fournisseurs?${qs}`);
      setFournisseurs(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
      setPage(1);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const qs = `pageSize=${PAGE_SIZE}&page=${nextPage}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
      const res = await axios.get(`/stock/fournisseurs?${qs}`);
      setFournisseurs((prev) => [...prev, ...(res?.data?.data || [])]);
      setPage(nextPage);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (open) {
      load();
      setSearch("");
      setFilterStatut("");
      setFilterCat("");
      setFilterRegion("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* recherche serveur (debounce) */
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      load(search);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, open]);

  /* régions dédupliquées */
  const regions = useMemo(() => {
    const set = new Set(fournisseurs.map((f) => f.region).filter(Boolean));
    return [...set].sort();
  }, [fournisseurs]);

  /* filtrage local (statut/catégorie/région — la recherche texte est déjà appliquée côté serveur) */
  const filtered = useMemo(() => {
    return fournisseurs.filter((f) => {
      if (filterStatut && f.statut !== filterStatut) return false;
      if (filterCat && f.categorie !== filterCat) return false;
      if (filterRegion && f.region !== filterRegion) return false;
      return true;
    });
  }, [fournisseurs, filterStatut, filterCat, filterRegion]);

  const handleOpenFiche = (fss) => {
    setFicheInitFss(fss);
    setFicheOpen(true);
  };

  const handleFicheClose = () => {
    setFicheOpen(false);
    load(search); // rafraîchit la liste si des modifs ont eu lieu
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { height: "90vh" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "background.default",
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 1.5,
            px: 2.5,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} flex={1}>
            Fournisseurs
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              ml={1.5}
            >
              {loading
                ? "…"
                : `${filtered.length} affiché${filtered.length !== 1 ? "s" : ""} / ${total} au total`}
            </Typography>
          </Typography>

          <Tooltip title="Exporter CSV">
            <IconButton
              size="small"
              onClick={() => exportCSV(filtered)}
              disabled={!filtered.length}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rafraîchir">
            <IconButton
              size="small"
              onClick={() => load(search)}
              disabled={loading}
            >
              <RefreshIcon
                fontSize="small"
                sx={{ animation: loading ? "spin 1s linear infinite" : "none" }}
              />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 0,
            overflow: "hidden",
          }}
        >
          {/* ── Barre de filtres ── */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "flex-end",
              px: 2.5,
              py: 1.5,
              bgcolor: "action.hover",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <FilterLabel label="Recherche">
              <TextField
                size="small"
                fullWidth
                placeholder="Nom, code, SIRET…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ bgcolor: "background.paper" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ fontSize: 15, color: "text.disabled" }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </FilterLabel>

            <FilterLabel label="Statut">
              <Select
                size="small"
                fullWidth
                displayEmpty
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                sx={{ bgcolor: "background.paper" }}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="ACTIF">Actif</MenuItem>
                <MenuItem value="INACTIF">Inactif</MenuItem>
                <MenuItem value="SUSPENDU">Suspendu</MenuItem>
              </Select>
            </FilterLabel>

            <FilterLabel label="Catégorie">
              <Select
                size="small"
                fullWidth
                displayEmpty
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                sx={{ bgcolor: "background.paper" }}
              >
                <MenuItem value="">Toutes</MenuItem>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FilterLabel>

            <FilterLabel label="Région">
              <Select
                size="small"
                fullWidth
                displayEmpty
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                sx={{ bgcolor: "background.paper" }}
              >
                <MenuItem value="">Toutes</MenuItem>
                {regions.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FilterLabel>
          </Box>

          {/* ── Table ── */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress size={28} />
              </Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography color="text.disabled">
                  Aucun fournisseur trouvé
                </Typography>
              </Box>
            ) : (
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {[
                      "Raison sociale",
                      "Code",
                      "Catégorie",
                      "Statut",
                      "Ville / Région",
                      "Téléphone",
                      "Email",
                      "Remise",
                      "Délai livr.",
                      "Franco port",
                      "",
                    ].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          color: "text.secondary",
                          py: 0.9,
                          whiteSpace: "nowrap",
                          bgcolor: "background.default",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((f) => (
                    <TableRow
                      key={f.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleOpenFiche(f)}
                    >
                      {/* Raison sociale */}
                      <TableCell sx={{ py: 0.9 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {f.nom || "—"}
                        </Typography>
                        {f.siret && (
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            display="block"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {f.siret}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Code */}
                      <TableCell
                        sx={{
                          fontSize: 12,
                          fontFamily: "monospace",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {f.code || "—"}
                      </TableCell>

                      {/* Catégorie */}
                      <TableCell>
                        {f.categorie ? (
                          <Chip
                            label={f.categorie}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: 10 }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>

                      {/* Statut */}
                      <TableCell>
                        <Chip
                          label={f.statut || "ACTIF"}
                          color={STATUT_COLOR[f.statut] || "default"}
                          size="small"
                          sx={{ fontSize: 10 }}
                        />
                      </TableCell>

                      {/* Ville / Région */}
                      <TableCell sx={{ fontSize: 12, whiteSpace: "nowrap" }}>
                        {[f.ville, f.region].filter(Boolean).join(", ") || "—"}
                      </TableCell>

                      {/* Téléphone */}
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {f.telephone ? (
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={0.5}
                            onClick={(e) => e.stopPropagation()}
                            component="a"
                            href={`tel:${f.telephone}`}
                            sx={{
                              color: "text.primary",
                              textDecoration: "none",
                              fontSize: 12,
                            }}
                          >
                            <PhoneIcon
                              sx={{ fontSize: 13, color: "text.secondary" }}
                            />
                            {f.telephone}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>

                      {/* Email */}
                      <TableCell sx={{ whiteSpace: "nowrap", maxWidth: 180 }}>
                        {f.email ? (
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={0.5}
                            onClick={(e) => e.stopPropagation()}
                            component="a"
                            href={`mailto:${f.email}`}
                            sx={{
                              color: "text.primary",
                              textDecoration: "none",
                              fontSize: 12,
                            }}
                          >
                            <EmailIcon
                              sx={{ fontSize: 13, color: "text.secondary" }}
                            />
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{ maxWidth: 150 }}
                            >
                              {f.email}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>

                      {/* Remise */}
                      <TableCell sx={{ fontSize: 12 }}>
                        {f.remise != null ? `${f.remise} %` : "—"}
                      </TableCell>

                      {/* Délai livraison */}
                      <TableCell sx={{ fontSize: 12 }}>
                        {f.delaiLivraison != null
                          ? `${f.delaiLivraison} j`
                          : "—"}
                      </TableCell>

                      {/* Franco de port */}
                      <TableCell sx={{ fontSize: 12, whiteSpace: "nowrap" }}>
                        {f.francoPort != null
                          ? `${parseFloat(f.francoPort).toFixed(0)} €`
                          : "—"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell
                        sx={{ px: 0.5 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title="Ouvrir la fiche">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenFiche(f)}
                          >
                            <OpenInNewIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!loading && fournisseurs.length < total && (
              <Box display="flex" justifyContent="center" py={1.5}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={loadMore}
                  disabled={loadingMore}
                  startIcon={
                    loadingMore ? <CircularProgress size={14} /> : null
                  }
                >
                  Charger plus ({fournisseurs.length} / {total})
                </Button>
              </Box>
            )}
          </Box>

          {/* ── Pied de page ── */}
          <Box
            sx={{
              px: 2.5,
              py: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {filtered.length} fournisseur{filtered.length !== 1 ? "s" : ""}{" "}
              affiché{filtered.length !== 1 ? "s" : ""}
              {` sur ${total} au total`}
            </Typography>
            <Box flex={1} />
            <Box display="flex" gap={1}>
              {[
                {
                  label: "Actifs",
                  color: "success",
                  count: fournisseurs.filter(
                    (f) => (f.statut || "ACTIF") === "ACTIF",
                  ).length,
                },
                {
                  label: "Inactifs",
                  color: "default",
                  count: fournisseurs.filter((f) => f.statut === "INACTIF")
                    .length,
                },
                {
                  label: "Suspendus",
                  color: "error",
                  count: fournisseurs.filter((f) => f.statut === "SUSPENDU")
                    .length,
                },
              ]
                .filter((s) => s.count > 0)
                .map((s) => (
                  <Chip
                    key={s.label}
                    label={`${s.count} ${s.label}`}
                    size="small"
                    color={s.color}
                    variant="outlined"
                    sx={{ fontSize: 10 }}
                  />
                ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ── Fiche détail (réutilise ConsultationFssModal) ── */}
      <ConsultationFssModal
        open={ficheOpen}
        onClose={handleFicheClose}
        initialFournisseur={ficheInitFss}
      />
    </>
  );
}
