import API from './api';

const getReminders = async () => {
      const response = await API.get('/reminders/');
      return response.data;
};

const createReminder = async (reminderData) => {
      const response = await API.post('/reminders/', reminderData);
      return response.data;
};

const updateReminder = async (id, reminderData) => {
      const response = await API.put('/reminders/' + id, reminderData);
      return response.data;
};

const deleteReminder = async (id) => {
      const response = await API.delete('/reminders/' + id);
      return response.data;
};

const reminderService = {
      getReminders,
      createReminder,
      updateReminder,
      deleteReminder
};

export default reminderService;
