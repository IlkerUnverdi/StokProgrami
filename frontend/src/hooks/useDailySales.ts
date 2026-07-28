'use client';

import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import type { DailySalesResponse } from '@/types/dashboard';
import { todayInputValue } from '@/utils/format';

export function useDailySales() {
  const [date, setDate] = useState(todayInputValue());
  const [data, setData] = useState<DailySalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDailySales = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get<DailySalesResponse>(
        `/dashboard/sales-daily?date=${date}`,
      );

      setData(response.data);
    } catch (err) {
      console.error('DASHBOARD SALES ERROR:', err);
      setError('Günlük satış bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void fetchDailySales();
  }, [fetchDailySales]);

  return {
    date,
    setDate,
    data,
    loading,
    error,
    setError,
    refreshDailySales: fetchDailySales,
  };
}