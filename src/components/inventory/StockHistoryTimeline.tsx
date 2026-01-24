import { FC, useState } from 'react';
import type { ProductHistory } from '../../types/product.types';
import { Badge } from 'flowbite-react';
import { HiDownload } from 'react-icons/hi';

interface Props {
  history: ProductHistory[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const StockHistoryTimeline: FC<Props> = ({ history, isLoading, onLoadMore, hasMore }) => {
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEntries(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'manual':
        return '👤';
      case 'order':
        return '🤖';
      case 'adjustment':
        return '⚖️';
      case 'import':
        return '📥';
      default:
        return '📝';
    }
  };

  const getChangeTypeBadge = (type: string) => {
    const colors = {
      manual: 'gray',
      order: 'info',
      adjustment: 'purple',
      import: 'warning',
    };
    const labels = {
      manual: 'Manual',
      order: 'Venta Automática',
      adjustment: 'Ajuste',
      import: 'Importación',
    };
    return (
      <Badge color={colors[type as keyof typeof colors] || 'gray'} className="flex items-center gap-1">
        <span>{getChangeTypeIcon(type)}</span>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getPlatformBadge = (platform?: { platform_id: number; platform_name: string }) => {
    if (!platform) return null;

    const colors = {
      'Mercado Libre': 'bg-yellow-400 text-gray-900',
      Falabella: 'bg-green-600 text-white',
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          colors[platform.platform_name as keyof typeof colors] || 'bg-gray-500 text-white'
        }`}
      >
        {platform.platform_name}
      </span>
    );
  };

  if (isLoading && history.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4a574]"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No hay historial de cambios para este producto
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Línea vertical del timeline */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#d4a574] via-[#d4a574] to-transparent"></div>

      {/* Entradas del historial */}
      <div className="space-y-4">
        {history.map((entry) => {
          const isExpanded = expandedEntries.has(entry.history_id);

          return (
            <div key={entry.history_id} className="relative pl-16">
              {/* Punto en la línea */}
              <div
                className={`absolute left-4 w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center text-xs ${
                  entry.change_type === 'manual'
                    ? 'bg-gray-500'
                    : entry.change_type === 'order'
                    ? 'bg-blue-500'
                    : entry.change_type === 'adjustment'
                    ? 'bg-purple-500'
                    : 'bg-orange-500'
                }`}
              >
                {getChangeTypeIcon(entry.change_type)}
              </div>

              {/* Tarjeta de cambio */}
              <div
                className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-2 hover:shadow-lg transition-shadow ${
                  entry.change_type === 'manual'
                    ? 'border-gray-200'
                    : entry.change_type === 'order'
                    ? 'border-blue-200'
                    : entry.change_type === 'adjustment'
                    ? 'border-purple-200'
                    : 'border-orange-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getChangeTypeBadge(entry.change_type)}
                      {entry.platform && getPlatformBadge(entry.platform)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                </div>

                {/* Usuario */}
                <div className="mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Usuario:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                    {entry.changed_by}
                  </span>
                </div>

                {/* Cambio */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {entry.field_name}:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 dark:text-red-400 font-semibold line-through">
                        {entry.old_value}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        {entry.new_value}
                      </span>
                    </div>
                  </div>

                  {entry.adjustment_amount !== null && entry.adjustment_amount !== undefined && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Ajuste: </span>
                      <span
                        className={`font-bold ${
                          entry.adjustment_amount > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {entry.adjustment_amount > 0 ? '+' : ''}
                        {entry.adjustment_amount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Razón */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <span className="font-semibold">Razón:</span> {entry.change_reason}
                  </p>

                  {entry.platform_order_id && (
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Orden: {entry.platform_order_id}
                    </p>
                  )}
                </div>

                {/* Metadata expandible */}
                {entry.metadata && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggleExpanded(entry.history_id)}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
                    >
                      {isExpanded ? '▼ Ocultar' : '▶ Ver'} detalles técnicos
                    </button>
                    {isExpanded && (
                      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto border border-gray-200 dark:border-gray-700">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón cargar más */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-[#d4a574] hover:bg-[#b8935e] text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Cargando...' : 'Cargar más entradas antiguas'}
          </button>
        </div>
      )}
    </div>
  );
};

export default StockHistoryTimeline;
