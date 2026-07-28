'use client';

import Link from 'next/link';
import { useUsers } from '@/hooks/useUsers';
import { UserForm } from './components/UserForm';
import { UserList } from './components/UserList';

const roleOptions = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Mudur', label: 'Müdür' },
  { value: 'SatisElemani', label: 'Satış Elemanı' },
  { value: 'Depo', label: 'Depo' },
  { value: 'Kasa', label: 'Kasa' },
];

export default function UserSettingsPage() {
  const {
    users,
    visibleUsers,
    form,
    search,
    loading,
    saving,
    error,
    message,
    setSearch,
    updateField,
    handleSubmit,
    deleteUser,
  } = useUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Kullanıcı Ayarları
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-500">
            Sisteme giriş yapacak kullanıcıları oluşturun, rollerini belirleyin ve
            gerektiğinde kullanıcıları aktif/pasif hale getirin.
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
          <div className="text-sm text-neutral-500">Toplam Kullanıcı</div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">
            {users.length}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-neutral-500">Gösterilen Kullanıcı</div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">
            {visibleUsers.length}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Kullanıcı Yönetimi
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Yeni kullanıcı oluşturun ve mevcut kullanıcıların durumlarını yönetin.
          </p>
        </div>

        <UserForm
          username={form.username}
          password={form.password}
          role={form.role}
          roleOptions={roleOptions}
          saving={saving}
          onUsernameChange={(value) => updateField('username', value)}
          onPasswordChange={(value) => updateField('password', value)}
          onRoleChange={(value) => updateField('role', value)}
          onSubmit={handleSubmit}
        />

        <UserList
          users={visibleUsers}
          totalUsers={users.length}
          search={search}
          loading={loading}
          saving={saving}
          onSearchChange={setSearch}
          onDeleteUser={deleteUser}
        />
      </section>
    </div>
  );
}
