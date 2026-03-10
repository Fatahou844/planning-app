import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { BASE_URL_API } from "../../config";
import { useApiAutocomplete } from "../../hooks/Useapiautocomplete";
import BlocPneus from "../BlocPneus";
import FormRow from "../FormRow";
// ─────────────────────────────────────────────────────────────
// Composant réutilisable : un champ Autocomplete + API
// ─────────────────────────────────────────────────────────────
export function ApiAutocompleteField({ resource, label, value, onChange }) {
  const { options, loading, search, create } = useApiAutocomplete(resource);
  const [inputValue, setInputValue] = useState("");

  // value est { id, nom } — on compare sur le nom pour détecter une nouvelle saisie
  const isNew =
    inputValue.trim().length > 0 &&
    !options.some(
      (o) => o.nom.toLowerCase() === inputValue.trim().toLowerCase(),
    );

  const handleCreate = async () => {
    const created = await create(inputValue.trim()); // retourne { id, nom }
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
        // MUI utilise cette fn pour afficher le label dans le dropdown et l'input
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
            // freeSolo : l'utilisateur a validé sa saisie libre sans choisir une option
            onChange({ id: null, nom: selected });

            setInputValue(selected);
          } else {
            // Option choisie dans le dropdown → objet { id, nom }
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
        <Button startIcon={<AddIcon />} size="small" onClick={handleCreate}>
          Ajouter "{inputValue.trim()}"
        </Button>
      )}
    </>
  );
}

