// import { useEffect, useState } from "react";
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
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import axios from "axios";
// import BASE_URL from "../Utilis/constantes";
// import { toast, ToastContainer } from "react-toastify";
// import CloseIcon from "@mui/icons-material/Close";
// import FolderOpenIcon from "@mui/icons-material/FolderOpen";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// import Document from "../documents/document";

// export default function ChildFolder({
//   Departement,
//   userRole,
//   currentUser,
//   Departements,
//   parentFolder,
// }) {
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

//   //   const [isEditing, setIsEditing] = useState(false);
//   const [folderToDelete, setFolderToDelete] = useState(null);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [departementOptions, setDepartementoptions] = useState([]);
//   const [selectedDepartements, setSelectedDepartements] = useState([]);
//   //   const [allDepartementsptions, setAllDepartementsOptions] = useState([]); // full list
//   //   const currentYear = new Date().getFullYear();
//   //   const [hasFixedFolderThisYear, sethasFixedFolderThisYear] = useState(false); // full list

//   const [page, setPage] = useState(1);
//   const [limit] = useState(20); // number of items per page
//   const [totalPages, setTotalPages] = useState(1);

//   //   useEffect(() => {
//   //     console.log("all folders:", folders);
//   //         console.log("userOptions:", userOptions);
//   //             console.log("departementOptions:", departementOptions);

//   //   }, [folders,userOptions,departementOptions]);
//   useEffect(() => {
//     setFolders([]);

//     if (currentUser.ID_UTILISATEUR && Departement?.ID) {
//       fetchFolders(1);
//     }
//   }, [currentUser.ID_UTILISATEUR, Departement?.ID]);
//   useEffect(() => {
//     fetchFolders(page);
//   }, [page]);
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get(`${BASE_URL}/api/users`);
//         setAllUserOptions(response.data); // store full list
//       } catch (error) {
//         console.error("Erreur lors du chargement des utilisateurs :", error);
//       }
//     };
//     fetchUsers();
//   }, []);
//   //   useEffect(() => {
//   //     console.log("Departement param from parent in ChildFolder ", Departement);
//   //     if (!Departement?.NOM) return;

//   //     let filteredUsers = allUserOptions.filter(
//   //       (u) => u.DEPARTEMENT === Departement.NOM
//   //     );

//   //     setUserOptions(filteredUsers);
//   //     setSelectedUsers(filteredUsers.map((f) => f.ID_UTILISATEUR));
//   //   }, [Departement, allUserOptions]);
//   useEffect(() => {
//     if (!Departement?.NOM || !Array.isArray(allUserOptions)) return;

//     let filteredUsers = allUserOptions.filter(
//       (u) => u.DEPARTEMENT === Departement.NOM
//     );

//     const parentAccessIds = (parentFolder?.ACCESS_USERS || []).map((u) =>
//       Number(u.id)
//     );

//     let finalFiltered = filteredUsers.filter((u) =>
//       parentAccessIds.includes(Number(u.ID_UTILISATEUR))
//     );

//     setUserOptions(finalFiltered);
//     setSelectedUsers(finalFiltered.map((u) => u.ID_UTILISATEUR));
//   }, [Departement, allUserOptions, parentFolder]);

//   useEffect(() => {
//     if (!Departements || !parentFolder?.ACCESS_DEPARTMENTS) return;

//     // 1) IDs autorisés par le dossier parent
//     const allowedDeptIDs = parentFolder.ACCESS_DEPARTMENTS.map((d) =>
//       Number(d.id)
//     );

//     // 2) Filtrer les départements existants
//     const filteredDepartments = Departements.filter((d) =>
//       allowedDeptIDs.includes(Number(d.ID))
//     );

//     // 3) Mise à jour
//     setDepartementoptions(filteredDepartments);
//     setSelectedDepartements(filteredDepartments.map((d) => d.ID));
//   }, [Departements, parentFolder?.ACCESS_DEPARTMENTS]);

//   //   useEffect(() => {
//   //     console.log("Departements", Departements);
//   //     setDepartementoptions(Departements);
//   //     setSelectedDepartements(Departements.map((f) => f.ID));
//   //   }, [Departements]);

//   const handleOpenDeleteDialog = (folder) => {
//     setFolderToDelete(folder);
//     setOpenDeleteDialog(true);
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
//         `Le dossier "${folderToDelete.NAME}" a été supprimé définitivement`
//       , { containerId: "modal" });
//       fetchFolders(1);
//     } catch (error) {
//       console.error(error);
//       toast.error("Impossible de supprimer le dossier", { containerId: "modal" });
//     } finally {
//       handleCloseDeleteDialog();
//     }
//   };

//   const handleCloseDeleteDialog = () => {
//     setFolderToDelete(null);
//     setOpenDeleteDialog(false);
//   };

//   const handleOpenDialog = () => {
//     setNewFolderName("");
//     setEditingFolder(null);

//     // if (!Departement?.NOM) return;
//     // const filteredUsers = allUserOptions.filter(
//     //   (u) => u.DEPARTEMENT === Departement.NOM
//     // );
//     // setUserOptions(filteredUsers);
//     // setSelectedUsers(filteredUsers.map((f) => f.ID_UTILISATEUR));
//     if (parentFolder?.ACCESS_USERS && Departement?.NOM) {
//       const allowedUserIDs = parentFolder.ACCESS_USERS.map((u) => Number(u.id));

//       const filteredUsers = allUserOptions.filter(
//         (u) =>
//           u.DEPARTEMENT === Departement.NOM &&
//           allowedUserIDs.includes(Number(u.ID_UTILISATEUR))
//       );

//       setUserOptions(filteredUsers);
//       setSelectedUsers(filteredUsers.map((u) => u.ID_UTILISATEUR));
//     } else {
//       const fallbackUsers = Departement?.NOM
//         ? allUserOptions.filter((u) => u.DEPARTEMENT === Departement.NOM)
//         : allUserOptions;

//       setUserOptions(fallbackUsers);
//       setSelectedUsers(fallbackUsers.map((u) => u.ID_UTILISATEUR));
//     }
//     setOpenDialog(true);
//   };
//   const handleEditClick = async (folder) => {
//     console.log(selectedUsers);
//     setOpenDialog(true);
//     setNewFolderName(folder.NAME);
//     const userIds = folder.ACCESS_USERS.map((u) => parseInt(u.id));
//     setSelectedUsers(userIds);
//     console.log(selectedUsers);
//     setEditingFolder(folder);
//   };

//   const handleEditSharedClick = (folder) => {
//     setNewFolderNamePartage(folder.NAME);
//     const DepIds = folder.ACCESS_DEPARTMENTS.map((u) => parseInt(u.id));
//     setSelectedDepartements(DepIds);
//     setopenDialogDocPartager(true);
//     setEditingSharedFolder(folder);
//   };
//   const handleEditFixedClick = (folder) => {
//     setNewFolderNameFix(folder.NAME);
//     const DepIds = folder.ACCESS_DEPARTMENTS.map((u) => parseInt(u.id));
//     setSelectedDepartements(DepIds);
//     setopenDialogDocFix(true);
//   };

//   const fetchFolders = async (page = 1) => {
//     try {
//       if (!currentUser.ID_UTILISATEUR || !Departement?.ID) return;

//       const response = await fetch(
//         `${BASE_URL}/api/folders/${currentUser?.ID_UTILISATEUR}/${Departement.ID}?parentId=${parentFolder.ID}&page=${page}&limit=${limit}`
//       );

//       if (!response.ok) {
//         // throw new Error("Erreur lors de la récupération des dossiers");
//         toast.error("Impossible de charger les dossiers !" , { containerId: "modal" });
//       }

