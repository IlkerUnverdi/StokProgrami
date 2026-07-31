import { api } from '@/lib/api';

export type Product = {
  id: number;
  name: string;
  imageUrl?: string;
  barcode: string;
  shelfCode: string;
  lastPurchasePrice: string;
  salePrice: string;
  minSalePrice: string;
  isActive: boolean;
  categoryId: number;
  partBrandId: number;
  category?: {
    id: number;
    name: string;
  };
  partBrand?: {
    id: number;
    name: string;
  };
  oemCodes?: Array<{
    id: number;
    code: string;
    isPrimary: boolean;
  }>;
  referenceCodes?: Array<{
    id: number;
    code: string;
  }>;
};

export type UpdateProductPayload = {
  name?: string;
  imageUrl?: string;
  barcode?: string;
  shelfCode?: string;
  lastPurchasePrice?: string;
  salePrice?: string;
  minSalePrice?: string;
  isActive?: boolean;
  categoryId?: number;
  partBrandId?: number;
};

export type CreateProductPayload = {
  name: string;
  imageUrl?: string;
  barcode: string;
  shelfCode: string;
  salePrice: string;
  isActive: boolean;
  categoryId: number;
  partBrandId: number;
  oemCodes?: string[];
  referenceCodes?: string[];
};

export async function findProductByQuery(q: string) {
  const { data } = await api.get<Product[]>(
    `/products/search?q=${encodeURIComponent(q)}`,
  );
  return data;
}

export async function updateProduct(id: number, payload: UpdateProductPayload) {
  const { data } = await api.patch<Product>(`/products/${id}`, payload);
  return data;
}

export async function createProduct(payload: CreateProductPayload) {
  const { data } = await api.post<Product>('/products', payload);
  return data;
}
