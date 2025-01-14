import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/auth': 'http://localhost:3000', // Asegúrate de que el puerto coincida con el del backend
    },
  },
});
