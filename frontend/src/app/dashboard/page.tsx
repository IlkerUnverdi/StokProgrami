'use client';

import { useState } from 'react';
import { formatPrice } from '@/utils/format';
import { useDailySales } from '@/hooks/useDailySales';
import { useCurrentAccountStatement } from '@/hooks/useCurrentAccountStatement';

import { StatCard } from '@/components/ui/StatCard';
import { AlertMessage } from '@/components/ui/AlertMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { SalesPerformanceSummary } from './components/SalesPerformanceSummary';
import { DailySalesList } from './components/DailySalesList';
import { ManualPaymentsList } from './components/ManualPaymentsList';

export default function DashboardPage() {
  const [openSaleId, setOpenSaleId] = useState<number | null>(null);
  const { date, setDate, data, loading, error, setError } = useDailySales();
  const { handlePrintCurrentAccountStatement } = useCurrentAccountStatement({
    setError,
  });

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">Dashboard</h1>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Tarih
          </label>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-11 rounded-xl border border-neutral-300 bg-white px-4 outline-none focus:border-red-600"
          />
        </div>
      </div>

      {error ? (
        <AlertMessage
          type="error"
          message={error}
        />
      ) : null}

      <div className="w-full">
        <div className="w-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          {data?.summary ? (
            <SalesPerformanceSummary summary={data.summary} />
          ) : null}
          <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              label="Toplam Tahsilat"
              value={loading ? '-' : formatPrice(summary?.collectedTotal ?? 0)}
              className="border-0 bg-green-50 p-5 text-green-700 shadow-none [&_div:first-child]:text-green-700 [&_div:nth-child(2)]:text-green-700"
            />

            <StatCard
              label="Cari Tahsilat"
              value={loading ? '-' : formatPrice(summary?.manualPaymentTotal ?? 0)}
              className="border-0 bg-green-50 p-5 text-green-700 shadow-none [&_div:first-child]:text-green-700 [&_div:nth-child(2)]:text-green-700"
            />

            <StatCard
              label="Cariye Yazılan"
              value={loading ? '-' : formatPrice(summary?.cariDebtTotal ?? 0)}
              className="border-0 bg-orange-50 p-5 text-orange-700 shadow-none [&_div:first-child]:text-orange-700 [&_div:nth-child(2)]:text-orange-700"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 p-5">
          <h2 className="text-xl font-semibold text-neutral-900">
            Günlük Satışlar
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-neutral-500">Yükleniyor...</div>
        ) : !data?.sales.length && !data?.manualPayments.length ? (
           <EmptyState
            title="Kayıt Bulunamadı"
            description="Seçilen tarih aralığında satış kaydı bulunamadı."
          />
        ) : (
          <div className="divide-y divide-neutral-200">
            <DailySalesList
              sales={data.sales}
              openSaleId={openSaleId}
              onToggleSale={setOpenSaleId}
            />
            <ManualPaymentsList
              manualPayments={data.manualPayments}
              manualPaymentTotal={summary?.manualPaymentTotal ?? 0}
              onPrintStatement={handlePrintCurrentAccountStatement}
            />
          </div>
        )}
      </div>
    </div>
  );
}