//       const data = await response.json();
//       setFolders(data?.data || []);
//       setTotalPages(data?.totalPages || 1);
//       console.log("all folders", folders);
//     } catch (error) {
//       console.error(error);
//       toast.error("Impossible de charger les dossiers !" , { containerId: "modal" });
//     }
//   };
//   const handleSaveFolder = async () => {
//     if (editingFolder) {
//       await updateFolder();
//     } else {
//       await createFolder();
//     }
//   };

//   const createFolder = async () => {
//     if (!newFolderName.trim()) {
//       toast.error("Le nom du dossier est obligatoire !" , { containerId: "modal" });

//       return;
//     }

//     if (selectedUsers.length === 0) {
//       toast.error("Veuillez sélectionner au moins un utilisateur !" , { containerId: "modal" });
//       return;
//     }
//     console.log("Departement in create folder ", Departement);
//     console.log("currentUser connected ", currentUser);

//     const defaultSelected = allUserOptions
//       .filter(
//         (user) => user.ROLE === "administrateur" || user.ROLE === "Réception"
//       )
//       .map((user) => user.ID_UTILISATEUR);
//     console.log(defaultSelected);

//     const finalUserIds = [...new Set([...selectedUsers, ...defaultSelected])];

//     setSelectedUsers(finalUserIds);

//     console.log("finalUserIds", finalUserIds);
//     try {
//       const body = {
//         name: newFolderName.trim(),
//         parentId: parentFolder.ID,
//         folder_type: parentFolder.FOLDER_TYPE,
//         departmentId: Departement?.ID,
//         createdBy: currentUser?.ID_UTILISATEUR,
//         userIds: finalUserIds,
//       };
//       console.log("body create folder", body);

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

//       const data = await response.json();

//       fetchFolders(1);

//       setOpenDialog(false);
//       toast.success("Dossier créé avec succès" , { containerId: "modal" });
//     } catch (error) {
//       console.error(error);
//       toast.error("Erreur lors de la création du dossier !" , { containerId: "modal" });
//     }
//   };

//   const updateFolder = async () => {
//     if (!editingFolder) return;

//     const trimmedName = newFolderName.trim();

//     // normalize both lists to strings for comparison
//     const oldUserIds = editingFolder.ACCESS_USERS.map((u) => String(u.id));
//     const newUserIds = selectedUsers.map(String);

//     // compare folder name
//     const nameChanged = trimmedName !== editingFolder.NAME;

//     // compare users (by sorting and joining so order doesn’t matter)
//     const usersChanged =
//       oldUserIds.sort().join(",") !== newUserIds.sort().join(",");

//     if (!nameChanged && !usersChanged) {
//       toast.info("Aucun changement détecté" , { containerId: "modal" });
//       // setOpenDialog(false);
//       // setEditingFolder(null);
//       return;
//     }

//     const body = {};
//     if (nameChanged) body.name = trimmedName;
//     if (usersChanged) body.userIds = selectedUsers.map(Number);
//     body.departmentId = Departement?.ID;
//     console.log(body);

//     try {
//       // Case 1: name changed
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

//       // Case 2: access changed
//       if (usersChanged) {
//         const resAccess = await fetch(
//           `${BASE_URL}/api/folder/${editingFolder.ID}/access`,
//           {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               userIds: selectedUsers.map(Number),
//               departmentIds: [],
//             }),
//           }
//         );
//         if (!resAccess.ok) throw new Error("Erreur mise à jour accès");
//       }

//       toast.success("Dossier mis à jour avec succès" , { containerId: "modal" });
//       fetchFolders(1);
//     } catch (err) {
//       console.error(err);
//       toast.error("Échec de la mise à jour du dossier" , { containerId: "modal" });
//     } finally {
//       setEditingFolder(null);
//       setOpenDialog(false);
//     }
//   };

//   const handleCloseDialog = () => {
//     setNewFolderNameFix("");
//     setEditingFolder(null);

//     setOpenDialog(false);
//   };

//   const handleOpenDialogDocFix = (folder) => {
//     setopenDialogDocFix(true);
//   };

//   const handleOpenDialogDocPArtager = () => {
//     console.log("Departements", Departements);
//     setNewFolderNamePartage("");
//     setEditingSharedFolder(null);

//     // setSelectedDepartements(Departements.map((f) => f.ID));
//     if (parentFolder?.ACCESS_DEPARTMENTS) {
//       const allowedDepIDs = parentFolder.ACCESS_DEPARTMENTS.map(
//         (dep) => dep.id
//       );
//       const filteredDeps = Departements.filter((dep) =>
//         allowedDepIDs.includes(dep.ID)
//       );

//       setDepartementoptions(filteredDeps); // Update the options shown
//       setSelectedDepartements(filteredDeps.map((dep) => dep.ID)); // Pre-select these departments
//     } else {
//       // Fallback: select all if parentFolder is not defined
//       setDepartementoptions(Departements);
//       setSelectedDepartements(Departements.map((dep) => dep.ID));
//     }

//     setopenDialogDocPartager(true);
//   };

//   const handleCloseDialogDocPartager = () => {
//     setNewFolderNamePartage("");
//     setSelectedDepartements([]);
//     setopenDialogDocPartager(false);
//     setEditingSharedFolder(null);
//   };

//   const handleSaveFolderPartager = async () => {
//     if (editingSharedFolder) {
//       await updateSharedFolder();
//     } else {
//       await createSharedFolder();
//     }
//   };

//   const createSharedFolder = async () => {
//     if (!newFolderNamePartage.trim()) {
//       toast.error("Le nom du dossier est obligatoire !", {
//         containerId: "modal",
//       });
//       return;
//     }

//     if (selectedDepartements.length === 0) {
//       toast.error("Veuillez sélectionner au moins un département !", {
//         containerId: "modal",
//       });
//       return;
//     }

//     try {
//       // ✅ admins + Réception (accès global, comme pour les dossiers racine)
//       const defaultSelected = allUserOptions
//         .filter(
//           (user) => user.ROLE === "administrateur" || user.ROLE === "Réception"
//         )
//         .map((user) => user.ID_UTILISATEUR);

//       // IDs des utilisateurs qui ont accès au dossier parent
//       const parentUserIds = (parentFolder.ACCESS_USERS || []).map((u) =>
//         Number(u.id)
//       );

//       // Construire departmentAccess à partir :
//       // - des départements sélectionnés pour le sous-dossier
//       // - en prenant uniquement les utilisateurs qui ont DÉJÀ accès au parent
//       let deptAccess = selectedDepartements.map((depId) => {
//         const dep = Departements.find((d) => d.ID === depId);
//         if (!dep) {
//           return { departmentId: depId, userIds: [] };
//         }

//         const usersInDep = allUserOptions.filter(
//           (u) => u.DEPARTEMENT === dep.NOM
//         );

//         const userIds = usersInDep
//           .filter((u) => parentUserIds.includes(u.ID_UTILISATEUR))
//           .map((u) => u.ID_UTILISATEUR);

//         return {
//           departmentId: depId,
//           userIds,
//         };
//       });

//       // S'assurer que le département courant est inclus dans la métadonnée
//       const mainDepId = Departement?.ID;
//       if (
//         mainDepId &&
//         !deptAccess.some((d) => Number(d.departmentId) === Number(mainDepId))
//       ) {
//         deptAccess.push({
//           departmentId: Number(mainDepId),
//           userIds: [],
//         });
//       }

//       const body = {
//         name: newFolderNamePartage.trim(),
//         folder_type: "shared",
//         departmentId: Departement?.ID,
//         parentId: parentFolder.ID,
//         createdBy: currentUser?.ID_UTILISATEUR,
//         departmentAccess: deptAccess,     // ✅ nouveau
//         userIds: defaultSelected,         // ✅ global (admins + Réception)
//       };

//       console.log("body create shared child folder", body);

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
//         containerId: "modal",
//       });
//     } catch (error) {
//       console.error(error);
//       toast.error("Erreur lors de la création du dossier Partager !", {
//         containerId: "modal",
//       });
//     }
//   };

//   const updateSharedFolder = async () => {
//     if (!editingSharedFolder) return;

