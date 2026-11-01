/**
 * Predefined experience options for each star rating.
 * Each option has a unique id, a human-readable label, and a Lucide icon name.
 */
const reviewOptions = {
  5: [
    { id: '5-excellent-service', label: 'Excellent service', icon: 'Star' },
    { id: '5-friendly-staff', label: 'Friendly staff', icon: 'Heart' },
    { id: '5-great-quality', label: 'Great quality', icon: 'Sparkles' },
    { id: '5-amazing-experience', label: 'Amazing experience', icon: 'PartyPopper' },
    { id: '5-beautiful-ambience', label: 'Beautiful ambience', icon: 'Sun' },
    { id: '5-value-for-money', label: 'Value for money', icon: 'BadgeDollarSign' },
    { id: '5-quick-service', label: 'Quick service', icon: 'Zap' },
    { id: '5-highly-professional', label: 'Highly professional', icon: 'Award' },
  ],
  4: [
    { id: '4-good-service', label: 'Good service', icon: 'ThumbsUp' },
    { id: '4-great-quality', label: 'Great quality', icon: 'Sparkles' },
    { id: '4-friendly-staff', label: 'Friendly staff', icon: 'Smile' },
    { id: '4-nice-experience', label: 'Nice experience', icon: 'Heart' },
    { id: '4-good-atmosphere', label: 'Good atmosphere', icon: 'Sun' },
    { id: '4-good-value', label: 'Good value', icon: 'BadgeDollarSign' },
    { id: '4-reliable', label: 'Reliable', icon: 'ShieldCheck' },
    { id: '4-well-organized', label: 'Well organized', icon: 'LayoutList' },
  ],
  3: [
    { id: '3-average-experience', label: 'Average experience', icon: 'Minus' },
    { id: '3-satisfactory-service', label: 'Satisfactory service', icon: 'CheckCircle' },
    { id: '3-decent-quality', label: 'Decent quality', icon: 'CircleDot' },
    { id: '3-room-for-improvement', label: 'Room for improvement', icon: 'TrendingUp' },
    { id: '3-reasonable-pricing', label: 'Reasonable pricing', icon: 'Coins' },
    { id: '3-nothing-special', label: 'Nothing special', icon: 'Meh' },
  ],
  2: [
    { id: '2-slow-service', label: 'Service was slow', icon: 'Clock' },
    { id: '2-quality-needs-improvement', label: 'Quality needs improvement', icon: 'AlertTriangle' },
    { id: '2-long-waiting', label: 'Long waiting time', icon: 'Hourglass' },
    { id: '2-below-expectations', label: 'Experience was below expectations', icon: 'ThumbsDown' },
    { id: '2-staff-friendlier', label: 'Staff could be friendlier', icon: 'Frown' },
  ],
  1: [
    { id: '1-poor-service', label: 'Poor service', icon: 'XCircle' },
    { id: '1-unpleasant-experience', label: 'Unpleasant experience', icon: 'ThumbsDown' },
    { id: '1-disappointing-quality', label: 'Quality was disappointing', icon: 'AlertOctagon' },
    { id: '1-long-waiting', label: 'Long waiting time', icon: 'Hourglass' },
    { id: '1-would-not-recommend', label: 'Would not recommend', icon: 'Ban' },
  ],
};

export default reviewOptions;
