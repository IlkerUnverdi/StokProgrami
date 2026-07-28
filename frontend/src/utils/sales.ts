// frontend/src/utils/sales.ts

import type { SaleItem } from '@/types/dashboard';

export function groupSaleItems(items: SaleItem[]) {
  const map = new Map<number, SaleItem>();

  for (const item of items) {
    const existing = map.get(item.product.id);

    if (existing) {
      map.set(item.product.id, {
        ...existing,
        quantity: existing.quantity + item.quantity,
        lineTotal: String(Number(existing.lineTotal) + Number(item.lineTotal)),
      });
    } else {
      map.set(item.product.id, item);
    }
  }

  return Array.from(map.values());
}

export function getPaymentBadges(note?: string | null) {
  if (!note) return [] as Array<{ label: string; value: string }>;

  return note
    .split('|')
    .map((item) => item.trim())
    .map((item) => {
      const [label, ...rest] = item.split(':');
      const value = rest.join(':').trim();

      if (!label || !value) return null;

      return {
        label: label.trim(),
        value,
      };
    })
    .filter(Boolean) as Array<{ label: string; value: string }>;
}

export function getCleanSaleNote(note?: string | null) {
  if (!note) return '';

  return note
    .split('|')
    .map((item) => item.trim())
    .filter((item) => {
      const lower = item.toLocaleLowerCase('tr');

      return !(
        lower.startsWith('nakit:') ||
        lower.startsWith('kart:') ||
        lower.startsWith('havale/eft:') ||
        lower.startsWith('cari borç:')
      );
    })
    .join(' | ');
}

export function getPrimaryOem(item: SaleItem) {
  const primary = item.product.oemCodes?.find((code) => code.isPrimary);
  return primary?.code || item.product.oemCodes?.[0]?.code || '-';
}

export function getPrimaryReference(item: SaleItem) {
  return item.product.referenceCodes?.[0]?.code || '-';
}