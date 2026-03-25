// aler.js
import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Typography,
    Button,
    Divider,
    Stack,
    Alert as MuiAlert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { useSelector } from 'react-redux';
import BASE_URL from '../Utilis/constantes';

const AlertePage = () => {
    const user = useSelector((state) => state.user);

    const [alerts, setAlerts] = useState([]);

    // dates
    const [filterDate, setFilterDate] = useState(() => {
        const d = new Date();
        return d.toISOString().split('T')[0]; // today yyyy-mm-dd
    });

    const [dateAlert, setDateAlert] = useState(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });

    // formulaire ajout
    const [titre, setTitre] = useState('');
    const [textAlert, setTextAlert] = useState('');

    // states globaux
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // dialog ajout
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    // today & tomorrow for badges
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const todayString = today.toISOString().split('T')[0];
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    // --- EDIT PART ---
    const [users, setUsers] = useState([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentAlert, setCurrentAlert] = useState(null);
    const [editTitre, setEditTitre] = useState('');
    const [editTextAlert, setEditTextAlert] = useState('');
    const [editUserId, setEditUserId] = useState('');
    const [editError, setEditError] = useState('');
    const [editPosting, setEditPosting] = useState(false);
    const [editSuccess, setEditSuccess] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/users`);
            setUsers(response.data || []);
        } catch (err) {
            console.error('Erreur lors de la récupération des utilisateurs :', err);
        }
    };

    const fetchAlerts = async (selectedDate) => {
        if (!user?.ID_UTILISATEUR) return;

        try {
            setLoading(true);
            setError('');

            const response = await axios.get(`${BASE_URL}/api/alerts`, {
                params: {
                    USER_ID: user.ID_UTILISATEUR,
                    DATE_ALERT: selectedDate,
                },
            });

            const data = response.data?.data || [];
            setAlerts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur lors du chargement des alertes :', err);
            setError(
                err.response?.data?.message ||
                'Erreur lors de la récupération des alertes.'
            );
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (filterDate && user?.ID_UTILISATEUR) {
            fetchAlerts(filterDate);
        }
    }, [filterDate, user?.ID_UTILISATEUR]);

    const handleChangeFilterDate = (e) => {
        setFilterDate(e.target.value);
    };

    const handleOpenAddDialog = () => {
        setError('');
        setSuccessMessage('');
        setTitre('');
        setTextAlert('');
        setDateAlert(todayString);
        setAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => {
        setAddDialogOpen(false);
    };

    const handleAddAlert = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!user?.ID_UTILISATEUR) {
            setError('Utilisateur non identifié.');
            return;
        }

        if (!titre.trim() || !textAlert.trim() || !dateAlert) {
            setError('Veuillez remplir tous les champs (Titre, Texte, Date alerte).');
            return;
        }

        try {
            setPosting(true);

            const payload = {
                USER_ID: user.ID_UTILISATEUR,
                TITRE: titre.trim(),
                TEXT_ALERT: textAlert.trim(),
                DATE_ALERT: dateAlert, // YYYY-MM-DD
            };

            await axios.post(`${BASE_URL}/api/alerts`, payload);

            setSuccessMessage('Alerte ajoutée avec succès.');

            if (dateAlert === filterDate) {
                fetchAlerts(filterDate);
            }

            setTimeout(() => {
                setAddDialogOpen(false);
                setSuccessMessage('');
            }, 800);
        } catch (err) {
            console.error("Erreur lors de l'ajout de l’alerte :", err);
            setError(
                err.response?.data?.message || "Erreur lors de l'ajout de l’alerte."
            );
        } finally {
            setPosting(false);
        }
    };

    // --- EDIT HANDLERS ---
    const handleOpenEditDialog = (alert) => {
        setCurrentAlert(alert);
        setEditTitre(alert.TITRE || '');
        setEditTextAlert(alert.TEXT_ALERT || '');
        setEditUserId(alert.USER_ID || '');
        setEditError('');
        setEditSuccess('');
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setCurrentAlert(null);
    };

    const handleSaveEdit = async () => {
        if (!currentAlert) return;

        setEditError('');
        setEditSuccess('');

        const payload = {};

        if (editTitre !== currentAlert.TITRE) {
            payload.TITRE = editTitre;
        }

        if (editTextAlert !== currentAlert.TEXT_ALERT) {
            payload.TEXT_ALERT = editTextAlert;
        }

        if (editUserId !== currentAlert.USER_ID) {
            payload.USER_ID = editUserId;

            // ENVOIYEUR = utilisateur connecté
            if (user?.UTILISATEUR) {
                payload.ENVOIYEUR = user.UTILISATEUR;
            }
        }

        if (Object.keys(payload).length === 0) {
            setEditError('Aucune modification à enregistrer.');
            return;
        }

        try {
            setEditPosting(true);

            await axios.patch(
                `${BASE_URL}/api/alerts/${currentAlert.ID_ALERT}`,
                payload
            );

            setEditSuccess('Alerte mise à jour avec succès.');
            await fetchAlerts(filterDate);

            setTimeout(() => {
                handleCloseEditDialog();
            }, 800);
        } catch (err) {
            console.error('Erreur lors de la mise à jour de l’alerte :', err);
            setEditError(
                err.response?.data?.message ||
                'Erreur lors de la mise à jour de l’alerte.'
            );
        } finally {
            setEditPosting(false);
        }
    };


    return (
        <Box
            sx={{
                p: 3,
                display: 'flex',
                justifyContent: 'center',
                bgcolor: '#F5F7F8',
                minHeight: 'calc(100vh - 64px)',
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 900 }}>
                {/* Card Mes alertes */}
                <Paper sx={{ p: 2.5 }} elevation={3}>
                    {/* Titre + actions */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            justifyContent: 'space-between',
                            mb: 2,
                            gap: 2,
                        }}
                    >
                        <Typography variant="h5" fontWeight="bold">
                            Mes alertes
                        </Typography>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                                label="Filtrer par date"
                                type="date"
                                size="small"
                                value={filterDate}
                                onChange={handleChangeFilterDate}
                                InputLabelProps={{ shrink: true }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenAddDialog}
                            >
                                Ajouter une alerte
                            </Button>
                        </Stack>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {loading ? (
                        <Typography variant="body2" color="text.secondary">
                            Chargement des alertes...
                        </Typography>
                    ) : alerts.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            Aucune alerte pour cette date.
                        </Typography>
                    ) : (
                        alerts.map((alert) => {
                            const isTomorrow = alert.DATE_ALERT === tomorrowString;
                            const isToday = alert.DATE_ALERT === todayString;
                            const isFuture = alert.DATE_ALERT > todayString; // pour bouton Edit

                            return (
                                <Box
                                    key={alert.ID_ALERT}
                                    sx={{
                                        border: '1px solid #ddd',
                                        borderRadius: 1.5,
                                        p: 1.5,
                                        mb: 1.5,
                                        position: 'relative',
                                        backgroundColor: '#fafafa',
                                    }}
                                >
                                    {/* Badge Demain */}
                                    {isTomorrow && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: isFuture ? 44 : 8,
                                                backgroundColor: '#ff9800',
                                                color: 'white',
                                                borderRadius: '12px',
                                                px: 1.5,
                                                py: 0.5,
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                                            }}
                                        >
                                            Demain
                                        </Box>
                                    )}

                                    {/* Badge Aujourd'hui */}
                                    {isToday && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: isTomorrow || isFuture ? 44 : 8,
                                                backgroundColor: '#4caf50',
                                                color: 'white',
                                                borderRadius: '12px',
                                                px: 1.5,
                                                py: 0.5,
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                                            }}
                                        >
                                            Aujourd&apos;hui
                                        </Box>
                                    )}

                                    {/* Bouton Edit si DATE_ALERT > today */}
                                    {isFuture && (
                                        <IconButton
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                bgcolor: '#ffffffcc',
                                                '&:hover': { bgcolor: '#eeeeee' },
                                            }}
                                            onClick={() => handleOpenEditDialog(alert)}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    )}

                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {alert.TITRE}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Date alerte : <strong>{alert.DATE_ALERT}</strong>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Créée le : <strong>{alert.DATE_CREATION}</strong>
                                    </Typography>

                                    {/* 🔹 ENVOIYEUR affiché seulement s'il n'est pas null */}
                                    {alert.ENVOIYEUR && (
                                        <Typography variant="body2" color="text.secondary">
                                            Destinateur : <strong>{alert.ENVOIYEUR}</strong>
                                        </Typography>
                                    )}

                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                                    >
                                        {alert.TEXT_ALERT}
                                    </Typography>
                                </Box>
                            );
                        })
                    )}
                </Paper>

                {/* Dialog Ajouter une nouvelle alerte */}
                <Dialog
                    open={addDialogOpen}
                    onClose={handleCloseAddDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>+Ajouter une nouvelle alerte</DialogTitle>
                    <DialogContent dividers>
                        <Box
                            component="form"
                            onSubmit={handleAddAlert}
                            noValidate
                            sx={{ mt: 1 }}
                        >
                            <TextField
                                label="Titre"
                                fullWidth
                                margin="normal"
                                value={titre}
                                onChange={(e) => setTitre(e.target.value)}
                                inputProps={{ maxLength: 100 }}
                                required
                            />

                            <TextField
                                label="Texte de l’alerte"
                                fullWidth
                                margin="normal"
                                multiline
                                minRows={3}
                                value={textAlert}
                                onChange={(e) => setTextAlert(e.target.value)}
                                required
                            />

                            <TextField
                                label="Date de l’alerte"
                                type="date"
                                fullWidth
                                margin="normal"
                                value={dateAlert}
                                onChange={(e) => setDateAlert(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                    min: todayString,
                                }}
                                required
                            />

                            {error && (
                                <MuiAlert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </MuiAlert>
                            )}
                            {successMessage && (
                                <MuiAlert severity="success" sx={{ mt: 2 }}>
                                    {successMessage}
                                </MuiAlert>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddDialog} color="inherit">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleAddAlert}
                            variant="contained"
                            disabled={posting}
                        >
                            {posting ? 'Ajout...' : 'Ajouter'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog Edit alerte */}
                <Dialog
                    open={editDialogOpen}
                    onClose={handleCloseEditDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Modifier l&apos;alerte</DialogTitle>
                    <DialogContent dividers>
                        <TextField
                            label="Titre"
                            fullWidth
                            margin="normal"
                            value={editTitre}
                            onChange={(e) => setEditTitre(e.target.value)}
                        />

                        <TextField
                            label="Texte de l’alerte"
                            fullWidth
                            margin="normal"
                            multiline
                            minRows={3}
                            value={editTextAlert}
                            onChange={(e) => setEditTextAlert(e.target.value)}
                        />

                        <TextField
                            select
                            label="Utilisateur"
                            fullWidth
                            margin="normal"
                            value={editUserId || ''}
                            onChange={(e) => setEditUserId(e.target.value)}
                        >
                            {users.map((u) => (
                                <MenuItem
                                    key={u.ID_UTILISATEUR}
                                    value={u.ID_UTILISATEUR}
                                >
                                    {u.UTILISATEUR}
                                </MenuItem>
                            ))}
                        </TextField>

                        {editError && (
                            <MuiAlert severity="error" sx={{ mt: 2 }}>
                                {editError}
                            </MuiAlert>
                        )}
                        {editSuccess && (
                            <MuiAlert severity="success" sx={{ mt: 2 }}>
                                {editSuccess}
                            </MuiAlert>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditDialog} color="inherit">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSaveEdit}
                            variant="contained"
                            disabled={editPosting}
                        >
                            {editPosting ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default AlertePage;
