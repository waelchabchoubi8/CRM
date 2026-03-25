// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Typography,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Checkbox,
//   FormHelperText,
//   Select,
//   Pagination,
//   ListItemText,
//   FormGroup,
//   FormControlLabel,
//   Chip,
// } from "@mui/material";

// import AddIcon from "@mui/icons-material/Add";
// import FolderOpenIcon from "@mui/icons-material/FolderOpen";
// import CloseIcon from "@mui/icons-material/Close";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

// import axios from "axios";
// import BASE_URL from "../Utilis/constantes";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import GlobalFolder from "../globalFolder/GlobalFolder";

// function FolderDocument({ Departement, userRole, currentUser, Departements }) {
//   const [folders, setFolders] = useState([]);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [openDialogDocPartager, setopenDialogDocPartager] = useState(false);
//   const [openDialogDocFix, setopenDialogDocFix] = useState(false);

//   const [newFolderName, setNewFolderName] = useState("");
//   const [newFolderNamePartage, setNewFolderNamePartage] = useState("");
//   const [newFolderNameFix, setNewFolderNameFix] = useState("");

//   const [activeFolder, setActiveFolder] = useState(null);
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [allUserOptions, setAllUserOptions] = useState([]); // full list
//   const [userOptions, setUserOptions] = useState([]);
//   const [editingFolder, setEditingFolder] = useState(null);
//   const [editingSharedFolder, setEditingSharedFolder] = useState(null);

//   const [folderToDelete, setFolderToDelete] = useState(null);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [departementOptions, setDepartementoptions] = useState([]);
//   const [selectedDepartements, setSelectedDepartements] = useState([]);
//   const [hasFixedFolderThisYear, sethasFixedFolderThisYear] = useState(false);

//   const [page, setPage] = useState(1);
//   const [limit] = useState(20);
//   const [totalPages, setTotalPages] = useState(1);

//   // key: departmentId, value: array of userIds selected for that department
//   const [departmentAccessMap, setDepartmentAccessMap] = useState({});

//   const currentYear = new Date().getFullYear();
//   const idUtilisateur = currentUser ? currentUser.ID_UTILISATEUR : null;

//   // Helper: keep selectedDepartements and departmentAccessMap in sync
//   function updateSelectedDepartments(newDeptIds) {
//     setSelectedDepartements(newDeptIds);

//     setDepartmentAccessMap((prev) => {
//       const next = {};
//       newDeptIds.forEach((id) => {
//         const dep = departementOptions.find((d) => d.ID === id);
//         const isDirectionDep =
//           dep && dep.NOM && dep.NOM.trim().toLowerCase() === "direction";

//         if (isDirectionDep) {
//           // Always include all users from "Direction"
//           const usersInDep = allUserOptions.filter(
//             (u) => u.DEPARTEMENT === dep.NOM
//           );
//           next[id] = usersInDep.map((u) => u.ID_UTILISATEUR);
//         } else {
//           // Keep previous choice if exists
//           next[id] = prev[id] || [];
//         }
//       });
//       return next;
//     });
//   }

//   useEffect(() => {
//     fetchFolders(page);
//   }, [page]);

//   useEffect(() => {
//     if (!Departement?.NOM) return;

//     const filteredUsers = allUserOptions.filter(
//       (u) => u.DEPARTEMENT === Departement.NOM
//     );
//     setUserOptions(filteredUsers);
//     setSelectedUsers(filteredUsers.map((f) => f.ID_UTILISATEUR));
//   }, [Departement, allUserOptions]);

//   useEffect(() => {
//     setDepartementoptions(Departements);
//     updateSelectedDepartments(Departements.map((f) => f.ID));
//   }, [Departements]);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get(`${BASE_URL}/api/users`);
//         setAllUserOptions(response.data);
//       } catch (error) {
//         console.error("Erreur lors du chargement des utilisateurs :", error);
//       }
//     };
//     fetchUsers();
//   }, []);

//   useEffect(() => {
//     setFolders([]);

//     if (idUtilisateur && Departement?.ID) {
//       fetchFolders(1);
//       const hasFixed = folders.some((folder) => {
//         const createdYear = new Date(folder.CREATED_AT).getFullYear();
//         return folder.FOLDER_TYPE === "fixed" && createdYear === currentYear;
//       });
//       sethasFixedFolderThisYear(hasFixed);
//     }
//   }, [idUtilisateur, Departement?.ID]);

//   useEffect(() => {
//     const hasFixed = folders.some((folder) => {
//       const createdYear = new Date(folder.CREATED_AT).getFullYear();
//       return folder.FOLDER_TYPE === "fixed" && createdYear === currentYear;
//     });
//     sethasFixedFolderThisYear(hasFixed);
//   }, [folders]);

//   const fetchFolders = async (page = 1) => {
//     try {
//       if (!idUtilisateur || !Departement?.ID) return;

//       const response = await fetch(
//         `${BASE_URL}/api/folders/${idUtilisateur}/${Departement.ID}?page=${page}&limit=${limit}`
//       );

//       if (!response.ok) {
//         toast.error("Impossible de charger les dossiers !", {
//           containerId: "modal1",
//         });
//       }

//       const data = await response.json();
//       setFolders(data?.data || []);
//       setTotalPages(data?.totalPages || 1);
//     } catch (error) {
//       console.error(error);
//       toast.error("Impossible de charger les dossiers !", {
//         containerId: "modal1",
//       });
//     }
//   };

//   const handleOpenDeleteDialog = (folder) => {
//     setFolderToDelete(folder);
//     setOpenDeleteDialog(true);
//   };

//   const handleCloseDeleteDialog = () => {
//     setFolderToDelete(null);
//     setOpenDeleteDialog(false);
//   };

//   const handleOpenDialogDocFix = () => {
//     setopenDialogDocFix(true);
//   };

//   const handleCloseDialogDocFix = () => {
//     setNewFolderNameFix("");
//     setopenDialogDocFix(false);
//   };

//   // ouvrir popup création dossier standard
//   const handleOpenDialog = () => {
//     setNewFolderName("");
//     if (!Departement?.NOM) return;

//     const filteredUsers = allUserOptions.filter(
//       (u) => u.DEPARTEMENT === Departement.NOM
//     );

//     setUserOptions(filteredUsers);
//     setSelectedUsers(filteredUsers.map((f) => f.ID_UTILISATEUR));
//     setOpenDialog(true);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//   };

//   // ouvrir popup création dossier partagé
//   const handleOpenDialogDocPArtager = () => {
//     setNewFolderNamePartage("");
//     setEditingSharedFolder(null);

//     const initialDeps = Departements.map((f) => f.ID);
//     updateSelectedDepartments(initialDeps);

//     setopenDialogDocPartager(true);
//   };

//   const handleCloseDialogDocPartager = () => {
//     setNewFolderNamePartage("");
//     setSelectedDepartements([]);
//     setDepartmentAccessMap({});
//     setEditingSharedFolder(null);
//     setopenDialogDocPartager(false);
//   };

//   const handleSaveFolderPartager = async () => {
//     if (editingSharedFolder) {
//       await updateSharedFolder();
//     } else {
//       await createSharedFolder();
//     }
//   };

//   // créer dossier partagé
//   const createSharedFolder = async () => {
//     if (!newFolderNamePartage.trim()) {
//       toast.error("Le nom du dossier est obligatoire !", {
//         containerId: "modal1",
//       });
//       return;
//     }

//     if (selectedDepartements.length === 0) {
//       toast.error("Veuillez sélectionner au moins un département !", {
//         containerId: "modal1",
//       });
//       return;
//     }

//     const someDeptWithoutUsers = selectedDepartements.some((depId) => {
//       const dep = departementOptions.find((d) => d.ID === depId);
//       if (!dep) return false;

//       const isDirectionDep =
//         dep.NOM && dep.NOM.trim().toLowerCase() === "direction";

//       // Direction: always has all users, so don't block on map content
//       if (isDirectionDep) return false;

//       return (
//         !departmentAccessMap[depId] ||
//         departmentAccessMap[depId].length === 0
//       );
//     });

//     if (someDeptWithoutUsers) {
//       toast.error(
//         "Veuillez sélectionner au moins un utilisateur pour chaque département !",
//         { containerId: "modal1" }
//       );
//       return;
//     }

//     try {
//       // admins + Réception (toujours accès global)
//       const defaultSelected = allUserOptions
//         .filter(
//           (user) => user.ROLE === "administrateur" || user.ROLE === "Réception"
//         )
//         .map((user) => user.ID_UTILISATEUR);

//       // inclure toujours le département courant
//       const mergedDepartments = Array.from(
//         new Set([...(selectedDepartements || []), Departement?.ID])
//       );

//       const departmentAccess = mergedDepartments.map((depId) => {
//         const dep = departementOptions.find((d) => d.ID === depId);
//         let ids = departmentAccessMap[depId] || [];

//         if (dep && dep.NOM && dep.NOM.trim().toLowerCase() === "direction") {
//           // Force all Direction users
//           const usersInDep = allUserOptions.filter(
//             (u) => u.DEPARTEMENT === dep.NOM
//           );
//           ids = usersInDep.map((u) => u.ID_UTILISATEUR);
//         }

//         return {
//           departmentId: depId,
//           userIds: ids,
//         };
//       });

//       const body = {
//         name: newFolderNamePartage.trim(),
//         folder_type: "shared",
//         departmentId: Departement?.ID,
//         createdBy: currentUser?.ID_UTILISATEUR,
//         departmentAccess, // [{ departmentId, userIds }]
//         userIds: defaultSelected, // global admins / Réception
//       };

//       const response = await fetch(`${BASE_URL}/api/folder`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       });

//       if (!response.ok) {
//         throw new Error("Erreur serveur");
//       }

//       await response.json();

//       fetchFolders(1);

//       setopenDialogDocPartager(false);
//       toast.success("Dossier Partager créé avec succès", {
//         containerId: "modal1",
//       });
//     } catch (error) {
//       console.error(error);
//       toast.error("Erreur lors de la création du dossier Partager !", {
//         containerId: "modal1",
//       });
//     }
//   };

//   const handleSaveFolderFix = async () => {
//     if (!newFolderNameFix.trim()) {
//       toast.error("Le nom du dossier est obligatoire !", {
//         containerId: "modal1",
//       });
//       return;
//     }

