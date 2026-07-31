'use client';

import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import type { CurrentAccount } from '@/types/currentAccount';
import type { ProductListItem } from '@/types/product';
import type {
  CreateSupplierReturnPayload,
  ReturnDocument,
  SupplierReturn,
} from '@/types/return';
import { getErrorMessage } from '@/utils/apiError';

export function useSupplierReturns() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [suppliers, setSuppliers] = useState<CurrentAccount[]>([]);
  const [returns, setReturns] = useState<SupplierReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [productsResponse, accountsResponse, returnsResponse] =
        await Promise.all([
          api.get<ProductListItem[]>('/products'),
          api.get<CurrentAccount[]>('/current-accounts'),
          api.get<ReturnDocument[]>('/returns'),
        ]);

      setProducts(
        productsResponse.data.filter(
          (product) => product.isActive !== false && (product.currentStock ?? 0) > 0,
        ),
      );
      setSuppliers(
        accountsResponse.data.filter(
          (account) => account.type === 'SUPPLIER' && account.isActive,
        ),
      );
      setReturns(
        returnsResponse.data.filter(
          (returnDocument): returnDocument is SupplierReturn =>
            returnDocument.type !== 'CUSTOMER_RETURN',
        ),
      );
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function createReturn(payload: CreateSupplierReturnPayload) {
    try {
      setSavingAction('create');
      setError('');
      setMessage('');
      await api.post('/returns', payload);
      await loadData();
      setMessage('Ürünler iade bekleyen stoğa taşındı.');
      return true;
    } catch (createError) {
      setError(getErrorMessage(createError));
      return false;
    } finally {
      setSavingAction('');
    }
  }

  async function completeReturn(id: number) {
    try {
      setSavingAction(`complete-${id}`);
      setError('');
      setMessage('');
      await api.post(`/returns/${id}/complete`);
      await loadData();
      setMessage('İade tamamlandı ve cari borçtan mahsup edildi.');
    } catch (completeError) {
      setError(getErrorMessage(completeError));
    } finally {
      setSavingAction('');
    }
  }

  async function cancelReturn(id: number) {
    try {
      setSavingAction(`cancel-${id}`);
      setError('');
      setMessage('');
      await api.post(`/returns/${id}/cancel`);
      await loadData();
      setMessage('İade iptal edildi ve ürünler satılabilir stoğa döndü.');
    } catch (cancelError) {
      setError(getErrorMessage(cancelError));
    } finally {
      setSavingAction('');
    }
  }

  return {
    products,
    suppliers,
    returns,
    loading,
    savingAction,
    error,
    message,
    createReturn,
    completeReturn,
    cancelReturn,
  };
}
