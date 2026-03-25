import React, { useState, useEffect, useRef } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Paper,
    Rating, Button, Typography, TableContainer, TextField, Box
} from '@mui/material';
import axios from 'axios';
import BASE_URL from '../Utilis/constantes';
import UserEvaluationDialog from './UserEvaluationDialog';

// Critères d'évaluation
const evaluationCriteria = [
    { id: 'punctuality', label: 'Ponctualité et Présence', value: '0,500 dt / étoile', description: 'Respect des horaires et délais' },
    { id: 'creativity', label: 'Créativité et exposé', value: '3 dt / étoile', description: 'Capacité d\'innovation' },
    { id: 'behavior', label: 'Comportement et Discipline', value: '3 dt / étoile', description: 'Attitude professionnelle' },
    { id: 'elegance', label: 'Élégance', value: '3 dt / étoile', description: 'Présentation et tenue professionnelle' },
    { id: 'productivity', label: 'Productivité', value: '3 dt / étoile', description: 'Efficacité et rendement' },
    { id: 'discipline', label: 'Objectifs ', value: '5 dt / étoile', description: 'Respect des règles et procédures' },
    { id: 'new_discipline', label: 'Défis', value: '100 dt / étoile', description: 'Défis' },
];

// Valeur par étoile pour chaque critère
const calculateMoney = (rating, criteriaId) => {
    const starValues = {
        punctuality: 0.5,
        creativity: 3,
        behavior: 3,
        elegance: 3,
        discipline: 5,
        productivity: 3,
        new_discipline: 100,
    };
    return rating * (starValues[criteriaId] || 0);
};

