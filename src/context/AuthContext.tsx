import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '../hooks/useAuth';
import { User } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  logout: () => void;
  token: string | null;
  getAuthHeader: () => { Authorization: string } | {};
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuthHook();

  // Get JWT token from localStorage
  const token = authService.getToken();

  // Helper function to get authorization header
  const getAuthHeader = () => {
    const jwtToken = authService.getToken();
    return jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {};
  };

  const contextValue: AuthContextType = {
    ...auth,
    token,
    getAuthHeader,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
