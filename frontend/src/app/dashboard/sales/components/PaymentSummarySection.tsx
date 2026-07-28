'use client';

import { formatPrice } from '@/utils/format';
import { toNumberPrice } from '@/utils/number';
import type { PaymentState, PaymentType } from '@/types/payment';

type CurrentAccount = {
  id: number;
  name: string;
  phone?: string | null;
};

type PaymentSummarySectionProps = {
  subtotal: number;
  remainingTotal: number;
  payments: PaymentState;
  currentAccounts: CurrentAccount[];
  selectedCurrentAccountId: number;
  note: string;
  error: string;
  saving: boolean;
  cartLength: number;
  onFillSinglePayment: (type: PaymentType) => void;
  onFillRemainingPayment: (type: PaymentType) => void;
  onPaymentInput: (type: PaymentType, value: string) => void;
  onClearPayments: () => void;
  onCurrentAccountChange: (value: number) => void;
  onNoteChange: (value: string) => void;
  onCompleteSale: () => void;
};

export function PaymentSummarySection({
  subtotal,
  remainingTotal,
  payments,
  currentAccounts,
  selectedCurrentAccountId,
  note,
  error,
  saving,
  cartLength,
  onFillSinglePayment,
  onFillRemainingPayment,
  onPaymentInput,
  onClearPayments,
  onCurrentAccountChange,
  onNoteChange,
  onCompleteSale,
}: PaymentSummarySectionProps) {
  const collectedTotal =
    toNumberPrice(payments.CASH) +
    toNumberPrice(payments.CARD) +
    toNumberPrice(payments.TRANSFER);
  const onAccountTotal = toNumberPrice(payments.ON_ACCOUNT);

  return (
    <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
      <div>
        <div className="text-sm font-medium text-neutral-500">Genel Toplam</div>
        <div className="mt-1 text-4xl font-bold text-neutral-900">
          {formatPrice(subtotal)}
        </div>
        <div
          className={`mt-2 text-sm font-semibold ${
            Math.abs(remainingTotal) <= 0.01
              ? 'text-green-700'
              : remainingTotal > 0
                ? 'text-orange-700'
                : 'text-red-700'
          }`}
        >
          {remainingTotal >= 0 ? 'Kalan' : 'Fazla Ödeme'}:{' '}
          {formatPrice(Math.abs(remainingTotal))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onFillSinglePayment('CASH')}
          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Nakit tamamı
        </button>
        <button
          type="button"
          onClick={() => onFillSinglePayment('CARD')}
          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Kart tamamı
        </button>
        <button
          type="button"
          onClick={() => onFillSinglePayment('TRANSFER')}
          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Havale tamamı
        </button>
        <button
          type="button"
          onClick={() => onFillSinglePayment('ON_ACCOUNT')}
          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Cariye yaz
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-neutral-700">
              Parçalı Ödeme
            </label>
            <button
              type="button"
              onClick={onClearPayments}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Temizle
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-700">Nakit</span>
                <button
                  type="button"
                  onClick={() => onFillRemainingPayment('CASH')}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
                >
                  Kalanı yaz
                </button>
              </div>
              <input
                value={payments.CASH}
                onChange={(event) => onPaymentInput('CASH', event.target.value)}
                placeholder="0.00"
                className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-700">Kart</span>
                <button
                  type="button"
                  onClick={() => onFillRemainingPayment('CARD')}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
                >
                  Kalanı yaz
                </button>
              </div>
              <input
                value={payments.CARD}
                onChange={(event) => onPaymentInput('CARD', event.target.value)}
                placeholder="0.00"
                className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-700">Havale/EFT</span>
                <button
                  type="button"
                  onClick={() => onFillRemainingPayment('TRANSFER')}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
                >
                  Kalanı yaz
                </button>
              </div>
              <input
                value={payments.TRANSFER}
                onChange={(event) =>
                  onPaymentInput('TRANSFER', event.target.value)
                }
                placeholder="0.00"
                className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-700">Cari Borç</span>
                <button
                  type="button"
                  onClick={() => onFillRemainingPayment('ON_ACCOUNT')}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
                >
                  Satışı cariye yaz
                </button>
              </div>
              <input
                value={payments.ON_ACCOUNT}
                readOnly
                placeholder="0.00"
                className="h-11 w-full rounded-xl border border-neutral-300 bg-neutral-100 px-4 text-neutral-700 outline-none"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Cari satışta borç otomatik hesaplanır. Nakit, kart veya havale
                girerseniz cari borçtan düşer.
              </p>
            </div>
          </div>
        </div>

        {onAccountTotal > 0 ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Cari Seç
            </label>

            <select
              value={selectedCurrentAccountId}
              onChange={(event) =>
                onCurrentAccountChange(Number(event.target.value))
              }
              className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
            >
              <option value={0}>Cari seçin</option>
              {currentAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                  {account.phone ? ` (${account.phone})` : ''}
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-neutral-500">
              Cari listesi Cari Ayarları ekranından yönetilir. Elle isim
              yazılamaz.
            </p>
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Not
          </label>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            rows={3}
            placeholder="Satış notu opsiyonel"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-red-600"
          />
        </div>

        <div className="rounded-2xl bg-neutral-50 p-4">
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Ara Toplam</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-neutral-600">
            <span>Tahsilat</span>
            <span>{formatPrice(collectedTotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-neutral-600">
            <span>Cariye Yazılacak</span>
            <span>{formatPrice(onAccountTotal)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-base font-bold text-neutral-900">
            <span>Genel Toplam</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onCompleteSale}
          disabled={saving || cartLength === 0 || Math.abs(remainingTotal) > 0.01}
          className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Satış Kaydediliyor...' : 'Satışı Tamamla'}
        </button>
      </div>
    </aside>
  );
}