import React, { createContext, useContext, useState } from 'react';
import { getApiUrl } from '../services/configService';

interface AuthContextType {
  user: any;
  token: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  async function login(email: string, password: string) {
    try {
      // Check for superadmin credentials first
      if (email === 'infraagesic@hg.com.uy' && password === 'Agesicvcf23!') {
        const superAdminUser = {
          id: 'superadmin',
          email: 'infraagesic@hg.com.uy',
          username: 'Super Admin',
          name: 'Super Administrator',
          verified: true,
          role: 'superadmin'
        };
        
        setUser(superAdminUser);
        setToken('superadmin-token');
        setIsSuperAdmin(true);
        localStorage.setItem('pb_token', 'superadmin-token');
        localStorage.setItem('pb_user', JSON.stringify(superAdminUser));
        localStorage.setItem('is_superadmin', 'true');
        return true;
      }

      // Regular PocketBase authentication using configured URL
      const apiUrl = getApiUrl('/collections/users/auth-with-password');
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setUser(data.record);
        setToken(data.token);
        setIsSuperAdmin(false);
        localStorage.setItem('pb_token', data.token);
        localStorage.setItem('pb_user', JSON.stringify(data.record));
        localStorage.removeItem('is_superadmin');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  function logout() {
    setUser(null);
    setToken("");
    setIsSuperAdmin(false);
    localStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
    localStorage.removeItem('is_superadmin');
    window.location.href = '/login';
  }

  // Validate token on app load
  React.useEffect(() => {
    async function validateSession() {
      const t = localStorage.getItem('pb_token');
      const u = localStorage.getItem('pb_user');
      const superAdmin = localStorage.getItem('is_superadmin');
      
      if (t && u) {
        try {
          const userData = JSON.parse(u);
          
          // Check if it's superadmin
          if (superAdmin === 'true' && t === 'superadmin-token') {
            setToken(t);
            setUser(userData);
            setIsSuperAdmin(true);
            setLoading(false);
            return;
          }
          
          // Validate regular token against PocketBase using configured URL
          const apiUrl = getApiUrl('/collections/users/auth-refresh');
          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Authorization': t },
          });
          
          if (res.ok) {
            const data = await res.json();
            setToken(data.token);
            setUser(data.record);
            setIsSuperAdmin(false);
            localStorage.setItem('pb_token', data.token);
            localStorage.setItem('pb_user', JSON.stringify(data.record));
          } else {
            // Clear invalid session
            setUser(null);
            setToken("");
            setIsSuperAdmin(false);
            localStorage.removeItem('pb_token');
            localStorage.removeItem('pb_user');
            localStorage.removeItem('is_superadmin');
          }
        } catch (error) {
          console.error('Session validation error:', error);
          // Clear corrupted session
          setUser(null);
          setToken("");
          setIsSuperAdmin(false);
          localStorage.removeItem('pb_token');
          localStorage.removeItem('pb_user');
          localStorage.removeItem('is_superadmin');
        }
      }
      setLoading(false);
    }
    validateSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}