import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

export default function Toast({ message = '', visible = false, onClose }) {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [visible, onClose]);

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-2.5 px-5 py-3.5
        bg-gray-900/90 backdrop-blur-sm text-white
        rounded-2xl shadow-2xl shadow-black/20
        transition-all duration-300 ease-out
        ${
          visible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }
      `}
      role="alert"
      aria-live="polite"
    >
      <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
      <span className="text-sm font-medium pr-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-1 p-1 rounded-full hover:bg-white/10 transition-colors duration-150"
        aria-label="Dismiss notification"
      >
        <X size={14} className="text-gray-400" />
      </button>
    </div>
  );
}
