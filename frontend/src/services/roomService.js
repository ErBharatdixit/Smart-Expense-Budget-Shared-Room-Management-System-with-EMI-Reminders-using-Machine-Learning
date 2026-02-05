import axios from 'axios';

const API_URL = 'http://localhost:8000/api/rooms/';

// Get user token
const getToken = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.token;
}

const getMyRoom = async () => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.get(API_URL + 'myroom', config);
      return response.data;
};

const createRoom = async (roomData) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.post(API_URL, roomData, config);
      return response.data;
};

const joinRoom = async (roomData) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.post(API_URL + 'join', roomData, config);
      return response.data;
};

const addSharedExpense = async (expenseData) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.post(API_URL + 'expenses', expenseData, config);
      return response.data;
};

const predictRoomExpense = async () => {
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      const response = await axios.get(`${API_URL}predict`, config);
      return response.data;
};

const roomService = {
      getMyRoom,
      createRoom,
      joinRoom,
      addSharedExpense,
      predictRoomExpense
};

export default roomService;
