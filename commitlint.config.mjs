// An optional ticket, then a lowercase description: `feat: ABC-123 | add x` or `feat: add x`.
// The commit-msg hook uses this file; CI checks PR titles with commitlint.pr-title.config.mjs.
const SUBJECT = /^(?:[A-Z][A-Z0-9]+-\d+ \| )?(?![A-Z]).+$/;

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'subject-ticket-format': ({ subject }) => [
          !subject || SUBJECT.test(subject),
          'subject must be "TICKET-123 | lowercase description" or "lowercase description"',
        ],
      },
    },
  ],
  rules: {
    // Reads the ticket's capitals as a sentence-case subject; subject-ticket-format replaces it.
    'subject-case': [0],
    'subject-ticket-format': [2, 'always'],
  },
};
