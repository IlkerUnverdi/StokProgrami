'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useState } from 'react';
import { findProductByQuery, Product } from '@/services/products';
import { useProductMeta } from '@/hooks/useProductMeta';


type RichProduct = Product & {
  imageUrl?: string;
  oemCodes?: Array<{
    id: number;
    code: string;
    isPrimary: boolean;
  }>;
  referenceCodes?: Array<{
    id: number;
    code: string;
  }>;
};


export default function ProductsSettingsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'idle' | 'notfound' | 'multiple'>(
    'idle',
  );
  const { loadingMeta: metaLoading, error: metaError } = useProductMeta();
  const [loading, setLoading] = useState(false);
  const [matchedProducts, setMatchedProducts] = useState<RichProduct[]>([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function resetSelection() {
    setMatchedProducts([]);
  }

  async function handleSearch() {
    setLoading(true);
    setError('');
    setMessage('');
    resetSelection();

    try {
      const data = (await findProductByQuery(search.trim())) as RichProduct[];

      if (data.length === 0) {
        setMode('notfound');
        setError(
          'Ürün bulunamadı. Yeni kayıt açmak için "Yeni Ürün Oluştur" ekranını kullanın.',
        );
      } else if (data.length === 1) {
        router.push(`/dashboard/settings/products/edit/${data[0].id}`);
      } else {
        setMatchedProducts(data);
        setMode('multiple');
        setMessage(
          'Birden fazla eşleşen ürün bulundu. Lütfen listeden seçim yapın.',
        );
      }
    } catch (err: unknown) {
      console.error('SEARCH ERROR:', err);

      let messageText = 'Arama sırasında hata oluştu.';

      if (axios.isAxiosError(err)) {
        const rawMessage = err.response?.data?.message;
        messageText =
          typeof rawMessage === 'string'
            ? rawMessage
            : Array.isArray(rawMessage)
              ? rawMessage.join(', ')
              : messageText;
      }

      setMode('idle');
      setError(messageText);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectMatchedProduct(product: RichProduct) {
    router.push(`/dashboard/settings/products/edit/${product.id}`);
  }



  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Ürün Ayarları
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Barkod, OEM veya reference kodu ile ürünü bulun ve yönetin.
          </p>
        </div>

        <Link
          href="/dashboard/settings/products/create"
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Yeni Ürün Oluştur
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-neutral-900">
          Ürün Ara
        </h2>

        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Barkod / OEM / reference girin"
            className="h-12 flex-1 rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !search.trim() || metaLoading}
            className="rounded-xl bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>
        </div>

        {message ? (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            {error}
          </div>
        ) : null}
        {metaError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {metaError}
          </div>
        ) : null}
      </div>

      {mode === 'multiple' && matchedProducts.length > 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-neutral-900">
            Eşleşen Ürünler
          </h2>

          <div className="space-y-3">
            {matchedProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSelectMatchedProduct(product)}
                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-left hover:bg-neutral-50"
              >
                <div>
                  <div className="font-medium text-neutral-900">
                    {product.name}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    Barkod: {product.barcode || '-'}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    OEM:{' '}
                    {product.oemCodes?.map((code) => code.code).join(', ') || '-'}
                  </div>
                </div>

                <div className="text-right text-sm text-neutral-500">
                  <div>{product.partBrand?.name || 'Marka yok'}</div>
                  <div>{product.category?.name || 'Kategori yok'}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

    </div>
  );
}