export default function UserEvaluation() {
    // États pour le dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const printRef = useRef(null); // Ajout pour la fonction print

    // États pour les données
    const [users, setUsers] = useState([]);
    const [evaluations, setEvaluations] = useState({});
    const [credit, setCredit] = useState({});
    const [orders, setOrders] = useState([]);
    const [containerCount, setContainerCount] = useState(0);
    const BASE = 'CSPD24';

    // États pour validés
    const [savedEvaluations, setSavedEvaluations] = useState({});
    const [validatedEvaluations, setValidatedEvaluations] = useState({});

    // ===========================
    // Fonctions pour dialog
    // ===========================
    const handleOpenDialog = (user) => {
        setSelectedUser(user);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
    };

    // ===========================
    // Fonctions fetch
    // ===========================
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/users`);
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchOrders = async (base) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/currentMonthCommands/${base}`);
            setOrders(response.data.commandes || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        }
    };

    const fetchSupplierOrders = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/cmdFournisseurCurrentMonth`);
            const orders = response.data.commandes || [];
            const totalContainers = orders.reduce((total, order) => {
                const firstNumber = parseInt(order.CF_CHAMP_3.split('X')[0]);
                return total + (isNaN(firstNumber) ? 0 : firstNumber);
            }, 0);
            setContainerCount(totalContainers);
        } catch (error) {
            console.error('Error fetching supplier orders:', error);
            setContainerCount(0);
        }
    };

    const fetchSavedEvaluations = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/evaluations`);

            const evaluationsMap = response.data.reduce((acc, evalData) => {
                const userId = evalData.USER_ID;
                if (!acc[userId]) acc[userId] = [];
                acc[userId].push({
                    punctuality: evalData.PUNCTUALITY || 5,
                    creativity: evalData.CREATIVITY,
                    behavior: evalData.BEHAVIOR,
                    elegance: evalData.ELEGANCE,
                    discipline: evalData.DISCIPLINE,
                    new_discipline: evalData.NEW_DISCIPLINE,
                    productivity: evalData.PRODUCTIVITY,
                    credit: evalData.CREDIT ?? 0,
                    containerCount: evalData.CONTAINER_COUNT || 0,
                    voyageCount: evalData.VOYAGE_COUNT || 0,
                    totalReward: evalData.TOTAL_REWARD || 0,
                    state: evalData.STATE,
                    evaluationDate: new Date(evalData.EVALUATION_DATE),
                });
                acc[userId].sort((a, b) => b.evaluationDate - a.evaluationDate);
                return acc;
            }, {});

            const latestEvaluations = Object.keys(evaluationsMap).reduce((acc, userId) => {
                acc[userId] = evaluationsMap[userId][0];
                return acc;
            }, {});
            setSavedEvaluations(evaluationsMap);
            setEvaluations(latestEvaluations);

            // Init crédits
            const newCredit = {};
            Object.keys(latestEvaluations).forEach(userId => {
                newCredit[userId] = latestEvaluations[userId]?.credit || 0;
            });
            setCredit(newCredit);

        } catch (error) {
            console.error('Error fetching saved evaluations:', error);
        }
    };

    // ===========================
    // useEffect pour fetch initial
    // ===========================
    useEffect(() => {
        fetchUsers();
        fetchSavedEvaluations();
        fetchSupplierOrders();
        fetchOrders(BASE);
    }, []);

    // ===========================
    // Calculs
    // ===========================
    const getOrderCount = (userLogin) => {
        return orders.filter(order =>
            order.ETAT_CDE_C === "LT" &&
            order.CC_CHAMP_7 === userLogin
        ).length;
    };

    const calculateTotalReward = (userId, userLogin, department) => {
        const userEvaluations = evaluations[userId] || {};
        let totalReward = 0;
        for (const [key, rating] of Object.entries(userEvaluations)) {
            if (evaluationCriteria.some(criteria => criteria.id === key)) {
                totalReward += calculateMoney(rating, key);
            }
        }

        if (department === 'Magasin') totalReward += (containerCount || 0) * 10;

        const orderCount = getOrderCount(userLogin);
        totalReward += orderCount * 0.5;

        totalReward += (userEvaluations.voyageCount || 0) * 10;

        return totalReward;
    };

    const calculateFinalReward = (userId) => {
        const totalReward = calculateTotalReward(
            userId,
            users.find(u => u.ID_UTILISATEUR === userId)?.LOGIN,
            users.find(u => u.ID_UTILISATEUR === userId)?.DEPARTEMENT
        );
        const userCredit = credit[userId] || 0;
        return totalReward - userCredit;
    };

    const calculateAverageRating = (userId) => {
        const ratings = Object.values(evaluations[userId] || {}).filter(value => typeof value === 'number');
        if (ratings.length === 0) return 0;
        return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    };

    // ===========================
    // Modifications
    // ===========================
    const handleInputChange = (userId, field, value) => {
        setEvaluations(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value,
            },
        }));
    };

    const handleCreditChange = (userId, value) => {
        const parsedValue = parseFloat(value);
        setCredit(prev => ({
            ...prev,
            [userId]: isNaN(parsedValue) ? 0 : parsedValue,
        }));
    };

    const handleSubmitEvaluation = async (userId, action) => {
        try {
            const user = users.find(u => u.ID_UTILISATEUR === userId);
            const evaluationData = evaluations[userId] || {};
            const totalSavings = calculateTotalReward(userId, user.LOGIN, user.DEPARTEMENT);

            const existingEvaluations = await axios.get(`${BASE_URL}/api/evaluations`, {
                params: { userId, userLogin: user.LOGIN }
            });

            const payload = {
                userId,
                averageRating: calculateAverageRating(userId),
                containerCount: user.DEPARTEMENT === 'Magasin' ? containerCount : 0,
                voyageCount: evaluationData.voyageCount || 0,
                totalSavings,
                creativity: evaluationData.creativity || 0,
                new_discipline: evaluationData.new_discipline || 0,
                behavior: evaluationData.behavior || 0,
                elegance: evaluationData.elegance || 0,
                discipline: evaluationData.discipline || 0,
                productivity: evaluationData.productivity || 0,
                punctuality: evaluationData.punctuality || 0,
                credit: credit[userId] || 0,
                state: action === 'validate' ? 'VALIDATED' : 'SAVED'
            };

            const userEvaluations = existingEvaluations.data
                .filter(evaluation => evaluation.USER_ID === userId)
                .sort((a, b) => new Date(b.EVALUATION_DATE) - new Date(a.EVALUATION_DATE));

            const response = userEvaluations.length > 0
                ? await axios.put(`${BASE_URL}/api/evaluations/${userEvaluations[0].ID}`, payload)
                : await axios.post(`${BASE_URL}/api/evaluations`, payload);

            if (response.data.success) {
                fetchSavedEvaluations();
            }
        } catch (error) {
            console.error('Error submitting evaluation:', error);
        }
    };

    // ===========================
    // Réinitialiser toutes les évaluations
    // ===========================
    const handleDeleteAll = async () => {
        if (!window.confirm("⚠️ Réinitialiser toutes les évaluations ? Les crédits seront ajustés si nécessaire.")) return;
        try {
            const response = await axios.get(`${BASE_URL}/api/evaluations`);
            const evaluations = response.data;
            const updatedCredits = { ...credit };

            for (const user of users) {
                const userId = user.ID_UTILISATEUR;
                const totalReward = calculateTotalReward(userId, user.LOGIN, user.DEPARTEMENT);
                const userCredit = credit[userId] || 0;
                const finalReward = totalReward - userCredit;

                const evalToUpdate = evaluations
                    .filter(ev => ev.USER_ID === userId)
                    .sort((a, b) => new Date(b.EVALUATION_DATE) - new Date(a.EVALUATION_DATE))[0];
                if (!evalToUpdate) continue;

                if (finalReward < 0) {
                    const newCredit = Math.abs(finalReward);
                    updatedCredits[userId] = newCredit;
                    await axios.put(`${BASE_URL}/api/evaluations/${evalToUpdate.ID}`, {
                        ...evalToUpdate,
                        CREDIT: newCredit,
                        FINAL_REWARD: 0,
                        PONCTUALITY: 0,
                        punctuality: 0,
                        STATE: "SAVED"
                    });
                } else {
                    await axios.delete(`${BASE_URL}/api/evaluations/${evalToUpdate.ID}`);
                }
            }

            setCredit(updatedCredits);
            setEvaluations({});
            setSavedEvaluations({});
            setValidatedEvaluations({});
            alert("✅ Réinitialisation terminée avec succès !");
        } catch (error) {
            console.error("❌ Erreur lors de la réinitialisation :", error);
            alert("Erreur pendant la réinitialisation.");
        }
    };

 const handlePrintEvaluation = (user) => {
    const userEval = evaluations[user.ID_UTILISATEUR] || {};
    const userCredit = credit[user.ID_UTILISATEUR] || 0;
    const totalReward = calculateTotalReward(user.ID_UTILISATEUR, user.LOGIN, user.DEPARTEMENT);
    const finalReward = calculateFinalReward(user.ID_UTILISATEUR);

    const printContent = `
        <div style="padding:20px; font-family:Arial,sans-serif;">
            <h2 style="text-align:center;">Évaluation de l'Employé</h2>
            <hr/>
            <p><strong>Employé:</strong> ${user.UTILISATEUR}</p>
            <p><strong>Date d'évaluation:</strong> ${new Date().toLocaleString()}</p>

            ${evaluationCriteria.map(c => `
                <div style="margin:10px 0; padding:10px; border:1px solid #eee; border-radius:4px;">
                    <p><strong>${c.label}:</strong> ${userEval[c.id] || 0} étoiles</p>
                </div>
            `).join('')}

            <div style="margin-top:20px; padding:15px; background-color:#f5f5f5; border-radius:4px;">
                <p style="text-align:center; font-size:16px;"><strong>Récompense Totale:</strong> ${totalReward.toFixed(2)} DT</p>
                <p style="text-align:center; font-size:16px;"><strong>Crédit:</strong> ${userCredit.toFixed(2)} DT</p>
                <p style="text-align:center; font-size:18px; font-weight:bold; color:${finalReward >=0 ? 'green' : 'red'};">
                    Récompense Finale: ${finalReward.toFixed(2)} DT
                </p>
            </div>

           
            <div style="margin-top:20px; display:flex; justify-content:space-between;">
                
                <div style="text-align:center;">
                    <p>Signature direction: _________________</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                </div>
                <div style="text-align:center;">
                    <p>Signature employé: _________________</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
};



    // ===========================
    // Render
    // ===========================
    return (
        <>
            <TableContainer component={Paper} sx={{ margin: 2 }}>
                <Typography variant="h5" sx={{ p: 2, fontWeight: 'bold' }}>
                    Évaluation des Employés
                </Typography>
                <Button variant="contained" color="error" onClick={handleDeleteAll}>
                    Renitialiser toutes les évaluations
                </Button>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employé</TableCell>
                            <TableCell align="center">Récompense</TableCell>
                            <TableCell align="center">Crédit</TableCell>
                            <TableCell align="center">Récompense Finale</TableCell>
                            <TableCell align="center">Commandes</TableCell>
                            <TableCell align="center">Contenaires</TableCell>
                            {evaluationCriteria.map(({ label, id }) => (
                                <TableCell key={id} align="center">
                                    <Typography variant="body1">{label}</Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                                        {evaluationCriteria.find(criteria => criteria.id === id).value}
                                    </Typography>
                                </TableCell>
                            ))}
                            <TableCell align="center">Déplacement</TableCell>
                            <TableCell align="center">Moyenne</TableCell>
                            <TableCell align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.ID_UTILISATEUR}>
                                <TableCell>{user.UTILISATEUR}</TableCell>
                                <TableCell align="center">
                                    {calculateTotalReward(user.ID_UTILISATEUR, user.LOGIN, user.DEPARTEMENT).toFixed(2)} DT
                                </TableCell>
                                <TableCell align="center">
                                    <TextField
                                        type="number"
                                        inputProps={{ step: "0.1" }}
                                        value={credit[user.ID_UTILISATEUR] || 0}
                                        onChange={e => handleCreditChange(user.ID_UTILISATEUR, e.target.value)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell
                                    align="center"
                                    sx={{
                                        color: calculateFinalReward(user.ID_UTILISATEUR) >= 0 ? 'green' : 'red',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {calculateFinalReward(user.ID_UTILISATEUR).toFixed(2)} DT
                                </TableCell>
                                <TableCell align="center">{getOrderCount(user.LOGIN)}</TableCell>
                                <TableCell align="center">{user.DEPARTEMENT === 'Magasin' ? containerCount || 0 : 'N/A'}</TableCell>

                                {evaluationCriteria.map(({ id }) => (
                                    <TableCell key={id} align="center">
                                        <Rating
                                            value={evaluations[user.ID_UTILISATEUR]?.[id] || 0}
                                            onChange={(e, value) => handleInputChange(user.ID_UTILISATEUR, id, value)}
                                            precision={0.5}
                                        />
                                    </TableCell>
                                ))}

                                <TableCell align="center">
                                    <TextField
                                        type="number"
                                        value={evaluations[user.ID_UTILISATEUR]?.voyageCount || 0}
                                        onChange={e => handleInputChange(user.ID_UTILISATEUR, 'voyageCount', Number(e.target.value))}
                                    />
                                </TableCell>
                                <TableCell align="center">{calculateAverageRating(user.ID_UTILISATEUR).toFixed(1)}</TableCell>
                                <TableCell align="center">
                                    <Box display="flex" justifyContent="center" gap={2}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleSubmitEvaluation(user.ID_UTILISATEUR, 'save')}
                                        >
                                            Enregistrer
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleSubmitEvaluation(user.ID_UTILISATEUR, 'validate')}
                                        >
                                            Valider
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            onClick={() => handlePrintEvaluation(user)}
                                        >
                                            Imprimer
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </TableContainer>

            {/* Dialog pour l'évaluation */}
            {selectedUser && (
                <UserEvaluationDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    user={selectedUser}
                    onPrintRef={(fn) => (printRef.current = fn)}
                />
            )}
        </>
    );
}