//     try {
//       const body = {
//         name: newFolderNameFix.trim(),
//         folder_type: "fixed",
//         departmentId: Departement?.ID,
//         createdBy: currentUser?.ID_UTILISATEUR,
//       };

//       const response = await fetch(`${BASE_URL}/api/folder`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       });

//       if (!response.ok) {
//         throw new Error("Erreur serveur");
//       }

//       await response.json();

//       fetchFolders(1);

//       setopenDialogDocFix(false);
//       toast.success("Dossier Fix créé avec succès", {
//         containerId: "modal1",
//       });
//     } catch (error) {
//       console.error(error);
//       toast.error("Erreur lors de la création du dossier Fix !", {
//         containerId: "modal1",
//       });
//     }
//   };

//   const handleSaveFolder = async () => {
//     if (editingFolder) {
//       await updateFolder();
//     } else {
//       await createFolder();
//     }
//   };

//   // créer dossier standard
//   const createFolder = async () => {
//     if (!newFolderName.trim()) {
//       toast.error("Le nom du dossier est obligatoire !", {
//         containerId: "modal1",
//       });
//       return;
//     }

//     if (selectedUsers.length === 0) {
//       toast.error("Veuillez sélectionner au moins un utilisateur !", {
//         containerId: "modal1",
//       });
//       return;
//     }

//     const defaultSelected = allUserOptions
//       .filter(
//         (user) => user.ROLE === "administrateur" || user.ROLE === "Réception"
//       )
//       .map((user) => user.ID_UTILISATEUR);

//     const finalUserIds = [...new Set([...selectedUsers, ...defaultSelected])];
//     setSelectedUsers(finalUserIds);

//     try {
//       const body = {
//         name: newFolderName.trim(),
//         parentId: null,
//         folder_type: "standard",
//         departmentId: Departement?.ID,
//         createdBy: currentUser?.ID_UTILISATEUR,
//         userIds: finalUserIds,
//       };

//       const response = await fetch(`${BASE_URL}/api/folder`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       });

//       if (!response.ok) {
//         throw new Error("Erreur serveur");
//       }

//       await response.json();
//       fetchFolders(1);

//       setOpenDialog(false);
//       toast.success("Dossier créé avec succès", { containerId: "modal1" });
//     } catch (error) {
//       console.error(error);
//       toast.error("Erreur lors de la création du dossier !", {
//         containerId: "modal1",
//       });
//     }
//   };

//   const updateFolder = async () => {
//     if (!editingFolder) return;

//     const trimmedName = newFolderName.trim();

//     const oldUserIds = editingFolder.ACCESS_USERS.map((u) => String(u.id));
//     const newUserIds = selectedUsers.map(String);

//     const nameChanged = trimmedName !== editingFolder.NAME;

//     const usersChanged =
//       oldUserIds.sort().join(",") !== newUserIds.sort().join(",");

//     if (!nameChanged && !usersChanged) {
//       toast.info("Aucun changement détecté", { containerId: "modal1" });
//       return;
//     }

//     const defaultSelected = allUserOptions
//       .filter(
//         (user) => user.ROLE === "administrateur" || user.ROLE === "Réception"
//       )
//       .map((user) => user.ID_UTILISATEUR);

//     const combinedSelectedUsers = Array.from(
//       new Set([...selectedUsers, ...defaultSelected])
//     );

//     try {
//       if (nameChanged) {
//         const resRename = await fetch(
//           `${BASE_URL}/api/folder/${editingFolder.ID}/rename`,
//           {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ newName: trimmedName }),
//           }
//         );
//         if (!resRename.ok) throw new Error("Erreur renommage dossier");
//       }

//       if (usersChanged) {
//         const resAccess = await fetch(
//           `${BASE_URL}/api/folder/${editingFolder.ID}/access`,
//           {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               userIds: combinedSelectedUsers.map(Number),
//               departmentIds: [],
//             }),
//           }
//         );
//         if (!resAccess.ok) throw new Error("Erreur mise à jour accès");
//       }

//       toast.success("Dossier mis à jour avec succès", {
//         containerId: "modal1",
//       });
//       fetchFolders(1);
//     } catch (err) {
//       console.error(err);
//       toast.error("Échec de la mise à jour du dossier", {
//         containerId: "modal1",
//       });
//     } finally {
//       setEditingFolder(null);
//       setOpenDialog(false);
//     }
//   };

//   // mise à jour dossier partagé
//   const updateSharedFolder = async () => {
//     if (!editingSharedFolder) return;

//     const trimmedName = newFolderNamePartage.trim();

//     if (!trimmedName) {
//       toast.error("Le nom du dossier est obligatoire !", {
//         containerId: "modal1",
//       });
//       return;
//     }

//     if (selectedDepartements.length === 0) {
//       toast.error("Veuillez sélectionner au moins un département !", {
//         containerId: "modal1",
//       });
//       return;
//     }

//     const someDeptWithoutUsers = selectedDepartements.some((depId) => {
//       const dep = departementOptions.find((d) => d.ID === depId);
//       if (!dep) return false;

//       const isDirectionDep =
//         dep.NOM && dep.NOM.trim().toLowerCase() === "direction";

//       if (isDirectionDep) return false;

//       return (
//         !departmentAccessMap[depId] ||
//         departmentAccessMap[depId].length === 0
//       );
//     });

//     if (someDeptWithoutUsers) {
//       toast.error(
//         "Veuillez sélectionner au moins un utilisateur pour chaque département !",
//         { containerId: "modal1" }
//       );
//       return;
//     }

//     const defaultSelected = allUserOptions
//       .filter(
//         (user) => user.ROLE === "administrateur" || user.ROLE === "Réception"
//       )
//       .map((user) => user.ID_UTILISATEUR);

//     const oldDeptIds = editingSharedFolder.ACCESS_DEPARTMENTS.map((u) =>
//       Number(u.id)
//     );
//     const newDeptIds = selectedDepartements.map((d) => Number(d));

//     const oldUserIds = (editingSharedFolder.ACCESS_USERS || []).map((u) =>
//       Number(u.id)
//     );

//     const newUsersFromDepts = Array.from(
//       new Set(
//         newDeptIds.flatMap((depId) => departmentAccessMap[depId] || [])
//       )
//     );
//     const newUserIds = Array.from(
//       new Set([...newUsersFromDepts, ...defaultSelected])
//     );

//     const nameChanged = trimmedName !== editingSharedFolder.NAME;

//     const departmentsChanged =
//       oldDeptIds.slice().sort((a, b) => a - b).join(",") !==
//       newDeptIds.slice().sort((a, b) => a - b).join(",");

//     const usersChanged =
//       oldUserIds.slice().sort((a, b) => a - b).join(",") !==
//       newUserIds.slice().sort((a, b) => a - b).join(",");

//     if (!nameChanged && !departmentsChanged && !usersChanged) {
//       toast.info("Aucun changement détecté", { containerId: "modal1" });
//       setEditingSharedFolder(null);
//       return;
//     }

//     const mergedDepartments = Array.from(
//       new Set([...newDeptIds, Departement?.ID])
//     );

//     const departmentAccess = mergedDepartments.map((depId) => {
//       const dep = departementOptions.find((d) => d.ID === depId);
//       let ids = departmentAccessMap[depId] || [];

//       if (dep && dep.NOM && dep.NOM.trim().toLowerCase() === "direction") {
//         const usersInDep = allUserOptions.filter(
//           (u) => u.DEPARTEMENT === dep.NOM
//         );
//         ids = usersInDep.map((u) => u.ID_UTILISATEUR);
//       }

//       return {
//         departmentId: depId,
//         userIds: ids,
//       };
//     });

//     try {
//       if (nameChanged) {
//         const resRename = await fetch(
//           `${BASE_URL}/api/folder/${editingSharedFolder.ID}/rename`,
//           {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ newName: trimmedName }),
//           }
//         );
//         if (!resRename.ok) {
//           throw new Error("Erreur renommage dossier partager");
//         }
//       }

//       if (departmentsChanged || usersChanged) {
//         const resAccess = await fetch(
//           `${BASE_URL}/api/folder/${editingSharedFolder.ID}/access`,
//           {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               departmentAccess,
//               userIds: defaultSelected,
//             }),
//           }
//         );
//         if (!resAccess.ok) {
//           throw new Error("Erreur mise à jour accès");
//         }
//       }

//       toast.success("Dossier partager mis à jour avec succès", {
//         containerId: "modal1",
//       });
//       fetchFolders(1);
//     } catch (err) {
//       console.error(err);
//       toast.error("Échec de la mise à jour du dossier partager", {
//         containerId: "modal1",
//       });
//     } finally {
//       setEditingSharedFolder(null);
//       setopenDialogDocPartager(false);
//     }
//   };

//   const handleEditClick = (folder) => {
//     setOpenDialog(true);
//     setNewFolderName(folder.NAME);
//     const userIds = folder.ACCESS_USERS.map((u) => parseInt(u.id));
//     setSelectedUsers(userIds);
//     setEditingFolder(folder);
//   };

//   const handleEditSharedClick = (folder) => {
//     setNewFolderNamePartage(folder.NAME);

//     const depIds = folder.ACCESS_DEPARTMENTS.map((u) => parseInt(u.id));
//     const folderUserIds = (folder.ACCESS_USERS || []).map((u) =>
//       parseInt(u.id)
//     );
//     const map = {};
//     depIds.forEach((depId) => {
//       const dep = departementOptions.find((d) => d.ID === depId);
//       if (!dep) return;

//       const usersInDep = allUserOptions.filter(
//         (u) => u.DEPARTEMENT === dep.NOM
//       );
//       map[depId] = usersInDep
//         .filter((u) => folderUserIds.includes(u.ID_UTILISATEUR))
//         .map((u) => u.ID_UTILISATEUR);
//     });

//     setDepartmentAccessMap(map);
//     updateSelectedDepartments(depIds);

//     setEditingSharedFolder(folder);
//     setopenDialogDocPartager(true);
//   };

//   const handleEditFixedClick = (folder) => {
//     setNewFolderNameFix(folder.NAME);
//     setopenDialogDocFix(true);
//   };

//   const handleDeleteFolder = async () => {
//     if (!folderToDelete) return;

//     try {
//       const response = await fetch(
//         `${BASE_URL}/api/folder/${folderToDelete.ID}`,
//         {
//           method: "DELETE",
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Erreur lors de la suppression");
//       }

