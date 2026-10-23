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

import { ALLOWED_DOCUMENT_FILE_TYPE } from './allowed-document-file-type.constant';
import { SHAREPOINT } from './sharepoint.constant';

describe('sharepoint', () => {
  describe('document file name validation', () => {
    it('should keep the literal extensions in sync with the allowed document file types', () => {
      // Arrange
      const extensionGroup = SHAREPOINT.DOCUMENT_FILE_NAME.REGEX.source.split('\\.(').at(1)?.split(')', 1)[0];

      // Act
      const extensions = extensionGroup?.split('|');

      // Assert
      expect(extensions).toStrictEqual(Object.values(ALLOWED_DOCUMENT_FILE_TYPE));
    });

    it.each(Object.values(ALLOWED_DOCUMENT_FILE_TYPE))('should allow the %s file extension', (extension) => {
      // Arrange & Act
      expect(`Document name-1.0 (final).${extension}`).toMatch(SHAREPOINT.DOCUMENT_FILE_NAME.REGEX);
    });

    it.each([' file.pdf', 'file.exe', 'file.PDF', 'file.pdf ', 'file.pdf.', 'file/name.pdf', '.pdf', 'filepdf'])('should reject %s', (filename) => {
      // Arrange & Act
      expect(filename).not.toMatch(SHAREPOINT.DOCUMENT_FILE_NAME.REGEX);
    });
  });

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
    ])('should reject $value as an invalid character', ({ value }) => {
      // Arrange & Act
      expect(value).not.toMatch(SHAREPOINT.CASE_SITE_URL.REGEX);
    });
  });

  describe('exporter or buyer folder name', () => {
    describe('regex validation', () => {
      describe('string validation tests', () => {
        it.each(allowedStringTestCases)('$testTitle', ({ value }) => {
          // Arrange & Act
          expect(value).toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });

        it.each(disallowedStringTestCases)('$testTitle', ({ value }) => {
          // Arrange & Act
          expect(value).not.toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });
      });

      describe('substring validation tests', () => {
        it.each(allowedSubstringTestCases)('$testTitle', ({ value }) => {
          // Arrange & Act
          expect(value).toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });

        it.each(disallowedSubstringTestCases)('$testTitle', ({ value }) => {
          // Arrange & Act
          expect(value).not.toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });
      });

      describe('prefix validation tests', () => {
        it.each(allowedPrefixTestCases)('$testTitle', ({ value }) => {
          // Arrange & Act 
          expect(value).toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });

        it.each(disallowedPrefixTestCases)('$testTitle', ({ value }) => {
          // Arrange & Act
          expect(value).not.toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });
      });

      describe('suffix validation tests', () => {
        it.each(allowedSuffixTestCases)('$testTitle', ({ value }) => {
          // Arrange & Act
          expect(value).toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });

        it.each(disallowedSuffixTestCases)('$testTitle', ({ value }) => {
          // Arrange & Act
          expect(value).not.toMatch(SHAREPOINT.SAFE_FOLDER_NAME.REGEX);
        });
      });
    });
  });
});
