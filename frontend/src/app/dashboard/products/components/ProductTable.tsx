'use client';

import type { ProductListItem } from '@/types/product';
import { formatPrice } from '@/utils/format';
import {
  getPrimaryOem,
  getPrimaryReference,
} from '@/utils/product';
import { formatVehicleVariantLabel } from '@/utils/vehicle';
import { EmptyState } from '@/components/ui/EmptyState';
import { StockBadge } from '@/components/ui/StockBadge';

interface ProductTableProps {
  products: ProductListItem[];
  loading: boolean;
  selectedQuantities: Record<number, number>;
  cartQuantities: Record<number, number>;
  onIncreaseQuantity: (productId: number) => void;
  onDecreaseQuantity: (productId: number) => void;
  onAddToCart: (product: ProductListItem) => void;
  onOpenPurchaseHistory: (product: ProductListItem) => void;
  onPreviewImage?: (product: ProductListItem) => void;
}

export default function ProductTable({
  products,
  loading,
  selectedQuantities,
  cartQuantities,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onAddToCart,
  onOpenPurchaseHistory,
  onPreviewImage,
}: ProductTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500 shadow-sm">
        Ürünler yükleniyor...
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        title="Ürün bulunamadı"
        description="Arama veya filtre kriterlerini değiştirerek tekrar deneyin."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100 text-neutral-700">
            <tr>
              <th className="p-4 text-left font-semibold">Ürün</th>
              <th className="p-4 text-left font-semibold">Kodlar</th>
              <th className="p-4 text-left font-semibold">Araç Uyumluluğu</th>
              <th className="p-4 text-center font-semibold">Stok</th>
              <th className="p-4 text-right font-semibold">Satış</th>
              <th className="p-4 text-center font-semibold">Sepet</th>
              <th className="p-4 text-center font-semibold">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const selectedQuantity = selectedQuantities[product.id] ?? 1;
              const cartQuantity = cartQuantities[product.id] ?? 0;
              const compatibilities = [
                ...(product.vehicleCompatibilities ?? []),
                ...(product.compatibilities ?? []),
              ].filter((item) => item.vehicleVariant);

              return (
                <tr
                  key={product.id}
                  onDoubleClick={(event) => {
                    const target = event.target as HTMLElement;

                    if (
                      target.closest(
                        'button, a, input, select, textarea',
                      )
                    ) {
                      return;
                    }

                    onOpenPurchaseHistory(product);
                  }}
                  className="border-t border-neutral-200 transition hover:bg-neutral-50"
                >
                  <td className="p-4 align-top">
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (onPreviewImage) {
                            onPreviewImage(product);
                          }
                        }}
                        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-neutral-400">
                            Resim
                          </span>
                        )}
                      </button>

                      <div>
                        <div className="font-semibold text-neutral-900">
                          {product.name}
                        </div>

                        <div className="mt-1 text-xs text-neutral-500">
                          Barkod: {product.barcode || '-'}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {product.partBrand?.name ? (
                            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                              {product.partBrand.name}
                            </span>
                          ) : null}

                          {product.category?.name ? (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                              {product.category.name}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 align-top">
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="font-semibold text-neutral-500">
                          OEM
                        </div>
                        <div className="mt-1 text-neutral-900">
                          {getPrimaryOem(product) || '-'}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-neutral-500">
                          REF
                        </div>
                        <div className="mt-1 text-neutral-900">
                          {getPrimaryReference(product) || '-'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 align-top">
                    <div className="max-w-[260px] space-y-2 text-xs text-neutral-700">
                      {compatibilities.length ? (
                        compatibilities.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="whitespace-pre-line rounded-xl border border-neutral-200 bg-neutral-50 p-2"
                          >
                            {formatVehicleVariantLabel(item.vehicleVariant)}
                          </div>
                        ))
                      ) : (
                        <span className="text-neutral-400">
                          Uyumluluk yok
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-center align-top">
                    <StockBadge stock={product.currentStock ?? 0} />
                  </td>

                  <td className="p-4 text-right align-top font-semibold text-neutral-900">
                    {formatPrice(product.salePrice ?? 0)}
                  </td>

                  <td className="p-4 align-top">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDecreaseQuantity(product.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-300 bg-white text-lg font-semibold text-neutral-700 hover:bg-neutral-100"
                      >
                        -
                      </button>

                      <div className="min-w-[40px] text-center font-semibold text-neutral-900">
                        {selectedQuantity}
                      </div>

                      <button
                        type="button"
                        onClick={() => onIncreaseQuantity(product.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-300 bg-white text-lg font-semibold text-neutral-700 hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>

                    {cartQuantity > 0 ? (
                      <div className="mt-2 text-center text-xs font-medium text-green-700">
                        Sepette: {cartQuantity}
                      </div>
                    ) : null}
                  </td>

                  <td className="p-4 text-center align-top">
                    <button
                      type="button"
                      onClick={() => onAddToCart(product)}
                      className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                      Sepete Ekle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
