export interface Product {
 id: string;
  name_product: string;
  category_id: string;
  price: number;
  description: string;
  slug: string;
  sku: string;
  thumbnail: string;
  images: string[];
  stock?: number;
  product_stock?: number;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  weight: number;
  color: string;
  name_variant: string;
  price: number;
}
