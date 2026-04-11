import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uToken = localStorage.getItem('ut');
    const aToken = localStorage.getItem('at');
    const uData  = localStorage.getItem('ud');
    const aData  = localStorage.getItem('ad');
    if (uToken && uData) { setUser(JSON.parse(uData)); api.defaults.headers.common['Authorization'] = `Bearer ${uToken}`; }
    if (aToken && aData) { setAdmin(JSON.parse(aData)); api.defaults.headers.common['x-api-key'] = aToken; }
    setLoading(false);
  }, []);

  const loginUser = (data, token) => {
    setUser(data);
    localStorage.setItem('ut', token);
    localStorage.setItem('ud', JSON.stringify(data));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const loginAdmin = (data, token) => {
    setAdmin(data);
    localStorage.setItem('at', token);
    localStorage.setItem('ad', JSON.stringify(data));
    api.defaults.headers.common['x-api-key'] = token;
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('ut');
    localStorage.removeItem('ud');
    delete api.defaults.headers.common['Authorization'];
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem('at');
    localStorage.removeItem('ad');
    delete api.defaults.headers.common['x-api-key'];
  };

  return (
    <Ctx.Provider value={{ user, admin, loading, loginUser, loginAdmin, logoutUser, logoutAdmin }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
