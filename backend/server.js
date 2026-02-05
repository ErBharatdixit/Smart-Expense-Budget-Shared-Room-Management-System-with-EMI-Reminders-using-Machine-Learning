const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 8000;

// Connect to Database
connectDB();

app.listen(PORT, () => { });
