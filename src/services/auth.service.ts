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

  // Guardar datos del usuario en sessionStorage
  setUser: (user: User): void => {
    sessionStorage.setItem('userId', user.userId);
    sessionStorage.setItem('nickname', user.nickname);
    sessionStorage.setItem('email', user.email);
  },

  // Obtener usuario actual desde sessionStorage
  getUser: (): User | null => {
    const userId = sessionStorage.getItem('userId');
    const nickname = sessionStorage.getItem('nickname');
    const email = sessionStorage.getItem('email');

    if (!userId || !nickname || !email) {
      return null;
    }

    return { userId, nickname, email };
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    return !!sessionStorage.getItem('userId');
  },

  // Cerrar sesión
  logout: (): void => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('nickname');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('callbackProcessed');
  },

  // Limpiar sesión (usado al entrar a login)
  clearSession: (): void => {
    sessionStorage.clear();
  },
};

export default authService;
