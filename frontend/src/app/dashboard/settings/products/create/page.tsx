'use client';

import Link from 'next/link';
import axios from 'axios';
import { FormEvent, useMemo, useState } from 'react';
import { createProduct } from '@/services/products';
import { api } from '@/lib/api';
import { useProductMeta } from '@/hooks/useProductMeta';
import { emptyProductForm, useProductForm } from '@/hooks/useProductForm';

import { isValidOptionalUrl } from '@/utils/product';

import { ProductForm } from '../components/ProductForm';

export default function CreateProductPage() {
  const {
    categories,
    partBrands,
    vehicleVariants,
    loadingMeta,
    error: metaError,
  } = useProductMeta();

  const {
    form,
    setForm,
    compatibilityRows,
    filteredCategories,
    availableBrands,
    cleanedOemCodes,
    cleanedReferenceCodes,
    selectedVehicleVariantIds,
    updateField,
    updateCategoryGroup,
    updateCodeField,
    addCodeField,
    removeCodeField,
    addCompatibilityRow,
    removeCompatibilityRow,
    updateCompatibilityBrand,
    updateCompatibilityModel,
    updateCompatibilityYearRange,
    updateCompatibilityEngine,
    resetProductForm,
  } = useProductForm(vehicleVariants, categories);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');


  const categoryGroups = useMemo(() => {
    const map = new Map<number, { id: number; name: string }>();

    for (const category of categories) {
      if (category.categoryGroup) {
        map.set(category.categoryGroup.id, category.categoryGroup);
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'tr'),
    );
  }, [categories]);



  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const trimmedName = form.name.trim();
      const trimmedImageUrl = form.imageUrl?.trim() || '';
      const trimmedBarcode = form.barcode.trim();
      const trimmedShelfCode = form.shelfCode.trim().toUpperCase();
      const trimmedSalePrice = form.salePrice?.trim() ?? '';
      const salePrice = Number(trimmedSalePrice);

      if (!trimmedName) {
        setError('Ürün adı zorunludur.');
        setSaving(false);
        return;
      }

      if (!trimmedBarcode) {
        setError('Barkod zorunludur.');
        setSaving(false);
        return;
      }

      if (!trimmedShelfCode) {
        setError('Raf kodu zorunludur.');
        setSaving(false);
        return;
      }

      if (
        !trimmedSalePrice ||
        !Number.isFinite(salePrice) ||
        salePrice < 0
      ) {
        setError('Geçerli bir satış fiyatı girilmelidir.');
        setSaving(false);
        return;
      }

      if (!isValidOptionalUrl(trimmedImageUrl)) {
        setError('Ürün resim linki geçerli bir http/https URL olmalıdır.');
        setSaving(false);
        return;
      }

      if (form.categoryGroupId <= 0) {
        setError('Kategori grubu seçilmelidir.');
        setSaving(false);
        return;
      }

      if (form.categoryId <= 0) {
        setError('Alt kategori seçilmelidir.');
        setSaving(false);
        return;
      }

      if (form.partBrandId <= 0) {
        setError('Parça markası seçilmelidir.');
        setSaving(false);
        return;
      }


      const uniqueVariantIds = selectedVehicleVariantIds;

      const createdProduct = await createProduct({
        name: trimmedName,
        imageUrl: trimmedImageUrl,
        barcode: trimmedBarcode,
        shelfCode: trimmedShelfCode,
        salePrice: trimmedSalePrice,
        isActive: form.isActive,
        categoryId: form.categoryId,
        partBrandId: form.partBrandId,
        oemCodes: cleanedOemCodes,
        referenceCodes: cleanedReferenceCodes,
      });

      for (const vehicleVariantId of uniqueVariantIds) {
        await api.post(`/products/${createdProduct.id}/compatibilities`, {
          vehicleVariantId,
        });
      }

      setMessage('Yeni ürün başarıyla oluşturuldu.');
      setForm(emptyProductForm);
      resetProductForm();
    } catch (err: unknown) {
      console.error('CREATE PRODUCT ERROR:', err);

      let messageText = 'Ürün oluşturulamadı.';

      if (axios.isAxiosError(err)) {
        const rawMessage = err.response?.data?.message;
        messageText =
          typeof rawMessage === 'string'
            ? rawMessage
            : Array.isArray(rawMessage)
              ? rawMessage.join(', ')
              : messageText;
      }

      setError(messageText);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Yeni Ürün Oluştur
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Ürünün kimlik bilgilerini, kodlarını ve uyumlu araçlarını tanımlayın.
            Satış fiyatını belirleyin; alış ve stok bilgileri işlemlerden
            güncellenir.
          </p>
        </div>

        <Link
          href="/dashboard/settings/products"
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Ürün Ayarlarına Dön
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        {loadingMeta ? (
          <div className="text-sm text-neutral-500">
            Kategori, marka ve araç bilgileri yükleniyor...
          </div>
        ) : metaError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {metaError}
          </div>
        ) : (
          <ProductForm
            mode="create"
            form={form}
            categoryGroups={categoryGroups}
            filteredCategories={filteredCategories}
            partBrands={partBrands}
            vehicleVariants={vehicleVariants}
            compatibilityRows={compatibilityRows}
            availableBrands={availableBrands}
            saving={saving}
            message={message}
            error={error}
            onSubmit={handleSubmit}
            onUpdateField={updateField}
            onUpdateCategoryGroup={updateCategoryGroup}
            onUpdateCode={updateCodeField}
            onAddCode={addCodeField}
            onRemoveCode={removeCodeField}
            onAddCompatibilityRow={addCompatibilityRow}
            onRemoveCompatibilityRow={removeCompatibilityRow}
            onChangeCompatibilityBrand={updateCompatibilityBrand}
            onChangeCompatibilityModel={updateCompatibilityModel}
            onChangeCompatibilityYearRange={updateCompatibilityYearRange}
            onChangeCompatibilityEngine={updateCompatibilityEngine}
          />
        )}
      </div>
    </div>
  );
}
