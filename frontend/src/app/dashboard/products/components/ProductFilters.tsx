'use client';

import { SearchInput } from '@/components/ui/SearchInput';

type Option = {
  id: number;
  name: string;
};

type YearRangeOption = {
  value: string;
  label: string;
};

type ProductFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;

  categoryGroupId: number;
  onCategoryGroupChange: (value: number) => void;

  categoryId: number;
  onCategoryChange: (value: number) => void;

  vehicleBrandId: number;
  onVehicleBrandChange: (value: number) => void;

  vehicleModelName: string;
  onVehicleModelChange: (value: string) => void;

  vehicleYearRange: string;
  onVehicleYearRangeChange: (value: string) => void;

  vehicleEngine: string;
  onVehicleEngineChange: (value: string) => void;

  categoryGroups: Option[];
  filteredCategories: Option[];

  availableVehicleBrands: Option[];
  availableVehicleModels: string[];
  availableVehicleYearRanges: YearRangeOption[];
  availableVehicleEngines: string[];
};

export function ProductFilters({
  search,
  onSearchChange,
  categoryGroupId,
  onCategoryGroupChange,
  categoryId,
  onCategoryChange,
  vehicleBrandId,
  onVehicleBrandChange,
  vehicleModelName,
  onVehicleModelChange,
  vehicleYearRange,
  onVehicleYearRangeChange,
  vehicleEngine,
  onVehicleEngineChange,
  categoryGroups,
  filteredCategories,
  availableVehicleBrands,
  availableVehicleModels,
  availableVehicleYearRanges,
  availableVehicleEngines,
}: ProductFiltersProps) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Arama
          </label>
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Ürün adı / parça no / OEM / reference / araç bilgisi"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Kategori Grubu
          </label>
          <select
            value={categoryGroupId}
            onChange={(event) => {
              onCategoryGroupChange(Number(event.target.value));
              onCategoryChange(0);
            }}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-red-600"
          >
            <option value={0}>Tümü</option>
            {categoryGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Alt Kategori
          </label>
          <select
            value={categoryId}
            onChange={(event) => onCategoryChange(Number(event.target.value))}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-red-600"
          >
            <option value={0}>Tümü</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Araç Markası
          </label>
          <select
            value={vehicleBrandId}
            onChange={(event) => {
              onVehicleBrandChange(Number(event.target.value));
              onVehicleModelChange('');
              onVehicleYearRangeChange('');
              onVehicleEngineChange('');
            }}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-red-600"
          >
            <option value={0}>Tümü</option>
            {availableVehicleBrands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Araç Modeli
          </label>
          <select
            value={vehicleModelName}
            onChange={(event) => {
              onVehicleModelChange(event.target.value);
              onVehicleYearRangeChange('');
              onVehicleEngineChange('');
            }}
            disabled={vehicleBrandId === 0}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-red-600 disabled:bg-neutral-100 disabled:text-neutral-400"
          >
            <option value="">Tümü</option>
            {availableVehicleModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Yıl Aralığı
          </label>
          <select
            value={vehicleYearRange}
            onChange={(event) => {
              onVehicleYearRangeChange(event.target.value);
              onVehicleEngineChange('');
            }}
            disabled={vehicleBrandId === 0 || vehicleModelName === ''}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-red-600 disabled:bg-neutral-100 disabled:text-neutral-400"
          >
            <option value="">Tümü</option>
            {availableVehicleYearRanges.map((range) => (
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
            value={vehicleEngine}
            onChange={(event) => onVehicleEngineChange(event.target.value)}
            disabled={vehicleBrandId === 0 || vehicleModelName === ''}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-red-600 disabled:bg-neutral-100 disabled:text-neutral-400"
          >
            <option value="">Tümü</option>
            {availableVehicleEngines.map((engine) => (
              <option key={engine} value={engine}>
                {engine}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}