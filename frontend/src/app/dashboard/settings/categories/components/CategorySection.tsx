

'use client';

import { FormEvent } from 'react';
import type { Category, CategoryGroup } from '@/types/category';

type CategorySectionProps = {
  selectedGroup: CategoryGroup | null;
  visibleCategories: Category[];
  categoryName: string;
  categorySearch: string;
  editingCategoryId: number | null;
  loading: boolean;
  saving: boolean;
  onCategoryNameChange: (value: string) => void;
  onCategorySearchChange: (value: string) => void;
  onSubmitCategory: (event: FormEvent<HTMLFormElement>) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onCancelCategoryEdit: () => void;
};

export function CategorySection({
  selectedGroup,
  visibleCategories,
  categoryName,
  categorySearch,
  editingCategoryId,
  loading,
  saving,
  onCategoryNameChange,
  onCategorySearchChange,
  onSubmitCategory,
  onEditCategory,
  onDeleteCategory,
  onCancelCategoryEdit,
}: CategorySectionProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Alt Kategoriler
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Seçilen kategori grubuna bağlı alt kategorileri yönetin.
          </p>
        </div>

        <div className="rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
          {selectedGroup ? selectedGroup.name : 'Grup seçilmedi'}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              {editingCategoryId ? 'Alt Kategori Düzenle' : 'Yeni Alt Kategori'}
            </h3>
          </div>

          {editingCategoryId ? (
            <button
              type="button"
              onClick={onCancelCategoryEdit}
              className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Vazgeç
            </button>
          ) : null}
        </div>

        <form
          onSubmit={onSubmitCategory}
          className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]"
        >
          <input
            type="text"
            value={categoryName}
            onChange={(e) => onCategoryNameChange(e.target.value)}
            placeholder="Örn: Yağ Filtresi"
            className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          />

          <button
            type="submit"
            disabled={saving || !selectedGroup}
            className="h-11 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
          >
            {editingCategoryId ? 'Güncelle' : 'Kategori Ekle'}
          </button>
        </form>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-200 p-4">
        <input
          type="text"
          value={categorySearch}
          onChange={(e) => onCategorySearchChange(e.target.value)}
          placeholder="Alt kategori ara..."
          className="h-10 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-red-600"
        />
      </div>

      <div className="mt-4 max-h-[430px] space-y-2 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-sm text-neutral-500">Yükleniyor...</div>
        ) : visibleCategories.length === 0 ? (
          <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
            Alt kategori bulunamadı.
          </div>
        ) : (
          visibleCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3"
            >
              <div className="font-medium text-neutral-900">
                {category.name}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEditCategory(category)}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCategory(category)}
                  className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}