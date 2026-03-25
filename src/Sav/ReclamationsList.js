import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { styled } from '@mui/material/styles';
import BASE_URL from "../Utilis/constantes";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
    TextField,
    Button,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Stack,
    Box,
    Grid,
    Typography,
    Dialog,
    Chip,
    TablePagination,
    Card,
    Paper
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useSelector } from 'react-redux';
import {
    Person,
    Phone,
    DirectionsCar,
    CalendarToday,
    Description,
    AspectRatio,
    BrandingWatermark,
} from '@mui/icons-material';

/* ────────────────────── Styled components ────────────────────── */
const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    },
}));

const ImageContainer = styled(Box)({
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    padding: '10px',
    '&::-webkit-scrollbar': { height: '8px' },
    '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '4px' },
    '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '4px' },
});

const InfoItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    borderRadius: '8px',
    background: 'rgba(118, 149, 255, 0.05)',
    transition: 'all 0.2s ease',
    '&:hover': {
        background: 'rgba(118, 149, 255, 0.1)',
        transform: 'translateX(5px)',
    },
}));

/* ────────────────────── Main component ────────────────────── */
const ReclamationsList = () => {
    const [reclamations, setReclamations] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [nameFilter, setNameFilter] = useState('');
    const [dimensionFilter, setDimensionFilter] = useState('');

    const [page, setPage] = useState(0);
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
    const [selectedReclamationId, setSelectedReclamationId] = useState(null);
    const [pdfFiles, setPdfFiles] = useState([]);
    const [etatFilter, setEtatFilter] = useState("");
    const [idFilter, setIdFilter] = useState("");
    const [uploading, setUploading] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(6);
    const connectedUser = useSelector((state) => state.user);
    const role = connectedUser?.ROLE;

    const isAdmin = role === 'administrateur';
    const canImportExport = isAdmin || role === 'Import/Export';

    const [editState, setEditState] = useState({});

    const initEditState = (rec) => ({
        decision_im_ex: rec.decision_im_ex ?? '',
        detail: rec.detail ?? '',
        decision: rec.decision ?? '',
        decision_description: rec.decision_description ?? '',
    });

    const fetchReclamations = async () => {
        const { data } = await axios.get('http://192.168.1.170:3300/api/reclamations');
        const formatted = data.data.map((r) => ({
            ...r,
            images: r.images.map((img) =>
                `https://api.pneu-mafamech.cspddammak.com/api/Requests/reclamation_images/${img.split('/').pop()}`
            ),
        }));
        setReclamations(formatted);

        const cache = {};
        formatted.forEach((r) => (cache[r.id] = initEditState(r)));
        setEditState(cache);
    };
    const fetchFilteredReclamations = async (etat = etatFilter, id = idFilter, name = nameFilter, dimension = dimensionFilter) => {
        try {
            const params = {};
            if (etat) params.decision_im_ex = etat;
            if (id) params.id = id;
            if (name) params.name = name;
            if (dimension) params.dimension = dimension;

            const { data } = await axios.get(`${BASE_URL}/api/reclamations`, { params });

            const formatted = data.data.map((r) => ({
                ...r,
                images: r.images.map((img) =>
                    `https://api.pneu-mafamech.cspddammak.com/api/Requests/reclamation_images/${img.split('/').pop()}`
                ),
            }));
            setReclamations(formatted);
        } catch (err) {
            console.error('Filter error:', err);
        }
    };



    useEffect(() => {
        fetchFilteredReclamations(etatFilter, idFilter, nameFilter, dimensionFilter);
    }, [etatFilter, idFilter, nameFilter, dimensionFilter]);


    // PATCH: Only non-null fields + ref_detail support
    const patchReclamation = async (id, updates) => {
        const payload = {};
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined && updates[key] !== null && updates[key] !== '') {
                payload[key] = updates[key];
            }
        });

        if (Object.keys(payload).length === 0) return;

        try {
            await axios.patch(`http://192.168.1.170:3300/reclamations/${id}`, payload);
            fetchReclamations();
        } catch (e) {
            console.error('PATCH error:', e);
        }
    };
    const handlePrintAll = () => {
        const isAuthorized = canImportExport || isAdmin;

        // On prend les réclamations actuellement dans le state (déjà filtrées)
        const reclamationsToPrint = reclamations;

        // Si tu veux vraiment TOUT (même les pages non affichées), utilise simplement : reclamations

        const allPagesHTML = reclamationsToPrint
            .map((reclamation) => {
                const isRefused = reclamation.ref === 1;

                return `
      <!DOCTYPE html>
      <html lang="fr"><head>
        <meta charset="UTF-8">
        <title>Réclamation #${reclamation.id}</title>
        <style>
          @page { size: A4; margin: 0.8cm; }
          body { margin:0; padding:0; font-family:'Segoe UI',sans-serif; font-size:10.5px; color:#1a237e; }
          .container { padding:10px; page-break-after: always; } /* <-- IMPORTANT : nouvelle page */
          .header { text-align:center; border-bottom:2px solid #1a237e; padding:4px 0; margin-bottom:8px; }
          .title { font-size:16px; font-weight:bold; margin:0; }
          .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 8px; margin:8px 0; }
          .info-item { background:#f8f9fa; padding:4px 6px; border-radius:5px; display:flex; justify-content:space-between; font-size:10px; }
          .label { font-weight:600; color:#1a237e; }
          .section-title { font-weight:bold; color:#1a237e; font-size:10.5px; border-bottom:1px dashed #ccc; padding-bottom:2px; margin:8px 0 4px 0; }
          .text-block { background:#f0f4ff; padding:5px 7px; border-radius:5px; font-size:10px; white-space:pre-wrap; }
          .images-container { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:8px; margin-top:8px; }
          .image { width:100%; height:120px; object-fit:cover; border:1px solid #ccc; border-radius:5px; }
          .ref-detail { background:#ffebee; color:#c62828; padding:6px 8px; border-radius:5px; font-weight:500; border-left:4px solid #c62828; }
          .footer { margin-top:15px; text-align:center; font-size:8.5px; color:#666; border-top:1px solid #eee; padding-top:4px; }
          @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><div class="title">FICHE DE RÉCLAMATION #${reclamation.id}</div></div>

          <div class="info-grid">
            <div class="info-item"><span class="label">Client:</span><span>${reclamation.name}</span></div>
            <div class="info-item"><span class="label">Téléphone:</span><span>${reclamation.phone_number}</span></div>
            <div class="info-item"><span class="label">Véhicule:</span><span>${reclamation.vehicule}</span></div>
            <div class="info-item"><span class="label">Dimension:</span><span>${reclamation.dimension}</span></div>
            <div class="info-item"><span class="label">Marque:</span><span>${reclamation.marque}</span></div>
            <div class="info-item"><span class="label">DOT:</span><span>${(() => {
                        const d = moment.utc(reclamation.date_fabrication).add(1, 'hour');
                        return d.isoWeek().toString().padStart(2, '0') + d.format('YY');
                    })()}</span></div>
          </div>

          
            <div class="info-grid">
             
              <div class="info-item"><span class="label">Décision:</span><span>${reclamation.decision || '—'}</span></div>
              <div class="info-item"><span class="label">Avis:</span><span>${reclamation.decision_description || '—'}</span></div>
            ${isAuthorized ? `
             <div class="info-item"><span class="label">État:</span><span>${reclamation.decision_im_ex || '—'}</span></div>
              <div class="info-item"><span class="label">Détails:</span><span>${reclamation.detail || '—'}</span></div>  ` : ''}</div>

          <div class="section-title">Description</div>
          <p class="text-block">${reclamation.description.replace(/\n/g, '<br>')}</p>

          ${reclamation.ref === 1 && reclamation.ref_detail ? `
            <div class="section-title">Raison du refus</div>
            <div class="ref-detail">${reclamation.ref_detail.replace(/\n/g, '<br>')}</div>` : ''}

          ${reclamation.images.length > 0 ? `
            <div class="section-title">Photos (${reclamation.images.length})</div>
            <div class="images-container">
              ${reclamation.images.map(img => `<img src="${img}" class="image" alt="Photo"/>`).join('')}
            </div>` : ''}

          <div class="footer">
            Imprimé le ${moment().format('DD/MM/YYYY à HH:mm')} — Système de Gestion des Réclamations
          </div>
        </div>
      </body></html>`;
            })
            .join(''); // toutes les pages les unes après les autres

        const printWin = window.open('', '_blank', 'width=1100,height=800,scrollbars=yes');
        printWin.document.write(allPagesHTML);
        printWin.document.close();

        printWin.onload = () => {
            setTimeout(() => {
                printWin.focus();
                printWin.print();
            }, 500);
        };
    };


    // PRINT FUNCTION – 1 page, big photos, no background colors
    const handlePrint = (reclamation) => {
        const isAuthorized = canImportExport || isAdmin;

        const printContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Réclamation #${reclamation.id}</title>
      <style>
        @page { size: A4; margin: 0.8cm; }
        * { box-sizing: border-box; }
        body {
          margin: 0; padding: 0;
          font-family: 'Segoe UI', Tahoma, sans-serif;
          font-size: 10.5px;
          line-height: 1.35;
          color: #1a237e;
        }
        .container { max-width: 100%; padding: 0 5px; }
        .header { text-align: center; border-bottom: 2px solid #1a237e; padding: 4px 0; margin-bottom: 8px; }
        .title { font-size: 16px; font-weight: bold; margin:0; }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 8px;
          margin: 8px 0;
        }
        .info-item {
          background: #f8f9fa;
          padding: 4px 6px;
          border-radius: 5px;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
        }
        .label { font-weight: 600; color: #1a237e; }
        .value { color: #333; }
        .section { margin: 10px 0; page-break-inside: avoid; }
        .section-title {
          font-weight: bold; color: #1a237e; font-size: 10.5px;
          border-bottom: 1px dashed #ccc; padding-bottom: 2px; margin-bottom: 4px;
        }
        .text-block {
          background: #f0f4ff; padding: 5px 7px; border-radius: 5px;
          margin: 0; font-size: 10px; white-space: pre-wrap;
        }
        .images-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 8px;
          margin-top: 8px;
        }
        .image {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .ref-detail {
          background: #ffebee;
          color: #c62828;
          padding: 6px 8px;
          border-radius: 5px;
          font-weight: 500;
          font-size: 10.5px;
          border-left: 4px solid #c62828;
        }
        .footer {
          margin-top: 15px; text-align: center; font-size: 8.5px; color: #666;
          border-top: 1px solid #eee; padding-top: 4px;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .info-item { background:#f8f9fa !important; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><div class="title">FICHE DE RÉCLAMATION #${reclamation.id}</div></div>

        <div class="info-grid">
          <div class="info-item"><span class="label">Client:</span><span class="value">${reclamation.name}</span></div>
          <div class="info-item"><span class="label">Téléphone:</span><span class="value">${reclamation.phone_number}</span></div>
          <div class="info-item"><span class="label">Véhicule:</span><span class="value">${reclamation.vehicule}</span></div>
          <div class="info-item"><span class="label">Dimension:</span><span class="value">${reclamation.dimension}</span></div>
          <div class="info-item"><span class="label">Marque:</span><span class="value">${reclamation.marque}</span></div>
          <div class="info-item">
  <span class="label">DOT:</span>
  <span class="value">
    ${reclamation.date_fabrication ? `20/${String(reclamation.date_fabrication).slice(-2)}` : '—'}
  </span>
</div>

        </div>

        
          <div class="info-grid">
            <div class="info-item"><span class="label">Décision:</span><span class="value">${reclamation.decision || '—'}</span></div>
            <div class="info-item"><span class="label">Avis:</span><span class="value">${reclamation.decision_description || '—'}</span></div>
${isAuthorized ? `
            <div class="info-item"><span class="label">État:</span><span class="value">${reclamation.decision_im_ex || '—'}</span></div>
            <div class="info-item"><span class="label">Détails:</span><span class="value">${reclamation.detail || '—'}</span></div>
          
        ` : ''}</div>

        <div class="section">
          <div class="section-title">Description</div>
          <p class="text-block">${reclamation.description.replace(/\n/g, '<br>')}</p>
        </div>

        ${reclamation.ref === 1 && reclamation.ref_detail ? `
          <div class="section">
            <div class="section-title">Raison du refus</div>
            <div class="ref-detail">
              ${reclamation.ref_detail.replace(/\n/g, '<br>')}
            </div>
          </div>` : ''}

        ${reclamation.images.length > 0 ? `
          <div class="section">
            <div class="section-title">Photos (${reclamation.images.length})</div>
            <div class="images-container">
              ${reclamation.images.map(img => `<img src="${img}" class="image" alt="Photo"/>`).join('')}
            </div>
          </div>` : ''}

        <div class="footer">
          Imprimé le ${moment().format('DD/MM/YYYY à HH:mm')} — Système de Gestion des Réclamations
        </div>
      </div>
    </body>
    </html>`;

        const printWin = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
        printWin.document.write(printContent);
        printWin.document.close();

        printWin.onbeforeunload = () => { };
        printWin.onload = () => {
            setTimeout(() => {
                printWin.focus();
                printWin.print();
            }, 250);
        };
    };
    const fetchPdfs = async (id) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/api/reclamationClient/filesget`, {
                params: { id_reclamation: id }
            });
            setPdfFiles(data);
        } catch (err) {
            console.error('Erreur chargement PDFs:', err);
            setPdfFiles([]);
        }
    };

    const uploadPdfs = async (files) => {
        if (!files.length || !selectedReclamationId) return;
        setUploading(true);
        const form = new FormData();
        form.append('id_reclamation', selectedReclamationId);
        files.forEach(f => form.append('files', f));

        try {
            await axios.post(`${BASE_URL}/api/reclamationClient/filespost`, form);
            fetchPdfs(selectedReclamationId);
        } catch (err) {
            alert('Erreur upload: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    const deletePdf = async (fileName) => {
        if (!window.confirm('Supprimer ce PDF ?')) return;
        try {
            await axios.delete(`${BASE_URL}/api/reclamationClient/filesdelete`, {
                params: { id_reclamation: selectedReclamationId, fileName }
            });
            fetchPdfs(selectedReclamationId);
        } catch (err) {
            alert('Erreur suppression: ' + (err.response?.data?.error || err.message));
        }
    };

    const downloadPdf = (filePath) => {
        window.open(`${BASE_URL}/api/reclamationClient/openfile?filePath=${encodeURIComponent(filePath)}`, '_blank');
    };
    const openPdfDialog = (rec) => {
        setSelectedReclamationId(rec.id);
        setPdfDialogOpen(true);
        fetchPdfs(rec.id);
    };

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ px: 8, py: 3 }}>
            <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1c92f3ff' }}>
                        Réclamations Dashboard
                    </Typography>

                    {/* 🔍 Filters */}
                    {/* 🔍 Filters */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>

                        {/* 🟢 État Filter */}
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>État</InputLabel>
                            <Select
                                value={etatFilter}
                                label="État"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setEtatFilter(value);
                                    fetchFilteredReclamations(value, idFilter, nameFilter, dimensionFilter);
                                }}
                            >
                                <MenuItem value="">—</MenuItem>
                                <MenuItem value="Traité">Traité</MenuItem>
                                <MenuItem value="Non Traité">Non Traité</MenuItem>
                                <MenuItem value="Bonifié">Bonifié</MenuItem>
                                <MenuItem value="Non Bonifié">Non Bonifié</MenuItem>
                                <MenuItem value="Geste Commercial">Geste Commercial</MenuItem>
                            </Select>
                        </FormControl>

                        {/* 🟣 ID Filter */}
                        <TextField
                            label="Filtrer par ID"
                            variant="outlined"
                            size="small"
                            type="number"
                            value={idFilter}
                            onChange={(e) => {
                                const id = e.target.value.trim();
                                setIdFilter(id);
                                fetchFilteredReclamations(etatFilter, id, nameFilter, dimensionFilter);
                            }}
                            sx={{
                                minWidth: 220,
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                },
                                '& input[type=number]': {
                                    MozAppearance: 'textfield',
                                },
                            }}
                            inputProps={{ min: 0 }}
                        />

                        {/* 🟠 Name Filter */}
                        <TextField
                            label="Filtrer par Nom"
                            variant="outlined"
                            size="small"
                            value={nameFilter}
                            onChange={(e) => {
                                const name = e.target.value; // Removed trim() to allow spaces
                                setNameFilter(name);
                                fetchFilteredReclamations(etatFilter, idFilter, name, dimensionFilter);
                            }}
                            sx={{ minWidth: 220 }}
                        />

                        {/* 🔵 Dimension Filter */}
                        <TextField
                            label="Filtrer par Dimension"
                            variant="outlined"
                            size="small"
                            value={dimensionFilter}
                            onChange={(e) => {
                                const dimension = e.target.value; // Removed trim() to allow spaces
                                setDimensionFilter(dimension);
                                fetchFilteredReclamations(etatFilter, idFilter, nameFilter, dimension);
                            }}
                            sx={{ minWidth: 220 }}
                        />


                        {/* 🖨 Print All Button */}
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<PrintIcon />}
                            onClick={handlePrintAll}
                            sx={{ fontWeight: 'bold' }}
                        >
                            Imprimer tout ({reclamations.length})
                        </Button>

                    </Box>


                </Box>
            </Paper>


            <Grid container spacing={3} alignItems="stretch">
                {reclamations
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((rec) => {
                        const local = editState[rec.id] || initEditState(rec);
                        const isRefused = rec.ref === 1;
                        const isDisabled = isRefused;

                        // Background logic
                        let bgColor = 'white';
                        if (isRefused) {
                            bgColor = '#FFE6E6'; // Refusé → rouge pâle
                        } else if (rec.decision_im_ex === 'Traité') {
                            bgColor = '#FFF9C4'; // Traité → jaune très pâle
                        } else if (rec.decision_im_ex === 'Bonifié') {
                            bgColor = '#C8E6C9'; // Bonifié → vert très pâle
                        } else if (rec.decision_im_ex === 'Non Bonifié') {
                            bgColor = '#E0E0E0'; // Non Bonifié → GRIS PASTEL
                        }

                        return (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={4}
                                xl={4}
                                key={rec.id}
                                sx={{ display: 'flex', alignItems: 'stretch' }}
                            >


                                <StyledCard
                                    sx={{
                                        flex: 1,
                                        width: '100%',
                                        maxWidth: 650,
                                        mx: 'auto',

                                        backgroundColor: bgColor,
                                        opacity: isDisabled ? 0.7 : 1,
                                        color: ['#FFF9C4', '#C8E6C9', '#E0E0E0'].includes(bgColor) ? '#000' : '#1a237e',
                                        '& *': { color: 'inherit' },
                                    }}
                                >


                                    <Box sx={{ p: 2, filter: isDisabled ? 'grayscale(30%)' : 'none' }}>

                                        {/* Header */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                                                {rec.name}
                                                {isRefused && rec.ref_detail && (
                                                    <>
                                                        {' --- '}
                                                        <Box component="span" sx={{ fontStyle: 'italic', color: '#ff0000ff', fontWeight: '500' }}>
                                                            {rec.ref_detail}
                                                        </Box>
                                                    </>
                                                )}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Chip
                                                    label={`ID: ${rec.id}`}
                                                    color="primary"
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: 'white',
                                                        '& .MuiChip-label': {
                                                            fontWeight: 'bold',
                                                            color: 'white'
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<PrintIcon />}
                                                    onClick={() => handlePrint(rec)}
                                                    disabled={isDisabled}
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: 'white !important', // Force blanc
                                                        '& .MuiButton-startIcon': {
                                                            color: 'white !important'
                                                        },
                                                        // Si fond vert → texte blanc (redondance pour sécurité)
                                                        ...(bgColor === '#C8E6C9' && {
                                                            color: 'white !important'
                                                        })
                                                    }}
                                                >
                                                    Imprimer
                                                </Button>
                                            </Box>
                                        </Box>

                                        {/* Images */}
                                        <ImageContainer>
                                            {rec.images?.map((img, i) => (
                                                <Box
                                                    key={i}
                                                    component="img"
                                                    src={img}
                                                    alt={`img-${i}`}
                                                    onClick={() => !isDisabled && setSelectedImage(img)}
                                                    sx={{
                                                        width: 110,
                                                        height: 110,
                                                        borderRadius: 2,
                                                        objectFit: 'cover',
                                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                        flexShrink: 0,
                                                        transition: 'transform .3s',
                                                        '&:hover': { transform: isDisabled ? 'none' : 'scale(1.05)' },
                                                    }}
                                                />
                                            ))}
                                        </ImageContainer>

                                        {/* Info Grid */}
                                        <Grid container spacing={2} sx={{ mt: 2 }}>
                                            <Grid item xs={12}>
                                                <InfoItem>
                                                    <Person sx={{ color: '#3572EF', mr: 2 }} />
                                                    <Typography sx={{ fontWeight: 'bold' }}>Utilisateur:</Typography>
                                                    <Typography>{rec.name}</Typography>
                                                </InfoItem>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <InfoItem>
                                                    <Phone sx={{ color: '#3572EF', mr: 2 }} />
                                                    <Typography sx={{ fontWeight: 'bold' }}>Téléphone:</Typography>
                                                    <Typography>{rec.phone_number}</Typography>
                                                </InfoItem>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <InfoItem>
                                                    <DirectionsCar sx={{ color: '#3572EF', mr: 2 }} />
                                                    <Typography sx={{ fontWeight: 'bold' }}>Véhicule:</Typography>
                                                    <Typography>{rec.vehicule}</Typography>
                                                </InfoItem>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <InfoItem>
                                                    <AspectRatio sx={{ color: '#3572EF', mr: 2 }} />
                                                    <Typography sx={{ fontWeight: 'bold' }}>Dimension:</Typography>
                                                    <Typography>{rec.dimension}</Typography>
                                                </InfoItem>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <InfoItem>
                                                    <BrandingWatermark sx={{ color: '#3572EF', mr: 2 }} />
                                                    <Typography sx={{ fontWeight: 'bold' }}>Marque:</Typography>
                                                    <Typography>{rec.marque}</Typography>
                                                </InfoItem>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <InfoItem>
                                                    <CalendarToday sx={{ color: '#3572EF', mr: 2 }} />
                                                    <Typography sx={{ fontWeight: 'bold' }}>DOT:</Typography>
                                                    <Typography>
                                                        {rec.date_fabrication ? `20/${String(rec.date_fabrication).slice(-2)}` : '—'}
                                                    </Typography>
                                                </InfoItem>
                                            </Grid>

                                            {/* Description */}
                                            <Grid item xs={12}>
                                                <InfoItem>
                                                    <Description sx={{ color: '#3572EF', mr: 2 }} />
                                                    <Typography sx={{ fontWeight: 'bold' }}>Description:</Typography>
                                                    <Typography>{rec.description}</Typography>
                                                </InfoItem>
                                            </Grid>

                                            {/* État (decision_im_ex) */}
                                            {(canImportExport || isAdmin) && (
                                                <Grid item xs={12}>
                                                    <FormControl fullWidth size="small" disabled={isDisabled}>
                                                        <InputLabel>État</InputLabel>
                                                        <Select
                                                            value={local.decision_im_ex}
                                                            label="État"
                                                            onChange={(e) =>
                                                                setEditState(s => ({
                                                                    ...s,
                                                                    [rec.id]: { ...s[rec.id], decision_im_ex: e.target.value }
                                                                }))
                                                            }
                                                        >
                                                            <MenuItem value="">—</MenuItem>
                                                            <MenuItem value="Traité">Traité</MenuItem>
                                                            <MenuItem value="Non Traité">Non Traité</MenuItem>
                                                            <MenuItem value="Bonifié">Bonifié</MenuItem>
                                                            <MenuItem value="Non Bonifié">Non Bonifié</MenuItem>
                                                            <MenuItem value="Geste Commercial">Geste Commercial</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            )}

                                            {/* Détails */}
                                            {canImportExport && (
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        label="Détails"
                                                        multiline
                                                        rows={2}
                                                        disabled={isDisabled}
                                                        value={local.detail}
                                                        onChange={(e) =>
                                                            setEditState(s => ({
                                                                ...s,
                                                                [rec.id]: { ...s[rec.id], detail: e.target.value }
                                                            }))
                                                        }
                                                    />
                                                </Grid>
                                            )}

                                            {/* Décision */}
                                            <Grid item xs={12}>
                                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                                    <FormControl fullWidth size="small" disabled={!isAdmin || isDisabled}>
                                                        <InputLabel>Décision</InputLabel>
                                                        <Select
                                                            value={local.decision}
                                                            label="Décision"
                                                            onChange={(e) =>
                                                                setEditState(s => ({
                                                                    ...s,
                                                                    [rec.id]: { ...s[rec.id], decision: e.target.value }
                                                                }))
                                                            }
                                                        >
                                                            <MenuItem value="">—</MenuItem>
                                                            <MenuItem value="Bonifié">Bonifié</MenuItem>
                                                            <MenuItem value="Non Bonifié">Non Bonifié</MenuItem>
                                                            <MenuItem value="Geste Commercial">Geste Commercial</MenuItem>
                                                        </Select>
                                                    </FormControl>

                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        label="Avis"
                                                        multiline
                                                        rows={2}
                                                        disabled={!isAdmin || isDisabled}
                                                        value={local.decision_description}
                                                        onChange={(e) =>
                                                            setEditState(s => ({
                                                                ...s,
                                                                [rec.id]: { ...s[rec.id], decision_description: e.target.value }
                                                            }))
                                                        }
                                                    />
                                                </Stack>
                                            </Grid>

                                            {rec.decision_im_ex === 'Non Bonifié' && (
                                                <Button
                                                    size="small"
                                                    startIcon={<PictureAsPdfIcon />}
                                                    onClick={() => openPdfDialog(rec)}
                                                    sx={{
                                                        ml: 1,
                                                        color: '#d32f2f',
                                                        '&:hover': { bgcolor: '#ffebee' }
                                                    }}
                                                >
                                                    PDFs
                                                </Button>
                                            )}
                                            {(canImportExport || isAdmin) && (
                                                <Grid item xs={12}>
                                                    <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            disabled={isDisabled}
                                                            onClick={() => {
                                                                const updates = {
                                                                    decision: local.decision,
                                                                    decision_description: local.decision_description,
                                                                    decision_im_ex: local.decision_im_ex,
                                                                    detail: local.detail,
                                                                };
                                                                patchReclamation(rec.id, updates);
                                                            }}
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            Valider
                                                        </Button>

                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                            disabled={isDisabled}
                                                            onClick={() => {
                                                                const reason = window.prompt(
                                                                    "Veuillez indiquer la raison du refus (obligatoire) :",
                                                                    ""
                                                                );
                                                                if (!reason || reason.trim() === "") {
                                                                    alert("La raison du refus est obligatoire.");
                                                                    return;
                                                                }
                                                                patchReclamation(rec.id, {
                                                                    ref: 1,
                                                                    ref_detail: reason.trim()
                                                                });
                                                            }}
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            Refuser
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                </StyledCard>
                            </Grid>
                        );
                    })}
            </Grid>

            {/* Pagination */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <TablePagination
                    component="div"
                    count={reclamations.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[6, 12, 24]}
                />
            </Box>

            {/* Image Dialog */}
            <Dialog open={Boolean(selectedImage)} onClose={() => setSelectedImage(null)} maxWidth="xl">
                <img
                    src={selectedImage}
                    alt="Agrandie"
                    style={{ maxWidth: '100vw', maxHeight: '90vh', objectFit: 'contain' }}
                />
            </Dialog>
            <Dialog open={pdfDialogOpen} onClose={() => setPdfDialogOpen(false)} maxWidth="sm" fullWidth>
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        PDFs Réclamation #{selectedReclamationId}
                    </Typography>

                    {/* Upload */}
                    {canImportExport && (
                        <Box sx={{ mb: 3, p: 2, border: '1px dashed #ccc', borderRadius: 2, textAlign: 'center' }}>
                            <input
                                accept="application/pdf"
                                style={{ display: 'none' }}
                                id="upload-pdfs"
                                type="file"
                                multiple
                                onChange={(e) => uploadPdfs(Array.from(e.target.files))}
                            />
                            <label htmlFor="upload-pdfs">
                                <Button
                                    variant="contained"
                                    component="span"
                                    startIcon={<CloudUploadIcon />}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Upload...' : 'Uploader PDF(s)'}
                                </Button>
                            </label>
                        </Box>
                    )}

                    {/* Liste des PDFs */}
                    <Box>
                        {pdfFiles.length === 0 ? (
                            <Typography color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                                Aucun PDF
                            </Typography>
                        ) : (
                            pdfFiles.map((file) => (
                                <Box
                                    key={file.fileName}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 1,
                                        bgcolor: '#fafafa'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PictureAsPdfIcon color="error" />
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                                            {file.fileName}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Button
                                            size="small"
                                            startIcon={<DownloadIcon />}
                                            onClick={() => downloadPdf(file.filePath)}
                                            sx={{ mr: 1 }}
                                        >
                                            Télécharger
                                        </Button>
                                        {canImportExport && (
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => deletePdf(file.fileName)}
                                            >
                                                Supprimer
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>

                    <Box sx={{ mt: 3, textAlign: 'right' }}>
                        <Button onClick={() => setPdfDialogOpen(false)} variant="outlined">
                            Fermer
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
};

export default ReclamationsList;