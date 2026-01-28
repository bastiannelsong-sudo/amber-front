import { create } from 'zustand';
import type { User } from '../types/auth.types';
import authService from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Flag para saber si ya se intentó restaurar la sesión
  setUser: (user: User | null) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  // Establecer usuario
  setUser: (user) => {
    if (user) {
      authService.setUser(user);
      set({ user, isAuthenticated: true, isInitialized: true });
    } else {
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },

  // Cerrar sesión
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  // Inicializar autenticación desde localStorage
  initAuth: () => {
    const user = authService.getUser();
    if (user) {
      set({ user, isAuthenticated: true, isInitialized: true });
    } else {
      set({ isInitialized: true }); // Marcar como inicializado aunque no haya usuario
    }
  },
}));

export default useAuthStore;
