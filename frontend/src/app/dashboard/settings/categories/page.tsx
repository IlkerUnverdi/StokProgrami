'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useCategories } from '@/hooks/useCategories';
import { CategoryGroupSection } from './components/CategoryGroupSection';
import { CategorySection } from './components/CategorySection';
import type { Category, CategoryGroup } from '@/types/category';

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export default function CategorySettingsPage() {
  const {
    categoryGroups,
    categories,
    loading,
    loadData,
    getErrorMessage,
  } = useCategories();

  const [selectedGroupId, setSelectedGroupId] = useState<number>(0);
  const [groupSearch, setGroupSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const [groupName, setGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

  const [categoryName, setCategoryName] = useState('');
  const [categoryGroupId, setCategoryGroupId] = useState<number>(0);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const visibleCategoryGroups = useMemo(() => {
    const search = groupSearch.trim().toLocaleLowerCase('tr');

    if (!search) return categoryGroups;

    return categoryGroups.filter((group) =>
      group.name.toLocaleLowerCase('tr').includes(search),
    );
  }, [categoryGroups, groupSearch]);

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLocaleLowerCase('tr');

    const groupFiltered = selectedGroupId
      ? categories.filter((category) => category.categoryGroupId === selectedGroupId)
      : [];

    if (!search) return groupFiltered;

    return groupFiltered.filter((category) =>
      category.name.toLocaleLowerCase('tr').includes(search),
    );
  }, [categories, selectedGroupId, categorySearch]);

  const selectedGroup = useMemo(() => {
    return categoryGroups.find((group) => group.id === selectedGroupId) ?? null;
  }, [categoryGroups, selectedGroupId]);

  const totalCategoryCount = categories.length;

  async function handleGroupSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const name = normalizeName(groupName);

    if (!name) {
      setError('Kategori grubu adı zorunludur.');
      setSaving(false);
      return;
    }

    const duplicateGroup = categoryGroups.some(
      (group) =>
        group.name.toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr') &&
        group.id !== editingGroupId,
    );

    if (duplicateGroup) {
      setError('Bu kategori grubu zaten kayıtlı.');
      setSaving(false);
      return;
    }

    try {
      if (editingGroupId) {
        await api.patch(`/categories/groups/${editingGroupId}`, { name });
        setMessage('Kategori grubu güncellendi.');
      } else {
        await api.post('/categories/groups', { name });
        setMessage('Kategori grubu eklendi.');
      }

      setGroupName('');
      setEditingGroupId(null);
      await loadData();
    } catch (err: unknown) {
      console.error('SAVE CATEGORY GROUP ERROR:', err);
      setError(getErrorMessage(err) || 'Kategori grubu kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCategorySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const name = normalizeName(categoryName);

    if (!name) {
      setError('Alt kategori adı zorunludur.');
      setSaving(false);
      return;
    }

    const targetGroupId = editingCategoryId ? categoryGroupId : selectedGroupId;

    if (!targetGroupId) {
      setError('Alt kategori eklemek için önce soldan bir kategori grubu seçilmelidir.');
      setSaving(false);
      return;
    }

    const duplicateCategory = categories.some(
      (category) =>
        category.name.toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr') &&
        category.categoryGroupId === targetGroupId &&
        category.id !== editingCategoryId,
    );

    if (duplicateCategory) {
      setError('Bu alt kategori seçilen grup altında zaten kayıtlı.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name,
        categoryGroupId: targetGroupId,
      };

      if (editingCategoryId) {
        await api.patch(`/categories/${editingCategoryId}`, payload);
        setMessage('Alt kategori güncellendi.');
      } else {
        await api.post('/categories', payload);
        setMessage('Alt kategori eklendi.');
      }

      setCategoryName('');
      setCategoryGroupId(0);
      setEditingCategoryId(null);
      await loadData();
    } catch (err: unknown) {
      console.error('SAVE CATEGORY ERROR:', err);
      setError(getErrorMessage(err) || 'Alt kategori kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteGroup(group: CategoryGroup) {
    const hasCategory = categories.some(
      (category) => category.categoryGroupId === group.id,
    );

    if (hasCategory) {
      setError('Bu kategori grubuna bağlı alt kategoriler var. Önce alt kategorileri taşı veya sil.');
      return;
    }

    const confirmed = window.confirm(`${group.name} kategori grubu silinsin mi?`);
    if (!confirmed) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.delete(`/categories/groups/${group.id}`);
      setMessage('Kategori grubu silindi.');
      await loadData();
    } catch (err: unknown) {
      console.error('DELETE CATEGORY GROUP ERROR:', err);
      setError(getErrorMessage(err) || 'Kategori grubu silinemedi.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(`${category.name} alt kategorisi silinsin mi?`);
    if (!confirmed) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.delete(`/categories/${category.id}`);
      setMessage('Alt kategori silindi.');
      await loadData();
    } catch (err: unknown) {
      console.error('DELETE CATEGORY ERROR:', err);
      setError(getErrorMessage(err) || 'Alt kategori silinemedi. Ürüne bağlı olabilir.');
    } finally {
      setSaving(false);
    }
  }

  function startEditGroup(group: CategoryGroup) {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setSelectedGroupId(group.id);
    setMessage('');
    setError('');
  }

  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryGroupId(category.categoryGroupId);
    setSelectedGroupId(category.categoryGroupId);
    setMessage('');
    setError('');
  }

  function cancelGroupEdit() {
    setEditingGroupId(null);
    setGroupName('');
  }

  function cancelCategoryEdit() {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryGroupId(0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Kategori Ayarları
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-500">
            Motor, fren, ateşleme gibi kategori gruplarını ve bu gruplara bağlı
            krank mili, buji, fren balatası gibi alt kategorileri buradan yönetin.
          </p>
        </div>

        <Link
          href="/dashboard/settings"
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          ← Sistem Ayarlarına Dön
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-neutral-500">Kategori Grubu</div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">
            {categoryGroups.length}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-neutral-500">Toplam Alt Kategori</div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">
            {totalCategoryCount}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <CategoryGroupSection
          categories={categories}
          visibleCategoryGroups={visibleCategoryGroups}
          selectedGroupId={selectedGroupId}
          groupSearch={groupSearch}
          groupName={groupName}
          editingGroupId={editingGroupId}
          loading={loading}
          saving={saving}
          onGroupSearchChange={setGroupSearch}
          onGroupNameChange={setGroupName}
          onSelectGroup={setSelectedGroupId}
          onSubmitGroup={handleGroupSubmit}
          onEditGroup={startEditGroup}
          onDeleteGroup={deleteGroup}
          onCancelGroupEdit={cancelGroupEdit}
        />
        <CategorySection
          selectedGroup={selectedGroup}
          visibleCategories={filteredCategories}
          categoryName={categoryName}
          categorySearch={categorySearch}
          editingCategoryId={editingCategoryId}
          loading={loading}
          saving={saving}
          onCategoryNameChange={setCategoryName}
          onCategorySearchChange={setCategorySearch}
          onSubmitCategory={handleCategorySubmit}
          onEditCategory={startEditCategory}
          onDeleteCategory={deleteCategory}
          onCancelCategoryEdit={cancelCategoryEdit}
        />
      </div>
    </div>
  );
}