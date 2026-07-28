

'use client';

import { useMemo, useState } from 'react';

import { emptyCompatibilityRow } from '@/constants/product';
import type { CompatibilityRow } from '@/types/product';
import type { VehicleVariant } from '@/types/vehicle';
import {
  findVehicleVariantBySelection,
  getVehicleBrandOptions,
} from '@/hooks/useVehicleFilters';

type UseProductCompatibilitiesParams = {
  vehicleVariants: VehicleVariant[];
};

export function useProductCompatibilities({
  vehicleVariants,
}: UseProductCompatibilitiesParams) {
  const [compatibilityRows, setCompatibilityRows] = useState<CompatibilityRow[]>([
    { ...emptyCompatibilityRow },
  ]);

  const availableBrands = useMemo(() => {
    return getVehicleBrandOptions(vehicleVariants);
  }, [vehicleVariants]);

  function addCompatibilityRow() {
    setCompatibilityRows((prev) => [...prev, { ...emptyCompatibilityRow }]);
  }

  function removeCompatibilityRow(index: number) {
    setCompatibilityRows((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  }

  function updateCompatibilityBrand(index: number, brandId: number) {
    setCompatibilityRows((prev) =>
      prev.map((row, i) =>
        i === index
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
      prev.map((row, i) =>
        i === index
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
      prev.map((row, i) =>
        i === index
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
      prev.map((row, i) => {
        if (i !== index) {
          return row;
        }

        const selectedVariant = findVehicleVariantBySelection(
          vehicleVariants,
          row.brandId,
          row.modelName ?? '',
          row.yearRange ?? '',
          engine,
        );

        return {
          ...row,
          variantId: selectedVariant?.id ?? 0,
        };
      }),
    );
  }

  function resetCompatibilityRows() {
    setCompatibilityRows([{ ...emptyCompatibilityRow }]);
  }

  const selectedVehicleVariantIds = compatibilityRows
    .map((row) => row.variantId)
    .filter((variantId, index, arr) =>
      variantId > 0 && arr.indexOf(variantId) === index,
    );

  return {
    compatibilityRows,
    setCompatibilityRows,
    selectedVehicleVariantIds,
    availableBrands,

    addCompatibilityRow,
    removeCompatibilityRow,
    updateCompatibilityBrand,
    updateCompatibilityModel,
    updateCompatibilityYearRange,
    updateCompatibilityEngine,
    resetCompatibilityRows,
  };
}