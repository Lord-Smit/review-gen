import { Check } from 'lucide-react';

const STEP_LABELS = ['Rating', 'Experience', 'Review', 'Submit'];

export default function ProgressIndicator({
  currentStep = 1,
  totalSteps = 4,
}) {
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full px-2 py-4">
      {/* Progress bar with dots */}
      <div className="relative flex items-center justify-between">
        {/* Background track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 rounded-full" />

        {/* Filled track */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Step dots */}
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isUpcoming = step > currentStep;

          return (
            <div
              key={step}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`
                  flex items-center justify-center rounded-full
                  transition-all duration-300 ease-out
                  ${
                    isCompleted
                      ? 'w-7 h-7 bg-blue-600 text-white shadow-sm'
                      : isCurrent
                        ? 'w-8 h-8 bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-4 ring-blue-100'
                        : 'w-7 h-7 bg-white text-gray-400 border-2 border-gray-200'
                  }
                `}
              >
                {isCompleted ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {step}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  absolute -bottom-6 text-[11px] font-medium whitespace-nowrap
                  transition-colors duration-200
                  ${
                    isCompleted || isCurrent
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }
                `}
              >
                {STEP_LABELS[i] || `Step ${step}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Spacer for labels */}
      <div className="h-6" />
    </div>
  );
}
