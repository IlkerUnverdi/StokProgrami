import type { CustomerReturn } from '@/types/return';

import {
  calculateReturnTotal,
  formatReturnDate,
  formatReturnPrice,
} from '../_lib/returnPresentation';

type CustomerReturnHistoryProps = {
  returns: CustomerReturn[];
  loading: boolean;
};

export function CustomerReturnHistory({
  returns,
  loading,
}: CustomerReturnHistoryProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-neutral-900">
        Müşteri İade Geçmişi
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Stoğa alınan ve müşteri bakiyesinden mahsup edilen ürünler.
      </p>

      {loading ? (
        <div className="mt-5 rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          İadeler yükleniyor...
        </div>
      ) : returns.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          Müşteri iadesi bulunmuyor.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-3">İade Belgesi</th>
                <th className="px-3 py-3">Satış Belgesi</th>
                <th className="px-3 py-3">Müşteri</th>
                <th className="px-3 py-3">Ürünler</th>
                <th className="px-3 py-3">Tarih</th>
                <th className="px-3 py-3 text-right">Cari Mahsup</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((returnDocument) => (
                <tr
                  key={returnDocument.id}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <td className="px-3 py-4 font-semibold text-neutral-900">
                    {returnDocument.returnNo}
                  </td>
                  <td className="px-3 py-4 text-neutral-700">
                    {returnDocument.sourceSale?.saleNo ?? 'Eski kayıt'}
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
                    {formatReturnDate(returnDocument.createdAt)}
                  </td>
                  <td className="px-3 py-4 text-right font-semibold text-green-700">
                    {formatReturnPrice(calculateReturnTotal(returnDocument))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
