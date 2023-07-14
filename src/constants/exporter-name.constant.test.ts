import {
  allowedStringTestCases,
  allowedSubstringTestCases,
  disallowedPrefixeTestCase,
  disallowedStringTestCases,
  disallowedSubstringTestCases,
  disallowedSuffixTestCase,
} from '@ukef-test/common-test-cases/exporter-name-test-cases';

import { EXPORTER_NAME } from './exporter-name.constant';

describe('ExporterName', () => {
  describe('Regex', () => {
    it.each(allowedStringTestCases)('"%s" is allowed as a string', (allowedItem) => {
      expect(allowedItem).toMatch(EXPORTER_NAME.REGEX);
    });

    it.each(allowedSubstringTestCases)('"%s" is allowed as a substring', (allowedItem) => {
      expect(allowedItem).toMatch(EXPORTER_NAME.REGEX);
    });

    it.each(disallowedStringTestCases)('"%s" is not allowed as a string', (disallowedItem) => {
      expect(disallowedItem).not.toMatch(EXPORTER_NAME.REGEX);
    });

    it.each(disallowedSubstringTestCases)('"%s" is not allowed as a substring', (disallowedItem) => {
      expect(disallowedItem).not.toMatch(EXPORTER_NAME.REGEX);
    });

    it.each(disallowedPrefixeTestCase)('"%s" is not allowed as a prefix', (disallowedItem) => {
      expect(disallowedItem).not.toMatch(EXPORTER_NAME.REGEX);
    });

    it.each(disallowedSuffixTestCase)('"%s" is not allowed as a suffix', (disallowedItem) => {
      expect(disallowedItem).not.toMatch(EXPORTER_NAME.REGEX);
    });
  });
});
