import { FC, useState, useMemo } from 'react';
import { FaBox } from 'react-icons/fa';
import { useProducts } from '../hooks/useProducts';
import { useAdjustStock } from '../hooks/useProducts';
import StatsCards from '../components/inventory/StatsCards';
import PendingSalesAlert from '../components/inventory/PendingSalesAlert';
import InventoryToolbar, {
  ViewMode,
  InventoryFilters,
} from '../components/inventory/InventoryToolbar';
import ProductCard from '../components/inventory/ProductCard';
import ProductDetailPanel from '../components/inventory/ProductDetailPanel';
import QuickStockAdjustModal from '../components/inventory/QuickStockAdjustModal';
import type { Product } from '../types/product.types';

const ProductInventoryPage: FC = () => {
  const { data: products, isLoading, error } = useProducts();
  const adjustStockMutation = useAdjustStock();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<InventoryFilters>({
    searchTerm: '',
  });

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    return products.filter((product) => {
      // Search filter
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(search);
        const matchesSku = product.internal_sku.toLowerCase().includes(search);
        const matchesSecondarySku = product.secondarySkus.some((sku) =>
          sku.secondary_sku.toLowerCase().includes(search)
        );

        if (!matchesName && !matchesSku && !matchesSecondarySku) {
          return false;
        }
      }

      // Stock level filter
      if (filters.stockLevel) {
        const stock = product.stock;
        switch (filters.stockLevel) {
          case 'critical':
            if (stock > 5) return false;
            break;
          case 'low':
            if (stock <= 5 || stock > 20) return false;
            break;
          case 'medium':
            if (stock <= 20 || stock > 50) return false;
            break;
          case 'high':
            if (stock <= 50) return false;
            break;
        }
      }

      return true;
    });
  }, [products, filters]);

  const handleViewDetails = (productId: number) => {
    setSelectedProductId(productId);
    setDetailPanelOpen(true);
  };

  const handleAdjustStock = (productId: number) => {
    const product = products?.find((p) => p.product_id === productId);
    if (product) {
      setProductToAdjust(product);
      setAdjustModalOpen(true);
    }
  };

  const handleConfirmAdjustment = async (
    productId: number,
    adjustment: number,
    reason: string,
    description: string
  ) => {
    try {
      await adjustStockMutation.mutateAsync({
        productId,
        adjustment,
        reason,
        description,
        changedBy: 'Usuario', // TODO: Get from auth context
      });
      setAdjustModalOpen(false);
      setProductToAdjust(null);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      // TODO: Show error toast
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#d4a574]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-6">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Error al cargar productos
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-[#d4a574] to-[#b8935e] hover:from-[#b8935e] hover:to-[#d4a574] text-white rounded-lg font-semibold transition-all shadow-lg"
        >
          Recargar Página
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#d4a574] to-[#b8935e] rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
            <FaBox />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Inventario de Productos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona tu inventario multi-plataforma
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Pending Sales Alert */}
      <PendingSalesAlert />

      {/* Toolbar */}
      <InventoryToolbar
        filters={filters}
        viewMode={viewMode}
        onFiltersChange={setFilters}
        onViewModeChange={setViewMode}
      />

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filters.searchTerm || filters.stockLevel
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando productos a tu inventario'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              onViewDetails={handleViewDetails}
              onAdjustStock={handleAdjustStock}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2020] text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Producto</th>
                <th className="px-6 py-4 text-left font-semibold">SKU</th>
                <th className="px-6 py-4 text-center font-semibold">Stock</th>
                <th className="px-6 py-4 text-left font-semibold">Categoría</th>
                <th className="px-6 py-4 text-center font-semibold">Plataformas</th>
                <th className="px-6 py-4 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr
                  key={product.product_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {product.internal_sku}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          product.stock <= 5
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : product.stock <= 20
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {product.category?.platform_name || 'Sin categoría'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {product.secondarySkus.length}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(product.product_id)}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-semibold transition-colors"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleAdjustStock(product.product_id)}
                        className="px-3 py-1 bg-[#d4a574] hover:bg-[#b8935e] text-white rounded text-xs font-semibold transition-colors"
                      >
                        Ajustar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Results Count */}
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Mostrando {filteredProducts.length} de {products?.length || 0} productos
      </div>

      {/* Modals & Panels */}
      <ProductDetailPanel
        productId={selectedProductId}
        isOpen={detailPanelOpen}
        onClose={() => {
          setDetailPanelOpen(false);
          setSelectedProductId(null);
        }}
        onAdjustStock={handleAdjustStock}
      />

      <QuickStockAdjustModal
        product={productToAdjust}
        isOpen={adjustModalOpen}
        onClose={() => {
          setAdjustModalOpen(false);
          setProductToAdjust(null);
        }}
        onConfirm={handleConfirmAdjustment}
      />
    </div>
  );
};

export default ProductInventoryPage;
