import axios from 'axios';

const API_URL = 'http://localhost:8000/api/expenses';

// Get user token
const getToken = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.token;
}

const getExpenses = async () => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.get(API_URL, config);
      return response.data;
};

const createExpense = async (expenseData) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.post(API_URL, expenseData, config);
      return response.data;
};

const deleteExpense = async (expenseId) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.delete(`${API_URL}/${expenseId}`, config);
      return response.data;
};

const predictCategory = async (title) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.post(`${API_URL}/predict`, { title }, config);
      return response.data;
};

const getPrediction = async () => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.get(`${API_URL}/prediction`, config);
      return response.data;
};

const expenseService = {
      getExpenses,
      createExpense,
      deleteExpense,
      predictCategory,
      getPrediction,
      getInsights: async () => {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            const response = await axios.get(`${API_URL}/insights`, config);
            return response.data;
      }
};

export default expenseService;
