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
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[TENANT] 🔍 Iniciando resolución de tenant');
        console.log('[TENANT] URL:', req.url);
        console.log('[TENANT] Method:', req.method);
        console.log('[TENANT] Headers completos:', JSON.stringify(req.headers, null, 2));
        
        const host = (req.headers.host || '').split(':')[0]; // quitar puerto si existe
        const parts = host.split('.');
        console.log('[TENANT] Host original:', req.headers.host);
        console.log('[TENANT] Host (sin puerto):', host);
        console.log('[TENANT] Parts:', parts);

        // SOPORTE PARA DESARROLLO: permitir forzar tenant via header X-Tenant-Subdomain
        // Esto es útil cuando el browser no manda el subdominio en el Host (localhost)
        let subdomain = req.headers['x-tenant-subdomain'] || null;
        console.log('[TENANT] X-Tenant-Subdomain header:', subdomain || '(no presente)');
        
        if (!subdomain) {
            // Detectar subdominio: manejar *.localhost y dominios normales
            if (host === 'localhost' || host === '127.0.0.1') {
                // localhost puro -> clínica por defecto (dr-kulinka con subdomain: null)
                subdomain = null;
                console.log('[TENANT] → Detectado localhost puro, subdomain = null');
            } else if (parts[parts.length - 2] === 'localhost' || parts[parts.length - 1] === 'localhost') {
                // *.localhost:5173 -> extraer subdominio (od-melinavillalba.localhost)
                if (parts.length >= 2 && parts[0] !== 'www') {
                    subdomain = parts[0];
                    console.log('[TENANT] → Detectado *.localhost, subdomain =', subdomain);
                }
            } else if (parts.length >= 3 && parts[0] !== 'www') {
                // Dominio normal: *.micitamedica.me
                subdomain = parts[0];
                console.log('[TENANT] → Detectado dominio normal, subdomain =', subdomain);
            }
        }

        console.log(`[TENANT] Host: ${host} -> Subdomain: ${subdomain} (header: ${req.headers['x-tenant-subdomain'] || 'none'})`);

        const clinic = await getClinicBySubdomain(subdomain);
        console.log('[TENANT] Clínica encontrada:', clinic ? clinic.name : '(NINGUNA)');

        if (!clinic) {
            console.log('[TENANT] ❌ Clínica no encontrada para subdomain:', subdomain);
            return res.status(404).json({ success: false, message: 'Clínica no encontrada' });
        }

        console.log('[TENANT] ✅ Clínica resuelta:', clinic.name);
        console.log('[TENANT] Clinic ID:', clinic._id);
        console.log('[TENANT] Clinic subdomain:', clinic.subdomain || '(null)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        req.clinic = clinic;
        req.clinicId = clinic._id;
        next();
    } catch (err) {
        console.error('[TENANT] ❌ Error en tenantResolver:', err.message);
        console.error('[TENANT] Stack:', err.stack);
        next(err);
    }
};
