import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Typography, TextField, Button, Select, MenuItem, Box,
  InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import logoLogin from '../images/login.png';
import backgroundImage1 from '../images/bnt-1.png';
import logoCrm from '../images/logo crrm.png';
import '../Login.css';
import { AccountCircle, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { setUser } from '../Magasin/store';
import BASE_URL from '../Utilis/constantes';

// 🎯 FLAG DE DÉBLOCAGE - Mettre à true pour désactiver le blocage
const FORCE_UNLOCK = false; // false = blocage actif, true = pas de blocage

// Ou avec variable d'environnement (plus propre)
// const FORCE_UNLOCK = process.env.REACT_APP_FORCE_UNLOCK === "true";

// Constantes pour les trimestres
const getTrimestreActuel = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (month === 3 && day >= 20 && day <= 24) return { id: "T1", nom: "1er trimestre (Mars)" };
  if (month === 6 && day >= 20 && day <= 24) return { id: "T2", nom: "2ème trimestre (Juin)" };
  if (month === 9 && day >= 20 && day <= 24) return { id: "T3", nom: "3ème trimestre (Septembre)" };
  if (month === 12 && day >= 20 && day <= 24) return { id: "T4", nom: "4ème trimestre (Décembre)" };
  //   if (month === 3 && day >= 1 && day <= 31) return { id: "T1", nom: "1er trimestre (Mars)" };
  // if (month === 6 && day >= 20 && day <= 24) return { id: "T2", nom: "2ème trimestre (Juin)" };
  // if (month === 9 && day >= 20 && day <= 24) return { id: "T3", nom: "3ème trimestre (Septembre)" };
  // if (month === 12 && day >= 20 && day <= 24) return { id: "T4", nom: "4ème trimestre (Décembre)" };
  // return null;
};

// Vérifier si on est après le 25
const isAfterDeadline = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return (month === 3 && day > 24) ||
    (month === 6 && day > 24) ||
    (month === 9 && day > 24) ||
    (month === 12 && day > 24);
};

// Liste des sociétés
const SOCIETES_LIST = [
  { id: "cspd", nom: "CSPD" },
  { id: "fdm", nom: "FDM" },
  { id: "seps", nom: "SEPS" },
  { id: "silver_trafico", nom: "Silver Trafico" },
  { id: "hanem_pro", nom: "Hanem Pro" },
];

