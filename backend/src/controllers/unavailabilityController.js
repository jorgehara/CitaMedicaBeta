const Unavailability = require('../models/unavailability');

// GET /api/unavailability?date=YYYY-MM-DD
// Accesible con API Key (chatbot) o JWT (frontend)
exports.getAll = async (req, res) => {
    try {
        const { date } = req.query;
        const filter = date ? { date } : {};
        const blocks = await Unavailability.find(filter).sort({ date: 1 });
        res.json({ success: true, data: blocks });
    } catch (error) {
        console.error('[UNAVAILABILITY] Error al obtener bloqueos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener bloqueos' });
    }
};

// POST /api/unavailability
// Body: { date: 'YYYY-MM-DD', period: 'morning'|'afternoon'|'full' }
exports.create = async (req, res) => {
    try {
        const { date, period } = req.body;

        if (!date || !period) {
            return res.status(400).json({ success: false, message: 'Faltan datos: date y period son requeridos' });
        }

        // Evitar duplicados para la misma fecha y período
        const existing = await Unavailability.findOne({ date, period });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Ya existe un bloqueo para esa fecha y período' });
        }

        const block = new Unavailability({ date, period });
        await block.save();

        console.log(`[UNAVAILABILITY] Bloqueo creado: ${date} - ${period}`);
        res.status(201).json({ success: true, data: block });
    } catch (error) {
        console.error('[UNAVAILABILITY] Error al crear bloqueo:', error);
        res.status(500).json({ success: false, message: 'Error al crear bloqueo' });
    }
};

// DELETE /api/unavailability/:id
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        const block = await Unavailability.findByIdAndDelete(id);

        if (!block) {
            return res.status(404).json({ success: false, message: 'Bloqueo no encontrado' });
        }

        console.log(`[UNAVAILABILITY] Bloqueo eliminado: ${block.date} - ${block.period}`);
        res.json({ success: true, message: 'Bloqueo eliminado correctamente' });
    } catch (error) {
        console.error('[UNAVAILABILITY] Error al eliminar bloqueo:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar bloqueo' });
    }
};
