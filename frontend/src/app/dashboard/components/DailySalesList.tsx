'use client';

import { printSaleReceipt } from '@/lib/printTemplates/saleReceipt';
import type { Sale } from '@/types/dashboard';
import { formatPrice, formatTime } from '@/utils/format';
import {
  getCleanSaleNote,
  getPaymentBadges,
  getPrimaryOem,
  getPrimaryReference,
  groupSaleItems,
} from '@/utils/sales';

type DailySalesListProps = {
  sales: Sale[];
  openSaleId: number | null;
  onToggleSale: (saleId: number | null) => void;
};

export function DailySalesList({
  sales,
  openSaleId,
  onToggleSale,
}: DailySalesListProps) {
  return (
    <>
      {sales.map((sale) => {
        const isOpen = openSaleId === sale.id;
        const groupedItems = groupSaleItems(sale.items);
        const itemCount = groupedItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const paymentBadges = getPaymentBadges(sale.note);

        return (
          <div key={sale.id}>
            <div className="grid grid-cols-1 gap-3 p-5 lg:grid-cols-[120px_90px_1fr_180px_220px_auto] lg:items-center">
              <div className="font-semibold text-neutral-900">
                {sale.saleNo}
              </div>

              <div className="text-sm text-neutral-500">
                {formatTime(sale.createdAt)}
              </div>

              <div>
                <div className="font-medium text-neutral-900">
                  {sale.currentAccount?.name || 'Peşin / Anlık Satış'}
                </div>
                <div className="text-xs text-neutral-500">
                  {itemCount} adet ürün
                </div>
              </div>

              <div className="font-bold text-neutral-900">
                {formatPrice(sale.grandTotal)}
              </div>

              <div className="flex flex-wrap gap-2">
                {paymentBadges.length > 0 ? (
                  paymentBadges.map((payment) => (
                    <span
                      key={`${sale.id}-${payment.label}-${payment.value}`}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700"
                    >
                      {payment.label}: {payment.value} ₺
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-neutral-400">-</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => onToggleSale(isOpen ? null : sale.id)}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                {isOpen ? 'Kapat' : 'Detay'}
              </button>
            </div>

            {isOpen ? (
              <div className="bg-neutral-50 px-5 pb-5">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-sm text-neutral-500">Satış Fişi</div>
                      <h3 className="mt-1 text-2xl font-bold text-neutral-900">
                        {sale.saleNo}
                      </h3>
                      <div className="mt-2 text-sm text-neutral-500">
                        {new Date(sale.createdAt).toLocaleString('tr-TR')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3 lg:min-w-[620px]">
                      <div className="rounded-xl bg-neutral-50 p-4">
                        <div className="text-neutral-500">Müşteri / Cari</div>
                        <div className="mt-1 font-semibold text-neutral-900">
                          {sale.currentAccount?.name || 'Peşin / Anlık Satış'}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {sale.currentAccount?.phone || '-'}
                        </div>
                      </div>

                      <div className="rounded-xl bg-neutral-50 p-4">
                        <div className="text-neutral-500">Ürün Adedi</div>
                        <div className="mt-1 text-xl font-bold text-neutral-900">
                          {itemCount}
                        </div>
                      </div>

                      <div className="rounded-xl bg-neutral-50 p-4">
                        <div className="text-neutral-500">Genel Toplam</div>
                        <div className="mt-1 text-xl font-bold text-neutral-900">
                          {formatPrice(sale.grandTotal)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
                    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                      <table className="w-full text-sm">
                        <thead className="bg-neutral-100">
                          <tr>
                            <th className="p-3 text-left">Ürün</th>
                            <th className="p-3 text-left">OEM</th>
                            <th className="p-3 text-left">Reference</th>
                            <th className="p-3 text-right">Adet</th>
                            <th className="p-3 text-right">Birim</th>
                            <th className="p-3 text-right">Toplam</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedItems.map((item) => (
                            <tr
                              key={item.product.id}
                              className="border-t border-neutral-200"
                            >
                              <td className="p-3 align-top">
                                <div className="font-medium text-neutral-900">
                                  {item.product.name}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  {item.product.partBrand?.name || '-'}
                                </div>
                              </td>
                              <td className="p-3 align-top">
                                {getPrimaryOem(item)}
                              </td>
                              <td className="p-3 align-top">
                                {getPrimaryReference(item)}
                              </td>
                              <td className="p-3 text-right align-top">
                                {item.quantity}
                              </td>
                              <td className="p-3 text-right align-top">
                                {formatPrice(item.unitPrice)}
                              </td>
                              <td className="p-3 text-right align-top font-semibold">
                                {formatPrice(item.lineTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <h4 className="font-semibold text-neutral-900">
                          Ödeme Dağılımı
                        </h4>

                        <div className="mt-3 space-y-2 text-sm">
                          {paymentBadges.length > 0 ? (
                            paymentBadges.map((payment) => (
                              <div
                                key={`${sale.id}-detail-${payment.label}-${payment.value}`}
                                className="flex justify-between gap-3"
                              >
                                <span className="text-neutral-600">
                                  {payment.label}
                                </span>
                                <span className="font-semibold text-neutral-900">
                                  {payment.value} ₺
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-neutral-500">-</div>
                          )}

                          <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-bold text-neutral-900">
                            <span>Toplam</span>
                            <span>{formatPrice(sale.grandTotal)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <h4 className="font-semibold text-neutral-900">Not</h4>
                        <div className="mt-2 text-sm text-neutral-600">
                          {getCleanSaleNote(sale.note) || '-'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void printSaleReceipt(sale)}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                      >
                        Yazdır
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
