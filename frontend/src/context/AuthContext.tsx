import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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
  loginWithToken: (token: string) => void;
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

  const loginWithToken = (token: string) => {
    // Basic JWT decode to extract email (payload is 2nd part of JWT)
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const payload = JSON.parse(decodedJson);
      const email = payload.email || '';
      
      localStorage.setItem('token', token);
      localStorage.setItem('userName', 'Student'); // default for OAuth
      localStorage.setItem('userEmail', email);
      
      setState({ isAuthenticated: true, isLoading: false, userName: 'Student', userEmail: email });
    } catch (e) {
      console.error("Invalid token", e);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setState({ isAuthenticated: false, isLoading: false, userName: null, userEmail: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
