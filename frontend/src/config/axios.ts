import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://micitamedica.me/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor de peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`[DEBUG] Enviando petición ${config.method?.toUpperCase()} a ${config.url}`, {
            data: config.data,
            headers: config.headers
        });
        return config;
    },
    (error) => {
        console.error('[DEBUG] Error en la petición:', error);
        return Promise.reject(error);
    }
);

// Interceptor de respuestas
axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`[DEBUG] Respuesta recibida de ${response.config.url}:`, {
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            console.error('[DEBUG] Error de respuesta:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;