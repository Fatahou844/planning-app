import AddIcon from "@mui/icons-material/Add";
import {
  Autocomplete,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useApiAutocomplete } from "../../hooks/Useapiautocomplete";
import FormRow from "../FormRow";

// ─────────────────────────────────────────────────────────────
// Composant réutilisable : un champ Autocomplete + API
// ─────────────────────────────────────────────────────────────
export function ApiAutocompleteField({ resource, label, value, onChange }) {
  const { options, loading, search, create } = useApiAutocomplete(resource);
  const [inputValue, setInputValue] = useState("");

  const isNew = inputValue.trim() && !options.includes(inputValue.trim());

  const handleCreate = async () => {
    const saved = await create(inputValue.trim());
    if (saved) {
      onChange(saved);
      setInputValue("");
    }
  };

  return (
    <>
      <Autocomplete
        freeSolo
        options={options}
        loading={loading}
        value={value || null}
        inputValue={inputValue}
        onInputChange={(e, val) => {
          setInputValue(val);
          search(val);
        }}
        onChange={(e, val) => {
          onChange(val ?? "");
          setInputValue(val ?? "");
        }}
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

// ─────────────────────────────────────────────────────────────
// Exemple d'utilisation dans ton formulaire
// ─────────────────────────────────────────────────────────────
export function ArticleForm() {
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
  });

  const setField = (field) => (value) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <form>
      {/* ... tes autres champs ... */}

      <FormRow label="Fournisseur">
        <ApiAutocompleteField
          resource="fournisseurs"
          value={form.fournisseur}
          onChange={setField("fournisseur")}
        />
      </FormRow>

      <FormRow label="Marque">
        <ApiAutocompleteField
          resource="marques"
          value={form.marque}
          onChange={setField("marque")}
        />
      </FormRow>

      <FormRow label="Emplacement / Casier">
        <ApiAutocompleteField
          resource="emplacements"
          value={form.emplacement}
          onChange={setField("emplacement")}
        />
      </FormRow>

      {/* ... suite du formulaire ... */}
    </form>
  );
}
