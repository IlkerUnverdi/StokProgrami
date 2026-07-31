'use client';

import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import type { CurrentAccount } from '@/types/currentAccount';
import type {
  CreateCustomerReturnPayload,
  CustomerReturn,
  CustomerReturnSale,
  ReturnDocument,
} from '@/types/return';
import { getErrorMessage } from '@/utils/apiError';

export function useCustomerReturns() {
  const [sales, setSales] = useState<CustomerReturnSale[]>([]);
  const [customers, setCustomers] = useState<CurrentAccount[]>([]);
  const [returns, setReturns] = useState<CustomerReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [salesResponse, accountsResponse, returnsResponse] =
        await Promise.all([
          api.get<CustomerReturnSale[]>('/sales'),
          api.get<CurrentAccount[]>('/current-accounts'),
          api.get<ReturnDocument[]>('/returns'),
        ]);

      setSales(
        salesResponse.data.filter(
          (sale) => sale.currentAccountId !== null && sale.items.length > 0,
        ),
      );
      setCustomers(
        accountsResponse.data.filter(
          (account) => account.type === 'CUSTOMER' && account.isActive,
        ),
      );
      setReturns(
        returnsResponse.data.filter(
          (returnDocument): returnDocument is CustomerReturn =>
            returnDocument.type === 'CUSTOMER_RETURN',
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

  async function createReturn(payload: CreateCustomerReturnPayload) {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      await api.post('/returns', payload);
      await loadData();
      setMessage('Müşteri iadesi kaydedildi; stok ve cari bakiye güncellendi.');
      return true;
    } catch (createError) {
      setError(getErrorMessage(createError));
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    sales,
    customers,
    returns,
    loading,
    saving,
    error,
    message,
    createReturn,
  };
}
