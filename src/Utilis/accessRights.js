import { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../Utilis/constantes';

export const useAccessRights = (userLogin) => {
  const [accessRights, setAccessRights] = useState({});

  useEffect(() => {
    const fetchAccessRights = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users`);
        const userRights = response.data.find(user => user.LOGIN === userLogin);

        if (userRights) {
          setAccessRights({
            ACCESS_RECEPTION: Number(userRights.ACCESS_RECEPTION),
            ACCESS_VEHICULE: Number(userRights.ACCESS_VEHICULE),
            ACCESS_RECEPTIONIST: Number(userRights.ACCESS_RECEPTIONIST),

            ACCESS_CONTACT: Number(userRights.ACCESS_CONTACT),
            ACCESS_PARTENAIRE: Number(userRights.ACCESS_PARTENAIRE),
            ACCESS_INVESTISSEUR: Number(userRights.ACCESS_INVESTISSEUR),
            ACCESS_CLIENT_CSPD: Number(userRights.ACCESS_CLIENT_CSPD),
            ACCESS_CLIENT_FDM: Number(userRights.ACCESS_CLIENT_FDM),
            ACCESS_FAMILLE: Number(userRights.ACCESS_FAMILLE),
            ACCESS_HISTORIQUE_APPEL: Number(userRights.ACCESS_HISTORIQUE_APPEL),
            ACCESS_ACHATS: Number(userRights.ACCESS_ACHATS),
            ACCESS_FINANCE: Number(userRights.ACCESS_FINANCE),
            ACCESS_COMPTABILITE: Number(userRights.ACCESS_COMPTABILITE),
            ACCESS_IMPORT_EXPORT: Number(userRights.ACCESS_IMPORT_EXPORT),
            ACCESS_MAILING: Number(userRights.ACCESS_MAILING),
            ACCESS_ADMINISTRATION: Number(userRights.ACCESS_ADMINISTRATION),
            ACCESS_PARAMETRAGE: Number(userRights.ACCESS_PARAMETRAGE),
            ACCESS_MAGASIN: Number(userRights.ACCESS_MAGASIN),
            ACCESS_RH: Number(userRights.ACCESS_RH),
            ACCESS_CAISSE: Number(userRights.ACCESS_CAISSE),
            ACCESS_FDM: Number(userRights.ACCESS_FDM),
            ACCESS_CSPD: Number(userRights.ACCESS_CSPD),
            ACCESS_PAYMENT_FOURNISSEUR: Number(userRights.ACCESS_PAYMENT_FOURNISSEUR),
            ACCESS_ALL_DOC: 1,
            ACCESS_COMMANDE_PREVISIONNELLE: Number(userRights.ACCESS_COMMANDE_PREVISIONNELLE),
            ACCESS_TEST_TECHNIQUE: Number(userRights.ACCESS_TEST_TECHNIQUE),
            ACCESS_VALID: Number(userRights.ACCESS_VALID),
            ACCESS_COMPTE_RENDU: Number(userRights.ACCESS_COMPTE_RENDU)


          });
        }
      } catch (error) {
        console.log('Error fetching access rights:', error);
      }
    };

    if (userLogin) {
      fetchAccessRights();
    }
  }, [userLogin]);

  return accessRights;
};
