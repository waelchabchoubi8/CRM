//CardInvestisseurs.js
import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import { CalendarIcon } from '@mui/x-date-pickers';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import PhoneForwardedIcon from '@mui/icons-material/PhoneForwarded';
import EmailIcon from '@mui/icons-material/FileOpen';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import TablePagination from '@mui/material/TablePagination';
import { Select, MenuItem, InputLabel } from '@mui/material';
import { useSelector } from 'react-redux';
import PersonIcon from '@mui/icons-material/Person';
import CallIcon from '@mui/icons-material/Call';
import { Grid } from '@mui/material';
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BASE_URL from '../../Utilis/constantes';
const GlowingBox = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 20,
  boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)',
  transition: 'box-shadow 0.3s ease-in-out',
  padding: '10px',
  '&:hover': {
    boxShadow: '0 0 16px rgba(0, 0, 0, 0.5)',
  },
}));

const CustomCardWrapper = styled(Card)(({ theme }) => ({
  width: '100%',
  margin: theme.spacing(1),
  border: '1px solid #ccc',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'box-shadow 0.3s ease-in-out',
  height: '380px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
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
const CustomCardActions = styled(CardActions)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 16px',
  height: '50px',
}));

const CustomButton = styled(Button)(({ theme }) => ({
  fontSize: '0.75rem',
  minWidth: 'auto',
  display: 'flex',
  alignItems: 'center',
}));

const GreenButton = styled(CustomButton)(({ theme }) => ({
  color: theme.palette.success.main,
  '& .MuiButton-startIcon': {
    color: theme.palette.success.main,
  },
}));

