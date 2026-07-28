'use client';

import { useCurrentAccounts } from '@/hooks/useCurrentAccounts';
import { CurrentAccountList } from './components/CurrentAccountList';
import { CurrentAccountForm } from './components/CurrentAccountForm';

export default function CurrentAccountsSettingsPage() {
  const {
    accounts,
    filteredAccounts,
    selectedAccountId,
    formMode,
    form,
    search,
    loading,
    saving,
    message,
    error,
    setSearch,
    resetForm,
    selectAccountForEdit,
    updateForm,
    handleSave,
  } = useCurrentAccounts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Cari Ayarları
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Cari oluşturun, arayın, düzenleyin ve aktif/pasif durumunu yönetin.
          </p>
        </div>
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_430px]">
        <CurrentAccountList
          accounts={accounts}
          filteredAccounts={filteredAccounts}
          selectedAccountId={selectedAccountId}
          search={search}
          loading={loading}
          onSearchChange={setSearch}
          onSelectAccount={selectAccountForEdit}
        />

        <CurrentAccountForm
          accountName={form.name}
          phone={form.phone}
          taxNumber={form.taxNumber}
          address={form.address}
          accountType={form.type}
          isActive={form.isActive}
          editingAccountId={formMode === 'edit' ? selectedAccountId : null}
          saving={saving}
          onAccountNameChange={(value) => updateForm('name', value)}
          onPhoneChange={(value) => updateForm('phone', value)}
          onTaxNumberChange={(value) => updateForm('taxNumber', value)}
          onAddressChange={(value) => updateForm('address', value)}
          onAccountTypeChange={(value) => updateForm('type', value)}
          onIsActiveChange={(value) => updateForm('isActive', value)}
          onSubmit={handleSave}
          onCancelEdit={resetForm}
        />
      </div>
    </div>
  );
}