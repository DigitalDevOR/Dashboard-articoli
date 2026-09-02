/// <reference types="vite/client" />
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { AuthContextType, User, RegisterData, LoginData } from '@/lib/types';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Initialize auth state on mount only
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      // Don't check auth on mount to prevent loops
    }
  }, [isInitialized]);

  // Check authentication manually
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('GET', '/api/auth/me');
      const userData = await res.json();
      setUser(userData);
      localStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
      setUser(null);
      localStorage.removeItem('isLoggedIn');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', apiBaseUrl+'/api/auth/login', credentials);
      return res.json();
    },
    onSuccess: (data: User) => {
      console.log('Login successful:', data);
      setUser(data);
      localStorage.setItem('isLoggedIn', 'true');
      queryClient.invalidateQueries();
      toast({
        title: 'Login effettuato con successo',
        description: `Benvenuto, ${data.fullName || data.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore di login',
        description: error.message || 'Credenziali non valide',
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      console.log('Registering user:', userData);
      const res = await apiRequest('POST', apiBaseUrl+'/api/auth/register', userData);
      return res.json();
    },
    onSuccess: (data: User) => {
      setUser(data);
      localStorage.setItem('isLoggedIn', 'true');
      queryClient.invalidateQueries();
      toast({
        title: 'Registrazione completata',
        description: `Benvenuto, ${data.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore di registrazione',
        description: error.message || 'Si è verificato un errore',
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('GET', apiBaseUrl+'/api/auth/logout');
    },
    onSuccess: () => {
      setUser(null);
      localStorage.removeItem('isLoggedIn');
      queryClient.clear();
      toast({
        title: 'Logout effettuato',
        description: 'Arrivederci!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore di logout',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Recovery password mutation
  const recoverPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest('POST', apiBaseUrl+'/api/auth/forgot-password', { email });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Email inviata',
        description: 'Controlla la tua email per le istruzioni di recupero password',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Wrapper functions
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (userData: RegisterData) => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const recoverPassword = async (email: string) => {
    await recoverPasswordMutation.mutateAsync(email);
  };

  const refetchUser = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    recoverPassword,
    refetchUser,
  };

  // Recupera lo user se non presente
  useEffect(() => {
    if (!user && !isLoading) {
      checkAuth();
    }
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}