//       toast.success(
//         `Le dossier "${folderToDelete.NAME}" a été supprimé définitivement`,
//         { containerId: "modal1" }
//       );
//       fetchFolders(1);
//     } catch (error) {
//       console.error(error);
//       toast.error("Impossible de supprimer le dossier", {
//         containerId: "modal1",
//       });
//     } finally {
//       handleCloseDeleteDialog();
//     }
//   };

//   // Helpers for nicer per-department user UI
//   const toggleUserInDepartment = (depId, userId) => {
//     const dep = departementOptions.find((d) => d.ID === depId);
//     if (dep && dep.NOM && dep.NOM.trim().toLowerCase() === "direction") {
//       // Direction users can't be toggled
//       return;
//     }

//     setDepartmentAccessMap((prev) => {
//       const current = prev[depId] || [];
//       const exists = current.includes(userId);
//       const nextForDep = exists
//         ? current.filter((id) => id !== userId)
//         : [...current, userId];
//       return { ...prev, [depId]: nextForDep };
//     });
//   };

//   const toggleAllUsersInDepartment = (depId, usersInDep) => {
//     const dep = departementOptions.find((d) => d.ID === depId);
//     if (dep && dep.NOM && dep.NOM.trim().toLowerCase() === "direction") {
//       // Direction can't be toggled
//       return;
//     }

//     setDepartmentAccessMap((prev) => {
//       const current = prev[depId] || [];
//       const allIds = usersInDep.map((u) => u.ID_UTILISATEUR);
//       const allSelected = allIds.every((id) => current.includes(id));
//       return {
//         ...prev,
//         [depId]: allSelected ? [] : allIds,
//       };
//     });
//   };

//   return (
//     <Box
//       sx={{
//         p: 3,
//         mb: 3,
//       }}
//     >
//       <Paper
//         sx={{
//           p: 3,
//           boxShadow: "none",
//           border: "1px solid #f5f5f5",
//           borderRadius: 2,
//           mb: 3,
//         }}
//       >
//         {/* bouton création dossier */}
//         <Box mb={2}>
//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={handleOpenDialog}
//             sx={{ mr: 2 }}
//           >
//             Créer un dossier
//           </Button>

//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={handleOpenDialogDocPArtager}
//             sx={{ mr: 2 }}
//           >
//             Créer un dossier Partager
//           </Button>

//           {currentUser.ROLE === "Réception" && (
//             <Button
//               disabled={hasFixedFolderThisYear}
//               variant="contained"
//               startIcon={<AddIcon />}
//               onClick={handleOpenDialogDocFix}
//             >
//               Créer un dossier Fix
//             </Button>
//           )}
//         </Box>

//         {/* liste des dossiers */}
//         {folders.length === 0 ? (
//           <Typography variant="body1" color="textSecondary">
//             Aucun dossier créé pour le moment.
//           </Typography>
//         ) : (
//           <>
//             <TableContainer component={Paper}>
//               <Table>
//                 <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
//                   <TableRow>
//                     <TableCell>Nom du dossier</TableCell>
//                     <TableCell>Créateur</TableCell>
//                     <TableCell>Type</TableCell>
//                     <TableCell>Date de création</TableCell>
//                     <TableCell>Actions</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {folders.map((folder, index) => (
//                     <TableRow
//                       key={`${folder.id}-${index}`}
//                       hover
//                       sx={{ cursor: "pointer" }}
//                     >
//                       <TableCell>
//                         <Box display="flex" alignItems="center" gap={1}>
//                           <FolderOpenIcon color="primary" />
//                           {folder.NAME}
//                         </Box>
//                       </TableCell>
//                       <TableCell>{folder.CREATED_BY.username}</TableCell>
//                       <TableCell>{folder.FOLDER_TYPE}</TableCell>
//                       <TableCell>
//                         {new Date(folder.CREATED_AT).toLocaleString("fr-FR", {
//                           year: "numeric",
//                           month: "2-digit",
//                           day: "2-digit",
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </TableCell>
//                       <TableCell>
//                         {(userRole === "Réception" &&
//                           Departement.NOM === "Réception") ||
//                         userRole === "administrateur" ||
//                         (userRole === "Import/Export" &&
//                           folder.FOLDER_TYPE !== "fixed") ? (
//                           <IconButton
//                             onClick={() => {
//                               if (folder.FOLDER_TYPE === "standard") {
//                                 handleEditClick(folder);
//                               } else if (folder.FOLDER_TYPE === "shared") {
//                                 handleEditSharedClick(folder);
//                               }
//                             }}
//                             color="primary"
//                             size="small"
//                           >
//                             <EditOutlinedIcon />
//                           </IconButton>
//                         ) : (
//                           <IconButton
//                             color="primary"
//                             size="small"
//                             sx={{ visibility: "hidden" }}
//                           >
//                             <EditOutlinedIcon />
//                           </IconButton>
//                         )}

//                         <IconButton
//                           onClick={() => setActiveFolder(folder)}
//                           color="primary"
//                           size="small"
//                         >
//                           <VisibilityOutlinedIcon />
//                         </IconButton>

//                         {userRole === "administrateur" && (
//                           <IconButton
//                             edge="end"
//                             color="primary"
//                             size="small"
//                             onClick={() => handleOpenDeleteDialog(folder)}
//                           >
//                             <DeleteOutlineIcon />
//                           </IconButton>
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             <Box display="flex" justifyContent="center" mt={2}>
//               <Pagination
//                 count={totalPages}
//                 page={page}
//                 onChange={(event, value) => setPage(value)}
//                 color="primary"
//                 size="medium"
//                 shape="rounded"
//               />
//             </Box>
//           </>
//         )}

//         {/* popup dossier standard */}
//         <Dialog
//           open={openDialog}
//           onClose={(event, reason) => {
//             if (reason === "backdropClick") return;
//             handleCloseDialog();
//           }}
//           fullWidth
//           maxWidth="xs"
//         >
//           <DialogTitle>Créer un nouveau dossier</DialogTitle>
//           <DialogContent>
//             {/* Nom du dossier */}
//             <FormControl
//               fullWidth
//               sx={{ mt: 1 }}
//               error={!newFolderName.trim()}
//             >
//               <TextField
//                 autoFocus
//                 margin="dense"
//                 label="Nom du dossier"
//                 fullWidth
//                 value={newFolderName}
//                 onChange={(e) => setNewFolderName(e.target.value)}
//                 required
//                 error={!newFolderName.trim()}
//               />
//               {!newFolderName.trim() && (
//                 <FormHelperText>Nom du dossier obligatoire</FormHelperText>
//               )}
//             </FormControl>

//             {/* Utilisateurs autorisés */}
//             <FormControl
//               fullWidth
//               variant="outlined"
//               size="small"
//               sx={{ mt: 2 }}
//               required
//               error={
//                 selectedUsers.filter(
//                   (id) => id !== currentUser.ID_UTILISATEUR
//                 ).length === 0 &&
//                 Departement.NOM !== currentUser.DEPARTEMENT
//               }
//             >
//               <InputLabel id="user-select-label">
//                 Utilisateurs autorisés
//               </InputLabel>

//               <Select
//                 labelId="user-select-label"
//                 multiple
//                 value={selectedUsers}
//                 onChange={(e) => {
//                   const value = e.target.value;

//                   if (value.includes("all")) {
//                     const selectableUsers = userOptions.filter(
//                       (u) => u.ID_UTILISATEUR !== currentUser.ID_UTILISATEUR
//                     );

//                     const allOthersSelected = selectableUsers.every((u) =>
//                       selectedUsers.includes(u.ID_UTILISATEUR)
//                     );

//                     if (allOthersSelected) {
//                       setSelectedUsers([currentUser.ID_UTILISATEUR]);
//                     } else {
//                       setSelectedUsers(
//                         userOptions.map((u) => u.ID_UTILISATEUR)
//                       );
//                     }
//                   } else {
//                     const newSelection =
//                       typeof value === "string" ? value.split(",") : value;

//                     const cleaned = newSelection.filter(
//                       (id) => id !== currentUser.ID_UTILISATEUR
//                     );

//                     const finalSelection = Array.from(
//                       new Set([...cleaned, currentUser.ID_UTILISATEUR])
//                     );

//                     setSelectedUsers(finalSelection);
//                   }
//                 }}
//                 label="Utilisateurs autorisés"
//                 renderValue={(selected) =>
//                   selected
//                     .map(
//                       (id) =>
//                         userOptions.find((u) => u.ID_UTILISATEUR === id)
//                           ?.UTILISATEUR
//                     )
//                     .filter(Boolean)
//                     .join(", ")
//                 }
//                 MenuProps={{
//                   PaperProps: { style: { maxHeight: 300, width: 300 } },
//                 }}
//               >
//                 <MenuItem value="all">
//                   <Checkbox
//                     checked={userOptions
//                       .filter(
//                         (u) => u.ID_UTILISATEUR !== currentUser.ID_UTILISATEUR
//                       )
//                       .every((u) => selectedUsers.includes(u.ID_UTILISATEUR))}
//                     indeterminate={
//                       selectedUsers.length > 1 &&
//                       !userOptions
//                         .filter(
//                           (u) => u.ID_UTILISATEUR !== currentUser.ID_UTILISATEUR
//                         )
//                         .every((u) => selectedUsers.includes(u.ID_UTILISATEUR))
//                     }
//                   />
//                   <ListItemText
//                     primary={
//                       userOptions
//                         .filter(
//                           (u) => u.ID_UTILISATEUR !== currentUser.ID_UTILISATEUR
//                         )
//                         .every((u) => selectedUsers.includes(u.ID_UTILISATEUR))
//                         ? "Tout désélectionner"
//                         : "Tout sélectionner"
//                     }
//                   />
//                 </MenuItem>

//                 {userOptions.map((user) => {
//                   const isCurrentUser =
//                     user.ID_UTILISATEUR === currentUser.ID_UTILISATEUR;

//                   return (
//                     <MenuItem
//                       key={user.ID_UTILISATEUR}
//                       value={user.ID_UTILISATEUR}
//                       disabled={isCurrentUser}
//                       style={{ opacity: isCurrentUser ? 0.7 : 1 }}
//                     >
//                       <Checkbox
//                         checked={selectedUsers.includes(user.ID_UTILISATEUR)}
//                         disabled={isCurrentUser}
//                       />
//                       <ListItemText
//                         primary={user.UTILISATEUR}
//                         secondary={isCurrentUser ? "Vous" : undefined}
//                       />
//                     </MenuItem>
//                   );
//                 })}
//               </Select>

