// src/services/authService.ts
/**
 * Client-side authentication service.
 * SEC-1 & SEC-6: Zero hardcoded passwords, secrets, or offline backdoors in client code.
 * All authentication, session verification, and TOTP MFA checks execute server-side.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'CMS_ADMIN' | 'CONTENT_EDITOR' | 'MARKETING_USER' | 'SALES_USER' | 'VIEWER' | 'admin' | 'editor';
  twoFactorEnabled?: boolean;
  mfaVerified?: boolean;
  forceMfaEnrollment?: boolean;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AdminUser;
  mfaRequired?: boolean;
  mfaEnrollmentRequired?: boolean;
  totpUri?: string;
  backupCodes?: string[];
}

class AuthService {
  private userCache: AdminUser | null = null;
  private tokenCache: string | null = null;

  getToken(): string | null {
    if (this.tokenCache) return this.tokenCache;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('azaroth_session_token');
      }
    } catch {
      // Ignore localStorage exceptions
    }
    return null;
  }

  getUser(): AdminUser | null {
    if (this.userCache) return this.userCache;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('azaroth_admin_user');
        if (stored) {
          this.userCache = JSON.parse(stored);
          return this.userCache;
        }
      }
    } catch {}
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  setSession(token: string | null | undefined, user: AdminUser): void {
    this.userCache = user;
    const now = Date.now().toString();
    if (token) {
      this.tokenCache = token;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('azaroth_session_token', token);
        }
      } catch {}
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('azaroth_admin_user', JSON.stringify(user));
        window.localStorage.setItem('azaroth_session_login_time', now);
        window.localStorage.setItem('azaroth_last_activity', now);
      }
    } catch {}
  }

  clearSession(): void {
    this.userCache = null;
    this.tokenCache = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('azaroth_session_token');
        window.localStorage.removeItem('azaroth_admin_user');
        window.localStorage.removeItem('azaroth_session_login_time');
        window.localStorage.removeItem('azaroth_last_activity');
      }
    } catch {}
  }

  recordActivity(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('azaroth_last_activity', Date.now().toString());
      }
    } catch {}
  }

  getLastActivity(): number {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const ts = window.localStorage.getItem('azaroth_last_activity');
        if (ts) return parseInt(ts, 10);
      }
    } catch {}
    return Date.now();
  }

  isIdleTimeout(maxIdleMinutes: number = 30): boolean {
    const last = this.getLastActivity();
    return Date.now() - last > maxIdleMinutes * 60 * 1000;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data: AuthResponse = await response.json().catch(() => ({
        success: false,
        message: 'Invalid server response.',
      }));

      if (response.ok && data.success && data.user) {
        this.setSession(data.token, data.user);
      }

      return data;
    } catch {
      return {
        success: false,
        message: 'Authentication service is currently unreachable.',
      };
    }
  }

  async logout(): Promise<void> {
    this.clearSession();
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors on logout
    }
  }

  async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const headers: Record<string, string> = {};
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
        headers,
        signal: controller?.signal,
      }).finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });

      if (!response.ok) {
        this.clearSession();
        if (response.status === 401 && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:session_expired'));
        }
        return null;
      }

      const data = await response.json();
      if (data.success && data.user) {
        this.setSession(data.token || this.getToken(), data.user);
        return data.user;
      }
      this.clearSession();
      return null;
    } catch {
      // If network error, allow local cached session to remain active temporarily
      const cached = this.getUser();
      if (cached && !this.isIdleTimeout()) {
        return cached;
      }
      return null;
    }
  }

  private getAuthHeaders(isJson = true): Record<string, string> {
    const headers: Record<string, string> = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return await response.json();
    } catch {
      return { success: false, message: 'Failed to reach authentication server.' };
    }
  }

  async listUsers(): Promise<{ success: boolean; users?: AdminUser[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        credentials: 'include',
        headers: this.getAuthHeaders(false),
      });
      if (response.ok) {
        return await response.json();
      }
      return { success: false, message: 'Failed to load users.' };
    } catch {
      return { success: false, message: 'Failed to reach authentication server.' };
    }
  }

  async createUser(userData: { email: string; password: string; name: string; role: string }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        method: 'POST',
        credentials: 'include',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch {
      return { success: false, message: 'Failed to reach authentication server.' };
    }
  }

  async getUserById(id: string): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
        credentials: 'include',
        headers: this.getAuthHeaders(false),
      });
      return await response.json();
    } catch {
      return { success: false, message: 'Failed to reach authentication server.' };
    }
  }

  async updateUser(id: string, updates: Partial<AdminUser> & { password?: string; email?: string }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch {
      return { success: false, message: 'Failed to reach authentication server.' };
    }
  }

  async updateProfile(updates: { name?: string; email?: string; password?: string }): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (response.ok && data.success && data.user) {
        this.setSession(this.getToken(), data.user);
      }
      return data;
    } catch {
      return { success: false, message: 'Failed to reach authentication server.' };
    }
  }

  async deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: this.getAuthHeaders(false),
      });
      return await response.json();
    } catch {
      return { success: false, message: 'Failed to reach authentication server.' };
    }
  }
}

export const authService = new AuthService();
