import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, LoginCredentials } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Verificar si hay una sesión activa al cargar la app
   */
  const checkAuth = async () => {
    try {
      // Verificar si hay un token guardado
      if (!authService.hasToken()) {
        setLoading(false);
        return;
      }

      // Verificar token con el backend
      const response = await authService.verify();

      if (response.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('[AUTH] Sesión restaurada:', response.data.user.email);
      } else {
        // Token inválido
        authService.removeToken();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[AUTH] Error al verificar sesión:', error);
      // Limpiar datos si hay error
      authService.removeToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Iniciar sesión
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      if (response.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('[AUTH] Login exitoso:', response.data.user.email, `(${response.data.user.role})`);
      } else {
        throw new Error('Respuesta de login inválida');
      }
    } catch (error: any) {
      console.error('[AUTH] Error en login:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error; // Re-lanzar para que el componente Login lo maneje
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      console.log('[AUTH] Logout exitoso');
    } catch (error) {
      console.error('[AUTH] Error en logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
};
