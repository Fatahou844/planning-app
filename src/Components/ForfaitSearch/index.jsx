import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useAxios } from "../../utils/hook/useAxios";

import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

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

  // États article
  const [modalArticlesOpen,        setModalArticlesOpen]        = useState(false);
  const [articleSearchResult,      setArticleSearchResult]      = useState(null); // { type, entity, articles }
  const [selectedArticles,         setSelectedArticles]         = useState([]);
  const [modalArticlesForLineIndex,setModalArticlesForLineIndex]= useState(null);
  const [articleSearchQuery,       setArticleSearchQuery]       = useState("");

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

  // ── Recherche article par code famille / groupe (4 chiffres) ──
  const handleArticleSearch = async (code, lineIndex) => {
    const garageId = getCurrentUser()?.garageId;
    const params = garageId ? `?code=${code}&garageId=${garageId}` : `?code=${code}`;
    try {
      const { data } = await axios.get(`/stock/articles/by-code${params}`);
      if (!data.articles?.length) return;

      // Famille → un seul article → ajout direct sans modal
      if (data.type === "famille" && data.articles.length === 1) {
        const a = data.articles[0];
        addDetailFromForfait({
          label:     a.libelle1 || a.libelle2 || "Article",
          code:      a.refExt   || a.codeBarre || "---",
          quantity:  1,
          unitPrice: a.ArticlePricing?.prixHT || 0,
        }, lineIndex);
        return;
      }

      // Groupe (ou famille avec plusieurs articles) → modal multi-sélection
      setArticleSearchResult(data);
      setSelectedArticles([]);
      setArticleSearchQuery("");
      setModalArticlesForLineIndex(lineIndex);
      setModalArticlesOpen(true);
    } catch {
      // Code introuvable (404) → pas d'action, le champ reste tel quel
    }
  };

  const toggleSelectArticle = (a) => {
    setSelectedArticles(prev =>
      prev.some(p => p.id === a.id) ? prev.filter(p => p.id !== a.id) : [...prev, a]
    );
  };

  const confirmArticleSelection = () => {
    if (!selectedArticles.length) { setModalArticlesOpen(false); return; }
    const lineIndex = modalArticlesForLineIndex;
    let firstUsed = false;

    if (lineIndex !== null) {
      const a = selectedArticles[0];
      addDetailFromForfait({
        label:     a.libelle1 || a.libelle2 || "Article",
        code:      a.refExt   || a.codeBarre || "---",
        quantity:  1,
        unitPrice: a.ArticlePricing?.prixHT || 0,
      }, lineIndex);
      firstUsed = true;
    }

    selectedArticles.forEach((a, idx) => {
      if (firstUsed && idx === 0) return;
      addDetailFromForfait({
        label:     a.libelle1 || a.libelle2 || "Article",
        code:      a.refExt   || a.codeBarre || "---",
        quantity:  1,
        unitPrice: a.ArticlePricing?.prixHT || 0,
      }, null);
    });

    setSelectedArticles([]);
    setModalArticlesOpen(false);
    setModalArticlesForLineIndex(null);
  };

  const handleSearchFromLine = async (index) => {
    const value = (details[index]?.label || "").trim();
    if (!value) return;

    // ── Si 4 chiffres → recherche article (famille ou groupe) ──
    if (/^\d{4}$/.test(value)) {
      handleArticleSearch(value, index);
      return;
    }

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
            label: data.libelle,
            // quantity: data.temps,
            code: `${data.CategoryForfait.codes_principaux.code1}${data.CategoryForfait.code2}${data.code3}`,
            quantity: 1,
            unitPrice: data.prix,
          },
          index,
        );
        return;
      }
    } catch (error) {
      openNoDataModal(index);
      return;
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
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchFromLine(index);
                      }
                    }}
                    size="small"
                    fullWidth
                    placeholder='Forfait : W · W01 · W0102 | Article : 0101 (famille) · 0003 (groupe) → ENTER'
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
      {/* ── MODALE ARTICLES ── */}
      <Dialog
        open={modalArticlesOpen}
        onClose={() => { setModalArticlesOpen(false); setModalArticlesForLineIndex(null); setSelectedArticles([]); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <span>Articles</span>
            {articleSearchResult && (
              <Chip
                size="small"
                label={`${articleSearchResult.type === "famille" ? "Famille" : "Groupe"} ${articleSearchResult.entity.code} — ${articleSearchResult.entity.nom}`}
                color={articleSearchResult.type === "famille" ? "primary" : "secondary"}
              />
            )}
            <Chip size="small" label={`${articleSearchResult?.articles?.length ?? 0} résultat(s)`} variant="outlined" />
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            size="small"
            fullWidth
            placeholder="Filtrer par libellé ou référence…"
            value={articleSearchQuery}
            onChange={e => setArticleSearchQuery(e.target.value)}
            sx={{ mb: 1 }}
          />
          <List dense sx={{ maxHeight: 380, overflowY: "auto" }}>
            {(articleSearchResult?.articles ?? [])
              .filter(a => {
                const q = articleSearchQuery.toLowerCase();
                return !q
                  || (a.libelle1 || "").toLowerCase().includes(q)
                  || (a.refExt   || "").toLowerCase().includes(q);
              })
              .map(a => {
                const selected = selectedArticles.some(p => p.id === a.id);
                return (
                  <ListItemButton key={a.id} selected={selected} onClick={() => toggleSelectArticle(a)} dense>
                    <Checkbox checked={selected} size="small" sx={{ mr: 1 }} disableRipple />
                    <ListItemText
                      primary={`${a.refExt ? a.refExt + " — " : ""}${a.libelle1 || "—"}`}
                      secondary={
                        <>
                          {a.Marque?.nom && <span>{a.Marque.nom} · </span>}
                          <span>PV HT : {a.ArticlePricing?.prixHT?.toFixed(2) ?? "—"} €</span>
                        </>
                      }
                    />
                  </ListItemButton>
                );
              })}
          </List>
        </DialogContent>
        <DialogActions>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1, pl: 1 }}>
            {selectedArticles.length} article(s) sélectionné(s)
          </Typography>
          <Button onClick={() => { setModalArticlesOpen(false); setSelectedArticles([]); }}>Annuler</Button>
          <Button variant="contained" onClick={confirmArticleSelection} disabled={!selectedArticles.length}>
            Ajouter la sélection
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
          <Button
            onClick={() => setNoDataModalOpen(false)}
            variant="contained"
            color="primary"
          >
            Compris
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
