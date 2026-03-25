import * as React from 'react';
import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import PropTypes from 'prop-types';

// Import your pages
import TachesFormPage from './TachesFormPage';
import Taches from './Taches';
import CompteRenduListPage from './CompteRenduListPage';

// Tab Panel Component
function CustomTabPanel({ value, index, children }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`main-tabpanel-${index}`}
      aria-labelledby={`main-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

// a11y helper
function a11yProps(index) {
  return {
    id: `main-tab-${index}`,
    'aria-controls': `main-tabpanel-${index}`,
  };
}

// Main Component
export default function CompteMain() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tabs Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Tâches Form" {...a11yProps(0)} />
          <Tab label="Tâches" {...a11yProps(1)} />
          <Tab label="Comptes Rendus" {...a11yProps(2)} />
        </Tabs>
      </Box>

      {/* Tab 1 */}
      <CustomTabPanel value={value} index={0}>
        <TachesFormPage />
      </CustomTabPanel>

      {/* Tab 2 */}
      <CustomTabPanel value={value} index={1}>
        <Taches />
      </CustomTabPanel>

      {/* Tab 3 */}
      <CustomTabPanel value={value} index={2}>
        <CompteRenduListPage />
      </CustomTabPanel>
    </Box>
  );
}
