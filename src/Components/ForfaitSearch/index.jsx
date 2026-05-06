import { useTheme } from "@mui/material";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAxios } from "../../utils/hook/useAxios";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import ArticleSearchDialog from "../ArticleSearchDialog";

/**
 * ForfaitSearch
 *
 * Comportement demandé :
 * - Champ principal de recherche (comme avant) -> inchangé
 * - Chaque ligne du tableau a un champ "label" qui supporte la recherche par code (ENTER)
 *   -> si la ligne est vide : la recherche remplit la ligne
 *   -> si la ligne est déjà remplie : la recherche ajoute une nouvelle ligne
 * - Les modales (catégories / forfaits) sont réutilisées pour les recherches venant
 *   du champ global ou d'un champ "label" dans une ligne.
 * - Ajout / suppression de ligne toujours disponibles.
 *
 * Remarque technique :
 * - Pour savoir quelle ligne a déclenché la recherche on utilise modalCategoriesForLineIndex
 *   et modalForfaitsForLineIndex (null = contexte global).
 */

// ─────────────────────────────────────────────────────────────────────────
// ArticleResultRow — mémoïsé : ne re-rend QUE si `selected` change pour
// cette ligne précise. Sans ça, toutes les lignes re-rendent à chaque clic.
// ─────────────────────────────────────────────────────────────────────────
const ArticleResultRow = memo(({ article: a, selected, onToggle }) => (
  <TableRow
    hover
    selected={selected}
    onClick={() => onToggle(a)}
    sx={{ cursor: "pointer" }}
  >
    <TableCell padding="checkbox">
      <Checkbox
        checked={selected}
        size="small"
        disableRipple
        onClick={(e) => e.stopPropagation()}
        onChange={() => onToggle(a)}
      />
    </TableCell>
    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.78rem", color: "text.secondary" }}>
      {a.refExt || a.refInt || a.codeBarre || "—"}
    </TableCell>
    <TableCell>
      <Typography variant="body2" fontWeight={selected ? 700 : 400}>
        {a.libelle1 || "—"}
      </Typography>
      {a.libelle2 && (
        <Typography variant="caption" color="text.secondary" display="block">
          {a.libelle2}
        </Typography>
      )}
    </TableCell>
    <TableCell>
      <Typography variant="body2">{a.Marque?.nom || "—"}</Typography>
    </TableCell>
    <TableCell>
      {a.type && (
        <Chip label={a.type} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
      )}
    </TableCell>
    <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>
      {a.ArticlePricing?.prixHT != null
        ? `${Number(a.ArticlePricing.prixHT).toFixed(2)} €`
        : "—"}
    </TableCell>
  </TableRow>
));

