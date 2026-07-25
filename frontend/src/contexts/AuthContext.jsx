import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('scheduler_token');
      if (token) {
        try {
          const response = await apiClient.get('/users/me');
          setUser(response.data);
        } catch (error) {
          console.error("Failed to load user", error);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('scheduler_token', response.data.access_token);
    const userResponse = await apiClient.get('/users/me');
    setUser(userResponse.data);
  };

  const logout = () => {
    localStorage.removeItem('scheduler_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
