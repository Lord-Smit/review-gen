export default function ColorPicker({ label, value = '#000000', onChange }) {
  const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(value);
  const pickerValue = isValidHex ? value : '#000000';

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2.5">
        <div className="relative w-10 h-10 rounded-lg border border-gray-300 overflow-hidden shadow-xs flex-shrink-0">
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => onChange?.(e.target.value)}
            className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 cursor-pointer border-0 p-0"
            aria-label={`${label || 'Color'} picker`}
          />
        </div>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="#000000"
          maxLength={7}
          className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono text-gray-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
        />
      </div>
    </div>
  );
}
