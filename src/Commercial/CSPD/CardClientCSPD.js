//CardClientCSPD.js
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { styled } from '@mui/system';
import { useSelector } from 'react-redux';
import HistoryIcon from '@mui/icons-material/History';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import PhoneForwardedIcon from '@mui/icons-material/PhoneForwarded';
import Grid from '@mui/material/Grid';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import BASE_URL from '../../Utilis/constantes';
import CallIcon from '@mui/icons-material/Call';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { CircularProgress, TablePagination } from '@mui/material';
import {
  Collapse, IconButton, FormControl,
} from '@mui/material';
import Stock from '../Stock';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import MarkunreadIcon from '@mui/icons-material/Markunread';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import VerifiedIcon from '@mui/icons-material/Verified';

const CustomCardWrapper = styled(Card)(({ theme }) => ({
  width: 'calc(33.20% - 16px)',
  margin: theme.spacing(1),
  border: '1px solid #ccc',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  transform: 'scale(1)',
  '&:hover': {
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
    transform: 'scale(1.05)',
  },
}));

const CustomCardContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflowY: 'auto',
}));

const CustomCardActions = styled(CardActions)({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 16px',
  alignItems: 'center',
});

const CustomButton = styled(Button)({
  fontSize: '0.6rem',
  minWidth: 'auto',
  display: 'flex',
  alignItems: 'center',
  padding: '1px',
});

const GlowingBox = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 20,
  boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)',
  transition: 'box-shadow 0.3s ease-in-out',
  padding: '10px',
  '&:hover': {
    boxShadow: '0 0 16px rgba(0, 0, 0, 0.5)',
  },
}));

