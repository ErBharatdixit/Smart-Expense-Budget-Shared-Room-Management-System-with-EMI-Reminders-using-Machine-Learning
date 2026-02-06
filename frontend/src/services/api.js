import axios from 'axios';

const API = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Add a request interceptor to include the token
API.interceptors.request.use((req) => {
      if (localStorage.getItem('token')) {
            req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
      }
      return req;
});

export default API;
