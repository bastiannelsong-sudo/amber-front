import React from 'react';
import useProducts from '../hooks/useProducts';
import { Product } from '../types/Products';

interface ProductListProps {
  baseUrl: string;
}

const ProductList: React.FC<ProductListProps> = ({ baseUrl }) => {
  const { products, loading, error } = useProducts(baseUrl);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Lista de Productos</h2>
      <ul>
        {products.map((product: Product) => (
          <li key={product.product_id}>
            <h3>{product.name}</h3>
            <p>Stock: {product.stock}</p>
            <ul>
              {product.secondarySkus.map((secondarySku) => (
                <li key={secondarySku.secondary_sku_id}>
                  <a href={secondarySku.publication_link} target="_blank" rel="noopener noreferrer">
                    {secondarySku.secondary_sku}
                  </a> - {secondarySku.stock_quantity} unidades
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
