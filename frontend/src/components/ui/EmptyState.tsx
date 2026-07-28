type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-neutral-900">
        {title}
      </h3>

      {description ? (
        <p className="mt-2 max-w-md text-sm text-neutral-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}