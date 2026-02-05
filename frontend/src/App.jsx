import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import EMI from './pages/EMI';
import Rooms from './pages/Rooms';
import Settlements from './pages/Settlements';
import MarketPrices from './pages/MarketPrices';
import AIChat from './pages/AIChat';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute'; // Added import for ProtectedRoute
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import { Toaster } from 'react-hot-toast';

function App() {
      return (
            <AuthProvider>
                  <Router>
                        <Routes>
                              {/* Public Routes */}
                              <Route path="/" element={<LandingPage />} />
                              <Route path="/login" element={<Login />} />
                              <Route path="/register" element={<Register />} />

                              {/* Protected Routes */}
                              <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                          <Layout>
                                                <Dashboard />
                                          </Layout>
                                    </ProtectedRoute>
                              } />
                              <Route path="/expenses" element={
                                    <ProtectedRoute>
                                          <Layout>
                                                <Expenses />
                                          </Layout>
                                    </ProtectedRoute>
                              } />
                              <Route path="/budget" element={
                                    <ProtectedRoute>
                                          <Layout>
                                                <Budget />
                                          </Layout>
                                    </ProtectedRoute>
                              } />
                              <Route path="/emi" element={
                                    <ProtectedRoute>
                                          <Layout>
                                                <EMI />
                                          </Layout>
                                    </ProtectedRoute>
                              } />
                              <Route path="/rooms" element={
                                    <ProtectedRoute>
                                          <Layout>
                                                <Rooms />
                                          </Layout>
                                    </ProtectedRoute>
                              } />
                              <Route path="/settlements" element={
                                    <ProtectedRoute>
                                          <Layout>
                                                <Settlements />
                                          </Layout>
                                    </ProtectedRoute>
                              } />
                              <Route path="/market" element={
                                    <ProtectedRoute>
                                          <Layout>
                                                <MarketPrices />
                                          </Layout>
                                    </ProtectedRoute>
                              } />
                              <Route path="/chat" element={
                                    <ProtectedRoute>
                                          <Layout>
                                                <AIChat />
                                          </Layout>
                                    </ProtectedRoute>
                              } />
                        </Routes>
                        <Toaster position="top-right" toastOptions={{
                              style: {
                                    background: '#1E293B',
                                    color: '#fff',
                                    border: '1px solid #334155'
                              }
                        }} />
                  </Router>
            </AuthProvider>
      );
}

export default App;
