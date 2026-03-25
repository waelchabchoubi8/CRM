import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClientsIcon from '../icons/addClient.png'
import axios from 'axios';
import BASE_URL from '../Utilis/constantes';
const ClientsSearch = ({  onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    if (searchTerm) {
      axios.get(`${BASE_URL}/clientsCspdSearch`, { params: { searchTerm } })
        .then(response => {
          setClients(response.data.clients);
        })
        .catch(error => {
          console.error('Failed to fetch clients:', error);
        });
    }
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
  };

  const handleConfirmSelection = () => {
    if (selectedClient) {
      onSelectClient(selectedClient.CODE_CLIENT);
    }
  }; 

  return (
    <Box>
      <IconButton onClick={() => setSearchTerm('')}>
        <img src={ClientsIcon} alt="Clients Icon" />
      </IconButton>
      {searchTerm !== '' && (
        <Box>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <IconButton>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code Client</TableCell>
                  <TableCell>Intitulé Client</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow
                    key={client.CODE_CLIENT}
                    hover
                    onClick={() => handleSelectClient(client)}
                    selected={selectedClient?.CODE_CLIENT === client.CODE_CLIENT}
                  >
                    <TableCell>{client.CODE_CLIENT}</TableCell>
                    <TableCell>{client.INTITULE_CLIENT}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmSelection}
            disabled={!selectedClient}
            sx={{ mt: 2 }}
          >
            Sélectionner
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ClientsSearch;
