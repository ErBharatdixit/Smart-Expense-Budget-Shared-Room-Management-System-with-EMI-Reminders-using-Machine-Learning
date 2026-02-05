import API from './api';

const authService = {
      register: async (userData) => {
            const response = await API.post('/auth/register', userData);
            return response.data;
      },

      verifyEmail: async (data) => {
            const response = await API.post('/auth/verify-email', data);
            if (response.data) {
                  localStorage.setItem('user', JSON.stringify(response.data));
                  localStorage.setItem('token', response.data.token);
            }
            return response.data;
      },

      login: async (userData) => {
            const response = await API.post('/auth/login', userData);
            if (response.data) {
                  localStorage.setItem('user', JSON.stringify(response.data));
                  localStorage.setItem('token', response.data.token);
            }
            return response.data;
      },

      logout: () => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
      },

      updateProfile: async (userData) => {
            const response = await API.put('/auth/profile', userData);
            if (response.data) {
                  localStorage.setItem('user', JSON.stringify(response.data));
                  localStorage.setItem('token', response.data.token);
            }
            return response.data;
      },

      getCurrentUser: () => {
            return JSON.parse(localStorage.getItem('user'));
      }
};

export default authService;
