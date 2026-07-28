interface StockBadgeProps {
  stock: number;
  className?: string;
}

export function StockBadge({ stock, className = '' }: StockBadgeProps) {
  const normalizedStock = Number(stock ?? 0);

  let colorClasses =
    'border-blue-200 bg-blue-50 text-blue-700';

  if (normalizedStock <= 0) {
    colorClasses = 'border-red-200 bg-red-50 text-red-700';
  } else if (normalizedStock <= 3) {
    colorClasses = 'border-orange-200 bg-orange-50 text-orange-700';
  } else if (normalizedStock <= 10) {
    colorClasses = 'border-green-200 bg-green-50 text-green-700';
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${colorClasses} ${className}`}
    >
      Stok: {normalizedStock}
    </span>
  );
}
