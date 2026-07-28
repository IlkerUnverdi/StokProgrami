

'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { api } from '@/lib/api';

export type VehicleVariant = {
  id: number;
  brandName: string;
  modelName: string;
  engine: string;
  fuel?: string | null;
  yearStart?: number | null;
  yearEnd?: number | null;
};

type RawVehicleVariant = Partial<VehicleVariant> & {
  brand?: string | null;
  brandName?: string | null;
  vehicleBrand?: { name?: string | null } | null;
  vehicleBrandName?: string | null;
  model?: string | null;
  modelName?: string | null;
  vehicleModel?: { name?: string | null } | null;
  vehicleModelName?: string | null;
};

export type VehicleForm = {
  brandName: string;
  modelName: string;
  engine: string;
  fuel: string;
  yearStart: string;
  yearEnd: string;
};

export const initialVehicleForm: VehicleForm = {
  brandName: '',
  modelName: '',
  engine: '',
  fuel: '',
  yearStart: '',
  yearEnd: '',
};

export const vehicleFuelOptions = [
  { value: 'BENZIN', label: 'Benzin' },
  { value: 'DIZEL', label: 'Dizel' },
  { value: 'LPG', label: 'LPG' },
  { value: 'HIBRIT', label: 'Hibrit' },
  { value: 'ELEKTRIK', label: 'Elektrik' },
];

export function normalizeVehicleFuel(value?: string | null) {
  const fuel = (value ?? '').trim().toLocaleLowerCase('tr');

  if (!fuel) return '';
  if (fuel === 'diesel' || fuel === 'dizel') return 'DIZEL';
  if (
    fuel === 'benzin' ||
    fuel === 'benzın' ||
    fuel === 'gasoline' ||
    fuel === 'petrol'
  ) {
    return 'BENZIN';
  }
  if (fuel === 'lpg') return 'LPG';
  if (fuel === 'hibrit' || fuel === 'hybrid') return 'HIBRIT';
  if (fuel === 'elektrik' || fuel === 'electric') return 'ELEKTRIK';

  return value?.trim().toUpperCase() ?? '';
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function firstText(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function normalizeVariant(raw: RawVehicleVariant): VehicleVariant {
  return {
    id: Number(raw.id),
    brandName: firstText(
      raw.brandName,
      raw.vehicleBrandName,
      raw.brand,
      raw.vehicleBrand?.name,
    ),
    modelName: firstText(
      raw.modelName,
      raw.vehicleModelName,
      raw.model,
      raw.vehicleModel?.name,
    ),
    engine: firstText(raw.engine),
    fuel: normalizeVehicleFuel(firstText(raw.fuel)),
    yearStart: raw.yearStart ?? null,
    yearEnd: raw.yearEnd ?? null,
  };
}

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const rawMessage = err.response?.data?.message;

    if (typeof rawMessage === 'string') return rawMessage;
    if (Array.isArray(rawMessage)) return rawMessage.join(', ');
  }

  return fallback;
}

