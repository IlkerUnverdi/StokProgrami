

'use client';

import { Dispatch, SetStateAction, useMemo } from 'react';

import type { CreateProductForm } from '@/types/product';
import { normalizeCode } from '@/utils/product';

type CodeFieldName = 'oemCodes' | 'referenceCodes';

type UseProductCodesParams = {
  form: CreateProductForm;
  setForm: Dispatch<SetStateAction<CreateProductForm>>;
};

export function useProductCodes({ form, setForm }: UseProductCodesParams) {
  function updateCodeField(
    field: CodeFieldName,
    index: number,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  }

  function addCodeField(field: CodeFieldName) {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  }

  function removeCodeField(field: CodeFieldName, index: number) {
    setForm((prev) => {
      const nextCodes = prev[field].filter((_, i) => i !== index);

      return {
        ...prev,
        [field]: nextCodes.length > 0 ? nextCodes : [''],
      };
    });
  }

  const cleanedOemCodes = useMemo(() => {
    return form.oemCodes
      .map(normalizeCode)
      .filter((code, index, arr) => code && arr.indexOf(code) === index);
  }, [form.oemCodes]);

  const cleanedReferenceCodes = useMemo(() => {
    return form.referenceCodes
      .map(normalizeCode)
      .filter((code, index, arr) => code && arr.indexOf(code) === index);
  }, [form.referenceCodes]);

  return {
    updateCodeField,
    addCodeField,
    removeCodeField,
    cleanedOemCodes,
    cleanedReferenceCodes,
  };
}