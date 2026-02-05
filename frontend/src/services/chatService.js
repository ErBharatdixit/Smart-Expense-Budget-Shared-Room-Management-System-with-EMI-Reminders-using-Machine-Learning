import axios from 'axios';

const API_URL = 'http://localhost:8000/api/chat';

// Get user token
const getToken = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.token;
}

const getChatResponse = async (message, history) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.post(API_URL, { message, history }, config);
      return response.data;
};

const chatService = {
      getChatResponse
};

export default chatService;
