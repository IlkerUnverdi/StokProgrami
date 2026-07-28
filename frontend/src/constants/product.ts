import type {
  CompatibilityRow,
  CreateProductForm,
  FormState,
} from '@/types/product';

export const initialCreateProductForm: CreateProductForm = {
  name: '',
  imageUrl: '',
  barcode: '',
  shelfCode: '',
  isActive: true,
  categoryGroupId: 0,
  categoryId: 0,
  partBrandId: 0,
  oemCodes: [''],
  referenceCodes: [''],
};

export const emptyCompatibilityRow: CompatibilityRow = {
  brandId: 0,
  variantId: 0,
};

export const emptyProductForm: FormState = {
  name: '',
  barcode: '',
  shelfCode: '',
  imageUrl: '',
  salePrice: '',
  purchasePrice: '',
  categoryGroupId: '',
  categoryId: '',
  partBrandId: '',
  isActive: true,
};