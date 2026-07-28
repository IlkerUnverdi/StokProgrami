'use client';

import { FormEvent } from 'react';
import type { CreateProductForm, CompatibilityRow } from '@/types/product';
import type { VehicleVariant } from '@/types/vehicle';
import { ProductCodesSection } from './ProductCodesSection';
import { ProductCompatibilitySection } from './ProductCompatibilitySection';

type CodeFieldName = 'oemCodes' | 'referenceCodes';

type CategoryGroupOption = {
  id: number;
  name: string;
};

type CategoryOption = {
  id: number;
  name: string;
};

type PartBrandOption = {
  id: number;
  name: string;
};

type VehicleBrandOption = {
  id: number;
  name: string;
};

type ProductFormMode = 'create' | 'edit';

type ProductFormProps = {
  mode: ProductFormMode;
  form: CreateProductForm;
  categoryGroups: CategoryGroupOption[];
  filteredCategories: CategoryOption[];
  partBrands: PartBrandOption[];
  vehicleVariants: VehicleVariant[];
  compatibilityRows: CompatibilityRow[];
  availableBrands: VehicleBrandOption[];
  saving: boolean;
  message: string;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateField: <K extends keyof CreateProductForm>(
    key: K,
    value: CreateProductForm[K],
  ) => void;
  onUpdateCategoryGroup: (categoryGroupId: number) => void;
  onUpdateCode: (field: CodeFieldName, index: number, value: string) => void;
  onAddCode: (field: CodeFieldName) => void;
  onRemoveCode: (field: CodeFieldName, index: number) => void;
  onAddCompatibilityRow: () => void;
  onRemoveCompatibilityRow: (index: number) => void;
  onChangeCompatibilityBrand: (index: number, brandId: number) => void;
  onChangeCompatibilityModel: (index: number, modelName: string) => void;
  onChangeCompatibilityYearRange: (index: number, yearRange: string) => void;
  onChangeCompatibilityEngine: (index: number, engine: string) => void;
};

export function ProductForm({
  mode,
  form,
  categoryGroups,
  filteredCategories,
  partBrands,
  vehicleVariants,
  compatibilityRows,
  availableBrands,
  saving,
  message,
  error,
  onSubmit,
  onUpdateField,
  onUpdateCategoryGroup,
  onUpdateCode,
  onAddCode,
  onRemoveCode,
  onAddCompatibilityRow,
  onRemoveCompatibilityRow,
  onChangeCompatibilityBrand,
  onChangeCompatibilityModel,
  onChangeCompatibilityYearRange,
  onChangeCompatibilityEngine,
}: ProductFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-neutral-900">
            Temel Ürün Bilgileri
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Ürünü sistemde benzersiz şekilde tanımlayan ana alanlar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Ürün Adı
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => onUpdateField('name', event.target.value)}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-red-600"
              placeholder="Örn: Hava Filtresi"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Barkod
            </label>
            <input
              type="text"
              value={form.barcode}
              onChange={(event) => onUpdateField('barcode', event.target.value)}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-red-600"
              placeholder="869000000010"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Raf Kodu
            </label>
            <input
              type="text"
              value={form.shelfCode}
              onChange={(event) => onUpdateField('shelfCode', event.target.value)}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-red-600"
              placeholder="C-01"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Ürün Resim Linki
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(event) => onUpdateField('imageUrl', event.target.value)}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-red-600"
              placeholder="https://site.com/resim.jpg"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-neutral-900">
            Sınıflandırma
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Ürünün kategori ve parça markası bilgisini seçin.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Kategori Grubu
            </label>
            <select
              value={form.categoryGroupId}
              onChange={(event) => onUpdateCategoryGroup(Number(event.target.value))}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-red-600"
              required
            >
              <option value={0}>Grup seçin</option>
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
              value={form.categoryId}
              onChange={(event) => onUpdateField('categoryId', Number(event.target.value))}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-red-600 disabled:bg-neutral-100"
              disabled={form.categoryGroupId === 0}
              required
            >
              <option value={0}>Alt kategori seçin</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Parça Markası
            </label>
            <select
              value={form.partBrandId}
              onChange={(event) => onUpdateField('partBrandId', Number(event.target.value))}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-red-600"
              required
            >
              <option value={0}>Marka seçin</option>
              {partBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <ProductCodesSection
        oemCodes={form.oemCodes}
        referenceCodes={form.referenceCodes}
        onUpdateCode={onUpdateCode}
        onAddCode={onAddCode}
        onRemoveCode={onRemoveCode}
      />

      <ProductCompatibilitySection
        compatibilityRows={compatibilityRows}
        vehicleVariants={vehicleVariants}
        availableBrands={availableBrands}
        onAddRow={onAddCompatibilityRow}
        onRemoveRow={onRemoveCompatibilityRow}
        onChangeBrand={onChangeCompatibilityBrand}
        onChangeModel={onChangeCompatibilityModel}
        onChangeYearRange={onChangeCompatibilityYearRange}
        onChangeEngine={onChangeCompatibilityEngine}
      />

      <label className="flex items-center gap-3 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => onUpdateField('isActive', event.target.checked)}
        />
        Ürün aktif olsun
      </label>

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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? mode === 'edit'
              ? 'Güncelleniyor...'
              : 'Oluşturuluyor...'
            : mode === 'edit'
              ? 'Ürünü Güncelle'
              : 'Ürünü Oluştur'}
        </button>
      </div>
    </form>
  );
}