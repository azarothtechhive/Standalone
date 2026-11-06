// src/context/AdminAuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService, AdminUser } from '../services/authService';

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isSuperAdmin: boolean;
  canEdit: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(authService.getUser());
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await authService.getCurrentUser();
        if (profile) {
          setUser(profile);
          setToken(authService.getToken() || 'cookie-session');
        } else {
          setUser(null);
          setToken(null);
        }
      } catch {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    const res = await authService.login(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
      setToken(res.token || 'cookie-session');
    }
    setIsLoading(false);
    return res;
  };

  const logout = () => {
    void authService.logout();
    setUser(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    const profile = await authService.getCurrentUser();
    if (profile) setUser(profile);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'admin';
  const canEdit =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'CMS_ADMIN' ||
    user?.role === 'CONTENT_EDITOR' ||
    user?.role === 'admin' ||
    user?.role === 'editor';

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
        isSuperAdmin,
        canEdit,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
};

export const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0B0F17',
        color: '#D4AF37',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(212, 175, 55, 0.2)',
            borderTopColor: '#D4AF37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
          }} />
          <p style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>Verifying secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
