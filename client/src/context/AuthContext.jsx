import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

/**
 * Provides authentication state and helpers to the entire app.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('ttm_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  /** Store token + user in state and localStorage */
  const login = (userData) => {
    localStorage.setItem('ttm_user', JSON.stringify(userData));
    localStorage.setItem('ttm_token', userData.token);
    setUser(userData);
  };

  /** Clear auth state */
  const logout = () => {
    localStorage.removeItem('ttm_user');
    localStorage.removeItem('ttm_token');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Hook to consume the AuthContext */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
