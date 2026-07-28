'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

import { api } from '@/lib/api';
import { useProductMeta } from '@/hooks/useProductMeta';
import { useProductForm } from '@/hooks/useProductForm';
import { isValidOptionalUrl } from '@/utils/product';
import type { CompatibilityRow, CreateProductForm } from '@/types/product';
import type { VehicleVariant } from '@/types/vehicle';
import { ProductForm } from '../../components/ProductForm';

type ProductDetail = {
  id: number;
  name: string;
  barcode?: string | null;
  shelfCode?: string | null;
  imageUrl?: string | null;
  categoryId?: number | null;
  partBrandId?: number | null;
  isActive?: boolean;
  category?: {
    id: number;
    categoryGroupId?: number | null;
    categoryGroup?: {
      id: number;
      name: string;
    } | null;
  } | null;
  partBrand?: {
    id: number;
    name: string;
  } | null;
  oemCodes?: Array<{
    id?: number;
    code: string;
    isPrimary?: boolean;
  }>;
  referenceCodes?: Array<{
    id?: number;
    code: string;
  }>;
  vehicleCompatibilities?: Array<{
    id?: number;
    vehicleVariant?: VehicleVariant | null;
  }>;
};

function getAxiosMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const rawMessage = err.response?.data?.message;

    return typeof rawMessage === 'string'
      ? rawMessage
      : Array.isArray(rawMessage)
        ? rawMessage.join(', ')
        : fallback;
  }

  return fallback;
}

function getVariantYearRange(variant: VehicleVariant) {
  const variantWithYears = variant as VehicleVariant & {
    yearStart?: number | null;
    yearEnd?: number | null;
    startYear?: number | null;
    endYear?: number | null;
    yearRange?: string | null;
  };

  if (variantWithYears.yearRange) {
    return variantWithYears.yearRange;
  }

  const start = variantWithYears.yearStart ?? variantWithYears.startYear;
  const end = variantWithYears.yearEnd ?? variantWithYears.endYear;

  if (!start && !end) {
    return '';
  }

  return `${start ?? ''}-${end ?? ''}`;
}

function mapProductToForm(product: ProductDetail): CreateProductForm {
  const categoryGroupId =
    product.category?.categoryGroupId ?? product.category?.categoryGroup?.id ?? 0;

  return {
    name: product.name ?? '',
    barcode: product.barcode ?? '',
    shelfCode: product.shelfCode ?? '',
    imageUrl: product.imageUrl ?? '',
    categoryGroupId,
    categoryId: product.categoryId ?? product.category?.id ?? 0,
    partBrandId: product.partBrandId ?? product.partBrand?.id ?? 0,
    oemCodes:
      product.oemCodes && product.oemCodes.length > 0
        ? product.oemCodes.map((item) => item.code)
        : [''],
    referenceCodes:
      product.referenceCodes && product.referenceCodes.length > 0
        ? product.referenceCodes.map((item) => item.code)
        : [''],
    isActive: product.isActive ?? true,
  };
}

function mapProductToCompatibilityRows(product: ProductDetail): CompatibilityRow[] {
  const rows: CompatibilityRow[] = [];

  for (const compatibility of product.vehicleCompatibilities ?? []) {
    const variant = compatibility.vehicleVariant;

    if (!variant) {
      continue;
    }

    rows.push({
      brandId: variant.vehicleBrand?.id ?? 0,
      modelName: variant.modelName ?? '',
      yearRange: getVariantYearRange(variant),
      variantId: variant.id,
    });
  }

  return rows.length > 0
    ? rows
    : [
        {
          brandId: 0,
          modelName: '',
          yearRange: '',
          variantId: 0,
        },
      ];
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = Number(params.id);

  const {
    categories,
    partBrands,
    vehicleVariants,
    loadingMeta,
    error: metaError,
  } = useProductMeta();

  const {
    form,
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

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const categoryGroups = useMemo(() => {
    const map = new Map<number, string>();

    for (const category of categories) {
      const group = category.categoryGroup;

      if (group?.id) {
        map.set(group.id, group.name);
      }
    }

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [categories]);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setError('Geçersiz ürün ID.');
        setLoadingProduct(false);
        return;
      }

      setLoadingProduct(true);
      setError('');

      try {
        const response = await api.get<ProductDetail>(`/products/${productId}`);
        const product = response.data;

        resetProductForm({
          ...mapProductToForm(product),
          compatibilityRows: mapProductToCompatibilityRows(product),
        });
      } catch (err: unknown) {
        console.error('LOAD PRODUCT DETAIL ERROR:', err);
        setError(getAxiosMessage(err, 'Ürün bilgileri yüklenemedi.'));
      } finally {
        setLoadingProduct(false);
      }
    }

    void loadProduct();
  }, [productId, resetProductForm]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    if (!form.name.trim()) {
      setError('Ürün adı zorunludur.');
      setSaving(false);
      return;
    }

    if (!form.barcode.trim()) {
      setError('Barkod zorunludur.');
      setSaving(false);
      return;
    }

    if (!form.shelfCode.trim()) {
      setError('Raf kodu zorunludur.');
      setSaving(false);
      return;
    }

    if (!form.categoryId) {
      setError('Alt kategori seçilmelidir.');
      setSaving(false);
      return;
    }

    if (!form.partBrandId) {
      setError('Parça markası seçilmelidir.');
      setSaving(false);
      return;
    }

    const imageUrl = form.imageUrl ?? '';

    if (!isValidOptionalUrl(imageUrl)) {
      setError('Ürün resim linki geçerli bir URL olmalıdır.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        barcode: form.barcode.trim(),
        shelfCode: form.shelfCode.trim(),
        imageUrl: imageUrl.trim() || undefined,
        categoryId: form.categoryId,
        partBrandId: form.partBrandId,
        oemCodes: cleanedOemCodes,
        referenceCodes: cleanedReferenceCodes,
        vehicleVariantIds: selectedVehicleVariantIds,
        isActive: form.isActive,
      };

      await api.patch(`/products/${productId}`, payload);
      setMessage('Ürün başarıyla güncellendi.');

      window.setTimeout(() => {
        router.push('/dashboard/settings/products');
      }, 700);
    } catch (err: unknown) {
      console.error('UPDATE PRODUCT ERROR:', err);
      setError(getAxiosMessage(err, 'Ürün güncellenemedi.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Ürün Düzenle
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Ürünün kimlik bilgilerini, kodlarını ve uyumlu araçlarını güncelleyin.
          </p>
        </div>

        <Link
          href="/dashboard/settings/products"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Ürün Ayarlarına Dön
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        {loadingMeta || loadingProduct ? (
          <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
            Ürün bilgileri yükleniyor...
          </div>
        ) : metaError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {metaError}
          </div>
        ) : error && !form.name ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <ProductForm
            mode="edit"
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