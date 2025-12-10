const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cita-medica-secret-key-2024-change-in-production';

/**
 * Genera un token temporal para acceso público a la página de reserva
 * Este token permite acceder a endpoints específicos sin autenticación completa
 */
exports.generatePublicToken = async (req, res) => {
    try {
        // Validar API Key del chatbot
        const apiKey = req.header('X-API-Key');
        const CHATBOT_API_KEY = process.env.CHATBOT_API_KEY || 'chatbot-api-key-2024-change-in-production';

        if (apiKey !== CHATBOT_API_KEY) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para generar tokens públicos'
            });
        }

        // Generar token temporal con permisos limitados
        const publicToken = jwt.sign(
            {
                type: 'public',
                permissions: ['view_available_times', 'create_appointment'],
                source: 'chatbot'
            },
            JWT_SECRET,
            { expiresIn: '7h' } // Válido por 7 horas
        );

        res.json({
            success: true,
            data: {
                token: publicToken,
                expiresIn: '7h',
                expiresAt: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString()
            }
        });
    } catch (error) {
        console.error('[ERROR] Error al generar token público:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar token de acceso'
        });
    }
};
