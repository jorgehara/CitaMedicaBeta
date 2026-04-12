const Unavailability = require('../models/unavailability');

// GET /api/unavailability?date=YYYY-MM-DD
// Accesible con API Key (chatbot) o JWT (frontend)
exports.getAll = async (req, res) => {
    try {
        const { date } = req.query;

        // Fecha de hoy en Buenos Aires (YYYY-MM-DD) para filtrar bloqueos vencidos
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });

        const filter = date
            ? { date, clinicId: req.clinicId }
            : { clinicId: req.clinicId, date: { $gte: today } };

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

        // Evitar duplicados para la misma fecha, período y clínica
        const existing = await Unavailability.findOne({ date, period, clinicId: req.clinicId });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Ya existe un bloqueo para esa fecha y período' });
        }

        const block = new Unavailability({ date, period, clinicId: req.clinicId });
        await block.save();

        console.log(`[UNAVAILABILITY] Bloqueo creado: ${date} - ${period}`);
        res.status(201).json({ success: true, data: block });
    } catch (error) {
        console.error('[UNAVAILABILITY] Error al crear bloqueo:', error);
        res.status(500).json({ success: false, message: 'Error al crear bloqueo' });
    }
};

// POST /api/unavailability/bulk
// Body: { dates: ['YYYY-MM-DD', ...], period: 'morning'|'afternoon'|'full' }
exports.createBulk = async (req, res) => {
    try {
        const { dates, period } = req.body;

        if (!dates || !Array.isArray(dates) || dates.length === 0) {
            return res.status(400).json({ success: false, message: 'Debe proporcionar un array de fechas' });
        }

        if (!period) {
            return res.status(400).json({ success: false, message: 'El campo period es requerido' });
        }

        // Validar que no haya duplicados con bloqueos existentes
        const existingBlocks = await Unavailability.find({
            date: { $in: dates },
            period,
            clinicId: req.clinicId
        });

        // Filtrar fechas que NO tienen bloqueo previo
        const existingDates = existingBlocks.map(b => b.date);
        const newDates = dates.filter(d => !existingDates.includes(d));

        if (newDates.length === 0) {
            return res.status(409).json({
                success: false,
                message: 'Todas las fechas ya tienen bloqueos para ese período',
                skipped: existingDates
            });
        }

        // Crear bloqueos para las fechas nuevas
        const blocksToCreate = newDates.map(date => ({
            date,
            period,
            clinicId: req.clinicId
        }));

        const createdBlocks = await Unavailability.insertMany(blocksToCreate);

        console.log(`[UNAVAILABILITY] ${createdBlocks.length} bloqueos creados para el período ${period}`);

        res.status(201).json({
            success: true,
            message: `Se crearon ${createdBlocks.length} bloqueos`,
            data: createdBlocks,
            skipped: existingDates.length > 0 ? existingDates : undefined
        });
    } catch (error) {
        console.error('[UNAVAILABILITY] Error al crear bloqueos masivos:', error);
        res.status(500).json({ success: false, message: 'Error al crear bloqueos masivos' });
    }
};

// DELETE /api/unavailability/:id
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        const block = await Unavailability.findOneAndDelete({ _id: id, clinicId: req.clinicId });

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