//     const trimmedName = newFolderNamePartage.trim();

//     if (!trimmedName) {
//       toast.error("Le nom du dossier est obligatoire !", {
//         containerId: "modal",
//       });
//       return;
//     }

//     if (selectedDepartements.length === 0) {
//       toast.error("Veuillez sélectionner au moins un département !", {
//         containerId: "modal",
//       });
//       return;
//     }

//     // anciens / nouveaux départements
//     const oldDeptIds = editingSharedFolder.ACCESS_DEPARTMENTS.map((u) =>
//       Number(u.id)
//     );
//     const newDeptIds = selectedDepartements.map((d) => Number(d));

//     const nameChanged = trimmedName !== editingSharedFolder.NAME;
//     const departmentsChanged =
//       oldDeptIds.slice().sort((a, b) => a - b).join(",") !==
//       newDeptIds.slice().sort((a, b) => a - b).join(",");

//     if (!nameChanged && !departmentsChanged) {
//       toast.info("Aucun changement détecté", { containerId: "modal" });
//       setEditingSharedFolder(null);
//       return;
//     }

//     // admins + Réception
//     const defaultSelected = allUserOptions
//       .filter(
//         (user) => user.ROLE === "administrateur" || user.ROLE === "Réception"
//       )
//       .map((user) => user.ID_UTILISATEUR);

//     const parentUserIds = (parentFolder.ACCESS_USERS || []).map((u) =>
//       Number(u.id)
//     );

//     // Construire departmentAccess à partir des nouveaux départements
//     let deptAccess = newDeptIds.map((depId) => {
//       const dep = Departements.find((d) => d.ID === depId);
//       if (!dep) {
//         return { departmentId: depId, userIds: [] };
//       }

//       const usersInDep = allUserOptions.filter(
//         (u) => u.DEPARTEMENT === dep.NOM
//       );
//       const userIds = usersInDep
//         .filter((u) => parentUserIds.includes(u.ID_UTILISATEUR))
//         .map((u) => u.ID_UTILISATEUR);

//       return {
//         departmentId: depId,
//         userIds,
//       };
//     });

//     const mainDepId = Departement?.ID;
//     if (
//       mainDepId &&
//       !deptAccess.some((d) => Number(d.departmentId) === Number(mainDepId))
//     ) {
//       deptAccess.push({
//         departmentId: Number(mainDepId),
//         userIds: [],
//       });
//     }

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

//       if (departmentsChanged) {
//         const resAccess = await fetch(
//           `${BASE_URL}/api/folder/${editingSharedFolder.ID}/access`,
//           {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               departmentAccess: deptAccess,
//               userIds: defaultSelected,
//             }),
//           }
//         );
//         if (!resAccess.ok) {
//           throw new Error("Erreur mise à jour accès");
//         }
//       }

//       toast.success("Dossier partager mis à jour avec succès", {
//         containerId: "modal",
//       });
//       fetchFolders(1);
//     } catch (err) {
//       console.error(err);
//       toast.error("Échec de la mise à jour du dossier partager", {
//         containerId: "modal",
//       });
//     } finally {
//       setEditingSharedFolder(null);
//       setopenDialogDocPartager(false);
//     }
//   };

//   const handleSaveFolderFix = async () => {
//     console.log("newFolderNamePartagefix", newFolderNameFix);

//     try {
//       const body = {
//         name: newFolderNameFix.trim(),
//         parentId: parentFolder.ID,
//         folder_type: "fixed",
//         departmentId: Departement?.ID,
//         createdBy: currentUser?.ID_UTILISATEUR,
//       };
//       console.log("body create folder", body);

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

//       const data = await response.json();

//       fetchFolders(1);

//       setopenDialogDocFix(false);
//       toast.success("Dossier Fix  créé avec succès" , { containerId: "modal" });
//     } catch (error) {
//       console.error(error);
//       toast.error("Erreur lors de la création du dossier Fix !" , { containerId: "modal" });
//     }
//   };

//   const handleCloseDialogDocFix = () => {
//     setNewFolderNameFix("");
//     setopenDialogDocFix(false);
//   };

//   return (
//     <Box>
//       <Box sx={{ minHeight: "100vh", p: 3 }}>
//         <Paper
//           sx={{
//             p: 3,
//             boxShadow: "none",
//             border: "1px solid #f5f5f5", // subtle gray border
//             borderRadius: 2,
//           }}
//         >
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               mb: 2,
//               flexWrap: "wrap",
//               gap: 2,
//             }}
//           >
//             {parentFolder.FOLDER_TYPE == "standard" && (
//               <Button
//                 variant="contained"
//                 startIcon={<AddIcon />}
//                 onClick={handleOpenDialog}
//                 sx={{ mr: 2 }}
//               >
//                 Créer un dossier
//               </Button>
//             )}
//             {parentFolder.FOLDER_TYPE == "shared" && (
//               <Button
//                 variant="contained"
//                 startIcon={<AddIcon />}
//                 onClick={handleOpenDialogDocPArtager}
//                 sx={{ mr: 2 }}
//               >
//                 Créer un dossier Partager
//               </Button>
//             )}
//             {currentUser.ROLE === "Réception" &&
//               parentFolder.FOLDER_TYPE == "fixed" && (
//                 <Button
//                   // disabled={hasFixedFolderThisYear}
//                   variant="contained"
//                   startIcon={<AddIcon />}
//                   onClick={handleOpenDialogDocFix}
//                 >
//                   Créer un dossier Fix
//                 </Button>
//               )}
//           </Box>

//           {/* liste des dossiers */}
//           {folders.length === 0 ? (
//             <Typography variant="body1" color="textSecondary">
//               Aucun dossier créé pour le moment.
//             </Typography>
//           ) : (
//             //  <Typography variant="body1" color="textSecondary">
//             //  dfddddddddddddddddddddddddddddd
//             // </Typography>
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
//                       </TableCell>{" "}
//                       <TableCell>
//                         {/* {(((userRole === "Réception" &&
//                             Departement.NOM === "Réception") ||
//                             userRole === "administrateur") && folder.FOLDER_TYPE!= 'fixed') && (
//                             <IconButton
//                               onClick={() => {
//                                 if (folder.FOLDER_TYPE === "standard") {
//                                   handleEditClick(folder);
//                                 } else if (folder.FOLDER_TYPE === "shared") {
//                                   handleEditSharedClick(folder);
//                                 } else {
//                                   handleEditFixedClick(folder);
//                                 }
//                               }}
//                               color="primary"
//                               size="small"
//                             >
//                               <EditOutlinedIcon />
//                             </IconButton>
//                           )} */}

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
//                         {/* userRole === "Réception" || */}
//                         {userRole === "administrateur" && (
//                           <IconButton
//                             edge="end"
//                             color="primary"
//                             size="small"
//                             onClick={() => handleOpenDeleteDialog(folder)}
//                           >
//                             <DeleteOutlineIcon /> {/* self-closing icon */}
//                           </IconButton>
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}

//           {folders.length > 0 && (
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
//           )}
//         </Paper>
//       </Box>

//       {activeFolder && (
//         <Dialog
//           open={true}
//           onClose={() => setActiveFolder(null)}
//           fullWidth
//           maxWidth="md"
//         >
//           <DialogTitle
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               borderBottom: "1px solid #e0e0e0", // ✅ ligne de séparation
//               pb: 1, // padding-bottom réduit
//             }}
//           >
//             <Box display="flex" alignItems="center" gap={1}>
//               <FolderOpenIcon color="primary" /> {activeFolder.NAME}
//             </Box>
//             <IconButton onClick={() => setActiveFolder(null)}>
//               <CloseIcon />
//             </IconButton>
//           </DialogTitle>

//           <DialogContent>
//             <Document
//               //   title={`Documents de ${activeFolder.name}`}
//               Departement={Departement}
//               userRole={userRole}
//               folder={activeFolder}
//             />
//           </DialogContent>
//         </Dialog>
//       )}

