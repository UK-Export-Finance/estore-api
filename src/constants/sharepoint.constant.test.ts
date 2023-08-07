import {
  allowedPrefixTestCases,
  allowedStringTestCases,
  allowedSubstringTestCases,
  allowedSuffixTestCases,
  disallowedPrefixTestCases,
  disallowedStringTestCases,
  disallowedSubstringTestCases,
  disallowedSuffixTestCases,
} from '@ukef-test/common-test-cases/sharepoint-folder-name-test-cases';

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

  describe('exporter or buyer folder name', () => {
    describe('regex validation', () => {
      describe('string validation tests', () => {
        it.each(allowedStringTestCases)('$testTitle', ({ value }) => {
          expect(value).toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });

        it.each(disallowedStringTestCases)('$testTitle', ({ value }) => {
          expect(value).not.toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });
      });

      describe('substring validation tests', () => {
        it.each(allowedSubstringTestCases)('$testTitle', ({ value }) => {
          expect(value).toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });

        it.each(disallowedSubstringTestCases)('$testTitle', ({ value }) => {
          expect(value).not.toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });
      });

      describe('prefix validation tests', () => {
        it.each(allowedPrefixTestCases)('$testTitle', ({ value }) => {
          expect(value).toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });

        it.each(disallowedPrefixTestCases)('$testTitle', ({ value }) => {
          expect(value).not.toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });
      });

      describe('suffix validation tests', () => {
        it.each(allowedSuffixTestCases)('$testTitle', ({ value }) => {
          expect(value).toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });

        it.each(disallowedSuffixTestCases)('$testTitle', ({ value }) => {
          expect(value).not.toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });
      });
    });
  });
});
