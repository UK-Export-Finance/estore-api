export const UKEFID = {
  // Prefix is used for 10 digit id (Deal, Facility)
  MAIN_ID: {
    PREFIX: {
      DEV: '0030',
      QA: '0040',
      PROD: '0020',
    },
    TEN_DIGIT_REGEX: /^00\d{8}$/,
  },
  SITE_ID: {
    PREFIX: '0070',
    REGEX: /^0070\d{4}$/,
  },
};
