import type { VehicleVariant } from '@/types/vehicle';

export type ProductListItem = {
  id: number;
  name: string;
  barcode?: string | null;
  imageUrl?: string | null;
  currentStock?: number;
  categoryId?: number;
  salePrice?: string | number | null;
  purchasePrice?: string | number | null;
  shelfCode?: string | null;
  isActive?: boolean;

  category?: {
    id: number;
    name: string;
    categoryGroup?: {
      id: number;
      name: string;
    } | null;
  } | null;

  partBrand?: {
    id?: number;
    name: string;
  } | null;

  oemCodes?: {
    id?: number;
    code: string;
    isPrimary?: boolean;
  }[];

  referenceCodes?: {
    id?: number;
    code: string;
  }[];

  compatibilities?: {
    id?: number;
    vehicleVariant?: VehicleVariant | null;
  }[];

  vehicleCompatibilities?: {
    id?: number;
    vehicleVariant: VehicleVariant;
  }[];
};

export type CreateProductForm = {
  name: string;
  imageUrl?: string;
  barcode: string;
  shelfCode: string;
  isActive: boolean;
  categoryGroupId: number;
  categoryId: number;
  partBrandId: number;
  oemCodes: string[];
  referenceCodes: string[];
};

export type CompatibilityRow = {
  brandId: number;
  modelName?: string;
  yearRange?: string;
  variantId: number;
};

export type RichProduct = ProductListItem & {
  description?: string | null;
};

export type ProductCompatibility = {
  id: number;
  vehicleVariantId: number;
  vehicleVariant?: VehicleVariant | null;
};

export type FormState = {
  name: string;
  barcode: string;
  shelfCode: string;
  imageUrl: string;
  salePrice: string;
  purchasePrice: string;
  categoryGroupId: string;
  categoryId: string;
  partBrandId: string;
  isActive: boolean;
};