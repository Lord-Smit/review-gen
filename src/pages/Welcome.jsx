import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import StarRating from '../components/StarRating';
import ProgressIndicator from '../components/ProgressIndicator';
import Footer from '../components/Footer';
import businessConfig from '../config/business';

export default function Welcome({ rating, onRatingChange, onNext }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="flex flex-col transition-opacity duration-500 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-10 text-center">
          <ProgressIndicator currentStep={1} />

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How was your experience?
            </h1>
            <p className="text-base text-gray-500 sm:text-lg">
              {businessConfig.BUSINESS_TAGLINE}
            </p>
          </div>

          <div className="flex justify-center py-4">
            <StarRating rating={rating} onRatingChange={onRatingChange} size="lg" />
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!rating}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
