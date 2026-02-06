import API from './api';

const getChatResponse = async (message, history) => {
      const response = await API.post('/chat', { message, history });
      return response.data;
};

const chatService = {
      getChatResponse
};

export default chatService;
