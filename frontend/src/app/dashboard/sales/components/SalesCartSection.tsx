'use client';

import { formatPrice } from '@/utils/format';
import type { CartItem} from '@/types/sales';
import { toNumberPrice } from '@/utils/number';
import {getPrimaryOem, getPrimaryReference} from "@/utils/product";

type SalesCartSectionProps = {
  cart: CartItem[];
  cartHydrated: boolean;
  onClearCart: () => void;
  onIncreaseQuantity: (productId: number) => void;
  onDecreaseQuantity: (productId: number) => void;
  onRemoveItem: (productId: number) => void;
};

export function SalesCartSection({
  cart,
  cartHydrated,
  onClearCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
}: SalesCartSectionProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Sepet</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Satışa eklenecek ürünleri buradan yönetin.
          </p>
        </div>

        {cart.length > 0 ? (
          <button
            type="button"
            onClick={onClearCart}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Sepeti Temizle
          </button>
        ) : null}
      </div>

      <div className="mt-5">
        {!cartHydrated ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            Sepet yükleniyor...
          </div>
        ) : cart.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            Sepet boş. Ürün arayıp sepete ekleyin.
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => {
              const unitPrice = item.unitPrice ?? toNumberPrice(item.product.salePrice);
              const lineTotal = item.lineTotal ?? unitPrice * item.quantity;
              const stock = item.product.currentStock ?? 0;

              return (
              <div
                key={item.product.id}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold text-neutral-900">
                      {item.product.name}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {item.product.partBrand?.name || 'Marka yok'}
                      {' • '}Raf: {item.product.shelfCode || '-'}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      Barkod: {item.product.barcode || '-'} • Stok: {stock}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-600">
                      <span className="rounded-full bg-white px-3 py-1">
                        OEM: {getPrimaryOem(item.product)}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1">
                        Ref: {getPrimaryReference(item.product)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center rounded-xl border border-neutral-300 bg-white">
                      <button
                        type="button"
                        onClick={() => onDecreaseQuantity(item.product.id)}
                        className="h-10 w-10 text-lg font-semibold text-neutral-700 hover:bg-neutral-100"
                      >
                        -
                      </button>
                      <div className="min-w-12 px-3 text-center text-sm font-semibold text-neutral-900">
                        {item.quantity}
                      </div>
                      <button
                        type="button"
                        onClick={() => onIncreaseQuantity(item.product.id)}
                        className="h-10 w-10 text-lg font-semibold text-neutral-700 hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-neutral-500">Birim</div>
                      <div className="font-semibold text-neutral-900">
                        {formatPrice(unitPrice)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-neutral-500">Toplam</div>
                      <div className="font-bold text-neutral-900">
                        {formatPrice(lineTotal)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.product.id)}
                      className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}