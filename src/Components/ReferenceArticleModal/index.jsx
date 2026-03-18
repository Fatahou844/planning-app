import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  alpha,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { BASE_URL_API } from "../../config";
import { useApiAutocomplete } from "../../hooks/Useapiautocomplete";
import { useArticleLookup } from "../../hooks/useArticleLookup";
import { useCloudinaryUpload } from "../../hooks/useCloudinaryUpload";
import BlocPneus from "../BlocPneus";

// ─── Section title ────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <Box display="flex" alignItems="center" gap={1.5} mb={2} mt={1}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "primary.main",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </Typography>
      <Box flex={1} height="1px" bgcolor="divider" />
    </Box>
  );
}

// ─── Field row (label + input) ────────────────────────────────
function Field({ label, children, required }) {
  return (
    <Grid container alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
      <Grid item xs={12} md={4}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
          {required && (
            <Typography component="span" color="error.main" ml={0.5}>*</Typography>
          )}
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        {children}
      </Grid>
    </Grid>
  );
}

// ─── ApiAutocompleteField ─────────────────────────────────────
export function ApiAutocompleteField({ resource, value, onChange, readOnly }) {
  const { options, loading, search, create } = useApiAutocomplete(resource);
  const [inputValue, setInputValue] = useState("");

  const isNew =
    !readOnly &&
    inputValue.trim().length > 0 &&
    !options.some(
      (o) => o.nom.toLowerCase() === inputValue.trim().toLowerCase()
    );

  const handleCreate = async () => {
    const created = await create(inputValue.trim());
    if (created) {
      onChange({ id: created.id, nom: created.nom });
      setInputValue(created.nom);
    }
  };

  return (
    <>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : (option.nom ?? "")
        }
        loading={loading}
        value={value || null}
        inputValue={inputValue}
        onInputChange={(e, val) => {
          setInputValue(val);
          search(val);
        }}
        onChange={(e, selected) => {
          if (!selected) {
            onChange(null);
            setInputValue("");
          } else if (typeof selected === "string") {
            onChange({ id: null, nom: selected });
            setInputValue(selected);
          } else {
            onChange({ id: selected.id, nom: selected.nom });
            setInputValue(selected.nom);
          }
        }}
        isOptionEqualToValue={(option, val) => option.id === val?.id}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={14} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      {isNew && (
        <Button
          startIcon={<AddIcon />}
          size="small"
          sx={{ mt: 0.5 }}
          onClick={handleCreate}
        >
          Ajouter "{inputValue.trim()}"
        </Button>
      )}
    </>
  );
}

// ─── Main modal ───────────────────────────────────────────────
const TYPES_ARTICLE = ["Pneus", "Pièces", "Accessoires", "Consommable"];
const TVA_OPTIONS = [0, 7, 10, 14, 20];

const TYPE_CONFIG = {
  Pneus:       { pricing: { vente: true,  achat: true  }, oem: true,  photos: true,  documents: true  },
  Consommable: { pricing: { vente: false, achat: true  }, oem: false, photos: false, documents: false },
  Pièces:      { pricing: { vente: true,  achat: true  }, oem: true,  photos: true,  documents: true  },
  Accessoires: { pricing: { vente: true,  achat: true  }, oem: true,  photos: true,  documents: true  },
};

const FIELD_LABELS = {
  libelle1: "Désignation principale",
  libelle2: "Désignation 2",
  libelle3: "Désignation 3",
  codeBarre: "Code barre",
  refExt: "Réf. externe",
  refInt: "Réf. interne",
};

