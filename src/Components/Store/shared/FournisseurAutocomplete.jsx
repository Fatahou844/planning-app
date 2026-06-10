import { useEffect, useRef, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useAxios } from "../../../utils/hook/useAxios";

/**
 * Autocomplete fournisseur avec recherche serveur (debounce).
 * Évite de charger toute la liste des fournisseurs (potentiellement
 * plusieurs milliers) : on ne charge qu'une page limitée, filtrée par
 * le texte saisi via le paramètre `q` de GET /stock/fournisseurs.
 */
export default function FournisseurAutocomplete({
  value,
  onChange,
  disabled = false,
  size = "small",
  placeholder = "Nom, code…",
  textFieldProps = {},
}) {
  const axios = useAxios();
  const [options, setOptions]     = useState(value ? [value] : []);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading]     = useState(false);
  const [open, setOpen]           = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setLoading(true);
      const q = inputValue.trim();
      axios.get(`/stock/fournisseurs?pageSize=50${q ? `&q=${encodeURIComponent(q)}` : ""}`)
        .then(r => {
          const list = r?.data?.data || [];
          if (value && !list.some(f => f.id === value.id)) {
            setOptions([value, ...list]);
          } else {
            setOptions(list);
          }
        })
        .catch(() => setOptions(value ? [value] : []))
        .finally(() => setLoading(false));
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, open]);

  return (
    <Autocomplete
      size={size}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      filterOptions={x => x}
      getOptionLabel={o => o?.nom || ""}
      isOptionEqualToValue={(o, v) => o.id === v?.id}
      value={value || null}
      onChange={(_, v) => onChange(v)}
      onInputChange={(_, v) => setInputValue(v)}
      disabled={disabled}
      renderInput={params => (
        <TextField
          {...params}
          {...textFieldProps}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            ...(textFieldProps.InputProps || {}),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={14} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
