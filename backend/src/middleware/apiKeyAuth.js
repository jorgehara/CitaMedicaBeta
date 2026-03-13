/**
 * Middleware de autenticación por API Key
 * Valida que las peticiones del chatbot incluyan un API Key válido
 * en el header X-API-Key
 */

/**
 * Middleware para validar API Key del chatbot.
 * Valida contra la API Key configurada en la clínica (req.clinic),
 * con fallback al env var para compatibilidad en desarrollo.
 * Requiere que tenantResolver haya corrido antes.
 */
const apiKeyAuth = (req, res, next) => {
    try {
        const apiKey = req.header('X-API-Key');

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. Se requiere API Key.'
            });
        }

        // API Key de la clínica (multi-tenant) con fallback al env var
        const validKey = (req.clinic && req.clinic.chatbot && req.clinic.chatbot.apiKey)
            ? req.clinic.chatbot.apiKey
            : process.env.CHATBOT_API_KEY;

        if (!validKey || apiKey !== validKey) {
            return res.status(403).json({
                success: false,
                message: 'API Key inválida.'
            });
        }

        req.isChatbot = true;
        next();
    } catch (error) {
        console.error('Error en apiKeyAuth middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al validar API Key.'
        });
    }
};

module.exports = { apiKeyAuth };
