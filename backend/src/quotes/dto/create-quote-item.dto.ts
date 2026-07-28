export class CreateQuoteItemDto {
  productId!: number;
  quantity!: number;
  unitPrice!: number;
  discount?: number;
}
