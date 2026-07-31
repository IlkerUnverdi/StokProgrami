

import type { ProductListItem } from '@/types/product';

export type PurchaseHistoryItem = {
  id: number;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;

  product?: ProductListItem | null;

  purchase: {
    id: number;
    purchaseNo?: string | null;
    createdAt: string;

    currentAccount?: {
      id?: number;
      name: string;
      phone?: string | null;
    } | null;

    user?: {
      id?: number;
      username: string;
    } | null;
  };
};

export type PurchaseHistoryResponse = {
  summary: {
    purchaseCount: number;
    totalQuantity: number;
    totalAmount: number;
    lastPurchasePrice?: string | number | null;
    lastPurchaseDate?: string | null;
    lastSupplierName?: string | null;
    lastSalePrice?: string | number | null;
    lastSaleDate?: string | null;
    lastCustomerName?: string | null;
    lastSaleNo?: string | null;
  };

  purchases: PurchaseHistoryItem[];
};
