import {
  Sparkles,
  Heart,
  ThumbsUp,
  Star,
  Coffee,
  DollarSign,
  Clock,
  Users,
  Smile,
  Award,
  TrendingUp,
  AlertCircle,
  Frown,
  ThumbsDown,
  Meh,
  Shield,
  Zap,
  Check,
  MapPin,
  Music,
  PartyPopper,
  Sun,
  BadgeDollarSign,
  ShieldCheck,
  LayoutList,
  Minus,
  CheckCircle,
  CircleDot,
  Coins,
  AlertTriangle,
  Hourglass,
  XCircle,
  AlertOctagon,
  Ban,
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Heart,
  ThumbsUp,
  Star,
  Coffee,
  DollarSign,
  Clock,
  Users,
  Smile,
  Award,
  TrendingUp,
  AlertCircle,
  Frown,
  ThumbsDown,
  Meh,
  Shield,
  Zap,
  Check,
  MapPin,
  Music,
  PartyPopper,
  Sun,
  BadgeDollarSign,
  ShieldCheck,
  LayoutList,
  Minus,
  CheckCircle,
  CircleDot,
  Coins,
  AlertTriangle,
  Hourglass,
  XCircle,
  AlertOctagon,
  Ban,
};

export default function ExperienceOptions({
  options = [],
  selectedOptions = [],
  onToggle,
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {options.map((option) => {
        const isSelected = selectedOptions.includes(option.id);
        const IconComponent = ICON_MAP[option.icon];

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle && onToggle(option.id)}
            className={`
              flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm font-medium
              transition-all duration-200 ease-out
              border select-none
              ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 scale-[1.02]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:scale-95'
              }
            `}
            aria-pressed={isSelected}
          >
            {IconComponent && (
              <IconComponent
                size={18}
                className={`flex-shrink-0 transition-colors duration-200 ${
                  isSelected ? 'text-white' : 'text-gray-400'
                }`}
              />
            )}
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
