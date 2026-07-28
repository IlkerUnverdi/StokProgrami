

'use client';

import { useMemo, useState } from 'react';
import {emptyPayments} from '@/constants/payment';
import type { PaymentState, PaymentType } from '@/types/payment';
import { toNumberPrice } from '@/utils/number';

export function useSalesPayments(subtotal: number) {
  const [payments, setPayments] = useState<PaymentState>(emptyPayments);
  const [selectedCurrentAccountId, setSelectedCurrentAccountId] = useState(0);
  const [note, setNote] = useState('');

  const paidTotal = useMemo(() => {
    return (
      toNumberPrice(payments.CASH) +
      toNumberPrice(payments.CARD) +
      toNumberPrice(payments.TRANSFER) +
      toNumberPrice(payments.ON_ACCOUNT)
    );
  }, [payments]);

  const remainingTotal = subtotal - paidTotal;

  function updatePayment(type: PaymentType, value: string) {
    setPayments((prev) => {
      const next = {
        ...prev,
        [type]: value,
      };

      const isCurrentAccountSale =
        toNumberPrice(prev.ON_ACCOUNT) > 0;

      if (isCurrentAccountSale && type !== 'ON_ACCOUNT') {
        const collectedTotal =
          toNumberPrice(next.CASH) +
          toNumberPrice(next.CARD) +
          toNumberPrice(next.TRANSFER);

        return {
          ...next,
          ON_ACCOUNT: Math.max(
            0,
            subtotal - collectedTotal,
          ).toFixed(2),
        };
      }

      return next;
    });
  }

  function handlePaymentInput(
    type: PaymentType,
    value: string,
  ) {
    updatePayment(type, value);
  }

  function fillSinglePayment(type: PaymentType) {
    if (type === 'ON_ACCOUNT') {
      setPayments({
        ...emptyPayments,
        ON_ACCOUNT: subtotal > 0 ? subtotal.toFixed(2) : '',
      });
    } else {
      setPayments({
        ...emptyPayments,
        [type]: subtotal > 0 ? subtotal.toFixed(2) : '',
      });
      setSelectedCurrentAccountId(0);
    }
  }

   function fillRemainingPayment(type: PaymentType) {
    if (type === 'ON_ACCOUNT') {
      const collectedTotal =
        toNumberPrice(payments.CASH) +
        toNumberPrice(payments.CARD) +
        toNumberPrice(payments.TRANSFER);

      setPayments((prev) => ({
        ...prev,
        ON_ACCOUNT: Math.max(0, subtotal - collectedTotal).toFixed(2),
      }));
      return;
    }

    const isCurrentAccountSale = toNumberPrice(payments.ON_ACCOUNT) > 0;

    if (isCurrentAccountSale) {
      const otherCollectedTotal =
        toNumberPrice(payments.CASH) +
        toNumberPrice(payments.CARD) +
        toNumberPrice(payments.TRANSFER) -
        toNumberPrice(payments[type]);
      const remaining = Math.max(0, subtotal - otherCollectedTotal);

      setPayments((prev) => ({
        ...prev,
        [type]: remaining > 0 ? remaining.toFixed(2) : '',
        ON_ACCOUNT: '0.00',
      }));
      return;
    }

    const otherTotal = Object.entries(payments).reduce((total, [key, value]) => {
        if (key === type) return total;
      return total + toNumberPrice(value);
    }, 0);

    const remaining = Math.max(0, subtotal - otherTotal);

    setPayments((prev) => ({
      ...prev,
      [type]: remaining > 0 ? remaining.toFixed(2) : '',
    }));
  }

  return {
    payments,
    setPayments,
    selectedCurrentAccountId,
    setSelectedCurrentAccountId,
    note,
    setNote,
    paidTotal,
    remainingTotal,
    handlePaymentInput,
    updatePayment,
    fillSinglePayment,
    fillRemainingPayment,
  };
}

export { emptyPayments };
