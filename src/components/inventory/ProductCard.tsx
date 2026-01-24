import { FC } from 'react';
import { FaEye, FaChartLine, FaEdit } from 'react-icons/fa';
import StockBadge from './StockBadge';
import type { Product } from '../../types/product.types';

interface Props {
  product: Product;
  onViewDetails: (productId: number) => void;
  onAdjustStock: (productId: number) => void;
  onEdit?: (productId: number) => void;
}

const ProductCard: FC<Props> = ({ product, onViewDetails, onAdjustStock, onEdit }) => {
  const totalPlatforms = product.secondarySkus.length;
  const activePlatforms = product.secondarySkus.filter((sku) => sku.stock_quantity > 0).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#d4a574] hover:shadow-xl transition-all overflow-hidden group">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2020] p-4">
        <h3 className="font-bold text-white text-lg line-clamp-2 mb-1">{product.name}</h3>
        <p className="text-[#c4b5a0] font-mono text-sm">SKU: {product.internal_sku}</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Stock */}
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">
            STOCK TOTAL
          </p>
          <StockBadge stock={product.stock} />
        </div>

        {/* Category */}
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">CATEGORÍA</p>
          <p className="text-sm text-gray-900 dark:text-white font-semibold">
            {product.category?.platform_name || 'Sin categoría'}
          </p>
        </div>

        {/* Platforms */}
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">PLATAFORMAS</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {activePlatforms} / {totalPlatforms}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">activas</span>
          </div>
          <div className="mt-2 space-y-1">
            {product.secondarySkus.slice(0, 2).map((sku) => (
              <div
                key={sku.secondary_sku_id}
                className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700 rounded px-2 py-1"
              >
                <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                  {sku.platform?.platform_name || 'Plataforma'}
                </span>
                <span className="text-gray-900 dark:text-white font-bold ml-2">
                  {sku.stock_quantity}
                </span>
              </div>
            ))}
            {totalPlatforms > 2 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                +{totalPlatforms - 2} más
              </p>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Actualizado: {formatRelativeTime(product.updated_at)}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            onClick={() => onViewDetails(product.product_id)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
            title="Ver detalles"
          >
            <FaEye />
            <span className="hidden xl:inline">Ver</span>
          </button>
          <button
            onClick={() => onAdjustStock(product.product_id)}
            className="px-3 py-2 bg-gradient-to-r from-[#d4a574] to-[#b8935e] hover:from-[#b8935e] hover:to-[#d4a574] text-white rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1"
            title="Ajustar stock"
          >
            <FaChartLine />
            <span className="hidden xl:inline">Stock</span>
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(product.product_id)}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              title="Editar producto"
            >
              <FaEdit />
              <span className="hidden xl:inline">Editar</span>
            </button>
          )}
        </div>
      </div>

      {/* Hover Effect Indicator */}
      <div className="h-1 bg-gradient-to-r from-[#d4a574] to-[#b8935e] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
    </div>
  );
};

// Helper function
function formatRelativeTime(dateString?: string) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  return 'Hace un momento';
}

export default ProductCard;
