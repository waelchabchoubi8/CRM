import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BASE_URL from '../Utilis/constantes';

const NumeroPriverPage = () => {
    const user = useSelector((state) => state.user);

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({ NUM: '', PERSONNE: '' });

    const [openAdd, setOpenAdd] = useState(false);
    const [addForm, setAddForm] = useState({ NUM: '', PERSONNE: '' });

    const [numInput, setNumInput] = useState('');

    const fetchRecords = async (p = page, ps = rowsPerPage, filterOverride) => {
        setLoading(true);
        try {
            const f = filterOverride || filters;
            const params = { page: p, pageSize: ps };
            if (f.NUM) params.NUM = f.NUM;
            if (f.PERSONNE) params.PERSONNE = f.PERSONNE;

            const response = await axios.get(`${BASE_URL}/api/numeroprivers`, { params });
            setRecords(response.data.data || []);
            setTotal(response.data.total || 0);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchRecords();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/users`);
        const commercialUsers = response.data.filter(u => u.DEPARTEMENT === "Commercial");
        setUsers(commercialUsers);
    } catch (err) { console.error(err); }
};

    const handleFilterChange = (field, value) => {
        let val = value;
        if (field === "NUM") val = val.replace(/\D/g, ""); // only digits
        if (val === "" || val === "Tous") val = undefined;

        setFilters(prev => ({ ...prev, [field]: val }));
        setPage(0);
        fetchRecords(0, rowsPerPage, { ...filters, [field]: val });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchRecords(newPage, rowsPerPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchRecords(0, newSize);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cet enregistrement ?")) return;
        try {
            await axios.delete(`${BASE_URL}/api/numeroprivers/${id}`);
            fetchRecords();
        } catch (err) { console.error(err); }
    };

    const handleAdd = async () => {
    const num = addForm.NUM?.trim();
    const personne = addForm.PERSONNE?.trim();

    // Validation: Num must be 8 digits, Personne must be selected
    if (!num || num.length !== 8) {
        return alert("Le numéro doit contenir exactement 8 chiffres.");
    }
    if (!personne) {
        return alert("Veuillez sélectionner une personne.");
    }

    try {
        await axios.post(`${BASE_URL}/api/numeroprivers`, { NUM: num, PERSONNE: personne });
        setAddForm({ NUM: '', PERSONNE: '' });
        setOpenAdd(false);
        fetchRecords();
    } catch (err) {
        console.error(err);
    }
};

    

    

    return (
        <Box p={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="#1976d2">
                    {"Gestion Numéro Priver"}
                </Typography>
                {["administrateur", "directeur commercial"].includes(user.ROLE.trim()) && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAdd(true)}>
                            Ajouter
                    </Button>
                )}
            </Box>

            {/* FILTERS */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
<TextField
  label="Numéro"
  value={numInput}
  onChange={(e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 8) setNumInput(val);

    if (val.length === 8) {
      // Trigger GET immediately with 8 digits
      fetchRecords(0, rowsPerPage, { ...filters, NUM: val });
      setFilters(prev => ({ ...prev, NUM: val }));
    } else if (val.length < 8 && filters.NUM) {
      // Clear NUM filter if less than 8 digits
      fetchRecords(0, rowsPerPage, { ...filters, NUM: undefined });
      setFilters(prev => ({ ...prev, NUM: undefined }));
    }
  }}
/>
                <FormControl fullWidth>
    <InputLabel>Personne</InputLabel>
    <Select
        value={filters.PERSONNE || ''}
        label="Personne"
        onChange={(e) => {
            const val = e.target.value || undefined;
            setFilters(prev => ({ ...prev, PERSONNE: val }));
            fetchRecords(0, rowsPerPage, { ...filters, PERSONNE: val });
        }}
    >
        <MenuItem value="">Tous</MenuItem>
        {users.map(u => (
            <MenuItem key={u.ID_UTILISATEUR} value={u.UTILISATEUR}>
                {u.UTILISATEUR}
            </MenuItem>
        ))}
    </Select>
</FormControl>
            </Box>

            {/* TABLE */}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Numéro</TableCell>
                                <TableCell>Personne</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : records.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Aucune donnée
                                    </TableCell>
                                </TableRow>
                            ) : (
                                records.map((row) => (
                                    <TableRow key={row.ID} hover>
                                        <TableCell>{row.NUM}</TableCell>
                                        <TableCell>{row.PERSONNE}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                
                                                <Tooltip title="Supprimer">
                                                    <IconButton onClick={() => handleDelete(row.ID)}>
                                                        <DeleteIcon />
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
                />
            </Paper>

            {/* ADD DIALOG */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
                <DialogTitle>Ajouter Numéro Priver</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
    label="Numéro"
    value={addForm.NUM}
    onChange={(e) => {
        let val = e.target.value.replace(/\D/g, ''); // only digits
        if (val.length > 8) val = val.slice(0, 8);  // limit to 8 digits
        setAddForm(prev => ({ ...prev, NUM: val }));
    }}
/>
<FormControl fullWidth>
    <InputLabel>Personne</InputLabel>
    <Select
        value={addForm.PERSONNE || ''}
        label="Personne"
        onChange={(e) => setAddForm(prev => ({ ...prev, PERSONNE: e.target.value }))}
    >
        <MenuItem value="" disabled><em>Sélectionner une personne</em></MenuItem>
        {users.map(u => (
            <MenuItem key={u.ID_UTILISATEUR} value={u.UTILISATEUR}>
                {u.UTILISATEUR}
            </MenuItem>
        ))}
    </Select>
</FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAdd(false)}>Annuler</Button>
                    <Button variant="contained" onClick={handleAdd}>Ajouter</Button>
                </DialogActions>
            </Dialog>

            
        </Box>
    );
};

export default NumeroPriverPage;