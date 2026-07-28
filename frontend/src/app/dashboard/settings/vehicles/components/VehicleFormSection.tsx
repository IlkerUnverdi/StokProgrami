

'use client';

import { FormEvent } from 'react';

type VehicleForm = {
  brandName: string;
  modelName: string;
  engine: string;
  fuel: string;
  yearStart: string;
  yearEnd: string;
};

type FuelOption = {
  value: string;
  label: string;
};

type VehicleFormSectionProps = {
  form: VehicleForm;
  fuelOptions: FuelOption[];
  editingVariantId: number | null;
  saving: boolean;
  onFieldChange: <K extends keyof VehicleForm>(
    key: K,
    value: VehicleForm[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
};

export function VehicleFormSection({
  form,
  fuelOptions,
  editingVariantId,
  saving,
  onFieldChange,
  onSubmit,
  onCancelEdit,
}: VehicleFormSectionProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            {editingVariantId ? 'Araç Varyantını Düzenle' : 'Yeni Araç Varyantı'}
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Marka, model, motor ve yıl bilgilerini girin.
          </p>
        </div>

        {editingVariantId ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Vazgeç
          </button>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={form.brandName}
            onChange={(e) => onFieldChange('brandName', e.target.value)}
            placeholder="Marka"
            className="h-11 rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          />

          <input
            value={form.modelName}
            onChange={(e) => onFieldChange('modelName', e.target.value)}
            placeholder="Model"
            className="h-11 rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          />

          <input
            value={form.engine}
            onChange={(e) => onFieldChange('engine', e.target.value)}
            placeholder="Motor"
            className="h-11 rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          />

          <select
            value={form.fuel}
            onChange={(e) => onFieldChange('fuel', e.target.value)}
            className="h-11 rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          >
            <option value="">Yakıt Tipi</option>
            {fuelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="number"
            value={form.yearStart}
            onChange={(e) => onFieldChange('yearStart', e.target.value)}
            placeholder="Başlangıç Yılı"
            className="h-11 rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          />

          <input
            type="number"
            value={form.yearEnd}
            onChange={(e) => onFieldChange('yearEnd', e.target.value)}
            placeholder="Bitiş Yılı"
            className="h-11 rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          />

          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
          >
            {editingVariantId ? 'Güncelle' : 'Varyant Ekle'}
          </button>
        </div>
      </form>
    </div>
  );
}