/**
 * Constantes globales de la aplicación
 */

// Thresholds de stock
export const STOCK_THRESHOLDS = {
  LOW: 10,
  MEDIUM: 30,
} as const;

// Paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Tipos de cambio para historial
export const CHANGE_TYPES = {
  MANUAL: 'manual',
  ORDER: 'order',
  ADJUSTMENT: 'adjustment',
  IMPORT: 'import',
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  GENERIC: 'Ha ocurrido un error. Por favor intenta nuevamente.',
  NETWORK: 'Error de conexión. Verifica tu conexión a internet.',
  NOT_FOUND: 'Recurso no encontrado.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  SERVER_ERROR: 'Error del servidor. Por favor intenta más tarde.',
} as const;

// Duración de toasts (ms)
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 4000,
} as const;
