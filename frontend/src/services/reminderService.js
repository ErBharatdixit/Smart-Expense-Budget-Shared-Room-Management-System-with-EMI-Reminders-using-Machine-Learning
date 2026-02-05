import axios from 'axios';

const API_URL = 'http://localhost:8000/api/reminders/';

// Get user token
const getToken = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.token;
}

const getReminders = async () => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.get(API_URL, config);
      return response.data;
};

const createReminder = async (reminderData) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.post(API_URL, reminderData, config);
      return response.data;
};

const updateReminder = async (id, reminderData) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.put(API_URL + id, reminderData, config);
      return response.data;
};

const deleteReminder = async (id) => {
      const config = {
            headers: {
                  Authorization: `Bearer ${getToken()}`,
            },
      };
      const response = await axios.delete(API_URL + id, config);
      return response.data;
};

const reminderService = {
      getReminders,
      createReminder,
      updateReminder,
      deleteReminder
};

export default reminderService;