//       <Dialog
//         open={openDialog}
//         // onClose={handleCloseDialog}
//         onClose={(event, reason) => {
//           if (reason === "backdropClick") return; // ignore click outside
//           handleCloseDialog(); // only close for explicit close button
//         }}
//         fullWidth
//         maxWidth="xs"
//       >
//         <DialogTitle>Créer un nouveau dossier</DialogTitle>
//         <DialogContent>
//           {/* Nom du dossier */}
//           <FormControl
//             fullWidth
//             sx={{ mt: 1 }}
//             error={!newFolderName.trim()} // ⚠️ erreur si vide
//           >
//             <TextField
//               autoFocus
//               margin="dense"
//               label="Nom du dossier"
//               fullWidth
//               value={newFolderName}
//               onChange={(e) => setNewFolderName(e.target.value)}
//               required
//               error={!newFolderName.trim()} // ✅ bord rouge
//             />
//             {!newFolderName.trim() && (
//               <FormHelperText>Nom du dossier obligatoire</FormHelperText>
//             )}
//           </FormControl>

//           {/* Utilisateurs autorisés */}
//           <FormControl
//             fullWidth
//             variant="outlined"
//             size="small"
//             sx={{ mt: 2 }}
//             required
//             error={
//               selectedUsers.filter((id) => id !== currentUser.ID_UTILISATEUR)
//                 .length === 0 && Departement.NOM !== currentUser.DEPARTEMENT
//             }
//           >
//             <InputLabel id="user-select-label">
//               Utilisateurs autorisés
//             </InputLabel>

//             <Select
//               labelId="user-select-label"
//               multiple
//               value={selectedUsers}
//               onChange={(e) => {
//                 const value = e.target.value;

//                 if (value.includes("all")) {
//                   // === Clic sur "Tout sélectionner / Tout désélectionner" ===
//                   const selectableUsers = userOptions.filter(
//                     (u) => u.ID_UTILISATEUR !== currentUser.ID_UTILISATEUR
//                   );

//                   const allOthersSelected = selectableUsers.every((u) =>
//                     selectedUsers.includes(u.ID_UTILISATEUR)
//                   );

//                   if (allOthersSelected) {
//                     // Tout est coché → on ne garde que l'utilisateur courant
//                     setSelectedUsers([currentUser.ID_UTILISATEUR]);
//                   } else {
//                     // On coche absolument tout le monde
//                     setSelectedUsers(userOptions.map((u) => u.ID_UTILISATEUR));
//                   }
//                 } else {
//                   // === Sélection manuelle d'un ou plusieurs utilisateurs ===
//                   const newSelection =
//                     typeof value === "string" ? value.split(",") : value;

//                   // On retire l'utilisateur courant s'il a été enlevé (sécurité)
//                   const cleaned = newSelection.filter(
//                     (id) => id !== currentUser.ID_UTILISATEUR
//                   );

//                   // On le remet TOUJOURS
//                   const finalSelection = Array.from(
//                     new Set([...cleaned, currentUser.ID_UTILISATEUR])
//                   );

//                   setSelectedUsers(finalSelection);
//                 }
//               }}
//               label="Utilisateurs autorisés"
//               renderValue={(selected) =>
//                 selected
//                   .map(
//                     (id) =>
//                       userOptions.find((u) => u.ID_UTILISATEUR === id)
//                         ?.UTILISATEUR
//                   )
//                   .filter(Boolean)
//                   .join(", ")
//               }
//               MenuProps={{
//                 PaperProps: { style: { maxHeight: 300, width: 300 } },
//               }}
//             >
//               {/* === Bouton Tout sélectionner / Tout désélectionner === */}
//               <MenuItem value="all">
//                 <Checkbox
//                   checked={userOptions
//                     .filter(
//                       (u) => u.ID_UTILISATEUR !== currentUser.ID_UTILISATEUR
//                     )
//                     .every((u) => selectedUsers.includes(u.ID_UTILISATEUR))}
//                   indeterminate={
//                     selectedUsers.length > 1 && // plus que juste le courant
//                     !userOptions
//                       .filter(
//                         (u) => u.ID_UTILISATEUR !== currentUser.ID_UTILISATEUR
//                       )
//                       .every((u) => selectedUsers.includes(u.ID_UTILISATEUR))
//                   }
//                 />
//                 <ListItemText
//                   primary={
//                     userOptions
//                       .filter(
//                         (u) => u.ID_UTILISATEUR !== currentUser.ID_UTILISATEUR
//                       )
//                       .every((u) => selectedUsers.includes(u.ID_UTILISATEUR))
//                       ? "Tout désélectionner"
//                       : "Tout sélectionner"
//                   }
//                 />
//               </MenuItem>

//               {/* === Liste des utilisateurs === */}
//               {userOptions.map((user) => {
//                 const isCurrentUser =
//                   user.ID_UTILISATEUR === currentUser.ID_UTILISATEUR;

//                 return (
//                   <MenuItem
//                     key={user.ID_UTILISATEUR}
//                     value={user.ID_UTILISATEUR}
//                     disabled={isCurrentUser}
//                     style={{ opacity: isCurrentUser ? 0.7 : 1 }}
//                   >
//                     <Checkbox
//                       checked={selectedUsers.includes(user.ID_UTILISATEUR)}
//                       disabled={isCurrentUser}
//                     />
//                     <ListItemText
//                       primary={user.UTILISATEUR}
//                       secondary={isCurrentUser ? "Vous" : undefined}
//                     />
//                   </MenuItem>
//                 );
//               })}
//             </Select>

//             <FormHelperText>
//               {(() => {
//                 const othersCount = selectedUsers.filter(
//                   (id) => id !== currentUser.ID_UTILISATEUR
//                 ).length;
//                 const isError =
//                   othersCount === 0 &&
//                   Departement.NOM !== currentUser.DEPARTEMENT;

//                 if (isError) {
//                   return "Sélection obligatoire – vous êtes automatiquement inclus";
//                 }
//               })()}
//             </FormHelperText>
//           </FormControl>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Annuler</Button>
//           <Button
//             variant="contained"
//             onClick={handleSaveFolder}
//             disabled={!newFolderName || 
//     (
//       selectedUsers.filter(id => id !== currentUser.ID_UTILISATEUR).length === 0 &&
//       Departement.NOM !== currentUser.DEPARTEMENT
//     )} // ✅ désactiver si vide
//           >
//             Créer
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* popup dossier partager  */}
//       <Dialog
//         open={openDialogDocPartager}
//         // onClose={handleCloseDialogDocPartager}
//         onClose={(event, reason) => {
//           if (reason === "backdropClick") return; // ignore click outside
//           handleCloseDialogDocPartager(); // only close for explicit close button
//         }}
//         fullWidth
//         maxWidth="xs"
//       >
//         <DialogTitle>Créer un nouveau dossier partagé </DialogTitle>
//         <DialogContent>
//           {/* Nom du dossier */}
//           <FormControl
//             fullWidth
//             sx={{ mt: 1 }}
//             error={!newFolderNamePartage.trim()}
//           >
//             <TextField
//               autoFocus
//               margin="dense"
//               label="Nom du dossier"
//               fullWidth
//               value={newFolderNamePartage}
//               onChange={(e) => setNewFolderNamePartage(e.target.value)}
//               required
//               error={!newFolderNamePartage.trim()}
//             />
//             {!newFolderNamePartage.trim() && (
//               <FormHelperText>Nom du dossier obligatoire</FormHelperText>
//             )}
//           </FormControl>

