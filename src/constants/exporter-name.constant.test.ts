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

describe('exporterName', () => {
  describe('regex validation', () => {
    describe('string validation tests', () => {
      it.each(allowedStringTestCases)('$testTitle', ({ value }) => {
        expect(value).toMatch(EXPORTER_NAME.REGEX);
      });

      it.each(disallowedStringTestCases)('$testTitle', ({ value }) => {
        expect(value).not.toMatch(EXPORTER_NAME.REGEX);
      });
    });

    describe('substring validation tests', () => {
      it.each(allowedSubstringTestCases)('$testTitle', ({ value }) => {
        expect(value).toMatch(EXPORTER_NAME.REGEX);
      });

      it.each(disallowedSubstringTestCases)('$testTitle', ({ value }) => {
        expect(value).not.toMatch(EXPORTER_NAME.REGEX);
      });
    });

    describe('prefix validation tests', () => {
      it.each(allowedPrefixTestCases)('$testTitle', ({ value }) => {
        expect(value).toMatch(EXPORTER_NAME.REGEX);
      });

      it.each(disallowedPrefixTestCases)('$testTitle', ({ value }) => {
        expect(value).not.toMatch(EXPORTER_NAME.REGEX);
      });
    });

    describe('suffix validation tests', () => {
      it.each(allowedSuffixTestCases)('$testTitle', ({ value }) => {
        expect(value).toMatch(EXPORTER_NAME.REGEX);
      });

      it.each(disallowedSuffixTestCases)('$testTitle', ({ value }) => {
        expect(value).not.toMatch(EXPORTER_NAME.REGEX);
      });
    });
  });
});
