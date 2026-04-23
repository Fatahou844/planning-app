import CloseIcon         from "@mui/icons-material/Close";
import DeleteIcon         from "@mui/icons-material/Delete";
import LocalOfferIcon     from "@mui/icons-material/LocalOffer";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import SearchIcon         from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import JsBarcode from "jsbarcode";
import { useState } from "react";
import { BASE_URL_API } from "../../../config";
import ArticleResultsDialog from "../../ArticleResultsDialog";
import ArticleSearchDialog  from "../../ArticleSearchDialog";

const API_BASE = `${BASE_URL_API}/v1`;

/* ─────────────────────────────────────────────────────────
   Formats disponibles
───────────────────────────────────────────────────────── */
const FORMATS = [
  { id: "reglette",    label: "Réglette",    pageSize: "A4",  orientation: "portrait"  },
  { id: "a4-portrait", label: "A4 Portrait", pageSize: "A4",  orientation: "portrait"  },
  { id: "a4-paysage",  label: "A4 Paysage",  pageSize: "A4",  orientation: "landscape" },
  { id: "a5-portrait", label: "A5 Portrait", pageSize: "A5",  orientation: "portrait"  },
  { id: "a5-paysage",  label: "A5 Paysage",  pageSize: "A5",  orientation: "landscape" },
  { id: "a6-portrait", label: "A6 Portrait", pageSize: "A6",  orientation: "portrait"  },
  { id: "a6-paysage",  label: "A6 Paysage",  pageSize: "A6",  orientation: "landscape" },
];

/* ─────────────────────────────────────────────────────────
   Barcode SVG (JsBarcode)
───────────────────────────────────────────────────────── */
function makeBarcodeHTML(value, height = 28, fontSize = 9) {
  if (!value) return "";
  try {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svg, String(value), {
      format: "CODE128", displayValue: true,
      fontSize, height, margin: 2,
      background: "transparent", lineColor: "#000", width: 1.2,
    });
    return svg.outerHTML;
  } catch { return ""; }
}

/* ─────────────────────────────────────────────────────────
   Données utiles d'un item panier
───────────────────────────────────────────────────────── */
function itemFields(item) {
  const { article } = item;
  const libelle    = (article.libelle1 || "ARTICLE").toUpperCase();
  const reference  = article.refExt || "";
  const barValue   = article.codeBarre || reference || String(article.id);
  const prixNormal = item.prixTTC   != null ? Number(item.prixTTC).toFixed(2)   + " €" : "—";
  const prixPromo  = item.prixPromo != null ? Number(item.prixPromo).toFixed(2) + " €" : null;
  const promoDebut = item.promoDebut || null;
  const promoFin   = item.promoFin   || null;
  const isPromo    = !!(prixPromo && promoDebut && promoFin);
  const empl       = article.Emplacements?.[0]?.code
                  || article.Emplacement?.code
                  || article.emplacement?.code || "";
  return { libelle, reference, barValue, prixNormal, prixPromo, promoDebut, promoFin, isPromo, empl };
}

