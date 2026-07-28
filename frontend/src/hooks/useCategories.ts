'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Category, CategoryGroup } from '@/types/category';
import { getErrorMessage } from '@/utils/apiError';

export function useCategories() {
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    try {
      const [groupsResponse, categoriesResponse] = await Promise.all([
        api.get<CategoryGroup[]>('/categories/groups'),
        api.get<Category[]>('/categories'),
      ]);

      setCategoryGroups(groupsResponse.data ?? []);
      setCategories(categoriesResponse.data ?? []);
    } catch (err) {
      console.error('LOAD CATEGORIES ERROR', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  return {
    categoryGroups,
    categories,
    setCategoryGroups,
    setCategories,
    loading,
    loadData,
    getErrorMessage,
  };
}
