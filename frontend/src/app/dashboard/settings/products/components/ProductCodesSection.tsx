

'use client';

type CodeFieldName = 'oemCodes' | 'referenceCodes';

type ProductCodesSectionProps = {
  oemCodes: string[];
  referenceCodes: string[];
  onUpdateCode: (field: CodeFieldName, index: number, value: string) => void;
  onAddCode: (field: CodeFieldName) => void;
  onRemoveCode: (field: CodeFieldName, index: number) => void;
};

function CodeInputs({
  title,
  description,
  field,
  values,
  placeholder,
  onUpdateCode,
  onAddCode,
  onRemoveCode,
}: {
  title: string;
  description: string;
  field: CodeFieldName;
  values: string[];
  placeholder: string;
  onUpdateCode: ProductCodesSectionProps['onUpdateCode'];
  onAddCode: ProductCodesSectionProps['onAddCode'];
  onRemoveCode: ProductCodesSectionProps['onRemoveCode'];
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        </div>

        <button
          type="button"
          onClick={() => onAddCode(field)}
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Ekle
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {values.map((value, index) => (
          <div key={`${field}-${index}`} className="flex gap-2">
            <input
              value={value}
              onChange={(event) =>
                onUpdateCode(field, index, event.target.value)
              }
              placeholder={placeholder}
              className="h-11 flex-1 rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-red-600"
            />

            <button
              type="button"
              onClick={() => onRemoveCode(field, index)}
              disabled={values.length === 1}
              className="rounded-xl border border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductCodesSection({
  oemCodes,
  referenceCodes,
  onUpdateCode,
  onAddCode,
  onRemoveCode,
}: ProductCodesSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <CodeInputs
        title="OEM Kodları"
        description="Ürünün orijinal ekipman / üretici kodlarını ekleyin."
        field="oemCodes"
        values={oemCodes}
        placeholder="Örn: 7701209835"
        onUpdateCode={onUpdateCode}
        onAddCode={onAddCode}
        onRemoveCode={onRemoveCode}
      />

      <CodeInputs
        title="Reference Kodları"
        description="Muadil, katalog veya tedarikçi referans kodlarını ekleyin."
        field="referenceCodes"
        values={referenceCodes}
        placeholder="Örn: MGA-12345"
        onUpdateCode={onUpdateCode}
        onAddCode={onAddCode}
        onRemoveCode={onRemoveCode}
      />
    </div>
  );
}