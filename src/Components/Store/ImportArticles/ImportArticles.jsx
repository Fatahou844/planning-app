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
  LinearProgress,
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
   Colonnes Excel attendues (nouveau format)
   A: Type           | B: Designation (libellé) | C: Codebarre
   D: Ref externe    | E: Fournisseur            | F: Marque
   G: Num groupe     | H: Nom groupe             | I: Num famille
   J: Nom famille    | K: Composant d'un lot     | L: Prix vente HT
   M: Prix vente TTC | N: Prix d'achat HT        | O: Frais port
   P: OEM            | Q: SAV
───────────────────────────────────────────────────────── */
function parseFloat2(val) {
  return parseFloat(String(val ?? "").replace(",", ".")) || 0;
}

const CHUNK_SIZE = 150;
const yield_ = () => new Promise(r => setTimeout(r, 0));
const padCode  = (val) => { const s = String(val ?? "").trim(); return s ? s.padStart(4, "0") : ""; };

async function parseExcelFile(file, onProgress) {
  // Lecture native async — ne bloque pas le thread
  const buffer = await file.arrayBuffer();

  // Laisser React rendre le spinner avant que XLSX.read() prenne la main
  await yield_();

  const wb    = XLSX.read(new Uint8Array(buffer), { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw   = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  const rows  = [];
  const total = raw.length; // ligne 0 = header

  for (let i = 1; i < total; i += CHUNK_SIZE) {
    const end = Math.min(i + CHUNK_SIZE, total);
    for (let k = i; k < end; k++) {
      const row = raw[k];
      const parsed = {
        ligne:          k + 1,
        type:           String(row[0]  ?? "").trim(),
        libelle:        String(row[1]  ?? "").trim(),
        codeBarre:      String(row[2]  ?? "").trim(),
        refExt:         String(row[3]  ?? "").trim(),
        nomFournisseur: String(row[4]  ?? "").trim(),
        marque:         String(row[5]  ?? "").trim(),
        codeGroupe:     padCode(row[6]),
        nomGroupe:      String(row[7]  ?? "").trim(),
        codeFamille:    padCode(row[8]),
        nomFamille:     String(row[9]  ?? "").trim(),
        emplacement:    String(row[10] ?? "").trim(),
        composantLot:   String(row[11] ?? "").trim().toLowerCase() === "oui",
        prixVenteHT:    parseFloat2(row[12]),
        prixVenteTTC:   parseFloat2(row[13]),
        prixAchat:      parseFloat2(row[14]),
        fraisPort:      parseFloat2(row[15]),
        oem:            String(row[16] ?? "").trim(),
        sav:            String(row[17] ?? "").trim(),
      };
      if (parsed.refExt || parsed.libelle) rows.push(parsed);
    }
    // Mise à jour progression + yield entre chaque lot
    onProgress?.(Math.round((end / total) * 100));
    await yield_();
  }

  return rows;
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    [
      "Type", "Designation", "Codebarre", "Ref externe", "Fournisseur", "Marque",
      "Num groupe", "Nom groupe", "Num famille", "Nom famille", "Emplacement",
      "Composant d'un lot", "Prix vente HT", "Prix vente TTC",
      "Prix d'achat HT", "Frais port", "OEM", "SAV",
    ],
    [
      "Pièces", "Filtre à huile", "3322120067867", "F026402062", "BOSCH FRANCE", "BOSCH",
      "1", "Filtration", "101", "Filtres huile", "Rayon A1",
      "Non", 9.00, 10.80, 4.50, 0.50, "F026402062", "",
    ],
    [
      "Pièces", "Disque de frein av.", "", "MD6481", "VALEO", "VALEO",
      "2", "Freinage", "201", "Disques frein", "Rayon B3",
      "Non", 37.80, 45.36, 18.90, 1.00, "MD6481", "",
    ],
  ]);

  ws["!cols"] = [12, 28, 16, 16, 20, 10, 10, 14, 10, 14, 14, 18, 13, 13, 13, 10, 14, 10].map((w) => ({ wch: w }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Articles");
  XLSX.writeFile(wb, "modele_articles.xlsx");
}

/* ─────────────────────────────────────────────────────────
   Aperçu
───────────────────────────────────────────────────────── */
function PreviewTable({ rows }) {
  const dash = <Typography variant="caption" color="text.disabled">—</Typography>;
  const euro = (v) => v > 0 ? `${v.toFixed(2)} €` : dash;

  return (
    <Box sx={{ maxHeight: 320, overflowY: "auto", overflowX: "auto", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
      <Table size="small" stickyHeader sx={{ minWidth: 1300 }}>
        <TableHead>
          <TableRow>
            {[
              ["ligne",         "Ligne",      50],
              ["type",          "Type",       90],
              ["libelle",       "Désignation",200],
              ["codeBarre",     "Codebarre",  120],
              ["refExt",        "Réf. ext",   110],
              ["nomFournisseur","Fournisseur", 130],
              ["marque",        "Marque",     90],
              ["codeGroupe",    "Grp",        55],
              ["nomGroupe",     "Nom groupe", 110],
              ["codeFamille",   "Fam",        55],
              ["nomFamille",    "Nom famille",110],
              ["emplacement",   "Emplacement",110],
              ["prixVenteHT",   "PV HT",      80],
              ["prixVenteTTC",  "PV TTC",     80],
              ["prixAchat",     "PA HT",      80],
              ["fraisPort",     "F. port",    70],
              ["oem",           "OEM",        110],
              ["sav",           "SAV",         90],
            ].map(([key, label, width]) => (
              <TableCell key={key} sx={{ fontWeight: 700, width, whiteSpace: "nowrap" }}>{label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.ligne} hover>
              <TableCell><Typography variant="caption" color="text.secondary">{row.ligne}</Typography></TableCell>
              <TableCell><Chip label={row.type || "—"} size="small" variant="outlined" /></TableCell>
              <TableCell>{row.libelle || dash}</TableCell>
              <TableCell><Typography variant="caption">{row.codeBarre || dash}</Typography></TableCell>
              <TableCell><strong>{row.refExt || dash}</strong></TableCell>
              <TableCell>{row.nomFournisseur || dash}</TableCell>
              <TableCell>{row.marque        || dash}</TableCell>
              <TableCell><Chip label={row.codeGroupe  || "—"} size="small" variant="outlined" /></TableCell>
              <TableCell>{row.nomGroupe  || dash}</TableCell>
              <TableCell><Chip label={row.codeFamille || "—"} size="small" variant="outlined" /></TableCell>
              <TableCell>{row.nomFamille  || dash}</TableCell>
              <TableCell>{row.emplacement || dash}</TableCell>
              <TableCell align="right">{euro(row.prixVenteHT)}</TableCell>
              <TableCell align="right">{euro(row.prixVenteTTC)}</TableCell>
              <TableCell align="right">{euro(row.prixAchat)}</TableCell>
              <TableCell align="right">{euro(row.fraisPort)}</TableCell>
              <TableCell><Typography variant="caption">{row.oem || dash}</Typography></TableCell>
              <TableCell><Typography variant="caption">{row.sav || dash}</Typography></TableCell>
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

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <Chip icon={<CheckCircleOutlineIcon />} label={`${report.created} article(s) créé(s)`} color="success" variant="outlined" />
        <Chip label={`${report.skipped} ignoré(s)`} color="default" variant="outlined" />
        {hasErrors && <Chip icon={<ErrorOutlineIcon />} label={`${report.errors.length} erreur(s)`} color="error" variant="outlined" />}
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

  const [open,          setOpen]          = useState(false);
  const [dragging,      setDragging]      = useState(false);
  const [parsedRows,    setParsedRows]    = useState(null);
  const [fileName,      setFileName]      = useState("");
  const [parseError,    setParseError]    = useState("");
  const [parsing,       setParsing]       = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [importing,     setImporting]     = useState(false);
  const [report,        setReport]        = useState(null);
  const [articleType,   setArticleType]   = useState("Pièces");

  const reset = () => {
    setParsedRows(null); setFileName(""); setParseError("");
    setReport(null); setArticleType("Pièces");
    setParsing(false); setParseProgress(0);
  };
  const handleClose = () => { setOpen(false); reset(); };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.xlsx?$/i)) { setParseError("Format invalide (.xlsx requis)"); return; }
    setParseError(""); setReport(null); setParsedRows(null); setFileName("");
    setParsing(true); setParseProgress(0);
    try {
      const rows = await parseExcelFile(file, setParseProgress);
      if (rows.length === 0) { setParseError("Aucune donnée détectée (colonnes C ou D vides ?)."); return; }
      setParsedRows(rows);
      setFileName(file.name);
    } catch {
      setParseError("Impossible de lire le fichier Excel.");
    } finally {
      setParsing(false);
      setParseProgress(0);
    }
  };

  const handleImport = async () => {
    if (!parsedRows) return;
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
                  onDragOver={(e) => { e.preventDefault(); if (!parsing) setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); if (!parsing) handleFile(e.dataTransfer.files?.[0]); }}
                  onClick={() => { if (!parsing) fileInputRef.current?.click(); }}
                  sx={{
                    border: "2px dashed",
                    borderColor: parsing ? "primary.main" : dragging ? "primary.main" : "divider",
                    borderRadius: 2, p: 4, textAlign: "center",
                    cursor: parsing ? "default" : "pointer",
                    bgcolor: dragging ? "action.hover" : "background.paper",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: parsing ? "primary.main" : "primary.main", bgcolor: parsing ? "background.paper" : "action.hover" },
                  }}
                >
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files?.[0])} />

                  {parsing ? (
                    <>
                      <CircularProgress
                        variant="determinate"
                        value={parseProgress}
                        size={52}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Analyse du fichier… {parseProgress} %
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={parseProgress}
                        sx={{ width: "70%", mx: "auto", borderRadius: 1 }}
                      />
                    </>
                  ) : (
                    <>
                      <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                      <Typography variant="body1" gutterBottom>
                        {fileName
                          ? <><strong>{fileName}</strong> — {parsedRows?.length} article(s) détecté(s)</>
                          : "Glissez-déposez un fichier .xlsx ou cliquez pour sélectionner"}
                      </Typography>
                    </>
                  )}
                  {!fileName && (
                    <Typography variant="caption" color="text.secondary">
                      Colonnes : Type · Désignation · Codebarre · Réf. ext · Fournisseur · Marque · Num groupe · Nom groupe · Num famille · Nom famille · Emplacement · Composant lot · PV HT · PV TTC · PA HT · Frais port · OEM · SAV
                    </Typography>
                  )}
                </Box>

                {parseError && <Alert severity="error">{parseError}</Alert>}

                {/* Règles de calcul */}
                {!parsedRows && (
                  <Alert severity="info" icon={false}>
                    <Typography variant="body2">
                      <strong>Ce qui est appliqué automatiquement :</strong><br />
                      • Les prix de vente HT et TTC sont lus directement depuis le fichier<br />
                      • L'OEM est enregistré dans la table ArticleOEM si renseigné<br />
                      • Fournisseur et Marque créés automatiquement s'ils n'existent pas<br />
                      • Groupe et Famille créés automatiquement si le code n'existe pas pour ce garage<br />
                      • Le type par ligne est prioritaire sur le type sélectionné ci-dessus
                    </Typography>
                  </Alert>
                )}

                {parsedRows && (
                  <>
                    <Divider />
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle2">
                        Aperçu — {parsedRows.length} ligne(s) détectée(s)
                      </Typography>
                      {parsedRows.length > 100 && (
                        <Typography variant="caption" color="text.secondary">
                          Affichage limité aux 100 premières lignes
                        </Typography>
                      )}
                    </Box>
                    <PreviewTable rows={parsedRows.slice(0, 100)} />
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
              disabled={!parsedRows || importing}
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
