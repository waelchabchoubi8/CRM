//cardPartenaire.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircleOutline } from '@mui/icons-material';
import SendIcon from '@mui/icons-material/Send';
import theme from '../../Theme';
import {
  FormControl,
  Chip,
  CircularProgress,
  Alert,
  Fade,
  Container,
  Paper,
} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import PhoneForwardedIcon from '@mui/icons-material/PhoneForwarded';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import TablePagination from '@mui/material/TablePagination';
import { Select, MenuItem, InputLabel } from '@mui/material';
import { useSelector } from 'react-redux';
import { Grid } from '@mui/material';
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { IconButton } from '@mui/material';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  FormHelperText
} from '@mui/material';
import BASE_URL from '../../Utilis/constantes';
import entete from '../../images/sahar up.png';
import { CalendarIcon } from '@mui/x-date-pickers';
import {
  Person as PersonIcon,
  Call as CallIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  History as HistoryIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  GetApp as GetAppIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    padding: theme.spacing(2)
  }
}));

const DialogHeader = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTypography-root': {
    fontWeight: 600
  }
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTextField-root': {
    marginBottom: theme.spacing(2)
  },
  '& .MuiInputLabel-root': {
    marginBottom: theme.spacing(1)
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 600,
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '8px 24px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  }
}));

const StatusBadge = styled(Box)(({ theme, color }) => ({
  padding: '8px 16px',
  borderRadius: '20px',
  backgroundColor: color || theme.palette.primary.main,
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.875rem',
  marginBottom: theme.spacing(2),
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1.5),
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
  }
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  minHeight: '100vh',
  background: 'linear-gradient(145deg, #f6f8fc 0%, #f0f4f8 100%)',
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: `calc(100vh - 100px)`,
  paddingBottom: '70px',
}));

const GridContainer = styled(Grid)(({ theme }) => ({
  '& .MuiGrid-item': {
    display: 'flex',
    width: '33.333%',
  },
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.8)',
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
}));

const StyledPagination = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  zIndex: 1000,
  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
}));

