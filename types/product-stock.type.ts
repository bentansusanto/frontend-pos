export interface ProductStock {
  id: string;
  variantId: string;
  branchId: string;
  stock: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStockResponse {
  message: string;
  data: ProductStock;
}

export interface CreateProductStockRequest {
  branchId: string;
  variantId: string;
  stock: number;
  minStock: number;
}
