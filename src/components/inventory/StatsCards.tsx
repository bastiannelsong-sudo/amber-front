import { FC } from 'react';
import { FaBox, FaExclamationTriangle, FaClock, FaSync } from 'react-icons/fa';
import { useProducts } from '../../hooks/useProducts';
import { usePendingSalesCount } from '../../hooks/usePendingSales';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color: 'gold' | 'red' | 'orange' | 'blue';
  subtitle?: string;
  onClick?: () => void;
}

const StatCard: FC<StatCardProps> = ({ icon, title, value, color, subtitle, onClick }) => {
  const colorClasses = {
    gold: 'from-[#d4a574] to-[#b8935e]',
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-2xl shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatsCards: FC = () => {
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: pendingCount, isLoading: loadingPending } = usePendingSalesCount('pending');

  const totalProducts = products?.length || 0;
  const criticalStock = products?.filter((p) => p.stock <= 5).length || 0;
  const pendingSales = pendingCount?.count || 0;

  if (loadingProducts) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={<FaBox />}
        title="Total Productos"
        value={totalProducts}
        color="gold"
      />

      <StatCard
        icon={<FaExclamationTriangle />}
        title="Stock Crítico"
        value={criticalStock}
        color="red"
        subtitle="Requieren atención"
      />

      <StatCard
        icon={<FaClock />}
        title="Pendientes de Mapeo"
        value={pendingSales}
        color="orange"
        subtitle={pendingSales > 0 ? 'Ventas sin descontar' : 'Todo al día'}
        onClick={() => {
          if (pendingSales > 0) {
            window.location.href = '/pending-sales';
          }
        }}
      />

      <StatCard
        icon={<FaSync />}
        title="Última Sincronización"
        value="Hoy"
        color="blue"
        subtitle="Sistema activo"
      />
    </div>
  );
};

export default StatsCards;
