import type { LegalSection } from "@findeat/types";

export const termsSections: LegalSection[] = [
  {
    title: '1. Eligibility',
    paragraphs: [
      'You must be at least 13 years old (or the minimum legal age in your country) to use FindEat.',
      'By using the Service you represent that you have the legal capacity to enter into these Terms.',
    ],
  },
  {
    title: '2. User Accounts',
    paragraphs: ['You are responsible for:'],
    bullets: ['Keeping your password secure.', 'Maintaining accurate account information.', 'All activity that occurs under your account.', 'You may not create fake accounts.', 'You may not impersonate another person or business.', 'You may not sell or transfer your account.'],
  },
  {
    title: '3. User Content',
    paragraphs: [
      'You retain ownership of all photos, reviews, comments, and other content you upload.',
      'By posting content, you grant FindEat a worldwide, non-exclusive, royalty-free license to:',
    ],
    bullets: ['Display your content.', 'Store your content.', 'Share your content within the Service.', 'Promote the Service using publicly available content.', 'You represent that you own or have permission to publish all uploaded content.'],
  },
  {
    title: '4. Reviews',
    paragraphs: ['Reviews should reflect genuine personal experiences.', 'You agree not to:'],
    bullets: ['Post false reviews.', 'Manipulate ratings.', 'Accept payment for reviews without disclosure.', 'Harass restaurants or other users.', 'FindEat may remove reviews that violate these rules.'],
  },
  {
    title: '5. Restaurant Profiles',
    paragraphs: ['Restaurant information may originate from:'],
    bullets: ['Restaurant owners.', 'Publicly available sources.', 'Community contributions.', 'Restaurant owners may claim their profile after verification.'],
  },
  {
    title: '6. Community Standards',
    paragraphs: ['Users may not upload content that:'],
    bullets: ['Contains hate speech.', 'Promotes violence.', 'Contains pornography.', 'Violates intellectual property rights.', 'Contains illegal activity.', 'Includes spam or scams.', 'FindEat may remove content or suspend accounts without prior notice.'],
  },
  {
    title: '7. Intellectual Property',
    paragraphs: ['The FindEat name, logo, design, software, and branding are owned by FindEat.', 'You may not copy, reverse engineer, distribute, or reproduce any part of the Service without permission.'],
  },
  {
    title: '8. Availability',
    paragraphs: ['We strive to keep the Service available but cannot guarantee uninterrupted operation.', 'Features may change, be modified, or discontinued at any time.'],
  },
  {
    title: '9. Limitation of Liability',
    paragraphs: ['Restaurant information, menus, pricing, opening hours, and reviews may not always be accurate.', 'FindEat is not responsible for:'],
    bullets: ['Restaurant quality.', 'Food safety.', 'Allergens.', 'Pricing inaccuracies.', 'User-generated content.', 'Use the Service at your own discretion.'],
  },
  {
    title: '10. Account Suspension',
    paragraphs: ['We may suspend or terminate accounts that:'],
    bullets: ['Violate these Terms.', 'Abuse the platform.', 'Attempt to harm the community.'],
  },
  { title: '11. Privacy', paragraphs: ['Your use of FindEat is also governed by our Privacy Policy, included below.'] },
  { title: '12. Changes', paragraphs: ['These Terms may be updated periodically.', 'Continued use of the Service constitutes acceptance of the updated Terms.'] },
  { title: '13. Contact', paragraphs: ['Questions regarding these Terms may be sent to:', 'Email: legal@findeat.space'] },
];

export const privacySections: LegalSection[] = [
  { title: 'Information We Collect — Account Information', paragraphs: ['When creating or completing a profile we may collect:'], bullets: ['Display name.', 'Username.', 'Email address.', 'Password (encrypted).', 'Profile photo and bio (optional).', 'Phone number, birthday, and pronouns (optional).', 'Food preferences, favorite cuisines, allergies, and dietary restrictions (optional).', 'Optional profile details are displayed to other users only according to the visibility choices you select.'] },
  { title: 'Content You Create', paragraphs: ['We collect:'], bullets: ['Reviews.', 'Photos.', 'Videos.', 'Comments.', 'Likes.', 'Saved restaurants.', 'Messages.', 'Polls.', 'Community interactions.'] },
  { title: 'Restaurant Data', paragraphs: ['If you manage a restaurant we may collect:'], bullets: ['Business information.', 'Menu items.', 'Contact information.', 'Photos.', 'Verification documents.'] },
  { title: 'Device Information', paragraphs: ['We may collect:'], bullets: ['Device type.', 'Operating system.', 'App version.', 'Crash logs.', 'Anonymous analytics.'] },
  { title: 'Location', paragraphs: ['With your permission we may collect location information to:'], bullets: ['Show nearby restaurants.', 'Improve recommendations.', 'Display map features.', 'Location access is optional.'] },
  { title: 'How We Use Your Information', paragraphs: ['We use your information to:'], bullets: ['Operate the Service.', 'Personalize recommendations.', 'Display your profile.', 'Improve our products.', 'Prevent fraud.', 'Detect abuse.', 'Verify restaurant ownership.', 'Provide customer support.'] },
  { title: 'Communications', paragraphs: ['We may send:'], bullets: ['Verification emails.', 'Password reset emails.', 'Security notifications.', 'Product updates.', 'Push notifications.', 'Marketing emails may be disabled at any time.'] },
  { title: 'Sharing Information', paragraphs: ['We do not sell personal information.', 'We may share information with:'], bullets: ['Cloud hosting providers.', 'Analytics providers.', 'Email providers.', 'Payment providers (future).', 'Legal authorities when required by law.'] },
  { title: 'Data Retention', paragraphs: ['We retain your information while your account remains active or deactivated so you can reactivate it.', 'Some information may remain in backups for legal or security purposes.'] },
  { title: 'Your Rights', paragraphs: ['Depending on your location you may have the right to:'], bullets: ['Access your information.', 'Correct inaccurate information.', 'Delete your account.', 'Export your data.', 'Withdraw consent.', 'Requests may be sent to privacy@findeat.space.'] },
  { title: 'Cookies', paragraphs: ['Our website may use cookies to:'], bullets: ['Keep you signed in.', 'Improve performance.', 'Remember preferences.', 'Measure usage.'] },
  { title: 'Security', paragraphs: ['We implement reasonable security measures to protect your information.', 'However, no online service is completely secure.'] },
  { title: "Children's Privacy", paragraphs: ['FindEat is not intended for children under 13.', 'We do not knowingly collect personal information from children.'] },
  { title: 'International Users', paragraphs: ['Your information may be processed in countries other than your own.', 'By using FindEat, you consent to such processing where permitted by law.'] },
  { title: 'Changes', paragraphs: ['We may update this Privacy Policy from time to time.', 'The latest version will always be available within the Service.'] },
  { title: 'Contact', paragraphs: ['Privacy questions:', 'privacy@findeat.space'] },
];