export function useVehicles() {
  const [variants, setVariants] = useState<VehicleVariant[]>([]);
  const [form, setForm] = useState<VehicleForm>(initialVehicleForm);
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [variantSearch, setVariantSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const brands = useMemo(() => {
    return Array.from(new Set(variants.map((variant) => variant.brandName)))
      .filter((brand): brand is string => Boolean(brand))
      .sort((a, b) => a.localeCompare(b, 'tr'));
  }, [variants]);

  const modelsForSelectedBrand = useMemo(() => {
    if (!selectedBrand) return [];

    return Array.from(
      new Set(
        variants
          .filter((variant) => variant.brandName === selectedBrand)
          .map((variant) => variant.modelName),
      ),
    )
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'tr'));
  }, [variants, selectedBrand]);

  const visibleVariants = useMemo(() => {
    const search = variantSearch.trim().toLocaleLowerCase('tr');

    return variants.filter((variant) => {
      const brandMatch = selectedBrand
        ? variant.brandName === selectedBrand
        : true;
      const modelMatch = selectedModel
        ? variant.modelName === selectedModel
        : true;
      const text = [
        variant.brandName,
        variant.modelName,
        variant.engine,
        variant.fuel ?? '',
        variant.yearStart?.toString() ?? '',
        variant.yearEnd?.toString() ?? '',
      ]
        .join(' ')
        .toLocaleLowerCase('tr');

      const searchMatch = search ? text.includes(search) : true;

      return brandMatch && modelMatch && searchMatch;
    });
  }, [variants, selectedBrand, selectedModel, variantSearch]);

  const selectedBrandVariantCount = useMemo(() => {
    if (!selectedBrand) return variants.length;
    return variants.filter((variant) => variant.brandName === selectedBrand)
      .length;
  }, [variants, selectedBrand]);

  async function loadVariants() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get<RawVehicleVariant[]>('/vehicle-variants');
      const nextVariants = (response.data ?? []).map(normalizeVariant);
      setVariants(nextVariants);

      if (!selectedBrand && nextVariants[0]?.brandName) {
        setSelectedBrand(nextVariants[0].brandName);
      }
    } catch (err: unknown) {
      console.error('LOAD VEHICLE VARIANTS ERROR:', err);
      setError(
        'Araç ayarları yüklenemedi. Backend endpointlerini kontrol etmeliyiz.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField<K extends keyof VehicleForm>(
    key: K,
    value: VehicleForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleBrandFilterChange(brandName: string) {
    setSelectedBrand(brandName);
    setSelectedModel('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const brandName = normalizeText(form.brandName);
    const modelName = normalizeText(form.modelName);
    const engine = normalizeText(form.engine);
    const fuel = normalizeVehicleFuel(form.fuel);
    const yearStart = form.yearStart ? Number(form.yearStart) : null;
    const yearEnd = form.yearEnd ? Number(form.yearEnd) : null;

    if (!brandName) {
      setError('Araç markası zorunludur.');
      setSaving(false);
      return;
    }

    if (!modelName) {
      setError('Araç modeli zorunludur.');
      setSaving(false);
      return;
    }

    if (!engine) {
      setError('Motor bilgisi zorunludur.');
      setSaving(false);
      return;
    }

    if (!fuel) {
      setError('Yakıt tipi zorunludur.');
      setSaving(false);
      return;
    }

    if (!yearStart || yearStart < 1950 || yearStart > 2100) {
      setError('Başlangıç yılı 1950-2100 arasında geçerli bir yıl olmalıdır.');
      setSaving(false);
      return;
    }

    if (yearEnd && yearEnd < yearStart) {
      setError('Bitiş yılı başlangıç yılından küçük olamaz.');
      setSaving(false);
      return;
    }

    const duplicateVariant = variants.some((variant) => {
      const sameBrand =
        variant.brandName.toLocaleLowerCase('tr') ===
        brandName.toLocaleLowerCase('tr');
      const sameModel =
        variant.modelName.toLocaleLowerCase('tr') ===
        modelName.toLocaleLowerCase('tr');
      const sameEngine =
        variant.engine.toLocaleLowerCase('tr') === engine.toLocaleLowerCase('tr');
      const sameFuel =
        (variant.fuel ?? '').toLocaleLowerCase('tr') ===
        fuel.toLocaleLowerCase('tr');
      const sameYearStart =
        Number(variant.yearStart ?? 0) === Number(yearStart ?? 0);
      const sameYearEnd = Number(variant.yearEnd ?? 0) === Number(yearEnd ?? 0);

      return (
        sameBrand &&
        sameModel &&
        sameEngine &&
        sameFuel &&
        sameYearStart &&
        sameYearEnd &&
        variant.id !== editingVariantId
      );
    });

    if (duplicateVariant) {
      setError('Bu araç-motor-yıl kombinasyonu zaten kayıtlı.');
      setSaving(false);
      return;
    }

    const payload = {
      brandName,
      modelName,
      engine,
      fuel,
      yearStart,
      yearEnd,
    };

    try {
      if (editingVariantId) {
        await api.patch(`/vehicle-variants/${editingVariantId}`, payload);
        setMessage('Araç varyantı güncellendi.');
      } else {
        await api.post('/vehicle-variants', payload);
        setMessage('Araç varyantı eklendi.');
      }

      setForm(initialVehicleForm);
      setEditingVariantId(null);
      setSelectedBrand(brandName);
      setSelectedModel(modelName);
      await loadVariants();
    } catch (err: unknown) {
      console.error('SAVE VEHICLE VARIANT ERROR:', err);
      setError(getErrorMessage(err, 'Araç varyantı kaydedilemedi.'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteVariant(variant: VehicleVariant) {
    const confirmed = window.confirm(
      `${variant.brandName} ${variant.modelName} ${variant.engine} varyantı silinsin mi?`,
    );

    if (!confirmed) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.delete(`/vehicle-variants/${variant.id}`);
      setMessage('Araç varyantı silindi.');
      await loadVariants();
    } catch (err: unknown) {
      console.error('DELETE VEHICLE VARIANT ERROR:', err);
      setError(
        getErrorMessage(
          err,
          'Araç varyantı silinemedi. Ürün uyumluluğuna bağlı olabilir.',
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  function startEditVariant(variant: VehicleVariant) {
    setEditingVariantId(variant.id);
    setForm({
      brandName: variant.brandName,
      modelName: variant.modelName,
      engine: variant.engine,
      fuel: normalizeVehicleFuel(variant.fuel),
      yearStart: variant.yearStart?.toString() ?? '',
      yearEnd: variant.yearEnd?.toString() ?? '',
    });
    setSelectedBrand(variant.brandName);
    setSelectedModel(variant.modelName);
    setError('');
    setMessage('');
  }

  function cancelEdit() {
    setEditingVariantId(null);
    setForm(initialVehicleForm);
  }

  return {
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

    setSelectedBrand,
    setSelectedModel,
    setVariantSearch,
    setError,
    setMessage,

    loadVariants,
    updateField,
    handleBrandFilterChange,
    handleSubmit,
    deleteVariant,
    startEditVariant,
    cancelEdit,
  };
}