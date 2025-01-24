import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],  // Agrega el plugin de React para habilitar JSX y optimizaciones
  server: {
    port: 5173,  // Especifica el puerto del servidor de desarrollo
    open: true,  // Abre automáticamente el navegador al iniciar
    proxy: {
      '/auth': {
        target: 'http://localhost:3000',  // Backend URL
        changeOrigin: true,  // Cambia el origen de la solicitud para coincidir con el backend
        secure: false,  // Deshabilita la verificación SSL si el backend no tiene HTTPS
        rewrite: (path) => path.replace(/^\/auth/, ''),  // Elimina '/auth' del path antes de enviarlo al backend
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',  // Alias para facilitar importaciones en el código
    },
  },
  build: {
    outDir: 'dist',  // Define la carpeta de salida para la versión de producción
    sourcemap: true,  // Habilita sourcemaps para depuración más sencilla
  },
  base: '/',  // Define la ruta base de la aplicación (útil para despliegues)
});
