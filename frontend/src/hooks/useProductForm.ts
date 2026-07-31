

'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CompatibilityRow, CreateProductForm } from '@/types/product';
import type { VehicleVariant } from '@/types/vehicle';

type CodeFieldName = 'oemCodes' | 'referenceCodes';

type Category = {
  id: number;
  name: string;
  categoryGroupId: number;
};

type ProductFormInitialData = Partial<CreateProductForm> & {
  compatibilityRows?: CompatibilityRow[];
};

export const emptyProductForm: CreateProductForm = {
  name: '',
  barcode: '',
  shelfCode: '',
  imageUrl: '',
  salePrice: '',
  categoryGroupId: 0,
  categoryId: 0,
  partBrandId: 0,
  oemCodes: [''],
  referenceCodes: [''],
  isActive: true,
};

function getInitialForm(initialData?: ProductFormInitialData): CreateProductForm {
  return {
    ...emptyProductForm,
    ...initialData,
    oemCodes:
      initialData?.oemCodes && initialData.oemCodes.length > 0
        ? initialData.oemCodes
        : [''],
    referenceCodes:
      initialData?.referenceCodes && initialData.referenceCodes.length > 0
        ? initialData.referenceCodes
        : [''],
  };
}

function getInitialCompatibilityRows(
  initialData?: ProductFormInitialData,
): CompatibilityRow[] {
  if (initialData?.compatibilityRows && initialData.compatibilityRows.length > 0) {
    return initialData.compatibilityRows;
  }

  return [
    {
      brandId: 0,
      modelName: '',
      yearRange: '',
      variantId: 0,
    },
  ];
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

export function useProductForm(
  vehicleVariants: VehicleVariant[],
  categories: Category[],
  initialData?: ProductFormInitialData,
) {
  const [form, setForm] = useState<CreateProductForm>(() =>
    getInitialForm(initialData),
  );

  const [compatibilityRows, setCompatibilityRows] = useState<CompatibilityRow[]>(
    () => getInitialCompatibilityRows(initialData),
  );

  const filteredCategories = useMemo(() => {
    if (!form.categoryGroupId) {
      return [];
    }

    return categories.filter(
      (category) => category.categoryGroupId === form.categoryGroupId,
    );
  }, [categories, form.categoryGroupId]);

  const availableBrands = useMemo(() => {
    const map = new Map<number, string>();

    for (const variant of vehicleVariants) {
      if (variant.vehicleBrand?.id) {
        map.set(variant.vehicleBrand.id, variant.vehicleBrand.name);
      }
    }

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [vehicleVariants]);

  const cleanedOemCodes = useMemo(() => {
    return form.oemCodes.map((code) => code.trim()).filter(Boolean);
  }, [form.oemCodes]);

  const cleanedReferenceCodes = useMemo(() => {
    return form.referenceCodes.map((code) => code.trim()).filter(Boolean);
  }, [form.referenceCodes]);

  const selectedVehicleVariantIds = useMemo(() => {
    return compatibilityRows
      .map((row) => row.variantId)
      .filter((variantId): variantId is number => Number(variantId) > 0);
  }, [compatibilityRows]);

  function updateField<K extends keyof CreateProductForm>(
    key: K,
    value: CreateProductForm[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateCategoryGroup(categoryGroupId: number) {
    setForm((prev) => ({
      ...prev,
      categoryGroupId,
      categoryId: 0,
    }));
  }

  function updateCodeField(
    field: CodeFieldName,
    index: number,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }));
  }

  function addCodeField(field: CodeFieldName) {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  }

  function removeCodeField(field: CodeFieldName, index: number) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addCompatibilityRow() {
    setCompatibilityRows((prev) => [
      ...prev,
      {
        brandId: 0,
        modelName: '',
        yearRange: '',
        variantId: 0,
      },
    ]);
  }

  function removeCompatibilityRow(index: number) {
    setCompatibilityRows((prev) =>
      prev.length === 1 ? prev : prev.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function updateCompatibilityBrand(index: number, brandId: number) {
    setCompatibilityRows((prev) =>
      prev.map((row, itemIndex) =>
        itemIndex === index
          ? {
              ...row,
              brandId,
              modelName: '',
              yearRange: '',
              variantId: 0,
            }
          : row,
      ),
    );
  }

  function updateCompatibilityModel(index: number, modelName: string) {
    setCompatibilityRows((prev) =>
      prev.map((row, itemIndex) =>
        itemIndex === index
          ? {
              ...row,
              modelName,
              yearRange: '',
              variantId: 0,
            }
          : row,
      ),
    );
  }

  function updateCompatibilityYearRange(index: number, yearRange: string) {
    setCompatibilityRows((prev) =>
      prev.map((row, itemIndex) =>
        itemIndex === index
          ? {
              ...row,
              yearRange,
              variantId: 0,
            }
          : row,
      ),
    );
  }

  function updateCompatibilityEngine(index: number, engine: string) {
    setCompatibilityRows((prev) =>
      prev.map((row, itemIndex) => {
        if (itemIndex !== index) {
          return row;
        }

        const selectedVariant = vehicleVariants.find((variant) => {
          return (
            variant.vehicleBrand?.id === row.brandId &&
            variant.modelName === row.modelName &&
            getVariantYearRange(variant) === row.yearRange &&
            variant.engine === engine
          );
        });

        return {
          ...row,
          variantId: selectedVariant?.id ?? 0,
        };
      }),
    );
  }

  const resetProductForm = useCallback(
    (nextInitialData?: ProductFormInitialData) => {
      setForm(getInitialForm(nextInitialData));
      setCompatibilityRows(getInitialCompatibilityRows(nextInitialData));
    },
    [],
  );

  return {
    form,
    setForm,
    compatibilityRows,
    setCompatibilityRows,
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
  };
}
