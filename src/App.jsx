import { useState, useCallback } from 'react';
import Welcome from './pages/Welcome';
import Experience from './pages/Experience';
import ReviewPreview from './pages/ReviewPreview';
import ReviewConfirmation from './pages/ReviewConfirmation';
import reviewOptions from './data/reviewOptions';
import { generateReview } from './utils/generateReview';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [comment, setComment] = useState('');
  const [review, setReview] = useState('');

  const handleRatingChange = useCallback((newRating) => {
    setRating(newRating);
    // Reset selected options when rating changes since options differ per rating
    setSelectedOptions([]);
  }, []);

  const handleToggleOption = useCallback((optionId) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  }, []);

  const handleCommentChange = useCallback((value) => {
    setComment(value);
  }, []);

  const handleGenerateReview = useCallback(() => {
    const options = reviewOptions[rating] || [];
    const selectedLabels = options
      .filter((opt) => selectedOptions.includes(opt.id))
      .map((opt) => opt.label);

    const generatedReview = generateReview({
      rating,
      selectedOptions: selectedLabels,
      comment: comment.trim(),
    });

    setReview(generatedReview);
    setCurrentStep(3);
  }, [rating, selectedOptions, comment]);

  const handleRegenerateReview = useCallback(() => {
    const options = reviewOptions[rating] || [];
    const selectedLabels = options
      .filter((opt) => selectedOptions.includes(opt.id))
      .map((opt) => opt.label);

    const generatedReview = generateReview({
      rating,
      selectedOptions: selectedLabels,
      comment: comment.trim(),
    });

    setReview(generatedReview);
  }, [rating, selectedOptions, comment]);

  const handleReviewChange = useCallback((value) => {
    setReview(value);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentStep(1);
    setRating(0);
    setSelectedOptions([]);
    setComment('');
    setReview('');
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <div className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
        {currentStep === 1 && (
          <Welcome
            rating={rating}
            onRatingChange={handleRatingChange}
            onNext={() => goToStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Experience
            rating={rating}
            selectedOptions={selectedOptions}
            onToggleOption={handleToggleOption}
            comment={comment}
            onCommentChange={handleCommentChange}
            onNext={handleGenerateReview}
            onBack={() => goToStep(1)}
          />
        )}

        {currentStep === 3 && (
          <ReviewPreview
            rating={rating}
            review={review}
            onReviewChange={handleReviewChange}
            onRegenerate={handleRegenerateReview}
            onNext={() => goToStep(4)}
            onBack={() => goToStep(2)}
          />
        )}

        {currentStep === 4 && (
          <ReviewConfirmation
            rating={rating}
            review={review}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}

export default App;
