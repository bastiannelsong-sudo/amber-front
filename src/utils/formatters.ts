import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatear fecha en formato legible
 * Ej: "24/10/2025 15:30"
 */
export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es });
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Formatear fecha como "hace X tiempo"
 * Ej: "hace 2 horas"
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Formatear número con separadores de miles
 * Ej: 1000 -> "1,000"
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-CL').format(num);
};

/**
 * Formatear precio en CLP
 * Ej: 1000 -> "$1.000"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Truncar texto con ellipsis
 * Ej: "Texto muy largo..." (maxLength: 10)
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalizar primera letra
 * Ej: "hola mundo" -> "Hola mundo"
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