//               <FormHelperText>
//                 {(() => {
//                   const othersCount = selectedUsers.filter(
//                     (id) => id !== currentUser.ID_UTILISATEUR
//                   ).length;
//                   const isError =
//                     othersCount === 0 &&
//                     Departement.NOM !== currentUser.DEPARTEMENT;

//                   if (isError) {
//                     return "Sélection obligatoire – vous êtes automatiquement inclus";
//                   }
//                 })()}
//               </FormHelperText>
//             </FormControl>
//           </DialogContent>

//           <DialogActions>
//             <Button onClick={handleCloseDialog}>Annuler</Button>
//             <Button
//               variant="contained"
//               onClick={handleSaveFolder}
//               disabled={
//                 !newFolderName ||
//                 (selectedUsers.filter(
//                   (id) => id !== currentUser.ID_UTILISATEUR
//                 ).length === 0 &&
//                   Departement.NOM !== currentUser.DEPARTEMENT)
//               }
//             >
//               Créer
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* popup dossier partagé */}
//         <Dialog
//           open={openDialogDocPartager}
//           onClose={(event, reason) => {
//             if (reason === "backdropClick") return;
//             handleCloseDialogDocPartager();
//           }}
//           fullWidth
//           maxWidth="xs"
//         >
//           <DialogTitle>
//             {editingSharedFolder
//               ? "Modifier le dossier partagé"
//               : "Créer un nouveau dossier partagé"}
//           </DialogTitle>
//           <DialogContent>
//             {/* Nom du dossier */}
//             <FormControl
//               fullWidth
//               sx={{ mt: 1 }}
//               error={!newFolderNamePartage.trim()}
//             >
//               <TextField
//                 autoFocus
//                 margin="dense"
//                 label="Nom du dossier"
//                 fullWidth
//                 value={newFolderNamePartage}
//                 onChange={(e) => setNewFolderNamePartage(e.target.value)}
//                 required
//                 error={!newFolderNamePartage.trim()}
//               />
//               {!newFolderNamePartage.trim() && (
//                 <FormHelperText>Nom du dossier obligatoire</FormHelperText>
//               )}
//             </FormControl>

//             {/* Départements */}
//             <FormControl
//               fullWidth
//               variant="outlined"
//               size="small"
//               sx={{ mt: 2 }}
//               error={selectedDepartements.length === 0}
//             >
//               <InputLabel id="departement-select-label">
//                 Départements
//               </InputLabel>

//               <Select
//                 labelId="departement-select-label"
//                 multiple
//                 value={selectedDepartements}
//                 onChange={(e) => {
//                   const value = e.target.value;

//                   const currentDeptId = Departement.ID;
//                   const directionDept = departementOptions.find(
//                     (d) => d.NOM.trim().toLowerCase() === "direction"
//                   );
//                   const directionId = directionDept ? directionDept.ID : null;

//                   const forcedIds = [currentDeptId, directionId].filter(
//                     Boolean
//                   );

//                   if (value.includes("all")) {
//                     const selectable = departementOptions.filter(
//                       (d) => !forcedIds.includes(d.ID)
//                     );
//                     const allOthersSelected = selectable.every((d) =>
//                       selectedDepartements.includes(d.ID)
//                     );

//                     if (allOthersSelected) {
//                       updateSelectedDepartments(forcedIds);
//                     } else {
//                       updateSelectedDepartments(
//                         departementOptions.map((d) => d.ID)
//                       );
//                     }
//                   } else {
//                     const newValue =
//                       typeof value === "string" ? value.split(",") : value;

//                     const cleaned = newValue.filter(
//                       (id) => !forcedIds.includes(id)
//                     );

//                     updateSelectedDepartments(
//                       Array.from(new Set([...cleaned, ...forcedIds]))
//                     );
//                   }
//                 }}
//                 label="Départements"
//                 renderValue={(selected) =>
//                   selected
//                     .map(
//                       (id) => departementOptions.find((d) => d.ID === id)?.NOM
//                     )
//                     .filter(Boolean)
//                     .join(", ")
//                 }
//                 MenuProps={{
//                   PaperProps: { style: { maxHeight: 300, width: 300 } },
//                 }}
//               >
//                 <MenuItem value="all">
//                   <Checkbox
//                     checked={departementOptions
//                       .filter((d) => {
//                         const dir = departementOptions.find(
//                           (x) => x.NOM.trim().toLowerCase() === "direction"
//                         )?.ID;
//                         return d.ID !== Departement.ID && d.ID !== dir;
//                       })
//                       .every((d) => selectedDepartements.includes(d.ID))}
//                     indeterminate={
//                       selectedDepartements.length > 2 &&
//                       !departementOptions
//                         .filter(
//                           (d) =>
//                             d.ID !== Departement.ID &&
//                             d.ID !==
//                               departementOptions.find(
//                                 (x) =>
//                                   x.NOM.trim().toLowerCase() === "direction"
//                               )?.ID
//                         )
//                         .every((d) => selectedDepartements.includes(d.ID))
//                     }
//                   />
//                   <Typography variant="body2">
//                     {departementOptions
//                       .filter(
//                         (d) =>
//                           d.ID !== Departement.ID &&
//                           d.ID !==
//                             departementOptions.find(
//                               (x) => x.NOM.trim().toLowerCase() === "direction"
//                             )?.ID
//                       )
//                       .every((d) => selectedDepartements.includes(d.ID))
//                       ? "Tout désélectionner"
//                       : "Tout sélectionner"}
//                   </Typography>
//                 </MenuItem>

//                 {departementOptions.map((dep) => {
//                   const isCurrent = dep.ID === Departement.ID;
//                   const isDirection =
//                     dep.NOM.trim().toLowerCase() === "direction";
//                   const isForced = isCurrent || isDirection;

//                   return (
//                     <MenuItem
//                       key={dep.ID}
//                       value={dep.ID}
//                       disabled={isForced}
//                       style={{ opacity: isForced ? 0.6 : 1 }}
//                     >
//                       <Checkbox
//                         checked={selectedDepartements.includes(dep.ID)}
//                         disabled={isForced}
//                       />
//                       <Typography variant="body2">
//                         {dep.NOM}
//                         {isCurrent && " (actuel)"}
//                         {isDirection && " (Direction)"}
//                       </Typography>
//                     </MenuItem>
//                   );
//                 })}
//               </Select>

//               {selectedDepartements.length === 0 && (
//                 <FormHelperText>Sélection obligatoire</FormHelperText>
//               )}
//             </FormControl>

//             {/* Utilisateurs par département (nicer UI) */}
//             {selectedDepartements.map((depId) => {
//               const dep = departementOptions.find((d) => d.ID === depId);
//               if (!dep) return null;

//               const isDirectionDep =
//                 dep.NOM && dep.NOM.trim().toLowerCase() === "direction";

//               const usersInDep = allUserOptions.filter(
//                 (u) => u.DEPARTEMENT === dep.NOM
//               );

//               const baseSelectedUsersForDep = departmentAccessMap[depId] || [];
//               const allIds = usersInDep.map((u) => u.ID_UTILISATEUR);

//               // For Direction, treat all users as selected
//               const selectedUsersForDep = isDirectionDep
//                 ? allIds
//                 : baseSelectedUsersForDep;

//               if (usersInDep.length === 0) {
//                 return (
//                   <Paper
//                     key={depId}
//                     variant="outlined"
//                     sx={{ mt: 2, p: 1.5, borderStyle: "dashed" }}
//                   >
//                     <Typography variant="subtitle2" gutterBottom>
//                       {dep.NOM}
//                     </Typography>
//                     <Typography variant="body2" color="textSecondary">
//                       Aucun utilisateur trouvé pour ce département.
//                     </Typography>
//                   </Paper>
//                 );
//               }

//               const allSelected = allIds.every((id) =>
//                 selectedUsersForDep.includes(id)
//               );

//               return (
//                 <Paper
//                   key={depId}
//                   variant="outlined"
//                   sx={{ mt: 2, p: 1.5, borderRadius: 2 }}
//                 >
//                   <Box
//                     display="flex"
//                     justifyContent="space-between"
//                     alignItems="center"
//                     mb={1}
//                   >
//                     <Box display="flex" alignItems="center" gap={1}>
//                       <Typography variant="subtitle2">{dep.NOM}</Typography>
//                       <Chip
//                         size="small"
//                         label={`${selectedUsersForDep.length} sélectionné(s) / ${usersInDep.length}`}
//                       />
//                     </Box>
//                     {isDirectionDep ? (
//                       <Typography variant="caption" color="textSecondary">
//                         Tous les utilisateurs de ce département ont toujours
//                         accès.
//                       </Typography>
//                     ) : (
//                       <Button
//                         size="small"
//                         onClick={() =>
//                           toggleAllUsersInDepartment(depId, usersInDep)
//                         }
//                       >
//                         {allSelected
//                           ? "Tout désélectionner"
//                           : "Tout sélectionner"}
//                       </Button>
//                     )}
//                   </Box>

//                   <FormGroup>
//                     {usersInDep.map((user) => (
//                       <FormControlLabel
//                         key={user.ID_UTILISATEUR}
//                         control={
//                           <Checkbox
//                             checked={selectedUsersForDep.includes(
//                               user.ID_UTILISATEUR
//                             )}
//                             onChange={() =>
//                               !isDirectionDep &&
//                               toggleUserInDepartment(
//                                 depId,
//                                 user.ID_UTILISATEUR
//                               )
//                             }
//                             disabled={isDirectionDep}
//                           />
//                         }
//                         label={user.UTILISATEUR}
//                       />
//                     ))}
//                   </FormGroup>

//                   {!isDirectionDep &&
//                     baseSelectedUsersForDep.length === 0 && (
//                       <FormHelperText error sx={{ mt: 0.5 }}>
//                         Sélectionner au moins un utilisateur pour {dep.NOM}
//                       </FormHelperText>
//                     )}
//                 </Paper>
//               );
//             })}
//           </DialogContent>

