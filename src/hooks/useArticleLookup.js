import { useState } from "react";
import { BASE_URL_API } from "../config";

const API_SEARCH = `${BASE_URL_API}/v1/stock/articles/search`;

/**
 * Mappe un article de la DB vers le format du formulaire ReferenceArticleModal.
 */
function mapDbArticleToForm(article) {
  return {
    type: article.type || "",
    libelle1: article.libelle1 || "",
    libelle2: article.libelle2 || "",
    libelle3: article.libelle3 || "",
    codeBarre: article.codeBarre || "",
    refExt: article.refExt || "",
    refInt: article.refInt || "",
    garantie: article.garantie || "",
    composantLot: article.composantLot || false,
    conditionnement: article.conditionnement || "",
    fournisseur: article.Fournisseur
      ? { id: article.fournisseurId, nom: article.Fournisseur.nom }
      : null,
    marque: article.Marque
      ? { id: article.marqueId, nom: article.Marque.nom }
      : null,
    groupe: article.Groupe
      ? { id: article.groupeId, nom: article.Groupe.nom }
      : null,
    famille: article.Famille
      ? { id: article.familleId, nom: article.Famille.nom }
      : null,
    emplacement: article.Emplacement
      ? { id: article.emplacementId, nom: article.Emplacement.nom }
      : null,
    prixHT: article.ArticlePricing?.prixHT?.toString() || "",
    prixTTC: article.ArticlePricing?.prixTTC?.toString() || "",
    tva: article.ArticlePricing?.tva ?? 20,
    prixAchat: article.ArticlePricing?.prixAchat?.toString() || "",
    fraisPort: article.ArticlePricing?.fraisPort?.toString() || "",
    marge: article.ArticlePricing?.marge?.toString() || "",
    margePct: article.ArticlePricing?.margePct?.toString() || "",
    pneus: article.PneuSpec
      ? {
          largeur: article.PneuSpec.largeur || "",
          hauteur: article.PneuSpec.hauteur || "",
          diametre: article.PneuSpec.diametre || "",
          charge: article.PneuSpec.charge || "",
          vitesse: article.PneuSpec.vitesse || "",
          carburant: article.PneuSpec.carburant || "",
          solMouille: article.PneuSpec.solMouille || "",
          bruit: article.PneuSpec.bruit || "",
          valeurBruit: article.PneuSpec.valeurBruit || "",
        }
      : {
          largeur: "", hauteur: "", diametre: "", charge: "",
          vitesse: "", carburant: "", solMouille: "", bruit: "", valeurBruit: "",
        },
    oems: article.ArticleOEMs?.map((o) => o.reference) || [],
  };
}

/**
 * Mappe une réponse UPCitemdb vers le format du formulaire.
 * Utilisé comme fallback pour les codes-barres non encore en base.
 */
function mapUpcItemToForm(item) {
  return {
    libelle1: item.title || "",
    libelle2: item.brand || "",
    libelle3: item.description?.slice(0, 100) || "",
    codeBarre: item.ean || item.upc || "",
    marque: item.brand ? { id: null, nom: item.brand } : null,
  };
}

/**
 * Hook de lookup d'article par code-barre ou référence externe.
 *
 * Étape 1 : recherche dans la DB locale
 * Étape 2 (fallback) : appel UPCitemdb (barcode universel)
 *
 * Pour les pièces auto (TecDoc), brancher l'endpoint TecDoc
 * dans la variable TECDOC_ENDPOINT ci-dessous quand les credentials sont disponibles.
 */
const TECDOC_ENDPOINT = null; // ex: "https://webservices.tecalliance.services/..."

export function useArticleLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * @param {string} code  Code-barre ou référence externe
   * @returns {{ source: 'local'|'barcode'|'tecdoc', formData: object } | null}
   */
  const lookup = async (code) => {
    if (!code?.trim()) return null;
    setLoading(true);
    setError(null);

    try {
      // ── 1. Recherche dans la base locale ──────────────────────
      const params = new URLSearchParams({ reference: code.trim() });
      const dbRes = await fetch(`${API_SEARCH}?${params}`);
      const dbData = await dbRes.json();

      if (Array.isArray(dbData) && dbData.length > 0) {
        return {
          source: "local",
          label: "Article trouvé dans votre base",
          formData: mapDbArticleToForm(dbData[0]),
        };
      }

      // ── 2. TecDoc (si configuré) ──────────────────────────────
      if (TECDOC_ENDPOINT) {
        // À adapter selon le contrat TecDoc
        const tdRes = await fetch(`${TECDOC_ENDPOINT}?articleNumber=${code.trim()}`);
        const tdData = await tdRes.json();
        if (tdData?.article) {
          // Mapper ici la réponse TecDoc vers formData
          return {
            source: "tecdoc",
            label: "Article trouvé via TecDoc",
            formData: { libelle1: tdData.article.description || "" /* adapter */ },
          };
        }
      }

      // ── 3. Fallback : UPCitemdb (barcode universel) ───────────
      const upcRes = await fetch(
        `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(code.trim())}`
      );
      const upcData = await upcRes.json();

      if (upcData?.items?.length > 0) {
        return {
          source: "barcode",
          label: "Données trouvées via code-barre (UPC/EAN)",
          formData: mapUpcItemToForm(upcData.items[0]),
        };
      }

      return null; // rien trouvé nulle part
    } catch (err) {
      setError("Erreur lors de la recherche automatique.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { lookup, loading, error };
}
