import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure axios base defaults - use VITE_API_BASE_URL env var, fallback to https://ai-resume-analyzer-6e7m.onrender.com for development
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://ai-resume-analyzer-6e7m.onrender.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Initialize or verify token on startup
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await axios.get('/api/auth/me');
          setUser(response.data);
          setToken(storedToken);
        } catch (error) {
          console.error("Token verification failed", error);
          // Token expired or invalid
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { accessToken, userId, name, email: userEmail, roles } = response.data;
      
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      const loggedUser = { id: userId, name, email: userEmail, roles };
      setUser(loggedUser);
      setToken(accessToken);
      return loggedUser;
    } catch (error) {
      throw error.response?.data || new Error("Connection failed");
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
