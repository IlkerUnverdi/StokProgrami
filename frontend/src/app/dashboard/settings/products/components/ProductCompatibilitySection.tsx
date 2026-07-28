

'use client';

import type { CompatibilityRow } from '@/types/product';
import type { VehicleVariant } from '@/types/vehicle';
import {
  getVehicleEngineOptions,
  getVehicleModelOptions,
  getVehicleYearRangeOptions,
} from '@/hooks/useVehicleFilters';

type VehicleBrandOption = {
  id: number;
  name: string;
};

type ProductCompatibilitySectionProps = {
  compatibilityRows: CompatibilityRow[];
  vehicleVariants: VehicleVariant[];
  availableBrands: VehicleBrandOption[];
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onChangeBrand: (index: number, brandId: number) => void;
  onChangeModel: (index: number, modelName: string) => void;
  onChangeYearRange: (index: number, yearRange: string) => void;
  onChangeEngine: (index: number, engine: string) => void;
};

export function ProductCompatibilitySection({
  compatibilityRows,
  vehicleVariants,
  availableBrands,
  onAddRow,
  onRemoveRow,
  onChangeBrand,
  onChangeModel,
  onChangeYearRange,
  onChangeEngine,
}: ProductCompatibilitySectionProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Uyumlu Araçlar
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Araç uyumluluğunu Marka → Model → Yıl Aralığı → Motor sırasıyla seçin.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddRow}
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Araç Ekle
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {compatibilityRows.map((row, index) => {
          const modelOptions = getVehicleModelOptions(
            vehicleVariants,
            row.brandId,
          );

          const yearRangeOptions = getVehicleYearRangeOptions(
            vehicleVariants,
            row.brandId,
            row.modelName ?? '',
          );

          const engineOptions = getVehicleEngineOptions(
            vehicleVariants,
            row.brandId,
            row.modelName ?? '',
            row.yearRange ?? '',
          );

          const selectedVariant = vehicleVariants.find(
            (variant) => variant.id === row.variantId,
          );

          return (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Marka
                </label>
                <select
                  value={row.brandId}
                  onChange={(event) =>
                    onChangeBrand(index, Number(event.target.value))
                  }
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-red-600"
                >
                  <option value={0}>Marka seçin</option>
                  {availableBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Model
                </label>
                <select
                  value={row.modelName ?? ''}
                  onChange={(event) => onChangeModel(index, event.target.value)}
                  disabled={row.brandId === 0}
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-red-600 disabled:bg-neutral-100 disabled:text-neutral-400"
                >
                  <option value="">Model seçin</option>
                  {modelOptions.map((modelName) => (
                    <option key={modelName} value={modelName}>
                      {modelName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Yıl Aralığı
                </label>
                <select
                  value={row.yearRange ?? ''}
                  onChange={(event) =>
                    onChangeYearRange(index, event.target.value)
                  }
                  disabled={row.brandId === 0 || !row.modelName}
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-red-600 disabled:bg-neutral-100 disabled:text-neutral-400"
                >
                  <option value="">Yıl aralığı seçin</option>
                  {yearRangeOptions.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Motor
                </label>
                <select
                  value={selectedVariant?.engine ?? ''}
                  onChange={(event) => onChangeEngine(index, event.target.value)}
                  disabled={
                    row.brandId === 0 || !row.modelName || !row.yearRange
                  }
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-red-600 disabled:bg-neutral-100 disabled:text-neutral-400"
                >
                  <option value="">Motor seçin</option>
                  {engineOptions.map((engine) => (
                    <option key={engine} value={engine}>
                      {engine}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => onRemoveRow(index)}
                  disabled={compatibilityRows.length === 1}
                  className="h-11 rounded-xl border border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sil
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}