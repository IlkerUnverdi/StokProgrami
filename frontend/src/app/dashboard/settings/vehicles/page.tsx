

'use client';

import Link from 'next/link';
import { VehicleFormSection } from './components/VehicleFormSection';
import {
  useVehicles,
  vehicleFuelOptions,
} from '@/hooks/useVehicles';
import { VehicleListSection } from './components/VehicleListSection';


export default function VehicleSettingsPage() {
  const {
    variants,
    form,
    editingVariantId,
    selectedBrand,
    selectedModel,
    variantSearch,
    loading,
    saving,
    error,
    message,
    brands,
    modelsForSelectedBrand,
    visibleVariants,
    selectedBrandVariantCount,
    setSelectedModel,
    setVariantSearch,
    updateField,
    handleBrandFilterChange,
    handleSubmit,
    deleteVariant,
    startEditVariant,
    cancelEdit,
  } = useVehicles();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Araç Ayarları
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-500">
            Araç marka, model, motor, yakıt tipi ve yıl aralığı bilgilerini buradan yönetin.
            Ürün uyumlulukları bu kayıtlar üzerinden seçilir.
          </p>
        </div>

        <Link
          href="/dashboard/settings"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          ← Sistem Ayarlarına Dön
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-neutral-500">Araç Markası</div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">
            {brands.length}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-neutral-500">Toplam Varyant</div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">
            {variants.length}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-neutral-500">Seçili Marka Varyantı</div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">
            {selectedBrandVariantCount}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Araç Varyantları
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Her kayıt marka, model, motor, yakıt ve yıl aralığı kombinasyonunu temsil eder.
            </p>
          </div>

          <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
            {visibleVariants.length} kayıt gösteriliyor
          </span>
        </div>

        <VehicleFormSection
          form={form}
          fuelOptions={vehicleFuelOptions}
          editingVariantId={editingVariantId}
          saving={saving}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
          onCancelEdit={cancelEdit}
        />

        <VehicleListSection
          brands={brands}
          models={modelsForSelectedBrand}
          selectedBrand={selectedBrand}
          selectedModel={selectedModel}
          search={variantSearch}
          visibleVariants={visibleVariants}
          loading={loading}
          saving={saving}
          onBrandChange={handleBrandFilterChange}
          onModelChange={setSelectedModel}
          onSearchChange={setVariantSearch}
          onEditVariant={startEditVariant}
          onDeleteVariant={deleteVariant}
        />
      </section>
    </div>
  );
}