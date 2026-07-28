

'use client';

import Link from 'next/link';

type ProductPageHeaderProps = {
  cartTotalQuantity: number;
};

export function ProductPageHeader({ cartTotalQuantity }: ProductPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Ürünler
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Ürünleri arayın, filtreleyin, son alışlarını görüntüleyin ve satış sepetine ekleyin.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard/products/create"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Yeni Ürün
        </Link>

        <Link
          href="/dashboard/products/settings"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Ürün Ayarları
        </Link>

        <Link
          href="/dashboard/sales"
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Satış Ekranı
          {cartTotalQuantity > 0 ? ` (${cartTotalQuantity})` : ''}
        </Link>
      </div>
    </div>
  );
}