import * as React from 'react';
import { useState, useEffect } from 'react';
import BASE_URL from '../Utilis/constantes';
import axios from 'axios';
import SupliersCommands from './SupliersCommands';
import Savmanagement from '../Sav/Savmanagement';
import BonTransfert from './BonTransfertMagasin';
import StorekeeperCommands from './StorekeeperCommands';
import StoreStock from './StoreStock';
import PropTypes from 'prop-types';
import SearchIcon from '@mui/icons-material/Search';
import {
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import ClientsIcon from '../icons/clients.png'
import ArticleMovementsList from '../Magasin/MouvementsArticles';

function CustomTabPanel({
  value,
  index,
  other,
  searchTerm,
  setSearchTerm,
  selectedOption,
}) {
  const [displayMode, setDisplayMode] = useState('card');
  const [dialogOpen, setDialogOpen] = useState(false)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [searchClient, setSearchClient] = useState('')
  const [open, setOpen] = useState(false);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/clientsCspdSearch`, {
        params: { page, pageSize, searchTerm: searchClient },
      });
      setClients(response.data.clients);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const handleDialogOpen = () => setDialogOpen(true);




  const renderSearchInput =
    (index === 0 || index === 1) && (
      <TextField
        variant="outlined"
        placeholder="Rechercher "
        value={searchTerm}
        onChange={handleSearchChange}
        InputProps={{
          endAdornment: (
            <IconButton>
              <SearchIcon />
            </IconButton>
          ),
        }}
        sx={{ width: "300px" }}
      />
    );


  const renderSelectClImage = (index === 2 && selectedOption === '3') ? (
    <TextField
      fullWidth
      value={selectedClient}
      onChange={(e) => setSelectedClient(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={handleDialogOpen}>
              <img src={ClientsIcon} alt="Clients Icon" style={{ height: '35px', width: '35px' }} />
            </IconButton>
          </InputAdornment>
        )
      }}
      variant="outlined"
      style={{ marginRight: '20px' }}
    />
  ) : null;


  const handleClickOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    fetchClients();
  }, [page, pageSize, searchClient]);


  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}

    >
      {value === index && (
        <Box sx={{ p: 3 }}>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "flex-end" }}>
              {renderSelectClImage}
              {renderSearchInput}
            </Box>
          </Box>

          {index === 0 && selectedOption === '0' && displayMode === 'card' && (
            <div></div>
          )}
          {index === 1 && selectedOption === '0' && displayMode === 'card' && (
            <div></div>
          )}
          {index === 2 && selectedOption === '0' && displayMode === 'card' && (
            <div></div>
          )}

          {index === 3 && selectedOption === '0' && displayMode === 'card' && (
            <div></div>
          )}
          {index === 4 && selectedOption === '0' && displayMode === 'card' && (
            <div></div>
          )}

          {index === 0 && displayMode === 'card' && (
            <StorekeeperCommands selectedClientType={"clientsCspd"} setOpen={handleClickOpen} displayMode={displayMode} searchTerm={searchTerm} />
          )}
          {index === 1 && displayMode === 'card' && (
            <SupliersCommands selectedClientType={"clientsCspd"} setOpen={handleClickOpen} displayMode={displayMode} searchTerm={searchTerm} />
          )}
          {index === 2 && displayMode === 'card' && (
            <StoreStock selectedClientType={"clientsCspd"} setOpen={handleClickOpen} displayMode={displayMode} />
          )}
          {index === 3 && displayMode === 'card' && (
            <Savmanagement selectedClientType={"clientsCspd"} setOpen={handleClickOpen} displayMode={displayMode} />
          )}
          {index === 4 && displayMode === 'card' && (
            <BonTransfert selectedClientType={"clientsCspd"} setOpen={handleClickOpen} displayMode={displayMode} />
          )}
          {index === 5 && displayMode === 'card' && (
            <ArticleMovementsList selectedClientType={"clientsCspd"} setOpen={handleClickOpen} displayMode={displayMode} />
          )}
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default function BasicTabs({ searchTerm, setSearchTerm, selectedOption, setSelectedOption, value, setValue, }) {
  const handleChange = (newValue) => {
    console.log("value", newValue)
    setValue(newValue)
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={(e, newValue) => handleChange(newValue)} aria-label="basic tabs example">
          <Tab label="Clients Cspd" {...a11yProps(0)} />
          <Tab label="Fournisseur" {...a11yProps(0)} />
          <Tab label="Stock magasin" {...a11yProps(0)} />
          <Tab label="Sav" {...a11yProps(0)} />
          <Tab label="bon de transfert" {...a11yProps(0)} />
          <Tab label="Entrés / sorties" {...a11yProps(0)} />

        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      <CustomTabPanel value={value} index={1} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      <CustomTabPanel value={value} index={2} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      <CustomTabPanel value={value} index={3} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      <CustomTabPanel value={value} index={4} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      <CustomTabPanel value={value} index={5} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />


    </Box>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
