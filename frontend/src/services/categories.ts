import { api } from '@/lib/api';
import type { Category } from '@/types/category';

export async function getCategories() {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}