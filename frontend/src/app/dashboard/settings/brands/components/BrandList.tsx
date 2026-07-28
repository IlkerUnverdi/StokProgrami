'use client';

import { PartBrand } from '@/types/brand';

type BrandListProps = {
  brands: PartBrand[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (brand: PartBrand) => void;
  onDelete: (brand: PartBrand) => void;
};

export function BrandList({
  brands,
  loading,
  search,
  onSearchChange,
  onEdit,
  onDelete,
}: BrandListProps) {
  return (
    <>
      <div className="mt-4 rounded-2xl border border-neutral-200 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-neutral-900">
            Mevcut Markalar
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Kayıtlı markalar arasında arama yapın veya düzenlemek için seçim yapın.
          </p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-red-600"
          placeholder="Marka ara..."
        />
      </div>

      <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-sm text-neutral-500">Yükleniyor...</div>
        ) : brands.length === 0 ? (
          <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
            {search
              ? 'Aramaya uygun marka bulunamadı.'
              : 'Henüz marka yok.'}
          </div>
        ) : (
          brands.map((brand) => {
            const productCount = brand.products?.length ?? 0;

            return (
              <div
                key={brand.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3"
              >
                <div>
                  <div className="font-medium text-neutral-900">{brand.name}</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {productCount} ürün
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(brand)}
                    className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(brand)}
                    className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Sil
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}