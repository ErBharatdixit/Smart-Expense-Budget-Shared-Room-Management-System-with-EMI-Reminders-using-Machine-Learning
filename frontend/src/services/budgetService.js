import axios from 'axios';

const API_URL = 'http://localhost:8000/api/budgets/';

// Get user token
const getToken = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.token;
}

const getBudgets = async () => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.get(API_URL, config);
      return response.data;
};

const setBudget = async (budgetData) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.post(API_URL, budgetData, config);
      return response.data;
};

const deleteBudget = async (budgetId) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.delete(API_URL + budgetId, config);
      return response.data;
};

const budgetService = {
      getBudgets,
      setBudget,
      deleteBudget
};

export default budgetService;
