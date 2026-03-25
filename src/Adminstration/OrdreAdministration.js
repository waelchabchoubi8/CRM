import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import PrintIcon from '@mui/icons-material/Print';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, Grid, FormControl, InputLabel,
  Card, Typography, Box, IconButton, Chip
} from '@mui/material';
import {
  Add as AddIcon,

  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import BASE_URL from '../Utilis/constantes';
import { Menu, Tooltip } from '@mui/material';

const OrdresAdministration = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const connectedUser = useSelector((state) => state.user);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const isAdmin = connectedUser?.ROLE === 'administrateur' || connectedUser?.ROLE === 'directeur commercial ';

  // Add these handler functions
  const handleMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };
  const handlePrint = (order) => {
    const printContent = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="text-align: center;">Ordre Administratif</h2>
            <hr/>
            <div style="margin: 20px 0;">
                <p><strong>Date:</strong> ${new Date(order.DATE_DEMANDE).toLocaleString()}</p>
                <p><strong>Type:</strong> ${order.TYPE_DEMANDE}</p>
                <p><strong>Administration:</strong> ${order.DEMANDEUR}</p>
                <p><strong>Destinataire:</strong> ${order.RECEVEUR}</p>
                <p><strong>État:</strong> ${order.ETAT}</p>
                <p><strong>Description:</strong></p>
                <p style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                    ${order.DESCRIPTION}
                </p>
            </div>
            <div style="margin-top: 50px;">
                <div style="float: right;">
                    <p>Signature: _________________</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };
  const handleEdit = () => {
    setCurrentOrder(selectedOrder);
    setIsEditMode(true);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet ordre ?')) {
      try {
        await axios.delete(`${BASE_URL}/api/deleteOrdreAdmin/${selectedOrder.ID}`);
        fetchOrders();
        alert('Ordre supprimé avec succès');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Erreur lors de la suppression');
      }
    }
    handleMenuClose();
  };

  const orderTypes = [
    "Suspicion",
    "Ordre de démission",
    "Chommage technique ",
    "Accident de travail",
    "Ordre de congé",
    "Note de service",
    "Questionnaire",
    "Invertissemet",
    "Mis à pied",

    "Autre"
  ];
  const getStatusColor = (status) => {
    switch (status) {
      case 'En cours': return '#FFC107';
      case 'Terminé': return '#4CAF50';
      case 'Annulé': return '#F44336';
      default: return '#757575';
    }
  }
  const [currentOrder, setCurrentOrder] = useState({
    TYPE_DEMANDE: '',
    DEMANDEUR: connectedUser?.LOGIN || '',
    RECEVEUR: '',
    DESCRIPTION: '',
    DATE_DEMANDE: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Erreur lors du chargement des utilisateurs');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/ordresAdmin`);
      
      const filteredOrders = connectedUser?.ROLE === 'administrateur' || connectedUser?.ROLE === 'directeur commercial'
        ? response.data
        : response.data.filter(order => 
            order.DEMANDEUR === connectedUser?.LOGIN || 
            order.RECEVEUR === connectedUser?.LOGIN
          );
  
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Erreur lors du chargement des ordres');
    }
  };
  
  


  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        await axios.put(`${BASE_URL}/api/updateOrdreAdmin/${currentOrder.ID}`, currentOrder);
        alert('Ordre modifié avec succès');
      } else {
        await axios.post(`${BASE_URL}/api/createOrdreAdmin`, {
          ...currentOrder,
          DEMANDEUR: connectedUser?.LOGIN
        });
        alert('Ordre créé avec succès');
      }
      setOpenDialog(false);
      setIsEditMode(false);
      fetchOrders();
    } catch (error) {
      console.error('Error:', error);
      alert('Une erreur est survenue');
    }
  };

  const handleStateChange = async (orderId, newState) => {
    try {
      await axios.put(`${BASE_URL}/api/updateOrdreAdmin/${orderId}`, {
        ETAT: newState
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Ordres Administratifs
          </Typography>
          <Box>
            <IconButton sx={{ mr: 1 }} onClick={fetchOrders}>

              <RefreshIcon />
            </IconButton>
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#115293' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',

                }}
              >
                Nouvel ordre
              </Button>
            )}
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Demandeur</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Destinataire</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>État</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Imprimer</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.ID}
                  sx={{ '&:hover': { backgroundColor: '#f8f8f8' } }}
                >
                  <TableCell>
                    {new Date(order.DATE_DEMANDE).toLocaleString()}
                  </TableCell>
                  <TableCell>{order.DEMANDEUR}</TableCell>

                  <TableCell>
                    <Chip
                      label={order.TYPE_DEMANDE}
                      sx={{ backgroundColor: '#e3f2fd' }}
                    />
                  </TableCell>
                  <TableCell>{order.RECEVEUR}</TableCell>
                  <TableCell>{order.DESCRIPTION}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <Select
                        value={order.ETAT}
                        onChange={(e) => handleStateChange(order.ID, e.target.value)}
                        sx={{
                          '& .MuiSelect-select': {
                            color: getStatusColor(order.ETAT),
                            fontWeight: 'bold',
                            padding: '5px 15px',
                            borderRadius: '15px'
                          }
                        }}
                      >
                        <MenuItem value="En cours">En cours</MenuItem>
                        <MenuItem value="Terminé">Terminé</MenuItem>
                        <MenuItem value="Annulé">Annulé</MenuItem>
                      </Select>
                    ) : (
                      <Chip
                        label={order.ETAT}
                        sx={{
                          color: getStatusColor(order.ETAT),
                          fontWeight: 'bold',
                          backgroundColor: `${getStatusColor(order.ETAT)}20`
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <>
                        <IconButton onClick={(e) => handleMenuOpen(e, order)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                          PaperProps={{
                            sx: {
                              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                              borderRadius: '8px',
                            }
                          }}
                        >
                          <MenuItem
                            onClick={handleEdit}
                            sx={{
                              color: '#1976d2',
                              '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                          >
                            <EditIcon sx={{ mr: 1, fontSize: 20 }} />
                            Modifier
                          </MenuItem>
                          <MenuItem
                            onClick={handleDelete}
                            sx={{
                              color: '#d32f2f',
                              '&:hover': { backgroundColor: '#fee' }
                            }}
                          >
                            <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                            Supprimer
                          </MenuItem>
                        </Menu>
                      </>
                    ) : (
                      ""
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Imprimer la demande">
                      <IconButton
                        onClick={() => handlePrint(order)}
                        sx={{
                          color: '#1976d2',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)'
                          }
                        }}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          Nouvel ordre administratif
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ borderRadius: '8px', marginTop: '20px' }}
                >Type d'ordre</InputLabel>
                <Select
                  value={currentOrder.TYPE_DEMANDE}
                  onChange={(e) => setCurrentOrder({ ...currentOrder, TYPE_DEMANDE: e.target.value })}
                  sx={{ borderRadius: '8px', marginTop: '20px' }}
                >
                  {orderTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Demandeur"
                value={connectedUser?.LOGIN || ''}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Destinataire</InputLabel>
                <Select
                  value={currentOrder.RECEVEUR}
                  onChange={(e) => setCurrentOrder({ ...currentOrder, RECEVEUR: e.target.value })}
                  sx={{ borderRadius: '8px' }}
                >
                  {users.map((user) => (
                    <MenuItem key={user.LOGIN} value={user.LOGIN}>
                      {user.UTILISATEUR}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={currentOrder.DESCRIPTION}
                onChange={(e) => setCurrentOrder({ ...currentOrder, DESCRIPTION: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none'
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#115293' }
            }}
          >
            Soumettre
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default OrdresAdministration;
