import * as React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CardFamille from './cardFamille';
import CardFamilleCSPD from './cardFamilledamakCSPD'
import CommandesList from '../CSPD/CommandesEncours';
import Savmanagement from '../../Sav/Savmanagement';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import {
  TextField,
  IconButton,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Paper,
  TableContainer,
  InputAdornment,
} from '@mui/material';
import Stock from '../Stock'
import BASE_URL from '../../Utilis/constantes';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import annulerIcon from '../../icons/annuler.png'
import checkIcon from '../../icons/check.png'
import ClientsIcon from '../../icons/addClient.png'

function CustomTabPanel({
  value,
  index,
  searchTerm,
  setSearchTerm,
  selectedOption,
  setSelectedOption,
  setNumber, }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [repres, setRepres] = useState([])
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedAvancement, setSelectedAvancement] = React.useState('');
  const [selectedTri, setSelectedTri] = React.useState('');
  const [selectedRotation, setSelectedRotation] = React.useState('');
  const [selectedClient, setSelectedClient] = React.useState(null);
  const [selectedClientFdm, setSelectedClientFdm] = React.useState(null);

  const [clients, setClients] = useState([]);
  const [clientsFdm, setClientsFdm] = useState([]);

  const [searchClient, setSearchClient] = useState('')
  const [assignedList, setAssignedList] = useState('')
  const handleClickOpen = () => {
    setOpen(true);
    fetchUsers();
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setPage(0);
  };
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tot, setTot] = useState({ typeCli: '', nbr: 0 })
  const [displayMode, setDisplayMode] = React.useState('card');
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users`);
      setUsers(response.data);
      
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  useEffect(() => {
    setNumber(tot.typeCli, tot.nbr)
  }, [tot])
  useEffect(() => {
    fetchUsers();
  }, []);
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    setSearchTerm('');
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);

  };



  {/*const renderSearchInputs = (
    <div style={{marginLeft:'20px', marginTop:'-5PX'}}> 
       <LocalizationProvider dateAdapter={AdapterDayjs} >
      <DemoContainer components={['DatePicker']}>
      <DatePicker 
        label="Sélectionner une date"
        value={selectedDate}
        onChange={handleDateChange}
        renderInput={(params) => <TextField {...params} sx={{ width: '300px' }} />}
      /> 
      </DemoContainer>
    </LocalizationProvider>
    </div>
  );*/}
  const avancementOptions = [
    'En cours',
    'Accepter par collaborateur',
    'Refuser',
    'Injoignable',
    'Contrat signé',
    'En cours de signature',
    'Injoignable pour signature',
    'A rappeler'
  ];
  const triOptions = [
    'A->Z',
    'Nbr jours',

  ];
  const rotationOptions = [
    'rotation élevée',
    'rotation moyenne',
    'faible rotation'
  ]

  const handleAffectCollab = (user) => {
    if (user) {
      // setEditing(true);
      // setCurrentUser(user);
      // if(repres.length>0){
      // const representant = repres?.find((rep) => rep.NUM_REPRES === user.COMMERCIAL_OK);
      // setSelectedRepres(representant);
    }
  }
  const handleTriChange = (event, value) => {
    setSelectedTri(value);
  };
  const handleRotationChange = (event, value) => {
    setSelectedRotation(value);
  };
  const handleAvancementChange = (event, value) => {
    setSelectedAvancement(value);
  };
  useEffect(() => {
    fetchClients();
  }, [page, pageSize, searchClient]);
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
  useEffect(() => {
    fetchClientsFdm();
  }, [page, pageSize, searchClient]);


  const fetchClientsFdm = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/clientsFdmSearch`, {
        params: { page, pageSize, searchTerm: searchClient },
      });
      setClientsFdm(response.data.clients);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };
  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);
  const handleSearchClientChange = (event) => {
    setSearchClient(event.target.value);
    setPage(0);
  };
  const handleSelectClient = (client) => {
    setSelectedClient(client.CODE_CLIENT);
  };
  const handleSelectClientFdm = (client) => {
    setSelectedClientFdm(client.CODE_CLIENT);
  };
  const [selectedCodeClient, setSelectedCodeClient] = useState(null)
  const handleConfirmSelection = () => {
    if (selectedClient) {

      setDialogOpen(false);
    }
  };
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderSearchInput =
    <TextField style={{ marginLeft: '20px', marginRight: '20px' }}
      variant="outlined"
      placeholder="Famille  / dimension "
      value={searchTerm}
      onChange={handleSearchChange}
      InputProps={{
        endAdornment: (
          <IconButton>
            <SearchIcon />
          </IconButton>
        ),
      }}
      sx={{ width: "300px" }} />

  const renderSelectClImage = (index === 1 && selectedOption === '3') || (index == 2 && selectedOption === '3') ? (
    <TextField
      fullWidth
      value={selectedClient}
      placeholder="Recherche par client  "

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
  const renderSelectClImageFdm = (index === 0 && selectedOption === '3') || (index == 3 && selectedOption === '2') ? (
    <TextField
      fullWidth
      value={selectedClient}
      onChange={(e) => setSelectedClient(e.target.value)}
      placeholder="Chercher les remises d'un client  "

      variant="outlined"
      style={{ marginRight: '20px' }}
    />
  ) : null;
  const renderIconAndText = () => {
    let label = '';
    if (index === 0) {
      label = `Nombre de partenaires`;
    } else if (index === 1) {
      label = `Nombre d'investisseurs `;
    }
    if (selectedAvancement) {
      label += ` ${selectedAvancement}`;
    }
    return (
      null
    )
  };

  const renderFiltredInput = ((index === 0 || index === 1) && selectedOption !== '3') ? (
    <Autocomplete
      options={avancementOptions}
      value={selectedAvancement}
      onChange={handleAvancementChange}
      renderInput={(params) => <TextField {...params} label="Filtrer par statut" variant="outlined" />}
      sx={{ width: "250px", marginRight: "20px" }}
    />
  ) : null;
  const renderFiltredRotInput = selectedOption === '4' ? (
    <Autocomplete
      options={rotationOptions}
      value={selectedRotation}
      onChange={handleRotationChange}
      renderInput={(params) => <TextField {...params} label="Filtrer par taux de rotation" variant="outlined" />}
      sx={{ width: "350px", marginRight: "20px" }}
    />
  ) : null;
  const renderTriInput = ((index === 2 || index === 3) && selectedOption !== '3') ? (
    <Autocomplete
      options={triOptions}
      value={selectedTri}
      onChange={handleTriChange}
      renderInput={(params) => <TextField {...params} label="Trier par" variant="outlined" />}
      sx={{ width: "250px", marginRight: "20px" }}
    />
  ) : null;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={selectedOption}
                onChange={handleOptionChange}
              >
                {(index === 0 || index === 1) && (
                  <>

                    <FormControlLabel value="1" control={<Radio />} label="Clients" />

                  </>
                )}
                {(index === 2 || index === 3) && (
                  <>
                    <FormControlLabel value="1" control={<Radio />} label="Clients" />
                    <FormControlLabel value="2" control={<Radio />} label="Commandes en cours" />
                    <FormControlLabel value="3" control={<Radio />} label="Etat de stock" />
                  </>
                )}
              </RadioGroup>

              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={selectedOption}
                onChange={handleOptionChange}>
                {(index === 4) && (
                  <>
                    <FormControlLabel value="1" control={<Radio />} label="Enregistrés" />
                  </>
                )}
              </RadioGroup>
              <Box sx={{ ml: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleClickOpen}
                  size="small"
                  sx={{ minWidth: '150px', fontSize: '0.875rem', textTransform: 'none' }}
                >Liste des collaborateurs
                </Button>

                <div>

                  <Dialog open={open} onClose={handleClose} fullWidth
                    maxWidth="md"
                    PaperProps={{
                      style: {
                        height: '90vh',
                        maxHeight: '900vh',
                      },
                    }}>
                    <DialogTitle> Liste des collaborateurs</DialogTitle>
                    <DialogContent>
                      <TableContainer component={Paper} style={{ maxHeight: "700vh", overflowY: 'auto' }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{
                                fontWeight: 'bold',
                                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              }}>Utilisateur</TableCell>

                              <TableCell sx={{
                                fontWeight: 'bold',
                                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              }}>Login</TableCell>

                              <TableCell sx={{
                                fontWeight: 'bold',
                                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              }}>Role</TableCell>

                              <TableCell sx={{
                                fontWeight: 'bold',
                                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              }}>Email</TableCell>

                              <TableCell sx={{
                                fontWeight: 'bold',
                                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              }}>Poste N°</TableCell>

                              <TableCell sx={{
                                fontWeight: 'bold',
                                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              }}>Code software</TableCell>

                              <TableCell sx={{
                                fontWeight: 'bold',
                                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {users
                              .filter((user) => user.ROLE === "collaborateur") // Add filter here
                              .map((user) => {
                                const representative = repres.find((rep) => rep.NUM_REPRES === user.COMMERCIAL_OK);
                                return (
                                  <TableRow key={user.ID_UTILISATEUR}>
                                    <TableCell>{user.UTILISATEUR}</TableCell>
                                    <TableCell>{user.LOGIN}</TableCell>
                                    <TableCell>{user.ROLE}</TableCell>
                                    <TableCell>{user.NUM_POSTE}</TableCell>
                                    <TableCell>{user.CODE_SOFTWARE}</TableCell>
                                    <TableCell>
                                      <IconButton color="primary" onClick={() => handleAffectCollab(user)}>
                                        <img src={checkIcon} alt="check Icon" style={{ height: '24px', width: '24px', marginRight: '8px' }} />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClose} color="primary">
                        <img src={annulerIcon} alt="Annuler Icon" style={{ height: '24px', width: '24px', marginRight: '8px' }} />
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "flex-end" }}>
              {renderIconAndText()}
              {renderFiltredInput}
              {renderFiltredRotInput}
              {renderSearchInput}
              {renderSelectClImage}
              {renderSelectClImageFdm}

              {/*renderSearchInputs*/}
            </Box>
          </Box>
          <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
            <DialogTitle>
              Choisir un client
              <Button onClick={handleDialogClose} style={{ position: 'absolute', right: '8px', top: '8px' }}>
                <CloseIcon />
              </Button>
            </DialogTitle>
            <DialogContent>
              <Box>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Rechercher"
                  value={searchClient}
                  onChange={handleSearchClientChange}
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
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={total}
                    rowsPerPage={pageSize}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableContainer>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmSelection}
                disabled={!selectedClient}
                sx={{ mt: 2 }}
              >
                Sélectionner
              </Button>
            </DialogActions>
          </Dialog>

          {index === 0 && selectedOption === '1' && displayMode === 'card' && (
            <CardFamilleCSPD displayMode={displayMode} />
          )}
          {index === 0 && selectedOption === '0' && displayMode === 'card' && (
            <CardFamille displayMode={displayMode} searchTerm={searchTerm} selectedAvancement={selectedAvancement} setTotalObj={(tp, nn) => {
              let obj = { ...tot }
              obj.typeCli = tp
              obj.nbr = nn
              setTot(obj)
            }} />
          )}
          {index === 5 && selectedOption === '0' && displayMode === 'card' && (
            <Savmanagement displayMode={displayMode} searchTerm={searchTerm} selectedAvancement={selectedAvancement} setTotalObj={(tp, nn) => {
              let obj = { ...tot }
              obj.typeCli = tp
              obj.nbr = nn
              setTot(obj)
            }} />
          )}

          {index === 0 && selectedOption === '2' && (
            <CommandesList base={"fdm"} type={"famille"} searchTerm={searchTerm} setAssigned={(setAssigned) => setAssignedList(setAssigned)} />
          )}



          {selectedOption === '3' && index === 0 && (
            <Stock
              searchTerm={searchTerm}
              codeCli={selectedClient}
              base={"fdm"}
              type={"client"}
              enableClientSearch={true} // Add this prop
            />
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
  setAssignedList: PropTypes.func.isRequired,
};

export default function BasicTabs({ searchTerm, setSearchTerm, selectedOption, setSelectedOption, value, setValue, tot, setAssignedList }) {
  const [numberCli, setNumberCli] = useState([])
  const handleChange = (newValue) => {
    console.log("value", newValue)
    setValue(newValue)
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={(e, newValue) => handleChange(newValue)} aria-label="basic tabs example">

          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                <FamilyRestroomIcon /> <span style={{ marginLeft: '10px', fontWeight: 'bold', textTransform: 'none', fontSize: '16px', }}>Famille </span>

              </Box>
            }
          />

        </Tabs>
      </Box>


      <CustomTabPanel value={value} index={0} setAssigned={setAssignedList} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} setNumber={(TypeCl, num) => {
        let newArray = [...numberCli]
        let editArray = []
        let obj = newArray.filter((a) => a.typeCli == TypeCl)
        if (obj.length == 0) {
          newArray.push({ typeCli: TypeCl, Nbr: num })
        } else {
          editArray = [...numberCli.filter((a) => a.typeCli !== TypeCl)]
          editArray.push({ typeCli: TypeCl, Nbr: num })
          newArray = [...editArray]
        }
        setNumberCli(newArray)
      }} />

    </Box>
  );
}
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
