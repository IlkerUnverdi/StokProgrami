export class CreateSaleItemDto {
  productId!: number;
  quantity!: number;
  unitPrice!: number;
  discount?: number;
}
