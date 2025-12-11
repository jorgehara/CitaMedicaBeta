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
        console.log('[DEBUG publicTokenAuth] Headers recibidos:', {
            authorization: authHeader,
            allHeaders: req.headers
        });
        console.log('[DEBUG publicTokenAuth] Query params:', req.query);

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.replace('Bearer ', '');
            console.log('[DEBUG publicTokenAuth] Token extraído del header');
        } else if (req.query.token) {
            token = req.query.token;
            console.log('[DEBUG publicTokenAuth] Token extraído de query param');
        }

        if (!token) {
            console.log('[DEBUG publicTokenAuth] NO SE ENCONTRÓ TOKEN');
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        console.log('[DEBUG publicTokenAuth] Token encontrado, verificando...');
        console.log('[DEBUG publicTokenAuth] JWT_SECRET configurado:', JWT_SECRET ? 'SI (longitud: ' + JWT_SECRET.length + ')' : 'NO');

        // Verificar token
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('[DEBUG publicTokenAuth] Token verificado exitosamente:', decoded);

            // Validar que sea un token público
            if (decoded.type !== 'public') {
                console.log('[DEBUG publicTokenAuth] Token NO es público, rechazando');
                return res.status(403).json({
                    success: false,
                    message: 'Token inválido para esta operación'
                });
            }

            console.log('[DEBUG publicTokenAuth] Token público válido, agregando al request');
            // Agregar información del token al request
            req.publicToken = {
                permissions: decoded.permissions,
                source: decoded.source
            };

            console.log('[DEBUG publicTokenAuth] Llamando next()');
            next();
        } catch (jwtError) {
            console.error('[DEBUG publicTokenAuth] Error al verificar token:', jwtError);
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado. Por favor, solicita un nuevo enlace.'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                error: jwtError.message
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
