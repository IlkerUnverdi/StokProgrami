'use client';

import type { AccountType } from '@/types/currentAccount';

type CurrentAccountFormProps = {
  accountName: string;
  phone: string;
  taxNumber: string;
  address: string;
  accountType: AccountType;
  isActive: boolean;
  editingAccountId: number | null;
  saving: boolean;
  onAccountNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onTaxNumberChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onAccountTypeChange: (value: AccountType) => void;
  onIsActiveChange: (value: boolean) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
};

export function CurrentAccountForm({
  accountName,
  phone,
  taxNumber,
  address,
  accountType,
  isActive,
  editingAccountId,
  saving,
  onAccountNameChange,
  onPhoneChange,
  onTaxNumberChange,
  onAddressChange,
  onAccountTypeChange,
  onIsActiveChange,
  onSubmit,
  onCancelEdit,
}: CurrentAccountFormProps) {
  return (
    <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            {editingAccountId ? 'Cari Düzenle' : 'Yeni Cari'}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Müşteri veya tedarikçi kaydı oluşturun.
          </p>
        </div>

        {editingAccountId ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium hover:bg-neutral-100"
          >
            Vazgeç
          </button>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Cari Adı</label>
          <input
            value={accountName}
            onChange={(e) => onAccountNameChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Telefon</label>
          <input
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Vergi No</label>
          <input
            value={taxNumber}
            onChange={(e) => onTaxNumberChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Adres</label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Cari Tipi</label>
          <select
            value={accountType}
            onChange={(e) => onAccountTypeChange(e.target.value as AccountType)}
            className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          >
            <option value="CUSTOMER">Müşteri</option>
            <option value="SUPPLIER">Tedarikçi</option>
          </select>
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => onIsActiveChange(e.target.checked)}
          />
          Aktif Cari
        </label>

        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {saving
            ? 'Kaydediliyor...'
            : editingAccountId
              ? 'Cariyi Güncelle'
              : 'Cari Ekle'}
        </button>
      </div>
    </aside>
  );
}