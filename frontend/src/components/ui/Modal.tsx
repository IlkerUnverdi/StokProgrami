

import { ReactNode, useEffect } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
};

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
};

export function Modal({
  open,
  title,
  onClose,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Modalı kapat"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative max-h-[90vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ${sizeClasses[size]}`}
      >
        {title ? (
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Kapat
            </button>
          </div>
        ) : null}

        <div className="max-h-[calc(90vh-73px)] overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}