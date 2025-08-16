import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const { exp } = JSON.parse(atob(token.split('.')[1]));
        if (exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('isAuthenticated', 'true');
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('isAuthenticated');
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
