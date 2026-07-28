

'use client';

import { api } from '@/lib/api';
import { printCurrentAccountStatement } from '@/lib/printTemplates/currentAccountStatement';
import type {
  CurrentAccountDetail,
  ManualPayment,
} from '@/types/dashboard';

type UseCurrentAccountStatementParams = {
  setError: (message: string) => void;
};

export function useCurrentAccountStatement({
  setError,
}: UseCurrentAccountStatementParams) {
  async function handlePrintCurrentAccountStatement(payment: ManualPayment) {
    const currentAccountId = payment.currentAccount?.id;

    if (!currentAccountId) {
      setError('Cari hesap bilgisi bulunamadı.');
      return;
    }

    try {
      const [detailResponse, balanceResponse] = await Promise.all([
        api.get<CurrentAccountDetail>(`/current-accounts/${currentAccountId}`),
        api.get<{ balance: string | number }>(
          `/current-accounts/${currentAccountId}/balance`,
        ),
      ]);

      printCurrentAccountStatement(
        payment,
        detailResponse.data,
        Number(balanceResponse.data.balance),
      );
    } catch (err) {
      console.error('PRINT CURRENT ACCOUNT STATEMENT ERROR:', err);
      setError('Cari ekstre yazdırılamadı.');
    }
  }

  return {
    handlePrintCurrentAccountStatement,
  };
}