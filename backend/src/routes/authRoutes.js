const express = require('express');
const { check } = require('express-validator');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  loginUser,
  registerUser,
  getUserProfile,
} = require('../controllers/authController');

const router = express.Router();

// Validaciones
const loginValidation = [
  check('email', 'Por favor incluya un email válido').isEmail(),
  check('password', 'La contraseña es requerida').exists(),
];

const registerValidation = [
  check('email', 'Por favor incluya un email válido').isEmail(),
  check('password', 'Por favor ingrese una contraseña con 6 o más caracteres').isLength({ min: 6 }),
];

// Rutas
router.post('/login', loginValidation, loginUser);
router.post('/register', protect, admin, registerValidation, registerUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
