'use client';

import { formatPrice } from '@/utils/format';
import type { CurrentAccountDetail, CurrentAccount } from '@/types/currentAccount';
import type { PaymentMethod } from '@/types/payment';

type CurrentAccountDetailPanelProps = {
  selectedAccount: CurrentAccountDetail | null;
  selectedBalance: number;
  detailLoading: boolean;
  paymentAmount: string;
  paymentMethod: PaymentMethod;
  paymentNote: string;
  savingPayment: boolean;
  onPaymentAmountChange: (value: string) => void;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onPaymentNoteChange: (value: string) => void;
  onSubmitPayment: () => void;
};

function getBalanceLabel(account: CurrentAccount | null | undefined, balance: number) {
  if (!account) return 'Cari Bakiye';

  if (account.type === 'SUPPLIER') {
    if (balance > 0) return 'Tedarikçiye Borç';
    if (balance < 0) return 'Tedarikçiden Alacak / Avans';
    return 'Tedarikçi Bakiyesi';
  }

  if (balance > 0) return 'Müşteriden Alacak';
  if (balance < 0) return 'Müşteri Avansı';
  return 'Müşteri Bakiyesi';
}

function getBalanceDescription(
  account: CurrentAccount | null | undefined,
  balance: number,
) {
  if (!account) return 'Cari hareketlere göre hesaplanan bakiye.';

  if (account.type === 'SUPPLIER') {
    if (balance > 0) return 'Pozitif bakiye sizin tedarikçiye borcunuzu gösterir.';
    if (balance < 0) return 'Negatif bakiye tedarikçiye fazla ödeme/avans verdiğinizi gösterir.';
    return 'Bu tedarikçiyle açık bakiye yok.';
  }

  if (balance > 0) return 'Pozitif bakiye müşteriden alacağınızı gösterir.';
  if (balance < 0) return 'Negatif bakiye müşterinin fazla ödeme/avansını gösterir.';
  return 'Bu müşteriyle açık bakiye yok.';
}

export function CurrentAccountDetailPanel({
  selectedAccount,
  selectedBalance,
  detailLoading,
  paymentAmount,
  paymentMethod,
  paymentNote,
  savingPayment,
  onPaymentAmountChange,
  onPaymentMethodChange,
  onPaymentNoteChange,
  onSubmitPayment,
}: CurrentAccountDetailPanelProps) {
  return (
    <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
      {!selectedAccount && !detailLoading ? (
        <div className="text-sm text-neutral-500">
          Detay görmek ve tahsilat girmek için cari seçin.
        </div>
      ) : detailLoading ? (
        <div className="text-sm text-neutral-500">Cari detayı yükleniyor...</div>
      ) : selectedAccount ? (
        <div className="space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  {selectedAccount.name}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {selectedAccount.type === 'CUSTOMER' ? 'Müşteri' : 'Tedarikçi'}{' '}
                  • {selectedAccount.phone || 'Telefon yok'}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedAccount.isActive
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {selectedAccount.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>

            <div className="mt-4 rounded-2xl bg-neutral-50 p-4">
              <div className="text-sm text-neutral-500">
                {getBalanceLabel(selectedAccount, selectedBalance)}
              </div>
              <div
                className={`mt-1 text-3xl font-bold ${
                  selectedBalance > 0
                    ? 'text-red-700'
                    : selectedBalance < 0
                      ? 'text-green-700'
                      : 'text-neutral-900'
                }`}
              >
                {formatPrice(selectedBalance)}
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {getBalanceDescription(selectedAccount, selectedBalance)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-4">
            <h3 className="font-semibold text-neutral-900">Tahsilat Gir</h3>
            <div className="mt-3 space-y-3">
              <input
                value={paymentAmount}
                onChange={(event) => onPaymentAmountChange(event.target.value)}
                placeholder="Tutar"
                className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
              />

              <select
                value={paymentMethod}
                onChange={(event) =>
                  onPaymentMethodChange(event.target.value as PaymentMethod)
                }
                className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-red-600"
              >
                <option value="CASH">Nakit</option>
                <option value="CARD">Kart</option>
                <option value="TRANSFER">Havale/EFT</option>
              </select>

              <input
                value={paymentNote}
                onChange={(event) => onPaymentNoteChange(event.target.value)}
                placeholder="Not / açıklama"
                className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
              />

              <button
                type="button"
                onClick={onSubmitPayment}
                disabled={savingPayment}
                className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPayment ? 'Kaydediliyor...' : 'Tahsilat Kaydet'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}