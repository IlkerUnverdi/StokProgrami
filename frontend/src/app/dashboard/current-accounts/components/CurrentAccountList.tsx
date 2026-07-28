'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice } from '@/utils/format';
import type { AccountWithBalance } from "@/types/currentAccount";

type CurrentAccountListProps = {
  accounts: AccountWithBalance[];
  loading: boolean;
  search: string;
  selectedAccountId: number | null;
  onSearchChange: (value: string) => void;
  onSelectAccount: (account: AccountWithBalance) => void | Promise<void>;
};

export function CurrentAccountList({
  accounts,
  loading,
  search,
  selectedAccountId,
  onSearchChange,
  onSelectAccount,
}: CurrentAccountListProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Cari Listesi
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Cari hesapları arayın, seçin ve detaylarını görüntüleyin.
            </p>
          </div>

          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari adı, telefon veya vergi no ara"
            className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-red-600 md:w-80"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-5 text-sm text-neutral-500">
          Cari hesaplar yükleniyor...
        </div>
      ) : accounts.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="Cari hesap bulunamadı"
            description="Arama kriterlerini değiştirerek tekrar deneyin."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="p-3 text-left font-semibold text-neutral-600">
                  Cari
                </th>
                <th className="p-3 text-left font-semibold text-neutral-600">
                  Telefon
                </th>
                <th className="p-3 text-left font-semibold text-neutral-600">
                  Tip
                </th>
                <th className="p-3 text-right font-semibold text-neutral-600">
                  Bakiye
                </th>
                <th className="p-3 text-right font-semibold text-neutral-600">
                  İşlem
                </th>
              </tr>
            </thead>

            <tbody>
              {accounts.map((account) => {
                const isSelected = selectedAccountId === account.id;
                const numericBalance = Number(account.balance ?? 0);

                return (
                  <tr
                    key={account.id}
                    className={`border-t border-neutral-200 transition ${
                      isSelected ? 'bg-red-50/60' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <td className="p-3 align-middle">
                      <div className="font-semibold text-neutral-900">
                        {account.name}
                      </div>
                      <div className="mt-0.5 text-xs text-neutral-500">
                        {account.taxNumber || '-'}
                      </div>
                    </td>

                    <td className="p-3 align-middle text-neutral-600">
                      {account.phone || '-'}
                    </td>

                    <td className="p-3 align-middle text-neutral-600">
                      {account.type === 'CUSTOMER' ? 'Müşteri' : 'Tedarikçi'}
                    </td>

                    <td className="p-3 text-right align-middle">
                      <span
                        className={`font-bold ${
                          numericBalance > 0
                            ? 'text-red-700'
                            : numericBalance < 0
                              ? 'text-green-700'
                              : 'text-neutral-700'
                        }`}
                      >
                        {formatPrice(account.balance)}
                      </span>
                    </td>

                    <td className="p-3 text-right align-middle">
                      <button
                        type="button"
                        onClick={() => onSelectAccount(account)}
                        className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {isSelected ? 'Seçili' : 'Detay'}
                      </button>
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