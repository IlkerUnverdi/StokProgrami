

'use client';

import { FormEvent } from 'react';

type BrandFormProps = {
  brandName: string;
  editingBrandId: number | null;
  saving: boolean;
  onBrandNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function BrandForm({
  brandName,
  editingBrandId,
  saving,
  onBrandNameChange,
  onSubmit,
  onCancel,
}: BrandFormProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            {editingBrandId ? 'Markayı Düzenle' : 'Yeni Marka'}
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Örnek: Bosch, Valeo, TRW, MGA.
          </p>
        </div>

        {editingBrandId ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Vazgeç
          </button>
        ) : null}
      </div>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]"
      >
        <input
          type="text"
          value={brandName}
          onChange={(e) => onBrandNameChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          placeholder="Örn: Bosch"
        />

        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
        >
          {editingBrandId ? 'Güncelle' : 'Marka Ekle'}
        </button>
      </form>
    </div>
  );
}