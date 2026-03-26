// CommunicationPage.js
import React, { useState, useEffect } from "react";
import BASE_URL from '../../Utilis/constantes';
import { 
  Box, 
  TextField, 
  Typography, 
  Button, 
  Divider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableContainer, 
  Paper 
} from "@mui/material";
import { useSelector } from "react-redux";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import axios from 'axios';
import TabsCspd from "./TabsCspd";

export default function CommunicationPage() {
    const [communicationHistory, setCommunicationHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [resetSignal, setResetSignal] = useState(0);
    const [saving, setSaving] = useState(false);
    const [passagerFilter, setPassagerFilter] = useState(null);

    const [communication, setCommunication] = useState({
      COLLABORATOR: '',
      CALL_DATE: '',
      TYPE_APPEL: '',
      CODE_CLIENT: '',
      RAISON: '',
      NOM_CLIENT: '',
      SCHEMA: '',
      DESCRIPTION: '',
      PASSAGER_NUM: null,
    });

    const user = useSelector((state) => state.user);
    const [communicationData, setCommunicationData] = React.useState(null);
    const showPassagerField =
      communicationData?.CODE_CLIENT === "41101089" ||
      communicationData?.NOM_CLIENT === "CLIENT PASSAGER";

    const handleCommunicationSelect = (data) => {
      setCommunicationData(data);
    };

    const handleSave = async () => {
      try {
        setSaving(true);
        const requiredFields = ['COLLABORATOR', 'CALL_DATE', 'RAISON', 'DESCRIPTION', 'CODE_CLIENT'];
        if (!communication?.CODE_CLIENT) {
          alert('Veuillez sélectionner un client (Entrant ou Sortant)');
          return;
        }
        const missing = requiredFields.filter(f => !communication[f]);

        if (missing.length > 0) {
          alert('Veuillez remplir tous les champs');
          return;
        }

        const requestData = {
          COLLABORATOR: communication.COLLABORATOR,
          CALL_DATE: formatDate(communication.CALL_DATE),
          RAISON: communication.RAISON,
          DESCRIPTION: communication.DESCRIPTION,
          clientId: communication.CODE_CLIENT,
          NOM_CLIENT: communication.NOM_CLIENT,
          SCHEMA: communication.SCHEMA,
          TYPE_APPEL: communication.TYPE_APPEL,
          PASSAGER_NUM: showPassagerField ? communication.PASSAGER_NUM : null
        };

        const response = await axios.post(
          `${BASE_URL}/api/collaboratorscalls`,
          requestData,
          { timeout: 5000 }
        );

        if (response.status === 200 || response.status === 201) {
          alert('Communication ajoutée avec succès');
          setCommunicationData(null);
          setCommunication({
            COLLABORATOR: '',
            CALL_DATE: '',
            TYPE_APPEL: '',
            CODE_CLIENT: '',
            RAISON: '',
            DESCRIPTION: '',
            NOM_CLIENT: '',
            SCHEMA: '',
          });
          setResetSignal(prev => prev + 1);
          setCommunicationHistory([]);
        }
      } catch (error) {
        console.error(error);
        alert('Erreur lors de la sauvegarde de la communication');
      } finally {
        setSaving(false);
      }
    };

    useEffect(() => {
      if (!showPassagerField) {
        setCommunication(prev => ({
          ...prev,
          PASSAGER_NUM: null
        }));
      }
    }, [showPassagerField]);

    useEffect(() => {
      if (!communicationData?.CODE_CLIENT) return;

      axios
        .get(`${BASE_URL}/api/callscspd`, {
          params: {
            id_client: communicationData.CODE_CLIENT,
            limit: 100,
          },
        })
        .then((res) => {
          setCommunicationHistory(res.data?.data || []);
        })
        .catch((err) => {
          console.error('Error fetching communication history:', err);
          setCommunicationHistory([]);
        });
    }, [communicationData, user?.LOGIN]);

    const formatDate = (date) => {
      if (!date) return '';
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    useEffect(() => {
      if (!communicationData) return;
      setCommunication(prev => ({
        ...prev,
        COLLABORATOR: communicationData.COLLABORATOR || user?.LOGIN || '',
        CALL_DATE: communicationData.CALL_DATE || getCurrentTunisiaDateTime(),
        TYPE_APPEL: communicationData.TYPE_APPEL || '',
        CODE_CLIENT: communicationData.CODE_CLIENT || '',
        NOM_CLIENT: communicationData.NOM_CLIENT || '',
        SCHEMA: communicationData.SCHEMA || '',
      }));
    }, [communicationData, user?.LOGIN]);

    const getCurrentTunisiaDateTime = () => {
      const now = new Date();
      const tunisiaOffsetMinutes = -60; // UTC+1
      const offsetMinutes = now.getTimezoneOffset();
      const adjusted = new Date(now.getTime() + (offsetMinutes + tunisiaOffsetMinutes) * 60 * 1000);
      const year = adjusted.getFullYear();
      const month = String(adjusted.getMonth() + 1).padStart(2, '0');
      const day = String(adjusted.getDate()).padStart(2, '0');
      const hours = String(adjusted.getHours()).padStart(2, '0');
      const minutes = String(adjusted.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
      <Box
        key="communication-page-container"
        sx={{
          width: "100%",
          minHeight: isMobile ? "auto" : "calc(100vh - 64px)",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          overflow: isMobile ? "auto" : "hidden",
          backgroundColor: "#f5f7fa",
        }}
      >
        {currentTab === 0 && (
          <Box
            key="communication-page-form"
            sx={{
              width: isMobile ? "100%" : "25%",
              minWidth: isMobile ? 0 : 480,
              height: isMobile ? "auto" : "100%",
              overflowY: "auto",
              backgroundColor: "#fff",
              borderRight: isMobile ? "none" : "1px solid #ddd",
              borderBottom: isMobile ? "1px solid #ddd" : "none",
              p: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Nouvelle communication
            </Typography>

            <TextField
              label="Utilisateur CRM"
              value={user?.LOGIN || ""}
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
              disabled
            />

            <TextField
              label="Date de l'appel"
              type="datetime-local"
              defaultValue={getCurrentTunisiaDateTime()}
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              disabled={!communicationData}
              onChange={(e) =>
                setCommunication(prev => ({
                  ...prev,
                  CALL_DATE: e.target.value
                }))
              }
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>Raison</InputLabel>
              <Select
                value={communication.RAISON || ''}
                disabled={!communicationData}
                onChange={(e) =>
                  setCommunication(prev => ({
                    ...prev,
                    RAISON: e.target.value
                  }))
                }
              >
                <MenuItem value="Prospection">Prospection</MenuItem>
                <MenuItem value="Formation">Formation en ligne</MenuItem>
                <MenuItem value="Information">Demande d'information</MenuItem>
                <MenuItem value="Action Investisseur">Action Investisseur</MenuItem>
                <MenuItem value="Action Promotion">Action Promotion</MenuItem>
                <MenuItem value="Partenaire">Partenaire</MenuItem>
                <MenuItem value="Investisseur">Investisseur</MenuItem>
              </Select>
            </FormControl>

            {showPassagerField && (
              <TextField
                label="Numéro passager"
                type="text"
                fullWidth
                margin="dense"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                value={communication.PASSAGER_NUM ?? ''}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, '');
                  setCommunication(prev => ({
                    ...prev,
                    PASSAGER_NUM: onlyDigits === '' ? null : Number(onlyDigits)
                  }));
                }}
              />
            )}

            <TextField
              label="Description"
              multiline
              fullWidth
              rows={4}
              disabled={!communicationData}
              value={communication.DESCRIPTION || ''}
              onChange={(e) =>
                setCommunication(prev => ({
                  ...prev,
                  DESCRIPTION: e.target.value
                }))
              }
            />

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography sx={{ fontWeight: "bold" }}>
                Historique
              </Typography>
              <Button
                variant="contained"
                color="primary"
                disabled={!communicationData || saving}
                onClick={handleSave}
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </Box>

            {showPassagerField && (
              <TextField
                label="Filtrer par numéro passager"
                type="text"
                fullWidth
                margin="dense"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                value={passagerFilter ?? ''}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, '');
                  setPassagerFilter(onlyDigits === '' ? null : Number(onlyDigits));
                  axios.get(`${BASE_URL}/api/callscspd`, {
                    params: {
                      id_client: communicationData.CODE_CLIENT,
                      limit: 100,
                      passagerNum: onlyDigits === '' ? null : Number(onlyDigits)
                    }
                  })
                  .then(res => setCommunicationHistory(res.data?.data || []))
                  .catch(() => setCommunicationHistory([]));
                }}
              />
            )}

            {communicationHistory.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: "#888", mt: 1, fontStyle: "italic" }}>
                Aucun historique de communication trouvé
              </Typography>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #eee", mt: 1, width: "100%", overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#fafafa" }}>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>Date & heure</TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>Type d'appel</TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>Commercial</TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>Raison</TableCell>
                      <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>Détails</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {communicationHistory.map((comm, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {new Date(comm.CALL_DATE).toLocaleString()}
                        </TableCell>
                        <TableCell>{comm.TYPE_APPEL}</TableCell>
                        <TableCell>{comm.COLLABORATOR}</TableCell>
                        <TableCell>{comm.RAISON}</TableCell>
                        <TableCell>{comm.DESCRIPTION}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        <Box
          key="communication-page-tabs"
          sx={{
            flex: 1,
            height: "100%",
            overflow: "auto",
            backgroundColor: "#f9fafb",
          }}
        >
          <TabsCspd
            onCommunicationSelect={handleCommunicationSelect}
            resetSignal={resetSignal}
            value={0}
            setValue={() => { }}
            setAssignedList={() => { }}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentTab={currentTab}
            onTabChange={setCurrentTab}
          />
        </Box>
      </Box>
    );
}