const Login = () => {
  const [language, setLanguage] = useState('fr');
  const [LOGIN, setLogin] = useState('');
  const [MOT_DE_PASSE, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSocietes, setAlertSocietes] = useState([]);
  const [alertPeriode, setAlertPeriode] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Afficher l'état du flag dans la console au démarrage
  React.useEffect(() => {
    console.log('🔓 FORCE_UNLOCK =', FORCE_UNLOCK);
    if (FORCE_UNLOCK) {
      console.log('⚠️ Mode déblocage activé - Tous les utilisateurs peuvent se connecter');
    }
  }, []);

  // Fonction pour poster une alerte dans le CRM
  // Fonction pour poster une alerte dans le CRM - UNIQUEMENT pour la COMPTABILITÉ
  const postAlerteCRM = async (titre, message, societesManquantes, periode, user) => {
    try {
      const societesList = societesManquantes.join(', ');
      const textAlert = `${message} Sociétés concernées : ${societesList} Période : ${periode}`;

      const today = new Date();

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      const dateAlert = `${year}-${month}-${day}`;

      console.log('📅 DATE_ALERT (limite):', dateAlert); // "2026-03-21"

      if (user?.ID_UTILISATEUR) {
        console.log(`📧 Envoi d'une alerte pour l'utilisateur ${user.UTILISATEUR} (Comptabilité)`);

        const payload = {
          TITRE: titre,
          TEXT_ALERT: textAlert,
          DATE_ALERT: dateAlert, // ✅ 21/03/26 (pas aujourd'hui !)
          USER_ID: user.ID_UTILISATEUR,
          ENVOIYEUR: "CRM"

        };

        console.log("📝 Payload envoyé:", payload);

        const response = await axios.post(`${BASE_URL}/api/alerts`, payload);
        console.log('✅ Réponse du serveur:', response.data);
      }

    } catch (error) {
      console.error('❌ Erreur lors du post de l\'alerte CRM:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
      }
    }
  };

  // Fonction pour vérifier les fichiers manquants
  const checkMissingFiles = async (user) => {
    try {
      const today = new Date();
      // Pour les tests
      // const today = new Date(2026, 2, 26); // 26 mars 2026 pour test blocage

      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();
      const currentYear = today.getFullYear();

      // Vérifier si c'est un administrateur
      const isComp = user.ROLE.trim() === 'Comptabilité'

      // 1. BLOCAGE - Après le 25 (sauf admin) MAIS avec le flag FORCE_UNLOCK
      if (isAfterDeadline(today) && !FORCE_UNLOCK) {
        if (isComp) {
          setLockMessage(`⛔ Accès bloqué : La période de soumission des rapports trimestriels est terminée (après le 25).\n\nVeuillez contacter l'administrateur.`);
          setLockDialogOpen(true);
          return false;
        }
        return true; // Admin peut passer
      }

      // 2. ALERTES - Période 20-24 pour la comptabilité
      const trimestreInfo = getTrimestreActuel(today);

      if (isComp) {
        const societesManquantes = [];

        for (const societe of SOCIETES_LIST) {
          try {
            const response = await axios.get(`${BASE_URL}/api/rapport/pdfget`, {
              params: {
                company: societe.id,
                year: currentYear.toString(),
                trimester: trimestreInfo.id
              }
            });

            if (!response.data || response.data.length === 0) {
              societesManquantes.push(societe.nom);
            }
          } catch (err) {
            console.error(`Erreur vérification ${societe.nom}:`, err);
            societesManquantes.push(societe.nom);
          }
        }

        if (societesManquantes.length > 0) {
          await postAlerteCRM(
            " RAPPORTS TRIMESTRIELS MANQUANTS",
            `Des rapports trimestriels sont manquants pour la période ${trimestreInfo.nom}.`,
            societesManquantes,
            trimestreInfo.nom,
            user
          );

          setAlertSocietes(societesManquantes);
          setAlertPeriode(trimestreInfo.nom);
          setAlertMessage(`⚠️ Rapports trimestriels manquants pour ${trimestreInfo.nom} :\n${societesManquantes.join(', ')}\n\nDes alertes ont été envoyées aux administrateurs.`);
          setAlertDialogOpen(true);

          return true; // Permet la connexion
        }
      }

      return true;
    } catch (error) {
      console.error("Erreur vérification fichiers:", error);
      return true;
    }
  };

  const handlePasswordReset = () => {
    alert('Réinitialisation du mot de passe en cours...');
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const handleCloseLockDialog = () => {
    setLockDialogOpen(false);
    handleLogout();
  };

  const handleCloseAlertDialog = () => {
    setAlertDialogOpen(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/authenticate`,
        { LOGIN, MOT_DE_PASSE },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.message === 'Authentification réussie') {
        const user = response.data.user;

        if (user.DEPARTEMENT !== 'Commercial') {
          setError("Access denied. Only Commercial department users can log in.");
          alert("Access denied. Only Commercial department users can log in.");
          setIsLoggingIn(false);
          return;
        }

        // ✅ ÉTAPE 1 : POINTAGE - À faire AVANT le blocage
        const userId = user.ID_UTILISATEUR;
        const userName = user.UTILISATEUR;

        const nowUtc = new Date();
        const tunisiaTime = new Date(nowUtc.getTime() + 60 * 60 * 1000);
        const today = tunisiaTime.toISOString().slice(0, 10);
        const fullDateTime = tunisiaTime.toISOString();

        try {
          const logCheck = await axios.get(`${BASE_URL}/api/log-historique`, {
            params: { id_user: userId, date_login: today }
          });

          if (user.POINTAGE === 1 && logCheck.data.data.length === 0) {
            let dispoValue = "";

            try {
              const rhResponse = await axios.get(`${BASE_URL}/api/check-departement-demand`, {
                params: { date: fullDateTime, id: userId }
              });

              if (rhResponse.data.exists && ["Mission", "Congé", "Autorisation"].includes(rhResponse.data.demand_type)) {
                dispoValue = rhResponse.data.demand_type;
              }
            } catch (rhErr) {
              console.warn("API RH indisponible (ignorée)", rhErr);
            }

            await axios.post(`${BASE_URL}/api/log-historique`, {
              ID_USER: userId,
              USER_NAME: userName,
              DATE_LOGIN: fullDateTime,
              ETAT: "Validé",
              DISPO: dispoValue
            }).catch(err => console.warn("Log échoué (ignoré)", err));

            console.log("✅ Pointage enregistré pour l'utilisateur:", userName);
          }
        } catch (logError) {
          console.error("❌ Erreur lors du pointage:", logError);
          // On continue même si le pointage échoue
        }

        // ✅ ÉTAPE 2 : VÉRIFICATION DU BLOCAGE - À faire APRÈS le pointage
        const canProceed = await checkMissingFiles(user);

        if (!canProceed) {
          setIsLoggingIn(false);
          return; // L'utilisateur est bloqué mais son pointage est déjà enregistré
        }

        // ✅ ÉTAPE 3 : CONNEXION - Si pas bloqué
        dispatch(setUser(user));
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/appBar');

      } else {
        alert("Nom d'utilisateur ou mot de passe incorrect");
      }
    } catch (error) {
      console.error('Erreur login:', error);
      alert('Erreur interne du serveur');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="background">
      {/* Dialog pour les messages de BLOCAGE */}
      <Dialog
        open={lockDialogOpen}
        onClose={handleCloseLockDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backgroundColor: '#ffebee'
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: '#d32f2f',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          fontWeight: 'bold'
        }}>
          ⛔ Accès Bloqué
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: '1.1rem' }}>
            {lockMessage}
          </Typography>

          {/* Afficher une note si le flag est activé (pour debug) */}
          {FORCE_UNLOCK && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              🔧 Mode déblocage activé (FORCE_UNLOCK=true)
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            onClick={handleCloseLockDialog}
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              backgroundColor: '#d32f2f',
              '&:hover': { backgroundColor: '#b71c1c' },
              minWidth: '200px',
              py: 1.5
            }}
          >
            OK - Déconnexion
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour les ALERTES */}
      <Dialog
        open={alertDialogOpen}
        onClose={handleCloseAlertDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backgroundColor: '#fff3e0'
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: '#ff9800',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          fontWeight: 'bold'
        }}>
          ⚠️ Alertes Rapports Manquants
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: '1.1rem', mb: 2 }}>
            {alertMessage}
          </Typography>

          {alertSocietes.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Sociétés concernées :
              </Typography>
              {alertSocietes.map((societe, index) => (
                <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                  • {societe}
                </Typography>
              ))}
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Des alertes ont été envoyées aux administrateurs.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            onClick={handleCloseAlertDialog}
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              backgroundColor: '#ff9800',
              '&:hover': { backgroundColor: '#f57c00' },
              minWidth: '200px',
              py: 1.5
            }}
          >
            Continuer vers l'application
          </Button>
        </DialogActions>
      </Dialog>

      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} className="left-content">
            <Typography variant="h5" className="description">
              La Solution Intégrée
            </Typography>
            <Typography variant="body1" className="additional-text">
              Optimisez la gestion de votre Entreprise avec une<br />
              solution révolutionnaire et exceptionnelle !
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className="login-panel">
              <form onSubmit={handleLogin} style={{ width: '100%' }}>
                <img src={logoCrm} alt="Logo" className="logo1" />
                
                <div className="form-group1">
                  <TextField
                    label="Login"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={LOGIN}
                    onChange={(e) => setLogin(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <div className="form-group2">
                  <TextField
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={MOT_DE_PASSE}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility} tabIndex={-1} style={{ minWidth: 'unset', color: '#2e3956' }}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <Typography variant="body1" className="additional-text2" onClick={handlePasswordReset}>
                  Mot de passe oublié ?
                </Typography>
                {error && (
                  <Typography variant="body2" color="error" style={{ marginBottom: "1rem" }}>
                    {error}
                  </Typography>
                )}
                <Grid container className="boutons">
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      className='connect'
                      fullWidth
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? 'Connexion en cours...' : 'SE CONNECTER'}
                    </Button>
                  </Grid>
                </Grid>
                <Box className="copy">
                  <Typography variant="body2">
                    © {new Date().getFullYear()} CSPD DAMAK. Tous droits réservés.
                  </Typography>
                </Box>
              </form>
            </div>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Login;