import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Select,
  MenuItem
} from '@mui/material';
import BASE_URL from '../Utilis/constantes';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import { useSelector } from 'react-redux';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import PhoneForwardedIcon from '@mui/icons-material/PhoneForwarded';
const ALL_USERS = "ALL_USERS";


const CallsJournal = () => {
  const [startDate, setStartDate] = useState('');
  const [passagerNum, setPassagerNum] = useState(''); 
  const [endDate, setEndDate] = useState('');
  const [communications, setCommunications] = useState([]);
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([]); // array of user objects
const [usersMode, setUsersMode] = useState(ALL_USERS);  // ALL_USERS or "CUSTOM"


  const user = useSelector((state) => state.user)
  const theme = useTheme();

  // NEW: print all table data
const handlePrint = () => {
  if (!communications || communications.length === 0) {
    window.alert('Aucune donnée à imprimer.');
    return;
  }



  const rowsHtml = communications.map((comm) => {
    const date = formatDateWithOffset(comm.DATE_COMMUNICATION || comm.CALL_DATE);

    const typeAppel = comm.COLLABORATOR
      ? (comm.TYPE_APPEL || 'Inconnu')
      : comm.TYPE_APPEL;

    const collaborateur = comm.COLLABORATOR || comm.UTILISATEUR;

    const contact = comm.COLLABORATOR
  ? (comm.NOM_CLIENT 
      ? `${comm.NOM_CLIENT} (${comm.SCHEMA || '?'})` 
      : (comm.CLIENT_NAME || ''))
  : (comm.PARTENAIRE
      ? `Par: ${comm.PARTENAIRE}`
      : `Inv: ${comm.INVESTISSEUR || ''}`);

    const raison = comm.RAISON || '';
    const status = comm.QUALIFICATION || 'Consultation client';
    const description = comm.DETAILS_COMMUNICATION || comm.DESCRIPTION || '';

    const passager = comm.PASSAGER_NUM ?? '-';
return `
  <tr>
    <td>${date}</td>
    <td>${typeAppel || ''}</td>
    <td>${collaborateur || ''}</td>
    <td>${contact || ''}</td>
    <td>${raison}</td>
    <td>${status}</td>
    <td>${passager}</td>
    <td>${description}</td>
  </tr>
`;

  }).join('');

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Journal des Appels</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          th { background: #1976d2; color: white; text-align: left; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h2>Journal des Appels</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type d'appel</th>
              <th>Collaborateur</th>
              <th>Contact</th>
              <th>Raison</th>
              <th>Status</th>
              <th>Numéro Passager</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearch = async () => {
  if (startDate && endDate) {
    const duShifted = shiftDateForPayload(startDate);
    const auShifted = shiftDateForPayload(endDate);

    const params = {
      du: duShifted,
      au: auShifted,
    };

    // Users filter
    if (usersMode !== ALL_USERS && selectedUsers.length > 0) {
      params.searchTerm = selectedUsers.map(u => u.LOGIN).join(',');
    }

    // Always send passagerNum (if not empty)
    if (passagerNum) {
      params.passagerNum = passagerNum;
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/communicationsByPeriod`, {
        params,
      });
      setCommunications(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des communications:', error);
    }
  }
};






  const isAdmin = user?.ROLE === "administrateur";

const shiftDateForPayload = (value) => {
  if (!value) return '';
  const d = new Date(value);
  d.setHours(d.getHours() - 1);

  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};


const formatDateWithOffset = (value) => {
  if (!value) return '';
  const d = new Date(value); 
  return d.toLocaleString();
};

  const renderTableRow = (comm) => {
    if (comm.COLLABORATOR) {
      return (
        <TableRow key={comm.ID}>
          <TableCell>
        {formatDateWithOffset(comm.DATE_COMMUNICATION || comm.CALL_DATE)}
      </TableCell>
          <TableCell style={{ alignItems: "center", display: "flex" }}>
            <PhoneCallbackIcon sx={{ mr: 1, color: "blue" }} />
            {comm.TYPE_APPEL || "Inconnu"}
          </TableCell>
          <TableCell>{comm.COLLABORATOR}</TableCell>
          <TableCell>
  {comm.NOM_CLIENT 
    ? `${comm.NOM_CLIENT} (${comm.SCHEMA || '?'})` 
    : (comm.PARTENAIRE || comm.CLIENT_NAME || '')}
</TableCell>
          <TableCell>{comm.RAISON}</TableCell>
          <TableCell>{comm.QUALIFICATION || "Consultation client"
          }</TableCell>
          <TableCell>{comm.PASSAGER_NUM ?? '-'}</TableCell>

          <TableCell>{comm.DETAILS_COMMUNICATION || comm.DESCRIPTION
          }</TableCell>
        </TableRow>
      );
    }

    return (
      <TableRow key={comm.id}>
        <TableCell>
      {formatDateWithOffset(comm.DATE_COMMUNICATION || comm.CALL_DATE)}
    </TableCell>
        <TableCell style={{ alignItems: "center", display: "flex" }}>
          {comm.TYPE_APPEL === "appel entrant" ? (
            <PhoneForwardedIcon sx={{ mr: 1, color: "green" }} />
          ) : (
            <PhoneCallbackIcon sx={{ mr: 1, color: "blue" }} />
          )}
          {comm.TYPE_APPEL}
        </TableCell>
        <TableCell>{comm.UTILISATEUR}</TableCell>
<TableCell>
  {comm.PARTENAIRE 
    ? `Par: ${comm.PARTENAIRE}`
    : (comm.NOM_CLIENT 
        ? `${comm.NOM_CLIENT} (${comm.SCHEMA || '?'})` 
        : `Inv: ${comm.INVESTISSEUR || comm.CLIENT_NAME || ''}`)}
</TableCell>        <TableCell>{comm.RAISON}</TableCell>
        <TableCell>{comm.QUALIFICATION}</TableCell>
        <TableCell>{comm.DETAILS_COMMUNICATION}</TableCell>
      </TableRow>
    );
  };

  return (
    <Paper style={{ padding: 16 }}>
      <h2>Journal des Appels</h2>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
        <TextField
          label="Date de début"
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          style={{ marginRight: 16 }}
        />
        <TextField
          label="Date de fin"
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          style={{ marginRight: 16 }}
        />
        <TextField
  label="Numéro Passager"
  type="text"
  value={passagerNum}
  onChange={(e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setPassagerNum(digitsOnly);
  }}
  style={{ marginLeft: 16 }}
/>
        <>
        
          <Select
  multiple
  value={usersMode === ALL_USERS ? [ALL_USERS] : selectedUsers}
  onChange={(e) => {
    const value = e.target.value;

    // If user clicked "Tous les utilisateurs"
    if (value.includes(ALL_USERS)) {
      setUsersMode(ALL_USERS);
      setSelectedUsers([]);
      return;
    }

    // Otherwise custom multi selection
    setUsersMode("CUSTOM");
    setSelectedUsers(value);
  }}
  renderValue={(selected) => {
    if (usersMode === ALL_USERS) return "Tous les utilisateurs";
    if (!selected || selected.length === 0) return "Choisir utilisateur(s)";
    return selected.map(u => u.UTILISATEUR).join(", ");
  }}
  style={{ width: "300px" }}
>
  {/* ✅ "Tous les utilisateurs" option */}
  <MenuItem value={ALL_USERS}>
    <Checkbox checked={usersMode === ALL_USERS} />
    <ListItemText primary="Tous les utilisateurs" />
  </MenuItem>

  {/* ✅ Users list */}
  {users?.map((u) => (
    <MenuItem key={u.ID_UTILISATEUR} value={u} disabled={usersMode === ALL_USERS}>
      <Checkbox
        checked={selectedUsers.some(x => x.ID_UTILISATEUR === u.ID_UTILISATEUR)}
      />
      <ListItemText primary={u.UTILISATEUR} />
    </MenuItem>
  ))}
</Select>


        </>

        <Button 
  variant="contained" 
  color="primary" 
  onClick={handleSearch} 
  style={{ marginLeft: 16 }}
>
  Résultat
</Button>

<Button
  variant="outlined"
  onClick={handlePrint}
  style={{ marginLeft: 8 }}
>
  Imprimer tout
</Button>
      </div>
      <TableContainer component={Paper} style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
                fontWeight: 'bold',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              }}>Date</TableCell>
              <TableCell sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
                fontWeight: 'bold',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              }}>Type d'appel</TableCell>
              <TableCell sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
                fontWeight: 'bold',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              }}>Collaborateur</TableCell>
              <TableCell sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
                fontWeight: 'bold',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              }}>Contact</TableCell>
              <TableCell sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
                fontWeight: 'bold',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              }}>Raison</TableCell>
              <TableCell sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
                fontWeight: 'bold',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              }}>Status</TableCell>
              <TableCell sx={{
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
  borderBottom: '1px solid rgba(224, 224, 224, 1)',
}}>Numéro Passager</TableCell>
              <TableCell sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
                fontWeight: 'bold',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {communications.map((comm) => renderTableRow(comm))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default CallsJournal;
