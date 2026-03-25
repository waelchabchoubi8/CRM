import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { styled } from "@mui/material/styles";
import {
    TextField,
    Button,
    FormControl,
    Select,
    MenuItem,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { useSelector } from "react-redux";
import {
    Box,
    Card,
    Grid,
    Typography,
    Dialog,
    Chip,
    TablePagination,
    Paper
} from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
    Person,
    Phone,
    DirectionsCar,
    CalendarToday,
    Description,
    AspectRatio,
    BrandingWatermark,
    Home,
} from "@mui/icons-material";

import entete from '../images/entetenfdm.png';

const StyledCard = styled(Card)(({ theme }) => ({
    height: "100%",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
    },
}));

const ImageContainer = styled(Box)({
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    padding: "16px",
    "&::-webkit-scrollbar": {
        height: "8px",
    },
    "&::-webkit-scrollbar-track": {
        background: "#f1f1f1",
        borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
        background: "#888",
        borderRadius: "4px",
    },
});

const InfoItem = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    borderRadius: "8px",
    background: "rgba(118, 149, 255, 0.05)",
    transition: "all 0.2s ease",
    "&:hover": {
        background: "rgba(118, 149, 255, 0.1)",
        transform: "translateX(5px)",
    },
}));

const SOSList = () => {
    const [SOS, setSOS] = useState([]);
    const [page, setPage] = useState(0);
    const [statusDescriptions, setstatusDescriptions] = useState({});
    const [rowsPerPage, setRowsPerPage] = useState(6);
    const [status, setstatus] = useState({});
    const [pendingStatus, setPendingStatus] = useState({}); // Nouvel état pour le statut temporaire
    const connectedUser = useSelector((state) => state.user);
    const isAdmin = connectedUser?.ROLE === "administrateur";

    const fetchSOS = async () => {
        const response = await axios.get("http://192.168.1.170:3300/api/sos");
        const formattedData = response.data.data.map((reclamation) => ({
            ...reclamation,
        }));
        setSOS(formattedData);
    };

    useEffect(() => {
        fetchSOS();
    }, []);

    const [enteteBase64, setEnteteBase64] = useState('');

    useEffect(() => {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            setEnteteBase64(dataURL);
        }
        img.src = entete;
    }, []);

    const handlePrint = (reclamation) => {
        const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mission #${reclamation.id}</title>
        
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
            .footer-image {
              width: 100%;
              max-height: 12em;
              object-fit: contain;
             margin-top:-500px;
             text-align:end;
            }
            .content {
               margin-top:-800px;
              padding: 20px;
            }
            h1 { color: #ce362c; text-align:center; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; color: #ce362c; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0B4C69; color: white; }
          </style>
        </head>
      
      <body>
      <img src="${enteteBase64}" alt="En-tête" class="header-image">
          <div class="content">
            <h1>Ordre de mission SOS </h1>
                        <div class="section">
              <p class="section-title">Informations SOS</p>
              <div class="section">
                          <p><b>Client:</b>${reclamation.name}</p> 

                          <p><b>matricule fiscal/ Cin:</b>${reclamation.matricule_fiscal}<p> 
                       
                          <p><b>Téléphone:</b>${reclamation.phone_number}<p> 

                          <p><b>adresse:</b>${reclamation.address}<p> 
                        
                       
                          <p><b>Véhicule:</b>${reclamation.vehicule}</p> 
                        
                          <p><b>Dimension:</b>${reclamation.dimension}<p> 
                        
                          
                       
              </div>        
                
                      <div class="info-item">
                        <span class="label"><b>Description:</b></span>
                        <p>${reclamation.description}</p>
                      </div>
                
                      <div class="decision-section">
                        <span class="label"><b>status:</b></span> ${reclamation.status || 'En attente'}
                        
                      </div>
      
      </body>
      </html>
    `;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    //   const printContent = `
    //     <!DOCTYPE html>
    //     <html>
    //     <head>
    //       <title>SOS #${reclamation.id}</title>
    //       <style>
    //         <head>
    //         <title> </title>
    //         <style>
    //           @media print {
    //             body { -webkit-print-color-adjust: exact; }
    //           }
    //           body {
    //             font-family: Arial, sans-serif;
    //             margin: 0;
    //             padding: 20px;
    //           }
    //           .header-image {
    //             width: 100%;
    //             max-height: 100%;
    //             object-fit: contain;
    //           }
    //           .footer-image {
    //             width: 100%;
    //             max-height: 12em;
    //             object-fit: contain;
    //            margin-top:-500px;
    //            text-align:end;
    //           }
    //           .content {
    //              margin-top:-800px;
    //             padding: 20px;
    //           }
    //           h1 { color: #ce362c; text-align:center; }
    //           .section { margin-bottom: 20px; }
    //           .section-title { font-weight: bold; color: #ce362c; }
    //           table { border-collapse: collapse; width: 100%; }
    //           th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    //           th { background-color: #0B4C69; color: white; }
    //         </style>
    //     </head>
    //     <body>
    //       <div class="header">
    //         <div class="title">Fiche de Réclamation #${reclamation.id}</div>
    //       </div>

    //       <div class="info-grid">
    //         <div class="info-item">
    //           <span class="label">Client:</span> ${reclamation.name}
    //         </div>
    //         <div class="info-item">
    //           <span class="label">Téléphone:</span> ${reclamation.phone_number}
    //         </div>
    //         <div class="info-item">
    //           <span class="label">Véhicule:</span> ${reclamation.vehicule}
    //         </div>
    //         <div class="info-item">
    //           <span class="label">Dimension:</span> ${reclamation.dimension}
    //         </div>

    //       </div>

    //       <div class="info-item">
    //         <span class="label">Description:</span>
    //         <p>${reclamation.description}</p>
    //       </div>

    //       <div class="status-section">
    //         <span class="label">Décision:</span> ${
    //           reclamation.status || "En attente"
    //         }

    //       </div>

    //       <div class="images-container">
    //         ${reclamation.images
    //           ?.map(
    //             (img) => `
    //           <img src="${img}" class="image" alt="Photo réclamation"/>
    //         `
    //           )
    //           .join("")}
    //       </div>
    //     </body>
    //     </html>
    //   `;

    //   const printWindow = window.open("", "_blank");
    //   printWindow.document.write(printContent);
    //   printWindow.document.close();
    //   printWindow.focus();
    //   setTimeout(() => {
    //     printWindow.print();
    //   }, 500);
    // };

    const handlestatusChange = async (id, newStatus) => {
        try {
            const response = await axios.put(`http://192.168.1.170:3300/sos/${id}`, {
                status: newStatus,
            });

            if (response.data.success) {
                // Mise à jour de l'état status uniquement après validation réussie
                setstatus((prevstatus) => ({
                    ...prevstatus,
                    [id]: newStatus,
                }));
                setstatusDescriptions((prevDescriptions) => ({
                    ...prevDescriptions,
                    [id]: newStatus,
                }));
                // Réinitialiser le statut temporaire après validation
                setPendingStatus((prev) => {
                    const updated = { ...prev };
                    delete updated[id];
                    return updated;
                });
                fetchSOS(); // Rafraîchir les données
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
                <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold",  color: '#1c92f3ff'  }}
                >
                    SOS Dashboard
                </Typography>
            </Paper>

            <Grid container spacing={3}>
                {SOS.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(
                    (reclamation) => (
                        <Grid item xs={12} md={6} lg={4} key={reclamation.id}>
                            <StyledCard>
                                <Box sx={{ p: 3 }}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography

                                            sx={{
                                                padding: "8px 30px",
                                                borderRadius: "8px",
                                                display: "inline-block",
                                                fontWeight: "bold",
                                                color: "#fff",
                                                marginRight: "50%",
                                                backgroundColor:
                                                    (status[reclamation.id] || reclamation.status) ===
                                                        "En attente"
                                                        ? "#f44336"
                                                        : (status[reclamation.id] || reclamation.status) ===
                                                            "Traité"
                                                            ? "#2196f3"
                                                            : (status[reclamation.id] || reclamation.status) ===
                                                                "Annulée"
                                                                ? "#800080"
                                                                : "#757575",
                                            }}
                                        >
                                            Statut:{" "}
                                            {status[reclamation.id] ||
                                                reclamation.status ||
                                                "Non défini"}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            startIcon={<PrintIcon />}
                                            onClick={() => handlePrint(reclamation)}
                                        ></Button>
                                    </Box>

                                    <Grid container spacing={2} sx={{ mt: 2 }}>
                                        <Grid item xs={12}>
                                            <InfoItem>
                                                <Person sx={{ color: "#3572EF", mr: 2 }} />
                                                <Typography sx={{ fontWeight: "bold" }}>
                                                    Utilisateur :
                                                </Typography>
                                                <Typography>{reclamation.name}</Typography>
                                            </InfoItem>
                                        </Grid>
                                        <Grid item xs={12} >
                                            <InfoItem>
                                                <Phone sx={{ color: "#3572EF", mr: 2 }} />
                                                <Typography sx={{ fontWeight: "bold" }}>
                                                    Matricule fiscal/Cin :
                                                </Typography>
                                                <Typography>{reclamation.matricule_fiscal}</Typography>
                                            </InfoItem>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <InfoItem>
                                                <Phone sx={{ color: "#3572EF", mr: 2 }} />
                                                <Typography sx={{ fontWeight: "bold" }}>
                                                    Numéro téléphone :
                                                </Typography>
                                                <Typography>{reclamation.phone_number}</Typography>
                                            </InfoItem>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <InfoItem>
                                                <LocationOnIcon sx={{ color: "#3572EF", mr: 2 }} />
                                                <Typography sx={{ fontWeight: "bold" }}>
                                                    adresse :
                                                </Typography>
                                                <Typography>{reclamation.address}</Typography>
                                            </InfoItem>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <InfoItem>
                                                <DirectionsCar sx={{ color: "#3572EF", mr: 2 }} />
                                                <Typography sx={{ fontWeight: "bold" }}>
                                                    Véhicule :
                                                </Typography>
                                                <Typography>{reclamation.vehicule}</Typography>
                                            </InfoItem>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <InfoItem>
                                                <AspectRatio sx={{ color: "#3572EF", mr: 2 }} />
                                                <Typography sx={{ fontWeight: "bold" }}>
                                                    Dimension :
                                                </Typography>
                                                <Typography>{reclamation.dimension}</Typography>
                                            </InfoItem>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <InfoItem>
                                                <Description sx={{ color: "#3572EF", mr: 2 }} />
                                                <Typography sx={{ fontWeight: "bold" }}>
                                                    Description :
                                                </Typography>
                                                <Typography>{reclamation.description}</Typography>
                                            </InfoItem>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <InfoItem>
                                                <CalendarToday sx={{ color: "#3572EF", mr: 2 }} />
                                                <Typography sx={{ fontWeight: "bold" }}>
                                                    Date :
                                                </Typography>
                                                <Typography>{moment(reclamation.date_creation).format("DD/MM/YYYY HH:mm:ss")}</Typography>
                                            </InfoItem>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Grid item xs={12}>
                                    <InfoItem sx={{ display: "flex", gap: 1 }}>
                                        <FormControl fullWidth>
                                            <Select
                                                value={
                                                    pendingStatus[reclamation.id] ||
                                                    status[reclamation.id] ||
                                                    reclamation.status ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setPendingStatus({
                                                        ...pendingStatus,
                                                        [reclamation.id]: e.target.value,
                                                    })
                                                }

                                            >
                                                <MenuItem value="">Select status</MenuItem>
                                                <MenuItem value="En attente">En attente</MenuItem>
                                                <MenuItem value="Annulée">Annulée</MenuItem>
                                                <MenuItem value="Traité">Traité</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() =>
                                                handlestatusChange(
                                                    reclamation.id,
                                                    pendingStatus[reclamation.id] ||
                                                    status[reclamation.id] ||
                                                    reclamation.status
                                                )
                                            }
                                        >
                                            valider
                                        </Button>
                                    </InfoItem>
                                </Grid>
                            </StyledCard>
                        </Grid>
                    )
                )}
            </Grid>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <TablePagination
                    component="div"
                    count={SOS.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[6, 12, 24]}
                />
            </Box>
        </Box>
    );
};

export default SOSList;