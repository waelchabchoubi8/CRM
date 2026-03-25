import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Checkbox, Tab, Tabs } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearIcon from "@mui/icons-material/Clear";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

import {
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Paper,
  styled,
  LinearProgress // import LinearProgress component
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import DownloadIcon from "@mui/icons-material/Download";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

import BASE_URL from "../Utilis/constantes";
import Pagination from "@mui/material/Pagination";
import { grey } from "@mui/material/colors";
import SortIcon from "@mui/icons-material/Sort";
import FolderDocument from "../FolderDocument/FolderDocument";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 200,
      width: 250,
    },
  },
};

// Adjust URL if you ever want to connect to another machine
// const BRIDGE_WS_URL = 'ws://192.168.152.10:8765'; // bridge running on same PC

function fetchScannersFromBridge(bridgeUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(bridgeUrl);
    let settled = false;

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: 'get_scanners' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.action === 'scanners_list') {
          settled = true;
          ws.close();
          resolve(msg.data || []);
        }
      } catch {
        // ignore JSON parse errors
      }
    };

    ws.onerror = () => {
      if (!settled) {
        settled = true;
        reject(new Error('Impossible de joindre le Scanner Bridge'));
      }
    };

    ws.onclose = () => {
      if (!settled) {
        reject(new Error('Connexion au Scanner Bridge fermée'));
      }
    };
  });
}

function scanAndUpload(
  {
    bridgeUrl,
    departmentId,
    folderId,
    docType = 'pdf',
    options = {},
    fileName,
    authToken
  },
  onProgress
) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(bridgeUrl);
    let settled = false;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'scan_and_upload',
        departmentId,
        folderId,
        docType,
        options,
        fileName,
        authToken
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.action) {
          case 'scan_started':
            break;
          case 'scan_progress':
            if (onProgress) onProgress(msg.progress);
            break;
          case 'scan_upload_complete':
            settled = true;
            ws.close();
            resolve(msg.data);
            break;
          case 'scan_error':
          case 'error':
            settled = true;
            ws.close();
            reject(new Error(msg.error || 'Erreur de scan'));
            break;
          default:
            break;
        }
      } catch {
        // ignore
      }
    };

    ws.onerror = () => {
      if (!settled) {
        settled = true;
        reject(new Error('Erreur WebSocket vers le Scanner Bridge'));
      }
    };

    ws.onclose = () => {
      if (!settled) {
        reject(new Error('Connexion au Scanner Bridge fermée'));
      }
    };
  });
}

