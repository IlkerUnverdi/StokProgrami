'use client';

import Link from 'next/link';
import { usePartBrands } from '@/hooks/usePartBrands';
import { BrandList } from './components/BrandList';
import { BrandForm } from './components/BrandForm';

export default function BrandSettingsPage() {
  const {
    brands,
    visibleBrands,
    activeBrandCount,
    loading,
    saving,
    error,
    message,
    brandName,
    setBrandName,
    editingBrandId,
    brandSearch,
    setBrandSearch,
    handleSubmit,
    deleteBrand,
    startEditBrand,
    cancelEdit,
  } = usePartBrands();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Marka Ayarları
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-500">
            Valeo, Bosch, TRW, MGA gibi parça markalarını buradan ekleyin,
            düzenleyin veya silin.
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-neutral-500">Toplam Marka</div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">
            {brands.length}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-neutral-500">Aktif Marka</div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">
            {activeBrandCount}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Parça Markaları
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Ürünlerde kullanılacak markaları sade bir listeden yönetin.
          </p>
        </div>

        <BrandForm
          brandName={brandName}
          editingBrandId={editingBrandId}
          saving={saving}
          onBrandNameChange={setBrandName}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
        />

        <BrandList
          brands={visibleBrands}
          loading={loading}
          search={brandSearch}
          onSearchChange={setBrandSearch}
          onEdit={startEditBrand}
          onDelete={deleteBrand}
        />
      </section>
    </div>
  );
}