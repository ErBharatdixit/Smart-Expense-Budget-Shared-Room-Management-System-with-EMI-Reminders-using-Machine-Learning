import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            const storedUser = authService.getCurrentUser();
            if (storedUser) {
                  setUser(storedUser);
            }
            setLoading(false);
      }, []);

      const register = async (userData) => {
            const data = await authService.register(userData);
            setUser(data);
            return data;
      };

      const login = async (userData) => {
            const data = await authService.login(userData);
            setUser(data);
            return data;
      };

      const logout = () => {
            authService.logout();
            setUser(null);
            // Optionally redirect to login
            window.location.href = '/login';
      };

      const value = {
            user,
            loading,
            register,
            login,
            logout,
      };

      return (
            <AuthContext.Provider value={value}>
                  {!loading && children}
            </AuthContext.Provider>
      );
};

export default AuthContext;
