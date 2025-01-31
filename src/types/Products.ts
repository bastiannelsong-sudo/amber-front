
export interface SecondarySku {
  secondary_sku_id: number;
  secondary_sku: string;
  stock_quantity: number;
  publication_link: string;
}

export interface Category {
  platform_id: number,
  platform_name: string;
}

export interface Product {
  product_id: number;
  internal_sku: string;
  name: string;
  stock: number;
  to_repair: number;
  total: number;
  secondarySkus: SecondarySku[];
  category: Category;
}
