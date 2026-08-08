import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser as loginRequest } from '../services/authService';
import { useTranslation } from 'react-i18next';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  // Rehydrate session from localStorage on first load.
  useEffect(() => {
    const storedUser = localStorage.getItem('cargozents_user');
    const token = localStorage.getItem('cargozents_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Sync language with i18n and handle RTL for Arabic
  useEffect(() => {
    if (user && user.preferredLanguage) {
      i18n.changeLanguage(user.preferredLanguage);
    }
  }, [user, i18n]);

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const login = async (email, password) => {
    const { data } = await loginRequest({ email, password });
    localStorage.setItem('cargozents_token', data.token);
    localStorage.setItem('cargozents_user', JSON.stringify(data.user));
    setUser(data.user);
    if (data.user.preferredLanguage) {
      i18n.changeLanguage(data.user.preferredLanguage);
    }
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('cargozents_token');
    localStorage.removeItem('cargozents_user');
    setUser(null);
    i18n.changeLanguage('en');
  };

  // Used after editing the profile (PATCH /auth/me) to sync the fresh
  // user object into both state and localStorage without a full re-login.
  const updateUser = (updatedUser) => {
    localStorage.setItem('cargozents_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🟢 FIX: Added the missing useAuth custom hook so other components can import it!
export const useAuth = () => {
  return useContext(AuthContext);
};