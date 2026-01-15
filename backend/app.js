const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/expenses', require('./routes/expenseRoutes'));


app.get('/', (req, res) => {
      res.send('API is running...');
});

// Error Handler
app.use(errorHandler);


module.exports = app;
