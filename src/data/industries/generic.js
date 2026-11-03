/**
 * Generic industry preset.
 *
 * This is the historical (pre-industry) wording, kept byte-identical so every
 * business that has not been assigned an industry still generates exactly the
 * reviews it did before.
 */
import reviewOptions from '../reviewOptions';
import reviewTemplates from '../reviewTemplates';
import { commentIntros, connectors } from './shared';

const generic = {
  id: 'generic',
  label: 'General Business',
  description: 'Neutral wording that fits any type of business.',
  aliases: ['general', 'other', 'default'],
  page: {
    welcomeHeading: 'How was your experience?',
    welcomeDescription: 'Your feedback means a lot to us.',
    commentPlaceholder: 'Add any additional details about your experience…',
  },
  options: reviewOptions,
  templates: {
    ...reviewTemplates,
    connectors,
    commentIntros,
  },
};

export default generic;
