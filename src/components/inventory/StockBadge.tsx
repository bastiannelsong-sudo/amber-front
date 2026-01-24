import { FC } from 'react';
import { Badge } from 'flowbite-react';

interface Props {
  stock: number;
}

const StockBadge: FC<Props> = ({ stock }) => {
  const getStockLevel = () => {
    if (stock <= 5) return { level: 'critical', color: 'failure', label: 'Crítico' };
    if (stock <= 10) return { level: 'low', color: 'warning', label: 'Bajo' };
    if (stock <= 30) return { level: 'medium', color: 'success', label: 'Medio' };
    return { level: 'high', color: 'success', label: 'Alto' };
  };

  const { color, label } = getStockLevel();

  return (
    <Badge color={color} size="sm">
      {stock} - {label}
    </Badge>
  );
};

export default StockBadge;
