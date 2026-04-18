import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'auth_token';
const PUBLIC_TOKEN_KEY = 'public_token';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `${window.location.origin}/api`,
    timeout: 30000, // 30 segundos de timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    // Configuración adicional para mejorar la conexión
    validateStatus: (status) => status >= 200 && status < 500,
    maxRedirects: 5,
});

// Función de delay para retry
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función para determinar si el error es recuperable
const isRetryableError = (error: AxiosError): boolean => {
    if (!error.response) {
        // Errores de red (ECONNABORTED, ETIMEDOUT, ENOTFOUND, etc.)
        return true;
    }

    const status = error.response.status;
    // Retry en errores 5xx del servidor y algunos 4xx específicos
    return status >= 500 || status === 408 || status === 429;
};

// Configuración de retry
interface RetryConfig extends InternalAxiosRequestConfig {
    _retry?: number;
    _retryDelay?: number;
}

// Clave para guardar el tenant seleccionado en localStorage
const TENANT_SUBDOMAIN_KEY = 'tenant_subdomain';

// Función para obtener el subdominio del tenant desde la URL o localStorage
function getTenantSubdomain(): string | null {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Si es localhost o 127.0.0.1, usar localStorage si está seteado
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return localStorage.getItem(TENANT_SUBDOMAIN_KEY);
    }
    
    // Si tiene formato *.localhost (desarrollo con subdominio)
    if (parts[parts.length - 1] === 'localhost') {
        const subdomain = parts.length >= 2 ? parts[0] : null;
        // Guardar en localStorage para persistir
        if (subdomain) {
            localStorage.setItem(TENANT_SUBDOMAIN_KEY, subdomain);
        }
        return subdomain;
    }
    
    // Dominio normal: *.micitamedica.me
    if (parts.length >= 3) {
        const subdomain = parts[0];
        localStorage.setItem(TENANT_SUBDOMAIN_KEY, subdomain);
        return subdomain;
    }
    
    return localStorage.getItem(TENANT_SUBDOMAIN_KEY);
}

// Exportar función para que otros componentes puedan setear el tenant
export const setTenantSubdomain = (subdomain: string | null) => {
    if (subdomain) {
        localStorage.setItem(TENANT_SUBDOMAIN_KEY, subdomain);
    } else {
        localStorage.removeItem(TENANT_SUBDOMAIN_KEY);
    }
};

// Interceptor de peticiones - Agregar JWT token o token público
axiosInstance.interceptors.request.use(
    (config) => {
        // Obtener token de usuario autenticado
        const userToken = localStorage.getItem(TOKEN_KEY);

        // Obtener token público temporal
        const publicToken = localStorage.getItem(PUBLIC_TOKEN_KEY);

        // Priorizar token de usuario, luego token público
        if (userToken) {
            config.headers.Authorization = `Bearer ${userToken}`;
        } else if (publicToken) {
            config.headers.Authorization = `Bearer ${publicToken}`;
        }

        // Agregar header de subdominio para multi-tenant
        const subdomain = getTenantSubdomain();
        if (subdomain) {
            config.headers['X-Tenant-Subdomain'] = subdomain;
        }

        // Solo mostrar logs en desarrollo
        if (import.meta.env.DEV) {
if (import.meta.env.DEV) {
            console.log(`[DEBUG] Enviando petición ${config.method?.toUpperCase()} a ${config.url}`, {
              hasUserToken: !!userToken,
              hasPublicToken: !!publicToken,
              tenantSubdomain: subdomain
            });
          }
        }

        return config;
    },
    (error) => {
        if (import.meta.env.DEV) console.error('[DEBUG] Error en la petición:', error);
        return Promise.reject(error);
    }
);

// Interceptor de respuestas con retry logic
axiosInstance.interceptors.response.use(
    (response) => {
        // console.log(`[DEBUG] Respuesta recibida de ${response.config.url}:`, {
        //     status: response.status,
        //     data: response.data
        // });
        return response;
    },
    async (error: AxiosError) => {
        const config = error.config as RetryConfig;

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

            if (import.meta.env.DEV) console.warn(`[RETRY] Intento ${config._retry}/${maxRetries} para ${config.method?.toUpperCase()} ${config.url}`);
            if (import.meta.env.DEV) console.warn(`[RETRY] Razón: ${error.code || error.message}`);

            // Esperar antes de reintentar (exponential backoff)
            await delay(config._retryDelay);
            config._retryDelay *= 2; // Duplicar el delay para el siguiente intento

            // Reintentar la petición
            return axiosInstance(config);
        }

        // Si llegamos aquí, ya no hay más reintentos o el error no es recuperable

        // Manejar errores de autenticación
        if (error.response) {
            const status = error.response.status;

            // 401 Unauthorized - Token inválido o expirado
            if (status === 401) {
                const errorMessage = (error.response.data as any)?.message || '';
                const isTokenExpired = errorMessage.includes('expirado') || errorMessage.includes('expired');

                // Verificar si es un token público expirado
                const publicToken = localStorage.getItem(PUBLIC_TOKEN_KEY);
                if (publicToken && isTokenExpired) {
                    if (import.meta.env.DEV) console.warn('[AUTH] Token público expirado');
                    localStorage.removeItem(PUBLIC_TOKEN_KEY);
                    alert('Tu enlace de reserva ha expirado (7 horas). Por favor, solicita uno nuevo al chatbot de WhatsApp.');
                    return Promise.reject(error);
                }

                // Token de usuario expirado
                if (import.meta.env.DEV) console.warn('[AUTH] Token de usuario inválido o expirado');
                localStorage.removeItem(TOKEN_KEY);

                // Mostrar mensaje al usuario si el token expiró
                if (isTokenExpired && window.location.pathname !== '/login') {
                    alert('Tu sesión ha expirado después de 3 días de inactividad. Por favor, inicia sesión nuevamente.');
                }

                // Redirigir a login (solo si no estamos ya en login o en páginas públicas)
                const publicPages = ['/login', '/register', '/reservar-turno', '/agendar-turno', '/book-appointment'];
                if (!publicPages.includes(window.location.pathname)) {
                    window.location.href = '/login';
                }
            }

            // 403 Forbidden - Sin permisos
            if (status === 403) {
                if (import.meta.env.DEV) console.warn('[AUTH] Sin permisos para esta acción');
            }

            if (import.meta.env.DEV) console.error('[API ERROR] Error de respuesta:', {
                    status: error.response.status,
                    data: error.response.data,
                    url: config.url
                });
        } else if (error.request) {
            if (import.meta.env.DEV) {
                console.error('[API ERROR] No se recibió respuesta del servidor:', {
                    url: config.url,
                    code: error.code,
                    message: error.message
                });
            }
        } else {
            if (import.meta.env.DEV) console.error('[API ERROR] Error al configurar la petición:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;