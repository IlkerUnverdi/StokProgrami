

'use client';

type VehicleVariant = {
  id: number;
  brandName: string;
  modelName: string;
  engine: string;
  fuel?: string | null;
  yearStart?: number | null;
  yearEnd?: number | null;
};

type VehicleListSectionProps = {
  brands: string[];
  models: string[];
  selectedBrand: string;
  selectedModel: string;
  search: string;
  visibleVariants: VehicleVariant[];
  loading: boolean;
  saving: boolean;
  onBrandChange: (brandId: string) => void;
  onModelChange: (modelName: string) => void;
  onSearchChange: (value: string) => void;
  onEditVariant: (variant: VehicleVariant) => void;
  onDeleteVariant: (variant: VehicleVariant) => void;
};

function formatYearRange(variant: VehicleVariant) {
  if (!variant.yearStart && !variant.yearEnd) {
    return '-';
  }

  return `${variant.yearStart ?? ''}-${variant.yearEnd ?? ''}`;
}

export function VehicleListSection({
  brands,
  models,
  selectedBrand,
  selectedModel,
  search,
  visibleVariants,
  loading,
  saving,
  onBrandChange,
  onModelChange,
  onSearchChange,
  onEditVariant,
  onDeleteVariant,
}: VehicleListSectionProps) {
  return (
    <div className="mt-4 rounded-2xl border border-neutral-200 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-neutral-900">
          Mevcut Araç Kayıtları
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          Marka, model veya metin araması ile araç varyantlarını filtreleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <select
          value={selectedBrand}
          onChange={(event) => onBrandChange(event.target.value)}
          className="h-10 rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-red-600"
        >
          <option value={0}>Tüm markalar</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <select
          value={selectedModel}
          onChange={(event) => onModelChange(event.target.value)}
          disabled={!selectedBrand}
          className="h-10 rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-red-600 disabled:bg-neutral-100 disabled:text-neutral-400"
        >
          <option value="">Tüm modeller</option>
          {models.map((modelName) => (
            <option key={modelName} value={modelName}>
              {modelName}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-10 rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-red-600"
          placeholder="Araç ara..."
        />
      </div>

      <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-sm text-neutral-500">Yükleniyor...</div>
        ) : visibleVariants.length === 0 ? (
          <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
            Araç varyantı bulunamadı.
          </div>
        ) : (
          visibleVariants.map((variant) => (
            <div
              key={variant.id}
              className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="font-medium text-neutral-900">
                  {variant.brandName} {variant.modelName}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Motor: {variant.engine || '-'} • Yakıt: {variant.fuel || '-'} • Yıl: {formatYearRange(variant)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEditVariant(variant)}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  Düzenle
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteVariant(variant)}
                  disabled={saving}
                  className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}