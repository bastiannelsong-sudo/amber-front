import { FC } from 'react';
import { HiSearch, HiViewGrid, HiViewList, HiFilter } from 'react-icons/hi';
import { FaPlus } from 'react-icons/fa';

export type ViewMode = 'grid' | 'table';

export interface InventoryFilters {
  searchTerm: string;
  platformId?: number;
  stockLevel?: 'critical' | 'low' | 'medium' | 'high' | 'all';
  categoryId?: number;
}

interface Props {
  filters: InventoryFilters;
  viewMode: ViewMode;
  onFiltersChange: (filters: InventoryFilters) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onAddProduct?: () => void;
}

const InventoryToolbar: FC<Props> = ({
  filters,
  viewMode,
  onFiltersChange,
  onViewModeChange,
  onAddProduct,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  searchTerm: e.target.value,
                })
              }
              placeholder="Buscar productos por nombre o SKU..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Stock Level Filter */}
          <div className="flex items-center gap-2">
            <HiFilter className="text-gray-600 dark:text-gray-400" />
            <select
              value={filters.stockLevel || 'all'}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  stockLevel: e.target.value === 'all' ? undefined : (e.target.value as any),
                })
              }
              className="px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">Todos los niveles</option>
              <option value="critical">🔴 Crítico (≤5)</option>
              <option value="low">🟡 Bajo (6-20)</option>
              <option value="medium">🟢 Medio (21-50)</option>
              <option value="high">🟢 Alto (&gt;50)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#d4a574] text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Vista de cuadrícula"
            >
              <HiViewGrid className="text-lg" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-3 py-2 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-[#d4a574] text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Vista de tabla"
            >
              <HiViewList className="text-lg" />
            </button>
          </div>

          {/* Add Product Button */}
          {onAddProduct && (
            <button
              onClick={onAddProduct}
              className="px-4 py-2.5 bg-gradient-to-r from-[#d4a574] to-[#b8935e] hover:from-[#b8935e] hover:to-[#d4a574] text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <FaPlus />
              <span className="hidden sm:inline">Nuevo Producto</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.stockLevel || filters.searchTerm) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filtros activos:</span>

          {filters.searchTerm && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#d4a574]/20 text-[#d4a574] dark:text-[#f5d7a1] rounded-full text-sm font-semibold">
              Búsqueda: "{filters.searchTerm}"
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    searchTerm: '',
                  })
                }
                className="ml-1 hover:text-[#b8935e]"
              >
                ✕
              </button>
            </span>
          )}

          {filters.stockLevel && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold">
              {filters.stockLevel === 'critical' && '🔴 Crítico'}
              {filters.stockLevel === 'low' && '🟡 Bajo'}
              {filters.stockLevel === 'medium' && '🟢 Medio'}
              {filters.stockLevel === 'high' && '🟢 Alto'}
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    stockLevel: undefined,
                  })
                }
                className="ml-1 hover:text-blue-900 dark:hover:text-blue-300"
              >
                ✕
              </button>
            </span>
          )}

          <button
            onClick={() =>
              onFiltersChange({
                searchTerm: '',
                stockLevel: undefined,
              })
            }
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline ml-2"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryToolbar;
