const rateLimit = require('express-rate-limit');

/**
 * Rate limiter para endpoints públicos
 * Protege contra abuso mientras permite acceso legítimo
 */

// Rate limiter para consultar horarios disponibles
// Permite 30 requests por IP cada 15 minutos
const availableTimesLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // Límite de 30 requests por ventana
    message: {
        success: false,
        message: 'Demasiadas solicitudes desde esta IP. Por favor, intenta nuevamente en 15 minutos.'
    },
    standardHeaders: true, // Retorna info de rate limit en headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
    // Permitir bypass para IPs confiables (opcional)
    skip: (req) => {
        // Aquí puedes agregar IPs de confianza si es necesario
        // const trustedIPs = ['127.0.0.1', '::1'];
        // return trustedIPs.includes(req.ip);
        return false;
    }
});

// Rate limiter para crear citas
// Más restrictivo: 5 citas por IP cada hora
const createAppointmentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // Límite de 5 citas por hora por IP
    message: {
        success: false,
        message: 'Has alcanzado el límite de citas por hora. Por favor, intenta nuevamente más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Mensaje personalizado cuando se excede el límite
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Has alcanzado el límite de citas que puedes agendar por hora. Si necesitas ayuda, por favor contacta al consultorio directamente.'
        });
    }
});

module.exports = {
    availableTimesLimiter,
    createAppointmentLimiter
};
