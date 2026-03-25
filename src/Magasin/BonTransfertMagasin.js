import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Fade,
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import entete from '../images/sahar up.png';
import { format } from 'date-fns'; // Add this import at the top
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { styled } from '@mui/material/styles';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';
import BASE_URL from '../Utilis/constantes';
import PrintIcon from '@mui/icons-material/Print';
import PersonIcon from '@mui/icons-material/Person';


const StyledCard = styled(Card)(({ theme }) => ({
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
    position: 'relative',
    overflow: 'visible',
    borderRadius: '16px',
}));

const CommandHeader = styled(Box)(({ theme }) => ({
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
    borderRadius: '16px 16px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledTable = styled(Table)(({ theme }) => ({
    '& .MuiTableCell-root': {
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(1.5),
    },
    '& .MuiTableHead-root': {
        backgroundColor: theme.palette.grey[50],
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '20px',
    textTransform: 'none',
    padding: theme.spacing(1, 3),
}));

const CommandesList = ({ type, searchTerm }) => {
    const [commandes, setCommandes] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(21);
    const [total, setTotal] = useState(0);
    const [articles, setArticles] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [enteteBase64, setEnteteBase64] = useState('');
    const GlowingBox = styled('div')(({ backgroundColor }) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)',
        transition: 'box-shadow 0.3s ease-in-out',
        padding: '10px',
        backgroundColor,
        '&:hover': {
            boxShadow: '0 0 16px rgba(0, 0, 0, 0.5)',
        },
    }));
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

    const handlePrint = (commandGroup) => {
        if (!enteteBase64) {
            alert('L\'image d\'en-tête n\'est pas encore chargée.');
            return;
        }

        const uniqueArticles = Object.values(commandGroup.reduce((acc, item) => {
            if (!acc[item.MVT_ARTICLE]) {
                acc[item.MVT_ARTICLE] = { ...item, MVT_QTE: Math.abs(item.MVT_QTE) };
            } else {
                acc[item.MVT_ARTICLE].MVT_QTE += Math.abs(item.MVT_QTE);
            }
            return acc;
        }, {}));

        const printContent = `
            <html>
                <head>
                    <title>Bon de transfert ${commandGroup[0].MVT_NUM_DOC}</title>
                    <style>
                        img { width: 100%; max-height: 100%; object-fit: contain  }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .content {
                        padding: 20px;
                        margin-top: -800px;
                         }
                    </style>
                </head>
                <body>
                    <img src="${enteteBase64}" alt="En-tête" />
   <div class="content">
                     <h2>Bon de transfert N° ${commandGroup[0].MVT_NUM_DOC}</h2>
                    <div class="date">Date: ${getFormattedDate(commandGroup[0])}</div>
                    <div class="date">Total articles: ${uniqueArticles.length}</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th>Quantité</th>
                                <th>Rayon</th>
                                <th>Emplacement</th>
                             </tr>
                        </thead>
                        <tbody>
                            ${uniqueArticles.map(article => `
                                <tr>
                                    <td>${article.MVT_ARTICLE}</td>
                                    <td>${article.MVT_QTE}</td>
                                    <td>${article.RAYON_ARTICLE || '-'}</td>
                                    <td>${article.EMPLACEMENT_ART || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                     <h4> Le magasinier </h4>
                     <div class="content">
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };
    const fetchCommandes = async () => {
        try {
            const url = `${BASE_URL}/api/movementsStore`;
            const params = {
                page,
                pageSize,
                startDate,
                endDate,
            };
            const result = await axios.get(url, { params });
            setCommandes(result.data.movements || []);
            setTotal(result.data.total || 0);
        } catch (error) {
            console.error('Error fetching commands:', error);
            setCommandes([]);
        }
    };

    const handleSearch = () => {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            alert('La date de début ne peut pas être après la date de fin.');
            return;
        }
        fetchCommandes();
    };

    useEffect(() => {
        fetchCommandes();
    }, [page, pageSize]);

    const handleCardClick = async (command) => {
        setExpanded((prev) => (prev === command.MVT_NUM_DOC ? null : command.MVT_NUM_DOC));

        try {
            const result = await axios.get(`${BASE_URL}/api/articlesByMovement`, {
                params: { MVT_NUM_DOC: command.MVT_NUM_DOC },
            });
            setArticles(result.data.articles || []);
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };
    const getDeliveryStatus = (dateString) => {
        if (!dateString) return { color: '#F5F7F8' };
        const deliveryDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (deliveryDate.toDateString() === today.toDateString()) {
            return { status: "Réception aujourd'hui", color: 'red' };
        } else if (deliveryDate < today) {
            return { status: 'Reçue', color: 'green' };
        }
        return { status: 'En cours', color: '#3572EF' };
    };

    const groupedCommandes = commandes.reduce((acc, command) => {
        if (!acc[command.MVT_NUM_DOC]) {
            acc[command.MVT_NUM_DOC] = [];
        }
        acc[command.MVT_NUM_DOC].push(command);
        return acc;
    }, {});
    const getFormattedDate = (command) => {
        return command?.MVT_DATE ? format(new Date(command.MVT_DATE), 'dd/MM/yyyy') : 'N/A';
    };

    return (

        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
          
                {Object.keys(groupedCommandes).length > 0 ? (
                    Object.keys(groupedCommandes).map((mvtNumDoc) => {
                        const commandGroup = groupedCommandes[mvtNumDoc];
                        const uniqueArticles = Array.from(
                            new Set(commandGroup.map(command => command.MVT_ARTICLE))
                        );

                        return (
                            <Grid item xs={12} sm={6} md={4} key={mvtNumDoc}>
                                <Fade in={true} timeout={500}>
                                    <StyledCard>
                                        <CommandHeader>
                                            <Typography variant="h6">
                                                Commande {mvtNumDoc}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    onClick={() => handlePrint(commandGroup)}
                                                    size="small"
                                                    sx={{ color: 'white' }}
                                                >
                                                    <PrintIcon />
                                                </IconButton>
                                                <Chip
                                                    label={getDeliveryStatus(commandGroup[0]?.DATE_MVT).status}
                                                    color={getDeliveryStatus(commandGroup[0]?.DATE_MVT).color === 'green' ? 'success' : 'primary'}
                                                    size="small"
                                                />
                                            </Box>
                                        </CommandHeader>
                                        <CardContent>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    <LocalMallIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    {uniqueArticles.length} articles
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" style={{ marginTop: 5 }}>
                                                    <EventRepeatIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Date de commande: {getFormattedDate(commandGroup[0])}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" style={{ marginTop: 5 }}>
                                                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Utilisateur: {commandGroup[0]?.MVT_UTILIS || '-'}
                                                </Typography>
                                            </Box>
                                            <ActionButton
                                                variant="outlined"
                                                fullWidth
                                                onClick={() => handleCardClick(commandGroup[0])}
                                                endIcon={expanded === mvtNumDoc ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            >
                                                {expanded === mvtNumDoc ? 'Masquer les détails' : 'Voir les détails'}
                                            </ActionButton>
                                            <Collapse in={expanded === mvtNumDoc}>
                                                <Box sx={{ mt: 2 }}>
                                                    <StyledTable>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Article</TableCell>
                                                                <TableCell align="center">Quantité</TableCell>
                                                                <TableCell>Rayon</TableCell>
                                                                <TableCell>Emplacement</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {uniqueArticles.map((articleCode) => {
                                                                const articleCommand = commandGroup.find(cmd => cmd.MVT_ARTICLE === articleCode);
                                                                return (
                                                                    <TableRow key={articleCode}>
                                                                        <TableCell>{articleCode}</TableCell>
                                                                        <TableCell align="center">{Math.abs(articleCommand?.MVT_QTE)}</TableCell>
                                                                        <TableCell>{articleCommand?.RAYON_ARTICLE || '-'}</TableCell>
                                                                        <TableCell>{articleCommand?.EMPLACEMENT_ART || '-'}</TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </StyledTable>
                                                </Box>
                                            </Collapse>
                                        </CardContent>
                                    </StyledCard>
                                </Fade>
                            </Grid>
                        );
                    })
                ) : (
                    <Grid item xs={12}>
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress />
                        </Box>
                    </Grid>
                )}
            </Grid>

        </Box>
    );
};

export default CommandesList;
