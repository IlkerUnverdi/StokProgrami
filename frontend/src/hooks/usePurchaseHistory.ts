

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

  const [productSummary, setProductSummary] = useState<
    PurchaseHistoryResponse['summary'] | null
  >(null);

  const [purchaseHistoryLoading, setPurchaseHistoryLoading] =
    useState(false);

  const [purchaseHistoryOpen, setPurchaseHistoryOpen] =
    useState(false);

  async function openPurchaseHistory(product: ProductListItem) {
    try {
      setPurchaseHistoryLoading(true);
      setSelectedProduct(product);
      setPurchaseHistoryOpen(true);
      setProductSummary(null);

      const response = await api.get<PurchaseHistoryResponse>(
        `/products/${product.id}/purchase-history`,
      );

      setPurchaseHistory(response.data.purchases ?? []);
      setProductSummary(response.data.summary);
    } catch (err) {
      console.error('PURCHASE HISTORY ERROR:', err);
      setPurchaseHistory([]);
      setProductSummary(null);
    } finally {
      setPurchaseHistoryLoading(false);
    }
  }

  function closePurchaseHistory() {
    setPurchaseHistoryOpen(false);
    setSelectedProduct(null);
    setPurchaseHistory([]);
    setProductSummary(null);
  }

  return {
    selectedProduct,
    purchaseHistory,
    productSummary,
    purchaseHistoryLoading,
    purchaseHistoryOpen,
    openPurchaseHistory,
    closePurchaseHistory,
  };
}
