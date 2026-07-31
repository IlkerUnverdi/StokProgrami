import type {
  ReturnDocument,
  ReturnStatus,
  SupplierReturnType,
} from '@/types/return';

export const supplierReturnTypeLabels: Record<SupplierReturnType, string> = {
  SUPPLIER_RETURN: 'Normal Tedarikçi İadesi',
  DEFECTIVE_RETURN: 'Arızalı Ürün İadesi',
  WRONG_ITEM_RETURN: 'Yanlış Ürün İadesi',
};

export const returnStatusLabels: Record<ReturnStatus, string> = {
  PENDING: 'İade Bekliyor',
  COMPLETED: 'İade Edildi',
  CANCELLED: 'İptal Edildi',
};

export function formatReturnPrice(
  value: string | number | null | undefined,
) {
  return `${Number(value ?? 0).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
}

export function formatReturnDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function calculateReturnTotal(returnDocument: ReturnDocument) {
  return returnDocument.items.reduce(
    (sum, item) => sum + Number(item.lineTotal),
    0,
  );
}
