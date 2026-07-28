'use client';

import { useMemo, useState } from 'react';

import type { Category } from '@/types/category';
import type { ProductListItem } from '@/types/product';

type ProductCompatibilityItem = {
  id?: number;
  vehicleVariant?: NonNullable<
    NonNullable<ProductListItem['vehicleCompatibilities']>[number]['vehicleVariant']
  > | null;
};

function getProductCompatibilities(product: ProductListItem) {
  return [
    ...(product.vehicleCompatibilities ?? []),
    ...(product.compatibilities ?? []),
  ] satisfies ProductCompatibilityItem[];
}

function getVariantBrandId(item: ProductCompatibilityItem) {
  return item.vehicleVariant?.vehicleBrand?.id ?? 0;
}

function getVariantYearRange(item: ProductCompatibilityItem) {
  const variant = item.vehicleVariant;

  if (!variant) {
    return '-';
  }

  const yearStart = variant.yearStart ?? variant.startYear ?? '';
  const yearEnd = variant.yearEnd ?? variant.endYear ?? '';

  return `${yearStart}-${yearEnd}`;
}

type UseProductFiltersParams = {
  products: ProductListItem[];
  categories: Category[];

  vehicleBrandId: number;
  vehicleModelName: string;
  vehicleYearRange: string;
  vehicleEngine: string;
};

export function useProductFilters({
  products,
  categories,
  vehicleBrandId,
  vehicleModelName,
  vehicleYearRange,
  vehicleEngine,
}: UseProductFiltersParams) {
  const [search, setSearch] = useState('');
  const [categoryGroupId, setCategoryGroupId] = useState(0);
  const [categoryId, setCategoryId] = useState(0);

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

  const filteredCategories = useMemo(() => {
    if (categoryGroupId === 0) {
      return categories;
    }

    return categories
      .filter((category) => category.categoryGroupId === categoryGroupId)
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [categories, categoryGroupId]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr');

    return products.filter((product) => {
      const compatibilities = getProductCompatibilities(product);

      const matchesSearch =
        q.length === 0 ||
        product.name.toLocaleLowerCase('tr').includes(q) ||
        (product.barcode ?? '').toLocaleLowerCase('tr').includes(q) ||
        (product.partBrand?.name ?? '').toLocaleLowerCase('tr').includes(q) ||
        (product.oemCodes ?? []).some((item) =>
          item.code.toLocaleLowerCase('tr').includes(q),
        ) ||
        (product.referenceCodes ?? []).some((item) =>
          item.code.toLocaleLowerCase('tr').includes(q),
        ) ||
        compatibilities.some((item) => {
          const variant = item.vehicleVariant;

          if (!variant) {
            return false;
          }

          const brandName = variant.brandName ?? variant.vehicleBrand?.name ?? '';
          const text = `${brandName} ${variant.modelName} ${variant.engine}`;

          return text.toLocaleLowerCase('tr').includes(q);
        });

      const matchesCategoryGroup =
        categoryGroupId === 0 ||
        product.category?.categoryGroup?.id === categoryGroupId;

      const matchesCategory =
        categoryId === 0 || product.categoryId === categoryId || product.category?.id === categoryId;

      const matchesVehicle =
        (vehicleBrandId === 0 &&
          vehicleModelName === '' &&
          vehicleYearRange === '' &&
          vehicleEngine === '') ||
        compatibilities.some((item) => {
          const variant = item.vehicleVariant;

          if (!variant) {
            return false;
          }

          const matchesBrand =
            vehicleBrandId === 0 || getVariantBrandId(item) === vehicleBrandId;

          const matchesModel =
            vehicleModelName === '' || variant.modelName === vehicleModelName;

          const matchesYearRange =
            vehicleYearRange === '' || getVariantYearRange(item) === vehicleYearRange;

          const matchesEngine =
            vehicleEngine === '' || variant.engine === vehicleEngine;

          return matchesBrand && matchesModel && matchesYearRange && matchesEngine;
        });

      return matchesSearch && matchesCategoryGroup && matchesCategory && matchesVehicle;
    });
  }, [
    products,
    search,
    categoryGroupId,
    categoryId,
    vehicleBrandId,
    vehicleModelName,
    vehicleYearRange,
    vehicleEngine,
  ]);

  return {
    search,
    setSearch,
    categoryGroupId,
    setCategoryGroupId,
    categoryId,
    setCategoryId,
    categoryGroups,
    filteredCategories,
    filteredProducts,
  };
}