function CustomCard({ client, selectedClientType, user,onCommunicationSelect }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogCalls, setOpenDialogCalls] = useState(false);
  const [tarifs, setTarifs] = useState([])
  const [openTarifDialog, setOpenTarifDialog] = useState(false)
  const [openHistoriqueDialog, setOpenHistoriqueDialog] = useState(false);
  const [communicationHistory, setCommunicationHistory] = useState([]);
  const [communicationPassagerHistory, setCommunicationPassagerHistory] = useState([]);
  const [openCommunicationDialog, setOpenCommunicationDialog] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(null);
    const [duration, setDuration] = useState(null);//VOCAL duration front

  const [stockSearchTerm, setStockSearchTerm] = useState('');  // NEW: search for stock inside dialog
  


  const [page, setPage] = useState(1); // Current page
  const [hasMore, setHasMore] = useState(true); // Whether there are more items to fetch
  const [loading, setLoading] = useState(false); // Loading state
  const observer = useRef(); // For IntersectionObserver

  const [encoursData, setEncoursData] = useState(null);
  const [files, setFiles] = useState([]);
  const [emailSent, setEmailSent] = useState(false);
  const [isClientDetailsVisible, setIsClientDetailsVisible] = useState(false);
  const [subject, setSubject] = useState('');
  const [messages, setMessages] = useState('');
  const [fileNames, setFileNames] = useState([]);
  const [boiteMail, setBoiteMail] = useState("");
  const [catalogFiles, setCatalogFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [topArticles, setTopArticles] = useState([]);
  const [openTopArticlesDialog, setOpenTopArticlesDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [records, setRecords] = useState([]);
  const [pageRecords, setPageRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingRecords, setLoadingRecords] = useState(false);

const [showStockPanel, setShowStockPanel] = useState(false);





  const [selectedCatalogFile, setSelectedCatalogFile] = useState('');
  const [formData, setFormData] = useState({
    nom: client.INTITULE_CLIENT || '', // Initialize with client name
    commercial: user.LOGIN || '',
    raison: '',
    details: '',
    numero: ''
  });
  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/client-passager`, formData);
      if (response.status === 201) {
        // Ajouter la nouvelle communication à l'état local
        const newCommunication = {
          ...formData,
          DATE_ENREGISTREMENT: new Date().toISOString()
        };

        setCommunicationPassagerHistory(prevHistory => [
          newCommunication,
          ...prevHistory
        ]);

        alert('Communication enregistrée avec succès');
        handleClose();
      }
      setOpenCommunicationDialog(false)
    } catch (error) {
      console.error('Error saving passager communication:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };
  useEffect(() => {
    if (openCommunicationDialog && formData.nom) {
      fetchCommunicationPassagerHistory(formData.nom);
    }
  }, [openCommunicationDialog, formData.nom]);

  const fetchCommunicationPassagerHistory = async (status) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/client-passager/${status}`);
      if (response.data.success) {
        setCommunicationPassagerHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };


  useEffect(() => {
    if (formData.nom) {
      fetchCommunicationPassagerHistory(formData.nom);
    }
  }, [formData.nom]);
  const handleSortantClick = () => {
    const schema = selectedClientType === "clientsFdm" ? "FDM" : "CSPD";
  const payload = {
    COLLABORATOR: user.LOGIN,
    CALL_DATE: new Date().toISOString().slice(0, 16),
    TYPE_APPEL: 'Appel Sortant',
    CODE_CLIENT: client.CODE_CLIENT,
    RAISON: '',
    DESCRIPTION: '',
    NOM_CLIENT: client.INTITULE_CLIENT,
    SCHEMA:schema
  };
  onCommunicationSelect?.(payload);
};

const handleEntrantClick = () => {
  const schema = selectedClientType === "clientsFdm" ? "FDM" : "CSPD";
  const payload = {
    COLLABORATOR: user.LOGIN,
    CALL_DATE: new Date().toISOString().slice(0, 16),
    TYPE_APPEL: 'Appel Entrant',
    CODE_CLIENT: client.CODE_CLIENT,
    RAISON: '',
    DESCRIPTION: '',
    NOM_CLIENT: client.INTITULE_CLIENT,
    SCHEMA:schema
  };

  onCommunicationSelect?.(payload);
};


  const [currentUser, setCurrentUser] = useState({
    COLLABORATOR: user.LOGIN,
    CALL_DATE: new Date().toISOString().slice(0, 16),
    RAISON: '',
    DESCRIPTION: '',
    CLIENT_ID: '',
    TYPE_APPEL: ''
  });
  const [editing, setEditing] = useState(false);
  const [commandes, setCommandes] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [articles, setArticles] = useState([]);
  const COLLABORATEUR_MAP = {
  906: "Commercial",
  107: "Ikram",
  113: "Emna",
  111: "Rihem",
  108: "Hedia",
  114: "Fedi",
  908: "Nesrine",
  401: "Slim",
  500: "RihemD",
};

  const fetchEncoursData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/clientsEncours`, {
        params: {
          searchTerm: client.CODE_CLIENT
        }
      });

      if (response.data.clients && response.data.clients.length > 0) {
        setEncoursData(response.data.clients[0]);
      }
    } catch (error) {
      console.error('Error fetching encours data:', error);
    }
  };
  useEffect(() => {
    fetchEncoursData();
  }, [client.CODE_CLIENT]);

  const handleTarifDialogOpen = async (command) => {
    try {
      const result = await axios.get(`${BASE_URL}/api/tarifsClient`, {
        params: {
          code: command.CODE_CLIENT
        }
      });

      setTarifs(result.data);
    } catch (error) {
      console.error('Error fetching commands:', error);
    }
    setOpenTarifDialog(true)
  }
  const fetchTopArticles = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/sumSalesByArticle`, {
        params: {
          base: selectedClientType === "clientsFdm" ? "fdm" : "cspd",
          clientCode: client.CODE_CLIENT // Ajout du code client
        }
      });
      setTopArticles(response.data.slice(0, 100));
    } catch (error) {
      console.error('Error fetching top articles:', error);
    }
  };
  useEffect(() => {
    if (openTopArticlesDialog) {
      fetchTopArticles();
    }
  }, [openTopArticlesDialog]);
  const fetchClientData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/clientsCspd`, {
      params: { CODE_CLIENT: client.CODE_CLIENT }
    });

    if (response.status === 200) {
      const clientData = response.data;
      // Ensure CLIENT_ID is set correctly from the fetched client data
      setCurrentUser(prevState => ({
        ...prevState,
        CLIENT_ID: clientData.CLIENT_ID || prevState.CLIENT_ID,  // Ensure CLIENT_ID is updated
        COLLABORATOR: user.LOGIN,
        CALL_DATE: new Date().toISOString().slice(0, 16),
        RAISON: '',
        DESCRIPTION: '',
        TYPE_APPEL: '',
      }));
    }
  } catch (error) {
    console.error('Error fetching client data:', error);
    alert('Error fetching client data. Please try again.');
  }
};



  const handleDialogAppels = async () => {
    await setCommunicationHistory([]); // Réinitialiser l'historique
    setPage(1); // Réinitialiser la page à 1
    setHasMore(true); // Réinitialiser l'état hasMore
    await fetchCommunicationHistory();
    fetchRecords();
    setOpenDialogCalls(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenDialogCalls(false);
    setShowStockPanel(false);   // hide right panel when closing

    setEditing(false);
  };

  const getAudioUrl = (path) => {
    if (!path) return "";
    const match = path.match(/\/\d{4}\/\d{2}\/\d{2}\/.*$/);
    if (match) {
      return `http://192.168.1.247/recordings${match[0]}`;
    }
    return "";
  };

  const fetchRecords = async (currentPage = 0, limit = 10) => {
    setLoadingRecords(true)
    try {
      if (
        client?.INTITULE_CLIENT &&
        client.INTITULE_CLIENT.toLowerCase() !== "passager"
      ) {
        const response = await axios.get(
          `${BASE_URL}/cdr/${client?.COMPTE_CLIENT}`,
          // `${BASE_URL}/cdr/41100049`,
          {
            params: {
              limit,
              page: currentPage + 1,
            },
          }
        );
        // const record = response.data.data?.[0]; // take first record

        // const simulatedRecords = record ? Array(20).fill({ ...record }) : [];

        setRecords(response.data.data || []);

        setTotalCount(response.data.total || 0);
        //             setRecords(simulatedRecords);
        // setTotalCount(simulatedRecords.length)
      } else {
        const response = await axios.get(`${BASE_URL}/cdr`, {
          params: {
            limit,
            page: currentPage + 1,
          },
        });
        setRecords(response.data.data || []);
        setTotalCount(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching communication history:", error);
    }finally{
      setLoadingRecords(false)
    }
  };

  const handleChangePage = (event, newPage) => {
    setPageRecords(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPageRecords(0);
  };

  useEffect(() => {
    fetchRecords(pageRecords, rowsPerPage);
  }, [client, pageRecords, rowsPerPage]);

  const fetchCommunicationHistory = async () => {
    if (loading || !hasMore) return; // Avoid duplicate calls or fetching if no more data

    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/callscspd`, {
        params: {
          id_client: client.CODE_CLIENT,
          page: page,
          limit: 100, // Fetch 10 items at a time
        },
      });

      const newHistory = response.data.data; // Adjust based on API response structure
      const totalItems = response.data.pagination?.total || 0; // Get the total number of items

      setCommunicationHistory((prev) => [...prev, ...newHistory]); // Append the new items
      // setHasMore(newHistory.length > 0 && communicationHistory.length + newHistory.length < totalItems); // Check if more data exists
      // setPage((prevPage) => prevPage + 1); // Increment the page number
    } catch (error) {
      console.error('Error fetching communication history:', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };


  // Observe the last item to trigger loading
  const lastElementRef = useRef(null);

  useEffect(() => {
    if (loading) return;

    const handleObserver = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        fetchCommunicationHistory();
      }
    };

    if (observer.current) observer.current.disconnect(); // Cleanup previous observer
    observer.current = new IntersectionObserver(handleObserver); // Create new observer
    if (lastElementRef.current) observer.current.observe(lastElementRef.current); // Attach observer to last element
  }, [loading, hasMore]);

  // Initial data fetch on component mount
  // useEffect(() => {
  //   fetchCommunicationHistory();
  // }, [client.CODE_CLIENT]);
  const formatDate = (date) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  const handleSaveUser = async () => {
    try {
      const requiredFields = ['COLLABORATOR', 'CALL_DATE', 'RAISON', 'DESCRIPTION', 'CODE_CLIENT'];
      const missingFields = requiredFields.filter(field => !currentUser[field]);
      if (missingFields.length > 0) {
        alert(`Veuillez remplir tous les champs  `);
        return;
      }
      const apiEndpoint = editing
        ? `${BASE_URL}/api/collaboratorscalls/${currentUser.ID}`
        : `${BASE_URL}/api/collaboratorscalls`;

      const apiMethod = editing ? 'put' : 'post';

      const requestData = { 
        COLLABORATOR: user.LOGIN,
        CALL_DATE: formatDate(currentUser.CALL_DATE),
        RAISON: currentUser.RAISON,
        DESCRIPTION: currentUser.DESCRIPTION,
        clientId: currentUser.CODE_CLIENT,
        STATUS: client.CODE_CLIENT === '41101089' ? currentUser.STATUS : undefined,
        TYPE_APPEL: currentUser.TYPE_APPEL        // ✅ NEW
      };

      const response = await axios[apiMethod](apiEndpoint, requestData, { timeout: 5000 });
      if (response.status === 201 || response.status === 200) {
        setCommunicationHistory([]);
        setPage(1);
        setHasMore(true);
        fetchCommunicationHistory();
        handleCloseDialog();

        alert(`Communication ${editing ? 'modifiée' : 'ajoutée'} avec succès.`);
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error saving communication:', error);
      let errorMessage = 'Erreur lors de la sauvegarde de la communication.';

      if (error.response) {
        errorMessage = `Server Error: ${error.response.status} - ${error.response.data.error || error.response.data.message || 'Unknown error'}`;
        if (error.response.data.details) {
          console.error('Error details:', error.response.data.details);
        }
      } else if (error.request) {
        errorMessage = 'Pas de réponse du serveur. Veuillez réessayer plus tard.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'La requête a expiré. Veuillez vérifier votre connexion et réessayer.';
      }
      alert(errorMessage);
    }
  };
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    const names = selectedFiles.map(file => file.name);
    setFileNames(names);
  };
  useEffect(() => {
    const fetchCatalogFiles = async () => {
      try {
        const response = await axios.get('http://192.168.1.170:3300/api/files');
        setCatalogFiles(response.data);
      } catch (error) {
      }
    };
    fetchCatalogFiles();
  }, []);
  

  useEffect(() => {
    if (client?.ADR_C_FACT_3) {
      setBoiteMail(client.ADR_C_FACT_3);
    }
  }, [client]);

  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !messages.trim() || !boiteMail.trim()) {
      alert('Please fill in all required fields.');
      return;
    }


    const formData = new FormData();
    formData.append('subject', subject.trim());
    formData.append('message', messages.trim());
    formData.append('code', boiteMail.trim());

    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    if (selectedCatalogFile) {
      formData.append('selectedCatalogFile', selectedCatalogFile);
    }

    try {
      const response = await axios.post('http://192.168.1.170:3300/mailing', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        alert('Email sent successfully!');
        setEmailSent(true);
        setSubject('');
        setMessages('');
        setFiles([]);
        setFileNames([]);
        setSelectedCatalogFile('');
        setOpen(false);
      }
    } catch (error) {
      console.error('Mailing error:', error);
      alert(`Error: ${error.response?.data?.message || 'Failed to send email'}`);
    }
  };

  const makeCall = (tel) => {
    if (tel && typeof tel === 'string') {
      window.location.href = `sip:${tel.replace(/[^0-9]+/g, '')}`;
    } else {
      console.error('Numéro de téléphone invalide:', tel);
      alert('Numéro de téléphone invalide. Veuillez vérifier le numéro et réessayer.');
    }
  };

  const handleHistoriqueDialogOpen = async () => {
    try {
      const result = await axios.get(`${BASE_URL}/api/cmdClients`, {
        params: {
          base: selectedClientType === "clientsFdm" ? "fdm" : "cspd",
          code: client.CODE_CLIENT
        }
      });
      setCommandes(result.data);
    } catch (error) {
      console.error('Error fetching commands:', error);
    }
    setOpenHistoriqueDialog(true);
  };

  const handleHistoriqueDialogClose = () => {
    setOpenHistoriqueDialog(false);
  };
  const handleHistoriqueDialogCloseCalls = () => {
    setOpenDialogCalls(false);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleCardClick = async (command) => {
    setExpanded(prev => (prev === command.NUM_BLC ? null : command.NUM_BLC));
    try {
      const result = await axios.get(`${BASE_URL}/api/articlescmd`, {
        params: {
          reference: command.NUM_BLC,
          base: selectedClientType === "clientsFdm" ? "fdm" : "cspd"
        }
      });
      setArticles(result.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };
  const handleClientClick = () => {
    setIsClientDetailsVisible(prev => !prev);
  };
  const BouncingIcon = styled(AdsClickIcon)`
    animation: bounce 1s infinite;
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-8px);
      }
      60% {
        transform: translateY(-4px);
      }
    }
`;

  const handleClickOpen = () => {
    if (!boiteMail) setBoiteMail("");
    setOpen(true);
  };

  return (
    <CustomCardWrapper style={{ backgroundColor: 'white', borderRadius: '15px', border: 'transparent' }}>
      <CustomCardContent>
        <GlowingBox
          style={{
            backgroundColor: client.BLOQUER_CLIENT ? "red" : "#3572EF",
            borderRadius: '11px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 16px'
          }}
        >
          <Typography
            variant="h6"
            component="div"
            style={{
              color: "white",
              fontWeight: 'bold',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <div>
              {client.INTITULE_CLIENT.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())}
              <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '8px' }}>
                {client.INTITULE_GR ? client.INTITULE_GR.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()) : " "}
              </span>
            </div>

            <CustomButton
              onClick={() => setOpenTopArticlesDialog(true)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: "#F8FAFC",
                fontWeight: 'bold',
                minWidth: '60px',
                marginLeft: '16px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
              size="small"
              startIcon={<EmojiEventsIcon />}
            >
              Top Articles
            </CustomButton>
          </Typography>
        </GlowingBox>

        {client.BLOQUER_CLIENT ? (
          <Typography
            variant="body2"
            color="text.secondary"
            style={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
              marginTop: "10px",
              color: "red"
            }}
          >
            Client bloqué
          </Typography>
        ) : <></>}
        <Typography
          variant="h6"
          component="div"
          gutterBottom
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 12,
            color: '#545454',
            fontWeight: 'bold',
            marginTop: '1em',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          onClick={handleClientClick}
        >
          <PersonIcon style={{ marginRight: '0.5em' }} /> <span style={{ color: 'green' }}> {client.INTITULE_CLIENT.replace(/\w\S*/g, text =>
            text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())},
            {client.CODE_CLIENT}  </span><BouncingIcon style={{ marginRight: '0.5em', color: 'green' }} />
        </Typography>
        {isClientDetailsVisible && (
          <Box
            sx={{
              padding: '16px',
              borderTop: '1px solid #ccc',
              marginTop: '10px',
              backgroundColor: '#f9f9f9',
              marginBottom: "10px"
            }}
            onClick={() => handleClientClick(encoursData.NUM_CDE_C)}
          >
            <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Mode de règlement:</strong> {encoursData.LIBEL_REGL_C}
            </Typography>
            <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>{encoursData.CL_CHAMP_11}</strong>
            </Typography>
            <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Échéance:</strong> {encoursData.ECHEANCE_REG_C}
            </Typography>
        
            <Typography style={{ display: "flex", alignItems: "center", color: 'red', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Encours autorisé:</strong> {(encoursData.ENCOURS_MAX_C).toFixed(3)}
            </Typography>
            <Typography style={{ display: "flex", alignItems: "center", color: 'red', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Total général:</strong> { Number(encoursData.REGLEMENT_ETAT_NULL)+ Number(encoursData.SOLDE_CLIENT) + Number(encoursData.BLNONFACT) + Number(encoursData.ENCOURSREG)}                              
              </Typography>
              <Typography style={{ display: "flex", alignItems: "center", color: 'red', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Ecart:</strong> { Number(encoursData.ENCOURS_MAX_C)-( Number(encoursData.REGLEMENT_ETAT_NULL)+ Number(encoursData.SOLDE_CLIENT) + Number(encoursData.BLNONFACT) + Number(encoursData.ENCOURSREG))}                              
              </Typography>
            <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Encours supp:</strong> {encoursData.ENCOURS_SUPP}
            </Typography>
            <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Encours client : </strong> {encoursData.SOLDE_CLIENT}
            </Typography>
            <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>BL non facturé : </strong> {encoursData.BLNONFACT}
            </Typography>
            <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Solde + BL : </strong> {(Number(encoursData.SOLDE_CLIENT) + Number(encoursData.BLNONFACT)).toFixed(3)}                              
              </Typography>
            <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Total portefeuilles:</strong> { Number(encoursData.REGLEMENT_ETAT_NULL)}                               
              </Typography>
            <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Effet Remis:</strong> {encoursData.ENCOURSREG}                                
              </Typography>
            
             
             
          </Box>
        )}
        <Typography variant="h6" component="div" gutterBottom style={{ display: "flex", alignItems: "center", marginBottom: 12, color: '#545454', fontWeight: 'bold', marginTop: '1em', fontSize: '16px' }}>
          <CallIcon style={{ marginRight: '0.5em' }} />
         {[
    client.TEL_CLIENT_F,
    client.TELCOP_CLIENT_F,
    client.TEL_CLIENT_L
  ]
    .filter(Boolean)
    .join(" - ")
  }
        </Typography>
        
        <Typography variant="h6" component="div" gutterBottom style={{ display: "flex", alignItems: "center", marginBottom: 10, color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <LocationOnIcon style={{ marginRight: '0.5em' }} />
          {client.ADR_C_FACT_1
            ? client.ADR_C_FACT_1.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())
            : ""
          }
        </Typography>
        <Typography variant="h6" component="div" gutterBottom style={{ display: "flex", alignItems: "center", marginBottom: 10, color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <VerifiedIcon style={{ marginRight: '0.5em' }} /> MF:
          {client.ADR_C_FACT_4
            ? client.ADR_C_FACT_4
              .replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())
            : "Pas d'information"
          }
        </Typography>
        <Typography variant="h6" component="div" gutterBottom style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <CoPresentIcon style={{ marginRight: '0.5em' }} />
          {client.INTITULE_REPRES ? client.INTITULE_REPRES.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())
            : ""
          }
        </Typography>
        <Typography variant="h6" component="div" gutterBottom style={{ display: "flex", alignItems: "center", marginBottom: 12, color: '#545454', fontWeight: 'bold', marginTop: '1em', fontSize: '16px' }}>
          <MarkunreadIcon style={{ marginRight: '0.5em' }} />
          {client.ADR_C_FACT_3
          }  <Button onClick={handleClickOpen}>
            envoyer un catalogue   </Button>
        </Typography>
        <>
          {client.NUM_DER_BON ? (
            <Typography variant="body2" color="text.secondary">
              <Grid
  container
  style={{
    marginTop: '10px',
    color: "black",
    alignItems: 'flex-start',
    fontFamily: 'sans-serif',
    display: 'inline-flex',
    fontWeight: 'bold'
  }}
>
  {/* 🔹 Title */}
  <Typography
    variant="subtitle1"
    sx={{
      width: '100%',
      mb: 1,
      fontWeight: 'bold',
      color: '#0B4C69',
    }}
  >
    Dernier Bon de Livraison / Retour  – Informations
  </Typography>

  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold' }}>N°</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>Prix</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>Nb jours</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        <TableRow sx={{ '&:last-child td': { border: 0 } }}>
          <TableCell sx={{ fontWeight: 'bold', color: '#387ADF' }}>
            {client.NUM_DER_BON}
          </TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>
            {new Date(client.DATE_DER_BON).toLocaleDateString('fr-FR')}
          </TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: 'green' }}>
            {client.TOT_TTC_BLC}
          </TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: 'red' }}>
            {client.NBR_JOURS}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </TableContainer>
</Grid>

            </Typography>
          ) : (
            <Typography color="text.secondary" gutterBottom>
              <Grid container style={{ marginTop: '10px', color: "black", alignItems: 'flex-start', fontFamily: 'sans-serif', display: 'inline-flex', fontWeight: 'bold' }}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      <TableRow key={client.ID_CLIENT} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell style={{ fontWeight: 'bold', color: '#5E6073', borderRadius: '12px', textAlign: 'center' }}> Aucune commande! </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Typography>
          )}
        </>

      </CustomCardContent>
      <CustomCardActions style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}}>
  <CustomButton
  style={{
    color: "green",
    fontWeight: 'bold',
  }}
  startIcon={<PhoneForwardedIcon />}
  size="medium"
  onClick={() => handleSortantClick(client.CODE_CLIENT)}  // Pass client ID
>
  Sortant
</CustomButton>

<CustomButton
  style={{
    color: "green",
    fontWeight: 'bold',
  }}
  startIcon={<PhoneCallbackIcon />}
  size="medium"
  onClick={() => handleEntrantClick(client.CODE_CLIENT)}  // Pass client ID
>
  Entrant
</CustomButton>


        <CustomButton
          style={{
            color: "#478CCF",
            fontWeight: 'bold',
          }}
          startIcon={<HistoryIcon />}
          onClick={() => handleDialogAppels()}
          size="medium"
        >
          Historique des appels
        </CustomButton>
        <CustomButton
          style={{
            color: "#478CCF",
            fontWeight: 'bold',
            minWidth: '60px'  // Ajustez cette valeur selon vos besoins
          }}
          startIcon={<HistoryIcon />}
          onClick={() => handleHistoriqueDialogOpen()}
          size="medium"
        >
          Historique des commandes
        </CustomButton>
        <CustomButton
          style={{
            color: "#478CCF",
            fontWeight: 'bold',
          }}

          startIcon={<LocalAtmIcon />} onClick={() => handleTarifDialogOpen(client)}
          size="medium"
        >
          tarifs
        </CustomButton>


      </CustomCardActions>

      <Dialog
  open={openDialog}
 onClose={(event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
  }}
  disableEscapeKeyDown
  maxWidth="xl"
  fullWidth
  PaperProps={{
  sx: {
    width: '100vw',
    height: '90vh',
    maxWidth: 'none',
    margin: 0,
    borderRadius: 0
  }
}}


>
  <DialogTitle>
    {editing ? 'Modifier la communication' : 'Nouvelle communication'}
  </DialogTitle>

  <DialogContent
  sx={{
    pt: 1,
    pb: 1,
    height: 'calc(90vh - 80px)', 
    overflow: 'hidden',
  }}
>

    <Box
  sx={{
    display: 'flex',
    gap: 2,
    alignItems: 'flex-start',
    height: '100%',
  }}
>
  {/* LEFT */}
  <Box
  sx={{
    flex: 0.8,          // un peu plus petit
    minWidth: 0,
    maxHeight: '66vh',
    overflowY: 'auto',
    pr: 1,
  }}
>
        <Typography
          variant="h6"
          component="div"
          gutterBottom
          style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px" }}
        >
          <CallIcon />
          {client.TEL_CLIENT_L ? (
            <Button onClick={() => makeCall(client.TEL_CLIENT_L)}>
              {client.TEL_CLIENT_L}
            </Button>
          ) : (
            <span style={{ fontSize: '12px' }}>Pas d'information</span>
          )}
          {client.TEL_CLIENT_F ? (
            <Button onClick={() => makeCall(client.TEL_CLIENT_F)}>
              {client.TEL_CLIENT_F}
            </Button>
          ) : (
            <span style={{ fontSize: '12px' }}>Pas d'information</span>
          )}   -
          {client.TELCOP_CLIENT_F ? (
            <Button onClick={() => makeCall(client.TELCOP_CLIENT_F)}>
              {client.TELCOP_CLIENT_F}
            </Button>
          ) : (
            <span style={{ fontSize: '12px' }}>Pas d'information</span>
          )}
          -
          {client.TELCOP_CLIENT_L ? (
            <Button onClick={() => makeCall(client.TELCOP_CLIENT_L)}>
              {client.TELCOP_CLIENT_L}
            </Button>
          ) : (
            <span style={{ fontSize: '12px' }}>Pas d'information</span>
          )}
        </Typography>

        <TextField
          margin="dense"
          label="Utilisateur CRM"
          type="text"
          fullWidth
          value={currentUser.COLLABORATOR}
          InputProps={{
            readOnly: true,
          }}
        />

        <TextField
          margin="dense"
          label="Date de l'appel"
          type="datetime-local"
          fullWidth
          value={currentUser.CALL_DATE}
          onChange={(e) => setCurrentUser({ ...currentUser, CALL_DATE: e.target.value })}
        />

        {client.CODE_CLIENT === '41101089' && (
          <TextField
            fullWidth
            label="Client"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f5f5f5',
              },
            }}
          />
        )}

        <InputLabel>Raison</InputLabel>
        <Select
          fullWidth
          value={currentUser.RAISON}
          onChange={(e) => setCurrentUser({ ...currentUser, RAISON: e.target.value })}
        >
          <MenuItem value="Prospection">Prospection</MenuItem>
          <MenuItem value="Formation">Formation en ligne</MenuItem>
          <MenuItem value="Information">Demande d'information</MenuItem>
          <MenuItem value="Action Investisseur">Action Investisseur</MenuItem>
  <MenuItem value="Action Promotion">Action Promotion</MenuItem>
  <MenuItem value="Partenaire">Partenaire</MenuItem>
  <MenuItem value="Investisseur">Investisseur</MenuItem>
        </Select>

        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={currentUser.DESCRIPTION}
          onChange={(e) => setCurrentUser({ ...currentUser, DESCRIPTION: e.target.value })}
        />

        <Typography variant="h6" style={{ marginTop: '20px' }}>
          Historique des communications
        </Typography>

        {client.CODE_CLIENT === '41101089' && (
          <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
            <TextField
              label="Chercher une communication client"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              variant="outlined"
              size="small"
            />
          </FormControl>
        )}

        <Table>
          <TableHead>
            <TableRow>
              {client.CODE_CLIENT === '41101089' && <TableCell></TableCell>}
              {client.CODE_CLIENT === '41101089' && <TableCell>Client</TableCell>}
              <TableCell>Date et heure</TableCell>
              <TableCell>Type d'appel</TableCell>
              <TableCell>Commercial</TableCell>
              <TableCell>Raison</TableCell>
              <TableCell>Détails</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {communicationHistory.length > 0 ? (
              communicationHistory
                .filter(comm =>
                  client.CODE_CLIENT !== '41101089' ||
                  !statusFilter ||
                  (comm.STATUS && comm.STATUS.toLowerCase().includes(statusFilter.toLowerCase()))
                )
                .map((comm, index) => (
                  <TableRow key={index}>
                    {client.CODE_CLIENT === '41101089' && (
                      <TableCell>
                        <Button
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              nom: comm.STATUS || ''
                            }));
                            setOpenCommunicationDialog(true);
                            setOpenDialogCalls(false);
                          }}
                          startIcon={<AddIcon />}
                          sx={{
                            minWidth: 'auto',
                            padding: '4px 8px',
                            background: 'linear-gradient(135deg, #0B4C69, #1976d2)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1976d2, #0B4C69)',
                            },
                            borderRadius: '8px',
                          }}
                        />
                      </TableCell>
                    )}
                    {client.CODE_CLIENT === '41101089' && (
                      <TableCell>{comm.STATUS || 'N/A'}</TableCell>
                    )}
                    <TableCell>{new Date(comm.CALL_DATE).toLocaleString()}</TableCell>
                    <TableCell>{comm.TYPE_APPEL}</TableCell>
                    <TableCell>{comm.COLLABORATOR}</TableCell>
                    <TableCell>{comm.RAISON}</TableCell>
                    <TableCell>{comm.DESCRIPTION}</TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucun historique de communication trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* RIGHT: Stock panel with its own filters */}
       {showStockPanel && (
    <Box
    sx={{
      flex: 1.5,        // plus large
      minWidth: 0,
      maxHeight: '66vh',
      overflowY: 'auto',
      pl: 1,
    }}
  >
          <Typography variant="h6" sx={{ mb: 1 }}>
            État de stock - Client {client.CODE_CLIENT}
          </Typography>

          {/* Filters for stock inside the dialog */}
          <TextField
            size="small"
            fullWidth
            placeholder="Rechercher (famille, dimension, article...)"
            value={stockSearchTerm}
            onChange={(e) => setStockSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <IconButton size="small">
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />

          <Stock
            codeCli={client.CODE_CLIENT}
            base={selectedClientType === "clientsFdm" ? "fdm" : "cspd"}
            type="client"
            enableClientSearch={false}
            searchTerm={stockSearchTerm}
          />
        </Box>
      )}
    </Box>
  </DialogContent>

  <DialogActions
  sx={{
    py: 0.5,
    px: 2,
    borderTop: '1px solid #eee',
    backgroundColor: '#fff',
    "& .MuiButton-root": {
      fontSize: "0.8rem",
      padding: "4px 14px",
      minHeight: "28px",
    },
  }}
>
  <Button
    onClick={handleSaveUser}
    variant="contained"
    color="primary"
  >
    Enregistrer
  </Button>
</DialogActions>

</Dialog>



      <Dialog open={openTarifDialog} onClose={() => setOpenTarifDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Tarifs
        </DialogTitle>
        <DialogContent>
          <TableContainer style={{ maxHeight: '80%', overflowY: 'auto', border: '1px solid black' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Famille</TableCell>
                  <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Remise CSPD</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tarifs.length > 0 && tarifs.map((t) => (
                  <TableRow >
                    <TableCell>{t.INTITULE_FAM}</TableCell>
                    <TableCell>{t.REMISE_TF}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTarifDialog(false)} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={openDialogCalls} fullWidth
  maxWidth="xl" >
        <DialogTitle>Historique des communications</DialogTitle>
        <DialogContent>
          {client.CODE_CLIENT === '41101089' && (
            <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
              <TextField
                label="Chercher une communication client"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                variant="outlined"
                size="small"
              />
            </FormControl>
          )}
          <Table>

            <TableHead>
              <TableRow>
                {client.CODE_CLIENT === '41101089' && (
                  <TableCell></TableCell>

                )}
                {client.CODE_CLIENT === '41101089' && (
                  <TableCell>client</TableCell>

                )}

                <TableCell>Date et heure</TableCell>
                <TableCell>Type d'appel</TableCell>
                <TableCell>Commercial</TableCell>
                <TableCell>Raison</TableCell>
                <TableCell>Détails</TableCell>

              </TableRow>
            </TableHead>
            <TableBody>
              {communicationHistory.length > 0 ? (
                communicationHistory
                  .filter(comm =>
                    client.CODE_CLIENT !== '41101089' ||
                    !statusFilter ||
                    (comm.STATUS && comm.STATUS.toLowerCase().includes(statusFilter.toLowerCase()))
                  )
                  .map((comm, index) => (
                    <TableRow key={index}>

                      {client.CODE_CLIENT === '41101089' && (
                        <TableCell> <Button
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              nom: comm.STATUS || ''
                            }));
                            setOpenCommunicationDialog(true); // Use the new state instead of setOpen
                            setOpenDialogCalls(false);

                          }}
                          startIcon={<AddIcon />}
                          sx={{
                            minWidth: 'auto',
                            padding: '4px 8px',
                            background: 'linear-gradient(135deg, #0B4C69, #1976d2)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1976d2, #0B4C69)',
                            },
                            borderRadius: '8px',
                          }}
                        >
                        </Button></TableCell>

                      )}
                      {client.CODE_CLIENT === '41101089' && (
                        <TableCell>{comm.STATUS || 'N/A'} </TableCell>

                      )}
                      <TableCell>{new Date(comm.CALL_DATE).toLocaleString()}</TableCell>
                      <TableCell>{comm.TYPE_APPEL}</TableCell>
                      <TableCell>{comm.COLLABORATOR}</TableCell>
                      <TableCell>{comm.RAISON}</TableCell>
                      <TableCell>{comm.DESCRIPTION}</TableCell>

                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={client.CODE_CLIENT === '41101089' ? 5 : 4} align="center">
                    Aucun historique de communication trouvé
                  </TableCell>
                </TableRow>
              )}


            </TableBody>
          </Table>
          <Box>
             {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
            ) : Array.isArray(records) && records.length > 0 ? (
              
              <>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID Client</TableCell>
                      <TableCell>Date de création</TableCell>
                      <TableCell>Collaborateur</TableCell>
                      <TableCell>Numéro Client</TableCell>
                      <TableCell>Type D'appel</TableCell>
                      <TableCell>Écouter l’audio</TableCell>
                    </TableRow>
                  </TableHead>

                 <TableBody>
  {records
  .filter(record => record.duration > 5)
  .map((record) => {

    let callType = "-";
    let numeroClient = "-";
    let collaborateur = "-";

    if (record.recording_path) {
      const filename = record.recording_path.split("/").pop();
      const parts = filename.split("-");

      if (filename.startsWith("out")) {
        callType = "Appel sortant";
        numeroClient = parts[1] || "-";
        collaborateur = parts[2] || "-";
      } 
      else if (filename.startsWith("external")) {
        callType = "Appel entrant";
        collaborateur = parts[1] || "-";
        numeroClient = parts[2] || "-";
      }
    }

    // 🔥 Convert number to name
    const collaborateurName =
      COLLABORATEUR_MAP[collaborateur] || collaborateur;

    return (
      <TableRow key={record.id}>
        <TableCell>{record.client_id ?? "N/A"}</TableCell>

        <TableCell>
          {record.calldate
            ? new Date(record.calldate).toLocaleString("fr-FR")
            : "N/A"}
        </TableCell>

        <TableCell>{collaborateurName}</TableCell>

        <TableCell>
          {record.client_id === 41101089 ? numeroClient : "-"}
        </TableCell>

        <TableCell>{callType}</TableCell>

        <TableCell>
          {record.recording_path ? (
            <audio controls style={{ width: "200px" }}>
              <source
                src={getAudioUrl(record.recording_path)}
                type="audio/wav"
              />
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
          ) : (
            "Aucun enregistrement"
          )}
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>
                </Table>

           
                <TablePagination
                  sx={{ borderTop: "1px solid #ddd", mt: 1 }}
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={totalCount}
                  page={pageRecords}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Enregistrements par page"
                />
              </>
            ) : (
              <Typography align="center" sx={{ mt: 2 }}>
                Aucun enregistrement audio trouvé
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHistoriqueDialogCloseCalls} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openHistoriqueDialog} onClose={handleHistoriqueDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Historique des commandes client
        </DialogTitle>
        <DialogContent>

          {commandes.map((command) => {

            return (
              <Card sx={{
                height: '100%',
                marginBottom: "20px",
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}>
                <CardContent sx={{
                  cursor: 'pointer',
                  position: 'relative',
                  height: '200px',
                  marginBottom: "20px",
                  padding: '16px',
                }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#2196F3',
                      textShadow: '0 0 8px rgba(33, 150, 243, 0.7)',
                      fontWeight: 'bold',
                      border: '1px solid #2196F3',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    Bon de livraison: {command.NUM_BLC} | {command.DATE_BLC}
                  </Typography>
                  <Typography sx={{ marginTop: '8px' }}>Code Client: {command.CLIENT_BLC}</Typography>
                  <Typography sx={{ marginTop: '8px' }}>Client: {command.ADR_BLC_1}</Typography>
                  <Typography sx={{ marginTop: '8px' }}>Adresses Client: {command.ADR_BLC_2}, {command.ADR_BLC_3}</Typography>
                  <Typography sx={{ marginTop: '8px', fontWeight: 'bold' }}>Total: {command.BLC_TOTAL}</Typography>
                  <IconButton
                    onClick={() => handleCardClick(command)}
                    aria-expanded={expanded === command.NUM_BLC}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: '#f0f0f0',
                      '&:hover': {
                        backgroundColor: '#e0e0e0',
                      },
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </CardContent>
                <Collapse in={expanded === command.NUM_BLC} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ marginTop: '20px', color: '#0B4C69' }}>
                      Historique des communications
                    </Typography>
                    <Table sx={{ marginTop: '16px', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ backgroundColor: '#0B4C69', color: 'white', fontWeight: 'bold', borderRadius: '4px 4px 0 0' }}>Article</TableCell>
                          <TableCell sx={{ backgroundColor: '#0B4C69', color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                          <TableCell sx={{ backgroundColor: '#0B4C69', color: 'white', fontWeight: 'bold' }}>Pu TTC</TableCell>
                          <TableCell sx={{ backgroundColor: '#0B4C69', color: 'white', fontWeight: 'bold' }}>Quantité</TableCell>
                          <TableCell sx={{ backgroundColor: '#0B4C69', color: 'white', fontWeight: 'bold', borderRadius: '0 0 4px 4px' }}>Montant TTC</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {articles.length > 0 && articles.map((article, index) => (
                          <TableRow
                            key={article.BLCL_ARTICLE}
                            sx={{
                              backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                              '&:hover': {
                                backgroundColor: '#f1f1f1',
                              },
                            }}
                          >
                            <TableCell>{article.BLCL_ARTICLE}</TableCell>
                            <TableCell>{article.BLC_DES_ART}</TableCell>
                            <TableCell>{article.BLCL_PXU_TTC}</TableCell>
                            <TableCell>{article.BLCLQTE_L}</TableCell>
                            <TableCell>{article.BLCL_MONTANT_TTC}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Collapse>
              </Card>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHistoriqueDialogClose} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      <div>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>New Message</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              placeholder="To:"
              value={boiteMail}
                onChange={(e) => setBoiteMail(e.target.value)}

              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              placeholder="Subject:"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Type your message"
              value={messages}
              onChange={(e) => setMessages(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" style={{
                cursor: 'pointer',
                color: '#3477d3',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AttachFileIcon />
                Attach files
              </label>
              {fileNames.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    Selected files:
                  </Typography>
                  <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                    {fileNames.map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Catalog File</InputLabel>
              <Select
                value={selectedCatalogFile}
                onChange={(e) => setSelectedCatalogFile(e.target.value)}
              >
                {catalogFiles.map((file) => (
                  <MenuItem key={file.FILE_NAME} value={file.FILE_NAME}>
                    {file.FILE_NAME}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions >
            <Button
              style={{ fontSize: '15px', color: 'white', backgroundColor: '#3477d3', width: '120px', textAlign: 'center', height: '40px' }}
              onClick={handleSendCode}
            >
              Envoyé <SendIcon style={{ marginLeft: '10px' }} />
            </Button>
            <Button onClick={handleClose} style={{ fontSize: '15px' }} color="primary">
              Annuler
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openCommunicationDialog}
          onClose={() => setOpenCommunicationDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #3572EF, #3572EF)',
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            Enregistrement Communication Client {formData.nom}
          </DialogTitle>

          <DialogContent
            sx={{
              padding: '24px',
              background: '#f9fafb',
            }}
          >
            {/* Form Fields */}
            <TextField
              fullWidth
              label="Client"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#ffffff', // Lighter background for editable fields
                },
              }}
            />
            <TextField
              fullWidth
              label="Commercial"
              value={formData.commercial}
              margin="normal"
              InputProps={{ readOnly: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Raison</InputLabel>
              <Select
                value={formData.raison}
                onChange={(e) => setFormData({ ...formData, raison: e.target.value })}
              >
                <MenuItem value="Prospection">Prospection</MenuItem>
                <MenuItem value="Information">Demande d'information</MenuItem>
                <MenuItem value="Réclamation">Réclamation</MenuItem>
                
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Détails"
              multiline
              rows={4}
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#ffffff',
                },
              }}
            />
            <TextField
              fullWidth
              label="Numéro"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              margin="normal"
            />

            {/* History Section */}
            <Typography
              variant="h6"
              sx={{
                marginTop: '32px',
                marginBottom: '16px',
                color: '#3572EF',
                fontWeight: 'bold',
              }}
            >
              Historique des Communications - {formData.nom}
            </Typography>
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: '300px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: '#3572EF', color: 'white', fontWeight: 'bold' }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#3572EF', color: 'white', fontWeight: 'bold' }}>
                      Commercial
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#3572EF', color: 'white', fontWeight: 'bold' }}>
                      Raison
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#3572EF', color: 'white', fontWeight: 'bold' }}>
                      Détails
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {communicationPassagerHistory && communicationPassagerHistory.length > 0 ? (
                    communicationPassagerHistory
                      .filter((comm) => comm.NOM === formData.nom) // Filter to match STATUS
                      .map((comm, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                            '&:hover': { backgroundColor: '#e3f2fd', transition: '0.3s ease' },
                          }}
                        >
                          <TableCell>{new Date(comm.DATE_ENREGISTREMENT).toLocaleString()}</TableCell>
                          <TableCell>{comm.COMMERCIAL}</TableCell>
                          <TableCell>{comm.RAISON}</TableCell>
                          <TableCell>{comm.DETAILS}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Aucun historique trouvé pour {formData.nom}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>

          <DialogActions
            sx={{
              padding: '16px',
            }}
          >
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #3572EF, #3572EF)',
                color: 'white',
                padding: '8px 16px',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3572EF, #3572EF)',
                },
              }}
            >
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>

                <Dialog
          open={openTopArticlesDialog}
          onClose={() => setOpenTopArticlesDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
            }
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #0B4C69, #1976d2)',
              color: 'white',
              padding: '20px 24px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: '2rem' }} />
            Top 100 Articles les Plus Commandés par {client.INTITULE_CLIENT} pour les 2 derniéres années
          </DialogTitle>

          <DialogContent sx={{ padding: '24px' }}>
            <TableContainer
              sx={{
                marginTop: 2,
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        background: 'linear-gradient(135deg, #0B4C69, #1976d2)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        padding: '16px'
                      }}
                    >
                      Article
                    </TableCell>
                    <TableCell
                      sx={{
                        background: 'linear-gradient(135deg, #0B4C69, #1976d2)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        padding: '16px'
                      }}
                    >
                      Description
                    </TableCell>
                    <TableCell
                      sx={{
                        background: 'linear-gradient(135deg, #0B4C69, #1976d2)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        padding: '16px'
                      }}
                    >
                      Quantité Totale
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topArticles.map((article, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                          transition: 'background-color 0.3s ease'
                        },
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell sx={{ padding: '16px' }}>
                        {article.CCL_ARTICLE}
                      </TableCell>
                      <TableCell sx={{ padding: '16px' }}>
                        {article.CCL_DES_ART}
                      </TableCell>
                      <TableCell sx={{ padding: '16px', fontWeight: 'bold' }}>
                        {article.TOTAL_SALES}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </Dialog>

       
       



      </div>
    </CustomCardWrapper>
  );
}


const CardContainer = ({ searchTerm, selectedClientType, selectedTri,onCommunicationSelect,adr }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const user = useSelector((state) => state.user);
  const [total, setTotal] = useState(0);

  const fetchPart = async () => {
    const URL = `${BASE_URL}/api/${selectedClientType}`;

    setLoading(true);
    try {
      const params = {
        page: page,
        pageSize: pageSize,
        searchTerm: searchTerm,
        selectedTri: selectedTri,
        adr:adr
      };

      if (user.ROLE === "collaborateur" && selectedClientType === "clientsCspd") {
        params.repres = user.COMMERCIAL_OK;
      }

      const response = await axios.get(URL, { params });
      setClients(response.data.clients);
      setTotal(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('There was an error fetching the clients!');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPart();
  }, [page, pageSize, searchTerm, selectedClientType, selectedTri,adr]);
  useEffect(() => {
  setPage(0);
}, [searchTerm, selectedClientType, selectedTri,adr]);


  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ overflowY: 'auto', maxHeight: 'auto' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {clients.map(client => (
          <CustomCard
            key={client.ID_CLIENT}
            client={client}
            selectedClientType={selectedClientType}
            user={user}
            CODE_CLIENT={client.CODE_CLIENT}
              onCommunicationSelect={onCommunicationSelect}
          />
        ))}
      </Box>
      <Box
  sx={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.08)',
    padding: '2px 8px',
    zIndex: 1000,
  }}
>
  <TablePagination
    rowsPerPageOptions={[10, 25, 50, 100, 150, 200]}
    component="div"
    count={total}
    rowsPerPage={pageSize}
    page={page}
    onPageChange={handleChangePage}
    onRowsPerPageChange={handleChangeRowsPerPage}
    sx={{
      "& .MuiTablePagination-toolbar": {
        minHeight: "32px !important",
        height: "32px !important",
        px: 1,
      },
      "& .MuiTablePagination-selectLabel, \
         .MuiTablePagination-input, \
         .MuiTablePagination-displayedRows": {
        fontSize: "0.75rem",
        mb: 0,
      },
      "& .MuiTablePagination-actions button": {
        padding: "2px",
      },
    }}
  />
</Box>

    </div>
  );
};

export default CardContainer;


