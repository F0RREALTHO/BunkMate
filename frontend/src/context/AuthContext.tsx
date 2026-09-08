import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../lib/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userName: string | null;
  userEmail: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userName: null,
    userEmail: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    if (token) {
      setState({ isAuthenticated: true, isLoading: false, userName: name || 'Student', userEmail: email });
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('token', res.token);
    localStorage.setItem('userName', res.name);
    localStorage.setItem('userEmail', res.email);
    setState({ isAuthenticated: true, isLoading: false, userName: res.name, userEmail: res.email });
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    localStorage.setItem('token', res.token);
    localStorage.setItem('userName', res.name);
    localStorage.setItem('userEmail', res.email);
    setState({ isAuthenticated: true, isLoading: false, userName: res.name, userEmail: res.email });
  };

  const loginWithToken = useCallback(async (token: string) => {
    try {
      // Safely decode Base64 URL payload
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
      const decodedJson = atob(paddedBase64);
      const payload = JSON.parse(decodedJson);
      const email = payload.email || '';
      
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      
      // Fetch actual user details instead of defaulting to 'Student'
      let name = 'Student';
      try {
        const user = await api.getMe();
        name = user.name;
        localStorage.setItem('userName', name);
      } catch (err) {
        console.error("Failed to fetch user details", err);
      }
      
      setState({ isAuthenticated: true, isLoading: false, userName: name, userEmail: email });
    } catch (e) {
      console.error("Invalid token", e);
    }
  }, []);

  const updateName = async (name: string) => {
    const res = await api.updateMe(name);
    localStorage.setItem('userName', res.name);
    setState(s => ({ ...s, userName: res.name }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setState({ isAuthenticated: false, isLoading: false, userName: null, userEmail: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, loginWithToken, updateName, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