/* ─────────────────────────────────────────────────────────
   BUILDER — Réglette
───────────────────────────────────────────────────────── */
function buildReglette(item, wCm, hCm) {
  const { libelle, reference, barValue, prixNormal, prixPromo, promoDebut, promoFin, isPromo, empl } = itemFields(item);
  const barcode = makeBarcodeHTML(barValue, 22, 8);

  const priceBlock = isPromo ? `
    <div style="display:flex;align-items:center;gap:4px;justify-content:center;padding:2px 0">
      <span style="font-size:11px;font-weight:700;color:#c62828;text-decoration:line-through;background:#e0e0e0;padding:1px 6px;border-radius:2px">${prixNormal}</span>
      <span style="font-size:17px;font-weight:900;background:#bdbdbd;padding:2px 8px;border-radius:2px">${prixPromo}</span>
    </div>
    <div style="font-size:7.5px;color:#555;text-align:center">du ${promoDebut} au ${promoFin}</div>
  ` : `
    <div style="text-align:center;padding:3px 0">
      <span style="font-size:18px;font-weight:900;background:#bdbdbd;padding:2px 12px;border-radius:2px">${prixNormal}</span>
    </div>
  `;

  return Array.from({ length: item.qty }).map(() => `
    <div style="
      width:${wCm}cm; min-height:${hCm}cm; box-sizing:border-box; overflow:hidden;
      border:1px solid #000; padding:2px 3px; background:#f5f5f5;
      display:inline-flex; flex-direction:column; justify-content:space-between;
      margin:0; break-inside:avoid; vertical-align:top;
    ">
      <div>
        <div style="background:#9e9e9e;color:#111;font-size:10.5px;font-weight:800;padding:2px 4px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${libelle}</div>
        ${reference ? `<div style="background:#bdbdbd;font-size:8.5px;padding:1px 4px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${reference}</div>` : ""}
      </div>
      ${priceBlock}
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:2px">
        ${empl ? `<span style="background:#bdbdbd;font-size:7.5px;padding:1px 3px;border-radius:2px;white-space:nowrap;flex-shrink:0">${empl}</span>` : "<span></span>"}
        <div style="flex:1;max-width:60%;text-align:right;overflow:hidden">
          <div style="transform:scale(0.52);transform-origin:right bottom;display:inline-block">${barcode}</div>
        </div>
      </div>
    </div>
  `).join("");
}

/* ─────────────────────────────────────────────────────────
   BUILDER — Page entière (A4/A5/A6)
───────────────────────────────────────────────────────── */
function buildFullPage(item) {
  const { libelle, reference, barValue, prixNormal, prixPromo, promoDebut, promoFin, isPromo, empl } = itemFields(item);
  const barcode = makeBarcodeHTML(barValue, 50, 14);

  const priceBlock = isPromo ? `
    <div style="display:flex;align-items:center;gap:16px;justify-content:center;padding:18px 0">
      <span style="font-size:38px;font-weight:700;color:#c62828;text-decoration:line-through;background:#e0e0e0;padding:6px 18px;border-radius:4px">${prixNormal}</span>
      <span style="font-size:64px;font-weight:900;background:#bdbdbd;padding:10px 30px;border-radius:4px">${prixPromo}</span>
    </div>
    <div style="text-align:center">
      <span style="font-size:16px;color:#555;background:#e0e0e0;padding:4px 20px;border-radius:3px">du ${promoDebut} au ${promoFin}</span>
    </div>
  ` : `
    <div style="text-align:center;padding:22px 0">
      <span style="font-size:64px;font-weight:900;background:#bdbdbd;padding:10px 32px;border-radius:4px">${prixNormal}</span>
    </div>
  `;

  return Array.from({ length: item.qty }).map(() => `
    <div style="
      width:100%; height:100vh; box-sizing:border-box; overflow:hidden;
      border:1px solid #000; padding:6mm; background:#f5f5f5;
      display:flex; flex-direction:column; justify-content:space-between;
      page-break-after:always;
    ">
      <div>
        <div style="background:#9e9e9e;color:#111;font-size:34px;font-weight:900;padding:8px 16px;text-align:center">${libelle}</div>
        ${reference ? `<div style="background:#bdbdbd;font-size:20px;padding:5px 16px;text-align:center;margin-top:6px">${reference}</div>` : ""}
      </div>
      <div style="text-align:center">${priceBlock}</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end">
        ${empl ? `<span style="background:#bdbdbd;font-size:16px;padding:6px 14px;border-radius:3px">${empl}</span>` : "<span></span>"}
        <div style="max-width:45%">${barcode}</div>
      </div>
    </div>
  `).join("");
}

/* ─────────────────────────────────────────────────────────
   Construction HTML impression
───────────────────────────────────────────────────────── */
function buildPrintHTML(panier, format, labelW, labelH) {
  const fmt = FORMATS.find(f => f.id === format) || FORMATS[0];
  let body;
  if (format === "reglette") {
    body = `<div style="display:flex;flex-wrap:wrap;align-content:flex-start;margin:0;padding:0;gap:0">
      ${panier.map(item => buildReglette(item, labelW, labelH)).join("")}
    </div>`;
  } else {
    body = panier.map(item => buildFullPage(item)).join("");
  }
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Étiquettes prix</title>
  <style>
    @page { size: ${fmt.pageSize} ${fmt.orientation}; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  ${body}
  <script>window.onload = function() { window.print(); };<\/script>
</body>
</html>`;
}

/* ─────────────────────────────────────────────────────────
   Ligne du panier (sans promo manuelle)
───────────────────────────────────────────────────────── */
function PanierRow({ item, idx, onUpdate, onRemove, onQty }) {
  return (
    <TableRow hover>
      {/* Désignation */}
      <TableCell sx={{ py: 0.5, pl: 2 }}>
        <Typography variant="caption" fontWeight={600} noWrap display="block">
          {item.article.libelle1 || "—"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.article.refExt || item.article.codeBarre || "—"}
        </Typography>
        {item.prixPromo != null && (
          <Chip
            icon={<LocalOfferIcon sx={{ fontSize: "10px !important" }} />}
            label="Promo active"
            size="small"
            color="warning"
            variant="filled"
            sx={{ fontSize: "0.6rem", height: 16, mt: 0.3 }}
          />
        )}
      </TableCell>

      {/* Prix TTC — éditable */}
      <TableCell align="right" sx={{ py: 0.5 }}>
        <TextField
          size="small"
          type="number"
          value={item.prixTTC ?? ""}
          onChange={(e) => onUpdate(idx, { prixTTC: e.target.value !== "" ? parseFloat(e.target.value) : null })}
          inputProps={{ step: 0.01, min: 0, style: { textAlign: "right", fontSize: 12, width: 65 } }}
          InputProps={{ endAdornment: <Typography variant="caption" sx={{ ml: 0.3 }}>€</Typography> }}
          sx={{ "& .MuiOutlinedInput-root": { fontSize: 12 } }}
        />
      </TableCell>

      {/* Qty */}
      <TableCell align="center" sx={{ py: 0.5 }}>
        <Box display="flex" alignItems="center" gap={0.3}>
          <IconButton size="small" onClick={() => onQty(idx, -1)}
            sx={{ width: 22, height: 22, fontSize: 14, fontWeight: 700 }}>−</IconButton>
          <Typography variant="caption" fontWeight={800}
            sx={{ minWidth: 22, textAlign: "center" }}>{item.qty}</Typography>
          <IconButton size="small" onClick={() => onQty(idx, +1)}
            sx={{ width: 22, height: 22, fontSize: 14, fontWeight: 700 }}>+</IconButton>
        </Box>
      </TableCell>

      {/* Supprimer */}
      <TableCell align="right" sx={{ py: 0.5, pr: 1.5 }}>
        <Tooltip title="Retirer du panier">
          <IconButton size="small" color="error" onClick={() => onRemove(idx)}>
            <DeleteIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

/* ─────────────────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────────────────── */
export default function EtiquetageModal({ open, onClose }) {
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [results,     setResults]     = useState(null);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [panier,      setPanier]      = useState([]);
  const [format,      setFormat]      = useState("reglette");
  const [labelH,      setLabelH]      = useState(2.5);
  const [labelW,      setLabelW]      = useState(5.0);
  const [loadingId,   setLoadingId]   = useState(null);

  /* ── Fetch pricing ── */
  async function fetchPricing(articleId) {
    try {
      const res  = await fetch(`${API_BASE}/stock/articles/${articleId}/pricing`, { credentials: "include" });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && typeof data === "object" && !Array.isArray(data) && data.prixTTC != null) return data;
      if (Array.isArray(data) && data.length > 0) return data[0];
      return null;
    } catch { return null; }
  }

  /* ── Fetch promo active (si existe) ── */
  async function fetchActivePromo(articleId) {
    try {
      const res = await fetch(`${API_BASE}/stock/articles/${articleId}/promo`, { credentials: "include" });
      if (!res.ok) return null;        // 404 = pas de promo active
      return await res.json();
    } catch { return null; }
  }

  /* ── Ajouter au panier ── */
  async function addToPanier(article) {
    setResultsOpen(false);
    setSearchOpen(false);
    setLoadingId(article.id);

    const [pricing, promo] = await Promise.all([
      fetchPricing(article.id),
      fetchActivePromo(article.id),
    ]);

    setPanier(prev => {
      const idx = prev.findIndex(i => i.article.id === article.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx]  = { ...updated[idx], qty: updated[idx].qty + 1 };
        return updated;
      }
      return [...prev, {
        article,
        qty:       1,
        prixTTC:   pricing?.prixTTC  ?? null,
        // promo récupérée automatiquement
        prixPromo:  promo?.prixPromo  ?? null,
        promoDebut: promo ? new Date(promo.dateDebut).toLocaleDateString("fr-FR") : null,
        promoFin:   promo ? new Date(promo.dateFin).toLocaleDateString("fr-FR")   : null,
      }];
    });

    setLoadingId(null);
  }

  function handleResults(data) {
    if (!data || data.length === 0) return;
    if (data.length === 1) { addToPanier(data[0]); }
    else { setResults(data); setResultsOpen(true); }
  }

  function updateQty(idx, delta) {
    setPanier(prev => {
      const updated = [...prev];
      const newQty  = (updated[idx].qty || 1) + delta;
      if (newQty <= 0) { updated.splice(idx, 1); }
      else { updated[idx] = { ...updated[idx], qty: newQty }; }
      return updated;
    });
  }

  function updateItem(idx, fields) {
    setPanier(prev => {
      const updated = [...prev];
      updated[idx]  = { ...updated[idx], ...fields };
      return updated;
    });
  }

  function handlePrint() {
    if (panier.length === 0) return;
    const html = buildPrintHTML(panier, format, labelW, labelH);
    const win  = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  }

  function handleClose() {
    setSearchOpen(false);
    setResultsOpen(false);
    setResults(null);
    onClose();
  }

  const totalEtiquettes = panier.reduce((s, i) => s + (i.qty || 1), 0);

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          pb: 1, borderBottom: "1px solid", borderColor: "divider",
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocalPrintshopIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="subtitle1" fontWeight={700}>Étiquetage prix</Typography>
          </Box>
          <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box display="flex" minHeight={460}>

            {/* ─── Panier ────────────────────────────── */}
            <Box flex={1} borderRight="1px solid" sx={{ borderColor: "divider" }} display="flex" flexDirection="column">
              <Box px={2} py={1.5}
                display="flex" justifyContent="space-between" alignItems="center"
                sx={{ borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}>
                <Typography variant="body2" fontWeight={600}>
                  Panier — {panier.length} ref.
                  {totalEtiquettes > 0 && ` · ${totalEtiquettes} étiquette${totalEtiquettes > 1 ? "s" : ""}`}
                </Typography>
                <Button size="small" variant="contained"
                  startIcon={!loadingId && <SearchIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setSearchOpen(true)}
                  disabled={!!loadingId} sx={{ fontSize: 12 }}>
                  {loadingId ? "Chargement…" : "Ajouter un article"}
                </Button>
              </Box>

              <Box flex={1} sx={{ overflowY: "auto" }}>
                {panier.length === 0 ? (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%" p={4} textAlign="center">
                    <Typography variant="caption" color="text.disabled">
                      Aucun article dans le panier.<br />
                      Cliquez sur « Ajouter un article » pour commencer.
                    </Typography>
                  </Box>
                ) : (
                  <Table size="small">
                    <TableBody>
                      {panier.map((item, idx) => (
                        <PanierRow
                          key={item.article.id}
                          item={item}
                          idx={idx}
                          onUpdate={updateItem}
                          onRemove={(i) => setPanier(p => p.filter((_, j) => j !== i))}
                          onQty={updateQty}
                        />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            </Box>

            {/* ─── Format + Options ──────────────────── */}
            <Box width={270} display="flex" flexDirection="column" p={2} gap={1.5} sx={{ flexShrink: 0 }}>
              <Typography variant="body2" fontWeight={700}>Format d'impression</Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                {FORMATS.map(f => (
                  <Chip key={f.id} label={f.label} size="small"
                    variant={format === f.id ? "filled" : "outlined"}
                    color={format === f.id ? "primary" : "default"}
                    onClick={() => setFormat(f.id)}
                    sx={{ cursor: "pointer", fontSize: "0.68rem" }}
                  />
                ))}
              </Stack>

              {format === "reglette" && (
                <>
                  <Divider sx={{ my: 0.5 }} />
                  <Typography variant="body2" fontWeight={700}>Dimensions de l'étiquette</Typography>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Hauteur : <strong>{labelH.toFixed(1)} cm</strong>
                    </Typography>
                    <Slider size="small" value={labelH} min={2} max={3} step={0.1}
                      onChange={(_, v) => setLabelH(v)}
                      marks={[{ value: 2, label: "2 cm" }, { value: 3, label: "3 cm" }]}
                      sx={{ mt: 2 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Largeur : <strong>{labelW.toFixed(1)} cm</strong>
                    </Typography>
                    <Slider size="small" value={labelW} min={4} max={6} step={0.1}
                      onChange={(_, v) => setLabelW(v)}
                      marks={[{ value: 4, label: "4 cm" }, { value: 6, label: "6 cm" }]}
                      sx={{ mt: 2 }}
                    />
                  </Box>
                </>
              )}

              <Box flex={1} />
              <Divider />

              <Button variant="contained" fullWidth startIcon={<LocalPrintshopIcon />}
                disabled={panier.length === 0} onClick={handlePrint}>
                Imprimer{totalEtiquettes > 0
                  ? ` (${totalEtiquettes} étiquette${totalEtiquettes > 1 ? "s" : ""})`
                  : ""}
              </Button>

              {panier.length > 0 && (
                <Button variant="text" color="error" size="small" fullWidth
                  onClick={() => setPanier([])} sx={{ fontSize: 11 }}>
                  Vider le panier
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <ArticleSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onResults={handleResults} />
      <ArticleResultsDialog
        open={resultsOpen && !!results && results.length > 0}
        onClose={() => { setResultsOpen(false); setResults(null); }}
        results={results || []}
        onSelectArticle={addToPanier}
      />
    </>
  );
}
