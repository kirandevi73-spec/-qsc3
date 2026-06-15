import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('qsc3_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success || res.data.valid) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      localStorage.removeItem('qsc3_token');
    } finally {
      setLoading(false);
    }
  };

  // Login.jsx yeh call karta hai: login(token, user)
  const login = (token, userData) => {
    localStorage.setItem('qsc3_token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('qsc3_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// yeh export Login.jsx use karta hai
export const useAuth = () => useContext(AuthContext);