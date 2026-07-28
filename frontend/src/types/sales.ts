export type CartProduct = {
  id: number;
  name: string;
  barcode?: string | null;
  salePrice?: string | number | null;
  currentStock?: number;
  imageUrl?: string | null;
  shelfCode?: string | null;
  partBrand?: {
    name: string;
  } | null;
  oemCodes?: Array<{
    id?: number;
    code: string;
    isPrimary?: boolean;
  }>;
  referenceCodes?: Array<{
    id?: number;
    code: string;
  }>;
};

export type CartItem = {
  product: CartProduct;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
};