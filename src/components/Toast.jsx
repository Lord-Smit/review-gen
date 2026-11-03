import { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const VARIANTS = {
  success: {
    icon: CheckCircle,
    iconClass: 'text-green-400',
    role: 'status',
  },
  error: {
    icon: AlertTriangle,
    iconClass: 'text-red-400',
    role: 'alert',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-300',
    role: 'status',
  },
};

export default function Toast({
  message = '',
  visible = false,
  onClose,
  variant = 'success',
  duration = 3500,
}) {
  useEffect(() => {
    if (!visible) return undefined;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, onClose, duration]);

  const config = VARIANTS[variant] || VARIANTS.success;
  const Icon = config.icon;

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2
        flex items-center gap-2.5 px-5 py-3.5
        bg-gray-900/95 text-white backdrop-blur-sm
        rounded-2xl shadow-2xl shadow-black/20
        transition-all duration-300 ease-out
        ${
          visible
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0'
        }
      `}
      role={config.role}
      aria-live={config.role === 'alert' ? 'assertive' : 'polite'}
      aria-hidden={!visible}
    >
      <Icon size={20} className={`flex-shrink-0 ${config.iconClass}`} aria-hidden="true" />
      <span className="pr-1 text-sm font-medium">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-1 rounded-full p-1 transition-colors duration-150 hover:bg-white/10"
        aria-label="Dismiss notification"
      >
        <X size={14} className="text-gray-400" aria-hidden="true" />
      </button>
    </div>
  );
}
