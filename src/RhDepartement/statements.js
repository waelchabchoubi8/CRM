  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, TextField, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, Grid, Select, MenuItem, InputLabel, Box,
    Pagination, FormControl
  } from '@mui/material';
  import { Card } from '@mui/material';
  import VisibilityIcon from '@mui/icons-material/Visibility';
  import DownloadIcon from '@mui/icons-material/Download';
  import CloudUploadIcon from '@mui/icons-material/CloudUpload';
  import {
    Avatar,
  } from '@mui/material';
  import CloseIcon from '@mui/icons-material/Close';
  import SaveIcon from '@mui/icons-material/Save';
  import { useTheme } from '@mui/material/styles';
  import Stack from '@mui/material/Stack';
  import Typography from '@mui/material/Typography';
  import Chip from '@mui/material/Chip';
  import AddIcon from '@mui/icons-material/Add';
  import EditIcon from '@mui/icons-material/Edit';
  import DeleteIcon from '@mui/icons-material/Delete';
  import PrintIcon from '@mui/icons-material/Print';
  import BASE_URL from '../Utilis/constantes';
  import { useSelector } from 'react-redux';
  import entete from '../images/sahar up.png';

  const Statements = () => {
    const [users, setUsers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [fileDialogOpen, setFileDialogOpen] = useState(false); // NEW: For file preview dialog
    const theme = useTheme();
    const [setDepartmentClaims] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [reclamant, setReclamant] = useState('');
    const [notifier, setNotifier] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [files, setFiles] = useState([]); // NEW: To store file list
    const [selectedStatementId, setSelectedStatementId] = useState(null); // NEW: To track current statement ID
    const [selectedFile, setSelectedFile] = useState(null); // NEW: For selected file handling
    const [saving, setSaving] = useState(false);

    const [currentUser, setCurrentUser] = useState({
      USER_NAME: '',
      DEMAND_DATE: '',
      DEMAND_TYPE: [],
      DESCRIPTION: '',
      STATE: 'En cours',
      ETAT: 'En cours',
      PAR: '',
      COMMENTAIRE: ''
    });

    const [editing, setEditing] = useState(false);
    const [enteteBase64, setEnteteBase64] = useState('');

    const user = useSelector((state) => state.user);
    const isAdminOrDirector = user?.ROLE?.trim() === 'administrateur' || user?.ROLE?.trim() === 'directeur commercial';

    const [selectOpen, setSelectOpen] = useState(false);

    useEffect(() => {
    const fetchData = async () => {
      await fetchUsers();
      await fetchAllUsers();
      convertEnteteToBase64();
    };
    fetchData();
  }, [user?.LOGIN, page, limit, reclamant, notifier]);

    const fetchAllUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users`);
        setAllUsers(response.data);
      } catch (error) {
        console.error('Error fetching all users:', error);
        alert('Erreur lors de la récupération des utilisateurs.');
      }
    };
    const fetchFiles = async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/reclamationRH/filesget/${id}`);
      return response.data; // Return files to use in Promise.all
    } catch (error) {
      console.error('Error fetching files:', error);
      alert('Erreur lors de la récupération des fichiers.');
      return []; // Return empty array on error
    }
  };

    const fetchUsers = async () => {
      try {
        const params = {
          page,
          limit,
          // Apply userLogin for non-admin users if no filters are provided
          ...(reclamant ? { reclamant } : {}),
          ...(notifier ? { notifier } : {}),
          ...(!isAdminOrDirector && !reclamant && !notifier && user?.LOGIN ? { userLogin: user.LOGIN } : {}),
        };
        const response = await axios.get(`${BASE_URL}/api/statements`, { params });
        const statements = response.data.data;

        if (isAdminOrDirector) {
          setUsers(statements);
        }
        else {
          setUsers(statements);
        }
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching statements:', error);
        alert('Erreur lors de la récupération des réclamations.');
      }
    };

    const handleOpenDialog = async (userToEdit) => {
    if (userToEdit) {
      setEditing(true);
      setCurrentUser({
        ...userToEdit,
        DEMAND_TYPE: [userToEdit.DEMAND_TYPE],
      });
      setSelectedStatementId(userToEdit.ID);
      const files = await fetchFiles(userToEdit.ID); // Fetch files asynchronously
      setFiles(files); // Update files state with fetched data
    } else {
      setEditing(false);
      setCurrentUser({
        USER_NAME: user?.LOGIN || '',
        DEMAND_DATE: new Date().toISOString().slice(0, 16),
        DEMAND_TYPE: [],
        DESCRIPTION: '',
        STATE: 'En cours',
        ETAT: 'En cours',
        PAR: user.LOGIN,
        COMMENTAIRE: ''
      });
      setSelectedStatementId(null);
      setFiles([]); // Clear files for new entry
    }
    setOpenDialog(true);
  };

    const handleCloseDialog = () => {
      setOpenDialog(false);
      setCurrentUser({
        USER_NAME: '',
        DEMAND_DATE: '',
        DEMAND_TYPE: [],
        DESCRIPTION: '',
        STATE: '',
        ETAT: '',
        PAR: '',
        COMMENTAIRE: ''
      });
      setEditing(false);
    };

      const handleSaveUser = async () => {
    if (saving) return;
    setSaving(true);

    try {
      // Validation
      const requiredFields = ['USER_NAME', 'DEMAND_DATE', 'DEMAND_TYPE', 'DESCRIPTION'];
      const missingFields = requiredFields.filter(field =>
        field === 'DEMAND_TYPE'
          ? currentUser[field]?.length === 0
          : !currentUser[field]
      );

      if (missingFields.length > 0) {
        alert(`Veuillez remplir les champs suivants : ${missingFields.join(', ')}`);
        return;
      }

      const shouldUpdatePAR = !currentUser.PAR || currentUser.PAR === '';

      // Debug log – helps you see immediately how many requests will be sent
      console.log(
        `handleSaveUser → ${currentUser.DEMAND_TYPE.length} notifier(s) selected | mode: ${editing ? 'UPDATE' : 'CREATE'}`
      );

      // Prepare one request per selected DEMAND_TYPE (notifier)
      const requests = currentUser.DEMAND_TYPE.map((demandType) => {
        const requestData = {
          USER_NAME: currentUser.USER_NAME,
          DEMAND_DATE: new Date(currentUser.DEMAND_DATE),
          DEMAND_TYPE: demandType,
          DESCRIPTION: currentUser.DESCRIPTION,
          COMMENTAIRE: currentUser.COMMENTAIRE || '',
          STATE: editing ? currentUser.STATE : 'En cours',
          ETAT: editing ? currentUser.ETAT : 'En cours',
          PAR: shouldUpdatePAR ? user.LOGIN : currentUser.PAR,
        };

        if (user?.ROLE === 'administrateur') {
          requestData.DECISION = currentUser.DECISION || '';
        }

        // Use selectedStatementId when updating (safer than currentUser.ID)
        const statementId = editing ? selectedStatementId : null;

        const apiEndpoint = editing
          ? `${BASE_URL}/api/updateStatement/${statementId}`
          : `${BASE_URL}/api/createStatements`;

        // Clearer way: explicit method instead of dynamic axios[method]
        return axios({
          method: editing ? 'put' : 'post',
          url: apiEndpoint,
          data: requestData,
          timeout: 5000,
        });
      });

      // Wait for ALL requests to finish
      const responses = await Promise.all(requests);

      // Check if everything succeeded
      const allSuccessful = responses.every(
        (res) => res.status === 200 || res.status === 201
      );

      if (allSuccessful) {
        await fetchUsers();           // refresh list
        handleCloseDialog();
        alert(
          `Demande ${editing ? 'modifiée' : 'ajoutée'} avec succès pour tous les utilisateurs.`
        );
      } else {
        alert('Certaines demandes n’ont pas pu être enregistrées.');
      }
    } catch (error) {
      console.error('Error saving statement:', error);
      alert('Erreur lors de la sauvegarde de la demande.');
    } finally {
      setSaving(false);
    }
  };

    const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    console.log('Uploading file:', file, 'for ID:', selectedStatementId);
    if (!file) {
      alert('Veuillez sélectionner un fichier.');
      return;
    }
    if (!selectedStatementId) {
      alert('Aucun ID de réclamation sélectionné. Veuillez enregistrer la réclamation d\'abord.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${BASE_URL}/api/reclamationRH/filespost/${selectedStatementId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        const updatedFiles = await fetchFiles(selectedStatementId); // Fetch updated file list
        setFiles(updatedFiles); // Update state to trigger re-render
        alert('Fichier téléversé avec succès.');
      } else {
        throw new Error('Réponse inattendue du serveur.');
      }
    } catch (error) {
      console.error('Error uploading file:', error.response ? error.response.data : error.message);
      alert('Erreur lors du téléversement du fichier. Vérifiez la console pour plus de détails.');
    }
  };

    const handleFileDelete = async (fileName) => {
    try {
      await axios.delete(`${BASE_URL}/api/reclamationRH/files/${selectedStatementId}/${fileName}`);
      const updatedFiles = await fetchFiles(selectedStatementId); // Fetch updated file list
      setFiles(updatedFiles); // Update state to trigger re-render
      alert('Fichier supprimé avec succès.');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Erreur lors de la suppression du fichier.');
    }
  };

    const handleDownloadFile = (filePath) => {
      window.open(`${BASE_URL}/api/reclamationRH/openfile?path=${encodeURIComponent(filePath)}`, '_blank');
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

    const handlePrintClaim = (claim) => {
      if (!enteteBase64) {
        alert('L\'image d\'en-tête n\'est pas encore chargée.');
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
            padding: 20px;
          }
          .header-image {
            width: 100%;
            height: auto;
            object-fit: contain;
          }
          .content {
            padding: 20px;
            margin-top: -800px;
          }
          .claim-header {
            text-align: center;
            color: #ce362c;
            margin-bottom: 30px;
          }
          .claim-section {
            margin-bottom: 20px;
          }
          .claim-title {
            color: #0B4C69;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 2px solid #0B4C69;
            padding-bottom: 5px;
          }
          .claim-info {
            display: grid;
            grid-template-columns: 200px auto;
            gap: 10px;
            margin-bottom: 10px;
          }
          .label {
            font-weight: bold;
            color: #666;
          }
          .value {
            color: #333;
          }
          .status-chip {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 15px;
            color: white;
            fontWeight: bold;
          }
          .signatures {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            border-top: 1px solid #000;
            width: 200px;
            padding-top: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <img src="${enteteBase64}" alt="En-tête" class="header-image">
        <div class="content">
          <div class="claim-header">
            <h1>Détails de la Réclamation / Demande</h1>
          </div>

          <div class="claim-section">
            <div class="claim-title">Informations Générales</div>
            <div class="claim-info">
              <span class="label">Date de la demande:</span>
              <span class="value">${new Date(claim.DEMAND_DATE).toLocaleString()}</span>
              <span class="label">Réclamant:</span>
              <span class="value">${claim.USER_NAME}</span>
              <span class="label">Personne à notifier:</span>
              <span class="value">${claim.DEMAND_TYPE}</span>
            </div>
          </div>

          <div class="claim-section">
            <div class="claim-title">Description de la Réclamation</div>
            <div class="claim-info">
              <span class="label">Motif:</span>
              <span class="value">${claim.DESCRIPTION}</span>
            </div>
          </div>

          <div class="claim-section">
            <div class="claim-title">État et Suivi</div>
            <div class="claim-info">
              <span class="label">État de la réclamation:</span>
              <span class="value">
                <span class="status-chip" style="background-color: ${claim.ETAT === 'En cours' ? '#ff9800' :
          claim.ETAT === 'Récue' ? '#FFEB3B' :
            claim.ETAT === 'Terminée' ? '#4caf50' :
              claim.ETAT === 'Annulée' ? '#f44336' : '#grey'
        }">
                  ${claim.ETAT}
                </span>
              </span>
              <span class="label">Commentaire:</span>
              <span class="value">${claim.COMMENTAIRE || 'Aucun commentaire'}</span>
              <span class="label">Traité par:</span>
              <span class="value">${claim.PAR}</span>
            </div>
          </div>

          <div class="claim-section">
            <div class="claim-title">Décision Administrative</div>
            <div class="claim-info">
              <span class="label">État:</span>
              <span class="value">
                <span class="status-chip" style="background-color: ${claim.STATE === 'En cours' ? '#ff9800' :
          claim.STATE === 'Accepté' ? '#4caf50' :
            claim.STATE === 'Réfusé' ? '#f44336' : '#grey'
        }">
                  ${claim.STATE}
                </span>
              </span>
              <span class="label">Avis administratif:</span>
              <span class="value">${claim.DECISION || 'Aucun avis'}</span>
            </div>
          </div>

          <div class="signatures">
            <div class="signature-box">
              <div>Signature du Réclamant</div>
            </div>
            <div class="signature-box">
              <div>Signature Personne concernée</div>
            </div>
            <div class="signature-box">
              <div>Signature Administrative</div>
            </div>
          </div>
        </div>
      </body>
      </html>
      `;

      const printWindow = window.open('', 'Détails de la Réclamation');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          printWindow.onafterprint = () => printWindow.close();
        };
      }
    };

    const handlePrint = () => {
      if (!enteteBase64) {
        alert('L\'image d\'en-tête n\'est pas encore chargée.');
        return;
      }
      const printContent = `
        <html>
          <head>
            <title>Réclamation</title>
            <style>
              @media print {
                body { -webkit-print-color-adjust: exact; }
              }
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
              .header-image {
                width: 100%;
                max-height: 100%;
                object-fit: contain;
              }
              .content {
                padding: 20px;
                margin-top: -800px;
              }
              h1 { color: #ce362c; text-align: center; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #0B4C69; color: white; }
            </style>
          </head>
          <body>
            <img src="${enteteBase64}" alt="En-tête" class="header-image">
            <div class="content">
              <h1>Liste des réclamations</h1>
              <table>
                <thead>
                  <tr>
                    <th>Date demande</th>
                    <th>Utilisateur CRM</th>
                    <th>Personne</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  ${users.map(u => `
                    <tr>
                      <td>${new Date(u.DEMAND_DATE).toLocaleString()}</td>
                      <td>${u.USER_NAME}</td>
                      <td>${u.DEMAND_TYPE}</td>
                      <td>${u.DESCRIPTION}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open('', 'Liste des demandes d\'achat');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          printWindow.onafterprint = () => printWindow.close();
        };
      }
    };

    const handlePageChange = (event, value) => {
      setPage(value);
    };

    const handleLimitChange = (event) => {
      setLimit(parseInt(event.target.value));
      setPage(1); // Reset to first page when limit changes
    };

    const handleFilterChange = (field) => (event) => {
      const value = event.target.value; // Selected LOGIN or empty string
      const currentUserLogin = user?.LOGIN;

      if (!isAdminOrDirector) {
        // Non-admin users: apply logic as requested
        if (field === 'reclamant') {
          if (value === currentUserLogin) {
            // Réclamant is the current user → notifier becomes free (empty)
            setReclamant(value);
            setNotifier('');
          } else {
            // Réclamant is someone else → force notifier to current user
            setReclamant(value);
            setNotifier(currentUserLogin);
          }
        } else if (field === 'notifier') {
          if (value !== currentUserLogin) {
            // Notifier is someone else → force reclamant to current user
            setNotifier(value);
            setReclamant(currentUserLogin);
          } else {
            // Notifier is the current user → reclamant becomes free (empty)
            setNotifier(value);
            setReclamant('');
          }
        }
      } else {
        // Admin or Director: both filters are independent
        if (field === 'reclamant') {
          setReclamant(value);
        } else if (field === 'notifier') {
          setNotifier(value);
        }
      }

      // Reset to first page whenever filter changes
      setPage(1);
    };

    return (
      <>
        <Grid container spacing={3} sx={{ p: 3 }}>
          <Typography variant="h5" color="primary" fontWeight="bold">
            Gestion des Réclamations
          </Typography>
          <Grid item>
            <Stack direction="row" spacing={2}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Réclamant</InputLabel>
                <Select
                  value={reclamant}
                  onChange={handleFilterChange('reclamant')}
                  label="Réclamant"
                >
                  <MenuItem value="">Tous</MenuItem>
                  {allUsers.map((user) => (
                    <MenuItem key={user.ID} value={user.LOGIN}>
                      {user.UTILISATEUR} - {user.DEPARTEMENT}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Notificateur</InputLabel>
                <Select
                  value={notifier}
                  onChange={handleFilterChange('notifier')}
                  label="Notificateur"
                >
                  <MenuItem value="">Tous</MenuItem>
                  {allUsers.map((user) => (
                    <MenuItem key={user.ID} value={user.LOGIN}>
                      {user.UTILISATEUR} - {user.DEPARTEMENT}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Limite</InputLabel>
                <Select
                  value={limit}
                  onChange={handleLimitChange}
                  label="Limite"
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  backgroundColor: theme.palette.success.main,
                  '&:hover': { backgroundColor: theme.palette.success.dark }
                }}
              >
                Nouvelle Réclamation
              </Button>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  backgroundColor: theme.palette.info.main,
                  '&:hover': { backgroundColor: theme.palette.info.dark }
                }}
              >
                Imprimer
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N°</TableCell>
                <TableCell>Réclamant</TableCell>
                <TableCell>Date demande</TableCell>
                <TableCell>Personne à notifier</TableCell>
                <TableCell>Motif</TableCell>
                <TableCell>État</TableCell>
                <TableCell>Commentaire</TableCell>
                <TableCell>Réceveur</TableCell>
                <TableCell>Décision Administration</TableCell>
                <TableCell>Avis Administration</TableCell>
                <TableCell>Pièce Jointe</TableCell> {/* Moved before Actions */}
                <TableCell>Actions</TableCell> {/* Moved after Pièce Jointe */}
              </TableRow>
            </TableHead>
            <TableBody>
    {users?.length > 0 ? (
      users.map((user, index) => (
        <TableRow key={user.ID}>
          <TableCell>{(page - 1) * limit + index + 1}</TableCell>
          <TableCell>{user.USER_NAME}</TableCell>
          <TableCell>{new Date(user.DEMAND_DATE).toLocaleString()}</TableCell>
          <TableCell>{user.DEMAND_TYPE}</TableCell>
          <TableCell>{user.DESCRIPTION}</TableCell>
          <TableCell>
            <Chip
              label={user.ETAT}
              sx={{
                backgroundColor:
                  user.ETAT === 'En cours' ? theme.palette.warning.light :
                  user.ETAT === 'Récue' ? '#FFEB3B' :
                  user.ETAT === 'Terminée' ? theme.palette.success.light :
                  user.ETAT === 'Annulée' ? theme.palette.error.light :
                  theme.palette.grey[300],
                color:
                  user.ETAT === 'Annulée' || user.ETAT === 'Terminée'
                    ? theme.palette.common.white
                    : theme.palette.text.primary,
                fontWeight: 'bold',
              }}
            />
          </TableCell>
          <TableCell>{user.COMMENTAIRE}</TableCell>
          <TableCell color="primary">{user.PAR}</TableCell>
          <TableCell>
            <Chip
              label={user.STATE}
              sx={{
                backgroundColor:
                  user.STATE === 'En cours' ? theme.palette.warning.light :
                  user.STATE === 'Accepté' ? theme.palette.success.light :
                  user.STATE === 'Réfusé' ? theme.palette.error.light : '#grey',
                color:
                  user.STATE === 'Réfusé' ? theme.palette.common.white :
                  user.STATE === 'Accepté' ? theme.palette.common.white :
                  theme.palette.text.primary,
                fontWeight: 'bold',
              }}
            />
          </TableCell>
          <TableCell color="primary">{user.DECISION}</TableCell>
          <TableCell>
            <IconButton
              onClick={async () => {
                setSelectedStatementId(user.ID);
                const files = await fetchFiles(user.ID);
                setFiles(files);
                setFileDialogOpen(true);
              }}
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
          </TableCell>
          <TableCell>
            <IconButton onClick={() => handleOpenDialog(user)}><EditIcon /></IconButton>
            <IconButton onClick={() => handlePrintClaim(user)}><PrintIcon /></IconButton>
          </TableCell>
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={12} align="center">Aucune réclamation trouvée.</TableCell>
      </TableRow>
    )}
  </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>

      <Dialog
    open={openDialog}
    onClose={handleCloseDialog}
    maxWidth="md"
    fullWidth
  >
    <DialogTitle sx={{
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: 1
    }}>
      {editing ? <EditIcon /> : <AddIcon />}
      {editing ? 'Modifier la Réclamation' : 'Nouvelle Réclamation'}
    </DialogTitle>

    <DialogContent dividers>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Typography variant="h6" color="primary" gutterBottom>
            Informations de base
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nom Utilisateur"
            value={currentUser.USER_NAME}
            onChange={(e) => setCurrentUser({ ...currentUser, USER_NAME: e.target.value })}
            disabled={editing}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="notify-user-label">Utilisateur(s) à Notifier</InputLabel>
            <Select
              labelId="notify-user-label"
              multiple
              value={currentUser.DEMAND_TYPE}
              onChange={(e) => setCurrentUser({ ...currentUser, DEMAND_TYPE: e.target.value })}
              label="Utilisateur(s) à Notifier"
              renderValue={(selected) => selected.join(', ')}
              open={selectOpen}
              onOpen={() => setSelectOpen(true)}
              onClose={() => setSelectOpen(false)}
              disabled={editing}
              MenuProps={{
                PaperProps: { style: { maxHeight: 300 } },
                MenuListProps: { sx: { paddingBottom: 0 } },
                getContentAnchorEl: null,
                anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                transformOrigin: { vertical: 'top', horizontal: 'left' },
                componentsProps: { paper: { sx: { paddingBottom: 1 } } },
              }}
            >
              {allUsers.map((user) => (
                <MenuItem key={user.ID} value={user.LOGIN}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item><Avatar sx={{ bgcolor: theme.palette.primary.main, width: 24, height: 24 }}>{user.UTILISATEUR.charAt(0)}</Avatar></Grid>
                    <Grid item>{user.UTILISATEUR} - {user.DEPARTEMENT}</Grid>
                  </Grid>
                </MenuItem>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1, borderTop: '1px solid #ddd' }}>
                <Button variant="contained" color="primary" size="small" onClick={() => setSelectOpen(false)}>End</Button>
              </Box>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={currentUser.DESCRIPTION}
            onChange={(e) => setCurrentUser({ ...currentUser, DESCRIPTION: e.target.value })}
            multiline
            rows={4}
            variant="outlined"
            disabled={editing}
          />
        </Grid>
        {editing && (
          <>
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                État et commentaires
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>État</InputLabel>
                <Select value={currentUser.ETAT} onChange={(e) => setCurrentUser({ ...currentUser, ETAT: e.target.value })} label="État">
                  <MenuItem value="En cours">En cours</MenuItem>
                  <MenuItem value="Récue">Récue</MenuItem>
                  <MenuItem value="Terminée">Terminée</MenuItem>
                  <MenuItem value="Annulée">Annulée</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Commentaire"
                value={currentUser.COMMENTAIRE}
                onChange={(e) => setCurrentUser({ ...currentUser, COMMENTAIRE: e.target.value })}
                variant="outlined"
              />
            </Grid>
            {['administrateur', 'directeur commercial'].includes(user?.ROLE?.trim()) && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Décision administrative
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>État administratif</InputLabel>
                    <Select value={currentUser.STATE} onChange={(e) => setCurrentUser({ ...currentUser, STATE: e.target.value })} label="État administratif">
                      <MenuItem value="En cours">En cours</MenuItem>
                      <MenuItem value="Accepté">Accepté</MenuItem>
                      <MenuItem value="Réfusé">Réfusé</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Avis administratif"
                    value={currentUser.DECISION || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, DECISION: e.target.value })}
                    variant="outlined"
                  />
                </Grid>
              </>
            )}
          </>
        )}
        {editing && (
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom>
              Gestion de Fichier
            </Typography>
            <input
              type="file"
              accept=".pdf,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.doc,.docx,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="upload-file"
            />
            <label htmlFor="upload-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ backgroundColor: theme.palette.success.main, '&:hover': { backgroundColor: theme.palette.success.dark } }}
                disabled={!selectedStatementId}
              >
                Téléverser Fichier
              </Button>
            </label>
            {files.map((file, index) => (
              <Card key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography>{file.fileName}</Typography>
                <Box>
                  <IconButton
                    onClick={() => handleDownloadFile(file.filePath)}
                    color="info"
                    sx={{ ml: 1 }}
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleFileDelete(file.fileName)}
                    color="error"
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Grid>
        )}
      </Grid>
    </DialogContent>

    <DialogActions sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
      <Button
        onClick={handleCloseDialog}
        variant="outlined"
        startIcon={<CloseIcon />}
      >
        Annuler
      </Button>
      <Button
    onClick={handleSaveUser}
    variant="contained"
    startIcon={<SaveIcon />}
    color="primary"
    disabled={saving || !currentUser.DEMAND_TYPE?.length}   // extra safety
  >
    {saving ? 'Enregistrement...' : 'Enregistrer'}
  </Button>
    </DialogActions>
  </Dialog>
        <Dialog open={fileDialogOpen} onClose={() => setFileDialogOpen(false)} maxWidth="md" fullWidth>
    <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>Pièces Jointes</DialogTitle>
    <DialogContent>
      {files.length > 0 ? (
        files.map((file, index) => (
          <Card key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>{file.fileName}</Typography>
            <IconButton
              onClick={() => handleDownloadFile(file.filePath)}
              color="info"
              sx={{ ml: 2 }}
            >
              <DownloadIcon />
            </IconButton>
          </Card>
        ))
      ) : (
        <Typography sx={{ mt: 2 }}>Aucun fichier disponible</Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setFileDialogOpen(false)} variant="outlined">Fermer</Button>
    </DialogActions>
  </Dialog>
      </>
    );
  };

  export default Statements;
