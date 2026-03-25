import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Select,
  MenuItem,
  Typography,
  TablePagination,
  Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BASE_URL from '../Utilis/constantes';
import { useSelector } from 'react-redux';
import entete from '../images/sahar up.png';
import { Chip } from '@mui/material';

const tableStyles = {
  '& .MuiTableCell-root': {
    borderBottom: '1px solid #f0f0f0',
    padding: '16px'
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    backgroundColor: '#9DBDFF',
    fontWeight: 'bold'
  }
};

const RenseignementCommercial = () => {
  const [requests, setRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState({
    DEMANDEUR: '',
    DATE_DEMANDE: new Date().toISOString().slice(0, 16),
    CLIENT: '',
    ENCOURS_COMMERCIAL: '',
    AVIS_COMMERCIAL: '',
    COMMENTAIRE_COMMERCIAL: '',
    AVIS_FINANICER: 'En cours',
    AVIS_ADMIN: 'En cours',
    ADRESSE: '',
    RIB: '',
    BANQUE: '',
  });
  const [editing, setEditing] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openClientSelect, setOpenClientSelect] = useState(false);
const [clients, setClients] = useState([]);
const [clientSearchTerm, setClientSearchTerm] = useState('');
const [clientPage, setClientPage] = useState(0);
const [clientPageSize, setClientPageSize] = useState(10);
const [totalClients, setTotalClients] = useState(0);

  const user = useSelector((state) => state.user);

  // === PAGINATION & CLIENT FILTER ===
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [clientFilter, setClientFilter] = useState('');

  const getAvisColor = (avis) => {
    switch (avis) {
      case 'Traité': return 'green';
      case 'Approuvé': return 'green';
      case 'Non Approuvé': return 'red';
      case 'Refusé': return 'red';
      case 'Annulé': return 'gray';
      case 'En cours':
      default: return 'orange';
    }
  };

  // === FETCH WITH FILTER & PAGINATION ===
  useEffect(() => {
    fetchRequests();
  }, [page, rowsPerPage, clientFilter]);

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams({
        page: page + 1,
        pageSize: rowsPerPage,
        ...(clientFilter && { client: clientFilter })
      });
      const response = await axios.get(`${BASE_URL}/api/renseignements?${params}`);
      setRequests(response.data.rows);
      setTotalRows(response.data.total);
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Error retrieving requests.');
    }
  };

  const handleOpenDialog = (requestToEdit = null) => {
    if (requestToEdit) {
      if (requestToEdit.AVIS_FINANICER !== 'En cours') {
        alert('La modification n\'est plus possible car l\'avis financier a déjà été donné');
        return;
      }
      setEditing(true);
      setCurrentRequest(requestToEdit);
    } else {
      setEditing(false);
      setCurrentRequest({
        DEMANDEUR: user?.LOGIN || '',
        DATE_DEMANDE: new Date().toISOString().slice(0, 16),
        CLIENT: '',
        ENCOURS_COMMERCIAL: '',
        AVIS_COMMERCIAL: '',
        COMMENTAIRE_COMMERCIAL: '',
        AVIS_FINANICER: 'En cours',
        AVIS_ADMIN: 'En cours',
        ADRESSE: '',
        RIB: '',
        BANQUE: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditing(false);
  };

  

  const handleSaveRequest = async () => {
  try {
    const requiredFields = [
      'DEMANDEUR',
      'DATE_DEMANDE',
      'CODE_CLI',  // must be selected from client select
      'ENCOURS_COMMERCIAL',
      'AVIS_COMMERCIAL',
      'ADRESSE',
      'RIB',
      'BANQUE',
    ];

    const missingFields = requiredFields.filter(field => !currentRequest[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    const payload = {
      ...currentRequest,
      CODE_CLI: currentRequest.CODE_CLI,
      SCHEMA: currentRequest.SCHEMA
    };

    const apiEndpoint = editing
      ? `${BASE_URL}/api/UpdateRenseignements/${currentRequest.ID}`
      : `${BASE_URL}/api/createRenseignement`;

    const response = await axios[editing ? 'put' : 'post'](apiEndpoint, payload);

    if (response.status === 201 || response.status === 200) {
      fetchRequests();
      handleCloseDialog();
      alert(`Request ${editing ? 'updated' : 'created'} successfully`);
    }
  } catch (error) {
    console.error('Error saving request:', error);
    alert('Error saving request');
  }
};
const handleSelectClient = (client) => {
  setCurrentRequest({
    ...currentRequest,
    CLIENT: client.INTITULE_CLIENT,
    CLIENT_DISPLAY: `${client.CODE_CLIENT} - ${client.INTITULE_CLIENT}`,
    CODE_CLI: client.CODE_CLIENT,
    SCHEMA: client.SOURCE // FDM or CSPD based on API
  });
  setOpenClientSelect(false);
};


const fetchClients = async () => {
  try {
    const params = new URLSearchParams({
      page: clientPage,
      pageSize: clientPageSize,
      searchTerm: clientSearchTerm
    });

    // Fetch both APIs in parallel
    const [fdmResp, cspdResp] = await Promise.all([
      axios.get(`${BASE_URL}/api/clientsFdmSearch?${params}`),
      axios.get(`${BASE_URL}/api/clientsCspdSearch?${params}`)
    ]);

    // Map source
    const fdmClients = fdmResp.data.clients.map(c => ({ ...c, SOURCE: 'FDM' }));
    const cspdClients = cspdResp.data.clients.map(c => ({ ...c, SOURCE: 'CSPD' }));

    // Merge results
    const mergedClients = [...fdmClients, ...cspdClients];
    setClients(mergedClients);

    // Total = sum of both
    const total = (fdmResp.data.total || 0) + (cspdResp.data.total || 0);
    setTotalClients(total);

  } catch (err) {
    console.error('Error fetching clients:', err);
    setClients([]);
    setTotalClients(0);
  }
};



  const handleOpenDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedRequest(null);
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await axios.delete(`${BASE_URL}/api/renseignements/${id}`);
        fetchRequests();
        alert('Request deleted successfully');
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('Error deleting request');
      }
    }
  };

  // === PAGINATION HANDLERS ===
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
<Paper
  elevation={3}
  sx={{
    p: 3,
    borderRadius: 3,
    mb: 3
  }}
>
  <Box
    sx={{
      display: 'flex',
      gap: 2,
      alignItems: 'center',
      flexWrap: 'wrap'
    }}
  >
    <TextField
      label="Filtrer par client"
      value={clientFilter}
      onChange={(e) => {
        setClientFilter(e.target.value);
        setPage(0);
      }}
      sx={{ flex: 1, minWidth: 250 }}
      size="small"
    />

    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => handleOpenDialog()}
      sx={{
        padding: '10px 24px',
        borderRadius: '8px',
        backgroundColor: '#1976d2',
        boxShadow: '0 4px 6px rgba(25, 118, 210, 0.2)',
        transition: 'all 0.3s ease',
        fontWeight: 600,
        fontSize: '1rem',
        textTransform: 'none',
        whiteSpace: 'nowrap',
        '&:hover': {
          backgroundColor: '#1565c0',
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 8px rgba(25, 118, 210, 0.3)',
        }
      }}
    >
      Nouvelle Demande de Renseignement Client
    </Button>
  </Box>
</Paper>


      {/* === TABLE + PAGINATION === */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={tableStyles}>
            <TableHead>
              <TableRow style={{ backgroundColor: '#9DBDFF' }}>
                <TableCell>Demandeur</TableCell>
                <TableCell>Date demande</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Avis Commercial</TableCell>
                <TableCell>Avis Financier</TableCell>
                <TableCell>Avis Administrateur</TableCell>
                <TableCell>Mode de réglement</TableCell>
                <TableCell>Encours Final</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.ID} hover>
                  <TableCell>{request.DEMANDEUR}</TableCell>
                  <TableCell>{new Date(request.DATE_DEMANDE).toLocaleString()}</TableCell>
                  <TableCell>{request.CLIENT}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.AVIS_COMMERCIAL}
                      sx={{
                        backgroundColor: getAvisColor(request.AVIS_COMMERCIAL),
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.AVIS_FINANICER}
                      sx={{
                        backgroundColor: getAvisColor(request.AVIS_FINANICER),
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.AVIS_ADMIN}
                      sx={{
                        backgroundColor: getAvisColor(request.AVIS_ADMIN),
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>{request.MODE_REGLEMENT}</TableCell>
                  <TableCell>{request.ENCOURS_ADMIN}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(request)}
                      disabled={request.AVIS_FINANICER !== 'En cours'}
                      sx={{
                        opacity: request.AVIS_FINANICER !== 'En cours' ? 0.5 : 1,
                        '&:hover': {
                          backgroundColor: request.AVIS_FINANICER !== 'En cours' ? 'transparent' : undefined
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton color="info" onClick={() => handleOpenDetails(request)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* === MUI PAGINATION === */}
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[15, 30, 50]}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>

      {/* === CREATE / EDIT DIALOG (unchanged) === */}
      <Dialog
  open={openDialog}
  onClose={handleCloseDialog}
  maxWidth="md"
  fullWidth
  PaperProps={{ elevation: 2, sx: { borderRadius: 2 } }}
>
  <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd', padding: '25px 24px' }}>
    {editing ? 'Modifier la demande de renseignement' : 'Nouvelle demande de renseignement'}
  </DialogTitle>
  <DialogContent sx={{ padding: '50px' }}>
    <Grid container spacing={3} style={{ marginTop: 5 }}>
      {/* Demandeur */}
      <Grid item xs={6}>
        <TextField
          fullWidth
          variant="outlined"
          label="Demandeur"
          value={currentRequest.DEMANDEUR}
          InputProps={{ readOnly: true }}
        />
      </Grid>

      {/* Date demande */}
      <Grid item xs={6}>
        <TextField
          fullWidth
          variant="outlined"
          label="Date demande"
          value={currentRequest.DATE_DEMANDE}
          onChange={(e) => setCurrentRequest({ ...currentRequest, DATE_DEMANDE: e.target.value })}
        />
      </Grid>

      {/* === Client Select === */}
      <Grid item xs={6}>
  <TextField
    fullWidth
    variant="outlined"
    label="Client"
    value={currentRequest.CLIENT_DISPLAY || ''}
    onClick={() => {
      setOpenClientSelect(true);
      fetchClients();
    }}
    readOnly
  />

  {/* Client select modal */}
  <Dialog open={openClientSelect} onClose={() => setOpenClientSelect(false)} maxWidth="sm" fullWidth>
    <DialogTitle>Choisir un client</DialogTitle>
    <DialogContent>
      <TextField
        fullWidth
        size="small"
        placeholder="Rechercher par code ou nom"
        value={clientSearchTerm}
        onChange={(e) => {
          setClientSearchTerm(e.target.value);
          setClientPage(0);
          fetchClients();
        }}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
        <Table stickyHeader>
          <TableBody>
            {clients.map(client => (
              <TableRow
                key={`${client.SOURCE}-${client.CODE_CLIENT}`}
                hover
                onClick={() => handleSelectClient(client)}
                selected={currentRequest.CODE_CLI === client.CODE_CLIENT && currentRequest.SCHEMA === client.SOURCE}
                sx={{ cursor: 'pointer', '&.Mui-selected': { backgroundColor: 'rgba(53,114,239,0.1) !important' } }}
              >
                <TableCell>{`${client.CODE_CLIENT} - ${client.INTITULE_CLIENT} (${client.SOURCE})`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        rowsPerPageOptions={[10, 25, 50]}
        count={totalClients}
        rowsPerPage={clientPageSize}
        page={clientPage}
        onPageChange={(e, newPage) => {
          setClientPage(newPage);
          fetchClients();
        }}
        onRowsPerPageChange={(e) => {
          setClientPageSize(parseInt(e.target.value, 10));
          setClientPage(0);
          fetchClients();
        }}
        sx={{ mt: 1 }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenClientSelect(false)}>Fermer</Button>
    </DialogActions>
  </Dialog>
</Grid>


      {/* Encours Commercial */}
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Encours Commercial"
          type="number"
          value={currentRequest.ENCOURS_COMMERCIAL}
          onChange={(e) => setCurrentRequest({ ...currentRequest, ENCOURS_COMMERCIAL: e.target.value })}
        />
      </Grid>

      {/* Banque */}
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Banque"
          value={currentRequest.BANQUE}
          onChange={(e) => setCurrentRequest({ ...currentRequest, BANQUE: e.target.value })}
          margin="normal"
        />
      </Grid>

      {/* RIB */}
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="RIB"
          value={currentRequest.RIB}
          onChange={(e) => setCurrentRequest({ ...currentRequest, RIB: e.target.value })}
          margin="normal"
        />
      </Grid>

      {/* Adresse */}
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Adresse"
          value={currentRequest.ADRESSE}
          onChange={(e) => setCurrentRequest({ ...currentRequest, ADRESSE: e.target.value })}
          margin="normal"
        />
      </Grid>

      {/* Avis Commercial */}
      <Grid item xs={6}>
        <Typography component="th">Avis Commercial</Typography>
        <Select
          fullWidth
          value={currentRequest.AVIS_COMMERCIAL}
          onChange={(e) => setCurrentRequest({ ...currentRequest, AVIS_COMMERCIAL: e.target.value })}
        >
          <MenuItem value="Traité">Traité</MenuItem>
          <MenuItem value="Refusé">Refusé</MenuItem>
          <MenuItem value="Annulé">Annulé</MenuItem>
        </Select>
      </Grid>

      {/* Commentaire */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Commentaire"
          multiline
          rows={4}
          value={currentRequest.COMMENTAIRE_COMMERCIAL}
          onChange={(e) => setCurrentRequest({ ...currentRequest, COMMENTAIRE_COMMERCIAL: e.target.value })}
          margin="normal"
        />
      </Grid>
    </Grid>
  </DialogContent>

  <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid #ddd' }}>
    <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
      Annuler
    </Button>
    <Button onClick={handleSaveRequest} variant="contained" color="primary">
      {editing ? 'Modifier' : 'Enregistrer'}
    </Button>
  </DialogActions>
</Dialog>


      {/* === DETAILS DIALOG (unchanged) === */}
      <Dialog open={detailsDialog} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle sx={{
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd'
        }}>
          Détails de la demande
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          {selectedRequest && (
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid #f0f0f0',
                  padding: '16px'
                },
                '& .MuiTableCell-head': {
                  backgroundColor: '#fafafa',
                  fontWeight: 'bold'
                }
              }}>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" width="30%">Demandeur</TableCell>
                    <TableCell>{selectedRequest.DEMANDEUR}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Date demande</TableCell>
                    <TableCell>{new Date(selectedRequest.DATE_DEMANDE).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Client</TableCell>
  <TableCell>{selectedRequest.CODE_CLI ? `${selectedRequest.CODE_CLI} - ${selectedRequest.CLIENT}` : selectedRequest.CLIENT}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Avis Commercial</TableCell>
                    <TableCell>
                      <Chip
                        label={selectedRequest.AVIS_COMMERCIAL}
                        sx={{
                          backgroundColor: getAvisColor(selectedRequest.AVIS_COMMERCIAL),
                          color: '#fff',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Encours Commercial</TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedRequest.ENCOURS_COMMERCIAL}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Commentaire Commercial</TableCell>
                    <TableCell>
                      {selectedRequest.COMMENTAIRE_COMMERCIAL}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Commentaire Commercial</TableCell>
                    <TableCell>
                      {selectedRequest.BANQUE}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Commentaire Commercial</TableCell>
                    <TableCell>
                      {selectedRequest.RIB}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Commentaire Commercial</TableCell>
                    <TableCell>
                      {selectedRequest.ADRESSE}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Avis Financier</TableCell>
                    <TableCell>
                      <Chip
                        label={selectedRequest.AVIS_FINANICER}
                        sx={{
                          backgroundColor: getAvisColor(selectedRequest.AVIS_FINANICER),
                          color: '#fff',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Encours Financier</TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedRequest.ENCOURS_FINANCIER}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Commentaire Financier</TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedRequest.COMMENTAIRE_FINANCIER}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Avis Admin</TableCell>
                    <TableCell>
                      <Chip
                        label={selectedRequest.AVIS_ADMIN}
                        sx={{
                          backgroundColor: getAvisColor(selectedRequest.AVIS_ADMIN),
                          color: '#fff',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Encours Admin</TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedRequest.ENCOURS_ADMIN}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Commentaire Admin</TableCell>
                    <TableCell>
                      {selectedRequest.COMMENTAIRE_ADMIN}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th">Mode de réglement</TableCell>
                    <TableCell>
                      {selectedRequest.MODE_REGLEMENT}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{
          padding: '16px 24px',
          borderTop: '1px solid #ddd'
        }}>
          <Button
            onClick={handleCloseDetails}
            variant="contained"
            color="primary"
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RenseignementCommercial;