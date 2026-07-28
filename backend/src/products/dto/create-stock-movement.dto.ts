export class CreateStockMovementDto {
  productId!: number;
  type!: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity!: number;

  unitCost?: number; // alış fiyatı (stok girişi için)
  reference?: string; // fatura no vs
  note?: string;
}
