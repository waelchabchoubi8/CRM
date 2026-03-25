//CardClientsPartenaires.js
import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import { styled } from '@mui/system';
import InputLabel from '@mui/material/InputLabel';
import PlaceIcon from '@mui/icons-material/Place';
import Select from '@mui/material/Select';
import { MenuItem } from '@mui/material';
import { useSelector } from 'react-redux';
import EmailIcon from '@mui/icons-material/Email';
import HistoryIcon from '@mui/icons-material/History';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CallIcon from '@mui/icons-material/Call';
import PersonIcon from '@mui/icons-material/Person';
import {
  CardActions,
  CardContent,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import PhoneForwardedIcon from '@mui/icons-material/PhoneForwarded';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import BASE_URL from '../../Utilis/constantes';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import dateIcon from '../../icons/NAISS.png'
import { TablePagination } from '@mui/material';
import { Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const CustomCardWrapper = styled(Card)(({ theme }) => ({
  width: 'calc(33.00% - 16px)',
  margin: theme.spacing(1),
  border: '1px solid #ccc',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
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

function CustomCard({ client, user,onClientCommunicationStart }) {
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState([])
  const [raisonList, setRaisonList] = useState([]);
  const [openHistoriqueDialog, setOpenHistoriqueDialog] = useState(false);
  const [openDialogCalls, setOpenDialogCalls] = useState(false);
  const [qualificationList, setQualificationList] = useState([]);
  const [tarifs, setTarifs] = useState([])
  const [selectedRaison, setSelectedRaison] = useState('');
  const [openTarifDialog, setOpenTarifDialog] = useState(false);
  const [encoursData, setEncoursData] = useState(null);
  const [boiteMail, setBoiteMail] = useState("");
  const [subject, setSubject] = useState('');
  const [messages, setMessages] = useState('');
  const [fileNames, setFileNames] = useState([]);
  const [catalogFiles, setCatalogFiles] = useState([]);
  const [emailSent, setEmailSent] = useState(false);
  const [isClientDetailsVisible, setIsClientDetailsVisible] = useState(false);
  const [communicationHistory, setCommunicationHistory] = useState([]);
  const [editing, setEditing] = useState(false);
  const [commandes, setCommandes] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [articles, setArticles] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedCatalogFile, setSelectedCatalogFile] = useState('');
  const [currentUser, setCurrentUser] = useState({
    COLLABORATOR: user.LOGIN,
    CALL_DATE: new Date().toISOString().slice(0, 16),
    RAISON: '',
    DESCRIPTION: '',
    CLIENT_ID: ''
  });
  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!subject || !messages || !boiteMail) {
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
  const startClientCommunication = (type) => {
  const payload = {
    SOURCE: "CLIENT_PARTENAIRE",
    ENTITY_ID: client.CODE_CLIENT,
    ENTITY_LABEL: client.INTITULE_CLIENT,
    TYPE_APPEL: type,
    NUMERO_TELEPHONE: client.TEL_CLIENT_F,
    EMAIL: client.EMAIL,
    COLLABORATOR: user.LOGIN,
    NOM_CLIENT: client.INTITULE_CLIENT || "", 
    SCHEMA: "FDM",
  };

  console.log("📤 CLIENT COMMUNICATION SEND:", payload);
  onClientCommunicationStart?.(payload);
};

  useEffect(() => {
    if (client?.EMAIL) {
      setBoiteMail(client.EMAIL);
    }
  }, [client]);
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    const names = selectedFiles.map(file => file.name);
    setFileNames(names);
  };
  useEffect(() => {
    axios.get(`${BASE_URL}/api/RaisonsList`)
      .then(response => setRaisonList(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  useEffect(() => {
    axios.get(`${BASE_URL}/api/raisonQualifications`)
      .then(response => {
        setRaisonList(response.data);
      })
      .catch(error => {
        console.error('Error fetching raison qualifications:', error);
      });
    axios.get(`${BASE_URL}/api/QualificationAppels`)
      .then(response => setQualificationList(response.data))
      .catch(error => console.error('Error fetching data:', error));
    axios.get(`${BASE_URL}/api/raisonQualifications`)
    axios.get(`${BASE_URL}/api/RaisonsList`)
      .then(response => {
        setRaisonList(response.data)
      }
      )
      .catch(error => console.error('Error fetching data:', error));
  }, [])

  useEffect(() => {
    if (selectedRaison) {
      const qualificationIds = params
        .filter(param => param.ID_RAISON === selectedRaison.ID_RAISON)
        .map(param => param.ID_QUALIFICATION);
    }
  }, [selectedRaison, params, qualificationList]);
  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleHistoriqueDialogOpen = async () => {
    try {
      const result = await axios.get(`${BASE_URL}/api/cmdClients`, {
        params: {
          base: "fdm", code: client.CODE_CLIENT
        }
      });
      setCommandes(result.data);
    } catch (error) {
      console.error('Error fetching commands:', error);
    }
    setOpenHistoriqueDialog(true);
  };

  const handleCardClick = async (command) => {
    setExpanded(prev => (prev === command.NUM_BLC ? null : command.NUM_BLC));
    try {
      const result = await axios.get(`${BASE_URL}/api/articlescmd`, {
        params: {
          reference: command.NUM_BLC,
          base: "fdm"
        }
      });
      setArticles(result.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleHistoriqueDialogClose = () => {
    setOpenHistoriqueDialog(false);
  };

  const fetchCommunicationHistory = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/callscspd`, {
        params: { id_client: client.CODE_CLIENT }
      });
      if (response.status !== 200) {
        throw new Error('Failed to fetch communication history');
      }
      setCommunicationHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching communication history:', error);
    }
  };
  

  const formatDate = (date) => {
    if (!date || isNaN(new Date(date))) {
      console.error("Invalid date provided:", date);
      return null; 
    }
    const dateObj = new Date(date);
    const tunisiaTime = new Date(dateObj.getTime() + 1 * 60 * 60 * 1000);
    const year = tunisiaTime.getFullYear();
    const month = String(tunisiaTime.getMonth() + 1).padStart(2, '0');
    const day = String(tunisiaTime.getDate()).padStart(2, '0');
    const hours = String(tunisiaTime.getHours()).padStart(2, '0');
    const minutes = String(tunisiaTime.getMinutes()).padStart(2, '0');
    const seconds = String(tunisiaTime.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  

  const fetchEncoursData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/clientsEncoursFdm`, {
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

  const handleDialogAppels = async () => {
    await fetchCommunicationHistory();
    setOpenDialogCalls(true);
  };


  const makeCall = () => {
    const sipUrl = `sip:${client.TEL_CLIENT_F}`;
    window.location.href = sipUrl;
  };

  const handleHistoriqueDialogCloseCalls = () => {
    setOpenDialogCalls(false);
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
  return (

    <CustomCardWrapper style={{ backgroundColor: 'white', borderRadius: '15px', border: 'transparent' }}>
      <CustomCardContent >
        <GlowingBox style={{ backgroundColor: client.CC_BLOQUER ? "red" : "#3572EF", borderRadius: '11px' }}>
          <Typography
            variant="h6"
            component="div"
            align="center"
            style={{
              color: "white",
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
            {client.INTITULE_CLIENT.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{client.INTITULE_GR ? client.INTITULE_GR.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())
              : " "
            }</span>
          </Typography>
        </GlowingBox>
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
            <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Encours client:</strong> {/*command.ENCOURSREG*/}{Number(encoursData.ENCOURSREG) + Number(encoursData.SOLDE_CLIENT) + Number(encoursData.BLNONFACT)}
            </Typography>
            <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Encours autorisé:</strong> {encoursData.ENCOURS_MAX_C}
            </Typography>
            <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
              <strong>Encours supp:</strong> {encoursData.ENCOURS_SUPP}
            </Typography>
          </Box>
        )}
        <Typography variant="h6" component="div" gutterBottom style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <LocalPhoneIcon />
          <Button onClick={makeCall} variant="text" color="primary">{client.TEL_CLIENT_F}</Button>
        </Typography>
        <Typography variant="h6" component="div" gutterBottom  >
          <PlaceIcon />
          {client.ADR_C_FACT_1.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())}
        </Typography>
        <Typography variant="h6" component="div" gutterBottom  >
          <PlaceIcon />
          {client.SOLDE_CLIENT}
        </Typography>
        <Typography variant="h6" component="div" gutterBottom style={{ display: "flex", alignItems: "center", marginBottom: 10, color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <PersonIcon />{client.INTITULE_REPRES
            ? client.INTITULE_REPRES.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())
            : ""
          }
        </Typography>
        <Typography id="x" variant="body2" color="text.secondary" style={{ display: "flex", alignItems: "center", marginBottom: 10, color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <EmailIcon />{client.EMAIL}
          {client.ADR_C_FACT_3
          }  <Button onClick={handleClickOpen}>
            envoyer un catalogue </Button>
        </Typography>
        <>
          {client.NUM_DER_BON ? (
            <Typography variant="body2" color="text.secondary">
              <Grid container style={{ marginTop: '10px', color: "black", alignItems: 'flex-start', fontFamily: 'sans-serif', display: 'inline-flex', fontWeight: 'bold' }}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead style={{ fontSize: '10px' }}>
                      <TableRow>
                        <TableCell style={{ fontSize: '12px' }}>Derniére commande</TableCell>
                        <TableCell style={{ fontSize: '12px' }}>Date</TableCell>
                        <TableCell style={{ fontSize: '12px' }}>Prix</TableCell>
                        <TableCell style={{ fontSize: '12px' }}>Nombre des jours</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow key={client.ID_CLIENT} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell style={{ fontWeight: 'bold', color: '#387ADF', borderRadius: '12px' }}>{client.NUM_DER_BON}</TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: 'black', borderRadius: '12px' }}>{new Date(client.DATE_DER_BON).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: 'green', borderRadius: '12px' }}>{client.TOT_TTC_BLC}</TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: 'red', borderRadius: '12px' }}>{client.NBR_JOURS}</TableCell>
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
                    <TableHead style={{ fontSize: '10px' }}>
                      <TableRow>
                        <TableCell style={{ width: '600px ', fontSize: '12px', textAlign: 'center' }}>
                          <img src={dateIcon} alt="person icon" style={{ marginRight: 8, width: "20px", height: "20px" }} />
                          Info commande
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow key={client.ID_CLIENT} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell style={{ fontWeight: 'bold', color: '#5E6073', borderRadius: '12px', textAlign: 'center' }}> <ProductionQuantityLimitsIcon style={{ color: "#5E6073" }} /> Aucune commande! </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Typography>
          )}
        </>
        <Typography variant="body2" color="text.secondary" style={{ display: "flex", alignItems: "center", fontWeight: "bold", marginTop: "10px", color: "red" }}></Typography>
      </CustomCardContent>
      <CustomCardActions style={{
        width: "100%",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2px'
      }}>
        <CustomButton
  startIcon={<PhoneForwardedIcon />}
  onClick={() => startClientCommunication("appel sortant")}
>
  Sortant
</CustomButton>

<CustomButton
  startIcon={<PhoneCallbackIcon />}
  onClick={() => startClientCommunication("appel entrant")}
>
  Entrant
</CustomButton>


        <CustomButton
          style={{
            color: "#478CCF",
            fontWeight: 'bold',
            minWidth: '120px'
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
            minWidth: '120px'
          }}
          startIcon={<HistoryIcon />}
          onClick={() => handleHistoriqueDialogOpen()}
          size="medium"
        >
          Historique des commandes
        </CustomButton>

      </CustomCardActions>

      

      <Dialog open={openDialogCalls} >
        <DialogTitle>Historique des communications</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date et heure</TableCell>
                <TableCell>Commercial</TableCell>
                <TableCell>Raison</TableCell>
                <TableCell>Détails</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {communicationHistory.length > 0 ? (
                communicationHistory.map((comm, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(comm.CALL_DATE).toLocaleString()}</TableCell>
                    <TableCell>{comm.COLLABORATOR}</TableCell>
                    <TableCell>{comm.RAISON}</TableCell>
                    <TableCell>{comm.DESCRIPTION}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">Aucun historique de communication trouvé</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
              <Card sx={{ height: '100%', marginBottom: "20px" }}>
                <CardContent sx={{ cursor: 'pointer', position: 'relative', height: '200px', marginBottom: "20px" }}>

                  <Typography
                    variant="h6"
                    sx={{
                      color: '#2196F3',
                      textShadow: '0 0 8px rgba(33, 150, 243, 0.7)',
                      fontWeight: 'bold',
                      border: '1px solid #2196F3',
                      padding: '8px',
                      borderRadius: '4px',
                      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    Bon de livraison: {command.NUM_BLC}  {command.DATE_BLC}
                  </Typography>
                  <Typography>Code Client: {command.CLIENT_BLC}</Typography>
                  <Typography>Client: {command.ADR_BLC_1}</Typography>
                  <Typography>Adresses Client: {command.ADR_BLC_2}, {command.ADR_BLC_3}</Typography>
                  <Typography>Total: {command.BLC_TOTAL}</Typography>
                  <IconButton
                    onClick={() => handleCardClick(command)}
                    aria-expanded={expanded === command.NUM_BLC}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </CardContent>
                <Collapse in={expanded === command.NUM_BLC} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Article</TableCell>
                          <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Description</TableCell>
                          <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Pu TTC</TableCell>
                          <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Quantité</TableCell>
                          <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Montant TTC</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {articles.length > 0 && articles.map((article) => (
                          <TableRow key={article.BLCL_ARTICLE}>
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
      <Dialog open={openTarifDialog} onClose={() => setOpenTarifDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Tarifs par famille
        </DialogTitle>
        <DialogContent>
          <TableContainer style={{ maxHeight: '80%', overflowY: 'auto', border: '1px solid black' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Famille</TableCell>
                  <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Remise</TableCell>
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
      <div>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>New Message</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              placeholder="To:"
              value={boiteMail}
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

            {/* Catalog file selection */}
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
      </div>
    </CustomCardWrapper>
  );
}

const CardContainer = ({ searchTerm,onClientCommunicationStart }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filteredClients, setFilteredClients] = useState([]);
  const user = useSelector((state) => state.user);

  const fetchPart = async () => {
    const URL = `${BASE_URL}/api/clientsPartenaires`;
    setLoading(true);
    try {
      const params = {
        page: page,
        pageSize: pageSize,
        searchTerm: searchTerm,
      };
      const response = await axios.get(URL, { params });
      setClients(response.data.clients);
      setTotal(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('There was an error fetching family clients');
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPart();
  }, [page, pageSize, searchTerm]); 

  useEffect(() => {
    const filtered = clients.filter(client =>
      client && (
        (client.INTITULE_GR === "Partenaire"
          || client.INTITULE_CLIENT.toUpperCase().startsWith("Par"))
        && !client.INTITULE_CLIENT.startsWith("Fam")
      )
    );
    setFilteredClients(filtered);
  }, [clients, page, pageSize, searchTerm]);

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
        {clients.length > 0 ? (
          clients.map(client => (
            <CustomCard key={client.ID_CLIENT} name={client.INTITULE_GR} client={client} user={user}   onClientCommunicationStart={onClientCommunicationStart} />
          ))
        ) : (
          <p>No clients match the filter.</p>
        )}
      </Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          backgroundColor: '#fff',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
          padding: '8px 16px',
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
        />
      </Box>
    </div>
  );
};

export default CardContainer;

