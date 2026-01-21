/**
 * Middleware de autenticación flexible
 * Acepta tanto API Key (chatbot) como JWT (frontend/dashboard)
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const CHATBOT_API_KEY = process.env.CHATBOT_API_KEY || 'chatbot-api-key-2024-change-in-production';
const JWT_SECRET = process.env.JWT_SECRET || 'cita-medica-secret-key-2024-change-in-production';

/**
 * Middleware que acepta autenticación por API Key O por JWT
 * Útil para rutas que pueden ser accedidas tanto por el chatbot como por usuarios autenticados
 */
const flexibleAuth = async (req, res, next) => {
    try {
        // 1. Intentar autenticación por API Key primero (chatbot)
        const apiKey = req.header('X-API-Key');
        
        if (apiKey) {
            // Validar API Key
            if (apiKey === CHATBOT_API_KEY) {
                // API Key válida, marcar como chatbot y continuar
                req.isChatbot = true;
                return next();
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'API Key inválida.'
                });
            }
        }

        // 2. Si no hay API Key, intentar autenticación por JWT (frontend/dashboard)
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. Se requiere autenticación (API Key o JWT).'
            });
        }

        // Extraer token
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido.'
            });
        }

        // Verificar JWT
        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            // Verificar si es un token público (del chatbot)
            if (decoded.type === 'public') {
                console.log('[DEBUG flexibleAuth] Token público detectado');
                req.isPublic = true;
                req.publicToken = {
                    permissions: decoded.permissions,
                    source: decoded.source
                };
                return next();
            }

            // Si no es público, buscar usuario en BD (flujo normal)
            const user = await User.findById(decoded.userId);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado.'
                });
            }

            if (!user.activo) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario desactivado.'
                });
            }

            // Agregar usuario al request
            req.user = {
                userId: user._id,
                username: user.username,
                rol: user.rol,
                permisos: user.permisos
            };

            req.isAuthenticated = true;
            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado. Por favor, inicia sesión nuevamente.'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Token inválido.'
            });
        }
    } catch (error) {
        console.error('Error en flexibleAuth middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al validar autenticación.'
        });
    }
};

module.exports = { flexibleAuth };
