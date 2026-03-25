import React, { useEffect, useState } from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import RenderStockGros from './renderStock';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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
import { InputLabel, MenuItem, Select, FormControl, FormHelperText, FormLabel } from "@mui/material";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import addressIcon from '../icons/address.png'
import Checkbox from '@mui/material/Checkbox';
import axios from 'axios';
import CallIcon from '@mui/icons-material/Call';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import BASE_URL from '../Utilis/constantes';
import midbattery from '../../src/icons/mid-battery.png';
import blockedIcon from '../icons/blockedCli.png';
import cardIcon from '../icons/credit-card.png';
import fullbattery from '../icons/full-battery.png';
import matricule from '../icons/id-card.png';
import emptybattery from '../icons/low-battery.png';
import priceIcon from '../icons/money.png';
import personIcon from '../icons/person.png';
import call from '../icons/telephone_724664.png';
import userIcon from '../icons/user.png';
import { getArticleById } from "../Api";
import { fetchClientsPartenaires } from "../Api";
import { FormControlLabel, Radio } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ExpandableTableRow } from '../components/ExpandableTableRow';

const CommandesReservation = ({ base, type, searchTerm, }) => {
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
    const [transporteursCspd, setTransporteursCspd] = useState([])
    const [modeLiv, setModeLiv] = useState([])
    const [vehiculeCspd, setVehiculeCspd] = useState([])
    const [chauffeur, setChauffeur] = useState('');
    const [modePay, setModepay] = useState([])
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [dateLivraisonPrevue, setDateLivraisonPrevue] = useState('');
    const [etatsCommande, setEtatsCommande] = useState('');
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
    const [partner, setPartner] = useState([]);
    const [error, setError] = useState(null);
    const [clientsData, setClientsData] = useState([]);
    const [selectedCommands, setSelectedCommands] = useState([]);
    const [assignedList, setAssignedList] = useState("");
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
    const client = clientsData[0];
    const [users, setUsers] = useState([]);
    const [idAssigner, setIdAssigner] = useState('');
    const [idCommand, setIdCommand] = useState('');
    const [idCollaborator, setIdCollaborator] = useState('');
    const [vehicule, setVehicule] = useState([]);
    const [validationStatus, setValidationStatus] = useState({});
    const [paiements, setPaiements] = useState([{ mode_paiement: '', montant: '', date_echeance: '' }]);
    const [paymentError, setPaymentError] = useState('');
    const [errors, setErrors] = useState({});
    const [carAssignmentError, setCarAssignmentError] = useState("");
    const [modeVoy, setModeVoy] = useState("");
    const [modeVoyAutre, setModeVoyAutre] = useState("");

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleValidationChange = async (commandId, isChecked) => {
        console.log(`Validation change triggered for commandId: ${commandId}, isChecked: ${isChecked}`);

        try {
            const status = isChecked ? 'Validé' : 'Non validé';
            console.log(`Setting status to: ${status}`);

            const response = await axios.put(`${BASE_URL}/api/updateValidationStatus/${commandId}`, {
                status: status
            });

            console.log('Response from server:', response.data);

            if (response.data.message) {
                console.log(`Update successful: ${response.data.message}`);
                setValidationStatus(prev => ({
                    ...prev,
                    [commandId]: status
                }));
                fetchCommandes();
            }
        } catch (error) {
            console.error('Error updating validation status:', error);
        }
    };



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
        setModePaiement('');
        setDateLivraisonPrevue('');
        setVehicule('');
        setTransporteur('');
        setPaiements([{ mode_paiement: '', montant: '', date_echeance: '' }]);//new
        setPaymentError('');//new
        setErrors({});
        setModeVoy("");
    }
    //new dev1
    const handleAddPayment = () => {
        setPaiements([...paiements, { mode_paiement: '', montant: '', date_echeance: '' }]);
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
        if (!commandTocom || !commandTocom.CC_TOTAL) {
            setPaymentError("Commande ou total de commande non défini");
            return false;
        }

        const orderTotal = parseFloat(commandTocom.CC_TOTAL);
        const totalPaiements = paiements.reduce((sum, p) => {
            // Only add montant for non-ID 7 modes if valid
            return sum + (p.mode_paiement?.ID !== 7 && parseFloat(p.montant) > 0 ? parseFloat(p.montant) : 0);
        }, 0);

        // Check if total payments match order total
        // if (Math.abs(totalPaiements - orderTotal) > 0.01) {
        //   setPaymentError(
        //     `La somme des montants (${totalPaiements.toFixed(2)} TND) ne correspond pas au total de la commande (${orderTotal.toFixed(2)} TND)`
        //   );
        //   return false;
        // }
        const hasPaymentWithId7 = paiements.some(p => p.mode_paiement?.ID === 7);
        if (!hasPaymentWithId7 && Math.abs(totalPaiements - orderTotal) > 0.01) {
            setPaymentError(
                `La somme des montants (${totalPaiements.toFixed(2)} TND) ne correspond pas au total de la commande (${orderTotal.toFixed(2)} TND)`
            );
            return false;
        }

        // Validate each payment
        for (const p of paiements) {
            if (!p.mode_paiement || !p.mode_paiement.ID) {
                setPaymentError("Chaque paiement doit avoir un mode de paiement valide");
                return false;
            }
            // Validate montant for modes other than ID 7
            if (p.mode_paiement.ID !== 7 && (!p.montant || parseFloat(p.montant) < 0)) {
                setPaymentError("Chaque mode de paiement (sauf mode ID 7) doit avoir un montant valide supérieur à 0");
                return false;
            }
            // Validate date_echeance for mode_paiement.ID === 3
            if (p.mode_paiement.ID === 3 && !p.date_echeance) {
                setPaymentError("La date d'échéance est requise pour les paiements par traite");
                return false;
            }
        }

        setPaymentError("");
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


    useEffect(() => {
        Promise.all(commandes.map(async (command) => {
            return await axios.get(
                `${BASE_URL}/api/clientsPartenaires`, {
                params: {
                    id: command.ADR_C_C_1
                }
            }
            );
        })).then((partnersResult) => {
            setPartner(
                partnersResult.reduce((result, partner) => {
                    if (partner.data.length) {
                        result[partner.data[0].ADR_C_C_1] = partner.data;
                    }
                    return result;

                }, {}));
        })
        console.log('helll', partner.data)
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
    useEffect(() => {
        console.log('Connected User:', {
            login: user.LOGIN,
            role: user.ROLE,
            fullDetails: user
        });
    }, [user]);

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
                `${BASE_URL}/api/cmdPartenairesEncours` : type === "investisseur" ?
                    `${BASE_URL}/api/cmdInvestisseursEncours` :
                    `${BASE_URL}/api/cmdRes/${base}`
            const params = {
                page: page,
                pageSize: pageSize,
                searchTerm: searchTerm

            };
            const result = await axios.get(url, { params });
            let commandsList = [...result.data.commandes]
            let finalCommandList = []
            console.log('listcom')
            commandsList.map((row, i) => {
                finalCommandList.push({
                    ...row,
                    assignedCommand: false,
                })
                console.log("listcomm", finalCommandList)

            })
            setCommandes(result.data.commandes);
            setTotal(result.data.total);
        } catch (error) {
            console.error('Error fetching commands:', error);
        }
    };

    useEffect(() => {
        const list = selectedCommands.join(';');
        setAssignedList(list);
        console.log('assignedcommands', list);
    }, [selectedCommands]);

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

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/users`);
            setUsers(response.data);
            
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

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
        axios.get(`${BASE_URL}/api/Chauffeur`)
            .then(response => setTransporteursCspd(response.data))
            .catch(error => console.error('Error fetching data:', error));
        axios.get(`${BASE_URL}/api/Vehicules`)
            .then(response => setVehicule(response.data))
            .catch(error => console.error('Error fetching data:', error));
        fetchCommandes();
        fetchCommunications();
    }, [page, pageSize, searchTerm]);

    const handleSaveCommunication = async () => {

        const newErrors = {};

        if (!dateTime) newErrors.dateTime = "Date/Heure est requise";
        if (!detailsCommunication) newErrors.detailsCommunication = "Détails Communication est requis";
        if (!etatsCommande) newErrors.etatsCommande = "État de la commande est requis";
        if (!modeLivraison) newErrors.modeLivraison = "Mode de livraison est requis";
        if (!adresseLivraison) newErrors.adresseLivraison = "Adresse de livraison est requise";
        if (!beneficiaire) newErrors.beneficiaire = "Bénéficiaire est requis";
        if (!matriculeFiscale) newErrors.matriculeFiscale = "Matricule fiscale est requise";
        if (!adresseFacturation) newErrors.adresseFacturation = "Adresse de facturation est requise";
        if (!dateLivraisonPrevue) newErrors.dateLivraisonPrevue = "Date de livraison prévue est requise";

        if (modeLivraison?.LIBELLE === "Nos moyens") {
            if (!chauffeur) newErrors.chauffeur = "Chauffeur est requis";
            if (!vehiculeCspd) newErrors.vehiculeCspd = "Véhicule est requis";
        } else if (modeLivraison?.LIBELLE === "transporteur") {
            if (!transporteur) newErrors.transporteur = "Transporteur est requis";
        }

        if (!validatePayments()) newErrors.paiements = paymentError;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (commandTocom && commandTocom.NUM_CDE_C) {

                const formattedPaiements = paiements.map(p => ({
                    mode_paiement: p.mode_paiement.ID,
                    montant: p.mode_paiement.ID !== 7 ? parseFloat(p.montant) || 0 : 0,
                    date_echeance: p.date_echeance || null
                }));
                const response = await axios.post(`${BASE_URL}/api/UpdateOrCreateComCmd`, {
                    ref_commande: commandTocom.NUM_CDE_C,
                    commercial: user.LOGIN,
                    statut: "Validation commerciale",
                    datetime: dateTime,
                    details_communication: detailsCommunication,
                    etatsCommande,
                    mode_livraison: modeLivraison?.ID,
                    adresse_livraison: adresseLivraison,
                    transporteur: transporteur?.ID,
                    chauffeur: chauffeur,
                    vehicule: vehiculeCspd,
                    mode_voy: modeVoy === "autre" ? modeVoyAutre : modeVoy,
                    beneficiaire,
                    matricule_fiscale: matriculeFiscale,
                    adresse_facturation: adresseFacturation,
                    base,
                    dateLivraisonPrevue,
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
            resetForm();
        }
    };
    const ExpandingIcon = styled(ExpandMoreIcon)`
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
    const submitAssignement = async (e) => {
        e.preventDefault();
        const data = {
            assigner: idAssigner,
            command: idCommand,
            collaborator: idCollaborator,
        };

        try {
            const response = await axios.post('/api/AssignCommand', data);
            console.log(response.data.message);

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleConfirmCancel = async () => {
        if (commandToCancel) {
            try {
                await axios.put(
                    `${BASE_URL}/api/updateEtatCmd`,
                    { reference: commandToCancel.NUM_CDE_C, etat: "Annulée", base: base }
                );

            } catch (err) {
                console.error('Erreur lors de l\'annulation de la commande:', err);

            }
            setOpenCancelDialog(false);
            setCommandToCancel(null);
            fetchCommandes()
        }
    };
    const handleOpenDialog = async (command) => {
        setCommandTocom(command)
        setBeneficiaire(command.CC_UTILIS || '');
        setMatriculeFiscale(
            `${command.CL_MAT_F1 || ''} ${command.CL_MAT_F2 || ''} ${command.CL_MAT_F3 || ''} ${command.CL_MAT_F4 || ''}`.trim()
        );
        setAdresseFacturation(
            `${command.ADR_C_C_2 || ''}, ${command.ADR_C_C_3 || ''}`.trim()
        );
        setOpenDialog(true);
        console.log("cmd", command)

        setDateTime(new Date().toISOString().slice(0, 16));
        if (!command.CC_CHAMP_3) {
            try {
                console.log("start")

                await axios.put(
                    `${BASE_URL}/api/updateEtatCmd`,
                    { reference: command.NUM_CDE_C, etat: "En cours de traitement", base: base }
                );

            } catch (error) {
                console.error('Error updating partenaire:', error);
            }
        }
    };
    const handleTarifDialogOpen = async (command) => {
        try {
            console.log("client", command.CODE_CLIENT)
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

    const handleChangeRowsPerPage = (event) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const [datePart, timePart] = dateString.split('T');
        const [year, month, day] = datePart.split('-');
        const [hour, minute, second] = timePart.split('.')[0].split(':');
        const date = new Date(year, month - 1, day, hour, minute, second);
        const formattedDate = date.toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        return formattedDate;
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
        console.log('drt', command)
    };

    const handleClientClick = (commandId) => {
        setExpandedClient(prev => (prev === commandId ? null : commandId));
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
        <Grid container spacing={2}>
            {commandes.map((command) => {
                const etat =
                    command.ETAT_CDE_C === 'LT' && command.CC_VALIDE !== 0
                        ? 'Livré'
                        : command.CC_CHAMP_3
                            ? command.CC_CHAMP_3
                            : "Non encore traité";
                const etatColor =
                    etat === "Non encore traité"
                        ? "red"
                        : etat === "Livré"
                            ? "#3572EF"
                            : etat === "En cours de traitement"
                                ? "orange"
                                : etat === "Traité" && command.CC_VALIDE !== 0
                                    ? "green"
                                    : etat === "Annulée"
                                        ? "purple"
                                        : "blue";

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
                        <Card
    style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        border: 'transparent',
        display: 'flex',  // Use flexbox for the layout
        flexDirection: 'column',  // Stack content vertically
        height: '100%',  // Ensure the card takes the full height of the parent
    }}
    sx={{
        transition: 'height 0.3s ease-in-out',
    }}
>
    <CardContent
        sx={{
            cursor: 'pointer',
            position: 'relative',
            flexGrow: 1,  // Allow the content to grow and fill available space
            overflowY: 'auto',  // Allow scrolling if the content overflows
            marginBottom: '20px',
        }}
    >
        <GlowingBox style={{ backgroundColor: etatColor, borderRadius: '10px' }}>
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
            >
                {etat}
                <span style={{ marginLeft: '1em', fontSize: '0.8em' }}>
                    {etat === 'Traité' ?
                        (command.CC_VALIDE === 0 ? '(non validée) ' : '(validée)')
                        : ''
                    }
                </span>
            </Typography>
        </GlowingBox>
                                <Typography variant="h6" style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                                    <img src={cardIcon} alt="person icon" style={{ marginRight: 8, width: "25px", height: "25px" }} />
                                    Commande: {formatDate(command.DATE_CDE_C)}  -{command.NUM_CDE_C}</Typography>
                                <Typography style={{ display: "flex", alignItems: "center", marginBottom: '10px', color: command.BLOQUER_CLIENT === 1 ? "red" : "green", fontWeight: "bold" }} onClick={() => handleClientClick(command.NUM_CDE_C)}>
                                    <img src={command.BLOQUER_CLIENT === 1 ? blockedIcon : personIcon} alt="status icon" style={{ marginRight: 8, width: "25px", height: "25px" }} />
                                    Client: {command.CLIENT_CDE}, {command.ADR_C_C_1} <BouncingIcon style={{ marginRight: '0.5em' }} />
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
                                        onClick={() => handleClientClick(command.NUM_CDE_C)}
                                    >
                                        <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                                            <strong>Mode de règlement:</strong> {command.LIBEL_REGL_C}
                                        </Typography>
                                        <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                                            <strong>{command.CL_CHAMP_11}</strong>
                                        </Typography>
                                        <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                                            <strong>Échéance:</strong> {command.ECHEANCE_REG_C}
                                        </Typography>
                                        <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                                            <strong>Encours client:</strong>{Number(command.ENCOURSREG) + Number(command.SOLDE_CLIENT) + Number(command.BLNONFACT)}
                                        </Typography>
                                        <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                                            <strong>Encours autorisé:</strong> {command.ENCOURS_MAX_C}
                                        </Typography>
                                        <Typography style={{ display: "flex", alignItems: "center", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                                            <strong>Encours supp:</strong> {command.ENCOURS_SUPP}
                                        </Typography>
                                    </Box>
                                )}
                                <Typography style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                                    <img src={priceIcon} alt="price icon" style={{ marginRight: 8, width: "25px", height: "25px" }} />
                                    Total: {command.CC_TOTAL} TND
                                </Typography>
                                <Typography style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}>
                                    <img src={matricule} alt="matricule icon" style={{ marginRight: 8, width: "25px", height: "25px" }} />
                                    Matricule: {command.ADR_C_C_3}
                                </Typography>
                                <Typography style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}><img src={addressIcon} alt="person icon" style={{ marginRight: 8, width: "25px", height: "25px" }} />
                                    Adresses Client: {command.ADR_C_C_2}</Typography>
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
                                    <img
                                        src={call}
                                        alt="person icon"
                                        style={{ marginRight: 8, width: "25px", height: "25px" }}
                                    />    Numéro: <Button onClick={() => makeCall(command.TEL_CLIENT_F)} >
                                        {command.TEL_CLIENT_F} </Button>
                                </Typography>
                                <Typography style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}><img src={userIcon} alt="person icon" style={{ marginRight: 8, width: "25px", height: "25px" }} />Traité par : {command.CC_CHAMP_7} le {formatDateTr(command.DATETRAIT)}</Typography>
                                <Typography style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}><img src={personIcon} alt="person icon" style={{ marginRight: 8, width: "25px", height: "25px" }} />Date livraison prévue :  {communications[command.NUM_CDE_C]?.find(communication => communication.DATELIVRAISONPREVUE?.length)?.DATELIVRAISONPREVUE ? (
                                    <span style={{ color: 'red' }}>
                                        {communications[command.NUM_CDE_C]?.find(communication => communication.DATELIVRAISONPREVUE?.length)?.DATELIVRAISONPREVUE}
                                    </span>
                                ) : (
                                    ' '
                                )}</Typography>
                                {communications[command.NUM_CDE_C]?.find(communication => communication.ETAT_COMMANDE?.length) && (
                                    <Typography

                                        style={{ display: "flex", alignItems: "center", marginBottom: 10, marginTop: "10px", color: '#545454', fontWeight: 'bold', fontSize: '16px' }}
                                    > <ErrorOutlineIcon />
                                        Détails d'état :
                                        {communications[command.NUM_CDE_C]?.find(communication => communication.DATELIVRAISONPREVUE?.length)?.DATELIVRAISONPREVUE ? (
                                            <span style={{ color: 'red', marginRight: '0.8em' }}>
                                                {communications[command.NUM_CDE_C]?.find(communication => communication.ETAT_COMMANDE?.length)?.ETAT_COMMANDE}
                                            </span>
                                        ) : (
                                            ' '
                                        )}
                                    </Typography>
                                )}
                                <IconButton
                                    onClick={() => handleCardClick(command)}
                                    aria-expanded={expanded === command.NUM_CDE_C}
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                >
                                    <Typography style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}> Articles commandés </Typography>
                                    <ExpandingIcon style={{ marginRight: '0.1em', color: 'white' }} />
                                </IconButton>
                            </CardContent>
                            <Collapse in={expanded === command.NUM_CDE_C} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Article</TableCell>
                                                <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Description</TableCell>
                                                <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Pu TTC</TableCell>
                                                <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Quantité</TableCell>
                                                <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Montant TTC</TableCell>
                                                <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Mode de paiement</TableCell>
                                                <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Quantité cmd clients</TableCell>
                                                <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Quantité cmd fournisseurs</TableCell>
                                                <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Date réception prv</TableCell>
                                                <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Remise</TableCell>
                                                <TableCell style={{ backgroundColor: '#0B4C69', color: 'white' }}>Disponibilité</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {articles.length > 0 && articles.map((cardItem) => {
                                                const difference = (Number(cardItem.STOCK_PHYSIQUE) - Number(cardItem.CDES_CLIENTS));

                                                return (
                                                    <TableRow key={cardItem.CCL_ARTICLE}>
                                                        <TableCell>
                                                            <Button onClick={() => openArticleDialog(cardItem?.CCL_ARTICLE)}>{cardItem.CCL_ARTICLE}</Button>
                                                        </TableCell>
                                                        <TableCell>{cardItem.CCL_DES_ART}</TableCell>
                                                        <TableCell>{cardItem.CCL_PXU_TTC}</TableCell>
                                                        <TableCell>{cardItem.CCL_QTE_C}</TableCell>
                                                        <TableCell>{cardItem.CCL_MONTANT_TTC}</TableCell>
                                                        <TableCell>{command.LIBEL_REGL_C}</TableCell>
                                                        <TableCell>{cardItem.CDES_CLIENTS}</TableCell>
                                                        <TableCell>{cardItem.CDES_FOURNIS}</TableCell>
                                                        <TableCell> {formatDate(cardItem.LATEST_DATE_LIV_CF_P)}</TableCell>
                                                        <TableCell>
                                                            {[
                                                                { keyword: "OZKA", amount: 30 },
                                                                { keyword: "OTANI", amount: 35 },
                                                                { keyword: "STARMAXX", amount: 30 },
                                                                { keyword: "STIP", amount: 22.17 },
                                                                { keyword: "PETLAS", amount: 30 },
                                                                { keyword: "KUMHO", amount: 33 },
                                                                { keyword: "SIOC", amount: 20 },
                                                                { keyword: "ZEETEX", amount: 28 },
                                                            ].some(({ keyword, amount }) =>

                                                                ((cardItem.CCL_ARTICLE && cardItem.CCL_ARTICLE.includes(keyword)) ||
                                                                    (cardItem.CCL_DES_ART && cardItem.CCL_DES_ART.includes(keyword))) &&
                                                                cardItem.CCL_TX_REM === amount
                                                            ) ? "Comptant" : "à termes"}

                                                        </TableCell>
                                                        <TableCell>
                                                            <img
                                                                src={
                                                                    difference <= 0
                                                                        ? emptybattery
                                                                        : difference <= 8
                                                                            ? midbattery
                                                                            : fullbattery
                                                                }
                                                                alt={
                                                                    difference <= 0
                                                                        ? 'Empty Battery'
                                                                        : difference <= 8
                                                                            ? 'Mid Battery'
                                                                            : 'Full Battery'
                                                                }
                                                                style={{ width: '24px', height: '24px' }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody> {(user.ROLE === 'administrateur' || user.ROLE === 'directeur commercial ') && 'valider'
                                            && (
                                                <Checkbox
                                                    icon={<CheckBoxOutlineBlankIcon />}
                                                    checkedIcon={<CheckBoxIcon />}
                                                    checked={validationStatus[command.NUM_CDE_C] === 'Validé'}
                                                    onChange={(e) => handleValidationChange(command.NUM_CDE_C, e.target.checked)}
                                                    style={{
                                                        marginTop: !isClientDetailsVisible ? "4%" : '40%',
                                                        color: "#478CCF"
                                                    }}
                                                />
                                            )}
                                        {(user.ROLE === 'administrateur' || user.ROLE === 'directeur commercial ') && 'valider'}
                                    </Table>
                                </Box>
                            </Collapse>
                           <CustomCardActions sx={{ marginTop: 'auto' }}>
    <Button
        startIcon={<CallIcon />}
        color="primary"
        onClick={() => handleOpenDialog(command)}
        style={{
            fontSize: '10px',
            fontWeight: 'bold',
        }}
        disabled={
            (command.CC_CHAMP_7 && command.CC_CHAMP_7 !== user.LOGIN) ||
            validationStatus[command.NUM_CDE_C] === 'Validée' ||
            command.CC_VALIDE === 1
        }
    >
        Appeler
    </Button>
    <Button
        startIcon={<HistoryIcon />}
        onClick={() => handleOpenHistoriqueDialog(command)}
        style={{
            fontWeight: 'bold',
            color: '#478CCF',
            fontSize: '10px',
        }}
    >
        Historique
    </Button>
    <Button
        startIcon={<LocalAtmIcon />}
        onClick={() => handleTarifDialogOpen(command)}
        style={{
            fontWeight: 'bold',
            fontSize: '10px',
            color: '#478CCF',
        }}
    >
        tarifs
    </Button>
    {!command.NUM_CDE_CL && etat !== 'Traité' && (
        <Button
            startIcon={<CancelIcon />}
            style={{
                fontWeight: 'bold',
                color: 'red',
                fontSize: '10px',
            }}
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
    py: 0,      // 🔹 remove vertical padding
    px: 2,
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
      minHeight: 36,
      '& .MuiTablePagination-toolbar': {
        minHeight: 36,
        padding: 0,
      },
      '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
        margin: 0,
      },
    }}
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
                    <Button onClick={handleConfirmCancel} color="secondary">
                        OUI
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
                                        }}>Mode de livraison
                                        </TableCell>
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
                                        }}>Transporteur
                                        </TableCell>
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
                                        <TableCell sx={{
                                            backgroundColor: theme.palette.primary.main,
                                            color: theme.palette.common.white,
                                            fontWeight: 'bold',
                                            borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                        }}>Chauffeur </TableCell>
                                        <TableCell sx={{
                                            backgroundColor: theme.palette.primary.main,
                                            color: theme.palette.common.white,
                                            fontWeight: 'bold',
                                            borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                        }}>Véhicule </TableCell>
                                        <TableCell sx={{
                                            backgroundColor: theme.palette.primary.main,
                                            color: theme.palette.common.white,
                                            fontWeight: 'bold',
                                            borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                        }}>Mode de voyage </TableCell>
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
            <Dialog open={openDialog} onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    handleCloseDialog();
                }
            }} maxWidth="lg" fullWidth>
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
                        error={!!errors.detailsCommunication}
                        helperText={errors.detailsCommunication}
                    />
                    <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.400', p: 2, mt: 2 }}>
                        <Typography variant="h6">Détails d'état</Typography>
                        <FormControl component="fieldset" error={!!errors.etatsCommande}>
                            <RadioGroup
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                value={etatsCommande}
                                onChange={(e) => {
                                    setEtatsCommande(e.target.value);
                                }}
                            >
                                <FormControlLabel value="Confirmée" control={<Radio />} label="Confirmée " />
                                <FormControlLabel value="En attente de confirmation" control={<Radio />} label="En attente de confirmation" />
                                <FormControlLabel value="Coordination Logistique" control={<Radio />} label="Coordination Logistique" />
                                <FormControlLabel value="Problème d'échéance" control={<Radio />} label="Problème d'échéance" />
                            </RadioGroup>
                            {errors.etatsCommande && <FormHelperText>{errors.etatsCommande}</FormHelperText>}
                        </FormControl>
                    </Box>
                    <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.400', p: 2, mt: 2 }}>
                        <Typography variant="h6">Détails de livraison</Typography>
                        <FormControl fullWidth error={!!errors.modeLivraison}>
                            <InputLabel id="select-label-1">Mode de livraison</InputLabel>
                            <Select
                                labelId="select-label-1"
                                id="select-1"
                                value={modeLivraison}
                                onChange={(e) => setModeLivraison(e.target.value)}
                                fullWidth
                            >
                                {Array.isArray(modeLiv) && modeLiv.map((raison) => (
                                    <MenuItem key={raison.ID} value={raison}>{raison.LIBELLE}</MenuItem>
                                ))}
                            </Select>
                            {errors.modeLivraison && <FormHelperText>{errors.modeLivraison}</FormHelperText>}
                        </FormControl>
                        {modeLivraison?.LIBELLE === 'Nos Moyens' && (
                            <>
                                <TextField
                                    margin="dense"
                                    id="num-cheque"
                                    label="Num chéque"
                                    fullWidth
                                    value={numCheque}
                                    onChange={(e) => setNumCheque(e.target.value)}
                                />
                                <TextField
                                    margin="dense"
                                    id="banque"
                                    label="Banque"
                                    fullWidth
                                    value={banque}
                                    onChange={(e) => setBanque(e.target.value)}
                                />
                                <TextField
                                    margin="dense"
                                    id="date-echeance"
                                    label="Date échéance"
                                    type="date"
                                    fullWidth
                                    value={dateEcheance}
                                    onChange={(e) => setDateEcheance(e.target.value)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </>
                        )}
                        <TextField
                            margin="dense"
                            id="adresse-livraison"
                            label="Adresse de livraison"
                            fullWidth
                            value={adresseLivraison}
                            onChange={(e) => setAdresseLivraison(e.target.value)}
                            error={!!errors.adresseLivraison}
                            helperText={errors.adresseLivraison}
                        />
                        {modeLivraison?.LIBELLE === 'Nos moyens' && (
                            <>
                                <FormControl fullWidth error={!!errors.chauffeur}>
                                    <InputLabel id="select-label-chauffeur">Chauffeur</InputLabel>
                                    <Select
                                        labelId="select-label-chauffeur"
                                        id="select-chauffeur"
                                        value={chauffeur}
                                        onChange={(e) => setChauffeur(e.target.value)}
                                        fullWidth
                                    >
                                        {transporteursCspd.map((chauffeur) => (
                                            <MenuItem key={chauffeur.ID} value={chauffeur.LIBELLE}>
                                                {chauffeur.LIBELLE}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.chauffeur && <FormHelperText>{errors.chauffeur}</FormHelperText>}
                                </FormControl>
                                <FormControl fullWidth error={!!errors.vehiculeCspd}>
                                    <InputLabel id="select-label-chauffeur">Véhicule</InputLabel>
                                    <Select
                                        labelId="select-label-1"
                                        id="select-1"
                                        value={vehiculeCspd}
                                        onChange={(e) => setVehiculeCspd(e.target.value)}
                                        fullWidth
                                    >
                                        {vehicule.map((vehicule) => (
                                            <MenuItem key={vehicule.ID} value={vehicule.LIBELLE}>
                                                {vehicule.LIBELLE}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.vehiculeCspd && <FormHelperText>{errors.vehiculeCspd}</FormHelperText>}
                                </FormControl>
                                <FormControl fullWidth error={!!errors.mode_voy}>
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
                                    {errors.mode_voy && <FormHelperText>{errors.mode_voy}</FormHelperText>}
                                </FormControl>

                                {modeVoy === "autre" && (
                                    <TextField
                                        fullWidth
                                        label="Précisez le mode de voyage"
                                        value={modeVoyAutre}
                                        onChange={(e) => setModeVoyAutre(e.target.value)}
                                        error={!!errors.modeVoyAutre}
                                        helperText={errors.modeVoyAutre}
                                        sx={{ mt: 1 }}
                                    />
                                )}
                                {carAssignmentError && <Typography color="error" sx={{ mt: 1 }}>{carAssignmentError}</Typography>}
                            </>
                        )}
                        {modeLivraison?.LIBELLE === 'transporteur' && (
                            <FormControl fullWidth error={!!errors.transporteur}>
                                <InputLabel id="select-label-transporteur">Transporteur</InputLabel>
                                <Select
                                    labelId="select-label-transporteur"
                                    id="select-transporteur"
                                    value={transporteur}
                                    onChange={(e) => setTransporteur(e.target.value)}
                                >
                                    {transporteurs.map((raison) => (
                                        <MenuItem key={raison.ID} value={raison}>{raison.LIBELLE}</MenuItem>
                                    ))}
                                </Select>
                                {errors.transporteur && <FormHelperText>{errors.transporteur}</FormHelperText>}
                            </FormControl>
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
                            error={!!errors.beneficiaire}
                            helperText={errors.beneficiaire}
                        />
                        <TextField
                            margin="dense"
                            id="matricule-fiscale"
                            label="Matricule fiscale"
                            value={matriculeFiscale}
                            onChange={(e) => setMatriculeFiscale(e.target.value)}
                            fullWidth
                            error={!!errors.matriculeFiscale}
                            helperText={errors.matriculeFiscale}
                        />
                        <TextField
                            margin="dense"
                            id="adresse-facturation"
                            label="Adresse de facturation"
                            value={adresseFacturation}
                            onChange={(e) => setAdresseFacturation(e.target.value)}
                            fullWidth
                            error={!!errors.adresseFacturation}
                            helperText={errors.adresseFacturation}
                        />
                        <Typography variant="h6" gutterBottom>
                            Date de livraison prévue
                        </Typography>
                        <FormControl component="fieldset" error={!!errors.dateLivraisonPrevue}>
                            <FormLabel component="legend">Date de livraison prévue</FormLabel>

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
                            {errors.dateLivraisonPrevue && <FormHelperText>{errors.dateLivraisonPrevue}</FormHelperText>}
                        </FormControl>
                    </Box>
                    <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.400', p: 2, mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Détails de paiement (Total: {commandTocom ? commandTocom.CC_TOTAL : '0'} TND)
                        </Typography>
                        {errors.paiements && <Typography color="error">{errors.paiements}</Typography>}
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
                                {payment.mode_paiement.ID !== 7 && (<TextField
                                    margin="dense"
                                    id={`montant-${index}`}
                                    label="Montant (TND)"
                                    type="number"
                                    fullWidth
                                    value={payment.montant}
                                    onChange={(e) => handlePaymentChange(index, 'montant', e.target.value)}
                                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                />)}
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

export default CommandesReservation;
