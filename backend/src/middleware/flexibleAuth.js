/**
 * Middleware de autenticación flexible
 * Acepta tanto API Key (chatbot) como JWT (frontend/dashboard)
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'cita-medica-secret-key-2024-change-in-production';

/**
 * Middleware que acepta autenticación por API Key O por JWT.
 * Requiere que tenantResolver haya corrido antes (para req.clinic).
 */
const flexibleAuth = async (req, res, next) => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[FLEXIBLE_AUTH] 🔍 Iniciando autenticación');
        console.log('[FLEXIBLE_AUTH] URL:', req.url);
        console.log('[FLEXIBLE_AUTH] Method:', req.method);
        console.log('[FLEXIBLE_AUTH] Headers:', JSON.stringify(req.headers, null, 2));
        
        // 1. Intentar autenticación por API Key primero (chatbot)
        const apiKey = req.header('X-API-Key');
        console.log('[FLEXIBLE_AUTH] X-API-Key header:', apiKey ? '***DEFINIDA***' : '(NO PRESENTE)');

        if (apiKey) {
            console.log('[FLEXIBLE_AUTH] → Autenticación por API Key detectada');
            // Validar contra la API Key de la clínica (multi-tenant) con fallback al env var
            const clinicKey = (req.clinic && req.clinic.chatbot && req.clinic.chatbot.apiKey)
                ? req.clinic.chatbot.apiKey
                : null;
            const envKey = process.env.CHATBOT_API_KEY;
            const validKey = clinicKey || envKey;
            
            console.log('[FLEXIBLE_AUTH] Clinic API Key:', clinicKey ? '***DEFINIDA***' : '(no configurada)');
            console.log('[FLEXIBLE_AUTH] Env API Key:', envKey ? '***DEFINIDA***' : '(no configurada)');
            console.log('[FLEXIBLE_AUTH] Key utilizada:', validKey ? '***DEFINIDA***' : '(NINGUNA)');
            console.log('[FLEXIBLE_AUTH] Comparación:', apiKey === validKey ? '✅ COINCIDE' : '❌ NO COINCIDE');

            if (validKey && apiKey === validKey) {
                console.log('[FLEXIBLE_AUTH] ✅ Autenticación por API Key EXITOSA');
                req.isChatbot = true;
                return next();
            } else {
                console.log('[FLEXIBLE_AUTH] ❌ API Key inválida');
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
                email: user.email,
                nombre: user.nombre,
                role: user.role,
                clinicId: user.clinicId
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
