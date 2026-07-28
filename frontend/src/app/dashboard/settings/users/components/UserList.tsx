'use client';

type SystemUser = {
  id: number;
  username: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
};

type UserListProps = {
  users: SystemUser[];
  totalUsers: number;
  search: string;
  loading: boolean;
  saving: boolean;
  onSearchChange: (value: string) => void;
  onDeleteUser: (user: SystemUser) => void | Promise<void>;
};

export function UserList({
  users,
  totalUsers,
  search,
  loading,
  saving,
  onSearchChange,
  onDeleteUser,
}: UserListProps) {
  return (
    <div className="mt-4 rounded-2xl border border-neutral-200 p-4">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Mevcut Kullanıcılar
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            {totalUsers} kullanıcı kayıtlı.
          </p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-10 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-red-600 md:w-80"
          placeholder="Kullanıcı ara..."
        />
      </div>

      <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-sm text-neutral-500">Yükleniyor...</div>
        ) : users.length === 0 ? (
          <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
            {search ? 'Aramaya uygun kullanıcı bulunamadı.' : 'Henüz kullanıcı yok.'}
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3"
            >
              <div>
                <div className="font-medium text-neutral-900">
                  {user.username}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Rol: {user.role}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.isActive === false
                      ? 'bg-red-50 text-red-700'
                      : 'bg-green-50 text-green-700'
                  }`}
                >
                  {user.isActive === false ? 'Pasif' : 'Aktif'}
                </span>

                <button
                  type="button"
                  onClick={() => onDeleteUser(user)}
                  disabled={saving}
                  className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}