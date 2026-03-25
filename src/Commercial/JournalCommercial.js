

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
  Box, 
  Typography,
  useTheme,
  Select,
  MenuItem
} from '@mui/material';
import BASE_URL from '../Utilis/constantes';
import { useSelector } from 'react-redux';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import PhoneForwardedIcon from '@mui/icons-material/PhoneForwarded';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';


const JournalCommercial = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [communications, setCommunications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [passagerNum, setPassagerNum] = useState('');

  const [users, setUsers] = useState([]);
  const user = useSelector((state) => state.user);
  const theme = useTheme();

  const isAdmin = user?.ROLE === "administrateur" ;

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    } else {
      setSearchTerm({ LOGIN: user?.LOGIN, UTILISATEUR: user?.UTILISATEUR });
    }
  }, [user, isAdmin]);

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
    const searchQuery = isAdmin ? searchTerm.LOGIN : user?.LOGIN;

    // NEW: shift both dates by -1 hour before sending to API
    const duShifted = shiftDateForPayload(startDate);
    const auShifted = shiftDateForPayload(endDate);

    try {
      const response = await axios.get(`${BASE_URL}/api/communicationsByPeriod`, {
        params: {
          du: duShifted,
          au: auShifted,
          searchTerm: searchQuery,
            passagerNum: passagerNum || undefined,
        }
      });
      setCommunications(response.data);
    } catch (error) {
      console.error('Error fetching communications:', error);
    }
  }
};


  const shiftDateForPayload = (value) => {
  if (!value) return '';
  const d = new Date(value);
  d.setHours(d.getHours() - 1); // -1 hour

  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  // keep same style as datetime-local: YYYY-MM-DDTHH:mm
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// NEW: format date from API with +1 hour (for table & print)
const formatDateWithOffset = (value) => {
  if (!value) return '';
  const d = new Date(value); // 07:34Z -> 08:34 in Tunis automatically
  return d.toLocaleString();
};

// NEW: print all table data with +1h on dates (same as table)
const handlePrint = () => {
  if (!communications || communications.length === 0) {
    window.alert("Aucune donnée à imprimer.");
    return;
  }

  const rowsHtml = communications.map((comm) => {
    const date = formatDateWithOffset(
      comm.DATE_COMMUNICATION || comm.CALL_DATE
    );

    const typeAppel = comm.COLLABORATOR
      ? (comm.TYPE_APPEL || "Inconnue")
      : comm.TYPE_APPEL;

    const collaborateur = comm.COLLABORATOR || comm.UTILISATEUR;

    const contact = comm.COLLABORATOR
  ? (comm.NOM_CLIENT 
      ? `${comm.NOM_CLIENT} (${comm.SCHEMA || '?'})` 
      : (comm.PARTENAIRE || comm.CLIENT_NAME || ''))
  : (comm.PARTENAIRE
      ? `Par: ${comm.PARTENAIRE}`
      : `Inv: ${comm.INVESTISSEUR || comm.CLIENT_NAME || ''}`);

    const raison = comm.RAISON || "";
    const status = comm.QUALIFICATION || "Consultation client";
const passager = comm.PASSAGER_NUM ?? '-';
const description =
  comm.DETAILS_COMMUNICATION || comm.DESCRIPTION || "";

return `
  <tr>
    <td>${date}</td>
    <td>${typeAppel || ""}</td>
    <td>${collaborateur || ""}</td>
    <td>${contact}</td>
    <td>${raison}</td>
    <td>${status}</td>
    <td>${passager}</td>
    <td>${description}</td>
  </tr>
`;

  }).join("");

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>Journal des Appels</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 16px;
          }
          h2 {
            text-align: center;
            margin-bottom: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          th {
            background: #1976d2;
            color: white;
            text-align: left;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
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




  const renderTableRow = (comm) => {
    if (comm.COLLABORATOR) {
      return (
      <TableRow key={comm.ID}>
        <TableCell>
          {formatDateWithOffset(comm.DATE_COMMUNICATION || comm.CALL_DATE)}
        </TableCell>
          <TableCell style={{ alignItems: "center", display: "flex" }}>
            <PhoneCallbackIcon sx={{ mr: 1, color: "blue" }} />
            {comm.TYPE_APPEL || "Inconnue"}
          </TableCell>
          <TableCell>{comm.COLLABORATOR}</TableCell>
<TableCell>
  {comm.NOM_CLIENT 
    ? `${comm.NOM_CLIENT} (${comm.SCHEMA || '?'})` 
    : (comm.PARTENAIRE || comm.CLIENT_NAME || '')}
</TableCell>          <TableCell>{comm.RAISON}</TableCell>
          <TableCell>{comm.QUALIFICATION || "Consultation client"}</TableCell>
          <TableCell>{comm.PASSAGER_NUM ?? '-'}</TableCell>

          <TableCell>{comm.DETAILS_COMMUNICATION || comm.DESCRIPTION}</TableCell>
        </TableRow>
      );
    }

    return (
      <TableRow key={comm.id}>
      <TableCell>
        {formatDateWithOffset(comm.DATE_COMMUNICATION)}
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
        <TableCell>{comm.PASSAGER_NUM ?? '-'}</TableCell>

        <TableCell>{comm.DETAILS_COMMUNICATION}</TableCell>
      </TableRow>
    );
  };

  return (
    <Paper style={{ padding: 16 }}>
 <Typography
  variant="h5"
  color="primary"
  sx={{ mb: 2, fontWeight: 600 }}
>
  Mon Journal des Appels
</Typography>

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
      display: "flex",
      alignItems: "center",
      gap: 2,
      flexWrap: "wrap"
    }}
  >
    <TextField
      label="Date de début"
      type="datetime-local"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      InputLabelProps={{ shrink: true }}
      size="small"
    />

    <TextField
      label="Date de fin"
      type="datetime-local"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      InputLabelProps={{ shrink: true }}
      size="small"
    />

    <TextField
      label="Numéro Passager"
      value={passagerNum}
      onChange={(e) =>
        setPassagerNum(e.target.value.replace(/\D/g, ''))
      }
      size="small"
      sx={{ width: 200 }}
    />

    {isAdmin ? (
      <Select
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        sx={{ width: 250 }}
      >
        {users?.map((raison) => (
          <MenuItem
            key={raison.ID_UTILISATEUR}
            value={raison}
          >
            {raison.UTILISATEUR}
          </MenuItem>
        ))}
      </Select>
    ) : (
      <TextField
        disabled
        value={user?.UTILISATEUR || ''}
        size="small"
        sx={{ width: 250 }}
      />
    )}

    <Button
      variant="contained"
      onClick={handleSearch}
      sx={{
        fontWeight: 600,
        textTransform: "none"
      }}
    >
      Résultat
    </Button>

    <Button
      variant="outlined"
      onClick={handlePrint}
      sx={{
        fontWeight: 600,
        textTransform: "none"
      }}
    >
      Imprimer tout
    </Button>
  </Box>
</Paper>

      <TableContainer component={Paper} style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              {['Date', "Type d'appel", 'Collaborateur', 'Contact', 'Raison', 'Status', 'Passager', 'Description'].map((header) => (
  <TableCell
    key={header}
    sx={{
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      fontWeight: 'bold',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    }}
  >
    {header}
  </TableCell>
))}

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

export default JournalCommercial;
