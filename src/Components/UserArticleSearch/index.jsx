import SearchOffIcon from "@mui/icons-material/SearchOff";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ArticleDetailDialog from "../ArticleDetailDialog";
import ArticleResultsDialog from "../ArticleResultsDialog";
import ArticleSearchDialog from "../ArticleSearchDialog";

export function useArticleSearch({ open, onClose } = {}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [noResults, setNoResults] = useState(false);
  // Ref synchrone pour savoir si des résultats ont été reçus avant que onClose soit appelé
  const hasResultsRef = useRef(false);

  useEffect(() => {
    if (open === true) {
      // Nouveau cycle : reset complet
      setResults(null);
      setSelected(null);
      setNoResults(false);
      hasResultsRef.current = false;
      setSearchOpen(true);
    } else if (open === false) {
      setSearchOpen(false);
    }
  }, [open]);

  const handleResults = (data) => {
    if (data.length === 1) {
      hasResultsRef.current = true;
      setSelected(data[0]);
    } else if (data.length > 1) {
      hasResultsRef.current = true;
      setResults(data);
    } else {
      // Aucun résultat : on affiche le modal "aucun article trouvé"
      hasResultsRef.current = true;
      setNoResults(true);
    }
  };

  const handleSelectArticle = (article) => {
    setSelected(article);
  };

  const handleBackToResults = () => {
    setSelected(null);
  };

  const closeAll = () => {
    setSearchOpen(false);
    setResults(null);
    setSelected(null);
    setNoResults(false);
    hasResultsRef.current = false;
    onClose?.();
  };

  function SearchDialogs() {
    const theme = useTheme();
    return (
      <>
        <ArticleSearchDialog
          open={searchOpen}
          onClose={() => {
            const hadResults = hasResultsRef.current;
            hasResultsRef.current = false;
            setSearchOpen(false);
            if (!hadResults) onClose?.();
          }}
          onResults={handleResults}
        />

        <Dialog open={noResults} onClose={closeAll} maxWidth="xs" fullWidth>
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "background.default",
              borderBottom: "1px solid",
              borderColor: "divider",
              py: 1.5,
              px: 2.5,
            }}
          >
            <SearchOffIcon color="warning" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600}>
              Aucun article trouvé
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2.5, px: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Aucun article ne correspond à vos critères de recherche.
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              bgcolor: "background.default",
              borderTop: "1px solid",
              borderColor: "divider",
              px: 2.5,
              py: 1.5,
            }}
          >
            <Button variant="outlined" color="inherit" onClick={closeAll}>
              Quitter
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setNoResults(false);
                setSearchOpen(true);
              }}
            >
              Nouvelle recherche
            </Button>
          </DialogActions>
        </Dialog>

        <ArticleResultsDialog
          open={!!results && !selected}
          onClose={closeAll}
          results={results}
          onSelectArticle={handleSelectArticle}
        />

        <ArticleDetailDialog
          open={!!selected}
          onClose={closeAll}
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