const NoResultsMessage = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
}));
function CustomCard({ client, user, fetchPart, onCommunicationSelect }) {
  const theme = useTheme();
  const [details, setDetails] = useState('');
  const [openCommSuccess, setOpenCommSuccess] = useState(false);
const [openPartSuccess, setOpenPartSuccess] = useState(false);

  const [SelectValue1, setSelectValue1] = useState('');
  const [SelectValue2, setSelectValue2] = useState('');
  const [dSelectValue2, setSelectValue3] = useState('');
  const [raisonList, setRaisonList] = useState([]);
  const [qualificationList, setQualificationList] = useState([]);
  const [selectedPartenaire, setSelectedPartenaire] = useState('');
  const [statuts, setStatus] = useState([])
  const [params, setParams] = useState([])
  const [contrat, setContrat] = useState(client.CONTRAT);
  const [selectedFile, setSelectedFile] = useState(null)
  const contratUrl = client.CONTRAT ? `http://192.168.1.195/api/Requests/contrat_partenaires/${client.CONTRAT}` : null;
  const [list, setList] = useState([])
  const [cv, setCv] = useState(client.CV);
  const [selectedCv, setSelectedCv] = useState(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [enteteBase64, setEnteteBase64] = useState('');
  const [openHistorique, setOpenHistorique] = useState(false);

  const handleOpenHistorique = async (client) => {
    setSelectedPartenaire(client);
    setOpenHistorique(true);

    const coms = await axios.get(
      `${BASE_URL}/api/getComPart`,
      {
        params: {
          id: client.ID_PARTENAIRE
        }
      }
    );
    setCommunications(coms.data);

  };
  const handleCloseHistorique = () => setOpenHistorique(false);

  useEffect(() => {

    convertEnteteToBase64();
  }, []);
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("file", file.name)
      setContrat(file.name);
    }
  };

  const convertEnteteToBase64 = () => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      setEnteteBase64(dataURL);
    };
    img.onerror = function (err) {
      console.error('Error loading image for Base64 conversion:', err);
    };
    img.src = entete;
  };
  const handlePrint = (client) => {
    if (!enteteBase64) {
      alert('L\'image d\'en-tête n\'est pas encore chargée.');
      return;
    }
    const printContent = `
      <html>
        <head>
          <img src="${enteteBase64}" alt="En-tête" class="header-image">

          <title>Nouvelle demande de partenariat  - ${client.NOM_PRENOM}</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .content {
              padding: 20px;
              margin-top: -800px;
            }
            .info-row {
              margin: 10px 0;
              display: flex;
              align-items: center;

            }
            .label {
              font-weight: bold;
              width: 150px;
              color: #333;
            }
            .value {
              color: black;
            }
           .header-image {
            width: 100%;
            max-height: 100%;
            object-fit: contain;
             }
          </style>
        </head>
        <body>
          <div class="header">

          </div>
          <div class="content">
            <h1>Nouvelle demanade de partenariat  </h1>
            <h3>Détails de profils : </h3>
          <div class="info-row">
              <span class="value">Date demande :${client.DATE_COMMUNICATION}</span>
            </div>
            <div class="info-row">
              <span class="value">Nom et Prénom:${client.NOM_PRENOM}</span>
            </div>
            <div class="info-row">
              <span class="value">Téléphone:${client.NUMERO_TELEPHONE}</span>
            </div>
            <div class="info-row">
              <span class="value">Date de Naissance:${formatDate(client.DATE_NAISSANCE)}</span>
            </div>
            <div class="info-row">
              <span class="value">Adresse:${client.ADRESSE}</span>
            </div>
            <div class="info-row">
              <span class="value">Email:${client.EMAIL}</span>
            </div>
            <div class="info-row">
              <span class="value">Niveau scolaire :${client.NIVEAU_SCOLAIRE} </span>
            </div>
            <div class="info-row">
              <span class="value">Formation :${client.FORMATION}</span>
            </div>
             </div>
           
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', `Fiche_${client.NOM_PRENOM}`);
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    } else {
      console.error('Failed to open print window.');
      alert('Impossible d\'ouvrir la fenêtre d\'impression.');
    }
  };

  const makeCall = () => {
    const sipUrl = `sip:${client.TEL_CLIENT_F}`;
    console.log("SIP URL:", sipUrl);
    window.location.href = sipUrl;
  };

  const handleCvUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedCv(file);
      console.log("file", file.name)
      setCv(file.name);
    }
  };
  const handleSaveContrat = async () => {
    if (!selectedFile && !selectedCv) {
      alert('Veuillez télécharger un contrat ou bien cv');
      return;
    }

    const uploadFile = async (url, formData) => {
      const response = await axios.post(url, formData);
      return response.status === 200;
    };

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const [updateContrat, updateStatus] = await Promise.all([
          axios.put(`${BASE_URL}/api/updatePartContrat`, {
            id: client.ID_PARTENAIRE,
            contrat: selectedFile.name,
          }),
          axios.put(`${BASE_URL}/api/updatePartStatus`, {
            id: client.ID_PARTENAIRE,
            id_statut: statuts.find(s => s.AVANCEMENT === 'Contrat signé')?.ID_STATUT
          })
        ]);

        const contractUploadSuccess = await uploadFile('http://192.168.1.195/api/Requests/upload_contrat.php', formData);

        if (contractUploadSuccess) {
          alert('Contrat enregistré avec succès !');
          await fetchPart();
        }
      }

      if (selectedCv) {
        const formDataCv = new FormData();
        formDataCv.append('file', selectedCv);

        await axios.put(`${BASE_URL}/api/updatePartCv`, {
          id: client.ID_PARTENAIRE,
          cv: selectedCv.name
        });

        const cvUploadSuccess = await uploadFile('http://192.168.1.195/api/Requests/upload_cv.php', formDataCv);

        if (cvUploadSuccess) {
          alert('Cv enregistré avec succès !');
          await fetchPart();
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du fichier :', error);
      alert('Échec de l\'enregistrement du fichier.');
    }
  };

  const handleAcceptPart = async () => {
    const id = statuts.filter((s) => s.AVANCEMENT === 'En cours de signature')
    console.log(id)
    await axios.put(
      `${BASE_URL}/api/updatePartStatus`,
      { id: client.ID_PARTENAIRE, id_statut: id[0]?.ID_STATUT }
    );
    await fetchPart()
    setOpenInfoDialogue(false)
  }
  useEffect(() => {
    axios.get(`${BASE_URL}/api/RaisonsList`)
      .then(response => setRaisonList(response.data))
      .catch(error => console.error('Error fetching data:', error));
    axios.get(`${BASE_URL}/api/QualificationAppels`)
      .then(response => setQualificationList(response.data))
      .catch(error => console.error('Error fetching data:', error));
    axios.get(`${BASE_URL}/api/raisonQualifications`)
      .then(response => setParams(response.data))
      .catch(error => console.error('Error fetching data:', error));
    axios.get(`${BASE_URL}/api/raisonStatuts`)
      .then(response => setList(response.data))
      .catch(error => console.error('Error fetching data:', error));
    axios.get(`${BASE_URL}/api/StatutPartenaires`)
      .then(response => setStatus(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const [communications, setCommunications] = useState([])
 

  
  
  const [openInfoDialogue, setOpenInfoDialogue] = useState(false)

  const onClose = () => {
    setOpenInfoDialogue(false)
  }
  const cvUrl = client.CV ? `http://192.168.1.195/api/Requests/cv_partenaires/${client.CV}` : null;
  const [messages, setMessages] = useState('');
  const [codeSent, setCodeSent] = useState();
  const handleSendCode = async (e) => {
    let loginmail = (client.NUMERO_TELEPHONE)
    let code = (client.MOT_DE_PASSE)
    let username = (client.NOM_PRENOM)
    return await axios.post('http://192.168.1.170:3300/signin', { email: client.EMAIL, loginmail, username, code }, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': ''
      }
    })
      .then(res => {
        alert(res.data)
        setMessages(res.data);
        setCodeSent(true);
      })
      .catch(error => {
        alert(error)
        setMessages('Error sending verification code');
      });
  }
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setClientToDelete(null);
  };
  const handleConfirmDelete = async () => {
    try {
      await axios.post('http://192.168.1.195/api/Requests/jeux.php?action=delete-profil-part', {
        id: clientToDelete.ID_PARTENAIRE
      });
      await axios.delete(`${BASE_URL}/api/deletePart/${clientToDelete.ID_PARTENAIRE}`);
      fetchPart();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Failed to delete partner:', error);
    }
  };
  return (
    <StyledCard>
      <CardContent>
        <StatusBadge color={client.COULEUR}>
          {client.AVANCEMENT || client.STATUS || "Non encore traité"}
        </StatusBadge>

        <InfoRow>
          <PersonIcon />
          <Typography variant="h6">
            {client.NOM_PRENOM}
          </Typography>
        </InfoRow>

        <InfoRow>
          <CallIcon />
          <Button
            onClick={makeCall}

            color="primary"
          >
            {client.NUMERO_TELEPHONE}
          </Button>
        </InfoRow>
        <InfoRow sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EmailIcon color="primary" />
          <Typography>{client.EMAIL}</Typography>

          {codeSent ? (
            <Chip
              icon={<CheckCircleIcon />}
              label="Code envoyé"
              color="success"
              size="small"
              sx={{
                animation: 'fadeIn 0.5s ease-in',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0 },
                  '100%': { opacity: 1 }
                }
              }}
            />
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<SendIcon />}
              onClick={handleSendCode}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white'
                }
              }}
            >
              Envoyer code
            </Button>
          )}
        </InfoRow>


        <InfoRow>
          <LocationIcon />
          <Typography>
            {client.ADRESSE}
          </Typography>
        </InfoRow>

        <InfoRow>
          <HistoryIcon />
          <Typography>
            {formatDate(client.DATE_COMMUNICATION)}
          </Typography>
        </InfoRow>
      </CardContent>

      <CardActions sx={{ padding: 2, justifyContent: 'space-between' }}>
       <ActionButton
  startIcon={<PhoneIcon />}
  onClick={() => {
    const payload = {
      TYPE_APPEL: "appel sortant",
      ID_CLIENT: client.ID_PARTENAIRE,
      NOM_PRENOM: client.NOM_PRENOM,
      NUMERO_TELEPHONE: client.NUMERO_TELEPHONE,
      EMAIL: client.EMAIL,
      COLLABORATOR: user.LOGIN,
      SOURCE: "PARTENAIRE"
    };

    onCommunicationSelect?.(payload);
  }}
