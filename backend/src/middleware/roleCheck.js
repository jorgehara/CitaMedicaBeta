/**
 * Middleware para verificar roles de usuario
 * Debe usarse después del middleware auth
 */

/**
 * Verifica si el usuario tiene alguno de los roles especificados
 * @param {...string} allowedRoles - Roles permitidos
 * @returns {Function} Middleware
 */
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Verificar que el middleware auth se ejecutó primero
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado.'
            });
        }

        const userRole = req.user.role;

        // Verificar si el rol del usuario está en los roles permitidos
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}. Tu rol actual: ${userRole}`
            });
        }

        // Usuario tiene el rol apropiado
        next();
    };
};

/**
 * Middleware específico para solo administradores
 */
const adminOnly = checkRole('admin');

/**
 * Middleware para administradores y operadores
 */
const adminOrOperador = checkRole('admin', 'operador');

/**
 * Middleware para todos los roles autenticados (solo verifica autenticación)
 */
const allRoles = checkRole('admin', 'operador', 'auditor');

/**
 * Definición de permisos por recurso
 */
const permissions = {
    // Permisos para appointments
    appointments: {
        read: ['admin', 'operador', 'auditor'],
        create: ['admin', 'operador'],
        update: ['admin', 'operador'],
        delete: ['admin', 'operador']  // Permitir que operadores también eliminen
    },
    // Permisos para sobreturnos
    sobreturnos: {
        read: ['admin', 'operador', 'auditor'],
        create: ['admin', 'operador'],
        update: ['admin', 'operador'],
        delete: ['admin', 'operador']  // Permitir que operadores también eliminen
    },
    // Permisos para usuarios
    users: {
        read: ['admin'],
        create: ['admin'],
        update: ['admin'],
        delete: ['admin']
    }
};

/**
 * Verifica permiso específico para un recurso y acción
 * @param {string} resource - Recurso (appointments, sobreturnos, users)
 * @param {string} action - Acción (read, create, update, delete)
 * @returns {Function} Middleware
 */
const checkPermission = (resource, action) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado.'
            });
        }

        const userRole = req.user.role;
        const allowedRoles = permissions[resource]?.[action];

        if (!allowedRoles) {
            return res.status(500).json({
                success: false,
                message: 'Permiso no definido.'
            });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `No tienes permiso para ${action} en ${resource}. Se requiere rol: ${allowedRoles.join(' o ')}`
            });
        }

        next();
    };
};

module.exports = {
    checkRole,
    adminOnly,
    adminOrOperador,
    allRoles,
    checkPermission,
    permissions
};