//           <DialogActions>
//             <Button onClick={handleCloseDialogDocPartager}>Annuler</Button>
//             <Button
//               variant="contained"
//               onClick={handleSaveFolderPartager}
//               disabled={
//                 !newFolderNamePartage ||
//                 selectedDepartements.length === 0 ||
//                 selectedDepartements.some((depId) => {
//                   const dep = departementOptions.find((d) => d.ID === depId);
//                   if (!dep) return false;
//                   const isDirectionDep =
//                     dep.NOM && dep.NOM.trim().toLowerCase() === "direction";
//                   if (isDirectionDep) return false;
//                   return (
//                     !departmentAccessMap[depId] ||
//                     departmentAccessMap[depId].length === 0
//                   );
//                 })
//               }
//             >
//               {editingSharedFolder ? "Mettre à jour" : "Créer"}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* popup dossier fix */}
//         <Dialog
//           open={openDialogDocFix}
//           onClose={(event, reason) => {
//             if (reason === "backdropClick") return;
//             handleCloseDialogDocFix();
//           }}
//           fullWidth
//           maxWidth="xs"
//         >
//           <DialogTitle>Créer un nouveau dossier Fix</DialogTitle>
//           <DialogContent>
//             <FormControl
//               fullWidth
//               sx={{ mt: 1 }}
//               error={!newFolderNameFix.trim()}
//             >
//               <TextField
//                 autoFocus
//                 margin="dense"
//                 label="Nom du dossier"
//                 fullWidth
//                 value={newFolderNameFix}
//                 onChange={(e) => setNewFolderNameFix(e.target.value)}
//                 required
//                 error={!newFolderNameFix.trim()}
//               />
//               {!newFolderNameFix.trim() && (
//                 <FormHelperText>Nom du dossier obligatoire</FormHelperText>
//               )}
//             </FormControl>
//           </DialogContent>

//           <DialogActions>
//             <Button onClick={handleCloseDialogDocFix}>Annuler</Button>
//             <Button
//               variant="contained"
//               onClick={handleSaveFolderFix}
//               disabled={!newFolderNameFix}
//             >
//               Créer
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* popup dossier avec documents */}
//         {activeFolder && (
//           <Dialog
//             open={true}
//             onClose={() => setActiveFolder(null)}
//             fullWidth
//             maxWidth="md"
//           >
//             <DialogTitle
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 borderBottom: "1px solid #e0e0e0",
//                 pb: 1,
//               }}
//             >
//               <Box display="flex" alignItems="center" gap={1}>
//                 <FolderOpenIcon color="primary" /> {activeFolder.NAME}
//               </Box>
//               <IconButton onClick={() => setActiveFolder(null)}>
//                 <CloseIcon />
//               </IconButton>
//             </DialogTitle>

//             <DialogContent>
//               <GlobalFolder
//                 title={`Documents de ${activeFolder.name}`}
//                 Departement={Departement}
//                 userRole={userRole}
//                 folder={activeFolder}
//                 Departements={Departements}
//                 user={currentUser}
//                 parentFolder={activeFolder}
//               />
//             </DialogContent>
//           </Dialog>
//         )}

//         <ToastContainer position="bottom-center" containerId="modal1" />

//         <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
//           <DialogTitle>Confirmation de suppression</DialogTitle>
//           <DialogContent>
//             <Typography>
//               Êtes-vous sûr de vouloir supprimer définitivement le dossier{" "}
//               <strong>{folderToDelete?.NAME}</strong> ?
//             </Typography>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
//             <Button
//               color="error"
//               variant="contained"
//               onClick={handleDeleteFolder}
//             >
//               Supprimer définitivement
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Paper>
//     </Box>
//   );
// }

// export default FolderDocument;

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Checkbox,
  FormHelperText,
  Select,
  Pagination,
  ListItemText,
  FormGroup,
  FormControlLabel,
  Chip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import axios from "axios";
import BASE_URL from "../Utilis/constantes";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GlobalFolder from "../globalFolder/GlobalFolder";

function FolderDocument({ Departement, userRole, currentUser, Departements }) {
  const [folders, setFolders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogDocPartager, setopenDialogDocPartager] = useState(false);
  const [openDialogDocFix, setopenDialogDocFix] = useState(false);

  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderNamePartage, setNewFolderNamePartage] = useState("");
  const [newFolderNameFix, setNewFolderNameFix] = useState("");

  const [activeFolder, setActiveFolder] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUserOptions, setAllUserOptions] = useState([]); // full list
  const [userOptions, setUserOptions] = useState([]);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editingSharedFolder, setEditingSharedFolder] = useState(null);

  const [folderToDelete, setFolderToDelete] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [departementOptions, setDepartementoptions] = useState([]);
  const [selectedDepartements, setSelectedDepartements] = useState([]);
  const [hasFixedFolderThisYear, sethasFixedFolderThisYear] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  //FILTERS
  const [filterName, setFilterName] = useState("");
