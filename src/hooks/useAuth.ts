import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Hook personalizado para manejar autenticación
 * Inicializa el estado de auth desde sessionStorage al montar
 */
export const useAuth = () => {
  const { user, isAuthenticated, setUser, logout, initAuth } = useAuthStore();

  // Inicializar auth al montar el componente
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return {
    user,
    isAuthenticated,
    setUser,
    logout,
  };
};

export default useAuth;