export default function ReferenceArticleModal({ open, onClose }) {
  const theme = useTheme();

  const [form, setForm] = useState({
    type: "",
    libelle1: "",
    libelle2: "",
    libelle3: "",
    codeBarre: "",
    refExt: "",
    refInt: "",
    prixHT: "",
    prixTTC: "",
    tva: 20,
    prixAchat: "",
    fraisPort: "",
    marge: "",
    margePct: "",
    fournisseur: null,
    marque: null,
    groupe: null,
    famille: null,
    emplacement: null,
    garantie: "",
    composantLot: false,
    conditionnement: "",
    pneus: {
      largeur: "", hauteur: "", diametre: "", charge: "",
      vitesse: "", carburant: "", solMouille: "", bruit: "", valeurBruit: "",
    },
    oems: [],
  });

  // photos / documents : tableaux d'objets { file, preview (objectURL), url (cloudinary) }
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [lookupResult, setLookupResult] = useState(null);

  const { lookup, loading: lookupLoading } = useArticleLookup();
  const { uploadFiles, uploading } = useCloudinaryUpload();

  const config = TYPE_CONFIG[form.type] || {};

  const handleLookup = async (code) => {
    const result = await lookup(code);
    if (result) {
      setLookupResult(result);
    } else {
      setLookupResult({ source: "notfound", label: null, formData: null });
      setTimeout(() => setLookupResult(null), 3000);
    }
  };

  const applyLookup = () => {
    setForm((prev) => ({ ...prev, ...lookupResult.formData }));
    setLookupResult(null);
  };

  const setField = (field) => (value) =>
    setForm((f) => ({ ...f, [field]: value }));

  /* ── Calculs ── */
  const recalcMargin = (field, value) => {
    const clean = value.replace(",", ".");
    setForm((prev) => {
      const updated = { ...prev, [field]: clean };
      const ht = parseFloat(updated.prixHT) || 0;
      const achat = parseFloat(updated.prixAchat) || 0;
      const port = parseFloat(updated.fraisPort) || 0;
      const marge = ht - (achat + port);
      const margePct = ht ? (marge / ht) * 100 : 0;
      return { ...updated, marge: marge.toFixed(2), margePct: margePct.toFixed(2) };
    });
  };

  const calcPrices = (field, value) => {
    const clean = value.replace(",", ".");
    setForm((prev) => {
      const nf = { ...prev, [field]: clean };
      const tvaRate = parseFloat(nf.tva) || 0;
      if (field === "prixTTC") {
        nf.prixHT = ((parseFloat(clean) || 0) / (1 + tvaRate / 100)).toFixed(2);
      } else if (field === "prixHT") {
        nf.prixTTC = ((parseFloat(clean) || 0) * (1 + tvaRate / 100)).toFixed(2);
      }
      return nf;
    });
  };

  /* ── OEM ── */
  const addOEM = () => setForm((f) => ({ ...f, oems: [...f.oems, ""] }));
  const updateOEM = (i, v) =>
    setForm((f) => { const o = [...f.oems]; o[i] = v; return { ...f, oems: o }; });
  const removeOEM = (i) =>
    setForm((f) => ({ ...f, oems: f.oems.filter((_, idx) => idx !== i) }));

  /* ── Photos ── */
  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file), url: null })),
    ]);
  };
  const removePhoto = (i) => {
    setPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[i].preview);
      updated.splice(i, 1);
      return updated;
    });
  };

  /* ── Documents ── */
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocuments((prev) => [
      ...prev,
      ...files.map((file) => ({ file, nom: file.name, size: file.size, preview: URL.createObjectURL(file), url: null })),
    ]);
  };
  const removeDocument = (i) => {
    setDocuments((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[i].preview);
      updated.splice(i, 1);
      return updated;
    });
  };

  /* ── Save ── */
  const handleSave = async () => {
    // 1. Upload photos vers Cloudinary
    const photosToUpload = photos.filter((p) => !p.url).map((p) => p.file);
    const existingPhotoUrls = photos.filter((p) => p.url).map((p) => p.url);
    const newPhotoUrls = photosToUpload.length
      ? await uploadFiles(photosToUpload, "image")
      : [];
    const allPhotoUrls = [...existingPhotoUrls, ...newPhotoUrls];

    // 2. Upload documents vers Cloudinary
    const docsToUpload = documents.filter((d) => !d.url).map((d) => d.file);
    const existingDocUrls = documents.filter((d) => d.url).map((d) => d.url);
    const newDocUrls = docsToUpload.length
      ? await uploadFiles(docsToUpload, "raw")
      : [];
    const allDocUrls = [...existingDocUrls, ...newDocUrls];

    // 3. Envoi à l'API
    const payload = {
      article: {
        type: form.type,
        libelle1: form.libelle1, libelle2: form.libelle2, libelle3: form.libelle3,
        codeBarre: form.codeBarre, refExt: form.refExt, refInt: form.refInt,
        garantie: form.garantie,
        composantLot: form.composantLot,
        conditionnement: form.conditionnement,
        fournisseurId: form.fournisseur?.id ?? null,
        marqueId: form.marque?.id ?? null,
        groupeId: form.groupe?.id ?? null,
        familleId: form.famille?.id ?? null,
        emplacementId: form.emplacement?.id ?? null,
      },
      pricing: {
        prixHT: parseFloat(form.prixHT) || null,
        prixTTC: parseFloat(form.prixTTC) || null,
        tva: parseFloat(form.tva) || 20,
        marge: parseFloat(form.marge) || null,
        margePct: parseFloat(form.margePct) || null,
        prixAchat: parseFloat(form.prixAchat) || null,
        fraisPort: parseFloat(form.fraisPort) || null,
      },
      purchase: {
        prixAchat: parseFloat(form.prixAchat) || null,
        fraisPort: parseFloat(form.fraisPort) || null,
      },
      pneuSpec: form.type === "Pneus" ? { ...form.pneus } : null,
      oem: form.oems.filter((r) => r.trim() !== ""),
      photos: allPhotoUrls,       // tableau d'URLs Cloudinary
      documents: allDocUrls,      // tableau d'URLs Cloudinary
    };

    await fetch(BASE_URL_API + "/v1/stock/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    onClose();
  };

  /* ── UI ── */
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">

      {/* ── Header ── */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: "background.default",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1.5,
          px: 2.5,
        }}
      >
        <InventoryOutlinedIcon sx={{ color: "primary.main", fontSize: 20 }} />
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            Référencer un article
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Créer une nouvelle fiche article
          </Typography>
        </Box>
        {form.type && (
          <Chip label={form.type} color="primary" size="small" sx={{ mr: 1 }} />
        )}
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 3 }}>

        {/* ── TYPE ── */}
        <SectionTitle>Type d'article</SectionTitle>
        <Box mb={3}>
          <ToggleButtonGroup
            value={form.type}
            exclusive
            onChange={(_, v) => v && setForm((f) => ({ ...f, type: v }))}
            size="small"
            sx={{ flexWrap: "wrap", gap: 0.5 }}
          >
            {TYPES_ARTICLE.map((t) => (
              <ToggleButton
                key={t}
                value={t}
                sx={{
                  px: 2.5,
                  textTransform: "none",
                  fontWeight: 500,
                  borderRadius: "8px !important",
                  border: `1px solid ${theme.palette.divider} !important`,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    borderColor: "primary.main !important",
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                }}
              >
                {t}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* ── SPÉCIFICATIONS PNEU ── */}
        {form.type === "Pneus" && (
          <>
            <SectionTitle>Spécifications pneu</SectionTitle>
            <Box mb={2}>
              <BlocPneus pneus={form.pneus} setForm={setForm} />
            </Box>
          </>
        )}

        {/* ── IDENTIFICATION ── */}
        <SectionTitle>Identification</SectionTitle>

        <Field label={FIELD_LABELS.libelle1} required>
          <TextField value={form.libelle1} onChange={(e) => setForm({ ...form, libelle1: e.target.value })} fullWidth size="small" placeholder="Désignation principale" />
        </Field>
        <Field label={FIELD_LABELS.libelle2}>
          <TextField value={form.libelle2} onChange={(e) => setForm({ ...form, libelle2: e.target.value })} fullWidth size="small" />
        </Field>
        <Field label={FIELD_LABELS.libelle3}>
          <TextField value={form.libelle3} onChange={(e) => setForm({ ...form, libelle3: e.target.value })} fullWidth size="small" />
        </Field>
        <Field label={FIELD_LABELS.codeBarre}>
          <TextField
            value={form.codeBarre}
            onChange={(e) => setForm({ ...form, codeBarre: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleLookup(form.codeBarre)}
            fullWidth size="small"
            placeholder="Scanner ou saisir le code-barre"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Rechercher et pré-remplir">
                    <IconButton
                      size="small"
                      onClick={() => handleLookup(form.codeBarre)}
                      disabled={!form.codeBarre || lookupLoading}
                    >
                      {lookupLoading
                        ? <CircularProgress size={16} />
                        : <SearchIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Field>
        <Field label={FIELD_LABELS.refExt}>
          <TextField
            value={form.refExt}
            onChange={(e) => setForm({ ...form, refExt: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleLookup(form.refExt)}
            fullWidth size="small"
            placeholder="Référence constructeur / fournisseur"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Rechercher et pré-remplir">
                    <IconButton
                      size="small"
                      onClick={() => handleLookup(form.refExt)}
                      disabled={!form.refExt || lookupLoading}
                    >
                      {lookupLoading
                        ? <CircularProgress size={16} />
                        : <SearchIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Field>
        <Field label={FIELD_LABELS.refInt}>
          <TextField value={form.refInt} onChange={(e) => setForm({ ...form, refInt: e.target.value })} fullWidth size="small" />
        </Field>

        {/* ── CLASSIFICATION ── */}
        <SectionTitle>Classification</SectionTitle>

        <Field label="Fournisseur">
          <ApiAutocompleteField resource="fournisseurs" value={form.fournisseur} onChange={setField("fournisseur")} />
        </Field>
        <Field label="Marque">
          <ApiAutocompleteField resource="marques" value={form.marque} onChange={setField("marque")} />
        </Field>
        <Field label="Groupe">
          <ApiAutocompleteField resource="groupes" value={form.groupe} onChange={setField("groupe")} />
        </Field>
        <Field label="Famille">
          <ApiAutocompleteField resource="familles" value={form.famille} onChange={setField("famille")} />
        </Field>
        <Field label="Emplacement / Casier">
          <ApiAutocompleteField resource="emplacements" value={form.emplacement} onChange={setField("emplacement")} />
        </Field>
        <Field label="Composant d'un lot">
          <TextField
            select value={form.composantLot ? "oui" : "non"}
            onChange={(e) => setForm({ ...form, composantLot: e.target.value === "oui" })}
            fullWidth size="small"
          >
            <MenuItem value="non">Non</MenuItem>
            <MenuItem value="oui">Oui</MenuItem>
          </TextField>
        </Field>
        {form.composantLot && (
          <Field label="Conditionnement">
            <TextField value={form.conditionnement} onChange={(e) => setForm({ ...form, conditionnement: e.target.value })} fullWidth size="small" />
          </Field>
        )}

        {/* ── TARIFICATION ── */}
        {config.pricing && (
          <>
            <SectionTitle>Tarification</SectionTitle>

            {config.pricing.vente && (
              <>
                <Field label="Prix de vente HT">
                  <TextField value={form.prixHT} onChange={(e) => calcPrices("prixHT", e.target.value)} fullWidth size="small"
                    InputProps={{ endAdornment: <Typography variant="caption" color="text.secondary">€</Typography> }} />
                </Field>
                <Field label="Prix de vente TTC">
                  <TextField value={form.prixTTC} onChange={(e) => calcPrices("prixTTC", e.target.value)} fullWidth size="small"
                    InputProps={{ endAdornment: <Typography variant="caption" color="text.secondary">€</Typography> }} />
                </Field>
                <Field label="TVA">
                  <TextField select value={form.tva} onChange={(e) => setForm({ ...form, tva: e.target.value })} fullWidth size="small">
                    {TVA_OPTIONS.map((v) => <MenuItem key={v} value={v}>{v} %</MenuItem>)}
                  </TextField>
                </Field>
              </>
            )}

            {config.pricing.achat && (
              <>
                <Field label="Prix d'achat HT">
                  <TextField value={form.prixAchat} onChange={(e) => recalcMargin("prixAchat", e.target.value)} fullWidth size="small"
                    InputProps={{ endAdornment: <Typography variant="caption" color="text.secondary">€</Typography> }} />
                </Field>
                <Field label="Frais de port HT">
                  <TextField value={form.fraisPort} onChange={(e) => recalcMargin("fraisPort", e.target.value)} fullWidth size="small"
                    InputProps={{ endAdornment: <Typography variant="caption" color="text.secondary">€</Typography> }} />
                </Field>
              </>
            )}

            {config.pricing.vente && (form.marge || form.margePct) && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  p: 1.5,
                  mb: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary" alignSelf="center">
                  Marge calculée :
                </Typography>
                <Chip
                  label={`${form.marge} €`}
                  size="small"
                  color={parseFloat(form.marge) >= 0 ? "success" : "error"}
                  variant="outlined"
                />
                <Chip
                  label={`${form.margePct} %`}
                  size="small"
                  color={parseFloat(form.margePct) >= 0 ? "success" : "error"}
                  variant="outlined"
                />
              </Box>
            )}
          </>
        )}

        {/* ── OEM ── */}
        {config.oem && (
          <>
            <SectionTitle>Références OEM</SectionTitle>
            <Grid container spacing={2} mb={1}>
              {form.oems.map((oem, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box display="flex" gap={1} alignItems="center">
                    <TextField
                      label={`OEM ${index + 1}`}
                      value={oem}
                      onChange={(e) => updateOEM(index, e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => removeOEM(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Button startIcon={<AddIcon />} size="small" sx={{ mb: 2 }} onClick={addOEM}>
              Ajouter une référence OEM
            </Button>
          </>
        )}

        {/* ── GARANTIE ── */}
        <SectionTitle>SAV / Garantie</SectionTitle>
        <TextField
          value={form.garantie}
          onChange={(e) => setForm({ ...form, garantie: e.target.value })}
          multiline rows={3}
          fullWidth size="small"
          placeholder="Conditions de garantie, notes SAV..."
          sx={{ mb: 3 }}
        />

        {/* ── PHOTOS ── */}
        {config.photos && (
          <>
            <SectionTitle>Photos</SectionTitle>
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={3}>
              {photos.map((p, i) => (
                <Box key={i} position="relative">
                  <img
                    src={p.preview}
                    width={88}
                    height={88}
                    style={{ objectFit: "cover", borderRadius: 8, display: "block" }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removePhoto(i)}
                    sx={{
                      position: "absolute", top: 2, right: 2,
                      bgcolor: alpha("#000", 0.5), color: "#fff",
                      "&:hover": { bgcolor: alpha("#000", 0.7) },
                      p: 0.3,
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
              <Button
                component="label"
                variant="outlined"
                sx={{
                  width: 88, height: 88, minWidth: 0,
                  borderStyle: "dashed", borderRadius: 2,
                  display: "flex", flexDirection: "column", gap: 0.5,
                  color: "text.secondary",
                }}
              >
                <AddIcon fontSize="small" />
                <Typography variant="caption">Photo</Typography>
                <input hidden type="file" multiple accept="image/*" onChange={handleFileAdd} />
              </Button>
            </Box>
          </>
        )}

        {/* ── DOCUMENTS ── */}
        {config.documents && (
          <>
            <SectionTitle>Documents</SectionTitle>
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
              {documents.map((doc, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 130,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 1.5,
                    bgcolor: "background.default",
                    position: "relative",
                  }}
                >
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeDocument(i)}
                    sx={{ position: "absolute", top: 4, right: 4, p: 0.3 }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <InsertDriveFileOutlinedIcon sx={{ color: "primary.main", fontSize: 22, mb: 0.5 }} />
                  <Typography variant="caption" display="block" fontWeight={600} noWrap>
                    {doc.nom}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(doc.size / 1024).toFixed(1)} KB
                  </Typography>
                  <Button size="small" href={doc.preview} target="_blank" sx={{ mt: 0.5, p: 0 }}>
                    Voir
                  </Button>
                </Box>
              ))}
              <Button
                component="label"
                variant="outlined"
                sx={{
                  width: 130, height: 80, minWidth: 0,
                  borderStyle: "dashed", borderRadius: 2,
                  display: "flex", flexDirection: "column", gap: 0.5,
                  color: "text.secondary",
                }}
              >
                <AddIcon fontSize="small" />
                <Typography variant="caption">Document</Typography>
                <input
                  hidden type="file" multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={handleDocumentUpload}
                />
              </Button>
            </Box>
          </>
        )}

      </DialogContent>

      {/* ── Dialog confirmation lookup ── */}
      <Dialog
        open={!!lookupResult && lookupResult.source !== "notfound"}
        onClose={() => setLookupResult(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "background.default",
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 1.5, px: 2.5,
            display: "flex", alignItems: "center", gap: 1,
          }}
        >
          <SearchIcon sx={{ color: "primary.main", fontSize: 18 }} />
          <Typography variant="subtitle1" fontWeight={600}>Article trouvé</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, px: 2.5 }}>
          <Alert
            severity={lookupResult?.source === "local" ? "success" : "info"}
            sx={{ mb: 2 }}
          >
            {lookupResult?.label}
          </Alert>
          {lookupResult?.formData && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {lookupResult.formData.libelle1 && (
                <Typography variant="body2">
                  <strong>Désignation :</strong> {lookupResult.formData.libelle1}
                </Typography>
              )}
              {lookupResult.formData.type && (
                <Typography variant="body2">
                  <strong>Type :</strong> {lookupResult.formData.type}
                </Typography>
              )}
              {lookupResult.formData.marque?.nom && (
                <Typography variant="body2">
                  <strong>Marque :</strong> {lookupResult.formData.marque.nom}
                </Typography>
              )}
              {lookupResult.formData.prixHT && (
                <Typography variant="body2">
                  <strong>Prix HT :</strong> {lookupResult.formData.prixHT} €
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            bgcolor: "background.default",
            borderTop: "1px solid",
            borderColor: "divider",
            px: 2.5, py: 1.5,
          }}
        >
          <Button variant="outlined" color="inherit" onClick={() => setLookupResult(null)}>
            Ignorer
          </Button>
          <Button variant="contained" onClick={applyLookup}>
            Pré-remplir le formulaire
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar "rien trouvé" ── */}
      {lookupResult?.source === "notfound" && (
        <Alert
          severity="warning"
          sx={{ position: "absolute", bottom: 80, left: 24, right: 24, zIndex: 10 }}
          onClose={() => setLookupResult(null)}
        >
          Aucun article trouvé pour ce code. Vous pouvez saisir manuellement.
        </Alert>
      )}

      {/* ── Footer ── */}
      <DialogActions
        sx={{
          px: 3, py: 2,
          bgcolor: "background.default",
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 1,
        }}
      >
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={uploading}>
          Quitter
        </Button>
        <Box flex={1} />
        {uploading && (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              Upload en cours…
            </Typography>
          </Box>
        )}
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : null}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
