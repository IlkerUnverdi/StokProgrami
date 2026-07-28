type StatCardProps = {
  label: string;
  value: string | number;
  description?: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  description,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-neutral-900">{value}</div>
      {description ? (
        <div className="mt-1 text-xs text-neutral-400">{description}</div>
      ) : null}
    </div>
  );
}
