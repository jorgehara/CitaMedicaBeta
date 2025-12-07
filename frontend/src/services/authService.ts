import axiosInstance from '../config/axios';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  VerifyResponse
} from '../types/auth';

const TOKEN_KEY = 'auth_token';

/**
 * Servicio de autenticación
 */
class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);

      if (response.data.success && response.data.data.token) {
        // Guardar token en localStorage
        this.setToken(response.data.data.token);
      }

      return response.data;
    } catch (error: any) {
      console.error('[AUTH] Error en login:', error);
      throw error.response?.data || {
        success: false,
        message: 'Error al iniciar sesión'
      };
    }
  }

  /**
   * Registrar nuevo usuario (solo admin)
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      console.error('[AUTH] Error en registro:', error);
      throw error.response?.data || {
        success: false,
        message: 'Error al registrar usuario'
      };
    }
  }

  /**
   * Verificar token actual
   */
  async verify(): Promise<VerifyResponse> {
    try {
      const response = await axiosInstance.get<VerifyResponse>('/auth/verify');
      return response.data;
    } catch (error: any) {
      console.error('[AUTH] Error en verificación:', error);
      // Limpiar token inválido
      this.removeToken();
      throw error.response?.data || {
        success: false,
        message: 'Token inválido'
      };
    }
  }

  /**
   * Obtener datos del usuario actual
   */
  async getMe(): Promise<VerifyResponse> {
    try {
      const response = await axiosInstance.get<VerifyResponse>('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('[AUTH] Error al obtener usuario:', error);
      throw error.response?.data || {
        success: false,
        message: 'Error al obtener datos del usuario'
      };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('[AUTH] Error en logout:', error);
    } finally {
      // Siempre limpiar token local
      this.removeToken();
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      console.error('[AUTH] Error al cambiar contraseña:', error);
      throw error.response?.data || {
        success: false,
        message: 'Error al cambiar contraseña'
      };
    }
  }

  /**
   * Guardar token en localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Obtener token de localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Eliminar token de localStorage
   */
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Verificar si hay un token guardado
   */
  hasToken(): boolean {
    return !!this.getToken();
  }
}

// Exportar instancia única del servicio
export const authService = new AuthService();
export default authService;
