const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');

/**
 * Ruta para generar tokens públicos temporales
 * Solo accesible con API Key del chatbot
 */
router.post('/generate-public-token', tokenController.generatePublicToken);

module.exports = router;
