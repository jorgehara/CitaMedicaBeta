const Sobreturno = require('../models/sobreturno');
const googleCalendarService = require('../services/googleCalendarService');

// Actualizar estado de pago
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPaid } = req.body;

    console.log(`[DEBUG] Actualizando estado de pago para sobreturno ${id} a ${isPaid}`);

    const sobreturno = await Sobreturno.findById(id);
    if (!sobreturno) {
      return res.status(404).json({ error: 'Sobreturno no encontrado' });
    }

    sobreturno.isPaid = isPaid;
    await sobreturno.save();

    console.log(`[DEBUG] Estado de pago actualizado exitosamente`);
    res.json(sobreturno);
  } catch (error) {
    console.error('[ERROR] Error al actualizar estado de pago:', error);
    res.status(500).json({ error: 'Error al actualizar estado de pago' });
  }
};