import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('qsc3_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('qsc3_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/auth/verify', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        
        if (response.data.valid) {
          setUser(response.data.user);
          setToken(storedToken);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('qsc3_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('qsc3_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
