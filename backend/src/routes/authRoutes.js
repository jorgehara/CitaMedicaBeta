const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');

// Rutas públicas (no requieren autenticación)

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', authController.loginValidation, authController.login);

// Rutas protegidas (requieren autenticación)

/**
 * GET /api/auth/verify
 * Verificar token válido
 */
router.get('/verify', auth, authController.verify);

/**
 * GET /api/auth/me
 * Obtener datos del usuario actual
 */
router.get('/me', auth, authController.getMe);

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', auth, authController.logout);

/**
 * PUT /api/auth/change-password
 * Cambiar contraseña
 */
router.put('/change-password', auth, authController.changePassword);

/**
 * POST /api/auth/register
 * Registrar nuevo usuario (solo admin)
 */
router.post(
    '/register',
    auth,
    adminOnly,
    authController.registerValidation,
    authController.register
);

module.exports = router;
