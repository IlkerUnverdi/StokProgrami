import { CreatePurchaseItemDto } from './create-purchase-item.dto';

export class CreatePurchaseDto {
  paymentType!: 'CASH' | 'TRANSFER' | 'CARD' | 'ON_ACCOUNT';
  currentAccountId!: number;
  note?: string;
  items!: CreatePurchaseItemDto[];
}