function Document({ Departement, userRole, folder, page: initialPage = 1 }) {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  // const [authorizedUsers, setAuthorizedUsers] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUserOptions, setAllUserOptions] = useState([]); // full list

  const [userOptions, setUserOptions] = useState([]);
  const storedUser = localStorage.getItem("user");
  const idUtilisateur = storedUser
    ? JSON.parse(storedUser).ID_UTILISATEUR
    : null;
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // PDFs per page
  const [totalPages, setTotalPages] = useState(1);
  const [docToDelete, setDocToDelete] = useState(null);
  const [openDeleteDocDialog, setOpenDeleteDocDialog] = useState(false);

  const [sortOrder, setSortOrder] = useState("desc");

  const [searchText, setSearchText] = React.useState("");
  const [filterDate, setFilterDate] = React.useState("");

  const sortedFiles = [...pdfFiles].sort((a, b) => {
    const dateA = new Date(a.dateUpload);
    const dateB = new Date(b.dateUpload);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Scanner states
  const [scanHosts, setScanHosts] = useState([]);
  const [selectedHostId, setSelectedHostId] = useState('');
  const [scanners, setScanners] = useState([]);
  const [selectedScannerId, setSelectedScannerId] = useState('');

  const [scanFileName, setScanFileName] = useState('');
  const [scanDocType, setScanDocType] = useState('pdf');

  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(null);
  const [scanProgress, setScanProgress] = useState(null);

  useEffect(() => {
    const loadHosts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/scanner-hosts`);
        setScanHosts(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedHostId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger la liste des postes de scan" , { containerId: "modal2" });
      }
    };
    loadHosts();
  }, []);

  useEffect(() => {
    const loadScanners = async () => {
      const host = scanHosts.find((h) => h.id === selectedHostId);
      if (!host) {
        setScanners([]);
        setSelectedScannerId('');
        return;
      }

      try {
        const list = await fetchScannersFromBridge(host.wsUrl);
        setScanners(list);
        setSelectedScannerId(list[0]?.id || '');
      } catch (err) {
        console.error(err);
        toast.error(`Impossible de joindre le bridge sur ${host.label}` , { containerId: "modal2" });
        setScanners([]);
        setSelectedScannerId('');
      }
    };

    if (selectedHostId) {
      loadScanners();
    }
  }, [selectedHostId, scanHosts]);

  const handleScanClick = async () => {
    if (!Departement?.ID || !folder?.ID) {
      toast.error("Sélectionnez d'abord un dossier et un département." , { containerId: "modal2" });
      return;
    }

    const host = scanHosts.find((h) => h.id === selectedHostId);
    if (!host) {
      toast.error("Sélectionnez un poste de scan." , { containerId: "modal2" });
      return;
    }

    if (!selectedScannerId) {
      toast.error("Sélectionnez un scanner." , { containerId: "modal2" });
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    const fileNameToSend = scanFileName?.trim() || undefined;

    setIsScanning(true);
    setScanStatus("Initialisation du scan...");

    try {
      await scanAndUpload(
        {
          bridgeUrl: host.wsUrl,           // <--- this PC
          departmentId: Departement.ID,
          folderId: folder.ID,
          docType: scanDocType,            // 'pdf' ou 'jpg'
          options: {
            dpi: 300,
            colorMode: "color",
            scannerId: selectedScannerId,  // <--- this scanner on that PC
          },
          fileName: fileNameToSend,
          authToken: savedUser?.token,
        },
        (progress) => {
          setScanProgress(progress);
          setScanStatus(
            progress.stage === "scanning"
              ? "Scan en cours..."
              : progress.stage === "saving"
              ? "Sauvegarde du document..."
              : "Préparation..."
          );
        }
      );

      toast.success("Scan terminé et document chargé." , { containerId: "modal2" });
      fetchDocuments(1, sortOrder, searchText, filterDate);
    } catch (err) {
      console.error(err);
      toast.error(`Erreur lors du scan : ${err.message}` , { containerId: "modal2" });
    } finally {
      setIsScanning(false);
      setTimeout(() => {
        setScanStatus(null);
        setScanProgress(null);
      }, 4000);
    }
  };



  const toggleSortOrder = () => {
    const newSort = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSort);
    fetchDocuments(1, newSort, searchText, filterDate);
  };

  const handleOpenDeleteDocDialog = (doc) => {
    setDocToDelete(doc);
    setOpenDeleteDocDialog(true);
  };

  const handleCloseDeleteDocDialog = () => {
    setDocToDelete(null);
    setOpenDeleteDocDialog(false);
  };

  const handleDeleteDoc = async () => {
    if (!docToDelete) return;

    try {
      await axios.delete(`${BASE_URL}/api/document/${docToDelete.id}`);

      // Supprimer du state local
      setPdfFiles((prev) => prev.filter((file) => file.id !== docToDelete.id));

      toast.success(
        `Le document "${docToDelete.name}" a été supprimé définitivement`
      , { containerId: "modal2" });
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Impossible de supprimer le document" , { containerId: "modal2" });
    } finally {
      handleCloseDeleteDocDialog();
    }
  };

 

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users`);
        setAllUserOptions(response.data); // store full list
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs :", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!Departement?.NOM) return;

    const filteredUsers = allUserOptions.filter(
      (u) => u.DEPARTEMENT === Departement.NOM
    );

    setUserOptions(filteredUsers);
    setSelectedUsers(filteredUsers.map((f) => f.ID_UTILISATEUR));
  }, [Departement, allUserOptions]); // ✅ depend on stable sources only

  useEffect(() => {
    if (idUtilisateur && Departement?.ID) {
      setPage(1);
      fetchDocuments(1); // initial fetch
    }
  }, [idUtilisateur, Departement?.ID]);

  const handleSaveUsers = async (event) => {
    try {
        if (!event?.target?.files) {
      console.warn("No files in event");
      return;
    }
      const files = Array.from(event.target.files || []);
      const pdfs = files.filter((file) => file.type === "application/pdf");

      if (pdfs.length === 0) {
        toast.error("Veuillez sélectionner au moins un fichier PDF !" , { containerId: "modal2" });
        return;
      }
      console.log("pdfs:", pdfs);

      // Préparer les fichiers pour preview
      const newFiles = pdfs.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}-${Math.random()}`,
      }));
      console.log("Uploading files:", newFiles);

      // Mettre à jour l’UI
      setPdfFiles((prev) => [...prev, ...newFiles]);
      setSelectedFiles((prev) => [...prev, ...pdfs]);

      // Reset input file
    if (event.target) {
      event.target.value = "";
    }
      // ---- UPLOAD ----
      const formData = new FormData();
      pdfs.forEach((file) => {
        formData.append("docs", file);
      });

      formData.append("folderId", folder.ID);
      // formData.append("idUtilisateur", idUtilisateur);
      formData.append("departmentId", Departement.ID);
      // formData.append("docType", docType); // "pdf"
      // formData.append("userIds", finalUserIds);

      const uploadRes = await axios.post(
        `${BASE_URL}/api/document/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      fetchDocuments(1);
      // Reset states
      setSelectedFiles([]);
      setSelectedFile(null);
      toast.success("Fichiers PDF ajoutés avec succès " , { containerId: "modal2" });
    } catch (err) {
      console.error("Error uploading files:", err);
      toast.error("Erreur lors de l’upload des fichiers" , { containerId: "modal2" });
    }
  };

  const fetchDocuments = async (
    pageNumber = 1,
    sort = sortOrder,
    docName = "",
    filterDate = ""
  ) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/documents`, {
        params: {
          idUtilisateur,
          departmentId: Departement?.ID,
          folderId: folder.ID,

          limit: rowsPerPage,
          page: pageNumber,
          sort: sort.toUpperCase(), // send "ASC" or "DESC" to backend
          ...(docName && { docName }), // add only if not empty
          ...(filterDate && { filterDate }), // add only if not empty
        },
      });

      const data = response.data; // adjust according to your response structure
      setPdfFiles(
        data.documents.map((doc) => ({
          id: doc.id,
          name: doc.filename,
          url: `${BASE_URL}/api/document/${doc.id}`,
          // uploadDate: doc.uploadDate
          //   ? new Date(doc.uploadDate).toISOString().split("T")[0] // YYYY-MM-DD
          //   : "",
          uploadDate: doc.uploadDate ? doc.uploadDate.split("T")[0] : "",
        }))
      );
      setPage(data.page); // update current page
      setTotalPages(data.totalPages); // update total pages
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const [dateDialog, setDateDialog] = useState(false);
  const [newFolderNameFix, setNewFolderNameFix] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null);

  // const handleOpenDialog = () => {
  //   setDateDialog(true);
  // };

  const handleCloseDialog = () => {
    setDateDialog(false);
  };

  const handleSaveDate = async () => {
    if (!selectedFileId || !selectedDate) return;

    // Convertir la date sélectionnée en ISO string (YYYY-MM-DD)
    const isoDate = new Date(selectedDate).toISOString().split("T")[0];

    try {
      // PATCH request
      await axios.patch(
        `${BASE_URL}/api/documents/updateDate?id=${selectedFileId.id}`,
        {
          uploadDate: isoDate,
        }
      );

      // Refetch documents to update the list
      fetchDocuments(1);

      toast.success("Date mise à jour !" , { containerId: "modal2" });
      handleCloseDialog();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour de la date !" , { containerId: "modal2" });
    }
  };

  const handleFilter = () => {
    console.log("Filtering with", { searchText, filterDate });
    if (!searchText && !filterDate) {
      toast.info(
        "Veuillez entrer un texte ou sélectionner une date pour filtrer !"
      , { containerId: "modal2" });
      return;
    }

    fetchDocuments(1, sortOrder, searchText, filterDate);
  };

  const handleClearFilter = () => {
    setSearchText("");
    setFilterDate("");
    console.log("Filters cleared");
    fetchDocuments(1, sortOrder);
  };

  return (
    //  backgroundColor: "#f5f5f5",
    <>
      {/* <Box sx={{ backgroundColor: "#fff", p: 2 }}>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab label="Dossiers" sx={{ fontWeight: 600 }} />
          <Tab label="Documents" sx={{ fontWeight: 600 }} />
        </Tabs> */}

        {/* Panels */}
        {/* ===== TAB 1 folders ===== */}
        {/* {tab === 0 && (
      
        <Box>
      
          <Box sx={{ minHeight: "100vh" }}>
            <Paper
              sx={{
                p: 3,
                boxShadow: "none",
                border: "1px solid #f5f5f5", // subtle gray border
                borderRadius: 2,
              }}
            >
              <FolderDocument
               Departement={Departement}
                userRole={userRole}
                currentUser={user}
                Departements={alldepartments}>

                </FolderDocument>

              </Paper>
              </Box>
        </Box>)} */}

        {/* ===== TAB 2 docs ===== */}
        {/* {tab === 1 && (

        <Box> */}
          
          <Box sx={{ minHeight: "100vh" ,p: 3,}}>
            <Paper
              // elevation={1}
              sx={{
                p: 3,
                boxShadow: "none",
                border: "1px solid #f5f5f5", // subtle gray border
                borderRadius: 2,
              }}
              // , backgroundColor: "white", borderRadius: 2
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                {/* Left: Upload + Scan + settings */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
                  <Button
                    component="label"
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                  >
                    Télécharger des fichiers
                    <VisuallyHiddenInput
                      type="file"
                      name="docs"
                      accept="application/pdf"
                      multiple
                      onChange={handleSaveUsers}
                    />
                  </Button>

                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleScanClick}
                    disabled={isScanning || !selectedHostId || scanners.length === 0}
                  >
                    {isScanning ? "Scan en cours..." : "Scanner un document"}
                  </Button>

                  {/* Poste de scan (bridge PC) */}
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="scanhost-select-label">Poste de scan</InputLabel>
                    <Select
                      labelId="scanhost-select-label"
                      value={selectedHostId}
                      label="Poste de scan"
                      onChange={(e) => setSelectedHostId(e.target.value)}
                    >
                      {scanHosts.map((h) => (
                        <MenuItem key={h.id} value={h.id}>
                          {h.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Scanner on that host */}
                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel id="scanner-select-label">Scanner</InputLabel>
                    <Select
                      labelId="scanner-select-label"
                      value={selectedScannerId}
                      label="Scanner"
                      onChange={(e) => setSelectedScannerId(e.target.value)}
                    >
                      {scanners.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name} ({s.manufacturer})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    size="small"
                    label="Nom du fichier (sans extension)"
                    value={scanFileName}
                    onChange={(e) => setScanFileName(e.target.value)}
                  />

                  <FormControl size="small" sx={{ minWidth: 90 }}>
                    <InputLabel id="doctype-select-label">Type</InputLabel>
                    <Select
                      labelId="doctype-select-label"
                      value={scanDocType}
                      label="Type"
                      onChange={(e) => setScanDocType(e.target.value)}
                    >
                      <MenuItem value="pdf">PDF</MenuItem>
                      <MenuItem value="jpg">JPG</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Middle: Filters */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    size="small"
                    label="Recherche par nom pdf"
                    variant="outlined"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <TextField
                    size="small"
                    type="date"
                    variant="outlined"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    sx={{ maxWidth: 160 }}
                  />
                  <IconButton color="primary" onClick={handleFilter}>
                    <FilterAltIcon />
                  </IconButton>
                  <IconButton color="primary" onClick={handleClearFilter}>
                    <FilterAltOffIcon />
                  </IconButton>
                </Box>

                {isScanning && (
                  <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body2">{scanStatus}</Typography>
                    {scanProgress?.percent != null && (
                      <LinearProgress
                        variant="determinate"
                        value={scanProgress.percent}
                        sx={{ width: 200 }}
                      />
                    )}
                  </Box>
                )}

                {/* Right: Sort */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton
                    onClick={toggleSortOrder}
                    color="primary"
                    size="small"
                  >
                    <SortIcon
                      sx={{
                        transform:
                          sortOrder === "asc" ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </IconButton>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Trier par date{" "}
                    <strong>
                      ({sortOrder === "asc" ? "croissante" : "décroissante"})
                    </strong>
                  </Typography>
                </Box>
              </Box>

              {pdfFiles.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                  Aucun document PDF n’a été ajouté pour le moment.
                </Typography>
              ) : (
                <Box>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    {pdfFiles.length} fichier(s) PDF ajouté(s)
                  </Typography>

                  <List dense>
                    {pdfFiles.map((file) => (
                      <ListItem
                        key={file.id}
                        sx={{
                          border: "1px solid #eee",
                          borderRadius: 1,
                          mb: 1,
                          px: 2,
                          py: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* {pdfFiles.length > rowsPerPage && (
                        <> */}

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <ListItemIcon>
                            <PictureAsPdfIcon color="error" />
                          </ListItemIcon>
                          {/* <ListItemText
                      primary={
                        <a
                          // href={file.url} // preview mode
                          href={`${file.url}?idUtilisateur=${idUtilisateur}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: "none",
                            color: "inherit",
                            wordBreak: "break-word",
                          }}
                        >
                          {file.name}
                        </a>
                      }
                    /> */}
                          {/* 
          <ListItemText
           
              primary={
              (userRole==='Réception' &&  userRole!=  Departement.NOM) ?   (
                <span
                  style={{
                    color: "inherit",
                    wordBreak: "break-word",
                    cursor: "default",
                  }}
                >
                  {file.name}
                </span>
              ):
                 <a
                  href={`${file.url}?idUtilisateur=${idUtilisateur}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    wordBreak: "break-word",
                  }}
                >
                  {file.name}
                </a>
            }
          /> */}

                          <ListItemText
                            primary={
                              userRole === "Réception" &&
                              userRole != Departement.NOM ? (
                                <span
                                  style={{
                                    color: "inherit",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {file.name}
                                </span>
                              ) : (
                                <a
                                  href={`${file.url}?idUtilisateur=${idUtilisateur}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {file.name}
                                </a>
                              )
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 0.5 }}
                              >
                                Ajouté le{" "}
                                {/* {new Date(file.uploadDate).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )} */}
                                {file.uploadDate
                                  ? new Date(
                                      file.uploadDate
                                    ).toLocaleDateString("fr-FR")
                                  : "—"}
                              </Typography>
                            }
                          />
                        </Box>
                        <Box
                          sx={{ display: "flex", gap: 1, mt: { xs: 1, sm: 0 } }}
                        >
                          {/* {((userRole === Departement.NOM) || userRole === "administrateur") && ( */}
                          {/* <IconButton
                      onClick={() => {
                        setDateDialog(true);
                        setSelectedDate(file.uploadDate);
                        setSelectedFileId(file);
                      }}
                      color="primary"
                      size="small"
                    >
                      <EditOutlinedIcon />
                    </IconButton> */}
                          <IconButton
                            onClick={() => {
                              setDateDialog(true);
                              // normalize the date to YYYY-MM-DD
                              // const normalizedDate = file.uploadDate
                              // ? new Date(file.uploadDate).toISOString().split("T")[0]
                              // : "";
                              const normalizedDate = file.uploadDate
                                ? new Date(file.uploadDate).toLocaleDateString(
                                    "en-CA"
                                  )
                                : "";
                              setSelectedDate(normalizedDate);
                              setSelectedFileId(file);
                            }}
                            color="primary"
                            size="small"
                          >
                            <EditOutlinedIcon />
                          </IconButton>

                          {userRole === "Réception" &&
                          userRole != Departement.NOM &&
                          folder.FOLDER_TYPE != "fixed" ? (
                            <IconButton
                              edge="end"
                              component="a"
                              color="primary"
                            >
                              <DownloadOutlinedIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              edge="end"
                              component="a"
                              href={`${file.url}?download=1&idUtilisateur=${idUtilisateur}`} // download mode
                              onClick={() =>
                                toast.success("PDF téléchargé avec succès !" , { containerId: "modal2" })
                              }
                              color="primary"
                            >
                              <DownloadOutlinedIcon />
                            </IconButton>
                          )}

                          {/* )} */}

                          {["administrateur"].includes(
                            userRole?.toLowerCase()
                          ) && (
                            <IconButton
                              edge="end"
                              onClick={() => handleOpenDeleteDocDialog(file)}
                              color="primary"
                              size="small"
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                  {/* {totalPages > 1 && ( */}
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(event, value) => {
                      setPage(value); // update the page state
                      fetchDocuments(value);
                    }}
                    color="primary"
                  />
                  {/* )} */}
                </Box>
              )}
            </Paper>

            <ToastContainer position="bottom-center" containerId="modal2"/>
            <Dialog
              open={openDeleteDocDialog}
              onClose={handleCloseDeleteDocDialog}
            >
              <DialogTitle>Confirmation de suppression</DialogTitle>
              <DialogContent>
                <Typography>
                  Êtes-vous sûr de vouloir supprimer définitivement le document{" "}
                  <strong>{docToDelete?.name}</strong> ?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteDocDialog}>Annuler</Button>
                <Button
                  color="error"
                  variant="contained"
                  onClick={handleDeleteDoc}
                >
                  Supprimer définitivement
                </Button>
              </DialogActions>
            </Dialog>

            {/* ************************************* */}

            <Dialog
              open={dateDialog}
              onClose={handleCloseDialog}
              fullWidth
              maxWidth="xs"
            >
              <DialogTitle>Modifier date </DialogTitle>
              {/* pour {selectedFileId.filename} */}
              <DialogContent>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Date"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </FormControl>
              </DialogContent>

              <DialogActions>
                <Button onClick={handleCloseDialog}>Annuler</Button>
                <Button variant="contained" onClick={handleSaveDate}>
                  Sauvegarder
                </Button>
              </DialogActions>
            </Dialog>
          </Box>{" "}
        {/* </Box>
            )} */}

      {/* </Box> */}
    </>
  );
}

export default Document;
