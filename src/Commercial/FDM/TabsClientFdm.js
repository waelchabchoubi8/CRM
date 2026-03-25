// TabsClientFdm.js
import * as React from 'react';
import { Select, MenuItem } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import Collapse from '@mui/material/Collapse';
import { useState, useEffect, memo, useMemo } from 'react';
import bouton1 from '../../images/bouton1.png';
import PropTypes from 'prop-types';
import {
    List,
    ListItem,
    ListItemText
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import reseauNaLogo from '../../images/bouton1.png'
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CommandesListFDM from './CommandesEncoursFDM'
import Button from '@mui/material/Button';
import CardClientsCSPD from '../CSPD/CardClientCSPD';
import SearchIcon from '@mui/icons-material/Search';
import { useSelector } from 'react-redux';
import EmployeeRequests from "../../RhDepartement/EmployeeReqTabs";
import DemandeAchat from "../DemandeAchat";
import Savmanagement from "../../Sav/Savmanagement";
import RenseignementCommercial from "../RenseignementCommercial";
import ReclamationsList from "../../Sav/ReclamationsList";
import SOSList from "../../Sav/SOSList";
import JournalCommercial from "../JournalCommercial";
import VisiteClients from "../VisiteClients";
import MesAlert from "../alert"
import OrdreAdministration from "../../Adminstration/OrdreAdministration";
import { Divider, Stack } from '@mui/material';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

import {
    TextField,
    IconButton,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Paper,
    TableContainer,
    InputAdornment,
    Alert,
    Tooltip
} from '@mui/material';
import Stock from '../Stock'
import BASE_URL from '../../Utilis/constantes';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import annulerIcon from '../../icons/annuler.png'
import checkIcon from '../../icons/check.png'
import ClientsIcon from '../../icons/addClient.png'
import PreviewIcon from '@mui/icons-material/Preview';

// Moved outside to prevent re-creation on every render
const StockRevendeur = memo(({ clientCode, brands, inv }) => {
    const [stocks, setStocks] = useState({});
    const [loading, setLoading] = useState(false);



    // Memoize brands string to avoid unnecessary effect triggers
    const brandsString = useMemo(() => {
        return Array.isArray(brands) ? [...brands].sort().join(',') : '';
    }, [brands]);

    useEffect(() => {
        if (!clientCode || !brandsString) return;

        const controller = new AbortController();
        const signal = controller.signal; // Get signal from controller

        const fetchStock = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${BASE_URL}/api/getSoldeeByInv`, {
                    params: { clientCode, marks: brandsString, ...(inv ? { type: 'inv' } : {}) },
                    signal: signal // Pass signal to axios
                });

                // No need for isMounted check with AbortController, 
                // but keeping safe state update check is good practice
                if (!signal.aborted) {
                    setStocks(res.data?.data || {});
                }
            } catch (err) {
                if (axios.isCancel(err)) {
                    console.log('Request canceled', err.message);
                } else {
                    console.error("Erreur API Stock:", err);
                }
            } finally {
                if (!signal.aborted) setLoading(false);
            }
        };

        fetchStock();

        return () => {
            controller.abort(); // Cancel request on cleanup
        };
    }, [clientCode, brandsString, inv]);

    if (loading) return <LinearProgress sx={{ my: 1, height: 2, borderRadius: 1 }} />;

    const BRAND_COLORS = {
        'OZKA': '#fbc02d', 'STARMAXX': '#075dab', 'OTANI': '#204389',
        'PULMOX': '#ea0029', 'ZEETEX': '#000000',
    };

    return (
        <Stack spacing={1.5} sx={{ mt: 1 }}>
            {brands.map((brand) => {
                const bUpper = brand.toUpperCase();
                const qty = bUpper === 'ZEETEX'
                    ? (stocks['ZEETEX_ZI_CH'] || 0) + (stocks['ZEETEX_ZI_OI'] || 0)
                    : (stocks[bUpper] || 0);

                const brandColor = BRAND_COLORS[bUpper] || '#3f51b5';

                return (
                    <Box key={brand}>
                        <Box display="flex" justifyContent="space-between" mb={0.5} alignItems="center">
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: brandColor }}>
                                {bUpper}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#000000' }}>
                                {qty} PCS
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min((qty / 200) * 100, 100)}
                            sx={{
                                height: 6, borderRadius: 4, bgcolor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': { bgcolor: qty > 0 ? brandColor : '#e0e0e0' }
                            }}
                        />
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
    setNumber,
    onCommunicationSelect,
    resetSignal }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [open, setOpen] = useState(false);

    const [hasCommunicationData, setHasCommunicationData] = useState(false);
    const [adrFilter, setAdrFilter] = useState('');

    // Réseau dialog 
    const REGION_MAP = {
        Nord: ["Tunis", "Ariana", "Ben Arous", "Manouba", "Bizerte", "Nabeul", "Zaghouane", "Mateur"],
        "Nord Ouest": ["Beja", "Jendouba", "Kef", "Siliana", "Tabarka", "Ain Draham"],
        Centre: ["Gasserine", "Kairaouane", "Sidi Bouzid", "Bou Hajla", "Gafsa", "Ghebali", "Nafta"],
        "Ligne de Côte": ["Sousse", "Monastir", "Mahdia", "Msaken"],
        Sud: ["Sfax", "Gabes", "Mednine", "Zarzis", "Jerba", "Tataouine"]
    };

    // 🔹 States AFTER
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [cityList, setCityList] = useState(Object.values(REGION_MAP).flat());

    const [reseauOpen, setReseauOpen] = useState(false);
    const [reseaux, setReseaux] = useState([]);
    const [reseauList, setReseauList] = useState([]);
    const [selectedReseauId, setSelectedReseauId] = useState('');
    const [reseauLoading, setReseauLoading] = useState(false);
    const [reseauError, setReseauError] = useState('');
    const [investisseur, setInvestisseur] = React.useState('');



    const [users, setUsers] = useState([]);
    const [repres, setRepres] = useState([])
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [selectedAvancement, setSelectedAvancement] = React.useState('');
    const [selectedTri, setSelectedTri] = React.useState('');
    const [selectedRotation, setSelectedRotation] = React.useState('');
    const [selectedClient, setSelectedClient] = React.useState(null);
    const [selectedClientFdm, setSelectedClientFdm] = React.useState(null);

    const [clients, setClients] = useState([]);
    const [clientsFdm, setClientsFdm] = useState([]);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertDate, setAlertDate] = useState('');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertText, setAlertText] = useState('');
    const [alertLoading, setAlertLoading] = useState(false);
    const [alertError, setAlertError] = useState('');
    const [alertSuccess, setAlertSuccess] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const [isAnyDialogOpen, setIsAnyDialogOpen] = useState(false);
    const currentUser = useSelector((state) => state.user);


    const [alerts, setAlerts] = useState([]);
    const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
    const [expandedAlertId, setExpandedAlertId] = useState(null);

    const todayString = new Date().toISOString().split('T')[0];
    const tomorrowString = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    ).toISOString().split('T')[0];

    const [pendingVote, setPendingVote] = useState({});

    const [searchClient, setSearchClient] = useState('')
    const [assignedList, setAssignedList] = useState('')

    const [historicDialogOpen, setHistoricDialogOpen] = useState(false);
    const [historicData, setHistoricData] = useState([]);
    const [historicDate, setHistoricDate] = useState(new Date().toISOString().split('T')[0]);
    const [historicPage, setHistoricPage] = useState(0);
    const [historicPageSize, setHistoricPageSize] = useState(10);
    const [historicTotal, setHistoricTotal] = useState(0);

    //concurrents
    const [concurrentDialogOpen, setConcurrentDialogOpen] = useState(false);
    const [concurrents, setConcurrents] = useState([]);
    const [concurrentLoading, setConcurrentLoading] = useState(false);
    const [concurrentError, setConcurrentError] = useState(null);

    // onglets dans le dialog "Liste Rouge"
    const [concurrentTab, setConcurrentTab] = useState(0);
    // clients bloqués
    const [blockedClients, setBlockedClients] = useState([]);
    const [blockedLoading, setBlockedLoading] = useState(false);
    const [blockedError, setBlockedError] = useState(null);
    const [blockedPage, setBlockedPage] = useState(0);
    const [blockedPageSize, setBlockedPageSize] = useState(10);
    const [blockedTotal, setBlockedTotal] = useState(0);
    const [blockedSearch, setBlockedSearch] = useState('');

    const fetchConcurrents = async (signal) => {
        setConcurrentLoading(true);

        try {
            const res = await axios.get(`${BASE_URL}/api/concurrents`, {
                signal: signal
            });

            if (!signal.aborted) {
                setConcurrents(res.data?.data || []);
            }

        } catch (err) {
            if (axios.isCancel(err)) {
                console.log('Request canceled', err.message);
            } else {
                console.error("Erreur API Concurrents:", err);
                if (!signal.aborted) {
                    setConcurrentError("Erreur lors du chargement");
                }
            }
        } finally {
            if (!signal.aborted) {
                setConcurrentLoading(false);
            }
        }
    };

    const fetchBlockedClients = async (signal, page = blockedPage, pageSize = blockedPageSize, search = blockedSearch) => {
        setBlockedLoading(true);

        try {
            const res = await axios.get(`${BASE_URL}/api/clients-bloques`, {
                signal,
                params: {
                    page,
                    pageSize,
                    searchTerm: search || undefined
                }
            });

            if (!signal.aborted) {
                setBlockedClients(res.data?.data || []);
                if (typeof res.data?.total === 'number') {
                    setBlockedTotal(res.data.total);
                }
            }

        } catch (err) {
            if (axios.isCancel(err)) {
                console.log('Request canceled', err.message);
            } else {
                console.error("Erreur API Clients bloqués:", err);
                if (!signal.aborted) {
                    setBlockedError("Erreur lors du chargement des clients bloqués");
                }
            }
        } finally {
            if (!signal.aborted) {
                setBlockedLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!concurrentDialogOpen || concurrentTab !== 0) return;

        const controller = new AbortController();
        const signal = controller.signal;

        fetchConcurrents(signal);

        return () => {
            controller.abort();
        };
    }, [concurrentDialogOpen, concurrentTab]);

    useEffect(() => {
        if (!concurrentDialogOpen || concurrentTab !== 1) return;

        const controller = new AbortController();
        const signal = controller.signal;

        fetchBlockedClients(signal, blockedPage, blockedPageSize, blockedSearch);

        return () => {
            controller.abort();
        };
    }, [concurrentDialogOpen, concurrentTab, blockedPage, blockedPageSize, blockedSearch]);
    const handleOpenConcurrentDialog = () => {
        setConcurrentDialogOpen(true);
    };

    const handleCloseConcurrentDialog = () => {
        setConcurrentDialogOpen(false);
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
        setNumber(tot.typeCli, tot.nbr)
    }, [tot])
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenReseauDialog = async () => {
        setReseauOpen(true);
        setIsAnyDialogOpen(true);

        // Utiliser la nouvelle fonction qui charge tout (revendeurs + évaluations)
        await fetchReseauxWithEvaluations();

        // Charger aussi la liste des réseaux (marques/filtres) si nécessaire
        // Note: fetchReseauxWithEvaluations s'occupe de 'reseaux' (la liste affichée)
        try {
            const reseauxRes = await axios.get(`${BASE_URL}/api/reseaux`);
            setReseauList(reseauxRes.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleVote = async (revendeurId, note) => {
        if (!currentUser?.ID_UTILISATEUR) return;
        const vraiNom = currentUser.UTILISATEUR || "Utilisateur";

        try {
            const payload = { idRevendeur: revendeurId, rate: note, userName: vraiNom };
            await axios.post(`${BASE_URL}/api/evaluation-reseau`, payload);

            // On récupère les nouveaux totaux tout de suite après le vote
            const resEval = await axios.get(`${BASE_URL}/api/evaluation-reseau?idRevendeur=${revendeurId}`);

            setReseaux(prev => prev.map(item =>
                item.id === revendeurId
                    ? { ...item, ...resEval.data, evaluationText: note }
                    : item
            ));

            setPendingVote(prev => {
                const newState = { ...prev };
                delete newState[revendeurId]; // On efface le bouton vert après succès
                return newState;
            });
        } catch (err) {
            console.error("Erreur vote:", err);
        }
    };

    const fetchReseauxWithEvaluations = async () => {
        setReseauLoading(true);
        setReseauError('');
        try {
            // 1. Récupérer la liste des revendeurs
            const res = await axios.get(`${BASE_URL}/api/revendeurs`);
            const listeInitiale = Array.isArray(res.data) ? res.data : (res.data.data || []);

            // 2. Récupérer les notes pour CHAQUE revendeur
            const updatedData = await Promise.all(
                listeInitiale.map(async (r) => {
                    try {
                        const evalRes = await axios.get(`${BASE_URL}/api/evaluation-reseau?idRevendeur=${r.id}`);
                        // On fusionne les infos du revendeur avec les compteurs (Mauvais, Neutre, Fiable)
                        return { ...r, ...evalRes.data };
                    } catch (err) {
                        return r; // En cas d'erreur, on garde le revendeur tel quel
                    }
                })
            );

            setReseaux(updatedData);
        } catch (error) {
            console.error("Erreur chargement:", error);
            setReseauError("Impossible de charger les données");
        } finally {
            setReseauLoading(false);
        }
    };
    // 🔔 Alertes – ouverture / fermeture lecture
    const handleAlertIconClick = () => {
        setAlertsDialogOpen(true);
    };

    const handleCloseAlertsDialog = () => {
        setAlertsDialogOpen(false);
        setExpandedAlertId(null);
    };


    const handleCloseReseauDialog = () => {
        setReseauOpen(false);
        setIsAnyDialogOpen(false);
    };

    const handleReseauFilterChange = async (e) => {
        const reseauId = e.target.value;
        setSelectedReseauId(reseauId);
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

        const intervalId = setInterval(() => {
            fetchAlerts();
        }, 1 * 60 * 1000);

        return () => clearInterval(intervalId);

    }, [currentUser?.ID_UTILISATEUR]);



    const handleRegionChange = async (e) => {
        const region = e.target.value;
        setSelectedRegion(region);
        setSelectedCity('');
        setReseauLoading(true);
        setReseauError('');

        try {
            const params = {};
            if (selectedReseauId) params.id_reseau = selectedReseauId;
            if (region) params.regions = REGION_MAP[region];

            const res = await axios.get(`${BASE_URL}/api/revendeurs`, { params });
            setReseaux(res.data?.data || []);
        } finally {
            setReseauLoading(false);
        }
    };


    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
        setSearchTerm('');
    };
    const handleCommunicationFromCard = (data) => {
        console.log('🟡 TabsClientFdm → received communication:', data);

        setHasCommunicationData(true);     // 🔓 enable Etat de stock
        onCommunicationSelect?.(data);     // 🔁 forward to CommunicationPageFDM
    };


    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);

    };

    const handleOpenAlertDialog = () => {
        setAlertOpen(true);
        setAlertError('');
        setAlertSuccess('');
        setIsAnyDialogOpen(true);

    };
    useEffect(() => {
        // 🔴 FULL RESET AFTER SAVE
        setHasCommunicationData(false); // disable Etat de stock
        setSelectedOption('1');         // force Clients
    }, [resetSignal]);


    const handleCloseAlertDialog = () => {
        setAlertOpen(false);
        setAlertDate('');
        setAlertTitle('');
        setAlertText('');
        setAlertError('');
        setAlertSuccess('');
        setIsAnyDialogOpen(false);

    };
    const handleSubmitAlert = async () => {
        if (!alertDate || !alertTitle || !alertText) {
            setAlertError('Tous les champs sont obligatoires');
            return;
        }

        if (!currentUser || !currentUser.ID_UTILISATEUR) {
            setAlertError("Utilisateur courant introuvable (ID_UTILISATEUR manquant)");
            return;
        }

        try {
            setAlertLoading(true);
            setAlertError('');
            setAlertSuccess('');

            const payload = {
                USER_ID: currentUser.ID_UTILISATEUR,
                TITRE: alertTitle,
                TEXT_ALERT: alertText,
                DATE_ALERT: alertDate,
            };

            await axios.post(`${BASE_URL}/api/alerts`, payload);

            setAlertSuccess('Alerte enregistrée avec succès');
            setTimeout(() => {
                handleCloseAlertDialog();
            }, 800);
        } catch (error) {
            console.error('Erreur POST /api/alerts :', error);
            setAlertError("Erreur lors de l'enregistrement de l'alerte");
        } finally {
            setAlertLoading(false);
        }
    };
    const getSearchPlaceholder = () => {
        switch (selectedOption) {
            case '1': // Clients
                return "client: Nom / Numero";
            case '2': // Commandes en cours
                return "Num commande / Nom client";
            case '3': // Etat de stock
                return "Dimension";
            default:
                return "Rechercher";
        }
    };



    {/*const renderSearchInputs = (
    <div style={{marginLeft:'20px', marginTop:'-5PX'}}> 
       <LocalizationProvider dateAdapter={AdapterDayjs} >
      <DemoContainer components={['DatePicker']}>
      <DatePicker 
        label="Sélectionner une date"
        value={selectedDate}
        onChange={handleDateChange}
        renderInput={(params) => <TextField {...params} sx={{ width: '300px' }} />}
      /> 
      </DemoContainer>
    </LocalizationProvider>
    </div>
  );*/}
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
    const handleDialogOpen = () => setDialogOpen(true);
    const handleDialogClose = () => setDialogOpen(false);
    const handleSearchClientChange = (event) => {
        setSearchClient(event.target.value);
        setPage(0);
    };
    const handleSelectClient = (client) => {
        setSelectedClient(client.CODE_CLIENT);
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
    useEffect(() => {
        if (!hasCommunicationData) {
            setSelectedOption('1');
        }
    }, [hasCommunicationData]);


    const renderSearchInput = (
        <TextField
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

    );
    const rendersearchPay =
        selectedOption === '1' ? (
            <Select
                value={adrFilter}
                onChange={(e) => setAdrFilter(e.target.value)}
                displayEmpty
                sx={{ width: "300px" }}
            >
                <MenuItem value="">
                    <em>Toutes les régions</em>
                </MenuItem>

                {/* Nord */}
                <MenuItem value="Tunis">Tunis</MenuItem>
                <MenuItem value="Ariana">Ariana</MenuItem>
                <MenuItem value="Ben Arous">Ben Arous</MenuItem>
                <MenuItem value="Manouba">Manouba</MenuItem>
                <MenuItem value="Bizerte">Bizerte</MenuItem>
                <MenuItem value="Beja">Beja</MenuItem>
                <MenuItem value="Jendouba">Jendouba</MenuItem>
                <MenuItem value="Kef">Kef</MenuItem>
                <MenuItem value="Siliana">Siliana</MenuItem>
                <MenuItem value="Zaghouan">Zaghouan</MenuItem>

                {/* Centre */}
                <MenuItem value="Nabeul">Nabeul</MenuItem>
                <MenuItem value="Sousse">Sousse</MenuItem>
                <MenuItem value="Monastir">Monastir</MenuItem>
                <MenuItem value="Mahdia">Mahdia</MenuItem>
                <MenuItem value="Sfax">Sfax</MenuItem>
                <MenuItem value="Kairouan">Kairouan</MenuItem>
                <MenuItem value="Kasserine">Kasserine</MenuItem>
                <MenuItem value="Sidi Bouzid">Sidi Bouzid</MenuItem>

                {/* Sud */}
                <MenuItem value="Gabes">Gabes</MenuItem>
                <MenuItem value="Mednine">Mednine</MenuItem>
                <MenuItem value="Tataouine">Tataouine</MenuItem>
                <MenuItem value="Gafsa">Gafsa</MenuItem>
                <MenuItem value="Tozeur">Tozeur</MenuItem>
                <MenuItem value="Kebili">Kebili</MenuItem>
            </Select>
        ) : null;




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
            sx={{ width: "300px" }}
        />


    ) : null;
    const renderSelectClImageFdm = (index === 0 && selectedOption === '3') || (index == 3 && selectedOption === '2') ? (
        <TextField
            fullWidth
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            placeholder="Rechercher "
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton>
                            <SearchIcon />
                        </IconButton>
                    </InputAdornment>
                )
            }}
            variant="outlined"
            sx={{ width: "300px" }}
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


    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {/* Header Paper */}
                    {/* Main Filter Paper */}
                    <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                                <RadioGroup
                                    row
                                    aria-labelledby="demo-row-radio-buttons-group-label"
                                    name="row-radio-buttons-group"
                                    value={selectedOption}
                                    onChange={handleOptionChange}
                                >
                                    {(index === 0 || index === 1) && (
                                        <>
                                            <FormControlLabel value="1" control={<Radio />} label="Clients" />
                                            <FormControlLabel value="2" control={<Radio />} label="Commandes en cours" />
                                            <FormControlLabel
                                                value="3"
                                                control={<Radio />}
                                                label="Etat de stock"
                                                disabled={!hasCommunicationData}
                                            />
                                        </>
                                    )}
                                    {(index === 2 || index === 3) && (
                                        <>
                                            <FormControlLabel value="1" control={<Radio />} label="Clients" />
                                            <FormControlLabel value="2" control={<Radio />} label="Commandes en cours" />
                                            <FormControlLabel
                                                value="3"
                                                control={<Radio />}
                                                label="Etat de stock"
                                                disabled={!hasCommunicationData}
                                            />
                                        </>
                                    )}
                                    {(index === 4) && (
                                        <FormControlLabel value="1" control={<Radio />} label="Enregistrés" />
                                    )}
                                </RadioGroup>
                            </Box>
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
                        </Box>
                    </Paper>

                    {/* Actions Paper */}
                    <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {renderSearchInput}
                                {rendersearchPay}
                                <Divider orientation="vertical" flexItem sx={{ mx: 1.5, my: 0.5 }} />
                                {renderSelectClImage}
                                {renderSelectClImageFdm}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
                                {(currentUser?.ROLE === "administrateur" || currentUser?.ROLE === "directeur commercial ") && (
                                    <IconButton
                                        color="primary"
                                        onClick={() => {
                                            const today = new Date().toISOString().split('T')[0];
                                            setHistoricDate(today);
                                            setHistoricPage(0);
                                            setHistoricDialogOpen(true);
                                            fetchHistoricCommands(today, 0, historicPageSize);
                                        }}
                                        sx={{ fontSize: 32 }}
                                    >
                                        <PreviewIcon fontSize="inherit" />
                                    </IconButton>
                                )}

                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleOpenAlertDialog}
                                    size="small"
                                    sx={{ minWidth: '130px', fontSize: '0.875rem', textTransform: 'none' }}
                                >
                                    Alerter moi
                                </Button>

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
                                            minWidth: 280,
                                            height: 36,
                                            fontWeight: 700,
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

                            {/* Dialogs */}
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
                                                    backgroundColor: '#bbb5b5ff', // Un gris léger et standard MUI
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
                                            {/* Contenu onglet 1 : Liste Rouge */}
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
                                                                    <IconButton size="small">
                                                                        <SearchIcon fontSize="small" />
                                                                    </IconButton>
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
                                            Fermer
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
                                                        setExpandedAlertId(isCurrentlyExpanded ? null : alert.ID_ALERT);
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

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {alert.TITRE}
                                                        </Typography>

                                                        {alert.ENVOIYEUR === 'CRM' && (
                                                            <Box
                                                                sx={{
                                                                    backgroundColor: '#2e7d32',
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

                                <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md"
                                    PaperProps={{ style: { height: '90vh', maxHeight: '900vh' } }}>
                                    <DialogTitle> Liste des collaborateurs</DialogTitle>
                                    <DialogContent>
                                        <TableContainer component={Paper} style={{ maxHeight: "700vh", overflowY: 'auto' }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Utilisateur</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Login</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Role</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Email</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Poste N°</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Code software</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {users
                                                        .filter((user) => user.ROLE === "collaborateur")
                                                        .map((user) => (
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
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleClose} color="primary">
                                            <img src={annulerIcon} alt="Annuler Icon" style={{ height: '24px', width: '24px', marginRight: '8px' }} />
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </div>
                        </Box>
                    </Paper>

                    {/* Content Paper */}
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
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
                        <Dialog open={alertOpen} onClose={handleCloseAlertDialog} maxWidth="sm" fullWidth>
                            <DialogTitle>
                                Créer une alerte
                                <Button
                                    onClick={handleCloseAlertDialog}
                                    style={{ position: 'absolute', right: '8px', top: '8px' }}
                                >
                                    <CloseIcon />
                                </Button>
                            </DialogTitle>

                            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>



                                <TextField
                                    label="Titre"
                                    value={alertTitle}
                                    onChange={(e) => setAlertTitle(e.target.value)}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Date d'alerte"
                                    type="date"
                                    value={alertDate}
                                    onChange={(e) => setAlertDate(e.target.value)}
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: today }}
                                    sx={{
                                        '& input': {
                                            paddingTop: '14px',
                                            paddingBottom: '14px',
                                        }
                                    }}
                                />

                                <TextField
                                    label="Texte de l'alerte"
                                    value={alertText}
                                    onChange={(e) => setAlertText(e.target.value)}
                                    fullWidth
                                    required
                                    multiline
                                    minRows={4}
                                />

                                {alertError && (
                                    <Box sx={{ color: 'error.main', fontSize: 14 }}>
                                        {alertError}
                                    </Box>
                                )}
                                {alertSuccess && (
                                    <Box sx={{ color: 'success.main', fontSize: 14 }}>
                                        {alertSuccess}
                                    </Box>
                                )}

                            </DialogContent>

                            <DialogActions
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    padding: '16px'
                                }}
                            >
                                <Button onClick={handleCloseAlertDialog}>Annuler</Button>

                                <Button
                                    variant="contained"
                                    onClick={handleSubmitAlert}
                                    disabled={alertLoading}
                                >
                                    {alertLoading ? 'Envoi…' : 'Enregistrer'}
                                </Button>
                            </DialogActions>
                        </Dialog>




                        {index === 0 && selectedOption === '2' && (
                            <CommandesListFDM base={"fdm"} type={"client"} searchTerm={searchTerm} setAssigned={setAssignedList} />
                        )}


                        {index === 0 && selectedOption === '1' && displayMode === 'card' && (
                            <CardClientsCSPD adr={adrFilter} selectedClientType={"clientsFdm"} searchTerm={searchTerm} selectedTri={selectedTri} displayMode={displayMode} onCommunicationSelect={handleCommunicationFromCard} />
                        )}

                        {selectedOption === '3' && index === 0 && (
                            <Stock
                                searchTerm={searchTerm}
                                codeCli={selectedClient}
                                base={"fdm"}
                                type={"client"}
                                enableClientSearch={true} // Add this prop
                            />
                        )}

                        {selectedOption === '3' && index === 5 && (
                            <Stock
                                searchTerm={searchTerm}
                                codeCli={selectedClient}
                                base={"fdm"}
                                type={"partenaire"}
                                enableClientSearch={true}
                            />
                        )}
                    </Paper>

                    <Dialog
                        open={reseauOpen}
                        onClose={handleCloseReseauDialog}
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
                        <DialogTitle sx={{ p: 3, pb: 0 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h5" fontWeight={800} sx={{ color: '#1a4e7eff', letterSpacing: '-0.5px' }}>
                                    Réseau des revendeurs
                                </Typography>
                                <IconButton onClick={handleCloseReseauDialog} size="small" sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f5f5f5' } }}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            {/* FILTRES */}
                            <Box sx={{ p: 2, borderRadius: 4, backgroundColor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                                <Select value={selectedReseauId} onChange={handleReseauFilterChange} displayEmpty size="small" sx={{ minWidth: 200, borderRadius: 2 }}>
                                    <MenuItem value=""><em>Toutes les marques</em></MenuItem>
                                    {reseauList.map((r) => <MenuItem key={r.id} value={r.id}>{r.nom_marque}</MenuItem>)}
                                </Select>

                                <Select value={selectedRegion} onChange={(e) => {
                                    const region = e.target.value;
                                    setSelectedRegion(region);
                                    setSelectedCity('');
                                    setCityList(region ? REGION_MAP[region] || [] : Object.values(REGION_MAP).flat());
                                }} displayEmpty size="small" sx={{ minWidth: 180, borderRadius: 2 }}>
                                    <MenuItem value=""><em>Toutes les régions</em></MenuItem>
                                    {Object.keys(REGION_MAP).map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                                </Select>

                                <Select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} displayEmpty size="small" sx={{ minWidth: 180, borderRadius: 2 }}>
                                    <MenuItem value=""><em>Toutes les villes</em></MenuItem>
                                    {cityList.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </Select>

                                <RadioGroup row value={investisseur} onChange={(e) => setInvestisseur(e.target.value)} sx={{ ml: 'auto' }}>
                                    <FormControlLabel value="" control={<Radio size="small" />} label="Tous" />
                                    <FormControlLabel value="investisseur" control={<Radio size="small" />} label="Investisseurs" />
                                </RadioGroup>
                            </Box>
                        </DialogTitle>
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
                                            const individualBrands = r.reseau_nom
                                                ? Array.from(new Set(r.reseau_nom.split(/[\/\s]+/).map(b => b.trim().toUpperCase()).filter(b => b !== "")))
                                                : [];

                                            return (
                                                <Grid item xs={12} sm={6} md={4} lg={3} key={r.id}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            height: '100%',
                                                            borderRadius: 4,
                                                            border: '1px solid #e0e4ec',
                                                            backgroundColor: 'white',
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }
                                                        }}
                                                    >
                                                        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                            {/* NOM & INV */}
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a237e' }}>
                                                                    {r.name}
                                                                </Typography>
                                                                {r.inv_reseau && (
                                                                    <Chip label="INV" size="small" sx={{ fontWeight: 900, bgcolor: 'rgba(128, 0, 32, 0.08)', color: '#800020' }} />
                                                                )}
                                                            </Box>

                                                            {/* BADGES */}
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                                                {r.reseau_nom && r.reseau_nom.split('/').map((brandName, idx) => (
                                                                    <Chip key={idx} label={brandName.trim()} size="small" sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#3f51b5', border: '1px solid rgba(63, 81, 181, 0.1)', bgcolor: 'rgba(63, 81, 181, 0.08)' }} />
                                                                ))}
                                                            </Box>

                                                            {/* CONTACT */}
                                                            <Stack spacing={2} sx={{ mb: 3, flexGrow: 1 }}>
                                                                <Box component="a" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.adress)}`} target="_blank" sx={{ display: 'flex', gap: 1.5, p: 1.5, borderRadius: 2.5, bgcolor: '#f0f4ff', textDecoration: 'none' }}>
                                                                    <LocationOnIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a237e' }}>{r.adress}</Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                                                    <PhoneIcon sx={{ color: 'success.main', fontSize: 18 }} />
                                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.telephone}</Typography>
                                                                </Box>
                                                            </Stack>

                                                            {/* ÉVALUATION */}
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
                                                                                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transform: (isSelected || isStored) ? 'scale(1.3)' : 'scale(1)', transition: 'all 0.2s' }}
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
                                                            <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f0f0f0' }}>
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
                            <Button onClick={handleCloseReseauDialog} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Fermer
                            </Button>
                        </DialogActions>
                    </Dialog>

                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    setAssignedList: PropTypes.func.isRequired,
};

