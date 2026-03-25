import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import PlaceIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import { styled} from '@mui/system';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { MenuItem } from '@mui/material';
import { useSelector } from 'react-redux';
import EmailIcon from '@mui/icons-material/Email';
import HistoryIcon from '@mui/icons-material/History';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
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
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { TablePagination } from '@mui/material';
import {Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BlockIcon from '@mui/icons-material/Block';


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

function CustomCard({ client, user }) {
  const [params, setParams] = useState([]);
  const [raisonList, setRaisonList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openHistoriqueDialog, setOpenHistoriqueDialog] = useState(false);
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [details, setDetails] = useState('');
  const [selectedRaison, setSelectedRaison] = useState('');
  const [communicationType, setCommunicationType] = useState('Prespection'); 
  const [qualificationType, setqualificationType] = useState(''); 
  const [commandes, setCommandes] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [articles, setArticles] = useState({});
  const [qualificationList, setQualificationList] = useState([]);
  const [selectedQualification, setSelectedQualification] = useState("");
  const [tarifs, setTarifs] = useState([]);
  const [openTarifDialog, setOpenTarifDialog] = useState(false);

  const tablestyle = {
    fontWeight: 'bold',
    color: '#387ADF',
    borderRadius: '12px',
  };

  useEffect(() => {
    axios.get(`${BASE_URL}/api/RaisonsList`)
      .then(response => setRaisonList(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);


  useEffect(() => {
    if (selectedRaison) {
      const qualificationIds = params
        .filter(param => param.ID_RAISON === selectedRaison.ID_RAISON)
        .map(param => param.ID_QUALIFICATION);
    }
  }, [selectedRaison, params, qualificationList]);

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
        console.log("sahar", response.data)
      }
      )
      .catch(error => console.error('Error fetching data:', error));
  }, [])

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleHistoriqueDialogOpen = async () => {
    try {
      console.log("client", client.CODE_CLIENT)
      const result = await axios.get(`${BASE_URL}/api/cmdClients`, {
        params: {
          base: "cspd", code: client.CODE_CLIENT
        }
      });
      console.log("result", result.data)
      setCommandes(result.data);
    } catch (error) {
      console.error('Error fetching commands:', error);
    }
    setOpenHistoriqueDialog(true);
  };
  const handleCardClick = async (command) => {
    setExpanded(prev => (prev === command.NUM_BLC ? null : command.NUM_BLC));
    console.log("commandId", command.NUM_BLC);

    try {
      const result = await axios.get(`${BASE_URL}/api/articlescmd`, {
        params: {
          reference: command.NUM_BLC,
          base: "cspd"
        }
      });
      console.log("result", result)
      setArticles(result.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleHistoriqueDialogClose = () => {
    setOpenHistoriqueDialog(false);
  };

  const handleSaveCommunication = () => {
    console.log('Date and Time:', dateTime);
    console.log('Details:', details);
    console.log('Communication Type:', communicationType);
    console.log('Qualification:', qualificationType);
    setOpenDialog(false);
  };
  const makeCall = () => {
    window.location.href = `tel:${client.TEL_CLIENT_L}`;
  };
  const sendSMS = () => {
    window.location.href = `sms:${client.TEL_CLIENT_L}`;
  };

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
  return (
    <CustomCardWrapper style={{ backgroundColor: 'white', borderRadius: '15px', border: 'transparent' }}>
      <CustomCardContent>
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
            {client.INTITULE_CLIENT.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())}
            <span style={{ fontSize: '0.8rem', fontWeight: 'normal', textAlign: 'center ' }}>({client.INTITULE_GR.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())})</span>
          </Typography>
          {client.CC_BLOQUER && (
            <BlockIcon style={{ marginLeft: '8px', fontSize: '1.5rem', color: "white" }} />
          )}
        </GlowingBox>
        <Typography variant="h6" component="div" gutterBottom style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <LocalPhoneIcon />
          <Button onClick={makeCall} variant="text" color="primary" style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {client.TEL_CLIENT_F}
          </Button>
        </Typography>
        <Typography variant="h6" component="div" gutterBottom style={{ display: "flex", alignItems: "center", marginBottom: 10, color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <PlaceIcon />
          {client.ADR_C_FACT_1.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())}
        </Typography>
        <Typography variant="h6" component="div" gutterBottom style={{ display: "flex", alignItems: "center", marginBottom: 10, color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
          <PersonIcon />
          {client.INTITULE_REPRES.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())}
        </Typography>
        <Typography id="x" variant="body2" color="text.secondary" style={{ display: "flex", alignItems: "center", marginBottom: 10, fontWeight: 'bold', fontSize: '16px' }} >
          <EmailIcon />          {client.ADR_C_FACT_3}
          <Button onClick={handleSendCode} style={{ color: '#FF8C00', fontWeight: 'bold', fontSize: '14px', textTransform: 'none' }}>
            Mot de passe oublié
          </Button>
        </Typography>
        <>
          {client.NUM_DER_BON ? (
            <Typography variant="body2" color="text.secondary">
              <Grid container style={{ marginTop: '10px', color: "black", alignItems: 'flex-start', fontFamily: 'sans-serif', display: 'inline-flex', fontWeight: 'bold' }}>
                <TableContainer component={Paper} >
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
                        <TableCell style={{ ...tablestyle }}>{client.NUM_DER_BON}</TableCell>
                        <TableCell style={{ ...tablestyle }} >{new Date(client.DATE_DER_BON).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell style={{ ...tablestyle }}>{client.TOT_TTC_BLC}</TableCell>
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
                        <TableCell style={{ width: '600px ', fontSize: '12px', textAlign: 'center', color: '#545454', fontWeight: 'bold', }}>
                          <TipsAndUpdatesIcon style={{ fontSize: '25px', textAlign: 'center', color: '#3572EF' }} />
                          Info commande
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow key={client.ID_CLIENT} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell style={{ fontWeight: 'bold', color: '#5E6073', borderRadius: '12px', textAlign: 'center' }}>
                          <ProductionQuantityLimitsIcon style={{ color: "#5E6073" }} /> Aucune commande! </TableCell>
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
        width: "100%", 
        textAlign: 'center', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center' 
      }}>
        <CustomButton style={{ color: "green", textTransform: 'none', fontSize: '14px', fontWeight: 'bold', textTransform: 'none' }} startIcon={<PhoneForwardedIcon />} size="medium" onClick={handleDialogOpen}> Sortant </CustomButton>
        <CustomButton style={{ color: "green", fontSize: '14px', fontWeight: 'bold', textTransform: 'none' }} startIcon={<PhoneCallbackIcon />} size="medium" onClick={handleDialogOpen}> Entrant </CustomButton>
        <CustomButton style={{ color: "#EF9C66", fontSize: '14px', fontWeight: 'bold', textTransform: 'none' }} startIcon={<EmailIcon />} size="medium">Email</CustomButton>
        <CustomButton style={{ color: "#478CCF", fontSize: '14px', fontWeight: 'bold', textTransform: 'none' }} startIcon={<HistoryIcon />} onClick={() => handleHistoriqueDialogOpen()} size="medium">Historique</CustomButton>
      </CustomCardActions>

      <Dialog open={openDialog} onClose={handleDialogClose}
        maxWidth="md"
        fullWidth>
        <DialogTitle>
          Détails de la Communication
          <Button onClick={handleDialogClose} style={{ position: 'absolute', right: '8px', top: '8px' }}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="datetime"
            type="datetime-local"
            fullWidth
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
          <InputLabel id="select-label-1">Raison d'appel</InputLabel>

          <Select
            labelId="select-label-1"
            id="select-1"
            value={raisonList}
            onChange={(e) => raisonList(e.target.value)}
            fullWidth
          >
            {raisonList.map((raison) => (
              <MenuItem key={raison.ID_RAISON} value={raison}>{raison.LIBELLE}</MenuItem>
            ))}
          </Select>
          <TextField
            margin="dense"
            id="details"
            label="Détails Communication"
            multiline
            rows={4}
            fullWidth
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <InputLabel id="select-label-1">Qualification d'appel</InputLabel>
          <Select
            labelId="select-label-1"
            id="select-1"
            value={selectedQualification}
            onChange={(e) => setSelectedQualification(e.target.value)}
            fullWidth
          >

          </Select>
        </DialogContent>
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
              marginLeft: "650px",
            }}
            startIcon={<SaveOutlinedIcon />}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#C4D6E8";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
            onClick={() => handleSaveCommunication(client)}
          >
            Enregistrer</Button>
        </DialogActions>
        <DialogContent>
          <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.400', p: 2, mt: 2, width: '100%' }}>
            <Typography variant="h6" align="center" gutterBottom>
              Historique communication
            </Typography>
            <TableContainer >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{
                      backgroundColor: '#387ADF',
                      color: 'white',
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',

                    }}>Date communication</TableCell>
                    <TableCell sx={{
                      backgroundColor: '#387ADF',
                      color: 'white',
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',

                    }}>Détails communication</TableCell>
                    <TableCell sx={{
                      backgroundColor: '#387ADF',
                      color: 'white',
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',

                    }}>Raison d'appel</TableCell>
                    <TableCell sx={{
                      backgroundColor: '#387ADF',
                      color: 'white',
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',

                    }}>Qualification d'appel</TableCell>

                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow >
                    <TableCell style={{ backgroundColor: '#F5F4F4' }}> </TableCell>
                    <TableCell> </TableCell>
                    <TableCell style={{ backgroundColor: '#F5F4F4' }}> </TableCell>
                    <TableCell> </TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
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
                    Bon de livraison: {command.NUM_BLC} {command.DATE_BLC}
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
    </CustomCardWrapper>
  );
}

const CardFamilleCSPD = ({ searchTerm }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterName, setFilterName] = useState(''); // Nom à filtrer
  const [filteredClients, setFilteredClients] = useState([]);
  const user = useSelector((state) => state.user);
  const fetchPart = async () => {
    const URL = `${BASE_URL}/api/clientsPartenaires`;
    console.log('query debug', URL);
    setLoading(true);
    try {
      const params = {
        page: page,
        pageSize: pageSize,
        searchTerm: searchTerm,
      };
      const response = await axios.get(URL, { params });
      console.log('API response data:', response.data);
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
      client && client.INTITULE_GR === "FAMILLE"
    );
    console.log('Filtered clients:', filtered);
    setFilteredClients(filtered);
  }, [clients]); 

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <div>
      <Box sx={{ display: 'flex' }}>
        <CircularProgress />
      </Box></div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ overflowY: 'auto', maxHeight: 'auto' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {filteredClients.length > 0 ? (
          filteredClients.map(client => (
            <CustomCard key={client.ID_CLIENT} name={client.INTITULE_GR} client={client} user={user} />
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

export default CardFamilleCSPD;

