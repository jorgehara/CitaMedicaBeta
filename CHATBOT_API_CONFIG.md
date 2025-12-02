# Configuración Recomendada para Chatbot - API Calls

## Problema Identificado
El chatbot está experimentando timeouts de 3000ms al intentar conectarse al backend en `https://micitamedica.me/api`

## Soluciones Implementadas

### 1. **Configuración de Axios para el Chatbot**

Si el chatbot usa axios, debe configurarse así:

```javascript
const axios = require('axios');

// Crear instancia de axios con configuración optimizada
const apiClient = axios.create({
    baseURL: 'https://micitamedica.me/api',
    timeout: 30000, // 30 segundos en lugar de 3 segundos
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    // Configuración adicional para mejorar la conexión
    validateStatus: (status) => status >= 200 && status < 500,
    maxRedirects: 5,
});

// Función de delay para retry
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para determinar si el error es recuperable
const isRetryableError = (error) => {
    if (!error.response) {
        // Errores de red (ECONNABORTED, ETIMEDOUT, ENOTFOUND, etc.)
        return true;
    }

    const status = error.response.status;
    // Retry en errores 5xx del servidor y algunos 4xx específicos
    return status >= 500 || status === 408 || status === 429;
};

// Interceptor de respuestas con retry logic
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        if (!config) {
            return Promise.reject(error);
        }

        // Inicializar contadores de retry
        config._retry = config._retry ?? 0;
        config._retryDelay = config._retryDelay ?? 1000;

        const maxRetries = 3;
        const shouldRetry = isRetryableError(error) && config._retry < maxRetries;

        if (shouldRetry) {
            config._retry += 1;

            console.warn(`[RETRY] Intento ${config._retry}/${maxRetries} para ${config.method.toUpperCase()} ${config.url}`);
            console.warn(`[RETRY] Razón: ${error.code || error.message}`);

            // Esperar antes de reintentar (exponential backoff)
            await delay(config._retryDelay);
            config._retryDelay *= 2; // Duplicar el delay para el siguiente intento

            // Reintentar la petición
            return apiClient(config);
        }

        // Si llegamos aquí, ya no hay más reintentos o el error no es recuperable
        if (error.response) {
            console.error('[API ERROR] Error de respuesta:', {
                status: error.response.status,
                data: error.response.data,
                url: config.url
            });
        } else if (error.request) {
            console.error('[API ERROR] No se recibió respuesta del servidor:', {
                url: config.url,
                code: error.code,
                message: error.message
            });
        } else {
            console.error('[API ERROR] Error al configurar la petición:', error.message);
        }

        return Promise.reject(error);
    }
);

module.exports = apiClient;
```

### 2. **Configuración para node-fetch (si se usa en lugar de axios)**

