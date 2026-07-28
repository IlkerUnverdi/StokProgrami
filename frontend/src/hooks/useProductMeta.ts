'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getCategories } from '@/services/categories';
import { Category } from '@/types/category';
import { getPartBrands } from '@/services/partBrands';
import { PartBrand } from '@/types/brand';
import type { VehicleVariant } from '@/types/vehicle';
import { getErrorMessage } from '@/utils/apiError';

export function useProductMeta() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [partBrands, setPartBrands] = useState<PartBrand[]>([]);
  const [vehicleVariants, setVehicleVariants] = useState<VehicleVariant[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState('');

  const fetchMeta = useCallback(async () => {
    try {
      setLoadingMeta(true);
      setError('');

      const [categoriesResponse, partBrandsResponse, vehicleVariantsResponse] =
        await Promise.all([
          getCategories(),
          getPartBrands(),
          api.get<VehicleVariant[]>('/vehicle-variants'),
        ]);

      setCategories(categoriesResponse);
      setPartBrands(partBrandsResponse);
      setVehicleVariants(vehicleVariantsResponse.data);
    } catch (err) {
      console.error('PRODUCT META ERROR:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => {
    void fetchMeta();
  }, [fetchMeta]);

  return {
    categories,
    partBrands,
    vehicleVariants,
    loadingMeta,
    error,
    refetch: fetchMeta,
  };
}