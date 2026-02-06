import API from './api';

const getBudgets = async () => {
      const response = await API.get('/budgets/');
      return response.data;
};

const setBudget = async (budgetData) => {
      const response = await API.post('/budgets/', budgetData);
      return response.data;
};

const deleteBudget = async (budgetId) => {
      const response = await API.delete('/budgets/' + budgetId);
      return response.data;
};

const budgetService = {
      getBudgets,
      setBudget,
      deleteBudget
};

export default budgetService;
