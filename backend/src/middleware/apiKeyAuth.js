/**
 * Middleware de autenticación por API Key
 * Valida que las peticiones del chatbot incluyan un API Key válido
 * en el header X-API-Key
 */

const CHATBOT_API_KEY = process.env.CHATBOT_API_KEY || 'chatbot-api-key-2024-change-in-production';

/**
 * Middleware para validar API Key del chatbot
 * Permite acceso a rutas públicas sin necesidad de JWT
 */
const apiKeyAuth = (req, res, next) => {
    try {
        // Obtener API Key del header
        const apiKey = req.header('X-API-Key');

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. Se requiere API Key.'
            });
        }

        // Validar API Key
        if (apiKey !== CHATBOT_API_KEY) {
            return res.status(403).json({
                success: false,
                message: 'API Key inválida.'
            });
        }

        // API Key válida, continuar
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
