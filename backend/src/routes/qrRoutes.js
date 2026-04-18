const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');
const fs = require('fs');

// ── Dr. Kulinka: chatbot envía QR string → backend lo convierte a PNG ──────
let latestQR = null;

router.post('/qr', (req, res) => {
    const { qr } = req.body;
    if (!qr) {
        return res.status(400).json({ error: 'QR no proporcionado' });
    }
    latestQR = qr;
    res.json({ success: true });
});

router.get('/qr', async (req, res) => {
    try {
        if (!latestQR) {
            return res.status(404).json({ error: 'QR no disponible aún' });
        }
        const qrBuffer = await qrcode.toBuffer(latestQR);
        res.type('png');
        res.send(qrBuffer);
    } catch (error) {
        console.error('Error al generar QR:', error);
        res.status(500).json({ error: 'Error al generar QR' });
    }
});

// ── Od. Villalba: sirve bot.qr.png directo del disco ──────────────────────
const QR_PATH_ODONTOLOGIA = process.env.QR_PATH_ODONTOLOGIA || '/root/AnitaChatBot-Odontologia/bot.qr.png';

router.get('/qr/odontologia', (req, res) => {
    try {
        if (!fs.existsSync(QR_PATH_ODONTOLOGIA)) {
            return res.status(404).json({ error: 'QR no disponible. El chatbot puede no estar corriendo.' });
        }

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(QR_PATH_ODONTOLOGIA);
    } catch (error) {
        console.error('[QR ERROR - Odontologia]:', error);
        res.status(500).json({ error: 'Error al cargar QR' });
    }
});

// ── Dr. Jorge Hara: sirve bot.qr.png directo del disco ──────────────────────
const QR_PATH_DRJORGEHARA = process.env.QR_PATH_DRJORGEHARA || '/root/AnitaChatBot-DrJorgeHara/bot.qr.png';

router.get('/qr/drjorgehara', (req, res) => {
    try {
        if (!fs.existsSync(QR_PATH_DRJORGEHARA)) {
            return res.status(404).json({ error: 'QR no disponible. El chatbot puede no estar corriendo.' });
        }

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(QR_PATH_DRJORGEHARA);
    } catch (error) {
        console.error('[QR ERROR - Dr. Jorge Hara]:', error);
        res.status(500).json({ error: 'Error al cargar QR' });
    }
});

module.exports = router;