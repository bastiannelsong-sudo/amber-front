import { useState, useEffect } from 'react';

/**
 * Hook para aplicar debounce a un valor
 * Útil para búsquedas en tiempo real
 * 
 * @param value - Valor a aplicar debounce
 * @param delay - Retraso en ms (default: 500ms)
 * @returns Valor con debounce aplicado
 */
export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Crear timeout que actualizará el valor
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
