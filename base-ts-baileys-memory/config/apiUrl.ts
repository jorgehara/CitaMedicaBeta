// Puedes poner esto en un archivo separado, o directo en tu bot

function getApiUrl() {
  // Usa variable de entorno si está definida
  if (process.env.API_URL) {
    return process.env.API_URL;
  }

  // Si estás en desarrollo local (NODE_ENV=development o sin definir)
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api';
  }

  // Si estás en producción (ej: Docker Compose)
  return 'http://backend:3001/api';
}

export const API_URL = getApiUrl();