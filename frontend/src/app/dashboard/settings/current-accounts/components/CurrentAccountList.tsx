'use client';

import type { AccountWithBalance} from '@/types/currentAccount';

type CurrentAccountListProps = {
  accounts: AccountWithBalance[];
  filteredAccounts: AccountWithBalance[];
  selectedAccountId: number | null;
  search: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onSelectAccount: (account: AccountWithBalance) => void;
};

export function CurrentAccountList({
  accounts,
  filteredAccounts,
  selectedAccountId,
  search,
  loading,
  onSearchChange,
  onSelectAccount,
}: CurrentAccountListProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Kayıtlı Cariler
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {accounts.length} cari kayıtlı.
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari adı, telefon veya vergi no ara"
            className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600 lg:w-96"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-sm text-neutral-500">Yükleniyor...</div>
      ) : filteredAccounts.length === 0 ? (
        <div className="p-8 text-center text-sm text-neutral-500">
          Cari bulunamadı.
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="p-4 text-left font-semibold">Cari</th>
                <th className="p-4 text-left font-semibold">Telefon</th>
                <th className="p-4 text-left font-semibold">Tip</th>
                <th className="p-4 text-left font-semibold">Durum</th>
                <th className="p-4 text-right font-semibold">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {filteredAccounts.map((account) => (
                <tr
                  key={account.id}
                  className={`border-t border-neutral-200 ${
                    selectedAccountId === account.id ? 'bg-red-50/40' : ''
                  }`}
                >
                  <td className="p-4 align-top">
                    <div className="font-medium text-neutral-900">
                      {account.name}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      Vergi No: {account.taxNumber || '-'}
                    </div>
                  </td>

                  <td className="p-4 align-top text-neutral-700">
                    {account.phone || '-'}
                  </td>

                  <td className="p-4 align-top">
                    {account.type === 'CUSTOMER' ? 'Müşteri' : 'Tedarikçi'}
                  </td>

                  <td className="p-4 align-top">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        account.isActive
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {account.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>

                  <td className="p-4 text-right align-top">
                    <button
                      type="button"
                      onClick={() => onSelectAccount(account)}
                      className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}