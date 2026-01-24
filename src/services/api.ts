import axios from 'axios';

// Obtener URL base del backend desde variables de entorno
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Crear instancia de axios configurada
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests (agregar auth headers si es necesario)
api.interceptors.request.use(
  (config) => {
    // Aquí se puede agregar el token de autenticación si es necesario
    // const token = sessionStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses (manejo de errores centralizado)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo de errores centralizado
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de red:', error.request);
    } else {
      // Algo pasó al configurar la petición
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
