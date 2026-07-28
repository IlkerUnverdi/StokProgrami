

import type { ProductListItem } from '@/types/product';

export function getPrimaryOem(product: ProductListItem) {
  const primary = product.oemCodes?.find((code) => code.isPrimary);
  return primary?.code || product.oemCodes?.[0]?.code || '-';
}

export function getPrimaryReference(product: ProductListItem) {
  return product.referenceCodes?.[0]?.code || '-';
}

export function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

export function isValidOptionalUrl(value: string) {
  const url = value.trim();

  if (!url) return true;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}