export class CreatePurchaseItemDto {
  productId!: number;
  quantity!: number;
  unitPrice!: number;
  discount?: number;
}
