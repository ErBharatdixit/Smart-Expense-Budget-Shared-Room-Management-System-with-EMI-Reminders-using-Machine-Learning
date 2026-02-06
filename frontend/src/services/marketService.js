import API from './api';

const getProducts = async () => {
      const response = await API.get('/market/products');
      return response.data;
};

const getHistory = async (id) => {
      const response = await API.get(`/market/history/${id}`);
      return response.data;
};

const getPrediction = async (id) => {
      const response = await API.get(`/market/predict/${id}`);
      return response.data;
};

const seedData = async () => {
      const response = await API.post('/market/seed', {});
      return response.data;
};

const syncData = async () => {
      const response = await API.post('/market/sync', {});
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
