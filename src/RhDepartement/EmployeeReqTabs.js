import * as React from 'react';
import { useState, useEffect } from 'react';
import BASE_URL from '../Utilis/constantes';
import axios from 'axios';
import EmployeeRequests from './EmployeeRequests';
import Statements from './statements';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

function CustomTabPanel({
  value,
  index,
  other,
  searchTerm,
  selectedOption,
}) {
  const [displayMode, setDisplayMode] = useState('card');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [clients, setClients] = useState([]);
  const [searchClient, setSearchClient] = useState('')
  const [open, setOpen] = useState(false);
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
            </Box>
          </Box>

          {index === 0 && selectedOption === '0' && displayMode === 'card' && (
            <div></div>
          )}
          {index === 1 && selectedOption === '0' && displayMode === 'card' && (
            <div></div>
          )}
          {index === 0 && displayMode === 'card' && (
            <EmployeeRequests selectedClientType={"clientsCspd"} setOpen={handleClickOpen} displayMode={displayMode} searchTerm={searchTerm} />
          )}
          {index === 1 && displayMode === 'card' && (
            <Statements selectedClientType={"clientsCspd"} setOpen={handleClickOpen} displayMode={displayMode} searchTerm={searchTerm} />
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

export default function BasicTabs() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="demandes" {...a11yProps(0)} />
          <Tab label="Réclamations maintenance" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0} />
      <CustomTabPanel value={value} index={1} />
    </Box>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
