const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');


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

module.exports = router;