function CustomCard({ client, setClients, user, fetchPart,onCommunicationSelect }) {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [dateTime, setDateTime] = useState('');
  const [details, setDetails] = useState('');
  const [selectValue1, setSelectValue1] = useState('');
  const [selectValue2, setSelectValue2] = useState('');
  const [selectValue3, setSelectValue3] = useState('');
  const [detailsCommunication, setDetailsCommunication] = useState('');
  const [raisonList, setRaisonList] = useState([]);
  const [qualificationList, setQualificationList] = useState([]);
  const [selectedPartenaire, setSelectedPartenaire] = useState('');
  const [selectedQualification, setSelectedQualification] = useState("")
  const [selectedRaison, setSelectedRaison] = useState("")
  const [statuts, setStatus] = useState([])
  const [params, setParams] = useState([])
  const [filteredQualificationList, setFilteredQualificationList] = useState([]);
  const [contrat, setContrat] = useState(client.CONTRAT);
  const [selectedFile, setSelectedFile] = useState(null)
  const contratUrl = client.CONTRAT ? `https://api.pneu-mafamech.cspddammak.com/Requests/contrat_partenaires/${client.CONTRAT}` : null;
  const [filteredRaisons, setFilteredRaisons] = useState([])
  const [list, setList] = useState([])
  const [savePart, setSavePart] = useState(false)
  const [openPartSuccess, setOpenPartSuccess] = useState(false);
  const [openCommSuccess, setOpenCommSuccess] = useState(false);
  const [communications, setCommunications] = useState([])
  const [openInfoDialogue, setOpenInfoDialogue] = useState(false)
  const [openHistorique, setOpenHistorique] = useState(false);
  const [cv, setCv] = useState(client.CV);

  const handleCvUpload = (event) => {

  };
  const [typeAppel, setTypeAppel] = useState("")
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileString = file.name;
      setContrat(fileString);
    }
  };
  const renderDocument = (doc) => {
    if (typeof doc === 'object') {
      return JSON.stringify(doc);
    }
    return doc || '';
  };
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const handleOpenDeleteDialog = (client) => {
    setClientToDelete(client);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setClientToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.post('http://192.168.1.195/api/Requests/jeux.php?action=delete-profil-inv', {
        id: clientToDelete.ID_INVESTISSEUR
      });

      await axios.delete(`${BASE_URL}/api/deleteInv/${clientToDelete.ID_INVESTISSEUR}`);

      fetchPart();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Failed to delete partner:', error);
    }
  };

  const handleSaveContrat = async () => {
    if (selectedFile) {


      const formData = new FormData();
      formData.append('file', selectedFile);

      try {

        await axios.put(`${BASE_URL}/api/updateInvContrat`, {
          id: client.ID_INVESTISSEUR,
          contrat: selectedFile.name,
        });
        console.log(statuts)
        const id = statuts.filter((s) => s.AVANCEMENT === 'Contrat signé')
        console.log(id)
        await axios.put(
          `${BASE_URL}/api/updateInvStatus`,
          { id: client.ID_INVESTISSEUR, id_statut: id[0]?.ID_STATUT }
        );
        setSavePart(true)
        alert('Contrat enregistré avec succès !');
        fetchPart();

      } catch (error) {
        console.error('Erreur lors de l\'envoi du fichier :', error);
        alert('Échec de l\'enregistrement du contrat.');
      }

    };
    if (client.CONTRAT && client.CONTRAT !== "") {
      const id = statuts.filter((s) => s.AVANCEMENT === 'Contrat signé')
      console.log(id)
      await axios.put(
        `${BASE_URL}/api/updateInvStatus`,
        { id: client.ID_INVESTISSEUR, id_statut: id[0]?.ID_STATUT }
      );
      setSavePart(true)

      alert('Contrat signé avec succès !');
      fetchPart();
    }
  }
  const handleAcceptPart = async () => {
    const id = statuts.filter((s) => s.AVANCEMENT === 'En cours de signature')
    console.log(id)
    await axios.put(
      `${BASE_URL}/api/updateInvStatus`,
      { id: client.ID_INVESTISSEUR, id_statut: id[0]?.ID_STATUT }
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

  const handleOpenDialog = async (client, type) => {
    setTypeAppel(type)

    setSelectedPartenaire(client);
    setDateTime(new Date().toISOString().slice(0, 16));
    setOpenDialog(true);
    if (!client.USER_IN_CHARGE) {
      try {
        console.log("start")

        await axios.put(
          `${BASE_URL}/api/updateInvUser`,
          { id: client.ID_INVESTISSEUR, USER_IN_CHARGE: user.LOGIN }
        );
        console.log("end")

      } catch (error) {
        console.error('Error updating partenaire:', error);
      }
    }

    const coms = await axios.get(
      `${BASE_URL}/api/getComInv`, {
      params: {
        id: client.ID_INVESTISSEUR
      }
    }
    );
    console.log("coms", coms.data)
    setCommunications(coms.data)
  };
  const handleSavePart = async (client) => {
    if (client) {
      try {
        console.log("start saving");
        await axios.post(
          `${BASE_URL}/api/saveInvestisseur`,
          { id: client.ID_INVESTISSEUR, user: user.LOGIN, name: client.NOM_PRENOM, tel: client.NUMERO_TELEPHONE, adresse: client.ADRESSE, password: client.MOT_DE_PASSE }
        );
        console.log("end");
        setOpenPartSuccess(true);
        setClients(prevClients => prevClients.filter(c => c.ID_INVESTISSEUR !== client.ID_INVESTISSEUR));
      } catch (error) {
        console.error('Error updating partenaire:', error);
      }
    }
  };
  const handleCloseHistorique = () => setOpenHistorique(false);

  const handleCloseDialog = () => setOpenDialog(false);
  const makeCall = () => {
    const sipUrl = `sip:${client.TEL_CLIENT_F}`;
    console.log("SIP URL:", sipUrl);
    window.location.href = sipUrl;
  };

  const handleSaveCommunication = async (client) => {
    if (client && selectedQualification && selectedRaison) {
      try {
        console.log("start create");
        await axios.post(
          `${BASE_URL}/api/CreateCommunicationInv`,
          {
            ID_INVESTISSEUR: client.ID_INVESTISSEUR,
            ID_STATUT: selectedQualification.UPDATE_STATUS,
            ID_RAISON: selectedRaison.ID_RAISON,
            ID_QUALIFICATION: selectedQualification.ID_QUALIFICATION,
            DATE_COMMUNICATION: dateTime,
            DETAILS_COMMUNICATION: detailsCommunication,
            TYPE_APPEL: typeAppel,
            UTILISATEUR: user.LOGIN
          }
        );
        console.log("end");
        await axios.put(
          `${BASE_URL}/api/updateInvStatus`,
          { id: client.ID_INVESTISSEUR, id_statut: selectedQualification.UPDATE_STATUS }
        );
        await fetchPart()
        setOpenCommSuccess(true);

      } catch (error) {
        console.error('Error updating partenaire:', error);
      }
    }

    setOpenDialog(false);
    setDateTime('');
    setDetailsCommunication('');
    setDetails('');
    setSelectValue1('');
    setSelectValue2('');
    setSelectValue3('');
    setSelectedPartenaire("");
    setSelectedQualification("");
    setSelectedRaison("");
  };
  useEffect(() => {
    if (selectedRaison) {
      const qualificationIds = params
        .filter(param => param.ID_RAISON === selectedRaison.ID_RAISON)
        .map(param => param.ID_QUALIFICATION);

      setFilteredQualificationList(
        qualificationList.filter(q => qualificationIds.includes(q.ID_QUALIFICATION))
      );
    } else {
      setFilteredQualificationList([]);
    }

  }, [selectedRaison, params, qualificationList]);
  useEffect(() => {
    if (client.STATUS) {
      const raisonsIds = list
        .filter(param => param.ID_STATUT === client.STATUS)
        .map(param => param.ID_RAISON);

      setFilteredRaisons(
        raisonList.filter(q => raisonsIds.includes(q.ID_RAISON))
      );
    }
    else {
      setFilteredRaisons(raisonList)
    }
  }, [client, list, raisonList])
  const onClose = () => {
    setOpenInfoDialogue(false)
  }

  const [messages, setMessages] = useState('');
  const [codeSent, setCodeSent] = useState();
  const handleSendCode = async (e) => {

    let loginmail = (client.TEL_CLIENT_F)
    let code = (client.CHAMP_2_CLIENT)
    let username = (client.NOM_PRENOM)

    return await axios.post('http://127.0.0.1:3200/signin', { email: client.EMAIL, loginmail, username, code }, {
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
  const handleOpenHistorique = async (client) => {
    setSelectedPartenaire(client);
    setOpenHistorique(true);

    try {
      const coms = await axios.get(
        `${BASE_URL}/api/getComInv`,
        {
          params: {
            id: client.ID_INVESTISSEUR
          }
        }
      );
      console.log("Fetched communications:", coms.data);
      setCommunications(coms.data);
    } catch (error) {
      console.error("Error fetching communications:", error);
    }
  };
  return (
    <CustomCardWrapper style={{ backgroundColor: 'white', borderRadius: '15px', border: 'transparent', height: '100%', width: '100%' }}>
      <CustomCardContent >
        <GlowingBox style={{ backgroundColor: client.COULEUR ? client.COULEUR : "white", borderRadius: '11px' }}>
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
            {client.AVANCEMENT ? client.LIBELLE : client.STATUS ? client.STATUS : "Non encore traité"}
          </Typography>
          {/* Example icon */}
        </GlowingBox>
        <Grid container style={{ display: 'flex', alignItems: 'center' }} >
          <PersonIcon />
          <Typography variant="h6" component="div" gutterBottom style={{ display: "flex", alignItems: "center", marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
            {client.NOM_PRENOM}
          </Typography>
        </Grid>
        <Typography color="text.secondary" gutterBottom style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <CallIcon />
          <Button onClick={makeCall} variant="text" color="primary" style={{ display: "flex", alignItems: "center", fontWeight: 'bold', fontSize: '16px' }}>
            {client.NUMERO_TELEPHONE} </Button>
        </Typography>
        <Typography variant="body2" color="text.secondary" style={{ display: "flex", alignItems: "center", marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <CalendarIcon />
          {formatDate(client.DATE_NAISSANCE)}
        </Typography>
        <Typography variant="body2" color="text.secondary" style={{ display: "flex", alignItems: "center", marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <FmdGoodIcon />
          {client.ADRESSE}
        </Typography>
        <Typography id="x" variant="body2" color="text.secondary" style={{ display: "flex", alignItems: "center", marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <EmailIcon />
          {client.EMAIL}
          <Button onClick={handleSendCode} size="small" style={{ color: '#FF8C00', fontWeight: 'bold', fontSize: '12px', textTransform: 'none' }}>
            Mot de passe oublié
          </Button>
        </Typography>
        <Typography variant="body2" color="text.secondary" style={{ display: "flex", alignItems: "center", marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <HistoryIcon />
          {formatDate(client.DATE_COMMUNICATION)}
        </Typography>
      </CustomCardContent>
      <CustomCardActions>
        <GreenButton
  startIcon={<PhoneForwardedIcon />}
  size="small"
  onClick={() => {
    const payload = {
      TYPE_APPEL: "appel sortant",
      ID_INVESTISSEUR: client.ID_INVESTISSEUR,
      NOM_PRENOM: client.NOM_PRENOM,
      NUMERO_TELEPHONE: client.NUMERO_TELEPHONE,
      EMAIL: client.EMAIL,
      COLLABORATOR: user?.LOGIN || "",
      CURRENT_STATUS_ID: client.STATUS || null,                          // numeric ID
      CURRENT_AVANCEMENT: client.AVANCEMENT || client.LIBELLE || "Non encore traité",
      STATUS_COLOR: client.COULEUR || "#ffffff",
    };

    console.log("📤 Sortant payload:", payload);

    onCommunicationSelect?.(payload);
  }}
>
  Sortant
</GreenButton>


<GreenButton
  startIcon={<PhoneCallbackIcon />}
  size="small"
  style={{ textTransform: 'none', fontSize: '14px', fontWeight: 'bold' }}
  onClick={() => {
    const payload = {
      TYPE_APPEL: "appel entrant",
      ID_INVESTISSEUR: client.ID_INVESTISSEUR,
      NOM_PRENOM: client.NOM_PRENOM,
      NUMERO_TELEPHONE: client.NUMERO_TELEPHONE,
      EMAIL: client.EMAIL,
      COLLABORATOR: user?.LOGIN || "",
      CURRENT_STATUS_ID: client.STATUS || null,                          // numeric ID
      CURRENT_AVANCEMENT: client.AVANCEMENT || client.LIBELLE || "Non encore traité",
      STATUS_COLOR: client.COULEUR || "#ffffff",
    };

    console.log("📤 Entrant payload:", payload);


    onCommunicationSelect?.(payload);
  }}
>
  Entrant
</GreenButton>


        <Button
          startIcon={<DescriptionIcon />}
          size="small"
          style={{
            color: '#FF8C00',
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
          onClick={() => setOpenInfoDialogue(true)}
          disabled={client.AVANCEMENT === "Enregistre"}
        >
          Document
        </Button>
        <Button
          startIcon={<HistoryIcon />}
          size="small"
          style={{
            color: 'red',
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
          onClick={() => handleOpenHistorique(client)}
          disabled={client.AVANCEMENT === "Enregistre"}
        >
          Historique
        </Button>
      </CustomCardActions>
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer ce partenaire?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Non
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Oui
          </Button>
        </DialogActions>
      </Dialog>
      

      <Dialog open={openInfoDialogue} onClose={onClose} maxWidth="md"
        fullWidth >
        <DialogTitle>
          Plus d'informations
          <Button onClick={onClose} style={{ position: 'absolute', right: '8px', top: '8px' }}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ display: "flex", flexDirection: "column" }}>
            <Grid item xs={12} md={12}>
              <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.400', p: 2, mt: 2 }}>
                <Typography variant="h6">CV</Typography>
                <TextField
                  margin="dense"
                  id="niveau-scolaire"
                  label="Niveau Scolaire"
                  type="text"
                  fullWidth
                  value={client.NIVEAU_SCOLAIRE}
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
                />
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    {contratUrl ? (
                      <a href={contratUrl} target="_blank" rel="noopener noreferrer">
                        <TextField
                          margin="dense"
                          id="cv"
                          label="CV"
                          type="text"
                          fullWidth
                          value={cv || "cv non disponible"}
                          style={{ cursor: 'pointer', color: 'blue' }}
                          disabled={!client.CV}
                        />
                      </a>
                    ) : (
                      <TextField
                        margin="dense"
                        id="cv"
                        label="CV"
                        type="text"
                        fullWidth
                        value={cv || "cv non disponible"}
                        disabled
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <IconButton
                      style={{ color: 'blue', width: '100%', height: '100%' }}
                      onClick={() => document.getElementById('cv-input').click()}
                    >
                      <CloudUploadIcon />
                    </IconButton>
                    <input
                      type="file"
                      id="cv-input"
                      style={{ display: 'none' }}
                      onChange={handleCvUpload}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={12} >
              <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.400', p: 2, mt: 2 }}>
                <Typography variant="h6">Contrat</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    {contratUrl ? (
                      <a href={contratUrl} target="_blank" rel="noopener noreferrer">
                        <TextField
                          margin="dense"
                          id="contrat"
                          label="Contrat"
                          type="text"
                          fullWidth
                          value={contrat || "Contrat non disponible"}
                          style={{ cursor: 'pointer', color: 'blue' }}
                          disabled={!client.CONTRAT}
                        />
                      </a>
                    ) : (
                      <TextField
                        margin="dense"
                        id="contrat"
                        label="Contrat"
                        type="text"
                        fullWidth
                        value={contrat || "Contrat non disponible"}
                        disabled
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <IconButton
                      style={{ color: 'blue', width: '100%', height: '100%' }}
                      onClick={() => document.getElementById('file-input').click()}
                    >
                      <CloudUploadIcon />
                    </IconButton>
                    <input
                      type="file"
                      id="file-input"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </Grid>
                  {(user.ROLE === "administrateur" && client.CONTRAT === '') && (
                    <Grid item xs={12} md={5}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        style={{ width: '100%', height: '100%', fontSize: '16px' }}
                        onClick={handleAcceptPart}
                      >
                        Accepter comme partenaire
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>
            <DialogActions>
              <Button
                variant="contained"
                size="small"
                style={{
                  color: "black",
                  backgroundColor: "white",
                  transition: "background-color 0.3s",
                  width: "150px",
                  height: "40px",
                  marginTop: "10px",
                }}
                startIcon={<SaveOutlinedIcon />}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#C4D6E8";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
                onClick={() => handleSaveContrat(client)}
              >
                Enregistrer</Button>
            </DialogActions>
          </Grid>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openPartSuccess}
        onClose={() => setOpenPartSuccess(false)}
        PaperProps={{
          style: { borderRadius: 15, padding: '20px' }
        }}
      >
        <DialogTitle style={{ color: '#4CAF50', textAlign: 'center', fontWeight: 'bold' }}>
          Succès
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ textAlign: 'center', fontSize: '16px' }}>
            Partenaire enregistré avec succès.
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
          <Button
            onClick={() => setOpenPartSuccess(false)}
            variant="contained"
            style={{ backgroundColor: '#4CAF50', color: 'white' }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openCommSuccess}
        onClose={() => setOpenCommSuccess(false)}
        PaperProps={{
          style: { borderRadius: 15, padding: '20px' }
        }}
      >
        <DialogTitle style={{ color: '#4CAF50', textAlign: 'center', fontWeight: 'bold' }}>
          Succès
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ textAlign: 'center', fontSize: '16px' }}>
            Communication enregistrée avec succès.
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
          <Button
            onClick={() => setOpenCommSuccess(false)}
            variant="contained"
            style={{ backgroundColor: '#4CAF50', color: 'white' }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openHistorique}
        onClose={handleCloseHistorique}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          style: {
            height: 'auto',
            maxHeight: '90vh',
            width: '90%',
            margin: '20px'
          }
        }}
      >
        <DialogContent style={{ padding: '24px' }}>
          <IconButton
            aria-label="close"
            onClick={handleCloseHistorique}
            style={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Box style={{ width: '100%', height: '100%' }}>
            <Typography
              variant="h6"
              align="center"
              gutterBottom
              style={{ marginBottom: '20px' }}
            >
              Historique communication
            </Typography>
            <TableContainer style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                    }}>Date communication</TableCell>
                    <TableCell sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                    }}>Détails communication</TableCell>
                    <TableCell sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                    }}>Raison d'appel</TableCell>
                    <TableCell sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                    }}>Qualification d'appel</TableCell>
                    <TableCell sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                    }}>collaborateur</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {communications.map((c) => (
                    <TableRow key={c.ID_COMMUNICATION}>
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
          </Box>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
        </DialogActions>
      </Dialog>







      <Dialog open={openInfoDialogue} onClose={onClose} maxWidth="md"
        fullWidth >
        <DialogTitle>
          Plus d'informations
          <Button onClick={onClose} style={{ position: 'absolute', right: '8px', top: '8px' }}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ display: "flex", flexDirection: "column" }}>
            <Grid item xs={12} md={12}>
              <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.400', p: 2, mt: 2 }}>
                <Typography variant="h6">Détails d'investissement</Typography>
                <TextField
                  margin="dense"
                  id="type-investissement"
                  label="Type d'investissement"
                  type="text"
                  fullWidth
                  value={client.TYPE}
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Détails</Typography>
                  {client.OPTION_INV && (
                    <Typography margin="dense">
                      Option choisie: {String(client.OPTION_INV)}
                    </Typography>
                  )}
                  {Array.isArray(client.MARQUES) && client.MARQUES.length > 0 && (
                    <Typography margin="dense">
                      Marques sélectionnées: {client.MARQUES.join(', ')}
                    </Typography>
                  )}
                  {Array.isArray(client.AUTREMARQUES) && client.AUTREMARQUES.length > 0 && (
                    <Typography margin="dense">
                      Autres marques sélectionnées:  {client.AUTREMARQUES.join(', ')}
                    </Typography>
                  )}
                  {client.DOMAIN && (
                    <Typography margin="dense">
                      Domaine: {String(client.DOMAIN)}
                    </Typography>
                  )}
                  {client.DETAILS && (
                    <Typography margin="dense">
                      Détails: {String(client.DETAILS)}
                    </Typography>
                  )}
                  {client.AUTREMARQUE && (
                    <Typography margin="dense">
                      Autres marques: {String(client.AUTREMARQUE)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={12} >
              <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.400', p: 2, mt: 2 }}>
                <Typography variant="h6">Contrat</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    {contratUrl && typeof contratUrl === "string" ? (
                      <a href={contratUrl} target="_blank" rel="noopener noreferrer">
                        <TextField
                          margin="dense"
                          id="contrat"
                          label="Contrat"
                          type="text"
                          fullWidth
                          value={typeof contrat === 'string' ? contrat : "Contrat non disponible"}
                          disabled={!client.CONTRAT}
                        />
                      </a>
                    ) : (
                      <TextField
                        margin="dense"
                        id="contrat"
                        label="Contrat"
                        type="text"
                        fullWidth
                        value={"Contrat non disponible"}
                        disabled
                      />
                    )}
                  </Grid>
                  {user.ROLE === "collaborateur" && (
                    <Grid item xs={12} md={4}>
                      <IconButton
                        style={{ color: 'blue', width: '100%', height: '100%' }}
                        onClick={() => document.getElementById('file-input').click()}
                      >
                        <CloudUploadIcon />
                      </IconButton>
                      <input
                        type="file"
                        id="file-input"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                    </Grid>
                  )}
                  {user.ROLE === "administrateur" && (
                    <Grid item xs={12} md={5}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        style={{ width: '350px', height: '100%', fontSize: '14px' }}
                        onClick={handleAcceptPart}
                      >
                        Accepter comme investisseur
                      </Button>
                    </Grid>
                  )}

                </Grid>
              </Box>
            </Grid>
            <DialogActions>
              {savePart && (
                <Button
                  variant="contained"
                  size="small"
                  style={{
                    color: "black",
                    backgroundColor: "white",
                    transition: "background-color 0.3s",
                    width: "250px",
                    height: "40px",
                    marginTop: "10px",

                  }}
                  startIcon={<SaveOutlinedIcon />}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#C4D6E8";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                  onClick={() => handleSavePart()}
                >
                  Enregistrer comme investisseur</Button>
              )}
              {user.ROLE === "collaborateur" && (
                <Button
                  variant="contained"
                  size="small"
                  style={{
                    color: "black",
                    backgroundColor: "white",
                    transition: "background-color 0.3s",
                    width: "150px",
                    height: "40px",
                    marginTop: "10px",
                  }}
                  startIcon={<SaveOutlinedIcon />}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#C4D6E8";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                  onClick={() => handleSaveContrat(client)}
                >
                  Enregistrer contrat</Button>
              )}
            </DialogActions>
          </Grid>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openPartSuccess}
        onClose={() => setOpenPartSuccess(false)}
        PaperProps={{
          style: { borderRadius: 15, padding: '20px' }
        }}
      >
        <DialogTitle style={{ color: '#4CAF50', textAlign: 'center', fontWeight: 'bold' }}>
          Succès
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ textAlign: 'center', fontSize: '16px' }}>
            Investisseur enregistré avec succès.
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
          <Button
            onClick={() => setOpenPartSuccess(false)}
            variant="contained"
            style={{ backgroundColor: '#4CAF50', color: 'white' }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>


    </CustomCardWrapper>
  );
}

function CardContainer({ searchTerm, selectedAvancement, setTotalObj,onCommunicationSelect }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const user = useSelector((state) => state.user);
  const fetchPart = async () => {
    const URL = user.ROLE === "collaborateur" ? `${BASE_URL}/api/investisseurs` : `${BASE_URL}/api/investisseurs`
    setLoading(true);
    try {
      const params = {
        page: page,
        pageSize: pageSize,
        searchTerm: searchTerm,
        avancement: selectedAvancement
      };

      if (user.ROLE === "collaborateur") {
        params.user = user.LOGIN;
      }
      const response = await axios.get(URL, { params });
      console.log(response.data)
      setClients(response.data.clients);
      setTotal(response.data.total);
      setTotalObj("inv", response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('There was an error fetching the clients!');
      setLoading(false);
    }
  }
  const updateClient = (id, USER_IN_CHARGE) => {
    setClients(prevClients =>
      prevClients.map(client =>
        client.ID_INVESTISSEUR === id
          ? { ...client, USER_IN_CHARGE }
          : client
      )
    );
  };

  useEffect(() => {
    fetchPart();
  }, [page, pageSize, searchTerm, selectedAvancement]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000');
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update_investisseur') {
        updateClient(data.id, data.USER_IN_CHARGE);
      }
    };
    return () => {
      socket.close();
    };
  }, []);
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
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{
        flex: '1 1 auto',
        maxHeight: `100vh`,
        overflowY: 'auto',
        padding: '16px'
      }}>
        <Grid container spacing={2}>
          {clients.map(client => (
            <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={client.ID_PARTENAIRE}>
              <CustomCard
  client={client}
  setClients={setClients}
  user={user}
  fetchPart={fetchPart}
  onCommunicationSelect={onCommunicationSelect}
/>

            </Grid>
          ))}
        </Grid>
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
    </Box>
  );
};

export default CardContainer;
