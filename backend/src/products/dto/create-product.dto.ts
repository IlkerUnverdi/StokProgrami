export class CreateProductDto {
  name!: string;
  imageUrl?: string;
  barcode!: string;
  shelfCode!: string;
  lastPurchasePrice!: string;
  salePrice!: string;
  minSalePrice!: string;
  isActive!: boolean;
  categoryId!: number;
  partBrandId!: number;

  oemCodes?: string[];
  referenceCodes?: string[];
}
