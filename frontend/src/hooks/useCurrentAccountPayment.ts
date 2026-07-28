

'use client';

import { useState } from 'react';

import { api } from '@/lib/api';
import type {
  AccountWithBalance,
  CurrentAccountDetail,
} from '@/types/currentAccount';
import type { PaymentMethod } from '@/types/payment';
import { getErrorMessage } from '@/utils/apiError';

type UseCurrentAccountPaymentParams = {
  selectedAccount: CurrentAccountDetail | null;
  selectedBalance: number;
  fetchAccounts: () => Promise<void>;
  selectAccount: (account: AccountWithBalance) => Promise<void>;
  setMessage: (message: string) => void;
  setError: (message: string) => void;
};

export function useCurrentAccountPayment({
  selectedAccount,
  selectedBalance,
  fetchAccounts,
  selectAccount,
  setMessage,
  setError,
}: UseCurrentAccountPaymentParams) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentNote, setPaymentNote] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);

  function resetPaymentForm() {
    setPaymentAmount('');
    setPaymentMethod('CASH');
    setPaymentNote('');
  }

  async function handlePayment() {
    if (!selectedAccount) return;

    const amount = Number(paymentAmount.replace(',', '.'));

    setError('');
    setMessage('');

    if (!amount || amount <= 0) {
      setError('Tahsilat tutarı 0 veya negatif olamaz.');
      return;
    }

    setSavingPayment(true);

    try {
      await api.post(`/current-accounts/${selectedAccount.id}/payments`, {
        amount,
        paymentMethod,
        note: paymentNote.trim() || undefined,
      });

      setMessage('Tahsilat kaydedildi.');
      resetPaymentForm();
      await fetchAccounts();
      await selectAccount({
        ...selectedAccount,
        balance: selectedBalance - amount,
      });
    } catch (err: unknown) {
      console.error('CURRENT ACCOUNT PAYMENT ERROR:', err);
      setError(getErrorMessage(err) || 'Tahsilat kaydedilemedi.');
    } finally {
      setSavingPayment(false);
    }
  }

  return {
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    paymentNote,
    setPaymentNote,
    savingPayment,
    resetPaymentForm,
    handlePayment,
  };
}