>
  Sortant
</ActionButton>





        <ActionButton
  startIcon={<PhoneIcon />}
  onClick={() => {
    const payload = {
      TYPE_APPEL: "appel entrant",
      ID_CLIENT: client.ID_PARTENAIRE,
      NOM_PRENOM: client.NOM_PRENOM,
      NUMERO_TELEPHONE: client.NUMERO_TELEPHONE,
      EMAIL: client.EMAIL,
      COLLABORATOR: user.LOGIN,
      SOURCE: "PARTENAIRE"
    };


    onCommunicationSelect?.(payload);
  }}
>
  Entrant
</ActionButton>


        <ActionButton
          startIcon={<DescriptionIcon />}
          onClick={() => setOpenInfoDialogue(true)}
          disabled={client.AVANCEMENT === "Enregistre"}
        >
          Document
        </ActionButton>

        <ActionButton
          startIcon={<HistoryIcon />}
          onClick={() => handleOpenHistorique(client)}
          disabled={client.AVANCEMENT === "Enregistre"}
        >
          Historique
        </ActionButton>

        <ActionButton
          startIcon={<PrintIcon />}
          onClick={() => handlePrint(client)}
          disabled={client.AVANCEMENT === "Enregistre"}
        >
          Imprimer
        </ActionButton>
      </CardActions>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '16px',
            maxWidth: '400px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'error.main',
          pb: 1
        }}>
          Confirmation de suppression
        </DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
            Êtes-vous sûr de vouloir supprimer ce partenaire?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ gap: 2, px: 2, pb: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              px: 3,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Non
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{
              borderRadius: '8px',
              px: 3,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: 'error.dark'
              }
            }}
          >
            Oui
          </Button>
        </DialogActions>
      </Dialog>

      


      <Dialog
        open={openInfoDialogue}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '16px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Plus d'informations
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'grey.500',
              '&:hover': {
                color: 'grey.700',
                backgroundColor: 'grey.100'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ padding: '24px' }}>
          <Grid container spacing={3}>
            {/* CV Section */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: '12px',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>CV</Typography>

                <TextField
                  margin="dense"
                  id="niveau-scolaire"
                  label="Niveau Scolaire"
                  type="text"
                  fullWidth
                  value={client.NIVEAU_SCOLAIRE}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />

                <TextField
                  margin="dense"
                  id="formations"
                  label="Formations"
                  type="text"
                  fullWidth
                  multiline
                  rows={4}
                  value={client.FORMATION}
                  sx={{
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />

                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  {cvUrl ? (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                      backgroundColor: 'grey.50',
                      borderRadius: '8px',
                      padding: '8px'
                    }}>
                      <TextField
                        margin="dense"
                        id="cv"
                        label="CV"
                        type="text"
                        fullWidth
                        value={cv || "CV non disponible"}
                        disabled={!client.CV}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'transparent'
                          }
                        }}
                      />
                      <IconButton
                        sx={{
                          color: 'success.main',
                          '&:hover': {
                            backgroundColor: 'success.light'
                          }
                        }}
                        onClick={() => cvUrl && window.open(cvUrl, '_blank')}
                      >
                        <GetAppIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">CV non disponible</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Contract Section */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: '12px',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Contrat</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {contratUrl ? (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                      backgroundColor: 'grey.50',
                      borderRadius: '8px',
                      padding: '8px'
                    }}>
                      <TextField
                        margin="dense"
                        id="contrat"
                        label="Contrat"
                        type="text"
                        fullWidth
                        value={contrat || "Contrat non disponible"}
                        disabled={!client.CONTRAT}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'transparent'
                          }
                        }}
                      />

                    </Box>
                  ) : (
                    <TextField
                      margin="dense"
                      id="contrat"
                      label="Contrat"
                      type="text"
                      fullWidth
                      value="Contrat non disponible"
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px'
                        }
                      }}
                    />
                  )
                  } <IconButton
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light'
                      }
                    }}
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    <CloudUploadIcon />
                  </IconButton>
                </Box>

                <input
                  type="file"
                  id="file-input"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />

                {(user.ROLE === "administrateur" && client.CONTRAT === '') && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    sx={{
                      mt: 2,
                      width: '100%',
                      borderRadius: '8px',
                      padding: '12px',
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                    onClick={handleAcceptPart}
                  >
                    Accepter comme partenaire
                  </Button>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveOutlinedIcon />}
            onClick={() => handleSaveContrat(client)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              backgroundColor: 'grey.100',
              color: 'grey.900',
              '&:hover': {
                backgroundColor: 'grey.200'
              },
              padding: '12px 24px',
              fontWeight: 600
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPartSuccess}
        onClose={() => setOpenPartSuccess(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '400px',
            background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          }
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <CheckCircleOutline
            sx={{
              fontSize: 68,
              color: 'success.main',
              animation: 'popIn 0.5s ease-out',
              '@keyframes popIn': {
                '0%': { transform: 'scale(0)' },
                '70%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' },
              }
            }}
          />
        </Box>

        <DialogTitle
          sx={{
            color: 'success.main',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.5rem',
            pb: 1
          }}
        >
          Succès!
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              textAlign: 'center',
              fontSize: '1.1rem',
              color: 'text.primary',
              mb: 3
            }}
          >
            Partenaire enregistré avec succès.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setOpenPartSuccess(false)}
            variant="contained"
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
              '&:hover': {
                bgcolor: 'success.dark',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out',
              }
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={openCommSuccess}
        onClose={() => setOpenCommSuccess(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '400px',
            background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          }
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <CheckCircleOutline
            sx={{
              fontSize: 68,
              color: 'success.main',
              animation: 'popIn 0.5s ease-out',
              '@keyframes popIn': {
                '0%': { transform: 'scale(0)' },
                '70%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' },
              }
            }}
          />
        </Box>

        <DialogTitle
          sx={{
            color: 'success.main',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.5rem',
            pb: 1
          }}
        >
          Succès!
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              textAlign: 'center',
              fontSize: '1.1rem',
              color: 'text.primary',
              mb: 3
            }}
          >
            Communication enregistrée avec succès.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setOpenCommSuccess(false)}
            variant="contained"
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
              '&:hover': {
                bgcolor: 'success.dark',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out',
              }
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <StyledDialog
        open={openHistorique}
        onClose={handleCloseHistorique}
        maxWidth="xl"
        fullWidth
      >
        <DialogHeader>
          Historique communication
          <IconButton onClick={handleCloseHistorique}>
            <CloseIcon />
          </IconButton>
        </DialogHeader>
        <DialogContent>
          <TableContainer sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Date communication</StyledTableCell>
                  <StyledTableCell>Détails communication</StyledTableCell>
                  <StyledTableCell>Raison d'appel</StyledTableCell>
                  <StyledTableCell>Qualification d'appel</StyledTableCell>
                  <StyledTableCell>Collaborateur</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {communications.map((c) => (
                  <TableRow key={c.ID_COMMUNICATION} hover>
                    <TableCell>{formatDate(c.DATE_COMMUNICATION)}</TableCell>
                    <TableCell>{c.DETAILS_COMMUNICATION}</TableCell>
                    <TableCell>{c?.RAISON}</TableCell>
                    <TableCell>{c?.QUALIFICATION}</TableCell>
                    <TableCell>{c.COLLABORATOR}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </StyledDialog>
    </StyledCard>

  );
}
const CardContainer = ({ searchTerm, selectedAvancement, setTotalObj,onCommunicationSelect }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const user = useSelector((state) => state.user);
  const theme = useTheme();

  const fetchPart = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        searchTerm,
        avancement: selectedAvancement,
        ...(user.ROLE === "collaborateur" && { user: user.LOGIN })
      };

      const response = await axios.get(`${BASE_URL}/api/partenaires`, { params });

      const enhancedClients = response.data.clients.map(client => ({
        ...client,
        selectedCli: false,
        collab: false,
      }));

      setClients(enhancedClients);
      setTotal(response.data.total);
      setTotalObj("par", response.data.total);
    } catch (error) {
      setError('Une erreur est survenue lors du chargement des données.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPart();
  }, [page, pageSize, searchTerm, selectedAvancement]);

  if (error) {
    return (
      <StyledContainer>
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            borderRadius: 2,
            boxShadow: theme.shadows[3],
          }}
        >
          {error}
        </Alert>
      </StyledContainer>
    );
  }

  return (

    <StyledContainer maxWidth={false}>
      <ContentWrapper>
        {loading && (
          <LoadingOverlay>
            <CircularProgress size={60} thickness={4} />
          </LoadingOverlay>
        )}

        <Fade in={!loading} timeout={500}>
          <Box>
            {clients.length > 0 ? (
              <GridContainer container spacing={3}>
                {clients.map((client) => (
                  <Grid item xs={12} sm={12} md={4} lg={4} xl={4} key={client.ID_PARTENAIRE}>
                    <CustomCard
                      client={client}
                      setClients={setClients}
                      user={user}
                      fetchPart={fetchPart}
                        onCommunicationSelect={onCommunicationSelect}

                    />
                  </Grid>
                ))}
              </GridContainer>
            ) : (
              <NoResultsMessage>
                <Typography variant="h6">
                  Aucun résultat trouvé
                </Typography>
                <Typography variant="body2">
                  Essayez de modifier vos critères de recherche
                </Typography>
              </NoResultsMessage>
            )}
          </Box>
        </Fade>

        <StyledPagination elevation={0}>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(event) => {
              setPageSize(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[12, 24, 36, 48]}
            labelRowsPerPage="Éléments par page"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
            }
          />
        </StyledPagination>
      </ContentWrapper>
    </StyledContainer>
  );
};

export default CardContainer;