export default function ReferenceArticleModal({ open, onClose }) {
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
    fournisseur: "",
    marque: "",
    groupe: "",
    famille: "",
    emplacement: "",
    garantie: "",
    composantLot: false,
    conditionnement: "",
    pneus: {
      largeur: "",
      hauteur: "",
      diametre: "",
      charge: "",
      vitesse: "",
      carburant: "",
      solMouille: "",
      bruit: "",
      valeurBruit: "",
    },
    oems: [], // ← ajouter ici
  });
  const setField = (field) => (value) =>
    setForm((f) => ({ ...f, [field]: value }));
  /* ================= USER DATA ================= */
  const typeConfig = {
    Pneus: {
      pricing: {
        vente: true,
        achat: true,
      },
      oem: true,
      photos: true,
      documents: true,
    },
    Consommable: {
      pricing: {
        vente: false,
        achat: true,
      },
      oem: false,
      photos: false,
      documents: false,
    },
    Pièces: {
      pricing: {
        vente: true,
        achat: true,
      },
      oem: true,
      photos: true,
      documents: true,
    },
    Accessoires: {
      pricing: {
        vente: true,
        achat: true,
      },
      oem: true,
      photos: true,
      documents: true,
    },
  };
  const config = typeConfig[form.type] || {};
  const userTVA = [0, 7, 10, 14, 20];
  const typesArticle = ["Pneus", "Pièces", "Accessoires", "Consommable"];

  const [newEmplacement, setNewEmplacement] = useState("");

  const [userData, setUserData] = useState({
    fournisseurs: ["Michelin", "Bosch"],
    marques: ["Valeo", "Brembo"],
    groupes: ["Freinage", "Filtration"],
    familles: {
      Freinage: ["Plaquettes", "Disques"],
      Filtration: ["Huile", "Air"],
    },
    emplacements: ["A1", "B2", "Rayon pneus", "Étagère 3"],
  });

  /* ================= FORM ================= */

  /* ================= ADD OPTION ================= */

  const addOption = (type, value, groupe = null) => {
    if (!value) return;

    setUserData((prev) => {
      if (type === "famille") {
        return {
          ...prev,
          familles: {
            ...prev.familles,
            [groupe]: [...(prev.familles[groupe] || []), value],
          },
        };
      }

      return {
        ...prev,
        [type]: [...prev[type], value],
      };
    });
  };

  /* ================= NEW VALUES ================= */

  const [newFournisseur, setNewFournisseur] = useState("");
  const [newMarque, setNewMarque] = useState("");
  const [newGroupe, setNewGroupe] = useState("");
  const [newFamille, setNewFamille] = useState("");

  /* ================= CALCULS ================= */

  // Ajouter un OEM vide
  const addOEM = () => setForm((f) => ({ ...f, oems: [...f.oems, ""] }));

  // Modifier un OEM à l'index donné
  const updateOEM = (index, value) =>
    setForm((f) => {
      const oems = [...f.oems];
      oems[index] = value;
      return { ...f, oems };
    });

  // Supprimer un OEM
  const removeOEM = (index) =>
    setForm((f) => ({
      ...f,
      oems: f.oems.filter((_, i) => i !== index),
    }));

  const recalcMargin = (field, value) => {
    // Remplacer la virgule par un point pour que le calcul fonctionne si l'utilisateur tape "10,5"
    const cleanValue = value.replace(",", ".");

    setForm((prev) => {
      // On crée une copie avec la nouvelle valeur brute pour ne pas bloquer l'input
      const updatedForm = {
        ...prev,
        [field]: cleanValue,
      };

      // On extrait les valeurs pour le calcul (on utilise 0 si ce n'est pas un nombre valide)
      const ht = parseFloat(updatedForm.prixHT) || 0;
      const achat = parseFloat(updatedForm.prixAchat) || 0;
      const port = parseFloat(updatedForm.fraisPort) || 0;

      // Calcul de la marge
      const marge = ht - (achat + port);
      const margePct = ht ? (marge / ht) * 100 : 0;

      return {
        ...updatedForm,
        marge: marge.toFixed(2), // On arrondit pour l'affichage
        margePct: margePct.toFixed(2),
      };
    });
  };

  const calcPrices = (field, value) => {
    // On accepte la virgule et le point pour la saisie
    const cleanValue = value.replace(",", ".");

    setForm((prev) => {
      // 1. On met à jour la valeur brute immédiatement pour ne pas bloquer le curseur
      const newForm = { ...prev, [field]: cleanValue };

      // 2. Préparation des variables pour le calcul (TVA par défaut à 20% si vide)
      const tvaRate = parseFloat(newForm.tva) || 0;

      let updatedHT = newForm.prixHT;
      let updatedTTC = newForm.prixTTC;

      // 3. Logique : Si on change le TTC, on calcule le HT automatiquement
      if (field === "prixTTC") {
        const ttcNum = parseFloat(cleanValue) || 0;
        updatedHT = (ttcNum / (1 + tvaRate / 100)).toFixed(2);
      }
      // Si on change le HT, on calcule le TTC
      else if (field === "prixHT") {
        const htNum = parseFloat(cleanValue) || 0;
        updatedTTC = (htNum * (1 + tvaRate / 100)).toFixed(2);
      }

      return {
        ...newForm,
        prixHT: updatedHT,
        prixTTC: updatedTTC,
      };
    });
  };

  /* ================= UPLOAD ================= */

  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);

  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files);

    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...mapped]);
  };

  const removePhoto = (index) => {
    const updated = [...photos];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setPhotos(updated);
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);

    const mapped = files.map((file) => ({
      file,
      nom: file.nom,
      size: file.size,
      preview: URL.createObjectURL(file),
    }));

    setDocuments((prev) => [...prev, ...mapped]);
  };

  const removeDocument = (index) => {
    const updated = [...documents];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setDocuments(updated);
  };

  const handleSave = async () => {
    const payload = {
      article: {
        type: form.type,
        libelle1: form.libelle1,
        libelle2: form.libelle2,
        libelle3: form.libelle3,
        codeBarre: form.codeBarre,
        refExt: form.refExt,
        refInt: form.refInt,
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

      // Seulement si type Pneus
      pneuSpec:
        form.type === "Pneus"
          ? {
              largeur: form.pneus.largeur,
              hauteur: form.pneus.hauteur,
              diametre: form.pneus.diametre,
              charge: form.pneus.charge,
              vitesse: form.pneus.vitesse,
              carburant: form.pneus.carburant,
              solMouille: form.pneus.solMouille,
              bruit: form.pneus.bruit,
              valeurBruit: form.pneus.valeurBruit,
            }
          : null,

      // Tableau de strings bruts
      oem: form.oems.filter((ref) => ref.trim() !== ""),
    };

    await fetch(BASE_URL_API + "/v1/stock/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    onClose();
  };

  const typeComponents = {
    Pneus: BlocPneus,
  };

  const SpecificComponent = typeComponents[form.type];

  /* ================= UI ================= */

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Créer / Référencer un article</DialogTitle>

      <DialogContent>
        {/* INFOS */}
        <Grid item xs={12} mb={2}>
          <Grid container alignItems="center" spacing={2}>
            {/* Libellé */}
            <Grid item xs={12} md={4}>
              <Typography variant="body2" fontWeight={500}>
                <strong>Type</strong>
              </Typography>
            </Grid>

            {/* Select */}
            <Grid item xs={12} md={8}>
              <TextField
                select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                fullWidth
                size="small"
              >
                {typesArticle.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Grid>

        {/* {form.type === "Pneus" && (
          <BlocPneus pneus={form.pneus} setForm={setForm} />
        )} */}

        {SpecificComponent && (
          <SpecificComponent pneus={form.pneus} setForm={setForm} />
        )}

        <Grid container spacing={2}>
          {[
            "libelle1",
            "libelle2",
            "libelle3",
            "codeBarre",
            "refExt",
            "refInt",
          ].map((nom) => (
            <Grid item xs={12} key={nom}>
              <Grid container alignItems="center" spacing={2}>
                {/* Libellé à gauche */}
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" fontWeight={500}>
                    {" "}
                    <strong>{nom}</strong>
                  </Typography>
                </Grid>

                {/* Champ à droite */}
                <Grid item xs={12} md={8}>
                  <TextField
                    value={form[nom]}
                    onChange={(e) =>
                      setForm({ ...form, [nom]: e.target.value })
                    }
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>

        {config.oem && (
          <>
            <Typography fontWeight="bold" sx={{ mt: 2 }}>
              Références OEM
            </Typography>

            <Grid container spacing={2} mt={1}>
              {form.oems &&
                form.oems.map((oem, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Box display="flex" gap={1}>
                      <TextField
                        label={`OEM ${index + 1}`}
                        value={oem}
                        onChange={(e) => updateOEM(index, e.target.value)}
                        size="small"
                        fullWidth
                      />

                      <Button
                        color="error"
                        onClick={() => removeOEM(index)}
                        sx={{ minWidth: 40 }}
                      >
                        ✕
                      </Button>
                    </Box>
                  </Grid>
                ))}
            </Grid>

            <Button startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={addOEM}>
              Ajouter OEM
            </Button>

            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* TARIFICATION */}
        {config.pricing && (
          <>
            <Typography fontWeight="bold" sx={{ mt: 2, mb: 2 }}>
              Prix
            </Typography>

            {config.pricing.vente && (
              <FormRow label="Vente">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Prix de vente HT"
                      value={form.prixHT}
                      onChange={(e) => calcPrices("prixHT", e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Prix de vente TTC"
                      value={form.prixTTC}
                      onChange={(e) => calcPrices("prixTTC", e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="TVA"
                      value={form.tva}
                      onChange={(e) =>
                        setForm({ ...form, tva: e.target.value })
                      }
                      fullWidth
                      size="small"
                    >
                      {userTVA.map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}%
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </FormRow>
            )}

            {config.pricing.achat && (
              <FormRow label="Achat">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Prix d'achat HT"
                      value={form.prixAchat}
                      onChange={(e) =>
                        recalcMargin("prixAchat", e.target.value)
                      }
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Frais de port HT"
                      value={form.fraisPort}
                      onChange={(e) =>
                        recalcMargin("fraisPort", e.target.value)
                      }
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
              </FormRow>
            )}

            {config.pricing.vente && (
              <FormRow label="Marge">
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Marge"
                      value={form.marge}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Marge %"
                      value={form.margePct}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
              </FormRow>
            )}
          </>
        )}

        <Divider sx={{ my: 3 }} />
        <FormRow label="Fournisseur">
          <ApiAutocompleteField
            resource="fournisseurs"
            value={form.fournisseur}
            onChange={setField("fournisseur")}
          />
        </FormRow>

        {newFournisseur && !userData.fournisseurs.includes(newFournisseur) && (
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={() => {
              addOption("fournisseurs", newFournisseur);
              setForm({ ...form, fournisseur: newFournisseur });
              setNewFournisseur("");
            }}
          >
            Ajouter "{newFournisseur}"
          </Button>
        )}

        {/* <Divider sx={{ my: 2 }} /> */}

        {/* MARQUE */}
        <FormRow label="Marque">
          <ApiAutocompleteField
            resource="marques"
            value={form.marque}
            onChange={setField("marque")}
          />
        </FormRow>

        {newMarque && !userData.marques.includes(newMarque) && (
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={() => {
              addOption("marques", newMarque);
              setForm({ ...form, marque: newMarque });
              setNewMarque("");
            }}
          >
            Ajouter "{newMarque}"
          </Button>
        )}

        <Divider sx={{ my: 3 }} />

        {/* LOT */}
        <FormRow label="Composant d'un lot">
          <TextField
            select
            value={form.composantLot ? "oui" : "non"}
            onChange={(e) =>
              setForm({ ...form, composantLot: e.target.value === "oui" })
            }
            fullWidth
            size="small"
          >
            <MenuItem value="non">Non</MenuItem>
            <MenuItem value="oui">Oui</MenuItem>
          </TextField>
        </FormRow>

        {form.composantLot && (
          <FormRow label="Conditionnement">
            <TextField
              value={form.conditionnement}
              onChange={(e) =>
                setForm({ ...form, conditionnement: e.target.value })
              }
              fullWidth
              size="small"
            />
          </FormRow>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography fontWeight="bold" sx={{ mt: 2, mb: 2 }}>
          Groupe & famille
        </Typography>

        {/* GROUPE */}
        <FormRow label="Groupe">
          <ApiAutocompleteField
            resource="groupes"
            value={form.fournisseur}
            onChange={setField("groupe")}
          />
        </FormRow>

        {newGroupe && !userData.groupes.includes(newGroupe) && (
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={() => {
              addOption("groupes", newGroupe);
              setForm({ ...form, groupe: newGroupe });
              setNewGroupe("");
            }}
          >
            Ajouter "{newGroupe}"
          </Button>
        )}

        {/* <Divider sx={{ my: 2 }} /> */}

        {/* FAMILLE */}
        <FormRow label="Famille">
          <ApiAutocompleteField
            resource="familles"
            value={form.fournisseur}
            onChange={setField("famille")}
          />
        </FormRow>

        {form.groupe &&
          newFamille &&
          !(userData.familles[form.groupe] || []).includes(newFamille) && (
            <Button
              startIcon={<AddIcon />}
              size="small"
              onClick={() => {
                addOption("famille", newFamille, form.groupe);
                setForm({ ...form, famille: newFamille });
                setNewFamille("");
              }}
            >
              Ajouter "{newFamille}"
            </Button>
          )}

        <Divider sx={{ my: 3 }} />
        <FormRow label="Emplacement / Casier">
          <ApiAutocompleteField
            resource="emplacements"
            value={form.emplacement}
            onChange={setField("emplacement")}
          />
        </FormRow>

        {newEmplacement && !userData.emplacements.includes(newEmplacement) && (
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={() => {
              addOption("emplacements", newEmplacement);
              setForm({ ...form, emplacement: newEmplacement });
              setNewEmplacement("");
            }}
          >
            Ajouter "{newEmplacement}"
          </Button>
        )}
        <Divider sx={{ my: 3 }} />

        <FormRow label="SAV / Conditions de garantie" alignTop>
          <TextField
            value={form.garantie}
            onChange={(e) => setForm({ ...form, garantie: e.target.value })}
            multiline
            rows={4}
            fullWidth
            size="small"
          />
        </FormRow>

        {/* PHOTOS */}
        {config.photos && (
          <>
            <Typography fontWeight="bold">Photos</Typography>

            <Box display="flex" gap={2} mt={1} flexWrap="wrap">
              {/* 3 zones principales */}
              {[0, 1, 2].map((slot) => (
                <Box key={slot} position="relative">
                  {photos[slot] ? (
                    <>
                      <img
                        src={photos[slot].preview}
                        width={90}
                        height={90}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                      />

                      <DeleteIcon
                        onClick={() => removePhoto(slot)}
                        sx={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          color: "#fff",
                          background: "#0008",
                          borderRadius: "50%",
                          cursor: "pointer",
                        }}
                      />
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{
                        width: 90,
                        height: 90,
                        borderStyle: "dashed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={handleFileAdd}
                      />
                    </Button>
                  )}
                </Box>
              ))}

              {/* Photos supplémentaires */}
              {photos.slice(3).map((p, i) => (
                <Box key={i + 3} position="relative">
                  <img
                    src={p.preview}
                    width={70}
                    height={70}
                    style={{ objectFit: "cover", borderRadius: 6 }}
                  />

                  <DeleteIcon
                    onClick={() => removePhoto(i + 3)}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      color: "#fff",
                      background: "#0008",
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                  />
                </Box>
              ))}

              {/* bouton ajouter plus */}
              <Button
                component="label"
                variant="outlined"
                sx={{
                  width: 70,
                  height: 70,
                  minWidth: 0,
                  borderStyle: "dashed",
                }}
              >
                +
                <input
                  hidden
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileAdd}
                />
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />
          </>
        )}
        {/* DOCUMENTS */}
        {/* DOCUMENTS */}

        {config.documents && (
          <>
            <Typography fontWeight="bold" mt={3}>
              Documents
            </Typography>

            <Box display="flex" gap={2} mt={1} flexWrap="wrap">
              {/* 3 documents principaux */}
              {[0, 1, 2].map((slot) => (
                <Box key={slot} position="relative">
                  {documents[slot] ? (
                    <Box
                      sx={{
                        width: 140,
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        p: 1,
                        background: "#fafafa",
                        position: "relative",
                      }}
                    >
                      <DeleteIcon
                        onClick={() => removeDocument(slot)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          cursor: "pointer",
                          fontSize: 18,
                        }}
                      />

                      <Typography variant="body2" fontWeight="bold" noWrap>
                        {documents[slot].nom}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {(documents[slot].size / 1024).toFixed(1)} KB
                      </Typography>

                      <Button
                        size="small"
                        href={documents[slot].preview}
                        target="_blank"
                        sx={{ mt: 1 }}
                      >
                        Voir
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{
                        width: 140,
                        height: 70,
                        borderStyle: "dashed",
                      }}
                    >
                      +
                      <input
                        hidden
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        onChange={handleDocumentUpload}
                      />
                    </Button>
                  )}
                </Box>
              ))}

              {/* documents supplémentaires */}
              {documents.slice(3).map((doc, i) => (
                <Box
                  key={i + 3}
                  sx={{
                    width: 120,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    p: 1,
                    background: "#fafafa",
                    position: "relative",
                  }}
                >
                  <DeleteIcon
                    onClick={() => removeDocument(i + 3)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  />

                  <Typography variant="caption" fontWeight="bold" noWrap>
                    {doc.nom}
                  </Typography>
                </Box>
              ))}

              {/* bouton ajouter plus */}
              <Button
                component="label"
                variant="outlined"
                sx={{
                  width: 70,
                  height: 70,
                  minWidth: 0,
                  borderStyle: "dashed",
                }}
              >
                +
                <input
                  hidden
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={handleDocumentUpload}
                />
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* ACTIONS */}
        <Box display="flex" justifyContent="space-between">
          <Button onClick={onClose}>Quitter</Button>
          <Button variant="contained" onClick={handleSave}>
            Modifier
          </Button>

          <Button variant="contained" onClick={handleSave}>
            Enregistrer
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
