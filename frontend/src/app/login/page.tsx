'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/services/auth';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({ username, password });

      document.cookie = `access_token=${result.access_token}; path=/`;
      localStorage.setItem('auth_user', JSON.stringify(result.user));

      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('LOGIN ERROR:', err);

      if (axios.isAxiosError(err)) {
        console.error('LOGIN RESPONSE:', err.response?.data);

        const message =
          typeof err.response?.data?.message === 'string'
            ? err.response.data.message
            : 'Giriş sırasında bir hata oluştu.';

        setError(message);
      } else {
        setError('Giriş sırasında bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="login-gradient hidden flex-col justify-between p-12 text-white lg:flex">
        <div className="flex items-center gap-4">
          <Image
            src="/branding/logo-square.png"
            alt="Enes Otomotiv"
            width={64}
            height={64}
            className="rounded-md"
          />
          <div>
            <div className="text-2xl font-semibold">Enes Otomotiv</div>
            <div className="text-sm text-neutral-400">Yönetim Paneli</div>
          </div>
        </div>

        <div className="max-w-xl">
          <Image
            src="/branding/logo-horizontal.png"
            alt="Enes Otomotiv Yedek Parça"
            width={520}
            height={120}
            className="mb-8"
          />

          <h1 className="mb-4 text-4xl font-semibold leading-tight">
            Stok, satış, teklif ve cari yönetimini tek panelden yönetin.
          </h1>

          <div className="space-y-3 text-base text-neutral-300">
            <p>Ürün, OEM, muadil ve araç uyumluluğunu tek merkezde yönetin.</p>
            <p>Satış, alış, tahsilat ve teklif akışlarını hızlıca takip edin.</p>
            <p>Düşük stokları ve günlük hareketleri anlık olarak izleyin.</p>
          </div>
        </div>

        <div className="text-sm text-neutral-500">
          Enes Otomotiv Yedek Parça
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-6 py-10">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <Image
              src="/branding/logo-horizontal.png"
              alt="Enes Otomotiv"
              width={280}
              height={70}
            />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Giriş Yap
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Yönetim paneline erişmek için bilgilerinizi girin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
                className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none transition focus:border-red-600"
                required
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-red-600 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}