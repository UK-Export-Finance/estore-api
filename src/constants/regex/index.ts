import { TEST } from './test';

/**
 * Builds a regex that matches a SharePoint-safe folder or file name.
 *
 * The name must not:
 * - start with whitespace or the prefix `~$`
 * - end with whitespace
 * - contain any of the characters `" * < > ? / \ |  :`
 * - contain the substring `_vti_`
 * - exactly match `.lock`, `CON`, `PRN`, `AUX`, `NUL`, `COM0`-`COM9`, `LPT0`-`LPT9`, or `desktop.ini`
 * - exactly match `forms`, when the name is used at the root
 *
 * Examples:
 * - `My Folder` (contains none of the disallowed prefixes, suffixes, characters, substrings, or reserved names)
 *
 * Does not match:
 * - `~$My Folder` (starts with the disallowed prefix `~$`)
 * - `My Folder ` (ends with whitespace)
 * - `My"Folder` (contains the disallowed character `"`)
 * - `My_vti_Folder` (contains the disallowed substring `_vti_`)
 * - `CON` (matches a disallowed reserved name)
 *
 * @returns the compiled SharePoint-safe folder name regex
 */
const buildSharePointSafeFolderNameRegex = (): RegExp => {
  const disallowedPrefixes = ['\\s', '~\\$'];
  const disallowedSuffixes = ['\\s'];
  const disallowedCharacters = ['"', '*', '<', '>', '?', '/', '\\\\', '\\|', ':'];
  const disallowedSubstrings = ['_vti_'];
  const disallowedStrings = ['\\.lock', 'CON', 'PRN', 'AUX', 'NUL', 'COM\\d', 'LPT\\d', 'desktop\\.ini'];
  const disallowedStringsOnRoot = ['forms'];

  const regexToString = (regex: RegExp): string => regex.source;

  /**
   * A negative lookahead fragment that rejects strings starting with a disallowed prefix (whitespace or `~$`).
   * Used as part of the combined regex returned by {@link buildSharePointSafeFolderNameRegex}, which anchors
   * this fragment to the start of the candidate name.
   *
   * Examples:
   * - `My Folder` (does not start with whitespace or `~$`)
   *
   * Does not match:
   * - ` My Folder` (starts with whitespace)
   * - `~$My Folder` (starts with the disallowed prefix `~$`)
   */
  const disallowedPrefixesRegex = new RegExp(`(?!(${disallowedPrefixes.join(`)|(`)}))`);

  /**
   * A negative lookahead fragment that rejects strings ending with a disallowed suffix (whitespace).
   * Used as part of the combined regex returned by {@link buildSharePointSafeFolderNameRegex}, which anchors
   * this fragment to the start of the candidate name.
   *
   * Examples:
   * - `My Folder` (does not end with whitespace)
   *
   * Does not match:
   * - `My Folder ` (ends with whitespace)
   */
  const disallowedSuffixesRegex = new RegExp(`(?!.*(${disallowedSuffixes.join(')|(')})$)`);

  /**
   * A negative lookahead fragment that rejects strings containing any disallowed character (`" * < > ? / \ |  :`).
   * Used as part of the combined regex returned by {@link buildSharePointSafeFolderNameRegex}, which anchors
   * this fragment to the start of the candidate name.
   *
   * Examples:
   * - `My Folder` (contains none of the disallowed characters)
   *
   * Does not match:
   * - `My"Folder` (contains the disallowed character `"`)
   */
  const disallowedCharactersRegex = new RegExp(`(?!.*[${disallowedCharacters.join('')}])`);

  /**
   * A negative lookahead fragment that rejects strings containing a disallowed substring (`_vti_`).
   * Used as part of the combined regex returned by {@link buildSharePointSafeFolderNameRegex}, which anchors
   * this fragment to the start of the candidate name.
   *
   * Examples:
   * - `My Folder` (does not contain the disallowed substring `_vti_`)
   *
   * Does not match:
   * - `My_vti_Folder` (contains the disallowed substring `_vti_`)
   */
  const disallowedSubstringsRegex = new RegExp(`(?!.*(${disallowedSubstrings.join(')|(')}))`);

  /**
   * A negative lookahead fragment that rejects strings that exactly match a disallowed reserved name
   * (for example `.lock`, `CON`, `PRN`, `AUX`, `NUL`, `COM0`-`COM9`, `LPT0`-`LPT9`, or `desktop.ini`).
   * Used as part of the combined regex returned by {@link buildSharePointSafeFolderNameRegex}, which anchors
   * this fragment to the start of the candidate name.
   *
   * Examples:
   * - `My Folder` (does not exactly match a disallowed reserved name)
   *
   * Does not match:
   * - `CON` (exactly matches the disallowed reserved name `CON`)
   */
  const disallowedStringsRegex = new RegExp(`(?!(${disallowedStrings.join('|')})$)`);

  /**
   * A negative lookahead fragment that rejects strings that exactly match a name disallowed only at the root (`forms`).
   * Used as part of the combined regex returned by {@link buildSharePointSafeFolderNameRegex}, which anchors
   * this fragment to the start of the candidate name.
   *
   * Examples:
   * - `My Folder` (does not exactly match the disallowed root name `forms`)
   *
   * Does not match:
   * - `forms` (exactly matches the disallowed root name `forms`)
   */
  const disallowedStringsOnRootRegex = new RegExp(`(?!(${disallowedStringsOnRoot.join('|')})$)`);

  return new RegExp(
    '^' +
      [
        regexToString(disallowedPrefixesRegex),
        regexToString(disallowedSuffixesRegex),
        regexToString(disallowedCharactersRegex),
        regexToString(disallowedSubstringsRegex),
        regexToString(disallowedStringsRegex),
        regexToString(disallowedStringsOnRootRegex),
      ].join('') +
      '.*$',
  );
};

