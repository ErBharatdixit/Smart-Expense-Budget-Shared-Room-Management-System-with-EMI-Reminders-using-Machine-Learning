# ExpenseML - Smart Expense & Budget Management System 🚀

[![Deployment Status](https://img.shields.io/badge/Status-Live-success)](https://expenseml-frontend.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ExpenseML is a premium, AI-powered financial management system designed to help users track expenses, manage shared room budgets, and receive smart insights using Machine Learning.

![Dashboard Mockup](frontend/src/assets/images/hero_dashboard_viz.png)

## 🌐 Live Links

- **Frontend App**: [https://expenseml-frontend.onrender.com](https://expenseml-frontend.onrender.com)
- **Backend API**: [https://expenseml-backend.onrender.com](https://expenseml-backend.onrender.com)
- **ML Engine**: [https://expenseml-engine.onrender.com](https://expenseml-engine.onrender.com)

## ✨ Key Features

- **🤖 ML Category Prediction**: Automatically categorizes your expenses based on descriptions using a Scikit-Learn model.
- **🏠 Shared Room Management**: Create or join rooms to manage shared expenses with roommates and track settlements (Hinglish labels like "Paisa Vasool").
- **📅 EMI & Bill Reminders**: Never miss a payment with integrated EMI tracking and smart WhatsApp reminders.
- **📊 Financial Insights**: Get deep behavioral analysis, risk scores, and "Explain Like I'm 10" (ELIm10) spending summaries.
- **🎯 Smart Budgeting**: Set monthly budgets and track utilization in real-time with beautiful charts.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Chart.js.
- **Backend**: Node.js, Express, MongoDB Atlas (Mongoose).
- **ML Engine**: Python, Flask, Scikit-Learn, Pandas.
- **Deployment**: Render.

## 🚀 Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/ErBharatdixit/Smart-Expense-Budget-Shared-Room-Management-System-with-EMI-Reminders-using-Machine-Learning.git
cd Smart-Expense-Budget-Shared-Room-Management-System-with-EMI-Reminders-using-Machine-Learning
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file with MONGO_URI, JWT_SECRET, and ML_SERVICE_URL
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create .env file with VITE_API_URL
npm run dev
```

### 4. ML Engine Setup
```bash
cd ml_engine
pip install -r requirements.txt
python app.py
```

## 🔒 Security Note
Environment variables (`.env` files) are excluded from this repository for security. Ensure you set up your own keys for MongoDB and the ML service URL when running locally.

---
Built with ❤️ by [ErBharatdixit](https://github.com/ErBharatdixit)
