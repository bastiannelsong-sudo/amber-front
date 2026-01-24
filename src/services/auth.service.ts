const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export interface User {
  userId: string;
  nickname: string;
  email: string;
}

export const authService = {
  // Iniciar OAuth con Mercado Libre
  loginWithMercadoLibre: () => {
    window.location.href = `${BASE_URL}/auth/login`;
  },

  // Guardar datos del usuario en localStorage
  setUser: (user: User): void => {
    localStorage.setItem('userId', user.userId);
    localStorage.setItem('nickname', user.nickname);
    localStorage.setItem('email', user.email);
  },

  // Obtener usuario actual desde localStorage
  getUser: (): User | null => {
    const userId = localStorage.getItem('userId');
    const nickname = localStorage.getItem('nickname');
    const email = localStorage.getItem('email');

    if (!userId || !nickname || !email) {
      return null;
    }

    return { userId, nickname, email };
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('userId');
  },

  // Cerrar sesión
  logout: (): void => {
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');
    localStorage.removeItem('email');
    localStorage.removeItem('callbackProcessed');
  },

  // Limpiar sesión (usado al entrar a login)
  clearSession: (): void => {
    localStorage.clear();
  },
};

export default authService;
