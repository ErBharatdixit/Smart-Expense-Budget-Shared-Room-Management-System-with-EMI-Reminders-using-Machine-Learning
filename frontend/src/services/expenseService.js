import API from './api';

const getExpenses = async () => {
      const response = await API.get('/expenses');
      return response.data;
};

const createExpense = async (expenseData) => {
      const response = await API.post('/expenses', expenseData);
      return response.data;
};

const deleteExpense = async (expenseId) => {
      const response = await API.delete(`/expenses/${expenseId}`);
      return response.data;
};

const predictCategory = async (title) => {
      const response = await API.post('/expenses/predict', { title });
      return response.data;
};

const getPrediction = async () => {
      const response = await API.get('/expenses/prediction');
      return response.data;
};

const expenseService = {
      getExpenses,
      createExpense,
      deleteExpense,
      predictCategory,
      getPrediction,
      getInsights: async () => {
            const response = await API.get('/expenses/insights');
            return response.data;
      }
};

export default expenseService;
