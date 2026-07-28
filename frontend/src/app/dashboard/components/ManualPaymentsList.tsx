'use client';

import type { ManualPayment } from '@/types/dashboard';
import { formatPrice, formatTime } from '@/utils/format';

type ManualPaymentsListProps = {
  manualPayments: ManualPayment[];
  manualPaymentTotal: string | number;
  onPrintStatement: (payment: ManualPayment) => void;
};

export function ManualPaymentsList({
  manualPayments,
  manualPaymentTotal,
  onPrintStatement,
}: ManualPaymentsListProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-neutral-200 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Son Cari Tahsilatları
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Seçili güne ait manuel cari tahsilat hareketleri.
          </p>
        </div>

        <div className="rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
          Toplam: {formatPrice(manualPaymentTotal)}
        </div>
      </div>

      {manualPayments.length === 0 ? (
        <div className="p-5 text-sm text-neutral-500">
          Bu gün için manuel cari tahsilat kaydı yok.
        </div>
      ) : (
        <div className="divide-y divide-neutral-200">
          {manualPayments.map((payment) => (
            <div
              key={payment.id}
              className="grid grid-cols-1 gap-3 p-5 lg:grid-cols-[100px_1fr_160px_180px_auto] lg:items-center"
            >
              <div className="text-sm text-neutral-500">
                {formatTime(payment.createdAt)}
              </div>

              <div>
                <div className="font-medium text-neutral-900">
                  {payment.currentAccount?.name ?? 'Cari hesap'}
                </div>
                <div className="text-xs text-neutral-500">
                  {payment.currentAccount?.phone ?? '-'}
                </div>
              </div>

              <div className="font-bold text-green-700">
                {formatPrice(payment.amount)}
              </div>

              <div className="text-sm text-neutral-500">
                {payment.note || '-'}
              </div>

              {payment.currentAccount?.id ? (
                <button
                  type="button"
                  onClick={() => onPrintStatement(payment)}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  Cari Ekstre Yazdır
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}