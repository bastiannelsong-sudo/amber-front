import { create } from 'zustand';
import type { User } from '../types/auth.types';
import authService from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  // Establecer usuario
  setUser: (user) => {
    if (user) {
      authService.setUser(user);
      set({ user, isAuthenticated: true });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },

  // Cerrar sesión
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  // Inicializar autenticación desde sessionStorage
  initAuth: () => {
    const user = authService.getUser();
    if (user) {
      set({ user, isAuthenticated: true });
    }
  },
}));

export default useAuthStore;
