import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'auth_token';

const axiosInstance = axios.create({
    baseURL: 'https://micitamedica.me/api',
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

// Interceptor de peticiones - Agregar JWT token
axiosInstance.interceptors.request.use(
    (config) => {
        // Obtener token de localStorage
        const token = localStorage.getItem(TOKEN_KEY);

        // Agregar token al header Authorization si existe
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // console.log(`[DEBUG] Enviando petición ${config.method?.toUpperCase()} a ${config.url}`, {
        //     data: config.data,
        //     headers: config.headers,
        //     hasToken: !!token
        // });

        return config;
    },
    (error) => {
        // console.error('[DEBUG] Error en la petición:', error);
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

            console.warn(`[RETRY] Intento ${config._retry}/${maxRetries} para ${config.method?.toUpperCase()} ${config.url}`);
            console.warn(`[RETRY] Razón: ${error.code || error.message}`);

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
                console.warn('[AUTH] Token inválido o expirado. Redirigiendo a login...');
                // Limpiar token
                localStorage.removeItem(TOKEN_KEY);
                // Redirigir a login (solo si no estamos ya en login)
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }

            // 403 Forbidden - Sin permisos
            if (status === 403) {
                console.warn('[AUTH] Sin permisos para esta acción');
                // Aquí podrías mostrar un mensaje al usuario o redirigir a una página de "Sin permisos"
            }

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

export default axiosInstance;