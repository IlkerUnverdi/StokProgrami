import type { PaymentState } from '@/types/payment';

export const emptyPayments: PaymentState = {
  CASH: '',
  CARD: '',
  TRANSFER: '',
  ON_ACCOUNT: '',
};