//           {/* Utilisateurs autorisés */}
//           <FormControl
//             fullWidth
//             variant="outlined"
//             size="small"
//             sx={{ mt: 2 }}
//             error={selectedDepartements.length === 0} // required validation
//           >
//             <InputLabel id="user-select-label">Départements</InputLabel>
//             {/* <Select
//                     labelId="departement-select-label"
//                     multiple
//                     value={selectedDepartements}
//                     onChange={(e) => setSelectedDepartements(e.target.value)}
//                     label="Départements"
//                     renderValue={(selected) =>
//                       selected
//                         .map(
//                           (id) => departementOptions.find((dep) => dep.ID === id)?.NOM
//                         )
//                         .filter(Boolean)
//                         .join(", ")
//                     }
//                     MenuProps={{
//                       PaperProps: {
//                         style: {
//                           maxHeight: 300,
//                           width: 300,
//                         },
//                       },
//                     }}
//                   >
//                     {departementOptions.map((dep) => (
//                       <MenuItem key={dep.ID} value={dep.ID}>
//                         <Checkbox checked={selectedDepartements.includes(dep.ID)} />
//                         <Typography variant="body2">{dep.NOM}</Typography>
//                       </MenuItem>
//                     ))}
//                   </Select> */}

//             <Select
//               labelId="departement-select-label"
//               multiple
//               value={selectedDepartements}
//               onChange={(e) => {
//                 const value = e.target.value;

//                 // IDs qui doivent toujours rester sélectionnés
//                 const currentDeptId = Departement.ID;
//                 const directionDept = departementOptions.find(
//                   (d) => d.NOM.trim().toLowerCase() === "direction"
//                 );
//                 const directionId = directionDept ? directionDept.ID : null;

//                 const forcedIds = [currentDeptId, directionId].filter(Boolean);

//                 if (value.includes("all")) {
//                   // === Clic sur "Tout sélectionner / Tout désélectionner" ===
//                   const selectable = departementOptions.filter(
//                     (d) => !forcedIds.includes(d.ID)
//                   );
//                   const allOthersSelected = selectable.every((d) =>
//                     selectedDepartements.includes(d.ID)
//                   );

//                   if (allOthersSelected) {
//                     // Tout est coché → on garde seulement les forcés
//                     setSelectedDepartements(forcedIds);
//                   } else {
//                     // On coche tout
//                     setSelectedDepartements(
//                       departementOptions.map((d) => d.ID)
//                     );
//                   }
//                 } else {
//                   // === Sélection manuelle ===
//                   const newValue =
//                     typeof value === "string" ? value.split(",") : value;

//                   // On enlève les forcés s'ils ont été retirés (ne devrait pas arriver)
//                   const cleaned = newValue.filter(
//                     (id) => !forcedIds.includes(id)
//                   );

//                   // On les remet toujours
//                   setSelectedDepartements(
//                     Array.from(new Set([...cleaned, ...forcedIds]))
//                   );
//                 }
//               }}
//               label="Départements"
//               renderValue={(selected) =>
//                 selected
//                   .map((id) => departementOptions.find((d) => d.ID === id)?.NOM)
//                   .filter(Boolean)
//                   .join(", ")
//               }
//               MenuProps={{
//                 PaperProps: { style: { maxHeight: 300, width: 300 } },
//               }}
//             >
//               {/* === Tout sélectionner / Tout désélectionner === */}
//               <MenuItem value="all">
//                 <Checkbox
//                   checked={departementOptions
//                     .filter((d) => {
//                       const dir = departementOptions.find(
//                         (x) => x.NOM.trim().toLowerCase() === "direction"
//                       )?.ID;
//                       return d.ID !== Departement.ID && d.ID !== dir;
//                     })
//                     .every((d) => selectedDepartements.includes(d.ID))}
//                   indeterminate={
//                     selectedDepartements.length > 2 && // au moins un autre que les 2 forcés
//                     !departementOptions
//                       .filter(
//                         (d) =>
//                           d.ID !== Departement.ID &&
//                           d.ID !==
//                             departementOptions.find(
//                               (x) => x.NOM.trim().toLowerCase() === "direction"
//                             )?.ID
//                       )
//                       .every((d) => selectedDepartements.includes(d.ID))
//                   }
//                 />
//                 <Typography variant="body2">
//                   {departementOptions
//                     .filter(
//                       (d) =>
//                         d.ID !== Departement.ID &&
//                         d.ID !==
//                           departementOptions.find(
//                             (x) => x.NOM.trim().toLowerCase() === "direction"
//                           )?.ID
//                     )
//                     .every((d) => selectedDepartements.includes(d.ID))
//                     ? "Tout désélectionner"
//                     : "Tout sélectionner"}
//                 </Typography>
//               </MenuItem>

//               {/* === Liste des départements === */}
//               {departementOptions.map((dep) => {
//                 const isCurrent = dep.ID === Departement.ID;
//                 const isDirection =
//                   dep.NOM.trim().toLowerCase() === "direction";
//                 const isForced = isCurrent || isDirection;

//                 return (
//                   <MenuItem
//                     key={dep.ID}
//                     value={dep.ID}
//                     disabled={isForced}
//                     style={{ opacity: isForced ? 0.6 : 1 }}
//                   >
//                     <Checkbox
//                       checked={selectedDepartements.includes(dep.ID)}
//                       disabled={isForced}
//                     />
//                     <Typography variant="body2">
//                       {dep.NOM}
//                       {isCurrent && " (actuel)"}
//                       {isDirection && " (Direction)"}
//                     </Typography>
//                   </MenuItem>
//                 );
//               })}
//             </Select>
//             {selectedDepartements.length === 0 && (
//               <FormHelperText>Sélection obligatoire</FormHelperText>
//             )}
//           </FormControl>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={handleCloseDialogDocPartager}>Annuler</Button>
//           <Button
//             variant="contained"
//             onClick={handleSaveFolderPartager}
//             disabled={
//               !newFolderNamePartage || selectedDepartements.length === 0
//             } // ✅ désactiver si vide
//           >
//             Créer
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* popup dossier fix  */}
//       <Dialog
//         open={openDialogDocFix}
//         // onClose={handleCloseDialogDocFix}
//         onClose={(event, reason) => {
//           if (reason === "backdropClick") return; // ignore click outside
//           handleCloseDialogDocFix(); // only close for explicit close button
//         }}
//         fullWidth
//         maxWidth="xs"
//       >
//         <DialogTitle>Créer un nouveau dossier Fix</DialogTitle>
//         <DialogContent>
//           <FormControl
//             fullWidth
//             sx={{ mt: 1 }}
//             error={!newFolderNameFix.trim()}
//           >
//             <TextField
//               autoFocus
//               margin="dense"
//               label="Nom du dossier"
//               fullWidth
//               value={newFolderNameFix}
//               onChange={(e) => setNewFolderNameFix(e.target.value)}
//               required
//               error={!newFolderNameFix.trim()}
//             />
//             {!newFolderNameFix.trim() && (
//               <FormHelperText>Nom du dossier obligatoire</FormHelperText>
//             )}
//           </FormControl>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={handleCloseDialogDocFix}>Annuler</Button>
//           <Button
//             variant="contained"
//             onClick={handleSaveFolderFix}
//             disabled={!newFolderNameFix}
//           >
//             Créer
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
//         <DialogTitle>Confirmation de suppression</DialogTitle>
//         <DialogContent>
//           <Typography>
//             Êtes-vous sûr de vouloir supprimer définitivement le dossier{" "}
//             <strong>{folderToDelete?.NAME}</strong> ?
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
//           <Button
//             color="error"
//             variant="contained"
//             onClick={handleDeleteFolder}
//           >
//             Supprimer définitivement
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <ToastContainer position="bottom-center" containerId="modal" />
//     </Box>
//   );
// }


