import type { SupplierReturn } from '@/types/return';

import {
  calculateReturnTotal,
  formatReturnDate,
  formatReturnPrice,
  returnStatusLabels,
} from '../_lib/returnPresentation';

type SupplierReturnHistoryProps = {
  returns: SupplierReturn[];
};

export function SupplierReturnHistory({
  returns,
}: SupplierReturnHistoryProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-neutral-900">İade Geçmişi</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Tamamlanan ve iptal edilen tedarikçi iadeleri.
      </p>

      {returns.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          Geçmiş iade kaydı bulunmuyor.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-3">Belge</th>
                <th className="px-3 py-3">Tedarikçi</th>
                <th className="px-3 py-3">Ürünler</th>
                <th className="px-3 py-3">Tarih</th>
                <th className="px-3 py-3 text-right">Toplam</th>
                <th className="px-3 py-3 text-right">Durum</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((returnDocument) => {
                const total = calculateReturnTotal(returnDocument);

                return (
                  <tr
                    key={returnDocument.id}
                    className="border-b border-neutral-100 last:border-0"
                  >
                    <td className="px-3 py-4 font-semibold text-neutral-900">
                      {returnDocument.returnNo}
                    </td>
                    <td className="px-3 py-4">
                      {returnDocument.currentAccount.name}
                    </td>
                    <td className="px-3 py-4">
                      {returnDocument.items.map((item) => (
                        <div key={item.id}>
                          {item.product.name} • {item.quantity} adet
                        </div>
                      ))}
                    </td>
                    <td className="px-3 py-4 text-neutral-600">
                      {formatReturnDate(
                        returnDocument.completedAt ??
                          returnDocument.createdAt,
                      )}
                    </td>
                    <td className="px-3 py-4 text-right font-semibold">
                      {formatReturnPrice(total)}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          returnDocument.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {returnStatusLabels[returnDocument.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
