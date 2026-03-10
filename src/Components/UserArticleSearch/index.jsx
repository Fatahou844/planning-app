import { useState } from "react";
import ArticleDetailDialog from "../ArticleDetailDialog";
import ArticleResultsDialog from "../ArticleResultsDialog";
// 1. Ajouter useEffect à l'import
import { useEffect } from "react";
import ArticleSearchDialog from "../ArticleSearchDialog";

export function useArticleSearch({ open, onClose } = {}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [results, setResults] = useState(null); // null | Article[]
  const [selected, setSelected] = useState(null); // null | Article

  // Se synchronise avec le prop open du parent
  useEffect(() => {
    if (open !== undefined) setSearchOpen(open);
  }, [open]);

  const handleClose = () => {
    setSearchOpen(false);
    onClose?.(); // remonte la fermeture au parent si fourni
  };
  const handleResults = (data) => {
    if (data.length === 1) {
      // Un seul résultat → on ouvre directement la fiche
      setSelected(data[0]);
    } else {
      setResults(data);
    }
  };

  const handleSelectArticle = (article) => {
    setSelected(article);
  };

  const handleBackToResults = () => {
    setSelected(null);
  };

  function SearchDialogs() {
    return (
      <>
        <ArticleSearchDialog
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onResults={handleResults}
        />

        <ArticleResultsDialog
          open={!!results && !selected}
          onClose={() => setResults(null)}
          results={results}
          onSelectArticle={handleSelectArticle}
        />

        <ArticleDetailDialog
          open={!!selected}
          onClose={() => {
            setSelected(null);
            setResults(null);
          }}
          article={selected}
          onBack={handleBackToResults}
          showBack={results && results.length > 1}
        />
      </>
    );
  }

  return {
    openSearch: () => setSearchOpen(true),
    SearchDialogs,
  };
}
