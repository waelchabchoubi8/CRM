import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import axios from 'axios';
import jsPDF from "jspdf";
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    TablePagination,
    Typography,
    Tooltip,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BASE_URL from '../Utilis/constantes';

const MonPrimePage = () => {
    const user = useSelector((state) => state.user);

    // ───────────── STATE ─────────────
    const [primes, setPrimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [filters, setFilters] = useState({ nom: '', type: '', date: '' });
    const [users, setUsers] = useState([]);

    const [openAdd, setOpenAdd] = useState(false);
    const [addForm, setAddForm] = useState({ nom: '', type: '', montant: '' });

    const [openEdit, setOpenEdit] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [editMontant, setEditMontant] = useState('');

    const typeOptions = [
        "Prime al Mawlid al Nabawi",
        "Prime aid al fitr",
        "Prime aid el kebir",
        "Prime fin d'année"
    ];

    // ───────────── FETCH USERS ─────────────
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/users`);
            setUsers(response.data || []);
        } catch (err) { console.error(err); }
    };

    // ───────────── FETCH PRIMES ─────────────
    const fetchPrimes = async (p = page, ps = rowsPerPage, filterOverride) => {
        setLoading(true);
        try {
            const f = filterOverride || filters;
            const params = { page: p, pageSize: ps };
            const nomValue = ["administrateur", "Finance"].includes(user.ROLE.trim())
                ? f.nom
                : f.nom || user.UTILISATEUR;
            if (nomValue) params.NOM = nomValue;
            if (f.type && f.type !== "") params.TYPE = f.type;
            if (f.date && f.date !== "") params.DATE = f.date;

            const response = await axios.get(`${BASE_URL}/api/primes`, { params });
            setPrimes(response.data.data || []);
            setTotal(response.data.total || 0);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchUsers();
        // if user is not admin/Finance, set nom filter automatically
        if (!["administrateur", "Finance"].includes(user.ROLE.trim())) {
            setFilters(prev => ({ ...prev, nom: user.UTILISATEUR }));
        }
        fetchPrimes();
    }, [user.DEPARTEMENT]);

    // ───────────── FILTER CHANGE ─────────────
    const handleFilterChange = (field, value) => {
        const val = value === "Tous" || value === "" ? "" : value;
        setFilters(prev => ({ ...prev, [field]: val }));
        setPage(0);

        // immediately call fetch with updated filter
        fetchPrimes(0, rowsPerPage, { ...filters, [field]: val });
    };

    // Update fetchPrimes signature to accept optional filter param


    // ───────────── PAGINATION ─────────────
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchPrimes(newPage, rowsPerPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchPrimes(0, newSize);
    };

    // ───────────── ADD PRIME ─────────────
    const handleAddPrime = async () => {
  if (!addForm.nom || !addForm.type || !addForm.montant) {
    alert("Veuillez remplir tous les champs avant d'ajouter.");
    return;
  }

  try {
    // 1️⃣ Create prime
    await axios.post(`${BASE_URL}/api/primes`, addForm);

    // 2️⃣ Get selected user ID
    const selectedUser = users.find(u => u.UTILISATEUR === addForm.nom);

    if (!selectedUser) {
      console.error("User not found");
      return;
    }

    // 3️⃣ Compute tomorrow date (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split("T")[0];

    // 4️⃣ Build alert payload
    const alertPayload = {
      DATE_ALERT: formattedDate,
      TEXT_ALERT: `Vous bénéficiez d’une ${addForm.type}, veuillez imprimer le document ci-joint et contacter le service financier`,
      TITRE: addForm.type,
      USER_ID: selectedUser.ID_UTILISATEUR,
      ENVOIYEUR: "CRM"
    };

    // 5️⃣ Call alerts API
    await axios.post(`${BASE_URL}/api/alerts`, alertPayload);

    // 6️⃣ Reset UI
    setAddForm({ nom: '', type: '', montant: '' });
    setOpenAdd(false);
    fetchPrimes();

  } catch (err) {
    console.error("Erreur ajout prime + alert:", err);
  }
};

    // ───────────── EDIT PRIME ─────────────
    const handleEditClick = (row) => {
        setEditRow(row);
        setEditMontant(row.MONTANT);
        setOpenEdit(true);
    };

    const handleEditPrime = async () => {
        if (!editMontant) {
            alert("Veuillez saisir un montant valide.");
            return;
        }
        try {
            await axios.patch(`${BASE_URL}/api/primes/${editRow.ID}`, { MONTANT: editMontant });
            setOpenEdit(false);
            fetchPrimes();
        } catch (err) { console.error(err); }
    };

    return (
        <Box p={3}>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="#1976d2">
                    {["administrateur", "Finance"].includes(user.ROLE.trim()) ? "Prime Société" : "Mon Prime"}
                </Typography>
                {["administrateur", "Finance"].includes(user.ROLE.trim()) && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAdd(true)}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}
                    >
                        +Ajouter
                    </Button>
                )}
            </Box>

            {/* FILTERS */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Nom</InputLabel>
                    <Select
                        value={["administrateur", "Finance"].includes(user.ROLE.trim())
                            ? filters.nom
                            : filters.nom || user.UTILISATEUR
                        }
                        label="Nom"
                        onChange={(e) => {
                            if (["administrateur", "Finance"].includes(user.ROLE.trim())) {
                                handleFilterChange('nom', e.target.value);
                            }
                        }}
                        disabled={!["administrateur", "Finance"].includes(user.ROLE.trim())}
                    >
                        {["administrateur", "Finance"].includes(user.ROLE.trim()) && <MenuItem value="">Tous</MenuItem>}
                        {["administrateur", "Finance"].includes(user.ROLE.trim()) && users.map((u, i) => (
                            <MenuItem key={i} value={u.UTILISATEUR}>{u.UTILISATEUR}</MenuItem>
                        ))}
                        {!["administrateur", "Finance"].includes(user.ROLE.trim()) && (
                            <MenuItem value={user.UTILISATEUR}>{user.UTILISATEUR}</MenuItem>
                        )}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={filters.type}
                        label="Type"
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <MenuItem value="">Tous</MenuItem>
                        {typeOptions.map((t, i) => (
                            <MenuItem key={i} value={t}>{t}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    type="date"
                    label="Date"
                    InputLabelProps={{ shrink: true }}
                    value={filters.date}
                    onChange={(e) => {
                        const val = e.target.value;
                        setFilters(prev => ({ ...prev, date: val === "" ? "" : val }));
                        setPage(0);
                        setTimeout(() => fetchPrimes(0, rowsPerPage), 0); // avoid lag
                    }}
                />
            </Box>

            {/* TABLE */}
            <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ borderBottom: '2px solid #f1f5f9' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: '#1976d2' }}>Nom</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1976d2' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1976d2' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1976d2' }}>Montant</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1976d2' }} align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                        <CircularProgress size={30} sx={{ mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">Chargement...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : primes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                        <AssignmentIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                                        <Typography variant="body1" color="text.secondary">Aucune prime trouvée</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                primes.map((row) => (
                                    <TableRow key={row.ID} hover>
                                        <TableCell>{row.NOM}</TableCell>
                                        <TableCell>
                                            {new Date(row.DATE_PRIME).toLocaleString('fr-FR', { 
                                                day: '2-digit', month: '2-digit', year: 'numeric', 
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell>{row.TYPE}</TableCell>
                                        <TableCell>{row.MONTANT}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                {["administrateur", "Finance"].includes(user.ROLE.trim()) && (
                                                    <Tooltip title="Modifier Montant">
                                                        <IconButton onClick={() => handleEditClick(row)}>
                                                            <EditTwoToneIcon />
                                                        </IconButton>
                                                    </Tooltip>)}

                                                <Tooltip title="Imprimer">
                                                    <IconButton
                                                        onClick={() => {
                                                            const doc = new jsPDF();

                                                            // ───────── COULEURS ─────────
                                                            const primary = [41, 128, 185]; // bleu
                                                            const dark = [44, 62, 80];      // gris foncé
                                                            const gray = [230, 230, 230];   // gris clair pour lignes alternées

                                                            // ───────── HEADER (réduit) ─────────
                                                            doc.setFillColor(...primary);
                                                            doc.rect(0, 0, 210, 18, "F"); // header réduit

                                                            doc.setTextColor(255, 255, 255);
                                                            doc.setFont("helvetica", "bold");
                                                            doc.setFontSize(13);
                                                            doc.text("FICHE PRIME", 105, 12, { align: "center" });

                                                            // ───────── TITRE SECTION ─────────
                                                            doc.setTextColor(...dark);
                                                            doc.setFontSize(11);
                                                            doc.setFont("helvetica", "bold");
                                                            doc.text("Détails de la prime", 14, 30);

                                                            // ───────── FONCTIONS UTILES ─────────
                                                            const formatMontant = (value) => {
    const montant = parseFloat(value) || 0;
    // keep 1 decimal without rounding integer
    return montant.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " TND";
};

                                                            const formatDateTime = (date) => {
                                                                const d = new Date(date);
                                                                const day = String(d.getDate()).padStart(2, "0");
                                                                const month = String(d.getMonth() + 1).padStart(2, "0");
                                                                const year = d.getFullYear();
                                                                const hours = String(d.getHours()).padStart(2, "0");
                                                                const minutes = String(d.getMinutes()).padStart(2, "0");
                                                                return `${day}/${month}/${year} ${hours}:${minutes}`;
                                                            };

                                                            // ───────── TABLEAU ─────────
                                                            const startX = 14;
                                                            const startY = 40;
                                                            const col1Width = 60;
                                                            const col2Width = 120;
                                                            const rowHeight = 12;

                                                            const rows = [
                                                                ["Nom", row.NOM],
                                                                ["Date", formatDateTime(row.DATE_PRIME)],
                                                                ["Type", row.TYPE],
                                                                ["Montant", formatMontant(row.MONTANT)],
                                                            ];

                                                            rows.forEach((rowData, index) => {
                                                                const y = startY + index * rowHeight;

                                                                // Fond alterné
                                                                if (index % 2 === 0) {
                                                                    doc.setFillColor(...gray);
                                                                    doc.rect(startX, y - 8, col1Width + col2Width, rowHeight, "F");
                                                                }

                                                                // Bordures
                                                                doc.setDrawColor(200);
                                                                doc.rect(startX, y - 8, col1Width, rowHeight);
                                                                doc.rect(startX + col1Width, y - 8, col2Width, rowHeight);

                                                                // Texte label
                                                                doc.setFont("helvetica", "bold");
                                                                doc.setTextColor(...dark);
                                                                doc.text(rowData[0], startX + 3, y);

                                                                // Texte valeur
                                                                doc.setFont("helvetica", rowData[0] === "Montant" ? "bold" : "normal");
                                                                doc.text(rowData[1], startX + col1Width + 3, y);
                                                            });

                                                            // ───────── FOOTER ─────────
                                                            doc.setFontSize(9);
                                                            doc.setTextColor(150);
                                                            doc.setFont("helvetica", "italic");
                                                            doc.text(
                                                                `Document généré le ${formatDateTime(new Date())}`,
                                                                105,
                                                                startY + rows.length * rowHeight + 10,
                                                                { align: "center" }
                                                            );
                                                            // ───────── SIGNATURES ─────────
                                                            doc.setFontSize(10);
                                                            doc.setTextColor(...dark);
                                                            
                                                            // Signature Finance
                                                            doc.text("Signature financier", 55, startY + rows.length * rowHeight + 40, { align: "center" });
                                                            doc.line(25, startY + rows.length * rowHeight + 45, 85, startY + rows.length * rowHeight + 45);

                                                            // Signature Direction
                                                            doc.text("Signature Direction", 155, startY + rows.length * rowHeight + 40, { align: "center" });
                                                            doc.line(125, startY + rows.length * rowHeight + 45, 185, startY + rows.length * rowHeight + 45);



                                                            // ───────── EXPORT ─────────
                                                            const pdfBlob = doc.output("blob");
                                                            const blobUrl = URL.createObjectURL(pdfBlob);
                                                            window.open(blobUrl, "_blank");
                                                        }}
                                                    >
                                                        <LocalPrintshopIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Lignes par page"
                />
            </Paper>

            {/* ADD DIALOG */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
                <DialogTitle>Ajouter une prime</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Nom</InputLabel>
                        <Select
                            value={addForm.nom}
                            label="Nom"
                            onChange={(e) => setAddForm(prev => ({ ...prev, nom: e.target.value }))}
                        >
                            <MenuItem value="" disabled><em>Sélectionner un nom</em></MenuItem>
                            {users.map((u, i) => (
                                <MenuItem key={i} value={u.UTILISATEUR} id={u.ID_UTILISATEUR}>{u.UTILISATEUR}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={addForm.type}
                            label="Type"
                            onChange={(e) => setAddForm(prev => ({ ...prev, type: e.target.value }))}
                        >
                            <MenuItem value="" disabled><em>Sélectionner un type</em></MenuItem>
                            {typeOptions.map((t, i) => <MenuItem key={i} value={t}>{t}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField
                        type="number"
                        fullWidth
                        label="Montant"
                        value={addForm.montant}
                        onChange={(e) => setAddForm(prev => ({ ...prev, montant: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAdd(false)}>Annuler</Button>
                    <Button variant="contained" onClick={handleAddPrime}>Ajouter</Button>
                </DialogActions>
            </Dialog>

            {/* EDIT DIALOG */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
                <DialogTitle>Modifier Montant</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0 }}>
                    <TextField
                        type="number"
                        fullWidth
                        label="Montant"
                        value={editMontant}
                        onChange={(e) => setEditMontant(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Annuler</Button>
                    <Button variant="contained" onClick={handleEditPrime}>Enregistrer</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MonPrimePage;