import { useEffect, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import axios from "axios";
import BASE_URL from "../Utilis/constantes";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Document from "../documents/document";

export default function ChildFolder({
  Departement,
  userRole,
  currentUser,
  Departements,
  parentFolder,
}) {
  const [folders, setFolders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogDocPartager, setopenDialogDocPartager] = useState(false);
  const [openDialogDocFix, setopenDialogDocFix] = useState(false);

  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderNamePartage, setNewFolderNamePartage] = useState("");
  const [newFolderNameFix, setNewFolderNameFix] = useState("");

  const [activeFolder, setActiveFolder] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUserOptions, setAllUserOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editingSharedFolder, setEditingSharedFolder] = useState(null);

  const [folderToDelete, setFolderToDelete] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [departementOptions, setDepartementoptions] = useState([]);
  const [selectedDepartements, setSelectedDepartements] = useState([]);
  // key: departmentId, value: array of userIds selected for that department
  const [departmentAccessMap, setDepartmentAccessMap] = useState({});

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // --- Helpers ---

  const isProtectedUser = (user) =>
    user.ROLE === "administrateur" ||
    user.ROLE === "Réception" ||
    user.ID_UTILISATEUR === currentUser.ID_UTILISATEUR;

  // -------- Data loading & filtering --------

  useEffect(() => {
    setFolders([]);

    if (currentUser.ID_UTILISATEUR && Departement?.ID) {
      fetchFolders(1);
    }
  }, [currentUser.ID_UTILISATEUR, Departement?.ID]);

  useEffect(() => {
    fetchFolders(page);
  }, [page]);

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

  // Users for standard child folders (intersection: child dept + parent access)
  useEffect(() => {
    if (!Departement?.NOM || !Array.isArray(allUserOptions)) return;

    const filteredUsers = allUserOptions.filter(
      (u) => u.DEPARTEMENT === Departement.NOM
    );

    const parentAccessIds = (parentFolder?.ACCESS_USERS || []).map((u) =>
      Number(u.id)
    );

    const finalFiltered = filteredUsers.filter((u) =>
      parentAccessIds.includes(Number(u.ID_UTILISATEUR))
    );

    setUserOptions(finalFiltered);
    setSelectedUsers(finalFiltered.map((u) => u.ID_UTILISATEUR));
  }, [Departement, allUserOptions, parentFolder]);

  // Departments & default departmentAccessMap for shared child folders
  useEffect(() => {
    if (
      !Departements ||
      !parentFolder?.ACCESS_DEPARTMENTS ||
      !allUserOptions.length
    )
      return;

    const allowedDeptIDs = parentFolder.ACCESS_DEPARTMENTS.map((d) =>
      Number(d.id)
    );

    const filteredDepartments = Departements.filter((d) =>
      allowedDeptIDs.includes(Number(d.ID))
    );

    setDepartementoptions(filteredDepartments);
    setSelectedDepartements(filteredDepartments.map((d) => d.ID));

    const parentUserIds = (parentFolder.ACCESS_USERS || []).map((u) =>
      Number(u.id)
    );
    const map = {};
    filteredDepartments.forEach((dep) => {
      const usersInDep = allUserOptions.filter(
        (u) => u.DEPARTEMENT === dep.NOM
      );
      map[dep.ID] = usersInDep
        .filter((u) => parentUserIds.includes(u.ID_UTILISATEUR))
        .map((u) => u.ID_UTILISATEUR);
    });
    setDepartmentAccessMap(map);
  }, [Departements, parentFolder?.ACCESS_DEPARTMENTS, allUserOptions]);

  const fetchFolders = async (page = 1) => {
    try {
      if (!currentUser.ID_UTILISATEUR || !Departement?.ID) return;

      const response = await fetch(
        `${BASE_URL}/api/folders/${currentUser?.ID_UTILISATEUR}/${Departement.ID}?parentId=${parentFolder.ID}&page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        toast.error("Impossible de charger les dossiers !", {
          containerId: "modal",
        });
      }

      const data = await response.json();
      setFolders(data?.data || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger les dossiers !", {
        containerId: "modal",
      });
    }
  };

  // -------- Delete --------

  const handleOpenDeleteDialog = (folder) => {
    setFolderToDelete(folder);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setFolderToDelete(null);
    setOpenDeleteDialog(false);
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
        { containerId: "modal" }
      );
      fetchFolders(1);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de supprimer le dossier", {
        containerId: "modal",
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // -------- Standard child folder --------

  const handleOpenDialog = () => {
    setNewFolderName("");
    setEditingFolder(null);

    if (parentFolder?.ACCESS_USERS && Departement?.NOM) {
      const allowedUserIDs = parentFolder.ACCESS_USERS.map((u) => Number(u.id));

      const filteredUsers = allUserOptions.filter(
        (u) =>
          u.DEPARTEMENT === Departement.NOM &&
          allowedUserIDs.includes(Number(u.ID_UTILISATEUR))
      );

      setUserOptions(filteredUsers);
      setSelectedUsers(filteredUsers.map((u) => u.ID_UTILISATEUR));
    } else {
      const fallbackUsers = Departement?.NOM
        ? allUserOptions.filter((u) => u.DEPARTEMENT === Departement.NOM)
        : allUserOptions;

      setUserOptions(fallbackUsers);
      setSelectedUsers(fallbackUsers.map((u) => u.ID_UTILISATEUR));
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setNewFolderName("");
    setEditingFolder(null);
    setOpenDialog(false);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Le nom du dossier est obligatoire !", {
        containerId: "modal",
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Veuillez sélectionner au moins un utilisateur !", {
        containerId: "modal",
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
        parentId: parentFolder.ID,
        folder_type: parentFolder.FOLDER_TYPE,
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
      toast.success("Dossier créé avec succès", { containerId: "modal" });
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création du dossier !", {
        containerId: "modal",
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
      toast.info("Aucun changement détecté", { containerId: "modal" });
      return;
    }

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
              userIds: selectedUsers.map(Number),
              departmentIds: [],
            }),
          }
        );
        if (!resAccess.ok) throw new Error("Erreur mise à jour accès");
      }

      toast.success("Dossier mis à jour avec succès", {
        containerId: "modal",
      });
      fetchFolders(1);
    } catch (err) {
      console.error(err);
      toast.error("Échec de la mise à jour du dossier", {
        containerId: "modal",
      });
    } finally {
      setEditingFolder(null);
      setOpenDialog(false);
    }
  };

  const handleSaveFolder = async () => {
    if (editingFolder) {
      await updateFolder();
    } else {
      await createFolder();
    }
  };

  const handleEditClick = (folder) => {
    setNewFolderName(folder.NAME);
    const userIds = folder.ACCESS_USERS.map((u) => parseInt(u.id));
    setSelectedUsers(userIds);
    setEditingFolder(folder);
    setOpenDialog(true);
  };

  // -------- Shared child folder --------

  const handleOpenDialogDocPArtager = () => {
    setNewFolderNamePartage("");
    setEditingSharedFolder(null);
    setopenDialogDocPartager(true);
  };

  const handleCloseDialogDocPartager = () => {
    setNewFolderNamePartage("");
    setSelectedDepartements([]);
    setEditingSharedFolder(null);
    setopenDialogDocPartager(false);
  };

  const handleEditSharedClick = (folder) => {
    setNewFolderNamePartage(folder.NAME);

    const depIds = folder.ACCESS_DEPARTMENTS.map((u) => parseInt(u.id));
    const folderUserIds = (folder.ACCESS_USERS || []).map((u) =>
      parseInt(u.id)
    );
    const map = {};
    depIds.forEach((depId) => {
      const dep = Departements.find((d) => d.ID === depId);
      if (!dep) return;

      const usersInDep = allUserOptions.filter(
        (u) => u.DEPARTEMENT === dep.NOM
      );
      map[depId] = usersInDep
        .filter((u) => folderUserIds.includes(u.ID_UTILISATEUR))
        .map((u) => u.ID_UTILISATEUR);
    });

    setDepartmentAccessMap(map);
    setSelectedDepartements(depIds);

    setEditingSharedFolder(folder);
    setopenDialogDocPartager(true);
  };

  const handleSaveFolderPartager = async () => {
    if (editingSharedFolder) {
      await updateSharedFolder();
    } else {
      await createSharedFolder();
    }
  };

  // Toggle helpers for per-department users
  const toggleUserInDepartment = (depId, userId) => {
    // Protection check will be done in UI (don't call this for protected)
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
    setDepartmentAccessMap((prev) => {
      const current = prev[depId] || [];

      const protectedIds = usersInDep
        .filter((u) => isProtectedUser(u))
        .map((u) => u.ID_UTILISATEUR);

      const toggleableIds = usersInDep
        .map((u) => u.ID_UTILISATEUR)
        .filter((id) => !protectedIds.includes(id));

      const currentToggleable = current.filter(
        (id) => !protectedIds.includes(id)
      );
      const allToggleableSelected = toggleableIds.every((id) =>
        currentToggleable.includes(id)
      );

      const nextToggleable = allToggleableSelected ? [] : toggleableIds;

      return {
        ...prev,
        [depId]: Array.from(new Set([...protectedIds, ...nextToggleable])),
      };
    });
  };

  // CREATE shared child folder with departmentAccessMap
  const createSharedFolder = async () => {
    if (!newFolderNamePartage.trim()) {
      toast.error("Le nom du dossier est obligatoire !", {
        containerId: "modal",
      });
      return;
    }

    if (selectedDepartements.length === 0) {
      toast.error("Veuillez sélectionner au moins un département !", {
        containerId: "modal",
      });
      return;
    }

    const someDeptWithoutUsers = selectedDepartements.some((depId) => {
      const dep =
        departementOptions.find((d) => d.ID === depId) ||
        Departements.find((d) => d.ID === depId);
      if (!dep) return false;

      const usersInDep = allUserOptions.filter(
        (u) => u.DEPARTEMENT === dep.NOM
      );
      const protectedIds = usersInDep
        .filter((u) => isProtectedUser(u))
        .map((u) => u.ID_UTILISATEUR);

      const base = departmentAccessMap[depId] || [];
      const effective = new Set([...base, ...protectedIds]);

      return effective.size === 0;
    });

    if (someDeptWithoutUsers) {
      toast.error(
        "Veuillez sélectionner au moins un utilisateur pour chaque département !",
        { containerId: "modal" }
      );
      return;
    }

    try {
      const defaultSelected = allUserOptions
        .filter(
          (user) =>
            user.ROLE === "administrateur" || user.ROLE === "Réception"
        )
        .map((user) => user.ID_UTILISATEUR);

      const mergedDepartments = Array.from(
        new Set([...(selectedDepartements || []), Departement?.ID])
      );

      const departmentAccess = mergedDepartments.map((depId) => {
        const dep =
          departementOptions.find((d) => d.ID === depId) ||
          Departements.find((d) => d.ID === depId);
        if (!dep) {
          return { departmentId: depId, userIds: [] };
        }

        const usersInDep = allUserOptions.filter(
          (u) => u.DEPARTEMENT === dep.NOM
        );
        const protectedIds = usersInDep
          .filter((u) => isProtectedUser(u))
          .map((u) => u.ID_UTILISATEUR);

        const base = departmentAccessMap[depId] || [];
        const ids = Array.from(new Set([...base, ...protectedIds]));

        return {
          departmentId: depId,
          userIds: ids,
        };
      });

      const body = {
        name: newFolderNamePartage.trim(),
        folder_type: "shared",
        departmentId: Departement?.ID,
        parentId: parentFolder.ID,
        createdBy: currentUser?.ID_UTILISATEUR,
        departmentAccess,
        userIds: defaultSelected,
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

      toast.success("Dossier Partager  créé avec succès", {
        containerId: "modal",
      });
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création du dossier Partager !", {
        containerId: "modal",
      });
    }
  };

  // UPDATE shared child folder with departmentAccessMap
  const updateSharedFolder = async () => {
    if (!editingSharedFolder) return;

    const trimmedName = newFolderNamePartage.trim();

    if (!trimmedName) {
      toast.error("Le nom du dossier est obligatoire !", {
        containerId: "modal",
      });
      return;
    }

    if (selectedDepartements.length === 0) {
      toast.error("Veuillez sélectionner au moins un département !", {
        containerId: "modal",
      });
      return;
    }

    const someDeptWithoutUsers = selectedDepartements.some((depId) => {
      const dep =
        departementOptions.find((d) => d.ID === depId) ||
        Departements.find((d) => d.ID === depId);
      if (!dep) return false;

      const usersInDep = allUserOptions.filter(
        (u) => u.DEPARTEMENT === dep.NOM
      );
      const protectedIds = usersInDep
        .filter((u) => isProtectedUser(u))
        .map((u) => u.ID_UTILISATEUR);

      const base = departmentAccessMap[depId] || [];
      const effective = new Set([...base, ...protectedIds]);

      return effective.size === 0;
    });

    if (someDeptWithoutUsers) {
      toast.error(
        "Veuillez sélectionner au moins un utilisateur pour chaque département !",
        { containerId: "modal" }
      );
      return;
    }

    const oldDeptIds = editingSharedFolder.ACCESS_DEPARTMENTS.map((u) =>
      Number(u.id)
    );
    const newDeptIds = selectedDepartements.map((d) => Number(d));

    const nameChanged = trimmedName !== editingSharedFolder.NAME;
    const departmentsChanged =
      oldDeptIds.slice().sort((a, b) => a - b).join(",") !==
      newDeptIds.slice().sort((a, b) => a - b).join(",");

    const defaultSelected = allUserOptions
      .filter(
        (user) => user.ROLE === "administrateur" || user.ROLE === "Réception"
      )
      .map((user) => user.ID_UTILISATEUR);

    const mergedDepartments = Array.from(
      new Set([...newDeptIds, Departement?.ID])
    );

    const departmentAccess = mergedDepartments.map((depId) => {
      const dep =
        departementOptions.find((d) => d.ID === depId) ||
        Departements.find((d) => d.ID === depId);
      if (!dep) {
        return { departmentId: depId, userIds: [] };
      }

      const usersInDep = allUserOptions.filter(
        (u) => u.DEPARTEMENT === dep.NOM
      );
      const protectedIds = usersInDep
        .filter((u) => isProtectedUser(u))
        .map((u) => u.ID_UTILISATEUR);

      const base = departmentAccessMap[depId] || [];
      const ids = Array.from(new Set([...base, ...protectedIds]));

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

      if (departmentsChanged || true) {
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
        containerId: "modal",
      });
      fetchFolders(1);
    } catch (err) {
      console.error(err);
      toast.error("Échec de la mise à jour du dossier partager", {
        containerId: "modal",
      });
    } finally {
      setEditingSharedFolder(null);
      setopenDialogDocPartager(false);
    }
  };

  // -------- Fixed child folder --------

  const handleOpenDialogDocFix = () => {
    setNewFolderNameFix("");
    setopenDialogDocFix(true);
  };

  const handleCloseDialogDocFix = () => {
    setNewFolderNameFix("");
    setopenDialogDocFix(false);
  };

  const handleSaveFolderFix = async () => {
    if (!newFolderNameFix.trim()) {
      toast.error("Le nom du dossier est obligatoire !", {
        containerId: "modal",
      });
      return;
    }

    try {
      const body = {
        name: newFolderNameFix.trim(),
        parentId: parentFolder.ID,
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
      toast.success("Dossier Fix  créé avec succès", {
        containerId: "modal",
      });
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création du dossier Fix !", {
        containerId: "modal",
      });
    }
  };

  // -------- Render --------

  return (
    <Box>
      <Box sx={{ minHeight: "100vh", p: 3 }}>
        <Paper
          sx={{
            p: 3,
            boxShadow: "none",
            border: "1px solid #f5f5f5",
            borderRadius: 2,
          }}
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
            {parentFolder.FOLDER_TYPE === "standard" && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{ mr: 2 }}
              >
                Créer un dossier
              </Button>
            )}
            {parentFolder.FOLDER_TYPE === "shared" && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialogDocPArtager}
                sx={{ mr: 2 }}
              >
                Créer un dossier Partager
              </Button>
            )}
            {currentUser.ROLE === "Réception" &&
              parentFolder.FOLDER_TYPE === "fixed" && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialogDocFix}
                >
                  Créer un dossier Fix
                </Button>
              )}
          </Box>

          {folders.length === 0 ? (
            <Typography variant="body1" color="textSecondary">
              Aucun dossier créé pour le moment.
            </Typography>
          ) : (
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
          )}

          {folders.length > 0 && (
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
          )}
        </Paper>
      </Box>

      {/* Folder view dialog */}
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
            <Document
              Departement={Departement}
              userRole={userRole}
              folder={activeFolder}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Standard child folder dialog */}
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

          <FormControl
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mt: 2 }}
            required
            error={
              selectedUsers.filter(
                (id) => id !== currentUser.ID_UTILISATEUR
              ).length === 0 && Departement.NOM !== currentUser.DEPARTEMENT
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

                const protectedIdsInOptions = userOptions
                  .filter((u) => isProtectedUser(u))
                  .map((u) => u.ID_UTILISATEUR);

                if (value.includes("all")) {
                  const selectableUsers = userOptions.filter(
                    (u) =>
                      !protectedIdsInOptions.includes(u.ID_UTILISATEUR)
                  );

                  const allOthersSelected = selectableUsers.every((u) =>
                    selectedUsers.includes(u.ID_UTILISATEUR)
                  );

                  if (allOthersSelected) {
                    // Keep only protected users
                    setSelectedUsers(protectedIdsInOptions);
                  } else {
                    // Select everyone + protected
                    setSelectedUsers(
                      Array.from(
                        new Set([
                          ...userOptions.map((u) => u.ID_UTILISATEUR),
                          ...protectedIdsInOptions,
                        ])
                      )
                    );
                  }
                } else {
                  const newSelection =
                    typeof value === "string" ? value.split(",") : value;

                  const cleaned = newSelection.filter(
                    (id) => !protectedIdsInOptions.includes(id)
                  );

                  const finalSelection = Array.from(
                    new Set([...cleaned, ...protectedIdsInOptions])
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
                      (u) => !isProtectedUser(u)
                    )
                    .every((u) => selectedUsers.includes(u.ID_UTILISATEUR))}
                  indeterminate={
                    selectedUsers.filter(
                      (id) =>
                        !userOptions.find(
                          (u) =>
                            u.ID_UTILISATEUR === id && isProtectedUser(u)
                        )
                    ).length > 0 &&
                    !userOptions
                      .filter((u) => !isProtectedUser(u))
                      .every((u) =>
                        selectedUsers.includes(u.ID_UTILISATEUR)
                      )
                  }
                />
                <ListItemText
                  primary={
                    userOptions
                      .filter((u) => !isProtectedUser(u))
                      .every((u) => selectedUsers.includes(u.ID_UTILISATEUR))
                      ? "Tout désélectionner"
                      : "Tout sélectionner"
                  }
                />
              </MenuItem>

              {userOptions.map((user) => {
                const isProt = isProtectedUser(user);

                return (
                  <MenuItem
                    key={user.ID_UTILISATEUR}
                    value={user.ID_UTILISATEUR}
                    disabled={isProt}
                    style={{ opacity: isProt ? 0.7 : 1 }}
                  >
                    <Checkbox
                      checked={selectedUsers.includes(user.ID_UTILISATEUR)}
                      disabled={isProt}
                    />
                    <ListItemText
                      primary={user.UTILISATEUR}
                      secondary={isProt ? "Toujours inclus" : undefined}
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

      {/* Shared child folder dialog with per-department user selector */}
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

                let newIds = [];

                if (value.includes("all")) {
                  const selectable = departementOptions.filter(
                    (d) => !forcedIds.includes(d.ID)
                  );
                  const allOthersSelected = selectable.every((d) =>
                    selectedDepartements.includes(d.ID)
                  );

                  if (allOthersSelected) {
                    newIds = forcedIds;
                  } else {
                    newIds = departementOptions.map((d) => d.ID);
                  }
                } else {
                  const newValue =
                    typeof value === "string" ? value.split(",") : value;

                  const cleaned = newValue.filter(
                    (id) => !forcedIds.includes(id)
                  );

                  newIds = Array.from(new Set([...cleaned, ...forcedIds]));
                }

                setSelectedDepartements(newIds);

                // Sync departmentAccessMap with new selection
                setDepartmentAccessMap((prev) => {
                  const parentUserIds = (parentFolder.ACCESS_USERS || []).map(
                    (u) => Number(u.id)
                  );
                  const next = {};
                  newIds.forEach((id) => {
                    if (prev[id]) {
                      next[id] = prev[id];
                    } else {
                      const dep =
                        departementOptions.find((d) => d.ID === id) ||
                        Departements.find((d) => d.ID === id);
                      if (!dep) return;
                      const usersInDep = allUserOptions.filter(
                        (u) => u.DEPARTEMENT === dep.NOM
                      );
                      next[id] = usersInDep
                        .filter((u) =>
                          parentUserIds.includes(u.ID_UTILISATEUR)
                        )
                        .map((u) => u.ID_UTILISATEUR);
                    }
                  });
                  return next;
                });
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
                            (x) =>
                              x.NOM.trim().toLowerCase() === "direction"
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

          {/* Utilisateurs par département */}
          {selectedDepartements.map((depId) => {
            const dep =
              departementOptions.find((d) => d.ID === depId) ||
              Departements.find((d) => d.ID === depId);
            if (!dep) return null;

            const usersInDep = allUserOptions.filter(
              (u) => u.DEPARTEMENT === dep.NOM
            );

            const baseSelected = departmentAccessMap[depId] || [];

            const protectedIds = usersInDep
              .filter((u) => isProtectedUser(u))
              .map((u) => u.ID_UTILISATEUR);

            const selectedUsersForDep = Array.from(
              new Set([...baseSelected, ...protectedIds])
            );

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

            const allIds = usersInDep.map((u) => u.ID_UTILISATEUR);
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
                  <Button
                    size="small"
                    onClick={() =>
                      toggleAllUsersInDepartment(depId, usersInDep)
                    }
                  >
                    {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                  </Button>
                </Box>

                <FormGroup>
                  {usersInDep.map((user) => {
                    const isProt = isProtectedUser(user);
                    return (
                      <FormControlLabel
                        key={user.ID_UTILISATEUR}
                        control={
                          <Checkbox
                            checked={selectedUsersForDep.includes(
                              user.ID_UTILISATEUR
                            )}
                            onChange={() =>
                              !isProt &&
                              toggleUserInDepartment(
                                depId,
                                user.ID_UTILISATEUR
                              )
                            }
                            disabled={isProt}
                          />
                        }
                        label={
                          user.UTILISATEUR +
                          (isProt ? " (Toujours inclus)" : "")
                        }
                      />
                    );
                  })}
                </FormGroup>

                {selectedUsersForDep.length === 0 && (
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
                const dep =
                  departementOptions.find((d) => d.ID === depId) ||
                  Departements.find((d) => d.ID === depId);
                if (!dep) return false;

                const usersInDep = allUserOptions.filter(
                  (u) => u.DEPARTEMENT === dep.NOM
                );
                const protectedIds = usersInDep
                  .filter((u) => isProtectedUser(u))
                  .map((u) => u.ID_UTILISATEUR);

                const base = departmentAccessMap[depId] || [];
                const effective = new Set([...base, ...protectedIds]);

                return effective.size === 0;
              })
            }
          >
            {editingSharedFolder ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fixed child folder dialog */}
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

      {/* Delete confirmation */}
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

      <ToastContainer position="bottom-center" containerId="modal" />
    </Box>
  );
}