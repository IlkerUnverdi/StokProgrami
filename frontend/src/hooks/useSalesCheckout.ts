'use client';

import { useState } from 'react';

import { api } from '@/lib/api';
import type { CartItem } from '@/types/sales';
import { emptyPayments } from '@/constants/payment';
import type { PaymentState } from '@/types/payment';
import { toNumberPrice } from '@/utils/number';
import { getErrorMessage } from '@/utils/apiError';
import { CurrentAccount } from '@/types/currentAccount';

type UseSalesCheckoutParams = {
  cart: CartItem[];
  subtotal: number;
  remainingTotal: number;
  payments: PaymentState;
  selectedCurrentAccount?: CurrentAccount;
  note: string;
  clearCart: (confirmBeforeClear?: boolean) => boolean;
  setPayments: (payments: PaymentState) => void;
  setSelectedCurrentAccountId: (value: number) => void;
  setNote: (value: string) => void;
  setMessage: (value: string) => void;
  setError: (value: string) => void;
};

export function useSalesCheckout({
  cart,
  subtotal,
  remainingTotal,
  payments,
  selectedCurrentAccount,
  note,
  clearCart,
  setPayments,
  setSelectedCurrentAccountId,
  setNote,
  setMessage,
  setError,
}: UseSalesCheckoutParams) {
  const [saving, setSaving] = useState(false);

  async function completeSale() {
    setError('');
    setMessage('');

    if (cart.length === 0) {
      return;
    }

    if (subtotal <= 0) {
      setError('Satış toplamı 0 olamaz. Ürün fiyatlarını kontrol edin.');
      return;
    }

    if (Math.abs(remainingTotal) > 0.01) {
      setError('Ödeme toplamı genel toplam ile eşit olmalı.');
      return;
    }

    const currentAccountDebt = toNumberPrice(payments.ON_ACCOUNT);

    if (currentAccountDebt > 0 && !selectedCurrentAccount) {
      setError('Borca satış için cari seçilmelidir.');
      return;
    }

    setSaving(true);

    try {
      await api.post('/sales', {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: toNumberPrice(item.product.salePrice),
        })),
        payments: {
          CASH: toNumberPrice(payments.CASH),
          CARD: toNumberPrice(payments.CARD),
          TRANSFER: toNumberPrice(payments.TRANSFER),
          ON_ACCOUNT: toNumberPrice(payments.ON_ACCOUNT),
        },
        currentAccountName: selectedCurrentAccount?.name,
        note: note.trim() || undefined,
      });

      clearCart(false);
      setPayments(emptyPayments);
      setSelectedCurrentAccountId(0);
      setNote('');
      setMessage('Satış başarıyla tamamlandı.');
    } catch (err: unknown) {
      console.error('CREATE SALE ERROR', err);
      setError(getErrorMessage(err) || 'Satış kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return {
    saving,
    completeSale,
  };
}