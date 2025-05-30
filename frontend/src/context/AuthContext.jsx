import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create an Axios instance that adds JWT to every request
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe();
  }, []);

    const fetchMe = async () => {
    setLoading(true);
        try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      // Redirect to appropriate dashboard based on role
      if (res.data.role === 'TEAM') {
        navigate('/team-dashboard');
      } else if (res.data.role === 'ADMIN') {
        navigate('/');
      }
        } catch (err) {
          setUser(null);
      navigate('/login');
    } finally {
      setLoading(false);
      }
    };

  const login = async (username, password) => {
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', { username, password });
      if (res.data.token) {
        localStorage.setItem('jwt', res.data.token);
        await fetchMe(); // This will handle the redirection
        return true;
      }
      return false;
    } catch (err) {
      setUser(null);
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem('jwt');
    setUser(null);
    navigate('/login');
  };

  // Function to get the appropriate dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return '/login';
    return user.role === 'ADMIN' ? '/' : '/team-dashboard';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getDashboardRoute }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 