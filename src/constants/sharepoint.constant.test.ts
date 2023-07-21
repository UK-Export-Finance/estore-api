import { SHAREPOINT } from './sharepoint.constant';

describe('sharepoint', () => {
  describe('caseSiteUrl string validation', () => {
    it.each([
      { value: ',' },
      { value: '&' },
      { value: '!' },
      { value: '@' },
      { value: '~' },
      { value: '#' },
      { value: '$' },
      { value: '%' },
      { value: '*' },
      { value: ':' },
      { value: ';' },
      { value: '(' },
      { value: ')' },
      { value: '+' },
      { value: '.' },
      { value: '/' },
      { value: '\\' },
      { value: '[' },
      { value: ']' },
      { value: '-' },
    ])('$value is an invalid character', ({ value }) => {
      expect(value).not.toMatch(SHAREPOINT.CASE_SITE_URL.REGEX);
    });
  });
});
