import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Copy, ExternalLink, RotateCcw } from 'lucide-react';
import StarRating from '../components/StarRating';
import ProgressIndicator from '../components/ProgressIndicator';
import Toast from '../components/Toast';
import businessConfig from '../config/business';
import { copyToClipboard } from '../utils/clipboard';

export default function ReviewConfirmation({ rating, review, onRestart }) {
  const [visible, setVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(review);
    setShowToast(true);
  }, [review]);

  const handleOpenGoogle = useCallback(async () => {
    await copyToClipboard(review);
    setShowToast(true);
    window.open(businessConfig.GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer');
  }, [review]);

  return (
    <div
      className="flex flex-col transition-opacity duration-500 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <main className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8">
          <ProgressIndicator currentStep={4} />

          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-9 w-9 text-green-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Your review is ready!
              </h1>
              <p className="text-base text-gray-500">
                Thank you for sharing your experience.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <div className="mb-4 flex justify-center">
              <StarRating rating={rating} readonly size="sm" />
            </div>
            <p className="whitespace-pre-wrap text-sm italic leading-relaxed text-gray-700">
              {review}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <Copy className="h-4 w-4" />
              Copy Review
            </button>

            <button
              type="button"
              onClick={handleOpenGoogle}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              Open Google Reviews
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            Your review will be copied automatically. Just paste it on Google.
          </p>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-700"
            >
              <RotateCcw className="h-4 w-4" />
              Write Another Review
            </button>
          </div>
        </div>
      </main>

      <Toast
        message="Review copied to clipboard!"
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
