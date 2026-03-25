import React, { useEffect, useState } from "react";
import PublicIcon from "@mui/icons-material/Public";
import PrintIcon from "@mui/icons-material/Print";
import InventoryIcon from "@mui/icons-material/Inventory";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import MuseumIcon from '@mui/icons-material/Museum';
import {
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    TablePagination,
    Tooltip,
} from "@mui/material";
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AddCircleIcon from "@mui/icons-material/AddCircle";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import axios from "axios";
import { getArticleById } from "../Api";
import { styled } from "@mui/material/styles";
import BASE_URL from "../Utilis/constantes";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useSelector } from 'react-redux';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

const CommandesList = ({ type, searchTerm }) => {
    const [commandes, setCommandes] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [page, setPage] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isArticleDialogOpened, setArticleDialogOpened] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(21);
    const [total, setTotal] = useState(0);
    const [articles, setArticles] = useState([]);
    const [orderFiles, setOrderFiles] = useState({});
    const [numCmdMap, setNumCmdMap] = useState({}); 
    const [transporteurMap, setTransporteurMap] = useState({});
    const [savedLocation, setSavedLocation] = useState({});  
    const user = useSelector((state) => state.user);
    const [livreeMap, setLivreeMap] = useState({});
    const [locationMap, setLocationMap] = useState({});
    const [d41Status, setD41Status] = useState({});
    const [dateCmdMap, setDateCmdMap] = useState({});
    const [titreDateMap, setTitreDateMap] = useState({});
    const [fileUploadDialog, setFileUploadDialog] = useState({
        open: false,
        orderId: null,
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleCloseArticleDialog = () => {
        setArticleDialogOpened(false);
    };
    

    const handleCloseFileUploadDialog = () => {
        setFileUploadDialog({ open: false, orderId: null });
    };
    const checkD41Status = async (numCdeFournisseur) => {
    if (!numCdeFournisseur?.trim()) return;

    setD41Status(prev => ({ ...prev, [numCdeFournisseur]: "loading" }));

    try {
        const searchRes = await axios.get(`${BASE_URL}/api/offreCtc/all`, {
            params: {
                page: 1,
                pageSize: 10,
                num_cmd: numCdeFournisseur.trim()
            }
        });

        const items = searchRes.data?.data || searchRes.data || [];
        if (!Array.isArray(items) || items.length === 0) {
            setD41Status(prev => ({ ...prev, [numCdeFournisseur]: "not_in_offrectc" }));
            return;
        }

        // CORRECTION ICI : on prend bien le champ ID (majuscules)
        const id = items[0].ID;

        if (!id) {
            console.warn("ID manquant dans la réponse offreCtc", items[0]);
            setD41Status(prev => ({ ...prev, [numCdeFournisseur]: "not_in_offrectc" }));
            return;
        }

        // Deuxième appel avec l'ID correct
        const d41Res = await axios.get(`${BASE_URL}/api/uploadd41/${id}`);
        const d41Files = d41Res.data || [];

        if (d41Files.length === 0) {
            setD41Status(prev => ({ ...prev, [numCdeFournisseur]: "missing_d41" }));
        } else {
            setD41Status(prev => ({ ...prev, [numCdeFournisseur]: "ok" }));
        }

    } catch (err) {
        console.error("Erreur vérification D41 pour commande:", numCdeFournisseur, err);
        setD41Status(prev => ({ ...prev, [numCdeFournisseur]: "not_in_offrectc" }));
    }
};
useEffect(() => {
    commandes.forEach(cmd => {
        const numCmd = cmd.NUM_CDE_F;

        // 1. Chargement des données transport + DATE_CMD
        axios.get(`${BASE_URL}/api/cmd_location`, { params: { CMD: numCmd } })
            .then(res => {
                if (res.data.success && res.data.data.length > 0) {
                    const loc = res.data.data[0];
                    setSavedLocation(prev => ({ ...prev, [numCmd]: loc }));
                    setNumCmdMap(prev => ({ ...prev, [numCmd]: loc.NUM_CMD || "" }));
                    setTransporteurMap(prev => ({ ...prev, [numCmd]: loc.TRANSPORTEUR || "" }));
                    setLivreeMap(prev => ({ ...prev, [numCmd]: loc.LIVREE || 0 }));
                    setLocationMap(prev => ({ ...prev, [numCmd]: loc.LOCATION || "" }));
                    setDateCmdMap(prev => ({ ...prev, [numCmd]: loc.DATE_CMD || "" }));
                    setTitreDateMap(prev => ({ ...prev, [numCmd]: loc.TITRE_DATE || "" }));
                }
            })
            .catch(() => {});

        // 2. Vérification D41 pour toutes les commandes
        checkD41Status(numCmd);
    });
}, [commandes]);

    

    const GlowingBox = styled("div")(({ backgroundColor }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        boxShadow: "0 0 8px rgba(0, 0, 0, 0.3)",
        transition: "box-shadow 0.3s ease-in-out",
        padding: "10px",
        backgroundColor: backgroundColor,
        "&:hover": {
            boxShadow: "0 0 16px rgba(0, 0, 0, 0.5)",
        },
    }));

    const getGridSizes = (command) => {
        if (expanded === command.NUM_CDE_F) {
            return { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 };
        } else {
            return { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 };
        }
    };

    const fetchCommandes = async () => {
        try {
            const url = `${BASE_URL}/api/cmdFournisseurStore`;
            const params = { page, pageSize, searchTerm };
            const result = await axios.get(url, { params });
            setCommandes(result.data.commandes);
            setTotal(result.data.total);
        } catch (error) {
            console.error("Erreur lors de la récupération des commandes:", error);
        }
    };

    const fetchOrderFiles = async (orderId) => {
        try {
            const result = await axios.get(`${BASE_URL}/api/orderFiles/${orderId}`);
            setOrderFiles((prev) => ({ ...prev, [orderId]: result.data }));
        } catch (error) {
            console.error("Erreur lors de la récupération des fichiers:", error);
        }
    };
    const ExpandingIcon = styled(ExpandMoreIcon)`
    animation: bounce 1s infinite;
    @keyframes bounce {
      0%,
      20%,
      50%,
      80%,
      100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-8px);
      }
      60% {
        transform: translateY(-4px);
      }
    }
  `;
    useEffect(() => {
        fetchCommandes();
    }, [page, pageSize, searchTerm]);

    const handleCardClick = async (command) => {
        setExpanded((prev) =>
            prev === command.NUM_CDE_F ? null : command.NUM_CDE_F
        );
        try {
            const result = await axios.get(
                `${BASE_URL}/api/commandesFournisseurInfo`,
                {
                    params: { param: command.NUM_CDE_F },
                }
            );
            setArticles(result.data);
            fetchOrderFiles(command.NUM_CDE_F);

        } catch (error) {
            console.error("Erreur lors de la récupération des articles:", error);
        }
    };

    const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(
        file => file.size <= 50 * 1024 * 1024 &&
                ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
    );

    if (validFiles.length === 0) {
        alert("Aucun fichier valide (PDF, JPG, PNG ≤ 50 Mo)");
        return;
    }

    setLoading(true);
    try {
        for (const file of validFiles) {
            const formData = new FormData();
            formData.append("file", file);
            await axios.post(
                `${BASE_URL}/api/uploadOrderFile/${fileUploadDialog.orderId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
        }
        fetchOrderFiles(fileUploadDialog.orderId);
        handleCloseFileUploadDialog();
        alert(`${validFiles.length} fichier(s) uploadé(s)`);
    } catch (error) {
        alert("Échec de l'upload");
    } finally {
        setLoading(false);
    }
};

    const handleChangeRowsPerPage = (event) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString("fr-FR") : "-";
    };

    const getDeliveryStatus = (dateLivraison, dateCmd) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let status = "En cours";
    let color = "#3572EF";      // bleu par défaut
    let critical = false;

    // === 1. Gestion de la date de livraison prévue (comme avant) ===
    if (dateLivraison && dateLivraison !== "null" && dateLivraison.trim() !== "") {
        const deliveryDate = new Date(dateLivraison);
        if (!isNaN(deliveryDate.getTime())) {
            if (deliveryDate.toDateString() === today.toDateString()) {
                return { status: "Réception aujourd'hui", color: "red", critical: false };
            }
            if (deliveryDate < today) {
                return { status: "Reçue", color: "green", critical: false };
            }
            // sinon reste "En cours" + bleu
        }
    }

    // === 2. ALERTE CMD > 4 mois → on force rouge + critical (priorité max) ===
    if (dateCmd && dateCmd.trim() !== "" && dateCmd !== "null" && status== "En cours") {
        const cmdDate = new Date(dateCmd);
        if (!isNaN(cmdDate.getTime())) {
            const fourMonthsAgo = new Date();
            fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
            fourMonthsAgo.setHours(0, 0, 0, 0);

            if (cmdDate < fourMonthsAgo) {
                return {
                    status: "En cours",   // tu peux garder "En cours" si tu veux, mais c’est plus clair comme ça
                    color: "#d32f2f",
                    critical: true
                };
            }
        }
    }

    // === 3. Tout le reste → En cours normal (bleu) ===
    return { status, color, critical };
};

    const openArticleDialog = (articleId) => {
        if (articleId) {
            getArticleById(articleId, "cspd").then((article) => {
                setSelectedArticle(article);
                setArticleDialogOpened(true);
                setNewEmplacement(article.EMPLACEMENT_ART || "");
                setNewRayon(article.RAYON_ARTICLE || "");
            });
        } else {
            console.error(
                "Mismatch entre CFL_ARTICLE et CODE_ARTICLE, ou article indéfini"
            );
        }
    };

    const [newEmplacement, setNewEmplacement] = useState("");
    const [newRayon, setNewRayon] = useState("");

    const handleChangeEmplacement = (event) => {
        setNewEmplacement(event.target.value);
    };

    const handleChangeRayon = (event) => {
        setNewRayon(event.target.value);
    };

    const handleUpdateArticle = async () => {
        try {
            const articleId = selectedArticle.CODE_ARTICLE;
            const data = {
                EMPLACEMENT_ART: newEmplacement,
                RAYON_ARTICLE: newRayon,
            };

            await axios.post(
                `${BASE_URL}/api/updateEmplacementMagasin/${articleId}`,
                data
            );

            setSelectedArticle({
                ...selectedArticle,
                EMPLACEMENT_ART: newEmplacement,
                RAYON_ARTICLE: newRayon,
            });

            setArticleDialogOpened(false);
            alert("Article mis à jour avec succès");
            fetchCommandes();
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'article:", error);
            alert("Échec de la mise à jour de l'article");
        }
    };

    const calculateTotalProducts = (commandArticles) => {
        return commandArticles.reduce(
            (total, article) => total + (Number(article.CFL_QTE_C) || 0),
            0
        );
    };

    const handlePrint = (command, articlesList) => {
        const printContent = `
      <html>
        <head>
          <title>Commande ${command.NUM_CDE_F}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 20px; }
            .command-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0B4C69; color: white; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Détails de la Commande ${command.NUM_CDE_F}</h2>
          </div>
          <div class="command-info">
            <p><strong>Fournisseur:</strong> ${command.ADR_C_F_1}</p>
            <p><strong>Date de réception:</strong> ${formatDate(
            command.DATE_LIV_CF_P
        )}</p>
            <p><strong>Adresse:</strong> ${command.ADR_C_F_2}</p>
            <p><strong>Nombre de Contenaires:</strong> ${command.CF_CHAMP_3}</p>
            <p><strong>Traité par:</strong> ${command.CF_UTILIS}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th>Description</th>
                <th>Quantité</th>
              </tr>
            </thead>
            <tbody>
              ${articlesList
                .map(
                    (article) => `
                <tr>
                  <td>${article.CFL_ARTICLE}</td>
                  <td>${article.CFL_DES_ARTICLE}</td>
                  <td>${article.CFL_QTE_C}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div style="margin-top: 20px;">
            <p><strong>Total produits:</strong> ${calculateTotalProducts(
                    articlesList
                )}</p>
          </div>
        </body>
      </html>
    `;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
    <Grid container spacing={2}>
        {commandes.map((command) => {
            // === FIXED LOGIC: Use edited or saved DATE_CMD correctly ===
            const editedDateCmd = dateCmdMap[command.NUM_CDE_F] || "";
            const savedDateCmd = savedLocation[command.NUM_CDE_F]?.DATE_CMD || "";
            const finalDateCmd = editedDateCmd.trim() !== "" ? editedDateCmd.trim() : savedDateCmd;

            const { status, color, critical } = getDeliveryStatus(
                command.DATE_LIV_CF_P,
                finalDateCmd || null
            );

            const isDelivered = savedLocation[command.NUM_CDE_F]?.LIVREE === 1;

            return (
                <Grid
                    item
                    xs={getGridSizes(command).xs}
                    sm={getGridSizes(command).sm}
                    md={getGridSizes(command).md}
                    lg={getGridSizes(command).lg}
                    xl={getGridSizes(command).xl}
                    key={command.NUM_CDE_F}
                >
                    <Card
                        sx={{
                            borderRadius: 3,
                            transition: "all 0.4s ease",
                            backgroundColor: isDelivered ? "#e8f5e9" : critical ? "#ffebee" : "white",
                            border: critical ? "3px solid red" : isDelivered ? "3px solid #4caf50" : "1px solid #ddd",
                            boxShadow: critical 
                                ? "0 0 20px 5px rgba(255, 0, 0, 0.5)" 
                                : isDelivered 
                                    ? "0 0 15px rgba(76, 175, 80, 0.4)" 
                                    : "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                    >
                        <CardContent sx={{ cursor: "pointer", position: "relative", pb: 3 }}>
                            {/* Glowing status box */}
                            <GlowingBox backgroundColor={color} style={{ borderRadius: "12px" }}>
                                <Typography
                                    variant="h6"
                                    align="center"
                                    sx={{ color: "white", fontWeight: "bold", fontSize: "1.1rem" }}
                                >
                                    {command.ADR_C_F_1}{" "}
                                    <span style={{ fontSize: "0.9rem", fontWeight: "normal" }}>
                                        ({status})
                                    </span>
                                </Typography>
                            </GlowingBox>

                            {/* === REST OF YOUR CARD CONTENT (unchanged) === */}
                            <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mt: 2, fontWeight: "bold", color: "#545454" }}>
                                <LocalMallIcon sx={{ mr: 0.5 }} /> Commande: {command.NUM_CDE_F}
                            </Typography>
                                    <Typography
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: 10,
                                            marginTop: "10px",
                                            color: "#545454",
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                        }}
                                    >
                                        <MonetizationOnIcon style={{ marginRight: "0.3em" }} />
                                        Montant devise : {command.CF_MONTDEV ?? "-"} {command.CF_DEVISE ?? ""}
                                    </Typography>
                                    {/* === NEW: Lieu de Dépotage (only if LIVREE === 1) === */}
                                    {savedLocation[command.NUM_CDE_F]?.LIVREE === 1 && (
                                        <Typography
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                marginBottom: 10,
                                                marginTop: "10px",
                                                color: "#545454",
                                                fontWeight: "bold",
                                                fontSize: "16px",
                                            }}
                                        >
                                            <MuseumIcon style={{ marginRight: "0.3em",color: "#545454" }} />
                                            Lieu de Dépotage :{" "}
                                            <span style={{ marginLeft: 5, color: "#545454" }}>
                                                {savedLocation[command.NUM_CDE_F]?.LOCATION || "Non renseigné"}
                                            </span>
                                        </Typography>
                                    )}
                                    <Typography
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: 10,
                                            marginTop: "10px",
                                            color: "#545454",
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                        }}
                                    >
                                        <LocalShippingIcon style={{ marginRight: "0.3em" }} />
                                        Date de réception : {formatDate(command.DATE_LIV_CF_P)}
                                    </Typography>
                                    <Typography
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: 10,
                                            marginTop: "10px",
                                            color: "#545454",
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                        }}
                                    >
                                        <PublicIcon style={{ marginRight: "0.3em" }} />
                                        Adresse commande : {command.ADR_C_F_2}
                                    </Typography>
                                    <Typography
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: 10,
                                            marginTop: "10px",
                                            color: "#545454",
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                        }}
                                    >
                                        <InventoryIcon style={{ marginRight: "0.3em" }} />
                                        Nombre de Contenaires : {command.CF_CHAMP_3}
                                    </Typography>
                                    <Typography
    style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 10,
        marginTop: 10,
        color: "#545454",
        fontWeight: "bold",
        fontSize: "16px",
    }}
