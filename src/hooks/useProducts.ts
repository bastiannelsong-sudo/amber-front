import { useState, useEffect } from 'react';
import { Product } from '../types/Products';


const useProducts = (baseUrl: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${baseUrl}/products`);
        if (!response.ok) {
          throw new Error('Error al obtener los productos');
        }
        const data: Product[] = await response.json();
        setProducts(data);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setError('No se pudo cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [baseUrl]);

  return { products, loading, error };
};

export default useProducts;
