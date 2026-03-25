import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TablePagination,
  CircularProgress,
  Avatar,
  Stack,
  Chip,
  InputAdornment
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import BASE_URL from '../Utilis/constantes';

const CompteRenduListPage = () => {
  const user = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const getToday = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const [selectedDate, setSelectedDate] = useState(getToday());
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const isAdmin =
  ['administrateur', 'directeur commercial']
    .includes(user?.ROLE?.trim().toLowerCase());

  const softColors = {
    bg: '#f1f5f9',
    cardBg: '#FFFFFF',
    headerBg: '#f8fafc',
    primary: '#0284c7',
    secondary: '#64748b',
    text: '#0f172a',
    accent: '#f0f9ff'
  };

const fetchUsers = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/users`);
   
    const filteredUsers = (res.data || []).filter(user => 
      user.ACCESS_COMPTE_RENDU === 1 && 
      user.DEPARTEMENT !== "Développement" && 
      user.DEPARTEMENT !== "Direction"
    );
    setUsers(filteredUsers);
  } catch (err) { 
    console.error(err); 
  }
};

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    if (!isAdmin) setSelectedUser(user.UTILISATEUR);
  }, [user, isAdmin]);

  const fetchCompteRendu = async () => {
  try {
    setLoading(true);

    // Determine which user to send
    const userParam = isAdmin ? undefined : user.UTILISATEUR;

    const res = await axios.get(`${BASE_URL}/api/compte-rendu`, {
      params: { 
        USER_NAME: selectedUser || userParam,  // selectedUser if admin selects one, otherwise force non-admin user's name
        DATE_CR: selectedDate || undefined, 
        page, 
        pageSize 
      }
    });

    const rawData = res.data.data || [];
    const groupedData = [];

    if (selectedUser && !selectedDate) {
      const mapByDate = {};
      rawData.forEach(item => {
        if (!mapByDate[item.DATE_CR]) mapByDate[item.DATE_CR] = [];
        mapByDate[item.DATE_CR].push(item);
      });
      Object.keys(mapByDate).forEach(date => {
        groupedData.push({ key: date, USER_NAME: selectedUser, DATE_CR: date, items: mapByDate[date] });
      });
    } else if (!selectedUser && selectedDate) {
      const mapByUser = {};
      rawData.forEach(item => {
        if (!mapByUser[item.USER_NAME]) mapByUser[item.USER_NAME] = [];
        mapByUser[item.USER_NAME].push(item);
      });
      Object.keys(mapByUser).forEach(uname => {
        groupedData.push({ key: uname, USER_NAME: uname, DATE_CR: selectedDate, items: mapByUser[uname] });
      });
    } else {
      rawData.forEach(item => {
        groupedData.push({ key: item.ID_COMPTE_RENDU, USER_NAME: item.USER_NAME, DATE_CR: item.DATE_CR, items: [item] });
      });
    }

    setData(groupedData);
    setTotal(res.data.total || 0);
  } catch (err) { 
    console.error(err); 
  } finally { 
    setLoading(false); 
  }
};

  useEffect(() => { fetchCompteRendu(); }, [selectedUser, selectedDate, page, pageSize]);

  const splitData = (row) => {
    const taches = [];
    const descriptions = [];
    row.items.forEach(r => {
      if (r.TACHE) taches.push(...r.TACHE.split(' / '));
      if (r.DESCRIPTION) descriptions.push(...r.DESCRIPTION.split(' / '));
    });
    return taches.map((t, i) => ({ task: t, description: descriptions[i] || '' }));
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: softColors.bg, p: { xs: 2, md: 4 } }}>
      {/* Container réglé à 100% pour occuper toute la largeur */}
      <Box sx={{ width: '100%', mx: 'auto' }}>
        
        {/* HEADER */}
        <Stack direction="row" spacing={2} alignItems="center" mb={4} sx={{ ml: 1 }}>
          <Box>
        <Typography variant="h4" fontWeight="bold" color="#1976d2">
              Rapports d'Activité
            </Typography>

          </Box>
        </Stack>

        {/* FILTRES PLEINE LARGEUR */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: softColors.cardBg }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#1976d2", ml: 1, mb: 1, display: 'block' }}>
                EMPLOYÉ 
              </Typography>
              <Select
                fullWidth
                value={selectedUser ?? ''}
                onChange={(e) => { setSelectedUser(e.target.value); setPage(0); }}
                displayEmpty
                startAdornment={<PersonSearchIcon sx={{ mr: 1, color: softColors.secondary }} />}
                disabled={!isAdmin}
                sx={{ borderRadius: '12px', bgcolor: '#f8fafc', '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #e2e8f0' } }}
              >
                <MenuItem value=""><em>Tous les membres</em></MenuItem>
                {users.map((u, idx) => (
                  <MenuItem key={idx} value={u.UTILISATEUR}>{u.UTILISATEUR}</MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#1976d2", ml: 1, mb: 1, display: 'block' }}>
                FILTRER PAR DATE
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setPage(0); }}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><CalendarMonthIcon sx={{ color: softColors.secondary }}/></InputAdornment>),
                  sx: { borderRadius: '12px', bgcolor: '#f8fafc', '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #e2e8f0' } }
                }}
              />
            </Box>
          </Stack>
        </Paper>

        {/* LISTE DES CARTES PLEINE LARGEUR */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: softColors.primary }} /></Box>
        ) : (
          <Stack spacing={3}>
            {data.map((row) => {
              const rows = splitData(row);
              return (
                <Paper key={row.key} elevation={0} sx={{ 
                  borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', width: '100%'
                }}>
                  <Box sx={{ p: 2.5, bgcolor: softColors.headerBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'white', color: softColors.primary, fontWeight: 700, border: '1px solid #E2E8F0', width: 45, height: 45 }}>
                        {row.USER_NAME[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: softColors.text }}>{row.USER_NAME}</Typography>
                        <Typography variant="caption" sx={{ color: softColors.secondary, fontWeight: 600 }}>{row.DATE_CR}</Typography>
                      </Box>
                    </Stack>
                    <Chip 
                        label={`${rows.length} tâches réalisées`} 
                        sx={{ bgcolor: softColors.accent, color: softColors.primary, fontWeight: 700, borderRadius: '8px' }} 
                    />
                  </Box>
                  
                  <Table sx={{ width: '100%' }}>
                    <TableBody>
                      {rows.map((item, index) => (
                        <TableRow key={index} sx={{ '&:hover': { bgcolor: '#fcfdfe' } }}>
                          <TableCell sx={{ width: '25%', borderBottom: '1px solid #F1F5F9', py: 2, pl: 4 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: softColors.text }}>{item.task}</Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #F1F5F9', py: 2 }}>
                            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>{item.description || '-'}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              );
            })}
          </Stack>
        )}

        {/* PAGINATION PLEINE LARGEUR */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <TablePagination
            component={Paper}
            elevation={0}
            sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: 'white', minWidth: '400px' }}
            count={total}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
            labelRowsPerPage="Afficher :"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CompteRenduListPage;