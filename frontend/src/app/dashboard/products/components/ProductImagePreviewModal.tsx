'use client';

import { Modal } from '@/components/ui/Modal';

type ProductImagePreviewModalProps = {
  open: boolean;
  imageUrl?: string | null;
  productName?: string;
  onClose: () => void;
};

export default function ProductImagePreviewModal({
  open,
  imageUrl,
  productName,
  onClose,
}: ProductImagePreviewModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={productName || 'Ürün Görseli'}>
      <div className="flex items-center justify-center rounded-2xl bg-neutral-100 p-4">
        {imageUrl ? (
          <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={productName || 'Ürün görseli'}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-[420px] w-full items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white text-sm text-neutral-500">
            Görsel bulunamadı.
          </div>
        )}
      </div>
    </Modal>
  );
}
