import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { api } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() =>
    localStorage.getItem('silentos_token')
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch (err) {
        console.warn('Session expired or invalid token');

        localStorage.removeItem('silentos_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({
      email,
      password,
    });

    localStorage.setItem(
      'silentos_token',
      res.token
    );

    setToken(res.token);
    setUser(res.user);
  };

  const register = async (
    name,
    email,
    phone,
    password
  ) => {
    const res = await api.register({
      name,
      email,
      phone,
      password,
    });

    localStorage.setItem(
      'silentos_token',
      res.token
    );

    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('silentos_token');

    setToken(null);
    setUser(null);

    api.logout().catch(() => {});
  };

  const quickLogin = async (role) => {
    const email =
      role === 'admin'
        ? 'admin@example.com'
        : 'user@example.com';

    await login(
      email,
      'password123'
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}