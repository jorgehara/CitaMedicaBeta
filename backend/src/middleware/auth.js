const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Secret key para JWT (debe estar en .env en producción)
const JWT_SECRET = process.env.JWT_SECRET || 'cita-medica-secret-key-2024-change-in-production';

/**
 * Middleware para verificar JWT y autenticar usuario
 * Agrega el usuario al objeto request si el token es válido
 */
const auth = async (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. No se proporcionó token de autenticación.'
            });
        }

        // Extraer token (formato: "Bearer <token>")
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. Token inválido.'
            });
        }

        try {
            // Verificar y decodificar token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Buscar usuario en la base de datos
            const user = await User.findById(decoded.userId);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado. Token inválido.'
                });
            }

            if (!user.activo) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario desactivado. Contacte al administrador.'
                });
            }

            // Agregar usuario al request
            req.user = {
                userId: user._id,
                email: user.email,
                nombre: user.nombre,
                role: user.role
            };

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado. Por favor inicie sesión nuevamente.'
                });
            }

            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido.'
                });
            }

            throw jwtError;
        }
    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en el servidor durante la autenticación.'
        });
    }
};

/**
 * Función auxiliar para generar JWT
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} expiresIn - Tiempo de expiración (default: 3 días)
 * @returns {string} Token JWT
 */
const generateToken = (payload, expiresIn = '3d') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Función auxiliar para verificar JWT sin middleware
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado
 */
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = {
    auth,
    generateToken,
    verifyToken,
    JWT_SECRET
};