```javascript
const fetch = require('node-fetch');

const API_BASE_URL = 'https://micitamedica.me/api';
const DEFAULT_TIMEOUT = 30000; // 30 segundos

// Función helper para fetch con timeout
async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Función con retry logic
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[API] Intento ${attempt}/${maxRetries}: ${options.method || 'GET'} ${url}`);

            const response = await fetchWithTimeout(url, options);

            // Si la respuesta es exitosa o es un error del cliente (4xx), no reintentar
            if (response.ok || (response.status >= 400 && response.status < 500)) {
                return response;
            }

            // Si es un error del servidor (5xx), reintentar
            console.warn(`[API] Error ${response.status}, reintentando...`);
            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);

        } catch (error) {
            console.warn(`[API] Intento ${attempt} falló:`, error.message);
            lastError = error;

            // Si no es el último intento, esperar antes de reintentar
            if (attempt < maxRetries) {
                const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                console.log(`[API] Esperando ${delayMs}ms antes del siguiente intento...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }

    throw lastError;
}

// Ejemplo de uso
async function getReservedAppointments(date) {
    try {
        const response = await fetchWithRetry(
            `${API_BASE_URL}/appointments/reserved/${date}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[API] Error final al obtener citas reservadas:', error);
        throw error;
    }
}

module.exports = {
    fetchWithRetry,
    fetchWithTimeout,
    getReservedAppointments
};
```

### 3. **Variables de Entorno Recomendadas para el Chatbot**

Agregar al archivo `.env` del chatbot:

```env
# API Configuration
API_BASE_URL=https://micitamedica.me/api
API_TIMEOUT=30000
API_MAX_RETRIES=3
API_RETRY_DELAY=1000

# En caso de modo offline/fallback
OFFLINE_MODE=false
ENABLE_API_CACHE=true
CACHE_TTL=60000
```

### 4. **Modo Offline/Fallback**

Si el backend no responde después de todos los reintentos, implementar modo fallback:

```javascript
let isOfflineMode = false;
let lastOnlineCheck = Date.now();
const OFFLINE_CHECK_INTERVAL = 60000; // 1 minuto

async function callAPI(endpoint, options = {}) {
    // Verificar si estamos en modo offline
    if (isOfflineMode && Date.now() - lastOnlineCheck < OFFLINE_CHECK_INTERVAL) {
        console.warn('[API] Sistema en modo offline');
        throw new Error('Sistema temporalmente no disponible. Por favor, intenta más tarde.');
    }

    try {
        const response = await fetchWithRetry(endpoint, options);

        // Si la llamada fue exitosa, salir del modo offline
        if (isOfflineMode) {
            console.log('[API] Conexión restaurada, saliendo de modo offline');
            isOfflineMode = false;
        }

        return response;
    } catch (error) {
        // Si falla después de todos los reintentos, entrar en modo offline
        if (!isOfflineMode) {
            console.error('[API] Entrando en modo offline debido a múltiples fallos');
            isOfflineMode = true;
            lastOnlineCheck = Date.now();
        }

        throw error;
    }
}
```

## Cambios en el Backend (YA IMPLEMENTADOS)

### 1. Timeout aumentado a 30 segundos
### 2. Retry logic automático con exponential backoff
### 3. CORS mejorado para incluir puerto 3008 (chatbot)
### 4. Mejor logging de errores

## Verificaciones en Producción

### 1. Verificar que el backend esté levantado:
```bash
curl https://micitamedica.me/api/health
```

Debe responder:
```json
{
  "status": "OK",
  "timestamp": "2025-12-02T...",
  "service": "appointment-backend",
  "version": "1.0.0",
  "uptime": 123.45
}
```

### 2. Verificar conectividad desde el servidor del chatbot:
```bash
# Desde el servidor donde corre el chatbot
curl -v https://micitamedica.me/api/health
```

### 3. Verificar que no haya firewall bloqueando:
```bash
# Verificar que el puerto 3001 del backend esté abierto
sudo netstat -tulpn | grep 3001

# Verificar reglas de firewall
sudo ufw status
```

### 4. Verificar logs del backend:
```bash
pm2 logs backend --lines 100
```

### 5. Verificar logs del chatbot:
```bash
pm2 logs restart-server --lines 100
```

## Problemas Comunes y Soluciones

### Problema: "timeout of 3000ms exceeded"
**Solución**: Aumentar timeout a 30000ms en la configuración del chatbot

### Problema: "ECONNABORTED"
**Solución**: Implementar retry logic con exponential backoff

### Problema: "ECONNREFUSED"
**Solución**: Verificar que el backend esté corriendo y el puerto correcto

### Problema: CORS errors
**Solución**: Agregar el origen del chatbot a CORS_ORIGINS en .env del backend

### Problema: "sudo: a terminal is required"
**Solución**: Esto parece ser un problema con el script de restart. Revisar el comando en PM2

## Comandos PM2 Útiles

```bash
# Reiniciar backend
pm2 restart backend

# Reiniciar chatbot
pm2 restart restart-server

# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs

# Limpiar logs
pm2 flush

# Guardar configuración actual
pm2 save
```

## Testing después de los cambios

1. Reconstruir el frontend:
```bash
cd frontend
npm run build
```

2. Reiniciar backend:
```bash
cd backend
pm2 restart backend
# O si no usa PM2
npm run start
```

3. Probar endpoint de salud:
```bash
curl https://micitamedica.me/api/health
```

4. Probar desde el chatbot una llamada simple y verificar logs
