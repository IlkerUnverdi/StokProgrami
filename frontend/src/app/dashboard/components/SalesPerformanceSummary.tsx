'use client';

import { formatPrice } from '@/utils/format';

type SalesSummary = {
  salesCount: number;
  totalItems: number;
  salesTotal: string | number;
  collectedTotal: string | number;
  cariDebtTotal: string | number;
  manualPaymentTotal: string | number;
};

type SalesPerformanceSummaryProps = {
  summary: SalesSummary;
};

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description?: string;
}) {
  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-neutral-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900">
        {value}
      </div>
      {description ? (
        <div className="mt-1 text-xs text-neutral-500">{description}</div>
      ) : null}
    </div>
  );
}

export function SalesPerformanceSummary({
  summary,
}: SalesPerformanceSummaryProps) {
  return (
    <div className="w-full space-y-6">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">
          Satış Performansı
        </h2>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="Toplam Satış"
            value={summary.salesCount}
            description={`${summary.totalItems} adet ürün satıldı`}
          />
          <StatCard
            title="Satış Toplamı"
            value={formatPrice(summary.salesTotal)}
          />
          <StatCard
            title="Tahsil Edilen"
            value={formatPrice(summary.collectedTotal)}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">
          Nakit Akışı
        </h2>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="Cari Borç"
            value={formatPrice(summary.cariDebtTotal)}
          />
          <StatCard
            title="Manuel Ödeme"
            value={formatPrice(summary.manualPaymentTotal)}
          />
          <StatCard
            title="Net Tahsilat"
            value={formatPrice(summary.collectedTotal)}
          />
        </div>
      </section>
    </div>
  );
}