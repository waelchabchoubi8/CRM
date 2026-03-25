import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  TablePagination,
  Typography,
  Tooltip,
  CircularProgress
} from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BASE_URL from '../Utilis/constantes';

const TachesPage = () => {
  const user = useSelector((state) => state.user);

  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openAdd, setOpenAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchTaches = async (p = page, ps = rowsPerPage) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/taches`, {
        params: { DEPARTMENT: user.DEPARTEMENT, page: p, pageSize: ps }
      });
      setTaches(response.data.data);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTaches(); }, [user.DEPARTEMENT]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchTaches(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0);
    fetchTaches(0, newSize);
  };

  const handleAddTache = async () => {
    if (!newName) return;
    try {
      await axios.post(`${BASE_URL}/api/taches`, {
        NAME: newName,
        DEPARTMENT: user.DEPARTEMENT,
        USER_NAME: user.UTILISATEUR
      });
      setNewName('');
      setOpenAdd(false);
      fetchTaches();
    } catch (err) { console.error(err); }
  };

  const handleEditClick = (tache) => {
    setEditId(tache.ID_TACHE);
    setEditName(tache.NAME);
    setOpenEdit(true);
  };

  const handleEditTache = async () => {
    if (!editName) return;
    try {
      await axios.patch(`${BASE_URL}/api/taches/${editId}`, {
        NAME: editName,
        USER_NAME: user.UTILISATEUR
      });
      setOpenEdit(false);
      fetchTaches();
    } catch (err) { console.error(err); }
  };

  return (
    <Box p={3}>
      {/* HEADER SECTION */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
      <Typography variant="h4" fontWeight="bold" color="#1976d2">
             Référentiel des Tâches
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenAdd(true)}
          sx={{ 
            borderRadius: '10px', 
            textTransform: 'none', 
            fontWeight: 600,
            px: 3,
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
          }}
        >
          Nouvelle Tâche
        </Button>
      </Box>

      {/* TABLE SECTION */}
      <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'transparent', borderBottom: '2px solid #f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#1976d2', py: 2 }}>NOM DE LA TÂCHE</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#1976d2', py: 2 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={30} sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Chargement...</Typography>
                  </TableCell>
                </TableRow>
              ) : taches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 10 }}>
                    <AssignmentIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">Aucune tâche trouvée</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                taches.map((tache) => (
                  <TableRow key={tache.ID_TACHE} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 500, color: '#334155' }}>
                      {tache.NAME}
                    </TableCell>
                    <TableCell align="right">
  {tache.USER_NAME !== "CRM" && (
    <Tooltip title="Modifier">
      <IconButton 
        onClick={() => handleEditClick(tache)}
        sx={{ color: '#6366f1', '&:hover': { bgcolor: '#eef2ff' } }}
      >
        <EditTwoToneIcon />
      </IconButton>
    </Tooltip>
  )}
</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
          sx={{ borderTop: '1px solid #e2e8f0' }}
        />
      </Paper>

      {/* MODAL AJOUT / EDIT */}
      <Dialog 
        open={openAdd || openEdit} 
        onClose={() => { setOpenAdd(false); setOpenEdit(false); }}
        PaperProps={{ sx: { borderRadius: '20px', p: 1, width: '400px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {openAdd ? 'Créer une tâche' : 'Modifier la tâche'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Indiquez le nom de la tâche tel qu'il apparaîtra dans les rapports quotidiens.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            placeholder="Ex: Réunion de production"
            variant="outlined"
            value={openAdd ? newName : editName}
            onChange={(e) => openAdd ? setNewName(e.target.value) : setEditName(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => { setOpenAdd(false); setOpenEdit(false); }}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={openAdd ? handleAddTache : handleEditTache}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}
          >
            {openAdd ? 'Confirmer' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TachesPage;