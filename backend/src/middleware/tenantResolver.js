const Clinic = require('../models/clinic');

// Cache en memoria: { subdomain -> { clinic, ts } }
const clinicCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function getClinicBySubdomain(subdomain) {
    const cacheKey = subdomain || 'root';
    const cached = clinicCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.clinic;

    const query = subdomain ? { subdomain, active: true } : { subdomain: null, active: true };
    const clinic = await Clinic.findOne(query);
    if (clinic) clinicCache.set(cacheKey, { clinic, ts: Date.now() });
    return clinic;
}

/**
 * Resuelve el tenant a partir del subdominio del header Host.
 * Agrega req.clinic y req.clinicId a todas las requests /api/*.
 *
 * micitamedica.me                    → subdomain null  → Tenant #1 (Dr. Kulinka)
 * od-melinavillalba.micitamedica.me  → subdomain "od-melinavillalba" → Tenant #2
 * localhost:5173 / localhost:3001    → subdomain null  → Tenant #1 (dev)
 */
module.exports = async function tenantResolver(req, res, next) {
    try {
        const host = (req.headers.host || '').split(':')[0]; // quitar puerto si existe
        const parts = host.split('.');

        // SOPORTE PARA DESARROLLO: permitir forzar tenant via header X-Tenant-Subdomain
        // Esto es útil cuando el browser no manda el subdominio en el Host (localhost)
        let subdomain = req.headers['x-tenant-subdomain'] || null;
        
        if (!subdomain) {
            // Detectar subdominio: manejar *.localhost y dominios normales
            if (host === 'localhost' || host === '127.0.0.1') {
                // localhost puro -> clínica por defecto (dr-kulinka con subdomain: null)
                subdomain = null;
            } else if (parts[parts.length - 2] === 'localhost' || parts[parts.length - 1] === 'localhost') {
                // *.localhost:5173 -> extraer subdominio (od-melinavillalba.localhost)
                if (parts.length >= 2 && parts[0] !== 'www') {
                    subdomain = parts[0];
                }
            } else if (parts.length >= 3 && parts[0] !== 'www') {
                // Dominio normal: *.micitamedica.me
                subdomain = parts[0];
            }
        }

        console.log(`[TENANT] Host: ${host} -> Subdomain: ${subdomain} (header: ${req.headers['x-tenant-subdomain'] || 'none'})`);

        const clinic = await getClinicBySubdomain(subdomain);

        if (!clinic) {
            return res.status(404).json({ success: false, message: 'Clínica no encontrada' });
        }

        req.clinic = clinic;
        req.clinicId = clinic._id;
        next();
    } catch (err) {
        console.error('[TENANT] Error en tenantResolver:', err.message);
        next(err);
    }
};
