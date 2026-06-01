import BusinessIcon       from "@mui/icons-material/Business";
import CloseIcon          from "@mui/icons-material/Close";
import EditIcon           from "@mui/icons-material/Edit";
import EmailIcon          from "@mui/icons-material/Email";
import HistoryIcon        from "@mui/icons-material/History";
import LocalOfferIcon     from "@mui/icons-material/LocalOffer";
import PhoneIcon          from "@mui/icons-material/Phone";
import SaveIcon           from "@mui/icons-material/Save";
import SearchIcon         from "@mui/icons-material/Search";
import ShoppingCartIcon   from "@mui/icons-material/ShoppingCart";
import OpenInNewIcon      from "@mui/icons-material/OpenInNew";
import WarningAmberIcon   from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useAxios } from "../../../utils/hook/useAxios";

function getCurrentUser() {
  const s = localStorage.getItem("me");
  return s ? JSON.parse(s) : null;
}

/* ── constantes ──────────────────────────────────────────────────────── */
const STATUT_COLOR = { ACTIF:"success", INACTIF:"default", SUSPENDU:"error" };
const STATUT_BDC   = { DRAFT:"default", SENT:"info", PARTIAL:"warning", RECEIVED:"success", CANCELLED:"error" };
const STATUT_BDC_L = { DRAFT:"Brouillon", SENT:"Envoyé", PARTIAL:"Partiel", RECEIVED:"Réceptionné", CANCELLED:"Annulé" };

