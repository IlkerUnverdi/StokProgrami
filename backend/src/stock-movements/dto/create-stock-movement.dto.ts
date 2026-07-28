export class CreateStockMovementDto {
  productId!: number;
  supplierId?: number;
  type!: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity!: number;
  unitCost?: number;
  reference?: string;
  note?: string;
}
