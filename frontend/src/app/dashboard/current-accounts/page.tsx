'use client';

import { useCurrentAccounts } from '@/hooks/useCurrentAccounts';
import { AccountWithBalance } from '@/types/currentAccount';
import { useCurrentAccountPayment } from '@/hooks/useCurrentAccountPayment';
import { CurrentAccountList } from './components/CurrentAccountList';
import { CurrentAccountDetailPanel } from './components/CurrentAccountDetailPanel';
import { CurrentAccountMovements } from './components/CurrentAccountMovements';
import { formatPrice } from '@/utils/format';

export default function CurrentAccountsPage() {
  const {
    accounts,
    selectedAccount,
    selectedBalance,
    search,
    loading,
    detailLoading,
    message,
    error,
    filteredAccounts,
    customerReceivable,
    supplierDebt,
    totalCredit,
    setSearch,
    setMessage,
    setError,
    fetchAccounts,
    selectAccount,
  } = useCurrentAccounts();

  const {
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    paymentNote,
    setPaymentNote,
    savingPayment,
    resetPaymentForm,
    handlePayment,
  } = useCurrentAccountPayment({
    selectedAccount,
    selectedBalance,
    fetchAccounts,
    selectAccount,
    setMessage,
    setError,
  });

  async function handleSelectAccount(account: AccountWithBalance) {
    resetPaymentForm();
    await selectAccount(account);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900">Cariler</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Cari bakiyeleri, borç hareketlerini ve tahsilatları buradan takip edin.
        </p>
      </div>

      {message ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-neutral-500">Toplam Cari</div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">
            {accounts.length}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-neutral-500">Müşteri Alacağı</div>
          <div className="mt-2 text-2xl font-bold text-red-700">
            {formatPrice(customerReceivable)}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-neutral-500">Tedarikçiye Borç</div>
          <div className="mt-2 text-2xl font-bold text-red-700">
            {formatPrice(supplierDebt)}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-neutral-500">Fazla Tahsilat / Avans</div>
          <div className="mt-2 text-2xl font-bold text-green-700">
            {formatPrice(totalCredit)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_430px]">
        <CurrentAccountList
          accounts={filteredAccounts}
          loading={loading}
          search={search}
          selectedAccountId={selectedAccount?.id ?? null}
          onSearchChange={setSearch}
          onSelectAccount={handleSelectAccount}
        />

        <CurrentAccountDetailPanel
          selectedAccount={selectedAccount}
          selectedBalance={selectedBalance}
          detailLoading={detailLoading}
          paymentAmount={paymentAmount}
          paymentMethod={paymentMethod}
          paymentNote={paymentNote}
          savingPayment={savingPayment}
          onPaymentAmountChange={setPaymentAmount}
          onPaymentMethodChange={setPaymentMethod}
          onPaymentNoteChange={setPaymentNote}
          onSubmitPayment={handlePayment}
        />
      </div>

      {selectedAccount ? (
        <CurrentAccountMovements
          movements={selectedAccount.currentAccountMovements ?? []}
        />
      ) : null}
    </div>
  );
}