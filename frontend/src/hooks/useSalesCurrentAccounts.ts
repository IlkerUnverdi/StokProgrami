'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CurrentAccount } from '@/types/currentAccount';

export function useSalesCurrentAccounts() {
  const [currentAccounts, setCurrentAccounts] = useState<CurrentAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    async function fetchCurrentAccounts() {
      try {
        const response = await api.get<CurrentAccount[]>('/current-accounts');

        setCurrentAccounts(
          response.data.filter(
            (account) =>
              account.type === 'CUSTOMER' &&
              account.isActive,
          ),
        );
      } catch (err) {
        console.error(
          'FETCH CURRENT ACCOUNTS ERROR',
          err,
        );
      } finally {
        setLoadingAccounts(false);
      }
    }

    void fetchCurrentAccounts();
  }, []);

  return {
    currentAccounts,
    loadingAccounts,
  };
}