export const REGEX = {
  /**
   * Matches a 10 digit UKEF ID, which must start with `00` followed by 8 digits.
   *
   * Examples:
   * - `0012345678` (10 digits, starting with `00`)
   *
   * Does not match:
   * - `0112345678` (does not start with `00`)
   * - `001234567` (fewer than 10 digits)
   */
  UKEF_ID_TEN_DIGIT: /^00\d{8}$/,

  /**
   * Matches a file location path. The path must start with a 24 character hexadecimal MongoDB ID (the name
   * of the first folder in the path), optionally followed by one or more `/`-separated folder or file names.
   *
   * Examples:
   * - `5f8d04b3ab35b61b94e0f1a2` (just the 24 character MongoDB ID)
   * - `5f8d04b3ab35b61b94e0f1a2/My Folder/file.pdf` (the MongoDB ID followed by nested folders and a file name)
   *
   * Does not match:
   * - `5f8d04b3ab35b61b94e0f1a` (fewer than 24 hexadecimal characters)
   * - `5f8d04b3ab35b61b94e0f1a2/` (trailing slash with no following folder or file name)
   */
  FILE_LOCATION_PATH: /^[a-fA-F\d]{24}(\/[\w\-:\\()\s]+)*$/,

  /**
   * Matches a SharePoint resource name consisting of word characters, hyphens, periods, parentheses, and whitespace.
   *
   * Examples:
   * - `My Resource (1).txt` (only contains letters, numbers, spaces, parentheses, and periods)
   *
   * Does not match:
   * - `My/Resource` (contains the disallowed character `/`)
   */
  SHAREPOINT_RESOURCE_NAME: /^[\w\-.()\s]+$/,

  /**
   * Matches a SharePoint document file name that ends with one of the allowed file extensions
   * (`bmp`, `doc`, `docx`, `gif`, `jpeg`, `jpg`, `msg`, `pdf`, `png`, `ppt`, `pptx`, `tif`, `txt`, `xls`, `xlsx`, `zip`).
   * The name must not start or end with whitespace, and must not end with a period immediately after the extension.
   *
   * Examples:
   * - `Document name-1.0 (final).pdf` (ends with an allowed extension and has no leading/trailing whitespace)
   *
   * Does not match:
   * - ` file.pdf` (starts with whitespace)
   * - `file.pdf ` (ends with whitespace)
   * - `file.exe` (the extension is not one of the allowed file extensions)
   * - `file.PDF` (the extension must be lowercase)
   * - `file.pdf.` (ends with a period after the extension)
   */
  SHAREPOINT_DOCUMENT_FILE_NAME: /^(?!\s)[\w\-.()\s]+\.(bmp|doc|docx|gif|jpeg|jpg|msg|pdf|png|ppt|pptx|tif|txt|xls|xlsx|zip)(?<![\s.])$/,

  /**
   * Matches a SharePoint case site URL, which must not contain any of the characters `, & ! @ ~ # $ % * : ; ( ) + . / \ [ ] -`.
   *
   * Examples:
   * - `My Site Name` (contains none of the disallowed characters)
   *
   * Does not match:
   * - `My-Site` (contains the disallowed character `-`)
   */
  SHAREPOINT_CASE_SITE_URL: /^[^,&!@~#$%*:;()+./\\[\]-]+$/,

  /**
   * Matches a SharePoint-safe folder or file name. See {@link buildSharePointSafeFolderNameRegex} for the full set of rules.
   *
   * Examples:
   * - `My Folder` (contains none of the disallowed prefixes, suffixes, characters, substrings, or reserved names)
   *
   * Does not match:
   * - `~$My Folder` (starts with the disallowed prefix `~$`)
   * - `CON` (matches a disallowed reserved name)
   */
  SHAREPOINT_SAFE_FOLDER_NAME: buildSharePointSafeFolderNameRegex(),

  TEST,
};
