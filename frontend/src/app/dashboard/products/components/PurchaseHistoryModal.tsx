'use client';

import type {
  PurchaseHistoryItem,
  PurchaseHistoryResponse,
} from '@/types/purchase';
import { formatPrice, formatTime } from '@/utils/format';

type PurchaseHistoryModalProps = {
  open: boolean;
  loading: boolean;
  productName?: string;
  currentSalePrice?: string | number | null;
  productSummary?: PurchaseHistoryResponse['summary'] | null;
  purchaseHistory: PurchaseHistoryItem[];
  onClose: () => void;
};

export function PurchaseHistoryModal({
  open,
  loading,
  productName,
  currentSalePrice,
  productSummary,
  purchaseHistory,
  onClose,
}: PurchaseHistoryModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Ürün Detayı</h2>

            <div className="mt-1 text-sm text-neutral-500">
              {productName || 'Ürün'} için fiyat özeti ve son alış hareketleri
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Kapat
          </button>
        </div>

        {!loading ? (
          <>
            <div className="grid gap-4 p-6 md:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Güncel Satış Fiyatı
                </div>
                <div className="mt-2 text-xl font-bold text-neutral-900">
                  {currentSalePrice != null
                    ? formatPrice(currentSalePrice)
                    : '-'}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Son Alış
                </div>
                <div className="mt-2 text-xl font-bold text-green-700">
                  {productSummary?.lastPurchasePrice != null
                    ? formatPrice(productSummary.lastPurchasePrice)
                    : 'Alış yok'}
                </div>
                {productSummary?.lastPurchasePrice != null ? (
                  <div className="mt-2 space-y-1 text-xs text-neutral-500">
                    <div>
                      {productSummary.lastSupplierName ||
                        'Tedarikçi bilgisi yok'}
                    </div>
                    {productSummary.lastPurchaseDate ? (
                      <div>
                        {new Date(
                          productSummary.lastPurchaseDate,
                        ).toLocaleDateString('tr-TR')}{' '}
                        {formatTime(productSummary.lastPurchaseDate)}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Son Satış
                </div>
                <div className="mt-2 text-xl font-bold text-red-700">
                  {productSummary?.lastSalePrice != null
                    ? formatPrice(productSummary.lastSalePrice)
                    : 'Satış yok'}
                </div>
                {productSummary?.lastSalePrice != null ? (
                  <div className="mt-2 space-y-1 text-xs text-neutral-500">
                    <div>
                      {productSummary.lastCustomerName || 'Perakende satış'}
                    </div>
                    {productSummary.lastSaleDate ? (
                      <div>
                        {new Date(
                          productSummary.lastSaleDate,
                        ).toLocaleDateString('tr-TR')}{' '}
                        {formatTime(productSummary.lastSaleDate)}
                      </div>
                    ) : null}
                    {productSummary.lastSaleNo ? (
                      <div>{productSummary.lastSaleNo}</div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t border-neutral-200 px-6 py-4">
              <h3 className="font-semibold text-neutral-900">
                Son Alış Hareketleri
              </h3>
            </div>
          </>
        ) : null}

        {loading ? (
          <div className="p-10 text-center text-sm text-neutral-500">
            Ürün detayları yükleniyor...
          </div>
        ) : purchaseHistory.length === 0 ? (
          <div className="border-t border-neutral-200 p-10 text-center text-sm text-neutral-500">
            Bu ürüne ait alış geçmişi bulunamadı.
          </div>
        ) : (
          <div className="max-h-[50vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-neutral-100">
                <tr>
                  <th className="p-4 text-left font-semibold text-neutral-700">
                    Tarih
                  </th>

                  <th className="p-4 text-left font-semibold text-neutral-700">
                    Tedarikçi
                  </th>

                  <th className="p-4 text-right font-semibold text-neutral-700">
                    Adet
                  </th>

                  <th className="p-4 text-right font-semibold text-neutral-700">
                    Birim Fiyat
                  </th>

                  <th className="p-4 text-right font-semibold text-neutral-700">
                    Toplam
                  </th>

                  <th className="p-4 text-left font-semibold text-neutral-700">
                    Referans
                  </th>
                </tr>
              </thead>

              <tbody>
                {purchaseHistory.map((item) => {
                  const createdAt = item.purchase.createdAt;
                  const supplierName =
                    item.purchase.currentAccount?.name || 'Tedarikçi Yok';
                  const unitPrice = item.unitPrice;
                  const total = item.lineTotal;

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-neutral-200 hover:bg-neutral-50"
                    >
                      <td className="p-4 align-middle text-neutral-600">
                        <div>{formatTime(createdAt)}</div>

                        <div className="mt-1 text-xs text-neutral-400">
                          {new Date(createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </td>

                      <td className="p-4 align-middle">
                        <div className="font-semibold text-neutral-900">
                          {supplierName}
                        </div>
                      </td>

                      <td className="p-4 text-right align-middle font-medium text-neutral-900">
                        {item.quantity}
                      </td>

                      <td className="p-4 text-right align-middle text-neutral-700">
                        {formatPrice(unitPrice)}
                      </td>

                      <td className="p-4 text-right align-middle font-bold text-green-700">
                        {formatPrice(total)}
                      </td>

                      <td className="p-4 align-middle text-neutral-500">
                        {item.purchase.purchaseNo || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
