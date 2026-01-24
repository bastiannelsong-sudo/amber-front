import { FC, useState, useEffect } from 'react';
import { HiX, HiSearch } from 'react-icons/hi';
import { FaLink, FaCheckCircle } from 'react-icons/fa';
import { useProducts } from '../../hooks/useProducts';
import StockBadge from './StockBadge';
import type { PendingSale, Product } from '../../types/product.types';

interface Props {
  pendingSale: PendingSale | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    pendingSaleId: number,
    productId: number,
    createMapping: boolean,
    resolvedBy: string
  ) => void;
}

const ProductMappingModal: FC<Props> = ({ pendingSale, isOpen, onClose, onConfirm }) => {
  const { data: products } = useProducts();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [createMapping, setCreateMapping] = useState<boolean>(true);
  const [resolvedBy, setResolvedBy] = useState<string>('');

  // Reset form when modal opens/closes or pendingSale changes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedProduct(null);
      setCreateMapping(true);
      setResolvedBy('');
    }
  }, [isOpen, pendingSale]);

  if (!isOpen || !pendingSale) return null;

  const filteredProducts = products?.filter((product) => {
    const search = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(search) ||
      product.internal_sku.toLowerCase().includes(search) ||
      product.secondarySkus.some((sku) => sku.secondary_sku.toLowerCase().includes(search))
    );
  });

  const isValid = selectedProduct !== null && resolvedBy.trim() !== '';

  const handleConfirm = () => {
    if (!isValid || !selectedProduct) return;
    onConfirm(pendingSale.pending_sale_id, selectedProduct.product_id, createMapping, resolvedBy);
    onClose();
  };

  const getPlatformBadge = () => {
    if (!pendingSale.platform) return null;

    const colors: Record<string, string> = {
      'Mercado Libre': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
      Falabella: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    };

    const color = colors[pendingSale.platform.platform_name] || 'bg-blue-100 text-blue-800';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${color}`}>
        {pendingSale.platform.platform_name}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#1a1a1a] to-[#2d2020] border-b-2 border-[#d4a574] p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#f5d7a1] to-[#d4a574] bg-clip-text text-transparent flex items-center gap-2">
                <FaLink />
                Mapear Venta Pendiente
              </h2>
              <p className="text-[#c4b5a0] mt-1">Asigna esta venta a un producto de tu inventario</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#d4a574] hover:text-[#f5d7a1] text-2xl transition-colors"
            >
              <HiX />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pending Sale Info */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white">Detalles de la Venta</h3>
              {getPlatformBadge()}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">SKU de Plataforma</p>
                <p className="font-mono font-semibold text-gray-900 dark:text-white">
                  {pendingSale.platform_sku}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">ID de Orden</p>
                <p className="font-mono font-semibold text-gray-900 dark:text-white">
                  {pendingSale.platform_order_id}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Cantidad</p>
                <p className="font-semibold text-gray-900 dark:text-white">{pendingSale.quantity}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Fecha</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(pendingSale.sale_date).toLocaleString('es-CL', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Search Products */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Buscar Producto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Busca por nombre o SKU..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Products List */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Selecciona el Producto
            </label>
            <div className="max-h-96 overflow-y-auto space-y-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3">
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.product_id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedProduct?.product_id === product.product_id
                        ? 'border-[#d4a574] bg-[#d4a574]/10 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#d4a574]/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {product.name}
                          </h4>
                          {selectedProduct?.product_id === product.product_id && (
                            <FaCheckCircle className="text-[#d4a574] text-lg" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-2">
                          SKU: {product.internal_sku}
                        </p>
                        <div className="flex items-center gap-2">
                          <StockBadge stock={product.stock} />
                          {product.stock < pendingSale.quantity && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                              ⚠️ Stock insuficiente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No se encontraron productos</p>
                  <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Product Warning */}
          {selectedProduct && selectedProduct.stock < pendingSale.quantity && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                ⚠️ Advertencia: El producto seleccionado tiene stock insuficiente para esta venta
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Stock disponible: {selectedProduct.stock} | Cantidad requerida: {pendingSale.quantity}
              </p>
            </div>
          )}

          {/* Create Mapping Option */}
          {selectedProduct && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createMapping}
                  onChange={(e) => setCreateMapping(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#d4a574] border-gray-300 rounded focus:ring-[#d4a574]"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Crear mapeo automático
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Las futuras ventas de <span className="font-mono">{pendingSale.platform_sku}</span>{' '}
                    en {pendingSale.platform?.platform_name} se descontarán automáticamente de{' '}
                    <span className="font-semibold">{selectedProduct.name}</span>
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Resolved By */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Resuelto Por <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={resolvedBy}
              onChange={(e) => setResolvedBy(e.target.value)}
              placeholder="Tu nombre o usuario..."
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                isValid
                  ? 'bg-gradient-to-r from-[#d4a574] to-[#b8935e] hover:from-[#b8935e] hover:to-[#d4a574] text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirmar Mapeo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMappingModal;
