import * as React from 'react';
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from "@mui/material";
import PhonePausedIcon from '@mui/icons-material/PhonePaused';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ContactsIcon from '@mui/icons-material/Contacts';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Box from '@mui/material/Box';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import BadgeIcon from '@mui/icons-material/Badge';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import EmployeeRequestsTabs from '../RhDepartement/EmployeeReqTabs';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import TabsPartenaires from '../Commercial/Partenaires/CommunicationPagePart';
import TabsInvestisseurs from '../Commercial/Investisseurs/CommunicationPageInv';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import TabsCspd from '../Commercial/CSPD/CommunicationPage';
import MouvementsByDate from '../Commercial/MouvementsByDate';
import TabsClientFdm from '../Commercial/FDM/CommunicationPageFDM';
import UserEvaluationDialog from '../Adminstration/UserEvaluationDialog';
import Tabsfamily from '../Commercial/Family/TabsFamily';
import AssuredWorkloadRoundedIcon from '@mui/icons-material/AssuredWorkloadRounded';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Tooltip from '@mui/material/Tooltip';
import settings from '../icons/settings.png'
import SavManagement from '../Sav/Savmanagement';
import RenseignementCommercial from '../Commercial/RenseignementCommercial';
import JournalCommercial from '../Commercial/JournalCommercial';
import { useSelector } from 'react-redux';
import userIcon from '../icons/userIcon.png'
import CallsJournal from '../Commercial/CallsJournal';
import DemAchat from '../Commercial/DemandeAchat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import ShopTwoIcon from '@mui/icons-material/ShopTwo';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import BASE_URL from '../Utilis/constantes';
import { Badge, Popover, Avatar, Button } from '@mui/material';
import cmdIcon from '../icons/cmd.png'
import personIcon from '../icons/per.png'
import RestoreIcon from '@mui/icons-material/Restore';
import { useAccessRights } from '../Utilis/accessRights';
import OrdresAdministration from '../Adminstration/OrdreAdministration';
import ReclamationsList from '../Sav/ReclamationsList';
import Visits from '../Commercial/VisiteClients';
import SosIcon from '@mui/icons-material/Sos';
import SOSList from "../Sav/SOSList";
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import FolderDocument from "../FolderDocument/FolderDocument";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { toast, ToastContainer } from 'react-toastify';
import InfoIcon from "@mui/icons-material/Info";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { addNotificationListener, emitNotification, removeNotificationListener, socketState } from '../socketRef';
import PaymentsIcon from '@mui/icons-material/Payments';
import ArticlesNoMovementPage from "../Commercial/ArticlesNoMovementPage";
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
//alert
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AlertePage from '../Commercial/alert';