const [filterDate, setFilterDate] = useState("");
const [filterCreatedBy, setFilterCreatedBy] = useState("");


  // key: departmentId, value: array of userIds selected for that department
  const [departmentAccessMap, setDepartmentAccessMap] = useState({});

  const currentYear = new Date().getFullYear();
  const idUtilisateur = currentUser ? currentUser.ID_UTILISATEUR : null;

  // Helper: keep selectedDepartements and departmentAccessMap in sync
  function updateSelectedDepartments(newDeptIds) {
    setSelectedDepartements(newDeptIds);

    setDepartmentAccessMap((prev) => {
      const next = {};
      newDeptIds.forEach((id) => {
        const dep = departementOptions.find((d) => d.ID === id);
        const isDirectionDep =
          dep && dep.NOM && dep.NOM.trim().toLowerCase() === "direction";

        if (isDirectionDep) {
          // Always include all users from "Direction"
          const usersInDep = allUserOptions.filter(
            (u) => u.DEPARTEMENT === dep.NOM
          );
          next[id] = usersInDep.map((u) => u.ID_UTILISATEUR);
        } else {
          // Keep previous choice if exists
          next[id] = prev[id] || [];
        }
      });
      return next;
    });
  }

  useEffect(() => {
    fetchFolders(page);
  }, [page]);

  useEffect(() => {
    if (!Departement?.NOM) return;

    const filteredUsers = allUserOptions.filter(
      (u) => u.DEPARTEMENT === Departement.NOM
    );
    setUserOptions(filteredUsers);
    setSelectedUsers(filteredUsers.map((f) => f.ID_UTILISATEUR));
  }, [Departement, allUserOptions]);

  useEffect(() => {
    setDepartementoptions(Departements);
    updateSelectedDepartments(Departements.map((f) => f.ID));
  }, [Departements]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users`);
        setAllUserOptions(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs :", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    setFolders([]);

    if (idUtilisateur && Departement?.ID) {
      fetchFolders(1);
      const hasFixed = folders.some((folder) => {
        const createdYear = new Date(folder.CREATED_AT).getFullYear();
        return folder.FOLDER_TYPE === "fixed" && createdYear === currentYear;
      });
      sethasFixedFolderThisYear(hasFixed);
    }
  }, [idUtilisateur, Departement?.ID]);

  useEffect(() => {
    const hasFixed = folders.some((folder) => {
      const createdYear = new Date(folder.CREATED_AT).getFullYear();
      return folder.FOLDER_TYPE === "fixed" && createdYear === currentYear;
    });
    sethasFixedFolderThisYear(hasFixed);
  }, [folders]);

  const fetchFolders = async (page = 1) => {
    try {
      if (!idUtilisateur || !Departement?.ID) return;

      const params = new URLSearchParams({
  page,
  limit,
});

if (filterName) params.append("name", filterName);
if (filterDate) params.append("createdAt", filterDate);
if (filterCreatedBy) params.append("createdBy", filterCreatedBy);

const response = await fetch(
  `${BASE_URL}/api/folders/${idUtilisateur}/${Departement.ID}?${params.toString()}`
);


      if (!response.ok) {
        toast.error("Impossible de charger les dossiers !", {
          containerId: "modal1",
        });
      }

      const data = await response.json();
      setFolders(data?.data || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger les dossiers !", {
        containerId: "modal1",
      });
    }
  };

  const handleOpenDeleteDialog = (folder) => {
    setFolderToDelete(folder);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setFolderToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleOpenDialogDocFix = () => {
    setopenDialogDocFix(true);
  };

  const handleCloseDialogDocFix = () => {
    setNewFolderNameFix("");
    setopenDialogDocFix(false);
  };

  // ouvrir popup création dossier standard
  const handleOpenDialog = () => {
    setNewFolderName("");
    if (!Departement?.NOM) return;

    const filteredUsers = allUserOptions.filter(
      (u) => u.DEPARTEMENT === Departement.NOM
    );

    setUserOptions(filteredUsers);
    setSelectedUsers(filteredUsers.map((f) => f.ID_UTILISATEUR));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // ouvrir popup création dossier partagé
  const handleOpenDialogDocPArtager = () => {
    setNewFolderNamePartage("");
    setEditingSharedFolder(null);

    const initialDeps = Departements.map((f) => f.ID);
    updateSelectedDepartments(initialDeps);

    setopenDialogDocPartager(true);
  };

  const handleCloseDialogDocPartager = () => {
    setNewFolderNamePartage("");
    setSelectedDepartements([]);
    setDepartmentAccessMap({});
    setEditingSharedFolder(null);
    setopenDialogDocPartager(false);
  };

  const handleSaveFolderPartager = async () => {
    if (editingSharedFolder) {
      await updateSharedFolder();
    } else {
      await createSharedFolder();
    }
  };

  // créer dossier partagé
  const createSharedFolder = async () => {
    if (!newFolderNamePartage.trim()) {
      toast.error("Le nom du dossier est obligatoire !", {
        containerId: "modal1",
      });
      return;
    }

    if (selectedDepartements.length === 0) {
      toast.error("Veuillez sélectionner au moins un département !", {
        containerId: "modal1",
      });
      return;
    }

    const someDeptWithoutUsers = selectedDepartements.some((depId) => {
      const dep = departementOptions.find((d) => d.ID === depId);
      if (!dep) return false;

      const isDirectionDep =
        dep.NOM && dep.NOM.trim().toLowerCase() === "direction";

      // Direction: always has all users, so don't block on map content
      if (isDirectionDep) return false;

      return (
        !departmentAccessMap[depId] ||
        departmentAccessMap[depId].length === 0
      );
    });

    if (someDeptWithoutUsers) {
      toast.error(
        "Veuillez sélectionner au moins un utilisateur pour chaque département !",
        { containerId: "modal1" }
      );
      return;
    }

    try {
      // admins + Réception (toujours accès global)
      const defaultSelected = allUserOptions
        .filter(
          (user) => user.ROLE === "administrateur" || user.ROLE === "Réception"
        )
        .map((user) => user.ID_UTILISATEUR);

      // inclure toujours le département courant
      const mergedDepartments = Array.from(
        new Set([...(selectedDepartements || []), Departement?.ID])
      );

      const departmentAccess = mergedDepartments.map((depId) => {
        const dep = departementOptions.find((d) => d.ID === depId);
        let ids = departmentAccessMap[depId] || [];

        if (dep && dep.NOM && dep.NOM.trim().toLowerCase() === "direction") {
          // Force all Direction users
          const usersInDep = allUserOptions.filter(
            (u) => u.DEPARTEMENT === dep.NOM
          );
          ids = usersInDep.map((u) => u.ID_UTILISATEUR);
        }

        return {
          departmentId: depId,
          userIds: ids,
        };
      });

      const body = {
        name: newFolderNamePartage.trim(),
        folder_type: "shared",
        departmentId: Departement?.ID,
        createdBy: currentUser?.ID_UTILISATEUR,
        departmentAccess, // [{ departmentId, userIds }]
        userIds: defaultSelected, // global admins / Réception
      };

      const response = await fetch(`${BASE_URL}/api/folder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Erreur serveur");
      }

      await response.json();

      fetchFolders(1);

      setopenDialogDocPartager(false);
      toast.success("Dossier Partager créé avec succès", {
        containerId: "modal1",
      });
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création du dossier Partager !", {
        containerId: "modal1",
      });
    }
  };

  const handleSaveFolderFix = async () => {
    if (!newFolderNameFix.trim()) {
      toast.error("Le nom du dossier est obligatoire !", {
        containerId: "modal1",
      });
      return;
    }

    try {
      const body = {
        name: newFolderNameFix.trim(),
        folder_type: "fixed",
        departmentId: Departement?.ID,
        createdBy: currentUser?.ID_UTILISATEUR,
      };

      const response = await fetch(`${BASE_URL}/api/folder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Erreur serveur");
      }

      await response.json();

      fetchFolders(1);

      setopenDialogDocFix(false);
      toast.success("Dossier Fix créé avec succès", {
        containerId: "modal1",
      });
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création du dossier Fix !", {
        containerId: "modal1",
      });
    }
  };

  const handleSaveFolder = async () => {
    if (editingFolder) {
      await updateFolder();
    } else {
      await createFolder();
    }
  };

  useEffect(() => {
  setPage(1);
  fetchFolders(1);
}, [filterName, filterDate, filterCreatedBy]);


  // créer dossier standard
  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Le nom du dossier est obligatoire !", {
        containerId: "modal1",
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Veuillez sélectionner au moins un utilisateur !", {
        containerId: "modal1",
      });
      return;
    }

    const defaultSelected = allUserOptions
      .filter(
        (user) => user.ROLE === "administrateur" || user.ROLE === "Réception"
      )
      .map((user) => user.ID_UTILISATEUR);

    const finalUserIds = [...new Set([...selectedUsers, ...defaultSelected])];
    setSelectedUsers(finalUserIds);

    try {
      const body = {
        name: newFolderName.trim(),
        parentId: null,
        folder_type: "standard",
        departmentId: Departement?.ID,
        createdBy: currentUser?.ID_UTILISATEUR,
        userIds: finalUserIds,
      };

      const response = await fetch(`${BASE_URL}/api/folder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Erreur serveur");
      }

      await response.json();
      fetchFolders(1);

      setOpenDialog(false);
      toast.success("Dossier créé avec succès", { containerId: "modal1" });
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création du dossier !", {
        containerId: "modal1",
      });
    }
  };

  const updateFolder = async () => {
    if (!editingFolder) return;

    const trimmedName = newFolderName.trim();

    const oldUserIds = editingFolder.ACCESS_USERS.map((u) => String(u.id));
    const newUserIds = selectedUsers.map(String);

    const nameChanged = trimmedName !== editingFolder.NAME;

    const usersChanged =
      oldUserIds.sort().join(",") !== newUserIds.sort().join(",");

    if (!nameChanged && !usersChanged) {
      toast.info("Aucun changement détecté", { containerId: "modal1" });
      return;
    }

    const defaultSelected = allUserOptions
      .filter(
        (user) => user.ROLE === "administrateur" || user.ROLE === "Réception"
      )
      .map((user) => user.ID_UTILISATEUR);

    const combinedSelectedUsers = Array.from(
      new Set([...selectedUsers, ...defaultSelected])
    );

    try {
      if (nameChanged) {
        const resRename = await fetch(
          `${BASE_URL}/api/folder/${editingFolder.ID}/rename`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newName: trimmedName }),
          }
        );
        if (!resRename.ok) throw new Error("Erreur renommage dossier");
      }

      if (usersChanged) {
        const resAccess = await fetch(
          `${BASE_URL}/api/folder/${editingFolder.ID}/access`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userIds: combinedSelectedUsers.map(Number),
              departmentIds: [],
            }),
          }
        );
        if (!resAccess.ok) throw new Error("Erreur mise à jour accès");
      }

      toast.success("Dossier mis à jour avec succès", {
        containerId: "modal1",
      });
      fetchFolders(1);
    } catch (err) {
      console.error(err);
      toast.error("Échec de la mise à jour du dossier", {
        containerId: "modal1",
      });
    } finally {
      setEditingFolder(null);
      setOpenDialog(false);
    }
  };

  // mise à jour dossier partagé
  const updateSharedFolder = async () => {
    if (!editingSharedFolder) return;

    const trimmedName = newFolderNamePartage.trim();

    if (!trimmedName) {
      toast.error("Le nom du dossier est obligatoire !", {
        containerId: "modal1",
      });
      return;
    }

    if (selectedDepartements.length === 0) {
      toast.error("Veuillez sélectionner au moins un département !", {
        containerId: "modal1",
      });
      return;
    }

    const someDeptWithoutUsers = selectedDepartements.some((depId) => {
      const dep = departementOptions.find((d) => d.ID === depId);
      if (!dep) return false;

      const isDirectionDep =
        dep.NOM && dep.NOM.trim().toLowerCase() === "direction";

      if (isDirectionDep) return false;

      return (
        !departmentAccessMap[depId] ||
        departmentAccessMap[depId].length === 0
      );
    });

    if (someDeptWithoutUsers) {
      toast.error(
        "Veuillez sélectionner au moins un utilisateur pour chaque département !",
        { containerId: "modal1" }
      );
      return;
    }

    const defaultSelected = allUserOptions
      .filter(
        (user) => user.ROLE === "administrateur" || user.ROLE === "Réception"
      )
      .map((user) => user.ID_UTILISATEUR);

    const oldDeptIds = editingSharedFolder.ACCESS_DEPARTMENTS.map((u) =>
      Number(u.id)
    );
    const newDeptIds = selectedDepartements.map((d) => Number(d));

    const oldUserIds = (editingSharedFolder.ACCESS_USERS || []).map((u) =>
      Number(u.id)
    );

    const newUsersFromDepts = Array.from(
      new Set(
        newDeptIds.flatMap((depId) => departmentAccessMap[depId] || [])
      )
    );
    const newUserIds = Array.from(
      new Set([...newUsersFromDepts, ...defaultSelected])
    );

    const nameChanged = trimmedName !== editingSharedFolder.NAME;

    const departmentsChanged =
      oldDeptIds.slice().sort((a, b) => a - b).join(",") !==
      newDeptIds.slice().sort((a, b) => a - b).join(",");

    const usersChanged =
      oldUserIds.slice().sort((a, b) => a - b).join(",") !==
      newUserIds.slice().sort((a, b) => a - b).join(",");

    if (!nameChanged && !departmentsChanged && !usersChanged) {
      toast.info("Aucun changement détecté", { containerId: "modal1" });
      setEditingSharedFolder(null);
      return;
    }

    const mergedDepartments = Array.from(
      new Set([...newDeptIds, Departement?.ID])
    );

    const departmentAccess = mergedDepartments.map((depId) => {
      const dep = departementOptions.find((d) => d.ID === depId);
      let ids = departmentAccessMap[depId] || [];

      if (dep && dep.NOM && dep.NOM.trim().toLowerCase() === "direction") {
        const usersInDep = allUserOptions.filter(
          (u) => u.DEPARTEMENT === dep.NOM
        );
        ids = usersInDep.map((u) => u.ID_UTILISATEUR);
      }

      return {
        departmentId: depId,
        userIds: ids,
      };
    });

    try {
      if (nameChanged) {
        const resRename = await fetch(
          `${BASE_URL}/api/folder/${editingSharedFolder.ID}/rename`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newName: trimmedName }),
          }
        );
        if (!resRename.ok) {
          throw new Error("Erreur renommage dossier partager");
        }
      }

      if (departmentsChanged || usersChanged) {
        const resAccess = await fetch(
          `${BASE_URL}/api/folder/${editingSharedFolder.ID}/access`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              departmentAccess,
              userIds: defaultSelected,
            }),
          }
        );
        if (!resAccess.ok) {
          throw new Error("Erreur mise à jour accès");
        }
      }

      toast.success("Dossier partager mis à jour avec succès", {
        containerId: "modal1",
      });
      fetchFolders(1);
    } catch (err) {
      console.error(err);
      toast.error("Échec de la mise à jour du dossier partager", {
        containerId: "modal1",
      });
    } finally {
      setEditingSharedFolder(null);
      setopenDialogDocPartager(false);
    }
  };

  const handleEditClick = (folder) => {
    setOpenDialog(true);
    setNewFolderName(folder.NAME);
    const userIds = folder.ACCESS_USERS.map((u) => parseInt(u.id));
    setSelectedUsers(userIds);
    setEditingFolder(folder);
  };

  const handleEditSharedClick = (folder) => {
    setNewFolderNamePartage(folder.NAME);

    const depIds = folder.ACCESS_DEPARTMENTS.map((u) => parseInt(u.id));
    const folderUserIds = (folder.ACCESS_USERS || []).map((u) =>
      parseInt(u.id)
    );
    const map = {};
    depIds.forEach((depId) => {
      const dep = departementOptions.find((d) => d.ID === depId);
      if (!dep) return;

      const usersInDep = allUserOptions.filter(
        (u) => u.DEPARTEMENT === dep.NOM
      );
      map[depId] = usersInDep
        .filter((u) => folderUserIds.includes(u.ID_UTILISATEUR))
        .map((u) => u.ID_UTILISATEUR);
    });

    setDepartmentAccessMap(map);
    updateSelectedDepartments(depIds);

    setEditingSharedFolder(folder);
    setopenDialogDocPartager(true);
  };

  const handleEditFixedClick = (folder) => {
    setNewFolderNameFix(folder.NAME);
    setopenDialogDocFix(true);
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/folder/${folderToDelete.ID}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast.success(
        `Le dossier "${folderToDelete.NAME}" a été supprimé définitivement`,
        { containerId: "modal1" }
      );
      fetchFolders(1);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de supprimer le dossier", {
        containerId: "modal1",
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // Helpers for nicer per-department user UI
  const toggleUserInDepartment = (depId, userId) => {
    const dep = departementOptions.find((d) => d.ID === depId);
    if (dep && dep.NOM && dep.NOM.trim().toLowerCase() === "direction") {
      // Direction users can't be toggled
      return;
    }

    setDepartmentAccessMap((prev) => {
      const current = prev[depId] || [];
      const exists = current.includes(userId);
      const nextForDep = exists
        ? current.filter((id) => id !== userId)
        : [...current, userId];
      return { ...prev, [depId]: nextForDep };
    });
  };

  const toggleAllUsersInDepartment = (depId, usersInDep) => {
    const dep = departementOptions.find((d) => d.ID === depId);
    if (dep && dep.NOM && dep.NOM.trim().toLowerCase() === "direction") {
      // Direction can't be toggled
      return;
    }

    setDepartmentAccessMap((prev) => {
      const current = prev[depId] || [];
      const allIds = usersInDep.map((u) => u.ID_UTILISATEUR);
      const allSelected = allIds.every((id) => current.includes(id));
      return {
        ...prev,
        [depId]: allSelected ? [] : allIds,
      };
    });
  };

  return (
    <Box
      sx={{
        p: 3,
        mb: 3,
      }}
    >
      <Paper
        sx={{
          p: 3,
          boxShadow: "none",
          border: "1px solid #f5f5f5",
          borderRadius: 2,
          mb: 3,
        }}
      >
        {/* bouton création dossier */}
        <Box
  mb={2}
  display="flex"
  alignItems="center"
  gap={2}
  flexWrap="wrap"
>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ mr: 2 }}
          >
            Créer un dossier
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialogDocPArtager}
            sx={{ mr: 2 }}
          >
            Créer un dossier Partager
          </Button>

          {currentUser.ROLE === "Réception" && (
            <Button
              disabled={hasFixedFolderThisYear}
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialogDocFix}
            >
              Créer un dossier Fix
            </Button>
          )}

          <Box
  display="flex"
  gap={2}
  alignItems="center"
  flexWrap="wrap"