>
    <PersonIcon style={{ marginRight: 8 }} />
    Traité par : {" "}
    <span style={{ color: "red", marginLeft: 5 }}>
        {command.CF_UTILIS.replace(
            /\w\S*/g,
            (text) =>
                text.charAt(0).toUpperCase() +
                text.substring(1).toLowerCase()
        )}
    </span>
</Typography>

<Typography
    style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 10,
        marginTop: 10,
        color: "#545454",
        fontWeight: "bold",
        fontSize: "16px",
    }}
>
    <PendingActionsIcon style={{ marginRight: "0.3em" }} />
    Euro1 :{" "}
    {(() => {
        const euro1Date = dateCmdMap[command.NUM_CDE_F] || savedLocation[command.NUM_CDE_F]?.DATE_CMD || "";
        const isEditable = user?.ROLE?.trim() === "Import/Export" || user?.ROLE?.trim() === "administrateur";
        const isDelivered = savedLocation[command.NUM_CDE_F]?.LIVREE === 1;

        if (isEditable) {
            return (
                <TextField
                    type="date"
                    size="small"
                    value={euro1Date}
                    onChange={async (e) => {
                        const newDate = e.target.value;
                        setDateCmdMap(prev => ({ ...prev, [command.NUM_CDE_F]: newDate }));

                        const locationId = savedLocation[command.NUM_CDE_F]?.ID_CMD_LOCATION;
                        if (locationId) {
                            try {
                                await axios.patch(
                                    `${BASE_URL}/api/cmd_location/${locationId}/date`,
                                    { DATE_CMD: newDate || null }
                                );
                                setSavedLocation(prev => ({
                                    ...prev,
                                    [command.NUM_CDE_F]: {
                                        ...prev[command.NUM_CDE_F],
                                        DATE_CMD: newDate
                                    }
                                }));
                            } catch (err) {
                                alert("Échec mise à jour Euro1");
                                console.error(err);
                            }
                        }
                    }}
                    InputLabelProps={{ shrink: true }}
                    sx={{ ml: 1.5, minWidth: 180 }}
                    disabled={isDelivered}
                />
            );
        } else {
            // Read-only display for everyone else
            return (
                <span style={{ marginLeft: "12px"}}>
                    {euro1Date ? formatDate(euro1Date) : "Non renseigné"}
                </span>
            );
        }
    })()}
