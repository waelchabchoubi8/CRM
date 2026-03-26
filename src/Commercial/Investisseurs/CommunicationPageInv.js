// CommunicationPageInv.js
import React, { useEffect, useState } from "react";
import BASE_URL from "../../Utilis/constantes";
import axios from "axios";
import { useSelector } from "react-redux";
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
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import TabsInvestisseur from "../Investisseurs/TabsInvestisseur";

export default function CommunicationPageInv() {
  const user = useSelector((state) => state.user);
  const [communicationHistory, setCommunicationHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [selectedOption, setSelectedOption] = useState("0");
  const [raisonList, setRaisonList] = useState([]);
  const [isStockEnabled, setIsStockEnabled] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [qualificationList, setQualificationList] = useState([]);
  const [params, setParams] = useState([]);
  const [filteredQualificationList, setFilteredQualificationList] = useState([]);

  const [selectedRaison, setSelectedRaison] = useState(null);
  const [selectedQualification, setSelectedQualification] = useState(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/RaisonsList`)
      .then(res => setRaisonList(res.data || []))
      .catch(err => console.error("Error fetching raisons:", err));

    axios.get(`${BASE_URL}/api/QualificationAppels`)
      .then(res => setQualificationList(res.data || []))
      .catch(err => console.error("Error fetching qualifications:", err));

    axios.get(`${BASE_URL}/api/raisonQualifications`)
      .then(res => setParams(res.data || []))
      .catch(err => console.error("Error fetching raisonQualifications:", err));
  }, []);

  useEffect(() => {
    if (!selectedRaison) {
      setFilteredQualificationList([]);
      return;
    }

    const qualificationIds = params
      .filter(p => p.ID_RAISON === selectedRaison.ID_RAISON)
      .map(p => p.ID_QUALIFICATION);

    setFilteredQualificationList(
      qualificationList.filter(q => qualificationIds.includes(q.ID_QUALIFICATION))
    );
  }, [selectedRaison, params, qualificationList]);

  const formatDateForSql = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = "00";
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const [statuts, setStatuts] = useState([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/StatutPartenaires`)
      .then(res => setStatuts(res.data || []))
      .catch(err => console.error("Erreur chargement statuts:", err));
  }, []);

  const [communicationData, setCommunicationData] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  const [communication, setCommunication] = useState({
    COLLABORATOR: "",
    CALL_DATE: "",
    TYPE_APPEL: "",
    CODE_CLIENT: "",
    RAISON: "",
    DESCRIPTION: "",
    NOM_CLIENT: "",
    SCHEMA: "",
  });

  const handleCommunicationSelect = (data) => {
    setCommunicationData(data);
    setIsStockEnabled(true);

    setCommunication((prev) => ({
      ...prev,
      COLLABORATOR: data.COLLABORATOR || user?.LOGIN || "",
      CALL_DATE: getCurrentTunisiaDateTime(),
      TYPE_APPEL: data.TYPE_APPEL || "",
      CODE_CLIENT: data.ID_INVESTISSEUR || "",
    }));
  };

  const isCspdFlow = communicationData?.SOURCE === "CSPD";

  const getCurrentTunisiaDateTime = () => {
    const now = new Date();
    const tunisiaOffsetMinutes = -60; // UTC+1
    const offsetMinutes = now.getTimezoneOffset();
    const adjusted = new Date(
      now.getTime() + (offsetMinutes + tunisiaOffsetMinutes) * 60 * 1000
    );
    const year = adjusted.getFullYear();
    const month = String(adjusted.getMonth() + 1).padStart(2, "0");
    const day = String(adjusted.getDate()).padStart(2, "0");
    const hours = String(adjusted.getHours()).padStart(2, "0");
    const minutes = String(adjusted.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (!communicationData?.ID_INVESTISSEUR) return;

    const isCspd = communicationData?.SOURCE === "CSPD";
    const endpoint = isCspd
      ? `${BASE_URL}/api/callscspd`
      : `${BASE_URL}/api/getComInv`;

    const params = isCspd
      ? { id_client: communicationData.ID_INVESTISSEUR }
      : { id: communicationData.ID_INVESTISSEUR };

    axios
      .get(endpoint, { params })
      .then((res) => {
        let rawList = [];
        if (Array.isArray(res.data)) {
          rawList = res.data;
        } else if (Array.isArray(res.data?.data)) {
          rawList = res.data.data;
        }

        const normalized = rawList.map((item) => ({
          DATE_COMMUNICATION: item.DATE_COMMUNICATION || item.CALL_DATE || null,
          TYPE_APPEL: item.TYPE_APPEL || "",
          UTILISATEUR: item.UTILISATEUR || item.COLLABORATOR || "",
          RAISON: item.RAISON || "",
          DETAILS_COMMUNICATION: item.DETAILS_COMMUNICATION || item.DESCRIPTION || "",
        }));

        setCommunicationHistory(normalized);
      })
      .catch((err) => {
        console.error("❌ Error fetching communication history:", err);
        setCommunicationHistory([]);
      });
  }, [communicationData, user?.LOGIN]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!communication.CODE_CLIENT) {
        alert("Veuillez sélectionner un investisseur d'abord.");
        return;
      }
      if (!communication.CALL_DATE || !communication.DESCRIPTION) {
        alert("Veuillez remplir tous les champs");
        return;
      }

      if (!isCspdFlow) {
        if (!selectedRaison || !selectedQualification) {
          alert("Veuillez sélectionner la raison et la qualification");
          return;
        }
      }

      let endpoint = "";
      let requestData = {};
      if (isCspdFlow) {
        endpoint = `${BASE_URL}/api/collaboratorscalls`;
        requestData = {
          COLLABORATOR: user?.LOGIN,
          CALL_DATE: formatDateForSql(communication.CALL_DATE),
          DESCRIPTION: communication.DESCRIPTION,
          clientId: communication.CODE_CLIENT,
          TYPE_APPEL: communication.TYPE_APPEL,
          RAISON: selectedRaison?.LIBELLE || null,
          NOM_CLIENT: communication.NOM_CLIENT || "",
          SCHEMA: communication.SCHEMA || "CSPD",
        };
      } else {
        endpoint = `${BASE_URL}/api/CreateCommunicationInv`;
        requestData = {
          ID_INVESTISSEUR: communication.CODE_CLIENT,
          ID_STATUT: selectedQualification?.UPDATE_STATUS,
          ID_RAISON: selectedRaison?.ID_RAISON,
          ID_QUALIFICATION: selectedQualification?.ID_QUALIFICATION,
          DATE_COMMUNICATION: communication.CALL_DATE,
          DETAILS_COMMUNICATION: communication.DESCRIPTION,
          TYPE_APPEL: communication.TYPE_APPEL,
          UTILISATEUR: user?.LOGIN,
        };
      }

      const response = await axios.post(endpoint, requestData, { timeout: 5000 });

      if (response.status === 200 || response.status === 201) {
        if (!isCspdFlow && communicationData && selectedQualification?.UPDATE_STATUS != null) {
          await axios.put(`${BASE_URL}/api/updateInvStatus`, {
            id: communicationData.ID_INVESTISSEUR,
            id_statut: selectedQualification.UPDATE_STATUS,
          });
        }
        alert("Communication ajoutée avec succès");
        setCommunicationData(null);
        setIsStockEnabled(false);
        setCommunication({
          COLLABORATOR: "",
          CALL_DATE: "",
          TYPE_APPEL: "",
          CODE_CLIENT: "",
          RAISON: "",
          DESCRIPTION: "",
        });
        setSelectedRaison(null);
        setSelectedQualification(null);
        setResetSignal(prev => prev + 1);
        setCommunicationHistory([]);
      }
    } catch (error) {
      console.error("❌ Erreur sauvegarde:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      key="inv-page-root"
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
          key="inv-form-panel"
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
            Nouvelle communication (Investisseur)
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
            value={communication.CALL_DATE || getCurrentTunisiaDateTime()}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            disabled={!communicationData}
            onChange={(e) =>
              setCommunication((prev) => ({
                ...prev,
                CALL_DATE: e.target.value,
              }))
            }
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Raison</InputLabel>
            <Select
              value={selectedRaison || ""}
              disabled={!communicationData}
              label="Raison"
              onChange={(e) => {
                const raisonObj = e.target.value;
                setSelectedRaison(raisonObj);
                setSelectedQualification(null);
              }}
            >
              {raisonList.map((r) => (
                <MenuItem key={r.ID_RAISON} value={r}>
                  {r.LIBELLE}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!isCspdFlow && (
            <FormControl fullWidth margin="dense">
              <InputLabel>Qualification</InputLabel>
              <Select
                value={selectedQualification || ""}
                disabled={!communicationData || !selectedRaison}
                label="Qualification"
                onChange={(e) => setSelectedQualification(e.target.value)}
              >
                {qualificationList.map((q) => (
                  <MenuItem key={q.ID_QUALIFICATION} value={q}>
                    {q.LIBELLE}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Description"
            multiline
            fullWidth
            rows={4}
            disabled={!communicationData}
            value={communication.DESCRIPTION || ""}
            onChange={(e) =>
              setCommunication((prev) => ({
                ...prev,
                DESCRIPTION: e.target.value,
              }))
            }
            sx={{ mt: 1 }}
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
                  {communicationHistory.map((comm, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {comm.DATE_COMMUNICATION ? new Date(comm.DATE_COMMUNICATION).toLocaleString() : ""}
                      </TableCell>
                      <TableCell>{comm.TYPE_APPEL}</TableCell>
                      <TableCell>{comm.UTILISATEUR}</TableCell>
                      <TableCell>{comm.RAISON}</TableCell>
                      <TableCell>{comm.DETAILS_COMMUNICATION}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      <Box
        key="inv-tabs-panel"
        sx={{
          flex: 1,
          height: "100%",
          overflow: "auto",
          backgroundColor: "#f9fafb",
        }}
      >
        <TabsInvestisseur
          onCommunicationSelect={handleCommunicationSelect}
          resetSignal={resetSignal}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          setAssignedList={() => { }}
          isStockEnabled={isStockEnabled}
        />
      </Box>
    </Box>
  );
}
