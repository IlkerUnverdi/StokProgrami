

import { useState } from 'react';

import { api } from '@/lib/api';
import type { ProductListItem } from '@/types/product';
import type {
  PurchaseHistoryItem,
  PurchaseHistoryResponse,
} from '@/types/purchase';

export function usePurchaseHistory() {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductListItem | null>(null);

  const [purchaseHistory, setPurchaseHistory] = useState<
    PurchaseHistoryItem[]
  >([]);

  const [purchaseHistoryLoading, setPurchaseHistoryLoading] =
    useState(false);

  const [purchaseHistoryOpen, setPurchaseHistoryOpen] =
    useState(false);

  async function openPurchaseHistory(product: ProductListItem) {
    try {
      setPurchaseHistoryLoading(true);
      setSelectedProduct(product);
      setPurchaseHistoryOpen(true);

      const response = await api.get<PurchaseHistoryResponse>(
        `/products/${product.id}/purchase-history`,
      );

      setPurchaseHistory(response.data.purchases ?? []);
    } catch (err) {
      console.error('PURCHASE HISTORY ERROR:', err);
      setPurchaseHistory([]);
    } finally {
      setPurchaseHistoryLoading(false);
    }
  }

  function closePurchaseHistory() {
    setPurchaseHistoryOpen(false);
    setSelectedProduct(null);
    setPurchaseHistory([]);
  }

  return {
    selectedProduct,
    purchaseHistory,
    purchaseHistoryLoading,
    purchaseHistoryOpen,
    openPurchaseHistory,
    closePurchaseHistory,
  };
}