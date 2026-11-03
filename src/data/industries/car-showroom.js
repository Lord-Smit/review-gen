import { commentIntros, connectors } from './shared';

/**
 * Car showroom industry preset.
 *
 * Vocabulary is deliberately about buying a vehicle: test drives, on-road
 * pricing, finance, paperwork, and delivery. It avoids general-retail language
 * such as "ambience" or "coming back soon", which reads wrong for a showroom.
 *
 * Copy rules:
 *   * never invent specifics the customer did not select (Google policy safety)
 *   * every description keeps `{options}` so the selected taps are always used
 *   * every option icon must exist in `src/components/iconMap.js`
 */
const carShowroom = {
  id: 'car-showroom',
  label: 'Car Showroom',
  description: 'Cars, test drives, finance, and vehicle delivery.',
  aliases: [
    'car',
    'cars',
    'automobile',
    'auto',
    'auto-dealer',
    'car-dealer',
    'car-dealership',
    'dealership',
    'vehicle-sales',
  ],
  page: {
    welcomeHeading: 'How was your showroom experience?',
    welcomeDescription: 'Tell us about your visit, test drive, and buying experience.',
    commentPlaceholder: 'Anything about the test drive, pricing, or delivery?',
  },
  options: {
    5: [
      { id: 'car-5-helpful-sales-staff', label: 'Helpful sales staff', icon: 'Users' },
      { id: 'car-5-smooth-test-drive', label: 'Smooth test drive', icon: 'Zap' },
      { id: 'car-5-transparent-pricing', label: 'Transparent pricing', icon: 'BadgeDollarSign' },
      { id: 'car-5-easy-finance', label: 'Easy finance options', icon: 'Coins' },
      { id: 'car-5-quick-delivery', label: 'Quick delivery', icon: 'CheckCircle' },
      { id: 'car-5-clear-features', label: 'Clear explanation of features', icon: 'LayoutList' },
      { id: 'car-5-well-kept-showroom', label: 'Well-kept showroom', icon: 'Sparkles' },
      { id: 'car-5-after-sales', label: 'Good after-sales support', icon: 'ShieldCheck' },
    ],
    4: [
      { id: 'car-4-good-test-drive', label: 'A good test drive', icon: 'ThumbsUp' },
      { id: 'car-4-knowledgeable-staff', label: 'Knowledgeable staff', icon: 'Smile' },
      { id: 'car-4-fair-pricing', label: 'Fair pricing', icon: 'BadgeDollarSign' },
      { id: 'car-4-smooth-paperwork', label: 'Smooth paperwork', icon: 'LayoutList' },
      { id: 'car-4-decent-finance', label: 'Decent finance options', icon: 'Coins' },
      { id: 'car-4-good-condition', label: 'Vehicle in good condition', icon: 'ShieldCheck' },
      { id: 'car-4-no-pressure', label: 'No pressure from sales', icon: 'Heart' },
      { id: 'car-4-on-time-delivery', label: 'Delivery on time', icon: 'Clock' },
    ],
    3: [
      { id: 'car-3-average-experience', label: 'Average overall experience', icon: 'Meh' },
      { id: 'car-3-short-test-drive', label: 'Short test drive', icon: 'CircleDot' },
      { id: 'car-3-limited-models', label: 'Limited models to compare', icon: 'LayoutList' },
      { id: 'car-3-average-pricing', label: 'Average pricing', icon: 'Coins' },
      { id: 'car-3-slow-paperwork', label: 'Slow paperwork', icon: 'Clock' },
      { id: 'car-3-basic-staff-knowledge', label: 'Basic staff knowledge', icon: 'Minus' },
      { id: 'car-3-long-delivery', label: 'Long delivery wait', icon: 'Hourglass' },
    ],
    2: [
      { id: 'car-2-long-test-drive-wait', label: 'A long wait for a test drive', icon: 'Hourglass' },
      { id: 'car-2-pushy-sales', label: 'A pushy sales approach', icon: 'AlertTriangle' },
      { id: 'car-2-unclear-pricing', label: 'Unclear pricing', icon: 'AlertCircle' },
      { id: 'car-2-paperwork-delays', label: 'Paperwork delays', icon: 'Clock' },
      { id: 'car-2-unanswered-questions', label: 'Staff who could not answer questions', icon: 'Frown' },
      { id: 'car-2-not-ready', label: 'A vehicle that was not ready on time', icon: 'ThumbsDown' },
      { id: 'car-2-limited-finance', label: 'Limited finance options', icon: 'Coins' },
    ],
    1: [
      { id: 'car-1-hidden-charges', label: 'Hidden charges', icon: 'AlertOctagon' },
      { id: 'car-1-poor-communication', label: 'Poor communication', icon: 'XCircle' },
      { id: 'car-1-unhelpful-staff', label: 'Unhelpful staff', icon: 'Frown' },
      { id: 'car-1-issues-on-delivery', label: 'A vehicle delivered with unresolved issues', icon: 'AlertTriangle' },
      { id: 'car-1-no-after-sales', label: 'No after-sales support', icon: 'ShieldCheck' },
      { id: 'car-1-wasted-visit', label: 'A wasted visit', icon: 'Hourglass' },
      { id: 'car-1-negative-experience', label: 'A strongly negative experience', icon: 'ThumbsDown' },
    ],
  },
  templates: {
    openings: {
      5: [
        'Buying my car here was a genuinely enjoyable experience from start to finish.',
        'The team made the whole car-buying process feel easy and stress-free.',
        'I had a great experience at this showroom and left confident about my purchase.',
        'From the first visit to the final handover, the process was smooth.',
        'This was one of the smoothest car purchases I have made.',
        'The showroom exceeded my expectations at every step of the buying process.',
      ],
      4: [
        'Overall, I had a good experience buying my car here.',
        'The showroom handled my purchase well, with a few small things that could be better.',
        'I left satisfied with my visit and the way the team dealt with me.',
        'A solid car-buying experience with more to like than dislike.',
        'My visit to the showroom went smoothly for the most part.',
        'I was happy with how the team handled my enquiry and purchase.',
      ],
      3: [
        'My experience at this showroom was okay, though not without a few issues.',
        'The visit was fairly average, with some things handled well and others not.',
        'I have mixed feelings about how my car purchase was handled.',
        'It was a decent experience overall, but there is room for improvement.',
        'The showroom was alright, but the process could have been smoother.',
        'Nothing went badly wrong, but nothing stood out as exceptional either.',
      ],
      2: [
        'Unfortunately, my showroom experience was disappointing in several ways.',
        'I expected better from this showroom based on my first impression.',
        'The buying process did not go as smoothly as I had hoped.',
        'I left the showroom feeling let down by how things were handled.',
        'There were a few issues during my visit that I think are worth mentioning.',
        'My experience here fell short of what was promised at the start.',
      ],
      1: [
        'I regret buying from this showroom and want to be honest about why.',
        'My experience here was poor from start to finish.',
        'I am writing this because the way my purchase was handled was unacceptable.',
        'This was one of the most frustrating car-buying experiences I have had.',
        'I cannot recommend this showroom after the way my purchase was dealt with.',
        'I left this showroom completely dissatisfied with the whole process.',
      ],
    },
    descriptions: {
      5: [
        'I was especially impressed by {options}.',
        'What stood out most was {options}.',
        'The best parts of the experience were {options}.',
        'Everything was handled well, particularly {options}.',
        '{options} made the whole process feel effortless.',
        'I particularly valued {options} throughout my visit.',
        'From start to finish, {options} were handled brilliantly.',
        'The team clearly got the basics right, especially {options}.',
      ],
      4: [
        'I particularly appreciated {options}.',
        '{options} were handled well overall.',
        'Worth mentioning are {options}, which added to the experience.',
        'I was pleased with {options}.',
        '{options} stood out in a positive way.',
        'The things I liked most were {options}.',
        'I found {options} to be a real positive.',
        'It helped that {options} were part of the process.',
      ],
      3: [
        'Points worth mentioning include {options}.',
        'My overall impression was shaped by {options}.',
        'I would describe the visit in terms of {options}.',
        'The experience had its pluses and minuses, including {options}.',
        'What stood out during the visit included {options}.',
        'The main points I took away included {options}.',
      ],
      2: [
        'The main issues I encountered were {options}.',
        'I was let down by {options}.',
        'Specifically, {options} did not meet my expectations.',
        '{options} were the biggest drawbacks of the visit.',
        'I noticed problems with {options} that need attention.',
        'The areas that need improvement include {options}.',
        'My concerns centred on {options}.',
        'It was frustrating to deal with {options}.',
      ],
      1: [
        '{options} were all unacceptable.',
        'I experienced serious issues with {options}.',
        'The problems included {options}, which made the whole visit miserable.',
        '{options} were far below any reasonable standard.',
        'Specifically, {options} were deeply problematic.',
        'I cannot overlook {options}.',
      ],
    },
    closings: {
      5: [
        'I would happily recommend this showroom to anyone looking for a new car.',
        'A five-star experience from a team that clearly knows what they are doing.',
        'Thank you to the team for making my purchase so straightforward.',
        'If you are in the market for a car, this is a good place to start.',
        'I will be recommending this showroom to friends and family.',
        'An excellent experience that I would not hesitate to repeat.',
      ],
      4: [
        'I would recommend this showroom to anyone shopping for a car.',
        'A good experience overall, with only minor things I would change.',
        'I am happy with my purchase and would visit again.',
        'With a little more attention to detail, this would be five stars.',
        'A dependable showroom that I would suggest to friends.',
        'Overall a positive experience, and I would consider them again.',
      ],
      3: [
        'It was an acceptable experience, though I expected a smoother process.',
        'I would consider returning if some of the issues were addressed.',
        'Not bad, but there is room to improve the buying experience.',
        'An average visit that could be better with a few changes.',
        'I would look around a little more before deciding next time.',
        'It got the job done, but the experience was not memorable.',
      ],
      2: [
        'I hope the showroom takes this feedback and improves the process.',
        'As things stand, I would hesitate to recommend this showroom.',
        'There is potential here, but the basics need more attention.',
        'I am sharing this so the team can fix the issues I ran into.',
        'I would give them another chance only if things clearly change.',
        'A disappointing visit that I hope is not the norm.',
      ],
      1: [
        'I would not recommend this showroom based on my experience.',
        'I hope management reads this and takes it seriously.',
        'Save yourself the trouble and look at other showrooms first.',
        'A frustrating experience that I would not want to repeat.',
        'I expected far better from a showroom of this size.',
        'Unless things change, I will not be returning.',
      ],
    },
    connectors,
    commentIntros,
  },
};

export default carShowroom;
