import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import EMI from './pages/EMI';
import Rooms from './pages/Rooms';
import Settlements from './pages/Settlements';

import { AuthProvider } from './context/AuthContext';

function App() {
      return (
            <AuthProvider>
                  <Router>
                        <div className="min-h-screen bg-gray-50 text-gray-900">
                              <nav className="p-4 bg-white shadow-md flex gap-4">
                                    <Link to="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
                                    <Link to="/expenses" className="text-blue-600 hover:underline">Expenses</Link>
                                    <Link to="/budget" className="text-blue-600 hover:underline">Budget</Link>
                                    <Link to="/emi" className="text-blue-600 hover:underline">EMI</Link>
                                    <Link to="/rooms" className="text-blue-600 hover:underline">Rooms</Link>
                              </nav>
                              <div className="container mx-auto p-4">
                                    <Routes>
                                          <Route path="/" element={<Login />} />
                                          <Route path="/login" element={<Login />} />
                                          <Route path="/register" element={<Register />} />
                                          <Route path="/dashboard" element={<Dashboard />} />
                                          <Route path="/expenses" element={<Expenses />} />
                                          <Route path="/budget" element={<Budget />} />
                                          <Route path="/emi" element={<EMI />} />
                                          <Route path="/rooms" element={<Rooms />} />
                                          <Route path="/settlements" element={<Settlements />} />
                                    </Routes>
                              </div>
                        </div>
                  </Router>
            </AuthProvider>
      );
}

export default App;
