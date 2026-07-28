'use client';

import { FormEvent } from 'react';
import type { Category, CategoryGroup } from '@/types/category';

type CategoryGroupSectionProps = {
  categories: Category[];
  visibleCategoryGroups: CategoryGroup[];
  selectedGroupId: number;
  groupSearch: string;
  groupName: string;
  editingGroupId: number | null;
  loading: boolean;
  saving: boolean;
  onGroupSearchChange: (value: string) => void;
  onGroupNameChange: (value: string) => void;
  onSelectGroup: (groupId: number) => void;
  onSubmitGroup: (event: FormEvent<HTMLFormElement>) => void;
  onEditGroup: (group: CategoryGroup) => void;
  onDeleteGroup: (group: CategoryGroup) => void;
  onCancelGroupEdit: () => void;
};

export function CategoryGroupSection({
  categories,
  visibleCategoryGroups,
  selectedGroupId,
  groupSearch,
  groupName,
  editingGroupId,
  loading,
  saving,
  onGroupSearchChange,
  onGroupNameChange,
  onSelectGroup,
  onSubmitGroup,
  onEditGroup,
  onDeleteGroup,
  onCancelGroupEdit,
}: CategoryGroupSectionProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          Kategori Grubu
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Ana ürün gruplarını ekleyin. Örnek: Motor, Fren, Ateşleme.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              {editingGroupId ? 'Kategori Grubunu Düzenle' : 'Yeni Kategori Grubu'}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Örnek: Motor, Fren, Ateşleme, Filtre.
            </p>
          </div>

          {editingGroupId ? (
            <button
              type="button"
              onClick={onCancelGroupEdit}
              className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Vazgeç
            </button>
          ) : null}
        </div>

        <form
          onSubmit={onSubmitGroup}
          className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]"
        >
          <input
            type="text"
            value={groupName}
            onChange={(event) => onGroupNameChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
            placeholder="Örn: Motor"
          />

          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
          >
            {editingGroupId ? 'Güncelle' : 'Grup Ekle'}
          </button>
        </form>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-200 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-neutral-900">
            Mevcut Kategori Grupları
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Kayıtlı gruplar arasında arama yapın veya düzenlemek için seçim yapın.
          </p>
        </div>

        <input
          type="text"
          value={groupSearch}
          onChange={(event) => onGroupSearchChange(event.target.value)}
          className="h-10 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-red-600"
          placeholder="Kategori grubu ara..."
        />
      </div>

      <div className="mt-4 max-h-[430px] space-y-2 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-sm text-neutral-500">Yükleniyor...</div>
        ) : visibleCategoryGroups.length === 0 ? (
          <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
            {groupSearch
              ? 'Aramaya uygun kategori grubu bulunamadı.'
              : 'Henüz kategori grubu yok.'}
          </div>
        ) : (
          visibleCategoryGroups.map((group) => {
            const childCount = categories.filter(
              (category) => category.categoryGroupId === group.id,
            ).length;

            return (
              <div
                key={group.id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition ${
                  selectedGroupId === group.id
                    ? 'border-red-300 bg-red-50'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
                onClick={() => onSelectGroup(group.id)}
              >
                <div>
                  <div className="font-medium text-neutral-900">{group.name}</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {childCount} alt kategori
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditGroup(group);
                    }}
                    className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteGroup(group);
                    }}
                    className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Sil
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}