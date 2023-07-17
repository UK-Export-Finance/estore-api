import {
  allowedPrefixTestCases,
  allowedStringTestCases,
  allowedSubstringTestCases,
  allowedSuffixTestCases,
  disallowedPrefixTestCases,
  disallowedStringTestCases,
  disallowedSubstringTestCases,
  disallowedSuffixTestCases,
} from '@ukef-test/common-test-cases/exporter-name-test-cases';

import { EXPORTER_NAME } from './exporter-name.constant';

describe('ExporterName', () => {
  describe('Regex', () => {
    describe('Strings', () => {
      it.each(allowedStringTestCases)('$testTitle', ({ value }) => {
        expect(value).toMatch(EXPORTER_NAME.REGEX);
      });

      it.each(disallowedStringTestCases)('$testTitle', ({ value }) => {
        expect(value).not.toMatch(EXPORTER_NAME.REGEX);
      });
    });

    describe('Substrings', () => {
      it.each(allowedSubstringTestCases)('$testTitle', ({ value }) => {
        expect(value).toMatch(EXPORTER_NAME.REGEX);
      });

      it.each(disallowedSubstringTestCases)('$testTitle', ({ value }) => {
        expect(value).not.toMatch(EXPORTER_NAME.REGEX);
      });
    });

    describe('Prefixes', () => {
      it.each(allowedPrefixTestCases)('$testTitle', ({ value }) => {
        expect(value).toMatch(EXPORTER_NAME.REGEX);
      });

      it.each(disallowedPrefixTestCases)('$testTitle', ({ value }) => {
        expect(value).not.toMatch(EXPORTER_NAME.REGEX);
      });
    });

    describe('Suffixes', () => {
      it.each(allowedSuffixTestCases)('$testTitle', ({ value }) => {
        expect(value).toMatch(EXPORTER_NAME.REGEX);
      });

      it.each(disallowedSuffixTestCases)('$testTitle', ({ value }) => {
        expect(value).not.toMatch(EXPORTER_NAME.REGEX);
      });
    });
  });
});
