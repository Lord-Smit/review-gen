import { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  variant = 'default',
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [busy, setBusy] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  // Keep the latest callback without re-running the focus effect whenever the
  // parent re-renders with a new inline function.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;

    const frame = requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector(FOCUSABLE_SELECTOR);
      (firstFocusable || dialogRef.current)?.focus?.();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const isDanger = variant === 'danger';

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm?.();
      onCloseRef.current?.();
    } catch (error) {
      console.error('Confirmed action failed:', error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className="relative z-10 w-full max-w-md transform overflow-hidden rounded-xl border border-gray-100 bg-white p-6 text-left shadow-xl outline-none transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {isDanger && (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </div>
              )}
              <h3 id={titleId} className="text-lg font-semibold leading-6 text-gray-900">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3">
            <p id={descriptionId} className="text-sm leading-relaxed text-gray-600">
              {message}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60 ${
                isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
