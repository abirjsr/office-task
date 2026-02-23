import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Admin } from '../types';
import api from '../api/axiosConfig';

interface AuthContextType {
  currentAdmin: Admin | null;
  setCurrentAdmin: (admin: Admin | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      // Map Clerk user to our Admin type
      setCurrentAdmin({
        adminId: user.id,
        fullName: user.fullName || user.username || 'Admin',
        email: user.primaryEmailAddress?.emailAddress || '',
        phone: 0, // Clerk handles phone separately, or we can fetch from metadata
        password: '', // Not needed with Clerk
        isActive: true,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString()
      });
      setIsLoading(false);
    } else if (isLoaded && !user) {
      setCurrentAdmin(null);
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  return (
    <AuthContext.Provider value={{ currentAdmin, setCurrentAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
