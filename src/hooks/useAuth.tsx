import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: any;
  token: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function login(email: string, password: string) {
    try {
      const res = await fetch('http://localhost:8090/api/collections/users/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setUser(data.record);
        setToken(data.token);
        localStorage.setItem('pb_token', data.token);
        localStorage.setItem('pb_user', JSON.stringify(data.record));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  function logout() {
    setUser(null);
    setToken("");
    localStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
    window.location.href = '/login';
  }

  // Validar token al cargar la app
  React.useEffect(() => {
    async function validateSession() {
      const t = localStorage.getItem('pb_token');
      const u = localStorage.getItem('pb_user');
      if (t && u) {
        // Validar token contra PocketBase
        const res = await fetch('http://localhost:8090/api/collections/users/auth-refresh', {
          method: 'POST',
          headers: { 'Authorization': t },
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.token);
          setUser(data.record);
          localStorage.setItem('pb_token', data.token);
          localStorage.setItem('pb_user', JSON.stringify(data.record));
        } else {
          setUser(null);
          setToken("");
          localStorage.removeItem('pb_token');
          localStorage.removeItem('pb_user');
        }
      }
      setLoading(false);
    }
    validateSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
} 