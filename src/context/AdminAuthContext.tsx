// src/context/AdminAuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authService, AdminUser } from '../services/authService';

const DEFAULT_TIMEOUT_MINUTES = 30;
const WARNING_THRESHOLD_SECONDS = 120; // 2 minutes

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: (reason?: string) => void;
  refreshProfile: () => Promise<void>;
  isSuperAdmin: boolean;
  canEdit: boolean;
  // Session timeout state & controls
  remainingSeconds: number;
  isExpiringSoon: boolean;
  sessionExpired: boolean;
  extendSession: () => void;
  sessionTimeoutMinutes: number;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(authService.getUser());
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(DEFAULT_TIMEOUT_MINUTES * 60);
  const [isExpiringSoon, setIsExpiringSoon] = useState<boolean>(false);

  const timeoutMinutes = parseInt(import.meta.env.VITE_CMS_SESSION_TIMEOUT_MINUTES || String(DEFAULT_TIMEOUT_MINUTES), 10);
  const timeoutMs = timeoutMinutes * 60 * 1000;

  const lastActivityRef = useRef<number>(authService.getLastActivity());
  const lastRecordedRef = useRef<number>(Date.now());

  const extendSession = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    authService.recordActivity();
    setRemainingSeconds(timeoutMinutes * 60);
    setIsExpiringSoon(false);
  }, [timeoutMinutes]);

  const logout = useCallback((reason?: string) => {
    void authService.logout();
    setUser(null);
    setToken(null);
    setRemainingSeconds(timeoutMinutes * 60);
    setIsExpiringSoon(false);

    if (reason === 'session_expired') {
      setSessionExpired(true);
    }
  }, [timeoutMinutes]);

  // Initial authentication verification on load / refresh
  useEffect(() => {
    const init = async () => {
      try {
        const profile = await authService.getCurrentUser();
        if (profile) {
          setUser(profile);
          setToken(authService.getToken() || 'cookie-session');
          extendSession();
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
  }, [extendSession]);

  // Activity listeners to detect user interaction and reset idle timer
  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle recording to at most once every 15 seconds
      if (now - lastRecordedRef.current > 15_000) {
        lastRecordedRef.current = now;
        lastActivityRef.current = now;
        authService.recordActivity();
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    for (const ev of events) {
      window.addEventListener(ev, handleUserActivity, { passive: true });
    }

    return () => {
      for (const ev of events) {
        window.removeEventListener(ev, handleUserActivity);
      }
    };
  }, [user]);

  // Periodic session timeout checker
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - lastActivityRef.current;
      const leftSec = Math.max(0, Math.floor((timeoutMs - elapsedMs) / 1000));

      setRemainingSeconds(leftSec);

      if (leftSec <= 0) {
        clearInterval(interval);
        logout('session_expired');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login?reason=session_expired';
        }
      } else if (leftSec <= WARNING_THRESHOLD_SECONDS) {
        setIsExpiringSoon(true);
      } else {
        setIsExpiringSoon(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, timeoutMs, logout]);

  // Custom event listener for 401 triggers across the app
  useEffect(() => {
    const handleRemoteSessionExpired = () => {
      logout('session_expired');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login?reason=session_expired';
      }
    };

    window.addEventListener('auth:session_expired', handleRemoteSessionExpired);
    return () => window.removeEventListener('auth:session_expired', handleRemoteSessionExpired);
  }, [logout]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setSessionExpired(false);
    const res = await authService.login(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
      setToken(res.token || 'cookie-session');
      extendSession();
    }
    setIsLoading(false);
    return res;
  };

  const refreshProfile = async () => {
    const profile = await authService.getCurrentUser();
    if (profile) {
      setUser(profile);
      extendSession();
    }
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
        remainingSeconds,
        isExpiringSoon,
        sessionExpired,
        extendSession,
        sessionTimeoutMinutes: timeoutMinutes,
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
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B0F17',
          color: '#D4AF37',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '3px solid rgba(212, 175, 55, 0.2)',
              borderTopColor: '#D4AF37',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem',
            }}
          />
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
