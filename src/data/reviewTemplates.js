/**
 * Comprehensive review generation template system.
 *
 * Placeholders:
 *   {options}  – replaced with the naturally joined list of selected option labels
 *
 * Tone guide per rating:
 *   5 ★ – enthusiastic, warm, recommending
 *   4 ★ – positive, satisfied, mild praise
 *   3 ★ – balanced, neutral, constructive
 *   2 ★ – disappointed but fair, constructive criticism
 *   1 ★ – honest negative, firm but not aggressive
 */
const reviewTemplates = {
  /* ------------------------------------------------------------------ */
  /*  OPENINGS                                                          */
  /* ------------------------------------------------------------------ */
  openings: {
    5: [
      'I had an absolutely wonderful experience here!',
      'This place truly exceeded all my expectations!',
      'I can\'t say enough good things about this place!',
      'What an outstanding experience from start to finish!',
      'Hands down one of the best experiences I\'ve ever had!',
      'I\'m so glad I chose this place — it was incredible!',
      'Everything about my visit was top-notch!',
      'I was completely blown away by how great everything was!',
    ],
    4: [
      'I had a really good experience here.',
      'Overall, I\'m quite happy with my visit.',
      'This was a solid experience that I enjoyed.',
      'I had a pleasant time and left feeling satisfied.',
      'A very good experience overall, with a lot to appreciate.',
      'I was impressed with what this place has to offer.',
      'My visit went smoothly and I enjoyed most of it.',
      'I\'d say this was a well-rounded, positive experience.',
    ],
    3: [
      'My experience here was okay — nothing exceptional, but not bad either.',
      'It was a fairly average visit with some highs and lows.',
      'I have mixed feelings about my experience here.',
      'It was a decent experience, though there\'s room for growth.',
      'My visit was alright, but it didn\'t leave a lasting impression.',
      'Overall it was a middle-of-the-road experience.',
    ],
    2: [
      'Unfortunately, my experience here was somewhat disappointing.',
      'I had high hopes, but the experience fell short of my expectations.',
      'I left feeling let down after my visit.',
      'To be honest, my experience was below average.',
      'I was hoping for better, but the visit didn\'t quite deliver.',
      'There were some noticeable issues during my visit that I want to share.',
    ],
    1: [
      'I regret to say that my experience here was very poor.',
      'This was one of the most disappointing experiences I\'ve had.',
      'I\'m writing this review because I feel others should know about my experience.',
      'I had a truly terrible time here and I need to be honest about it.',
      'My visit was extremely unsatisfactory, and I\'m frustrated.',
      'I hate leaving negative reviews, but this experience warrants one.',
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  DESCRIPTIONS (use {options} placeholder)                          */
  /* ------------------------------------------------------------------ */
  descriptions: {
    5: [
      'I was especially impressed by {options}.',
      'What stood out the most was {options} — truly remarkable.',
      'The highlights for me were {options}, all of which were exceptional.',
      'Everything was fantastic, particularly {options}.',
      '{options} — each of these made the experience unforgettable.',
      'I loved {options}, and it\'s clear they put real care into every detail.',
      'From {options}, every aspect was handled beautifully.',
      'The things that really shone were {options}.',
    ],
    4: [
      'I particularly appreciated {options}.',
      '{options} were all done quite well.',
      'Some highlights worth mentioning are {options}.',
      'I was pleased with {options}, which made the visit enjoyable.',
      '{options} stood out in a positive way during my visit.',
      'The things I liked most were {options}.',
      'I found {options} to be commendable.',
      'It\'s worth noting that {options} were handled nicely.',
    ],
    3: [
      'On the positive side, I noticed {options}.',
      '{options} were adequate, though nothing stood out significantly.',
      'I can say that {options} were decent enough.',
      'Regarding {options}, they met basic expectations.',
      '{options} were acceptable, but there\'s definitely potential for more.',
      'I\'d describe {options} as fair — neither great nor terrible.',
    ],
    2: [
      'The main issues I encountered were {options}.',
      'I was let down by {options}, which affected my overall impression.',
      'Specifically, {options} did not meet reasonable expectations.',
      '{options} were the biggest drawbacks of my visit.',
      'I noticed problems with {options} that really need to be addressed.',
      'The areas that need significant improvement include {options}.',
    ],
    1: [
      '{options} were all unacceptable.',
      'I experienced serious issues with {options}.',
      'The problems included {options}, which made the whole visit miserable.',
      '{options} were far below any reasonable standard.',
      'Specifically, {options} were deeply problematic.',
      'I cannot overlook the issues with {options}.',
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  CLOSINGS                                                          */
  /* ------------------------------------------------------------------ */
  closings: {
    5: [
      'I will absolutely be coming back and recommending this place to everyone!',
      'If you\'re looking for the best, this is it. Highly recommended!',
      'I couldn\'t recommend this place more — five stars well deserved!',
      'Thank you for such an amazing experience. You\'ve earned a loyal customer!',
      'Don\'t hesitate to visit — you won\'t be disappointed!',
      'This place has set the bar incredibly high. Can\'t wait to return!',
      'An easy five stars. I\'ll definitely be back soon!',
      'Truly exceptional — I\'ve already told all my friends about it!',
    ],
    4: [
      'I\'d happily recommend this place to friends and family.',
      'A solid experience — I\'d definitely consider coming back.',
      'With a few small tweaks, this could easily be a five-star experience.',
      'Overall, a great job. I\'m glad I visited and would return.',
      'Keep up the good work — I\'ll be recommending this to others.',
      'I left with a positive impression and would visit again.',
      'A dependable choice that I\'d suggest to anyone looking for quality.',
      'Very good overall. I look forward to my next visit.',
    ],
    3: [
      'It was an okay experience, but I think there\'s potential for improvement.',
      'I might give this place another try in the future to see if things improve.',
      'Not bad, but I\'d love to see some upgrades before my next visit.',
      'An average experience — hopefully they\'ll continue to grow and improve.',
      'It wasn\'t terrible, but I expected a bit more based on what I\'d heard.',
      'I\'d consider returning if some of the issues I noticed were addressed.',
    ],
    2: [
      'I hope the management takes this feedback seriously and makes improvements.',
      'I would be willing to give this place another chance if things change.',
      'As it stands, I can\'t recommend this place without reservations.',
      'There\'s clearly potential here, but major improvements are needed.',
      'I\'m sharing this feedback constructively — I genuinely hope things get better.',
      'I\'d suggest looking into the issues I mentioned before more customers feel the same way.',
    ],
    1: [
      'I would not recommend this place to anyone based on my experience.',
      'I sincerely hope they address these issues, but I won\'t be returning.',
      'Save yourself the trouble and look elsewhere.',
      'A deeply disappointing experience that I would not want to repeat.',
      'I hope management reads this and takes the necessary steps to improve.',
      'Unfortunately, this was a waste of my time and money.',
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  CONNECTORS (join sentences naturally)                             */
  /* ------------------------------------------------------------------ */
  connectors: [
    'Additionally,',
    'Also,',
    'Moreover,',
    'On top of that,',
    'Furthermore,',
    'What\'s more,',
    'To add to that,',
    'Beyond that,',
    'In addition,',
    'Plus,',
  ],

  /* ------------------------------------------------------------------ */
  /*  COMMENT INTROS (introduce the user's custom comment)              */
  /* ------------------------------------------------------------------ */
  commentIntros: [
    'I would also like to mention that',
    'It\'s worth noting that',
    'I should add that',
    'I also want to point out that',
    'On a personal note,',
    'I feel it\'s important to say that',
    'One more thing —',
    'I\'d also like to share that',
    'Something else worth mentioning is that',
    'As a side note,',
  ],
};

export default reviewTemplates;
