import React, { useEffect, useState } from 'react';
import RenderStockGros from '../Commercial/renderStock';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Collapse,
  Grid,
  IconButton,
  Table, TableBody, TableCell,
  TableContainer,
  TableHead,
  TablePagination,   
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import axios from 'axios';
import CallIcon from '@mui/icons-material/Call';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { InputLabel, MenuItem, Select } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import BASE_URL from '../Utilis/constantes';
import addressIcon from '../icons/address.png';
import { getArticleById } from "../Api";
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import { fetchClientsPartenaires } from "../Api";
import { FormControlLabel, Radio } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import PersonIcon from '@mui/icons-material/Person';
import entete from '../images/sahar up.png';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ExpandableTableRow } from '../components/ExpandableTableRow';
const CommandesList = ({ base, type, searchTerm }) => {
  const theme = useTheme();
  const [openedHistoryCommand, setOpenedHistoryCommand] = useState();
  const [errorLivraison, setErrorLivraison] = useState('');
  const [loading, setLoading] = useState(false);
  const [commandes, setCommandes] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [articles, setArticles] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [dateTime, setDateTime] = useState('');
  const user = useSelector((state) => state.user);
  const [detailsCommunication, setDetailsCommunication] = useState('');
  const [transporteurs, setTransporteurs] = useState([])
  const [modeLiv, setModeLiv] = useState([])
  const [modePay, setModepay] = useState([])
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [dateLivraisonPrevue, setDateLivraisonPrevue] = useState('');
  const [communications, setCommunications] = useState({});
  const [tarifs, setTarifs] = useState([])
  const [openTarifDialog, setOpenTarifDialog] = useState(false)
  const [historyDialog, setHistoryDialog] = useState(false)
  const [modeLivraison, setModeLivraison] = useState('');
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [transporteur, setTransporteur] = useState('');
  const [beneficiaire, setBeneficiaire] = useState('');
  const [matriculeFiscale, setMatriculeFiscale] = useState('');
  const [adresseFacturation, setAdresseFacturation] = useState('');
  const [modePaiement, setModePaiement] = useState('');
  const [numCheque, setNumCheque] = useState('');
  const [banque, setBanque] = useState('');
  const [dateEcheance, setDateEcheance] = useState('');
  const [commandTocom, setCommandTocom] = useState("")
  const [openCommSuccess, setOpenCommSuccess] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [commandToCancel, setCommandToCancel] = useState(null);
  const [expandedClient, setExpandedClient] = useState(null);
  const [isArticleDialogOpened, setArticleDialogOpened] = React.useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [error, setError] = useState(null);
  const [clientsData, setClientsData] = useState([]);
  const handleChangePage = (event, newPage) => setPage(newPage);

  const [paiements, setPaiements] = useState([{ mode_paiement: '', montant: '' , date_echeance: ''}]);
  const [paymentError, setPaymentError] = useState('');
const [modeVoy, setModeVoy] = useState("");
    const [modeVoyAutre, setModeVoyAutre] = useState("");

  useEffect(() => {

    if (commandes.length > 0) {
      const command = commandes[0];
      const clientId = command.CLIENT_CDE;

      const fetchClients = async () => {
        try {

          const { clients, total, error: apiError } = await fetchClientsPartenaires(page, clientId, pageSize, searchTerm, clientId);
          console.log("Fetched Clients Data:", clients);
          if (apiError) {
            throw new Error(apiError);
          }
          setClientsData(clients);
        } catch (err) {
          setError(err.message);
        }
      };
      console.log("Fetching clients with params:", {
        page,
        clientId,
        pageSize,
        searchTerm
      });
      fetchClients();
    }
  }, [commandes, page, pageSize, searchTerm]);

  useEffect(() => {
    fetchClientsPartenaires();
  }, [page, pageSize, searchTerm]);
  const resetForm = () => {
    setDateTime('');
    setDetailsCommunication('');
    setAdresseFacturation('');
    setAdresseLivraison('');
    setBanque('');
    setBeneficiaire('');
    setDateEcheance('');
    setMatriculeFiscale('');
    setModeLivraison('');
    setNumCheque('');
    setDateLivraisonPrevue('');
    setPaiements([{ mode_paiement: '', montant: '',date_echeance: '' }]);//new
    setPaymentError('');//new
       setModeVoy("");
  }

  //new dev1
   const handleAddPayment = () => {
    setPaiements([...paiements, { mode_paiement: '', montant: '' , date_echeance: ''}]);
  };

    const handleRemovePayment = (index) => {
    if (paiements.length > 1) {
      setPaiements(paiements.filter((_, i) => i !== index));
    }
  };

  const handlePaymentChange = (index, field, value) => {
    const updatedPaiements = [...paiements];
    updatedPaiements[index] = { ...updatedPaiements[index], [field]: value };
    setPaiements(updatedPaiements);
  };

  const validatePayments = () => {
    if (!commandTocom || !commandTocom.CC_TOTAL) return false;
    const orderTotal = parseFloat(commandTocom.CC_TOTAL);
    const totalPaiements = paiements.reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0);
    if (Math.abs(totalPaiements - orderTotal) > 0.01) {
      setPaymentError(`La somme des montants (${totalPaiements.toFixed(2)} TND) ne correspond pas au total de la commande (${orderTotal.toFixed(2)} TND)`);
      return false;
    }
    for (const p of paiements) {
      if (!p.mode_paiement || !p.montant || parseFloat(p.montant) <= 0) {
        setPaymentError('Chaque mode de paiement doit avoir un mode et un montant valide');
        return false;
      }
      if (p.mode_paiement.ID === 3 && !p.date_echeance) {
        setPaymentError('La date d\'échéance est requise pour les paiements par traite');
        return false;
      }
    }
    setPaymentError('');
    return true;
  };

  useEffect(() => {
    Promise.all(commandes.map(async (command) => {
      return await axios.get(
        `${BASE_URL}/api/getComCmd`, {
        params: {
          id: command.NUM_CDE_C
        }
      }
      );
    })).then((communicationsResult) => {
      setCommunications(
        communicationsResult.reduce((result, communication) => {
          if (communication.data.length) {
           const grouped = communication.data.reduce((acc, comm) => {
              const commId = comm.ID;
              if (!acc[commId]) {
                acc[commId] = { ...comm, paiements: [] };
              }
              if (comm.PAIEMENT_ID) {
                acc[commId].paiements.push({
                  id: comm.PAIEMENT_ID,
                  mode_paiement: { ID: comm.MODE_PAIEMENT_ID, LIBELLE: comm.MODE_PAY },
                  montant: comm.PAIEMENT_MONTANT,
                  date_echeance: comm.ECHEANCE
                });
              }
              return acc;
        }, {});
    result[communication.data[0].REF_COMMANDE] = Object.values(grouped);
          }
          return result;
        }, {})
      );
    });
  }, [commandes]);


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


  const CustomCardActions = styled(CardActions)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 16px',
    height: '50px',

  }));

  const getGridSizes = (command) => {
    if (expanded === command.NUM_CDE_C) {
      return { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 };
    } else {
      return { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 };
    }
  };

  const formatDateTr = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const fetchCommandes = async () => {
    try {
      const url = type === "partenaire" ?
        `${BASE_URL}/api/cmdPartenairesEncours` :
        type === "investisseur" ?
          `${BASE_URL}/api/cmdInvestisseursEncours` :
          `${BASE_URL}/api/cmdClientsEncours/${base}`;

      const params = {
        page: page,
        pageSize: pageSize,
        searchTerm: searchTerm,
        cc_champ_3: "traité"
      };

      const result = await axios.get(url, { params });
      setCommandes(result.data.commandes);
      setTotal(result.data.total);
    } catch (error) {
      console.error('Error fetching commands:', error);
    }
  };


  const handleCardClick = async (command) => {
    setExpanded(prev => (prev === command.NUM_CDE_C ? null : command.NUM_CDE_C));
    console.log("commandId", command.NUM_CDE_C);

    try {
      const result = await axios.get(`${BASE_URL}/api/articlescmdEncours`, {
        params: {
          reference: command.NUM_CDE_C,
          base: base
        }
      });
      console.log("resultcmd", result)
      setArticles(result.data.formattedArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  useEffect(() => {


    const fetchCommunications = async () => {
      try {
        const result = await axios.get(`${BASE_URL}/api/communicationsCmd`);
        console.log("com", result.data)
      } catch (error) {
        console.error('Error fetching communications:', error);
      }
    };

    axios.get(`${BASE_URL}/api/modeLivraison`)
      .then(response => setModeLiv(response.data))
      .catch(error => console.error('Error fetching data:', error));
    axios.get(`${BASE_URL}/api/modePaiement`)
      .then(response => setModepay(response.data))
      .catch(error => console.error('Error fetching data:', error));
    axios.get(`${BASE_URL}/api/transporteur`)
      .then(response => setTransporteurs(response.data))
      .catch(error => console.error('Error fetching data:', error));
    fetchCommandes();
    fetchCommunications();
  }, [page, pageSize, searchTerm]);
  const handleSaveCommunication = async () => {
    setErrorLivraison('');
    resetForm();

    if (!dateLivraisonPrevue) {
      console.log("Erreur : dateLivraisonPrevue est vide");
      setErrorLivraison('Veuillez sélectionner une date de livraison.');
      return;
    }

    try {
      if (commandTocom && commandTocom.NUM_CDE_C) {
        const formattedPaiements = paiements.map(p => ({
          mode_paiement: p.mode_paiement.ID,
          montant: parseFloat(p.montant),
          date_echeance: p.date_echeance || null
        }));
        const response = await axios.post(`${BASE_URL}/api/UpdateOrCreateComCmd`, {
          ref_commande: commandTocom.NUM_CDE_C,
          commercial: user.LOGIN,
          statut: "Validation commerciale",
          datetime: dateTime,
          details_communication: detailsCommunication,
          mode_livraison: modeLivraison.ID,
          adresse_livraison: adresseLivraison,
          transporteur: transporteur.ID,
          beneficiaire: beneficiaire,
          matricule_fiscale: matriculeFiscale,
          adresse_facturation: adresseFacturation,
          base: base,
          dateLivraisonPrevue,
         mode_voy: modeVoy === "autre" ? modeVoyAutre : modeVoy,
          paiements: formattedPaiements
        });

        if (response.data && response.data.message) {
          console.log('Communication enregistrée avec succès:', response.data.message);
          setOpenCommSuccess(true);
          await fetchCommandes();
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } else {
        console.error('Command to communicate is not properly defined');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la communication:', error);
    } finally {
      setOpenDialog(false);
      setDateTime('');
      setDetailsCommunication('');
      setAdresseFacturation('');
      setAdresseLivraison('');
      setBanque('');
      setBeneficiaire('');
      setDateEcheance('');
      setMatriculeFiscale('');
      setModeLivraison('');
      setNumCheque('');
      setModePaiement('');
      setPaiements([{ mode_paiement: '', montant: '',date_echeance: '' }]);//new
      setPaymentError('');//new
    }
  };


  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('fr-FR') : '-';
  };

  const handleCloseDialog = () => {
    resetForm();
    setOpenDialog(false);
  };

  const handleCloseSuccessDialog = () => {
    setOpenCommSuccess(false);
  };

  const makeCall = (tel) => {
    window.location.href = `sip:${tel.replace(/[^0-9]+/g, '')}`;
  };

  const handleOpenCancelDialog = (command) => {
    setCommandToCancel(command);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setCommandToCancel(null);
  };

  const handleOpenHistoriqueDialog = (command) => {
    setOpenedHistoryCommand(command.NUM_CDE_C);
    setHistoryDialog(true)
  };

  const openArticleDialog = (articleId) => {
    if (articleId) {
      getArticleById(articleId, 'cspd').then((article) => {
        setSelectedArticle(article);
        setArticleDialogOpened(true);
      });
    } else {
      console.error("Mismatch between CCL_ARTICLE and CODE_ARTICLE, or article is undefined");
    }
  };
  const handleCloseArticleDialog = () => {
    setArticleDialogOpened(false);
  };


  const [enteteBase64, setEnteteBase64] = useState('');

  useEffect(() => {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      setEnteteBase64(dataURL);
    }
    img.src = entete;
  }, []);



  const handlePrint = (command) => {
    const printContent = `
      <html>
        <head>
          <title> </title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .header-image {
              width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            .footer-image {
              width: 100%;
              max-height: 12em;
              object-fit: contain;
             margin-top:-500px;
             text-align:end;
            }
            .content {
               margin-top:-800px;
              padding: 20px;
            }
            h1 { color: #ce362c; text-align:center; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; color: #ce362c; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0B4C69; color: white; }
          </style>
        </head>
        <body>
          <img src="${enteteBase64}" alt="En-tête" class="header-image">
          <div class="content">
            <h1>Ordre de mission </h1>
            <div class="section">
              <p class="section-title">Informations commandes</p>
              <p>Commande: ${formatDate(command.DATE_CDE_C)} ${command.CC_CHAMP_6} - ${command.NUM_CDE_C}</p>
              <p>Client: ${command.CLIENT_CDE}, ${command.ADR_C_C_1}</p>
              <p>Matricule: ${command.ADR_C_C_3}</p>
              <p>Numéro: ${command.TEL_CLIENT_F}</p>
               <p>Adresse: ${command.ADR_C_C_2}</p>
                          <p>Chauffeur : ${communications[command.NUM_CDE_C]?.find(communication => communication.CHAUFFEUR?.length)?.CHAUFFEUR || ''}</p>

                          <p>Véhicule: ${communications[command.NUM_CDE_C]?.find(communication => communication.VEHICULE?.length)?.VEHICULE || ''}</p>

              <p>Date livraison prévue: ${communications[command.NUM_CDE_C]?.find(communication => communication.DATELIVRAISONPREVUE?.length)?.DATELIVRAISONPREVUE || ''}</p>
              <p>Traité par: ${command.CC_CHAMP_7} le ${formatDateTr(command.DATETRAIT)}</p>
            </div>
            <div class="section">
              <p class="section-title">Articles commandés</p>
              <table>
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Description</th>
                    <th>Quantité</th>
                    <th>Emplacement </th>
                    <th>Rayon</th>
                  </tr>
                </thead>
                <tbody>
                  ${articles.map(article => `
                    <tr>
                      <td>${article.CCL_ARTICLE}</td>
                      <td>${article.CCL_DES_ART}</td>
                      <td>${article.CCL_QTE_C}</td>
                      <td>${article.EMPLACEMENT_ART}</td>
                      <td>${article.RAYON_ARTICLE}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </body>
      </html>
    `;

    const printWindow = window.open('Cspd Damak', 'Vente en gros');
    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  return (

    <Grid container spacing={2} >
      {commandes
        .filter((command) => command.CC_CHAMP_3 === "Traité" || command.CC_CHAMP_3 === "Livré" && command.CC_VALIDE === 1)
        .map((command) => {

          const etat = command.NUM_CDE_CL ? 'Livré' : command.CC_CHAMP_3 ? command.CC_CHAMP_3 : "Non encore traité"
          const etatColor = etat === "Non encore traité" ? "red" : etat === "En cours de traitement" ? "orange" : etat === "Trait@" ? "green" : etat === "Annul@e" ? "purple" : "blue";
          const isClientDetailsVisible = expandedClient === command.NUM_CDE_C;
          console.table([{ etat, etatColor, numCl: command.NUM_CDE_CL, champ3: command.CC_CHAMP_3 }]);

          return (

            <Grid
              item
              xs={getGridSizes(command).xs}
              sm={getGridSizes(command).sm}
              md={getGridSizes(command).md}
              lg={getGridSizes(command).lg}
              xl={getGridSizes(command).xl}
              key={command.NUM_CDE_C}
            >
              <Card style={{ backgroundColor: 'white', borderRadius: '15px', border: 'transparent' }}
                sx={{
                  height: !isClientDetailsVisible ? '100%' : '700px',
                  transition: 'height 0.3s ease-in-out'
                }}
              >
                <CardContent sx={{ cursor: 'pointer', position: 'relative', height: type === "partenaire" ? 'auto' : 'auto', marginBottom: "20px" }}>
                  <GlowingBox style={{ backgroundColor: "#3572EF", borderRadius: '10px' }}>
                    <Typography
                      variant="h6"
                      component="div"
                      align="center"
                      style={{
                        color: "white",
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontSize: '1.1rem',

                      }}
                    > {etat}</Typography>

                  </GlowingBox>
                  <Typography variant="h6" style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                    <LocalMallIcon style={{ marginRight: '0.3em' }} />  Commande: {formatDate(command.DATE_CDE_C)} {command.CC_CHAMP_6} -  {command.NUM_CDE_C} </Typography>
                  <Typography style={{ display: "flex", alignItems: "center", marginBottom: '10px', color: command.BLOQUER_CLIENT === 1 ? "red" : "#545454", fontWeight: "bold" }} >
                    <PersonIcon style={{ marginRight: '0.3em' }} />
                    <span style={{ color: command.BLOQUER_CLIENT === 1 ? "red" : "green", fontWeight: "bold" }}>Client: {command.CLIENT_CDE}, {command.ADR_C_C_1}</span>
                  </Typography>

                  <Typography style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                    <BrandingWatermarkIcon style={{ marginRight: '0.3em' }} />
                    Matricule: {command.ADR_C_C_3}
                  </Typography>
                  <Typography
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 10,
                      marginTop: "10px",
                      color: '#545454',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}>
                    <CallIcon style={{ marginRight: '0.3em' }} />
                    Numéro: <Button onClick={() => makeCall(command.TEL_CLIENT_F)} >
                      {command.TEL_CLIENT_F} </Button>
                  </Typography>
                  <Typography style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                    <LocalShippingIcon style={{ marginRight: '0.3em' }} />
                    Date livraison prévue :  {communications[command.NUM_CDE_C]?.find(communication => communication.DATELIVRAISONPREVUE?.length)?.DATELIVRAISONPREVUE ? (
                      <span style={{ color: 'red' }}>
                        {communications[command.NUM_CDE_C]?.find(communication => communication.DATELIVRAISONPREVUE?.length)?.DATELIVRAISONPREVUE}
                      </span>
                    ) : (
                      ' '
                    )}</Typography>
                  <Typography style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                    <LocalShippingIcon style={{ marginRight: '0.3em' }} />
                    Chauffeur :  {communications[command.NUM_CDE_C]?.find(communication => communication.CHAUFFEUR?.length)?.CHAUFFEUR ? (
                      <span style={{ color: 'red' }}>
                        {communications[command.NUM_CDE_C]?.find(communication => communication.CHAUFFEUR?.length)?.CHAUFFEUR}
                      </span>
                    ) : (
                      ' '
                    )}</Typography>
                  <Typography style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                    <LocalShippingIcon style={{ marginRight: '0.3em' }} />
                    Véhicule :  {communications[command.NUM_CDE_C]?.find(communication => communication.VEHICULE?.length)?.VEHICULE ? (
                      <span style={{ color: 'red' }}>
                        {communications[command.NUM_CDE_C]?.find(communication => communication.VEHICULE?.length)?.VEHICULE}
                      </span>
                    ) : (
                      ' '
                    )}</Typography>
                  <Typography style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}><img src={addressIcon} alt="person icon" style={{ marginRight: 8, width: "25px", height: "25px" }} />
                    Adresses Client: {command.ADR_C_C_2}</Typography>
                  <Typography style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                    <SupportAgentIcon style={{ marginRight: '0.3em' }} />
                    Traité par : {command.CC_CHAMP_7} le {formatDateTr(command.DATETRAIT)}</Typography>

                  <IconButton
                    onClick={() => handleCardClick(command)}
                    aria-expanded={expanded === command.NUM_CDE_C}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <Typography style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}> Articles commandés </Typography>

                  </IconButton>
                </CardContent>
                <Collapse in={expanded === command.NUM_CDE_C} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Article</TableCell>
                          <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Description</TableCell>
                          <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Quantité</TableCell>
                          <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Emplacement</TableCell>
                          <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Rayon</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {articles.length > 0 && articles.map((cardItem) => {


                          return (
                            <TableRow key={cardItem.CCL_ARTICLE}>
                              <TableCell>
                                <Button onClick={() => openArticleDialog(cardItem?.CCL_ARTICLE)}>{cardItem.CCL_ARTICLE}</Button>
                              </TableCell>

                              <TableCell>{cardItem.CCL_DES_ART}</TableCell>
                              <TableCell>{cardItem.CCL_QTE_C}</TableCell>
                              <TableCell align="right">{cardItem.EMPLACEMENT_ART}</TableCell>
                              <TableCell align="right">{cardItem.RAYON_ARTICLE}</TableCell>
                            </TableRow>

                          );
                        })}

                      </TableBody>
                    </Table>

                  </Box>
                </Collapse>
                <CustomCardActions>
                  <Button
                    startIcon={<PrintIcon style={{ color: 'white' }} />}
                    onClick={() => handlePrint(command)}
                    style={{
                      marginTop: !isClientDetailsVisible ? "4%" : '40%',
                      fontWeight: "bold",
                      fontSize: "10px",
                      color: "#478CCF"
                    }}
                  >
                    <Button startIcon={<PrintIcon />} onClick={() => handleCardClick(command)} style={{ marginTop: !isClientDetailsVisible ? "4%" : '40%', fontWeight: "bold", color: "#478CCF", fontSize: "10px", }} >

                      <IconButton
                        onClick={() => handleCardClick(command)}
                        aria-expanded={expanded === command.NUM_CDE_C}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      ></IconButton>  Imprimer
                    </Button>
                  </Button>
                  <Button startIcon={<HistoryIcon />} onClick={() => handleOpenHistoriqueDialog(command)} style={{ marginTop: !isClientDetailsVisible ? "4%" : '40%', fontWeight: "bold", color: "#478CCF", fontSize: "10px", }} >
                    Historique
                  </Button>

                  {!command.NUM_CDE_CL && etat !== "Traité" && (
                    <Button
                      startIcon={<CancelIcon />}
                      style={{ marginTop: !isClientDetailsVisible ? "4%" : '60%', fontWeight: "bold", color: "red", fontSize: "10px" }}
                      onClick={() => handleOpenCancelDialog(command)}
                    >
                      Annuler
                    </Button>
                  )}

                </CustomCardActions>
              </Card>
            </Grid>
          );
        })}
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
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Annuler la commande</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir annuler cette commande ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="primary">
            NON
          </Button>

        </DialogActions>
      </Dialog>



      <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Historique de Communication
          <Button onClick={() => setHistoryDialog(false)} style={{ position: 'absolute', right: '8px', top: '8px' }}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.400', p: 2, mt: 1, width: '100%' }}>
            <Typography variant="h6" align="center" gutterBottom>
              Historique communication
            </Typography>
            <TableContainer >
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

                    }}>Collaborateur</TableCell>
                    <TableCell sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',

                    }}>Mode de livraison</TableCell>
                    <TableCell sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',

                    }}>Addresse de livraison</TableCell>
                    <TableCell sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',

                    }}>Transporteur</TableCell>
                    <TableCell sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',

                    }}>Béneficaire</TableCell>
                    <TableCell sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',

                    }}>Mode de paiement</TableCell>

                    <TableCell sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',

                    }}>Date de livraison prévue </TableCell>
                        <TableCell
                                          sx={{
                                            backgroundColor: theme.palette.primary.main,
                                            color: theme.palette.common.white,
                                            fontWeight: "bold",
                                            borderBottom: "1px solid rgba(224, 224, 224, 1)",
                                          }}
                                        >
                                          Chauffeur{" "}
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            backgroundColor: theme.palette.primary.main,
                                            color: theme.palette.common.white,
                                            fontWeight: "bold",
                                            borderBottom: "1px solid rgba(224, 224, 224, 1)",
                                          }}
                                        >
                                          Véhicule{" "}
                                        </TableCell>
                                          
                                             <TableCell sx={{
                                                    backgroundColor: theme.palette.primary.main,
                                                    color: theme.palette.common.white,
                                                    fontWeight: 'bold',
                                                    borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                        
                                                }}>Mode de voyage</TableCell>
                  </TableRow>
                </TableHead>

   <TableBody>
                  {(communications[openedHistoryCommand] ?? []).map((c, i) => (
                    <ExpandableTableRow
                      key={c.ID}
                      communication={c}
                      formatDate={formatDate}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          Communication de {commandTocom ? commandTocom.NUM_CDE_C : ''}
          <Button onClick={handleCloseDialog} style={{ position: 'absolute', right: '8px', top: '8px' }}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Saisissez les détails de la communication.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="datetime"
            label="Date/Heure"
            type="datetime-local"
            fullWidth
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />

          <TextField
            autoFocus
            margin="dense"
            id="details-communication"
            label="Détails Communication"
            multiline
            rows={4}
            fullWidth
            value={detailsCommunication}
            onChange={(e) => setDetailsCommunication(e.target.value)}
          />
          <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.400', p: 2, mt: 2 }}>
            <Typography variant="h6">Détails de livraison</Typography>
            <InputLabel id="select-label-1">Mode de livraison</InputLabel>
            <Select
              labelId="select-label-1"
              id="select-1"
              value={modeLivraison}
              onChange={(e) => setModeLivraison(e.target.value)}
              fullWidth
            >
              {modeLiv.map((raison) => (
                <MenuItem key={raison.ID} value={raison}>{raison.LIBELLE}</MenuItem>
              ))}
            </Select>

            <TextField
              margin="dense"
              id="adresse-livraison"
              label="Adresse de livraison"
              fullWidth
              value={adresseLivraison}
              onChange={(e) => setAdresseLivraison(e.target.value)}
            />
            <InputLabel id="select-label-1">Transporteur</InputLabel>
            <Select
              labelId="select-label-1"
              id="select-1"
              value={transporteur}
              onChange={(e) => setTransporteur(e.target.value)}
              fullWidth
            >
              {transporteurs.map((raison) => (
                <MenuItem key={raison.ID} value={raison}>{raison.LIBELLE}</MenuItem>
              ))}
            </Select>
           
                                                <InputLabel id="select-label-mode_voy">Mode voyage</InputLabel>
                                                <Select
                                                  labelId="select-label-mode_voy"
                                                  id="select-mode_voy"
                                                  value={modeVoy}
                                                  onChange={(e) => setModeVoy(e.target.value)}
                                                >
                                                  <MenuItem value="voyage">Voyage</MenuItem>
                                                  <MenuItem value="autre">Autre</MenuItem>
                                                </Select>
                                               
                                    
                                              {modeVoy === "autre" && (
                                                <TextField
                                                  fullWidth
                                                  label="Précisez le mode de voyage"
                                                  value={modeVoyAutre}
                                                  onChange={(e) => setModeVoyAutre(e.target.value)}
                                          
                                                  sx={{ mt: 1 }}
                                                />
                                              )}

          </Box>
          <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.400', p: 2, mt: 2 }}>
            <Typography variant="h6">Facturation </Typography>
            <TextField
              margin="dense"
              id="beneficiaire"
              label="Bénéficiaire"
              value={beneficiaire}
              onChange={(e) => setBeneficiaire(e.target.value)}
              fullWidth
            />
            <TextField
              margin="dense"
              id="matricule-fiscale"
              label="Matricule fiscale"
              value={matriculeFiscale}
              onChange={(e) => setMatriculeFiscale(e.target.value)}
              fullWidth
            />
            <TextField
              margin="dense"
              id="adresse-facturation"
              label="Adresse de facturation"
              value={adresseFacturation}
              onChange={(e) => setAdresseFacturation(e.target.value)}
              fullWidth
            />

            <Typography variant="h6" gutterBottom>
              Date de livraison prévue
            </Typography>
            {errorLivraison && <span style={{ color: 'red' }}>{errorLivraison}</span>}

            <RadioGroup
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={dateLivraisonPrevue}
              onChange={(e) => {
                setDateLivraisonPrevue(e.target.value);
                setErrorLivraison('');
              }}

            >
                            <FormControlLabel value="Immediatement" control={<Radio />} label="Immediatement" />
                            <FormControlLabel value="Demain" control={<Radio />} label="Demain" />
                            <FormControlLabel value="48 H" control={<Radio />} label="48 H" />
                            <FormControlLabel value="72 H" control={<Radio />} label="72 H" />
                            <FormControlLabel value="La semaine prochaine" control={<Radio />} label="La semaine prochaine" />
            </RadioGroup>

          </Box>
<Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.400', p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Détails de paiement (Total: {commandTocom ? commandTocom.CC_TOTAL : '0'} TND)
            </Typography>
            {paymentError && <Typography color="error">{paymentError}</Typography>}
            {paiements.map((payment, index) => (
              <Box key={index} sx={{ mb: 2, borderBottom: index < paiements.length - 1 ? '1px solid #eee' : 'none', pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">Paiement {index + 1}</Typography>
                  {paiements.length > 1 && (
                    <IconButton onClick={() => handleRemovePayment(index)} sx={{ ml: 1 }}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  )}
                </Box>
                <InputLabel id={`select-label-paiement-${index}`}>Mode de paiement</InputLabel>
                <Select
                  labelId={`select-label-paiement-${index}`}
                  id={`select-paiement-${index}`}
                  value={payment.mode_paiement}
                  onChange={(e) => handlePaymentChange(index, 'mode_paiement', e.target.value)}
                  fullWidth
                >
                  {modePay.map((raison) => (
                    <MenuItem key={raison.ID} value={raison}>{raison.LIBELLE}</MenuItem>
                  ))}
                </Select>
                <TextField
                  margin="dense"
                  id={`montant-${index}`}
                  label="Montant (TND)"
                  type="number"
                  fullWidth
                  value={payment.montant}
                  onChange={(e) => handlePaymentChange(index, 'montant', e.target.value)}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
		{payment.mode_paiement.ID === 3 && (
                  <TextField
                    margin="dense"
                    id={`date-echeance-${index}`}
                    label="Date d'Échéance"
                    type="date"
                    fullWidth
                    value={payment.date_echeance}
                    onChange={(e) => handlePaymentChange(index, 'date_echeance', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddPayment}
              sx={{ mt: 1 }}
            >
              Ajouter un mode de paiement
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            style={{
              color: 'black',
              backgroundColor: 'white',
              transition: 'background-color 0.3s',
              width: '150px',
              height: '40px',
              marginTop: '10px',
              marginLeft: '650px',
            }}
            startIcon={<SaveOutlinedIcon />}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#C4D6E8';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
            onClick={() => handleSaveCommunication()}
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

      <Dialog open={openCommSuccess} onClose={handleCloseSuccessDialog} fullWidth maxWidth="sm">
        <DialogTitle style={{ backgroundColor: '#4CAF50', color: '#fff', display: 'flex', alignItems: 'center' }}>
          <CheckCircleOutlineIcon style={{ marginRight: '8px', color: '#fff' }} />
          <Typography variant="h6">Communication enregistrée avec succès</Typography>
          <IconButton aria-label="close" style={{ position: 'absolute', top: '8px', right: '8px', color: '#fff' }} onClick={handleCloseSuccessDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ padding: '20px' }}>
          <Typography>Votre communication a été enregistrée avec succès.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary" variant="contained" size="small">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isArticleDialogOpened} onClose={handleCloseArticleDialog} aria-describedby="alert-dialog-slide-description">
        <DialogContent>
          <DialogContentText>
            {loading ? (
              <Typography>Chargement des données...</Typography>
            ) : selectedArticle ? (
              <div>
                {selectedArticle.CODE_ARTICLE && (
                  <Typography style={{ color: 'black' }}>
                    <span style={{ color: 'black', fontWeight: 'bold', color: '#4379F2', marginBottom: '0.5em' }}>Code Article :</span> {selectedArticle.CODE_ARTICLE}
                  </Typography>
                )}
                {selectedArticle.INTIT_ARTICLE && (
                  <Typography style={{ color: 'black' }}>
                    <span style={{ color: 'black', fontWeight: 'bold', color: '#4379F2', marginBottom: '0.5em' }}>Description :</span> {selectedArticle.INTIT_ARTICLE}
                  </Typography>
                )}
                {selectedArticle.ART_GR3_DESC && (
                  <Typography style={{ color: 'black' }}>
                    <span style={{ color: 'black', fontWeight: 'bold', color: '#4379F2', marginBottom: '0.5em' }}>Vitesse:</span>  {selectedArticle.ART_GR3_DESC}
                  </Typography>
                )}
                {selectedArticle.ART_GR2_DESC && (
                  <Typography style={{ color: 'black' }}>
                    <span style={{ color: 'black', fontWeight: 'bold', color: '#4379F2', marginBottom: '0.5em' }}>Charge :</span>  {selectedArticle.ART_GR2_DESC}
                  </Typography>
                )}
                {selectedArticle.INTIT_ART_3 && (
                  <Typography style={{ color: 'black', fontWeight: 'bold', color: 'red', marginBottom: '0.5em' }}>
                    {selectedArticle.INTIT_ART_3}
                  </Typography>
                )}
                {selectedArticle.INTIT_ART_2 && (
                  <Typography style={{ color: 'black' }}>
                    <span style={{ color: 'black', fontWeight: 'bold', color: '#4379F2' }}>NB :</span>  {selectedArticle.INTIT_ART_2}
                  </Typography>
                )}
                <RenderStockGros article={selectedArticle} />

                {selectedArticle.file && (
                  <Box
                    component="img"
                    alt={selectedArticle.INTIT_ARTICLE}
                    src={`https://api.pneu-mafamech.cspddammak.com/imgmobile/${selectedArticle.file}`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginTop: '16px',
                    }}
                  />
                )}  </div>
            ) : (
              <Typography>Aucune donnée disponible pour cet article.</Typography>
            )}


          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseArticleDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default CommandesList;
