import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../utils/mockData';
import { storageUtils } from '../utils/storage';

interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = storageUtils.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    storageUtils.setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
    storageUtils.clearCurrentUser();
  };

  const isAuthenticated = currentUser !== null;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};