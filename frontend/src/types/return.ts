import type { ProductListItem } from '@/types/product';

export type ReturnType =
  | 'CUSTOMER_RETURN'
  | 'SUPPLIER_RETURN'
  | 'DEFECTIVE_RETURN'
  | 'WRONG_ITEM_RETURN';

export type SupplierReturnType = Exclude<ReturnType, 'CUSTOMER_RETURN'>;

export type ReturnStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export type ReturnCurrentAccount = {
  id: number;
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER';
  isActive: boolean;
};

export type ReturnItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: string | number | null;
  lineTotal: string | number;
  note?: string | null;
  product: ProductListItem;
};

export type ReturnDocument = {
  id: number;
  returnNo: string;
  type: ReturnType;
  status: ReturnStatus;
  note?: string | null;
  createdAt: string;
  completedAt?: string | null;
  currentAccountId: number;
  currentAccount: ReturnCurrentAccount;
  sourceSaleId?: number | null;
  sourceSale?: {
    id: number;
    saleNo: string;
    createdAt: string;
  } | null;
  items: ReturnItem[];
};

export type SupplierReturn = Omit<ReturnDocument, 'type'> & {
  type: SupplierReturnType;
};

export type CustomerReturn = Omit<ReturnDocument, 'type'> & {
  type: 'CUSTOMER_RETURN';
};

export type DraftReturnItem = {
  productId: number;
  quantity: number;
  note?: string;
};

export type DraftSupplierReturnItem = DraftReturnItem;

export type CreateSupplierReturnPayload = {
  type: SupplierReturnType;
  currentAccountId: number;
  note?: string;
  items: DraftSupplierReturnItem[];
};

export type CustomerReturnSaleItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
  product: ProductListItem;
};

export type CustomerReturnSale = {
  id: number;
  saleNo: string;
  createdAt: string;
  currentAccountId: number | null;
  currentAccount: ReturnCurrentAccount | null;
  items: CustomerReturnSaleItem[];
};

export type CreateCustomerReturnPayload = {
  type: 'CUSTOMER_RETURN';
  currentAccountId: number;
  sourceSaleId: number;
  note?: string;
  items: DraftReturnItem[];
};
