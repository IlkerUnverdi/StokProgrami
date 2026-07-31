import type { SupplierReturn } from '@/types/return';

import {
  calculateReturnTotal,
  formatReturnDate,
  formatReturnPrice,
  returnStatusLabels,
  supplierReturnTypeLabels,
} from '../_lib/returnPresentation';

type PendingSupplierReturnsProps = {
  returns: SupplierReturn[];
  loading: boolean;
  savingAction: string;
  onComplete: (id: number) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
};

export function PendingSupplierReturns({
  returns,
  loading,
  savingAction,
  onComplete,
  onCancel,
}: PendingSupplierReturnsProps) {
  function handleComplete(returnDocument: SupplierReturn) {
    const confirmed = window.confirm(
      `${returnDocument.returnNo} numaralı iade tamamlansın mı?\n\nÜrünler fiziksel stoktan düşecek ve iade tutarı tedarikçi borcundan mahsup edilecek.`,
    );

    if (confirmed) {
      void onComplete(returnDocument.id);
    }
  }

  function handleCancel(returnDocument: SupplierReturn) {
    const confirmed = window.confirm(
      `${returnDocument.returnNo} numaralı iade iptal edilsin mi?\n\nÜrünler tekrar satılabilir stoğa alınacak.`,
    );

    if (confirmed) {
      void onCancel(returnDocument.id);
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-neutral-900">
        İade Bekleyen Ürünler
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Bu ürünler fiziksel olarak elinizde ancak satış stokunda değildir.
      </p>

      {loading ? (
        <div className="py-10 text-center text-sm text-neutral-500">
          İadeler yükleniyor...
        </div>
      ) : returns.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          İade bekleyen ürün bulunmuyor.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {returns.map((returnDocument) => (
            <article
              key={returnDocument.id}
              className="rounded-xl border border-amber-200 bg-amber-50/40 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-neutral-900">
                    {returnDocument.returnNo}
                  </div>
                  <div className="mt-1 text-sm text-neutral-600">
                    {returnDocument.currentAccount.name} •{' '}
                    {supplierReturnTypeLabels[returnDocument.type]}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {formatReturnDate(returnDocument.createdAt)}
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {returnStatusLabels[returnDocument.status]}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {returnDocument.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium text-neutral-900">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {item.quantity} adet ×{' '}
                        {formatReturnPrice(item.unitPrice)}
                      </div>
                    </div>
                    <div className="font-semibold text-neutral-900">
                      {formatReturnPrice(item.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="font-semibold text-neutral-900">
                  Toplam: {formatReturnPrice(calculateReturnTotal(returnDocument))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={Boolean(savingAction)}
                    onClick={() => handleCancel(returnDocument)}
                    className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                  >
                    {savingAction === `cancel-${returnDocument.id}`
                      ? 'İptal Ediliyor...'
                      : 'İptal Et'}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(savingAction)}
                    onClick={() => handleComplete(returnDocument)}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {savingAction === `complete-${returnDocument.id}`
                      ? 'Tamamlanıyor...'
                      : 'İadeyi Tamamla'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
