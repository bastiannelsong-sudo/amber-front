import { FC, useState } from 'react';
import { FaClock, FaCheck, FaBan } from 'react-icons/fa';
import { usePendingSales, useResolvePendingSale, useIgnorePendingSale } from '../hooks/usePendingSales';
import ProductMappingModal from '../components/inventory/ProductMappingModal';
import type { PendingSale } from '../types/product.types';

const PendingSalesPage: FC = () => {
  const { data: pendingSales, isLoading } = usePendingSales('pending');
  const resolveMutation = useResolvePendingSale();
  const ignoreMutation = useIgnorePendingSale();

  const [selectedSale, setSelectedSale] = useState<PendingSale | null>(null);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);

  const handleMapClick = (sale: PendingSale) => {
    setSelectedSale(sale);
    setMappingModalOpen(true);
  };

  const handleConfirmMapping = async (
    pendingSaleId: number,
    productId: number,
    createMapping: boolean,
    resolvedBy: string
  ) => {
    try {
      await resolveMutation.mutateAsync({
        pendingSaleId,
        productId,
        createMapping,
        resolvedBy,
      });
      setMappingModalOpen(false);
      setSelectedSale(null);
    } catch (error) {
      console.error('Error resolving pending sale:', error);
      // TODO: Show error toast
    }
  };

  const handleIgnore = async (pendingSaleId: number) => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas ignorar esta venta? No se descontará del inventario.'
    );

    if (!confirmed) return;

    const resolvedBy = prompt('Ingresa tu nombre o usuario:');
    if (!resolvedBy) return;

    try {
      await ignoreMutation.mutateAsync({
        pendingSaleId,
        resolvedBy,
      });
    } catch (error) {
      console.error('Error ignoring pending sale:', error);
      // TODO: Show error toast
    }
  };

  const getPlatformBadge = (platformName?: string) => {
    if (!platformName) return null;

    const colors: Record<string, string> = {
      'Mercado Libre': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
      Falabella: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    };

    const color = colors[platformName] || 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
        {platformName}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#d4a574]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
            <FaClock />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ventas Pendientes de Mapeo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Asigna estas ventas a productos de tu inventario
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Pendientes</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {pendingSales?.length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unidades Sin Descontar</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {pendingSales?.reduce((sum, sale) => sum + sale.quantity, 0) || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Plataformas Afectadas</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {new Set(pendingSales?.map((s) => s.platform_id)).size || 0}
          </p>
        </div>
      </div>

      {/* Pending Sales List */}
      {pendingSales && pendingSales.length > 0 ? (
        <div className="space-y-4">
          {pendingSales.map((sale) => (
            <div
              key={sale.pending_sale_id}
              className="bg-white dark:bg-gray-800 rounded-xl border-2 border-orange-300 dark:border-orange-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left: Sale Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    {getPlatformBadge(sale.platform?.platform_name)}
                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-semibold">
                      PENDIENTE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">SKU DE PLATAFORMA</p>
                      <p className="font-mono font-bold text-gray-900 dark:text-white mt-1">
                        {sale.platform_sku}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">ID DE ORDEN</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white mt-1">
                        {sale.platform_order_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">CANTIDAD</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {sale.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">FECHA DE VENTA</p>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">
                        {formatDate(sale.sale_date)}
                      </p>
                    </div>
                  </div>

                  {sale.error_message && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <span className="font-semibold">Error:</span> {sale.error_message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                  <button
                    onClick={() => handleMapClick(sale)}
                    className="flex-1 lg:flex-none px-4 py-3 bg-gradient-to-r from-[#d4a574] to-[#b8935e] hover:from-[#b8935e] hover:to-[#d4a574] text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaCheck />
                    Mapear
                  </button>
                  <button
                    onClick={() => handleIgnore(sale.pending_sale_id)}
                    className="flex-1 lg:flex-none px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <FaBan />
                    Ignorar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Todo al día!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No hay ventas pendientes de mapeo en este momento
          </p>
        </div>
      )}

      {/* Mapping Modal */}
      <ProductMappingModal
        pendingSale={selectedSale}
        isOpen={mappingModalOpen}
        onClose={() => {
          setMappingModalOpen(false);
          setSelectedSale(null);
        }}
        onConfirm={handleConfirmMapping}
      />
    </div>
  );
};

export default PendingSalesPage;
