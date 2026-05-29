import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { BASE_URL_API } from "../../config";
import { useAxios } from "../../utils/hook/useAxios";

const API_BASE = `${BASE_URL_API}/v1`;

/* ── helpers ─────────────────────────────────────────────────────────── */

function fmt(val, suffix = "") {
  if (val == null || val === "") return "—";
  const n = parseFloat(val);
  return isNaN(n) ? String(val) : `${n.toFixed(2)}${suffix}`;
}

/* ── sub-components ──────────────────────────────────────────────────── */

function Panel({ title, icon, children }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        mb: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.75,
          bgcolor: alpha(theme.palette.primary.main, 0.07),
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            color: "primary.main",
            flex: 1,
          }}
        >
          {title}
        </Typography>
        {icon}
      </Box>
      <Box sx={{ px: 2, py: 1.5 }}>{children}</Box>
    </Box>
  );
}

function Row({ label, value, mono, highlight }) {
  return (
    <Box display="flex" alignItems="baseline" gap={1} mb={0.6} sx={{ minHeight: 22 }}>
      <Typography
        variant="caption"
        sx={{ minWidth: 140, color: "text.secondary", fontWeight: 500, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontFamily: mono ? "monospace" : "inherit",
          fontWeight: highlight ? 700 : 400,
          color: highlight ? "primary.main" : "text.primary",
          fontSize: highlight ? "0.95rem" : undefined,
        }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

function HistoryTable({ columns }) {
  const theme = useTheme();
  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden", mt: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "background.default" }}>
            {columns.map((col) => (
              <TableCell
                key={col}
                sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary", py: 0.75, borderBottom: `1px solid ${theme.palette.divider}` }}
              >
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns.length} align="center" sx={{ py: 1.5, color: "text.disabled", fontSize: 12 }}>
              Aucun historique
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}

/** Inline add-ref row: text field + add button */
function AddRefRow({ placeholder, onAdd, loading }) {
  const [val, setVal] = useState("");

  const handleAdd = async () => {
    const trimmed = val.trim();
    if (!trimmed) return;
    await onAdd(trimmed);
    setVal("");
  };

  return (
    <Box display="flex" alignItems="center" gap={1} mt={1}>
      <TextField
        size="small"
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        sx={{ flex: 1 }}
        InputProps={{
          sx: { fontSize: 13 },
          endAdornment: loading ? (
            <InputAdornment position="end">
              <CircularProgress size={14} />
            </InputAdornment>
          ) : null,
        }}
      />
      <Button
        size="small"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        disabled={!val.trim() || loading}
        sx={{ textTransform: "none", whiteSpace: "nowrap" }}
      >
        Ajouter
      </Button>
    </Box>
  );
}

/* ── helpers stock ───────────────────────────────────────────────────── */

function getCurrentUser() {
  const s = localStorage.getItem("me");
  return s ? JSON.parse(s) : null;
}

/** Formate la référence du document source */
function fmtDoc(type, id) {
  if (!type || !id) return "—";
  const prefix = {
    Invoice:      "f",
    GoodsReceipt: "bl",
    Order:        "or",
    Inventory:    "inv",
  }[type] || type.toLowerCase();
  return `${prefix}-${id}`;
}

/** Cartes résumé stock (reproduit le style de l'image) */
function StockCard({ label, value, highlight }) {
  return (
    <Box
      sx={{
        display: "flex", alignItems: "center", gap: 1,
        border: "1px solid", borderColor: "divider",
        borderRadius: 1, px: 1.5, py: 0.75, minWidth: 180,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", flex: 1 }}>
        {label}
      </Typography>
      <Box
        sx={{
          minWidth: 42, textAlign: "center", px: 1, py: 0.25,
          borderRadius: 0.5, fontWeight: 700, fontSize: 13,
          bgcolor: highlight ? "success.main" : "action.hover",
          color:   highlight ? "#fff" : "text.primary",
        }}
      >
        {value ?? "—"}
      </Box>
    </Box>
  );
}

/* ── main component ──────────────────────────────────────────────────── */

export default function ArticleDetailDialog({ open, onClose, article, onBack, showBack }) {
  const axios = useAxios();

  const [oems, setOems] = useState(null);
  const [refs, setRefs] = useState([]);
  const [addingOem, setAddingOem] = useState(false);
  const [addingRef, setAddingRef] = useState(false);
  const [oemError, setOemError] = useState(null);
  const [refError, setRefError] = useState(null);

  /* ── Stock & historique ── */
  const [stockData,   setStockData]   = useState(null);
  const [mouvements,  setMouvements]  = useState([]);
  const [stockResas,  setStockResas]  = useState([]);
  const [stockORs,    setStockORs]    = useState([]);
  const [stockLoading,setStockLoading]= useState(false);
  const [stockError,  setStockError]  = useState(null);

  const fetchStock = async () => {
    if (!article?.id) return;
    const gId = getCurrentUser()?.garageId;
    if (!gId) return;
    setStockLoading(true);
    setStockError(null);
    try {
      // Un seul appel qui retourne tout : stock + mouvements + StockOR + StockResa
      const res = await axios.get(
        `/stock-garage/${gId}/article/${article.id}/historique-complet`
      );
      setStockData(res.data?.stock  || null);
      setMouvements(res.data?.mouvements || []);
      setStockResas(res.data?.stockResas || []);
      setStockORs(res.data?.stockORs     || []);
    } catch (err) {
      setStockError(err?.response?.data?.message || "Impossible de charger le stock");
    } finally {
      setStockLoading(false);
    }
  };

  useEffect(() => {
    if (open && article?.id) fetchStock();
    else { setStockData(null); setMouvements([]); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, article?.id]);

  if (!article) return null;

  const pricing = article.ArticlePricing || {};
  const pneuSpec = article.PneuSpec || null;
  const displayOems = oems ?? article.ArticleOEMs ?? [];

  const caracPneu = pneuSpec
    ? [pneuSpec.largeur, pneuSpec.hauteur, pneuSpec.diametre, pneuSpec.charge, pneuSpec.vitesse]
        .filter(Boolean)
        .join(" / ")
    : null;

  /* ── handlers ──────────────────────────────────────────────────────── */

  const handleAddOem = async (reference) => {
    setAddingOem(true);
    setOemError(null);
    try {
      const res = await fetch(`${API_BASE}/stock/articles/${article.id}/oems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setOems([...displayOems, created]);
    } catch {
      setOemError("Erreur lors de l'ajout de la référence OEM.");
    } finally {
      setAddingOem(false);
    }
  };

  /* Refs équivalentes : pas encore de route fournie — stockage local pour l'instant */
  const handleAddRef = async (reference) => {
    setAddingRef(true);
    setRefError(null);
    try {
      // TODO: brancher la route réelle quand disponible
      setRefs((prev) => [...prev, reference]);
    } finally {
      setAddingRef(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* ── Header ─────────────────────────────────────────────── */}
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
        {showBack && (
          <IconButton size="small" onClick={onBack} sx={{ mr: 0.5 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            Fiche article (consultation)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {article.libelle1}
            {article.libelle2 ? ` — ${article.libelle2}` : ""}
          </Typography>
        </Box>
        <Chip label={article.type} size="small" color="primary" sx={{ mr: 1 }} />
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Content ────────────────────────────────────────────── */}
      <DialogContent sx={{ pt: 2.5, px: 2.5, pb: 1 }}>
        {/* 1 · Référence / prix */}
        <Panel title="Référence / prix">
          <Box display="flex" gap={4} flexWrap="wrap">
            <Box flex={1} minWidth={220}>
              <Row label="Libellé" value={article.libelle1} />
              {article.libelle2 && <Row label="Désignation 2" value={article.libelle2} />}
              {article.libelle3 && <Row label="Désignation 3" value={article.libelle3} />}
              <Row label="Référence ext." value={article.refExt} mono />
              <Row label="Code barre" value={article.codeBarre} mono />
              <Row label="Code interne" value={article.id} mono />
            </Box>
            <Box flex={1} minWidth={220}>
              <Row label="Prix TTC" value={fmt(pricing.prixTTC, " €")} highlight />
              <Row label="Prix HT" value={fmt(pricing.prixHT, " €")} />
              <Row label="TVA" value={pricing.tva != null ? `${pricing.tva} %` : "—"} />
              <Row label="Marque" value={article.Marque?.nom} />
              <Row label="Fournisseur" value={article.Fournisseur?.nom} />
              {caracPneu && <Row label="Caractéristiques" value={caracPneu} />}
            </Box>
          </Box>
        </Panel>

        {/* 2 · Stock / historique */}
        <Panel
          title="Stock / historique"
          icon={
            <IconButton size="small" sx={{ p: 0.25 }} onClick={fetchStock} disabled={stockLoading}>
              <RefreshIcon sx={{ fontSize: 15, color: "primary.main", animation: stockLoading ? "spin 1s linear infinite" : "none" }} />
            </IconButton>
          }
        >
          {/* ── Erreur ── */}
          {stockError && (
            <Box sx={{ mb: 1.5, px: 1, py: 0.75, bgcolor: "error.light", borderRadius: 1 }}>
              <Typography variant="caption" color="error.dark">{stockError}</Typography>
            </Box>
          )}

          {/* ── Cartes résumé ── */}
          <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
            <StockCard
              label="Stock disponible"
              value={stockLoading ? "…" : (stockData?.disponible ?? 0)}
              highlight={!stockLoading && (stockData?.disponible ?? 0) > 0}
            />
            <StockCard label="Stock Total (physique)" value={stockLoading ? "…" : (stockData?.physique ?? 0)} />
            <StockCard label="Stock OR"   value={stockLoading ? "…" : (stockData?.blockedOR ?? 0)} />
            <StockCard label="Stock Résa" value={stockLoading ? "…" : (stockData?.blockedRS ?? 0)} />
            <StockCard
              label="Stock Facturé"
              value={stockLoading ? "…" : mouvements
                .filter(m => m.type === "SORTIE" && m.sourceDocumentType === "Invoice")
                .reduce((s, m) => s + (m.quantite || 0), 0)}
            />
          </Box>

          {/* ── Tableau historique ── */}
          {stockLoading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={20} />
            </Box>
          ) : (() => {
            // ── Fusion de tous les événements en une timeline ──────────────
            const ENTREE_TYPES = ["ENTREE","RETOUR_CLIENT","TRANSFERT_ENTREE","INITIAL"];

            const allEvents = [
              ...mouvements.map(m => ({
                _key:   `m-${m.id}`,
                _kind:  "mouvement",
                _date:  new Date(m.createdAt),
                _data:  m,
              })),
              ...stockORs.map(o => ({
                _key:   `or-${o.id}`,
                _kind:  "or",
                _date:  new Date(o.createdAt),
                _data:  o,
              })),
              ...stockResas.map(r => ({
                _key:   `resa-${r.id}`,
                _kind:  "resa",
                _date:  new Date(r.createdAt),
                _data:  r,
              })),
            ].sort((a, b) => a._date - b._date); // Ancien → récent

            // Propagation du stock physique sur chaque ligne
            let runningStock = 0;
            const enriched = allEvents.map(ev => {
              if (ev._kind === "mouvement") {
                runningStock = ev._data.quantiteApres;
              }
              // OR et Résa ne changent pas le physique → on répercute le dernier connu
              return { ...ev, _stockPhysique: runningStock };
            });

            // Affichage du plus récent en haut
            const rows = [...enriched].reverse();

            if (rows.length === 0) {
              return (
                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2, textAlign: "center" }}>
                  <Typography variant="caption" color="text.disabled">Aucun mouvement enregistré</Typography>
                </Box>
              );
            }

            return (
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "background.default" }}>
                      {["Stock physique", "Achat", "Vente", "Résa / OR", "Date", "Auteur", "Document"].map(col => (
                        <TableCell key={col} sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary", py: 0.75 }}>
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(ev => {
                      const stock = ev._stockPhysique;

                      if (ev._kind === "mouvement") {
                        const m        = ev._data;
                        const isEntree = ENTREE_TYPES.includes(m.type);
                        const isSortie = !isEntree && m.type !== "AJUSTEMENT";
                        const auteur   = m.User
                          ? `${m.User.firstName || ""} ${m.User.name || ""}`.trim() || "—"
                          : "—";
                        return (
                          <TableRow key={ev._key} hover>
                            {/* Stock physique après ce mouvement */}
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>{stock}</TableCell>
                            {/* Achat (entrée) */}
                            <TableCell sx={{ fontSize: 12, color: "success.main", fontWeight: isEntree ? 700 : 400 }}>
                              {isEntree ? m.quantite : ""}
                            </TableCell>
                            {/* Vente (sortie) */}
                            <TableCell sx={{ fontSize: 12, color: "error.main", fontWeight: isSortie ? 700 : 400 }}>
                              {isSortie ? m.quantite : ""}
                            </TableCell>
                            <TableCell />
                            <TableCell sx={{ fontSize: 11, whiteSpace: "nowrap" }}>
                              {ev._date.toLocaleDateString("fr-FR")}
                            </TableCell>
                            <TableCell sx={{ fontSize: 11 }}>{auteur}</TableCell>
                            <TableCell sx={{ fontSize: 11, fontFamily: "monospace" }}>
                              {fmtDoc(m.sourceDocumentType, m.sourceDocumentId)}
                            </TableCell>
                          </TableRow>
                        );
                      }

                      if (ev._kind === "or") {
                        const o = ev._data;
                        return (
                          <TableRow key={ev._key} hover sx={{ bgcolor: "rgba(237,108,2,0.05)" }}>
                            {/* Stock physique inchangé — on l'affiche quand même */}
                            <TableCell sx={{ fontWeight: 700, fontSize: 12, color: "text.secondary" }}>{stock}</TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell sx={{ fontSize: 12, color: "warning.main", fontWeight: 700 }}>
                              OR {o.quantite}
                            </TableCell>
                            <TableCell sx={{ fontSize: 11 }}>{ev._date.toLocaleDateString("fr-FR")}</TableCell>
                            <TableCell sx={{ fontSize: 11 }}>—</TableCell>
                            <TableCell sx={{ fontSize: 11, fontFamily: "monospace" }}>
                              {fmtDoc("Order", o.orderId)}
                            </TableCell>
                          </TableRow>
                        );
                      }

                      if (ev._kind === "resa") {
                        const r = ev._data;
                        return (
                          <TableRow key={ev._key} hover sx={{ bgcolor: "rgba(25,118,210,0.05)" }}>
                            {/* Stock physique inchangé */}
                            <TableCell sx={{ fontWeight: 700, fontSize: 12, color: "text.secondary" }}>{stock}</TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell sx={{ fontSize: 12, color: "info.main", fontWeight: 700 }}>
                              Résa {r.quantite}
                            </TableCell>
                            <TableCell sx={{ fontSize: 11 }}>{ev._date.toLocaleDateString("fr-FR")}</TableCell>
                            <TableCell sx={{ fontSize: 11 }}>—</TableCell>
                            <TableCell sx={{ fontSize: 11, fontFamily: "monospace" }}>
                              {fmtDoc("Reservation", r.reservationId)}
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return null;
                    })}
                  </TableBody>
                </Table>
              </Box>
            );
          })()}
        </Panel>

        {/* 3 · Prix / historique */}
        <Panel title="Prix / historique">
          {(() => {
            const prixHT    = parseFloat(pricing.prixHT)    || 0;
            const prixAchat = parseFloat(pricing.prixAchat) || 0;
            const margeBrute = prixHT - prixAchat;
            const tauxMarge  = prixHT > 0 ? (margeBrute / prixHT) * 100 : 0;

            // Calcul du CUMP (PAMP) depuis l'historique des mouvements
            // CUMP = (qté_avant × CUMP_avant + qté_entrée × prix_unitaire) / qté_après
            const ENTREE_TYPES = ["ENTREE", "RETOUR_CLIENT", "TRANSFERT_ENTREE", "INITIAL"];
            const mouvementsTri = [...mouvements]
              .filter(m => m.prixUnitaire != null || ENTREE_TYPES.includes(m.type))
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            let cump = 0;
            for (const m of mouvementsTri) {
              if (ENTREE_TYPES.includes(m.type) && m.prixUnitaire != null) {
                const valeurAvant   = (m.quantiteAvant || 0) * cump;
                const valeurEntree  = (m.quantite      || 0) * parseFloat(m.prixUnitaire);
                const qteTotale     = (m.quantiteApres || 0);
                cump = qteTotale > 0 ? (valeurAvant + valeurEntree) / qteTotale : cump;
              }
            }

            return (
          <Box display="flex" gap={4} flexWrap="wrap" mb={1}>
            <Box>
              <Row label="PRIX TTC" value={fmt(pricing.prixTTC, " €")} highlight />
              <Row label="PRIX HT" value={fmt(pricing.prixHT, " €")} />
              <Row label="Frais port HT" value={fmt(pricing.fraisPort, " €")} />
            </Box>
            <Box>
              <Row label="PAMP (CUMP)" value={cump > 0 ? fmt(cump, " €") : "—"} highlight={cump > 0} />
              <Row label="Dernier PA" value={fmt(pricing.prixAchat, " €")} />
              <Row label="Marge €" value={fmt(pricing.marge, " €")} />
              <Row label="Marge %" value={fmt(pricing.margePct, " %")} />
            </Box>
            <Box>
              <Row label="Marge brute" value={fmt(margeBrute, " €")} highlight={margeBrute > 0} />
              <Row label="Taux marge brute" value={fmt(tauxMarge, " %")} highlight={tauxMarge > 0} />
            </Box>
          </Box>
            );
          })()}
          <HistoryTable columns={["Date", "Prix TTC", "Prix HT", "Prix achat", "Marge €", "Marge %"]} />
        </Panel>

        {/* 4 · Adressage */}
        <Panel title="Adressage">
          <Box display="flex" gap={4} flexWrap="wrap">
            <Box flex={1}>
              <Row label="Emplacement" value={article.Emplacement?.nom} />
              <Row label="Type" value={article.type} />
            </Box>
            <Box flex={1}>
              <Row label="Groupe" value={article.Groupe?.nom} />
              <Row label="Famille" value={article.Famille?.nom} />
            </Box>
          </Box>
        </Panel>

        {/* 5 · Affectation */}
        <Panel title="Affectation">
          {/* OEM */}
          <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.75}>
            Références OEM
          </Typography>
          {displayOems.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={0.75} mb={0.5}>
              {displayOems.map((o, i) => (
                <Chip
                  key={o.id ?? i}
                  label={o.reference}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ fontFamily: "monospace" }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.disabled" mb={0.5}>
              Aucune référence OEM
            </Typography>
          )}
          {oemError && (
            <Typography variant="caption" color="error" display="block" mb={0.5}>
              {oemError}
            </Typography>
          )}
          <AddRefRow
            placeholder="Ex : OEM-12345"
            onAdd={handleAddOem}
            loading={addingOem}
          />

          <Divider sx={{ my: 1.5 }} />

          {/* Refs équivalentes */}
          <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.75}>
            Références équivalentes
          </Typography>
          {refs.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={0.75} mb={0.5}>
              {refs.map((r, i) => (
                <Chip
                  key={i}
                  label={r}
                  size="small"
                  variant="outlined"
                  sx={{ fontFamily: "monospace" }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.disabled" mb={0.5}>
              Aucune référence équivalente
            </Typography>
          )}
          {refError && (
            <Typography variant="caption" color="error" display="block" mb={0.5}>
              {refError}
            </Typography>
          )}
          <AddRefRow
            placeholder="Ex : REF-EQ-456"
            onAdd={handleAddRef}
            loading={addingRef}
          />
        </Panel>

        {/* 6 · Ap-vente */}
        <Panel title="Ap-vente">
          <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.5}>
            Garantie et conditions / SAV
          </Typography>
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", color: article.garantie ? "text.primary" : "text.disabled" }}
          >
            {article.garantie || "—"}
          </Typography>
        </Panel>
      </DialogContent>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Divider />
      <DialogActions
        sx={{
          bgcolor: "background.default",
          borderTop: "1px solid",
          borderColor: "divider",
          px: 2.5,
          py: 1.5,
          gap: 1,
        }}
      >
        <Button variant="outlined" size="small" startIcon={<NoteAddIcon />} sx={{ textTransform: "none" }}>
          Ajouter brouillon
        </Button>
        <Box flex={1} display="flex" justifyContent="center">
          <IconButton size="small" title="Aide">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
        <Button variant="contained" size="small" onClick={onClose} sx={{ textTransform: "none" }}>
          Quitter
        </Button>
      </DialogActions>
    </Dialog>
  );
}
