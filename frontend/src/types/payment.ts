export type PaymentType =
  | 'CASH'
  | 'CARD'
  | 'TRANSFER'
  | 'ON_ACCOUNT';

export type PaymentState = {
  CASH: string;
  CARD: string;
  TRANSFER: string;
  ON_ACCOUNT: string;
};
export type PaymentMethod = Exclude<PaymentType, 'ON_ACCOUNT'>;