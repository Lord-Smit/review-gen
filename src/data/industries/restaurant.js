import { commentIntros, connectors } from './shared';

/**
 * Restaurant industry preset.
 *
 * Vocabulary is deliberately tailored to dining: food quality, flavour,
 * attentive service, atmosphere, wait times, portion sizes, drinks, and
 * hospitality.
 *
 * Copy rules:
 *   * never invent specifics the customer did not select (Google policy safety)
 *   * every description keeps `{options}` so the selected taps are always used
 *   * every option icon must exist in `src/components/iconMap.js`
 */
const restaurant = {
  id: 'restaurant',
  label: 'Restaurant',
  description: 'Food, dining, service, ambience, and drinks.',
  aliases: [
    'restaurants',
    'food',
    'dining',
    'cafe',
    'bistro',
    'eatery',
    'bar',
    'bakery',
    'pub',
    'diner',
    'culinary',
  ],
  page: {
    welcomeHeading: 'How was your dining experience?',
    welcomeDescription: 'Tell us about the food, service, and atmosphere.',
    commentPlaceholder: 'Anything specific about the dishes, service, or ambience?',
  },
  options: {
    5: [
      { id: 'restaurant-5-delicious-food', label: 'Delicious food', icon: 'Utensils' },
      { id: 'restaurant-5-attentive-service', label: 'Attentive service', icon: 'Users' },
      { id: 'restaurant-5-great-ambience', label: 'Great ambience', icon: 'Sparkles' },
      { id: 'restaurant-5-quick-seating', label: 'Quick seating and service', icon: 'Zap' },
      { id: 'restaurant-5-fresh-ingredients', label: 'Fresh ingredients', icon: 'CheckCircle' },
      { id: 'restaurant-5-generous-portions', label: 'Generous portion sizes', icon: 'Award' },
      { id: 'restaurant-5-reasonable-prices', label: 'Reasonable prices', icon: 'BadgeDollarSign' },
      { id: 'restaurant-5-clean-dining-area', label: 'A clean and welcoming dining area', icon: 'Heart' },
    ],
    4: [
      { id: 'restaurant-4-tasty-dishes', label: 'Tasty dishes', icon: 'ThumbsUp' },
      { id: 'restaurant-4-polite-staff', label: 'Polite and friendly staff', icon: 'Smile' },
      { id: 'restaurant-4-pleasant-atmosphere', label: 'A pleasant atmosphere', icon: 'Heart' },
      { id: 'restaurant-4-good-portions', label: 'Good portion sizes', icon: 'CheckCircle' },
      { id: 'restaurant-4-fair-pricing', label: 'Fair pricing', icon: 'BadgeDollarSign' },
      { id: 'restaurant-4-short-wait', label: 'A short wait time', icon: 'Clock' },
      { id: 'restaurant-4-good-drink-selection', label: 'A good drink selection', icon: 'Coffee' },
      { id: 'restaurant-4-clean-tables', label: 'Clean tables and cutlery', icon: 'Sparkles' },
    ],
    3: [
      { id: 'restaurant-3-average-food', label: 'Average food quality', icon: 'Meh' },
      { id: 'restaurant-3-decent-service', label: 'Decent service', icon: 'Smile' },
      { id: 'restaurant-3-moderate-wait', label: 'A moderate wait time', icon: 'Clock' },
      { id: 'restaurant-3-fair-portions', label: 'Fair portion sizes', icon: 'Minus' },
      { id: 'restaurant-3-standard-pricing', label: 'Standard pricing', icon: 'Coins' },
      { id: 'restaurant-3-noisy-atmosphere', label: 'A noisy atmosphere', icon: 'CircleDot' },
      { id: 'restaurant-3-limited-menu', label: 'Limited menu options', icon: 'LayoutList' },
    ],
    2: [
      { id: 'restaurant-2-slow-service', label: 'Slow service', icon: 'Hourglass' },
      { id: 'restaurant-2-lukewarm-food', label: 'Food served lukewarm', icon: 'AlertTriangle' },
      { id: 'restaurant-2-bland-flavours', label: 'Bland flavours', icon: 'Frown' },
      { id: 'restaurant-2-crowded-space', label: 'A crowded and noisy dining space', icon: 'Users' },
      { id: 'restaurant-2-inattentive-waitstaff', label: 'Inattentive waitstaff', icon: 'Clock' },
      { id: 'restaurant-2-overpriced-items', label: 'Overpriced items for what was served', icon: 'Coins' },
      { id: 'restaurant-2-small-portions', label: 'Small portion sizes', icon: 'ThumbsDown' },
    ],
    1: [
      { id: 'restaurant-1-poor-food-quality', label: 'Poor food quality', icon: 'AlertOctagon' },
      { id: 'restaurant-1-rude-service', label: 'Rude or dismissive service', icon: 'Frown' },
      { id: 'restaurant-1-excessive-wait', label: 'Excessive wait times', icon: 'Hourglass' },
      { id: 'restaurant-1-unclean-dining-area', label: 'An unclean dining area', icon: 'XCircle' },
      { id: 'restaurant-1-incorrect-order', label: 'An incorrect order', icon: 'AlertCircle' },
      { id: 'restaurant-1-overpriced-disappointing', label: 'Overpriced and disappointing dishes', icon: 'Coins' },
      { id: 'restaurant-1-unacceptable-experience', label: 'An unacceptable dining experience', icon: 'ThumbsDown' },
    ],
  },
  templates: {
    openings: {
      5: [
        'Dining here was a wonderful experience from start to finish.',
        'We had a fantastic meal and were thoroughly impressed with our visit.',
        'This restaurant exceeded our expectations with exceptional food and hospitality.',
        'I had an outstanding dining experience and will definitely be back.',
        'From the moment we walked in to the final course, everything was top-notch.',
        'One of the best dining experiences I have had in a long time.',
      ],
      4: [
        'Overall, we had a very pleasant meal here.',
        'A solid dining experience with great flavours and good hospitality.',
        'I enjoyed my visit to this restaurant and left well satisfied.',
        'We had a good time dining here, with just a few small details that could be improved.',
        'A dependable spot for a good meal with family and friends.',
        'The restaurant took good care of us throughout our meal.',
      ],
      3: [
        'Our meal was okay, though there were a few areas that could be improved.',
        'The dining experience was fairly average overall.',
        'I have mixed feelings about our visit to this restaurant.',
        'It was a decent meal, but nothing that really stood out.',
        'An acceptable dining experience, though not quite what we had hoped for.',
        'The food and service were alright, but there is room for improvement.',
      ],
      2: [
        'Unfortunately, our dining experience fell well short of expectations.',
        'We were disappointed with several aspects of our meal.',
        'I expected much better based on the reviews and reputation.',
        'Our visit here did not go as smoothly as we had hoped.',
        'Several issues during our meal left us let down.',
        'The experience was subpar and needs more attention to detail.',
      ],
      1: [
        'I was very dissatisfied with our dining experience here.',
        'Our visit was deeply disappointing from start to finish.',
        'I am writing this because the meal and service were completely unacceptable.',
        'This was one of the most frustrating dining experiences I have had.',
        'I cannot recommend this restaurant based on how our visit went.',
        'We left completely unhappy with the food and how we were treated.',
      ],
    },
    descriptions: {
      5: [
        'We especially loved {options}.',
        'What really made the meal special was {options}.',
        'The highlights of our visit were {options}.',
        'Everything came together beautifully, particularly {options}.',
        '{options} made our visit truly memorable.',
        'I was particularly impressed by {options}.',
        'From start to finish, {options} were handled brilliantly.',
        'The kitchen and staff got everything right, especially {options}.',
      ],
      4: [
        'We particularly appreciated {options}.',
        '{options} were definitely a highlight of the meal.',
        'Worth mentioning are {options}, which added to a good experience.',
        'I was pleased with {options}.',
        '{options} stood out in a very positive way.',
        'The things we liked most were {options}.',
        'It was great to experience {options}.',
        '{options} made for a satisfying meal.',
      ],
      3: [
        'Points worth mentioning include {options}.',
        'Our overall impression was shaped by {options}.',
        'I would describe the meal in terms of {options}.',
        'The experience had its strengths and weaknesses, including {options}.',
        'What stood out during our visit included {options}.',
        'The main takeaways from our meal were {options}.',
      ],
      2: [
        'The main issues we encountered were {options}.',
        'We were let down by {options}.',
        'Specifically, {options} did not meet expectations.',
        '{options} were the biggest drawbacks of the meal.',
        'There were noticeable problems with {options} that need attention.',
        'The areas that need improvement include {options}.',
        'Our concerns centred on {options}.',
        'It was frustrating to deal with {options}.',
      ],
      1: [
        '{options} were completely unacceptable.',
        'We experienced serious problems with {options}.',
        'The issues included {options}, which ruined the entire meal.',
        '{options} were far below any acceptable standard.',
        'Specifically, {options} were deeply disappointing.',
        'I cannot overlook {options}.',
      ],
    },
    closings: {
      5: [
        'I would highly recommend this restaurant to anyone looking for great food and service.',
        'A five-star meal from a team that clearly cares about quality.',
        'Thank you for a wonderful dining experience — we will be back soon.',
        'If you are looking for a fantastic place to eat, this is definitely worth visiting.',
        'I will gladly recommend this spot to friends and family.',
        'An exceptional experience that we look forward to repeating.',
      ],
      4: [
        'I would gladly recommend this restaurant for a good meal.',
        'A very good dining experience overall, with only minor things to polish.',
        'I enjoyed the meal and would certainly visit again.',
        'With just a few adjustments, this could easily be a five-star spot.',
        'A dependable restaurant that I would suggest to others.',
        'Overall a positive experience, and we would consider returning.',
      ],
      3: [
        'It was an acceptable visit, but I hope to see improvements next time.',
        'I might give them another try if some of these issues are addressed.',
        'Not a bad meal, but there is clear potential to be much better.',
        'An average dining experience that could be elevated with a few tweaks.',
        'We might explore other dining options next time before returning.',
        'It satisfied our appetite, but it was not particularly memorable.',
      ],
      2: [
        'I hope the management takes this feedback on board to improve the dining experience.',
        'As things stand, I would hesitate to recommend this place.',
        'There is potential here, but the fundamentals need serious attention.',
        'I am sharing this so the kitchen and staff can address the shortcomings.',
        'I would only consider returning if noticeable changes are made.',
        'A disappointing visit that I hope is not typical for this restaurant.',
      ],
      1: [
        'I would not recommend this restaurant to anyone based on our experience.',
        'I hope management takes this review seriously and addresses these issues promptly.',
        'Save yourself the disappointment and dine elsewhere.',
        'A thoroughly frustrating meal that I would not want to repeat.',
        'We expected much better and will not be returning.',
        'Unless major improvements are made, we cannot recommend this place.',
      ],
    },
    connectors,
    commentIntros,
  },
};

export default restaurant;
