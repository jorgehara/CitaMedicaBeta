export type UserRole = 'admin' | 'operador' | 'auditor';

export interface User {
  _id: string;
  nombre: string;
  email: string;
  role: UserRole;
  activo: boolean;
  lastLogin?: Date;
  createdAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface VerifyResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface AuthError {
  success: false;
  message: string;
  errors?: Array<{
    msg: string;
    param: string;
  }>;
}
