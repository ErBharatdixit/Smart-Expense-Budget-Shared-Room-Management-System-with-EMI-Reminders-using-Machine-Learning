import axios from 'axios';

const API_URL = 'http://localhost:8000/api/market';

const getProducts = async () => {
      const config = {
            headers: {
                  Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`,
            },
      };
      const response = await axios.get(`${API_URL}/products`, config);
      return response.data;
};

const getHistory = async (id) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`,
            },
      };
      const response = await axios.get(`${API_URL}/history/${id}`, config);
      return response.data;
};

const getPrediction = async (id) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`,
            },
      };
      const response = await axios.get(`${API_URL}/predict/${id}`, config);
      return response.data;
};

const seedData = async () => {
      const config = {
            headers: {
                  Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`,
            },
      };
      const response = await axios.post(`${API_URL}/seed`, {}, config);
      return response.data;
};

const syncData = async () => {
      const config = {
            headers: {
                  Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`,
            },
      };
      const response = await axios.post(`${API_URL}/sync`, {}, config);
      return response.data;
};

const marketService = {
      getProducts,
      getHistory,
      getPrediction,
      seedData,
      syncData
};

export default marketService;
