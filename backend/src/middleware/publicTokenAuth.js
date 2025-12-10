/**
 * Middleware para validar tokens públicos temporales
 * Permite acceso a endpoints específicos con tokens generados por el chatbot
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cita-medica-secret-key-2024-change-in-production';

const publicTokenAuth = async (req, res, next) => {
    try {
        // Obtener token del header Authorization o del query parameter
        let token = null;

        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.replace('Bearer ', '');
        } else if (req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        // Verificar token
        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            // Validar que sea un token público
            if (decoded.type !== 'public') {
                return res.status(403).json({
                    success: false,
                    message: 'Token inválido para esta operación'
                });
            }

            // Agregar información del token al request
            req.publicToken = {
                permissions: decoded.permissions,
                source: decoded.source
            };

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado. Por favor, solicita un nuevo enlace.'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
    } catch (error) {
        console.error('[ERROR] Error en publicTokenAuth middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al validar token de acceso'
        });
    }
};

module.exports = { publicTokenAuth };