export default function BasicTabs({ searchTerm, setSearchTerm, selectedOption, setSelectedOption, value, setValue, tot, setAssignedList, onCommunicationSelect, resetSignal, currentTab,
    onTabChange }) {
    const [numberCli, setNumberCli] = useState([])
    const [tabValue, setTabValue] = useState(currentTab ?? value ?? 0);
    useEffect(() => {
        if (typeof currentTab === "number" && currentTab !== tabValue) {
            setTabValue(currentTab);
        }
    }, [currentTab]);

    // keep syncing with old `value` if you still pass it
    useEffect(() => {
        if (typeof value === "number" && value !== tabValue) {
            setTabValue(value);
        }
    }, [value]);
    const handleChange = (event, newValue) => {
        setTabValue(newValue);
        onTabChange?.(newValue);
        setValue?.(newValue);
    };


    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleChange} aria-label="FDM Tabs">
                    <Tab label="Clients FDM" />
                    <Tab label="Demandes d'achat" />
                    <Tab label="Renseignements" />
                    <Tab label="Journal" />
                    <Tab label="Visites clients" />
                    <Tab label="Réclamations APP" />
                    <Tab label="SOS" />
                    <Tab label="SAV Management" />
                    <Tab label="Demandes et Reclamation" />
                    <Tab label="Mes alertes" />
                    <Tab label="Ordres administration" />
                </Tabs>

            </Box>


            <CustomTabPanel
                value={tabValue}
                index={0}
                setAssignedList={setAssignedList}
                onCommunicationSelect={onCommunicationSelect}
                resetSignal={resetSignal}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                setNumber={(TypeCl, num) => {
                    let newArray = [...numberCli]
                    let editArray = []

                    let obj = newArray.filter((a) => a.typeCli == TypeCl)

                    if (obj.length == 0) {
                        newArray.push({ typeCli: TypeCl, Nbr: num })
                    } else {
                        editArray = [...numberCli.filter((a) => a.typeCli !== TypeCl)]
                        editArray.push({ typeCli: TypeCl, Nbr: num })
                        newArray = [...editArray]
                    }
                    setNumberCli(newArray)
                }} />
            {tabValue === 1 && <Box sx={{ p: 3 }}><DemandeAchat /></Box>}
            {tabValue === 2 && <Box sx={{ p: 3 }}><RenseignementCommercial /></Box>}
            {tabValue === 3 && <Box sx={{ p: 3 }}><JournalCommercial /></Box>}
            {tabValue === 4 && <Box sx={{ p: 3 }}><VisiteClients /></Box>}
            {tabValue === 5 && <Box sx={{ p: 3 }}><ReclamationsList /></Box>}
            {tabValue === 6 && <Box sx={{ p: 3 }}><SOSList /></Box>}
            {tabValue === 7 && <Box sx={{ p: 3 }}><Savmanagement /></Box>}
            {tabValue === 8 && <Box sx={{ p: 3 }}><EmployeeRequests /></Box>}
            {tabValue === 9 && <Box sx={{ p: 3 }}><MesAlert /></Box>}
            {tabValue === 10 && <Box sx={{ p: 3 }}><OrdreAdministration /></Box>}



        </Box>

    );
}
function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}
