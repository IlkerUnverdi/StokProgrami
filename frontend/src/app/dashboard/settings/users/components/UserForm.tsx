

'use client';

import { FormEvent } from 'react';

type RoleOption = {
  value: string;
  label: string;
};

type UserFormProps = {
  username: string;
  password: string;
  role: string;
  roleOptions: RoleOption[];
  saving: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function UserForm({
  username,
  password,
  role,
  roleOptions,
  saving,
  onUsernameChange,
  onPasswordChange,
  onRoleChange,
  onSubmit,
}: UserFormProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-neutral-900">
          Yeni Kullanıcı
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          Kullanıcı adı, geçici şifre ve rol seçimi ile kullanıcı oluşturun.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            type="text"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            className="h-11 rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
            placeholder="Kullanıcı adı"
          />

          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            className="h-11 rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
            placeholder="Geçici şifre"
          />

          <select
            value={role}
            onChange={(event) => onRoleChange(event.target.value)}
            className="h-11 rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          >
            {roleOptions.map((roleOption) => (
              <option key={roleOption.value} value={roleOption.value}>
                {roleOption.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
          >
            {saving ? 'Kaydediliyor...' : 'Kullanıcı Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
}