/* ── champ en lecture / édition ─────────────────────────────────────── */
function InfoRow({ label, value, editing, name, onChange, type = "text", multiline, select, options }) {
  return (
    <Box display="flex" alignItems={multiline ? "flex-start" : "center"} gap={1.5} mb={1.2}>
      <Typography
        variant="caption"
        sx={{ minWidth: 170, color: "text.secondary", fontWeight: 600, flexShrink: 0, pt: multiline ? 0.5 : 0 }}
      >
        {label}
      </Typography>
      {editing ? (
        select ? (
          <Select
            size="small"
            fullWidth
            value={value || ""}
            onChange={e => onChange(name, e.target.value)}
            sx={{ fontSize: 13 }}
          >
            {options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        ) : (
          <TextField
            size="small"
            fullWidth
            type={type}
            multiline={multiline}
            minRows={multiline ? 3 : undefined}
            value={value || ""}
            onChange={e => onChange(name, e.target.value)}
            sx={{ fontSize: 13 }}
          />
        )
      ) : (
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
          {value || <span style={{ color: "#aaa" }}>—</span>}
        </Typography>
      )}
    </Box>
  );
}

/* ── section avec titre ─────────────────────────────────────────────── */
function Section({ title, children }) {
  const theme = useTheme();
  return (
    <Box mb={2.5}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8,
          color: "primary.main", display: "block", mb: 1,
          borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          pb: 0.5,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

/* ── onglet Infos générales ─────────────────────────────────────────── */
function TabInfos({ fss, editing, onChange }) {
  return (
    <Box>
      <Section title="Identité">
        <InfoRow label="Raison sociale"    value={fss.nom}        editing={editing} name="nom"   onChange={onChange} />
        <InfoRow label="Code fournisseur"  value={fss.code}       editing={editing} name="code"  onChange={onChange} />
        <InfoRow label="SIRET"             value={fss.siret}      editing={editing} name="siret" onChange={onChange} />
        <InfoRow label="N° TVA intracom."  value={fss.tvaIntracom}editing={editing} name="tvaIntracom" onChange={onChange} />
        <InfoRow
          label="Statut"
          value={fss.statut}
          editing={editing}
          name="statut"
          onChange={onChange}
          select
          options={[
            { value:"ACTIF",    label:"Actif"    },
            { value:"INACTIF",  label:"Inactif"  },
            { value:"SUSPENDU", label:"Suspendu" },
          ]}
        />
      </Section>

      <Section title="Adresse">
        <InfoRow label="Adresse ligne 1" value={fss.adresse1}  editing={editing} name="adresse1"  onChange={onChange} />
        <InfoRow label="Adresse ligne 2" value={fss.adresse2}  editing={editing} name="adresse2"  onChange={onChange} />
        <InfoRow label="Code postal"     value={fss.codePostal}editing={editing} name="codePostal"onChange={onChange} />
        <InfoRow label="Ville"           value={fss.ville}     editing={editing} name="ville"     onChange={onChange} />
        <InfoRow label="Région"          value={fss.region}    editing={editing} name="region"    onChange={onChange} />
        <InfoRow label="Pays"            value={fss.pays}      editing={editing} name="pays"      onChange={onChange} />
      </Section>

      <Section title="Contact">
        <InfoRow label="Prénom contact"  value={fss.contactPrenom}editing={editing} name="contactPrenom" onChange={onChange} />
        <InfoRow label="Nom contact"     value={fss.contactNom}   editing={editing} name="contactNom"    onChange={onChange} />
        <InfoRow label="Téléphone"       value={fss.telephone}    editing={editing} name="telephone"     onChange={onChange} />
        <InfoRow label="Email"           value={fss.email}        editing={editing} name="email"         onChange={onChange} />
        <InfoRow label="Site web"        value={fss.siteWeb}      editing={editing} name="siteWeb"       onChange={onChange} />
      </Section>

      {!editing && (fss.telephone || fss.email || fss.siteWeb) && (
        <Stack direction="row" spacing={1} mt={0.5}>
          {fss.telephone && (
            <Chip
              icon={<PhoneIcon sx={{ fontSize: 14 }} />}
              label={fss.telephone}
              size="small"
              component="a"
              href={`tel:${fss.telephone}`}
              clickable
            />
          )}
          {fss.email && (
            <Chip
              icon={<EmailIcon sx={{ fontSize: 14 }} />}
              label={fss.email}
              size="small"
              component="a"
              href={`mailto:${fss.email}`}
              clickable
            />
          )}
          {fss.siteWeb && (
            <Chip
              icon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
              label="Site web"
              size="small"
              component="a"
              href={fss.siteWeb}
              target="_blank"
              clickable
            />
          )}
        </Stack>
      )}
    </Box>
  );
}

/* ── onglet Conditions tarifaires ───────────────────────────────────── */
function TabConditions({ fss, editing, onChange }) {
  return (
    <Box>
      <Section title="Conditions commerciales">
        <InfoRow label="Remise standard (%)"    value={fss.remise}            editing={editing} name="remise"             onChange={onChange} type="number" />
        <InfoRow label="Délai livraison (jours)" value={fss.delaiLivraison}   editing={editing} name="delaiLivraison"     onChange={onChange} type="number" />
        <InfoRow label="Conditions de paiement" value={fss.conditionsPaiement}editing={editing} name="conditionsPaiement" onChange={onChange} />
        <InfoRow label="Montant min. commande"  value={fss.montantMinCommande} editing={editing} name="montantMinCommande" onChange={onChange} type="number" />
      </Section>

      <Section title="Notes / Conditions particulières">
        <InfoRow label="Notes" value={fss.notes} editing={editing} name="notes" onChange={onChange} multiline />
      </Section>
    </Box>
  );
}

/* ── onglet Historique commandes ────────────────────────────────────── */
function TabHistorique({ fournisseurId }) {
  const axios    = useAxios();
  const garageId = getCurrentUser()?.garageId;

  const [bdcs,    setBdcs]    = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fournisseurId || !garageId) return;
    setLoading(true);
    axios.get(`/purchase-orders/${garageId}?fournisseurId=${fournisseurId}`)
      .then(r => setBdcs(r.data?.bdcs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fournisseurId, garageId]);

  if (loading) return <Box display="flex" justifyContent="center" py={3}><CircularProgress size={22} /></Box>;
  if (!bdcs.length) return (
    <Box sx={{ textAlign:"center", py:4 }}>
      <Typography variant="body2" color="text.disabled">Aucune commande enregistrée pour ce fournisseur</Typography>
    </Box>
  );

  const totalCmd  = bdcs.reduce((s,b) => s + (b.Lines||[]).reduce((a,l) => a + (parseFloat(l.quantiteCommandee)||0), 0), 0);
  const totalRecu = bdcs.reduce((s,b) => s + (b.Lines||[]).reduce((a,l) => a + (parseFloat(l.quantiteRecue)||0), 0), 0);

  return (
    <Box>
      {/* KPIs rapides */}
      <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
        {[
          { label:"Commandes", value: bdcs.length },
          { label:"Qté commandée", value: totalCmd },
          { label:"Qté reçue",    value: totalRecu },
          { label:"Reliquat",     value: Math.max(0, totalCmd - totalRecu), warn: totalCmd > totalRecu },
        ].map(k => (
          <Box key={k.label} sx={{
            border:"1px solid", borderColor:"divider", borderRadius:1,
            px:1.5, py:0.75, display:"flex", alignItems:"center", gap:1,
          }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
            <Typography variant="body2" fontWeight={700} color={k.warn ? "warning.main" : "text.primary"}>
              {k.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ border:"1px solid", borderColor:"divider", borderRadius:1, overflow:"hidden" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor:"background.default" }}>
              {["N°","Date","Référence","Statut","Articles","Qté cmd.","Qté reçue","Reliquat"].map(h => (
                <TableCell key={h} sx={{ fontWeight:700, fontSize:11, color:"text.secondary", py:0.9 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {bdcs.map(bdc => {
              const lines   = bdc.Lines || [];
              const qCmd    = lines.reduce((s,l) => s + (parseFloat(l.quantiteCommandee)||0), 0);
              const qRecu   = lines.reduce((s,l) => s + (parseFloat(l.quantiteRecue)||0), 0);
              const reliquat = Math.max(0, qCmd - qRecu);
              return (
                <TableRow key={bdc.id} hover>
                  <TableCell sx={{ fontSize:12, fontFamily:"monospace" }}>#{bdc.id}</TableCell>
                  <TableCell sx={{ fontSize:12 }}>
                    {bdc.date ? new Date(bdc.date).toLocaleDateString("fr-FR") : "—"}
                  </TableCell>
                  <TableCell sx={{ fontSize:12, fontFamily:"monospace" }}>{bdc.reference||"—"}</TableCell>
                  <TableCell>
                    <Chip label={STATUT_BDC_L[bdc.status]||bdc.status} color={STATUT_BDC[bdc.status]||"default"} size="small" sx={{ fontSize:11 }} />
                  </TableCell>
                  <TableCell sx={{ fontSize:12 }}>{lines.length}</TableCell>
                  <TableCell sx={{ fontSize:12, fontWeight:600 }}>{qCmd}</TableCell>
                  <TableCell sx={{ fontSize:12, fontWeight:600, color: qRecu >= qCmd ? "success.main" : "text.primary" }}>{qRecu}</TableCell>
                  <TableCell>
                    {reliquat > 0 && bdc.status !== "CANCELLED" ? (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <WarningAmberIcon sx={{ fontSize:13, color:"warning.main" }} />
                        <Typography variant="caption" color="warning.dark" fontWeight={700}>{reliquat}</Typography>
                      </Box>
                    ) : <Typography variant="caption" color="success.main">✓</Typography>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

/* ── Fiche fournisseur (panneau droit) ──────────────────────────────── */
function FicheFournisseur({ fss, onUpdated }) {
  const axios   = useAxios();
  const theme   = useTheme();
  const [tab,     setTab]     = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState({});
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => { setDraft({ ...fss }); setEditing(false); setTab(0); }, [fss]);

  const handleChange = (name, value) => setDraft(prev => ({ ...prev, [name]: value }));

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      await axios.put(`/stock/fournisseurs/${fss.id}`, draft);
      onUpdated({ ...fss, ...draft });
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ flex: 1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* En-tête fiche */}
      <Box
        sx={{
          px:2.5, py:1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          borderBottom:"1px solid", borderColor:"divider",
          display:"flex", alignItems:"center", gap:1.5,
        }}
      >
        <Box
          sx={{
            width:40, height:40, borderRadius:1,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            display:"flex", alignItems:"center", justifyContent:"center",
          }}
        >
          <BusinessIcon sx={{ color:"primary.main", fontSize:20 }} />
        </Box>
        <Box flex={1}>
          <Typography variant="subtitle2" fontWeight={700}>{draft.nom || "—"}</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {draft.code && <Typography variant="caption" color="text.secondary">Code : {draft.code}</Typography>}
            <Chip
              label={draft.statut || "ACTIF"}
              color={STATUT_COLOR[draft.statut] || "default"}
              size="small"
              sx={{ fontSize:10, height:18 }}
            />
          </Box>
        </Box>
        <Box display="flex" gap={0.5}>
          {editing ? (
            <>
              <Tooltip title="Annuler">
                <IconButton size="small" onClick={() => { setDraft({...fss}); setEditing(false); }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sauvegarder">
                <span>
                  <IconButton size="small" color="primary" onClick={handleSave} disabled={saving}>
                    {saving ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Modifier">
              <IconButton size="small" onClick={() => setEditing(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx:2, mt:1 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      {/* Onglets */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ px:2, borderBottom:"1px solid", borderColor:"divider", minHeight:38 }}
        TabIndicatorProps={{ style:{ height:2 } }}
      >
        <Tab icon={<BusinessIcon sx={{ fontSize:14 }} />} iconPosition="start" label="Infos générales"  sx={{ fontSize:12, minHeight:38, textTransform:"none", gap:0.5 }} />
        <Tab icon={<LocalOfferIcon sx={{ fontSize:14 }} />} iconPosition="start" label="Conditions"    sx={{ fontSize:12, minHeight:38, textTransform:"none", gap:0.5 }} />
        <Tab icon={<HistoryIcon sx={{ fontSize:14 }} />} iconPosition="start"   label="Historique BDC" sx={{ fontSize:12, minHeight:38, textTransform:"none", gap:0.5 }} />
      </Tabs>

      <Box sx={{ flex:1, overflow:"auto", px:2.5, py:2 }}>
        {tab === 0 && <TabInfos       fss={draft}  editing={editing} onChange={handleChange} />}
        {tab === 1 && <TabConditions  fss={draft}  editing={editing} onChange={handleChange} />}
        {tab === 2 && <TabHistorique  fournisseurId={fss.id} />}
      </Box>
    </Box>
  );
}

/* ── composant principal ─────────────────────────────────────────────── */
export default function ConsultationFssModal({ open, onClose, initialFournisseur = null }) {
  const axios = useAxios();
  const theme = useTheme();

  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [search,       setSearch]       = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [selected,     setSelected]     = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/stock/fournisseurs?limit=500");
      setFournisseurs(Array.isArray(res?.data) ? res.data : res?.data?.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (open) {
      load();
      setSearch(""); setFilterStatut("");
      setSelected(initialFournisseur || null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* filtrage local */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return fournisseurs.filter(f => {
      const matchSearch = !q
        || (f.nom  || "").toLowerCase().includes(q)
        || (f.code || "").toLowerCase().includes(q)
        || (f.ville|| "").toLowerCase().includes(q);
      const matchStatut = !filterStatut || f.statut === filterStatut;
      return matchSearch && matchStatut;
    });
  }, [fournisseurs, search, filterStatut]);

  const handleUpdated = (updated) => {
    setFournisseurs(prev => prev.map(f => f.id === updated.id ? updated : f));
    setSelected(updated);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx:{ height:"90vh" } }}>
      <DialogTitle
        sx={{
          display:"flex", alignItems:"center", gap:1,
          bgcolor:"background.default", borderBottom:"1px solid", borderColor:"divider",
          py:1.5, px:2.5,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} flex={1}>Consultation fournisseurs</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p:0, display:"flex", overflow:"hidden" }}>

        {/* ── Panneau gauche : liste ── */}
        <Box
          sx={{
            width:300, flexShrink:0,
            borderRight:"1px solid", borderColor:"divider",
            display:"flex", flexDirection:"column",
            bgcolor:"background.default",
          }}
        >
          {/* Filtres */}
          <Box sx={{ p:1.5, borderBottom:"1px solid", borderColor:"divider" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Nom, code, ville…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ mb:1 }}
              InputProps={{
                startAdornment:(
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize:15, color:"text.disabled" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Select
              size="small"
              fullWidth
              displayEmpty
              value={filterStatut}
              onChange={e => setFilterStatut(e.target.value)}
            >
              <MenuItem value="">Tous les statuts</MenuItem>
              <MenuItem value="ACTIF">Actif</MenuItem>
              <MenuItem value="INACTIF">Inactif</MenuItem>
              <MenuItem value="SUSPENDU">Suspendu</MenuItem>
            </Select>
          </Box>

          {/* Compteur */}
          <Box sx={{ px:1.5, py:0.75, borderBottom:"1px solid", borderColor:"divider" }}>
            <Typography variant="caption" color="text.secondary">
              {loading ? "Chargement…" : `${filtered.length} fournisseur${filtered.length > 1 ? "s" : ""}`}
            </Typography>
          </Box>

          {/* Liste */}
          <Box sx={{ flex:1, overflow:"auto" }}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={3}><CircularProgress size={22} /></Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ textAlign:"center", py:4 }}>
                <Typography variant="caption" color="text.disabled">Aucun résultat</Typography>
              </Box>
            ) : (
              filtered.map(f => (
                <Box
                  key={f.id}
                  onClick={() => setSelected(f)}
                  sx={{
                    px:1.5, py:1.25, cursor:"pointer",
                    borderBottom:"1px solid", borderColor:"divider",
                    bgcolor: selected?.id === f.id
                      ? alpha(theme.palette.primary.main, 0.1)
                      : "transparent",
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                    transition:"background 0.15s",
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.25}>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ flex:1, mr:0.5 }}>
                      {f.nom || "—"}
                    </Typography>
                    <Chip
                      label={f.statut || "ACTIF"}
                      color={STATUT_COLOR[f.statut] || "default"}
                      size="small"
                      sx={{ fontSize:9, height:16, "& .MuiChip-label":{ px:0.75 } }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {[f.code, f.ville].filter(Boolean).join(" · ") || "—"}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* ── Panneau droit : fiche ── */}
        <Box sx={{ flex:1, display:"flex", overflow:"hidden" }}>
          {selected ? (
            <FicheFournisseur key={selected.id} fss={selected} onUpdated={handleUpdated} />
          ) : (
            <Box
              sx={{
                flex:1, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:2, p:4,
              }}
            >
              <ShoppingCartIcon sx={{ fontSize:48, color:"text.disabled" }} />
              <Typography variant="body2" color="text.disabled">
                Sélectionnez un fournisseur dans la liste
              </Typography>
            </Box>
          )}
        </Box>

      </DialogContent>
    </Dialog>
  );
}
