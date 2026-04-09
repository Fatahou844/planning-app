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
   Parse  (A=code, B=libellé/nom, C=adr1, D=adr2, E=adr3, F=tel, G=telex)
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
        const rows  = raw
          .slice(1)
          .map((row, idx) => ({
            ligne:     idx + 2,
            code:      String(row[0] ?? "").trim(),
            nom:       String(row[1] ?? "").trim(),
            adresse1:  String(row[2] ?? "").trim(),
            adresse2:  String(row[3] ?? "").trim(),
            adresse3:  String(row[4] ?? "").trim(),
            telephone: String(row[5] ?? "").trim(),
            telex:     String(row[6] ?? "").trim(),
          }))
          .filter((r) => r.code || r.nom);
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
    ["Code Fournisseur", "Libellé", "Zone Adresse 1", "Zone Adresse 2", "Zone Adresse 3", "Téléphone", "N° Telex"],
    ["F001", "MICHELIN FRANCE", "12 rue des pneus", "ZI Nord", "75001 Paris", "0102030405", "12345"],
    ["F002", "VALEO GROUP", "45 avenue de la Paix", "", "69002 Lyon", "0405060708", ""],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Fournisseurs");
  XLSX.writeFile(wb, "modele_fournisseurs.xlsx");
}

/* ─────────────────────────────────────────────────────────
   Aperçu
───────────────────────────────────────────────────────── */
function PreviewTable({ rows }) {
  return (
    <Box sx={{ maxHeight: 280, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {["Ligne", "Code", "Libellé", "Adresse 1", "Adresse 2", "Adresse 3", "Tél.", "Telex"].map((h) => (
              <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.ligne}>
              <TableCell><Typography variant="caption" color="text.secondary">{row.ligne}</Typography></TableCell>
              <TableCell>{row.code   || <Typography variant="caption" color="text.disabled">—</Typography>}</TableCell>
              <TableCell>{row.nom    || <Typography variant="caption" color="text.disabled">—</Typography>}</TableCell>
              <TableCell>{row.adresse1  || "—"}</TableCell>
              <TableCell>{row.adresse2  || "—"}</TableCell>
              <TableCell>{row.adresse3  || "—"}</TableCell>
              <TableCell>{row.telephone || "—"}</TableCell>
              <TableCell>{row.telex     || "—"}</TableCell>
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
      <Box display="flex" gap={2} flexWrap="wrap">
        <Chip icon={<CheckCircleOutlineIcon />} label={`${report.created} créé(s)`}          color="success" variant="outlined" />
        <Chip label={`${report.skipped} ignoré(s) (doublon)`} color="default" variant="outlined" />
        {hasErrors && <Chip icon={<ErrorOutlineIcon />} label={`${report.errors.length} erreur(s)`} color="error" variant="outlined" />}
      </Box>
      {hasErrors && (
        <Box sx={{ maxHeight: 180, overflowY: "auto", border: "1px solid", borderColor: "error.light", borderRadius: 1, p: 1 }}>
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
export default function ImportFournisseurs({ onSuccess }) {
  const axios        = useAxios();
  const fileInputRef = useRef(null);

  const [open,       setOpen]       = useState(false);
  const [dragging,   setDragging]   = useState(false);
  const [parsedRows, setParsedRows] = useState(null);
  const [fileName,   setFileName]   = useState("");
  const [parseError, setParseError] = useState("");
  const [importing,  setImporting]  = useState(false);
  const [report,     setReport]     = useState(null);

  const reset = () => { setParsedRows(null); setFileName(""); setParseError(""); setReport(null); };
  const handleClose = () => { setOpen(false); reset(); };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.xlsx?$/i)) { setParseError("Format invalide (.xlsx requis)"); return; }
    setParseError(""); setReport(null);
    try {
      const rows = await parseExcelFile(file);
      if (rows.length === 0) { setParseError("Aucune donnée trouvée dans le fichier."); return; }
      setParsedRows(rows);
      setFileName(file.name);
    } catch {
      setParseError("Impossible de lire le fichier Excel.");
    }
  };

  const handleImport = async () => {
    if (!parsedRows) return;
    setImporting(true);
    try {
      const res = await axios.post("/stock/import/fournisseurs", { rows: parsedRows });
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
            <Typography variant="h6">Import Excel — Fournisseurs</Typography>
            <Button size="small" startIcon={<DownloadIcon />} onClick={downloadTemplate} variant="outlined">
              Télécharger le modèle
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            {!report && (
              <>
                <Box
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: "2px dashed", borderColor: dragging ? "primary.main" : "divider",
                    borderRadius: 2, p: 3, textAlign: "center", cursor: "pointer",
                    bgcolor: dragging ? "action.hover" : "background.paper", transition: "all 0.2s",
                    "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                  }}
                >
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files?.[0])} />
                  <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    {fileName
                      ? <><strong>{fileName}</strong> — {parsedRows?.length} fournisseur(s) détecté(s)</>
                      : "Glissez-déposez un fichier .xlsx ou cliquez pour sélectionner"}
                  </Typography>
                  {!fileName && (
                    <Typography variant="caption" color="text.secondary">
                      Colonnes : Code · Libellé · Adresse 1 · Adresse 2 · Adresse 3 · Téléphone · Telex
                    </Typography>
                  )}
                </Box>

                {parseError && <Alert severity="error">{parseError}</Alert>}

                {parsedRows && (
                  <>
                    <Divider />
                    <Typography variant="subtitle2">Aperçu ({parsedRows.length} ligne(s))</Typography>
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
            <Button variant="contained" onClick={handleImport} disabled={!parsedRows || importing}
              startIcon={importing ? <CircularProgress size={16} /> : null}>
              {importing ? "Import en cours…" : "Valider l'import"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
