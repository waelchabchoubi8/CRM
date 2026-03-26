// CommunicationPagePart.js
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
import TabsPartenaires from "../Partenaires/TabsPartenaires";

export default function CommunicationPagePart() {
  const user = useSelector((state) => state.user);
  const [communicationHistory, setCommunicationHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [selectedOption, setSelectedOption] = useState("0");
  const [raisonList, setRaisonList] = useState([]);
  const [disableStock, setDisableStock] = useState(true);

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

  const handleClientCommunicationStart = (payload) => {
    console.log("✅ CLIENT COMMUNICATION ARRIVED IN MAIN PAGE:", payload);
    setCommunicationData(payload);
    setDisableStock(false);
  };

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
    setDisableStock(false);

    setCommunication((prev) => ({
      ...prev,
      COLLABORATOR: data.COLLABORATOR || user?.LOGIN || "",
      CALL_DATE: getCurrentTunisiaDateTime(),
      TYPE_APPEL: data.TYPE_APPEL || "",
      CODE_CLIENT: data.ID_CLIENT || "",
    }));
  };

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
    if (!communicationData) {
      setCommunicationHistory([]);
      return;
    }

    const fetchHistorique = async () => {
      try {
        if (communicationData.SOURCE === "CLIENT_PARTENAIRE") {
          if (!communicationData.ENTITY_ID) {
            setCommunicationHistory([]);
            return;
          }

          const response = await axios.get(`${BASE_URL}/api/callscspd`, {
            params: { id_client: communicationData.ENTITY_ID },
          });

          const rawList = response.data?.data || [];
          setCommunicationHistory(
            rawList.map((item) => ({
              DATE_COMMUNICATION: item.CALL_DATE,
              TYPE_APPEL: item.TYPE_APPEL || communicationData?.TYPE_APPEL || "-",
              UTILISATEUR: item.COLLABORATOR || "",
              RAISON: item.RAISON || "",
              DETAILS_COMMUNICATION: item.DESCRIPTION || "",
            }))
          );
          return;
        }

        if (!communicationData.ID_CLIENT) {
          setCommunicationHistory([]);
          return;
        }

        const response = await axios.get(`${BASE_URL}/api/getComPart`, {
          params: { id: communicationData.ID_CLIENT },
        });

        const rawList = Array.isArray(response.data) ? response.data : [];
        setCommunicationHistory(
          rawList.map((item) => ({
            DATE_COMMUNICATION: item.DATE_COMMUNICATION,
            TYPE_APPEL: item.TYPE_APPEL || "",
            UTILISATEUR: item.COLLABORATOR || "",
            RAISON: item.RAISON || "",
            DETAILS_COMMUNICATION: item.DETAILS_COMMUNICATION || "",
          }))
        );
      } catch (err) {
        console.error("❌ ERROR FETCHING HISTORIQUE:", err);
        setCommunicationHistory([]);
      }
    };

    fetchHistorique();
  }, [communicationData, user?.LOGIN]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!communicationData) {
        alert("No communication selected");
        return;
      }

      if (!communication.CALL_DATE || !communication.DESCRIPTION) {
        alert("Veuillez remplir tous les champs");
        return;
      }

      let endpoint = "";
      let payload = {};

      if (isClientPartenaireFlow) {
        endpoint = `${BASE_URL}/api/collaboratorscalls`;
        payload = {
          COLLABORATOR: user.LOGIN,
          CALL_DATE: formatDateForSql(communication.CALL_DATE),
          RAISON: selectedRaison?.LIBELLE || "",
          DESCRIPTION: communication.DESCRIPTION,
          clientId: communicationData.ENTITY_ID,
          NOM_CLIENT: communication.NOM_CLIENT || "",
          SCHEMA: communication.SCHEMA || "FDM",
        };
      } else {
        endpoint = `${BASE_URL}/api/CreateCommunication`;
        payload = {
          ID_PARTENAIRE: communication.CODE_CLIENT,
          ID_STATUT: selectedQualification?.UPDATE_STATUS,
          ID_RAISON: selectedRaison?.ID_RAISON,
          ID_QUALIFICATION: selectedQualification?.ID_QUALIFICATION,
          DATE_COMMUNICATION: communication.CALL_DATE,
          DETAILS_COMMUNICATION: communication.DESCRIPTION,
          TYPE_APPEL: communication.TYPE_APPEL,
          COLLABORATOR: user?.LOGIN,
        };
      }

      await axios.post(endpoint, payload);
      alert("Communication ajoutée avec succès");

      setCommunicationData(null);
      setDisableStock(true);
      setSelectedRaison(null);
      setSelectedQualification(null);
      setCommunicationHistory([]);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const isClientPartenaireFlow = communicationData?.SOURCE === "CLIENT_PARTENAIRE";

  return (
    <Box
      key="part-page-root"
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
          key="part-form-panel"
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
            Nouvelle communication (Partenaire)
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

          {!isClientPartenaireFlow && (
            <FormControl fullWidth margin="dense">
              <InputLabel>Qualification</InputLabel>
              <Select
                value={selectedQualification || ""}
                disabled={!communicationData || !selectedRaison}
                label="Qualification"
                onChange={(e) => setSelectedQualification(e.target.value)}
              >
                {(filteredQualificationList.length > 0 ? filteredQualificationList : qualificationList).map((q) => (
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
        key="part-tabs-panel"
        sx={{
          flex: 1,
          height: "100%",
          overflow: "auto",
          backgroundColor: "#f9fafb",
        }}
      >
        <TabsPartenaires
          value={currentTab}
          setValue={setCurrentTab}
          onCommunicationSelect={handleCommunicationSelect}
          onClientCommunicationStart={handleClientCommunicationStart}
          resetSignal={resetSignal}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          setAssignedList={() => { }}
          disableStock={disableStock}
        />
      </Box>
    </Box>
  );
}
