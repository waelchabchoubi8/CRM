import React, { useEffect, useState } from 'react';
import {
    Box,
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
    LinearProgress,
    TablePagination,
    TextField,
    InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';
import BASE_URL from '../Utilis/constantes';
import { toast } from 'react-toastify';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import entete from '../images/sahar up.png';
import Checkbox from '@mui/material/Checkbox';
import { Button } from '@mui/material';
import cachet from '../images/cachetcspd.png';

const StyledCard = styled(Card)(({ theme }) => ({
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
    borderRadius: '16px',
}));

const paginationOptions = [100];

const ArticleHeader = styled(Box)(({ theme }) => ({
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

const ArticleMovementsList = ({ }) => {
    const [articles, setArticles] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [enteteBase64, setEnteteBase64] = useState('');
    const [initialStocks, setInitialStocks] = useState({});
    const [checkedMovements, setCheckedMovements] = useState({});
    const [searchDate, setSearchDate] = useState('');
    const [cachetBase64, setCachetBase64] = useState('');


    const fetchArticleMovements = async () => {
        try {
            setLoading(true);
            const result = await axios.get(`${BASE_URL}/api/articleMovements`, {
                params: {
                    searchTerm,
                    page,
                    pageSize: rowsPerPage,
                    includeInitialStock: true
                },
            });
            const stockMapping = {};
            result.data.articleMovements.forEach(article => {
                if (!stockMapping[article.CODE_ARTICLE]) {
                    const todayMovements = article.MVT_QTE || 0;
                    stockMapping[article.CODE_ARTICLE] = article.STOCK_PHYSIQUE - todayMovements;
                }
            });

            setInitialStocks(stockMapping);
            setArticles(result.data.articleMovements || []);
            setTotal(result.data.total || 0);
        } catch (error) {
            console.error('Error fetching article movements:', error);
            toast.error('Failed to fetch article movements. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchArticleMovements();
    }, [searchTerm, page, rowsPerPage]);

    const handleCardClick = (articleCode) => {
        setExpanded(expanded === articleCode ? null : articleCode);
    };

    const getFormattedDate = (date) => {
        return date ? format(new Date(date), 'dd/MM/yyyy') : 'N/A';
    };
    const calculateInitialStockPerDay = (movements, physicalStock) => {
        const sortedMovements = [...movements].sort(
            (a, b) => new Date(b.MVT_DATE) - new Date(a.MVT_DATE)
        );
        let runningStock = physicalStock;
        const stockByDay = {};
        sortedMovements.forEach((movement) => {
            const date = format(new Date(movement.MVT_DATE), 'yyyy-MM-dd');
            const qty = movement.MVT_QTE || 0;
            if (!stockByDay[date]) {
                stockByDay[date] = runningStock;
            }
            runningStock -= qty;
        });

        if (sortedMovements.length > 0) {
            const oldestDate = format(new Date(sortedMovements[sortedMovements.length - 1].MVT_DATE), 'yyyy-MM-dd');
            stockByDay[oldestDate] = runningStock;
        }

        return stockByDay;
    };
    const fetchCachetBase64 = () => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            setCachetBase64(canvas.toDataURL('image/png'));
        };
        img.src = cachet;
    };

    const groupedArticles = articles.reduce((acc, item) => {
        if (!acc[item.CODE_ARTICLE]) {
            acc[item.CODE_ARTICLE] = {
                details: item,
                movements: [],
            };
        }
        if (item.MVT_NUMERO) {
            acc[item.CODE_ARTICLE].movements.push(item);
        }
        return acc;
    }, {});

    Object.keys(groupedArticles).forEach((codeArticle) => {
        const articleData = groupedArticles[codeArticle];
        const initialStockByDay = calculateInitialStockPerDay(
            articleData.movements,
            articleData.details.STOCK_PHYSIQUE
        );
        articleData.initialStockByDay = initialStockByDay;
    });
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
        fetchCachetBase64();

    }, []);

    const handlePrint = () => {
        if (!enteteBase64) {
            toast.warning("L'image d'en-tête n'est pas encore chargée.");
            return;
        }

        const allMovements = Object.values(groupedArticles).flatMap(article => article.movements);
        const movementDates = allMovements.map(mvt => new Date(mvt.MVT_DATE));
        const latestDate = new Date(Math.max(...movementDates));
        const formattedLatestDate = latestDate.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });

        const printWindow = window.open('', '_blank');

        const articlesHtml = Object.entries(groupedArticles).map(([articleCode, data]) => {
            const totalMovements = data.movements.reduce((sum, mvt) => sum + (mvt.MVT_QTE || 0), 0);
            const initialStock = data.details.STOCK_PHYSIQUE - totalMovements;

            return `
                <div class="article-section">
                    <div class="article-info">
                        <h3>${data.details.INTIT_ARTICLE} (${data.details.CODE_ARTICLE})</h3>
                        <p><strong>Rayon:</strong> ${data.details.RAYON_ARTICLE || 'N/A'} | 
                           <strong>Emplacement:</strong> ${data.details.EMPLACEMENT_ART || 'N/A'} | 
                    </div>
                    <table class="movements-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type Doc</th>
                                <th>N° Doc</th>
                                <th>Entrées</th>
                                <th>Sorties</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.movements.map(movement => `
                                <tr>
                                    <td>${getFormattedDate(movement.MVT_DATE)}</td>
                                    <td>${movement.MVT_TYPE_DOC}</td>
                                    <td>${movement.MVT_NUM_DOC}</td>
                                    <td class="positive">${movement.MVT_QTE > 0 ? Math.abs(movement.MVT_QTE) : ''}</td>
                                    <td class="negative">${movement.MVT_QTE < 0 ? Math.abs(movement.MVT_QTE) : ''}</td>
                                    <td>${movement.MVT_CHAMP_1 === '1' ? 'Validé' : 'Non validé'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <hr class="separator">
            `;
        }).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Fiche de Mouvements - Tous les Articles</title>
                    <style>
                  .cachet-container {
    position: fixed;
    bottom: 50px;
    right: 50px;
    width: 350px;
    height: auto;
    margin-left:-350px;
    margin-top: -300px;
}
.cachet-image {
    width: 100%;
    height: auto;
}
                        img { 
                            width: 100%; 
                            max-height: 100%; 
                            object-fit: contain; 
                        }
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 20px; 
                        }
                        .content { 
                            margin-top: -800px; 
                        }
                        .title { 
                            text-align: center; 
                            font-size: 1.5em; 
                            margin-bottom: 5px; 
                        }
                        .article-section {
                            margin-bottom: 15px; 
                        }
                        .article-info { 
                            margin-bottom: 10px;
                            padding: 5px;
                            background-color: #f5f5f5; 
                        }
                        .movements-table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 15px;
                            font-size: 0.9em; 
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 4px; 
                            text-align: left; 
                        }
                        th { 
                            background-color: #f5f5f5; 
                        }
                        .positive { 
                            color: green; 
                        }
                        .negative { 
                            color: red; 
                        }
                        .separator { 
                            border-top: 1px dashed #ccc; 
                            margin: 10px 0; 
                        }
                        h3 { 
                            margin: 5px 0; 
                        }
                        p { 
                            margin: 5px 0; 
                        }
                    </style>
                </head>
                
                <body>
                    <div class="header">
                        <img src="${enteteBase64}" alt="En-tête" />
                    </div>
                    <div class="content">
                        <div class="title">
                            Fiche de Mouvements - ${formattedLatestDate}
                           
                        </div>
                        ${articlesHtml}
                          <div class="cachet-container">
    <img src="${cachetBase64}" alt="Cachet" class="cachet-image"/>
</div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
               
            </html>
        `);

        printWindow.document.close();
    };

    const handlePrintSingleArticle = (articleData) => {
        if (!enteteBase64) {
            toast.warning("L'image d'en-tête n'est pas encore chargée.");
            return;
        }

        const printWindow = window.open('', '_blank');
        const totalMovements = articleData.movements.reduce((sum, mvt) => sum + (mvt.MVT_QTE || 0), 0);
        const initialStock = articleData.details.STOCK_PHYSIQUE - totalMovements;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Fiche de Mouvements - ${articleData.details.INTIT_ARTICLE}</title>
                    <style>
                        img { 
                            width: 100%; 
                            max-height: 100%; 
                            object-fit: contain; 
                        }
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 20px; 
                        }
                        .content { 
                            margin-top: -800px; 
                        }
                        .title { 
                            margin-top: 90px;
                            text-align: center; 
                            font-size: 1.5em; 
                            margin: 20px ; 
                        }
                              .cachet-container {
    position: fixed;
    width: 250px;
    height: auto;
  
}
.cachet-image {
    width: 100%;
    height: auto;
}
                        .article-info { 
                            margin: 20px 0;
                            padding: 10px;
                            background-color: #f5f5f5;
                            border-radius: 5px;
                        }
                        .movements-table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 20px 0;
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 8px; 
                            text-align: left; 
                        }
                        th { 
                            background-color: #f5f5f5; 
                        }
                        .positive { 
                            color: green; 
                        }
                        .negative { 
                            color: red; 
                        }
                        .summary {
                            margin-top: 20px;
                            padding: 10px;
                            background-color: #f9f9f9;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <img src="${enteteBase64}" alt="En-tête" />
                    </div>
                    <div class="content">
                        <div class="title">
                            Fiche de Mouvements - ${articleData.details.INTIT_ARTICLE}
                        </div>
                        
                        <div class="article-info">
                            <h3>Informations Article</h3>
                            <p><strong>Code Article:</strong> ${articleData.details.CODE_ARTICLE}</p>
                            <p><strong>Rayon:</strong> ${articleData.details.RAYON_ARTICLE || 'N/A'}</p>
                            <p><strong>Emplacement:</strong> ${articleData.details.EMPLACEMENT_ART || 'N/A'}</p>
                        </div>
    
                        <table class="movements-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type Doc</th>
                                    <th>N° Doc</th>
                                    <th>Entrées</th>
                                    <th>Sorties</th>
                                    <th>Solde</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${articleData.movements.map(movement => `
                                    <tr>
                                        <td>${getFormattedDate(movement.MVT_DATE)}</td>
                                        <td>${movement.MVT_TYPE_DOC}</td>
                                        <td>${movement.MVT_NUM_DOC}</td>
                                        <td class="positive">${movement.MVT_QTE > 0 ? Math.abs(movement.MVT_QTE) : ''}</td>
                                        <td class="negative">${movement.MVT_QTE < 0 ? Math.abs(movement.MVT_QTE) : ''}</td>
                                        <td>${movement.RUNNING_BALANCE}</td>
                                        <td>${movement.MVT_CHAMP_1 === '1' ? 'Validé' : 'Non validé'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
    
                        <div class="summary">
                            <h3>Résumé des Mouvements</h3>
                            <p><strong>Total des Mouvements:</strong> ${articleData.movements.length}</p>
                            <p><strong>Variation Totale:</strong> ${totalMovements}</p>

                        </div>
                         <div class="cachet-container">
    <img src="${cachetBase64}" alt="Cachet" class="cachet-image"/>
</div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `);

        printWindow.document.close();
    };

    const handleCheckMovement = (mvtNumero) => {
        setCheckedMovements((prev) => ({
            ...prev,
            [mvtNumero]: true,
        }));

        axios.put(`${BASE_URL}/api/updateMovementStatus`, {
            MVT_NUMERO: mvtNumero,
            MVT_CHAMP_1: '1',
        })
            .then(() => {
                toast.success('Mouvement validé avec succès');
            })
            .catch((error) => {
                console.error('Error updating movement status:', error);
                toast.error('Erreur lors de la validation du mouvement');
                setCheckedMovements((prev) => ({
                    ...prev,
                    [mvtNumero]: false,
                }));
            });
    };
    const initializeCheckedMovements = (articles) => {
        const movements = {};
        if (articles && articles.length > 0) {
            articles.forEach((article) => {
                if (article.movements) {
                    article.movements.forEach((movement) => {
                        movements[movement.MVT_NUMERO] = movement.MVT_CHAMP_1 === '1';
                    });
                }
            });
        }
        setCheckedMovements(movements);
    };
    useEffect(() => {
        fetchArticleMovements().then(() => {
            initializeCheckedMovements(articles);
        });
    }, [searchTerm, page, rowsPerPage]);

    const calculateRunningBalances = (movements, initialStock) => {
        const sortedMovements = [...movements].sort((a, b) =>
            new Date(a.MVT_DATE) - new Date(b.MVT_DATE)
        );

        let currentBalance = initialStock;

        return sortedMovements.map(movement => {
            const previousBalance = currentBalance;
            currentBalance = currentBalance + (movement.MVT_QTE || 0);
            return {
                ...movement,
                PREVIOUS_BALANCE: previousBalance,
                RUNNING_BALANCE: currentBalance
            };
        });
    };

    Object.keys(groupedArticles).forEach((codeArticle) => {
        const articleData = groupedArticles[codeArticle];
        // Calculate initial stock by subtracting all movements from current stock
        const totalMovements = articleData.movements.reduce((sum, mvt) => sum + (mvt.MVT_QTE || 0), 0);
        const trueInitialStock = articleData.details.STOCK_PHYSIQUE - totalMovements;

        // Calculate running balances starting from true initial stock
        articleData.movements = calculateRunningBalances(articleData.movements, trueInitialStock);

        // Store the true initial stock for display
        articleData.trueInitialStock = trueInitialStock;
    });
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(0); // Reset to first page when searching
    };
    return (

        <Box sx={{ p: 3 }}>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    backgroundColor: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                            borderColor: 'primary.main',
                        },
                    },
                }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, marginTop: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                        borderRadius: '8px',
                        padding: '8px 16px',
                    }}
                >
                    Imprimer l'état des mouvements
                </Button>
            </Box>
            {loading ? (
                <LinearProgress />
            ) : (
                <>
                    <Grid container spacing={3} style={{ marginTop: 2 }}>
                        {Object.entries(groupedArticles).map(([articleCode, data]) => (
                            <Grid item xs={12} sm={6} md={4} key={articleCode}>
                                <Fade in={true} timeout={500}>
                                    <StyledCard>
                                        <ArticleHeader>
                                            <Typography variant="h6">
                                                {data.details.INTIT_ARTICLE || 'N/A'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    onClick={() => handlePrintSingleArticle(data)}
                                                    size="small"
                                                    sx={{ color: 'white' }}
                                                >
                                                    <PrintIcon />
                                                </IconButton>
                                                <Chip
                                                    label={data.details.CODE_ARTICLE}
                                                    color="secondary"
                                                    size="small"
                                                />
                                            </Box>
                                        </ArticleHeader>
                                        <CardContent>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Rayon: {data.details.RAYON_ARTICLE || 'N/A'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Emplacement: {data.details.EMPLACEMENT_ART || 'N/A'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    {data.movements.length} mouvements
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                   {/*   Stock initial : {data.trueInitialStock}*/} 
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                   {/* Stock Actuel: {data.details.STOCK_PHYSIQUE}   */}                                             </Typography>
                                            </Box>
                                            <IconButton
                                                onClick={() => handleCardClick(articleCode)}
                                                sx={{ width: '100%' }}
                                            >
                                                {expanded === articleCode ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            </IconButton>
                                            <Collapse in={expanded === articleCode}>
                                                <StyledTable>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Date</TableCell>
                                                            <TableCell>Type Doc</TableCell>
                                                            <TableCell>N° Doc</TableCell>
                                                            <TableCell>Entrés </TableCell>
                                                            <TableCell>Sorties </TableCell>
                                                            <TableCell>Validé</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {data.movements.map((movement) => (
                                                            <TableRow key={movement.MVT_NUMERO}>
                                                                <TableCell>{getFormattedDate(movement.MVT_DATE)}</TableCell>
                                                                <TableCell>{movement.MVT_TYPE_DOC}</TableCell>
                                                                <TableCell>{movement.MVT_NUM_DOC}</TableCell>
                                                                <TableCell align="right" sx={{ color: 'success.main' }}>
                                                                    {movement.MVT_QTE > 0 ? Math.abs(movement.MVT_QTE) : ''}
                                                                </TableCell>
                                                                <TableCell align="right" sx={{ color: 'error.main' }}>
                                                                    {movement.MVT_QTE < 0 ? Math.abs(movement.MVT_QTE) : ''}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Checkbox
                                                                        checked={movement.MVT_CHAMP_1 === '1' || checkedMovements[movement.MVT_NUMERO] || false}
                                                                        onChange={() => handleCheckMovement(movement.MVT_NUMERO)}
                                                                        color="primary"
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </StyledTable>
                                            </Collapse>
                                        </CardContent>
                                    </StyledCard>
                                </Fade>
                            </Grid>
                        ))}
                    </Grid>
                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={paginationOptions}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                    />
                </>
            )}
        </Box>
    );
};

export default ArticleMovementsList;
