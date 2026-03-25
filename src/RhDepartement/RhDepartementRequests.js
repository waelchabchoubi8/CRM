import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  Box,
  FormControl,
} from "@mui/material";
import { Pagination } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import BASE_URL from "../Utilis/constantes";
import { useSelector } from "react-redux";
import entete from "../images/sahar up.png";
import { PrintOutlined } from "@mui/icons-material";

const RHdemands = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openStateDialog, setOpenStateDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    USER_NAME: "",
    EMPLOYEE: "",
    DEMAND_DATE: "",
    DEMAND_TYPE: "",
    DESCRIPTION: "",
    BEGIN_DATE: "",
    END_DATE: "",
    STATE: "",
  });
  const [editing, setEditing] = useState(false);
  const [enteteBase64, setEnteteBase64] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 50;
  const [currentDate] = useState(new Date().toLocaleString());
  // New state for filters
  const [filters, setFilters] = useState({
    EMPLOYEE: "",
    DEMAND_DATE: "",
    DEMAND_TYPE: "",
  });

  const handleStateChange = async (demandId, newState) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/updateDemandRhState/${demandId}`,
        {
          STATE: newState,
          PAR: user?.LOGIN,
        }
      );

      if (response.status === 200) {
        fetchUsers();
        alert("État de la demande modifié avec succès.");
      }
    } catch (error) {
      console.error("Error updating state:", error);
      alert("Erreur lors de la modification de l'état.");
    }
  };
  const handleStateChangeadmin  = async (demandId, newState) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/updateDemandRhStateAdmin/${demandId}`,
        {
          STATE_ADMIN: newState,
          PAR: user?.LOGIN,
        }
      );

      if (response.status === 200) {
        fetchUsers();
        alert("État de la demande modifié avec succès.");
      }
    } catch (error) {
      console.error("Error updating state:", error);
      alert("Erreur lors de la modification de l'état.");
    }
  };

  const renderStateCell = (demand) => {
    const baseStyles = {
      borderRadius: "8px",
      padding: "8px 12px",
      minWidth: "140px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
    };

    const selectStyles = {
      ...baseStyles,
      ...getStateStyle(demand.STATE),
      "&:hover": {
        boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
      },
      "& .MuiSelect-select": {
        padding: "8px 12px",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },
    };

    const spanStyles = {
      ...baseStyles,
      ...getStateStyle(demand.STATE),
      display: "inline-block",
      textAlign: "center",
    };

    return (
      <Select
        value={demand.STATE}
        onChange={(e) => handleStateChange(demand.ID, e.target.value)}
        sx={selectStyles}
        variant="outlined"
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              "& .MuiMenuItem-root": {
                padding: "10px 16px",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              },
            },
          },
        }}
      >
        <MenuItem value="En cours" sx={{ color: "#f4b942" }}>
          En cours
        </MenuItem>
        <MenuItem value="Approuvé" sx={{ color: "#2e7d32" }}>
          Approuvé
        </MenuItem>
        <MenuItem value="Refusé" sx={{ color: "#d32f2f" }}>
          Refusé
        </MenuItem>
      </Select>
    );

    return <span style={spanStyles}>{demand.STATE}</span>;
  };

    const renderStateCellAdmin = (demand) => {
    const baseStyles = {
      borderRadius: "8px",
      padding: "8px 12px",
      minWidth: "140px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
    };

    const selectStyles = {
      ...baseStyles,
      ...getStateStyle(demand.STATE_ADMIN),
      "&:hover": {
        boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
      },
      "& .MuiSelect-select": {
        padding: "8px 12px",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },
    };

    const spanStyles = {
      ...baseStyles,
      ...getStateStyle(demand.STATE_ADMIN),
      display: "inline-block",
      textAlign: "center",
    };

  const isAchref =
    demand?.USER_NAME?.trim() === "Achref";

  if (
    demand.DEMAND_TYPE !== "Démission" &&
    !(demand.DEMAND_TYPE === "Mission" && isAchref)
  ) {
    return null;
  }

  return (
    <Select
      value={demand.STATE_ADMIN || "En cours"}
      onChange={(e) => handleStateChangeadmin(demand.ID, e.target.value)}
      sx={selectStyles}
      variant="outlined"
      disabled={user?.ROLE?.trim() !== "administrateur"}
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            "& .MuiMenuItem-root": {
              padding: "10px 16px",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            },
          },
        },
      }}
    >
      <MenuItem value="En cours" sx={{ color: "#f4b942" }}>
        En cours
      </MenuItem>
      <MenuItem value="Approuvé" sx={{ color: "#2e7d32" }}>
        Approuvé
      </MenuItem>
      <MenuItem value="Refusé" sx={{ color: "#d32f2f" }}>
        Refusé
      </MenuItem>
    </Select>
  );
  };

  const user = useSelector((state) => state.user);

  useEffect(() => {
    fetchUsers();
    convertEnteteToBase64();
  }, [page, filters]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/demandesRH`, {
        params: {
          page: page,
          pageSize: itemsPerPage,
          EMPLOYEE: filters.EMPLOYEE,
          DEMAND_DATE: filters.DEMAND_DATE,
          DEMAND_TYPE: filters.DEMAND_TYPE,
        },
      });

      const { data, pagination } = response.data;
      setUsers(data || []);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Erreur lors de la récupération des demandes.");
      setUsers([]);
    }
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      EMPLOYEE: "",
      DEMAND_DATE: "",
      DEMAND_TYPE: "",
    });
    setPage(1);
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette demande?"))
      return;
    try {
      await axios.delete(`${BASE_URL}/api/deleteDemandRh/${id}`);
      fetchUsers();
      alert("Demande supprimée avec succès.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Erreur lors de la suppression de la demande.");
    }
  };

  const formatToLocalDateTime = (date) => {
    if (!date) return "";
    const utcDate = new Date(date);
    const adjustedDate = new Date(utcDate.getTime());
    const year = adjustedDate.getFullYear();
    const month = String(adjustedDate.getMonth() + 1).padStart(2, "0");
    const day = String(adjustedDate.getDate()).padStart(2, "0");
    const hours = String(adjustedDate.getHours()).padStart(2, "0");
    const minutes = String(adjustedDate.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const handleOpenDialog = (userToEdit) => {
    if (userToEdit) {
      setEditing(true);
      setCurrentUser({
        ...userToEdit,
        DEMAND_DATE: formatToLocalDateTime(userToEdit.DEMAND_DATE),
        BEGIN_DATE: formatToLocalDateTime(userToEdit.BEGIN_DATE),
        END_DATE: formatToLocalDateTime(userToEdit.END_DATE),
      });
    } else {
      setEditing(false);
      const now = new Date();
      setCurrentUser({
        USER_NAME: user?.LOGIN || "",
        EMPLOYEE: "",
        DEMAND_DATE: formatToLocalDateTime(now),
        DEMAND_TYPE: "",
        DESCRIPTION: "",
        BEGIN_DATE: "",
        END_DATE: "",
        STATE: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser({
      USER_NAME: "",
      DEMAND_DATE: "",
      DEMAND_TYPE: "",
      DESCRIPTION: "",
      BEGIN_DATE: "",
      END_DATE: "",
      STATE: "",
    });
    setEditing(false);
  };

  const handleOpenStateDialog = (userToEdit) => {
    setCurrentUser(userToEdit);
    setOpenStateDialog(true);
  };

  const handleCloseStateDialog = () => {
    setOpenStateDialog(false);
  };

  const handleSaveUser = async () => {
    try {
      const requiredFields = [
        "USER_NAME",
        "DEMAND_DATE",
        "DEMAND_TYPE",
        "DESCRIPTION",
      ];
      const missingFields = requiredFields.filter(
        (field) => !currentUser[field]
      );

      if (missingFields.length > 0) {
        alert(
          `Veuillez remplir les champs suivants : ${missingFields.join(", ")}`
        );
        return;
      }

      const apiEndpoint = editing
        ? `${BASE_URL}/api/updateDemandRh/${currentUser.ID}`
        : `${BASE_URL}/api/createDemandRh`;

      const apiMethod = editing ? "put" : "post";
      const formatDate = (date) => {
        const dateObj = new Date(date);
        return dateObj.toISOString();
      };

      const requestData = {
        USER_NAME: currentUser.USER_NAME,
        DEMAND_DATE: formatDate(currentUser.DEMAND_DATE),
        DEMAND_TYPE: currentUser.DEMAND_TYPE,
        EMPLOYEE: currentUser.EMPLOYEE,
        DESCRIPTION: currentUser.DESCRIPTION,
        BEGIN_DATE: formatDate(currentUser.BEGIN_DATE),
        END_DATE: formatDate(currentUser.END_DATE),
        STATE: currentUser.STATE || "En cours",
      };

      const response = await axios[apiMethod](apiEndpoint, requestData, {
        timeout: 5000,
      });

      if (response.status === 201 || response.status === 200) {
        fetchUsers();
        handleCloseDialog();
        alert(`Demande ${editing ? "modifiée" : "ajoutée"} avec succès.`);
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      let errorMessage = "Erreur lors de la sauvegarde de la demande.";

      if (error.response) {
        errorMessage = `Server Error: ${error.response.status} - ${
          error.response.data.error ||
          error.response.data.message ||
          "Unknown error"
        }`;
        if (error.response.data.details) {
          console.error("Error details:", error.response.data.details);
        }
      } else if (error.request) {
        errorMessage =
          "Pas de réponse du serveur. Veuillez réessayer plus tard.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage =
          "La requête a expiré. Veuillez vérifier votre connexion et réessayer.";
      }
      alert(errorMessage);
    }
  };

  const handleSaveState = async () => {
    try {
      if (!currentUser.STATE) {
        alert("Veuillez sélectionner un état pour la demande");
        return;
      }

      const response = await axios.put(
        `${BASE_URL}/api/updateDemandRhState/${currentUser.ID}`,
        {
          STATE: currentUser.STATE,
          UPDATED_BY: user?.LOGIN,
        }
      );

      if (response.status === 200) {
        fetchUsers();
        handleCloseStateDialog();
        alert("État de la demande modifié avec succès.");
      }
    } catch (error) {
      console.error("Error saving state:", error);
      alert("Erreur lors de la modification de l'état de la demande.");
    }
  };
  const getStateStyle = (state) => {
    switch (state) {
      case "En cours":
        return {
          backgroundColor: "#FFF176",
          color: "#000000",
          padding: "5px 10px",
          borderRadius: "4px",
        };
      case "Approuvé":
        return {
          backgroundColor: "#81C784",
          color: "#000000",
          padding: "5px 10px",
          borderRadius: "4px",
        };
      case "Refusé":
        return {
          backgroundColor: "#E57373",
          color: "#000000",
          padding: "5px 10px",
          borderRadius: "4px",
        };
      default:
        return {
          backgroundColor: "#E0E0E0",
          color: "#000000",
          padding: "5px 10px",
          borderRadius: "4px",
        };
    }
  };
  const convertEnteteToBase64 = () => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(this, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      setEnteteBase64(dataURL);
    };
    img.onerror = function (err) {
      console.error("Error loading image for Base64 conversion:", err);
    };
    img.src = entete;
  };
  const handlePrint = () => {
    if (!enteteBase64) {
      alert("L'image d'en-tête n'est pas encore chargée.");
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Liste des demandes </title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .header-image {
              width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            .content {
              padding: 20px;
            }
            h1 { color: #ce362c; text-align: center; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0B4C69; color: white; }
          </style>
        </head>
        <body>
          <img src="${enteteBase64}" alt="En-tête" class="header-image">
          <div class="content">
            <h1>Liste des demandes </h1>
            <table>
              <thead>
                <tr>
                  <th>Date demande</th>
                  <th>Utilisateur CRM</th>
                  <th>Nom et prénom</th>
                  <th>Type de demande</th>
                  <th>Description</th>
                  <th>Date de début</th>
                  <th>Date de fin</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                ${users
                  .map(
                    (u) => `
                  <tr>
                    <td>${new Date(u.DEMAND_DATE).toLocaleString()}</td>
                    <td>${u.USER_NAME}</td>
                    <td>${u.EMPLOYEE}</td>
                    <td>${u.DEMAND_TYPE}</td>
                    <td>${u.DESCRIPTION}</td>
                    <td>${
                      u.BEGIN_DATE
                        ? new Date(u.BEGIN_DATE).toLocaleString()
                        : "-"
                    }</td>
                    <td>${
                      u.END_DATE ? new Date(u.END_DATE).toLocaleString() : "-"
                    }</td>
                    <td>${u.STATE}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("Liste des demandes ");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    } else {
      console.error("Failed to open print window.");
      alert("Impossible d'ouvrir la fenêtre d'impression.");
    }
  };

  const handlePrintRow = (demand) => {
    if (!enteteBase64) {
      alert("L'image d'en-tête n'est pas encore chargée.");
      return;
    }

    const printContent = `
     <html>
<head>
  <title>Demande d'${demand.DEMAND_TYPE} - ${demand.EMPLOYEE}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; }
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }
    .content {
      padding: 20px;
           margin-top: -800px;

    }
    p {
      line-height: 1.6;
      margin-bottom: 15px;
    }
    .header-image {
      width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    h1 { 
      color: #ce362c; 
      text-align: center;
    }
  </style>
</head>
<body>
  <img src="${enteteBase64}" alt="En-tête" class="header-image">
  <div class="content">
    <h1>${demand.DEMAND_TYPE} - ${demand.EMPLOYEE}</h1>
    
    <p>
      Une demande de ${demand.DEMAND_TYPE} a été soumise le ${new Date(
      demand.DEMAND_DATE
    ).toLocaleString()} 
      par ${demand.EMPLOYEE}.
    </p>
    
    <p>
      <strong>Description de la demande:</strong><br>
      ${demand.DESCRIPTION}
    </p>
    
    <p>
      <strong>Période concernée:</strong><br>
      Du ${
        demand.BEGIN_DATE ? new Date(demand.BEGIN_DATE).toLocaleString() : "-"
      } 
      au ${demand.END_DATE ? new Date(demand.END_DATE).toLocaleString() : "-"}
    </p>
    
    <p>
      <strong>État actuel de la demande administrative:</strong> ${demand.STATE}
    </p>
      <p>
      <strong>État actuel de la demande de la direction:</strong> ${demand.STATE_ADMIN}
    </p>
    <p>
      <strong>Date d'impression:</strong> ${currentDate}
    </p>
  </div>
</body>
</html>

    `;

    const printWindow = window.open(
      "",
      `${demand.DEMAND_TYPE}  - ${demand.USER_NAME}`
    );
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    } else {
      console.error("Failed to open print window.");
      alert("Impossible d'ouvrir la fenêtre d'impression.");
    }
  };

  return (
    <Grid container spacing={2} style={{ justifyContent: "center" }}>
      {/* Filter Section */}
      <Grid item xs={12}>
        <Box
          sx={{
            mb: 2,
            p: 2,
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Filtres
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Nom de l'employé"
                name="EMPLOYEE"
                value={filters.EMPLOYEE}
                onChange={handleFilterChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date de demande"
                type="date"
                name="DEMAND_DATE"
                value={filters.DEMAND_DATE}
                onChange={handleFilterChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Type de demande</InputLabel>
                <Select
                  name="DEMAND_TYPE"
                  value={filters.DEMAND_TYPE}
                  onChange={handleFilterChange}
                  label="Type de demande"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="Mission">Mission</MenuItem>
                  <MenuItem value="Récupération de salaire">
                    Récupération de salaire
                  </MenuItem>
                  <MenuItem value="Autorisation">Autorisation</MenuItem>
                  <MenuItem value="Congé">Congé</MenuItem>
                  <MenuItem value="Prêt d'investissement">
                    Prêt d'investissement
                  </MenuItem>
                  <MenuItem value="Avance sur salaire">
                    Avance sur salaire
                  </MenuItem>
                  <MenuItem value="Attestation de travail">
                    Attestation de travail
                  </MenuItem>
                  <MenuItem value="Augmentation de salaire">
                    Augmentation de salaire
                  </MenuItem>
                  <MenuItem value="Démission">Démission</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClearFilters}
                sx={{ mt: 1 }}
              >
                Réinitialiser les filtres
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "10px",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            style={{ marginRight: "10px" }}
          >
            Ajouter une demande RH
          </Button>
          <Button
            style={{ backgroundColor: "#3572EF", color: "#fff" }}
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Imprimer la liste des demandes
          </Button>
        </div>
      </Grid>
      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur CRM</TableCell>
                <TableCell>Nom de l'employé</TableCell>
                <TableCell>Date demande</TableCell>
                <TableCell>Type de demande</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date de début</TableCell>
                <TableCell>Date de fin</TableCell>
                <TableCell>État</TableCell>
                <TableCell>État administartive</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Imprimer</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.ID}>
                  <TableCell>{u.USER_NAME}</TableCell>
                  <TableCell>{u.EMPLOYEE}</TableCell>
                  <TableCell>
                    {new Date(u.DEMAND_DATE).toLocaleString()}
                  </TableCell>
                  <TableCell>{u.DEMAND_TYPE}</TableCell>
                  <TableCell>{u.DESCRIPTION} </TableCell>
                  <TableCell>
                    {u.BEGIN_DATE
                      ? new Date(u.BEGIN_DATE).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {u.END_DATE ? new Date(u.END_DATE).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>
                    {renderStateCell(u)}
                    {u.PAR !== null && u.PAR !== "" && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1, color: "#666" }}
                      >
                        {u.STATE} par: {u.PAR}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {renderStateCellAdmin(u)}

                    {/* ✅ Show only when DEMAND_TYPE === 'Démission' */}
                    {u.DEMAND_TYPE === "Démission" && u.PAR && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1, color: "#666" }}
                      >
                        {u.STATE_ADMIN} par: {u.PAR}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <IconButton
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(u)}
                      disabled={u.STATE !== "En cours"}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton color="blue" onClick={() => handlePrintRow(u)}>
                      <PrintOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Aucune demande trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editing ? "Modifier la demande RH" : "Ajouter une demande RH"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Utilisateur CRM"
            type="text"
            fullWidth
            value={currentUser.USER_NAME}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, USER_NAME: e.target.value })
            }
            disabled
          />
          <Typography>
            <strong>Nom de l'employé :</strong>
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label=""
            type="text"
            fullWidth
            value={currentUser.EMPLOYEE}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, EMPLOYEE: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Date demande"
            type="datetime-local"
            fullWidth
            value={currentUser.DEMAND_DATE.slice(0, 16)}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, DEMAND_DATE: e.target.value })
            }
          />
          <Typography>
            <strong>Type de demande :</strong>
          </Typography>
          <Select
            fullWidth
            value={currentUser.DEMAND_TYPE}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, DEMAND_TYPE: e.target.value })
            }
            margin="dense"
          >
            <MenuItem value="Mission">Mission</MenuItem>
            <MenuItem value="Récupération de salaire">
              Récupération de salaire
            </MenuItem>
            <MenuItem value="Autorisation">Autorisation</MenuItem>
            <MenuItem value="Congé">Congé</MenuItem>
            <MenuItem value="Prêt d'investissement ">
              Prêt d'investissement
            </MenuItem>
            <MenuItem value="Avance sur salaire">Avance sur salaire</MenuItem>
            <MenuItem value="Attestation de travail">
              Attestation de travail
            </MenuItem>
            <MenuItem value="Augmentation de salaire">
              Augmentation de salaire
            </MenuItem>

            <MenuItem value="Démission">Démission</MenuItem>
          </Select>
          <Typography>
            <strong>Motif de demande ( Description ) :</strong>
          </Typography>
          <TextField
            margin="dense"
            label=""
            type="text"
            fullWidth
            value={currentUser.DESCRIPTION}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, DESCRIPTION: e.target.value })
            }
          />
          <Typography>
            <strong>Date début :</strong>
          </Typography>

          <TextField
            margin="dense"
            label=""
            type="datetime-local"
            fullWidth
            value={currentUser.BEGIN_DATE.slice(0, 16)}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, BEGIN_DATE: e.target.value })
            }
          />
          <Typography>
            <strong>Date fin :</strong>
          </Typography>
          <TextField
            margin="dense"
            label=""
            type="datetime-local"
            fullWidth
            value={currentUser.END_DATE.slice(0, 16)}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, END_DATE: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleSaveUser} color="primary">
            {editing ? "Modifier" : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openStateDialog} onClose={handleCloseStateDialog}>
        <DialogTitle>Modifier l'état de la demande</DialogTitle>
        <DialogContent>
          <InputLabel>État</InputLabel>
          <Select
            fullWidth
            value={currentUser.STATE}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, STATE: e.target.value })
            }
            margin="dense"
          >
            <MenuItem value="En cours">En cours</MenuItem>
            <MenuItem value="Approuvé">Approuvé</MenuItem>
            <MenuItem value="Refusé">Refusé</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStateDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleSaveState} color="primary">
            Modifier l'état
          </Button>
        </DialogActions>
      </Dialog>
      <Grid
        item
        xs={12}
        sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
          showFirstButton
          showLastButton
        />
      </Grid>
    </Grid>
  );
};

export default RHdemands;