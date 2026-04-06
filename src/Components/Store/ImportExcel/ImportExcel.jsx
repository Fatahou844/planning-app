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
  FormControlLabel,
  Radio,
  RadioGroup,
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
   Helpers
───────────────────────────────────────────────────────── */
function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        const rows = raw
          .slice(1) // ignorer la ligne d'en-tête
          .map((row, idx) => ({
            ligne: idx + 2,
            codeGroupe: String(row[0] ?? "").trim(),
            nomGroupe: String(row[1] ?? "").trim(),
            codeFamille: String(row[2] ?? "").trim(),
            nomFamille: String(row[3] ?? "").trim(),
          }))
          .filter((r) => r.nomGroupe); // ignorer lignes vides

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
  // Plage famille : groupe N → base=(N+10)*100, familles base+1 à base+98 (base+99 = divers)
  // Groupe 0001 (N=1) → familles 1101-1198, divers 1199
  // Groupe 0002 (N=2) → familles 1201-1298, divers 1299
  const ws = XLSX.utils.aoa_to_sheet([
    ["Code Groupe", "Nom Groupe", "Code Famille", "Nom Famille"],
    ["0001", "PNEUMATIQUES", "", ""],
    ["0001", "PNEUMATIQUES", "1101", "Pneus tourisme"],
    ["0001", "PNEUMATIQUES", "1102", "Pneus utilitaire"],
    ["0001", "PNEUMATIQUES", "1103", "Pneus 4x4"],
    ["0002", "FREINAGE", "", ""],
    ["0002", "FREINAGE", "1201", "Plaquettes de frein"],
    ["0002", "FREINAGE", "1202", "Disques de frein"],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Groupes-Familles");
  XLSX.writeFile(wb, "modele_groupes_familles.xlsx");
}

/* ─────────────────────────────────────────────────────────
   Sous-composant : aperçu des lignes parsées
───────────────────────────────────────────────────────── */
function PreviewTable({ rows }) {
  return (
    <Box sx={{ maxHeight: 300, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Ligne</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Code Groupe</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Nom Groupe</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Code Famille</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Nom Famille</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const isGroupe = !row.nomFamille;
            return (
              <TableRow
                key={row.ligne}
                sx={{ bgcolor: isGroupe ? "action.hover" : "inherit" }}
              >
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {row.ligne}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={row.codeGroupe || "—"} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{row.nomGroupe}</TableCell>
                <TableCell>
                  {row.codeFamille ? (
                    <Chip label={row.codeFamille} size="small" color="primary" variant="outlined" />
                  ) : (
                    <Typography variant="caption" color="text.disabled">—</Typography>
                  )}
                </TableCell>
                <TableCell>{row.nomFamille || <Typography variant="caption" color="text.disabled">—</Typography>}</TableCell>
                <TableCell>
                  <Chip
                    label={isGroupe ? "Groupe" : "Famille"}
                    size="small"
                    color={isGroupe ? "warning" : "info"}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Sous-composant : rapport d'import
───────────────────────────────────────────────────────── */
function ImportReport({ report }) {
  const { groupes, familles } = report;
  const hasErrors = groupes.errors.length > 0 || familles.errors.length > 0;

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Résumé */}
      <Box display="flex" gap={2} flexWrap="wrap">
        <Chip
          icon={<CheckCircleOutlineIcon />}
          label={`${groupes.created} groupe(s) créé(s)`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`${groupes.skipped} groupe(s) ignoré(s)`}
          color="default"
          variant="outlined"
        />
        <Chip
          icon={<CheckCircleOutlineIcon />}
          label={`${familles.created} famille(s) créée(s)`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`${familles.skipped} famille(s) ignorée(s)`}
          color="default"
          variant="outlined"
        />
        {hasErrors && (
          <Chip
            icon={<ErrorOutlineIcon />}
            label={`${groupes.errors.length + familles.errors.length} erreur(s)`}
            color="error"
            variant="outlined"
          />
        )}
      </Box>

      {/* Détail des erreurs */}
      {hasErrors && (
        <Box>
          <Typography variant="subtitle2" color="error" gutterBottom>
            Détail des erreurs
          </Typography>
          <Box
            sx={{
              maxHeight: 200,
              overflowY: "auto",
              border: "1px solid",
              borderColor: "error.light",
              borderRadius: 1,
              p: 1,
            }}
          >
            {[...groupes.errors, ...familles.errors]
              .sort((a, b) => a.ligne - b.ligne)
              .map((err, i) => (
                <Box key={i} display="flex" gap={1} alignItems="flex-start" mb={0.5}>
                  <ErrorOutlineIcon color="error" fontSize="small" sx={{ mt: 0.2 }} />
                  <Typography variant="body2">
                    <strong>Ligne {err.ligne} :</strong> {err.motif}
                  </Typography>
                </Box>
              ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────────────────── */
export default function ImportExcel({ garageId, onSuccess }) {
  const axios = useAxios();
  const fileInputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [mode, setMode] = useState("file_codes");
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState(null);

  const reset = () => {
    setParsedRows(null);
    setFileName("");
    setParseError("");
    setMode("file_codes");
    setReport(null);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.xlsx?$/i)) {
      setParseError("Format invalide. Veuillez sélectionner un fichier .xlsx");
      return;
    }
    setParseError("");
    setReport(null);
    try {
      const rows = await parseExcelFile(file);
      if (rows.length === 0) {
        setParseError("Le fichier ne contient aucune ligne de données (hors en-tête).");
        return;
      }
      setParsedRows(rows);
      setFileName(file.name);
    } catch {
      setParseError("Impossible de lire le fichier Excel.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleImport = async () => {
    if (!parsedRows || !garageId) return;
    setImporting(true);
    try {
      const res = await axios.post("/stock/import", { garageId, mode, rows: parsedRows });
      if (res?.data?.report) {
        setReport(res.data.report);
        const r = res.data.report;
        if (r.groupes.created > 0 || r.familles.created > 0) {
          onSuccess?.();
        }
      }
    } catch (err) {
      setParseError(err?.response?.data?.message || "Erreur lors de l'import.");
    } finally {
      setImporting(false);
    }
  };

  const groupeCount = parsedRows ? new Set(parsedRows.map((r) => r.codeGroupe || r.nomGroupe)).size : 0;
  const familleCount = parsedRows ? parsedRows.filter((r) => r.nomFamille).length : 0;

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<TableViewIcon />}
        onClick={() => setOpen(true)}
      >
        Importer depuis Excel
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Import Excel — Groupes & Familles</Typography>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              variant="outlined"
            >
              Télécharger le modèle
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>

            {/* ── Zone upload ── */}
            {!report && (
              <>
                <Box
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: "2px dashed",
                    borderColor: dragging ? "primary.main" : "divider",
                    borderRadius: 2,
                    p: 4,
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: dragging ? "action.hover" : "background.paper",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    {fileName
                      ? <><strong>{fileName}</strong> — {groupeCount} groupe(s), {familleCount} famille(s) détectée(s)</>
                      : "Glissez-déposez un fichier .xlsx ou cliquez pour sélectionner"
                    }
                  </Typography>
                  {!fileName && (
                    <Typography variant="caption" color="text.secondary">
                      Colonnes attendues : Code Groupe · Nom Groupe · Code Famille · Nom Famille
                    </Typography>
                  )}
                </Box>

                {parseError && <Alert severity="error">{parseError}</Alert>}

                {/* ── Aperçu ── */}
                {parsedRows && (
                  <>
                    <Divider />
                    <Typography variant="subtitle2">
                      Aperçu ({parsedRows.length} ligne(s))
                    </Typography>
                    <PreviewTable rows={parsedRows} />

                    {/* ── Choix du mode ── */}
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Mode d'import des codes
                      </Typography>
                      <RadioGroup value={mode} onChange={(e) => setMode(e.target.value)}>
                        <FormControlLabel
                          value="file_codes"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                Respecter les codes du fichier
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Les codes groupes et familles du fichier Excel sont utilisés tels quels. Un code déjà pris provoque une erreur sur la ligne.
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="auto_codes"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                Auto-générer les codes
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Les codes du fichier sont ignorés. Le système attribue automatiquement le prochain code disponible pour chaque groupe et famille.
                              </Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </Box>
                  </>
                )}
              </>
            )}

            {/* ── Rapport d'import ── */}
            {report && (
              <>
                <Alert
                  severity={report.groupes.errors.length + report.familles.errors.length > 0 ? "warning" : "success"}
                  icon={<CheckCircleOutlineIcon />}
                >
                  Import terminé
                </Alert>
                <ImportReport report={report} />
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            {report ? "Fermer" : "Annuler"}
          </Button>
          {report ? (
            <Button variant="outlined" onClick={reset}>
              Nouvel import
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={!parsedRows || importing}
              startIcon={importing ? <CircularProgress size={16} /> : null}
            >
              {importing ? "Import en cours…" : "Valider l'import"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