const drawerWidth = 340;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});
const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const tomorrowString = tomorrow.toISOString().split("T")[0];

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  ...(!open && {
    marginLeft: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
      marginLeft: `calc(${theme.spacing(8)} + 1px)`,
    },
    width: `calc(100% - ${theme.spacing(7)} - 1px)`,
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${theme.spacing(8)} - 1px)`,
    },
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: !open ? 100 : drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
      position: 'relative',
      width: !open ? 100 : drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      overflowX: 'hidden',
      '&:hover': {
        width: drawerWidth,
      },
      ...(open && {
        ...openedMixin(theme),
      }),
      ...(!open && {
        ...closedMixin(theme),
        width: `calc(${theme.spacing(7)} + 1px)`,
        [theme.breakpoints.up('sm')]: {
          width: `calc(${theme.spacing(8)} + 1px)`,
        },
      }),
    },
  }),
);

export const connectSocket = (onConnected) => {
  // if (!userRole) {
  // // console.warn("WebSocket not opened: userRole is missing");
  // // return;
  // // }
  if (
    socketState.socket &&
    (socketState.socket.readyState === WebSocket.OPEN ||
      socketState.socket.readyState === WebSocket.CONNECTING)
  )
    return;
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const socket = new WebSocket("ws://127.0.0.1:8800");
  socketState.socket = socket;
  let reconnectAttempts = 0;
  socket.onopen = () => {
    socketState.isConnected = true;
    reconnectAttempts = 0;
    // reset attempts on successful connection
    socket.send(
      JSON.stringify({
        type: "register",
        // role: userRole,
        dep: savedUser.DEPARTEMENT,
      })
    );
  };
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "noMovementAlert") {
        emitNotification(data);
      }
    } catch (err) {
      console.error("Error parsing WebSocket message:", err);
    }
  };
  socket.onerror = (err) => console.error("WebSocket error:", err);
  socket.onclose = () => {
    console.warn("WebSocket closed, attempting to reconnect...");
    socketState.isConnected = false;
    const timeout = Math.min(1000 * 2 ** reconnectAttempts, 30000);
    // exponential backoff max 30s
    reconnectAttempts += 1;
    setTimeout(() => {
      connectSocket(); // try reconnect
    }, timeout);
  };
};

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = useState(-1);
  const [openCategory, setOpenCategory] = React.useState(null);
  const user = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOption, setSelectedOption] = useState('0')
  const [value, setValue] = useState(0)
  const accessRights = useAccessRights(user?.LOGIN);
  const [isLoading, setIsLoading] = useState(true);
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [evaluationCount, setEvaluationCount] = useState(0);
  const prevEvaluationCount = useRef(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [newNotification, setNewNotification] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [alldepartments, setallDepartments] = useState([]);

  const [userRole, setUserRole] = useState(user.ROLE);


  const [openSnackbarNotifMvt, setOpenSnackbarNotifMvt] = useState(false);
  const [newNotificationMvt, setNewNotificationMvt] = useState(null);
  const [notificationsMvt, setNotificationsMvt] = useState([]);
  const [notificationQueue, setNotificationQueue] = useState([]);
  //alert
  const [alerts, setAlerts] = useState([]);
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const [expandedAlertId, setExpandedAlertId] = useState(null);
  //article non movmenter
  const [openNoMvtDialog, setOpenNoMvtDialog] = useState(false);
  const [noMvtRows, setNoMvtRows] = useState([]);
  const [noMvtTotal, setNoMvtTotal] = useState(0);

  const [noMvtPage, setNoMvtPage] = useState(0);
  const [noMvtPageSize, setNoMvtPageSize] = useState(15);
  const [noMvtLoading, setNoMvtLoading] = useState(false);

  const fetchAlerts = async () => {
    if (!user?.ID_UTILISATEUR) return;

    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    try {
      const response = await axios.get(`${BASE_URL}/api/alerts`, {
        params: {
          USER_ID: user.ID_UTILISATEUR,
          DATE_ALERT: today
        }
      });

      const data = response.data?.data || [];
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes :', error);
      setAlerts([]);
    }
  };
  const fetchNoMovement = async (page = noMvtPage, pageSize = noMvtPageSize) => {
    setNoMvtLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/articles-no-movement`, {
        params: {
          days: 25,
          page,
          pageSize,
        },
      });

      setNoMvtRows(res.data.articles || []);
      setNoMvtTotal(res.data.total || 0);
    } catch (e) {
      console.error("Error fetching no-movement articles:", e);
      setNoMvtRows([]);
      setNoMvtTotal(0);
    } finally {
      setNoMvtLoading(false);
    }
  };

  useEffect(() => {
    fetchNoMovement(noMvtPage, noMvtPageSize);
  }, [openNoMvtDialog, noMvtPage, noMvtPageSize]);

  useEffect(() => {
  if (!user?.ID_UTILISATEUR) return;

  // run immediately
  fetchAlerts();

  // run every 1 minute
  const interval = setInterval(() => {
    fetchAlerts();
  }, 60_000); // 1 min

  // cleanup
  return () => clearInterval(interval);
}, [user?.ID_UTILISATEUR]);

  const handleAlertIconClick = () => {
    setAlertsDialogOpen(true);
  };

  const handleCloseAlertsDialog = () => {
    setAlertsDialogOpen(false);
    setExpandedAlertId(null);
  };




  const fetchEvaluationCount = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/evaluations`);
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      const count = response.data.filter(evaluation => {
        const evalDate = new Date(evaluation.EVALUATION_DATE);
        return evaluation.USER_ID === user.ID_UTILISATEUR && evalDate >= startOfMonth;
      }).length;


      setEvaluationCount(count);

      if (count !== prevEvaluationCount.current) {
        const audio = new Audio('/notification_sound.mp3');
        audio.play();
      }

      prevEvaluationCount.current = count;
    } catch (error) {
      console.error('Error fetching evaluation count:', error);
    }
  };
  const handleEvaluationClick = () => {
    setEvaluationCount(0);
    prevEvaluationCount.current = 0;
    setEvaluationDialogOpen(true);
  };
  useEffect(() => {
    fetchEvaluationCount();
    const intervalId = setInterval(fetchEvaluationCount, 30000);

    return () => clearInterval(intervalId);
  }, [user.LOGIN]);


  useEffect(() => {
    if (accessRights) {
      setIsLoading(false);
    }
  }, [user, accessRights]);


  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/departments`);
        if (user.ROLE !== 'Réception' && user.ROLE !== 'administrateur') {
          const res = response.data.filter(dep => dep.NOM === user.DEPARTEMENT)
          setDepartments(res);
          setallDepartments(response.data)
        } else {
          setDepartments(response.data);
          setallDepartments(response.data)

        }

      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  const categories = [
    {
      name: 'Commercial',
      items: ['Liste des clients'],
      icon: <ContactsIcon />,
    },
    {
      name: 'Administration',
      items: ['Gestion des utilisateurs', 'Gestion des menus'],
      icon: <ManageAccountsIcon />
      ,
    },
    {
      name: 'Paramétrage',
      items: ['Gestion des statuts partenaires', 'Gestion des qualifications appels', 'Gestion des raisons appels'],
      icon: <img src={settings} alt="Clients Icon" style={{ width: '30px', height: '30px' }} />,
    },
    {
      name: 'caisse',
      items: ['caisse'],
      icon: <PointOfSaleIcon />,
    },
    {
      name: "Documents",
      items: departments.map((dept) => dept.NOM), // Dynamically set items from API
      icon: <InsertDriveFileIcon style={{ color: "#4379F2" }} />,
    },
  ];

  const handleCategoryClick = (category) => {
    if (openCategory === category) {
      setOpenCategory(null);
      setSelectedTab(-1);
    } else {
      setOpenCategory(category);
      setSelectedTab(-1);
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  // const handleTabClick = (index) => {
  //   setSelectedTab(index);
  // };
  const handleTabClick = (index, dept) => {
    setSelectedTab(index);
    setSelectedDepartment(dept)
  };

  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const sortedNotifications = [...notifications].sort((a, b) => b.ID - a.ID);
  const sortedNotificationsMvt = [...notificationsMvt].sort((a, b) => b.ID - a.ID);


  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  const navigate = useNavigate();

  const handleNotificationClick = async (notification) => {
    const { TYPE, MESSAGE, ID } = notification;

    let term = '';

    if (['cmdpartenaire', 'cmdfdm', 'cmdcspd', 'cmdinvestisseur'].includes(TYPE)) {

      const match = MESSAGE.match(/Num:\s*'([^']+)'/);
      if (match) {
        term = match[1];
      }
      setSelectedOption('2')
      if (TYPE === 'cmdpartenaire') {
        setValue(0)
      }
      if (TYPE === 'cmdinvestisseur') {
        setValue(1)
      }
      if (TYPE === 'cmdcspd') {
        setValue(2)
      }
      if (TYPE === 'cmdfdm') {
        setValue(3)
      }
    } else if (TYPE === 'investisseur' || TYPE === 'partenaire') {

      term = MESSAGE.split(' de la part de ')[1].replace(/'/g, "");
      setSelectedOption('0')
    }
    setSearchTerm(term);
    setOpenCategory('Commercial');
    setSelectedTab(0);
    setNotifications((prev) => prev.filter((notif) => notif.ID !== ID));

    try {
      await axios.post(`${BASE_URL}/api/createNotifUser`, {
        userLogin: user.LOGIN,
        id: ID
      });
    } catch (error) {
      console.error('Error creating notification user:', error);
    }
    setAnchorEl(null);
  };


  const handleNotificationMvtClick = async (notification) => {
    const { TYPE, MESSAGE, ID } = notification;

    setNotificationsMvt((prev) => prev.filter((notif) => notif.ID !== ID));

    try {
      await axios.put(`${BASE_URL}/api/notifications/${notification.ID}/read`);
      toast.success("Notification marquée comme lue avec succès", {
        autoClose: 3000,
      });
      // fetchNotificationsMvt(user.ID_UTILISATEUR);
      loadNotifications()
    } catch (error) {
      console.error("Error creating notification user:", error);
      toast.error("Erreur lors de la mise à jour de la notification", {
        autoClose: 3000,
      });
    }
    setAnchorEl(null);
  };
  const openNot = Boolean(anchorEl);
  const id = openNot ? 'simple-popover' : undefined;

  const handleClearAllNotifications = async () => {
    for (const notification of notifications) {
      try {
        await axios.post(`${BASE_URL}/api/createNotifUser`, {
          userLogin: user.LOGIN,
          id: notification.ID,
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    if (notificationsMvt && notificationsMvt.length > 0) {
      try {
        const ids = notificationsMvt
          .filter((n) => n.IS_READ !== 1)
          .map((n) => n.ID);

        if (ids.length === 0) {
          toast.info("Aucune nouvelle notification à marquer comme lue.", {
            autoClose: 2500,
          });
          return;
        }

        await axios.put(`${BASE_URL}/api/notifications/read-all`, {
          ids,
        });

        toast.success(
          "Toutes les notifications non lues ont été marquées comme lues avec succès.",
          {
            autoClose: 3000,
          }
        );
        loadNotifications()

      } catch (error) {
        console.error("Error marking notifications as read:", error);
        toast.error("Erreur lors de la mise à jour des notifications.", {
          autoClose: 3000,
        });
      }
    }

    setNotifications([]);
    setNotificationsMvt([]);
    setAnchorEl(null);
  };

  const toggleActif = async (alertId) => {
    try {
      
      const newValue ='N';
  
      await axios.patch(`${BASE_URL}/api/alerts/${alertId}`, {
        ACTIF: newValue,
        id:alertId
      });
  
      setAlerts(prevAlerts =>
        prevAlerts.map(alert =>
          alert.ID_ALERT === alertId ? { ...alert, ACTIF: newValue } : alert
        )
      );
    } catch (err) {
      console.error('Erreur PATCH ACTIF:', err);
      alert('Erreur lors de la mise à jour de l\'état');
    }
  };


  const handleBellClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const popupAnimation = {
    '@keyframes popIn': {
      '0%': {
        transform: 'scale(0.3)',
        opacity: 0
      },
      '50%': {
        transform: 'scale(1.1)',
      },
      '100%': {
        transform: 'scale(1)',
        opacity: 1
      }
    }
  };
  const clearButtonStyle = {
    fontWeight: 'bold',
    borderRaduis: '20px',
    textAlign: 'end',
    color: 'red',
    backgroundColor: '#3FA2F6',
    BorderColor: 'blue',
    width: '100%',
    Margin: '15px',
    marginTop: '-10px',
    transition: 'background-color 0.3s ease',
    fontSize: '13px'
  };
  const clearButtonHoverStyle = {
    backgroundColor: '#D1E9F6',
    color: 'gray'
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const prevNotificationLength = useRef(0);

  const playNotificationSound = () => {
    const audio = new Audio('/notification_sound.mp3');
    audio.play();
  };
  const renderNotificationHeader = () => {
    if (notifications.length === 0 && notificationsMvt.length === 0) {
      return (
        <Typography
          variant="body1"
          style={{
            textAlign: "center",
            margin: "10px 0",
            color: "#555",
            width: "350px",
          }}
        >
          Il n'existe aucune notification pour vous à l'instant !
        </Typography>
      );
    } else {
      return (
        <Button
          variant="body1"
          style={{
            ...clearButtonStyle,
            ...(isHovered && clearButtonHoverStyle),
          }}
          onClick={handleClearAllNotifications}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Marquer tous les notificaions comme lus
        </Button>
      );
    }
  };

useEffect(() => {
  // Variable pour suivre si l'utilisateur a interagi
  const hasUserInteracted = { current: false };
  
  // Fonction pour marquer l'interaction utilisateur
  const markUserInteraction = () => {
    hasUserInteracted.current = true;
    // Nettoyer les écouteurs après la première interaction
    document.removeEventListener('click', markUserInteraction);
    document.removeEventListener('keydown', markUserInteraction);
    document.removeEventListener('touchstart', markUserInteraction);
  };

  // Ajouter les écouteurs d'événements
  document.addEventListener('click', markUserInteraction);
  document.addEventListener('keydown', markUserInteraction);
  document.addEventListener('touchstart', markUserInteraction);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/getNotifications`, {
        params: { userLogin: user.LOGIN },
      });

      // Vérifier s'il y a de nouvelles notifications
      if (response.data.length > notifications.length) {
        // Récupérer la notification la plus récente
        const newestNotification = response.data[0];
        setNewNotification(newestNotification);
        setOpenSnackbar(true);

        // Jouer le son de notification
        const playNotificationSound = async () => {
          try {
            const audio = new Audio('/notification_sound.mp3');
            
            // Si l'utilisateur a déjà interagi, jouer directement
            if (hasUserInteracted.current) {
              await audio.play();
            } else {
              // Sinon, attendre la prochaine interaction
              
              const playOnInteraction = () => {
                audio.play().catch(e => console.log('Erreur de lecture:', e));
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('keydown', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
              };
              
              document.addEventListener('click', playOnInteraction);
              document.addEventListener('keydown', playOnInteraction);
              document.addEventListener('touchstart', playOnInteraction);
            }
          } catch (error) {
            console.error('Erreur lors de la lecture du son:', error);
          }
        };

        playNotificationSound();
      }

      setNotifications(response.data);
      prevNotificationLength.current = response.data.length;
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  fetchNotifications();
  const intervalId = setInterval(fetchNotifications, 50000);

  return () => {
    clearInterval(intervalId);
    document.removeEventListener('click', markUserInteraction);
    document.removeEventListener('keydown', markUserInteraction);
    document.removeEventListener('touchstart', markUserInteraction);
  };
}, [user.LOGIN]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };
  const handleCloseSnackbarNotifMvt = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbarNotifMvt(false);
  };

  useEffect(() => {
    if (!user?.ID_UTILISATEUR) return;
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    const newItems = await fetchNotificationsMvt(user.ID_UTILISATEUR);
    setNotificationsMvt(newItems);
  };

  const fetchNotificationsMvt = async (userId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/notifications/${userId}?active=true`
        // page=1&limit=10&
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      return data.data || [];
    } catch (err) {
      console.error("Failed to fetch notifications (Mvt):", err);
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!user?.ID_UTILISATEUR) return;

      // await fetchNotificationsMvt(user.ID_UTILISATEUR);

      connectSocket(); // try reconnect

      const handleNotification = (data) => {

        const items = Array.isArray(data) ? data.flat() : [data];
        setNotificationQueue((prev) => [...prev, ...items]);
      };

      addNotificationListener(handleNotification);

      // cleanup listener on unmount
      return () => removeNotificationListener(handleNotification);
    };

    init();
  }, [user]);

  const notificationQueueRef = useRef([]);
  const processingQueueRef = useRef(false);

  useEffect(() => {
    notificationQueueRef.current = notificationQueue;

    if (
      !processingQueueRef.current &&
      notificationQueueRef.current.length > 0
    ) {
      processingQueueRef.current = true;

      const processQueue = async () => {
        while (notificationQueueRef.current.length > 0) {
          const current = notificationQueueRef.current[0];
          setNewNotificationMvt(current);
          setOpenSnackbarNotifMvt(true);

          await new Promise((resolve) => setTimeout(resolve, 10000));

          setOpenSnackbarNotifMvt(false);
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Remove the processed item from ref and state
          notificationQueueRef.current.shift();
          setNotificationQueue([...notificationQueueRef.current]);
        }

        processingQueueRef.current = false;
      };

      processQueue();
      loadNotifications()
    }
  }, [notificationQueue]);

  useEffect(() => {
    const checkNewEntries = async () => {
      try {
        await axios.get(`${BASE_URL}/api/getNewCmdInv`)
        await axios.get(`${BASE_URL}/api/getNewCmdPart`)
        await axios.get(`${BASE_URL}/api/getNewCmdFdm`)
        await axios.get(`${BASE_URL}/api/getNewCmdCspd`)
        await axios.get(`${BASE_URL}/api/getNewPart`);
      } catch (error) {
        console.error('Error fetching new entries:', error);
      }
    };

    const intervalId = setInterval(checkNewEntries, 50000);

    return () => clearInterval(intervalId);
  }, []);

  const boldTextStyle = {
    '& .MuiListItemText-primary': {
      fontWeight: 'bold',
    }
  };


  return (
    <Box sx={{ display: 'flex', backgroundColor: '#F5F7F8' }}>

      <CssBaseline />
      <AppBar position="fixed" open={open} style={{ backgroundColor: '#3572EF' }}>
        <Snackbar
          open={openSnackbarNotifMvt}
          autoHideDuration={6000}
          onClose={handleCloseSnackbarNotifMvt}
          anchorOrigin={{ vertical: "center", horizontal: "center" }}
          sx={{
            "& .MuiAlert-root": {
              animation: "popIn 0.5s ease-out",
              ...popupAnimation,
              minWidth: "400px",
              maxWidth: "600px",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          <Alert
            onClose={handleCloseSnackbarNotifMvt}
            severity="info"
            sx={{
              backgroundColor: "#3572EF",
              color: "white",
              padding: "20px",
              // "& .MuiAlert-icon": {
              //   color: "white",
              //   fontSize: "28px",
              // },
              "& .MuiAlert-message": {
                fontSize: "16px",
                fontWeight: 500,
              },
              "& .MuiAlert-action": {
                paddingTop: "8px",
              },
              transform: "scale(1)",
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.02)",
              },
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* <Avatar
            src={
              newNotificationMvt?.TYPE?.includes("cmd")
                ? cmdIcon
                : personIcon
            }
            sx={{
              width: 40,
              height: 40,
              border: "2px solid white",
            }}
          /> */}
              {newNotificationMvt ? (
                <NotificationsActiveIcon
                  sx={{ fontSize: 40, color: "white" }}
                />
              ) : (
                <InfoIcon sx={{ fontSize: 40, color: "white" }} />
              )}
              <div>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", marginBottom: "4px" }}
                >
                  Nouvelle notification de mouvement
                </Typography>
                <Typography variant="body1">
                  {newNotificationMvt?.message || "Nouvelle alerte reçue."}
                </Typography>
              </div>
            </div>
          </Alert>
        </Snackbar>
        {(!newNotificationMvt ||
          newNotificationMvt == null ||
          newNotificationMvt == undefined) && (
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: "center", horizontal: "center" }}
              sx={{
                "& .MuiAlert-root": {
                  animation: "popIn 0.5s ease-out",
                  ...popupAnimation,
                  minWidth: "400px",
                  maxWidth: "600px",
                  borderRadius: "15px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity="info"
                sx={{
                  backgroundColor: "#3572EF",
                  color: "white",
                  padding: "20px",
                  "& .MuiAlert-icon": {
                    color: "white",
                    fontSize: "28px",
                  },
                  "& .MuiAlert-message": {
                    fontSize: "16px",
                    fontWeight: 500,
                  },
                  "& .MuiAlert-action": {
                    paddingTop: "8px",
                  },
                  transform: "scale(1)",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Avatar
                    src={
                      newNotification?.TYPE?.includes("cmd")
                        ? cmdIcon
                        : personIcon
                    }
                    sx={{
                      width: 40,
                      height: 40,
                      border: "2px solid white",
                    }}
                  />
                  <div>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", marginBottom: "4px" }}
                    >
                      Nouvelle notification
                    </Typography>
                    <Typography variant="body1">
                      {newNotification?.MESSAGE}
                    </Typography>
                  </div>
                </div>
              </Alert>
            </Snackbar>
          )}
        {/* <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
          sx={{
            '& .MuiAlert-root': {
              animation: 'popIn 0.5s ease-out',
              ...popupAnimation,
              minWidth: '400px',
              maxWidth: '600px',
              borderRadius: '15px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }
          }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="info"
            sx={{
              backgroundColor: '#3572EF',
              color: 'white',
              padding: '20px',
              '& .MuiAlert-icon': {
                color: 'white',
                fontSize: '28px'
              },
              '& .MuiAlert-message': {
                fontSize: '16px',
                fontWeight: 500
              },
              '& .MuiAlert-action': {
                paddingTop: '8px'
              },
              transform: 'scale(1)',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              }
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Avatar
                src={newNotification?.TYPE?.includes('cmd') ? cmdIcon : personIcon}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid white'
                }}
              />
              <div>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  Nouvelle notification
                </Typography>
                <Typography variant="body1">
                  {newNotification?.MESSAGE}
                </Typography>
              </div>
            </div>
          </Alert>
        </Snackbar> */}
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {openCategory ? openCategory : 'Menu'}
            {selectedTab !== -1 && ` - ${categories.find((cat) => cat.name === openCategory)?.items[selectedTab]}`}
          </Typography>

          {/* 🚫 Articles sans mouvement */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", ml: 2 }}>
            <IconButton
              color="inherit"
              onClick={() => {
                setOpenNoMvtDialog(true);
                setNoMvtPage(0); // reset when opening
              }}
            >
              <Badge
                badgeContent={noMvtTotal}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <ProductionQuantityLimitsIcon sx={{ width: 40, height: 40 }} />
              </Badge>
            </IconButton>

            <Typography
              variant="caption"
              sx={{
                mt: "-6px",
                color: "white",
                fontSize: "0.7rem",
                whiteSpace: "nowrap",
              }}
            >
              Sans mouvement
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", ml: 2 }}>
            <IconButton color="inherit" onClick={handleAlertIconClick}>
              <Badge
                badgeContent={alerts.length}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <ContactSupportIcon sx={{ width: 40, height: 40 }} />
              </Badge>
            </IconButton>

            <Typography
              variant="caption"
              sx={{
                mt: "-6px",
                color: "white",
                fontSize: "0.7rem",
                whiteSpace: "nowrap",
              }}
            >
              Mes Alerts
            </Typography>
          </Box>


          <Box sx={{ marginLeft: 'auto', marginRight: 3, fontWeight: 'bold' }}>
            {user && user.ROLE && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: 8 }}>
                  <img src={userIcon} alt="person icon" style={{ width: "30px", height: "30px" }} />
                </div>
                <div>
                  <Typography variant="body1" color="secondary" style={{ fontSize: "25px", fontWeight: "bold", color: "#e99c05", marginTop: "5px" }}>
                    {user.LOGIN}
                  </Typography>
                  <Typography variant="body2" color="white" style={{ fontSize: "14px", fontWeight: "normal", marginLeft: 10 }}>
                    {user.ROLE}
                  </Typography>
                </div>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>

                  {/* 🔔 Notifications */}
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <IconButton color="inherit" onClick={handleBellClick}>
                      <Badge
                        badgeContent={
                          notifications.length +
                          notificationsMvt.filter((n) => n.IS_READ === 0).length
                        }
                        sx={{
                          '& .MuiBadge-dot': {
                            backgroundColor: 'red',
                          },
                          '& .MuiBadge-standard': {
                            backgroundColor: 'red',
                            color: '#fff',
                          },
                        }}
                      >
                        <NotificationsIcon
                          sx={{ height: 40, width: 40, color: "#FAFA33" }}
                        />
                      </Badge>
                    </IconButton>
                    <Typography variant="caption" sx={{ mt: "-6px", color: "white" }}>
                      Notifications
                    </Typography>
                  </Box>

                  {/* 💰 Évaluation / Ticket */}
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {user?.ROLE === 'administrateur' ? (
                      <>
                        <Tooltip title="Ticket de caisse" arrow>
                          <IconButton color="inherit" onClick={() => navigate('/tickets')}>
                            <Badge
                              sx={{
                                '& .MuiBadge-dot': { backgroundColor: 'red' },
                                '& .MuiBadge-standard': {
                                  backgroundColor: 'red',
                                  color: '#fff',
                                },
                              }}
                            >
                              <img
                                src={require('../icons/save.png')}
                                alt="Ticket"
                                style={{ height: 40, width: 40 }}
                              />
                            </Badge>
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption" sx={{ mt: "-6px", color: "white" }}>
                          Ticket
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Tooltip title="Évaluation" arrow>
                          <IconButton color="inherit" onClick={handleEvaluationClick}>
                            <Badge
                              badgeContent="+"
                              invisible={evaluationCount === 0}
                              sx={{
                                '& .MuiBadge-badge': {
                                  backgroundColor: '#FAFA33',
                                  color: '#000',
                                  animation:
                                    evaluationCount > 0 ? 'pulse 2s infinite' : 'none',
                                },
                              }}
                            >
                              <img
                                src={require('../icons/save.png')}
                                alt="Évaluation"
                                style={{ height: 40, width: 40 }}
                              />
                            </Badge>
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption" sx={{ mt: "-6px", color: "white" }}>
                          Évaluation
                        </Typography>
                      </>
                    )}
                  </Box>

                </Box>


                <UserEvaluationDialog
                  open={evaluationDialogOpen}
                  onClose={() => setEvaluationDialogOpen(false)}
                  userLogin={user?.LOGIN}
                />
                <Popover
                  id={id}
                  open={openNot}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}

                >
                  <List>
                    {renderNotificationHeader()}
                    {sortedNotifications.map((notification, index) => (
                      <ListItem button key={index} onClick={() => handleNotificationClick(notification)}>
                        <ListItemIcon>
                          {['cmdpartenaire', 'cmdfdm', 'cmdcspd', 'cmdinvestisseur'].includes(notification.TYPE) ? (
                            <Avatar src={cmdIcon} alt="Command Icon" />
                          ) : (
                            <Avatar src={personIcon} alt="pers Icon" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                              {notification.MESSAGE}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                    {sortedNotificationsMvt.map((notification, index) => {
                      const isRead = notification.IS_READ === 1;

                      return (
                        <ListItem
                          key={index}
                          button={!isRead} // ✅ disable click highlight if already read
                          onClick={
                            !isRead
                              ? () => handleNotificationMvtClick(notification)
                              : undefined
                          }
                          sx={{
                            opacity: isRead ? 0.6 : 1,
                            backgroundColor: isRead
                              ? "grey.100"
                              : "transparent",
                            cursor: isRead ? "default" : "pointer",
                            "&:hover": {
                              backgroundColor: isRead
                                ? "grey.100"
                                : "rgba(0, 0, 0, 0.04)",
                            },
                            borderRadius: 1,
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          <ListItemIcon>
                            {[
                              "cmdpartenaire",
                              "cmdfdm",
                              "cmdcspd",
                              "cmdinvestisseur",
                            ].includes(notification.TYPE) ? (
                              <Avatar src={cmdIcon} alt="Command Icon" />
                            ) : (
                              <Avatar src={personIcon} alt="Person Icon" />
                            )}
                          </ListItemIcon>

                          <ListItemText
                            primary={
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: isRead ? "normal" : "bold",
                                  color: isRead
                                    ? "text.secondary"
                                    : "text.primary",
                                }}
                              >
                                {notification.MESSAGE}
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Popover>
              </div>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open} style={{ backgroundColor: '#F5F7F8' }} >

        <DrawerHeader style={{ backgroundColor: '#F5F7F8' }}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List style={{ backgroundColor: '#F5F7F8' }}>

          {!isLoading && accessRights.ACCESS_CONTACT === 1 && (<>
            <Tooltip title="Commercial" placement="right">
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleCategoryClick('Commercial')}>
                  <ListItemIcon>
                    <ContactsIcon style={{ color: '#4379F2' }} />
                  </ListItemIcon>
                  <ListItemText primary="Département Commercial" />
                  {openCategory === 'Commercial' ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
            </Tooltip>


            <Collapse in={openCategory === 'Commercial'} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {!isLoading && accessRights.ACCESS_PARTENAIRE === 1 && (<>

                  <Tooltip title="Partenaires" placement="right" >
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleTabClick(1)}>
                        <ListItemIcon>
                          <Diversity3Icon />
                        </ListItemIcon>
                        <ListItemText primary="Partenaires" sx={boldTextStyle} />
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                </>)}
                <Tooltip title="Ordres administratif" placement="right">
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleTabClick(18)}>
                      <ListItemIcon>
                        < PersonSearchIcon />
                      </ListItemIcon>
                      <ListItemText primary="Ordres administratif" sx={boldTextStyle} />
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
                {!isLoading && accessRights.ACCESS_INVESTISSEUR === 1 && (<>

                  <Tooltip title="Investisseurs" placement="right">
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleTabClick(2)}>
                        <ListItemIcon>
                          <AssuredWorkloadRoundedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Investisseurs" sx={boldTextStyle} />
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                </>)}
                {!isLoading && accessRights.ACCESS_CLIENT_CSPD === 1 && (<>

                  <Tooltip title="ClientS CSPD" placement="right" >
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleTabClick(3)}>
                        <ListItemIcon>
                          <GroupsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Clients CSPD" sx={boldTextStyle} />
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                </>)}

                {!isLoading && accessRights.ACCESS_CLIENT_FDM === 1 && (<>

                  <Tooltip title="Clients FDM" placement="right" >
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleTabClick(4)}>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary="Clients FDM" sx={boldTextStyle} />
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                </>)}
                {!isLoading && accessRights.ACCESS_FAMILLE === 1 && (<>

                  <Tooltip title="Famille" placement="right" >
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleTabClick(5)}>
                        <ListItemIcon>
                          <FamilyRestroomIcon />
                        </ListItemIcon>
                        <ListItemText primary="Famille" sx={boldTextStyle} />
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                </>)}
                {!isLoading && accessRights.ACCESS_HISTORIQUE_APPEL === 1 && (<>

                  <Tooltip title="Journal des appels" placement="right" >
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleTabClick(6)}>
                        <ListItemIcon>
                          <RestoreIcon />
                        </ListItemIcon>
                        <ListItemText primary="Journal des appels" sx={boldTextStyle} />
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                </>
                )}
                {!isLoading && accessRights.ACCESS_ACHATS === 1 && (<>

                  <Tooltip title="Demande d'achat" placement="right">
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleTabClick(7)}>
                        <ListItemIcon>
                          <ProductionQuantityLimitsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Demande d'achat" sx={boldTextStyle} />
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                </>)}

                <Tooltip title="Sav" placement="right">
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleTabClick(8)}>
                      <ListItemIcon>
                        <SettingsApplicationsIcon />
                      </ListItemIcon>
                      <ListItemText primary="Sav" sx={boldTextStyle} />
                    </ListItemButton>
                  </ListItem>
                </Tooltip>

                <Tooltip title="Renseignement client" placement="right" >
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleTabClick(10)}>
                      <ListItemIcon>
                        <PersonSearchIcon />
                      </ListItemIcon>
                      <ListItemText primary="Renseignements commerciaux " sx={boldTextStyle} />
                    </ListItemButton>
                  </ListItem>
                </Tooltip>

                <Tooltip title="Demandes et Réclamations" placement="right" >
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleTabClick(9)}>
                      <ListItemIcon>
                        <ApartmentIcon />
                      </ListItemIcon>
                      <ListItemText primary="Demandes et Réclamations " sx={boldTextStyle} />
                    </ListItemButton>
                  </ListItem>
                </Tooltip>

                <Tooltip title="Ordre Administration" placement="right">
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleTabClick(11)}>
                      <ListItemIcon>
                        <SettingsApplicationsIcon />
                      </ListItemIcon>
                      <ListItemText primary="Administration" sx={boldTextStyle} />
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
                <Tooltip title="SAV Réclamation Client (APP)" placement="right" >
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleTabClick(12)}>
                      <ListItemIcon>
                        <ShopTwoIcon />
                      </ListItemIcon>
                      <ListItemText primary="SAV Réclamation Client (APP) " sx={boldTextStyle} />
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
                <Tooltip
                  title="SOS Clients "
                  placement="right"
                >
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleTabClick(15)}>
                      <ListItemIcon>
                        <SosIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="SOS Clients "
                        sx={boldTextStyle}
                      />
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
                <Tooltip title="Mon journal d'appel" placement="right" >
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleTabClick(13)}>
                      <ListItemIcon>
                        <PhonePausedIcon />
                      </ListItemIcon>
                      <ListItemText primary="Mon journal d'appel" sx={boldTextStyle} />
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
                <Tooltip title="Visite Clients " placement="right" >
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleTabClick(14)}>
                      <ListItemIcon>
                        <ApartmentIcon />
                      </ListItemIcon>
                      <ListItemText primary="Visite Clients " sx={boldTextStyle} />
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
                <Tooltip title="Mes Alerts" placement="right" >
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleTabClick(20)}>
                      <ListItemIcon>
                        <TimelapseIcon />
                      </ListItemIcon>
                      <ListItemText primary="Mes Alerts" sx={boldTextStyle} />
                    </ListItemButton>
                  </ListItem>
                </Tooltip>


              </List>
            </Collapse>
          </>
          )}
          {!isLoading && accessRights.ACCESS_ALL_DOC === 1 && (
            <>
              <Tooltip title="Documents" placement="right">
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() =>
                      handleCategoryClick("Documents")
                    }
                  >
                    <ListItemIcon>
                      <InsertDriveFileIcon style={{ color: "#4379F2" }}></InsertDriveFileIcon>
                    </ListItemIcon>
                    <ListItemText primary="Documents" />
                    {openCategory === "Documents" ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
              <Collapse
                in={openCategory === "Documents"}
                timeout="auto"
                unmountOnExit
              >

                <List component="div" disablePadding>
                  {departments.map((dept, index) => (
                    <Tooltip
                      title={`Département ${dept.NOM}`}
                      placement="right"
                      key={dept.ID}
                    >
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => handleTabClick(index, dept)}>
                          <ListItemIcon>
                            <ViewStreamIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={`Département ${dept.NOM}`}
                            sx={boldTextStyle}
                          />
                        </ListItemButton>
                      </ListItem>
                    </Tooltip>
                  ))}
                </List>
              </Collapse>
            </>
          )}

        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          bgcolor: '#F5F5F5',
          p: 1,
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <DrawerHeader />


        {selectedTab === 1 && openCategory === 'Commercial' && <TabsPartenaires searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 2 && openCategory === 'Commercial' && <TabsInvestisseurs searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 3 && openCategory === 'Commercial' && <TabsCspd searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 4 && openCategory === 'Commercial' && <TabsClientFdm searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 5 && openCategory === 'Commercial' && <Tabsfamily searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 6 && openCategory === 'Commercial' && <CallsJournal searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 7 && openCategory === 'Commercial' && <DemAchat searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 9 && openCategory === 'Commercial' && <EmployeeRequestsTabs searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 8 && openCategory === 'Commercial' && <SavManagement searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 10 && openCategory === 'Commercial' && <RenseignementCommercial searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 11 && openCategory === 'Commercial' && <OrdresAdministration searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 12 && openCategory === 'Commercial' && <ReclamationsList searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 13 && openCategory === 'Commercial' && <JournalCommercial searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 14 && openCategory === 'Commercial' && <Visits searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 15 && openCategory === 'Commercial' && <SOSList searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 18 && openCategory === 'Commercial' && <OrdresAdministration searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedOption={selectedOption} setSelectedOption={setSelectedOption} value={value} setValue={setValue} />}
        {selectedTab === 20 && openCategory === 'Commercial' && <AlertePage />}
        {selectedTab === 21 && openCategory === 'Commercial' && <ArticlesNoMovementPage />}
        {selectedTab === 22 && openCategory === 'Commercial' && <MouvementsByDate />}

        {openCategory === "Documents" && (
          <>
            {selectedTab != -1 && (
              //  <Document 
              //  Departement={selectedDepartment} 
              //  userRole={userRole}/>
              <FolderDocument
                Departement={selectedDepartment}
                userRole={userRole}
                currentUser={user}
                Departements={alldepartments}


              />
            )}

          </>
        )}
        <Dialog open={alertsDialogOpen} onClose={handleCloseAlertsDialog} maxWidth="sm" fullWidth >
  <DialogTitle> Mes alertes d'aujourd'hui </DialogTitle>
  <DialogContent dividers>
    {alerts.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        Aucune alerte pour aujourd'hui.
      </Typography>
    ) : (
      alerts.map((alert) => (
        <Box
          key={alert.ID_ALERT}
          sx={{
            border: '1px solid #ddd',
            borderRadius: 1.5,
            p: 1.5,
            mb: 1.5,
            cursor: 'pointer',
            position: 'relative',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
          onClick={() => {
  const isCurrentlyExpanded = expandedAlertId === alert.ID_ALERT;
  
  // Comportement existant : toggle expansion
  setExpandedAlertId(isCurrentlyExpanded ? null : alert.ID_ALERT);

  // SI on ouvre (pas quand on ferme) → déclenche le PATCH
  if (!isCurrentlyExpanded && alert.ENVOIYEUR === 'CRM') {
    toggleActif(alert.ID_ALERT);
  }
}}
        >
          {alert.DATE_ALERT === tomorrowString && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: '#ff9800',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              Demain
            </Box>
          )}

          {/* ===== NEW: CRM Badge next to title ===== */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {alert.TITRE}
            </Typography>

            {alert.ENVOIYEUR === 'CRM' && (
              <Box
                sx={{
                  backgroundColor: '#2e7d32', // green
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
                }}
              >
                CRM
              </Box>
            )}
          </Box>

          <Collapse in={expandedAlertId === alert.ID_ALERT}>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Date création : <strong>{alert.DATE_CREATION || ''}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date alerte : <strong>{alert.DATE_ALERT || ''}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                {alert.TEXT_ALERT}
              </Typography>
            </Box>
          </Collapse>
        </Box>
      ))
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseAlertsDialog}>Fermer</Button>
  </DialogActions>
</Dialog>

        <Dialog
          open={openNoMvtDialog}
          onClose={() => setOpenNoMvtDialog(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { height: "80vh" }
          }}
        >
          <DialogTitle>
            Articles sans mouvement (+25 jours)
          </DialogTitle>

          <DialogContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
  <TableContainer component={Paper} sx={{ flex: 1, overflow: "auto" }}>
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow>
          <TableCell>Code</TableCell>
          <TableCell>Intitulé</TableCell>
          <TableCell>Dernier mvt</TableCell>
          <TableCell>Jours</TableCell>
          <TableCell>Stock CSPD</TableCell>
          <TableCell>Stock FDM</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {noMvtLoading ? (
          <TableRow>
            <TableCell colSpan={6} align="center">
              Chargement...
            </TableCell>
          </TableRow>
        ) : noMvtRows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} align="center">
              Aucun article trouvé
            </TableCell>
          </TableRow>
        ) : (
          noMvtRows.map((row, idx) => (
            <TableRow key={`${row.CODE_ARTICLE}-${idx}`}>
              <TableCell>{row.CODE_ARTICLE}</TableCell>
              <TableCell>{row.INTIT_ARTICLE}</TableCell>
              <TableCell>{row.LAST_MVT_DATE}</TableCell>
              <TableCell>{row.DAYS_SINCE_LAST_MOVEMENT}</TableCell>
              <TableCell>{row.STOCK_CSPD}</TableCell>
              <TableCell>{row.STOCK_FDM}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>

  <Box sx={{ borderTop: "1px solid #eee" }}>
    <TablePagination
      rowsPerPageOptions={[15, 30, 50, 100]}
      component="div"
      count={noMvtTotal}
      rowsPerPage={noMvtPageSize}
      page={noMvtPage}
      onPageChange={(e, newPage) => setNoMvtPage(newPage)}
      onRowsPerPageChange={(e) => {
        setNoMvtPageSize(parseInt(e.target.value, 10));
        setNoMvtPage(0);
      }}
    />
  </Box>
</DialogContent>


          <DialogActions>
            <Button onClick={() => setOpenNoMvtDialog(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>


      </Box>
      <ToastContainer position="bottom-center" />

    </Box>

  );
};

