import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import CardSection from "../Components/Store/CardSection";
import ImportExcel from "../Components/Store/ImportExcel/ImportExcel";
import { useAxios } from "../utils/hook/useAxios";
import { useUser } from "../utils/hook/UserContext";

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function pad4(n) {
  return String(n).padStart(4, "0");
}

function getFamilleCodeRange(groupeCode) {
  const n = parseInt(groupeCode, 10);
  const min = n === 1 ? 1 : (n - 1) * 100;
  const max = n * 100 - 1;
  return { min: pad4(min), max: pad4(max) };
}

/* ─────────────────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────────────────── */
export default function Stock() {
  const axios = useAxios();
  const { user } = useUser();
  const garageId = user?.garageId;

  /* ── État global ── */
  const [groupes, setGroupes] = useState([]);
  const [selectedGroupe, setSelectedGroupe] = useState(null);
  const [familleData, setFamilleData] = useState(null); // { groupe, familles }
  const [loadingGroupes, setLoadingGroupes] = useState(false);
  const [loadingFamilles, setLoadingFamilles] = useState(false);

  /* ── Modales ── */
  const [addGroupeOpen, setAddGroupeOpen] = useState(false);
  const [addFamilleOpen, setAddFamilleOpen] = useState(false);
  const [editGroupe, setEditGroupe] = useState(null);   // objet groupe à éditer
  const [editFamille, setEditFamille] = useState(null); // objet famille à éditer
  const [deleteGroupe, setDeleteGroupe] = useState(null);
  const [deleteFamille, setDeleteFamille] = useState(null);

  /* ── Formulaires ── */
  const [newGroupeNom, setNewGroupeNom] = useState("");
  const [newFamilleNom, setNewFamilleNom] = useState("");
  const [editNom, setEditNom] = useState("");
  const [saving, setSaving] = useState(false);

  /* ── Feedback ── */
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, severity, message });

  /* ─────────────────── Chargement des groupes ─────────────────── */
  const loadGroupes = useCallback(async () => {
    if (!garageId) return;
    setLoadingGroupes(true);
    try {
      const res = await axios.get(`/stock/groupes?garageId=${garageId}`);
      setGroupes(res?.data || []);
    } finally {
      setLoadingGroupes(false);
    }
  }, [garageId, axios]);

  useEffect(() => {
    loadGroupes();
  }, [loadGroupes]);

  /* ─────────────────── Chargement des familles ─────────────────── */
  const loadFamilles = useCallback(
    async (groupeId) => {
      setLoadingFamilles(true);
      try {
        const res = await axios.get(`/stock/groupes/${groupeId}/familles`);
        if (res?.data) setFamilleData(res.data);
      } finally {
        setLoadingFamilles(false);
      }
    },
    [axios]
  );

  useEffect(() => {
    if (selectedGroupe) loadFamilles(selectedGroupe.id);
    else setFamilleData(null);
  }, [selectedGroupe, loadFamilles]);

  /* ─────────────────── GROUPE : Créer ─────────────────── */
  const handleCreateGroupe = async () => {
    if (!newGroupeNom.trim()) return;
    setSaving(true);
    try {
      const res = await axios.post("/stock/groupes", {
        nom: newGroupeNom.trim(),
        garageId,
      });
      if (res?.data) {
        showSnack(`Groupe créé avec le code ${res.data.code}`);
        setAddGroupeOpen(false);
        setNewGroupeNom("");
        loadGroupes();
      } else {
        showSnack("Erreur lors de la création du groupe", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────── GROUPE : Renommer ─────────────────── */
  const handleUpdateGroupe = async () => {
    if (!editNom.trim() || !editGroupe) return;
    setSaving(true);
    try {
      const res = await axios.put(`/stock/groupes/${editGroupe.id}`, {
        nom: editNom.trim(),
      });
      if (res) {
        showSnack("Groupe renommé");
        setEditGroupe(null);
        setEditNom("");
        loadGroupes();
        // Rafraîchir les familles si le groupe édité est sélectionné
        if (selectedGroupe?.id === editGroupe.id) {
          setSelectedGroupe((prev) => ({ ...prev, nom: editNom.trim() }));
          loadFamilles(editGroupe.id);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────── GROUPE : Supprimer ─────────────────── */
  const handleDeleteGroupe = async () => {
    if (!deleteGroupe) return;
    setSaving(true);
    try {
      const res = await axios.deleteData(`/stock/groupes/${deleteGroupe.id}`);
      if (res?.data?.message) {
        showSnack("Groupe supprimé");
        setDeleteGroupe(null);
        if (selectedGroupe?.id === deleteGroupe.id) {
          setSelectedGroupe(null);
        }
        loadGroupes();
      } else {
        showSnack("Impossible de supprimer ce groupe (articles associés)", "error");
        setDeleteGroupe(null);
      }
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────── FAMILLE : Créer ─────────────────── */
  const handleCreateFamille = async () => {
    if (!newFamilleNom.trim() || !selectedGroupe) return;
    setSaving(true);
    try {
      const res = await axios.post("/stock/familles", {
        nom: newFamilleNom.trim(),
        groupeId: selectedGroupe.id,
      });
      if (res?.data) {
        showSnack(`Famille créée avec le code ${res.data.code}`);
        setAddFamilleOpen(false);
        setNewFamilleNom("");
        loadFamilles(selectedGroupe.id);
        loadGroupes();
      } else {
        showSnack("Erreur lors de la création (plage peut-être pleine)", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────── FAMILLE : Renommer ─────────────────── */
  const handleUpdateFamille = async () => {
    if (!editNom.trim() || !editFamille) return;
    setSaving(true);
    try {
      const res = await axios.put(`/stock/familles/${editFamille.id}`, {
        nom: editNom.trim(),
      });
      if (res) {
        showSnack("Famille renommée");
        setEditFamille(null);
        setEditNom("");
        loadFamilles(selectedGroupe.id);
      }
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────── FAMILLE : Supprimer ─────────────────── */
  const handleDeleteFamille = async () => {
    if (!deleteFamille) return;
    setSaving(true);
    try {
      const res = await axios.deleteData(`/stock/familles/${deleteFamille.id}`);
      if (res?.data?.message) {
        showSnack("Famille supprimée");
        setDeleteFamille(null);
        loadFamilles(selectedGroupe.id);
        loadGroupes();
      } else {
        showSnack("Impossible de supprimer cette famille (articles associés)", "error");
        setDeleteFamille(null);
      }
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────── Dérivés ─────────────────── */
  const groupe = familleData?.groupe;
  const familles = familleData?.familles || [];
  const normalFamilles = familles.filter((f) => !f.isDivers);
  const diversFamille = familles.find((f) => f.isDivers);
  const usagePercent =
    groupe && groupe.totalSlots > 0
      ? Math.round((groupe.familleCount / groupe.totalSlots) * 100)
      : 0;

  /* ─────────────────── Rendu ─────────────────── */
  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* ══════════════════════════════
          SECTION GROUPES
      ══════════════════════════════ */}
      <CardSection icon={WarehouseIcon} title="Groupes" subtitle="Catégories de premier niveau">
        <Box display="flex" justifyContent="flex-end" gap={1} mb={2}>
          <ImportExcel garageId={garageId} onSuccess={loadGroupes} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddGroupeOpen(true)}
          >
            Ajouter un groupe
          </Button>
        </Box>

        {loadingGroupes ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : groupes.length === 0 ? (
          <Typography color="text.secondary" align="center" py={3}>
            Aucun groupe créé pour ce garage.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Plage familles</TableCell>
                <TableCell align="center">Familles</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupes.map((g) => {
                const range = g.familleCodeRange || getFamilleCodeRange(g.code);
                const isSelected = selectedGroupe?.id === g.id;
                return (
                  <TableRow
                    key={g.id}
                    hover
                    selected={isSelected}
                    onClick={() =>
                      setSelectedGroupe(isSelected ? null : g)
                    }
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Chip label={g.code} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={isSelected ? 700 : 400}>
                        {g.nom}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {range.min} – {range.max}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {g.familleCount ?? 0} / {g.totalSlots ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Renommer">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditGroupe(g);
                            setEditNom(g.nom);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteGroupe(g)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardSection>

      {/* ══════════════════════════════
          SECTION FAMILLES
      ══════════════════════════════ */}
      {selectedGroupe && (
        <CardSection
          icon={CategoryIcon}
          title={`Familles — ${selectedGroupe.nom} (${selectedGroupe.code})`}
          subtitle={
            groupe
              ? `Plage : ${groupe.familleCodeRange?.min} – ${groupe.familleCodeRange?.max} • ${groupe.familleCount} / ${groupe.totalSlots} codes utilisés`
              : "Chargement…"
          }
        >
          {/* Barre de progression */}
          {groupe && (
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Taux de remplissage
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {usagePercent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={usagePercent}
                color={usagePercent >= 90 ? "error" : usagePercent >= 70 ? "warning" : "primary"}
              />
            </Box>
          )}

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <FolderOpenIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Cliquez sur "Ajouter" pour créer une famille dans ce groupe.
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setAddFamilleOpen(true)}
              disabled={groupe && groupe.familleCount >= groupe.totalSlots}
            >
              Ajouter une famille
            </Button>
          </Box>

          {loadingFamilles ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {normalFamilles.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell>
                      <Chip label={f.code} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{f.nom}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Renommer">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditFamille(f);
                            setEditNom(f.nom);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteFamille(f)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Famille "divers" — toujours en dernier, style distinct, pas supprimable */}
                {diversFamille && (
                  <TableRow key={diversFamille.id}>
                    <TableCell>
                      <Chip
                        label={diversFamille.code}
                        size="small"
                        variant="outlined"
                        sx={{ opacity: 0.6 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontStyle="italic"
                        color="text.secondary"
                      >
                        {diversFamille.nom}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Renommer">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditFamille(diversFamille);
                            setEditNom(diversFamille.nom);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Famille divers non supprimable">
                        <span>
                          <IconButton size="small" color="error" disabled>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardSection>
      )}

      {/* ══════════════════════════════
          MODALES
      ══════════════════════════════ */}

      {/* Ajouter un groupe */}
      <Dialog
        open={addGroupeOpen}
        onClose={() => setAddGroupeOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Nouveau groupe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nom du groupe"
            value={newGroupeNom}
            onChange={(e) => setNewGroupeNom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateGroupe()}
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary" mt={1} display="block">
            Le code sera attribué automatiquement.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddGroupeOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreateGroupe}
            disabled={!newGroupeNom.trim() || saving}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Renommer un groupe */}
      <Dialog
        open={!!editGroupe}
        onClose={() => setEditGroupe(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Renommer le groupe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nouveau nom"
            value={editNom}
            onChange={(e) => setEditNom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdateGroupe()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditGroupe(null)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleUpdateGroupe}
            disabled={!editNom.trim() || saving}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmer suppression groupe */}
      <Dialog
        open={!!deleteGroupe}
        onClose={() => setDeleteGroupe(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Supprimer le groupe</DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous supprimer le groupe{" "}
            <strong>
              {deleteGroupe?.nom} ({deleteGroupe?.code})
            </strong>{" "}
            et toutes ses familles ?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Cette action est irréversible. Impossible si des articles sont associés.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteGroupe(null)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteGroupe}
            disabled={saving}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ajouter une famille */}
      <Dialog
        open={addFamilleOpen}
        onClose={() => setAddFamilleOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Nouvelle famille — {selectedGroupe?.nom} ({selectedGroupe?.code})
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nom de la famille"
            value={newFamilleNom}
            onChange={(e) => setNewFamilleNom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFamille()}
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary" mt={1} display="block">
            Plage disponible :{" "}
            {groupe?.familleCodeRange?.min} – {groupe?.familleCodeRange
              ? pad4(parseInt(groupe.familleCodeRange.max, 10) - 1)
              : "—"}{" "}
            • Le code sera attribué automatiquement.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFamilleOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreateFamille}
            disabled={!newFamilleNom.trim() || saving}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Renommer une famille */}
      <Dialog
        open={!!editFamille}
        onClose={() => setEditFamille(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Renommer la famille</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nouveau nom"
            value={editNom}
            onChange={(e) => setEditNom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdateFamille()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFamille(null)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleUpdateFamille}
            disabled={!editNom.trim() || saving}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmer suppression famille */}
      <Dialog
        open={!!deleteFamille}
        onClose={() => setDeleteFamille(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Supprimer la famille</DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous supprimer la famille{" "}
            <strong>
              {deleteFamille?.nom} ({deleteFamille?.code})
            </strong>{" "}
            ?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Impossible si des articles sont associés à cette famille.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFamille(null)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteFamille}
            disabled={saving}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de feedback */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
