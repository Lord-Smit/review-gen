import { useRef, useEffect, useCallback } from 'react';

export default function ReviewEditor({ review = '', onChange }) {
  const textareaRef = useRef(null);

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(150, textarea.scrollHeight)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [review, autoResize]);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="w-full">
      <textarea
        ref={textareaRef}
        value={review}
        onChange={handleChange}
        placeholder="Your review will appear here..."
        rows={5}
        className="
          w-full min-h-[150px] px-4 py-3.5
          text-gray-800 text-base leading-relaxed
          bg-white border border-gray-200 rounded-xl
          resize-none
          placeholder:text-gray-400
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
          hover:border-gray-300
        "
      />
      <div className="flex justify-end mt-1.5 px-1">
        <span
          className={`text-xs font-medium transition-colors duration-200 ${
            review.length > 0 ? 'text-gray-500' : 'text-gray-300'
          }`}
        >
          {review.length} character{review.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
