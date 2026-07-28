export class CreateSaleDto {
  items!: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
  }>;

  payments!: {
    CASH?: number;
    CARD?: number;
    TRANSFER?: number;
    ON_ACCOUNT?: number;
  };

  currentAccountName?: string;
  note?: string;
}