export default function ForfaitSearch({
  onChange,
  initialDetails = [],
  initialDeposit = 0,
}) {
  const [input, setInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [forfaits, setForfaits] = useState([]);
  const [selectedForfaits, setSelectedForfaits] = useState([]); // array of forfait objects (compare by id)

  const [modalCategoriesOpen, setModalCategoriesOpen] = useState(false);
  const [modalForfaitsOpen, setModalForfaitsOpen] = useState(false);
  // Modal "Aucune donnée"
  const [noDataModalOpen, setNoDataModalOpen] = useState(false);
  const [noDataLineIndex, setNoDataLineIndex] = useState(null);

  // quel index de ligne a déclenché l'ouverture des modales (null = champ global)
  const [modalCategoriesForLineIndex, setModalCategoriesForLineIndex] =
    useState(null);
  const [modalForfaitsForLineIndex, setModalForfaitsForLineIndex] =
    useState(null);

  const [details, setDetails] = useState(initialDetails);

  // ── ArticleSearchDialog (ouvert par le code "a" / "A") ──────────────
  const [articleSearchDialogOpen,      setArticleSearchDialogOpen]      = useState(false);
  const [articleSearchDialogLineIndex, setArticleSearchDialogLineIndex] = useState(null);

  // ── Modale résultats (multi-sélection après retour ArticleSearchDialog) ──
  const [resultsDialogOpen,      setResultsDialogOpen]      = useState(false);
  const [resultArticles,         setResultArticles]         = useState([]);
  // Map<id, article> — O(1) lookup/insert/delete, zéro .some() dans le rendu
  const [selectedMap,            setSelectedMap]            = useState(new Map());
  const [resultsDialogLineIndex, setResultsDialogLineIndex] = useState(null);

  // ── Snackbar de confirmation ─────────────────────────────────────────
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const axios = useAxios();

  function getCurrentUser() {
    const storedUser = localStorage.getItem("me");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  useEffect(() => {
    setDetails(initialDetails);
    setDeposit(initialDeposit);
  }, [initialDetails, initialDeposit]);

  const parseCodes = (text) => {
    if (!text) return [null, null, null];

    // enlever espaces
    const cleaned = text.replace(/\s+/g, "").trim();

    // si format sans espace
    if (cleaned.length >= 1) {
      const code1 = cleaned[0] || null;
      const code2 = cleaned.length >= 3 ? cleaned.slice(1, 3) : null;
      const code3 = cleaned.length >= 5 ? cleaned.slice(3, 5) : null;
      return [code1, code2, code3];
    }

    return [null, null, null];
  };

  const openNoDataModal = (index) => {
    setNoDataLineIndex(index);
    setNoDataModalOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────
  // Détection code forfait : W / W01 / W0102
  // ─────────────────────────────────────────────────────────────────────
  const isForfaitCode = (val) => {
    const c = val.replace(/\s+/g, "");
    return (
      /^[A-Za-z]$/.test(c) ||      // W
      /^[A-Za-z]\d{2}$/.test(c) || // W01
      /^[A-Za-z]\d{4}$/.test(c)    // W0102
    );
  };

  // ─────────────────────────────────────────────────────────────────────
  // Callback reçu depuis ArticleSearchDialog quand l'utilisateur
  // clique "Rechercher". On affiche les résultats dans la modale
  // de sélection multiple.
  // ─────────────────────────────────────────────────────────────────────
  const handleArticleSearchResults = (data) => {
    const articles = Array.isArray(data) ? data : (data?.articles ?? []);
    setResultArticles(articles);
    setSelectedMap(new Map());
    setResultsDialogLineIndex(articleSearchDialogLineIndex);
    setResultsDialogOpen(true);
    // ArticleSearchDialog se ferme lui-même via onClose
  };

  // ─────────────────────────────────────────────────────────────────────
  // Sélection / désélection — O(1) grâce à la Map
  // useCallback : référence stable → les lignes mémoïsées ne re-rendent pas
  // ─────────────────────────────────────────────────────────────────────
  const toggleSelectArticle = useCallback((a) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      next.has(a.id) ? next.delete(a.id) : next.set(a.id, a);
      return next;
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Ajoute les articles sélectionnés dans les lignes du document
  // ─────────────────────────────────────────────────────────────────────
  const confirmArticleSelection = () => {
    if (!selectedMap.size) { setResultsDialogOpen(false); return; }

    let firstUsed = false;

    selectedMap.forEach((a) => {
      const entry = {
        label:     a.libelle1 || a.libelle2 || a.libelle3 || "Article",
        code:      a.refExt   || a.codeBarre || a.refInt  || "---",
        quantity:  1,
        unitPrice: a.ArticlePricing?.prixHT ?? 0,
      };
      if (!firstUsed && resultsDialogLineIndex !== null) {
        addDetailFromForfait(entry, resultsDialogLineIndex);
        firstUsed = true;
      } else {
        addDetailFromForfait(entry, null);
      }
    });

    setSnackbar({
      open: true,
      message: `${selectedMap.size} article(s) ajouté(s)`,
      severity: "success",
    });
    setSelectedMap(new Map());
    setResultsDialogOpen(false);
    setResultsDialogLineIndex(null);
  };

  // ─────────────────────────────────────────────────────────────────────
  // ENTER sur le champ libellé d'une ligne
  //
  //  "a" / "A"              → ouvre ArticleSearchDialog (déclencheur)
  //  W / W01 / W0102        → codes forfait (inchangé)
  // ─────────────────────────────────────────────────────────────────────
  const handleSearchFromLine = async (index) => {
    const value = (details[index]?.label || "").trim();
    if (!value) return;

    // ── Déclencheur article : "a" ou "A" ──────────────────────────────
    if (value.toLowerCase() === "a") {
      // Effacer le "a" — c'est un déclencheur, pas un libellé
      updateDetails((prev) =>
        prev.map((d, i) => (i === index ? { ...d, label: "" } : d))
      );
      setArticleSearchDialogLineIndex(index);
      setArticleSearchDialogOpen(true);
      return;
    }

    // ── Codes forfait → comportement inchangé ──────────────────────────
    if (isForfaitCode(value)) {
      const [code1, code2, code3] = parseCodes(value);
      try {
        if (code1 && !code2) {
          const { data } = await axios.get(
            `/forfaits/codes-principaux/${code1}/categories?garageId=${getCurrentUser().garageId}`,
          );
          setCategories(data);
          setModalCategoriesForLineIndex(index);
          setModalCategoriesOpen(true);
          return;
        }
        if (code1 && code2 && !code3) {
          const { data } = await axios.get(
            `/forfaits/code1/${code1}/code2/${code2}/forfaits?garageId=${getCurrentUser().garageId}`,
          );
          setForfaits(data);
          setModalForfaitsForLineIndex(index);
          setModalForfaitsOpen(true);
          return;
        }
        if (code1 && code2 && code3) {
          const { data } = await axios.get(
            `/forfaits/libelle/${code1}/${code2}/${code3}?garageId=${getCurrentUser().garageId}`,
          );
          addDetailFromForfait(
            {
              label:     data.libelle,
              code:      `${data.CategoryForfait.codes_principaux.code1}${data.CategoryForfait.code2}${data.code3}`,
              quantity:  1,
              unitPrice: data.prix,
            },
            index,
          );
          return;
        }
      } catch {
        // Code forfait sans résultat → rien (le champ reste tel quel)
      }
    }
  };

  const handleSelectCategory = async (category) => {
    const { code2 } = category;
    let code1 = null;
    let lineIndex = modalCategoriesForLineIndex;

    // 1️⃣ Détermination du code1 + mise à jour du label/input
    if (lineIndex !== null) {
      const [c1] = parseCodes(details[lineIndex]?.label || "");
      code1 = c1;

      setDetails((prev) =>
        prev.map((d, i) =>
          i === lineIndex ? { ...d, label: `${code1}${code2}` } : d,
        ),
      );
    } else {
      const [c1] = parseCodes(input);
      code1 = c1;
      setInput(`${code1}${code2}`);
    }

    try {
      // 2️⃣ Récupération des forfaits
      const { data } = await axios.get(
        `/forfaits/code1/${code1}/code2/${code2}/forfaits?garageId=${getCurrentUser().garageId}`,
      );

      setForfaits(data);
      setModalCategoriesOpen(false);
      setModalCategoriesForLineIndex(null);

      setModalForfaitsForLineIndex(lineIndex);
      setModalForfaitsOpen(true);
    } catch (error) {
      // 🔴 Pas de forfaits → dialog "aucune donnée"
      setModalCategoriesOpen(false);
      setModalCategoriesForLineIndex(null);

      openNoDataModal(lineIndex);
      return;
    }
  };

  const toggleSelectForfait = (f) => {
    setSelectedForfaits((prev) => {
      const exists = prev.some((p) => p.id === f.id);
      if (exists) return prev.filter((p) => p.id !== f.id);
      return [...prev, f];
    });
  };

  const confirmSelection = () => {
    const lineIndex = modalForfaitsForLineIndex;

    if (selectedForfaits.length === 0) {
      closeForfaitModal();
      return;
    }

    let firstUsed = false;

    // 🔁 1️⃣ Remplacer la ligne de recherche
    if (lineIndex !== null) {
      const f = selectedForfaits[0];

      addDetailFromForfait(
        {
          label: f.libelle,
          quantity: 1,
          code: `${f.CategoryForfait.codes_principaux.code1}${f.CategoryForfait.code2}${f.code3}`,
          unitPrice: f.prix,
        },
        lineIndex,
      );

      firstUsed = true;
    }

    // ➕ 2️⃣ Ajouter les autres forfaits
    selectedForfaits.forEach((f, idx) => {
      if (firstUsed && idx === 0) return;

      addDetailFromForfait(
        {
          label: f.libelle,
          code: `${f.CategoryForfait.codes_principaux.code1}${f.CategoryForfait.code2}${f.code3}`,
          quantity: 1,
          unitPrice: f.prix,
        },
        null,
      );
    });

    // 🧹 reset
    setSelectedForfaits([]);
    closeForfaitModal();
  };

  const closeForfaitModal = () => {
    setModalForfaitsOpen(false);
    setModalForfaitsForLineIndex(null);
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cellStyle = {
    textAlign: "center",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
  };

  const addDetailFromForfait = (forfait, lineIndex = null) => {
    updateDetails((prev) => {
      let copy = [...prev];

      console.log("FORFAIT: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", forfait);

      // 1️⃣ Supprimer la ligne de saisie ciblée si lineIndex est défini
      if (
        lineIndex !== null &&
        Number.isInteger(lineIndex) &&
        lineIndex >= 0 &&
        lineIndex < copy.length
      ) {
        copy.splice(lineIndex, 1);
      }

      // 2️⃣ Ajouter la nouvelle ligne avec le forfait
      const entry = {
        label: forfait.label ?? "",
        code: forfait.code ?? "xxx",

        quantity: forfait.quantity ?? 1,
        unitPrice: forfait.unitPrice ?? forfait.prix ?? 0,
        inputValue: "",
        discountValue: "",
        discountPercent: "",
      };

      copy.push(entry);

      return copy;
    });
  };

  // ------------------------------
  // Gestion manuelle des champs du tableau (égale au code d'origine mais robustifié)
  // ------------------------------
  const handleDetailChange = (e, index) => {
    const { name, value } = e.target;
    updateDetails((prev) =>
      prev.map((detail, i) => {
        if (i !== index) return detail;

        // Gestion spéciale pour la colonne remise
        if (name === "discountValue") {
          let val = value.trim();
          let normalized = val.replace(",", ".");
          let discountValue = "";
          let discountPercent = "";

          if (normalized.includes("%")) {
            const perc = parseFloat(normalized.replace("%", ""));
            if (!isNaN(perc)) discountPercent = perc;
          } else if (normalized !== "") {
            const amt = parseFloat(normalized);
            if (!isNaN(amt)) discountValue = amt;
          }

          return {
            ...detail,
            inputValue: val,
            discountValue,
            discountPercent,
          };
        }

        // Si on modifie le libellé, on doit mettre à jour le champ label
        return {
          ...detail,
          [name]: value,
        };
      }),
    );
  };

  const removeDetailRow = (index) => {
    updateDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const addDetailRow = () => {
    updateDetails((prev) => [
      ...prev,
      { label: "", code: "---", quantity: 1, unitPrice: 0, inputValue: "" },
    ]);
  };

  // ------------------------------
  // Calculs
  // ------------------------------
  const calculateLineTotal = (detail) => {
    const qty = parseFloat(detail.quantity) || 0;
    const price = parseFloat(detail.unitPrice) || 0;
    let total = qty * price;

    if (detail.discountValue) {
      total -= parseFloat(detail.discountValue);
    } else if (detail.discountPercent) {
      total -= (total * parseFloat(detail.discountPercent)) / 100;
    }

    return total > 0 ? total : 0;
  };

  const totalTTC = details.reduce((acc, d) => acc + calculateLineTotal(d), 0);
  const totalHT = totalTTC / 1.2;

  const [deposit, setDeposit] = useState(initialDeposit);

  const updateDetails = (newDetails) => {
    setDetails(newDetails);
    if (onChange) onChange(newDetails, deposit);
  };

  const updateDeposit = (newDeposit) => {
    setDeposit(newDeposit);
    if (onChange) onChange(details, newDeposit);
  };

  // ------------------------------
  // JSX
  // ------------------------------
  return (
    <Box sx={{ p: 2, width: "100%" }}>
      {/* Tableau */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: "60%",
                  ...cellStyle,
                  fontWeight: "bold",
                }}
              >
                Libellé / travaux / articles
              </TableCell>
              <TableCell sx={{ width: "10%", ...cellStyle }}>
                Quantité
              </TableCell>
              <TableCell sx={{ width: "10%", ...cellStyle }}>
                Prix Unitaire
              </TableCell>
              <TableCell sx={{ width: "10%", ...cellStyle }}>Remise</TableCell>
              <TableCell sx={{ width: "10%", ...cellStyle }}>Total</TableCell>
              <TableCell sx={{ width: "10%", ...cellStyle }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {details.map((detail, index) => (
              <TableRow key={index}>
                <TableCell sx={{ ...cellStyle }}>
                  <TextField
                    name="label"
                    value={detail.label}
                    onChange={(e) => handleDetailChange(e, index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchFromLine(index);
                      }
                    }}
                    size="small"
                    fullWidth
                    placeholder="Saisir ou taper un mot-clé + ENTER → recherche article"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Rechercher un article" arrow>
                            <SearchIcon
                              fontSize="small"
                              sx={{
                                color: "text.disabled",
                                cursor: "pointer",
                                "&:hover": { color: "primary.main" },
                              }}
                              onClick={() => handleSearchFromLine(index)}
                            />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </TableCell>
                <TableCell sx={{ ...cellStyle }}>
                  <TextField
                    name="quantity"
                    type="text"
                    value={detail.quantity ?? ""}
                    onChange={(e) => handleDetailChange(e, index)}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ ...cellStyle }}>
                  <TextField
                    name="unitPrice"
                    type="text"
                    value={detail.unitPrice ?? ""}
                    onChange={(e) => handleDetailChange(e, index)}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ ...cellStyle }}>
                  <TextField
                    name="discountValue"
                    type="text"
                    value={detail.inputValue || ""}
                    onChange={(e) => handleDetailChange(e, index)}
                    size="small"
                    sx={{
                      "& input": {
                        MozAppearance: "textfield",
                        textAlign: "center",
                      },
                      "& input::-webkit-outer-spin-button": {
                        WebkitAppearance: "none",
                        margin: 0,
                      },
                      "& input::-webkit-inner-spin-button": {
                        WebkitAppearance: "none",
                        margin: 0,
                      },
                    }}
                    placeholder="10 or 10%"
                  />
                </TableCell>

                <TableCell sx={{ ...cellStyle }}>
                  {calculateLineTotal(detail).toFixed(2)}
                </TableCell>
                <TableCell sx={{ ...cellStyle }}>
                  <Button
                    color="secondary"
                    onClick={() => removeDetailRow(index)}
                  >
                    SUPP
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {/* Always show add line button */}
            <TableRow>
              <TableCell colSpan={6} sx={{ ...cellStyle }}>
                <Button variant="outlined" onClick={addDetailRow} fullWidth>
                  Ajouter une ligne
                </Button>
              </TableCell>
            </TableRow>

            {/* Totals */}
            <TableRow>
              <TableCell colSpan={4}></TableCell>
              <TableCell>Total TTC :</TableCell>
              <TableCell>{totalTTC.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4}></TableCell>
              <TableCell>Total HT :</TableCell>
              <TableCell>{totalHT.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4}></TableCell>
              <TableCell>Acompte :</TableCell>
              <TableCell>
                <TextField
                  type="text"
                  value={deposit}
                  onChange={(e) => updateDeposit(e.target.value)}
                  size="small"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODALE CATEGORIES */}
      <Dialog
        open={modalCategoriesOpen}
        onClose={() => {
          setModalCategoriesOpen(false);
          setModalCategoriesForLineIndex(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Catégories</DialogTitle>
        <DialogContent>
          <List>
            {categories.map((cat) => (
              <ListItemButton
                key={cat.id}
                onClick={() => handleSelectCategory(cat)}
              >
                <ListItemText primary={`${cat.code2} - ${cat.name}`} />
              </ListItemButton>
            ))}
          </List>
          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Button
              onClick={() => {
                setModalCategoriesOpen(false);
                setModalCategoriesForLineIndex(null);
              }}
            >
              Fermer
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* MODALE FORFAITS */}
      <Dialog
        open={modalForfaitsOpen}
        onClose={() => {
          setModalForfaitsOpen(false);
          setModalForfaitsForLineIndex(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Forfaits (multi-sélection)</DialogTitle>
        <DialogContent>
          <List>
            {forfaits.map((f) => (
              <ListItemButton
                key={f.id}
                selected={selectedForfaits.some((p) => p.id === f.id)}
                onClick={() => toggleSelectForfait(f)}
              >
                <ListItemText
                  primary={`${f.code3} - ${f.libelle}`}
                  secondary={`${f.prix} €`}
                />
              </ListItemButton>
            ))}
          </List>
          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Button variant="contained" onClick={confirmSelection}>
              Ajouter la sélection
            </Button>
            <Button
              onClick={() => {
                setModalForfaitsOpen(false);
                setModalForfaitsForLineIndex(null);
                setSelectedForfaits([]);
              }}
              sx={{ ml: 1 }}
            >
              Fermer
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      {/* ══════════════════════════════════════════════════
           1. ArticleSearchDialog — ouvert par "a" + ENTER
           Gère sa propre recherche, appelle onResults avec
           le tableau d'articles trouvés.
      ══════════════════════════════════════════════════ */}
      <ArticleSearchDialog
        open={articleSearchDialogOpen}
        onClose={() => setArticleSearchDialogOpen(false)}
        onResults={(data) => {
          setArticleSearchDialogOpen(false);
          handleArticleSearchResults(data);
        }}
      />

      {/* ══════════════════════════════════════════════════
           2. Modale résultats — sélection multiple
           Apparaît après que ArticleSearchDialog renvoie
           ses résultats via onResults.
      ══════════════════════════════════════════════════ */}
      <Dialog
        open={resultsDialogOpen}
        onClose={() => { setResultsDialogOpen(false); setSelectedMap(new Map()); }}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider", pb: 1.5 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <SearchIcon color="primary" />
            <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
              Articles trouvés
            </Typography>
            <Chip
              size="small"
              label={`${resultArticles.length} résultat(s)`}
              color={resultArticles.length ? "primary" : "default"}
              variant="outlined"
            />
            {selectedMap.size > 0 && (
              <Chip
                size="small"
                label={`${selectedMap.size} sélectionné(s)`}
                color="success"
              />
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {resultArticles.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={6} gap={1} color="text.secondary">
              <SearchIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              <Typography variant="body2">Aucun article trouvé.</Typography>
            </Box>
          ) : (
            <>
              {/* Barre d'actions groupées */}
              <Box px={2} py={1} display="flex" alignItems="center" gap={2} borderBottom={1} borderColor="divider">
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    const allSel = resultArticles.every((a) => selectedMap.has(a.id));
                    if (allSel) {
                      setSelectedMap(new Map());
                    } else {
                      setSelectedMap(new Map(resultArticles.map((a) => [a.id, a])));
                    }
                  }}
                >
                  Tout sélectionner / désélectionner
                </Button>
                <Typography variant="caption" color="text.secondary">
                  {selectedMap.size > 0
                    ? `${selectedMap.size} / ${resultArticles.length} sélectionné(s)`
                    : `${resultArticles.length} article(s)`}
                </Typography>
              </Box>

              <Paper variant="outlined" sx={{ m: 0, border: 0 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" />
                      <TableCell sx={{ fontWeight: 700 }}>Référence</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Désignation</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Marque</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>PV HT (€)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultArticles.map((a) => (
                      <ArticleResultRow
                        key={a.id}
                        article={a}
                        selected={selectedMap.has(a.id)}
                        onToggle={toggleSelectArticle}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            {selectedMap.size > 0
              ? `${selectedMap.size} article(s) à ajouter dans le document`
              : "Cochez les articles puis confirmez"}
          </Typography>
          <Button onClick={() => { setResultsDialogOpen(false); setSelectedMap(new Map()); }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={confirmArticleSelection}
            disabled={!selectedMap.size}
          >
            Ajouter {selectedMap.size > 0 ? `(${selectedMap.size})` : ""}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={noDataModalOpen}
        onClose={() => setNoDataModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Aucune donnée trouvée</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Aucun forfait ou catégorie ne correspond au code saisi.
          </Typography>
          {noDataLineIndex !== null && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Ligne concernée : {noDataLineIndex + 1}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoDataModalOpen(false)} variant="contained" color="primary">
            Compris
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar de feedback (ajout direct, aucun résultat, erreur) ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
