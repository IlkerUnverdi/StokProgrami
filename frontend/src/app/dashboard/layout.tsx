'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter();

  function handleLogout() {
    document.cookie = 'access_token=; path=/; max-age=0';
    localStorage.removeItem('auth_user');
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col justify-between bg-black p-6 text-white">
        <div>
          <div className="mb-10 text-xl font-bold">Enes Otomotiv</div>

          <nav className="space-y-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-800"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/products')}
              className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-800"
            >
              Ürünler
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/stock')}
              className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-800"
            >
              Stok Girişi
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/sales')}
              className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-800"
            >
              Satışlar
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/current-accounts')}
              className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-800"
            >
              Cariler
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/settings')}
              className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-800"
            >
              Sistem Ayarları
            </button>
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-10 rounded-lg bg-red-600 px-4 py-2 text-sm hover:bg-red-700"
        >
          Çıkış Yap
        </button>
      </aside>

      <main className="flex-1 bg-neutral-100 p-8">{children}</main>
    </div>
  );
}