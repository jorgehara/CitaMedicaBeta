/**
 * Middleware para validar tokens públicos temporales
 * Permite acceso a endpoints específicos con tokens generados por el chatbot
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cita-medica-secret-key-2024-change-in-production';

const publicTokenAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        console.log('[DEBUG publicTokenAuth] Headers recibidos:', {
            authorization: authHeader,
            allHeaders: req.headers
        });
        console.log('[DEBUG publicTokenAuth] Query params:', req.query);

        // Recolectar todos los tokens disponibles
        const availableTokens = [];

        // Token del query parameter
        if (req.query.token) {
            availableTokens.push({
                source: 'query',
                token: req.query.token
            });
        }

        // Token del header Authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
            availableTokens.push({
                source: 'header',
                token: authHeader.replace('Bearer ', '')
            });
        }

        if (availableTokens.length === 0) {
            console.log('[DEBUG publicTokenAuth] NO SE ENCONTRÓ NINGÚN TOKEN');
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        console.log(`[DEBUG publicTokenAuth] Se encontraron ${availableTokens.length} token(s), buscando token público...`);
        console.log('[DEBUG publicTokenAuth] JWT_SECRET configurado:', JWT_SECRET ? 'SI (longitud: ' + JWT_SECRET.length + ')' : 'NO');

        // Intentar verificar cada token hasta encontrar uno público válido
        let publicTokenFound = false;
        let lastError = null;

        for (const { source, token } of availableTokens) {
            try {
                console.log(`[DEBUG publicTokenAuth] Verificando token de ${source}...`);
                const decoded = jwt.verify(token, JWT_SECRET);
                console.log(`[DEBUG publicTokenAuth] Token de ${source} verificado:`, decoded);

                // Verificar si es un token público
                if (decoded.type === 'public') {
                    console.log(`[DEBUG publicTokenAuth] ✓ Token público encontrado en ${source}`);

                    // Agregar información del token al request
                    req.publicToken = {
                        permissions: decoded.permissions,
                        source: decoded.source
                    };

                    publicTokenFound = true;
                    console.log('[DEBUG publicTokenAuth] Llamando next()');
                    return next();
                } else {
                    console.log(`[DEBUG publicTokenAuth] Token de ${source} NO es público (type: ${decoded.type}), continuando búsqueda...`);
                }
            } catch (jwtError) {
                console.log(`[DEBUG publicTokenAuth] Error al verificar token de ${source}:`, jwtError.message);
                lastError = jwtError;
            }
        }

        // Si llegamos aquí, no se encontró ningún token público válido
        if (!publicTokenFound) {
            console.log('[DEBUG publicTokenAuth] NO se encontró ningún token público válido');

            if (lastError && lastError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado. Por favor, solicita un nuevo enlace.'
                });
            }

            return res.status(403).json({
                success: false,
                message: 'Se requiere un token público válido para acceder a este recurso'
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
