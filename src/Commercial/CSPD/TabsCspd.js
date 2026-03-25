//TabsCspd.js (middle page)
import * as React from 'react';
import { useState, useEffect, memo, useMemo } from 'react';
import { Select, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Badge from '@mui/material/Badge';
import Collapse from '@mui/material/Collapse';
import {
  List,
  ListItem,
  ListItemText,


} from "@mui/material";
import Box from '@mui/material/Box';
import bouton1 from '../../images/bouton1.png';


import ContactSupportIcon from '@mui/icons-material/ContactSupport';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CommandesList from './CommandesEncours';
import Button from '@mui/material/Button';
import CardClientsCSPD from './CardClientCSPD';
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
import PreviewIcon from '@mui/icons-material/Preview';
import OrdreAdministration from "../../Adminstration/OrdreAdministration";
import {
  CircularProgress,
  TextField,
  IconButton,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Paper,
  TableContainer,
  FormControl,
  Chip,
  LinearProgress,
  Tooltip,
  Alert,

} from '@mui/material';

import Stock from '../Stock'
import Rating from '@mui/material/Rating';
import BASE_URL from '../../Utilis/constantes';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import annulerIcon from '../../icons/annuler.png'
import checkIcon from '../../icons/check.png'
import Reservation from '../CommandesReservation';
import { Divider, Stack } from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';



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

        if (bUpper === 'ZEETEX') {
          const qtyCh = stocks['ZEETEX_ZI_CH'] || 0;
          const qtyOi = stocks['ZEETEX_ZI_OI'] || 0;
          const brandColor = BRAND_COLORS['ZEETEX'] || '#000000';

          return (
            <React.Fragment key={brand}>
              {/* ZEETEX CHAMB */}
              <Box mb={1}>
                <Box display="flex" justifyContent="space-between" mb={0.5} alignItems="center">
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: brandColor }}>
                    ZEETEX CHAMBRE A AIR
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#000000' }}>
                    {qtyCh} PCS
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((qtyCh / 200) * 100, 100)}
                  sx={{
                    height: 6, borderRadius: 4, bgcolor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': { bgcolor: qtyCh > 0 ? brandColor : '#e0e0e0' }
                  }}
                />
              </Box>

              {/* ZEETEX OIL */}
              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5} alignItems="center">
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: brandColor }}>
                    ZEETEX OIL
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#000000' }}>
                    {qtyOi} PCS
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((qtyOi / 200) * 100, 100)}
                  sx={{
                    height: 6, borderRadius: 4, bgcolor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': { bgcolor: qtyOi > 0 ? brandColor : '#e0e0e0' }
                  }}
                />
              </Box>
            </React.Fragment>
          );
        }

        const qty = stocks[bUpper] || 0;
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
  onCommunicationSelect,
  setNumber,
  resetSignal }) {
  //reseau 
  const REGION_MAP = {
    Nord: ["Tunis", "Ariana", "Ben Arous", "Manouba", "Bizerte", "Nabeul", "Zaghouane", "Mateur"],
    "Nord Ouest": ["Beja", "Jendouba", "Kef", "Siliana", "Tabarka", "Ain Draham"],
    Centre: ["Gasserine", "Kairaouane", "Sidi Bouzid", "Bou Hajla", "Gafsa", "Ghebali", "Nafta"],
    "Ligne de Côte": ["Sousse", "Monastir", "Mahdia", "Msaken"],
    Sud: ["Sfax", "Gabes", "Mednine", "Zarzis", "Jerba", "Tataouine"]
  };
  const [cityList, setCityList] = useState(Object.values(REGION_MAP).flat());

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

  const [reseauOpen, setReseauOpen] = useState(false);
  const [reseaux, setReseaux] = useState([]);
  const getLastWord = (adress) => {
    if (!adress) return '';
    const parts = adress.trim().split(/\s|-/);
    return parts[parts.length - 1].toLowerCase();
  };


  const [alerts, setAlerts] = useState([]);
  const [expandedAlertId, setExpandedAlertId] = useState(null);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [allReseaux, setAllReseaux] = useState([]);
  const [reseauList, setReseauList] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  const [selectedReseauId, setSelectedReseauId] = useState('');
  const [reseauLoading, setReseauLoading] = useState(false);
  const [reseauError, setReseauError] = useState('');


  const [selectedDate, setSelectedDate] = useState(null);
  const [investisseur, setInvestisseur] = React.useState('');




  const [open, setOpen] = useState(false);
  const [hasCommunicationData, setHasCommunicationData] = useState(false);

  const [users, setUsers] = useState([]);
  const [repres, setRepres] = useState([])
  const [page, setPage] = useState(0);
  const [isAnyDialogOpen, setIsAnyDialogOpen] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedAvancement, setSelectedAvancement] = React.useState('');
  const [selectedTri, setSelectedTri] = React.useState('');
  const [selectedRotation, setSelectedRotation] = React.useState('');
  const [selectedClient, setSelectedClient] = React.useState(null);
  const [selectedClientFdm, setSelectedClientFdm] = React.useState(null);
  const [selectedOption, setSelectedOption] = useState('1');

  const [clients, setClients] = useState([]);
  const [clientsFdm, setClientsFdm] = useState([]);

  const [searchClient, setSearchClient] = useState('')
  const [assignedList, setAssignedList] = useState('')

  const currentUser = useSelector((state) => state.user);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertDate, setAlertDate] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertText, setAlertText] = useState('');
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertError, setAlertError] = useState('');
  const [alertSuccess, setAlertSuccess] = useState('');
  const [historicDialogOpen, setHistoricDialogOpen] = useState(false);
  const [historicData, setHistoricData] = useState([]);
  const [historicDate, setHistoricDate] = useState(new Date().toISOString().split('T')[0]);
  const [historicPage, setHistoricPage] = useState(0);
  const [historicPageSize, setHistoricPageSize] = useState(10);
  const [historicTotal, setHistoricTotal] = useState(0);
  const [adrFilter, setAdrFilter] = useState('');

  const [stockData, setStockData] = useState({});
  const [stockLoading, setStockLoading] = useState(false);



  useEffect(() => {
    if (!currentUser?.ID_UTILISATEUR) return;

    fetchAlerts();


    const intervalId = setInterval(() => {
      fetchAlerts();
    }, 1 * 60 * 1000);

    return () => clearInterval(intervalId);

  }, [currentUser?.ID_UTILISATEUR]);

  const handleOpenAlertDialog = () => {
    setAlertOpen(true);
    setAlertError('');
    setAlertSuccess('');
    setIsAnyDialogOpen(true);

  };

  const handleCloseAlertDialog = () => {
    setAlertOpen(false);
    setAlertDate('');
    setAlertTitle('');
    setAlertText('');
    setAlertError('');
    setAlertSuccess('');
    setIsAnyDialogOpen(false);

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

  const handleCommunicationFromCard = (data) => {
    setHasCommunicationData(true);

    onCommunicationSelect?.(data);
  };

  const todayDate = new Date();
  const today = todayDate.toISOString().split('T')[0];

  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const tomorrowString = tomorrowDate.toISOString().split("T")[0];



  const getSearchPlaceholder = () => {
    switch (selectedOption) {
      case '1': // Clients
        return "client: Nom / Numero";
      case '2': // Commandes en cours
        return "Num commande / Nom client";
      case '3': // Reservations
        return "Numéro réservation";
      case '4': // Etat de stock
        return "Dimension";
      default:
        return "Rechercher";
    }
  };

  const handleOpenConcurrentDialog = () => {
    setConcurrentDialogOpen(true);
  };

  const handleCloseConcurrentDialog = () => {
    setConcurrentDialogOpen(false);
    setConcurrentTab(0);
  };

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
    // Rafraîchir la liste des concurrents uniquement
    // quand le dialog est ouvert ET que l’onglet "Concurrents" est actif
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

  useEffect(() => {
    setSelectedOption('1');
  }, []);

  const [pendingVote, setPendingVote] = useState({});

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


  const customIcons = {
    1: { icon: '😡', label: 'Mauvais', color: '#f44336' },
    2: { icon: '😐', label: 'Neutre', color: '#ff9800' },
    3: { icon: '😊', label: 'Fiable', color: '#4caf50' },
  };

  // Fonction réutilisable pour charger les revendeurs ET leurs évaluations
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
      // Supposons que "allReseaux" doive aussi contenir les données enrichies
      setAllReseaux(updatedData);

    } catch (error) {
      console.error("Erreur chargement:", error);
      setReseauError("Impossible de charger les données");
    } finally {
      setReseauLoading(false);
    }
  };

  useEffect(() => {
    fetchReseauxWithEvaluations();
  }, []);



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
      if (selectedCity) params.city = selectedCity;

      const res = await axios.get(`${BASE_URL}/api/revendeurs`, { params });
      setReseaux(res.data?.data || []);
      setAllReseaux(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setReseauError("Erreur lors du filtrage par région/city");
    } finally {
      setReseauLoading(false);
    }
  };






  const handleDataUpdate = (typeAppel) => {
    setSelectedOption(typeAppel);
  };

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

  const handleReseauFilterChange = async (e) => {
    const reseauId = e.target.value;
    setSelectedReseauId(reseauId);
    setReseauLoading(true);
    setReseauError('');

    try {
      const params = {};

      if (reseauId) params.id_reseau = reseauId;
      if (selectedRegion) params.regions = REGION_MAP[selectedRegion];

      const res = await axios.get(`${BASE_URL}/api/revendeurs`, { params });

      setReseaux(res.data?.data || []);
      setAllReseaux(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setReseauError("Erreur lors du filtrage par réseau");
    } finally {
      setReseauLoading(false);
    }
  };






  const handleCloseReseauDialog = () => {
    setReseauOpen(false);
    setIsAnyDialogOpen(false);
  };


  const handleAlertIconClick = () => { setAlertsDialogOpen(true); }; const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const handleCloseAlertsDialog = () => { setAlertsDialogOpen(false); setExpandedAlertId(null); };
  const fetchAlerts = async () => {
    if (!currentUser?.ID_UTILISATEUR) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      const response = await axios.get(`${BASE_URL}/api/alerts`, {
        params: {
          USER_ID: currentUser.ID_UTILISATEUR,
          DATE_ALERT: today
        }
      });

      const data = response.data?.data || [];
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes :', error);
      setAlerts([]);
    }
  };
  useEffect(() => {
    if (currentUser?.ID_UTILISATEUR) {
      fetchAlerts();
    }
  }, [currentUser?.ID_UTILISATEUR]);


  const handleClickOpen = () => {
    setOpen(true);
    fetchUsers();
    setIsAnyDialogOpen(true);

  };
  const handleClose = () => {
    setOpen(false);
    setIsAnyDialogOpen(false);
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
  }, [page, pageSize, searchClient, selectedOption]);
  const fetchClients = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/clientsCspdSearch`, {
        params: {
          page,
          pageSize,
          searchTerm: searchClient,
        },
      });
      setClients(response.data.clients);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };
  useEffect(() => {
    fetchClientsFdm();
  }, [page, pageSize, searchClient, selectedOption]);


  const fetchClientsFdm = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/clientsFdmSearch`, {
        params: {
          page,
          pageSize,
          searchTerm: searchClient,
        },
      });
      setClientsFdm(response.data.clients);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setIsAnyDialogOpen(false);
  };
  const handleDialogOpen = () => {
    setDialogOpen(true);
    setIsAnyDialogOpen(true);
  };


  const handleSelectClient = (client) => {
    setSelectedClient(client.CODE_CLIENT);
    setShowTable(false);
    setSearchClient(`${client.CODE_CLIENT} - ${client.INTITULE_CLIENT}`);

  };
  const handleConfirmSelection = () => {
    if (selectedClient) {
      setDialogOpen(false);
      setIsAnyDialogOpen(false);
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
  useEffect(() => {
    setHasCommunicationData(false);
    setSelectedOption('1');
  }, [resetSignal]);
  const rendersearchPay =
    selectedOption === '1' ? (
      <Select
        value={adrFilter}
        onChange={(e) => setAdrFilter(e.target.value)}
        displayEmpty
        sx={{ width: "300px", ml: 2 }}
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
        <MenuItem value="Medenine">Medenine</MenuItem>
        <MenuItem value="Tataouine">Tataouine</MenuItem>
        <MenuItem value="Gafsa">Gafsa</MenuItem>
        <MenuItem value="Tozeur">Tozeur</MenuItem>
        <MenuItem value="Kebili">Kebili</MenuItem>
      </Select>
    ) : null;


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
    />;
  const resetCommunicationState = () => {
    setHasCommunicationData(false);
  };


  const [showTable, setShowTable] = useState(false);

  const handleSearchClientChange = (event) => {
    const value = event.target.value;
    setSearchClient(value);
    setShowTable(value.length > 0);

  };

  const renderSelectClImage = (index === 0) && selectedOption !== '2' && (
    <Box sx={{ position: 'relative' }}>
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

      {showTable && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 1
          }}
        >
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {clients.map((client) => (
                  <TableRow
                    key={client.CODE_CLIENT}
                    hover
                    onClick={() => handleSelectClient(client)}
                    selected={selectedClient?.CODE_CLIENT === client.CODE_CLIENT}
                    sx={{
                      cursor: "pointer",
                      "&.Mui-selected": {
                        backgroundColor: "rgba(53,114,239,0.1) !important"
                      }
                    }}
                  >
                    <TableCell>{client.CODE_CLIENT}</TableCell>
                    <TableCell>{client.INTITULE_CLIENT}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination plus petite */}
            {!isAnyDialogOpen && (

              <TablePagination
                component="div"
                rowsPerPageOptions={[10, 25, 50, 100]}
                count={total}
                rowsPerPage={pageSize}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  borderTop: "1px solid #eee",

                  "& .MuiTablePagination-toolbar": {
                    minHeight: "32px !important",
                    height: "32px !important",
                    px: 1
                  },

                  "& .MuiTablePagination-selectLabel, \
            .MuiTablePagination-input, \
            .MuiTablePagination-displayedRows":
                  {
                    fontSize: "0.75rem"
                  },

                  "& .MuiTablePagination-actions": {
                    "& button": {
                      padding: "2px"
                    }
                  }
                }}
              />)}
          </TableContainer>
        </Box>

      )}
    </Box>
  );




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

  {/*const renderFiltredInput = ((index === 0 || index === 1) && selectedOption !== '2') ? (
      <Autocomplete
        options={avancementOptions}
        value={selectedAvancement}
        onChange={handleAvancementChange}
        renderInput={(params) => <TextField {...params} label="Filtrer par statut" variant="outlined" />}
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
    ) : null;*/}

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
    <div role="tabpanel" hidden={value !== index}>
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
                    <FormControlLabel value="1" control={<Radio size="small" />} label="Clients" />
                    <FormControlLabel value="2" control={<Radio size="small" />} label="Commandes" />
                    <FormControlLabel value="3" control={<Radio size="small" />} label="Réservations" />
                    <FormControlLabel value="4" control={<Radio size="small" />} label="Stock" disabled={!hasCommunicationData} />
                  </RadioGroup>
                </Box>

                {/* ---- ACTIONS ---- */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {/* <Button variant="outlined" onClick={handleClickOpen} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Collaborateurs
                  </Button> */}
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

                  {renderSearchInput}
                  {rendersearchPay}
                  <Divider orientation="vertical" flexItem />
                  {renderSelectClImage}
                </Box>

                {/* ---- ALERTES ---- */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenAlertDialog}
                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                  >
                    Alerter moi
                  </Button>

                  <Badge badgeContent={alerts.length} color="error">
                    <Button
                      variant="contained"
                      onClick={handleAlertIconClick}
                      sx={{
                        fontWeight: 800,
                        textTransform: 'none',
                        backgroundColor: alerts.length > 0 ? '#d32f2f' : '#2e7d32',
                        '&:hover': {
                          backgroundColor: alerts.length > 0 ? '#9a0007' : '#1b5e20'
                        }
                      }}
                    >
                      Mes alertes et nouvelle commande
                    </Button>
                  </Badge>
                </Box>
              </Paper>
            </Grid>


            {/* --- ZONE DE CONTENU (LISTES) --- */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 1, borderRadius: 3, backgroundColor: '#fff', minHeight: '500px' }}>
                {index === 0 && selectedOption === '2' && (
                  <CommandesList base={"cspd"} type={"client"} searchTerm={searchTerm} setAssigned={setAssignedList} selectedClient={selectedClient} />
                )}
                {index === 0 && selectedOption === '1' && displayMode === 'card' && (
                  <CardClientsCSPD
                    isAnyDialogOpen={isAnyDialogOpen} adr={adrFilter} selectedClientType={"clientsCspd"}
                    displayMode={displayMode} selectedTri={selectedTri} searchTerm={searchTerm}
                    handleDataUpdate={handleDataUpdate} onCommunicationSelect={handleCommunicationFromCard}
                  />
                )}
                {selectedOption === '4' && index === 0 && (
                  <Stock searchTerm={searchTerm} codeCli={selectedClient} base={"cspd"} type={"client"} enableClientSearch={true} />
                )}
                {selectedOption === '3' && index === 0 && (
                  <Reservation base={"cspd"} type={"client"} searchTerm={searchTerm} setAssigned={setAssignedList} />
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* --- TOUS VOS DIALOGUES (FONCTIONS INTACTES) --- */}


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
                    // Optionnel : si vous voulez un gris spécifique plus prononcé
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

          {/* Historique */}
          <Dialog open={historicDialogOpen} onClose={() => setHistoricDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Historique des commandes <Button onClick={() => setHistoricDialogOpen(false)} style={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></Button></DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2, mt: 1 }}>
                <TextField label="Filtrer par date" type="date" value={historicDate}
                  onChange={(e) => { const n = e.target.value; setHistoricDate(n); setHistoricPage(0); fetchHistoricCommands(n, 0, historicPageSize); }}
                  InputLabelProps={{ shrink: true }} sx={{ width: 200 }} />
              </Box>
              <TableContainer component={Paper}>
                <Table stickyHeader>
                  <TableHead><TableRow><TableCell>N° Commande</TableCell><TableCell>Date Alert</TableCell><TableCell>Date Creation</TableCell><TableCell>Utilisateurs</TableCell></TableRow></TableHead>
                  <TableBody>
                    {historicData.map((row) => (
                      <TableRow key={row.NUM_CMD + row.DATE_ALE}>
                        <TableCell>{row.NUM_CMD}</TableCell><TableCell>{row.DATE_ALE}</TableCell><TableCell>{row.DATE_CRE}</TableCell>
                        <TableCell><span dangerouslySetInnerHTML={{ __html: row.UTILISATEURS_Y }} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination component="div" count={historicTotal} rowsPerPage={historicPageSize} page={historicPage}
                  onPageChange={(e, p) => { setHistoricPage(p); fetchHistoricCommands(historicDate, p, historicPageSize); }}
                  onRowsPerPageChange={(e) => { const s = parseInt(e.target.value, 10); setHistoricPageSize(s); setHistoricPage(0); fetchHistoricCommands(historicDate, 0, s); }}
                  rowsPerPageOptions={[5, 10, 25, 50]} />
              </TableContainer>
            </DialogContent>
          </Dialog>

          {/* Alertes List */}
          <Dialog open={alertsDialogOpen} onClose={handleCloseAlertsDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Mes alertes d'aujourd'hui</DialogTitle>
            <DialogContent dividers>
              {alerts.length === 0 ? (<Typography variant="body2">Aucune alerte.</Typography>) : (
                alerts.map((alert) => (
                  <Box key={alert.ID_ALERT} sx={{ border: '1px solid #ddd', p: 1.5, mb: 1, cursor: 'pointer' }}
                    onClick={() => { const exp = expandedAlertId === alert.ID_ALERT; setExpandedAlertId(exp ? null : alert.ID_ALERT); if (!exp && alert.ENVOIYEUR === 'CRM') toggleActif(alert.ID_ALERT); }}>
                    <Typography variant="subtitle1" fontWeight="bold">{alert.TITRE}</Typography>
                    <Collapse in={expandedAlertId === alert.ID_ALERT}>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">{alert.TEXT_ALERT}</Typography>
                      </Box>
                    </Collapse>
                  </Box>
                ))
              )}
            </DialogContent>
            <DialogActions><Button onClick={handleCloseAlertsDialog}>Fermer</Button></DialogActions>
          </Dialog>

          {/* Collaborateurs */}
          <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>Collaborateurs</DialogTitle>
            <DialogContent>
              <TableContainer component={Paper}><Table>
                <TableHead><TableRow><TableCell>Utilisateur</TableCell><TableCell>Login</TableCell><TableCell>Role</TableCell></TableRow></TableHead>
                <TableBody>{users.filter(u => u.ROLE === "collaborateur").map(u => (
                  <TableRow key={u.ID_UTILISATEUR}><TableCell>{u.UTILISATEUR}</TableCell><TableCell>{u.LOGIN}</TableCell><TableCell>{u.ROLE}</TableCell></TableRow>
                ))}</TableBody>
              </Table></TableContainer>
            </DialogContent>
            <DialogActions><Button onClick={handleClose}>Fermer</Button></DialogActions>
          </Dialog>

          {/* Créer Alerte */}
          <Dialog open={alertOpen} onClose={handleCloseAlertDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Créer une alerte</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Titre" value={alertTitle} onChange={(e) => setAlertTitle(e.target.value)} fullWidth />
              <TextField label="Date" type="date" value={alertDate} onChange={(e) => setAlertDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Message" value={alertText} onChange={(e) => setAlertText(e.target.value)} fullWidth multiline rows={3} />
            </DialogContent>
            <DialogActions><Button onClick={handleCloseAlertDialog}>Annuler</Button><Button variant="contained" onClick={handleSubmitAlert}>Enregistrer</Button></DialogActions>
          </Dialog>

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
                  <CircularProgress />
                </Box>
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
                      const badgesArray = r.reseau_nom ? r.reseau_nom.split('/').map(b => b.trim().toUpperCase()) : [];
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
                              display: 'flex',          // Fondamental : transforme le Paper en conteneur flex
                              flexDirection: 'column', // Empilement vertical
                              transition: 'all 0.3s ease',
                              overflow: 'hidden',      // Évite les débordements de bordure
                              '&:hover': {
                                transform: 'translateY(-6px)',
                                boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
                              }
                            }}
                          >
                            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1 }}>

                              {/* 1. SECTION HAUTE (Nom, Badges, Contact) */}
                              {/* flexGrow: 1 force cette section à prendre tout l'espace restant, 
          poussant ainsi les sections suivantes vers le bas. */}
                              <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'flex-start' }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a237e', lineHeight: 1.2 }}>
                                    {r.name}
                                  </Typography>
                                  {r.inv_reseau && (
                                    <Chip label="INV" size="small" sx={{ fontWeight: 900, bgcolor: 'rgba(128, 0, 32, 0.08)', color: '#800020' }} />
                                  )}
                                </Box>

                                {/* BADGES */}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                  {badgesArray.map((brandName, idx) => {
                                    if (brandName.includes('OZKA') && (brandName.includes('STARMAXX') || brandName.includes('PULMOX'))) {
                                      const isStar = brandName.includes('STARMAXX');
                                      const color2 = isStar ? '#075dab' : '#ea0029';
                                      return (
                                        <Box key={idx} sx={{ display: 'inline-flex', px: 1, height: '22px', borderRadius: '4px', border: `1px solid ${color2}40`, gap: 0.8, alignItems: 'center' }}>
                                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#fbc02d' }}>OZKA</Typography>
                                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: color2 }}>{isStar ? 'STARMAXX' : 'PULMOX'}</Typography>
                                        </Box>
                                      );
                                    }
                                    let bCol = brandName.includes('PULMOX') ? '#ea0029' : brandName.includes('STARMAXX') ? '#075dab' : brandName.includes('OTANI') ? '#204389' : brandName.includes('OZKA') ? '#fbc02d' : '#3f51b5';
                                    return (
                                      <Chip key={idx} label={brandName} size="small" sx={{ fontSize: '0.65rem', fontWeight: 800, color: bCol, border: `1px solid ${bCol}40`, bgcolor: 'white' }} />
                                    );
                                  })}
                                </Box>

                                {/* CONTACT */}
                                <Stack spacing={1.5} sx={{ mb: 3 }}>
                                  <Box
                                    component="a"
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.adress)}`}
                                    target="_blank"
                                    sx={{ display: 'flex', gap: 1.5, p: 1.5, borderRadius: 2.5, bgcolor: '#f0f4ff', textDecoration: 'none' }}
                                  >
                                    <LocationOnIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a237e' }}>{r.adress}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', px: 0.5 }}>
                                    <PhoneIcon sx={{ color: 'success.main', fontSize: 18 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.telephone}</Typography>
                                  </Box>
                                </Stack>
                              </Box>

                              {/* 2. SECTION ÉVALUATION (Milieu) */}
                              {/* On enlève le mt: 'auto' ici pour le mettre sur le bloc parent flexGrow:1 en haut.
          Ce bloc restera toujours au-dessus du stock. */}
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 1.5,
                                bgcolor: '#f8fafc',
                                position: 'relative',
                                minHeight: '80px',
                                borderRadius: 3,
                                mb: 2
                              }}>
                                <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                  {[
                                    { val: 'Mauvais', icon: '😡', color: '#fee2e2' },
                                    { val: 'Neutre', icon: '😐', color: '#fef3c7' },
                                    { val: 'Fiable', icon: '😊', color: '#dcfce7' }
                                  ].map((item) => {
                                    const count = r[item.val] || 0;
                                    const isActive = pendingVote[r.id] === item.val || r.evaluationText === item.val;
                                    return (
                                      <Tooltip key={item.val} title={item.val} arrow placement="top">
                                        <Box
                                          onClick={() => setPendingVote({ ...pendingVote, [r.id]: item.val })}
                                          sx={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
                                            padding: '8px 14px', borderRadius: '12px',
                                            bgcolor: isActive ? item.color : 'transparent',
                                            transform: isActive ? 'scale(1.2)' : 'scale(1)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': { bgcolor: !isActive ? '#f1f5f9' : item.color, transform: 'scale(1.1)' }
                                          }}
                                        >
                                          <Typography sx={{ fontSize: '1.8rem', lineHeight: 1 }}>{item.icon}</Typography>
                                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', mt: 0.5 }}>({count})</Typography>
                                        </Box>
                                      </Tooltip>
                                    );
                                  })}
                                </Box>

                                {pendingVote[r.id] && (
                                  <Box sx={{ position: 'absolute', right: 10 }}>
                                    <Tooltip title="Confirmer le vote">
                                      <IconButton
                                        onClick={() => handleVote(r.id, pendingVote[r.id])}
                                        size="small"
                                        sx={{ color: '#22c55e', bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#f0fdf4' } }}
                                      >
                                        <CheckCircleIcon sx={{ fontSize: 24 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                )}
                              </Box>

                              {/* 3. SECTION STOCK (Bas) */}
                              <Box sx={{ pt: 2, borderTop: '1px solid #f0f0f0' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                  <Box component="span" sx={{ width: 7, height: 7, bgcolor: '#4caf50', borderRadius: '50%' }} />
                                  STOCK EN TEMPS RÉEL
                                </Typography>
                                <StockRevendeur clientCode={r.code_cli} brands={individualBrands} inv={r.inv_reseau} />
                              </Box>

                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })}
                </Grid>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
              <Button onClick={handleCloseReseauDialog}>Fermer</Button>
            </DialogActions>
          </Dialog>


        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  searchTerm: PropTypes.string,
  setSearchTerm: PropTypes.func,
  onCommunicationSelect: PropTypes.func,
  setNumber: PropTypes.func,
  resetSignal: PropTypes.any,
};


export default function BasicTabs({
  searchTerm,
  setSearchTerm,
  onCommunicationSelect,
  resetSignal,
  currentTab,
  onTabChange,
}) {
  const [numberCli, setNumberCli] = useState([]);
  const [tabValue, setTabValue] = useState(currentTab ?? 0);
  useEffect(() => {
    if (typeof currentTab === "number" && currentTab !== tabValue) {
      setTabValue(currentTab);
    }
  }, [currentTab]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
    onTabChange?.(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleChange} aria-label="CSPD Tabs">
          <Tab label="Clients CSPD" />
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

      {/* Clients CSPD tab – keeps the full sidebar/controls */}
      <CustomTabPanel
        value={tabValue}
        index={0}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCommunicationSelect={onCommunicationSelect}
        resetSignal={resetSignal}
        setNumber={(TypeCl, num) => {
          let newArray = [...numberCli];
          const existing = newArray.find((a) => a.typeCli === TypeCl);
          if (!existing) {
            newArray.push({ typeCli: TypeCl, Nbr: num });
          } else {
            newArray = newArray.filter((a) => a.typeCli !== TypeCl);
            newArray.push({ typeCli: TypeCl, Nbr: num });
          }
          setNumberCli(newArray);
        }}
      />

      {/* All other tabs – full width, no sidebar */}
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