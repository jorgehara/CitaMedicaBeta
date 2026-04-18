import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
}

/**
 * Componente que protege rutas requiriendo autenticación
 * Opcionalmente puede requerir roles específicos
 */
const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <CircularProgress size={60} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-gray-600 dark:text-gray-400"
        >
          Verificando sesión...
        </motion.p>
      </Box>
    );
  }

  // Si no está autenticado, redirect a login
  if (!isAuthenticated) {
    if (import.meta.env.DEV) console.log('[PROTECTED ROUTE] Usuario no autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Si requiere un rol específico, verificar
  if (requiredRole && user) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowedRoles.includes(user.role)) {
      if (import.meta.env.DEV) console.log(
        `[PROTECTED ROUTE] Usuario sin permisos. Rol requerido: ${allowedRoles.join(' o ')}, Rol actual: ${user.role}`
      );

      // Página de sin permisos
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Acceso Denegado
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No tienes permisos para acceder a esta página.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Rol requerido: <strong>{allowedRoles.join(' o ')}</strong>
              <br />
              Tu rol actual: <strong>{user.role}</strong>
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Volver
            </motion.button>
          </motion.div>
        </Box>
      );
    }
  }

  // Usuario autenticado y con permisos, renderizar children
  return <>{children}</>;
};

export default ProtectedRoute;
