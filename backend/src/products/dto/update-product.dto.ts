export class UpdateProductDto {
  name?: string;
  imageUrl?: string;
  barcode?: string;
  shelfCode?: string;
  lastPurchasePrice?: number;
  salePrice?: number;
  minSalePrice?: number;
  isActive?: boolean;
  categoryId?: number;
  partBrandId?: number;
}
