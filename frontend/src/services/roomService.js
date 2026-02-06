import API from './api';

const getMyRoom = async () => {
      const response = await API.get('/rooms/myroom');
      return response.data;
};

const createRoom = async (roomData) => {
      const response = await API.post('/rooms/', roomData);
      return response.data;
};

const joinRoom = async (roomData) => {
      const response = await API.post('/rooms/join', roomData);
      return response.data;
};

const addSharedExpense = async (expenseData) => {
      const response = await API.post('/rooms/expenses', expenseData);
      return response.data;
};

const predictRoomExpense = async () => {
      const response = await API.get('/rooms/predict');
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