</Typography>
{/* ================= TITRE DATE ================= */}
{(() => {
    const titreDate =
        titreDateMap[command.NUM_CDE_F] ||
        savedLocation[command.NUM_CDE_F]?.TITRE_DATE ||
        "";

    const isRoleEditable =
        user?.ROLE?.trim() === "Import/Export" ||
        user?.ROLE?.trim() === "administrateur";

    const isDelivered =
        savedLocation[command.NUM_CDE_F]?.LIVREE === 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let isExpired = false;

    if (titreDate) {
        const dateValue = new Date(titreDate);
        const sixMonthsLater = new Date(dateValue);
        sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

        if (sixMonthsLater <= today && status !== "Reçue") {
            isExpired = true;
        }
    }

    const isEditable = isRoleEditable && status !== "Reçue";

    // 👉 IF STATUS IS "Reçue" → SIMPLE DISPLAY MODE
    if (status === "Reçue") {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                mt: 1,
                fontSize: "14px",
                color: "#545454",
            }}
        >
            <PendingActionsIcon
                sx={{ mr: 1, fontSize: 18, color: "#545454" }}
            />

            <span
                style={{
                    fontWeight: "bold",
                    color: isExpired ? "orange" : "#545454",
                    marginLeft: "4px"
                }}
            >
                Titre :
            </span>

            <span
                style={{
                    fontWeight: "bold",
                    color: isExpired ? "orange" : "#545454",
                    marginLeft: "4px"
                }}
            >
                {titreDate
                    ? formatDate(titreDate)
                    : "Non renseigné"}
            </span>
        </Box>
    );
}


    // 👉 NORMAL MODE
    return (
        <Typography
            sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: 2,
                marginTop: 1,
                fontWeight: "bold",
                fontSize: "16px",
                color: isExpired ? "orange" : "#545454",
            }}
        >
            <PendingActionsIcon
                sx={{
                    marginRight: 1,
                    color: isExpired ? "orange" : "#545454",
                }}
            />

            Titre :

            <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                {isEditable ? (
                    <TextField
                        type="date"
                        size="small"
                        value={titreDate}
                        onChange={async (e) => {
                            const newDate = e.target.value;

                            setTitreDateMap(prev => ({
                                ...prev,
                                [command.NUM_CDE_F]: newDate,
                            }));

                            const locationId =
                                savedLocation[command.NUM_CDE_F]?.ID_CMD_LOCATION;

                            if (locationId) {
                                await axios.patch(
                                    `${BASE_URL}/api/cmd_location/${locationId}/date`,
                                    { TITRE_DATE: newDate || null }
                                );
                            }
                        }}
                        sx={{
                            minWidth: 180,
                            borderRadius: 1,
                        }}
                       // disabled={isDelivered}
                    />
                ) : (
                    <span
                        style={{
                            color: isExpired ? "orange" : "inherit",
                            fontWeight: isExpired ? "bold" : "normal",
                            marginLeft: "4px"
                        }}
                    >
                        {titreDate
                            ? formatDate(titreDate)
                            : "Non renseigné"}
                    </span>
                )}

                {isExpired && (
                    <NewReleasesIcon
                        sx={{
                            ml: 1,
                            color: "orange",
                            fontSize: 20,
                        }}
                    />
                )}
            </Box>
        </Typography>
    );
})()}



                                     {/* ---- NEW CLICKABLE TRACKING BOX ---- */}
                                     {(user?.ROLE?.trim() === "Import/Export" || 
                                        user?.ROLE?.trim() === "administrateur") && (
                                     <Typography>
                                                {savedLocation[command.NUM_CDE_F] && (
                                            <Box
                                                sx={{
                                                    mt: 1,
                                                    p: 1,
                                                    border: "1px solid #4caf50",
                                                    borderRadius: 1,
                                                    bgcolor: "#e8f5e9",
                                                    cursor: "pointer",
                                                    "&:hover": { bgcolor: "#c8e6c9" },
                                                }}
                                                onClick={() => {
                                                    const loc = savedLocation[command.NUM_CDE_F];
                                                    const numCmd = loc.NUM_CMD;
                                                    const transporteur = loc.TRANSPORTEUR.toLowerCase();

                                                    // === SAFE COPY TO CLIPBOARD ===
                                                    if (navigator.clipboard && navigator.clipboard.writeText) {
                                                        navigator.clipboard.writeText(numCmd).catch(() => {});
                                                    } else {
                                                        const textArea = document.createElement("textarea");
                                                        textArea.value = numCmd;
                                                        document.body.appendChild(textArea);
                                                        textArea.focus();
                                                        textArea.select();
                                                        try {
                                                            document.execCommand("copy");
                                                        } catch (err) {
                                                            console.error("Copy failed", err);
                                                        }
                                                        document.body.removeChild(textArea);
                                                    }

                                                    // === OPEN TRACKING URL ===
                                                    let url = "";
                                                    if (transporteur === "cma-cgm") url = "https://www.cma-cgm.com/eBusiness/Tracking";
                                                    else if (transporteur === "maersk") url = `https://www.maersk.com/tracking/${numCmd}`;
                                                    else if (transporteur === "arkasline") url = "https://webtracking.arkasline.com.tr/shipmenttracking";
                                                    else if (transporteur === "msc") url = "https://www.msc.com/en/track-a-shipment";

                                                    if (url) window.open(url, "_blank");
                                                }}
                                            >
                                                <Typography variant="body2" color="success.main" fontWeight="bold">
                                                    Suivi : <strong>{savedLocation[command.NUM_CDE_F].TRANSPORTEUR}</strong> 
                                                    (CMD: <span style={{ textDecoration: "underline" }}>{savedLocation[command.NUM_CDE_F].NUM_CMD}</span>)
                                                </Typography>
                                            </Box>
                                        )}
                                        </Typography>)}
                                    <Typography
                                        onClick={() =>
                                            setFileUploadDialog({
                                                open: true,
                                                orderId: command.NUM_CDE_F,
                                            })
                                        }
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: 10,
                                            marginTop: 10,
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                            cursor: "pointer",
                                            userSelect: "none",
                                        }}
                                        sx={{ color: "primary.main" }}
                                    >
                                        <UploadFileIcon
                                            style={{ marginRight: 8, fontWeight: "bold" }}
                                        />
                                        Ajouter un fichier
                                    </Typography>
                                 {(user?.ROLE?.trim() === "administrateur" || user?.ROLE?.trim() === "Import/Export") && (
    <Box sx={{
        mt: 2,
        p: 2,
        border: "2px dashed #1976d2",
        borderRadius: 2,
        bgcolor: "#f8fbff",
        opacity: savedLocation[command.NUM_CDE_F]?.LIVREE === 1 ? 0.6 : 1,
    }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
            Associer un transporteur
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
           

            <TextField
                label="CMD (Numéro)"
                size="small"
                value={numCmdMap[command.NUM_CDE_F] || ""}
                onChange={(e) => setNumCmdMap(prev => ({ ...prev, [command.NUM_CDE_F]: e.target.value }))}
                sx={{ minWidth: 150 }}
                disabled={savedLocation[command.NUM_CDE_F]?.LIVREE === 1}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Armateur</InputLabel>
                <Select
                    value={transporteurMap[command.NUM_CDE_F] || ""}
                    label="Armateur"
                    onChange={(e) => setTransporteurMap(prev => ({ ...prev, [command.NUM_CDE_F]: e.target.value }))}
                    disabled={savedLocation[command.NUM_CDE_F]?.LIVREE === 1}
                >
                    <MenuItem value="CMA-CGM">CMA-CGM</MenuItem>
                    <MenuItem value="MAERSK">MAERSK</MenuItem>
                    <MenuItem value="ARKASLINE">ARKASLINE</MenuItem>
                    <MenuItem value="MSC">MSC</MenuItem>
                </Select>
            </FormControl>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={livreeMap[command.NUM_CDE_F] === 1}
                        onChange={(e) => setLivreeMap(prev => ({ ...prev, [command.NUM_CDE_F]: e.target.checked ? 1 : 0 }))}
                        disabled={savedLocation[command.NUM_CDE_F]?.LIVREE === 1}
                    />
                }
                label="Arrivé"
            />

            {livreeMap[command.NUM_CDE_F] === 1 && (
                <TextField
                    label="Lieu de Dépotage"
                    size="small"
                    value={locationMap[command.NUM_CDE_F] || ""}
                    onChange={(e) => setLocationMap(prev => ({ ...prev, [command.NUM_CDE_F]: e.target.value }))}
                    required
                    sx={{ minWidth: 180 }}
                    error={!locationMap[command.NUM_CDE_F]?.trim()}
                    helperText={!locationMap[command.NUM_CDE_F]?.trim() ? "Requis" : ""}
                    disabled={savedLocation[command.NUM_CDE_F]?.LIVREE === 1}
                />
            )}

            <Button
                variant="contained"
                size="medium"
                onClick={() => {
                    const cmd = command.NUM_CDE_F;
                    const numCmd = numCmdMap[cmd] || "";
                    const transporteur = transporteurMap[cmd] || "";
                    const livree = livreeMap[cmd] || 0;
                    const location = locationMap[cmd] || "";

                    if (!numCmd.trim() || !transporteur) {
                        alert("Numéro CMD et armateur obligatoires");
                        return;
                    }
                    if (livree === 1 && !location.trim()) {
                        alert("Lieu de dépotage requis quand 'Arrivé' est coché");
                        return;
                    }

                    const payload = {
                        CMD: cmd,
                        NUM_CMD: numCmd.trim(),
                        TRANSPORTEUR: transporteur,
                        LIVREE: livree,
                        LOCATION: livree === 1 ? location.trim() : null,
                        ...(dateCmdMap[cmd] && { DATE_CMD: dateCmdMap[cmd] }),
    ...(titreDateMap[cmd] && { TITRE_DATE: titreDateMap[cmd] }),
                    };

                    axios.get(`${BASE_URL}/api/cmd_location`, { params: { CMD: cmd } })
                        .then(res => {
                            const existing = res.data.success && res.data.data[0];

                            const request = existing
                                ? axios.put(`${BASE_URL}/api/cmd_location/${existing.ID_CMD_LOCATION}`, payload)
                                : axios.post(`${BASE_URL}/api/cmd_location`, payload);

                            return request;
                        })
                        .then(() => {
                            // Mise à jour locale immédiate
                            setSavedLocation(prev => ({ ...prev, [cmd]: { ...payload } }));
                            alert("Informations sauvegardées avec succès !");
                        })
                        .catch(err => {
                            console.error(err);
                            alert("Erreur : " + (err.response?.data?.message || "Impossible de sauvegarder"));
                        });
                }}
                disabled={savedLocation[command.NUM_CDE_F]?.LIVREE === 1}
            >
                Valider
            </Button>
        </Box>
    </Box>
)}
                                    <IconButton
                                        onClick={() => handleCardClick(command)}
                                        aria-expanded={expanded === command.NUM_CDE_F}
                                        sx={{ position: "absolute", top: 8, right: 8 }}
                                    >
                                        <Typography
                                            style={{
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                                color: "white",
                                            }}
                                        >
                                            Articles commandés
                                        </Typography>             
                                        <ExpandingIcon
                                            style={{ marginRight: "0.1em", color: "white" }}
                                        />
                                    </IconButton>
                                </CardContent>
                                                    
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 0.5 }}>
    {/* 1. Statut arrivée */}
    {savedLocation[command.NUM_CDE_F]?.LIVREE === 1 && (
        <Typography component="span" color="success.main" sx={{ fontWeight: "bold", fontSize: '1rem' }}>
            ✓ Arrivé -
        </Typography>
        
    )}

    {/* 2. Statut D41 – toujours visible dès qu’on a une réponse */}
    {d41Status[command.NUM_CDE_F] === "ok" && (
        <Typography component="span" color="success.main" sx={{ fontWeight: "bold", fontSize: '0.95rem' }}>
        D41 présent
        </Typography>
    )}

    {d41Status[command.NUM_CDE_F] === "not_in_offrectc" && (
        <Typography component="span" color="error" sx={{ fontWeight: "bold", fontSize: '0.95rem' }}>
            Non trouvé dans Test Technique
        </Typography>
    )}

    {d41Status[command.NUM_CDE_F] === "missing_d41" && (
        <Typography component="span" color="error" sx={{ fontWeight: "bold", fontSize: '0.95rem' }}>
            D41 manquant
        </Typography>
    )}

    {d41Status[command.NUM_CDE_F] === "loading" && (
        <Typography component="span" color="text.secondary" sx={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
            Vérification D41...
        </Typography>
    )}
</Box>

                                <Collapse
                                    in={expanded === command.NUM_CDE_F}
                                    timeout="auto"
                                    unmountOnExit
                                >
                                    
                                    <Box sx={{ p: 2 }}>
                                        {(user?.ROLE?.trim() === "Import/Export" || 
                                        user?.ROLE?.trim() === "administrateur" ||user?.ROLE?.trim() === 'Finance' || user?.ROLE?.trim() === 'directeur administratif financier') && (
                                                <>

                                        <Typography
                                            variant="h6"
                                            sx={{ mb: 2, fontWeight: "bold", color: "#333" }}
                                        >
                                            Fichiers associés
                                        </Typography>
                                        <List>
                                            {(orderFiles[command.NUM_CDE_F] || []).map((file) => (
                                                <ListItem
                                                    key={file.fileName}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        borderBottom: "1px solid #e0e0e0",
                                                        paddingY: 1.5,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <InsertDriveFileIcon
                                                            sx={{ color: "primary.main" }}
                                                        />

                                                        <Box>
                                                            <Typography
                                                                variant="subtitle1"
                                                                fontWeight="medium"
                                                            >
                                                                {file.fileName}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                Uploadé le : {formatDate(file.uploadedAt)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Tooltip title="Télécharger le fichier">
                                                        <IconButton
                                                            href={`${BASE_URL}/api/files/${command.NUM_CDE_F}/${file.fileName}`}
                                                            target="_blank"
                                                            size="small"
                                                            color="primary"
                                                        >
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </ListItem>
                                            ))}

                                            {(!orderFiles[command.NUM_CDE_F] ||
                                                orderFiles[command.NUM_CDE_F].length === 0) && (
                                                    <ListItem>
                                                        <ListItemText
                                                            primary="Aucun fichier associé"
                                                            primaryTypographyProps={{
                                                                color: "text.secondary",
                                                                fontStyle: "italic",
                                                            }}
                                                        />
                                                    </ListItem>
                                                )}
                                        </List>
                                        </>
                                    )}

                                        <Table>
                                            <TableHead>
                                                <Typography
                                                    sx={{
                                                        fontWeight: "bold",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        mb: 2,
                                                    }}
                                                >
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePrint(command, articles);
                                                        }}
                                                        sx={{ color: "black", mr: 1 }}
                                                    >
                                                        <PrintIcon />
                                                    </IconButton>
                                                    <InventoryIcon sx={{ mr: 1 }} />
                                                    Total produits: {calculateTotalProducts(articles)}
                                                </Typography>
                                                <TableRow>
                                                    <TableCell
                                                        style={{
                                                            backgroundColor: "#0B4C69",
                                                            color: "white",
                                                        }}
                                                    >
                                                        Article
                                                    </TableCell>
                                                    <TableCell
                                                        style={{
                                                            backgroundColor: "#0B4C69",
                                                            color: "white",
                                                        }}
                                                    >
                                                        Description
                                                    </TableCell>
                                                    <TableCell
                                                        style={{
                                                            backgroundColor: "#0B4C69",
                                                            color: "white",
                                                        }}
                                                    >
                                                        Quantité
                                                    </TableCell>
                                                    <TableCell
                                                        style={{
                                                            backgroundColor: "#0B4C69",
                                                            color: "white",
                                                        }}
                                                    ></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {articles.length > 0 &&
                                                    articles.map((cardItem) => (
                                                        <TableRow key={cardItem.CFL_ARTICLE}>
                                                            <TableCell>{cardItem.CFL_ARTICLE}</TableCell>
                                                            <TableCell>{cardItem.CFL_DES_ARTICLE}</TableCell>
                                                            <TableCell>{cardItem.CFL_QTE_C}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    onClick={() =>
                                                                        openArticleDialog(cardItem.CFL_ARTICLE)
                                                                    }
                                                                >
                                                                    <AddCircleIcon />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                </Collapse>
                            </Card>
                        </Grid>
                    );
                })}
            <Box
                sx={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    backgroundColor: "#fff",
                    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
                    padding: "2px 5px",
                    zIndex: 1000,
                }}
            >
                <TablePagination
                    rowsPerPageOptions={[10, 21, 50, 100]}
                    component="div"
                    count={total}
                    rowsPerPage={pageSize}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
            <Dialog
                open={fileUploadDialog.open}
                onClose={handleCloseFileUploadDialog}
                PaperProps={{
                    style: {
                        backgroundColor: "white",
                        boxShadow: "none",
                        borderRadius: "10px",
                    },
                }}
            >
                <DialogTitle style={{ backgroundColor: "#3572EF" }}>
                    <Typography style={{ color: "white", fontWeight: "bold" }}>
                        Uploader un fichier pour la commande {fileUploadDialog.orderId}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        style={{ marginTop: "20px" }}
                        disabled={loading}
                    />
                    {loading && <Typography>Upload en cours...</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseFileUploadDialog} disabled={loading}>
                        Annuler
                    </Button>
                </DialogActions>
            </Dialog>
            {loading && !fileUploadDialog.open ? (
                <Typography>Chargement des données...</Typography>
            ) : selectedArticle ? (
                <Dialog
                    open={isArticleDialogOpened}
                    onClose={handleCloseArticleDialog}
                    PaperProps={{
                        style: {
                            backgroundColor: "white",
                            boxShadow: "none",
                            borderRadius: "10px",
                        },
                    }}
                >
                    <DialogTitle
                        style={{ backgroundColor: "#3572EF" }}
                        id="alert-dialog-title"
                    >
                        <Typography style={{ color: "white", fontWeight: "bold" }}>
                            {selectedArticle.CODE_ARTICLE} : {selectedArticle.INTIT_ARTICLE}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <div>
                                <TextField
                                    style={{ marginTop: 20 }}
                                    label="Rayon"
                                    value={newRayon}
                                    onChange={handleChangeRayon}
                                    variant="outlined"
                                    fullWidth
                                />
                                <p>
                                    Rayon actuel :{" "}
                                    {selectedArticle.RAYON_ARTICLE ||
                                        "Pas d'information sur le rayon."}
                                </p>
                                <TextField
                                    style={{ marginTop: 20 }}
                                    label="Emplacement"
                                    value={newEmplacement}
                                    onChange={handleChangeEmplacement}
                                    variant="outlined"
                                    fullWidth
                                />
                                <p>
                                    Emplacement actuel :{" "}
                                    {selectedArticle.EMPLACEMENT_ART ||
                                        "Pas d'information sur l'emplacement."}
                                </p>
                            </div>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseArticleDialog}>Fermer</Button>
                        <Button onClick={handleUpdateArticle} color="primary">
                            Modifier
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : null}
        </Grid>
    );
};

export default CommandesList;
