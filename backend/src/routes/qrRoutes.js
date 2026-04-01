const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');
const fs = require('fs');

// ---- Chatbot Dr. Kulinka (sistema existente — no tocar) ----
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

// ---- Chatbot Od. Melina Villalba (sirve bot.qr.png directo del disco) ----
const QR_PATH_ODONTOLOGIA = process.env.QR_PATH_ODONTOLOGIA || '/root/AnitaChatBot-Odontologia/bot.qr.png';

router.get('/qr/odontologia', (req, res) => {
    try {
        if (!fs.existsSync(QR_PATH_ODONTOLOGIA)) {
            return res.status(404).json({ error: 'QR no disponible. El chatbot puede no estar corriendo.' });
        }

        const stats = fs.statSync(QR_PATH_ODONTOLOGIA);
        const fileAgeMs = Date.now() - stats.mtimeMs;
        if (fileAgeMs > 2 * 60 * 1000) {
            console.log(`[QR] QR de Odontología tiene ${Math.floor(fileAgeMs / 1000)}s — puede estar vencido`);
        }

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(QR_PATH_ODONTOLOGIA);
    } catch (error) {
        console.error('[QR ERROR - Odontologia]:', error);
        res.status(500).json({ error: 'Error al cargar QR' });
    }
});

module.exports = router;