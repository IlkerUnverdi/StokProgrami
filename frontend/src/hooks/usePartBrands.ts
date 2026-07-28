

'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { PartBrand } from '@/types/brand';
import { getErrorMessage } from '@/utils/apiError';

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function usePartBrands() {
  const [brands, setBrands] = useState<PartBrand[]>([]);
  const [brandName, setBrandName] = useState('');
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [brandSearch, setBrandSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const visibleBrands = useMemo(() => {
    const search = brandSearch.trim().toLocaleLowerCase('tr');

    if (!search) return brands;

    return brands.filter((brand) =>
      brand.name.toLocaleLowerCase('tr').includes(search),
    );
  }, [brands, brandSearch]);

  const activeBrandCount = useMemo(() => {
    return brands.filter((brand) => brand.isActive !== false).length;
  }, [brands]);

  async function loadBrands() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get<PartBrand[]>('/part-brands');
      setBrands(response.data ?? []);
    } catch (err) {
      console.error('LOAD PART BRANDS ERROR:', err);
      setError('Markalar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBrands();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError('');
    setMessage('');

    const name = normalizeName(brandName);

    if (!name) {
      setError('Marka adı zorunludur.');
      setSaving(false);
      return;
    }

    const duplicateBrand = brands.some(
      (brand) =>
        brand.name.toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr') &&
        brand.id !== editingBrandId,
    );

    if (duplicateBrand) {
      setError('Bu marka zaten kayıtlı.');
      setSaving(false);
      return;
    }

    try {
      if (editingBrandId) {
        await api.patch(`/part-brands/${editingBrandId}`, { name });
        setMessage('Marka güncellendi.');
      } else {
        await api.post('/part-brands', { name });
        setMessage('Marka eklendi.');
      }

      setBrandName('');
      setEditingBrandId(null);
      await loadBrands();
    } catch (err) {
      console.error('SAVE PART BRAND ERROR:', err);
      setError(getErrorMessage(err) || 'Marka kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteBrand(brand: PartBrand) {
    const productCount = brand.products?.length ?? 0;

    if (productCount > 0) {
      setError('Bu markaya bağlı ürünler var.');
      return;
    }

    const confirmed = window.confirm(`${brand.name} markası silinsin mi?`);

    if (!confirmed) return;

    try {
      await api.delete(`/part-brands/${brand.id}`);
      setMessage('Marka silindi.');
      await loadBrands();
    } catch (err) {
      setError(getErrorMessage(err) || 'Marka silinemedi.');
    }
  }

  function startEditBrand(brand: PartBrand) {
    setEditingBrandId(brand.id);
    setBrandName(brand.name);
    setError('');
    setMessage('');
  }

  function cancelEdit() {
    setEditingBrandId(null);
    setBrandName('');
  }

  return {
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
  };
}