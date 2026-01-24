import { FC, useState } from 'react';
import { HiX, HiDownload } from 'react-icons/hi';
import { FaBox, FaSync, FaHistory, FaChartLine } from 'react-icons/fa';
import { useProduct, useProductHistory } from '../../hooks/useProducts';
import StockHistoryTimeline from './StockHistoryTimeline';
import StockBadge from './StockBadge';
import type { HistoryFilters } from '../../types/product.types';

interface Props {
  productId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onAdjustStock?: (productId: number) => void;
  onEdit?: (productId: number) => void;
}

const ProductDetailPanel: FC<Props> = ({
  productId,
  isOpen,
  onClose,
  onAdjustStock,
  onEdit,
}) => {
  const { data: product, isLoading } = useProduct(productId || 0);
  const { data: history, isLoading: loadingHistory } = useProductHistory(productId || 0, 100);
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({});

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Hace un momento';
  };

  const exportHistory = () => {
    if (!product || !history) return;

    const csvContent = [
      ['Fecha', 'Usuario', 'Tipo', 'Campo', 'Valor Anterior', 'Valor Nuevo', 'Razón', 'Plataforma'].join(','),
      ...history.map((entry) =>
        [
          entry.created_at,
          entry.changed_by,
          entry.change_type,
          entry.field_name,
          entry.old_value,
          entry.new_value,
          `"${entry.change_reason}"`,
          entry.platform?.platform_name || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial_${product.internal_sku}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel lateral */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
        {isLoading || !product ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4a574]"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#1a1a1a] to-[#2d2020] border-b-2 border-[#d4a574] p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#f5d7a1] to-[#d4a574] bg-clip-text text-transparent">
                    {product.name}
                  </h2>
                  <p className="text-[#c4b5a0] font-mono mt-1">SKU: {product.internal_sku}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#d4a574] hover:text-[#f5d7a1] text-2xl transition-colors"
                >
                  <HiX />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Sección: Información General */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaBox className="text-[#d4a574]" />
                  Información General
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Stock Total</p>
                    <div className="mt-1">
                      <StockBadge stock={product.stock} />
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Categoría</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                      {product.category?.platform_name || 'Sin categoría'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Creado</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {formatDate(product.created_at)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Actualizado</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {formatRelativeTime(product.updated_at)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Sección: Stock por Plataforma */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaSync className="text-[#d4a574]" />
                  Stock por Plataforma
                </h3>
                <div className="space-y-3">
                  {product.secondarySkus.map((sku) => (
                    <div
                      key={sku.secondary_sku_id}
                      className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {sku.platform?.platform_name || 'Plataforma'}
                        </span>
                        <StockBadge stock={sku.stock_quantity} />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-2">
                        SKU: {sku.secondary_sku}
                      </p>
                      {sku.publication_link && (
                        <a
                          href={sku.publication_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#d4a574] hover:text-[#b8935e] hover:underline flex items-center gap-1"
                        >
                          🔗 Ver publicación
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Sección: HISTORIAL COMPLETO */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FaHistory className="text-[#d4a574]" />
                    Historial Completo de Cambios
                  </h3>
                  <button
                    onClick={exportHistory}
                    className="text-sm text-[#d4a574] hover:text-[#b8935e] flex items-center gap-1 font-semibold transition-colors"
                  >
                    <HiDownload />
                    Exportar
                  </button>
                </div>

                {/* Timeline del historial */}
                <StockHistoryTimeline history={history || []} isLoading={loadingHistory} />
              </section>

              {/* Acciones Rápidas */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onAdjustStock?.(product.product_id)}
                    className="px-4 py-3 bg-gradient-to-r from-[#d4a574] to-[#b8935e] hover:from-[#b8935e] hover:to-[#d4a574] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <FaChartLine />
                    Ajustar Stock
                  </button>
                  <button
                    onClick={() => onEdit?.(product.product_id)}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    ✏️ Editar
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPanel;
