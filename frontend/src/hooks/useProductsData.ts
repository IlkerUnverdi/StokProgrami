'use client';

import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import type { Category } from '@/types/category';
import type { ProductListItem } from '@/types/product';
import type { VehicleVariant } from '@/types/vehicle';
import { getErrorMessage } from '@/utils/apiError';
import { getCategories } from '../services/categories';

export function useProductsData() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicleVariants, setVehicleVariants] = useState<VehicleVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [productsResponse, categoriesResponse, vehicleVariantsResponse] =
        await Promise.all([
          api.get<ProductListItem[]>('/products'),
          getCategories(),
          api.get<VehicleVariant[]>('/vehicle-variants'),
        ]);

      setProducts(productsResponse.data);
      setCategories(categoriesResponse);
      setVehicleVariants(vehicleVariantsResponse.data);
    } catch (err) {
      console.error('PRODUCTS DATA ERROR:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    products,
    setProducts,
    categories,
    vehicleVariants,
    loading,
    error,
    refetch: fetchData,
  };
}
