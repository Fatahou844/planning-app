import { useCallback, useRef, useState } from "react";
import { BASE_URL_API } from "../config";

const API_BASE = BASE_URL_API + "/v1/stock"; // adapte si besoin

/**
 * Hook générique pour un champ Autocomplete connecté à l'API.
 *
 * @param {string} resource  - "fournisseurs" | "marques" | "emplacements"
 */
export function useApiAutocomplete(resource) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Recherche avec debounce 300ms
  const search = useCallback(
    (query) => {
      clearTimeout(debounceRef.current);

      if (!query || query.trim().length === 0) {
        setOptions([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `${API_BASE}/${resource}/search?q=${encodeURIComponent(query.trim())}`,
          );
          const data = await res.json();
          // On garde les objets complets { _id, nom } pour pouvoir remonter l'id
          setOptions(data);
        } catch (err) {
          console.error(`[${resource}] search error:`, err);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [resource],
  );

  // Création d'une nouvelle entrée en base — retourne l'objet { _id, nom }
  const create = useCallback(
    async (nom) => {
      if (!nom || !nom.trim()) return null;
      try {
        const res = await fetch(`${API_BASE}/${resource}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nom: nom.trim() }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json(); // { _id, nom }
      } catch (err) {
        console.error(`[${resource}] create error:`, err);
        return null;
      }
    },
    [resource],
  );


  return { options, loading, search, create };
}
