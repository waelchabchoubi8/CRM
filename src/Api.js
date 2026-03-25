import axios from 'axios';
import BASE_URL from './Utilis/constantes';

const API_URL = 'http://192.168.1.170:3300/api';

export const fetchData = async () => {
    const response = await fetch(`${API_URL}/data`);
    const data = await response.json();
    return data;
};

export const getArticleById = async (articleId, base) => {
    try {
        return (await axios.get(`${API_URL}/articles/${base}/${encodeURIComponent(articleId)}`)).data;
    } catch (error) {
        console.error(error);
        return {};
    }
};

export const fetchClientsPartenaires = async (page, clientId, pageSize, searchTerm, baseUrl = BASE_URL) => {
    try {
        const params = {
            page: page,
            pageSize: pageSize,
            searchTerm: searchTerm,
        };

        const response = await axios.get(`${baseUrl}/api/clientsPartenaires/${encodeURIComponent(clientId)}`, { params });
        console.log('API response data:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return { clients: [], total: 0, error: 'There was an error fetching  clients' };
    }
};