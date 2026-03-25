import React, { useState, useEffect } from 'react';
import { Select, MenuItem } from '@mui/material';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import {
    Box,
    Input,
    Typography,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Paper
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import styled from 'styled-components';
import BASE_URL from '../Utilis/constantes';
import Sav from './Sav';
import AddIcon from '@mui/icons-material/Add';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { useSelector } from 'react-redux';
import entete from '../images/sahar up.png';
import { isFluxStandardAction } from '@reduxjs/toolkit';

const AddButton = styled.button`
  background: #4299e1;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  margin-bottom: 20px;
  cursor: pointer;

  &:hover {
    background: #3182ce;
  }
`;

const NoClaimsMessage = styled.div`
  text-align: center;
  margin: 20px;
  color: #666;
`;

const TableContainer = styled.div`
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
`;

const TableHeader = styled.div`
  display: flex;
  background: #9dbdff;
  padding: 10px;
  font-weight: bold;
`;

const TableRow = styled.div`
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;

  &:hover {
    background: #f0f0f0;
  }
`;
const StatusCell = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  
  &.reception-recu {
    background-color: #c6f6d5;
    color: #22543d;
  }
  
  &.reception-attente {
    background-color: #feebc8;
    color: #744210;
  }
  
  &.reception-non-recu {
    background-color: #fed7d7;
    color: #822727;
  }
  
  &.decision-accepte {
    background-color: #c6f6d5;
    color: #22543d;
  }
  
  &.decision-cours {
    background-color: #bee3f8;
    color: #2a4365;
  }
  
  &.decision-refuse {
    background-color: #fed7d7;
    color: #822727;
  }
`;

const TableCell = styled.div`
  flex: 1;
  padding: 8px;
  text-align: left;
  min-width: 70px;

  &:last-child {
    display: flex;
    justify-content: flex-end;
  }
`;

const SavManagement = () => {
    const [showForm, setShowForm] = useState(false);
    const [claims, setClaims] = useState([]);
    const [enteteBase64, setEnteteBase64] = useState('');

    const [selectedClaim, setSelectedClaim] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openReceptionDialog, setOpenReceptionDialog] = useState(false);
    const [selectedReceptionClaim, setSelectedReceptionClaim] = useState(null);
    const [openDecisionDialog, setOpenDecisionDialog] = useState(false);
    const [selectedDecisionClaim, setSelectedDecisionClaim] = useState(null);
    const [newDecisionStatus, setNewDecisionStatus] = useState('');
    const [newReceptionStatus, setNewReceptionStatus] = useState('');
    const [newRetourStatus, setNewRetourStatus] = useState('');
    const [selectedRetourClaim, setSelectedRetourClaim] = useState(null);
    const [openRetourDialog, setOpenRetourDialog] = useState(null);
    const [enteteCache, setEnteteCache] = useState(null);

    useEffect(() => {
        if (!enteteCache && enteteBase64) {
            setEnteteCache(enteteBase64);
        }
    }, [enteteBase64]);
    const user = useSelector((state) => state.user);
    const handleOpenDecisionDialog = (claim) => {
        setSelectedDecisionClaim(claim);
        setNewDecisionStatus(claim.DECISION || '');
        setFormData({ ...formData, RAISON: claim.RAISON || '' });
        setOpenDecisionDialog(true);
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
    useEffect(() => {
        fetchUsers();
        convertEnteteToBase64();
    }, []);

    const [formData, setFormData] = useState({
        RAISON: '',
        RETOURS: '',
        COMMENTAIRE: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleCloseDecisionDialog = () => {
        setOpenDecisionDialog(false);
        setSelectedDecisionClaim(null);
        setNewDecisionStatus('');
    };
    const handleOpenReceptionDialog = (claim) => {
        setSelectedReceptionClaim(claim);
        setNewReceptionStatus(claim.RECEPTION || '');
        setOpenReceptionDialog(true);
    };

    const handleCloseReceptionDialog = () => {
        setOpenReceptionDialog(false);
        setSelectedReceptionClaim(null);
        setNewRetourStatus('');
    };
    const handleOpenRetourDialog = (claim) => {
        setSelectedRetourClaim(claim);
        setFormData({
            ...formData,
            RETOURS: claim.RETOURS || '',
            COMMENTAIRE: claim.COMMENTAIRE || ''
        });
        setOpenRetourDialog(true);
    };

    const handleCloseRetourDialog = () => {
        setOpenRetourDialog(false);
        setSelectedRetourClaim(null);
        setNewRetourStatus('');
    };
    const handleDecisionSubmit = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/updateDecision`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    id: selectedDecisionClaim.ID,
                    decision: newDecisionStatus,
                    raison: formData.RAISON
                })
            });

            if (response.ok) {
                fetchClaims();
                handleCloseDecisionDialog();
            }
        } catch (error) {
            console.error('Error updating decision:', error);
        }
    };
    const handleReceptionSubmit = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/updateReception`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    id: selectedReceptionClaim.ID,
                    reception: newReceptionStatus,
                    magasinier: user.LOGIN// Using the current user's name
                })
            });

            if (response.ok) {
                fetchClaims();
                handleCloseReceptionDialog();
            }
        } catch (error) {
            console.error('Error updating reception:', error);
        }
    };
    useEffect(() => {
        fetchClaims();
    }, []);
    const handleRetourSubmit = async () => {
        try {
            if (!selectedRetourClaim?.ID || !formData.RETOURS) {
                console.error('Missing required fields');
                return;
            }

            const response = await fetch(`${BASE_URL}/api/updateRetour`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    id: selectedRetourClaim.ID,
                    retours: formData.RETOURS,
                    commentaire: formData.COMMENTAIRE
                })
            });

            if (response.ok) {
                await fetchClaims();
                handleCloseRetourDialog();
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
            }
        } catch (error) {
            console.error('Error updating retour status:', error);
        }
    };
    useEffect(() => {
        fetchClaims();
    }, []);
    const fetchClaims = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/getSavMagasin`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setClaims(data);
            }
        } catch (error) {
            console.error('Error fetching claims:', error);
        }
    };

    const handleViewDetails = (claim) => {
        setSelectedClaim(claim);
        setOpenModal(true);
    };
    const fetchUsers = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/users`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setUserRole(data.role);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedClaim(null);
    };
    const handleFileDownload = async (fileName) => {
        try {
            const response = await fetch(`${BASE_URL}/api/download/${fileName}`, {
                credentials: 'include'
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
        }
    };
    const handleFileDisplay = (filesData) => {
        try {
            if (!filesData) return [];

            if (typeof filesData === 'string') {
                const parsed = JSON.parse(filesData);
                return Array.isArray(parsed) ? parsed : [parsed];
            }

            if (Array.isArray(filesData)) {
                return filesData;
            }

            return [];
        } catch (error) {
            console.error('Error parsing files data:', error);
            return [];
        }
    };
    const fetchEnteteBase64 = () => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            setEnteteBase64(canvas.toDataURL('image/png'));
        };
        img.src = entete;
    };

    useEffect(() => {
        fetchEnteteBase64();
    }, []);

    const handlePrint = () => {
        if (!enteteBase64 || !selectedClaim) {
            alert('Les informations ne sont pas complètement chargées.');
            return;
        }

        const printContent = `
            <html>
                <head>
                    <title>Détails de la Réclamation</title>
                    <style>
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                        }
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 10px;
                        }
                        .header-image {
                            width: 100%; 
                            max-height: 100%; 
                            object-fit: contain;
                        }
                        .content {
                            padding: 10px;
                            margin-top: -800px;
                        }
                        .title {
                            color: #0B4C69;
                            text-align: center;
                            margin-bottom: 10px;
                        }
                        .info-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 10px;
                            margin-bottom: 20px;
                        }
                        .info-section {
                            border: 1px solid #ddd;
                            padding: 5px;
                            border-radius: 5px;
                        }
                        .info-item {
                            margin: 10px 0;
                        }
                        .label {
                            font-weight: bold;
                            color: #333;
                        }
                        .signature-section {
                            margin-top: 10px;
                            display: flex;
                            justify-content: space-between;
                        }
                        .signature-box {
                            border-top: 1px solid #000;
                            width: 200px;
                            text-align: center;
                            padding-top: 10px;
                        }
                    </style>
                </head>
                <body>
                    <img src="${enteteBase64}" alt="En-tête" class="header-image">
                    <div class="content">
                        <h2 class="title">Fiche de Réclamation N° ${selectedClaim.ID}</h2>
                        <h5 class="title">Le client dispose de 2 mois pour récupérer son pneu, passé ce délai, aucun retour ni remboursement ne sera possible. Merci de respecter ce délai pour éviter tout désagrément.</h5>
    
                        <div class="info-grid">
                            <div class="info-section">
                                <h3>Informations Client</h3>
                                <div class="info-item"><span class="label">Client:</span> ${selectedClaim.UTILISATEUR}</div>
                                <div class="info-item"><span class="label">Adresse:</span> ${selectedClaim.ADRESSE}</div>
                                <div class="info-item"><span class="label">Date:</span> ${new Date(selectedClaim.DEMAND_DATE).toLocaleDateString()}</div>
                                <div class="info-item"><span class="label">Grossiste:</span> ${selectedClaim.GROSSISTE}</div>
                                <div class="info-item"><span class="label">Vendeur:</span> ${selectedClaim.VENDEUR}</div>
                            </div>
                            
                            <div class="info-section">
                                <h3>Informations Véhicule</h3>
                                <div class="info-item"><span class="label">Véhicule:</span> ${selectedClaim.VEHICULE}</div>
                                <div class="info-item"><span class="label">Marque:</span> ${selectedClaim.MARQUE}</div>
                                <div class="info-item"><span class="label">Matricule:</span> ${selectedClaim.MATRICULE}</div>
                                <div class="info-item"><span class="label">Kilométrage:</span> ${selectedClaim.KM}</div>
                                <div class="info-item"><span class="label">Type Utilisation:</span> ${selectedClaim.TYPE_UTILISATION}</div>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h3>Détails Réclamation</h3>
                            <div class="info-item"><span class="label">Pneu:</span> ${selectedClaim.PNEU}</div>
                            <div class="info-item"><span class="label">Description:</span> ${selectedClaim.DESCRIPTION}</div>
                            <div class="info-item"><span class="label">Gamme:</span> ${selectedClaim.GAMME}</div>
                        </div>
                        
                        <div class="info-section">
                            <h3>Statut</h3>
                            <div class="info-item"><span class="label">État Réception par Magasinier:</span> ${selectedClaim.RECEPTION}</div>
                            <div class="info-item"><span class="label">Décision Administration:</span> ${selectedClaim.DECISION}</div>
                            <div class="info-item"><span class="label">Raison:</span> ${selectedClaim.RAISON}</div>
                            <div class="info-item"><span class="label">Magasinier:</span> ${selectedClaim.MAGASINIER}</div>
                            <div class="info-item"><span class="label">Commentaire magasinier:</span> ${selectedClaim.COMMENTAIRE}</div>
                            <div class="info-item"><span class="label">Récupération par client:</span> ${selectedClaim.RETOURS}</div>
                        </div>
                        
                        <div class="signature-section">
                            <div class="signature-box">Client</div>
                            <div class="signature-box">Magasinier</div>
                            <div class="signature-box">Administration concernée</div>
                        </div>
                    </div>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Impossible d\'ouvrir la fenêtre d\'impression.');
            return;
        }

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait a moment before printing to ensure everything is loaded
        setTimeout(() => {
            printWindow.print();
        }, 1500);  // Adjust delay as needed
    };


    const [userRole, setUserRole] = useState('');
    const [receptionStatus, setReceptionStatus] = useState('');

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                console.log('Fetching user role...');

                const response = await fetch(`${BASE_URL}/api/users`, {
                    credentials: 'include'
                });

                console.log('Response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched data:', data);

                    setUserRole(data.role);
                    console.log('User role set to:', data.role);
                } else {
                    console.warn('Failed to fetch user role:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole();
    }, []);
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/users`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Current user role:', data.role); // Debug log
                    setUserRole(data.role);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole();
    }, []);
    const handleReceptionUpdate = async (claimId, newStatus) => {
        try {
            const response = await fetch(`${BASE_URL}/api/updateReception`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    id: claimId,
                    reception: newStatus
                })
            });

            if (response.ok) {
                // Refresh claims list
                fetchClaims();
            } else {
                console.error('Failed to update reception status');
            }
        } catch (error) {
            console.error('Error updating reception:', error);
        }
    };




    return (
        <Box sx={{ p: 2 }}>
            <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1c92f3ff' }}>
                        Gestion des Réclamations
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() => setShowForm(!showForm)}
                        startIcon={showForm ? null : <AddIcon />}
                        sx={{ mb: 0 }}
                    >
                        {showForm ? 'Fermer le formulaire' : 'Nouvelle réclamation'}
                    </Button>
                </Box>
            </Paper>

            {showForm && <Sav onSubmitSuccess={() => {
                setShowForm(false);
                fetchClaims();
            }} />}

            <TableContainer>
                <TableHeader>
                    {['Utilisateur', 'Date', 'Client', 'Pneu', 'Description', 'Réception', 'Magasinier', 'Décision administration', 'Raison', 'Réception client', 'commentaire magasinier ', 'Actions'].map(header => (
                        <TableCell key={header}>{header}</TableCell>
                    ))}
                </TableHeader>
                {claims.length === 0 ? (
                    <NoClaimsMessage>Aucune réclamation</NoClaimsMessage>
                ) : (
                    claims.map((claim) => (
                        <TableRow key={claim.ID}>
                            <TableCell>{claim.USER_NAME}</TableCell>
                            <TableCell>{new Date(claim.DEMAND_DATE).toLocaleDateString()}</TableCell>
                            <TableCell>{claim.UTILISATEUR}</TableCell>
                            <TableCell>{claim.PNEU}</TableCell>
                            <TableCell>{claim.DESCRIPTION}</TableCell>
                            <TableCell>
                                {(user.ROLE === 'magasinier') ? (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleOpenReceptionDialog(claim)}
                                    >
                                        <StatusCell className={`reception-${claim.RECEPTION?.toLowerCase().replace(' ', '-') || 'attente'}`}>
                                            {claim.RECEPTION || 'Modifier'}
                                        </StatusCell>
                                    </Button>
                                ) : (
                                    <StatusCell className={`reception-${claim.RECEPTION?.toLowerCase().replace(' ', '-') || 'attente'}`}>
                                        {claim.RECEPTION}
                                    </StatusCell>
                                )}
                            </TableCell>
                            <TableCell>{claim.MAGASINIER}</TableCell>
                            <TableCell>
                                {user.ROLE === 'administrateur' ? (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleOpenDecisionDialog(claim)}
                                    >
                                        <StatusCell className={`decision-${claim.DECISION?.toLowerCase().replace(' ', '-') || 'cours'}`}>
                                            {claim.DECISION || 'Modifier'}
                                        </StatusCell>
                                    </Button>
                                ) : (
                                    <StatusCell className={`decision-${claim.DECISION?.toLowerCase().replace(' ', '-') || 'cours'}`}>
                                        {claim.DECISION}
                                    </StatusCell>
                                )}
                            </TableCell>
                            <TableCell>{claim.RAISON}</TableCell>
                            <TableCell>
                                {(user.ROLE === 'magasinier') ? (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleOpenRetourDialog(claim)}
                                    >
                                        <StatusCell className={`reception-${claim.RETOURS?.toLowerCase().replace(' ', '-') || 'attente'}`}>
                                            {claim.RETOURS || 'Modifier'}
                                        </StatusCell>
                                    </Button>
                                ) : (
                                    <StatusCell className={`reception-${claim.RETOURS?.toLowerCase().replace(' ', '-') || 'attente'}`}>
                                        {claim.RETOURS}
                                    </StatusCell>
                                )}
                            </TableCell>
                            <TableCell>{claim.COMMENTAIRE}</TableCell>

                            {/*<TableCell>
                                {claim.FILES && (
                                    <div>
                                        {handleFileDisplay(claim.FILES).map((file, index) => (
                                            <Button
                                                key={index}
                                                size="small"
                                                startIcon={<CloudDownloadIcon />}
                                                onClick={() => handleFileDownload(file)}
                                            >
                                                {typeof file === 'string' ? file : file.name}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </TableCell> */}

                            <TableCell>
                                <Tooltip title="Voir détails">
                                    <IconButton onClick={() => handleViewDetails(claim)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Voir détails">
                                    <IconButton onClick={() => handleViewDetails(claim)}>
                                        <LocalPrintshopIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableContainer>

            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
                <DialogTitle>Détails de la Réclamation</DialogTitle>
                <DialogContent>
                    {selectedClaim && (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h5" align="center" gutterBottom color={'blue'}>
                                Fiche de Réclamation N° {selectedClaim.ID}
                            </Typography>

                            <Typography variant="subtitle2" align="center" gutterBottom color={'red'}>
                                Le client dispose de 2 mois pour récupérer son pneu, passé ce délai, aucun retour ni remboursement ne sera possible.
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, mb: 2 }}>
                                        <Typography variant="h6" gutterBottom>Informations Client</Typography>
                                        <Typography><strong>Client:</strong> {selectedClaim.UTILISATEUR}</Typography>
                                        <Typography><strong>Adresse:</strong> {selectedClaim.ADRESSE}</Typography>
                                        <Typography><strong>Date:</strong> {new Date(selectedClaim.DEMAND_DATE).toLocaleDateString()}</Typography>
                                        <Typography><strong>Grossiste:</strong> {selectedClaim.GROSSISTE}</Typography>
                                        <Typography><strong>Vendeur:</strong> {selectedClaim.VENDEUR}</Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, mb: 2 }}>
                                        <Typography variant="h6" gutterBottom>Informations Véhicule</Typography>
                                        <Typography><strong>Véhicule:</strong> {selectedClaim.VEHICULE}</Typography>
                                        <Typography><strong>Marque:</strong> {selectedClaim.MARQUE}</Typography>
                                        <Typography><strong>Matricule:</strong> {selectedClaim.MATRICULE}</Typography>
                                        <Typography><strong>Kilométrage:</strong> {selectedClaim.KM}</Typography>
                                        <Typography><strong>Type Utilisation:</strong> {selectedClaim.TYPE_UTILISATION}</Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, mb: 2 }}>
                                        <Typography variant="h6" gutterBottom>Détails Réclamation</Typography>
                                        <Typography><strong>Pneu:</strong> {selectedClaim.PNEU}</Typography>
                                        <Typography><strong>Description:</strong> {selectedClaim.DESCRIPTION}</Typography>
                                        <Typography><strong>Gamme:</strong> {selectedClaim.GAMME}</Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
                                        <Typography variant="h6" gutterBottom>Statut</Typography>
                                        <Typography><strong>État Réception par Magasinier:</strong> {selectedClaim.RECEPTION}</Typography>
                                        <Typography><strong>Décision Administration:</strong> {selectedClaim.DECISION}</Typography>
                                        <Typography><strong>Raison:</strong> {selectedClaim.RAISON}</Typography>
                                        <Typography><strong>Magasinier:</strong> {selectedClaim.MAGASINIER}</Typography>
                                        <Typography><strong>Commentaire magasinier:</strong> {selectedClaim.COMMENTAIRE}</Typography>
                                        <Typography><strong>Récupération par client:</strong> {selectedClaim.RETOURS}</Typography>
                                    </Box>
                                </Grid>

                                {selectedClaim?.FILES && (
                                    <Grid item xs={12}>
                                        <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                                            <Typography variant="h6" gutterBottom>Fichiers joints</Typography>
                                            {handleFileDisplay(selectedClaim.FILES).map((file, index) => (
                                                <Button
                                                    key={index}
                                                    variant="outlined"
                                                    startIcon={<CloudDownloadIcon />}
                                                    onClick={() => handleFileDownload(file)}
                                                    sx={{ mr: 1, mb: 1 }}
                                                >
                                                    {file.replace(/["[\]]/g, '')}
                                                </Button>
                                            ))}
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Fermer</Button>
                    <Button onClick={handlePrint} startIcon={<LocalPrintshopIcon />}>
                        Imprimer
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openReceptionDialog} onClose={handleCloseReceptionDialog}>
                <DialogTitle>Modifier l'état de réception</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Select
                            fullWidth
                            value={newReceptionStatus}
                            onChange={(e) => setNewReceptionStatus(e.target.value)}
                        >
                            <MenuItem value="En attente">En attente</MenuItem>
                            <MenuItem value="Reçu">Reçu</MenuItem>
                            <MenuItem value="Non reçu">Non reçu</MenuItem>
                        </Select>
                        <Typography sx={{ mt: 2 }}>
                            <strong>Magasinier:</strong> {user.LOGIN}
                        </Typography>

                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseReceptionDialog}>Annuler</Button>
                    <Button
                        onClick={handleReceptionSubmit}
                        variant="contained"
                        color="primary"
                    >
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDecisionDialog} onClose={handleCloseDecisionDialog}>
                <DialogTitle>Modifier la décision</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Select
                            fullWidth
                            value={newDecisionStatus}
                            onChange={(e) => setNewDecisionStatus(e.target.value)}
                        >
                            <MenuItem value="En cours">En cours</MenuItem>
                            <MenuItem value="Bonifié">Bonifié</MenuItem>
                            <MenuItem value="Non Bonifié">Non Bonifié</MenuItem>
                        </Select>
                        <Box sx={{ pt: 6 }}>
                            <Typography><strong>Avis:</strong> </Typography>

                            <Input
                                type="text"
                                name="RAISON"
                                value={formData.RAISON}
                                onChange={handleChange}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDecisionDialog}>Annuler</Button>
                    <Button
                        onClick={handleDecisionSubmit}
                        variant="contained"
                        color="primary"
                    >
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openRetourDialog} onClose={handleCloseRetourDialog}>
                <DialogTitle>Modifier le retour client</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Select
                            fullWidth
                            name="RETOURS"
                            value={formData.RETOURS}
                            onChange={handleChange}
                        >
                            <MenuItem value="Non Reçu">Non Reçu</MenuItem>
                            <MenuItem value="Reçu">Reçu</MenuItem>
                        </Select>
                        <Box sx={{ pt: 2 }}>
                            <Typography><strong>Commentaire:</strong></Typography>
                            <Input
                                fullWidth
                                type="text"
                                name="COMMENTAIRE"
                                value={formData.COMMENTAIRE}
                                onChange={handleChange}
                                multiline
                                rows={3}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRetourDialog}>Annuler</Button>
                    <Button
                        onClick={handleRetourSubmit}
                        variant="contained"
                        color="primary"
                        disabled={!formData.RETOURS}
                    >
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SavManagement;
