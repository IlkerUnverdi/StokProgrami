export class CreatePaymentDto {
  amount!: number;
  paymentMethod!: 'CASH' | 'CARD' | 'TRANSFER';
  note?: string;
}
