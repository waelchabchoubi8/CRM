// TabsPartenaires.js
import React, { useState, useEffect, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import axios from 'axios';
import BASE_URL from '../../Utilis/constantes';

import {
    Grid, Typography, Select, MenuItem, CircularProgress, Divider, Chip, Stack,
    Tabs, Tab, Box, Radio, RadioGroup, FormControlLabel, Button, Badge,
    Collapse, TextField, IconButton, Autocomplete, Table, TableBody,
    TableCell, TableHead, TablePagination, TableRow, Dialog, DialogContent,
    DialogTitle, DialogActions, Paper, TableContainer, InputAdornment,
    Rating, LinearProgress, Tooltip, FormControl, Alert
} from '@mui/material';
import {
    List,
    ListItem,
    ListItemText
} from "@mui/material";
import PreviewIcon from '@mui/icons-material/Preview';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

import CardPartenaires from './CardPartenaires';
import CardFamille from '../Family/cardFamille';
import CardFamilleCSPD from '../Family/cardFamilledamakCSPD';
import CommandesList from '../CSPD/CommandesEncours';
import CommandesListFDM from '../FDM/CommandesEncoursFDM';
import CommandesListPart from './CommandesEncoursPart';
import CardClientsPartenaires from '../Partenaires/CardClientsPartenaires';
import CardInvestisseursCSPD from '../Investisseurs/CardInvestisseurCSPD';
import CardClientsCSPD from '../CSPD/CardClientCSPD';
import CardInvestisseur from '../Investisseurs/CardInvestisseurs';
import Stock from '../Stock';
import Storekeeper from '../../Magasin/Storekeeper';

import annulerIcon from '../../icons/annuler.png';
import checkIcon from '../../icons/check.png';
import ClientsIcon from '../../icons/addClient.png';

import EmployeeRequests from "../../RhDepartement/EmployeeReqTabs";
import DemandeAchat from "../DemandeAchat";
import Savmanagement from "../../Sav/Savmanagement";
import RenseignementCommercials from "../RenseignementCommercial";
import ReclamationsList from "../../Sav/ReclamationsList";
import SOSList from "../../Sav/SOSList";
import JournalCommercial from "../JournalCommercial";
import VisiteClients from "../VisiteClients";
import MesAlert from "../alert";
import OrdreAdministration from "../../Adminstration/OrdreAdministration";
import bouton1 from '../../images/bouton1.png';

// Moved outside to prevent re-creation on every render
const StockRevendeur = memo(({ clientCode, brands, inv }) => {
    const [stocks, setStocks] = useState({});
    const [loading, setLoading] = useState(false);

    const brandsString = useMemo(() => {
        return Array.isArray(brands) ? [...brands].sort().join(',') : '';
    }, [brands]);

    useEffect(() => {
        if (!clientCode || !brandsString) return;
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchStock = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${BASE_URL}/api/getSoldeeByInv`, {
                    params: { clientCode, marks: brandsString, ...(inv ? { type: 'inv' } : {}) },
                    signal: signal
                });
                if (!signal.aborted) setStocks(res.data?.data || {});
            } catch (err) {
                if (!axios.isCancel(err)) console.error("Erreur API Stock:", err);
            } finally {
                if (!signal.aborted) setLoading(false);
            }
        };
        fetchStock();
        return () => controller.abort();
    }, [clientCode, brandsString, inv]);

    if (loading) return <LinearProgress sx={{ my: 1, height: 2, borderRadius: 1 }} />;

    const BRAND_COLORS = { 'OZKA': '#fbc02d', 'STARMAXX': '#075dab', 'OTANI': '#204389', 'PULMOX': '#ea0029', 'ZEETEX': '#000000' };

    return (
        <Stack spacing={1.5} sx={{ mt: 1 }}>
            {brands.map((brand) => {
                const bUpper = brand.toUpperCase();
                const qty = bUpper === 'ZEETEX' ? (stocks['ZEETEX_ZI_CH'] || 0) + (stocks['ZEETEX_ZI_OI'] || 0) : (stocks[bUpper] || 0);
                const brandColor = BRAND_COLORS[bUpper] || '#3f51b5';
                return (
                    <Box key={brand}>
                        <Box display="flex" justifyContent="space-between" mb={0.5} alignItems="center">
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: brandColor }}>{bUpper}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#000000' }}>{qty} PCS</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={Math.min((qty / 200) * 100, 100)} sx={{ height: 6, borderRadius: 4, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: qty > 0 ? brandColor : '#e0e0e0' } }} />
                    </Box>
                );
            })}
        </Stack>
    );
});

function CustomTabPanel({
    value,
    index,
    searchTerm,
    setSearchTerm,
    selectedOption,
    setSelectedOption,
    onCommunicationSelect,
    onClientCommunicationStart,
    disableStock,
    setNumber, }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [open, setOpen] = useState(false);
    const [selectedCommunication, setSelectedCommunication] = useState(null);
    const [investisseur, setInvestisseur] = useState(null);


    const [users, setUsers] = useState([]);
    const [repres, setRepres] = useState([])
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const currentUser = useSelector((state) => state.user);
    const [alerts, setAlerts] = useState([]);
    const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
    const [expandedAlertId, setExpandedAlertId] = useState(null);

    const todayString = new Date().toISOString().split('T')[0];
    const tomorrowString = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    ).toISOString().split('T')[0];


    const [total, setTotal] = useState(0);
    const [selectedAvancement, setSelectedAvancement] = React.useState('');
    const [selectedTri, setSelectedTri] = React.useState('');
    const [selectedRotation, setSelectedRotation] = React.useState('');
    const [selectedClient, setSelectedClient] = React.useState(null);
    const [selectedClientFdm, setSelectedClientFdm] = React.useState(null);

    const [clients, setClients] = useState([]);
    const [clientsFdm, setClientsFdm] = useState([]);

    // 🔹 Réseau dialog

    const [historicDialogOpen, setHistoricDialogOpen] = useState(false);
    const [historicData, setHistoricData] = useState([]);
    const [historicDate, setHistoricDate] = useState(new Date().toISOString().split('T')[0]);
    const [historicPage, setHistoricPage] = useState(0);
    const [historicPageSize, setHistoricPageSize] = useState(10);
    const [historicTotal, setHistoricTotal] = useState(0);
    const [reseauOpen, setReseauOpen] = useState(false);
    const [reseauLoading, setReseauLoading] = useState(false);
    const [reseauError, setReseauError] = useState('');

    const [reseauList, setReseauList] = useState([]);
    const [allReseaux, setAllReseaux] = useState([]);
    const [reseaux, setReseaux] = useState([]);

    const [selectedReseauId, setSelectedReseauId] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const REGION_MAP = {
        Nord: ["Tunis", "Ariana", "Ben Arous", "Manouba", "Bizerte", "Nabeul", "Zaghouane", "Mateur"],
        "Nord Ouest": ["Beja", "Jendouba", "Kef", "Siliana", "Tabarka", "Ain Draham"],
        Centre: ["Gasserine", "Kairaouane", "Sidi Bouzid", "Bou Hajla", "Gafsa", "Ghebali", "Nafta"],
        "Ligne de Côte": ["Sousse", "Monastir", "Mahdia", "Msaken"],
        Sud: ["Sfax", "Gabes", "Mednine", "Zarzis", "Jerba", "Tataouine"]
    };
    const [cityList, setCityList] = useState(Object.values(REGION_MAP).flat());
    const [pendingVote, setPendingVote] = useState({});


    //concurrents
    const [concurrentDialogOpen, setConcurrentDialogOpen] = useState(false);
    const [concurrentTab, setConcurrentTab] = useState(0); // 0: Grossistes, 1: Clients
    const [concurrents, setConcurrents] = useState([]);
    const [concurrentLoading, setConcurrentLoading] = useState(false);
    const [concurrentError, setConcurrentError] = useState(null);

    // Clients bloqués
    const [blockedClients, setBlockedClients] = useState([]);
    const [blockedLoading, setBlockedLoading] = useState(false);
    const [blockedError, setBlockedError] = useState(null);
    const [blockedPage, setBlockedPage] = useState(0);
    const [blockedPageSize, setBlockedPageSize] = useState(10);
    const [blockedTotal, setBlockedTotal] = useState(0);
    const [blockedSearch, setBlockedSearch] = useState('');

    const fetchConcurrents = async (signal) => {
        setConcurrentLoading(true);
        setConcurrentError(null);
        try {
            const res = await axios.get(`${BASE_URL}/api/concurrents`, { signal });
            if (!signal.aborted) {
                setConcurrents(res.data?.data || []);
            }
        } catch (err) {
            if (!axios.isCancel(err)) {
                console.error("Erreur API Concurrents:", err);
                if (!signal.aborted) setConcurrentError("Erreur lors du chargement des grossistes");
            }
        } finally {
            if (!signal.aborted) setConcurrentLoading(false);
        }
    };

    const fetchBlockedClients = async (signal) => {
        setBlockedLoading(true);
        setBlockedError(null);
        try {
            const res = await axios.get(`${BASE_URL}/api/clients-bloques`, {
                params: {
                    page: blockedPage,
                    pageSize: blockedPageSize,
                    search: blockedSearch
                },
                signal
            });
            if (!signal.aborted) {
                setBlockedClients(res.data?.data || []);
                setBlockedTotal(res.data?.total || 0);
            }
        } catch (err) {
            if (!axios.isCancel(err)) {
                console.error("Erreur API Clients Bloqués:", err);
                if (!signal.aborted) setBlockedError("Erreur lors du chargement des clients bloqués");
            }
        } finally {
            if (!signal.aborted) setBlockedLoading(false);
        }
    };

    useEffect(() => {
        if (!concurrentDialogOpen) return;

        const controller = new AbortController();
        const signal = controller.signal;

        if (concurrentTab === 0) {
            fetchConcurrents(signal);
        } else {
            fetchBlockedClients(signal);
        }

        return () => controller.abort();
    }, [concurrentDialogOpen, concurrentTab, blockedPage, blockedPageSize, blockedSearch]);

    const handleOpenConcurrentDialog = () => {
        setConcurrentDialogOpen(true);
        setConcurrentTab(0);
    };

    const handleCloseConcurrentDialog = () => {
        setConcurrentDialogOpen(false);
    };

    const handleVote = async (revendeurId, note) => {
        if (!currentUser?.ID_UTILISATEUR) return;
        try {
            const payload = { idRevendeur: revendeurId, rate: note, userName: currentUser.UTILISATEUR || "Utilisateur" };
            await axios.post(`${BASE_URL}/api/evaluation-reseau`, payload);
            const resEval = await axios.get(`${BASE_URL}/api/evaluation-reseau?idRevendeur=${revendeurId}`);
            setReseaux(prev => prev.map(item => item.id === revendeurId ? { ...item, ...resEval.data, evaluationText: note } : item));
            setPendingVote(prev => { const newState = { ...prev }; delete newState[revendeurId]; return newState; });
        } catch (err) {
            console.error("Erreur vote:", err);
        }
    };


    // Fetch API function
    const fetchHistoricCommands = async (date = historicDate, page = historicPage, pageSize = historicPageSize) => {
        try {
            const res = await axios.get(`${BASE_URL}/api/alerts-summary`, {
                params: {
                    DATE_ALE: date,
                    page,
                    pageSize
                }
            });
            setHistoricData(res.data?.data || []);
            setHistoricTotal(res.data?.total || 0);
        } catch (err) {
            console.error('Erreur récupération historique:', err);
            setHistoricData([]);
            setHistoricTotal(0);
        }
    };


    const normalize = (str = '') =>
        str.toLowerCase().replace(/[^a-z\s]/g, '').trim();

    const getLastWord = (adress = '') => {
        const clean = normalize(adress);
        const parts = clean.split(/\s+/);
        return parts[parts.length - 1] || '';
    };







    const [searchClient, setSearchClient] = useState('')
    const [assignedList, setAssignedList] = useState('')
    const handleClickOpen = () => {
        setOpen(true);
        fetchUsers();
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleDateChange = (date) => {
        setSelectedDate(date);
        setPage(0);
    };
    const [dialogOpen, setDialogOpen] = useState(false)
    const [tot, setTot] = useState({ typeCli: '', nbr: 0 })
    const [displayMode, setDisplayMode] = React.useState('card');
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    useEffect(() => {
        setNumber(tot.typeCli, tot.nbr)
    }, [tot])
    useEffect(() => {
        fetchUsers();
    }, []);
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
        setSearchTerm('');
    };
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);

    };

    const fetchAlerts = async () => {
        if (!currentUser?.ID_UTILISATEUR) return;

        try {
            const res = await axios.get(`${BASE_URL}/api/alerts`, {
                params: {
                    USER_ID: currentUser.ID_UTILISATEUR,
                    DATE_ALERT: todayString,
                },
            });

            setAlerts(res.data?.data || []);
        } catch (err) {
            console.error('Erreur fetch alerts', err);
        }
    };

    useEffect(() => {
        if (!currentUser?.ID_UTILISATEUR) return;

        fetchAlerts();

        const intervalId = setInterval(fetchAlerts, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [currentUser?.ID_UTILISATEUR]);
    // 🔔 Alertes – ouverture / fermeture lecture
    const handleAlertIconClick = () => {
        setAlertsDialogOpen(true);
    };

    const handleCloseAlertsDialog = () => {
        setAlertsDialogOpen(false);
        setExpandedAlertId(null);
    };


    const handleCommunicationSelect = (payload) => {
        if (index !== 0) return;
        // ✅ forward to parent
        onCommunicationSelect?.(payload);
    };
    const handleOpenReseauDialog = async () => {
        setReseauOpen(true);
        setReseauLoading(true);
        setReseauError('');

        try {
            const marquesRes = await axios.get(`${BASE_URL}/api/reseaux`);
            const revRes = await axios.get(`${BASE_URL}/api/revendeurs`);

            const initialReseaux = revRes.data?.data || [];

            // Fetch evaluations for each reseller to update counts (Mauvais, Neutre, Fiable)
            const updatedReseaux = await Promise.all(
                initialReseaux.map(async (r) => {
                    try {
                        const resEval = await axios.get(`${BASE_URL}/api/evaluation-reseau?idRevendeur=${r.id}`);
                        return { ...r, ...resEval.data };
                    } catch (err) {
                        console.error(`Erreur fetch evaluation pour revendeur ${r.id}:`, err);
                        return r;
                    }
                })
            );

            setReseauList(marquesRes.data?.data || []);
            setAllReseaux(updatedReseaux);
            setReseaux(updatedReseaux);
        } catch (err) {
            console.error("Erreur chargement réseau:", err);
            setReseauError("Impossible de charger le réseau");
        } finally {
            setReseauLoading(false);
        }
    };



    const handleCloseReseauDialog = () => {
        setReseauOpen(false);
    };



    useEffect(() => {
        let data = [...allReseaux];

        if (selectedReseauId) {
            data = data.filter(r => {
                const ids = String(r.id_reseau || '')
                    .replace(/[\[\]]/g, '')
                    .split(',')
                    .map(v => v.trim());
                return ids.includes(String(selectedReseauId));
            });
        }

        if (selectedRegion || selectedCity) {
            data = data.filter(r => {
                const last = getLastWord(r.adress);

                const inRegion = selectedRegion
                    ? REGION_MAP[selectedRegion]?.some(c => c.toLowerCase() === last)
                    : true;

                const inCity = selectedCity
                    ? last === selectedCity.toLowerCase()
                    : true;

                return inRegion && inCity;
            });
        }

        setReseaux(data);
    }, [selectedReseauId, selectedRegion, selectedCity, allReseaux]);





    const toggleActif = async (alertId) => {
        try {
            const newValue = 'N';

            await axios.patch(`${BASE_URL}/api/alerts/${alertId}`, {
                ACTIF: newValue,
                id: alertId
            });

            setAlerts(prevAlerts =>
                prevAlerts.map(alert =>
                    alert.ID_ALERT === alertId ? { ...alert, ACTIF: newValue } : alert
                )
            );
        } catch (err) {
            console.error('Erreur PATCH ACTIF:', err);
            alert('Erreur lors de la mise à jour de l\'état');
        }
    };
    useEffect(() => {
        if (!currentUser?.ID_UTILISATEUR) return;

        fetchAlerts();


        const intervalId = setInterval(() => {
            fetchAlerts();
        }, 1 * 60 * 1000);

        return () => clearInterval(intervalId);

    }, [currentUser?.ID_UTILISATEUR]);



    const avancementOptions = [
        'En cours',
        'Accepter par collaborateur',
        'Refuser',
        'Injoignable',
        'Contrat signé',
        'En cours de signature',
        'Injoignable pour signature',
        'A rappeler'
    ];
    const triOptions = [
        'A->Z',
        'Nbr jours',

    ];
    const rotationOptions = [
        'rotation élevée',
        'rotation moyenne',
        'faible rotation'
    ]

    const handleAffectCollab = (user) => {
        if (user) {
            // setEditing(true);
            // setCurrentUser(user);
            // if(repres.length>0){
            // const representant = repres?.find((rep) => rep.NUM_REPRES === user.COMMERCIAL_OK);
            // setSelectedRepres(representant);
        }
    }
    const handleTriChange = (event, value) => {
        setSelectedTri(value);
    };
    const handleRotationChange = (event, value) => {
        setSelectedRotation(value);
    };
    const handleAvancementChange = (event, value) => {
        setSelectedAvancement(value);
    };

    const handleReseauFilterChange = (e) => {
        setSelectedReseauId(e.target.value);
        setSelectedRegion('');
        setSelectedCity('');
    };
    const handleRegionChange = (e) => {
        const region = e.target.value;
        setSelectedRegion(region);
        setSelectedCity('');
        setCityList(region ? REGION_MAP[region] : Object.values(REGION_MAP).flat());
    };


    useEffect(() => {
        fetchClients();
    }, [page, pageSize, searchClient]);

    const fetchClients = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/clientsCspdSearch`, {
                params: { page, pageSize, searchTerm: searchClient },
            });
            setClients(response.data.clients);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    };
    useEffect(() => {
        fetchClientsFdm();
    }, [page, pageSize, searchClient]);

    useEffect(() => {
        let filtered = [...allReseaux];

        if (selectedReseauId) {
            filtered = filtered.filter(r =>
                String(r.id_reseau).includes(selectedReseauId)
            );
        }

        if (selectedRegion) {
            const cities = REGION_MAP[selectedRegion].map(c => c.toLowerCase());
            filtered = filtered.filter(r =>
                cities.includes(getLastWord(r.adress))
            );
        }

        setReseaux(filtered);
    }, [selectedReseauId, selectedRegion, allReseaux]);



    const fetchClientsFdm = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/clientsFdmSearch`, {
                params: { page, pageSize, searchTerm: searchClient },
            });
            setClientsFdm(response.data.clients);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    };
    const getSearchPlaceholder = () => {
        switch (selectedOption) {
            case '0': // Demandes
                return 'Nom / Numéro partenaire';

            case '1': // Clients
                return 'Nom / Numéro client';

            case '2': // Commandes en cours
                return 'Num commande / Nom client';

            case '3': // Etat de stock
                return 'Dimension';

            default:
                return 'Rechercher';
        }
    };

    const handleDialogOpen = () => setDialogOpen(true);
    const handleDialogClose = () => setDialogOpen(false);
    const handleSearchClientChange = (event) => {
        setSearchClient(event.target.value);
        setPage(0);
    };
    const handleSelectClient = (client) => {
        setSelectedClient(client.CODE_CLIENT);
    };
    const handleClientCommunicationStart = (payload) => {
        onClientCommunicationStart?.(payload);
    };

    const handleSelectClientFdm = (client) => {
        setSelectedClientFdm(client.CODE_CLIENT);
    };
    const [selectedCodeClient, setSelectedCodeClient] = useState(null)
    const handleConfirmSelection = () => {
        if (selectedClient) {

            setDialogOpen(false);
        }
    };
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
    };

    const renderSearchInput =
        <TextField
            style={{ marginLeft: '20px', marginRight: '20px' }}
            variant="outlined"
            placeholder={getSearchPlaceholder()}
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
                endAdornment: (
                    <IconButton>
                        <SearchIcon />
                    </IconButton>
                ),
            }}
            sx={{ width: "300px" }}
        />


    const renderSelectClImage = (index === 1 && selectedOption === '3') || (index == 2 && selectedOption === '3') ? (
        <TextField
            fullWidth
            value={selectedClient}
            placeholder="Recherche par client  "

            onChange={(e) => setSelectedClient(e.target.value)}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={handleDialogOpen}>
                            <img src={ClientsIcon} alt="Clients Icon" style={{ height: '35px', width: '35px' }} />
                        </IconButton>
                    </InputAdornment>
                )
            }}
            variant="outlined"
            style={{ marginRight: '20px' }}
        />
    ) : null;
    const renderSelectClImageFdm = (index === 0 && selectedOption === '3') || (index == 3 && selectedOption === '2') ? (
        <TextField
            fullWidth
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            placeholder="Chercher les remises d'un client  "

            variant="outlined"
            style={{ marginRight: '20px' }}
        />
    ) : null;
    const renderIconAndText = () => {
        let label = '';
        if (index === 0) {
            label = `Nombre de partenaires`;
        } else if (index === 1) {
            label = `Nombre d'investisseurs `;
        }
        if (selectedAvancement) {
            label += ` ${selectedAvancement}`;
        }
        return (
            null
        )
    };

    const renderFiltredInput =
        index === 0 && selectedOption === '0' ? (
            <Autocomplete
                options={avancementOptions}
                value={selectedAvancement}
                onChange={handleAvancementChange}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Filtrer par statut"
                        variant="outlined"
                    />
                )}
                sx={{ width: "250px", marginRight: "20px" }}
            />
        ) : null;

    const renderFiltredRotInput = selectedOption === '4' ? (
        <Autocomplete
            options={rotationOptions}
            value={selectedRotation}
            onChange={handleRotationChange}
            renderInput={(params) => <TextField {...params} label="Filtrer par taux de rotation" variant="outlined" />}
            sx={{ width: "350px", marginRight: "20px" }}
        />
    ) : null;
    const renderTriInput = ((index === 2 || index === 3) && selectedOption !== '3') ? (
        <Autocomplete
            options={triOptions}
            value={selectedTri}
            onChange={handleTriChange}
            renderInput={(params) => <TextField {...params} label="Trier par" variant="outlined" />}
            sx={{ width: "250px", marginRight: "20px" }}
        />
    ) : null;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
        >
            {value === index && (
                <Box sx={{ p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
                    <Grid container spacing={2}>
                        {/* ===================== CARD 1 : FILTRES + ACTIONS ===================== */}
                        <Grid item xs={12}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 3
                                }}
                            >
                                {/* ---- FILTRES ---- */}
                                <Box>
                                    <RadioGroup
                                        row
                                        value={selectedOption}
                                        onChange={handleOptionChange}
                                    >
                                        {(index === 0 || index === 1) && (
                                            <>
                                                <FormControlLabel value="0" control={<Radio size="small" />} label="Demandes" />
                                                <FormControlLabel value="1" control={<Radio size="small" />} label="Clients" />
                                                <FormControlLabel value="2" control={<Radio size="small" />} label="Commandes en cours" />
                                                <FormControlLabel value="3" control={<Radio size="small" />} label="Etat de stock" disabled={disableStock} />
                                            </>
                                        )}
                                        {(index === 2 || index === 3) && (
                                            <>
                                                <FormControlLabel value="1" control={<Radio size="small" />} label="Clients" />
                                                <FormControlLabel value="2" control={<Radio size="small" />} label="Commandes en cours" />
                                                <FormControlLabel value="3" control={<Radio size="small" />} label="Etat de stock" disabled={disableStock} />
                                            </>
                                        )}
                                        {(index === 4) && (
                                            <FormControlLabel value="1" control={<Radio size="small" />} label="Enregistrés" />
                                        )}
                                    </RadioGroup>
                                </Box>

                                {/* ---- ACTIONS ---- */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleOpenConcurrentDialog}
                                        sx={{
                                            color: '#d32f2f',
                                            borderColor: '#d32f2f',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            '&:hover': {
                                                borderColor: '#b71c1c',
                                                backgroundColor: 'rgba(211, 47, 47, 0.08)'
                                            }
                                        }}
                                    >
                                        Liste Rouge
                                    </Button>
                                    {/* <Button
                                        variant="outlined"
                                        onClick={handleClickOpen}
                                        sx={{ textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Collaborateurs
                                    </Button> */}

                                    <Button
                                        onClick={handleOpenReseauDialog}
                                        disableRipple
                                        sx={{
                                            minWidth: -5,
                                            padding: 0,
                                            backgroundColor: 'transparent',
                                            '&:hover': {
                                                backgroundColor: 'transparent',
                                                boxShadow: 'none'
                                            }
                                        }}
                                    >
                                        <img
                                            src={bouton1}
                                            alt="reseau"
                                            style={{ width: 350, height: 50, display: 'block' }}
                                        />
                                    </Button>

                                    {(currentUser?.ROLE === "administrateur" ||
                                        currentUser?.ROLE === "directeur commercial ") && (
                                            <IconButton
                                                color="primary"
                                                onClick={() => {
                                                    const today = new Date().toISOString().split('T')[0];
                                                    setHistoricDate(today);
                                                    setHistoricPage(0);
                                                    setHistoricDialogOpen(true);
                                                    fetchHistoricCommands(today, 0, historicPageSize);
                                                }}
                                                sx={{ backgroundColor: '#e3f2fd' }}
                                            >
                                                <PreviewIcon />
                                            </IconButton>
                                        )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* ===================== CARD 2 : RECHERCHE + ALERTES ===================== */}
                        <Grid item xs={12}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 3
                                }}
                            >
                                {/* ---- RECHERCHE ---- */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                    {renderFiltredInput}
                                    {renderSearchInput}
                                    <Divider orientation="vertical" flexItem />
                                    {renderSelectClImage}
                                    {renderSelectClImageFdm}
                                    {renderFiltredRotInput}
                                </Box>

                                {/* ---- ALERTES ---- */}
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Badge
                                        badgeContent={alerts.length}
                                        color="error"
                                        overlap="circular"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                fontSize: '0.75rem',
                                                minWidth: 20,
                                                height: 20,
                                                fontWeight: 700,
                                                backgroundColor: alerts.length > 0 ? '#d32f2f' : '#2e7d32',
                                                color: '#fff',
                                                boxShadow: '0 0 0 2px white',
                                            },
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            onClick={handleAlertIconClick}
                                            sx={{
                                                minWidth: 300,
                                                fontWeight: 800,
                                                textTransform: 'none',
                                                backgroundColor: alerts.length > 0 ? '#d32f2f' : '#2e7d32',
                                                '&:hover': {
                                                    backgroundColor: alerts.length > 0 ? '#9a0007' : '#1b5e20',
                                                },
                                            }}
                                        >
                                            Mes alertes + Nouvelle Command
                                        </Button>
                                    </Badge>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>




                    <div>
                        <Dialog
                            open={concurrentDialogOpen}
                            onClose={handleCloseConcurrentDialog}
                            maxWidth="sm"
                            fullWidth
                            PaperProps={{
                                sx: { borderRadius: 3, boxShadow: 24 }
                            }}
                        >
                            <DialogTitle sx={{
                                m: 0,
                                p: 2,
                                backgroundColor: (theme) => theme.palette.error.dark,
                                color: 'white',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>🚫</span> Liste Rouge
                            </DialogTitle>

                            <DialogContent sx={{ p: 0 }}>
                                <Tabs
                                    value={concurrentTab}
                                    onChange={(e, newValue) => setConcurrentTab(newValue)}
                                    aria-label="Onglets liste rouge"
                                    variant="fullWidth"
                                    indicatorColor="error"
                                    textColor="error"
                                    sx={{
                                        borderBottom: 1,
                                        borderColor: 'divider',
                                        '& .Mui-selected': {
                                            backgroundColor: '#bbb5b5ff',
                                            transition: 'background-color 0.3s'
                                        }
                                    }}
                                >
                                    <Tab
                                        label="grossistes bloqués"
                                        sx={{
                                            fontWeight: 'bold',
                                            '&.Mui-selected': { backgroundColor: '#f5f5f5' }
                                        }}
                                    />
                                    <Tab
                                        label="Clients bloqués"
                                        sx={{
                                            fontWeight: 'bold',
                                            '&.Mui-selected': { backgroundColor: '#f5f5f5' }
                                        }}
                                    />
                                </Tabs>
                                <Box sx={{ p: 3, minHeight: 300 }}>
                                    {/* Contenu onglet 1 : grossistes bloqués */}
                                    {concurrentTab === 0 && (
                                        <>
                                            {concurrentLoading && (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, gap: 2 }}>
                                                    <CircularProgress color="error" />
                                                    <Typography variant="caption">Chargement des données...</Typography>
                                                </Box>
                                            )}

                                            {concurrentError && (
                                                <Alert severity="error" sx={{ mt: 2 }}>
                                                    {concurrentError}
                                                </Alert>
                                            )}

                                            {!concurrentLoading && !concurrentError && (
                                                <List disablePadding>
                                                    {concurrents.length > 0 ? (
                                                        concurrents.map((c) => (
                                                            <ListItem
                                                                key={c.id}
                                                                sx={{
                                                                    mb: 1,
                                                                    bgcolor: 'action.hover',
                                                                    borderRadius: 2,
                                                                    borderLeft: '4px solid',
                                                                    borderColor: 'error.main'
                                                                }}
                                                            >
                                                                <ListItemText
                                                                    primary={c.nom}
                                                                    primaryTypographyProps={{ fontWeight: 'medium' }}
                                                                />
                                                            </ListItem>
                                                        ))
                                                    ) : (
                                                        <Typography sx={{ textAlign: 'center', mt: 4, fontStyle: 'italic' }} color="text.secondary">
                                                            Aucun concurrent enregistré.
                                                        </Typography>
                                                    )}
                                                </List>
                                            )}
                                        </>
                                    )}

                                    {/* Contenu onglet 2 : Clients bloqués */}
                                    {concurrentTab === 1 && (
                                        <>
                                            {/* Zone de filtre */}
                                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                                <TextField
                                                    size="small"
                                                    variant="outlined"
                                                    placeholder="Rechercher par nom ou numéro"
                                                    value={blockedSearch}
                                                    onChange={(e) => {
                                                        setBlockedPage(0);
                                                        setBlockedSearch(e.target.value);
                                                    }}
                                                    sx={{ width: 320 }}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton size="small">
                                                                    <SearchIcon fontSize="small" />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            </Box>

                                            {blockedLoading && (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, gap: 2 }}>
                                                    <CircularProgress color="error" />
                                                    <Typography variant="caption">Chargement des clients bloqués...</Typography>
                                                </Box>
                                            )}

                                            {blockedError && (
                                                <Alert severity="error" sx={{ mt: 2 }}>
                                                    {blockedError}
                                                </Alert>
                                            )}

                                            {!blockedLoading && !blockedError && (
                                                <>
                                                    <List disablePadding>
                                                        {blockedClients.length > 0 ? (
                                                            blockedClients.map((c) => (
                                                                <ListItem
                                                                    key={`${c.INTITULE_CLIENT}-${c.BASE}`}
                                                                    sx={{
                                                                        mb: 1,
                                                                        bgcolor: 'action.hover',
                                                                        borderRadius: 2,
                                                                        borderLeft: '4px solid',
                                                                        borderColor: 'error.main',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1
                                                                    }}
                                                                >
                                                                    <ListItemText
                                                                        primary={c.INTITULE_CLIENT}
                                                                        secondary={c.TEL_CLIENT_F || 'Téléphone non renseigné'}
                                                                        primaryTypographyProps={{ fontWeight: 'medium' }}
                                                                    />
                                                                    {c.BASE && (
                                                                        <Chip
                                                                            label={c.BASE.toUpperCase()}
                                                                            size="small"
                                                                            sx={{
                                                                                fontSize: '0.7rem',
                                                                                fontWeight: 700,
                                                                                bgcolor: 'white',
                                                                                borderColor: 'error.main',
                                                                                color: 'error.main'
                                                                            }}
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                </ListItem>
                                                            ))
                                                        ) : (
                                                            <Typography sx={{ textAlign: 'center', mt: 4, fontStyle: 'italic' }} color="text.secondary">
                                                                Aucun client bloqué enregistré.
                                                            </Typography>
                                                        )}
                                                    </List>

                                                    {/* Pagination */}
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                                        <TablePagination
                                                            component="div"
                                                            rowsPerPageOptions={[10, 25, 50]}
                                                            count={blockedTotal}
                                                            rowsPerPage={blockedPageSize}
                                                            page={blockedPage}
                                                            onPageChange={(e, newPage) => setBlockedPage(newPage)}
                                                            onRowsPerPageChange={(e) => {
                                                                setBlockedPageSize(parseInt(e.target.value, 10));
                                                                setBlockedPage(0);
                                                            }}
                                                        />
                                                    </Box>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </DialogContent>

                            <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
                                <Button
                                    onClick={handleCloseConcurrentDialog}
                                    variant="outlined"
                                    color="inherit"
                                    sx={{ borderRadius: 2 }}
                                >
                                    FERMER
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <Dialog
                            open={historicDialogOpen}
                            onClose={() => setHistoricDialogOpen(false)}
                            maxWidth="md"
                            fullWidth
                        >
                            <DialogTitle sx={{ pb: 1 }}>
                                Historique des commandes
                                <Button
                                    onClick={() => setHistoricDialogOpen(false)}
                                    style={{ position: 'absolute', right: 8, top: 8 }}
                                >
                                    <CloseIcon />
                                </Button>
                            </DialogTitle>

                            <DialogContent sx={{ pt: 0 }}>
                                {/* Date Filter */}
                                <Box sx={{ mb: 2, mt: 1 }}>
                                    <TextField
                                        label="Filtrer par date"
                                        type="date"
                                        value={historicDate}
                                        onChange={(e) => {
                                            const newDate = e.target.value;
                                            setHistoricDate(newDate);
                                            setHistoricPage(0);
                                            fetchHistoricCommands(newDate, 0, historicPageSize);
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ width: 200 }}
                                    />
                                </Box>

                                <TableContainer component={Paper}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Numéro de Commande</TableCell>
                                                <TableCell>Date Alert</TableCell>
                                                <TableCell>Date Creation</TableCell>
                                                <TableCell>UTILISATEURS</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {historicData.map((row) => (
                                                <TableRow key={row.NUM_CMD + row.DATE_ALE}>
                                                    <TableCell>{row.NUM_CMD}</TableCell>
                                                    <TableCell>{row.DATE_ALE}</TableCell>
                                                    <TableCell>{row.DATE_CRE}</TableCell>
                                                    <TableCell>
                                                        <span dangerouslySetInnerHTML={{ __html: row.UTILISATEURS_Y }} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    <TablePagination
                                        component="div"
                                        count={historicTotal}
                                        rowsPerPage={historicPageSize}
                                        page={historicPage}
                                        onPageChange={(e, newPage) => {
                                            setHistoricPage(newPage);
                                            fetchHistoricCommands(historicDate, newPage, historicPageSize);
                                        }}
                                        onRowsPerPageChange={(e) => {
                                            const newSize = parseInt(e.target.value, 10);
                                            setHistoricPageSize(newSize);
                                            setHistoricPage(0);
                                            fetchHistoricCommands(historicDate, 0, newSize);
                                        }}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                    />
                                </TableContainer>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={alertsDialogOpen} onClose={handleCloseAlertsDialog} maxWidth="sm" fullWidth >
                            <DialogTitle> Mes alertes d'aujourd'hui </DialogTitle>
                            <DialogContent dividers>
                                {alerts.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Aucune alerte pour aujourd'hui.
                                    </Typography>
                                ) : (
                                    alerts.map((alert) => (
                                        <Box
                                            key={alert.ID_ALERT}
                                            sx={{
                                                border: '1px solid #ddd',
                                                borderRadius: 1.5,
                                                p: 1.5,
                                                mb: 1.5,
                                                cursor: 'pointer',
                                                position: 'relative',
                                                '&:hover': { backgroundColor: '#f5f5f5' },
                                            }}
                                            onClick={() => {
                                                const isCurrentlyExpanded = expandedAlertId === alert.ID_ALERT;

                                                // Comportement existant : toggle expansion
                                                setExpandedAlertId(isCurrentlyExpanded ? null : alert.ID_ALERT);

                                                // SI on ouvre (pas quand on ferme) → déclenche le PATCH
                                                if (!isCurrentlyExpanded && alert.ENVOIYEUR === 'CRM') {
                                                    toggleActif(alert.ID_ALERT);
                                                }
                                            }}
                                        >
                                            {alert.DATE_ALERT === tomorrowString && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        backgroundColor: '#ff9800',
                                                        color: 'white',
                                                        borderRadius: '12px',
                                                        padding: '2px 10px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                                                    }}
                                                >
                                                    Demain
                                                </Box>
                                            )}

                                            {/* ===== NEW: CRM Badge next to title ===== */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {alert.TITRE}
                                                </Typography>

                                                {alert.ENVOIYEUR === 'CRM' && (
                                                    <Box
                                                        sx={{
                                                            backgroundColor: '#2e7d32', // green
                                                            color: 'white',
                                                            borderRadius: '12px',
                                                            padding: '2px 8px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700,
                                                            boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
                                                        }}
                                                    >
                                                        CRM
                                                    </Box>
                                                )}
                                            </Box>

                                            <Collapse in={expandedAlertId === alert.ID_ALERT}>
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Date création : <strong>{alert.DATE_CREATION || ''}</strong>
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Date alerte : <strong>{alert.DATE_ALERT || ''}</strong>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                                        {alert.TEXT_ALERT}
                                                    </Typography>
                                                </Box>
                                            </Collapse>
                                        </Box>
                                    ))
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseAlertsDialog}>Fermer</Button>
                            </DialogActions>
                        </Dialog>


                        <Dialog
                            open={reseauOpen}
                            onClose={() => setReseauOpen(false)}
                            maxWidth={false}
                            fullWidth
                            PaperProps={{
                                sx: {
                                    borderRadius: 3,
                                    bgcolor: '#f8f9fa',
                                    backgroundImage: 'none',
                                    width: '95vw',
                                    height: '90vh',
                                    maxWidth: '1600px'
                                }
                            }}
                        >
                            {/* ================= HEADER & FILTERS ================= */}
                            <DialogTitle sx={{ p: 3, pb: 0 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h5" fontWeight={800} sx={{ color: '#1a4e7eff', letterSpacing: '-0.5px' }}>
                                        Réseau des revendeurs
                                    </Typography>
                                    <IconButton
                                        onClick={() => setReseauOpen(false)}
                                        size="small"
                                        sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 4,
                                        backgroundColor: 'white',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 2,
                                        alignItems: 'center'
                                    }}
                                >
                                    {/* Filtre Marque */}
                                    <Select
                                        value={selectedReseauId}
                                        onChange={handleReseauFilterChange}
                                        displayEmpty
                                        size="small"
                                        sx={{ minWidth: 200, borderRadius: 2, flex: { xs: '1 1 100%', md: 'none' } }}
                                    >
                                        <MenuItem value=""><em>Toutes les marques</em></MenuItem>
                                        {reseauList.map((r) => (
                                            <MenuItem key={r.id} value={r.id}>{r.nom_marque}</MenuItem>
                                        ))}
                                    </Select>

                                    {/* Filtre Région */}
                                    <Select
                                        value={selectedRegion}
                                        onChange={(e) => {
                                            const region = e.target.value;
                                            setSelectedRegion(region);
                                            setSelectedCity('');
                                            if (region) {
                                                setCityList(REGION_MAP[region] || []);
                                            } else {
                                                setCityList(Object.values(REGION_MAP).flat());
                                            }
                                        }}
                                        displayEmpty
                                        size="small"
                                        sx={{ minWidth: 180, borderRadius: 2 }}
                                    >
                                        <MenuItem value=""><em>Toutes les régions</em></MenuItem>
                                        {Object.keys(REGION_MAP).map((regionKey) => (
                                            <MenuItem key={regionKey} value={regionKey}>{regionKey}</MenuItem>
                                        ))}
                                    </Select>

                                    {/* Filtre Ville */}
                                    <Select
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        displayEmpty
                                        size="small"
                                        sx={{ minWidth: 180, borderRadius: 2 }}
                                    >
                                        <MenuItem value=""><em>Toutes les villes</em></MenuItem>
                                        {cityList.map((city) => (
                                            <MenuItem key={city} value={city}>{city}</MenuItem>
                                        ))}
                                    </Select>

                                    <Divider orientation="vertical" flexItem sx={{ mx: 1, display: { xs: 'none', md: 'block' } }} />

                                    {/* Radio Investisseur */}
                                    <RadioGroup
                                        row
                                        value={investisseur}
                                        onChange={(e) => setInvestisseur(e.target.value)}
                                        sx={{ ml: { md: 'auto' } }}
                                    >
                                        <FormControlLabel
                                            value=""
                                            control={<Radio size="small" />}
                                            label={<Typography variant="body2" fontWeight={500}>Tous</Typography>}
                                        />
                                        <FormControlLabel
                                            value="investisseur"
                                            control={<Radio size="small" />}
                                            label={<Typography variant="body2" fontWeight={500}>Investisseurs</Typography>}
                                        />
                                    </RadioGroup>
                                </Box>
                            </DialogTitle>

                            {/* ================= CONTENT ================= */}
                            <DialogContent sx={{ p: 3, mt: 2 }}>
                                {reseauLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                        <CircularProgress thickness={4} size={50} />
                                    </Box>
                                ) : reseauError ? (
                                    <Box sx={{ color: 'error.main', p: 5, textAlign: 'center' }}>{reseauError}</Box>
                                ) : (
                                    <Grid container spacing={3}>
                                        {reseaux
                                            .filter((r) => {
                                                const isInvMode = investisseur === 'investisseur';
                                                const rawData = isInvMode ? r.inv_reseau : r.id_reseau;
                                                if (isInvMode && !r.inv_reseau) return false;
                                                if (selectedReseauId) {
                                                    const ids = String(rawData).replace(/[\[\]]/g, '').split(',').map(id => id.trim());
                                                    if (!ids.includes(String(selectedReseauId))) return false;
                                                }
                                                const lastWord = r.adress ? r.adress.trim().split(/\s|-/).pop().toLowerCase() : '';
                                                const inRegion = selectedRegion ? REGION_MAP[selectedRegion]?.some(city => city.toLowerCase() === lastWord) : true;
                                                const inCity = selectedCity ? lastWord === selectedCity.toLowerCase() : true;
                                                return inRegion && inCity;
                                            })
                                            .map((r) => {
                                                // Calculate individual brands for StockRevendeur
                                                const individualBrands = r.reseau_nom
                                                    ? Array.from(new Set(r.reseau_nom.split(/[\/\s]+/).map(b => b.trim().toUpperCase()).filter(b => b !== "")))
                                                    : [];

                                                return (
                                                    <Grid item xs={12} sm={6} md={4} key={r.id}>
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                height: '100%',
                                                                borderRadius: 4,
                                                                border: '1px solid #e0e4ec',
                                                                backgroundColor: 'white',
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    transform: 'translateY(-6px)',
                                                                    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                                                                    borderColor: 'primary.light'
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>

                                                                {/* NOM & BADGE INV */}
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
                                                                    <Typography
                                                                        variant="subtitle1"
                                                                        sx={{ fontWeight: 800, color: '#1a237e', lineHeight: 1.2 }}
                                                                    >
                                                                        {r.name}
                                                                    </Typography>

                                                                    {r.inv_reseau && (
                                                                        <Chip
                                                                            label="INV"
                                                                            size="small"
                                                                            sx={{
                                                                                fontSize: '0.65rem',
                                                                                fontWeight: 900,
                                                                                borderRadius: '4px',
                                                                                bgcolor: 'rgba(128, 0, 32, 0.08)',
                                                                                color: '#800020',
                                                                                border: '1px solid rgba(128, 0, 32, 0.2)',
                                                                                height: '22px'
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Box>

                                                                {/* BADGES MARQUES */}
                                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                                                    {r.reseau_nom && r.reseau_nom.split('/').map((brandName, idx) => {
                                                                        const bUpper = brandName.trim().toUpperCase();
                                                                        // Logic for combined brands like in TabsCspd
                                                                        if (bUpper.includes('OZKA') && (bUpper.includes('STARMAXX') || bUpper.includes('PULMOX'))) {
                                                                            const isStar = bUpper.includes('STARMAXX');
                                                                            const color2 = isStar ? '#075dab' : '#ea0029';
                                                                            return (
                                                                                <Box key={idx} sx={{ display: 'inline-flex', px: 1, height: '22px', borderRadius: '4px', border: `1px solid ${color2}40`, gap: 0.8, alignItems: 'center' }}>
                                                                                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#fbc02d' }}>OZKA</Typography>
                                                                                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: color2 }}>{isStar ? 'STARMAXX' : 'PULMOX'}</Typography>
                                                                                </Box>
                                                                            );
                                                                        }
                                                                        let bCol = bUpper.includes('PULMOX') ? '#ea0029' : bUpper.includes('STARMAXX') ? '#075dab' : bUpper.includes('OTANI') ? '#204389' : bUpper.includes('OZKA') ? '#fbc02d' : '#3f51b5';
                                                                        return (
                                                                            <Chip
                                                                                key={idx}
                                                                                label={bUpper}
                                                                                size="small"
                                                                                sx={{
                                                                                    fontSize: '0.65rem',
                                                                                    fontWeight: 800,
                                                                                    color: bCol,
                                                                                    border: `1px solid ${bCol}40`,
                                                                                    bgcolor: 'white',
                                                                                    height: '22px'
                                                                                }}
                                                                            />
                                                                        );
                                                                    })}
                                                                </Box>

                                                                {/* CONTACT INFO */}
                                                                <Stack spacing={2} sx={{ mb: 3, flexGrow: 1 }}>
                                                                    <Box
                                                                        component="a"
                                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.adress)}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        sx={{
                                                                            display: 'flex',
                                                                            gap: 1.5,
                                                                            alignItems: 'flex-start',
                                                                            p: 1.5,
                                                                            borderRadius: 2.5,
                                                                            bgcolor: '#f0f4ff',
                                                                            border: '1px solid',
                                                                            borderColor: 'primary.light',
                                                                            textDecoration: 'none',
                                                                            transition: 'all 0.2s ease',
                                                                            '&:hover': {
                                                                                bgcolor: '#e0eaff',
                                                                                borderColor: 'primary.main',
                                                                                transform: 'scale(1.01)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <LocationOnIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.2 }} />
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{ fontWeight: 700, color: '#1a237e', lineHeight: 1.4 }}
                                                                        >
                                                                            {r.adress}
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', px: 1 }}>
                                                                        <PhoneIcon sx={{ color: 'success.main', fontSize: 18 }} />
                                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                                                                            {r.telephone}
                                                                        </Typography>
                                                                    </Box>
                                                                </Stack>

                                                                {/* EVALUATIONS */}
                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1.5, bgcolor: '#f8fafc', position: 'relative', minHeight: '70px', borderRadius: 2, mb: 2 }}>
                                                                    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                                                        {[
                                                                            { val: 'Mauvais', icon: '😡' },
                                                                            { val: 'Neutre', icon: '😐' },
                                                                            { val: 'Fiable', icon: '😊' }
                                                                        ].map((item) => {
                                                                            const count = r[item.val] || 0;
                                                                            const isSelected = pendingVote[r.id] === item.val;
                                                                            const isStored = r.evaluationText === item.val;
                                                                            return (
                                                                                <Box
                                                                                    key={item.val}
                                                                                    onClick={() => setPendingVote({ ...pendingVote, [r.id]: item.val })}
                                                                                    sx={{
                                                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
                                                                                        transform: (isSelected || isStored) ? 'scale(1.3)' : 'scale(1)',
                                                                                        transition: 'all 0.2s'
                                                                                    }}
                                                                                >
                                                                                    <Typography sx={{ fontSize: '1.8rem' }}>{item.icon}</Typography>
                                                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>({count})</Typography>
                                                                                </Box>
                                                                            );
                                                                        })}
                                                                    </Box>
                                                                    {pendingVote[r.id] && (
                                                                        <Box sx={{ position: 'absolute', right: 5 }}>
                                                                            <IconButton onClick={() => handleVote(r.id, pendingVote[r.id])} sx={{ color: '#4caf50' }}>
                                                                                <CheckCircleIcon sx={{ fontSize: 28 }} />
                                                                            </IconButton>
                                                                        </Box>
                                                                    )}
                                                                </Box>

                                                                {/* STOCK */}
                                                                <Box sx={{ mb: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                                                        <Box component="span" sx={{ width: 7, height: 7, bgcolor: '#4caf50', borderRadius: '50%' }} />
                                                                        STOCK EN TEMPS RÉEL
                                                                    </Typography>
                                                                    <StockRevendeur clientCode={r.code_cli} brands={individualBrands} inv={investisseur === 'investisseur'} />
                                                                </Box>


                                                            </Box>
                                                        </Paper>
                                                    </Grid>
                                                );
                                            })}
                                    </Grid>
                                )}
                            </DialogContent>

                            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee', bgcolor: 'white' }}>
                                <Button onClick={() => setReseauOpen(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Fermer
                                </Button>
                            </DialogActions>
                        </Dialog>


                        <Dialog open={open} onClose={handleClose} fullWidth
                            maxWidth="md"
                            PaperProps={{
                                style: {
                                    height: '90vh',
                                    maxHeight: '900vh',
                                },
                            }}>
                            {/* <DialogTitle> Liste des collaborateurs</DialogTitle>
                            <DialogContent>
                                <TableContainer component={Paper} style={{ maxHeight: "700vh", overflowY: 'auto' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{
                                                    fontWeight: 'bold',
                                                    borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                                }}>Utilisateur</TableCell>

                                                <TableCell sx={{
                                                    fontWeight: 'bold',
                                                    borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                                }}>Login</TableCell>

                                                <TableCell sx={{
                                                    fontWeight: 'bold',
                                                    borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                                }}>Role</TableCell>

                                                <TableCell sx={{
                                                    fontWeight: 'bold',
                                                    borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                                }}>Email</TableCell>

                                                <TableCell sx={{
                                                    fontWeight: 'bold',
                                                    borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                                }}>Poste N°</TableCell>

                                                <TableCell sx={{
                                                    fontWeight: 'bold',
                                                    borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                                }}>Code software</TableCell>

                                                <TableCell sx={{
                                                    fontWeight: 'bold',
                                                    borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                                }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {users
                                                .filter((user) => user.ROLE === "collaborateur") // Add filter here
                                                .map((user) => {
                                                    const representative = repres.find((rep) => rep.NUM_REPRES === user.COMMERCIAL_OK);
                                                    return (
                                                        <TableRow key={user.ID_UTILISATEUR}>
                                                            <TableCell>{user.UTILISATEUR}</TableCell>
                                                            <TableCell>{user.LOGIN}</TableCell>
                                                            <TableCell>{user.ROLE}</TableCell>
                                                            <TableCell>{user.NUM_POSTE}</TableCell>
                                                            <TableCell>{user.CODE_SOFTWARE}</TableCell>
                                                            <TableCell>
                                                                <IconButton color="primary" onClick={() => handleAffectCollab(user)}>
                                                                    <img src={checkIcon} alt="check Icon" style={{ height: '24px', width: '24px', marginRight: '8px' }} />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </DialogContent> */}
                            <DialogActions>
                                <Button onClick={handleClose} color="primary">
                                    <img src={annulerIcon} alt="Annuler Icon" style={{ height: '24px', width: '24px', marginRight: '8px' }} />
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>

                    <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
                        <DialogTitle>
                            Choisir un client
                            <Button onClick={handleDialogClose} style={{ position: 'absolute', right: '8px', top: '8px' }}>
                                <CloseIcon />
                            </Button>
                        </DialogTitle>
                        <DialogContent>
                            <Box>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Rechercher"
                                    value={searchClient}
                                    onChange={handleSearchClientChange}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton>
                                                <SearchIcon />
                                            </IconButton>
                                        ),
                                    }}
                                />
                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Code Client</TableCell>
                                                <TableCell>Intitulé Client</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {clients.map((client) => (
                                                <TableRow
                                                    key={client.CODE_CLIENT}
                                                    hover
                                                    onClick={() => handleSelectClient(client)}
                                                    selected={selectedClient?.CODE_CLIENT === client.CODE_CLIENT}
                                                >
                                                    <TableCell>{client.CODE_CLIENT}</TableCell>
                                                    <TableCell>{client.INTITULE_CLIENT}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <TablePagination
                                        rowsPerPageOptions={[10, 25, 50, 100]}
                                        component="div"
                                        count={total}
                                        rowsPerPage={pageSize}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                </TableContainer>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleConfirmSelection}
                                disabled={!selectedClient}
                                sx={{ mt: 2 }}
                            >
                                Sélectionner
                            </Button>
                        </DialogActions>
                    </Dialog>
                    {
                        index === 0 && selectedOption === '0' && displayMode === 'card' && (
                            <CardPartenaires displayMode={displayMode} onCommunicationSelect={handleCommunicationSelect}
                                searchTerm={searchTerm} selectedAvancement={selectedAvancement} setTotalObj={(tp, nn) => {
                                    let obj = { ...tot }
                                    obj.typeCli = tp
                                    obj.nbr = nn
                                    setTot(obj)
                                }} />
                        )
                    }
                    {
                        index === 0 && selectedOption === '1' && (
                            <CardClientsPartenaires
                                searchTerm={searchTerm}
                                onClientCommunicationStart={handleClientCommunicationStart}
                            />
                        )
                    }


                    {
                        index === 1 && selectedOption === '1' && displayMode === 'card' && (
                            <CardInvestisseursCSPD displayMode={displayMode} />
                        )
                    }
                    {
                        index === 1 && selectedOption === '0' && displayMode === 'card' && (
                            <CardInvestisseur displayMode={displayMode} searchTerm={searchTerm} selectedAvancement={selectedAvancement} setTotalObj={(tp, nn) => {
                                let obj = { ...tot }
                                obj.typeCli = tp
                                obj.nbr = nn
                                setTot(obj)
                            }} />
                        )
                    }
                    {
                        index === 4 && selectedOption === '1' && displayMode === 'card' && (
                            <CardFamilleCSPD displayMode={displayMode} />
                        )
                    }
                    {
                        index === 4 && selectedOption === '0' && displayMode === 'card' && (
                            <CardFamille displayMode={displayMode} searchTerm={searchTerm} selectedAvancement={selectedAvancement} setTotalObj={(tp, nn) => {
                                let obj = { ...tot }
                                obj.typeCli = tp
                                obj.nbr = nn
                                setTot(obj)
                            }} />
                        )
                    }
                    {
                        index === 5 && selectedOption === '0' && displayMode === 'card' && (
                            <Savmanagement displayMode={displayMode} searchTerm={searchTerm} selectedAvancement={selectedAvancement} setTotalObj={(tp, nn) => {
                                let obj = { ...tot }
                                obj.typeCli = tp
                                obj.nbr = nn
                                setTot(obj)
                            }} />
                        )
                    }
                    {
                        index === 0 && selectedOption === '2' && (
                            <CommandesListPart base={"fdm"} type={"partenaire"} searchTerm={searchTerm} setAssigned={setAssignedList} />
                        )
                    }
                    {
                        index === 1 && selectedOption === '2' && (
                            <CommandesList base={"cspd"} type={"investisseur"} searchTerm={searchTerm} setAssigned={setAssignedList} />
                        )
                    }
                    {
                        index === 2 && selectedOption === '2' && (
                            <CommandesList base={"cspd"} type={"client"} searchTerm={searchTerm} setAssigned={setAssignedList} />
                        )
                    }
                    {
                        index === 3 && selectedOption === '2' && (
                            <CommandesListFDM base={"fdm"} type={"client"} searchTerm={searchTerm} setAssigned={setAssignedList} />
                        )
                    }
                    {
                        index === 4 && selectedOption === '2' && (
                            <CommandesList base={"fdm"} type={"famille"} searchTerm={searchTerm} setAssigned={(setAssigned) => setAssignedList(setAssigned)} />
                        )
                    }
                    {
                        index === 5 && selectedOption === '2' && (
                            <Savmanagement base={"fdm"} type={"SAV"} searchTerm={searchTerm} setAssigned={(setAssigned) => setAssignedList(setAssigned)} />
                        )
                    }

                    {
                        index === 2 && selectedOption === '1' && displayMode === 'card' && (
                            <CardClientsCSPD selectedClientType={"clientsCspd"} displayMode={displayMode} selectedTri={selectedTri} searchTerm={searchTerm} />
                        )
                    }

                    {
                        index === 3 && selectedOption === '1' && displayMode === 'card' && (
                            <CardClientsCSPD selectedClientType={"clientsFdm"} searchTerm={searchTerm} selectedTri={selectedTri} displayMode={displayMode} />
                        )
                    }



                    {
                        selectedOption === '3' && index === 0 && (
                            <Stock
                                searchTerm={searchTerm}
                                codeCli={selectedClient}
                                base={"fdm"}
                                type={"partenaire"}
                                enableClientSearch={true}
                            />
                        )
                    }

                    {
                        selectedOption === '3' && index === 2 && (
                            <Stock
                                searchTerm={searchTerm}
                                codeCli={selectedClient}
                                base={"cspd"}
                                type={"client"}
                                enableClientSearch={true}
                            />
                        )
                    }

                    {
                        selectedOption === '3' && index === 1 && (
                            <Stock
                                searchTerm={searchTerm}
                                codeCli={selectedClient}
                                base={"cspd"}
                                type={"client"}
                                enableClientSearch={true}
                            />
                        )
                    }
                </Box >
            )
            }
        </div >
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    setAssignedList: PropTypes.func.isRequired,
};

export default function BasicTabs({ searchTerm, setSearchTerm, selectedOption, setSelectedOption, value, setValue, tot, setAssignedList, disableStock, onCommunicationSelect, onClientCommunicationStart }) {
    const [numberCli, setNumberCli] = useState([])
    const handleChange = (newValue) => {
        setValue(newValue)
    };

    return (
        <Box sx={{ width: "100%" }}>
            {/* ================= TABS HEADER ================= */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={value}
                    onChange={(e, newValue) => handleChange(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Partenaires" {...a11yProps(0)} />
                    <Tab label="Demande Achat" {...a11yProps(1)} />
                    <Tab label="Renseignement Commercial" {...a11yProps(2)} />
                    <Tab label="Journal Commercial" {...a11yProps(3)} />
                    <Tab label="Visite Clients" {...a11yProps(4)} />
                    <Tab label="Réclamations" {...a11yProps(5)} />
                    <Tab label="SOS" {...a11yProps(6)} />
                    <Tab label="SAV" {...a11yProps(7)} />
                    <Tab label="Employee Requests" {...a11yProps(8)} />
                    <Tab label="Mes Alertes" {...a11yProps(9)} />
                    <Tab label="Ordre Administration" {...a11yProps(10)} />
                </Tabs>
            </Box>

            {/* ================= TAB 0 : PARTENAIRES (SPECIAL FLOW) ================= */}
            {value === 0 && (
                <CustomTabPanel
                    value={value}
                    index={0}
                    onCommunicationSelect={onCommunicationSelect}
                    onClientCommunicationStart={onClientCommunicationStart}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    disableStock={disableStock}
                    setNumber={(TypeCl, num) => {
                        let newArray = [...numberCli];
                        let obj = newArray.find((a) => a.typeCli === TypeCl);

                        if (!obj) {
                            newArray.push({ typeCli: TypeCl, Nbr: num });
                        } else {
                            newArray = newArray.map((a) =>
                                a.typeCli === TypeCl ? { ...a, Nbr: num } : a
                            );
                        }
                        setNumberCli(newArray);
                    }}
                />
            )}

            {/* ================= OTHER TABS (NORMAL PAGES) ================= */}
            {value === 1 && <DemandeAchat />}
            {value === 2 && <RenseignementCommercials />}
            {value === 3 && <JournalCommercial />}
            {value === 4 && <VisiteClients />}
            {value === 5 && <ReclamationsList />}
            {value === 6 && <SOSList />}
            {value === 7 && <Savmanagement />}
            {value === 8 && <EmployeeRequests />}
            {value === 9 && <MesAlert />}
            {value === 10 && <OrdreAdministration />}
        </Box>
    );

}
function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}
