import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TableViewIcon from "@mui/icons-material/TableView";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useAxios } from "../../../utils/hook/useAxios";

/* ─────────────────────────────────────────────────────────
   Colonnes Excel attendues
   A: Nom fournisseur | B: Marque | C: Réf. ext | D: Libellé
   E: Prix achat HT   | F: Code groupe | G: Nom groupe
   H: Code famille    | I: Nom famille
───────────────────────────────────────────────────────── */
function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data  = new Uint8Array(e.target.result);
        const wb    = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const raw   = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        const rows = raw
          .slice(1)
          .map((row, idx) => ({
            ligne:           idx + 2,
            nomFournisseur:  String(row[0] ?? "").trim(),
            marque:          String(row[1] ?? "").trim(),
            refExt:          String(row[2] ?? "").trim(),
            libelle:         String(row[3] ?? "").trim(),
            prixAchat:       parseFloat(String(row[4] ?? "").replace(",", ".")) || 0,
            codeGroupe:      String(row[5] ?? "").trim(),
            nomGroupe:       String(row[6] ?? "").trim(),
            codeFamille:     String(row[7] ?? "").trim(),
            nomFamille:      String(row[8] ?? "").trim(),
          }))
          .filter((r) => r.refExt || r.libelle);

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Impossible de lire le fichier"));
    reader.readAsArrayBuffer(file);
  });
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    [
      "Nom fournisseur", "Marque", "Référence ext", "Libellé",
      "Prix achat HT", "Code groupe", "Nom groupe", "Code famille", "Nom famille",
    ],
    ["BOSCH FRANCE", "BOSCH", "F026402062", "Filtre à huile", 4.5, "1", "Filtration", "101", "Filtres huile"],
    ["VALEO", "VALEO", "MD6481", "Disque de frein av.", 18.9, "2", "Freinage", "201", "Disques frein"],
  ]);

  // Largeurs colonnes
  ws["!cols"] = [22, 12, 16, 30, 14, 12, 16, 14, 20].map((w) => ({ wch: w }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Articles");
  XLSX.writeFile(wb, "modele_articles.xlsx");
}

/* ─────────────────────────────────────────────────────────
   Aperçu
───────────────────────────────────────────────────────── */
function PreviewTable({ rows }) {
  const COLS = [
    { key: "ligne",          label: "Ligne",       width: 55 },
    { key: "nomFournisseur", label: "Fournisseur",  width: 140 },
    { key: "marque",         label: "Marque",       width: 100 },
    { key: "refExt",         label: "Réf. ext",     width: 120 },
    { key: "libelle",        label: "Libellé",      width: 200 },
    { key: "prixAchat",      label: "PA HT (€)",    width: 90 },
    { key: "codeGroupe",     label: "Code grp",     width: 80 },
    { key: "nomGroupe",      label: "Nom groupe",   width: 120 },
    { key: "codeFamille",    label: "Code fam",     width: 80 },
    { key: "nomFamille",     label: "Nom famille",  width: 130 },
  ];

  return (
    <Box sx={{ maxHeight: 300, overflowY: "auto", overflowX: "auto", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
      <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            {COLS.map((c) => (
              <TableCell key={c.key} sx={{ fontWeight: 700, width: c.width, whiteSpace: "nowrap" }}>
                {c.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.ligne} hover>
              <TableCell><Typography variant="caption" color="text.secondary">{row.ligne}</Typography></TableCell>
              <TableCell>{row.nomFournisseur || <Typography variant="caption" color="text.disabled">—</Typography>}</TableCell>
              <TableCell>{row.marque        || <Typography variant="caption" color="text.disabled">—</Typography>}</TableCell>
              <TableCell><strong>{row.refExt}</strong></TableCell>
              <TableCell>{row.libelle}</TableCell>
              <TableCell align="right">{row.prixAchat > 0 ? `${row.prixAchat.toFixed(2)} €` : <Typography variant="caption" color="text.disabled">—</Typography>}</TableCell>
              <TableCell><Chip label={row.codeGroupe || "—"} size="small" variant="outlined" /></TableCell>
              <TableCell>{row.nomGroupe}</TableCell>
              <TableCell><Chip label={row.codeFamille || "—"} size="small" variant="outlined" /></TableCell>
              <TableCell>{row.nomFamille}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Rapport
───────────────────────────────────────────────────────── */
function ImportReport({ report }) {
  const hasErrors = report.errors.length > 0;
  const prixVenteHT = (pa) => (pa * 2).toFixed(2);
  const prixTTC     = (pa) => (pa * 2 * 1.2).toFixed(2);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <Chip icon={<CheckCircleOutlineIcon />} label={`${report.created} article(s) créé(s)`} color="success" variant="outlined" />
        <Chip label={`${report.skipped} ignoré(s)`} color="default" variant="outlined" />
        {hasErrors && <Chip icon={<ErrorOutlineIcon />} label={`${report.errors.length} erreur(s)`} color="error" variant="outlined" />}
      </Box>

      <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Règles appliquées : <strong>PUVHT = PA × 2</strong> — <strong>TTC = PUVHT × 1.2</strong> (TVA 20 %)
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          Exemple : PA 10 € → PV HT {prixVenteHT(10)} € → PV TTC {prixTTC(10)} €
        </Typography>
      </Box>

      {hasErrors && (
        <Box sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid", borderColor: "error.light", borderRadius: 1, p: 1 }}>
          {report.errors.sort((a, b) => a.ligne - b.ligne).map((err, i) => (
            <Box key={i} display="flex" gap={1} alignItems="flex-start" mb={0.5}>
              <ErrorOutlineIcon color="error" fontSize="small" sx={{ mt: 0.2 }} />
              <Typography variant="body2"><strong>Ligne {err.ligne} :</strong> {err.motif}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────────────────── */
export default function ImportArticles({ garageId, onSuccess }) {
  const axios        = useAxios();
  const fileInputRef = useRef(null);

  const TYPES = ["Pièces", "Consommables", "Accessoires", "Pneus"];

  const [open,        setOpen]        = useState(false);
  const [dragging,    setDragging]    = useState(false);
  const [parsedRows,  setParsedRows]  = useState(null);
  const [fileName,    setFileName]    = useState("");
  const [parseError,  setParseError]  = useState("");
  const [importing,   setImporting]   = useState(false);
  const [report,      setReport]      = useState(null);
  const [articleType, setArticleType] = useState("Pièces");

  const reset       = () => { setParsedRows(null); setFileName(""); setParseError(""); setReport(null); setArticleType("Pièces"); };
  const handleClose = () => { setOpen(false); reset(); };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.xlsx?$/i)) { setParseError("Format invalide (.xlsx requis)"); return; }
    setParseError(""); setReport(null);
    try {
      const rows = await parseExcelFile(file);
      if (rows.length === 0) { setParseError("Aucune donnée détectée (colonnes C ou D vides ?)."); return; }
      setParsedRows(rows);
      setFileName(file.name);
    } catch {
      setParseError("Impossible de lire le fichier Excel.");
    }
  };

  const handleImport = async () => {
    if (!parsedRows || !garageId) return;
    setImporting(true);
    try {
      const res = await axios.post("/stock/import/articles", { rows: parsedRows, garageId, articleType });
      if (res?.data?.report) {
        setReport(res.data.report);
        if (res.data.report.created > 0) onSuccess?.();
      }
    } catch (err) {
      setParseError(err?.response?.data?.message || "Erreur lors de l'import.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Button variant="outlined" startIcon={<TableViewIcon />} onClick={() => setOpen(true)}>
        Importer depuis Excel
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Import Excel — Articles</Typography>
            <Button size="small" startIcon={<DownloadIcon />} onClick={downloadTemplate} variant="outlined">
              Télécharger le modèle
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            {!report && (
              <>
                {/* Sélecteur type d'article */}
                <Box display="flex" alignItems="center" gap={2}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Type d'article</InputLabel>
                    <Select
                      value={articleType}
                      label="Type d'article"
                      onChange={(e) => setArticleType(e.target.value)}
                    >
                      {TYPES.map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary">
                    Tous les articles importés auront ce type
                  </Typography>
                </Box>

                <Divider />

                {/* Zone drop */}
                <Box
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: "2px dashed",
                    borderColor: dragging ? "primary.main" : "divider",
                    borderRadius: 2, p: 4, textAlign: "center", cursor: "pointer",
                    bgcolor: dragging ? "action.hover" : "background.paper",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                  }}
                >
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files?.[0])} />
                  <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    {fileName
                      ? <><strong>{fileName}</strong> — {parsedRows?.length} article(s) détecté(s)</>
                      : "Glissez-déposez un fichier .xlsx ou cliquez pour sélectionner"}
                  </Typography>
                  {!fileName && (
                    <Typography variant="caption" color="text.secondary">
                      Colonnes : Fournisseur · Marque · Réf. ext · Libellé · PA HT · Code groupe · Nom groupe · Code famille · Nom famille
                    </Typography>
                  )}
                </Box>

                {parseError && <Alert severity="error">{parseError}</Alert>}

                {/* Règles de calcul */}
                {!parsedRows && (
                  <Alert severity="info" icon={false}>
                    <Typography variant="body2">
                      <strong>Règles appliquées automatiquement :</strong><br />
                      • Prix de vente HT = Prix d'achat × 2<br />
                      • Prix TTC = PUVHT × 1,2 (TVA 20 %)<br />
                      • Fournisseur et Marque créés automatiquement s'ils n'existent pas<br />
                      • Groupe et Famille créés automatiquement si le code n'existe pas pour ce garage
                    </Typography>
                  </Alert>
                )}

                {parsedRows && (
                  <>
                    <Divider />
                    <Typography variant="subtitle2">Aperçu — {parsedRows.length} ligne(s)</Typography>
                    <PreviewTable rows={parsedRows} />
                  </>
                )}
              </>
            )}

            {report && (
              <>
                <Alert severity={report.errors.length > 0 ? "warning" : "success"} icon={<CheckCircleOutlineIcon />}>
                  Import terminé
                </Alert>
                <ImportReport report={report} />
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>{report ? "Fermer" : "Annuler"}</Button>
          {report ? (
            <Button variant="outlined" onClick={reset}>Nouvel import</Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={!parsedRows || importing || !garageId}
              startIcon={importing ? <CircularProgress size={16} /> : null}
            >
              {importing ? "Import en cours…" : `Valider l'import (${parsedRows?.length ?? 0} articles)`}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
