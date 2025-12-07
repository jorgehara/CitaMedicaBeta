const User = require('../models/user');
const { generateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * Validaciones para registro
 */
exports.registerValidation = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role')
        .optional()
        .isIn(['admin', 'operador', 'auditor']).withMessage('Rol inválido')
];

/**
 * Validaciones para login
 */
exports.loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
];

/**
 * POST /api/auth/register
 * Registrar nuevo usuario (solo admin puede registrar)
 */
exports.register = async (req, res) => {
    try {
        // Validar datos de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }

        const { nombre, email, password, role } = req.body;

        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Crear nuevo usuario
        const user = new User({
            nombre,
            email,
            password, // Se hasheará automáticamente en el pre-save hook
            role: role || 'operador'
        });

        await user.save();

        // Generar token
        const token = generateToken({
            userId: user._id,
            email: user.email,
            role: user.role
        });

        console.log(`[AUTH] Usuario registrado: ${email} con rol ${user.role}`);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user: {
                    _id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    role: user.role,
                    activo: user.activo
                },
                token
            }
        });
    } catch (error) {
        console.error('[AUTH ERROR] Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
exports.login = async (req, res) => {
    try {
        // Validar datos de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Buscar usuario por email (incluir password explícitamente)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar si el usuario está activo
        if (!user.activo) {
            return res.status(403).json({
                success: false,
                message: 'Usuario desactivado. Contacte al administrador.'
            });
        }

        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Actualizar último login
        user.lastLogin = new Date();
        await user.save();

        // Generar token
        const token = generateToken({
            userId: user._id,
            email: user.email,
            role: user.role
        });

        console.log(`[AUTH] Login exitoso: ${email} (${user.role})`);

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: {
                    _id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    role: user.role,
                    activo: user.activo,
                    lastLogin: user.lastLogin
                },
                token
            }
        });
    } catch (error) {
        console.error('[AUTH ERROR] Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

/**
 * GET /api/auth/verify
 * Verificar token válido
 */
exports.verify = async (req, res) => {
    try {
        // El middleware auth ya verificó el token y agregó req.user
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Token válido',
            data: {
                user: {
                    _id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    role: user.role,
                    activo: user.activo,
                    lastLogin: user.lastLogin
                }
            }
        });
    } catch (error) {
        console.error('[AUTH ERROR] Error en verificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar token',
            error: error.message
        });
    }
};

/**
 * GET /api/auth/me
 * Obtener datos del usuario actual
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    role: user.role,
                    activo: user.activo,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error('[AUTH ERROR] Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener datos del usuario',
            error: error.message
        });
    }
};

/**
 * POST /api/auth/logout
 * Cerrar sesión (cliente debe eliminar token)
 */
exports.logout = async (req, res) => {
    try {
        // El logout es principalmente del lado del cliente
        // Aquí podríamos invalidar el token si usamos blacklist
        console.log(`[AUTH] Logout: ${req.user.email}`);

        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        console.error('[AUTH ERROR] Error en logout:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cerrar sesión',
            error: error.message
        });
    }
};

/**
 * PUT /api/auth/change-password
 * Cambiar contraseña
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere contraseña actual y nueva'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        // Buscar usuario con password
        const user = await User.findById(req.user.userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const isPasswordValid = await user.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        // Actualizar contraseña
        user.password = newPassword; // Se hasheará en el pre-save hook
        await user.save();

        console.log(`[AUTH] Contraseña cambiada: ${user.email}`);

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('[AUTH ERROR] Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña',
            error: error.message
        });
    }
};
