import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Button,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  Paper,
  Divider,
  Stack,
  Fade
} from '@mui/material';
import PlusOneIcon from '@mui/icons-material/PlusOne';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';
import BASE_URL from '../Utilis/constantes';

const TachesFormPage = () => {
  const user = useSelector((state) => state.user);

  const [taches, setTaches] = useState([]);
  const [checkedTasks, setCheckedTasks] = useState({});
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherRows, setOtherRows] = useState([{ name: '', description: '' }]);

  const fetchTaches = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/taches`, {
        params: { DEPARTMENT: user.DEPARTEMENT }
      });
      setTaches(response.data.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    fetchTaches();
  }, [user.DEPARTEMENT]);

  const handleCheckTask = (id) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddOtherRow = () => {
    setOtherRows([...otherRows, { name: '', description: '' }]);
  };

  const handleRemoveOtherRow = () => {
    if (otherRows.length > 1) {
      const newRows = [...otherRows];
      newRows.pop();
      setOtherRows(newRows);
    }
  };

  const handleOtherRowChange = (index, field, value) => {
    const newRows = [...otherRows];
    newRows[index][field] = value;
    setOtherRows(newRows);
  };

  const handleSave = async () => {
    if (otherChecked && otherRows.some((r) => r.name.trim() === '')) {
      alert('Tous les champs "Nom" sont obligatoires !');
      return;
    }
    try {
      // 1️⃣ POST nouvelles tâches
      for (let row of otherRows) {
        if (row.name.trim()) {
          await axios.post(`${BASE_URL}/api/taches`, {
            NAME: row.name,
            DEPARTMENT: user.DEPARTEMENT,
            USER_NAME: user.UTILISATEUR
          });
        }
      }

      // 2️⃣ POST compte-rendu
      const checkedTaskNames = taches.filter((t) => checkedTasks[t.ID_TACHE]).map((t) => t.NAME);
      const otherNames = otherRows.map((r) => r.name.trim());
      const tacheField = [...checkedTaskNames, ...otherNames].join(' / ');

      const checkedTaskDescriptions = taches
        .filter((t) => checkedTasks[t.ID_TACHE])
        .map((t) => (t.description ? t.description : ''));
      const otherDescriptions = otherRows.map((r) => (r.description ? r.description : ''));

      const descriptionField = [...checkedTaskDescriptions, ...otherDescriptions].join(' / ');

      await axios.post(`${BASE_URL}/api/compte-rendu`, {
        USER_NAME: user.UTILISATEUR,
        DATE_CR: new Date().toISOString().split('T')[0],
        TACHE: tacheField,
        DESCRIPTION: descriptionField
      });

      alert('Enregistré avec succès !');
      setCheckedTasks({});
      setOtherChecked(false);
      setOtherRows([{ name: '', description: '' }]);
      fetchTaches();
    } catch (err) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#f4f6f8', p: 2 }}>
      <Box sx={{ width: '100%', mb: 3, ml: 2 }}>
        <Typography variant="h4" fontWeight="bold" color="#1976d2">
          Sélection des tâches
        </Typography>
        
      </Box>

      <Paper elevation={0} sx={{ width: '100%', p: 4, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        
        {/* Liste des tâches existantes */}
        <Stack spacing={1}>
          {taches.map((tache) => (
            <Box 
              key={tache.ID_TACHE} 
              display="flex" 
              alignItems="center" 
              sx={{ 
                py: 1.5, 
                borderBottom: '1px solid #f9f9f9',
                '&:hover': { bgcolor: '#fcfcfc' }
              }}
            >
              <Checkbox
                checked={!!checkedTasks[tache.ID_TACHE]}
                onChange={() => handleCheckTask(tache.ID_TACHE)}
                color="primary"
              />
              <Typography sx={{ minWidth: '300px', fontWeight: 500, color: '#333' }}>
                {tache.NAME}
              </Typography>
              
              {checkedTasks[tache.ID_TACHE] && (
                <Fade in={true}>
                  <TextField
                    variant="standard"
                    placeholder="Ajouter un commentaire ou un détail..."
                    fullWidth
                    value={tache.description || ''}
                    onChange={(e) => {
                      const newTaches = taches.map((t) =>
                        t.ID_TACHE === tache.ID_TACHE ? { ...t, description: e.target.value } : t
                      );
                      setTaches(newTaches);
                    }}
                    sx={{ 
                      ml: 4,
                      '& .MuiInput-underline:before': { borderBottomColor: '#e0e0e0' },
                    }}
                  />
                </Fade>
              )}
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 4 }} />

        {/* Section Autre */}
        <Box display="flex" alignItems="center" mb={2}>
          <Checkbox checked={otherChecked} onChange={() => setOtherChecked(!otherChecked)} />
          <Typography fontWeight="bold">Autre (Tâche manuelle)</Typography>
        </Box>

        {otherChecked && (
          <Box sx={{ pl: 5, mb: 4 }}>
            {otherRows.map((row, index) => (
              <Stack key={index} direction="row" spacing={3} mb={2} alignItems="center">
                <TextField
                  label="Nom de la tâche"
                  variant="outlined"
                  size="small"
                  sx={{ width: '300px' }}
                  value={row.name}
                  onChange={(e) => handleOtherRowChange(index, 'name', e.target.value)}
                />
                <TextField
                  label="Description"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={row.description}
                  onChange={(e) => handleOtherRowChange(index, 'description', e.target.value)}
                />
              </Stack>
            ))}
            <Stack direction="row" spacing={1}>
              <IconButton onClick={handleAddOtherRow} color="success" sx={{ border: '1px solid' }}><PlusOneIcon /></IconButton>
              <IconButton 
                onClick={handleRemoveOtherRow} 
                color="error" 
                sx={{ border: '1px solid' }}
                disabled={otherRows.length === 1}
              ><RemoveIcon /></IconButton>
            </Stack>
          </Box>
        )}

        {/* Bouton Enregistrer */}
        <Box mt={6} display="flex" justifyContent="flex-start">
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ 
              px: 6, 
              py: 1.5, 
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Enregistrer
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TachesFormPage;