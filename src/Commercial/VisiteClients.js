import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Print as PrintIcon } from '@mui/icons-material';

import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Chip,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

const EditDialog = ({ open, visit, onClose, onSave }) => {
  const [editedVisit, setEditedVisit] = useState(visit);

  useEffect(() => {
    setEditedVisit(visit);
  }, [visit]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setEditedVisit((prev) => ({
      ...prev,
      [name]: name === "TERMINER" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = () => {
    onSave(editedVisit);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Modifier le résultat de la visite</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Résultat"
              name="RESULT"
              value={editedVisit?.RESULT || ""}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedVisit?.TERMINER === 1}
                  onChange={handleChange}
                  name="TERMINER"
                />
              }
              label={
                editedVisit?.TERMINER === 1 ? "Visite terminée" : "Visite en cours"
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const VisitesClients = () => {
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVisit, setCurrentVisit] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const connectedUser = useSelector((state) => state.user);
  console.log("Connected User Data:", connectedUser);
  console.log("Connected User Role:", connectedUser?.ROLE);
  const [newVisit, setNewVisit] = useState({
    nom_client: "",
    commercial: "",
    visite_date: "",
    demande: "",
    description: "",
    validation: 0,  // Use 0 instead of false
    TERMINER: 0,    // Consistent with backend expectations
  });
  const canValidateVisit = (user) => {
    console.log('Current User:', user);
    console.log('User Role:', user?.ROLE);
    
    if (!user || !user.ROLE) return false;
    const allowedRoles = ['administrateur', 'directeur commercial '];
    return allowedRoles.includes(user.ROLE.toLowerCase());
  };
  

  const API_BASE_URL = "http://192.168.1.170:3300/api/visites";
  const handlePrint = (visit) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport de Visite - ${visit.NOM_CLIENT}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #1976d2;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 15px;
          }
          .title {
            color: #1976d2;
            font-size: 24px;
            margin: 0;
          }
          .info-section {
            margin-bottom: 30px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .info-item {
            border: 1px solid #e0e0e0;
            padding: 15px;
            border-radius: 4px;
          }
          .label {
            font-weight: bold;
            color: #666;
            margin-bottom: 5px;
          }
          .value {
            color: #333;
          }
          .status-chip {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 14px;
            font-weight: bold;
          }
          .status-success {
            background-color: #e8f5e9;
            color: #2e7d32;
          }
          .status-warning {
            background-color: #fff3e0;
            color: #f57c00;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/your-logo.png" alt="Logo" class="logo" />
          <h1 class="title">Rapport de Visite Client</h1>
          <p>Référence: VIS-${visit.ID}</p>
        </div>
  
        <div class="info-section">
          <div class="info-grid">
            <div class="info-item">
              <div class="label">Client</div>
              <div class="value">${visit.NOM_CLIENT}</div>
            </div>
            <div class="info-item">
              <div class="label">Commercial</div>
              <div class="value">${visit.COMMERCIAL}</div>
            </div>
            <div class="info-item">
              <div class="label">Date de visite</div>
              <div class="value">${new Date(visit.VISITE_DATE).toLocaleString()}</div>
            </div>
            <div class="info-item">
              <div class="label">Type de demande</div>
              <div class="value">${visit.DEMANDE}</div>
            </div>
          </div>
        </div>
  
        <div class="info-section">
          <div class="info-item">
            <div class="label">Description</div>
            <div class="value">${visit.DESCRIPTION || 'Non spécifié'}</div>
          </div>
        </div>
  
        <div class="info-section">
          <div class="info-item">
            <div class="label">Résultat</div>
            <div class="value">${visit.RESULT || 'Non spécifié'}</div>
          </div>
        </div>
  
        <div class="info-section">
          <div class="info-grid">
            <div class="info-item">
              <div class="label">Statut</div>
              <div class="value">
                <span class="status-chip ${visit.TERMINER === 1 ? 'status-success' : 'status-warning'}">
                  ${visit.TERMINER === 1 ? 'Terminé' : 'En cours'}
                </span>
              </div>
            </div>
            <div class="info-item">
              <div class="label">Validation</div>
              <div class="value">
                <span class="status-chip ${visit.VALIDATION === 1 ? 'status-success' : 'status-warning'}">
                  ${visit.VALIDATION === 1 ? 'Validé' : 'Non validé'}
                </span>
              </div>
            </div>
          </div>
        </div>
  
        <div class="footer">
          <p>Document généré le ${new Date().toLocaleString()}</p>
          <p>CSPD - Gestion des Visites Clients</p>
        </div>
      </body>
      </html>
    `;
  
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  
  
  const loadVisits = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE_URL, { credentials: "include" });
      const data = await response.json();
      setVisits(data);
    } catch (error) {
      console.error("Loading error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNewVisit((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleValidation = async (visitId, currentValidation) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${visitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          VALIDATION: currentValidation === 1 ? 0 : 1, // Ensure numeric toggle
        }),
      });
  
      if (response.ok) {
        await loadVisits(); // Refresh data
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const visitData = {
        ...newVisit,
        validation: newVisit.validation ? 1 : 0,  // Convert boolean to 0/1
      };
  
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(visitData),
      });
  
      if (response.ok) {
        await loadVisits();
        resetForm();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error adding visit:", error);
    }
  };
  
  
  const resetForm = () => {
    setNewVisit({
      nom_client: "",
      commercial: "",
      visite_date: "",
      demande: "",
      description: "",
      validation: false,
    });
  };

  const handleEdit = (visit) => {
    if (visit.TERMINER === 1) {
      alert("Cette visite est terminée. Vous ne pouvez plus la modifier.");
      return;
    }
    setCurrentVisit(visit);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êêtes-vous sûr de vouloir supprimer cette visite?")) {
      try {
        await fetch(`${API_BASE_URL}/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        loadVisits();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleSaveEdit = async (editedVisit) => {
    try {
      await fetch(`${API_BASE_URL}/${editedVisit.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editedVisit),
      });
      await loadVisits();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Edit error:", error);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  const styles = {
    form: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      mt: 3,
    },
  };

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Card elevation={3}>
          <CardContent>
           <Paper
  elevation={3}
  sx={{
    p: 3,
    borderRadius: 3,
    mb: 3
  }}
>
  <Grid
    container
    justifyContent="space-between"
    alignItems="center"
  >
    <Typography
      variant="h5"
      sx={{ fontWeight: 600 }}
      color="primary"
    >
      Gestion des Visites Clients
    </Typography>

    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => setShowAddForm(!showAddForm)}
      sx={{
        textTransform: "none",
        fontWeight: 600
      }}
    >
      {showAddForm ? "Masquer" : "Nouvelle Visite"}
    </Button>
  </Grid>
</Paper>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
  <TableRow
    sx={{
      backgroundColor: (theme) => theme.palette.primary.main
    }}
  >
    {[
      "Client",
      "Commercial",
      "Date",
      "Demande",
      "Validation",
      "Statut",
      "Actions"
    ].map((headCell) => (
      <TableCell
        key={headCell}
        sx={{
          color: (theme) => theme.palette.primary.contrastText,
          fontWeight: 700,
          fontSize: '0.95rem'
        }}
      >
        {headCell}
      </TableCell>
    ))}
  </TableRow>
</TableHead>

                <TableBody>
                  {visits.map((visit) => (
                    <TableRow key={visit.ID}>
                      <TableCell>{visit.NOM_CLIENT}</TableCell>
                      <TableCell>{visit.COMMERCIAL}</TableCell>
                      <TableCell>{new Date(visit.VISITE_DATE).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={visit.DEMANDE} color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
  {canValidateVisit(connectedUser) ? (
    <Switch
      checked={visit.VALIDATION === 1}
      onChange={() => handleValidation(visit.ID, visit.VALIDATION)}
      disabled={visit.TERMINER === 1}
    />
  ) : (
    <Chip
      label={visit.VALIDATION === 1 ? "Validé" : "Non validé"}
      color={visit.VALIDATION === 1 ? "success" : "warning"}
      variant="outlined"
    />
  )}
</TableCell>
                      <TableCell>
                        <Chip
                          label={visit.TERMINER === 1 ? "Terminé" : "En cours"}
                          color={visit.TERMINER === 1 ? "success" : "warning"}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(visit)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(visit.ID)} color="error">
                          <DeleteIcon />
                        </IconButton>
                        <IconButton onClick={() => handlePrint(visit)} color="secondary">
    <PrintIcon />
  </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {showAddForm && (
          <Box component="form" sx={styles.form} onSubmit={handleSubmit}>
            <Typography variant="h6">Ajouter une nouvelle visite</Typography>
            <TextField
              label="Nom du client"
              name="nom_client"
              fullWidth
              value={newVisit.nom_client}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Commercial"
              name="commercial"
              fullWidth
              value={newVisit.commercial}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Date de visite"
              name="visite_date"
              type="datetime-local"
              fullWidth
              value={newVisit.visite_date}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Demande</InputLabel>
              <Select
                name="demande"
                value={newVisit.demande}
                onChange={handleInputChange}
                required
              >
                {[
                  "Installation",
                  "Maintenance",
                  "Formation",
                  "Support technique",
                  "Consultation",
                  "Démonstration",
                  "Autre",
                ].map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Description"
              name="description"
              multiline
              rows={4}
              fullWidth
              value={newVisit.description}
              onChange={handleInputChange}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newVisit.validation}
                  onChange={handleInputChange}
                  name="validation"
                />
              }
              label="Validation"
            />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
              Ajouter la visite
            </Button>
            <Button onClick={resetForm} color="inherit" sx={{ mt: 2 }}>
              Annuler
            </Button>
          </Box>
        )}

        {isDialogOpen && (
          <EditDialog
            open={isDialogOpen}
            visit={currentVisit}
            onClose={() => setIsDialogOpen(false)}
            onSave={handleSaveEdit}
          />
        )}
      </Box>
    </Container>
  );
};

export default VisitesClients;