>
  <TextField
    label="Nom du dossier"
    size="small"
    value={filterName}
    onChange={(e) => setFilterName(e.target.value)}
  />

  <TextField
    label="Date de création"
    type="date"
    size="small"
    InputLabelProps={{ shrink: true }}
    value={filterDate}
    onChange={(e) => setFilterDate(e.target.value)}
  />

  <FormControl size="small" sx={{ minWidth: 220 }}>
    <InputLabel>Créé par</InputLabel>
    <Select
      value={filterCreatedBy}
      label="Créé par"
      onChange={(e) => setFilterCreatedBy(e.target.value)}
    >
      <MenuItem value="">
        <em>Tous</em>
      </MenuItem>

      {allUserOptions.map((user) => (
        <MenuItem
          key={user.ID_UTILISATEUR}
          value={user.ID_UTILISATEUR}
        >
          {user.UTILISATEUR}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>


        </Box>

        {/* liste des dossiers */}
        {folders.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            Aucun dossier créé pour le moment.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>Nom du dossier</TableCell>
                    <TableCell>Créateur</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date de création</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {folders.map((folder, index) => (
                    <TableRow
                      key={`${folder.id}-${index}`}
                      hover
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <FolderOpenIcon color="primary" />
                          {folder.NAME}
                        </Box>
                      </TableCell>
                      <TableCell>{folder.CREATED_BY.username}</TableCell>
                      <TableCell>{folder.FOLDER_TYPE}</TableCell>
                      <TableCell>
                        {new Date(folder.CREATED_AT).toLocaleString("fr-FR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        {(userRole === "Réception" &&
                          Departement.NOM === "Réception") ||
                        userRole === "administrateur" ||
                        (userRole === "Import/Export" &&
                          folder.FOLDER_TYPE !== "fixed") ? (
                          <IconButton
                            onClick={() => {
                              if (folder.FOLDER_TYPE === "standard") {
                                handleEditClick(folder);
                              } else if (folder.FOLDER_TYPE === "shared") {
                                handleEditSharedClick(folder);
                              }
                            }}
                            color="primary"
                            size="small"
                          >
                            <EditOutlinedIcon />
                          </IconButton>
                        ) : (
                          <IconButton
                            color="primary"
                            size="small"
                            sx={{ visibility: "hidden" }}
                          >
                            <EditOutlinedIcon />
                          </IconButton>
                        )}

                        <IconButton
                          onClick={() => setActiveFolder(folder)}
                          color="primary"
                          size="small"
                        >
                          <VisibilityOutlinedIcon />
                        </IconButton>

                        {userRole === "administrateur" && (
                          <IconButton
                            edge="end"
                            color="primary"
                            size="small"
                            onClick={() => handleOpenDeleteDialog(folder)}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                size="medium"
                shape="rounded"
              />
            </Box>
          </>
        )}

        {/* popup dossier standard */}
        <Dialog
          open={openDialog}
          onClose={(event, reason) => {
            if (reason === "backdropClick") return;
            handleCloseDialog();
          }}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Créer un nouveau dossier</DialogTitle>
          <DialogContent>
            {/* Nom du dossier */}
            <FormControl
              fullWidth
              sx={{ mt: 1 }}
              error={!newFolderName.trim()}
            >
              <TextField
                autoFocus
                margin="dense"
                label="Nom du dossier"
                fullWidth
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                required
                error={!newFolderName.trim()}
              />
              {!newFolderName.trim() && (
                <FormHelperText>Nom du dossier obligatoire</FormHelperText>
              )}
            </FormControl>

            {/* Utilisateurs autorisés */}
            <FormControl
              fullWidth
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
              required
              error={
                selectedUsers.filter(
                  (id) => id !== currentUser.ID_UTILISATEUR
                ).length === 0 &&
                Departement.NOM !== currentUser.DEPARTEMENT
              }
            >
              <InputLabel id="user-select-label">
                Utilisateurs autorisés
              </InputLabel>

              <Select
                labelId="user-select-label"
                multiple
                value={selectedUsers}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value.includes("all")) {
                    const selectableUsers = userOptions.filter(
                      (u) => u.ID_UTILISATEUR !== currentUser.ID_UTILISATEUR
                    );

                    const allOthersSelected = selectableUsers.every((u) =>
                      selectedUsers.includes(u.ID_UTILISATEUR)
                    );

                    if (allOthersSelected) {
                      setSelectedUsers([currentUser.ID_UTILISATEUR]);
                    } else {
                      setSelectedUsers(
                        userOptions.map((u) => u.ID_UTILISATEUR)
                      );
                    }
                  } else {
                    const newSelection =
                      typeof value === "string" ? value.split(",") : value;

                    const cleaned = newSelection.filter(
                      (id) => id !== currentUser.ID_UTILISATEUR
                    );

                    const finalSelection = Array.from(
                      new Set([...cleaned, currentUser.ID_UTILISATEUR])
                    );

                    setSelectedUsers(finalSelection);
                  }
                }}
                label="Utilisateurs autorisés"
                renderValue={(selected) =>
                  selected
                    .map(
                      (id) =>
                        userOptions.find((u) => u.ID_UTILISATEUR === id)
                          ?.UTILISATEUR
                    )
                    .filter(Boolean)
                    .join(", ")
                }
                MenuProps={{
                  PaperProps: { style: { maxHeight: 300, width: 300 } },
                }}
              >
                <MenuItem value="all">
                  <Checkbox
                    checked={userOptions
                      .filter(
                        (u) => u.ID_UTILISATEUR !== currentUser.ID_UTILISATEUR
                      )
                      .every((u) => selectedUsers.includes(u.ID_UTILISATEUR))}
                    indeterminate={
                      selectedUsers.length > 1 &&
                      !userOptions
                        .filter(
                          (u) => u.ID_UTILISATEUR !== currentUser.ID_UTILISATEUR
                        )
                        .every((u) => selectedUsers.includes(u.ID_UTILISATEUR))
                    }
                  />
                  <ListItemText
                    primary={
                      userOptions
                        .filter(
                          (u) => u.ID_UTILISATEUR !== currentUser.ID_UTILISATEUR
                        )
                        .every((u) => selectedUsers.includes(u.ID_UTILISATEUR))
                        ? "Tout désélectionner"
                        : "Tout sélectionner"
                    }
                  />
                </MenuItem>

                {userOptions.map((user) => {
                  const isCurrentUser =
                    user.ID_UTILISATEUR === currentUser.ID_UTILISATEUR;

                  return (
                    <MenuItem
                      key={user.ID_UTILISATEUR}
                      value={user.ID_UTILISATEUR}
                      disabled={isCurrentUser}
                      style={{ opacity: isCurrentUser ? 0.7 : 1 }}
                    >
                      <Checkbox
                        checked={selectedUsers.includes(user.ID_UTILISATEUR)}
                        disabled={isCurrentUser}
                      />
                      <ListItemText
                        primary={user.UTILISATEUR}
                        secondary={isCurrentUser ? "Vous" : undefined}
                      />
                    </MenuItem>
                  );
                })}
              </Select>

              <FormHelperText>
                {(() => {
                  const othersCount = selectedUsers.filter(
                    (id) => id !== currentUser.ID_UTILISATEUR
                  ).length;
                  const isError =
                    othersCount === 0 &&
                    Departement.NOM !== currentUser.DEPARTEMENT;

                  if (isError) {
                    return "Sélection obligatoire – vous êtes automatiquement inclus";
                  }
                })()}
              </FormHelperText>
            </FormControl>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button
              variant="contained"
              onClick={handleSaveFolder}
              disabled={
                !newFolderName ||
                (selectedUsers.filter(
                  (id) => id !== currentUser.ID_UTILISATEUR
                ).length === 0 &&
                  Departement.NOM !== currentUser.DEPARTEMENT)
              }
            >
              Créer
            </Button>
          </DialogActions>
        </Dialog>

        {/* popup dossier partagé */}
        <Dialog
          open={openDialogDocPartager}
          onClose={(event, reason) => {
            if (reason === "backdropClick") return;
            handleCloseDialogDocPartager();
          }}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>
            {editingSharedFolder
              ? "Modifier le dossier partagé"
              : "Créer un nouveau dossier partagé"}
          </DialogTitle>
          <DialogContent>
            {/* Nom du dossier */}
            <FormControl
              fullWidth
              sx={{ mt: 1 }}
              error={!newFolderNamePartage.trim()}
            >
              <TextField
                autoFocus
                margin="dense"
                label="Nom du dossier"
                fullWidth
                value={newFolderNamePartage}
                onChange={(e) => setNewFolderNamePartage(e.target.value)}
                required
                error={!newFolderNamePartage.trim()}
              />
              {!newFolderNamePartage.trim() && (
                <FormHelperText>Nom du dossier obligatoire</FormHelperText>
              )}
            </FormControl>

            {/* Départements */}
            <FormControl
              fullWidth
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
              error={selectedDepartements.length === 0}
            >
              <InputLabel id="departement-select-label">
                Départements
              </InputLabel>

              <Select
                labelId="departement-select-label"
                multiple
                value={selectedDepartements}
                onChange={(e) => {
                  const value = e.target.value;

                  const currentDeptId = Departement.ID;
                  const directionDept = departementOptions.find(
                    (d) => d.NOM.trim().toLowerCase() === "direction"
                  );
                  const directionId = directionDept ? directionDept.ID : null;

                  const forcedIds = [currentDeptId, directionId].filter(
                    Boolean
                  );

                  if (value.includes("all")) {
                    const selectable = departementOptions.filter(
                      (d) => !forcedIds.includes(d.ID)
                    );
                    const allOthersSelected = selectable.every((d) =>
                      selectedDepartements.includes(d.ID)
                    );

                    if (allOthersSelected) {
                      updateSelectedDepartments(forcedIds);
                    } else {
                      updateSelectedDepartments(
                        departementOptions.map((d) => d.ID)
                      );
                    }
                  } else {
                    const newValue =
                      typeof value === "string" ? value.split(",") : value;

                    const cleaned = newValue.filter(
                      (id) => !forcedIds.includes(id)
                    );

                    updateSelectedDepartments(
                      Array.from(new Set([...cleaned, ...forcedIds]))
                    );
                  }
                }}
                label="Départements"
                renderValue={(selected) =>
                  selected
                    .map(
                      (id) => departementOptions.find((d) => d.ID === id)?.NOM
                    )
                    .filter(Boolean)
                    .join(", ")
                }
                MenuProps={{
                  PaperProps: { style: { maxHeight: 300, width: 300 } },
                }}
              >
                <MenuItem value="all">
                  <Checkbox
                    checked={departementOptions
                      .filter((d) => {
                        const dir = departementOptions.find(
                          (x) => x.NOM.trim().toLowerCase() === "direction"
                        )?.ID;
                        return d.ID !== Departement.ID && d.ID !== dir;
                      })
                      .every((d) => selectedDepartements.includes(d.ID))}
                    indeterminate={
                      selectedDepartements.length > 2 &&
                      !departementOptions
                        .filter(
                          (d) =>
                            d.ID !== Departement.ID &&
                            d.ID !==
                              departementOptions.find(
                                (x) =>
                                  x.NOM.trim().toLowerCase() === "direction"
                              )?.ID
                        )
                        .every((d) => selectedDepartements.includes(d.ID))
                    }
                  />
                  <Typography variant="body2">
                    {departementOptions
                      .filter(
                        (d) =>
                          d.ID !== Departement.ID &&
                          d.ID !==
                            departementOptions.find(
                              (x) => x.NOM.trim().toLowerCase() === "direction"
                            )?.ID
                      )
                      .every((d) => selectedDepartements.includes(d.ID))
                      ? "Tout désélectionner"
                      : "Tout sélectionner"}
                  </Typography>
                </MenuItem>

                {departementOptions.map((dep) => {
                  const isCurrent = dep.ID === Departement.ID;
                  const isDirection =
                    dep.NOM.trim().toLowerCase() === "direction";
                  const isForced = isCurrent || isDirection;

                  return (
                    <MenuItem
                      key={dep.ID}
                      value={dep.ID}
                      disabled={isForced}
                      style={{ opacity: isForced ? 0.6 : 1 }}
                    >
                      <Checkbox
                        checked={selectedDepartements.includes(dep.ID)}
                        disabled={isForced}
                      />
                      <Typography variant="body2">
                        {dep.NOM}
                        {isCurrent && " (actuel)"}
                        {isDirection && " (Direction)"}
                      </Typography>
                    </MenuItem>
                  );
                })}
              </Select>

              {selectedDepartements.length === 0 && (
                <FormHelperText>Sélection obligatoire</FormHelperText>
              )}
            </FormControl>

            {/* Utilisateurs par département (nicer UI) */}
            {selectedDepartements.map((depId) => {
              const dep = departementOptions.find((d) => d.ID === depId);
              if (!dep) return null;

              const isDirectionDep =
                dep.NOM && dep.NOM.trim().toLowerCase() === "direction";

              const usersInDep = allUserOptions.filter(
                (u) => u.DEPARTEMENT === dep.NOM
              );

              const baseSelectedUsersForDep = departmentAccessMap[depId] || [];
              const allIds = usersInDep.map((u) => u.ID_UTILISATEUR);

              // For Direction, treat all users as selected
              const selectedUsersForDep = isDirectionDep
                ? allIds
                : baseSelectedUsersForDep;

              if (usersInDep.length === 0) {
                return (
                  <Paper
                    key={depId}
                    variant="outlined"
                    sx={{ mt: 2, p: 1.5, borderStyle: "dashed" }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {dep.NOM}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Aucun utilisateur trouvé pour ce département.
                    </Typography>
                  </Paper>
                );
              }

              const allSelected = allIds.every((id) =>
                selectedUsersForDep.includes(id)
              );

              return (
                <Paper
                  key={depId}
                  variant="outlined"
                  sx={{ mt: 2, p: 1.5, borderRadius: 2 }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2">{dep.NOM}</Typography>
                      <Chip
                        size="small"
                        label={`${selectedUsersForDep.length} sélectionné(s) / ${usersInDep.length}`}
                      />
                    </Box>
                    {isDirectionDep ? (
                      <Typography variant="caption" color="textSecondary">
                        Tous les utilisateurs de ce département ont toujours
                        accès.
                      </Typography>
                    ) : (
                      <Button
                        size="small"
                        onClick={() =>
                          toggleAllUsersInDepartment(depId, usersInDep)
                        }
                      >
                        {allSelected
                          ? "Tout désélectionner"
                          : "Tout sélectionner"}
                      </Button>
                    )}
                  </Box>

                  <FormGroup>
                    {usersInDep.map((user) => (
                      <FormControlLabel
                        key={user.ID_UTILISATEUR}
                        control={
                          <Checkbox
                            checked={selectedUsersForDep.includes(
                              user.ID_UTILISATEUR
                            )}
                            onChange={() =>
                              !isDirectionDep &&
                              toggleUserInDepartment(
                                depId,
                                user.ID_UTILISATEUR
                              )
                            }
                            disabled={isDirectionDep}
                          />
                        }
                        label={user.UTILISATEUR}
                      />
                    ))}
                  </FormGroup>

                  {!isDirectionDep &&
                    baseSelectedUsersForDep.length === 0 && (
                      <FormHelperText error sx={{ mt: 0.5 }}>
                        Sélectionner au moins un utilisateur pour {dep.NOM}
                      </FormHelperText>
                    )}
                </Paper>
              );
            })}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialogDocPartager}>Annuler</Button>
            <Button
              variant="contained"
              onClick={handleSaveFolderPartager}
              disabled={
                !newFolderNamePartage ||
                selectedDepartements.length === 0 ||
                selectedDepartements.some((depId) => {
                  const dep = departementOptions.find((d) => d.ID === depId);
                  if (!dep) return false;
                  const isDirectionDep =
                    dep.NOM && dep.NOM.trim().toLowerCase() === "direction";
                  if (isDirectionDep) return false;
                  return (
                    !departmentAccessMap[depId] ||
                    departmentAccessMap[depId].length === 0
                  );
                })
              }
            >
              {editingSharedFolder ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* popup dossier fix */}
        <Dialog
          open={openDialogDocFix}
          onClose={(event, reason) => {
            if (reason === "backdropClick") return;
            handleCloseDialogDocFix();
          }}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Créer un nouveau dossier Fix</DialogTitle>
          <DialogContent>
            <FormControl
              fullWidth
              sx={{ mt: 1 }}
              error={!newFolderNameFix.trim()}
            >
              <TextField
                autoFocus
                margin="dense"
                label="Nom du dossier"
                fullWidth
                value={newFolderNameFix}
                onChange={(e) => setNewFolderNameFix(e.target.value)}
                required
                error={!newFolderNameFix.trim()}
              />
              {!newFolderNameFix.trim() && (
                <FormHelperText>Nom du dossier obligatoire</FormHelperText>
              )}
            </FormControl>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialogDocFix}>Annuler</Button>
            <Button
              variant="contained"
              onClick={handleSaveFolderFix}
              disabled={!newFolderNameFix}
            >
              Créer
            </Button>
          </DialogActions>
        </Dialog>

        {/* popup dossier avec documents */}
        {activeFolder && (
          <Dialog
            open={true}
            onClose={() => setActiveFolder(null)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e0e0e0",
                pb: 1,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <FolderOpenIcon color="primary" /> {activeFolder.NAME}
              </Box>
              <IconButton onClick={() => setActiveFolder(null)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent>
              <GlobalFolder
                title={`Documents de ${activeFolder.name}`}
                Departement={Departement}
                userRole={userRole}
                folder={activeFolder}
                Departements={Departements}
                user={currentUser}
                parentFolder={activeFolder}
              />
            </DialogContent>
          </Dialog>
        )}

        <ToastContainer position="bottom-center" containerId="modal1" />

        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirmation de suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer définitivement le dossier{" "}
              <strong>{folderToDelete?.NAME}</strong> ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleDeleteFolder}
            >
              Supprimer définitivement
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}

export default FolderDocument;